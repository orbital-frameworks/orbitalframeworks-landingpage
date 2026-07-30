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
    eyebrow: 'Marketing / Conversión / Presencia',
    title: 'Landing pages',
    summary: 'Diseñamos y desarrollamos landing pages enfocadas en claridad, presencia de marca y captación.',
    detail:
      'Trabajamos estructura comercial, jerarquía visual, responsive y velocidad para que la página no solo se vea bien, sino que también explique y convierta mejor.',
    deliverable: 'Landing page lista para campañas, posicionamiento o captación comercial.',
    bullets: ['Diseño visual', 'Conversión', 'Responsive'],
  },
  {
    id: 'erp',
    index: '02',
    eyebrow: 'ERP / Operaciones / Gestión',
    title: 'Sistemas empresariales de gestión',
    summary: 'Construimos sistemas para ordenar procesos, centralizar información y mejorar la operación diaria.',
    detail:
      'Desarrollamos módulos, paneles administrativos, flujos internos y herramientas de control pensadas para crecimiento, trazabilidad y eficiencia.',
    deliverable: 'Sistema de gestión adaptado a la operación real del negocio.',
    bullets: ['ERP', 'Paneles', 'Control operativo'],
  },
  {
    id: 'bots',
    index: '03',
    eyebrow: 'Bots / Automatización / Mensajería',
    title: 'Automatización y bots',
    summary: 'Creamos automatizaciones y asistentes para atención, seguimiento y tareas repetitivas.',
    detail:
      'Automatizamos respuestas, captación, seguimiento y procesos repetitivos para que el negocio gane tiempo, consistencia y capacidad operativa.',
    deliverable: 'Automatizaciones conectadas a flujos reales de atención, ventas o soporte.',
    bullets: ['WhatsApp', 'Integraciones', 'Procesos'],
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
              Desarrollamos soluciones digitales para captación, gestión empresarial, automatización y operación interna.
            </p>

            <aside className="servicesManifesto">
              <span className="servicesManifestoLabel">Manifiesto</span>
              <p className="servicesManifestoText">
                No separamos diseño y desarrollo. Construimos productos con presencia visual y lógica operativa clara.
              </p>
              <div className="servicesManifestoMeta">
                <div>
                  <span>FORMATO</span>
                  <strong>Landing pages, sistemas empresariales, automatización y herramientas internas</strong>
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
            <a className="servicesPrimaryLink" href="#proyectos">Ver proyectos seleccionados</a>
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
                    {service.bullets.map((bullet) => <span key={bullet} className="serviceCardTag">{bullet}</span>)}
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
  imageSrc: string
  url: string
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
    title: 'Checkio — Gestión de personal',
    kind: 'App',
    imageSrc: checkioImg,
    url: 'https://checkio-frontend.onrender.com/landing',
    description: 'Plataforma para gestionar personal, asistencia, ausencias y marcaciones con geolocalización.',
    tags: ['Producto publicado', 'Gestión de personal', 'SaaS'],
    featured: true,
    tone: 'teal',
    sector: 'Tecnología RRHH',
    status: 'Producto publicado',
    impact: 'Operación diaria con trazabilidad y control de asistencia.',
  },
  {
    title: 'VetERP — Gestión veterinaria',
    kind: 'App',
    imageSrc: veterpSisImg,
    url: 'https://veterp.qzz.io/',
    description: 'Sistema ERP para agenda, pacientes, inventario y operación interna de clínicas veterinarias.',
    tags: ['ERP', 'Veterinaria', 'En pruebas'],
    featured: true,
    tone: 'teal',
    sector: 'Salud operativa',
    status: 'Producto en pruebas',
    impact: 'Centraliza agenda, pacientes e inventario en un mismo flujo.',
  },
  {
    title: 'Localisa',
    kind: 'Web',
    url: 'https://www.localisa.pe/',
    imageSrc: lisaImg,
    description: 'Plataforma pública con mapa y filtros para consultar plazas SERUMS en distintas regiones del Perú.',
    tags: ['Mapa interactivo', 'SERUMS', 'Plataforma pública'],
    tone: 'red',
    sector: 'Información geográfica',
    status: 'Plataforma publicada',
    impact: 'Facilita la búsqueda y comparación de plazas mediante información territorial.',
  },
  {
    title: 'PeruLog Pallets',
    kind: 'Landing',
    url: 'https://perulogpallets.com.pe/',
    imageSrc: perulogImg,
    description: 'Landing comercial B2B para explicar servicios, propuesta de valor y canales de contacto.',
    tags: ['UI/UX Design', 'B2B', 'Web Development'],
    featured: true,
    tone: 'mix',
    sector: 'Crecimiento B2B',
    status: 'Sitio publicado',
    impact: 'Presencia digital enfocada en captación y posicionamiento comercial.',
  },
]

function WorkCard({ item, index }: { item: WorkItem; index: number }) {
  const tone = item.tone === 'red'
    ? { ['--g1' as never]: 'rgba(255,42,42,0.95)', ['--g2' as never]: 'rgba(16,42,67,0.2)' }
    : item.tone === 'teal'
      ? { ['--g1' as never]: 'rgba(0,210,211,0.95)', ['--g2' as never]: 'rgba(16,42,67,0.2)' }
      : { ['--g1' as never]: 'rgba(0,210,211,0.9)', ['--g2' as never]: 'rgba(255,42,42,0.78)' }

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
  item.tags.forEach((tag) => accentByTag.set(tag, pickAccent(tag)))
  const cardLabel = `${String(index + 1).padStart(2, '0')} / ${item.sector}`

  return (
    <a
      className={`workCard ${item.featured ? 'isFeatured' : ''}`}
      style={tone}
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      data-index={String(index + 1).padStart(2, '0')}
    >
      <div className="workMedia">
        <img src={item.imageSrc} alt={`Vista de ${item.title}`} loading="lazy" />
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
        <p className="workImpact">{item.impact}</p>
        <div className="workTags">
          {item.tags.map((tag) => (
            <span key={tag} className="workTag" style={{ ['--tag-accent' as never]: accentByTag.get(tag) }}>{tag}</span>
          ))}
        </div>
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
          <div className="portfolioLedger">
            <div className="portfolioLedgerItem"><span className="portfolioLedgerLabel">Casos</span><strong>04</strong></div>
            <div className="portfolioLedgerItem"><span className="portfolioLedgerLabel">Enfoque</span><strong>SaaS / ERP / Crecimiento</strong></div>
            <div className="portfolioLedgerItem"><span className="portfolioLedgerLabel">Firma</span><strong>Sistemas con presencia</strong></div>
          </div>
        </header>

        <div className="portfolioSplit">
          <aside className="portfolioRobot" aria-hidden="true">
            <div className="portfolioNote">
              <span className="portfolioNoteLine" />
              <p>Cada proyecto entra al portafolio cuando la interfaz, la lógica y la narrativa comercial sostienen una misma idea.</p>
            </div>
            <img className="portfolioRobotImg" src={astroImg} alt="" loading="lazy" />
          </aside>

          <div className="portfolioProjects">
            <div className="workGrid">
              {workItems.map((item, index) => <WorkCard key={item.title} item={item} index={index} />)}
            </div>
          </div>
        </div>

        <div className="portfolioCta">
          <div className="portfolioCtaCopy">
            <span className="portfolioCtaLabel">Siguiente movimiento</span>
            <p>Si ya viste la dirección visual y el tipo de sistemas que construimos, el siguiente paso es aterrizar tu caso.</p>
          </div>
          <a className="btn btnPrimary" href="#contacto">Solicitar una conversación</a>
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
          <p className="contactLead">Conversemos sobre la situación concreta que necesitas resolver y el cambio que tendría valor.</p>
        </div>

        <div className="contactPanel">
          <div className="contactBlock">
            <span>Qué podemos conversar</span>
            <strong>Landing pages, SaaS, ERP, dashboards, automatización y mejoras sobre sistemas existentes.</strong>
          </div>
          <div className="contactBlock">
            <span>Canales</span>
            <a href="mailto:contact.orbitalframeworks@gmail.com">contact.orbitalframeworks@gmail.com</a>
            <a href="https://www.linkedin.com/company/orbitalframeworks/" target="_blank" rel="noopener noreferrer">LinkedIn de Orbital Frameworks</a>
          </div>
          <div className="contactActions">
            <a className="btn btnPrimary" href="mailto:contact.orbitalframeworks@gmail.com?subject=Nuevo%20proyecto%20-%20Orbital%20Frameworks">Escribir correo</a>
            <a className="btn btnGhost" href="#inicio">Volver arriba</a>
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

    const step = (now: number) => {
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
    raf = requestAnimationFrame(step)

    const onResize = () => computeBounds()
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
    <header ref={(node) => { heroRef.current = node }} className="hero" id="inicio" style={{ ['--mx' as never]: '0', ['--my' as never]: '0' }}>
      <div className="heroGlow" aria-hidden="true" />
      <div className="heroGridLines" aria-hidden="true" />

      <div className="heroInner">
        <div className="heroCopy">
          <div className="heroKicker"><span>Orbital Frameworks</span><span>Desarrollo y soluciones digitales</span></div>
          <h1 className="heroTitle">
            <span>SISTEMAS</span><span>DIGITALES</span><span>CON</span><span>PRESENCIA</span><span className="heroCursor" aria-hidden="true">._</span>
          </h1>
          <p className="heroLead">Diseñamos y desarrollamos software, sistemas web, apps y experiencias digitales con dirección visual fuerte y lógica operativa clara.</p>
          <p className="heroSubtitle">Interfaces editoriales. Arquitectura clara. Sistemas que se sienten premium incluso cuando la operación se vuelve compleja.</p>
          <div className="heroActions">
            <a className="btn btnGhost" href="#servicios">Explorar nuestro stack</a>
            <a className="btn btnPrimary" href="#proyectos">Ver casos seleccionados</a>
          </div>
          <div className="heroMetrics" role="list" aria-label="Principios de trabajo">
            <div className="heroMetric" role="listitem"><strong>01</strong><span>Dirección visual con criterio editorial</span></div>
            <div className="heroMetric" role="listitem"><strong>02</strong><span>Producto, interfaz y arquitectura dentro de un mismo sistema</span></div>
            <div className="heroMetric" role="listitem"><strong>03</strong><span>Automatización, dashboards y plataformas internas</span></div>
          </div>
          <div className="heroFlow"><span>Inicio</span><span>Servicios</span><span>Casos</span><span>Cierre</span></div>
        </div>

        <aside className="heroPanel">
          <div className="heroPanelLabel">Manifiesto / Orbital</div>
          <p className="heroPanelText">Buscamos que presencia, claridad y control operativo formen parte de una misma solución.</p>
          <div className="heroPanelList">
            <div><span>SECTORES</span><strong>RRHH / Salud / B2B / Servicios</strong></div>
            <div><span>FORMATO</span><strong>Landing pages, SaaS, ERP, portales y automatización</strong></div>
            <div><span>ESTILO</span><strong>Diseño fuerte, software claro y operación real</strong></div>
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
    { id: 'contacto', label: 'Contacto' },
  ], [])

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
