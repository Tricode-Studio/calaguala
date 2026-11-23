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

## Antes de editar: cosas a tener en cuenta

- **«Página La Paloma · Textos y fotos» es de una sola entrada.** Si se crea otra, el sitio usa la primera y la otra no se ve.
- **En las listas (Playas, Naturaleza y Franja de experiencias), el respaldo local de foto y texto se empareja por nombre o título.** Si renombrás un ítem, el sitio deja de reconocerlo como el de siempre y hay que volver a subir su foto. Una playa sin foto muestra un marco vacío.
- **Los ítems sin número de orden quedan al final** de la lista. Si querés que uno vaya antes, cargale un número en **Orden**.

## Cómo se activa

`scripts/perfil-la-paloma.mjs` crea las cuatro colecciones y carga los textos actuales (no las fotos). Funciona igual que `scripts/perfil-cms.mjs`: por defecto es un dry-run que muestra qué haría sin escribir nada, y con `--aplicar` sigue este orden:

1. **Dry-run:** muestra los cambios en el perfil y el contenido que cargaría.
2. **Confirmación:** pide escribir «si» para continuar.
3. **Respaldo:** guarda el perfil actual en un archivo. Si el perfil no tiene cambios que hacer (las colecciones ya están creadas), no hay respaldo, porque no se toca el perfil.
4. **PUT del perfil:** agrega las cuatro colecciones y renombra la vieja.
5. **Verificación:** vuelve a leer el perfil y comprueba que quedó guardado.
6. **Carga del contenido:** por cada colección, crea las entradas que faltan (compara por título) y no toca las que ya están.

Si la carga se corta, se puede volver a correr el script: completa solo lo que falta.

## Volver atrás

`node scripts/perfil-cms.mjs --restaurar <respaldo>` restaura **solo el perfil**. No borra las entradas que se hayan cargado ni las colecciones que ya se crearon: eso, si hace falta, se limpia a mano desde el CMS.
