export type CaseStudySlug = 'checkio' | 'veterp'

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
}

export function isCaseStudySlug(value: string): value is CaseStudySlug {
  return value === 'checkio' || value === 'veterp'
}
