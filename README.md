# Calaguala — sitio web

Next.js 15 (App Router) · React 19 · TypeScript estricto · Tailwind 4 · Zod.

```bash
npm install
cp .env.example .env.local   # dejar vacías las TRICODE_* = modo standalone
npm run dev
```

## Cómo fluyen los datos

```
componentes ← app/page.tsx ← lib/cms.ts ──fetch──► Tricode CMS
                                   └──fallback──► lib/data.ts (misma forma)
```

- `lib/cms.ts` es el único punto de acceso. Valida cada entry/singleton con Zod;
  si algo falla cae **solo esa parte** a `data.ts`. Solo acepta entries `PUBLISHED`.
- Revalidación: 5 minutos (`revalidate: 300`, tags `cms`, `<slug>`).
- Reservas: `/api/disponibilidad` y `/api/reservas` son proxies server-side hacia
  el módulo BOOKINGS. Sin CMS, disponibilidad responde `a-confirmar` (nunca inventa)
  y la solicitud devuelve `503 CMS_NO_CONECTADO` → la UI ofrece enviarla por WhatsApp.

## Antes de publicar

Buscá `[completar` en `lib/data.ts`: son datos que Calaguala tiene que confirmar
(horarios, normas, WhatsApp, Instagram, dirección, capacidad de la parcela,
equipamiento del glamping, plazo de respuesta, FAQ sin respuesta).

## Supuestos sobre la API (a validar con el CMS)

| Qué | Supuesto |
|---|---|
| `GET /landing-config` | Devuelve los singletons con las claves de DATA.md (`heroConfig`, `contacto`…), en la raíz o bajo `data`/`settings` |
| `GET /content-types/:slug/entries` | Array plano o `{ data: [] }`; cada entry plana o con campos en `data`/`fields` |
| `GET /reservations/availability` | Query `fechaLlegada`, `fechaSalida`, `cantidadPersonas`; respuesta con `[{ tipoAlojamientoId \| accommodationId, disponible \| available }]` |
| `POST /reservations` | Body = `SolicitudReserva` de DATA.md |

## Extensiones fuera de DATA.md

`Extensiones` (en `lib/types.ts`) agrupa lo que el brief pide editable pero el
modelo no cubre: títulos de sección, experiencias (sección 7), galería de la
introducción, fotos de instalaciones, textos alternativos de fotos y plazo de
respuesta. Hoy son locales; propuesta: sumarlos como singletons del tenant.

## Visor 2.5D

`components/visor-2.5d/predio.ts` tiene la geometría (placeholder ilustrativo).
Cuando llegue el plano real, se editan solo las coordenadas de `ELEMENTOS` y `ARBOLES`.
