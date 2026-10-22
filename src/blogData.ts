export type BlogPostSlug =
  | 'software-a-medida-o-saas-como-decidir'
  | 'automatizacion-procesos-vs-excel-riesgo-operativo'
  | 'landing-page-b2b-tecnica-vs-web-corporativa'
  | 'integracion-pedidos-whatsapp-almacen-operaciones'


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
  'integracion-pedidos-whatsapp-almacen-operaciones': {
    slug: 'integracion-pedidos-whatsapp-almacen-operaciones',
    route: '/blog/integracion-pedidos-whatsapp-almacen-operaciones/',
    canonical: 'https://orbitalframeworks.qzz.io/blog/integracion-pedidos-whatsapp-almacen-operaciones/',
    title: 'Del pedido por WhatsApp al almacén: cómo conectar ventas, inventario y operaciones sin duplicar datos',
    metaTitle: 'Del pedido por WhatsApp al almacén | Orbital Insights',
    metaDescription: 'Cómo transformar pedidos recibidos por WhatsApp en un flujo estructurado de ventas, validación, preparación y despacho sin duplicar datos.',
    eyebrow: 'Orbital Insights · Automatización de procesos',
    datePublished: '2026-10-27',
    dateModified: '2026-10-27',
    readingTime: '8 min de lectura',
    status: 'DRAFT_NO_PUBLICABLE',
    statusLabel: 'Programado para el 27 de octubre de 2026',
    statusNotice: 'Artículo y recursos aprobados. No visible ni publicable antes de su fecha de lanzamiento.',
    prioritizedOwnerQuestion: '¿Está validado el recorrido de pedido y la fuente pública del ejemplo Wasy?',
    author: {name: 'Orbital Frameworks',type:'Organization',url:'https://orbitalframeworks.qzz.io/sobre-orbital-frameworks/'},
    lead: 'Un cliente escribe por WhatsApp para confirmar una compra. Alguien anota los productos, consulta si hay stock, reenvía un mensaje al almacén y vuelve al chat para aclarar la dirección. Más tarde, otra persona pregunta si el pedido está listo. Cada paso parece pequeño, pero el trabajo de coordinar todos puede convertirse en un problema.',
    sections: [],
    decisionMatrix: [],
    internalLinks: [
      {anchor:'Automatización de procesos',url:'/servicios/automatizacion-procesos/',label:'Evaluar un flujo comercial y operativo antes de decidir el grado de automatización.'},
      {anchor:'Caso público Wasy',url:'/casos/wasy/',label:'Catálogo web con carrito y continuación del pedido por WhatsApp, sin afirmar integración de almacén.'},
    ],
    cta: {
      headline: '¿Tu empresa recibe pedidos por WhatsApp, pero los coordina manualmente?',
      description: 'Revisemos dónde pasa un pedido de ventas a operaciones, qué información se pierde y qué nivel de solución conviene evaluar.',
      subject: 'Consulta sobre integración de pedidos y operaciones',
      body: 'Hola Orbital Frameworks,\n\nLeí su artículo sobre pedidos por WhatsApp y quisiera evaluar cómo se gestionan en mi empresa.\n\nCómo recibimos hoy los pedidos:\nQué equipo interviene después:\nDónde aparece retrabajo:\nQué resultado operativo buscamos mejorar:\n',
    },
  },
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
  'automatizacion-procesos-vs-excel-riesgo-operativo': {
    slug: 'automatizacion-procesos-vs-excel-riesgo-operativo',
    route: '/blog/automatizacion-procesos-vs-excel-riesgo-operativo/',
    canonical: 'https://orbitalframeworks.qzz.io/blog/automatizacion-procesos-vs-excel-riesgo-operativo/',
    title: 'Automatización de procesos vs hojas de cálculo: cuándo Excel se convierte en un riesgo operativo',
    metaTitle: 'Automatización vs Excel: cuándo las hojas de cálculo son un riesgo | Orbital Insights',
    metaDescription: 'Criterios operativos y técnicos para evaluar cuándo una hoja de cálculo pone en riesgo la operación de tu empresa y qué alternativas graduales existen.',
    eyebrow: 'Orbital Insights / Operaciones y Automatización',
    datePublished: '2026-10-20',
    dateModified: '2026-10-20',
    readingTime: '7 min de lectura técnica',
    status: 'PUBLISHED',
    statusLabel: '',
    statusNotice: '',
    prioritizedOwnerQuestion: '¿Qué caso específico de un cliente o proyecto interno requirió migrar un flujo manual basado en hojas de cálculo hacia una base de datos relacional y qué validaciones evitaron errores humanos?',
    author: {
      name: 'Orbital Frameworks',
      type: 'Organization',
      url: 'https://orbitalframeworks.qzz.io/sobre-orbital-frameworks/',
    },
    lead: 'Las hojas de cálculo son herramientas flexibles para organizar datos y responder a necesidades operativas sin desarrollar un sistema desde cero. Sin embargo, cuando una organización depende de múltiples copias, consolidaciones manuales o controles insuficientes para procesos críticos, pueden aparecer errores, desfases y trabajo adicional.',
    sections: [
      {
        heading: '1. Síntomas concretos de que la hoja de cálculo ha llegado a su límite',
        content: [
          'El deterioro de un proceso basado en hojas de cálculo no ocurre de golpe; es una degradación gradual marcada por fricciones que el equipo termina normalizando.',
          'Consolidación manual de datos: múltiples personas o sucursales llenan libros individuales que un coordinador debe unificar al final del día mediante copiar y pegar, asumiendo el riesgo de omitir registros o duplicar datos.',
          'Múltiples versiones en circulación: copias locales y archivos adjuntos por correo generan discrepancias constantes sobre cuál contiene los datos válidos para tomar decisiones.',
          'Fórmulas rotas por digitación manual: una celda sobreescrita por descuido o una fila eliminada distorsiona los totales sin generar alertas visibles, comprometiendo decisiones de compras o despacho.',
          'Permisos y privacidad insuficientes para ciertos flujos: aunque Excel y las plataformas colaborativas ofrecen protecciones y controles de acceso, puede resultar difícil separar qué datos ve y edita cada rol dentro de un mismo proceso.',
          'Conflictos de edición y concurrencia: si se intercambian copias locales o adjuntos, varios operadores pueden terminar trabajando sobre versiones distintas. En plataformas con coautoría bien configurada, este problema puede mitigarse.',
          'Trazabilidad insuficiente para decisiones críticas: el historial de versiones y los cambios registrados son útiles, pero pueden no capturar la justificación y la secuencia exacta que exige una auditoría por operación.',
          'Integraciones manuales: cuando el equipo exporta, copia y pega datos entre hojas, inventarios y facturación, aparecen oportunidades de automatizar. Power Query y conectores existentes pueden resolver algunos casos sin desarrollar una aplicación.',
        ],
      },
      {
        heading: '2. Cuándo Excel SÍ es la herramienta adecuada',
        content: [
          'La honestidad técnica exige reconocer las fortalezas indiscutibles de las hojas de cálculo. Excel, Google Sheets y herramientas afines son idóneas para análisis exploratorios, modelado financiero ad-hoc y simulaciones de escenarios para uso exclusivo de la dirección.',
          'También pueden ser una alternativa razonable para procesos individuales de bajo volumen a cargo de un responsable, cuando el nivel de control requerido es compatible con la configuración disponible.',
          'Las versiones modernas de Excel en Microsoft 365 incorporan coautoría en la nube, historial de versiones y motores robustos como Power Query. El problema operativo no reside en las funciones de la herramienta, sino en forzar un modelo de archivo plano como si fuera un motor transaccional multiusuario.',
        ],
      },
      {
        heading: '3. La escala gradual de soluciones: de la optimización a la sistematización',
        content: [
          'Sistematizar un flujo no es una decisión binaria entre resignarse a Excel o implementar un ERP costoso. Existen tres niveles progresivos de madurez:',
          'Nivel 1: Estandarización en la hoja de cálculo. Bloquear rangos de fórmulas, aplicar validación de datos estricta en entradas, usar Power Query para vincular fuentes y alojar los libros en almacenamiento corporativo seguro.',
          'Nivel 2: Automatización de flujos e integraciones. Conectar formularios digitales estructurados que eviten manipular tablas directamente, y configurar scripts o webhooks para sincronizar registros y disparar alertas de forma desasistida.',
          'Nivel 3: Base de datos relacional y sistema web a medida. Implementar un modelo relacional con transacciones ACID, perfiles de usuario con permisos por rol, auditoría automática de cada cambio e integración por API con otros sistemas de la empresa.',
        ],
      },
      {
        heading: '4. Matriz de decisión operativa para gerentes',
        content: [
          'Antes de invertir en software o continuar acumulando hojas de cálculo, conviene diagnosticar el flujo mediante cinco preguntas operativas clave:',
        ],
      },
      {
        heading: '5. Checklist de autodiagnóstico: ¿Tu hoja de cálculo es un riesgo operativo?',
        content: [
          'Este listado sirve para abrir un diagnóstico, no para asignar automáticamente un nivel de riesgo ni calcular un retorno de inversión:',
          '• El equipo dedica tiempo recurrente a consolidar libros o cruzar datos manualmente entre archivos.',
          '• Se han presentado discrepancias de inventario, precio o saldo asociadas a errores de registro.',
          '• Hay más personas editando fórmulas o registros críticos de las que permite supervisar el proceso con confianza.',
          '• Existen dudas periódicas sobre cuál es la versión vigente de un archivo de control operativo.',
          '• La información de un cliente o pedido debe ingresarse manualmente en más de un lugar.',
          '• Si la persona que creó la plantilla no está presente, nadie más sabe corregir una fórmula rota.',
          '• La configuración actual de permisos no separa adecuadamente los datos sensibles de quienes solo necesitan capturar registros.',
        ],
      },
      {
        heading: '6. Casos de referencia y límites honestos de sistematización',
        content: [
          'Sistematizar no exige crear plataformas desproporcionadas. Conviene comenzar por el proceso concreto: sus responsables, errores observados, reglas de validación y fuentes de datos.',
          'Una alternativa gradual es conservar Excel para análisis y reportes, y usar formularios o flujos automatizados para la captura de datos operativos. Si los requisitos lo justifican, puede evaluarse después un sistema con base de datos, roles e integraciones.',
          'Esta guía presenta criterios de decisión generales, no una historia documentada de migración desde hojas de cálculo ni un resultado comercial atribuido a clientes de Orbital Frameworks.',
          'El objetivo de la sistematización no es erradicar las hojas de cálculo, sino devolverlas a su función natural de análisis y prototipado, protegiendo los flujos transaccionales críticos en sistemas robustos.',
        ],
      },
    ],
    decisionMatrix: [
      {
        question: '¿Cuántas personas interactúan simultáneamente con el registro?',
        saasOption: 'Una o dos personas con roles separados en el tiempo (mantener/optimizar hoja de cálculo).',
        customOption: 'Múltiples operadores, turnos rotativos o sucursales concurrentes (automatizar o migrar a sistema).',
      },
      {
        question: '¿Cuál es el impacto operativo de un error en una fórmula o celda?',
        saasOption: 'Menor; se detecta y corrige en la misma revisión interna sin daño a terceros.',
        customOption: 'Crítico; genera compras erróneas, desabastecimiento o pérdidas financieras directas.',
      },
      {
        question: '¿Se requiere trazabilidad histórica y auditoría de cambios por usuario?',
        saasOption: 'El historial general de versiones del archivo en la nube es suficiente.',
        customOption: 'Indispensable conocer con precisión quién modificó qué dato, cuándo y bajo qué motivo.',
      },
      {
        question: '¿El flujo exige permisos de acceso diferenciados según el cargo?',
        saasOption: 'Todos los colaboradores involucrados pueden ver y editar la totalidad de los datos.',
        customOption: 'Ciertos roles solo deben ingresar datos sin ver costos, márgenes ni reportes globales.',
      },
      {
        question: '¿El proceso necesita comunicarse en tiempo real con otros sistemas?',
        saasOption: 'Exportar o importar archivos CSV manualmente de forma periódica es viable.',
        customOption: 'Requiere integración inmediata por API con almacén, facturación electrónica o canales de venta.',
      },
    ],
    internalLinks: [
      {
        anchor: 'Automatización de procesos operativos',
        url: '/servicios/automatizacion-procesos/',
        label: 'Integración de flujos de trabajo, eliminación de tareas manuales y control asistido.',
      },
      {
        anchor: 'Desarrollo de software a medida',
        url: '/servicios/desarrollo-software-medida/',
        label: 'Sistemas web y bases de datos transaccionales diseñadas para tu modelo operativo.',
      },
      {
        anchor: 'Caso de gestión de personal Checkio',
        url: '/casos/checkio/',
        label: 'Referencia funcional de plataforma web para registro de asistencia y trazabilidad.',
      },
      {
        anchor: 'Caso de catálogo digital Wasy',
        url: '/casos/wasy/',
        label: 'Estructuración digital de catálogo y pedidos comerciales conectados a canales de atención.',
      },
    ],
    cta: {
      headline: '¿Tu equipo pierde tiempo valioso consolidando hojas de cálculo operativas?',
      description: 'Evaluemos si tu proceso actual puede optimizarse con flujos automatizados o requiere un sistema web a medida antes de comprometer horas de desarrollo.',
      subject: 'Consulta técnica sobre automatización de procesos vs Excel - Orbital Insights',
      body: 'Hola Orbital Frameworks,\n\nLeí su artículo sobre automatización de procesos vs hojas de cálculo y quisiera evaluar un caso en mi empresa:\n\n1. Proceso operativo que hoy gestionamos en Excel:\n2. Número de personas que interactúan con el archivo:\n3. Principal problema o fricción observada (desfases, versiones, errores):\n4. Resultado que nos gustaría alcanzar:\n',
    },
  },
  'landing-page-b2b-tecnica-vs-web-corporativa': {
    slug: 'landing-page-b2b-tecnica-vs-web-corporativa',
    route: '/blog/landing-page-b2b-tecnica-vs-web-corporativa/',
    canonical: 'https://orbitalframeworks.qzz.io/blog/landing-page-b2b-tecnica-vs-web-corporativa/',
    title: 'Landing page B2B o web corporativa: cuál necesita realmente tu empresa',
    metaTitle: 'Landing page B2B vs web corporativa: cómo elegir | Orbital Insights',
    metaDescription: 'Cuándo conviene una landing enfocada en captar consultas B2B y cuándo necesitas un sitio corporativo completo. Criterios de decisión sin promesas de conversión.',
    eyebrow: 'Orbital Insights / Diseño web y conversión B2B',
    datePublished: '2026-10-22',
    dateModified: '2026-10-22',
    readingTime: '7 min de lectura',
    status: 'PUBLISHED',
    statusLabel: '',
    statusNotice: '',
    prioritizedOwnerQuestion: '¿Qué ejemplo verificable de una web B2B de Orbital podemos mostrar sin atribuirle tasas de conversión, clientes o resultados no medidos?',
    author: { name: 'Orbital Frameworks', type: 'Organization', url: 'https://orbitalframeworks.qzz.io/sobre-orbital-frameworks/' },
    lead: 'Una empresa que vende servicios a otras empresas no siempre necesita empezar por una web de muchas secciones. Tampoco debería reducir toda su presencia digital a un formulario. La decisión depende de la oferta, del tráfico, de la información que el comprador necesita y de cómo avanza una oportunidad comercial.',
    sections: [
      {
        heading: '1. Dos formatos que resuelven problemas distintos',
        content: [
          'Una landing page B2B se centra en una oferta, un tipo de visitante y una acción principal: solicitar una evaluación, agendar una conversación o pedir una propuesta. Reduce los caminos secundarios, pero no debe ocultar información que un comprador necesita para confiar.',
          'Una web corporativa organiza múltiples servicios, información institucional, casos públicos, equipo, preguntas frecuentes y rutas de contacto. Es especialmente útil cuando distintos decisores necesitan explorar la empresa desde perspectivas diferentes.',
          'El error no es tener demasiadas páginas o demasiado pocas. Es construir una experiencia que no responda a la intención de quien llegó.',
        ],
      },
      {
        heading: '2. Cuándo empezar con una landing enfocada',
        content: [
          'Si una campaña dirige a un público definido hacia una solución concreta —por ejemplo, cotizar un portal para distribuidores—, puede convenir una página que mantenga el contexto entre el anuncio, el problema y el siguiente paso.',
          'La página debe explicar qué resuelve el servicio, para quién aplica, cómo se inicia el trabajo y qué información conviene aportar. Un CTA claro puede convivir con evidencia, limitaciones y detalles técnicos relevantes.',
          'La landing no garantiza más conversiones: su desempeño depende de la calidad del tráfico, la oferta, la velocidad, los mensajes y el seguimiento comercial.',
        ],
      },
      {
        heading: '3. Cuándo una web corporativa completa aporta más valor',
        content: [
          'Cuando la empresa ofrece varios servicios, participa en procesos de evaluación con múltiples personas o necesita mostrar experiencia de forma detallada, un sitio con arquitectura de información más amplia ayuda a investigar sin depender de una conversación inmediata.',
          'Un responsable técnico puede necesitar conocer capacidades e integraciones, mientras que un gerente comercial busca ejemplos de aplicaciones y pasos de contratación. Un menú útil permite atender ambas necesidades.',
          'En estos casos conviene conectar cada servicio con una página de entrada clara. Tener web corporativa no impide utilizar landings específicas para campañas.',
        ],
      },
      {
        heading: '4. Cinco preguntas para decidir antes de diseñar',
        content: [
          'Primera: ¿el visitante llega por una campaña con una sola propuesta o necesita conocer varios servicios? Segunda: ¿qué objeciones deben resolverse antes de que alguien solicite contacto?',
          'Tercera: ¿hay evidencia pública y autorizada suficiente para respaldar la oferta? Cuarta: ¿se medirá una solicitud real, y no solo el clic sobre un botón? Quinta: ¿quién responderá y calificará los contactos?',
          'La respuesta puede llevar a una landing, una web completa o una combinación. No hace falta comprar o desarrollar componentes que no sirven al recorrido del comprador.',
        ],
      },
      {
        heading: '5. Una arquitectura práctica: página de servicio + evidencia + contacto',
        content: [
          'Una estructura sencilla funciona como punto de partida: titular concreto, problema que se resuelve, alcance del servicio, proceso de trabajo, referencias verificables y un siguiente paso definido. Cada bloque tiene una función; no debería agregarse solo porque aparece en una plantilla.',
          'Para una oferta técnica, explicar supuestos, integraciones y límites suele aportar más que llenar la pantalla de promesas o cifras no verificadas.',
          'El sitio institucional puede albergar la información amplia, mientras la página de servicio hace de entrada a una necesidad puntual. Así no se obliga al visitante a elegir entre conocer la empresa y evaluar una solución específica.',
        ],
      },
      {
        heading: '6. Cómo saber si está funcionando',
        content: [
          'Antes de cambiar el diseño, conviene definir qué acción representa una oportunidad: un mensaje comercial enviado, una reunión solicitada o un formulario efectivamente completado. Una visita, un clic o abrir un correo son señales de intención, no ventas.',
          'Revisa que la página cargue bien en móvil, sea comprensible sin contexto previo y explique un camino claro para contactar. Complementa la analítica agregada con lo que el equipo comercial aprende de las consultas reales.',
          'La elección entre landing y web corporativa no es definitiva. Es una hipótesis de diseño que debe revisarse con evidencia de uso, mantenimiento y necesidades del negocio.',
        ],
      },
    ],
    decisionMatrix: [],
    internalLinks: [
      { anchor: 'Servicios de desarrollo web y páginas de aterrizaje', url: '/servicios/landing-pages-b2b/', label: 'Diseño de experiencias enfocadas en explicar una oferta y facilitar contactos comerciales.' },
      { anchor: 'Desarrollo de software a medida', url: '/servicios/desarrollo-software-medida/', label: 'Cuando la experiencia comercial requiere también flujos o sistemas específicos.' },
      { anchor: 'Referencia pública PeruLog Pallets', url: '/casos/perulog-pallets/', label: 'Conocer el alcance publicado de este proyecto sin asumir métricas de conversión.' },
    ],
    cta: {
      headline: '¿Tu web explica realmente por qué deberían contactarte?',
      description: 'Podemos revisar el objetivo de tu sitio, la información que necesita el comprador y la forma más simple de plantear una primera consulta.',
      subject: 'Consulta sobre landing B2B o web corporativa - Orbital Insights',
      body: 'Hola Orbital Frameworks,\n\nLeí su artículo sobre landing page B2B versus web corporativa y quiero evaluar una web para mi empresa.\n\nOferta principal:\nTipo de clientes:\nObjetivo de la web:\nSitio actual (si existe):\n',
    },
  },

}

// Only published articles appear in the public blog and route resolver.
// Scheduled/editorial drafts stay in source for review, never in the live index.
export const blogPostSlugs = (Object.keys(blogPosts) as BlogPostSlug[]).filter(
  (slug) => blogPosts[slug].status === 'PUBLISHED',
)

export function isBlogPostSlug(slug: string): slug is BlogPostSlug {
  return blogPostSlugs.includes(slug as BlogPostSlug)
}
