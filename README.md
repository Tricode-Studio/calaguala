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

## Revalidación a demanda (webhook del CMS)

> **Estado actual:** el endpoint `app/api/revalidate` existe pero no se usa,
> porque los webhooks del CMS no están activos. El contenido del CMS se
> actualiza por revalidación temporal (300 s) y puede tardar hasta 5 minutos en
> verse.

El contenido del CMS se cachea 300 s. Para verlo al instante después de editar,
`POST /api/revalidate` invalida la etiqueta `cms` y las rutas `/`, `/la-paloma`
y `/reservar`. Acepta dos autenticaciones: la firma `X-Tricode-Signature` que
manda el CMS (verificada con `TRICODE_WEBHOOK_SECRET`, tolerancia de 300 s) o,
para pruebas, el header `x-revalidate-secret` contra `REVALIDATE_SECRET`. Los
eventos del CMS que no son `entry.*` se responden `200 {"ignored":true}`.

1. En Tricode CMS: Integraciones → Nuevo webhook.
2. URL: `https://<dominio>/api/revalidate`. Eventos: `entry.created`,
   `entry.updated` y `entry.deleted`.
3. Copiar el secreto que muestra el CMS (se ve una sola vez) a la variable
   `TRICODE_WEBHOOK_SECRET` en Vercel (Production) y redeployar.
4. Probar con la entrega de prueba del webhook o mirando el historial de
   entregas en el CMS: debe figurar `200`. Ojo: un `401` por mala firma cuenta
   como fallo, y tras 15 fallos seguidos el CMS desactiva el webhook.
5. Prueba manual (opcional, con `REVALIDATE_SECRET` definida):
   `curl -X POST -H "x-revalidate-secret: ..." https://<dominio>/api/revalidate`
   responde `{"revalidated":true}`; sin credenciales o con otro valor, `401`.

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
| `informacion-huespedes` | Reservas, información práctica, plazo de respuesta |
| `ubicacion-contacto` | Ubicación, contacto, WhatsApp flotante |
| `instalaciones`, `experiencias` | Espacios (con sus fotos), Experiencias |
| `recomendaciones-la-paloma`, `preguntas-frecuentes` | Descubrí La Paloma, FAQ |
| `reservas` (privada) | Solo por API de integración: solicitudes y disponibilidad |

Siguen locales a propósito (`lib/data.ts`): página `/la-paloma`, títulos de
sección, textos alternativos de fotos (se resuelven por nombre de archivo,
también para las fotos subidas al CMS) y datos del negocio del JSON-LD.
