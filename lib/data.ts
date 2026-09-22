/**
 * Fallback local. MISMA forma que las entries/settings de Tricode CMS.
 * ⚠️ No importar desde componentes: todo pasa por lib/cms.ts.
 *
 * Convención: todo texto entre [corchetes] es un dato que falta confirmar
 * con Calaguala. Buscá "[completar" antes de publicar.
 */
import type {
  Alojamiento,
  Extensiones,
  LandingConfig,
  PreguntaFrecuente,
  Recomendacion,
} from './types';

const F = (nombre: string) => `/fotos/${nombre}.webp`;

// ── Singletons ──────────────────────────────────────────────────────────────
export const landingConfig: LandingConfig = {
  heroConfig: {
    titulo: 'Un lugar para bajar el ritmo.',
    subtitulo: 'Camping & Glamping en La Paloma, a pocos pasos del mar',
    imagenFondo: F('atardecer'),
  },
  introduccion: {
    // Copy provisto por el cliente. [completar: el brief lo trae cortado con "..."]
    texto:
      '<p>En Calaguala creamos un espacio para descansar, conectar con el mar y la vida natural de La Paloma.</p>',
    imagenApoyo: F('carpaalfondo'),
  },
  ubicacion: {
    direccion: '[completar: dirección del predio], La Paloma, Rocha, Uruguay',
    // Embed sin API key. [completar: reemplazar por el pin exacto del predio]
    mapaEmbedUrl:
      'https://www.google.com/maps?q=Playa+Anaconda,+La+Paloma,+Rocha,+Uruguay&z=15&output=embed',
    imagenDrone: '',
  },
  instalaciones: {
    items: [
      {
        titulo: 'Cocina compartida',
        descripcion:
          'Equipada, con heladera y cocina de uso común. Un lugar para preparar algo rico después de la playa y compartir la mesa.',
        icono: 'cocina',
      },
      {
        titulo: 'Baños y duchas',
        descripcion:
          'Ducha exterior e interior, con agua caliente. Para sacarte la sal del mar sin apuro.',
        icono: 'ducha',
      },
      {
        titulo: 'Espacios comunes',
        descripcion:
          'Rincones techados sobre la arena y mesas al aire libre bajo los árboles, con hamacas para quedarse un rato más.',
        icono: 'descanso',
      },
    ],
  },
  queIncluye: {
    items: [
      'Alojamiento en carpa',
      'Acceso a espacios comunes',
      'Cocina compartida',
      'Baños',
      'Duchas con agua caliente',
    ],
  },
  reservasInfo: {
    textoExplicativo:
      '<p>Contanos cuándo querés venir y cómo te gustaría quedarte. Revisamos cada solicitud a mano y te respondemos para confirmar fechas y detalles.</p>',
    avisoSolicitud: 'Esto es una solicitud, no una reserva confirmada.',
  },
  informacionPractica: {
    checkIn: '[completar: horario de check-in]',
    checkOut: '[completar: horario de check-out]',
    queTraer: [
      'Toalla [completar: confirmar si se provee]',
      'Protector solar',
      'Abrigo para las noches',
    ],
    normas: [
      'Horarios de descanso: [completar]',
      'Uso de espacios comunes: [completar]',
      'Mascotas: [completar]',
      'Fumar: [completar]',
    ],
  },
  contacto: {
    whatsapp: '', // [completar: número con código de país, solo dígitos. Ej: 59899123456]
    instagramUrl: 'https://www.instagram.com/', // [completar: perfil de Calaguala]
    mensajeFinal: '¿Nos vemos en La Paloma?',
  },
  seoGlobal: {
    metaTitle: 'Calaguala — Camping & Glamping en La Paloma, a pasos del mar',
    metaDescription:
      'Camping y glamping en La Paloma, Uruguay, a pasos de Playa Anaconda. Descansá entre naturaleza y mar. Consultá disponibilidad.',
    ogImage: F('atardecer'),
  },
};

// ── Colección: alojamientos (CATALOG) ───────────────────────────────────────
export const alojamientos: Alojamiento[] = [
  {
    id: 'aloj-carpa',
    slug: 'espacio-para-carpa',
    nombre: 'Espacio para carpa',
    tipo: 'carpa',
    descripcion:
      '<p>Una parcela entre árboles y vegetación nativa, en La Paloma, a pocos pasos de Playa Anaconda. Para quienes disfrutan acampar a su manera y despertarse con el sonido del mar.</p>',
    capacidad: 2, // [completar: personas por parcela]
    caracteristicas: [
      'Parcela entre vegetación nativa',
      'A pocos pasos de Playa Anaconda',
    ],
    incluye: ['Acceso a espacios comunes', 'Cocina compartida', 'Baños', 'Duchas con agua caliente'],
    precio: null,
    precioUnidad: 'por noche',
    fotos: [F('carpaalfondo'), F('espaciocomunfuera1')],
    orden: 1,
  },
  {
    id: 'aloj-glamping-solo',
    slug: 'glamping-1-persona',
    nombre: 'Glamping 1 persona',
    tipo: 'glamping-solo',
    descripcion:
      '<p>Una carpa ya armada, lista para llegar y descansar. Un refugio para una persona en La Paloma, cerca de Playa Anaconda, con tiempo para leer, caminar la orilla y no hacer nada.</p>',
    capacidad: 1,
    caracteristicas: ['Carpa armada y lista al llegar', '[completar: equipamiento de la carpa]'],
    incluye: ['Alojamiento en carpa', 'Acceso a espacios comunes', 'Cocina compartida', 'Baños', 'Duchas con agua caliente'],
    precio: null,
    precioUnidad: 'por noche',
    fotos: [F('espaciocomunfuera'), F('espaciocomun')], // [completar: fotos propias del glamping]
    orden: 2,
  },
  {
    id: 'aloj-glamping-doble',
    slug: 'glamping-2-personas',
    nombre: 'Glamping 2 personas',
    tipo: 'glamping-doble',
    descripcion:
      '<p>Glamping para dos personas en La Paloma, a pasos de Playa Anaconda. La carpa te espera armada; ustedes solo tienen que bajar el ritmo y mirar el atardecer.</p>',
    capacidad: 2,
    caracteristicas: ['Carpa armada y lista al llegar', '[completar: equipamiento de la carpa]'],
    incluye: ['Alojamiento en carpa', 'Acceso a espacios comunes', 'Cocina compartida', 'Baños', 'Duchas con agua caliente'],
    precio: null,
    precioUnidad: 'por noche',
    fotos: [F('espaciocomun2'), F('espaciocomun3')], // [completar: fotos propias del glamping]
    orden: 3,
  },
];

// ── Colección: preguntas-frecuentes (CUSTOM) ────────────────────────────────
const faq = (orden: number, slug: string, pregunta: string, respuesta: string): PreguntaFrecuente => ({
  id: `faq-${slug}`,
  slug,
  pregunta,
  respuesta,
  orden,
});

export const preguntasFrecuentes: PreguntaFrecuente[] = [
  faq(1, 'distancia-playa', '¿A qué distancia está la playa?',
    '<p>Estamos a pocos pasos de Playa Anaconda, en La Paloma. [completar: minutos a pie]</p>'),
  faq(2, 'electricidad', '¿Hay electricidad en las carpas?',
    '<p>[completar]</p>'),
  faq(3, 'cocina-compartida', '¿Cómo es la cocina compartida?',
    '<p>Es una cocina equipada, con heladera y cocina de uso común para todos los huéspedes.</p>'),
  faq(4, 'agua-caliente', '¿Hay agua caliente?',
    '<p>Sí. Tanto la ducha interior como la exterior tienen agua caliente.</p>'),
  faq(5, 'cocinar', '¿Se puede cocinar?',
    '<p>Sí, en la cocina compartida. [completar: si hay parrilla o fogón de uso común]</p>'),
  faq(6, 'mascotas', '¿Puedo ir con mi mascota?',
    '<p>[completar]</p>'),
  faq(7, 'sin-auto', '¿Cómo llego sin auto?',
    '<p>[completar]</p>'),
  faq(8, 'estacionamiento', '¿Hay estacionamiento?',
    '<p>[completar]</p>'),
  faq(9, 'como-funciona-reserva', '¿Cómo funciona la reserva?',
    '<p>Elegís fechas, cantidad de personas y tipo de alojamiento, y nos mandás una solicitud con tus datos. No es una reserva confirmada todavía: la revisamos a mano y te escribimos para confirmar disponibilidad y detalles.</p>'),
  faq(10, 'si-llueve', '¿Qué pasa si llueve?',
    '<p>Los espacios comunes están techados, así que siempre hay un lugar a resguardo para cocinar, leer o tomar unos mates. [completar: política de cambios por lluvia]</p>'),
];

// ── Colección: recomendaciones-la-paloma (MARKETING) ────────────────────────
// Ejemplos de forma. [completar: las recomendaciones reales las carga el equipo]
export const recomendaciones: Recomendacion[] = [
  {
    id: 'rec-playa-anaconda',
    slug: 'playa-anaconda',
    nombre: 'Playa Anaconda',
    tipo: 'playa',
    descripcion: 'La playa que tenemos a pocos pasos. Buena para caminar la orilla temprano y quedarse al atardecer.',
    imagen: F('atardecer'),
    orden: 1,
  },
  {
    id: 'rec-faro',
    slug: 'faro-cabo-santa-maria',
    nombre: 'Faro del Cabo Santa María',
    tipo: 'actividad',
    descripcion: 'El faro de La Paloma. [completar: recomendación del equipo]',
    imagen: '',
    orden: 2,
  },
  {
    id: 'rec-surf',
    slug: 'surf-la-paloma',
    nombre: 'Surf en La Paloma',
    tipo: 'actividad',
    descripcion: 'La costa de La Paloma tiene olas para distintos niveles. [completar: escuelas o alquiler recomendados]',
    imagen: F('surf'),
    orden: 3,
  },
];

// ── Extensiones (no están en DATA.md) ───────────────────────────────────────
export const extensiones: Extensiones = {
  secciones: {
    introduccion: { titulo: 'Descansar cerca del mar' },
    ubicacion: { titulo: 'En La Paloma, a pasos de Playa Anaconda' },
    alojamiento: {
      titulo: 'Opciones de alojamiento en La Paloma',
      bajada: 'Dos formas de vivir el mismo lugar: con tu carpa o con una que ya te espera armada.',
    },
    predio: {
      titulo: 'Recorré el predio',
      bajada: 'Mostrá u ocultá cada capa para ver cómo está distribuido el espacio.',
    },
    instalaciones: { titulo: 'Instalaciones' },
    experiencias: { titulo: 'Experiencias' },
    recomendaciones: {
      titulo: 'La Paloma: lo que te recomendamos',
      bajada: 'Lugares de la zona que nos gustan y que vale la pena conocer.',
    },
    'que-incluye': { titulo: 'Qué incluye tu estadía' },
    reservas: { titulo: 'Reservas' },
    'informacion-practica': { titulo: 'Información práctica' },
    faq: { titulo: 'Preguntas frecuentes' },
    contacto: { titulo: '¿Nos vemos en La Paloma?' },
  },
  experiencias: [
    {
      id: 'mar',
      titulo: 'Mar',
      descripcion: 'Playa Anaconda a pocos pasos: olas, caminatas por la orilla y atardeceres largos.',
      detalles: ['Surf (pack surf opcional)', 'Playa', 'Caminatas', 'Atardeceres'],
      foto: F('surf'),
    },
    {
      id: 'naturaleza',
      titulo: 'Naturaleza',
      descripcion: 'Vegetación nativa, aire libre y los sonidos del lugar marcando el ritmo del día.',
      detalles: ['Vegetación', 'Aire libre', 'Sonidos', 'Ritmo natural'],
      foto: F('carpaalfondo'),
    },
    {
      id: 'descanso',
      titulo: 'Descanso',
      descripcion: 'Una hamaca, un libro, la siesta que no tenés en la ciudad.',
      detalles: ['Leer', 'Dormir', 'Desconectar'],
      foto: F('espaciocomunfuera1'),
    },
  ],
  galeriaIntroduccion: [F('surf'), F('carpaalfondo'), F('espaciocomun'), F('espaciocomunfuera'), F('atardecer')],
  fotosInstalaciones: {
    cocina: [F('cocina2'), F('cocina')],
    ducha: [], // [completar: fotos de baños y duchas]
    descanso: [F('espaciocomun3'), F('espaciocomunfuera')],
  },
  altFotos: {
    [F('atardecer')]: 'Atardecer sobre Playa Anaconda, con el sol bajando entre nubes y la orilla mojada reflejando la luz',
    [F('carpaalfondo')]: 'Carpa bajo un árbol con una hamaca colgada, rodeada de vegetación nativa en el predio de Calaguala',
    [F('cocina')]: 'Cocina compartida de madera con anafe, pileta y una ventana que da a los árboles',
    [F('cocina2')]: 'Cocina compartida con mesada de madera, pava sobre el anafe y utensilios colgados',
    [F('espaciocomun')]: 'Espacio común techado con piso de arena, mesa de madera y una cortina blanca abierta hacia el jardín',
    [F('espaciocomun2')]: 'Banco y mesa de madera bajo el techo del espacio común, sobre piso de arena',
    [F('espaciocomun3')]: 'Galería techada con piso de arena, sillón y mesa, abierta hacia el jardín',
    [F('espaciocomunfuera')]: 'Mesas y sillas al aire libre bajo los árboles, con una sombrilla blanca y una hamaca al fondo',
    [F('espaciocomunfuera1')]: 'Mesa blanca con dos sillas bajo un árbol, junto a una hamaca paraguaya',
    [F('surf')]: 'Persona caminando hacia el mar con una tabla de surf sobre la cabeza, entre pastos altos',
  },
  // [completar: confirmar el plazo real con el equipo]
  tiempoRespuesta: 'Te respondemos dentro de las próximas 24 horas.',
  negocio: {
    nombre: 'Calaguala',
    localidad: 'La Paloma',
    departamento: 'Rocha',
    pais: 'Uruguay',
    codigoPais: 'UY',
  },
};
