import { createHmac, timingSafeEqual } from 'node:crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

const TOLERANCIA_SEG = 300;

/** Comparación en tiempo constante; longitudes distintas = no coincide. */
function secretoValido(recibido: string | null, esperado: string | undefined): boolean {
  if (!esperado || !recibido) return false;
  const a = Buffer.from(recibido);
  const b = Buffer.from(esperado);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Firma de webhook de Tricode CMS: `X-Tricode-Signature: t=<unix>,v1=<hex>`,
 * con v1 = HMAC-SHA256 hex de `"<t>.<body crudo>"` usando el secreto del webhook.
 * Rechaza timestamps fuera de ±300 s. Nunca lanza ante hex inválido.
 */
function firmaValida(cabecera: string | null, cuerpo: string, secreto: string | undefined): boolean {
  if (!secreto || !cabecera) return false;
  const partes = Object.fromEntries(
    cabecera.split(',').map((p) => {
      const i = p.indexOf('=');
      return i < 0 ? [p.trim(), ''] : [p.slice(0, i).trim(), p.slice(i + 1).trim()];
    }),
  );
  const t = Number(partes.t);
  const v1 = partes.v1;
  if (!Number.isInteger(t) || !v1 || !/^[0-9a-f]+$/i.test(v1)) return false;
  if (Math.abs(Date.now() / 1000 - t) > TOLERANCIA_SEG) return false;
  const esperada = createHmac('sha256', secreto).update(`${t}.${cuerpo}`).digest();
  const recibida = Buffer.from(v1, 'hex');
  if (recibida.length !== esperada.length) return false;
  return timingSafeEqual(recibida, esperada);
}

/**
 * Webhook del CMS: invalida la caché del contenido (ver README). Acepta dos
 * autenticaciones: (a) firma `X-Tricode-Signature` contra TRICODE_WEBHOOK_SECRET
 * (lo que manda el CMS); (b) `x-revalidate-secret` contra REVALIDATE_SECRET
 * (pruebas con curl u otros disparadores).
 */
export async function POST(req: NextRequest) {
  // Body crudo: la firma se calcula sobre estos bytes, antes de parsear.
  const cuerpo = await req.text();

  const firmado = firmaValida(req.headers.get('x-tricode-signature'), cuerpo, process.env.TRICODE_WEBHOOK_SECRET);
  const porSecreto = secretoValido(req.headers.get('x-revalidate-secret'), process.env.REVALIDATE_SECRET);
  if (!firmado && !porSecreto) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Eventos del CMS que no son de entries: se confirman sin revalidar (200, para
  // que el webhook no cuente un fallo).
  if (firmado) {
    try {
      const tipo = (JSON.parse(cuerpo) as { type?: unknown })?.type;
      if (typeof tipo === 'string' && !tipo.startsWith('entry.')) {
        return NextResponse.json({ ignored: true });
      }
    } catch {
      // body sin JSON válido: se revalida igual
    }
  }

  revalidateTag('cms');
  for (const ruta of ['/', '/la-paloma', '/reservar']) revalidatePath(ruta);
  return NextResponse.json({ revalidated: true });
}
