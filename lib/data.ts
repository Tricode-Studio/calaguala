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
    imagenFondo: F('portada'),
  },
  introduccion: {
    // Copy provisto por el cliente. [completar: el brief lo trae cortado con "..."]
    texto:
      '<p>En Calaguala creamos un espacio para descansar, conectar con el mar y la vida natural de La Paloma.</p>',
    imagenApoyo: F('descansarcercadelmar'),
  },
  ubicacion: {
    direccion: 'La Paloma, Rocha, Uruguay',
    // Embed sin API key. [completar: reemplazar por el pin exacto del predio]
    mapaEmbedUrl:
      'https://www.google.com/maps?q=Playa+Anaconda,+La+Paloma,+Rocha,+Uruguay&z=15&output=embed',
    mapaUrl: 'https://maps.app.goo.gl/SAz42XAB879cCEqL9',
    imagenDrone: F('descansarcercadelmar2'),
  },
  instalaciones: {
    items: [
      {
        titulo: 'Cocina compartida',
        descripcion:
          'Totalmente equipada, con heladera y anafe de uso común. Un lugar para preparar algo rico después de la playa.',
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
      '<p>Contanos cuándo querés venir y cómo te gustaría quedarte. Revisamos cada solicitud y te respondemos para confirmar fechas y detalles.</p>',
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
    ogImage: F('portada'),
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
      '<p>Una parcela entre árboles y vegetación nativa. Para quienes disfrutan acampar a su manera y despertarse con el sonido del mar.</p>',
    capacidad: 2, // [completar: personas por parcela]
    etiquetaCapacidad: 'Tarifa por persona',
    caracteristicas: [
      'Parcela entre vegetación nativa',
      'A pocos pasos de Playa Anaconda',
    ],
    incluye: ['Acceso a espacios comunes', 'Cocina compartida', 'Baños', 'Duchas con agua caliente'],
    precio: null,
    precioUnidad: 'por noche',
    fotos: [F('espacioparacarpa'), F('naturaleza')],
    orden: 1,
  },
  {
    id: 'aloj-glamping-solo',
    slug: 'glamping-1-persona',
    nombre: 'Glamping 1 persona',
    tipo: 'glamping-solo',
    descripcion:
      '<p>Una carpa ya armada, lista para llegar y descansar.</p>',
    capacidad: 1,
    caracteristicas: ['Carpa armada y lista al llegar', 'Colchón de 1 plaza, almohada y frazada'],
    incluye: ['Alojamiento en carpa', 'Acceso a espacios comunes', 'Cocina compartida', 'Baños', 'Duchas con agua caliente'],
    precio: null,
    precioUnidad: 'por noche',
    fotos: [F('glampingpara1'), F('glampingpara1-2')],
    orden: 2,
  },
  {
    id: 'aloj-glamping-doble',
    slug: 'glamping-2-personas',
    nombre: 'Glamping 2 personas',
    tipo: 'glamping-doble',
    descripcion:
      '<p>Glamping para dos personas. La carpa te espera armada; ustedes solo tienen que llegar, bajar el ritmo y contemplar el mar.</p>',
    capacidad: 2,
    caracteristicas: ['Carpa armada y lista al llegar', 'Colchón de 2 plazas, almohadas y frazada'],
    incluye: ['Alojamiento en carpa', 'Acceso a espacios comunes', 'Cocina compartida', 'Baños', 'Duchas con agua caliente'],
    precio: null,
    precioUnidad: 'por noche',
    fotos: [F('glampingpara2acacia'), F('glampingpara2butia'), F('glampingpara2pimientorosa')],
    variantes: [
      { nombre: 'Acacia', foto: F('glampingpara2acacia') },
      { nombre: 'Butiá', foto: F('glampingpara2butia') },
      { nombre: 'Pimiento Rosa', foto: F('glampingpara2pimientorosa') },
    ],
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
    '<p>Estamos a pocos pasos de Playa Anaconda, en La Paloma. En 3 minutos caminando llegás a Zanja Honda.</p>'),
  faq(2, 'electricidad', '¿Hay electricidad en las carpas?',
    '<p>Las carpas no cuentan con electricidad. Hay un sector específico para cargar celulares y demás dispositivos electrónicos.</p>'),
  faq(3, 'cocina-compartida', '¿Cómo es la cocina compartida?',
    '<p>Es una cocina equipada totalmente, con implementos de cocina variados. Cuenta con heladera y anafes de uso común para todos los huéspedes.</p>'),
  faq(4, 'agua-caliente', '¿Hay agua caliente?',
    '<p>Sí, contamos con agua caliente en la ducha.</p>'),
  faq(5, 'mascotas', '¿Puedo ir con mi mascota?',
    '<p>Contamos con algunos cupos para mascotas, pero evaluamos el caso antes, según disponibilidad y comportamiento del animal.</p>'),
  faq(6, 'sin-auto', '¿Cómo llego sin auto?',
    '<p>Podemos coordinar tu llegada con un taxi o remise.</p>'),
  faq(7, 'estacionamiento', '¿Hay estacionamiento?',
    '<p>Sí, contamos con estacionamiento exterior abierto. No cuenta con sombra.</p>'),
  faq(8, 'como-funciona-reserva', '¿Cómo funciona la reserva?',
    '<p>Elegís fechas, cantidad de personas y tipo de alojamiento, y nos mandás una solicitud con tus datos. No es una reserva confirmada todavía: la revisamos manualmente y nos comunicamos para confirmar disponibilidad. Luego de esto solicitamos la seña del 20% de la estadía para que la reserva quede efectuada.</p>'),
  faq(9, 'si-llueve', '¿Qué pasa si llueve?',
    '<p>Los espacios comunes están techados, así que siempre hay un lugar a resguardo para cocinar, leer o tomar unos mates.</p>'),
];

// ── Colección: recomendaciones-la-paloma (MARKETING) ────────────────────────
// Ejemplos de forma. [completar: las recomendaciones reales las carga el equipo]
// Lista de lugares provista por el cliente.
// [completar: las descripciones y fotos las carga el equipo]
export const recomendaciones: Recomendacion[] = [
  {
    id: 'rec-playa-anaconda',
    slug: 'playa-anaconda',
    nombre: 'Playa Anaconda',
    tipo: 'playa',
    descripcion: 'La playa que tenemos a pocos pasos. Buena para caminar la orilla temprano y quedarse al atardecer.',
    imagen: F('playaanaconda3'),
    imagenes: [F('playaanaconda3'), F('playaanaconda1'), F('playanaconda')],
    orden: 1,
  },
  {
    id: 'rec-playa-la-balconada',
    slug: 'playa-la-balconada',
    nombre: 'Playa La Balconada',
    tipo: 'playa',
    descripcion: '[completar: recomendación del equipo]',
    imagen: F('playabalconada'),
    imagenes: [F('playabalconada'), F('balconada')],
    orden: 2,
  },
  {
    id: 'rec-playa-los-botes',
    slug: 'playa-los-botes',
    nombre: 'Playa Los Botes',
    tipo: 'playa',
    descripcion: '[completar: recomendación del equipo]',
    imagen: F('playalosbotes'),
    orden: 3,
  },
  {
    id: 'rec-playa-el-cabito',
    slug: 'playa-el-cabito',
    nombre: 'Playa El Cabito',
    tipo: 'playa',
    descripcion: '[completar: recomendación del equipo]',
    imagen: '',
    orden: 4,
  },
  {
    id: 'rec-playa-la-serena',
    slug: 'playa-la-serena',
    nombre: 'Playa La Serena',
    tipo: 'playa',
    descripcion: '[completar: recomendación del equipo]',
    imagen: F('playalaserena2'),
    imagenes: [F('playalaserena2'), F('playaserena')],
    orden: 5,
  },
  {
    id: 'rec-la-laguna',
    slug: 'la-laguna',
    nombre: 'La Laguna',
    tipo: 'playa',
    descripcion: '[completar: recomendación del equipo]',
    imagen: '',
    orden: 6,
  },
  {
    id: 'rec-bahia-chica',
    slug: 'bahia-chica',
    nombre: 'Bahía Chica',
    tipo: 'playa',
    descripcion: '[completar: recomendación del equipo]',
    imagen: '',
    orden: 7,
  },
  {
    id: 'rec-bahia-grande',
    slug: 'bahia-grande',
    nombre: 'Bahía Grande',
    tipo: 'playa',
    descripcion: '[completar: recomendación del equipo]',
    imagen: '',
    orden: 8,
  },
  {
    id: 'rec-faro',
    slug: 'faro-cabo-santa-maria',
    nombre: 'Faro del Cabo Santa María',
    tipo: 'actividad',
    descripcion: '[completar: recomendación del equipo]',
    imagen: F('farocabosantamaria'),
    orden: 9,
  },
  {
    id: 'rec-skatepark',
    slug: 'skatepark',
    nombre: 'Skatepark',
    tipo: 'actividad',
    descripcion: '[completar: recomendación del equipo]',
    imagen: F('skatepark'),
    orden: 10,
  },
  {
    id: 'rec-puerto',
    slug: 'puerto',
    nombre: 'Puerto',
    tipo: 'actividad',
    descripcion: '[completar: recomendación del equipo]',
    imagen: '',
    orden: 11,
  },
];


// ── Extensiones (no están en DATA.md) ───────────────────────────────────────
export const extensiones: Extensiones = {
  secciones: {
    introduccion: { titulo: 'Descansar cerca del mar' },
    ubicacion: { titulo: 'En La Paloma, Playa Anaconda' },
    alojamiento: {
      titulo: 'Opciones de alojamiento',
      bajada: 'Dos formas de vivir el mismo lugar: con tu propia carpa o con una que ya te espera armada.',
    },
    predio: {
      titulo: 'Recorré el predio',
      bajada: 'Mostrá u ocultá cada capa para ver cómo está distribuido el espacio.',
    },
    instalaciones: { titulo: 'Espacios' },
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
      titulo: 'Conexión con el mar',
      descripcion: 'Playa Anaconda a pocos pasos: olas, caminatas por la orilla y atardeceres que caen en el mar.',
      detalles: ['Playa', 'Caminatas', 'Atardeceres'],
      fotos: [F('enmar2'), F('enmar3'), F('enmar4'), F('enmar5'), F('enmar')],
    },
    {
      id: 'surf',
      titulo: 'Clases de surf',
      descripcion: 'Para todos los niveles, con la escuela de la zona y a pasos del predio.',
      detalles: ['Todos los niveles', 'Tabla incluida', 'Playa Anaconda'],
      fotos: [F('surf3'), F('surf1')],
    },
    {
      id: 'naturaleza',
      titulo: 'Naturaleza',
      descripcion: 'Vegetación nativa, aire libre y los sonidos del lugar marcando el ritmo del día.',
      detalles: ['Vegetación', 'Aire libre', 'Sonidos', 'Ritmo natural'],
      fotos: [F('naturaleza'), F('descansar'), F('descansar2')],
    },
    {
      id: 'descanso',
      titulo: 'Descanso',
      descripcion: 'Una hamaca, un libro, dormir con el sonido del mar.',
      detalles: ['Leer', 'Dormir', 'Desconectar'],
      fotos: [F('endescansar1'), F('endescansar')],
    },
  ],
  galeriaIntroduccion: [F('descansar2'), F('enmar2'), F('endescansar1'), F('espaciocomun4'), F('surf3'), F('enmar3'), F('espaciocomun3'), F('enmar4')],
  fotosInstalaciones: {
    cocina: [F('cocina'), F('cocina3')],
    ducha: [F('ducha'), F('bano')],
    descanso: [F('espaciocomun5'), F('espaciocomun6'), F('espaciocomun7'), F('endescansar')],
  },
  altFotos: {
    [F('portada')]: 'Carpa sobre un deck de madera bajo un toldo, con una hamaca paraguaya colgada entre los árboles y el sol del atardecer filtrándose entre la vegetación',
    [F('descansarcercadelmar')]: 'Carpa bajo un árbol con una hamaca colgada, rodeada de vegetación nativa en el predio de Calaguala',
    [F('fondodescansarcercadelmar')]: 'Playa abierta de arena con el mar a la izquierda y el faro de La Paloma recortado a lo lejos',
    [F('espacioparacarpa')]: 'Parcela para carpa entre árboles, con una carpa armada a la sombra y una hamaca colgada del tronco',
    [F('glampingpara1')]: 'Carpa iglú gris y naranja armada bajo un toldo de tela, con una hamaca al costado',
    [F('glampingpara1-2')]: 'Interior de la carpa individual con alfombra, plantas y la hamaca colgada en la entrada',
    [F('glampingpara2acacia')]: 'Carpa doble sobre un deck de madera con la cama tendida adentro y plantas alrededor',
    [F('glampingpara2butia')]: 'Carpa doble abierta sobre un deck, con alfombra tejida y mesitas de madera a los costados',
    [F('glampingpara2pimientorosa')]: 'Carpa doble al pie de un árbol grande, sobre deck de madera y rodeada de vegetación',
    [F('cocina')]: 'Cocina compartida de madera con mesada larga, ventanas al jardín y plantas en los estantes',
    [F('cocina3')]: 'Frente de la cocina compartida, con ventana pasaplatos y mesadas de madera bajo techo',
    [F('bano')]: 'Baño con inodoro y lavatorio de madera con bacha de vidrio',
    [F('ducha')]: 'Ducha con mampara y una toalla colgada junto a la puerta de madera',
    [F('espaciocomun4')]: 'Comedor techado con mesa y bancos de madera, cortina blanca abierta hacia el jardín',
    [F('espaciocomun5')]: 'Galería techada sobre arena, con girasoles en primer plano y mesas al fondo',
    [F('espaciocomun6')]: 'Construcción blanca del espacio común con una mesa y sillas afuera, sobre el pasto',
    [F('espaciocomun7')]: 'Sendero de arena entre las parcelas, cubierto por toldos de tela tensados',
    [F('enmar2')]: 'El mar de Playa Anaconda con olas rompiendo y el cielo despejado',
    [F('enmar4')]: 'Sol grande bajando sobre la orilla al atardecer, con el reflejo sobre la arena mojada',
    [F('endescansar1')]: 'Persona leyendo recostada en una hamaca colgada entre los árboles del predio',
    [F('naturaleza')]: 'Vegetación nativa del predio con un arcoíris asomando sobre los árboles',
    [F('descansar2')]: 'Pasarela de madera cruzando las dunas hacia la playa',
    [F('surf3')]: 'Surfista tomando una ola en la costa de La Paloma',
    [F('playaanaconda3')]: 'Atardecer sobre Playa Anaconda, con el sol bajando y la orilla mojada reflejando la luz',
    [F('playabalconada')]: 'Playa La Balconada con la costa curvándose y el faro de La Paloma al fondo',
    [F('playalosbotes')]: 'Botes varados en la arena de Playa Los Botes al atardecer',
    [F('playalaserena2')]: 'Pasarela de madera entre las dunas bajando a Playa La Serena',
    [F('skatepark')]: 'Skatepark de La Paloma pintado con grafitis, con las grúas del puerto detrás',
    [F('farocabosantamaria')]: 'Faro del Cabo Santa María, blanco y negro, recortado contra el cielo despejado',
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
