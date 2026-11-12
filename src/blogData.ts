export type BlogPostSlug =
  | 'software-a-medida-o-saas-como-decidir'
  | 'automatizacion-procesos-vs-excel-riesgo-operativo'
  | 'landing-page-b2b-tecnica-vs-web-corporativa'
  | 'integracion-pedidos-whatsapp-almacen-operaciones'
  | 'web-con-visitas-pero-sin-consultas'
  | 'digitalizacion-asistencia-personal-campo-trazabilidad'
  | 'lisa-serums-mapa-datos-automatizacion'
  | 'como-hacer-un-briefing-tecnico-de-software-b2b'
  | 'criterios-evaluacion-seleccion-proveedores-software-a-medida'


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
  'criterios-evaluacion-seleccion-proveedores-software-a-medida': {
  "slug": "criterios-evaluacion-seleccion-proveedores-software-a-medida",
  "route": "/blog/criterios-evaluacion-seleccion-proveedores-software-a-medida/",
  "canonical": "https://orbitalframeworks.qzz.io/blog/criterios-evaluacion-seleccion-proveedores-software-a-medida/",
  "title": "Cómo evaluar proveedores de software a medida: 5 preguntas técnicas más allá del precio",
  "metaTitle": "Cómo evaluar proveedores de software a medida | Orbital Insights",
  "metaDescription": "5 preguntas técnicas clave para seleccionar un proveedor de software a medida. Evalúa propiedad del código, arquitectura, pruebas y evita el vendor lock-in.",
  "eyebrow": "Orbital Insights / Selección de Proveedores y Gobernanza de TI",
  "datePublished": "2026-11-12",
  "dateModified": "2026-11-12",
  "readingTime": "7 min de lectura",
  "status": "PUBLISHED",
  "statusLabel": "",
  "statusNotice": "",
  "prioritizedOwnerQuestion": "¿Qué preguntas técnicas concretas permiten a una empresa detectar a tiempo si un proveedor de software creará un sistema cautivo o difícil de mantener?",
  "author": {
    "name": "Orbital Frameworks",
    "type": "Organization",
    "url": "https://orbitalframeworks.qzz.io/sobre-orbital-frameworks/"
  },
  "lead": "Cuando una empresa decide contratar el desarrollo de un sistema a medida, el proceso de selección suele seguir un patrón predecible: se reciben tres o cuatro propuestas económicas, se revisan las capturas de pantalla de sus portafolios y se opta por la cotización intermedia o la más económica que prometa entregar en menor tiempo. Pocos meses después del lanzamiento, aparecen los problemas reales: cada pequeño cambio en el sistema toma semanas, el proveedor cobra tarifas exorbitantes por cualquier ajuste elemental, no existen manuales de arquitectura y, al consultar si otro equipo técnico puede intervenir la plataforma, la respuesta es lapidaria: «el código es propietario de la agencia o está tan enredado que convendría rehacerlo desde cero». Contratar software a medida no es comprar un producto empaquetado en una caja; es encargar la construcción de un activo operativo central para la empresa. En este artículo detallamos cinco preguntas técnicas y contractuales basadas en las mejores prácticas de adquisición de software (estándar IEEE Std 1062) para evaluar a un proveedor con rigor y proteger la soberanía tecnológica de tu negocio.",
  "sections": [
    {
      "heading": "1. El sesgo del portafolio visual: por qué una demo bonita no garantiza calidad",
      "content": [
        "Uno de los mayores errores en la evaluación de proveedores de software es juzgar la capacidad de ingeniería exclusivamente a través de los ojos del diseñador. Una interfaz moderna, con animaciones fluidas y colores atractivos, puede construirse en pocos días sobre una base de código frágil, sin pruebas automatizadas y con serias vulnerabilidades de seguridad.",
        "La calidad real de un software empresarial reside en lo que no se ve en una captura de pantalla:\n- ¿Cómo responde la base de datos cuando hay 200 usuarios concurrentes registrando transacciones?\n- ¿El código está modularizado para que una modificación en facturación no rompa el módulo de inventario?\n- ¿Existen registros de auditoría (logs) para saber exactamente qué usuario modificó un registro crítico?",
        "Evaluar únicamente el aspecto visual equivale a comprar un edificio comercial inspeccionando solo el color de la pintura de la fachada, sin verificar los cimientos ni las instalaciones eléctricas."
      ]
    },
    {
      "heading": "2. Las 5 preguntas técnicas indispensables para auditar a un proveedor",
      "content": [
        "Antes de adjudicar un contrato de desarrollo, somete a los candidatos a estas cinco preguntas de control:",
        "Pregunta 1: ¿Quién es el titular legal del repositorio Git y del código fuente desde el primer día?\n- La respuesta correcta: El cliente es el propietario exclusivo de todos los derechos patrimoniales sobre el código desarrollado. El repositorio (en GitHub, GitLab o similar) se aloja en la organización del cliente o se entrega con acceso total de lectura y administración en cada entrega quincenal.\n- *La señal de alerta roja (Red Flag):* «El código reside en nuestros servidores privados y se entregará un archivo ZIP al finalizar el proyecto» o «el software corre en nuestra plataforma propietaria y ustedes solo pagan por el uso». Si no controlas el repositorio, tu empresa no compró un activo; alquiló una dependencia forzada.",
        "Pregunta 2: ¿Qué stack tecnológico utilizarán y qué tan accesible es el mercado laboral para mantenerlo?\n- La respuesta correcta: Tecnologías consolidadas, de código abierto, con amplia documentación y gran disponibilidad de ingenieros en el mercado (por ejemplo: TypeScript, Python, Node.js, PostgreSQL, React).\n- La señal de alerta roja: Frameworks esotéricos, plataformas cerradas que solo domina esa agencia o versiones obsoletas de herramientas que ya no reciben parches de seguridad. Si el día de mañana decides cambiar de proveedor, un stack estándar te permite incorporar nuevos desarrolladores en días; una tecnología de nicho te deja a merced del proveedor original.",
        "Pregunta 3: ¿Cómo verifican que el código funciona antes de pasarlo a producción?\n- La respuesta correcta: Pruebas automatizadas (unitarias, de integración y de tipos), linters estáticos y pipelines de integración continua (CI/CD) que impiden desplegar código con errores conocidos.\n- La señal de alerta roja: «Probamos todo manualmente antes de entregárselo para que ustedes lo revisen». El testing exclusivamente manual es costoso, lento y deja escapar la mayoría de los errores de regresión (fallos en funciones viejas cuando se agrega una función nueva).",
        "Pregunta 4: ¿Cómo documentan la arquitectura y las reglas de negocio del sistema?\n- La respuesta correcta: Documentación viva dentro del repositorio: diagramas de entidad-relación actualizados, especificación de APIs (OpenAPI / Swagger) y un archivo README operativo que explique cómo instalar, compilar y ejecutar el proyecto desde cero en un entorno limpio.\n- La señal de alerta roja: «El código se explica solo» o la promesa de «un manual en PDF de 100 páginas al terminar el contrato». Los manuales en PDF quedan desactualizados la primera semana; la documentación técnica debe formar parte del código.",
        "Pregunta 5: ¿Cuál es el protocolo de salida (Exit Strategy) y la garantía post-lanzamiento?\n- La respuesta correcta: Un periodo explícito de garantía para corrección de bugs sin costo adicional tras el lanzamiento (típicamente 30 a 90 días), acompañado de sesiones formales de transferencia técnica y un compromiso de asistencia si la empresa decide transferir el mantenimiento a su propio equipo o a un tercero.\n- La señal de alerta roja: Ausencia total de cláusulas de garantía o contratos que imponen costos desproporcionados para entregar las credenciales de los servidores y las bases de datos."
      ]
    },
    {
      "heading": "3. Matriz de Evaluación Rápida de Proveedores",
      "content": [
        "Usa esta tabla comparativa para ponderar las ofertas técnicas que reciba tu empresa:",
        "Criterio de Auditoría: Propiedad Intelectual — Proveedor Orientado a Activos Reales: Código y repositorio propiedad total del cliente desde el día 1. — Proveedor de Riesgo / Lock-in: Código restringido, retenido hasta el último pago o no transferible.",
        "Criterio de Auditoría: Arquitectura — Proveedor Orientado a Activos Reales: Modular, desacoplada, con APIs documentadas y bases de datos relacionales estándar. — Proveedor de Riesgo / Lock-in: Monolito rígido donde la interfaz y la lógica de base de datos están mezcladas.",
        "Criterio de Auditoría: Despliegues y CI/CD — Proveedor Orientado a Activos Reales: Despliegues automatizados mediante pipelines reproducibles en la nube del cliente. — Proveedor de Riesgo / Lock-in: Subidas manuales por FTP o acceso directo a servidores de producción sin control de cambios.",
        "Criterio de Auditoría: Dependencia Operativa — Proveedor Orientado a Activos Reales: Diseñado para que cualquier ingeniero calificado pueda asumir el mantenimiento. — Proveedor de Riesgo / Lock-in: Diseñado deliberadamente como caja negra para forzar contratos cautivos de soporte mensual."
      ]
    },
    {
      "heading": "4. El peligro del 'Vendor Lock-in' y cómo blindar tu inversión",
      "content": [
        "El secuestro de proveedor (vendor lock-in) no suele ser un accidente; en muchas ocasiones es un modelo de negocio. Proveedores que cotizan por debajo del costo de mercado recuperan su margen cobrando horas de soporte caras una vez que la empresa depende operativamente del sistema para despachar pedidos o facturar.",
        "Para blindar a tu empresa:\n1. Exige acceso continuo: No aceptes ver el progreso únicamente en reuniones mensuales de demostración. Revisa que los commits en Git reflejen actividad constante y ordenada.\n2. Infraestructura a tu nombre: Las cuentas de los servidores en la nube (AWS, Google Cloud, Azure o VPS privadas) y los dominios deben registrarse a nombre de tu empresa, otorgando permisos de acceso al proveedor, no al revés.\n3. Contratos con entregables técnicos claros: La definición de «terminado» (Definition of Done) debe incluir código fuente aprobado, suite de pruebas en verde y documentación de despliegue, no solo una pantalla visible en internet."
      ]
    }
  ],
  "decisionMatrix": [],
  "internalLinks": [
    {
      "anchor": "Desarrollo de Software a Medida",
      "url": "/servicios/desarrollo-software-medida/",
      "label": "Conoce nuestros estándares de entrega en ."
    },
    {
      "anchor": "Automatización de Procesos",
      "url": "/servicios/automatizacion-procesos/",
      "label": "Revisa cómo diseñamos integraciones limpias en ."
    },
    {
      "anchor": "Wasy",
      "url": "/casos/wasy/",
      "label": "Explora nuestro caso de arquitectura modular en ."
    }
  ],
  "cta": {
    "headline": "¿Estás evaluando propuestas de software para tu empresa?",
    "description": "En Orbital Frameworks creemos en el desarrollo de software transparente: entregamos código limpio, arquitecturas estándar y propiedad total de los repositorios para que tu inversión sea un activo que impulse tu negocio, sin ataduras artificiales.",
    "subject": "Consulta sobre desarrollo y evaluación técnica de proyectos",
    "body": "Hola equipo de Orbital, queremos evaluar una solución de software a medida para [describir requerimiento] y nos gustaría conocer su enfoque técnico y propuesta de trabajo.\n\nDetalles del proceso:\nObjetivo principal:\n"
  }
},
  'como-hacer-un-briefing-tecnico-de-software-b2b': {
  "slug": "como-hacer-un-briefing-tecnico-de-software-b2b",
  "route": "/blog/como-hacer-un-briefing-tecnico-de-software-b2b/",
  "canonical": "https://orbitalframeworks.qzz.io/blog/como-hacer-un-briefing-tecnico-de-software-b2b/",
  "title": "Cómo hacer un briefing técnico de software: la guía para líderes que no son programadores",
  "metaTitle": "Cómo hacer un briefing técnico de software | Orbital Insights",
  "metaDescription": "Aprende a estructurar un brief técnico de software sin ser programador. Define objetivos, reglas de negocio y flujos para evitar sobrecostos y retrasos.",
  "eyebrow": "Orbital Insights / Metodología de Software y Gestión B2B",
  "datePublished": "2026-11-10",
  "dateModified": "2026-11-10",
  "readingTime": "8 min de lectura",
  "status": "PUBLISHED",
  "statusLabel": "",
  "statusNotice": "",
  "prioritizedOwnerQuestion": "¿Cuáles son los vacíos de información más costosos que comete una empresa al redactar su primer requerimiento de software?",
  "author": {
    "name": "Orbital Frameworks",
    "type": "Organization",
    "url": "https://orbitalframeworks.qzz.io/sobre-orbital-frameworks/"
  },
  "lead": "Una empresa decide que necesita un sistema interno, una aplicación móvil o una plataforma web. El gerente o líder de operaciones redacta un documento de tres páginas describiendo lo que imagina: «un panel moderno con gráficos, usuarios con contraseña y un flujo parecido a Uber pero para despachos de almacén». Seis meses después, el proyecto lleva meses de retraso, el presupuesto se ha duplicado y lo que entrega el equipo técnico no se parece a lo que la operación diaria necesita. Este escenario no suele ser consecuencia de un mal código ni de incompetencia técnica; nace casi siempre de un briefing técnico ambiguo. Cuando el negocio describe pantallas decorativas en lugar de reglas operativas, el equipo de ingeniería se ve obligado a adivinar cómo debe comportarse el sistema ante cada excepción diaria. En esta guía explicamos cómo redactar un brief técnico riguroso y accionable sin necesidad de escribir código ni dominar jerga de programación.",
  "sections": [
    {
      "heading": "1. El error de partida: pedir pantallas en lugar de procesos",
      "content": [
        "El error más común al encargar software es comenzar por la interfaz gráfica: «queremos una pantalla azul con tres botones y un menú lateral». La interfaz es el último eslabón de una cadena lógica, no el punto de partida.",
        "Cuando un desarrollador recibe una lista de pantallas desprovista de reglas operativas, surgen preguntas inmediatas que paralizan el avance:\n- ¿Qué sucede si el usuario ingresa un número de documento duplicado?\n- ¿Quién aprueba una solicitud si el supervisor está inactivo?\n- ¿El cálculo de precio depende de la lista general o de un contrato específico por cliente?\n- ¿Qué estado toma un pedido cuando el inventario físico es menor al registrado?",
        "En la literatura de ingeniería de software formal (Karl Wiegers, Software Requirements), los requerimientos se organizan en tres niveles indispensables:\n1. *Requisitos de Negocio (Business Requirements): El objetivo comercial u operativo por el cual la empresa invierte tiempo y dinero.\n2. Requisitos de Usuario (User Requirements): Las tareas específicas que una persona de carne y hueso necesita completar en su jornada laboral.\n3. Requisitos Funcionales (Functional Requirements):* Lo que el software debe ejecutar de forma exacta ante cada entrada o evento.",
        "Si un brief mezcla estos niveles o salta directo a la interfaz, el resultado es incertidumbre, estimaciones presupuestarias infladas para cubrir riesgos y retrabajo continuo."
      ]
    },
    {
      "heading": "2. Los 5 componentes indispensables de un brief técnico efectivo",
      "content": [
        "Para que una agencia de desarrollo o un equipo de ingeniería pueda cotizar con precisión y construir sin desvíos, el brief debe articularse en torno a cinco componentes estructurales:",
        "Componente 1: Objetivo operativo medible\nEvita generalidades como «optimizar la gestión» o «digitalizar la empresa». Define el cambio concreto en la operación:\n- Ejemplo débil: «Hacer más rápida la atención al cliente».\n- Ejemplo riguroso: «Reducir el tiempo de registro y confirmación de pedidos de 25 minutos a menos de 5 minutos, eliminando el traspaso manual entre hojas de cálculo y el sistema de facturación».",
        "Componente 2: Actores, roles y permisos de acceso\nEl software empresarial vive de fronteras de autoridad. El brief debe especificar quién entra, qué ve y qué tiene prohibido modificar:\n- Operador de almacén: Registra ingresos y salidas físicas de mercadería; no puede modificar precios de venta ni ver márgenes comerciales.\n- Ejecutivo de ventas: Crea pedidos y consulta stock disponible; no puede autorizar créditos ni anular facturas.\n- Administrador / Gerente: Supervisa métricas globales, aprueba excepciones y exporta reportes consolidados.",
        "Componente 3: El «Flujo Feliz» (Happy Path) paso a paso\nDescribe la secuencia ideal de eventos desde que se dispara una necesidad hasta que se completa la transacción:\n1. El cliente solicita una cotización con lista de productos.\n2. El sistema valida automáticamente disponibilidad en inventario.\n3. El vendedor aplica descuento según política comercial establecida.\n4. El cliente confirma por correo o enlace seguro.\n5. El sistema reserva stock y notifica al almacén para picking.",
        "Componente 4: Reglas de negocio y manejo de excepciones\nEl verdadero valor del software a medida radica en cómo gestiona los problemas del mundo real. Aquí es donde se gana o se pierde la eficiencia:\n- ¿Qué ocurre si un producto no tiene stock suficiente? ¿Se permite venta parcial o se bloquea el pedido completo?\n- ¿Hasta qué porcentaje de descuento puede otorgar un vendedor sin requerir aprobación del gerente de ventas?\n- ¿Qué validación fiscal se exige para emitir una factura electrónica?",
        "Componente 5: Entorno tecnológico, datos de origen e integraciones\nTodo software corporativo debe convivir con herramientas previas. Aclara qué sistemas existen actualmente:\n- ¿Los datos de clientes residen en un ERP existente, en hojas de cálculo o en una base de datos SQL?\n- ¿Se requiere conexión con pasarelas de pago, servicios de facturación o mensajería como WhatsApp?\n- ¿Existen restricciones de hardware (por ejemplo, terminales móviles en campo sin conexión continua a internet)?"
      ]
    },
    {
      "heading": "3. Matriz de Decisión: Qué debe incluir y qué debe omitir tu brief",
      "content": [
        "Sección del Brief: Problema y Contexto — Lo que DEBE contener (Aporte de Valor): Dónde se generan cuellos de botella actuales, cuánto tiempo manual se pierde y qué fallos ocurren hoy. — Lo que DEBE omitir (Antipatrón o Relleno): Historia completa de la empresa desde su fundación o justificaciones abstractas de industria.",
        "Sección del Brief: *Alcance (Scope)* — Lo que DEBE contener (Aporte de Valor): Lista explícita de lo que el sistema resolverá en la primera versión y lista de lo que NO formará parte del proyecto inicial. — Lo que DEBE omitir (Antipatrón o Relleno): Metáforas vagas («un sistema integral 360», «un Uber de cobranzas»).",
        "Sección del Brief: Flujos de Usuario — Lo que DEBE contener (Aporte de Valor): Secuencia cronológica de pasos orientada a tareas concretas de los operadores. — Lo que DEBE omitir (Antipatrón o Relleno): Bocetos de diseño que intenten imponer la tipografía, colores o disposición exacta de botones.",
        "Sección del Brief: Datos e Integraciones — Lo que DEBE contener (Aporte de Valor): Lista de campos obligatorios, formatos de entrada y sistemas externos con los que debe conversar. — Lo que DEBE omitir (Antipatrón o Relleno): Nombres de frameworks o librerías de programación elegidas por intuición sin análisis de arquitectura."
      ]
    },
    {
      "heading": "4. La lista de exclusión: definir qué NO hace el sistema",
      "content": [
        "Uno de los apartados más valiosos —y más frecuentemente ignorados— de un buen brief es la Lista de Exclusiones Explícitas.  \nEn proyectos de software, el alcance no solo se define por lo que se construye, sino por los límites que se trazan deliberadamente para no desbordar el presupuesto.",
        "Al documentar qué queda fuera de la primera fase:\n- Evitas que el equipo de desarrollo asuma funciones complejas que encarecen la cotización.\n- Proteges la fecha de lanzamiento para poner el software en manos de usuarios reales cuanto antes.\n- Generas un backlog ordenado para fases posteriores una vez validada la operación.",
        "Ejemplo práctico de exclusión: «En esta primera versión, el sistema no gestionará rutas de reparto con GPS ni integrará pasarelas de pago con tarjeta de crédito; la confirmación de pago continuará validándose mediante comprobante bancario adjunto por el operador»."
      ]
    },
    {
      "heading": "5. La prueba ácida antes de enviar tu brief a cotización",
      "content": [
        "Antes de compartir tu requerimiento con proveedores o equipos internos, somételo a esta prueba de tres preguntas:\n1. ¿Un equipo externo puede calcular horas de trabajo sin tener que adivinar qué significa cada función? Si abundan adjetivos como «fácil», «intuitivo» o «automático», reemplázalos por criterios objetivos («el operador completa el formulario en menos de 3 pasos sin recargar la página»).\n2. ¿Las excepciones principales tienen una regla clara asignada? Si el sistema solo sabe qué hacer cuando todo sale bien, fallará el primer día de uso en producción.\n3. ¿El éxito del proyecto se puede medir con un indicador operativo? Si al finalizar la implementación no puedes demostrar si el objetivo se cumplió, el brief carecía de dirección."
      ]
    }
  ],
  "decisionMatrix": [],
  "internalLinks": [
    {
      "anchor": "Desarrollo de Software a Medida",
      "url": "/servicios/desarrollo-software-medida/",
      "label": "Conoce nuestro enfoque de para sistematizar procesos empresariales."
    },
    {
      "anchor": "Automatización de Procesos",
      "url": "/servicios/automatizacion-procesos/",
      "label": "Revisa cómo estructuramos integraciones en ."
    },
    {
      "anchor": "Checkio",
      "url": "/casos/checkio/",
      "label": "Lee nuestro caso de estudio sobre trazabilidad operativa en ."
    }
  ],
  "cta": {
    "headline": "¿Tienes en mente un proyecto de software y necesitas estructurar su alcance?",
    "description": "En Orbital Frameworks te ayudamos a aterrizar la lógica operativa y los requerimientos técnicos de tu empresa antes de comprometer inversión en código. Conversemos sobre tu proceso y evaluemos la viabilidad técnica de tu proyecto.",
    "subject": "Consulta sobre briefing y desarrollo de software a medida",
    "body": "Hola equipo de Orbital, estamos evaluando sistematizar nuestro proceso de [describir área o flujo] y queremos revisar el alcance técnico y las alternativas de desarrollo.\n\nDetalles del proceso:\nObjetivo principal:\n"
  }
},
  'web-con-visitas-pero-sin-consultas': {
  "slug": "web-con-visitas-pero-sin-consultas",
  "route": "/blog/web-con-visitas-pero-sin-consultas/",
  "canonical": "https://orbitalframeworks.qzz.io/blog/web-con-visitas-pero-sin-consultas/",
  "title": "Tu web recibe visitas, pero nadie te contacta: cómo encontrar la fricción antes de rediseñar",
  "metaTitle": "Tu web recibe visitas, pero no consultas | Orbital Insights",
  "metaDescription": "Por qué una web B2B recibe visitas pero pocas consultas: diagnostica demanda, distribución, claridad de la propuesta y siguiente paso antes de rediseñar.",
  "eyebrow": "Orbital Insights / Diagnóstico web y conversión B2B",
  "datePublished": "2026-10-29",
  "dateModified": "2026-10-29",
  "readingTime": "7 min de lectura",
  "status": "PUBLISHED",
  "statusLabel": "",
  "statusNotice": "",
  "prioritizedOwnerQuestion": "¿En qué punto del recorrido se pierde la intención de un visitante antes de solicitar contacto?",
  "author": {
    "name": "Orbital Frameworks",
    "type": "Organization",
    "url": "https://orbitalframeworks.qzz.io/sobre-orbital-frameworks/"
  },
  "lead": "Una empresa puede invertir en su sitio web, recibir visitas y aun así no conseguir nuevas conversaciones comerciales. La reacción habitual es cambiar el diseño, agregar formularios o comprar más tráfico. Pero antes conviene entender qué se rompe en el recorrido: la demanda, la expectativa con la que llega alguien o el siguiente paso que encuentra en la página.",
  "sections": [
    {
      "heading": "1. Visitas no son oportunidades comerciales",
      "content": [
        "El número de visitas muestra actividad, no necesariamente interés de compra. Algunas personas investigan, otras comparan proveedores y muchas llegan por motivos que no coinciden con la oferta. Tratar todas las sesiones como prospectos puede llevar a conclusiones equivocadas.",
        "El objetivo útil para una web B2B no es maximizar visitas a cualquier costo, sino facilitar que la persona adecuada comprenda una propuesta y pueda iniciar una conversación relevante. Un clic en «Contactar» tampoco equivale, por sí mismo, a un mensaje enviado o una oportunidad calificada.",
        "Antes de hablar de una tasa de conversión hay que precisar el denominador y el evento medido: ¿sesiones? ¿usuarios? ¿formularios realmente enviados? ¿correos recibidos? No son métricas intercambiables."
      ]
    },
    {
      "heading": "2. Diagnostica primero la demanda y la distribución",
      "content": [
        "Pregunta uno: ¿hay una necesidad real y actual detrás de esas visitas? Alguien que busca inspiración de diseño puede no estar comparando proveedores para contratar ahora. Ningún botón corrige por completo una falta de demanda.",
        "Pregunta dos: ¿la promesa del canal coincide con lo que encuentra al llegar? Si una publicación habla de automatizar pedidos, pero dirige a una portada genérica sobre transformación digital, la expectativa se rompe. La solución puede ser una página de servicio más específica, no necesariamente un rediseño general.",
        "Para distinguir ambos casos, revisa las consultas de búsqueda disponibles, los mensajes de campañas, las páginas de entrada y las preguntas reales que llegan por correo. Evita inventar intenciones a partir de una cifra agregada de tráfico."
      ]
    },
    {
      "heading": "3. Una visita necesita entender tres cosas",
      "content": [
        "Reconocer: «Esto me importa». El encabezado inicial debe describir un problema o resultado comprensible para el visitante. Una lista genérica de capacidades técnicas puede demostrar amplitud, pero no siempre responde a su situación.",
        "Entender: «Esto me sirve». Explica para quién es la solución, qué incluye, qué no incluye y cómo se aborda el trabajo. Cuando hay ejemplos públicos y autorizados, enlázalos sin convertirlos en promesas de resultados no medidos.",
        "Actuar: «Esto es lo que hago». El siguiente paso debe ser concreto: enviar un breve caso, solicitar una evaluación o preguntar por el alcance. La acción debe ser visible, fácil de iniciar en móvil y coherente con el compromiso que se pide al visitante.",
        "Si estas tres respuestas aparecen dispersas, se contradicen o exigen demasiada interpretación, un visitante interesado puede marcharse sin preguntar."
      ]
    },
    {
      "heading": "4. Cinco señales que conviene revisar antes de cambiar el diseño",
      "content": [
        "Primera: el titular habla de la empresa, pero no del problema que ayuda a resolver. Segunda: el enlace de origen promete algo que no se desarrolla en la página de llegada. Tercera: los servicios se describen mediante etiquetas amplias sin ejemplos de alcance.",
        "Cuarta: la acción de contacto aparece tarde, no funciona bien en móvil o no explica qué ocurrirá después. Quinta: se mide el clic en el botón como si fuera una solicitud recibida, de modo que el equipo no sabe dónde se pierden contactos reales.",
        "Ninguna señal demuestra por sí sola un problema de conversión. Son hipótesis que deben comprobarse con el recorrido real, una revisión móvil y conversaciones comerciales cuando existan."
      ]
    },
    {
      "heading": "5. Un orden práctico para diagnosticar sin sobredimensionar",
      "content": [
        "Empieza por demanda: identifica qué necesidad describe el visitante y si tu oferta corresponde a esa necesidad. Continúa por distribución: comprueba con qué promesa entró y qué encuentra primero. Termina por conversión: verifica si comprende la propuesta y dispone de un paso claro para contactar.",
        "Cuando encuentres una fricción concreta, cambia solo esa parte: mejora un encabezado, aclara una oferta, conecta un enlace con una página específica o simplifica el contacto. Observa resultados antes de añadir funcionalidades.",
        "Si todavía no tienes medición suficiente, plantea una prueba cualitativa simple: pide a una persona ajena al equipo que explique qué vendes, a quién ayudas y cómo te contactaría después de revisar la página en su teléfono."
      ]
    },
    {
      "heading": "6. Cuándo sí vale la pena rediseñar",
      "content": [
        "Un rediseño integral puede justificarse si la estructura impide encontrar servicios importantes, la página tiene fallos graves de accesibilidad o velocidad, o la oferta cambió y ya no puede explicarse con claridad en el sistema actual.",
        "En cambio, una empresa con tráfico poco relevante o una promesa comercial confusa puede invertir en un sitio nuevo y seguir recibiendo pocas consultas. La forma debe servir al recorrido comercial, no sustituir el diagnóstico.",
        "Antes de presupuestar, documenta el punto de fricción observado, la mejora esperada y cómo comprobarás que el siguiente paso realmente funciona. La decisión puede ser optimizar un bloque, crear una página de servicio o reformular el sitio completo."
      ]
    },
    {
      "heading": "Conclusión: de la visita a la conversación",
      "content": [
        "Una web efectiva no convierte automáticamente cada visita en cliente. Su tarea es hacer reconocible una necesidad, explicar una propuesta relevante y ofrecer una forma clara de iniciar el diálogo.",
        "No empieces cambiándolo todo. Identifica primero dónde se pierde la intención: demanda, distribución o conversión. Después elige la intervención más pequeña que puedas comprobar."
      ]
    }
  ],
  "decisionMatrix": [],
  "internalLinks": [
    {
      "anchor": "Landing pages comerciales B2B",
      "url": "/servicios/landing-pages-b2b/",
      "label": "Cómo planteamos páginas de entrada con una propuesta y un siguiente paso claros."
    },
    {
      "anchor": "Landing B2B o web corporativa",
      "url": "/blog/landing-page-b2b-tecnica-vs-web-corporativa/",
      "label": "Cuándo conviene una página enfocada y cuándo una presencia institucional más amplia."
    },
    {
      "anchor": "Referencia pública PeruLog Pallets",
      "url": "/casos/perulog-pallets/",
      "label": "Ejemplo público de presencia web empresarial, sin atribuirle resultados comerciales no medidos."
    },
    {
      "anchor": "Conoce Orbital Frameworks",
      "url": "/sobre-orbital-frameworks/",
      "label": "Nuestro alcance y canales oficiales de conversación."
    }
  ],
  "cta": {
    "headline": "¿Tu sitio recibe visitas, pero no genera conversaciones útiles?",
    "description": "Podemos revisar juntos el problema que quieres resolver, la promesa que ve el visitante y el siguiente paso comercial antes de plantear un rediseño.",
    "subject": "Consulta sobre diagnóstico web y contactos B2B",
    "body": "Hola Orbital Frameworks,\n\nLeí su artículo sobre visitas web y consultas comerciales. Me gustaría revisar mi caso.\n\nSitio actual:\nQué vendemos:\nA quién buscamos llegar:\nQué pasa cuando un visitante intenta contactarnos:\n"
  }
},
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
    status: 'PUBLISHED',
    statusLabel: '',
    statusNotice: '',
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
  'digitalizacion-asistencia-personal-campo-trazabilidad': {
  "slug": "digitalizacion-asistencia-personal-campo-trazabilidad",
  "route": "/blog/digitalizacion-asistencia-personal-campo-trazabilidad/",
  "canonical": "https://orbitalframeworks.qzz.io/blog/digitalizacion-asistencia-personal-campo-trazabilidad/",
  "title": "Control de asistencia en campo: por qué registrar una marcación no basta para tener trazabilidad",
  "metaTitle": "Control de asistencia en campo y trazabilidad | Orbital Insights",
  "metaDescription": "Registro de asistencia, incidencias y correcciones: cómo conectar contexto, revisión e historial antes de digitalizar los procesos de personal en campo.",
  "eyebrow": "Orbital Insights / Gestión de personal y operaciones",
  "datePublished": "2026-11-03",
  "dateModified": "2026-11-03",
  "readingTime": "7 min de lectura",
  "status": "PUBLISHED",
  "statusLabel": "Pendiente de aprobación editorial",
  "statusNotice": "Artículo preparado para revisión. No distribuible externamente hasta aprobar el arte, copy y fuente final.",
  "prioritizedOwnerQuestion": "¿El caso Checkio respalda exclusivamente las capacidades descritas, sin afirmar resultados comerciales ni cumplimiento normativo?",
  "author": {
    "name": "Orbital Frameworks",
    "type": "Organization",
    "url": "https://orbitalframeworks.qzz.io/sobre-orbital-frameworks/"
  },
  "lead": "Una persona marca su entrada. El sistema confirma la operación. En apariencia, el proceso está resuelto. Pero cuando RRHH necesita explicar una ausencia, verificar un cambio de turno o atender una corrección, el registro inicial puede ser solo la primera pieza de la historia. En empresas con personal distribuido, varios horarios o equipos que trabajan fuera de la oficina, digitalizar la asistencia no consiste únicamente en reemplazar una planilla por un botón. Consiste en diseñar un recorrido verificable desde el registro hasta la resolución de una incidencia.",
  "sections": [
    {
      "heading": "1. Registrar no es lo mismo que poder revisar",
      "content": [
        "Una marcación puede dejar constancia de que alguien accionó un registro en una fecha y hora. Eso no explica automáticamente si correspondía a la jornada asignada, si hubo una interrupción, cómo se trató una solicitud de ajuste ni quién aceptó una excepción.",
        "Cuando los datos están repartidos entre hojas de cálculo, chats y decisiones verbales, aparecen preguntas que requieren reconstruir conversaciones: ¿qué horario estaba vigente?, ¿a quién se informó?, ¿quién revisó la situación?, ¿cuál es el estado válido hoy?",
        "La mejora no comienza necesariamente con una nueva plataforma. Comienza definiendo qué debe quedar documentado para responder esas preguntas sin suposiciones."
      ]
    },
    {
      "heading": "2. Cuatro momentos que deberían mantenerse conectados",
      "content": [
        "Registro. El colaborador realiza una marcación de entrada o salida. El evento necesita un identificador de persona autorizado, fecha y hora, y un estado claro de recepción. Si se captura ubicación, debe tener una finalidad legítima y un alcance proporcional al proceso.",
        "Contexto. El equipo administrativo necesita interpretar la marcación respecto a una jornada, sede o regla vigente. Un dato aislado sin contexto puede resultar ambiguo, incluso si la captura fue correcta.",
        "Revisión. Cuando existe una discrepancia, debe haber un procedimiento para notificarla, aportar información relevante y asignar a alguien con responsabilidad de resolverla. La corrección no debería depender de que un mensaje quede perdido en un chat.",
        "Resolución e historial. La decisión final debe distinguir el evento original de los cambios posteriores. Conservar cuándo se revisó y qué estado quedó vigente ayuda a mantener trazabilidad operativa. Esto no equivale, por sí solo, a cumplir requisitos legales o de auditoría específicos: esas condiciones deben evaluarse para cada organización."
      ]
    },
    {
      "heading": "3. El límite de la geolocalización",
      "content": [
        "En determinados procesos una ubicación asociada a la marcación puede ayudar a contextualizar dónde se hizo el registro. Sin embargo, una coordenada no demuestra por sí sola que una persona realizó todas sus tareas, estuvo permanentemente en un lugar o cumplió una jornada completa.",
        "Tampoco toda empresa necesita registrar ubicación. Antes de pedir ese dato conviene definir para qué se usará, quién podrá consultarlo, cuánto tiempo se conservará y cómo se atenderán registros inexactos o situaciones excepcionales. El objetivo es revisar hechos relevantes sin introducir una vigilancia innecesaria."
      ]
    },
    {
      "heading": "4. Tres señales para decidir si digitalizar el proceso",
      "content": [
        "Existen varias versiones de una misma incidencia. Colaboradores, supervisores y RRHH necesitan acordar una fuente vigente de información. Antes de automatizar, define qué es el registro original y qué puede modificarse mediante un procedimiento de corrección.",
        "Las excepciones consumen tiempo de coordinación. Si las incidencias requieren varias consultas y aprobaciones, documenta el recorrido actual. Puede bastar con establecer responsables, un formulario común y un registro de decisiones; otras operaciones necesitarán una herramienta específica.",
        "No se puede reconstruir por qué cambió un estado. Cuando una corrección reemplaza silenciosamente el dato anterior, resulta difícil revisar una disputa. Considera historial y permisos de revisión antes de evaluar integraciones complejas.",
        "Ninguna señal aislada justifica comprar o desarrollar software. La decisión depende de la frecuencia del problema, el riesgo operativo, los procesos existentes y el costo real de mantener la solución."
      ]
    },
    {
      "heading": "5. Un recorrido ilustrativo, sin inventar resultados",
      "content": [
        "Imagina que una persona registra su entrada y, más tarde, advierte una diferencia respecto al horario asignado. En un proceso estructurado, el registro original permanece identificable; la persona solicita revisión; un responsable contrasta la información disponible; el sistema registra la decisión y el estado actualizado.",
        "Es un escenario conceptual, no una descripción de resultados obtenidos en una empresa concreta. Su valor está en mostrar qué preguntas debería poder contestar el proceso incluso antes de elegir un proveedor."
      ]
    },
    {
      "heading": "6. Una referencia funcional: Checkio",
      "content": [
        "El caso público Checkio presenta una plataforma en fase beta para gestión de personal y asistencia. Su alcance documentado incluye marcaciones de entrada y salida, historial, ubicación asociada a registros, gestión de colaboradores, incidencias, solicitudes de corrección y experiencias separadas para colaborador y administración.",
        "Checkio es una referencia de alcance funcional verificable. No es evidencia de ahorros, adopción, reducción de ausencias ni cumplimiento normativo de una operación específica. Su ejemplo sirve para observar por qué registro, revisión y contexto son partes distintas del diseño de un sistema."
      ]
    },
    {
      "heading": "Conclusión: digitaliza el flujo, no solo el fichaje",
      "content": [
        "Antes de implementar tecnología, responde tres preguntas: ¿qué dato se registra? ¿quién resuelve una diferencia? ¿cómo se explica después la decisión?",
        "Si esas respuestas no están definidas, la digitalización puede trasladar las mismas dudas a una pantalla nueva. En cambio, cuando el proceso está claro, es más fácil decidir si conviene ajustar una rutina, crear un registro compartido o construir una solución especializada.",
        "En Orbital Frameworks podemos revisar un caso operativo concreto y evaluar cuál es el siguiente paso razonable. Contacto: contact.orbitalframeworks@gmail.com. También puedes consultar nuestro servicio de desarrollo de software a medida."
      ]
    }
  ],
  "decisionMatrix": [],
  "internalLinks": [
    {
      "anchor": "Caso público Checkio",
      "url": "/casos/checkio/",
      "label": "Producto publicado en fase beta con marcaciones, historial y revisión de incidencias."
    },
    {
      "anchor": "Desarrollo de software a medida",
      "url": "/servicios/desarrollo-software-medida/",
      "label": "Evaluar cuándo conviene mejorar un proceso y cuándo una solución especializada."
    },
    {
      "anchor": "Automatización de procesos",
      "url": "/servicios/automatizacion-procesos/",
      "label": "Definir responsables, excepciones y puntos de integración antes de automatizar."
    }
  ],
  "cta": {
    "headline": "¿Tu operación necesita revisar mejor marcaciones e incidencias?",
    "description": "Cuéntanos cómo registras asistencia hoy, cómo se corrigen las diferencias y qué información necesita RRHH para decidir. Evaluamos el proceso antes de recomendar tecnología.",
    "subject": "Consulta sobre control de asistencia y trazabilidad operativa",
    "body": "Hola Orbital Frameworks,\n\nLeí el artículo sobre asistencia y trazabilidad y quiero revisar un caso en mi organización.\n\nTipo de operación:\nCómo registramos asistencia:\nCómo se revisan incidencias:\nQué problema buscamos resolver:\n"
  },
  },
  'lisa-serums-mapa-datos-automatizacion': {
    slug: 'lisa-serums-mapa-datos-automatizacion',
    route: '/blog/lisa-serums-mapa-datos-automatizacion/',
    canonical: 'https://orbitalframeworks.qzz.io/blog/lisa-serums-mapa-datos-automatizacion/',
    title: 'LISA: cuando ordenar la información importa tanto como construir el software',
    metaTitle: 'LISA, SERUMS y automatización de datos | Orbital Insights',
    metaDescription: 'Cómo médicos e ingenieros conectaron software y automatización de datos para facilitar la exploración territorial de plazas SERUMS con LISA.',
    eyebrow: 'Orbital Insights / Salud digital y productos de datos',
    datePublished: '2026-11-05',
    dateModified: '2026-11-05',
    readingTime: '5 min de lectura',
    status: 'PUBLISHED',
    statusLabel: '',
    statusNotice: '',
    prioritizedOwnerQuestion: '¿La atribución de Orbital Frameworks a LISA fue comunicada y aceptada por el resto del equipo?',
    author: {
      name: 'Orbital Frameworks',
      type: 'Organization',
      url: 'https://orbitalframeworks.qzz.io/sobre-orbital-frameworks/',
    },
    lead: 'Elegir una plaza del Servicio Rural y Urbano Marginal de Salud (SERUMS) exige más que consultar una fila en una hoja de cálculo. Un profesional necesita contrastar ubicación, establecimiento, modalidad y condiciones del proceso. LISA busca facilitar esa exploración mediante una plataforma que reúne trabajo de médicos e ingenieros, con participación de Orbital Frameworks en desarrollo de software y organización de datos.',
    sections: [
      {
        heading: '1. El problema: fuentes dispersas, decisiones difíciles',
        content: [
          'La información sobre plazas y establecimientos puede estar distribuida entre distintos registros. No siempre comparte el mismo formato, la misma granularidad o la precisión geográfica que una persona necesita para comparar alternativas.',
          'Antes de presentar la información en una pantalla, es necesario estructurar, cruzar y reconciliar registros, distinguir datos completos de datos faltantes y hacer explícitas las limitaciones de las ubicaciones.',
          'Un mapa por sí solo no corrige una fuente defectuosa. La calidad de los datos es parte del diseño del producto, no una tarea secundaria.',
        ],
      },
      {
        heading: '2. LISA: un mapa para explorar alternativas',
        content: [
          'LISA (Localisa) es una plataforma pública que permite explorar establecimientos y plazas SERUMS en un mapa interactivo, aplicar filtros y consultar herramientas de apoyo como favoritos y simulación de puntajes.',
          'Puede consultarse desde una computadora o un celular. Su objetivo es ayudar a organizar alternativas, no sustituir los documentos y las verificaciones necesarios para postular.',
          'La plataforma explica públicamente que algunas coordenadas pueden ser referenciales. Por eso, la ubicación real y las condiciones de cada plaza deben confirmarse con las entidades competentes.',
        ],
      },
      {
        heading: '3. El aporte de Orbital Frameworks: producto y datos',
        content: [
          'Dentro del equipo multidisciplinario de LISA, integrantes de Orbital Frameworks participaron en dos frentes: el desarrollo de la aplicación y la organización y automatización de parte de la información que la alimenta.',
          'En el frente de software se trabajó en convertir los registros en una experiencia de exploración web. En el frente de datos, ante la dificultad de procesar información manualmente, se desarrolló un bot y un proceso de estructuración que facilitaron ese trabajo.',
          'Una interfaz clara no compensa datos desorganizados, y una base de datos ordenada necesita una experiencia usable para convertirse en ayuda práctica. El resultado requiere ambos frentes.',
          'Se reconoce el trabajo compartido con profesionales de salud e ingeniería; esta descripción no atribuye a Orbital autoría exclusiva, propiedad intelectual ni respaldo institucional de LISA.',
        ],
      },
      {
        heading: '4. Lo que este proyecto enseña para otros sectores',
        content: [
          'El problema se repite en organizaciones donde los datos viven repartidos entre archivos, registros y sistemas. Un tablero adicional no necesariamente simplifica la decisión.',
          'Primero conviene comprender qué necesita resolver cada usuario, qué fuentes son suficientemente confiables y qué procesamiento puede automatizarse sin perder la posibilidad de revisar excepciones.',
          'Después se construye la interfaz para mostrar información pertinente, conservar las advertencias necesarias y permitir explorar el detalle. LISA sirve como un caso público de ese enfoque.',
        ],
      },
      {
        heading: '5. Conoce LISA y verifica sus fuentes',
        content: [
          'El proyecto se puede explorar públicamente en https://www.localisa.pe/. La explicación de fuentes y limitaciones de precisión está disponible en https://www.localisa.pe/sobre-los-datos.',
          'LISA es una herramienta de apoyo. Las ubicaciones, condiciones de plaza y fuentes relevantes deben contrastarse con las entidades competentes antes de tomar una decisión de postulación. No se afirma convenio ni respaldo institucional del MINSA.',
          'En Orbital Frameworks presentamos Localisa como caso de trabajo en desarrollo de software, automatización y organización de información. Consulta la ficha: https://orbitalframeworks.qzz.io/casos/localisa/.',
        ],
      },
    ],
    decisionMatrix: [],
    internalLinks: [
      { anchor: 'Ficha pública de LISA / Localisa', url: '/casos/localisa/', label: 'Cómo se presenta el proyecto LISA en Orbital Frameworks.' },
      { anchor: 'Desarrollo de software a medida', url: '/servicios/desarrollo-software-medida/', label: 'Cómo diseñamos aplicaciones para resolver necesidades operativas.' },
      { anchor: 'Automatización de procesos', url: '/servicios/automatizacion-procesos/', label: 'Cómo organizamos procesos y flujos de información.' },
    ],
    cta: {
      headline: '¿Tu organización necesita convertir datos dispersos en una herramienta útil?',
      description: 'Descríbenos las fuentes disponibles, el problema de comparación y qué decisión necesita tomar tu equipo. Evaluaremos el trabajo de datos y software que corresponde.',
      subject: 'Consulta sobre desarrollo de software y automatización de datos — LISA',
      body: 'Hola Orbital Frameworks,\n\nConocí el caso LISA y quisiera evaluar un problema de información de mi organización.\n\nFuentes de datos actuales:\nQuién necesita consultar la información:\nDificultad principal:\nResultado esperado:\n',
    },
  }
}

// Only published articles appear in the public blog and route resolver.
// Scheduled/editorial drafts stay in source for review, never in the live index.
export const blogPostSlugs = (Object.keys(blogPosts) as BlogPostSlug[]).filter(
  (slug) => blogPosts[slug].status === 'PUBLISHED',
)

export function isBlogPostSlug(slug: string): slug is BlogPostSlug {
  return blogPostSlugs.includes(slug as BlogPostSlug)
}
