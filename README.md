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

- `lib/cms.ts` es el único punto de acceso. Valida cada colección con Zod y
  traduce las keys del CMS (en minúscula: `imagenfondo`) a `lib/types.ts`; si
  algo falla cae **solo esa parte** a `data.ts`, y un campo vacío en el CMS
  usa el valor local. La API pública solo devuelve entries publicadas.
- Revalidación: 5 minutos (`revalidate: 300`, tags `cms`, `<slug>`).
- Reservas: `/api/disponibilidad` y `/api/reservas` hablan con la colección
  privada `reservas` del CMS por la API de integración (`TRICODE_INTEGRATION_API_KEY`,
  solo servidor). Disponible = cupos del alojamiento − reservas **confirmadas**
  que se solapan con las fechas. Sin clave o con el CMS caído, disponibilidad
  responde `a-confirmar` (nunca inventa) y la solicitud devuelve
  `503 CMS_NO_CONECTADO` → la UI ofrece enviarla por WhatsApp.
- Fotos: `components/ui/Img.tsx` envuelve `next/image`; las fotos de un host
  que no es el del CMS (URL pegada a mano) se muestran sin optimizar en vez de
  romper la página.

## Antes de publicar

Buscá `[completar` en `lib/data.ts`: son datos que Calaguala tiene que confirmar
(horarios, normas, WhatsApp, Instagram, dirección, capacidad de la parcela,
equipamiento del glamping, plazo de respuesta, FAQ sin respuesta).

## Contrato con el CMS

Tenant `calaguala` en `cms.tricode.studio`. La fuente de verdad del modelo es
`.tricode/onboarding/calaguala/integration-contract.json` en el repo
`tricode-cms`.

| Colección (slug) | Alimenta |
|---|---|
| `alojamientos`, `unidades` | Alojamientos (unidades = variantes), flujo de reserva |
| `portada` | Hero, introducción y su galería, SEO |
| `informacion-huespedes` | Qué incluye, reservas, información práctica, plazo de respuesta |
| `ubicacion-contacto` | Ubicación, contacto, WhatsApp flotante |
| `instalaciones`, `experiencias` | Espacios (con sus fotos), Experiencias |
| `recomendaciones-la-paloma`, `preguntas-frecuentes` | Descubrí La Paloma, FAQ |
| `reservas` (privada) | Solo por API de integración: solicitudes y disponibilidad |

Siguen locales a propósito (`lib/data.ts`): página `/la-paloma`, títulos de
sección, textos alternativos de fotos (se resuelven por nombre de archivo,
también para las fotos subidas al CMS) y datos del negocio del JSON-LD.

## Visor 2.5D

`components/visor-2.5d/predio.ts` tiene la geometría (placeholder ilustrativo).
Cuando llegue el plano real, se editan solo las coordenadas de `ELEMENTOS` y `ARBOLES`.
