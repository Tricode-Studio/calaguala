# Qué se edita en el CMS y dónde

Guía para editar el contenido del sitio de Calaguala desde Tricode CMS. Está ordenada **en el mismo orden en que aparecen los bloques en la página**.

> **Importante:** todos los campos son opcionales. Si un campo está **vacío o no existe** en el CMS, el sitio muestra el texto o la foto de siempre. Podés ir completando de a poco sin riesgo.

## 1. Qué se ve en el sitio → dónde se edita

| Bloque | Qué parte | Colección del CMS | Campo | ¿Existía? |
|---|---|---|---|---|
| 1 · Portada | Título principal | Portada | `titulo` | Ya existía |
| 1 · Portada | Subtítulo | Portada | `subtitulo` | Ya existía |
| 1 · Portada | Foto de fondo de la portada | Portada | `imagenfondo` | Ya existía |
| 1 · Portada | Botón principal | Portada | `herobotonprincipal` | **Nuevo** |
| 1 · Portada | Botón secundario | Portada | `herobotonsecundario` | **Nuevo** |
| 2 · Descansar cerca del mar | Título | Portada | `introtitulo` | **Nuevo** |
| 2 · Descansar cerca del mar | Texto | Portada | `introtexto` | Ya existía |
| 2 · Descansar cerca del mar | Foto de fondo del bloque | Portada | `introimagen` | Ya existía (ahora se usa como fondo) |
| 2 · Descansar cerca del mar | Tira de fotos (la tarjeta tipo póster es la primera foto) | Portada | `introgaleria` | Ya existía |
| 3 · Playa Anaconda | Título | Ubicación y contacto | `ubicaciontitulo` | **Nuevo** |
| 3 · Playa Anaconda | Frase bajo el título (opcional) | Ubicación y contacto | `ubicacionbajada` | **Nuevo** |
| 3 · Playa Anaconda | Descripción («tres cuadras…») | Ubicación y contacto | `ubicaciontexto` | **Nuevo** |
| 3 · Playa Anaconda | Texto del botón del mapa | Ubicación y contacto | `ubicacionboton` | **Nuevo** |
| 3 · Playa Anaconda | Mapa incrustado | Ubicación y contacto | `mapaembedurl` | Ya existía |
| 3 · Playa Anaconda | Enlace a Google Maps | Ubicación y contacto | `mapaurl` | Ya existía |
| 4 · Opciones de alojamiento | Título | Portada | `alojamientotitulo` | **Nuevo** |
| 4 · Opciones de alojamiento | Texto bajo el título | Portada | `alojamientobajada` | **Nuevo** |
| 4 · Opciones de alojamiento | Cada tarjeta: nombre, descripción, precio, fotos, qué incluye | Alojamientos | `nombre`, `descripcion`, `precio`, `fotos`, `incluye`, `caracteristicas`… | Ya existía |
| 4 · Opciones de alojamiento | Fotos de cada variante (ej. colores de carpa) | Unidades | `foto` | Ya existía |
| 5 · Espacios | Título | Portada | `espaciostitulo` | **Nuevo** |
| 5 · Espacios | Texto bajo el título (opcional) | Portada | `espaciosbajada` | **Nuevo** |
| 5 · Espacios | Cada espacio: título, descripción y fotos | Instalaciones | `titulo`, `descripcion`, `fotos` (el `icono` decide qué fotos van con qué espacio) | Ya existía |
| 6 · Experiencias | Título | Portada | `experienciastitulo` | **Nuevo** |
| 6 · Experiencias | Texto bajo el título (opcional) | Portada | `experienciasbajada` | **Nuevo** |
| 6 · Experiencias | Cada experiencia: título, descripción, etiquetas y fotos | Experiencias | `titulo`, `descripcion`, `detalles`, `fotos` | Ya existía |
| 7 · Descubrí La Paloma | Título | Portada | `descubrirtitulo` | **Nuevo** |
| 7 · Descubrí La Paloma | Texto bajo el título (hoy vacío) | Portada | `descubrirbajada` | **Nuevo** |
| 7 · Descubrí La Paloma | Cada lugar: nombre, tipo, descripción y fotos | Recomendaciones La Paloma | `nombre`, `tipo`, `descripcion`, `imagenes` | Ya existía |
| 8 · Reservas | Título | Portada | `reservastitulo` | **Nuevo** |
| 8 · Reservas | Texto explicativo | Información para huéspedes | `reservastexto` | Ya existía |
| 8 · Reservas | Aviso «es una solicitud» | Información para huéspedes | `avisosolicitud` | Ya existía |
| 8 · Reservas | Plazo de respuesta | Información para huéspedes | `tiemporespuesta` | Ya existía |
| 8 · Reservas | Texto del botón | Portada | `reservasboton` | **Nuevo** |
| 8 · Reservas | Pasos numerados (uno por línea) | Portada | `reservaspasos` | **Nuevo** |
| 9 · Información práctica | Título | Portada | `infopracticatitulo` | **Nuevo** |
| 9 · Información práctica | Check-in y check-out | Información para huéspedes | `checkin`, `checkout` | Ya existía |
| 9 · Información práctica | Qué traer (una por línea) | Información para huéspedes | `quetraer` | Ya existía |
| 9 · Información práctica | Normas del espacio (una por línea) | Información para huéspedes | `normas` | Ya existía |
| 10 · Preguntas frecuentes | Título | Portada | `faqtitulo` | **Nuevo** |
| 10 · Preguntas frecuentes | Cada pregunta y respuesta | Preguntas frecuentes | `pregunta`, `respuesta` | Ya existía |
| 11 · Contacto (pie de página) | Mensaje final grande | Ubicación y contacto | `mensajefinal` | Ya existía |
| 11 · Contacto (pie de página) | WhatsApp (también el botón flotante) | Ubicación y contacto | `whatsapp` | Ya existía |
| 11 · Contacto (pie de página) | Instagram | Ubicación y contacto | `instagramurl` | Ya existía |
| 11 · Contacto (pie de página) | Dirección | Ubicación y contacto | `direccion` | Ya existía |
| 12 · Página «Solicitá tu reserva» | Título | Portada | `reservartitulo` | **Nuevo** |
| 12 · Página «Solicitá tu reserva» | Frase bajo el título | Portada | `reservarbajada` | **Nuevo** |
| Buscadores y redes | Título y descripción para Google | Portada | `metatitle`, `metadescription` | Ya existía |
| Buscadores y redes | Imagen al compartir el link (WhatsApp, redes) | Portada | `ogimage` | Ya existía |

### Cosas que NO se editan desde el CMS (hoy)
- **Página «Descubrí La Paloma» (`/la-paloma`) completa**: sus textos y fotos están en el código; es una página larga y estructurada, y volverla editable requeriría crear colecciones nuevas. Los lugares del bloque «Descubrí La Paloma» del inicio sí se editan (colección Recomendaciones La Paloma).
- Textos fijos de las tarjetas de alojamiento («Incluye», «Consultar disponibilidad»), los subtítulos de Información práctica («Horarios», «Qué traer», «Normas del espacio», «Check-in», «Check-out»), los botones del pie («Solicitar reserva», «Escribinos por WhatsApp», «Instagram»), el menú de arriba y los textos del formulario de reserva: son etiquetas de funcionamiento, se repiten y cambiarlas por error rompe la interfaz.
- Descripciones de las fotos para lectores de pantalla (se arman solas a partir del nombre del archivo).
- El campo `imagendrone` de Ubicación y contacto existe pero **hoy no se muestra en ningún lado** (el bloque Playa Anaconda muestra el mapa).

## 2. Campos nuevos para agregar al CMS

Se agregan a mano en el perfil de cada colección (o aplicando el JSON del final).

### `herobotonprincipal` — Texto del botón principal de la portada
- Colección: **Portada** (`portada`)
- Tipo: `text`
- Grupo sugerido: **1 · Portada (inicio del sitio)**
- Ayuda: Se ve en la portada, primer botón (lleva a la página de reserva).
- Valor actual del sitio (ejemplo): Solicitá tu reserva

### `herobotonsecundario` — Texto del botón secundario de la portada
- Colección: **Portada** (`portada`)
- Tipo: `text`
- Grupo sugerido: **1 · Portada (inicio del sitio)**
- Ayuda: Se ve en la portada, segundo botón (baja al bloque «Descansar cerca del mar»).
- Valor actual del sitio (ejemplo): Conocé el espacio

### `introtitulo` — Título del bloque «Descansar cerca del mar»
- Colección: **Portada** (`portada`)
- Tipo: `text`
- Grupo sugerido: **2 · Descansar cerca del mar**
- Ayuda: Se ve como título grande del segundo bloque, sobre la foto de fondo.
- Valor actual del sitio (ejemplo): Descansar cerca del mar

### `ubicaciontitulo` — Título del bloque «Playa Anaconda»
- Colección: **Ubicación y contacto** (`ubicacion-contacto`)
- Tipo: `text`
- Grupo sugerido: **3 · Playa Anaconda (ubicación)**
- Ayuda: Se ve como título del bloque de ubicación, arriba del mapa.
- Valor actual del sitio (ejemplo): Playa Anaconda

### `ubicacionbajada` — Frase corta bajo el título de la ubicación
- Colección: **Ubicación y contacto** (`ubicacion-contacto`)
- Tipo: `text`
- Grupo sugerido: **3 · Playa Anaconda (ubicación)**
- Ayuda: Se ve justo debajo del título del bloque de ubicación (opcional).
- Valor actual del sitio (ejemplo): (vacío: no se muestra bajada)

### `ubicaciontexto` — Descripción de la ubicación (frase de «tres cuadras»)
- Colección: **Ubicación y contacto** (`ubicacion-contacto`)
- Tipo: `textarea`
- Grupo sugerido: **3 · Playa Anaconda (ubicación)**
- Ayuda: Se ve como párrafo del bloque de ubicación, al lado del mapa.
- Valor actual del sitio (ejemplo): Estamos en La Paloma, Playa Anaconda. Salís del predio y a tres cuadras estás con los pies en la arena.

### `ubicacionboton` — Texto del botón del mapa
- Colección: **Ubicación y contacto** (`ubicacion-contacto`)
- Tipo: `text`
- Grupo sugerido: **3 · Playa Anaconda (ubicación)**
- Ayuda: Se ve como botón debajo de la descripción de la ubicación (abre Google Maps).
- Valor actual del sitio (ejemplo): Ver la ubicación en Google Maps

### `alojamientotitulo` — Título del bloque de alojamientos
- Colección: **Portada** (`portada`)
- Tipo: `text`
- Grupo sugerido: **4 · Opciones de alojamiento**
- Ayuda: Se ve como título arriba de las tarjetas de alojamiento.
- Valor actual del sitio (ejemplo): Opciones de alojamiento

### `alojamientobajada` — Texto bajo el título de alojamientos
- Colección: **Portada** (`portada`)
- Tipo: `textarea`
- Grupo sugerido: **4 · Opciones de alojamiento**
- Ayuda: Se ve debajo del título del bloque de alojamientos.
- Valor actual del sitio (ejemplo): Dos formas de vivir el mismo lugar: con tu propia carpa o con una que ya te espera armada.

### `espaciostitulo` — Título del bloque «Espacios»
- Colección: **Portada** (`portada`)
- Tipo: `text`
- Grupo sugerido: **5 · Espacios**
- Ayuda: Se ve como título del bloque de cocina, baños y espacios comunes.
- Valor actual del sitio (ejemplo): Espacios

### `espaciosbajada` — Texto bajo el título de Espacios
- Colección: **Portada** (`portada`)
- Tipo: `textarea`
- Grupo sugerido: **5 · Espacios**
- Ayuda: Se ve debajo del título del bloque Espacios (opcional).
- Valor actual del sitio (ejemplo): (vacío: no se muestra bajada)

### `experienciastitulo` — Título del bloque «Experiencias»
- Colección: **Portada** (`portada`)
- Tipo: `text`
- Grupo sugerido: **6 · Experiencias**
- Ayuda: Se ve como título del bloque de experiencias.
- Valor actual del sitio (ejemplo): Experiencias

### `experienciasbajada` — Texto bajo el título de Experiencias
- Colección: **Portada** (`portada`)
- Tipo: `textarea`
- Grupo sugerido: **6 · Experiencias**
- Ayuda: Se ve debajo del título del bloque Experiencias (opcional).
- Valor actual del sitio (ejemplo): (vacío: no se muestra bajada)

### `descubrirtitulo` — Título del bloque «Descubrí La Paloma»
- Colección: **Portada** (`portada`)
- Tipo: `text`
- Grupo sugerido: **7 · Descubrí La Paloma**
- Ayuda: Se ve como título del bloque de recomendaciones de la zona.
- Valor actual del sitio (ejemplo): Descubrí La Paloma

### `descubrirbajada` — Texto bajo el título de Descubrí La Paloma
- Colección: **Portada** (`portada`)
- Tipo: `textarea`
- Grupo sugerido: **7 · Descubrí La Paloma**
- Ayuda: Se ve debajo del título de ese bloque (opcional; hoy está vacío a propósito).
- Valor actual del sitio (ejemplo): (vacío: no se muestra bajada)

### `reservastitulo` — Título del bloque «Reservas»
- Colección: **Portada** (`portada`)
- Tipo: `text`
- Grupo sugerido: **8 · Reservas**
- Ayuda: Se ve como título del bloque que explica cómo reservar.
- Valor actual del sitio (ejemplo): Reservas

### `reservasboton` — Texto del botón del bloque Reservas
- Colección: **Portada** (`portada`)
- Tipo: `text`
- Grupo sugerido: **8 · Reservas**
- Ayuda: Se ve como botón debajo del texto del bloque Reservas.
- Valor actual del sitio (ejemplo): Solicitá tu reserva

### `reservaspasos` — Pasos para reservar (uno por línea)
- Colección: **Portada** (`portada`)
- Tipo: `textarea`
- Grupo sugerido: **8 · Reservas**
- Ayuda: Se ven como lista numerada a la derecha del bloque Reservas. Escribí un paso por línea.
- Valor actual del sitio (ejemplo): Elegís fechas, cantidad de personas y tipo de alojamiento. / Te mostramos las opciones posibles para esas fechas. / Dejás tus datos y lo que necesites contarnos. / Enviás la solicitud y te respondemos para confirmar.

### `infopracticatitulo` — Título del bloque «Información práctica»
- Colección: **Portada** (`portada`)
- Tipo: `text`
- Grupo sugerido: **9 · Información práctica**
- Ayuda: Se ve como título del bloque de horarios, qué traer y normas.
- Valor actual del sitio (ejemplo): Información práctica

### `faqtitulo` — Título del bloque «Preguntas frecuentes»
- Colección: **Portada** (`portada`)
- Tipo: `text`
- Grupo sugerido: **10 · Preguntas frecuentes**
- Ayuda: Se ve como título del bloque de preguntas frecuentes.
- Valor actual del sitio (ejemplo): Preguntas frecuentes

### `reservartitulo` — Título de la página de reserva
- Colección: **Portada** (`portada`)
- Tipo: `text`
- Grupo sugerido: **12 · Página «Solicitá tu reserva»**
- Ayuda: Se ve como título grande arriba del formulario de reserva.
- Valor actual del sitio (ejemplo): Solicitá tu reserva

### `reservarbajada` — Frase bajo el título de la página de reserva
- Colección: **Portada** (`portada`)
- Tipo: `text`
- Grupo sugerido: **12 · Página «Solicitá tu reserva»**
- Ayuda: Se ve debajo del título del formulario de reserva.
- Valor actual del sitio (ejemplo): Camping & Glamping en La Paloma, a pocos pasos de Playa Anaconda.


## 3. Reglas de oro para editar

1. **Tres tipos de foto distintos en el inicio:**
   - **Foto de fondo de la portada** → `imagenfondo` (colección Portada). Es el fondo del inicio del sitio. **No** es la foto de La Laguna ni de ningún lugar de La Paloma.
   - **Foto de fondo de «Descansar cerca del mar»** → `introimagen`. Es la imagen grande detrás del texto.
   - **Tira de fotos y tarjeta tipo póster** → `introgaleria`. Son las fotos que se deslizan al costado del texto; la primera es la que se ve como tarjeta.
2. Las fotos de los lugares de La Paloma (Bahía Chica, Puerto, La Laguna…) se cargan en **Recomendaciones La Paloma → `imagenes`**, una por lugar.
3. **Lo que está vacío se ve con el texto de siempre.** Para volver al texto original, borrá el contenido del campo.
4. **Los cambios tardan hasta 5 minutos** en verse en el sitio (si el webhook está configurado, se ven casi enseguida).
5. En los campos «uno por línea» (qué traer, normas, pasos para reservar) cada línea es un ítem; no hace falta usar viñetas ni números.
6. Si cambiás una foto y «se cambia otra», revisá en qué campo la cargaste usando la tabla de arriba.

## 4. Campos nuevos en formato JSON

Para aplicar después al perfil del CMS.

```json
[
  {
    "collection": "portada",
    "key": "herobotonprincipal",
    "label": "Texto del botón principal de la portada",
    "type": "text",
    "group": "1 · Portada (inicio del sitio)",
    "help": "Se ve en la portada, primer botón (lleva a la página de reserva).",
    "example": "Solicitá tu reserva"
  },
  {
    "collection": "portada",
    "key": "herobotonsecundario",
    "label": "Texto del botón secundario de la portada",
    "type": "text",
    "group": "1 · Portada (inicio del sitio)",
    "help": "Se ve en la portada, segundo botón (baja al bloque «Descansar cerca del mar»).",
    "example": "Conocé el espacio"
  },
  {
    "collection": "portada",
    "key": "introtitulo",
    "label": "Título del bloque «Descansar cerca del mar»",
    "type": "text",
    "group": "2 · Descansar cerca del mar",
    "help": "Se ve como título grande del segundo bloque, sobre la foto de fondo.",
    "example": "Descansar cerca del mar"
  },
  {
    "collection": "ubicacion-contacto",
    "key": "ubicaciontitulo",
    "label": "Título del bloque «Playa Anaconda»",
    "type": "text",
    "group": "3 · Playa Anaconda (ubicación)",
    "help": "Se ve como título del bloque de ubicación, arriba del mapa.",
    "example": "Playa Anaconda"
  },
  {
    "collection": "ubicacion-contacto",
    "key": "ubicacionbajada",
    "label": "Frase corta bajo el título de la ubicación",
    "type": "text",
    "group": "3 · Playa Anaconda (ubicación)",
    "help": "Se ve justo debajo del título del bloque de ubicación (opcional).",
    "example": "(vacío: no se muestra bajada)"
  },
  {
    "collection": "ubicacion-contacto",
    "key": "ubicaciontexto",
    "label": "Descripción de la ubicación (frase de «tres cuadras»)",
    "type": "textarea",
    "group": "3 · Playa Anaconda (ubicación)",
    "help": "Se ve como párrafo del bloque de ubicación, al lado del mapa.",
    "example": "Estamos en La Paloma, Playa Anaconda. Salís del predio y a tres cuadras estás con los pies en la arena."
  },
  {
    "collection": "ubicacion-contacto",
    "key": "ubicacionboton",
    "label": "Texto del botón del mapa",
    "type": "text",
    "group": "3 · Playa Anaconda (ubicación)",
    "help": "Se ve como botón debajo de la descripción de la ubicación (abre Google Maps).",
    "example": "Ver la ubicación en Google Maps"
  },
  {
    "collection": "portada",
    "key": "alojamientotitulo",
    "label": "Título del bloque de alojamientos",
    "type": "text",
    "group": "4 · Opciones de alojamiento",
    "help": "Se ve como título arriba de las tarjetas de alojamiento.",
    "example": "Opciones de alojamiento"
  },
  {
    "collection": "portada",
    "key": "alojamientobajada",
    "label": "Texto bajo el título de alojamientos",
    "type": "textarea",
    "group": "4 · Opciones de alojamiento",
    "help": "Se ve debajo del título del bloque de alojamientos.",
    "example": "Dos formas de vivir el mismo lugar: con tu propia carpa o con una que ya te espera armada."
  },
  {
    "collection": "portada",
    "key": "espaciostitulo",
    "label": "Título del bloque «Espacios»",
    "type": "text",
    "group": "5 · Espacios",
    "help": "Se ve como título del bloque de cocina, baños y espacios comunes.",
    "example": "Espacios"
  },
  {
    "collection": "portada",
    "key": "espaciosbajada",
    "label": "Texto bajo el título de Espacios",
    "type": "textarea",
    "group": "5 · Espacios",
    "help": "Se ve debajo del título del bloque Espacios (opcional).",
    "example": "(vacío: no se muestra bajada)"
  },
  {
    "collection": "portada",
    "key": "experienciastitulo",
    "label": "Título del bloque «Experiencias»",
    "type": "text",
    "group": "6 · Experiencias",
    "help": "Se ve como título del bloque de experiencias.",
    "example": "Experiencias"
  },
  {
    "collection": "portada",
    "key": "experienciasbajada",
    "label": "Texto bajo el título de Experiencias",
    "type": "textarea",
    "group": "6 · Experiencias",
    "help": "Se ve debajo del título del bloque Experiencias (opcional).",
    "example": "(vacío: no se muestra bajada)"
  },
  {
    "collection": "portada",
    "key": "descubrirtitulo",
    "label": "Título del bloque «Descubrí La Paloma»",
    "type": "text",
    "group": "7 · Descubrí La Paloma",
    "help": "Se ve como título del bloque de recomendaciones de la zona.",
    "example": "Descubrí La Paloma"
  },
  {
    "collection": "portada",
    "key": "descubrirbajada",
    "label": "Texto bajo el título de Descubrí La Paloma",
    "type": "textarea",
    "group": "7 · Descubrí La Paloma",
    "help": "Se ve debajo del título de ese bloque (opcional; hoy está vacío a propósito).",
    "example": "(vacío: no se muestra bajada)"
  },
  {
    "collection": "portada",
    "key": "reservastitulo",
    "label": "Título del bloque «Reservas»",
    "type": "text",
    "group": "8 · Reservas",
    "help": "Se ve como título del bloque que explica cómo reservar.",
    "example": "Reservas"
  },
  {
    "collection": "portada",
    "key": "reservasboton",
    "label": "Texto del botón del bloque Reservas",
    "type": "text",
    "group": "8 · Reservas",
    "help": "Se ve como botón debajo del texto del bloque Reservas.",
    "example": "Solicitá tu reserva"
  },
  {
    "collection": "portada",
    "key": "reservaspasos",
    "label": "Pasos para reservar (uno por línea)",
    "type": "textarea",
    "group": "8 · Reservas",
    "help": "Se ven como lista numerada a la derecha del bloque Reservas. Escribí un paso por línea.",
    "example": "Elegís fechas, cantidad de personas y tipo de alojamiento.\nTe mostramos las opciones posibles para esas fechas.\nDejás tus datos y lo que necesites contarnos.\nEnviás la solicitud y te respondemos para confirmar."
  },
  {
    "collection": "portada",
    "key": "infopracticatitulo",
    "label": "Título del bloque «Información práctica»",
    "type": "text",
    "group": "9 · Información práctica",
    "help": "Se ve como título del bloque de horarios, qué traer y normas.",
    "example": "Información práctica"
  },
  {
    "collection": "portada",
    "key": "faqtitulo",
    "label": "Título del bloque «Preguntas frecuentes»",
    "type": "text",
    "group": "10 · Preguntas frecuentes",
    "help": "Se ve como título del bloque de preguntas frecuentes.",
    "example": "Preguntas frecuentes"
  },
  {
    "collection": "portada",
    "key": "reservartitulo",
    "label": "Título de la página de reserva",
    "type": "text",
    "group": "12 · Página «Solicitá tu reserva»",
    "help": "Se ve como título grande arriba del formulario de reserva.",
    "example": "Solicitá tu reserva"
  },
  {
    "collection": "portada",
    "key": "reservarbajada",
    "label": "Frase bajo el título de la página de reserva",
    "type": "text",
    "group": "12 · Página «Solicitá tu reserva»",
    "help": "Se ve debajo del título del formulario de reserva.",
    "example": "Camping & Glamping en La Paloma, a pocos pasos de Playa Anaconda."
  }
]
```
