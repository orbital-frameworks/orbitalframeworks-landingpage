import { useEffect, useMemo, useRef, useState } from 'react'
import orbitalLogo from './assets/Orbital Frameworks (1).png'
import astroImg from './assets/Astro showing.png'
import perulogImg from './assets/PerulogPallets.png'
import lisaImg from './assets/lisa.png'
import checkioImg from './assets/checkio.png'
import veterpSisImg from './assets/veterp_sis.png'
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
      <img className="logoImg" src={orbitalLogo} alt="Orbital Frameworks" />
    </a>
  )
}

function NavBar({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 860) setOpen(false)
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
        </div>
      </nav>
    </div>
  )
}

function Cube({
  className,
  size,
  a,
  b,
}: {
  className?: string
  size: number
  a: string
  b: string
}) {
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
      aria-label="Scroll"
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

type ServicePrinciple = {
  label: string
  description: string
}

type ServiceOffering = {
  id: string
  index: string
  eyebrow: string
  title: string
  summary: string
  detail: string
  deliverable: string
  bullets: string[]
}

const servicePrinciples: ServicePrinciple[] = [
  {
    label: 'Narrativa primero',
    description: 'Cada sección nace de una intención comercial concreta: posicionar, explicar, convertir o cerrar.',
  },
  {
    label: 'Diseño con estructura',
    description: 'La estética no se separa de la lógica. Tipografía, layout y sistema visual nacen junto a la arquitectura.',
  },
  {
    label: 'Construcción operativa',
    description: 'Pensamos en equipos, procesos y escalabilidad desde el día uno, no después del primer lanzamiento.',
  },
]

const serviceOfferings: ServiceOffering[] = [
  {
    id: 'landing-pages',
    index: '01',
    eyebrow: 'Marketing / Conversion / Presencia',
    title: 'Landing Page',
    summary: 'Diseñamos y desarrollamos landing pages enfocadas en conversión, presencia de marca y captación de clientes.',
    detail:
      'Trabajamos estructura comercial, jerarquía visual, responsive y velocidad para que la página no solo se vea bien, sino que también venda mejor.',
    deliverable: 'Landing page lista para campañas, posicionamiento o captación comercial.',
    bullets: ['Diseño visual', 'Conversion', 'Responsive'],
  },
  {
    id: 'erp',
    index: '02',
    eyebrow: 'ERP / Operaciones / Gestion',
    title: 'Sistemas empresariales de gestion',
    summary: 'Construimos sistemas para ordenar procesos, centralizar información y mejorar la operación diaria de una empresa.',
    detail:
      'Desarrollamos módulos, paneles administrativos, flujos internos y herramientas de control pensadas para crecimiento, trazabilidad y eficiencia.',
    deliverable: 'Sistema de gestion adaptado a la operacion real del negocio.',
    bullets: ['ERP', 'Paneles', 'Control operativo'],
  },
  {
    id: 'bots',
    index: '03',
    eyebrow: 'Bots / Automatizacion / Mensajeria',
    title: 'Bots de automatizacion',
    summary: 'Creamos bots y automatizaciones para WhatsApp, Telegram, Instagram y otros canales de atención o venta.',
    detail:
      'Automatizamos respuestas, captación, seguimiento y procesos repetitivos para que tu negocio gane tiempo, consistencia y capacidad de atención.',
    deliverable: 'Bots conectados a flujos reales de atencion, ventas o soporte.',
    bullets: ['WhatsApp', 'Telegram', 'Instagram'],
  },
  {
    id: 'internal-systems',
    index: '04',
    eyebrow: 'Interno / Empresa / Soporte',
    title: 'Sistemas y servicios internos',
    summary: 'Diseñamos soluciones internas para empresas que necesitan ordenar procesos, equipos, seguimiento o servicios operativos.',
    detail:
      'También apoyamos en mejoras, ampliaciones o mantenimiento de sistemas existentes cuando la operación necesita continuidad y soporte técnico.',
    deliverable: 'Herramientas internas y soporte evolutivo alineados a la empresa.',
    bullets: ['Intranet', 'Soporte', 'Mantenimiento'],
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
            <div className="servicesKicker">Stack de servicios Orbital</div>
            <h2 className="servicesTitle">Servicios construidos como sistemas claros, visuales y operativos.</h2>
          </div>

          <div className="servicesHeroMeta">
            <p className="servicesLead">
              Ofrecemos soluciones digitales enfocadas en captación, gestión empresarial, automatización y operación interna para negocios que necesitan verse y funcionar mejor.
            </p>

            <aside className="servicesManifesto">
              <span className="servicesManifestoLabel">Manifiesto</span>
              <p className="servicesManifestoText">
                No vendemos “solo diseño” ni “solo desarrollo”. Diseñamos productos que se sienten premium y funcionan bajo presión operativa.
              </p>
              <div className="servicesManifestoMeta">
                <div>
                  <span>FORMATO</span>
                  <strong>Landing pages, sistemas empresariales, bots y servicios internos</strong>
                </div>
                <div>
                  <span>FIRMA</span>
                  <strong>Soluciones claras, funcionales y con presencia visual</strong>
                </div>
              </div>
            </aside>
          </div>
        </header>

        <div className="servicesBody">
          <aside className="servicesRail">
            <div className="servicesRailLabel">Cómo pensamos</div>
            <div className="servicesRailList">
              {servicePrinciples.map((principle) => (
                <article key={principle.label} className="servicesRailItem">
                  <h3>{principle.label}</h3>
                  <p>{principle.description}</p>
                </article>
              ))}
            </div>
            <a className="servicesPrimaryLink" href="#proyectos">
              Ver proyectos seleccionados
            </a>
          </aside>

          <div className="servicesGrid">
            {serviceOfferings.map((service, index) => (
              <article key={service.id} className="serviceCard" data-variant={String(index + 1)}>
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
                    {service.bullets.map((bullet) => (
                      <span key={bullet} className="serviceCardTag">
                        {bullet}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
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
          <p>
            Si el sistema necesita verse mejor, ordenar mejor la operación y vender mejor al mismo tiempo, ahí es donde entramos.
          </p>
          <a className="servicesClosureLink" href="#contacto">
            Hablemos del próximo sistema
          </a>
        </div>
      </div>
    </section>
  )
}

type WorkItem = {
  title: string
  kind: string
  imageSrc: string
  url?: string
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
    title: 'Checkio - Sistema de gestion de personal',
    kind: 'App',
    imageSrc: checkioImg,
    description: 'Plataforma de RRHH para gestionar personal, asistencia, ausencias integrada con geolocalizacón en marcaciones.',
    tags: ['Beta', '+200 usuarios activos', 'SAAS'],
    featured: true,
    tone: 'teal',
    sector: 'Tecnologia RRHH',
    status: 'Beta privada',
    impact: 'Operación diaria con trazabilidad y control de asistencia.',
  },
  {
    title: 'VetERP-Enterprise Resource Planning',
    kind: 'App',
    imageSrc: veterpSisImg,
    description: 'Sistema ERP para gestion operativa de clinicas veterinarias, agenda, inventario y seguimiento de pacientes.',
    tags: ['ERP', 'Veterinaria', 'Operaciones'],
    featured: true,
    tone: 'teal',
    sector: 'Salud operativa',
    status: 'Suite operativa',
    impact: 'Centraliza agenda, pacientes e inventario en un mismo flujo.',
  },
  {
    title: 'Localisa',
    kind: 'Web',
    url: '',
    imageSrc: lisaImg,
    description: 'Mapa interactivo para localización de plazas de Serumistas del todo el Perú',
    tags: ['+700mil visitas', 'Respaldado por CMP', '+15mil usuarios activos'],
    tone: 'red',
    sector: 'Plataforma civica',
    status: 'Producción',
    impact: 'Acceso público a información territorial a gran escala.',
  },
  {
    title: 'PeruLog Pallets',
    kind: 'Landing',
    url: 'https://perulogpallets.com.pe/',
    imageSrc: perulogImg,
    description: 'Desarrollamos la plataforma digital de Peru Log Pallets, enfocándonos en la optimización de procesos de captación B2B.',
    tags: ['UI/UX Design', 'B2B Strategy', 'Web Development'],
    featured: true,
    tone: 'mix',
    sector: 'Crecimiento B2B',
    status: 'Lanzamiento comercial',
    impact: 'Landing comercial enfocada en captación y posicionamiento.',
  },
]

function WorkCard({ item, index }: { item: WorkItem; index: number }) {
  const tone =
    item.tone === 'red'
      ? { ['--g1' as never]: 'rgba(255,42,42,0.95)', ['--g2' as never]: 'rgba(16,42,67,0.2)' }
      : item.tone === 'teal'
        ? { ['--g1' as never]: 'rgba(0,210,211,0.95)', ['--g2' as never]: 'rgba(16,42,67,0.2)' }
        : {
            ['--g1' as never]: 'rgba(0,210,211,0.9)',
            ['--g2' as never]: 'rgba(255,42,42,0.78)',
          }

  const tagAccentRgbs = ['0, 210, 211', '255, 42, 42', '245, 245, 245'] as const
  const usedAccents = new Set<number>()
  const hashTag = (s: string) => {
    let h = 0
    for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0
    return h
  }
  const pickAccent = (tag: string) => {
    const base = hashTag(tag) % tagAccentRgbs.length
    let idx = base
    for (let tries = 0; tries < tagAccentRgbs.length; tries += 1) {
      if (!usedAccents.has(idx)) break
      idx = (idx + 1) % tagAccentRgbs.length
    }
    usedAccents.add(idx)
    return tagAccentRgbs[idx] ?? tagAccentRgbs[2]
  }
  const accentByTag = new Map<string, string>()
  item.tags.forEach((t) => {
    accentByTag.set(t, pickAccent(t))
  })
  const cardLabel = `${String(index + 1).padStart(2, '0')} / ${item.sector}`

  const cardContent = (
    <>
      <div className="workMedia">
        <img src={item.imageSrc} alt={item.title} loading="lazy" />

        <div className="workMediaOverlay">
          <div className="workMediaEyebrow">{cardLabel}</div>
          <div className="workMediaTitle">{item.title}</div>
          <div className="workMediaSub">{item.status}</div>
        </div>

        <div className="workTop">
          <div className="workMeta">
            <span className="workKind">{item.kind}</span>
          </div>
          <div className="workGlow" aria-hidden="true" />
        </div>
      </div>

      <div className="workBody">
        <div className="workIndex">{cardLabel}</div>
        <h3 className="workTitle">{item.title}</h3>
        <p className="workDesc">{item.description}</p>
        <p className="workImpact">{item.impact}</p>
        <div className="workTags">
          {item.tags.map((t) => (
            <span key={t} className="workTag" style={{ ['--tag-accent' as never]: accentByTag.get(t) }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </>
  )

  const className = `workCard ${item.featured ? 'isFeatured' : ''}`

  if (item.url) {
    return (
      <a
        className={className}
        style={tone}
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        data-index={String(index + 1).padStart(2, '0')}
      >
        {cardContent}
      </a>
    )
  }

  return (
    <article className={className} style={tone} data-index={String(index + 1).padStart(2, '0')}>
      {cardContent}
    </article>
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
            <p className="portfolioSub">
              Estas piezas no se construyen como galerías bonitas. Cada una resuelve una necesidad concreta de negocio, experiencia u operación.
            </p>
          </div>
          <div className="portfolioLedger">
            <div className="portfolioLedgerItem">
              <span className="portfolioLedgerLabel">Casos</span>
              <strong>04</strong>
            </div>
            <div className="portfolioLedgerItem">
              <span className="portfolioLedgerLabel">Enfoque</span>
              <strong>SaaS / ERP / Crecimiento</strong>
            </div>
            <div className="portfolioLedgerItem">
              <span className="portfolioLedgerLabel">Firma</span>
              <strong>Sistemas con presencia</strong>
            </div>
          </div>
        </header>

        <div className="portfolioSplit">
          <aside className="portfolioRobot" aria-hidden="true">
            <div className="portfolioNote">
              <span className="portfolioNoteLine" />
              <p>
                Cada proyecto entra al portafolio cuando la interfaz, la lógica y la narrativa comercial sostienen una misma idea.
              </p>
            </div>
            <img className="portfolioRobotImg" src={astroImg} alt="" loading="lazy" />
          </aside>

          <div className="portfolioProjects">
            <div className="workGrid">
              {workItems.map((item, index) => (
                <WorkCard key={item.title} item={item} index={index} />
              ))}
            </div>
          </div>
        </div>

        <div className="portfolioCta">
          <div className="portfolioCtaCopy">
            <span className="portfolioCtaLabel">Siguiente movimiento</span>
            <p>Si ya viste la dirección visual y el tipo de sistemas que construimos, el siguiente paso es aterrizar tu caso.</p>
          </div>
          <a className="btn btnPrimary" href="#contacto">
            Solicitar una conversación
          </a>
        </div>
      </div>
    </section>
  )
}

function ContactSection() {
  return (
    <section id="contacto" className="contact">
      <div className="contactInner">
        <div className="contactIntro">
          <div className="contactKicker">Contacto / Orbital Frameworks</div>
          <h2 className="contactTitle">Hagamos que tu producto se vea más claro, opere mejor y se sienta imposible de ignorar.</h2>
          <p className="contactLead">
            Si estás construyendo una plataforma, un ERP, un dashboard o una experiencia comercial con más peso visual y más orden operativo,
            podemos diseñarlo contigo.
          </p>
        </div>

        <div className="contactPanel">
          <div className="contactBlock">
            <span>Qué podemos conversar</span>
            <strong>Landing pages, SaaS, ERP, dashboards, automatización y rediseños completos.</strong>
          </div>
          <div className="contactBlock">
            <span>Canales</span>
            <a href="mailto:contact.orbitalframeworks@gmail.com">contact.orbitalframeworks@gmail.com</a>
            <a href="https://www.linkedin.com/company/orbitalframeworks/" target="_blank" rel="noopener noreferrer">
              LinkedIn de Orbital Frameworks
            </a>
          </div>
          <div className="contactActions">
            <a className="btn btnPrimary" href="mailto:contact.orbitalframeworks@gmail.com?subject=Nuevo%20proyecto%20-%20Orbital%20Frameworks">
              Escribir correo
            </a>
            <a className="btn btnGhost" href="#inicio">
              Volver arriba
            </a>
          </div>
        </div>
      </div>
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

    const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

    const computeBounds = () => {
      const hr = hero.getBoundingClientRect()
      const pr = pyramid.getBoundingClientRect()
      const nav = document.querySelector<HTMLElement>('.navShell')
      const navH = nav ? nav.getBoundingClientRect().height : 0
      const safeTop = navH + 12
      const safeBottom = 90
      const safeLeft = 0
      const safeRight = 0

      minX = safeLeft + pr.width / 2 - hr.width / 2
      maxX = hr.width / 2 - safeRight - pr.width / 2
      minY = safeTop + pr.height / 2 - hr.height / 2
      maxY = hr.height / 2 - safeBottom - pr.height / 2

      if (minX > maxX) {
        minX = 0
        maxX = 0
      }
      if (minY > maxY) {
        minY = 0
        maxY = 0
      }

      x = clamp(x, minX, maxX)
      y = clamp(y, minY, maxY)
    }

    const setVars = () => {
      pyramid.style.setProperty('--bx', `${x.toFixed(2)}px`)
      pyramid.style.setProperty('--by', `${y.toFixed(2)}px`)
    }

    const step = (now: number) => {
      raf = requestAnimationFrame(step)
      const dt = Math.min(0.033, (now - last) / 1000)
      last = now

      x += vx * dt
      y += vy * dt

      if (x > maxX) {
        x = maxX
        vx = -Math.abs(vx)
      } else if (x < minX) {
        x = minX
        vx = Math.abs(vx)
      }

      if (y > maxY) {
        y = maxY
        vy = -Math.abs(vy)
      } else if (y < minY) {
        y = minY
        vy = Math.abs(vy)
      }

      setVars()
    }

    computeBounds()
    setVars()
    raf = requestAnimationFrame(step)

    const onResize = () => {
      computeBounds()
    }
    window.addEventListener('resize', onResize, { passive: true })

    const ro = new ResizeObserver(() => computeBounds())
    ro.observe(hero)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      ro.disconnect()
    }
  }, [heroRef])

  return (
    <header
      ref={(node) => {
        heroRef.current = node
      }}
      className="hero"
      id="inicio"
      style={{ ['--mx' as never]: '0', ['--my' as never]: '0' }}
    >
      <div className="heroGlow" aria-hidden="true" />
      <div className="heroGridLines" aria-hidden="true" />

      <div className="heroInner">
        <div className="heroCopy">
          <div className="heroKicker">
            <span>Orbital Frameworks</span>
            <span>Desarrollo y Soluciones Digitales</span>
          </div>
          <h1 className="heroTitle">
            <span>SISTEMAS</span>
            <span>DIGITALES</span>
            <span>CON</span>
            <span>PRESENCIA</span>
            <span className="heroCursor" aria-hidden="true">._</span>
          </h1>
          <p className="heroLead">
            Diseñamos software, herramientas internas y experiencias web con dirección visual fuerte, lectura editorial clara y una lógica operativa impecable.
          </p>
          <p className="heroSubtitle">Interfaces editoriales. Arquitectura clara. Sistemas que se sienten premium incluso cuando la operación se vuelve compleja.</p>
          <div className="heroActions">
            <a className="btn btnGhost" href="#servicios">
              Explorar nuestro stack
            </a>
            <a className="btn btnPrimary" href="#proyectos">
              Ver casos seleccionados
            </a>
          </div>
          <div className="heroMetrics" role="list" aria-label="Indicadores clave">
            <div className="heroMetric" role="listitem">
              <strong>01</strong>
              <span>Dirección visual con criterio editorial</span>
            </div>
            <div className="heroMetric" role="listitem">
              <strong>02</strong>
              <span>Producto, interfaz y arquitectura dentro de un mismo sistema</span>
            </div>
            <div className="heroMetric" role="listitem">
              <strong>03</strong>
              <span>Automatización, dashboards y plataformas internas</span>
            </div>
          </div>
          <div className="heroFlow">
            <span>Inicio</span>
            <span>Servicios</span>
            <span>Casos</span>
            <span>Cierre</span>
          </div>
        </div>

        <aside className="heroPanel">
          <div className="heroPanelLabel">Manifiesto / Orbital</div>
          <p className="heroPanelText">
            La mayoría de estudios entrega pantallas bonitas o software funcional. Nosotros buscamos ambas cosas al mismo tiempo: presencia,
            claridad y control operacional.
          </p>
          <div className="heroPanelList">
            <div>
              <span>SECTORES</span>
              <strong>RRHH / Salud / B2B / Civico</strong>
            </div>
            <div>
              <span>FORMATO</span>
              <strong>Landing pages, SaaS, ERP, portales y automatización</strong>
            </div>
            <div>
              <span>ESTILO</span>
              <strong>Tech editorial fuerte, preciso y nada genérico</strong>
            </div>
          </div>
        </aside>

        <div className="heroShapes" aria-hidden="true">
          <div
            className="pyramid"
            ref={(node) => {
              pyramidRef.current = node
            }}
            style={{ ['--bx' as never]: '0px', ['--by' as never]: '0px' }}
          >
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
  const items = useMemo<NavItem[]>(
    () => [
      { id: 'inicio', label: 'Inicio' },
      { id: 'servicios', label: 'Servicios' },
      { id: 'proyectos', label: 'Proyectos' },
      { id: 'contacto', label: 'Contacto' },
    ],
    [],
  )

  return (
    <>
      <NavBar items={items} />
      <Hero />
      <ServicesSection />
      <PortfolioSection />
      <ContactSection />
    </>
  )
}

export default App
