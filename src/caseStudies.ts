export type CaseStudySlug = 'checkio' | 'veterp' | 'localisa' | 'perulog-pallets'

export type CaseStudy = {
  slug: CaseStudySlug
  title: string
  eyebrow: string
  status: string
  summary: string
  publicUrl: string
  problem: string
  approach: string
  outcome: string
  capabilities: string[]
  flows: { title: string; text: string }[]
  decisions: { title: string; text: string }[]
  evidence: string[]
  limits: string[]
}

export const caseStudies: Record<CaseStudySlug, CaseStudy> = {
  checkio: {
    slug: 'checkio',
    title: 'Checkio',
    eyebrow: 'Caso 01 / Gestión de personal y asistencia',
    status: 'Producto publicado · fase beta',
    summary: 'Una plataforma para registrar asistencia, ordenar incidencias y dar a equipos de RRHH una vista operativa sobre colaboradores, horarios y marcaciones.',
    publicUrl: 'https://checkio-frontend.onrender.com/landing',
    problem: 'Los controles de asistencia suelen quedar repartidos entre hojas, mensajes y registros difíciles de verificar. Eso complica revisar marcaciones, ausencias, ubicaciones e incidencias sin perder trazabilidad.',
    approach: 'Checkio concentra la experiencia del colaborador y la administración de RRHH en una misma plataforma, con flujos separados para marcar, revisar historial, gestionar empleados y atender solicitudes de corrección.',
    outcome: 'El producto publicado permite revisar una solución funcional para asistencia y gestión de personal. No se presenta como resultado comercial ni como caso de impacto cuantificado.',
    capabilities: ['Marcaciones de entrada y salida', 'Registro de ubicación y mapas de asistencia', 'Historial personal de marcaciones', 'Gestión de colaboradores', 'Ausencias e incidencias', 'Solicitudes de corrección de horario', 'Configuración de empresa y jornadas', 'Notificaciones operativas'],
    flows: [
      { title: 'Colaborador', text: 'Marca asistencia, consulta su historial y solicita correcciones cuando detecta una incidencia.' },
      { title: 'RRHH / Administración', text: 'Gestiona colaboradores, revisa asistencia, atiende solicitudes y configura reglas de operación.' },
      { title: 'Trazabilidad', text: 'Las marcaciones y cambios quedan conectados a fechas, ubicaciones y estados revisables.' },
    ],
    decisions: [
      { title: 'Separar roles', text: 'La experiencia distingue claramente las necesidades del colaborador y las del equipo administrativo.' },
      { title: 'No exponer complejidad interna', text: 'La landing comunica beneficios y flujos relevantes sin mostrar roles técnicos o de mantenimiento.' },
      { title: 'Revisión antes que automatización', text: 'Las correcciones mantienen intervención humana para evitar cambios opacos.' },
    ],
    evidence: ['Landing pública disponible.', 'Frontend React + Vite con rutas para empleado, administración e historial.', 'Backend Node.js, Express y Prisma con servicios de asistencia, empleados, notificaciones y cambios de horario.', 'Pruebas de contrato específicas para la landing.'],
    limits: ['No se publican cifras de usuarios ni resultados comerciales sin evidencia verificable.', 'El producto se presenta como beta y no como una operación empresarial consolidada.'],
  },
  veterp: {
    slug: 'veterp',
    title: 'VetERP',
    eyebrow: 'Caso 02 / Operación veterinaria',
    status: 'Producto en pruebas',
    summary: 'Un sistema operativo para clínicas veterinarias que conecta agenda, recepción, pacientes, atención clínica, hospitalización, inventario, caja y grooming.',
    publicUrl: 'https://veterp.qzz.io/',
    problem: 'La operación de una clínica veterinaria combina atención clínica, agenda, inventario, cobros y seguimiento. Cuando cada área trabaja por separado, se pierde contexto del paciente y aumenta la fricción entre recepción, consulta y administración.',
    approach: 'VetERP organiza el recorrido desde la cita hasta la atención y el seguimiento, manteniendo conectados clientes, mascotas, historia clínica, órdenes, productos y movimientos operativos.',
    outcome: 'El repositorio contiene módulos funcionales y una landing pública que permiten revisar el alcance real del producto. Se mantiene presentado como producto en pruebas.',
    capabilities: ['Agenda y estados de citas', 'Recepción, turnos y colas', 'Clientes, mascotas e historia clínica', 'Atenciones, signos vitales y adjuntos', 'Hospitalización y tratamientos', 'Inventario, movimientos y kardex', 'Caja, ventas y cortes', 'Grooming y servicios asociados', 'Recordatorios, vacunas y seguimientos', 'Configuración de clínica, personal y proveedores'],
    flows: [
      { title: 'Recepción', text: 'Agenda, confirma y deriva citas hacia los flujos de atención o grooming.' },
      { title: 'Equipo clínico', text: 'Consulta contexto reciente, registra signos vitales, entradas clínicas, tratamientos y seguimientos.' },
      { title: 'Operación', text: 'Inventario, caja, ventas y hospitalización se conectan con el trabajo diario de la clínica.' },
    ],
    decisions: [
      { title: 'Paciente como eje', text: 'La historia y el contexto de la mascota articulan agenda, consulta, hospitalización y seguimiento.' },
      { title: 'Estados explícitos', text: 'Citas, órdenes, grooming y hospitalizaciones usan estados para evitar transiciones ambiguas.' },
      { title: 'Separación por permisos', text: 'Determinadas áreas se restringen según el rol operativo.' },
    ],
    evidence: ['Landing pública disponible.', 'Aplicación Next.js con rutas funcionales para agenda, atención, pacientes, hospitalización, inventario, caja y grooming.', 'Integración con Supabase y acciones de servidor para operaciones clínicas y administrativas.', 'Pruebas de contrato para flujos sensibles de agenda y áreas visuales.'],
    limits: ['No se presenta como caso de éxito de una clínica ni se atribuyen resultados comerciales.', 'El estado público es producto en pruebas; algunas fases futuras siguen indicadas dentro del propio sistema.'],
  },
  localisa: {
    slug: 'localisa',
    title: 'Localisa',
    eyebrow: 'Caso 03 / Información territorial para SERUMS',
    status: 'Plataforma pública',
    summary: 'Una experiencia pública para explorar plazas SERUMS de forma visual, comparar alternativas y reducir fricción al construir una shortlist.',
    publicUrl: 'https://www.localisa.pe/',
    problem: 'Tomar una decisión sobre plazas SERUMS exige comparar ubicación, establecimiento, características de la plaza y contexto histórico. Cuando esa información se consulta de forma fragmentada, comparar opciones y entender el territorio se vuelve lento.',
    approach: 'Localisa organiza la exploración alrededor de un mapa, filtros y herramientas de comparación. La plataforma complementa la consulta de plazas con datos territoriales, favoritos, simulación de puntaje y una sección de transparencia sobre fuentes y precisión.',
    outcome: 'La plataforma está publicada y permite recorrer plazas SERUMS, aplicar filtros, revisar información territorial y organizar opciones. El caso describe el producto verificable y no atribuye resultados de adopción o impacto no documentados.',
    capabilities: ['Mapa interactivo de plazas SERUMS', 'Filtros para explorar alternativas', 'Favoritos para construir una shortlist', 'Comparación de ubicación y rutas', 'Simulación de puntaje', 'Datos históricos, bonos y notas de contexto', 'Coordenadas y datos territoriales enriquecidos', 'Sección pública sobre fuentes y precisión'],
    flows: [
      { title: 'Explorar', text: 'La persona parte del mapa y los filtros para reducir un universo amplio de plazas a opciones relevantes.' },
      { title: 'Comparar', text: 'Revisa ubicación, características y contexto para contrastar alternativas antes de decidir.' },
      { title: 'Priorizar', text: 'Guarda favoritas y utiliza herramientas de apoyo para ordenar una shortlist propia.' },
    ],
    decisions: [
      { title: 'Territorio primero', text: 'La interfaz utiliza el mapa como superficie principal porque la ubicación es una variable central de la decisión.' },
      { title: 'Apoyo, no sustitución', text: 'La plataforma ayuda a comparar y contextualizar; no se presenta como reemplazo de las fuentes oficiales.' },
      { title: 'Transparencia de datos', text: 'Las limitaciones de fuentes y precisión tienen una sección visible para evitar una falsa sensación de certeza.' },
    ],
    evidence: ['Landing y plataforma públicas en localisa.pe.', 'La interfaz pública ofrece mapa, filtros, favoritos, simulación de puntaje y datos enriquecidos.', 'El sitio incluye una sección específica sobre fuentes, precisión y reporte de mejoras.', 'El equipo y la finalidad del producto se presentan públicamente en la propia landing.'],
    limits: ['No se publican aquí métricas de impacto, conversión o resultados de usuarios.', 'La información puede depender de fuentes externas y debe contrastarse cuando una decisión requiera precisión oficial.'],
  },
  'perulog-pallets': {
    slug: 'perulog-pallets',
    title: 'PeruLog Pallets',
    eyebrow: 'Caso 04 / Presencia comercial B2B',
    status: 'Sitio publicado',
    summary: 'Una landing B2B que convierte una oferta logística técnica en una estructura clara de productos, servicios, especificaciones y solicitud de cotización.',
    publicUrl: 'https://perulogpallets.com.pe/',
    problem: 'Una oferta de pallets y servicios logísticos necesita explicar diferencias técnicas, capacidad de abastecimiento y propuesta de valor sin obligar al comprador a reconstruir esa información por otros canales.',
    approach: 'El sitio ordena la propuesta alrededor de continuidad operativa, productos EAN, especificaciones técnicas, servicios y llamadas a cotización. La información comercial se mantiene cerca del punto donde el visitante compara una alternativa.',
    outcome: 'El sitio está publicado y permite revisar la propuesta de valor, productos, especificaciones, servicios y canales de contacto de PeruLog Pallets. No se atribuyen resultados comerciales que no estén documentados públicamente.',
    capabilities: ['Presentación de propuesta de valor logística', 'Catálogo de pallets EAN', 'Especificaciones técnicas por producto', 'Venta y alquiler de pallets', 'Asesoría técnica', 'Abastecimiento continuo', 'Explicación del recorrido de abastecimiento', 'Solicitudes de cotización y contacto comercial'],
    flows: [
      { title: 'Entender la oferta', text: 'El visitante identifica qué problema logístico aborda PeruLog y qué servicios forman parte de la propuesta.' },
      { title: 'Comparar productos', text: 'Las variantes de pallets muestran dimensiones, capacidad y especificaciones para facilitar una evaluación inicial.' },
      { title: 'Cotizar', text: 'Las llamadas a cotización aparecen junto a productos y servicios para reducir pasos entre interés y contacto.' },
    ],
    decisions: [
      { title: 'Especificación cerca del producto', text: 'Los datos técnicos se presentan en el mismo contexto donde el comprador evalúa cada pallet.' },
      { title: 'CTA repetido con intención', text: 'La solicitud de cotización se mantiene disponible a lo largo del recorrido en lugar de depender de un único cierre de página.' },
      { title: 'Narrativa operativa', text: 'La propuesta conecta producto, abastecimiento y continuidad logística para explicar el valor más allá de una pieza aislada.' },
    ],
    evidence: ['Sitio público disponible en perulogpallets.com.pe.', 'La web publica catálogo de pallets, especificaciones técnicas y servicios.', 'La página incluye llamadas visibles a solicitar cotización.', 'La propuesta pública describe venta, alquiler, asesoría y abastecimiento continuo.'],
    limits: ['No se publican métricas de leads, ventas o mejora de conversión sin evidencia verificable.', 'Este caso describe la presencia digital pública; no implica que Orbital opere la logística interna de PeruLog.'],
  },
}

export function isCaseStudySlug(value: string): value is CaseStudySlug {
  return value === 'checkio' || value === 'veterp' || value === 'localisa' || value === 'perulog-pallets'
}
