import { useEffect, useMemo, useRef, useState } from 'react'
import orbitalLogo from './assets/Orbital Frameworks (1).png'
import perulogImg from './assets/PerulogPallets.png'
import lisaImg from './assets/lisa.png'
import checkioImg from './assets/checkio.png'
import wasyImg640 from './assets/wasy-catalog-2026-10-16-640.webp'
import wasyImg from './assets/wasy-catalog-2026-10-16-960.webp'
import { trackContactIntent } from './analytics'
import './App.css'

type NavItem = {
  id: string
  label: string
}

function usePointerParallaxVars() {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let raf = 0
    const setVars = (mx: number, my: number) => {
      el.style.setProperty('--mx', mx.toFixed(4))
      el.style.setProperty('--my', my.toFixed(4))
    }

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / Math.max(1, rect.width)
      const y = (e.clientY - rect.top) / Math.max(1, rect.height)
      const mx = (x - 0.5) * 2
      const my = (y - 0.5) * 2
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setVars(mx, my))
    }

    const onLeave = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setVars(0, 0))
    }

    el.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerleave', onLeave, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return ref
}

function Logo() {
  return (
    <a className="logoMark" href="#inicio" aria-label="Orbital Frameworks">
      <img className="logoImg" src={orbitalLogo} alt="Orbital Frameworks" width={200} height={20} />
    </a>
  )
}

function NavBar({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1101) setOpen(false)
    }
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    let raf = 0
    const update = () => {
      setScrolled(window.scrollY > 20)
    }

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div className={`navShell ${scrolled ? 'isScrolled' : ''}`}>
      <nav className="nav" aria-label="Navegación principal">
        <Logo />

        <button
          className="navToggle"
          type="button"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg viewBox="0 0 24 24" role="presentation" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>

        <div
          className={`navLinks ${open ? 'isOpen' : ''} ${hoveredId ? 'isHovering' : ''}`}
          onMouseLeave={() => setHoveredId(null)}
        >
          {items.map((item) => (
            <a
              key={item.id}
              className={`navLink ${hoveredId === item.id ? 'isHover' : ''}`}
              href={`#${item.id}`}
              onClick={() => setOpen(false)}
              onMouseEnter={() => setHoveredId(item.id)}
              onFocus={() => setHoveredId(item.id)}
              onBlur={() => setHoveredId(null)}
            >
              {item.label}
            </a>
          ))}
          <a
            className={`navLink ${hoveredId === 'blog' ? 'isHover' : ''}`}
            href="/blog/"
            onClick={() => setOpen(false)}
            onMouseEnter={() => setHoveredId('blog')}
            onFocus={() => setHoveredId('blog')}
            onBlur={() => setHoveredId(null)}
          >
            Blog
          </a>
        </div>
      </nav>
    </div>
  )
}

function Cube({ className, size, a, b }: { className?: string; size: number; a: string; b: string }) {
  return (
    <div
      className={`shape shapeCube ${className ?? ''}`}
      style={{ ['--size' as never]: `${size}px`, ['--a' as never]: a, ['--b' as never]: b }}
    >
      <div className="cube" aria-hidden="true">
        <div className="face front" />
        <div className="face back" />
        <div className="face right" />
        <div className="face left" />
        <div className="face top" />
        <div className="face bottom" />
      </div>
    </div>
  )
}

function ScrollHint() {
  return (
    <button
      className="scrollBtn"
      type="button"
      aria-label="Ver servicios"
      onClick={() => {
        const el = document.getElementById('servicios')
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
          return
        }
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
      }}
    >
      <span className="scrollMouse" aria-hidden="true">
        <span className="scrollWheel" />
      </span>
      <span className="scrollText">ver stack</span>
    </button>
  )
}

type ServicePrinciple = { label: string; description: string }
type ServiceOffering = {
  id: string
  index: string
  eyebrow: string
  title: string
  summary: string
  detail: string
  deliverable: string
  bullets: string[]
  href?: string
}

const servicePrinciples: ServicePrinciple[] = [
  {
    label: 'Información dispersa',
    description: 'Cuando hojas de cálculo, mensajes y herramientas aisladas dificultan consultar o seguir una operación.',
  },
  {
    label: 'Tareas repetitivas',
    description: 'Cuando el equipo dedica tiempo a copiar datos, responder lo mismo o coordinar pasos manuales.',
  },
  {
    label: 'Software que no encaja',
    description: 'Cuando las herramientas disponibles no se adaptan a los roles, aprobaciones o flujos del negocio.',
  },
]

const serviceOfferings: ServiceOffering[] = [
  {
    id: 'landing-pages',
    index: '01',
    eyebrow: 'Web comercial / Captación',
    title: 'Webs y landing pages para vender',
    summary: 'Explica lo que ofreces y facilita que un posible cliente te contacte.',
    detail:
      'Organizamos el mensaje, las páginas y los llamados a la acción. Cuidamos el diseño, la lectura móvil y la base técnica para buscadores.',
    deliverable: 'Página comercial con propuesta de valor, servicios y contacto claro.',
    bullets: ['Diseño', 'SEO técnico', 'Contacto'],
    href: '/servicios/landing-pages-b2b/',
  },
  {
    id: 'erp',
    index: '02',
    eyebrow: 'Software a medida / Operaciones',
    title: 'Software para tus procesos',
    summary: 'Reúne información y tareas de tu empresa en un sistema pensado para tu operación.',
    detail:
      'Diseñamos paneles, registros, roles y flujos de aprobación cuando una herramienta estándar no cubre lo que el negocio necesita.',
    deliverable: 'Sistema web con funciones y permisos definidos según el alcance.',
    bullets: ['Sistemas web', 'Gestión', 'Integraciones'],
    href: '/servicios/desarrollo-software-medida/',
  },
  {
    id: 'bots',
    index: '03',
    eyebrow: 'Automatización / Integración / IA',
    title: 'Automatización e IA aplicada',
    summary: 'Detecta tareas repetitivas y evalúa dónde una automatización o la IA puede ayudar.',
    detail:
      'Partimos del proceso, sus datos y sus excepciones. Luego definimos si conviene integrar herramientas, crear un flujo automatizado o incorporar IA con supervisión.',
    deliverable: 'Flujo de automatización o diagnóstico de integración según el caso.',
    bullets: ['Procesos', 'Integraciones', 'IA evaluada'],
    href: '/servicios/automatizacion-procesos/',
  },
  {
    id: 'internal-systems',
    index: '04',
    eyebrow: 'Mejora de sistemas / Continuidad',
    title: 'Mejora de herramientas existentes',
    summary: 'No siempre hace falta construir desde cero: también podemos revisar lo que ya utilizas.',
    detail:
      'Evaluamos sistemas internos, integraciones y necesidades de ampliación para decidir qué mantener, adaptar o desarrollar.',
    deliverable: 'Alcance de mejora, integración o soporte según la necesidad.',
    bullets: ['Diagnóstico', 'Mejoras', 'Soporte'],
  },
]

const serviceSequence = [
  'Diagnóstico y definición del servicio',
  'Diseño de estructura y solución',
  'Desarrollo e implementación',
  'Ajustes, soporte y evolución',
]

function ServicesSection() {
  return (
    <section id="servicios" className="services">
      <div className="servicesShell">
        <header className="servicesHero">
          <div className="servicesHeroCopy">
            <div className="servicesKicker">Qué podemos resolver / Orbital</div>
            <h2 className="servicesTitle">¿Qué necesita mejorar tu empresa?</h2>
          </div>

          <div className="servicesHeroMeta">
            <p className="servicesLead">
              Desde una web que explique mejor tu oferta hasta un proceso interno que necesite menos trabajo manual.
            </p>

            <aside className="servicesManifesto">
              <span className="servicesManifestoLabel">Nuestro criterio</span>
              <p className="servicesManifestoText">
                No recomendamos una herramienta sin entender primero el problema. A veces basta con mejorar lo que ya existe.
              </p>
              <div className="servicesManifestoMeta">
                <div>
                  <span>SOLUCIONES</span>
                  <strong>Webs comerciales, software a medida, automatizaciones e integraciones</strong>
                </div>
                <div>
                  <span>PRIMER PASO</span>
                  <strong>Cuéntanos el proceso y qué resultado necesitas conseguir</strong>
                </div>
              </div>
            </aside>
          </div>
        </header>

        <div className="servicesBody">
          <aside className="servicesRail">
            <div className="servicesRailLabel">Señales de que podemos ayudar</div>
            <div className="servicesRailList">
              {servicePrinciples.map((principle) => (
                <article key={principle.label} className="servicesRailItem">
                  <h3>{principle.label}</h3>
                  <p>{principle.description}</p>
                </article>
              ))}
            </div>
            <a className="servicesPrimaryLink" href="#proyectos">Ver ejemplos de lo que construimos</a>
          </aside>

          <div className="servicesGrid">
            {serviceOfferings.map((service, index) => (
              <a
                key={service.id}
                className="serviceCard"
                data-variant={String(index + 1)}
                href={service.href ?? '#contacto'}
                aria-label={service.href ? `Ver servicio: ${service.title}` : 'Consultar por sistemas y servicios internos'}
              >
                <div className="serviceCardTop">
                  <span className="serviceCardIndex">{service.index}</span>
                  <span className="serviceCardEyebrow">{service.eyebrow}</span>
                </div>
                <h3 className="serviceCardTitle">{service.title}</h3>
                <p className="serviceCardSummary">{service.summary}</p>
                <p className="serviceCardDetail">{service.detail}</p>
                <div className="serviceCardFooter">
                  <div className="serviceCardDeliverable">
                    <span>Entregable</span>
                    <strong>{service.deliverable}</strong>
                  </div>
                  <div className="serviceCardTags">
                    {service.bullets.map((bullet) => <span key={bullet} className="serviceCardTag">{bullet}</span>)}
                  </div>
                  <span className="serviceCardLink">
                    {service.href ? 'Ver página del servicio →' : 'Consultar por sistemas internos →'}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="servicesSequence">
          <div className="servicesSequenceLabel">Secuencia de entrega</div>
          <div className="servicesSequenceGrid">
            {serviceSequence.map((step, index) => (
              <div key={step} className="servicesSequenceItem">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{step}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="servicesClosure">
          <p>Si el sistema necesita verse mejor, ordenar mejor la operación y vender mejor al mismo tiempo, ahí es donde entramos.</p>
          <a className="servicesClosureLink" href="#contacto">Hablemos del próximo sistema</a>
        </div>
      </div>
    </section>
  )
}

type WorkItem = {
  title: string
  kind: string
  imageSrc?: string
  imageSrcSet?: string
  url: string
  external?: boolean
  description: string
  tags: string[]
  featured?: boolean
  tone: 'red' | 'teal' | 'mix'
  sector: string
  status: string
  impact: string
}

const workItems: WorkItem[] = [
  {
    title: 'Localisa',
    kind: 'Web',
    url: '/casos/localisa/',
    imageSrc: lisaImg,
    description: 'Plataforma pública con mapa y filtros para consultar plazas SERUMS en distintas regiones del Perú.',
    tags: ['Mapa interactivo', 'SERUMS', 'Información territorial'],
    tone: 'red',
    sector: 'Información geográfica',
    status: 'Mapa interactivo',
    impact: 'Facilita la búsqueda y comparación de plazas mediante información territorial.',
  },
  {
    title: 'Wasy — Mercado digital',
    kind: 'Web',
    url: '/casos/wasy/',
    imageSrc: wasyImg,
    imageSrcSet: `${wasyImg640} 640w, ${wasyImg} 960w`,
    description: 'Catálogo público con carrito y continuación del pedido por WhatsApp.',
    tags: ['Catálogo web', 'Pedido por WhatsApp', 'App móvil'],
    featured: true,
    tone: 'teal',
    sector: 'Mercado digital',
    status: 'Catálogo web',
    impact: '',
  },
  {
    title: 'Checkio — Gestión de personal',
    kind: 'App',
    imageSrc: checkioImg,
    url: '/casos/checkio/',
    description: 'Plataforma para gestionar personal, asistencia, ausencias y marcaciones con geolocalización.',
    tags: ['Control de asistencia', 'Gestión de personal', 'SaaS'],
    featured: true,
    tone: 'teal',
    sector: 'Tecnología RRHH',
    status: 'Gestión de RR. HH.',
    impact: 'Operación diaria con trazabilidad y control de asistencia.',
  },
  {
    title: 'PeruLog Pallets',
    kind: 'Landing',
    url: '/casos/perulog-pallets/',
    imageSrc: perulogImg,
    description: 'Landing comercial B2B para explicar servicios, propuesta de valor y canales de contacto.',
    tags: ['UI/UX Design', 'B2B', 'Web Development'],
    featured: true,
    tone: 'mix',
    sector: 'Crecimiento B2B',
    status: 'Soluciones B2B',
    impact: 'Presencia digital enfocada en captación y posicionamiento comercial.',
  },
]

function WorkCard({ item, index }: { item: WorkItem; index: number }) {
  const isWasy = item.url === '/casos/wasy/'
  const tone = item.tone === 'red'
    ? { ['--g1' as never]: 'rgba(255,42,42,0.95)', ['--g2' as never]: 'rgba(16,42,67,0.2)' }
    : item.tone === 'teal'
      ? { ['--g1' as never]: 'rgba(0,210,211,0.95)', ['--g2' as never]: 'rgba(16,42,67,0.2)' }
      : { ['--g1' as never]: 'rgba(0,210,211,0.9)', ['--g2' as never]: 'rgba(255,42,42,0.78)' }

  const cardLabel = `${String(index + 1).padStart(2, '0')} / ${item.sector}`
  const destinationLabel = item.url.startsWith('/casos/') ? 'Ver caso completo ↗' : 'Ver sitio publicado ↗'

  return (
    <a
      className={`workCard ${item.featured ? 'isFeatured' : ''}`}
      style={tone}
      href={item.url}
      target={item.external ? '_blank' : undefined}
      rel={item.external ? 'noopener noreferrer' : undefined}
      data-index={String(index + 1).padStart(2, '0')}
    >
      <div className="workMedia">
        <img
          src={item.imageSrc}
          srcSet={item.imageSrcSet}
          sizes={item.imageSrcSet ? '(max-width: 640px) 100vw, 50vw' : undefined}
          alt={item.title.startsWith('Wasy') ? 'Captura del catálogo web de Wasy con productos y carrito' : `Vista de ${item.title}`}
          loading="lazy"
          width={item.imageSrcSet ? 960 : 640} height={item.imageSrcSet ? 704 : 360}
          decoding="async"
        />
        <div className="workMediaOverlay">
          <div className="workMediaEyebrow">{cardLabel}</div>
          <div className="workMediaTitle">{item.title}</div>
          <div className="workMediaSub">{item.status}</div>
        </div>
        <div className="workTop">
          <div className="workMeta"><span className="workKind">{item.kind}</span></div>
          <div className="workGlow" aria-hidden="true" />
        </div>
      </div>

      <div className="workBody">
        <div className="workIndex">{cardLabel}</div>
        <h3 className="workTitle">{item.title}</h3>
        <p className="workDesc">{item.description}</p>
        {!isWasy && item.impact && <p className="workImpact">{item.impact}</p>}
        <div className="workTags">
          {item.tags.map((tag) => (
            <span key={tag} className="workTag">{tag}</span>
          ))}
        </div>
        <span className="workCaseLink">{destinationLabel}</span>
      </div>
    </a>
  )
}

function PortfolioSection() {
  return (
    <section id="proyectos" className="portfolio">
      <div className="portfolioInner">
        <header className="portfolioHead">
          <div className="portfolioIntro">
            <div className="portfolioKicker">Sistemas seleccionados</div>
            <h2 className="portfolioTitle">Casos donde la forma, el flujo y la operación responden a una misma idea.</h2>
            <p className="portfolioSub">Cada pieza resuelve una necesidad concreta de negocio, experiencia u operación.</p>
          </div>
          <p className="portfolioSummary">Cuatro proyectos en RRHH, mercado digital, información territorial y presencia comercial.</p>
        </header>

        <div className="portfolioSplit">
          <aside className="portfolioRobot" aria-hidden="true">
            <div className="portfolioNote">
              <span className="portfolioNoteLine" />
              <p>Seleccionamos proyectos donde interfaz, lógica y operación sostienen una misma solución.</p>
            </div>
            <picture>
              <source type="image/webp" srcSet="/portfolio/astro-480.webp 480w, /portfolio/astro-720.webp 720w" sizes="(max-width: 768px) 78vw, 370px" />
              <img className="portfolioRobotImg" src="/portfolio/astro-720.webp" alt="" loading="lazy" width={600} height={806} decoding="async" />
            </picture>
          </aside>

          <div className="portfolioProjects">
            <div className="workGrid">
              {workItems.map((item, index) => <WorkCard key={item.title} item={item} index={index} />)}
            </div>
          </div>
        </div>

        <div className="portfolioCta">
          <div className="portfolioCtaCopy">
            <span className="portfolioCtaLabel">Casos completos</span>
            <p>Revisa el problema, el alcance, los flujos y las decisiones detrás de los cuatro proyectos seleccionados.</p>
          </div>
          <div className="portfolioCtaActions">
            <a className="btn btnGhost" href="/evidencia/">Ver evidencia</a>
            <a className="btn btnGhost" href="/casos/localisa/">Caso Localisa</a>
            <a className="btn btnGhost" href="/casos/wasy/">Caso Wasy</a>
            <a className="btn btnGhost" href="/casos/checkio/">Caso Checkio</a>
            <a className="btn btnGhost" href="/casos/perulog-pallets/">Caso PeruLog</a>
            <a className="btn btnPrimary" href="#contacto">Plantear un caso</a>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProcessSection() {
  const steps = [
    {
      index: '01',
      title: 'Entender la situación',
      text: 'Revisamos qué ocurre hoy, qué parte del flujo genera fricción y por qué vale la pena intervenir.',
    },
    {
      index: '02',
      title: 'Acotar el cambio',
      text: 'Definimos qué conviene mejorar, qué debe mantenerse intacto y cómo sabremos si el trabajo funcionó.',
    },
    {
      index: '03',
      title: 'Construir evidencia',
      text: 'Diseñamos y desarrollamos una solución verificable antes de ampliar el alcance o añadir complejidad.',
    },
    {
      index: '04',
      title: 'Cerrar el siguiente paso',
      text: 'La conversación termina con una decisión concreta: avanzar, aclarar información o no construir todavía.',
    },
  ]

  return (
    <section id="como-trabajamos" className="processSection">
      <div className="processInner">
        <header className="processIntro">
          <div className="processKicker">Cómo trabajamos / Primera conversación</div>
          <h2 className="processTitle">Del problema a una solución con alcance claro.</h2>
          <p className="processLead">Nos cuentas qué tarea o proceso necesitas mejorar. Revisamos el contexto y evaluamos si conviene adaptar una herramienta, automatizar un paso o desarrollar software.</p>
        </header>

        <div className="processGrid">
          {steps.map((step) => (
            <article key={step.index} className="processCard">
              <span className="processIndex">{step.index}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>

        <div className="processBoundary">
          <div>
            <span>Qué no hacemos</span>
            <strong>No forzamos una propuesta antes de entender el contexto.</strong>
          </div>
          <div>
            <span>Qué buscamos</span>
            <strong>Un alcance claro, evidencia revisable y un siguiente paso explícito.</strong>
          </div>
          <a className="btn btnPrimary" href="#contacto">Plantear una situación concreta</a>
        </div>
      </div>
    </section>
  )
}

function OrbitalLeadsSection() {
  return (
    <section className="orbitalLeadsSection" aria-labelledby="orbital-leads-title">
      <div className="orbitalLeadsInner">
        <div className="orbitalLeadsIntro">
          <div className="orbitalLeadsKicker">Herramienta interna / Orbital Frameworks</div>
          <h2 id="orbital-leads-title">Orbital Leads</h2>
          <p>
            Orbital Leads es una herramienta interna de Orbital Frameworks para investigación comercial,
            gestión de oportunidades y preparación o gestión de comunicaciones empresariales.
          </p>
        </div>
        <div className="orbitalLeadsDetails">
          <p>
            Su integración con Gmail se utiliza únicamente con una cuenta autorizada de Orbital Frameworks
            para preparar y gestionar borradores, reconciliar conversaciones, detectar respuestas, rebotes u
            opt-outs y mantener el estado operativo necesario para revisión humana.
          </p>
          <p>
            Orbital Leads no realiza envíos automáticos ni contactos sin aprobación humana. Cualquier envío
            que se habilite requiere autorización expresa del propietario.
          </p>
          <div className="orbitalLeadsLinks">
            <a href="/privacy">Política de privacidad</a>
            <a href="/terms">Términos de uso</a>
          </div>
        </div>
      </div>
    </section>
  )
}

function TeamSection() {
  const people = [
    {
      initials: 'AR',
      name: 'Angel Reaño',
      role: 'Producto, operaciones y dirección de proyectos',
      description: 'Coordina la definición de problemas, el alcance de las soluciones y la ejecución de los proyectos de Orbital Frameworks.',
      linkedin: 'https://www.linkedin.com/in/angelreañovasquez/',
    },
    {
      initials: 'MM',
      name: 'Mathias Javier Murillo',
      role: 'Desarrollo de software y producto',
      description: 'Desarrollador vinculado a Checkio y Localisa, con trabajo en productos digitales y construcción de software.',
      linkedin: 'https://www.linkedin.com/in/mathias-javier-murillo-744508350/',
    },
  ]

  return (
    <section id="equipo" className="teamSection">
      <div className="teamInner">
        <header className="teamIntro">
          <div className="teamKicker">Quiénes somos / Orbital Frameworks</div>
          <h2>Un equipo pequeño, con participación directa en cada proyecto.</h2>
          <p>Orbital no separa la conversación comercial de las decisiones de producto y desarrollo. Las personas que entienden el problema también participan en la definición y revisión de la solución.</p>
          <a className="teamAboutLink" href="/sobre-orbital-frameworks/">Conocer Orbital Frameworks ↗</a>
        </header>
        <div className="teamGrid">
          {people.map((person, index) => (
            <article key={person.name} className="teamCard">
              <div className="teamCardTop">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div className="teamInitials" aria-hidden="true">{person.initials}</div>
              </div>
              <h3>{person.name}</h3>
              <strong>{person.role}</strong>
              <p>{person.description}</p>
              <a href={person.linkedin} target="_blank" rel="noopener noreferrer">Ver LinkedIn ↗</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ContactSection() {
  const [emailCopied, setEmailCopied] = useState(false)
  const gmailComposeUrl = 'https://mail.google.com/mail/?view=cm&fs=1&to=contact.orbitalframeworks%40gmail.com&su=Revisar%20una%20situaci%C3%B3n%20-%20Orbital%20Frameworks&body=Negocio%3A%0A%0ASituaci%C3%B3n%20actual%3A%0A%0AC%C3%B3mo%20se%20resuelve%20hoy%3A%0A%0AResultado%20que%20tendr%C3%ADa%20valor%3A%0A'

  const copyEmail = async () => {
    let copied = false
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText('contact.orbitalframeworks@gmail.com')
        copied = true
      }
    } catch {
      // Fallback for environments where clipboard write permission is restricted
    }
    if (!copied) {
      try {
        const textarea = document.createElement('textarea')
        textarea.value = 'contact.orbitalframeworks@gmail.com'
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        copied = document.execCommand('copy')
        document.body.removeChild(textarea)
      } catch {
        // Fallback failed
      }
    }
    if (copied) {
      setEmailCopied(true)
      trackContactIntent('copy_email')
      window.setTimeout(() => setEmailCopied(false), 2200)
    }
  }

  return (
    <section id="contacto" className="contact">
      <div className="contactInner">
        <div className="contactIntro">
          <div className="contactKicker">Contacto / Orbital Frameworks</div>
          <h2 className="contactTitle">Cuéntanos qué proceso necesita mejorar tu empresa.</h2>
          <p className="contactLead">¿Usan demasiadas hojas de cálculo? ¿Hay tareas manuales que se repiten? ¿Necesitan un sistema, una web comercial o evaluar una integración con IA? Describe la situación y revisaremos por dónde empezar.</p>
        </div>

        <div className="contactPanel">
          <div className="contactBlock">
            <span>Qué incluir en el mensaje</span>
            <strong>Tu negocio, la situación observada, cómo se resuelve hoy y qué cambio sería valioso.</strong>
          </div>
          <div className="contactBlock">
            <span>Qué ocurre después</span>
            <strong>Revisamos el contexto y respondemos para aclarar información o coordinar una conversación breve.</strong>
          </div>
          <div className="contactBlock">
            <span>Canales verificables</span>
            <a href="mailto:contact.orbitalframeworks@gmail.com">contact.orbitalframeworks@gmail.com</a>
            <a href="https://www.linkedin.com/company/orbitalframeworks/" target="_blank" rel="noopener noreferrer">LinkedIn de Orbital Frameworks</a>
          </div>
          <div className="contactActions">
            <a className="btn btnPrimary" href={gmailComposeUrl} target="_blank" rel="noopener noreferrer">Consultar por correo ↗</a>
            <button className="btn btnGhost" type="button" data-analytics-action="copy_email" onClick={copyEmail}>{emailCopied ? 'Correo copiado' : 'Copiar correo'}</button>
            <a className="btn btnGhost" href="#proyectos">Revisar proyectos</a>
          </div>
        </div>
      </div>
      <footer className="siteFooter">
        <div className="siteFooterBrand">
          <Logo />
          <p>Desarrollo de software y soluciones digitales en Perú.</p>
        </div>
        <div className="siteFooterLinks" aria-label="Enlaces del footer">
          <a href="/">Home</a>
          <a href="#servicios">Servicios</a>
          <a href="#proyectos">Casos</a>
          <a href="/evidencia/">Evidencia</a>
          <a href="/blog/">Blog</a>
          <a href="#como-trabajamos">Método</a>
          <a href="#equipo">Equipo</a>
          <a href="/sobre-orbital-frameworks/">Sobre Orbital</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="https://www.linkedin.com/company/orbitalframeworks/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
        </div>
        <div className="siteFooterMeta">
          <span>Orbital Frameworks</span>
          <span>2026 · Perú</span>
        </div>
      </footer>
    </section>
  )
}

function Hero() {
  const heroRef = usePointerParallaxVars()
  const pyramidRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const hero = heroRef.current
    const pyramid = pyramidRef.current
    if (!hero || !pyramid) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduceMotion.matches) return

    let raf = 0
    let last = performance.now()
    let x = 0
    let y = 0
    let vx = 160
    let vy = 120
    let minX = 0
    let maxX = 0
    let minY = 0
    let maxY = 0
    let isVisible = true
    let isRunning = false

    const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

    const computeBounds = () => {
      const hr = hero.getBoundingClientRect()
      const pr = pyramid.getBoundingClientRect()
      const nav = document.querySelector<HTMLElement>('.navShell')
      const navH = nav ? nav.getBoundingClientRect().height : 0
      const safeTop = navH + 12
      const safeBottom = 90

      minX = pr.width / 2 - hr.width / 2
      maxX = hr.width / 2 - pr.width / 2
      minY = safeTop + pr.height / 2 - hr.height / 2
      maxY = hr.height / 2 - safeBottom - pr.height / 2

      if (minX > maxX) minX = maxX = 0
      if (minY > maxY) minY = maxY = 0

      x = clamp(x, minX, maxX)
      y = clamp(y, minY, maxY)
    }

    const setVars = () => {
      pyramid.style.setProperty('--bx', `${x.toFixed(2)}px`)
      pyramid.style.setProperty('--by', `${y.toFixed(2)}px`)
    }

    const start = () => {
      if (isRunning) return
      isRunning = true
      last = performance.now()
      raf = requestAnimationFrame(step)
    }

    const stop = () => {
      if (!isRunning) return
      isRunning = false
      if (raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    }

    const step = (now: number) => {
      if (!isRunning || !isVisible) {
        isRunning = false
        raf = 0
        return
      }
      raf = requestAnimationFrame(step)
      const dt = Math.min(0.033, (now - last) / 1000)
      last = now
      x += vx * dt
      y += vy * dt

      if (x > maxX) { x = maxX; vx = -Math.abs(vx) }
      else if (x < minX) { x = minX; vx = Math.abs(vx) }
      if (y > maxY) { y = maxY; vy = -Math.abs(vy) }
      else if (y < minY) { y = minY; vy = Math.abs(vy) }
      setVars()
    }

    computeBounds()
    setVars()

    const io = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver((entries) => {
          for (const entry of entries) {
            isVisible = entry.isIntersecting
            if (isVisible) start()
            else stop()
          }
        }, { threshold: 0.05 })
      : null

    if (io) {
      io.observe(hero)
    } else {
      start()
    }

    const onResize = () => computeBounds()
    window.addEventListener('resize', onResize, { passive: true })
    const ro = new ResizeObserver(() => computeBounds())
    ro.observe(hero)

    return () => {
      stop()
      if (io) io.disconnect()
      window.removeEventListener('resize', onResize)
      ro.disconnect()
    }
  }, [heroRef])

  return (
    <header ref={(node) => { heroRef.current = node }} className="hero" id="inicio" style={{ ['--mx' as never]: '0', ['--my' as never]: '0' }}>
      <div className="heroGlow" aria-hidden="true" />
      <div className="heroGridLines" aria-hidden="true" />

      <div className="heroInner">
        <div className="heroCopy">
          <p className="heroKicker">Software a medida · Automatización · IA aplicada / Perú</p>
          <h1 className="heroTitle" aria-label="Software para tu empresa">
            <span>SOFTWARE</span><span>PARA TU</span><span>EMPRESA<span className="heroCursor" aria-hidden="true">._</span></span>
          </h1>
          <p className="heroLead">Desarrollamos sistemas para digitalizar procesos, conectar información y reducir trabajo repetitivo. También evaluamos cuándo la automatización o la IA realmente aportan valor.</p>
          <div className="heroActions">
            <a className="btn btnPrimary" href="#contacto">Cuéntanos qué necesitas resolver</a>
            <a className="btn btnGhost" href="#proyectos">Ver proyectos reales</a>
          </div>
        </div>

        <aside className="heroPanel">
          <div className="heroPanelLabel">¿Por dónde empezamos?</div>
          <p className="heroPanelText">Entendemos cómo funciona tu empresa antes de decidir qué tecnología necesitas.</p>
          <div className="heroPanelList">
            <div><span>SI NECESITAS</span><strong>Ordenar tareas, información o procesos internos</strong></div>
            <div><span>PODEMOS EVALUAR</span><strong>Software propio, integraciones, automatización e IA</strong></div>
            <div><span>PRIMER CONTACTO</span><strong>Cuéntanos el problema y el resultado que buscas</strong></div>
          </div>
        </aside>

        <div className="heroShapes" aria-hidden="true">
          <div className="pyramid" ref={(node) => { pyramidRef.current = node }} style={{ ['--bx' as never]: '0px', ['--by' as never]: '0px' }}>
            <Cube className="p1" size={210} a="var(--orbital-red)" b="var(--orbital-red)" />
            <Cube className="p2" size={210} a="var(--orbital-red)" b="var(--orbital-red)" />
            <Cube className="p3" size={210} a="var(--orbital-red)" b="var(--orbital-red)" />
          </div>
        </div>
      </div>

      <ScrollHint />
    </header>
  )
}

function App() {
  const items = useMemo<NavItem[]>(() => [
    { id: 'inicio', label: 'Inicio' },
    { id: 'servicios', label: 'Servicios' },
    { id: 'proyectos', label: 'Proyectos' },
    { id: 'como-trabajamos', label: 'Método' },
    { id: 'equipo', label: 'Equipo' },
    { id: 'contacto', label: 'Contacto' },
  ], [])

  return (
    <>
      <NavBar items={items} />
      <Hero />
      <ServicesSection />
      <PortfolioSection />
      <ProcessSection />
      <OrbitalLeadsSection />
      <TeamSection />
      <ContactSection />
    </>
  )
}

export default App
