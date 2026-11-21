import { NextResponse, type NextRequest } from 'next/server';
import { createHash } from 'node:crypto';
import { CmsNoConectadoError, crearSolicitudCms, getAlojamientosParaReserva } from '@/lib/cms';
import { erroresPorCampo, solicitudReservaSchema } from '@/lib/schemas';
import type { SolicitudReserva } from '@/lib/types';

const MAX_BODY_BYTES = 16 * 1024;
const LIMITE_POR_VENTANA = 5;
const VENTANA_MS = 10 * 60 * 1000;
const MAX_IPS = 5000;

/**
 * Límite por IP en memoria (5 intentos cada 10 min). BEST EFFORT: en serverless
 * cada instancia tiene su propio mapa y se reinicia en frío, así que no es un
 * tope duro; frena ráfagas simples. Para algo estricto hace falta un store
 * compartido. La IP sale de `x-real-ip`, fiable en Vercel o detrás de un proxy
 * que pise ese header; fuera de eso, un cliente directo puede falsearlo. Si no
 * llega ni `x-real-ip` ni `x-forwarded-for`, la clave es `desconocida:` más un
 * hash corto (sha-256, 16 hex) de user-agent + accept-language, para que esos
 * clientes no compartan un único cupo. El mapa tiene tope (MAX_IPS): al superarlo se purgan las IP con
 * todos sus intentos vencidos y, si sigue lleno, las más antiguas.
 */
const intentos = new Map<string, number[]>();

/** Consulta sin registrar: ¿esta IP ya agotó su cupo en la ventana? */
function excedeLimite(ip: string): boolean {
  const ahora = Date.now();
  const recientes = (intentos.get(ip) ?? []).filter((t) => ahora - t < VENTANA_MS);
  return recientes.length >= LIMITE_POR_VENTANA;
}

/** Registra un intento que cuenta para el cupo. */
function registrarIntento(ip: string) {
  const ahora = Date.now();
  const recientes = (intentos.get(ip) ?? []).filter((t) => ahora - t < VENTANA_MS);
  recientes.push(ahora);
  intentos.delete(ip); // reinsertar: el Map queda ordenado de más antigua a más reciente
  intentos.set(ip, recientes);
  if (intentos.size > MAX_IPS) {
    for (const [k, v] of intentos) if (v.every((t) => ahora - t >= VENTANA_MS)) intentos.delete(k);
    for (const k of intentos.keys()) {
      if (intentos.size <= MAX_IPS) break;
      intentos.delete(k);
    }
  }
}

/**
 * IP del cliente. `x-real-ip` primero (en Vercel lo fija la plataforma y el
 * cliente no puede falsearlo). `x-forwarded-for` es solo último recurso: su
 * primer valor puede venir inventado por el cliente fuera de Vercel.
 */
function ipDe(req: NextRequest): string {
  const ip = req.headers.get('x-real-ip')?.trim() || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (ip) return ip;
  const huella = `${req.headers.get('user-agent') ?? ''}|${req.headers.get('accept-language') ?? ''}`;
  return 'desconocida:' + createHash('sha256').update(huella).digest('hex').slice(0, 16);
}

/** Lee el body acumulando bytes y corta apenas supera el máximo. `null` = demasiado grande. */
async function leerBody(req: NextRequest): Promise<string | null> {
  if (!req.body) return '';
  const lector = req.body.getReader();
  const trozos: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await lector.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) {
      await lector.cancel().catch(() => {});
      return null;
    }
    trozos.push(value);
  }
  const todo = new Uint8Array(total);
  let pos = 0;
  for (const t of trozos) {
    todo.set(t, pos);
    pos += t.byteLength;
  }
  return new TextDecoder().decode(todo);
}

/** Endpoint propio → Tricode CMS (módulo BOOKINGS). Nunca a un backend ad-hoc. */
export async function POST(req: NextRequest) {
  const declarado = Number(req.headers.get('content-length'));
  if (Number.isFinite(declarado) && declarado > MAX_BODY_BYTES) {
    return NextResponse.json({ codigo: 'BODY_DEMASIADO_GRANDE' }, { status: 413 });
  }
  const ip = ipDe(req);
  if (excedeLimite(ip)) {
    return NextResponse.json(
      { codigo: 'DEMASIADAS_SOLICITUDES' },
      { status: 429, headers: { 'Retry-After': String(VENTANA_MS / 1000) } },
    );
  }

  const crudo = await leerBody(req);
  if (crudo === null) {
    return NextResponse.json({ codigo: 'BODY_DEMASIADO_GRANDE' }, { status: 413 });
  }
  let body: Record<string, unknown>;
  try {
    const parseado: unknown = JSON.parse(crudo);
    // JSON válido pero que no es un objeto (null, [], "x", 5): mismo contrato que JSON roto.
    if (typeof parseado !== 'object' || parseado === null || Array.isArray(parseado)) {
      return NextResponse.json({ codigo: 'JSON_INVALIDO' }, { status: 400 });
    }
    body = parseado as Record<string, unknown>;
  } catch {
    return NextResponse.json({ codigo: 'JSON_INVALIDO' }, { status: 400 });
  }

  // Honeypot: un humano nunca completa este campo. Respondemos "ok" sin procesar.
  // SÍ cuenta para el límite: así un bot que lo llena no puede insistir sin
  // tope, y a un humano no le afecta porque nunca lo completa.
  if (typeof body.sitioWeb === 'string' && body.sitioWeb.trim() !== '') {
    registrarIntento(ip);
    return NextResponse.json({ ok: true });
  }

  const parsed = solicitudReservaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { codigo: 'VALIDACION', errores: erroresPorCampo(parsed.error) },
      { status: 400 },
    );
  }

  // Ojo: entre la consulta de cupo (`excedeLimite`) y `registrarIntento` hay este
  // `await`, así que pedidos paralelos de la misma IP pueden pasar el chequeo a la
  // vez. Es parte del carácter best effort del límite.
  const { items: alojamientos, origen } = await getAlojamientosParaReserva();
  // Sin lectura del CMS los alojamientos son los locales: sus ids no existen en el CMS.
  if (origen !== 'cms') {
    return NextResponse.json({ codigo: 'CMS_NO_CONECTADO' }, { status: 503 });
  }
  const alojamiento = alojamientos.find((a) => a.id === parsed.data.tipoAlojamientoId);
  if (!alojamiento) {
    return NextResponse.json(
      { codigo: 'VALIDACION', errores: { tipoAlojamientoId: 'Ese tipo de alojamiento ya no está disponible.' } },
      { status: 400 },
    );
  }

  // Recién acá cuenta el intento: los errores de validación no consumen cupo.
  registrarIntento(ip);

  const solicitud: SolicitudReserva = {
    ...parsed.data,
    comentarios: parsed.data.comentarios || undefined,
  };

  try {
    await crearSolicitudCms(solicitud);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof CmsNoConectadoError) {
      return NextResponse.json({ codigo: 'CMS_NO_CONECTADO' }, { status: 503 });
    }
    console.error('[reservas] error al crear solicitud:', err);
    return NextResponse.json({ codigo: 'CMS_ERROR' }, { status: 502 });
  }
}
