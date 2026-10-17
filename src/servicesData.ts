export type ServiceSlug =
  | 'desarrollo-software-medida'
  | 'automatizacion-procesos'
  | 'landing-pages-b2b'

export type ServiceCardItem = {
  title: string
  text: string
}

export type ServiceProofCase = {
  slug: string
  title: string
  badge: string
  description: string
  url: string
}

export type ServicePageData = {
  slug: ServiceSlug
  route: string
  canonical: string
  serviceType: string
  title: string
  metaDescription: string
  eyebrow: string
  name: string
  heroHeadline: string
  heroSummary: string
  targetAudience: ServiceCardItem[]
  problemSolved: ServiceCardItem[]
  whenNotRecommended: ServiceCardItem[]
  differentiatingValue: ServiceCardItem[]
  deliverables: string[]
  proofCase: ServiceProofCase
  cta: {
    subject: string
    body: string
  }
}

export const servicesData: Record<ServiceSlug, ServicePageData> = {
  'desarrollo-software-medida': {
    slug: 'desarrollo-software-medida',
    route: '/servicios/desarrollo-software-medida/',
    canonical: 'https://orbitalframeworks.qzz.io/servicios/desarrollo-software-medida/',
    serviceType: 'Desarrollo de software a medida',
    title: 'Desarrollo de software a medida en Perú | Orbital Frameworks',
    metaDescription: 'Desarrollo de software a medida y sistemas de gestión para empresas en Perú. Procesos trazables, integraciones y soluciones adaptadas a la operación.',
    eyebrow: 'Servicio B2B / Sistemas y Plataformas',
    name: 'Desarrollo de software a medida',
    heroHeadline: 'Software a medida y sistemas de gestión para la operación real de tu empresa.',
    heroSummary: 'Construimos plataformas web, paneles administrativos y sistemas de gestión diseñados para los procesos específicos de tu negocio en Perú, con control operativo, arquitectura escalable y un modelo de costos a evaluar según cada solución.',
    targetAudience: [
      {
        title: 'Empresas medianas en crecimiento',
        text: 'Negocios cuyos procesos clave ya no encajan en software empaquetado estándar o requieren flujos propios de roles, aprobación y control operativo.',
      },
      {
        title: 'Operaciones dependientes de hojas de cálculo',
        text: 'Equipos que gestionan inventarios, personal, finanzas o servicios en Excel y sufren pérdidas de datos, falta de trazabilidad y desorganización.',
      },
      {
        title: 'Compañías que buscan independencia tecnológica',
        text: 'Organizaciones que necesitan ser dueñas de su plataforma y código fuente, evitando costos recurrentes en dólares por usuario o asiento.',
      },
    ],
    problemSolved: [
      {
        title: 'Desconexión y silos de datos',
        text: 'La información operativa está dispersa entre múltiples archivos, chats y correos, impidiendo reportes consolidados y toma de decisiones a tiempo.',
      },
      {
        title: 'Falta de trazabilidad y auditoría',
        text: 'Dificultad para saber quién modificó un registro, cuándo se aprobó una solicitud o dónde se detuvo un proceso operativo crítico.',
      },
      {
        title: 'Rigidez de plataformas enlatadas',
        text: 'Los sistemas estándar obligan a la empresa a deformar su proceso de trabajo para adaptarse al software, cobrando además tarifas crecientes por cada usuario que se suma.',
      },
    ],
    whenNotRecommended: [
      {
        title: 'Cuando un SaaS satisface los requisitos esenciales',
        text: 'Si una herramienta comercial estándar (como un CRM o ERP generalista) cubre tus requerimientos esenciales sin fricción operativa, recomendamos adoptarla antes de construir desarrollo a medida.',
      },
      {
        title: 'Cuando el presupuesto mensual es menor al costo de desarrollo',
        text: 'Un sistema a medida requiere inversión inicial de ingeniería y arquitectura; si el flujo aún está en fase exploratoria o sin volumen, un desarrollo propio no es rentable.',
      },
      {
        title: 'Cuando no existe un proceso claro para sistematizar',
        text: 'El software acelera y ordena procesos definidos; no puede solucionar la ausencia de reglas operativas internas previas.',
      },
    ],
    differentiatingValue: [
      {
        title: 'Arquitectura limpia y moderna',
        text: 'Frontend en React con TypeScript, APIs robustas en Node.js y bases de datos estructuradas con modelos de datos normalizados.',
      },
      {
        title: 'Diseño enfocado en la tarea operativa',
        text: 'Interfaces visuales donde cada botón, tabla y filtro responde a la carga real de trabajo diario de los operadores.',
      },
      {
        title: 'Entregables y dependencias explícitos',
        text: 'Documentación, pruebas y acuerdos claros sobre el código entregado, la operación y las dependencias necesarias.',
      },
    ],
    deliverables: [
      'Paneles administrativos y módulos de gestión con control de roles (RBAC)',
      'Flujos de registro, validación y auditoría de cambios en tiempo real',
      'Reportes e historial de movimientos estructurados',
      'Integraciones con bases de datos existentes, APIs o servicios externos',
      'Despliegue en infraestructura propia o nube configurada',
    ],
    proofCase: {
      slug: 'checkio',
      title: 'Checkio — Gestión de personal y asistencia',
      badge: 'Caso verificado',
      description: 'Plataforma funcional para registrar asistencia, geolocalización de marcaciones, historial de colaboradores y flujos administrativos de RRHH.',
      url: '/casos/checkio/',
    },
    cta: {
      subject: 'Consulta: Desarrollo de software a medida - Orbital Frameworks',
      body: 'Empresa u organización:\n\nProceso o problema que se busca sistematizar:\n\nSistemas o herramientas que se usan actualmente:\n\nNúmero estimado de usuarios u operadores:\n\nPlazo o prioridad esperada:\n',
    },
  },
  'automatizacion-procesos': {
    slug: 'automatizacion-procesos',
    route: '/servicios/automatizacion-procesos/',
    canonical: 'https://orbitalframeworks.qzz.io/servicios/automatizacion-procesos/',
    serviceType: 'Automatización de procesos',
    title: 'Automatización de procesos y WhatsApp para empresas | Orbital Frameworks',
    metaDescription: 'Automatización de procesos operativos y flujos de WhatsApp para empresas en Perú. Conecte pedidos, cotizaciones y atención con supervisión humana.',
    eyebrow: 'Servicio B2B / Automatización e Integración',
    name: 'Automatización de procesos y WhatsApp',
    heroHeadline: 'Automatiza flujos repetitivos de atención, pedidos y datos sin perder control humano.',
    heroSummary: 'Conectamos canales de mensajería (WhatsApp), formularios web y sistemas internos para procesar pedidos, cotizaciones y consultas repetitivas de forma estructurada, reduciendo tiempos de espera y carga operativa.',
    targetAudience: [
      {
        title: 'Empresas con alto volumen de consultas comerciales',
        text: 'Negocios en Perú que reciben decenas o cientos de mensajes diarios por WhatsApp y tardan horas en enviar cotizaciones o responder consultas repetitivas.',
      },
      {
        title: 'Operaciones con toma manual de pedidos',
        text: 'Equipos que transcriben pedidos a mano desde chats de WhatsApp hacia hojas de cálculo o sistemas de facturación.',
      },
      {
        title: 'Equipos de soporte y atención saturados',
        text: 'Áreas operativas que dedican la mayor parte de su tiempo a responder estados de pedidos, horarios o datos rutinarios en lugar de atender casos complejos.',
      },
    ],
    problemSolved: [
      {
        title: 'Pérdida de ventas por respuesta tardía',
        text: 'En mercados B2B y comerciales en Perú, una consulta que no recibe respuesta rápida se convierte en un cliente que cotiza con la competencia.',
      },
      {
        title: 'Errores humanos en la transcripción de datos',
        text: 'Copiar y pegar información entre WhatsApp, hojas de cálculo y sistemas contables genera faltantes, pedidos equivocados y reprocesos.',
      },
      {
        title: 'Falta de derivación estructurada',
        text: 'Consultas mezcladas sin filtro ni categorización que llegan directamente a ejecutivos clave que no deberían atender mensajes de rutina.',
      },
    ],
    whenNotRecommended: [
      {
        title: 'Cuando el volumen de consultas es bajo o esporádico',
        text: 'Si la empresa recibe pocas consultas a la semana, la atención humana directa es más cálida y suficiente sin necesidad de invertir en infraestructura automatizada.',
      },
      {
        title: 'Cuando se requiere juicio profesional o diagnóstico crítico',
        text: 'Interacciones médicas, legales o de asesoría altamente personalizada donde una respuesta automática puede generar riesgos operativos o de cumplimiento.',
      },
      {
        title: 'Para envío de mensajes masivos no solicitados (spam)',
        text: 'No construimos soluciones de spam masivo o scraping agresivo que violen las políticas de mensajería ni degraden la reputación de la empresa.',
      },
    ],
    differentiatingValue: [
      {
        title: 'Integración en el punto de contacto operativo',
        text: 'Conectamos catálogos, carritos y selectores web directamente con el chat de WhatsApp, entregando mensajes estructurados y comprensibles.',
      },
      {
        title: 'Supervisión y control humano configurables',
        text: 'El asistente organiza la información y categoriza la consulta, pero deja al operador humano la confirmación final y el cierre de la relación.',
      },
      {
        title: 'Cero cajas negras o fallos silenciosos',
        text: 'Flujos lógicos verificables, registros de trazabilidad y notificaciones inmediatas ante cualquier incidencia en la sincronización.',
      },
    ],
    deliverables: [
      'Conexión de catálogo o web con derivación de pedidos estructurados a WhatsApp',
      'Flujos automáticos de calificación inicial y recopilación de datos de cotización',
      'Integración con hojas de cálculo, webhooks y bases de datos internas',
      'Enrutamiento inteligente de consultas según área o tipo de requerimiento',
      'Monitoreo y documentación clara del flujo para el equipo operativo',
    ],
    proofCase: {
      slug: 'wasy',
      title: 'Wasy — Catálogo web con pedido continuado por WhatsApp',
      badge: 'Caso verificado',
      description: 'Catálogo web de productos con armado de carrito y derivación estructurada del pedido directamente a WhatsApp para atención comercial inmediata.',
      url: '/casos/wasy/',
    },
    cta: {
      subject: 'Consulta: Automatización de procesos - Orbital Frameworks',
      body: 'Empresa o negocio:\n\nFlujo o canal que se desea automatizar (WhatsApp, web, formularios):\n\nProblema operativo actual o cuello de botella:\n\nVolumen aproximado de consultas o pedidos al mes:\n\nPlazo esperado:\n',
    },
  },
  'landing-pages-b2b': {
    slug: 'landing-pages-b2b',
    route: '/servicios/landing-pages-b2b/',
    canonical: 'https://orbitalframeworks.qzz.io/servicios/landing-pages-b2b/',
    serviceType: 'Landing pages y presencia digital',
    title: 'Landing pages para empresas B2B en Perú | Orbital Frameworks',
    metaDescription: 'Landing pages comerciales de alta velocidad para empresas B2B e industriales en Perú. Explicación técnica de ofertas, SEO estructurado y cotizaciones directas.',
    eyebrow: 'Servicio B2B / Presencia Comercial y Conversión',
    name: 'Landing pages comerciales B2B',
    heroHeadline: 'Landing pages B2B de alto rendimiento que explican tu oferta y activan cotizaciones.',
    heroSummary: 'Diseñamos y desarrollamos páginas comerciales de carga ultra-rápida y tipografía autohospedada, estructuradas para compradores corporativos que necesitan evaluar especificaciones técnicas, capacidad y credibilidad antes de cotizar.',
    targetAudience: [
      {
        title: 'Empresas industriales, logísticas y comerciales B2B',
        text: 'Compañías que venden productos técnicos, insumos o servicios corporativos y necesitan presentar catálogos claros con especificaciones detalladas.',
      },
      {
        title: 'Organizaciones con sitios lentos o plantillas genéricas',
        text: 'Empresas cuyo sitio actual tarda más de 4 segundos en cargar en móviles o luce como un folleto estático que no genera confianza.',
      },
      {
        title: 'Empresas que invierten en campañas y prospección',
        text: 'Marcas que dirigen tráfico comercial o enlaces de LinkedIn y necesitan que el comprador encuentre de inmediato lo que busca y cómo cotizar.',
      },
    ],
    problemSolved: [
      {
        title: 'Sitios web pesados que pierden tráfico calificado',
        text: 'Plataformas saturadas de plugins de terceros y constructores visuales lentos que aumentan el rebote en conexiones móviles peruanas.',
      },
      {
        title: 'Falta de claridad en especificaciones técnicas',
        text: 'Compradores B2B necesitan medidas, capacidades, materiales y modelos; si esa información no es clara, descartan la propuesta y buscan otro proveedor.',
      },
      {
        title: 'Fricción en las llamadas a cotización',
        text: 'Formularios interminables o botones de contacto desconectados que complican iniciar una conversación comercial directa.',
      },
    ],
    whenNotRecommended: [
      {
        title: 'Proyectos de e-commerce transaccional B2C masivo',
        text: 'Si necesitas una tienda minorista con miles de SKUs de consumo masivo, pasarelas de pago de retail y cupones, un CMS especializado de e-commerce es más adecuado.',
      },
      {
        title: 'Sitios que requieren publicación diaria de noticias o blogs masivos',
        text: 'Si el equipo no técnico necesita un panel tipo WordPress para subir notas de prensa todos los días sin revisión de código.',
      },
      {
        title: 'Requerimientos basados en plantillas prehechas de bajo costo',
        text: 'Nuestras landings se programan a medida en React/TypeScript para maximizar velocidad, diseño y SEO; no trabajamos con plantillas prediseñadas infladas.',
      },
    ],
    differentiatingValue: [
      {
        title: 'Velocidad extrema y Core Web Vitals impecables',
        text: 'Prerenderizado estático (SSG), fuentes corporativas autohospedadas y compresión WebP responsive para reducir el peso y los tiempos de carga, sujetos a medición en producción.',
      },
      {
        title: 'Jerarquía comercial pensada para el decisor B2B',
        text: 'Estructura orientada a la toma de decisiones corporativa: especificaciones técnicas, casos reales y botones de cotización contextuales.',
      },
      {
        title: 'SEO técnico y datos estructurados verificables',
        text: 'Etiquetado semántico, Open Graph profesional, JSON-LD factual y compatibilidad con indexación de motores de búsqueda e interfaces de IA.',
      },
    ],
    deliverables: [
      'Landing page estática ultra-rápida desarrollada en React + Vite + TypeScript',
      'Catálogo estructurado de productos o servicios con especificaciones técnicas',
      'Integración directa con correo corporativo y enlaces contextuales a WhatsApp',
      'Optimización SEO on-page completa, canonicals, sitemap y JSON-LD',
      'Diseño responsive verificado en resoluciones de referencia de 320px a 1440px',
    ],
    proofCase: {
      slug: 'perulog-pallets',
      title: 'PeruLog Pallets — Presencia comercial B2B',
      badge: 'Caso verificado',
      description: 'Landing comercial B2B para fabricante logístico con catálogo técnico de pallets EAN, especificaciones de carga, servicios de alquiler y cotización directa.',
      url: '/casos/perulog-pallets/',
    },
    cta: {
      subject: 'Consulta: Landing page comercial B2B - Orbital Frameworks',
      body: 'Empresa o sector:\n\nProducto o servicio a presentar:\n\nObjetivo de la landing (cotizaciones, prospección comercial, catálogo):\n\nSitio web o material comercial actual (si existe):\n\nPlazo o fecha estimada:\n',
    },
  },
}

export const serviceSlugs: ServiceSlug[] = [
  'desarrollo-software-medida',
  'automatizacion-procesos',
  'landing-pages-b2b',
]

export function isServiceSlug(value: string): value is ServiceSlug {
  return serviceSlugs.includes(value as ServiceSlug)
}
