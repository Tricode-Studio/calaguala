import { NextResponse, type NextRequest } from 'next/server';
import { consultarDisponibilidadCms, getAlojamientos } from '@/lib/cms';
import { erroresPorCampo, seleccionSchema } from '@/lib/schemas';
import type { EstadoDisponibilidad, OpcionDisponibilidad, RespuestaDisponibilidad } from '@/lib/types';

/**
 * Proxy server-side de disponibilidad. La lógica de negocio no llega al cliente.
 * Sin CMS: no inventa disponibilidad — marca todo como "a-confirmar"
 * (salvo lo que no entra por capacidad).
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const parsed = seleccionSchema.safeParse({
    fechaLlegada: q.get('fechaLlegada') ?? '',
    fechaSalida: q.get('fechaSalida') ?? '',
    cantidadPersonas: q.get('cantidadPersonas') ?? '',
    tipoAlojamientoId: q.get('tipoAlojamientoId') ?? '',
  });
  if (!parsed.success) {
    return NextResponse.json({ errores: erroresPorCampo(parsed.error) }, { status: 400 });
  }
  const sel = parsed.data;
  const alojamientos = await getAlojamientos();

  let remoto: Map<string, boolean> | null = null;
  try {
    const json = await consultarDisponibilidadCms(
      new URLSearchParams({
        fechaLlegada: sel.fechaLlegada,
        fechaSalida: sel.fechaSalida,
        cantidadPersonas: String(sel.cantidadPersonas),
      }),
    );
    remoto = normalizar(json);
  } catch (err) {
    console.warn('[disponibilidad] CMS falló, respondo en modo local:', (err as Error).message);
  }

  const opciones: OpcionDisponibilidad[] = alojamientos.map((a) => {
    let estado: EstadoDisponibilidad;
    if (a.capacidad < sel.cantidadPersonas) estado = 'no-disponible';
    else if (!remoto) estado = 'a-confirmar';
    else estado = remoto.get(a.id) ? 'disponible' : 'no-disponible';
    return { tipoAlojamientoId: a.id, estado };
  });

  const body: RespuestaDisponibilidad = { opciones, origen: remoto ? 'cms' : 'local' };
  return NextResponse.json(body, { headers: { 'Cache-Control': 'no-store' } });
}

/** Tolera las formas más probables de respuesta del módulo BOOKINGS. */
function normalizar(json: unknown): Map<string, boolean> | null {
  if (!json) return null;
  const raiz = json as Record<string, unknown>;
  const lista = (Array.isArray(json) ? json : raiz.opciones ?? raiz.availability ?? raiz.data) as unknown;
  if (!Array.isArray(lista)) return null;
  const mapa = new Map<string, boolean>();
  for (const item of lista as Record<string, unknown>[]) {
    const id = String(item.tipoAlojamientoId ?? item.accommodationId ?? item.id ?? '');
    const disp = item.disponible ?? item.available;
    if (id && typeof disp === 'boolean') mapa.set(id, disp);
  }
  return mapa.size ? mapa : null;
}
