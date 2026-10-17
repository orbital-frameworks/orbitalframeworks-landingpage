export type BlogPostSlug = 'software-a-medida-o-saas-como-decidir'

export type BlogSection = {
  heading: string
  content: string[]
}

export type DecisionMatrixRow = {
  question: string
  saasOption: string
  customOption: string
}

export type BlogPost = {
  slug: BlogPostSlug
  route: string
  canonical: string
  title: string
  metaTitle: string
  metaDescription: string
  eyebrow: string
  datePublished: string
  dateModified: string
  readingTime: string
  status: 'DRAFT_NO_PUBLICABLE' | 'PUBLISHED'
  statusLabel: string
  statusNotice: string
  prioritizedOwnerQuestion: string
  author: {
    name: string
    type: 'Organization'
    url: string
  }
  lead: string
  sections: BlogSection[]
  decisionMatrix: DecisionMatrixRow[]
  internalLinks: {
    anchor: string
    url: string
    label: string
  }[]
  cta: {
    headline: string
    description: string
    subject: string
    body: string
  }
}

export const blogPosts: Record<BlogPostSlug, BlogPost> = {
  'software-a-medida-o-saas-como-decidir': {
    slug: 'software-a-medida-o-saas-como-decidir',
    route: '/blog/software-a-medida-o-saas-como-decidir/',
    canonical: 'https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/',
    title: 'Software a medida o SaaS: cómo decidir según el proceso de tu empresa',
    metaTitle: 'Software a medida o SaaS: cómo decidir según el proceso de tu empresa | Orbital Insights',
    metaDescription: 'Criterios técnicos y operativos para evaluar cuándo adoptar un software SaaS comercial y cuándo construir software a medida para la operación de tu empresa.',
    eyebrow: 'Orbital Insights / Criterios técnicos de software',
    datePublished: '2026-10-17',
    dateModified: '2026-10-17',
    readingTime: '6 min de lectura técnica',
    status: 'PUBLISHED',
    statusLabel: '',
    statusNotice: '',
    prioritizedOwnerQuestion: '¿Qué decisión concreta del equipo de Orbital sobre adaptar un SaaS o desarrollar software propio podemos documentar, y qué evidencia autorizada respalda esa decisión?',
    author: {
      name: 'Orbital Frameworks',
      type: 'Organization',
      url: 'https://orbitalframeworks.qzz.io/sobre-orbital-frameworks/',
    },
    lead: 'La disyuntiva entre contratar una herramienta comercial en la nube (SaaS) o desarrollar software a medida no es una cuestión de dogma técnico ni de preferencia estética. Es una decisión de asignación de capital, riesgo operativo y soberanía sobre los datos del negocio.',
    sections: [
      {
        heading: '1. La disyuntiva habitual entre inmediatez y control',
        content: [
          'Directores generales y gerentes de operaciones a menudo enfrentan la urgencia de resolver fricciones operativas con rapidez. La oferta comercial de software como servicio (SaaS) promete despliegues inmediatos y costos de entrada aparentemente bajos.',
          'Sin embargo, conforme la empresa evoluciona, suelen presentarse discrepancias entre lo que el software comercial permite configurar y lo que el proceso real del negocio exige para sostener su ventaja operativa.',
          'Construir software propio no debe ser el primer impulso ante cualquier necesidad, pero recurrir a herramientas empaquetadas para procesos diferenciales introduce rigideces y costos recurrentes difíciles de revertir.',
        ],
      },
      {
        heading: '2. Cuándo adoptar un SaaS estándar es la mejor decisión',
        content: [
          'La honestidad técnica exige identificar con claridad cuándo NO construir. Si una herramienta comercial consolidada satisface los requisitos esenciales y se integra en el flujo de trabajo sin fricciones relevantes, suele ser más prudente evaluarla antes que iniciar un desarrollo propio.',
          'Procesos estandarizados como la contabilidad general bajo normativa local, el correo corporativo o la facturación electrónica estándar cuentan con soluciones SaaS maduras donde el desarrollo a medida rara vez aporta un retorno de inversión justificable.',
          'Invertir presupuesto de ingeniería en reconstruir herramientas genéricas es un error de asignación de recursos que resta foco al núcleo del negocio.',
        ],
      },
      {
        heading: '3. Cuándo el SaaS empieza a limitar la operación',
        content: [
          'El punto de fricción con el software comercial suele presentarse cuando la organización escala o cuando opera bajo procesos específicos no convencionales. En ese momento surgen tres limitaciones materiales:',
          '1. Costo por asiento creciente: Las tarifas por usuario en dólares escalan con rapidez cuando la plantilla operativa aumenta, penalizando la incorporación de personal operativo, supervisores o contratistas.',
          '2. Deformación de procesos internos: El equipo se ve forzado a adaptar sus flujos probados de trabajo a las limitaciones y campos rígidos del software comercial, generando cuellos de botella.',
          '3. Silos y dispersión de datos: La información crítica queda fragmentada en bases de datos de terceros, dificultando la consolidación de reportes, auditorías cruzadas y la toma de decisiones oportunas.',
        ],
      },
      {
        heading: '4. Cuándo conviene evaluar desarrollo de software a medida',
        content: [
          'El desarrollo a medida se justifica cuando el flujo operativo representa la ventaja competitiva de la empresa o cuando la escala de usuarios vuelve inviable el modelo de suscripción recurrente.',
          'Permite diseñar jerarquías de roles personalizadas, trazabilidad de eventos y una arquitectura ajustada a los procesos reales. La propiedad del código, la administración de los datos y los costos de infraestructura o servicios externos deben definirse contractualmente: desarrollar a medida no elimina todos los costos recurrentes.',
          'Como referencia pública del tipo de solución, el caso Checkio presenta flujos de registro de asistencia, marcaciones y gestión de personal. Es un ejemplo de alcance funcional, no una prueba de ahorro ni de resultados comerciales.',
        ],
      },
      {
        heading: '5. Matriz de decisión práctica para directores y gerentes de operaciones',
        content: [
          'Antes de contratar una suscripción o solicitar una cotización de desarrollo, conviene evaluar las siguientes cuatro preguntas de diagnóstico operativo:',
        ],
      },
      {
        heading: '6. Conclusiones y siguientes pasos',
        content: [
          'No existe una respuesta universal para todas las empresas. La recomendación de Orbital Frameworks es evaluar en detalle el proceso operativo antes de comprometer presupuestos o escribir la primera línea de código.',
          'Si tu organización identifica que un flujo clave de trabajo sufre por rigidez, costos crecientes por usuario o falta de integración, te invitamos a revisar nuestro enfoque técnico o plantear tu caso directamente a nuestro equipo.',
        ],
      },
    ],
    decisionMatrix: [
      {
        question: '¿El proceso representa una ventaja competitiva única de tu empresa?',
        saasOption: 'No; es un proceso estándar y común en cualquier industria (ej. correo, contabilidad general).',
        customOption: 'Sí; es el núcleo operativo que diferencia tu servicio o modelo de atención.',
      },
      {
        question: '¿Cómo escala el costo si la plantilla operativa se duplica en 12 meses?',
        saasOption: 'El costo por usuario se mantiene dentro de un margen predecible y asumible.',
        customOption: 'El costo total proyectado o las restricciones del plan no encajan con la operación; conviene comparar alternativas.',
      },
      {
        question: '¿La herramienta comercial exige deformar flujos internos de trabajo?',
        saasOption: 'No; el equipo se adapta de forma natural sin parches ni fricción.',
        customOption: 'Sí; obliga a usar hojas de cálculo externas o atajos manuales para suplir vacíos.',
      },
      {
        question: '¿Se requiere soberanía de datos, auditoría estricta y código propietario?',
        saasOption: 'La seguridad y los reportes básicos de la plataforma en la nube son suficientes.',
        customOption: 'Es indispensable contar con auditoría de cambios, trazabilidad y propiedad del sistema.',
      },
    ],
    internalLinks: [
      {
        anchor: 'Desarrollo de software a medida',
        url: '/servicios/desarrollo-software-medida/',
        label: 'Sistemas web y plataformas diseñadas para la operación específica de tu empresa.',
      },
      {
        anchor: 'Automatización de procesos operativos',
        url: '/servicios/automatizacion-procesos/',
        label: 'Integración de flujos de trabajo y canales estructurados con supervisión humana.',
      },
      {
        anchor: 'Caso de gestión de personal Checkio',
        url: '/casos/checkio/',
        label: 'Plataforma funcional para registro de asistencia, marcaciones y trazabilidad.',
      },
      {
        anchor: 'Caso de catálogo digital Wasy',
        url: '/casos/wasy/',
        label: 'Catálogo web y preparación de pedidos conectado a canales operativos.',
      },
    ],
    cta: {
      headline: '¿Tu empresa evalúa sistematizar un flujo operativo?',
      description: 'Conversemos sobre el problema operativo antes de decidir una arquitectura o contratar licencias.',
      subject: 'Consulta técnica sobre software a medida vs SaaS - Orbital Insights',
      body: 'Hola Orbital Frameworks,\n\nLeí su artículo sobre SaaS vs software a medida y quisiera evaluar una situación en mi empresa:\n\n1. Proceso operativo actual:\n2. Software o herramientas que usamos hoy:\n3. Punto de fricción o costo observado:\n4. Resultado que tendría valor alcanzar:\n',
    },
  },
}

export const blogPostSlugs = Object.keys(blogPosts) as BlogPostSlug[]

export function isBlogPostSlug(slug: string): slug is BlogPostSlug {
  return Object.prototype.hasOwnProperty.call(blogPosts, slug)
}
