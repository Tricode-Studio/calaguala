import { NextResponse, type NextRequest } from 'next/server';
import { CmsNoConectadoError, crearSolicitudCms, getAlojamientos } from '@/lib/cms';
import { erroresPorCampo, solicitudReservaSchema } from '@/lib/schemas';
import type { SolicitudReserva } from '@/lib/types';

/** Endpoint propio → Tricode CMS (módulo BOOKINGS). Nunca a un backend ad-hoc. */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ codigo: 'JSON_INVALIDO' }, { status: 400 });
  }

  // Honeypot: un humano nunca completa este campo. Respondemos "ok" sin procesar.
  if (typeof body.sitioWeb === 'string' && body.sitioWeb.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  const parsed = solicitudReservaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { codigo: 'VALIDACION', errores: erroresPorCampo(parsed.error) },
      { status: 400 },
    );
  }

  const alojamiento = (await getAlojamientos()).find((a) => a.id === parsed.data.tipoAlojamientoId);
  if (!alojamiento) {
    return NextResponse.json(
      { codigo: 'VALIDACION', errores: { tipoAlojamientoId: 'Ese tipo de alojamiento ya no está disponible.' } },
      { status: 400 },
    );
  }

  const solicitud: SolicitudReserva = {
    ...parsed.data,
    comentarios: parsed.data.comentarios || undefined,
  };

  try {
    const res = await crearSolicitudCms(solicitud);
    return NextResponse.json({ ok: true, id: res.id ?? null });
  } catch (err) {
    if (err instanceof CmsNoConectadoError) {
      return NextResponse.json({ codigo: 'CMS_NO_CONECTADO' }, { status: 503 });
    }
    console.error('[reservas] error al crear solicitud:', err);
    return NextResponse.json({ codigo: 'CMS_ERROR' }, { status: 502 });
  }
}
