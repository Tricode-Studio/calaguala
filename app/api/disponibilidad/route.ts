import { NextResponse, type NextRequest } from 'next/server';
import { cuposLibres, getAlojamientosParaReserva, getEstadiasConfirmadas } from '@/lib/cms';
import { erroresPorCampo, seleccionSchema } from '@/lib/schemas';
import type { EstadoDisponibilidad, OpcionDisponibilidad, RespuestaDisponibilidad } from '@/lib/types';

/**
 * Proxy server-side de disponibilidad. La lógica de negocio no llega al cliente.
 *
 * Disponible = cupos del alojamiento − estadías CONFIRMADAS en el CMS que se
 * solapan con las fechas pedidas. Sin conexión con el CMS no inventa nada:
 * marca todo como "a-confirmar" (salvo lo que no entra por capacidad).
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
  const { items: alojamientos, origen } = await getAlojamientosParaReserva();

  // Las reservas guardan el id del alojamiento en el CMS: con alojamientos
  // locales (CMS caído) los ids no se corresponden y no se puede calcular.
  let estadias: Awaited<ReturnType<typeof getEstadiasConfirmadas>> = null;
  if (origen === 'cms') {
    try {
      estadias = await getEstadiasConfirmadas(sel.fechaLlegada, sel.fechaSalida);
    } catch (err) {
      console.warn('[disponibilidad] CMS falló, respondo en modo local:', (err as Error).message);
    }
  }

  const opciones: OpcionDisponibilidad[] = alojamientos.map((a) => {
    let estado: EstadoDisponibilidad;
    if (a.capacidad < sel.cantidadPersonas) estado = 'no-disponible';
    else if (!estadias) estado = 'a-confirmar';
    else estado = cuposLibres(a, estadias) > 0 ? 'disponible' : 'no-disponible';
    return { tipoAlojamientoId: a.id, estado };
  });

  const body: RespuestaDisponibilidad = { opciones, origen: estadias ? 'cms' : 'local' };
  return NextResponse.json(body, { headers: { 'Cache-Control': 'no-store' } });
}
