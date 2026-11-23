# La página «Descubrí La Paloma» en el CMS

La página `/la-paloma` se edita desde el CMS. En el menú aparecen cuatro colecciones que empiezan con **«Página La Paloma ·»**.

**Regla de oro:** si dejás un texto o una foto vacío, el sitio muestra el que ya tenía. Nada queda en blanco por error.

## Qué se ve → dónde se edita

| Lo que ves en la página | Dónde se edita | Campo |
|---|---|---|
| Título grande de arriba («Descubrí La Paloma») y la frase de abajo | **Página La Paloma · Textos y fotos** | Título grande / Frase debajo del título |
| Foto grande de arriba | Textos y fotos | Foto grande de la cabecera |
| Párrafo centrado debajo de la foto | Textos y fotos | Párrafo de presentación |
| «Cada playa, un paisaje diferente» y su texto | Textos y fotos | Título / Texto de presentación de las playas |
| Cada playa (nombre, foto, descripción) | **Página La Paloma · Playas** | Una entrada por playa |
| «Más allá del mar» | Textos y fotos | Título de la sección «Más allá del mar» |
| **Laguna de Rocha** (grande) y su texto | Textos y fotos | Lugar destacado: nombre / descripción / foto |
| Dunas, Bosques, Vegetación costera, Aves | **Página La Paloma · Naturaleza** | Una entrada por cuadro |
| Franja azul con íconos (Surf, Bicicleta…) | **Página La Paloma · Franja de experiencias** | Una entrada por ícono |
| Faro de Cabo Santa María | Textos y fotos | Faro: título, texto, foto, enlace |
| Puerto y Bahías | Textos y fotos | Puerto: … / Bahías: … |
| «Un día en La Paloma» | Textos y fotos | Mañana, Mediodía, Tarde, Atardecer |
| «La Paloma, a tu ritmo» y su botón | Textos y fotos | Cierre: título, texto, foto, botón |
| Título de la pestaña y descripción en Google | Textos y fotos | Título de la pestaña / Descripción para Google |

## Reglas

- **Textos y fotos** es una sola entrada: se edita, no se crean más. Sus campos están ordenados en secciones numeradas, en el mismo orden en que aparecen en la página.
- **Playas, Naturaleza y Franja de experiencias** son listas: cada entrada es un cuadro. Se pueden agregar y borrar. El campo **Orden** decide quién va primero (el número más chico va antes).
- En **Franja de experiencias** el ícono se elige de una lista (Surf, Bicicleta, Caminata, Skate, Ave).
- Los nombres de los momentos del día (Mañana, Mediodía, Tarde, Atardecer) son fijos; se editan sus textos.
- Para que algo se vea, la entrada tiene que estar **publicada**.
- Los cambios tardan hasta 5 minutos en verse en el sitio.

## La colección «Portada · Tarjetas de La Paloma»

Es la que antes se llamaba «Descubrí La Paloma». **No** edita la página `/la-paloma`: edita las tarjetas de la sección «Descubrí La Paloma» de la **portada** del sitio. El título y la bajada de esa sección se editan en **Portada** (campos «Título de Descubrí La Paloma» y «Bajada…»).

## Cómo se activó

`scripts/perfil-la-paloma.mjs` crea las cuatro colecciones y carga los textos actuales (no las fotos). Funciona igual que `scripts/perfil-cms.mjs`: primero muestra qué haría sin escribir nada, y con `--aplicar` guarda un respaldo, pide confirmación y verifica. Para volver atrás se usa `node scripts/perfil-cms.mjs --restaurar <respaldo>`.
