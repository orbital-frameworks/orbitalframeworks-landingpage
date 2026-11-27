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
  | 'integracion-sistemas-legacy-con-apis-modernas-sin-rehacer-todo'
  | 'fuente-unica-de-verdad-datos-operativos-silos-empresariales'
  | 'mvp-para-software-interno-b2b-como-validar-sin-sobreingenieria'
  | 'automatizar-vs-redisenar-proceso-operativo-regla-proceso-roto'
  | 'cotizaciones-sin-seguimiento-control-comercial-b2b'


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
  'cotizaciones-sin-seguimiento-control-comercial-b2b': {
  "slug": "cotizaciones-sin-seguimiento-control-comercial-b2b",
  "route": "/blog/cotizaciones-sin-seguimiento-control-comercial-b2b/",
  "canonical": "https://orbitalframeworks.qzz.io/blog/cotizaciones-sin-seguimiento-control-comercial-b2b/",
  "title": "Cotizaciones en PDF y Excel sin seguimiento: por qué se pierden ventas después de enviar la propuesta",
  "metaTitle": "Cotizaciones B2B sin seguimiento en PDF y Excel | Orbital Insights",
  "metaDescription": "Por qué enviar propuestas comerciales en PDF y Excel sueltos genera fugas silenciosas de ventas y 4 reglas operativas para ordenar el seguimiento hasta el pedido.",
  "eyebrow": "Orbital Insights / Control Comercial y Operaciones B2B",
  "datePublished": "2026-11-27",
  "dateModified": "2026-11-27",
  "readingTime": "6 min de lectura",
  "status": "PUBLISHED",
  "statusLabel": "",
  "statusNotice": "",
  "prioritizedOwnerQuestion": "¿En tu empresa hoy, dónde se frena más una cotización: al armarla antes de enviarla o al hacer seguimiento ordenado después de enviarla?",
  "author": {
    "name": "Orbital Frameworks",
    "type": "Organization",
    "url": "https://orbitalframeworks.qzz.io/sobre-orbital-frameworks/"
  },
  "lead": "En muchas empresas B2B el cuello de botella comercial no está en conseguir prospectos ni en redactar la oferta. El equipo responde rápido, arma la propuesta en Word o Excel, la exporta a PDF y la envía por correo o WhatsApp. El problema empieza al día siguiente: la cotización sale de la bandeja de entrada y desaparece de la vista del negocio. Cuando una propuesta comercial vive como un archivo suelto en la computadora de cada vendedor, el seguimiento depende exclusivamente de la memoria individual.",
  "sections": [
    {
      "heading": "1. Qué ocurre realmente entre el envío del PDF y la respuesta del cliente",
      "content": [
        "En la operación diaria de una PYME B2B, el flujo manual suele repetirse con cuatro fricciones concretas:",
        "1. Proliferación de versiones: aparecen archivos como COT-204_v2_final.pdf y COT-204_corregida.xlsx. Ante una consulta del cliente, dos personas internas pueden estar mirando precios o condiciones distintas.",
        "2. Descuentos sin control de margen: cuando se negocia por WhatsApp o teléfono, el vendedor ajusta el monto final sobre el archivo para cerrar rápido, pero nadie verifica en ese momento si el margen sigue siendo rentable o si el stock comprometido sigue disponible.",
        "3. Seguimiento sin agenda ni responsable: el envío de la cotización no crea una tarea con fecha límite. La gerencia solo se entera de las propuestas vencidas cuando revisa las ventas al cierre del mes.",
        "4. Doble digitación al aprobarse: cuando el cliente confirma, alguien debe copiar manualmente los ítems desde el PDF hacia el sistema de pedidos, almacén o facturación, abriendo la puerta a errores de código, cantidad o dirección de entrega."
      ]
    },
    {
      "heading": "2. El diagnóstico: el archivo muerto frente al registro vivo",
      "content": [
        "El fallo no es falta de voluntad del equipo comercial. El problema es estructural: un PDF o una hoja de cálculo es una foto estática, no un proceso con estado.",
        "Un archivo adjunto no sabe si ya venció su vigencia, no avisa cuando pasaron 72 horas sin respuesta, no bloquea un descuento por debajo del piso permitido y no conversa con el inventario ni con el área de despacho.",
        "Pedirle disciplina manual al equipo para compensar una herramienta sin estados termina consumiendo horas en reuniones de seguimiento que solo reconstruyen lo que ya pasó."
      ]
    },
    {
      "heading": "3. Las 4 reglas operativas para ordenar tus cotizaciones B2B",
      "content": [
        "Antes de pensar en herramientas complejas, cualquier operación comercial puede evaluar su proceso actual contra cuatro criterios concretos:",
        "1. Identidad única de la propuesta: pasar de copias locales (v2, final, ok) a un folio único con historial de cambios, fecha de emisión y vigencia visible.",
        "2. Validación de precios y margen antes de enviar: lista de precios centralizada y topes de descuento con aprobación previa en lugar de ediciones manuales en plantilla.",
        "3. Seguimiento con fecha y responsable: cada envío genera un próximo paso concreto con fecha, motivo y responsable asignado, eliminando la dependencia de la memoria del vendedor.",
        "4. Paso directo a operación o pedido: cuando el cliente aprueba, la cotización se convierte directamente en orden o pedido sin volver a digitar cada ítem."
      ]
    },
    {
      "heading": "4. Cuándo conviene sistematizar el flujo de cotizaciones",
      "content": [
        "Mantener plantillas manuales puede funcionar mientras el volumen semanal es bajo, hay un solo vendedor y los precios casi no cambian. Sin embargo, cuando participan dos o más personas cotizando, existen listas diferenciadas por cliente o el tiempo entre la consulta y el envío define si se gana la orden, seguir operando sobre archivos sueltos genera pérdidas silenciosas difíciles de medir.",
        "Sistematizar este punto no requiere un ERP sobredimensionado: suele bastar una herramienta web ligera conectada a tu catálogo de productos o servicios, con reglas claras de vigencia, alertas de seguimiento y exportación ordenada hacia facturación o despacho."
      ]
    }
  ],
  "decisionMatrix": [],
  "internalLinks": [
    {
      "anchor": "Automatización de Procesos",
      "url": "/servicios/automatizacion-procesos/",
      "label": "Conoce nuestras metodologías en para eliminar fricción manual."
    },
    {
      "anchor": "Desarrollo de Software a Medida",
      "url": "/servicios/desarrollo-software-medida/",
      "label": "Revisa el servicio de para construir herramientas alineadas a tu flujo real."
    },
    {
      "anchor": "PeruLog Pallets",
      "url": "/casos/perulog-pallets/",
      "label": "Lee cómo estructuramos flujos eficientes en el caso ."
    }
  ],
  "cta": {
    "headline": "¿Tus cotizaciones siguen saliendo en archivos sueltos sin trazabilidad?",
    "description": "En Orbital Frameworks te ayudamos a ordenar el flujo desde la propuesta hasta el pedido sin frenar al equipo comercial ni sobredimensionar tu operación.",
    "subject": "Consulta sobre control comercial y seguimiento de cotizaciones B2B",
    "body": "Hola equipo de Orbital, queremos evaluar cómo ordenar nuestro flujo de cotizaciones y seguimiento comercial.\n\nVolumen aproximado semanal:\nPrincipal cuello de botella hoy:\n"
  }
},
  'automatizar-vs-redisenar-proceso-operativo-regla-proceso-roto': {
  "slug": "automatizar-vs-redisenar-proceso-operativo-regla-proceso-roto",
  "route": "/blog/automatizar-vs-redisenar-proceso-operativo-regla-proceso-roto/",
  "canonical": "https://orbitalframeworks.qzz.io/blog/automatizar-vs-redisenar-proceso-operativo-regla-proceso-roto/",
  "title": "Cuándo automatizar un proceso y cuándo rediseñarlo: la regla del proceso roto",
  "metaTitle": "Automatizar vs rediseñar un proceso operativo | Orbital Insights",
  "metaDescription": "Descubre la regla de oro de la automatización empresarial: por qué digitalizar un mal proceso magnifica el caos y cómo rediseñarlo antes de programar software.",
  "eyebrow": "Orbital Insights / Eficiencia Operativa y Automatización B2B",
  "datePublished": "2026-11-26",
  "dateModified": "2026-11-26",
  "readingTime": "8 min de lectura",
  "status": "PUBLISHED",
  "statusLabel": "",
  "statusNotice": "",
  "prioritizedOwnerQuestion": "¿Qué preguntas debe hacerse un gerente para saber si un problema operativo se resuelve eliminando pasos o programando software?",
  "author": {
    "name": "Orbital Frameworks",
    "type": "Organization",
    "url": "https://orbitalframeworks.qzz.io/sobre-orbital-frameworks/"
  },
  "lead": "Una empresa de distribución o servicios decide que su proceso de cotización y ventas es demasiado lento. Los clientes esperan tres días para recibir una propuesta formal y el equipo comercial se queja de la carga administrativa. La gerencia general concluye que «hace falta un software que automatice todo el flujo con un solo clic». Se contrata un desarrollo a medida o se adquiere una herramienta en la nube para programar notificaciones, firmas electrónicas y traspasos de datos. Seis meses después, la situación ha empeorado: el sistema envía alertas automáticas cada diez minutos que nadie lee, los vendedores dedican el doble de tiempo a llenar quince campos obligatorios que el cliente no necesita, y la gerencia recibe notificaciones de error a una velocidad vertiginosa. El problema no radica en el software. Radica en haber ignorado la ley fundamental de la tecnología en los negocios, enunciada por Bill Gates en 1995: > «La primera regla de cualquier tecnología utilizada en una empresa es que la automatización aplicada a una operación eficiente magnificará la eficiencia. La segunda es que la automatización aplicada a una operación ineficiente magnificará la ineficiencia». Automatizar un proceso que nació desordenado o redundante solo logra que el caos ocurra más rápido y cueste más dinero. En esta guía explicamos cómo auditar y rediseñar un flujo de trabajo antes de escribir una sola línea de código.",
  "sections": [
    {
      "heading": "1. La anatomía del «proceso parcheado»",
      "content": [
        "Los procesos en las empresas casi nunca se diseñan de forma deliberada desde cero. Crecen orgánicamente a través de parches sucesivos:\n1. En 2019 ocurrió un fraude menor con un cliente, por lo que se agregó una segunda firma de aprobación obligatoria.\n2. En 2021 un proveedor se equivocó en una factura, por lo que se ordenó que administración coteje el documento en una tercera hoja de cálculo.\n3. En 2023 el gerente anterior pidió un reporte especial los lunes, por lo que el asistente comenzó a copiar datos manualmente de un sistema a otro.",
        "Años después, el fraude ya no es un riesgo, el proveedor fue reemplazado y el gerente ya no trabaja en la empresa. Sin embargo, los tres pasos burocráticos siguen ejecutándose religiosamente todos los días porque «aquí siempre se ha hecho así».",
        "Si en ese momento la empresa decide contratar desarrollo de software para «automatizar las tres firmas y el cruce de planillas», lo que está haciendo es gastar dinero en perpetuar el desperdicio dentro del código fuente."
      ]
    },
    {
      "heading": "2. El filtro de cuatro pasos: Eliminar, Simplificar, Estandarizar y Automatizar",
      "content": [
        "Antes de solicitar una cotización de software o encargar una automatización, todo flujo operativo debe someterse a esta secuencia estricta:",
        "``\n┌────────────────────────────────────────────────────────┐\n│ 1. ELIMINAR (Delete)                                   │\n│    ¿Aporta valor al cliente o es un requisito legal?   │\n│    Si la respuesta es no: ELIMÍNALO de inmediato.      │\n└──────────────────────────┬─────────────────────────────┘\n                           │\n                           ▼\n┌────────────────────────────────────────────────────────┐\n│ 2. SIMPLIFICAR (Simplify)                              │\n│    Reduce firmas duplicadas, campos innecesarios y     │\n│    tiempos de espera entre traspasos.                  │\n└──────────────────────────┬─────────────────────────────┘\n                           │\n                           ▼\n┌────────────────────────────────────────────────────────┐\n│ 3. ESTANDARIZAR (Standardize)                          │\n│    Define un formato único, reglas claras y una sola   │\n│    forma oficial de ejecutar el proceso a mano.        │\n└──────────────────────────┬─────────────────────────────┘\n                           │\n                           ▼\n┌────────────────────────────────────────────────────────┐\n│ 4. AUTOMATIZAR (Automate)                              │\n│    Solo ahora el software multiplicará la eficiencia   │\n│    sin arrastrar lastre histórico.                     │\n└────────────────────────────────────────────────────────┘\n``",
        "Paso 1: Eliminar (Delete)\nInspirado en la doctrina de eficiencia operativa: si al final del proceso no tienes que reincorporar al menos el 10% de lo que borraste, significa que no eliminaste suficiente. Pregúntate: «¿Qué pasaría si dejamos de hacer este paso hoy mismo?». Si la respuesta es «nada grave» o «nadie se daría cuenta», el paso debe desaparecer del mapa antes de diseñar el software.",
        "Paso 2: Simplificar (Simplify)\nUna vez eliminada la grasa obvia, reduce la fricción en los pasos restantes:\n- Si una orden de compra menor a $500 pasa por el jefe de área, el gerente de operaciones y el director general, simplifica la regla: aprobación automática del jefe de área para montos bajos; solo montos extraordinarios escalan al director.",
        "Paso 3: Estandarizar (Standardize)\nNingún programador puede automatizar la ambigüedad. Si el vendedor A registra los pedidos por audio de WhatsApp, el vendedor B por correo con un archivo adjunto y el vendedor C en una servilleta de papel, no existe un proceso; existen tres hábitos individuales. Define una plantilla unificada y exige su cumplimiento manual durante dos semanas antes de meter tecnología.",
        "Paso 4: Automatizar (Automate)\nSolo cuando el flujo manual es limpio, predecible y eficiente, el software entra en juego para eliminar el trabajo mecánico repetitivo: conectar la base de datos, validar campos en tiempo real y disparar notificaciones sin intervención humana."
      ]
    },
    {
      "heading": "3. Lista de Comprobación: Señales de que tu proceso necesita rediseño antes de software",
      "content": [
        "Somete el flujo que deseas digitalizar a estas cuatro preguntas de control:",
        "Síntoma en la Operación Diaria: Aprobaciones testimoniales: El flujo exige la firma de un gerente que aprueba 50 solicitudes al día en dos segundos sin leer el contenido. — Diagnóstico Técnico: El paso no ejerce control real; solo genera retrasos artificiales. — Acción Recomendada: Rediseñar. Reemplazar la firma por reglas automáticas de límites y auditoría aleatoria posterior.",
        "Síntoma en la Operación Diaria: El mismo dato se digita más de una vez: El cliente llena sus datos en un formulario, el asesor los copia a una cotización y facturación los vuelve a tipear en el sistema contable. — Diagnóstico Técnico: Fragmentación de sistemas y falta de ID canónico. — Acción Recomendada: Integrar. Diseñar un contrato de datos donde la información viaje sin reingreso humano.",
        "Síntoma en la Operación Diaria: Excepciones no documentadas: Ante la pregunta «¿qué pasa si el producto no tiene stock?», la respuesta depende de a qué empleado se le pregunte. — Diagnóstico Técnico: Reglas de negocio ausentes. — Acción Recomendada: Estandarizar. Redactar la matriz de excepciones con la gerencia antes de cotizar software.",
        "Síntoma en la Operación Diaria: El proceso tarda días pero el trabajo activo toma minutos: Una solicitud toma 5 días hábiles, pero el tiempo que una persona realmente trabaja en ella suma 20 minutos. El resto es tiempo de espera en bandejas de entrada. — Diagnóstico Técnico: Fricción de traspaso (hand-off). — Acción Recomendada: Automatizar. El software debe asumir el enrutamiento inmediato entre responsables."
      ]
    },
    {
      "heading": "4. El peligro de comprar herramientas SaaS antes de ordenar la casa",
      "content": [
        "El error más costoso de muchas empresas es salir a comprar licencias mensuales de plataformas complejas (CRMs gigantescos o herramientas de BPM) con la esperanza de que el software «imponga orden» en la organización.",
        "El software es una herramienta pasiva: ejecutará exactamente lo que se configure en él. Si se configura sobre un proceso confuso, el equipo sentirá que la plataforma es un obstáculo burocrático, duplicará el tiempo administrativo y terminará abandonando la herramienta a los pocos meses, manteniendo el pago mensual de suscripciones inutilizadas.",
        "El orden lo define la estrategia y el análisis operativo del negocio; el software es el vehículo que le da velocidad y escala."
      ]
    }
  ],
  "decisionMatrix": [],
  "internalLinks": [
    {
      "anchor": "Automatización de Procesos",
      "url": "/servicios/automatizacion-procesos/",
      "label": "Conoce nuestras metodologías en para eliminar fricción manual."
    },
    {
      "anchor": "Desarrollo de Software a Medida",
      "url": "/servicios/desarrollo-software-medida/",
      "label": "Revisa el servicio de para construir herramientas alineadas a tu flujo real."
    },
    {
      "anchor": "PeruLog Pallets",
      "url": "/casos/perulog-pallets/",
      "label": "Lee cómo estructuramos flujos eficientes en el caso ."
    }
  ],
  "cta": {
    "headline": "¿Estás pensando en automatizar un proceso y quieres asegurarte de hacerlo sobre bases sólidas?",
    "description": "En Orbital Frameworks no nos limitamos a escribir código: analizamos la lógica operativa de tu negocio, eliminamos cuellos de botella y diseñamos soluciones que multiplican la eficiencia real de tu empresa. Conversemos sobre tu operación.",
    "subject": "Consulta sobre diagnóstico y automatización de procesos",
    "body": "Hola equipo de Orbital, queremos evaluar la automatización de nuestro flujo de [describir área o proceso] y nos gustaría contar con un diagnóstico previo sobre la viabilidad técnica y el rediseño necesario.\n\nDetalles del proceso:\nObjetivo principal:\n"
  }
},
  'mvp-para-software-interno-b2b-como-validar-sin-sobreingenieria': {
  "slug": "mvp-para-software-interno-b2b-como-validar-sin-sobreingenieria",
  "route": "/blog/mvp-para-software-interno-b2b-como-validar-sin-sobreingenieria/",
  "canonical": "https://orbitalframeworks.qzz.io/blog/mvp-para-software-interno-b2b-como-validar-sin-sobreingenieria/",
  "title": "MVP para software interno B2B: cómo validar una herramienta operativa sin sobreingeniería",
  "metaTitle": "MVP para software interno B2B | Orbital Insights",
  "metaDescription": "Cómo construir un MVP para herramientas internas de tu empresa con la técnica Walking Skeleton. Valida adopción operativa sin sobreingeniería ni meses perdidos.",
  "eyebrow": "Orbital Insights / Metodología Ágil y Desarrollo de Producto B2B",
  "datePublished": "2026-11-23",
  "dateModified": "2026-11-23",
  "readingTime": "7 min de lectura",
  "status": "PUBLISHED",
  "statusLabel": "",
  "statusNotice": "",
  "prioritizedOwnerQuestion": "¿Cómo recortar el alcance de un software operativo interno para ponerlo en producción en menos de dos meses sin degradar la calidad técnica?",
  "author": {
    "name": "Orbital Frameworks",
    "type": "Organization",
    "url": "https://orbitalframeworks.qzz.io/sobre-orbital-frameworks/"
  },
  "lead": "Existe una trampa recurrente en los proyectos de digitalización interna: la obsesión por la totalidad. Cuando una empresa decide reemplazar un proceso manual o crear una aplicación interna para su equipo de operaciones, ventas o logística, la lista inicial de requerimientos suele ser infinita. Se pretende que el nuevo sistema contemple todos los descuentos posibles, maneje quince monedas distintas, envíe alertas por tres canales diferentes y resuelva automáticamente hasta la excepción más remota que ocurrió una sola vez en 2021. El resultado es predecible: un proyecto estimado en tres meses se estira a doce, el presupuesto se agota, el entusiasmo de la gerencia decae y, cuando el software finalmente se entrega, los operadores lo encuentran tan rígido y complejo que continúan utilizando sus libretas o planillas de Excel paralelas. En el desarrollo de software moderno existe un antídoto contra esta parálisis: *el Producto Mínimo Viable (MVP) enfocado en operaciones internas mediante la técnica del Walking Skeleton (Esqueleto Funcional Delgado)*. En este artículo explicamos cómo diseñar y lanzar una primera versión en semanas, validando la adopción real de los usuarios antes de invertir en automatizaciones complejas.",
  "sections": [
    {
      "heading": "1. El concepto erróneo de MVP en el entorno empresarial",
      "content": [
        "En el mundo de las startups tecnológicas de consumo, el término MVP suele asociarse a maquetas rápidas, prototipos desechables o páginas de aterrizaje con botones falsos (smoke tests).",
        "Trasladar esa mentalidad a un software de gestión operativa interna es una receta para el desastre. Un operador de almacén o un ejecutivo de ventas no puede trabajar con un software que pierde datos, se cuelga a mitad de un pedido o carece de seguridad básica.",
        "En el entorno B2B corporativo:\n- Un MVP NO es código de mala calidad: No es un desarrollo descuidado lleno de parches técnicos que habrá que desechar al mes siguiente.\n- Un MVP es código de producción con alcance deliberadamente acotado: La arquitectura, las pruebas de base de datos y la seguridad son de nivel profesional, pero el software resuelve únicamente el flujo crítico de valor (el 80% de las transacciones habituales)."
      ]
    },
    {
      "heading": "2. La técnica del 'Walking Skeleton' (Esqueleto Funcional)",
      "content": [
        "Acuñado por el pionero ágil Alistair Cockburn y complementado por la noción de Tracer Bullets (balas trazadoras) de Andrew Hunt y David Thomas en The Pragmatic Programmer, el concepto de Walking Skeleton define la estrategia ideal para un software interno:",
        "«Un Walking Skeleton es una implementación muy pequeña del sistema que ejecuta una función real de extremo a extremo, vinculando todas las capas arquitectónicas principales (interfaz, lógica de negocio, base de datos y despliegue).»",
        "A diferencia de construir el sistema por «capas horizontales» (pasar dos meses diseñando todas las tablas de la base de datos, otros dos meses en todas las APIs y tres meses en todas las pantallas), el Walking Skeleton corta el proyecto de forma vertical y delgada:",
        "```\n[ Enfoque Horizontal Tradicional (Riesgo Alto) ]\nMes 1-3: Construir el 100% de la Base de Datos  ──────┐\nMes 4-6: Construir el 100% de las APIs          ──────┼──► Cero usuarios hasta el mes 9\nMes 7-9: Construir el 100% de las Pantallas    ──────┘",
        "[ Enfoque Vertical: Walking Skeleton (Orbital) ]\nSemana 1-4:\n  ┌──────────────────────────────────────────────────┐\n  │ 1 Pantalla Simple (UI)                           │\n  │        ▼                                         │\n  │ 1 Flujo Lógico Central (API)                     │ ──► Sistema en producción en 30 días\n  │        ▼                                         │     con usuarios reales validando datos.\n  │ 1 Tabla de Base de Datos Real                    │\n  └──────────────────────────────────────────────────┘\n```",
        "Al terminar el primer mes, la empresa ya tiene un sistema desplegado en la nube, con usuarios reales autenticándose y registrando información. A partir de esa columna vertebral sólida, el software «gana músculo» en iteraciones quincenales."
      ]
    },
    {
      "heading": "3. La regla 80/20 aplicada a los casos borde operacionales",
      "content": [
        "El mayor consumidor de horas de desarrollo en cualquier proyecto de software no es el flujo normal de trabajo; son los casos excepcionales raros.",
        "Por ejemplo, en un sistema de despacho:\n- El 80% de los despachos son entregas estándar a clientes locales con stock confirmado y pago al contado.\n- El 20% restante incluye: clientes con crédito vencido pero autorizados por el dueño de palabra, entregas parciales en tres direcciones distintas, o pedidos que combinan mercadería pesada con productos refrigerados.",
        "Intentar programar reglas automáticas para ese 20% de excepciones complejas antes de lanzar el sistema triplica el costo de ingeniería.",
        "La estrategia del MVP inteligente:\n1. Automatizar al 100% el flujo estándar (el 80% del volumen): El software procesa estos pedidos sin fricción y en segundos.\n2. Gestionar las excepciones de forma humana asistida (el 20% restante): Si un pedido presenta una excepción compleja, el sistema no intenta adivinar qué hacer; simplemente lo marca con una etiqueta de «Requiere Revisión Manual» y habilita un campo de notas para que el supervisor autorice la transacción.\n3. Medir antes de codificar: Tras 60 días de operación real, se revisa cuáles excepciones se repiten con frecuencia suficiente para justificar su automatización en código, evitando gastar presupuesto en funciones que nadie usa."
      ]
    },
    {
      "heading": "4. Matriz de Priorización de Alcance para un MVP Interno",
      "content": [
        "Utiliza este marco de cuatro cuadrantes para decidir qué entra en la primera versión y qué queda para la fase posterior:",
        "Cuadrante de Decisión: P0: Crítico Operativo — Criterio de Selección: Sin esto, la transacción básica no puede completarse ni registrarse. — Acción en el Proyecto: Dentro del MVP (Día 1). Construir con calidad de producción.",
        "Cuadrante de Decisión: P1: Excepción Frecuente — Criterio de Selección: Ocurre a diario pero puede resolverse temporalmente con un flujo manual asistido. — Acción en el Proyecto: Marcado para Fase 2. Dejar gancho de extensión en la base de datos.",
        "Cuadrante de Decisión: P2: Optimización Estética — Criterio de Selección: Gráficos animados, personalización de temas o exportaciones en múltiples formatos. — Acción en el Proyecto: Fuera del MVP. Evaluar solo tras adopción demostrada.",
        "Cuadrante de Decisión: P3: Automatización Especulativa — Criterio de Selección: Reglas de negocio hipotéticas que «tal vez necesitemos en el futuro». — Acción en el Proyecto: Descartado. No se construye hasta tener demanda real observada."
      ]
    },
    {
      "heading": "5. El criterio de éxito de un MVP: Adopción y Frecuencia de Uso",
      "content": [
        "El éxito de una primera versión de software no se mide en la cantidad de pantallas desarrolladas ni en la sofisticación de sus librerías. Se mide en una sola métrica operativa: adopción voluntaria por parte del equipo de trabajo.",
        "Si los operadores dejan de usar sus hojas de cálculo paralelas y prefieren registrar su labor en el nuevo sistema porque les ahorra tiempo y les evita errores, el MVP ha triunfado. A partir de esa validación empírica, cualquier inversión adicional en nuevas funciones tiene retorno garantizado."
      ]
    }
  ],
  "decisionMatrix": [],
  "internalLinks": [
    {
      "anchor": "Desarrollo de Software a Medida",
      "url": "/servicios/desarrollo-software-medida/",
      "label": "Conoce nuestro servicio de enfocado en entregas iterativas y limpias."
    },
    {
      "anchor": "Landing Pages B2B",
      "url": "/servicios/landing-pages-b2b/",
      "label": "Revisa el servicio de para validar propuestas comerciales con velocidad."
    },
    {
      "anchor": "Checkio",
      "url": "/casos/checkio/",
      "label": "Explora cómo implementamos soluciones operativas ágiles en el caso ."
    }
  ],
  "cta": {
    "headline": "¿Tienes un proceso operativo que necesita sistematizarse pero temes que el proyecto se vuelva interminable?",
    "description": "En Orbital Frameworks aplicamos la metodología del Walking Skeleton para diseñar e implementar software empresarial que entrega valor real en pocas semanas. Conversemos sobre tu flujo operativo y definamos el alcance exacto de tu primera versión.",
    "subject": "Consulta sobre desarrollo de MVP y software operativo interno",
    "body": "Hola equipo de Orbital, queremos digitalizar nuestro flujo de [describir proceso] mediante una primera versión ágil y nos gustaría conocer su enfoque de desarrollo por etapas.\n\nDetalles del proceso:\nObjetivo principal:\n"
  }
},
  'fuente-unica-de-verdad-datos-operativos-silos-empresariales': {
  "slug": "fuente-unica-de-verdad-datos-operativos-silos-empresariales",
  "route": "/blog/fuente-unica-de-verdad-datos-operativos-silos-empresariales/",
  "canonical": "https://orbitalframeworks.qzz.io/blog/fuente-unica-de-verdad-datos-operativos-silos-empresariales/",
  "title": "Datos operativos en silos: cómo construir una fuente única de verdad sin gastar una fortuna",
  "metaTitle": "Fuente única de verdad de datos operativos | Orbital Insights",
  "metaDescription": "Cómo unificar datos dispersos en silos operativos sin gastar en data lakes complejos. Principios de Master Data Management para empresas medianas.",
  "eyebrow": "Orbital Insights / Gestión y Gobernanza de Datos B2B",
  "datePublished": "2026-11-19",
  "dateModified": "2026-11-19",
  "readingTime": "8 min de lectura técnica",
  "status": "PUBLISHED",
  "statusLabel": "",
  "statusNotice": "",
  "prioritizedOwnerQuestion": "¿Cuál es el diseño mínimo de datos que permite a una empresa mediana evitar la duplicación de registros de clientes y productos entre múltiples áreas?",
  "author": {
    "name": "Orbital Frameworks",
    "type": "Organization",
    "url": "https://orbitalframeworks.qzz.io/sobre-orbital-frameworks/"
  },
  "lead": "Viernes por la tarde, reunión de directorio o comité gerencial. El gerente comercial presenta su reporte mensual con orgullo: se cerraron ventas por 120 unidades de maquinaria pesada. Minutos después, el jefe de operaciones toma la palabra e informa que solo se despacharon 95 unidades debido a quiebres de inventario. Acto seguido, la jefa de administración y finanzas muestra el reporte contable: solo figuran 88 facturas emitidas y cobradas. La siguiente hora y media no se dedica a discutir estrategias de crecimiento, márgenes comerciales ni satisfacción del cliente. Se evapora en una discusión estéril sobre cuál de los tres reportes de Excel contiene la cifra correcta. Este problema no se debe a negligencia de los empleados. Es el síntoma universal de una empresa que opera en silos de información desconectados. Cada departamento, ante la falta de un sistema unificado, construyó su propia isla de datos. Frente a este caos, muchas empresas creen erróneamente que la única solución es invertir cientos de miles de dólares en complejas plataformas de Big Data o Data Lakes corporativos. En esta guía demostramos que construir una *Fuente Única de Verdad (Single Source of Truth / SSOT)* no es una cuestión de presupuesto masivo, sino de gobernanza básica y arquitectura limpia de datos.",
  "sections": [
    {
      "heading": "1. Qué es (y qué NO es) una Fuente Única de Verdad",
      "content": [
        "En la disciplina de gestión de datos formal (DAMA-DMBOK), una Fuente Única de Verdad (Single Source of Truth) se define como el principio arquitectónico por el cual cada dato estructurado de la empresa tiene una sola ubicación canónica autorizada para su creación, edición y validación.",
        "Para implementarla sin caer en proyectos interminables, conviene desterrar tres mitos habituales:",
        "1. Mito 1: «Una Fuente Única de Verdad exige que todos los empleados usen exactamente el mismo software».  \n   Falso. El equipo comercial necesita un CRM enfocado en seguimiento de prospectos; el almacén necesita un software de control de stock ágil con lectura de código de barras; contabilidad necesita un software fiscalmente homologado. Forzar a todos a usar una sola interfaz mastodóntica suele destruir la productividad. La verdad no reside en la pantalla; reside en el modelo de datos subyacente.\n2. Mito 2: «Necesitamos un Data Lake o un Data Warehouse en la nube».  \n   Falso para la inmensa mayoría de empresas medianas. Un Data Warehouse sirve para análisis histórico y Business Intelligence. Una Fuente Única de Verdad operativa sirve para la toma de decisiones transaccional en tiempo real (saber si hoy a las 11:00 am queda stock real de un producto para venderlo).\n3. Mito 3: «Basta con sincronizar todas las bases de datos entre sí en tiempo real».  \n   Peligroso. Si el sistema A y el sistema B pueden modificar el mismo dato al mismo tiempo sin una jerarquía clara, lo único que se logra es propagar inconsistencias a la velocidad de la luz."
      ]
    },
    {
      "heading": "2. Los 4 Pilares Arquitectónicos de un Modelo de Datos Confiable",
      "content": [
        "Para diseñar una Fuente Única de Verdad ágil y económica, se aplican cuatro reglas fundamentales de ingeniería de datos:",
        "Pilar 1: Claves Canónicas Compartidas (El ID Único Universal)\nEl origen de la duplicación es que cada sistema llama al mismo elemento con nombres diferentes. Por ejemplo, en el CRM un cliente es «Constructora San Martín S.A.C.», en facturación es «SAN MARTIN CONST S.A.C.» y en el sistema de despacho es «Cliente #402».\n- La solución: Definir un identificador inmutable y único que viaje con la entidad a través de todos los sistemas (por ejemplo, el número de identificación fiscal oficial —RUC/RFC/NIF— o un UUID generado centralmente). Ningún sistema puede registrar una transacción sin amarrarla a esa clave canónica.",
        "Pilar 2: Asignación Estricta del Sistema de Registro (System of Record)\nPara cada entidad de negocio principal, debe existir un solo sistema que ostente la autoridad de escritura:\n- Entidad Cliente: El CRM es el dueño. Solo desde el CRM se pueden crear clientes o actualizar sus datos de contacto. Los demás sistemas leen esta información como copia autorizada.\n- Entidad Catálogo y Precios Oficiales: El sistema comercial o ERP central es el dueño. Ningún vendedor puede inventar un código de producto en su celular.\n- Entidad Inventario Disponible: El sistema de almacén es el dueño exclusivo del stock físico. El CRM solo consulta el saldo disponible; no puede decretar que hay mercadería donde no la hay.",
        "Pilar 3: Reglas de Supervivencia (Survivorship Rules) ante Colisiones\nCuando dos sistemas contienen información contradictoria sobre un mismo registro, el software no debe adivinar. Debe existir una regla de negocio explícita:\n- Ejemplo de regla de supervivencia: «Si la dirección de despacho en la orden de compra difiere de la dirección registrada en el maestro de clientes, prevalece la dirección de la orden de compra para ese despacho específico, pero se genera una alerta para que el área de servicio al cliente verifique si debe actualizarse el maestro».",
        "Pilar 4: Contratos de Integración y Sincronización Dirigida\nEn lugar de exportar e importar archivos planos de forma caótica, los sistemas se comunican mediante eventos o webhooks ligeros:\n- Cuando el CRM marca un prospecto como «Cliente Ganado», emite un evento seguro a través de una API intermedia.\n- La API valida que los campos tributarios estén completos y crea automáticamente la ficha del cliente en el sistema contable y de almacén."
      ]
    },
    {
      "heading": "3. Matriz de Autoridad de Datos Operativos (Ejemplo B2B)",
      "content": [
        "Esta matriz delimita con precisión la responsabilidad funcional de cada sistema en una empresa de distribución o servicios:",
        "Entidad de Negocio: Maestro de Clientes — Sistema de Registro (System of Record): CRM Comercial — Sistemas Consumidores (Solo Lectura): Facturación, Almacén, Soporte Técnico — Evento Disparador de Sincronización: Creación o actualización de ficha de cliente con validación fiscal.",
        "Entidad de Negocio: Catálogo de Productos y SKUs — Sistema de Registro (System of Record): ERP Central / Sistema Web Maestro — Sistemas Consumidores (Solo Lectura): Aplicación de Ventas, Catálogo Digital — Evento Disparador de Sincronización: Publicación de nuevo producto o cambio de precio aprobado.",
        "Entidad de Negocio: Saldo de Inventario Físico — Sistema de Registro (System of Record): Sistema de Almacén / WMS — Sistemas Consumidores (Solo Lectura): Tienda Web, CRM, Aplicación Móvil — Evento Disparador de Sincronización: Entrada de mercadería por compra o salida confirmada por despacho.",
        "Entidad de Negocio: Estado de Cuenta y Cobranzas — Sistema de Registro (System of Record): Sistema Contable / Facturación — Sistemas Consumidores (Solo Lectura): CRM Comercial, Portal de Clientes — Evento Disparador de Sincronización: Emisión de comprobante de pago o conciliación bancaria registrada."
      ]
    },
    {
      "heading": "4. Hoja de Ruta para Desmantelar Silos sin Frenar la Operación",
      "content": [
        "Construir una fuente única de verdad no requiere paralizar la empresa. Se ejecuta de forma progresiva:\n1. Auditar el catálogo maestro: Comenzar por limpiar y normalizar la entidad más crítica (habitualmente el catálogo de productos o la base de clientes). Eliminar duplicados históricos y asignar el ID canónico.\n2. Definir la autoridad en un documento operativo: Acordar con los jefes de área quién tiene el poder de editar cada dato y quién debe limitarse a consultar.\n3. Automatizar el primer puente: Construir una integración ligera mediante API que sincronice automáticamente esa entidad maestra entre el sistema dueño y los sistemas secundarios.\n4. Eliminar planillas intermedias: Una vez que la sincronización automática demuestra confiabilidad durante 30 días, prohibir terminantemente el uso de archivos locales no vinculados."
      ]
    }
  ],
  "decisionMatrix": [],
  "internalLinks": [
    {
      "anchor": "Automatización de Procesos",
      "url": "/servicios/automatizacion-procesos/",
      "label": "Conoce cómo estructuramos integraciones confiables en ."
    },
    {
      "anchor": "Desarrollo de Software a Medida",
      "url": "/servicios/desarrollo-software-medida/",
      "label": "Revisa el servicio de para construir portales y bases de datos centralizadas."
    },
    {
      "anchor": "Wasy",
      "url": "/casos/wasy/",
      "label": "Explora nuestro caso de catálogo y flujo de pedidos estructurados en ."
    }
  ],
  "cta": {
    "headline": "¿Las diferentes áreas de tu empresa manejan cifras contradictorias de la misma operación?",
    "description": "En Orbital Frameworks diseñamos arquitecturas de datos operativas y pipelines de automatización que conectan tus herramientas actuales bajo una sola fuente de verdad confiable, sin compras de software infladas ni proyectos interminables.",
    "subject": "Consulta sobre integración de datos y fuente única de verdad",
    "body": "Hola equipo de Orbital, queremos resolver la duplicación de datos entre nuestras áreas de [mencionar departamentos] y nos gustaría conocer su diagnóstico técnico.\n\nDetalles del proceso:\nObjetivo principal:\n"
  }
},
  'integracion-sistemas-legacy-con-apis-modernas-sin-rehacer-todo': {
  "slug": "integracion-sistemas-legacy-con-apis-modernas-sin-rehacer-todo",
  "route": "/blog/integracion-sistemas-legacy-con-apis-modernas-sin-rehacer-todo/",
  "canonical": "https://orbitalframeworks.qzz.io/blog/integracion-sistemas-legacy-con-apis-modernas-sin-rehacer-todo/",
  "title": "Conectar sistemas antiguos con APIs modernas: cómo modernizar sin el riesgo del 'Big Bang'",
  "metaTitle": "Conectar sistemas legacy con APIs modernas | Orbital Insights",
  "metaDescription": "Aprende a modernizar sistemas antiguos y ERPs locales con el patrón Strangler Fig y capas de API intermedias sin frenar la operación ni gastar en un Big Bang.",
  "eyebrow": "Orbital Insights / Arquitectura de Software e Integración de Sistemas",
  "datePublished": "2026-11-16",
  "dateModified": "2026-11-16",
  "readingTime": "8 min de lectura técnica",
  "status": "PUBLISHED",
  "statusLabel": "",
  "statusNotice": "",
  "prioritizedOwnerQuestion": "¿Cómo puede una empresa conectar nuevas aplicaciones web o móviles a una base de datos antigua sin comprometer la estabilidad del sistema transaccional principal?",
  "author": {
    "name": "Orbital Frameworks",
    "type": "Organization",
    "url": "https://orbitalframeworks.qzz.io/sobre-orbital-frameworks/"
  },
  "lead": "En el corazón operativo de miles de empresas medianas y consolidadas existe un sistema informático instalado hace diez, quince o veinte años. Puede ser un ERP local montado sobre un servidor físico en la oficina central, un desarrollo a medida en Visual Basic o un motor de base de datos relacional que nadie se atreve a reiniciar un lunes por la mañana. Ese sistema tiene un mérito indiscutible: funciona y procesa la facturación diaria. Sin embargo, se ha convertido en un obstáculo infranqueable para la innovación del negocio: no tiene interfaz móvil para los vendedores en terreno, no se comunica con la tienda web, no puede enviar notificaciones automáticas por WhatsApp y cada reporte gerencial exige exportar tablas y cruzarlas a mano en Excel. Frente a esta situación, la consultoría tradicional suele proponer una única salida radical: «hay que cambiarlo todo e implementar un nuevo ERP desde cero». Esta estrategia, conocida en la industria como el enfoque «Big Bang», encierra un riesgo operativo monumental: presupuestos que se triplican, años de implementación y la posibilidad real de paralizar los despachos de la empresa durante semanas. Existe una alternativa probada en la ingeniería de software moderna: *la modernización incremental mediante capas de API y el patrón arquitectónico del Estrangulador (Strangler Fig)*. En este artículo explicamos cómo aplicarla paso a paso.",
  "sections": [
    {
      "heading": "1. La falacia del 'Big Bang': por qué demoler el sistema suele ser una trampa",
      "content": [
        "La tentación de iniciar un proyecto de software desde una hoja en blanco (Greenfield) es comprensible tanto para gerentes como para programadores. La promesa de una arquitectura limpia y moderna resulta seductora frente al desorden acumulado durante una década.",
        "Sin embargo, los sistemas antiguos contienen un activo invisible pero vital: cientos de reglas de negocio tácitas y casos excepcionales que no están documentados en ningún manual. Por ejemplo:\n- La lógica especial de descuento para los tres clientes mayoristas más antiguos.\n- La fórmula de redondeo fiscal exigida por el contador en 2018 para evitar descuadres de céntimos.\n- Las restricciones horarias de despacho que impiden facturar mercadería pesada después de las 18:00.",
        "Cuando una empresa intenta reescribir todo el sistema en un solo lanzamiento masivo, la mayoría de estas reglas se omiten en los nuevos requerimientos. El día del lanzamiento, la operación colapsa no por fallos en los servidores, sino porque el nuevo sistema desconoce cómo opera la empresa en el mundo real."
      ]
    },
    {
      "heading": "2. El Patrón del Estrangulador (Strangler Fig Application)",
      "content": [
        "En 2004, el reconocido arquitecto de software Martin Fowler bautizó este patrón inspirándose en las higueras estranguladoras de los bosques tropicales. Estas plantas depositan sus semillas en las ramas altas de un árbol hospedador, extienden raíces hacia el suelo rodeando el tronco y, con el paso de los años, forman una estructura autosuficiente mientras el árbol original envejece en su interior.",
        "Llevado a la arquitectura de software empresarial, el patrón consiste en:\n1. No tocar el código fuente interno del sistema antiguo de golpe.\n2. Construir una capa intermedia de mediación (API Gateway o Adaptador de Canal).\n3. Desarrollar las nuevas funciones o interfaces como servicios web modernos independientes.\n4. Hacer que los nuevos módulos lean y escriban datos en la base de datos central a través de la capa de API.\n5. Reemplazar gradualmente módulo por módulo a lo largo del tiempo, hasta que el sistema legado pueda apagarse sin trauma."
      ]
    },
    {
      "heading": "3. Arquitectura en Tres Capas: Cómo se implementa en la práctica",
      "content": [
        "Para conectar herramientas web modernas a un sistema antiguo sin poner en peligro la operación, se diseña una arquitectura desacoplada de tres niveles:",
        "``\n[ Capa 1: Nuevas Aplicaciones y Canales ]\n  • App móvil de vendedores en campo\n  • Portal de pedidos para clientes mayoristas\n  • Automatización de alertas operativas\n                 │\n                 ▼ (Llamadas REST / JSON seguras mediante HTTPS)\n[ Capa 2: Middleware / Fachada de APIs (Orbital) ]\n  • Validación de seguridad, tokens y permisos\n  • Caché de lectura para no sobrecargar el servidor local\n  • Lógica de transformación de formatos (JSON <-> SQL Legado)\n  • Registro de auditoría y colas de reintento\n                 │\n                 ▼ (Conexión controlada de solo lectura o escritura protegida)\n[ Capa 3: Sistema Central Legado / Base de Datos Existente ]\n  • ERP local / Servidor SQL on-premise\n  • Mantiene intacta la facturación y la contabilidad fiscal\n``",
        "El rol clave del Adaptador de Canal (Channel Adapter)\nLa capa intermedia actúa como un traductor simultáneo. Las aplicaciones móviles y web modernas no necesitan saber si el sistema central fue programado en 2005; solo se comunican con endpoints modernos en formato JSON. Si en el futuro la empresa decide cambiar su base de datos o migrar a un nuevo ERP, solo se modifica el adaptador, sin tener que rediseñar las aplicaciones que usan los vendedores y los clientes."
      ]
    },
    {
      "heading": "4. Hoja de Ruta de Modernización en 3 Fases Seguras",
      "content": [
        "Para ejecutar este proceso con riesgo cero para el negocio, recomendamos seguir este orden cronológico:",
        "Fase 1: Capa de Consulta y Lectura (Riesgo Nulo)\n- Se conecta la API intermedia a la base de datos local únicamente con permisos de lectura (SELECT).\n- Se construyen paneles gerenciales de consulta en tiempo real, portales de autoservicio de catálogo o reportes automáticos por correo.\n- Resultado: El sistema central no corre ningún peligro de corrupción de datos y la empresa obtiene valor inmediato en visibilidad.",
        "Fase 2: Escritura Asíncrona con Validación Humana (Riesgo Controlado)\n- Las nuevas aplicaciones capturan transacciones (por ejemplo, pedidos de venta en la calle o solicitudes de clientes en un portal web).\n- La API intermedia valida la información y la deposita en una tabla intermedia o bandeja de entrada dentro del sistema legado.\n- Un operador en oficina revisa la bandeja y confirma el ingreso con un solo clic.\n- Resultado: Se elimina el tiempo manual de tipeo sin perder el control de supervisión del personal experimentado.",
        "Fase 3: Escritura Directa Transaccional y Reemplazo de Módulos (Riesgo Mitigado)\n- Una vez verificada la solidez de las reglas de validación en la fase anterior, la API inyecta transacciones directamente en el sistema central mediante procedimientos almacenados seguros.\n- Si un módulo antiguo (por ejemplo, el módulo de cotizaciones) queda obsoleto, se apaga en la interfaz vieja y se opera al 100% desde la nueva plataforma web."
      ]
    },
    {
      "heading": "5. Matriz Comparativa: 'Big Bang' vs Modernización Incremental",
      "content": [
        "Factor de Evaluación: Tiempo hasta el primer valor útil — Enfoque 'Big Bang' (Reemplazo Total): 12 a 24 meses (o nunca si el proyecto se cancela). — Modernización Incremental con APIs: 4 a 8 semanas para el primer módulo en producción.",
        "Factor de Evaluación: Riesgo de interrupción del negocio — Enfoque 'Big Bang' (Reemplazo Total): Crítico: un fallo en el día de lanzamiento paraliza ventas. — Modernización Incremental con APIs: Muy bajo: si un módulo nuevo falla, el sistema central sigue vivo.",
        "Factor de Evaluación: Curva de aprendizaje del personal — Enfoque 'Big Bang' (Reemplazo Total): Choque cultural masivo; todos los empleados cambian de pantalla a la vez. — Modernización Incremental con APIs: Gradual; los usuarios adoptan herramientas modernas una por una.",
        "Factor de Evaluación: Presupuesto e inversión — Enfoque 'Big Bang' (Reemplazo Total): Desembolso de capital masivo por adelantado sin garantía de retorno. — Modernización Incremental con APIs: Inversión modular por etapas autofinanciadas con los beneficios obtenidos."
      ]
    }
  ],
  "decisionMatrix": [],
  "internalLinks": [
    {
      "anchor": "Automatización de Procesos",
      "url": "/servicios/automatizacion-procesos/",
      "label": "Conoce nuestras soluciones en para conectar sistemas dispersos."
    },
    {
      "anchor": "Desarrollo de Software a Medida",
      "url": "/servicios/desarrollo-software-medida/",
      "label": "Revisa el servicio de para crear portales y herramientas a medida."
    },
    {
      "anchor": "PeruLog Pallets",
      "url": "/casos/perulog-pallets/",
      "label": "Consulta nuestro caso de estudio de trazabilidad logística en ."
    }
  ],
  "cta": {
    "headline": "¿Tu empresa depende de un sistema antiguo que no se comunica con el resto de tu operación?",
    "description": "En Orbital Frameworks diseñamos arquitecturas de integración y APIs a medida que permiten conectar nuevas herramientas web y móviles a tus bases de datos actuales, sin frenar tu facturación ni asumir el costo de un reemplazo total.",
    "subject": "Consulta sobre integración de sistemas legacy y APIs",
    "body": "Hola equipo de Orbital, tenemos un sistema central de [tipo de ERP o base de datos] y nos gustaría evaluar cómo conectar [describir app o portal web que se necesita] de forma segura.\n\nDetalles del proceso:\nObjetivo principal:\n"
  }
},
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
