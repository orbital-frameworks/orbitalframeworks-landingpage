import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import orbitalLogo from './assets/Orbital Frameworks (1).png'
import astroImg from './assets/Astro showing.png'
import perulogImg from './assets/PerulogPallets.png'
import lisaImg from './assets/Lisa.png'
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
      const hero = document.getElementById('inicio')
      if (!hero) {
        setScrolled(window.scrollY > 10)
        return
      }
      const r = hero.getBoundingClientRect()
      const nav = document.querySelector<HTMLElement>('.nav')
      const navH = nav ? nav.getBoundingClientRect().height : 72
      setScrolled(r.bottom <= navH + 10)
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
      <span className="scrollText">scroll me</span>
    </button>
  )
}

type ServiceScene = {
  id: string
  tag: string
  title: string
  body: string
}

const serviceScenes: ServiceScene[] = [
  {
    id: 's0',
    tag: 'Servicios — Orbital Frameworks',
    title: 'SERVICIOS',
    body: 'Diseñamos y desarrollamos productos digitales con enfoque técnico, velocidad y estética.',
  },
  {
    id: 's1',
    tag: '01 — Web Design',
    title: 'WEB\nDESIGN',
    body: 'Diseño UI moderno, responsive y orientado a conversión. Sistemas de componentes y coherencia visual.',
  },
  {
    id: 's2',
    tag: '02 — Frontend',
    title: 'FRONT\nEND',
    body: 'Interfaces rápidas, accesibles y escalables. Animaciones sutiles, performance y buenas prácticas.',
  },
  {
    id: 's3',
    tag: '03 — Backend',
    title: 'BACK\nEND',
    body: 'APIs, integraciones, autenticación y servicios. Arquitectura clara para crecer sin dolor.',
  },
  {
    id: 's4',
    tag: '04 — Product',
    title: 'PRODUCT\nBUILD',
    body: 'De idea a MVP y de MVP a producto. Roadmap, iteración y entregas enfocadas en resultados.',
  },
  {
    id: 's5',
    tag: '05 — Soporte',
    title: 'CARE\n&\nSCALE',
    body: 'Mantenimiento, mejoras continuas, monitoreo y optimización. Tu sitio siempre a punto.',
  },
]

const IMAGE_SRCS = [
  '/services/1.svg',
  '/services/2.svg',
  '/services/3.svg',
  '/services/4.svg',
  '/services/5.svg',
  '/services/6.svg',
]

const IMAGE_ASPECTS = [1, 1, 1, 1, 1, 1]

const FACE_NAMES = serviceScenes.map((s) => s.title.replaceAll('\n', ' '))

const SWAP_RADIUS = 3

const N = IMAGE_SRCS.length

const stopIndex = (s: number) => Math.min(N - 1, Math.floor(s * (N - 1)))

function faceAtStop(i: number) {
  if (i < 6) return i
  return 1 + ((i - 2) % 4)
}

function buildStops(n: number) {
  const base = [
    { rx: 90, ry: 0 },
    { rx: 0, ry: 0 },
    { rx: 0, ry: -90 },
    { rx: 0, ry: -180 },
    { rx: 0, ry: -270 },
    { rx: -90, ry: -360 },
  ]
  const out = base.slice(0, Math.min(n, 6))
  for (let i = 6; i < n; i += 1) {
    out.push({ rx: 0, ry: -360 - (i - 6) * 90 })
  }
  return out
}

const STOPS = buildStops(N)

const easeIO = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)

const getDarkSrc = (src: string) => {
  const m = src.match(/^(.*?)(\.[a-z0-9]+)(\?.*)?$/i)
  if (!m) return `${src}-dark`
  const base = m[1]
  const ext = m[2]
  const q = m[3] ?? ''
  return `${base}-dark${ext}${q}`
}

const imagePromises = new Map<string, Promise<void>>()
const preloadImage = (src: string) => {
  const existing = imagePromises.get(src)
  if (existing) return existing
  const p = (async () => {
    const img = new Image()
    img.src = src
    await img.decode().catch(() => {})
  })()
  imagePromises.set(src, p)
  return p
}

function ServicesSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const cubeRef = useRef<HTMLDivElement | null>(null)
  const sectionTopsRef = useRef<number[]>([])
  const faceImgIdxRef = useRef<number[]>(new Array(6).fill(-1))
  const [active, setActive] = useState(0)
  const [pct, setPct] = useState(0)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [inView, setInView] = useState(false)
  const [faceImgIdxs, setFaceImgIdxs] = useState<number[]>(() => new Array(6).fill(-1))

  useEffect(() => {
    const section = sectionRef.current
    const container = containerRef.current
    if (!section || !container) return

    const setFaceImage = (faceIdx: number, imgIdx: number, force = false) => {
      if (!force && faceImgIdxRef.current[faceIdx] === imgIdx) return
      faceImgIdxRef.current[faceIdx] = imgIdx
      setFaceImgIdxs((prev) => {
        if (prev[faceIdx] === imgIdx) return prev
        const next = prev.slice()
        next[faceIdx] = imgIdx
        return next
      })
    }

    IMAGE_SRCS.forEach((src) => {
      preloadImage(src)
      preloadImage(getDarkSrc(src))
    })

    for (let i = 0; i < Math.min(N, 6); i += 1) {
      if (IMAGE_SRCS[i]) setFaceImage(i, i, true)
    }

    const buildSectionTops = () => {
      const sections = [...container.querySelectorAll('section')]
      sectionTopsRef.current = sections.map((s) => s.getBoundingClientRect().top + window.scrollY)
    }

    const sectionIndexFromScroll = (y: number) => {
      const mid = y + window.innerHeight * 0.5
      const tops = sectionTopsRef.current
      let idx = 0
      for (let i = 0; i < tops.length; i += 1) {
        if (mid >= tops[i]) idx = i
      }
      return Math.min(idx, N - 1)
    }

    const checkImageSwaps = (smooth: number) => {
      const base = stopIndex(smooth)
      setFaceImage(faceAtStop(base), base)
      for (let offset = -SWAP_RADIUS; offset <= SWAP_RADIUS; offset += 1) {
        if (offset === 0) continue
        const si = base + offset
        if (si < 0 || si >= N) continue
        setFaceImage(faceAtStop(si), si)
      }
    }

    const setCubeTransform = (s: number) => {
      const cube = cubeRef.current
      if (!cube || N < 2 || STOPS.length < 2) return

      const t = s * (N - 1)
      const i = Math.min(Math.floor(t), N - 2)
      const f = easeIO(t - i)
      const a = STOPS[i]
      const b = STOPS[i + 1]
      const rx = a.rx + (b.rx - a.rx) * f
      const ry = a.ry + (b.ry - a.ry) * f
      cube.style.setProperty('--cube-rx', `${rx}deg`)
      cube.style.setProperty('--cube-ry', `${ry}deg`)
    }

    const revealEls = [
      ...container.querySelectorAll('.tag, h1, h2, .body-text, .cta, .cta-back, .h-line'),
    ]
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            ;(e.target as HTMLElement).classList.add('visible')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.1 },
    )
    revealEls.forEach((el) => io.observe(el))

    buildSectionTops()

    let raf = 0
    const update = () => {
      const rect = section.getBoundingClientRect()
      const nowInView = rect.top <= 0 && rect.bottom >= window.innerHeight
      setInView(nowInView)

      if (!nowInView) return

      const containerTop = rect.top + window.scrollY
      const max = Math.max(1, container.scrollHeight - window.innerHeight)
      const cur = window.scrollY - containerTop
      const smooth = Math.max(0, Math.min(1, cur / max))

      const nextPct = Math.round(smooth * 100)
      setPct((p) => (p === nextPct ? p : nextPct))
      setCubeTransform(smooth)
      checkImageSwaps(smooth)

      const idx = sectionIndexFromScroll(window.scrollY)
      setActive((a) => (a === idx ? a : idx))
    }

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }

    const onResize = () => {
      buildSectionTops()
      onScroll()
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      io.disconnect()
    }
  }, [])

  const scene = serviceScenes[active] ?? serviceScenes[0]
  const paddedPct = `${pct}`.padStart(3, '0')
  const paddedNum = `${active + 1}`.padStart(2, '0')
  const sceneName = FACE_NAMES[active] ?? scene.title.replaceAll('\n', ' ')
  const isDark = theme === 'dark'

  return (
    <section
      ref={(node) => {
        sectionRef.current = node
      }}
      id="servicios"
      className="services"
      data-theme={theme}
      data-inview={inView ? 'true' : 'false'}
      onClick={(e) => {
        const a = (e.target as HTMLElement | null)?.closest?.('a[href^="#s"]') as
          | HTMLAnchorElement
          | null
        if (!a) return
        const href = a.getAttribute('href')
        if (!href) return
        const target = document.querySelector(href)
        if (!target) return
        e.preventDefault()
        target.scrollIntoView({ behavior: 'smooth' })
      }}
    >
      <div id="scene" aria-hidden="true">
        <div
          id="cube"
          ref={(node) => {
            cubeRef.current = node
          }}
          style={{ ['--cube-rx' as never]: '90deg', ['--cube-ry' as never]: '0deg' }}
        >
          {(['top', 'front', 'right', 'back', 'left', 'bottom'] as const).map((face, i) => {
            const imgIdx = faceImgIdxs[i] ?? -1
            const baseSrc = imgIdx >= 0 ? IMAGE_SRCS[imgIdx] : ''
            const src = imgIdx >= 0 ? (isDark ? getDarkSrc(baseSrc) : baseSrc) : ''
            return (
              <div key={face} className={`face ${imgIdx >= 0 ? 'hasImg' : ''}`} data-face={face} data-i={i}>
                {imgIdx >= 0 ? (
                  <img
                    src={src}
                    alt={FACE_NAMES[imgIdx] ?? ''}
                    onError={(ev) => {
                      const t = ev.currentTarget
                      if (t.src !== baseSrc) t.src = baseSrc
                    }}
                    style={{ objectFit: (IMAGE_ASPECTS[imgIdx] ?? 1) !== 1 ? 'contain' : 'cover' }}
                  />
                ) : null}
                <span className="face-ph">{face.toUpperCase()}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div id="hud" aria-hidden={!inView}>
        <div id="hud_pct">{paddedPct}%</div>
        <div className="progress-bar">
          <div className="progress-fill" id="prog_fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="scene-label" id="scene_name">
          {sceneName}
        </div>
      </div>

      <button
        id="theme_toggle"
        aria-label="Toggle light/dark mode"
        type="button"
        onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      >
        <svg className="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
        <svg className="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
        </svg>
      </button>

      <div id="scene_strip" aria-hidden={!inView}>
        {serviceScenes.map((s, idx) => (
          <a key={s.id} href={`#${s.id}`} className={`scene-dot${idx === active ? ' active' : ''}`}>
            <span className="srOnly">{s.title}</span>
          </a>
        ))}
      </div>

      <div id="face_caption" aria-hidden={!inView}>
        <div id="face_caption_num">{paddedNum}</div>
        <div id="face_caption_name">{sceneName}</div>
      </div>

      <div
        id="scroll_container"
        ref={(node) => {
          containerRef.current = node
        }}
      >
        {serviceScenes.map((s, idx) => (
          <section key={s.id} id={s.id}>
            <div className={`text-card${idx === 0 ? ' center' : idx % 2 === 1 ? ' right' : ''}`}>
              <div className="h-line" />
              <div className="tag">{s.tag}</div>
              {idx === 0 ? <h1>{s.title}</h1> : <h2>{s.title}</h2>}
              <p className="body-text">{s.body}</p>
              <div className="cta-row">
                {idx > 0 ? (
                  <a className="cta-back" href={`#${serviceScenes[idx - 1]?.id ?? 's0'}`}>
                    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M11 6H1M6 11L1 6l5-5" />
                    </svg>
                    Back
                  </a>
                ) : (
                  <span />
                )}
                <a className="cta" href={`#${serviceScenes[(idx + 1) % serviceScenes.length]!.id}`}>
                  {idx === serviceScenes.length - 1 ? 'Begin again' : 'Turn'}
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1 6h10M6 1l5 5-5 5" />
                  </svg>
                </a>
              </div>
            </div>
          </section>
        ))}
      </div>

      <div id="credit" aria-hidden={!inView}>
        <a
          href="https://www.linkedin.com/posts/luis-martinez-lr_ai-creativity-reversecreativity-activity-7366853269517651970-zeUD"
          target="_blank"
          rel="noopener noreferrer"
        >
        </a>
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
}

function makeWorkPreviewDataUri(tone: WorkItem['tone']) {
  const a = tone === 'red' ? '#FF2A2A' : tone === 'teal' ? '#00D2D3' : '#00D2D3'
  const b = tone === 'mix' ? '#FF2A2A' : '#102A43'
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750" viewBox="0 0 1200 750">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0B1C2C"/>
      <stop offset="1" stop-color="#102A43"/>
    </linearGradient>
    <radialGradient id="glowA" cx="30%" cy="25%" r="65%">
      <stop offset="0" stop-color="${a}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${a}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowB" cx="75%" cy="70%" r="70%">
      <stop offset="0" stop-color="${b}" stop-opacity="0.38"/>
      <stop offset="1" stop-color="${b}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    </pattern>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8"/>
    </filter>
  </defs>
  <rect width="1200" height="750" fill="url(#bg)"/>
  <rect width="1200" height="750" fill="url(#grid)" opacity="0.9"/>
  <circle cx="360" cy="220" r="420" fill="url(#glowA)" filter="url(#soft)"/>
  <circle cx="860" cy="560" r="520" fill="url(#glowB)" filter="url(#soft)"/>
  <path d="M0 540 C 240 470 420 650 640 540 C 860 430 980 540 1200 460 L1200 750 L0 750 Z" fill="rgba(0,0,0,0.20)"/>
  <rect x="70" y="120" width="520" height="320" rx="18" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.10)"/>
  <rect x="92" y="150" width="200" height="18" rx="9" fill="rgba(255,255,255,0.10)"/>
  <rect x="92" y="188" width="440" height="14" rx="7" fill="rgba(255,255,255,0.08)"/>
  <rect x="92" y="214" width="380" height="14" rx="7" fill="rgba(255,255,255,0.08)"/>
  <rect x="92" y="256" width="160" height="38" rx="19" fill="rgba(0,0,0,0.22)" stroke="rgba(255,255,255,0.12)"/>
  <rect x="268" y="256" width="180" height="38" rx="19" fill="rgba(0,0,0,0.14)" stroke="rgba(255,255,255,0.10)"/>
  <rect x="640" y="160" width="490" height="420" rx="22" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.10)"/>
  <circle cx="1086" cy="196" r="10" fill="${a}" opacity="0.9"/>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
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
  },
  {
    title: 'VetERP-Enterprise Resource Planning',
    kind: 'App',
    imageSrc: veterpSisImg,
    description: 'Sistema ERP para gestion operativa de clinicas veterinarias, agenda, inventario y seguimiento de pacientes.',
    tags: ['ERP', 'Veterinaria', 'Operaciones'],
    featured: true,
    tone: 'teal',
  },
  {
    title: 'Localisa',
    kind: 'Web',
    url: 'https://www.localisa.pe/',
    imageSrc: lisaImg,
    description: 'Mapa interactivo para localización de plazas de Serumistas del todo el Perú',
    tags: ['+700mil visitas', 'Respaldado por CMP', '+15mil usuarios activos'],
    tone: 'red',
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
  },
]

function WorkCard({ item }: { item: WorkItem }) {
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

  const cardContent = (
    <>
      <div className="workMedia">
        <img src={item.imageSrc} alt={item.title} loading="lazy" />

        <div className="workMediaOverlay">
          <div className="workMediaTitle">{item.title}</div>
          <div className="workMediaSub">{item.url ? 'Ver sitio' : 'Proyecto'}</div>
        </div>

        <div className="workTop">
          <div className="workMeta">
            <span className="workKind">{item.kind}</span>
          </div>
          <div className="workGlow" aria-hidden="true" />
        </div>
      </div>

      <div className="workBody">
        <h3 className="workTitle">{item.title}</h3>
        <p className="workDesc">{item.description}</p>
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
      <a className={className} style={tone} href={item.url} target="_blank" rel="noopener noreferrer">
        {cardContent}
      </a>
    )
  }

  return (
    <article className={className} style={tone}>
      {cardContent}
    </article>
  )
}

type TechItem = {
  id: string
  label: string
  accentRgb: string
  icon: ReactNode
}

const techItems: TechItem[] = [
  {
    id: 'ts',
    label: 'TypeScript',
    accentRgb: '0, 210, 211',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <rect x="3.5" y="3.5" width="17" height="17" rx="6" fill="rgba(245,245,245,0.06)" />
        <rect
          x="3.5"
          y="3.5"
          width="17"
          height="17"
          rx="6"
          fill="none"
          stroke="rgba(245,245,245,0.16)"
          strokeWidth="1"
        />
        <text x="12" y="15.2" textAnchor="middle" fontSize="9" fontWeight="900" fill="rgba(245,245,245,0.92)">
          TS
        </text>
      </svg>
    ),
  },
  {
    id: 'react',
    label: 'React',
    accentRgb: '0, 210, 211',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none">
        <circle cx="12" cy="12" r="1.55" fill="currentColor" />
        <ellipse cx="12" cy="12" rx="8" ry="3.1" stroke="currentColor" strokeWidth="1.55" />
        <ellipse
          cx="12"
          cy="12"
          rx="8"
          ry="3.1"
          stroke="currentColor"
          strokeWidth="1.55"
          transform="rotate(60 12 12)"
        />
        <ellipse
          cx="12"
          cy="12"
          rx="8"
          ry="3.1"
          stroke="currentColor"
          strokeWidth="1.55"
          transform="rotate(120 12 12)"
        />
      </svg>
    ),
  },
  {
    id: 'node',
    label: 'Node.js',
    accentRgb: '0, 210, 211',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none">
        <path
          d="M12 3.6 19.6 8v8L12 20.4 4.4 16V8L12 3.6Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M10.2 15.9V9.2h2.4c1.65 0 2.7.9 2.7 2.35 0 1.43-1.05 2.33-2.7 2.33h-.95v2.02"
          stroke="currentColor"
          strokeWidth="1.45"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'html',
    label: 'HTML5',
    accentRgb: '255, 42, 42',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none">
        <path
          d="M5.5 3.8h13l-1.1 14.8L12 20.2l-5.4-1.6L5.5 3.8Z"
          stroke="currentColor"
          strokeWidth="1.55"
          strokeLinejoin="round"
        />
        <path d="M9.2 9h5.6M9.6 12h4.8M10 15h4" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'css',
    label: 'CSS3',
    accentRgb: '255, 42, 42',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none">
        <path
          d="M5.5 3.8h13l-1.1 14.8L12 20.2l-5.4-1.6L5.5 3.8Z"
          stroke="currentColor"
          strokeWidth="1.55"
          strokeLinejoin="round"
        />
        <path
          d="M14.7 9.6c-.8-.7-1.8-1-3-.8-1.1.2-1.8 1-1.8 1.9 0 1 .9 1.6 2.2 1.8 1.3.2 2.2.7 2.2 1.8 0 .9-.7 1.7-1.8 1.9-1.2.2-2.2-.1-3-.8"
          stroke="currentColor"
          strokeWidth="1.45"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'js',
    label: 'JavaScript',
    accentRgb: '255, 42, 42',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <rect x="3.5" y="3.5" width="17" height="17" rx="6" fill="rgba(245,245,245,0.06)" />
        <rect
          x="3.5"
          y="3.5"
          width="17"
          height="17"
          rx="6"
          fill="none"
          stroke="rgba(245,245,245,0.16)"
          strokeWidth="1"
        />
        <text x="12" y="15.2" textAnchor="middle" fontSize="9" fontWeight="900" fill="rgba(245,245,245,0.92)">
          JS
        </text>
      </svg>
    ),
  },
  {
    id: 'python',
    label: 'Python',
    accentRgb: '245, 245, 245',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <rect x="3.5" y="3.5" width="17" height="17" rx="6" fill="rgba(245,245,245,0.06)" />
        <rect
          x="3.5"
          y="3.5"
          width="17"
          height="17"
          rx="6"
          fill="none"
          stroke="rgba(245,245,245,0.16)"
          strokeWidth="1"
        />
        <text x="12" y="15.2" textAnchor="middle" fontSize="9" fontWeight="900" fill="rgba(245,245,245,0.92)">
          PY
        </text>
      </svg>
    ),
  },
  {
    id: 'sql',
    label: 'PostgreSQL',
    accentRgb: '245, 245, 245',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none">
        <ellipse cx="12" cy="7.8" rx="6.5" ry="3" fill="currentColor" opacity="0.9" />
        <path
          d="M5.5 7.8v8.1c0 1.66 2.91 3 6.5 3s6.5-1.34 6.5-3V7.8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M5.5 11.85c0 1.66 2.91 3 6.5 3s6.5-1.34 6.5-3"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'sqlserver',
    label: 'SQL Server',
    accentRgb: '245, 245, 245',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <rect x="3.5" y="3.5" width="17" height="17" rx="6" fill="rgba(245,245,245,0.06)" />
        <rect
          x="3.5"
          y="3.5"
          width="17"
          height="17"
          rx="6"
          fill="none"
          stroke="rgba(245,245,245,0.16)"
          strokeWidth="1"
        />
        <text x="12" y="15.2" textAnchor="middle" fontSize="8.6" fontWeight="900" fill="rgba(245,245,245,0.92)">
          SQL
        </text>
      </svg>
    ),
  },
  {
    id: 'azure',
    label: 'Azure',
    accentRgb: '0, 210, 211',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none">
        <path
          d="M6.2 18.4 10.5 4.8h4.3l3 13.6h-3.3l-.55-2.7H10l-.55 2.7H6.2Z"
          stroke="currentColor"
          strokeWidth="1.55"
          strokeLinejoin="round"
        />
        <path d="M10.8 12.6h2.4" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'n8n',
    label: 'n8n',
    accentRgb: '255, 42, 42',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <rect x="3.5" y="3.5" width="17" height="17" rx="6" fill="rgba(245,245,245,0.06)" />
        <rect
          x="3.5"
          y="3.5"
          width="17"
          height="17"
          rx="6"
          fill="none"
          stroke="rgba(245,245,245,0.16)"
          strokeWidth="1"
        />
        <text x="12" y="15.2" textAnchor="middle" fontSize="8.6" fontWeight="900" fill="rgba(245,245,245,0.92)">
          n8n
        </text>
      </svg>
    ),
  },
]

function ExperienceSection() {
  return (
    <section id="experiencia" className="experience">
      <div className="experienceInner">
        <header className="experienceHead">
          <h2 className="experienceTitle">Nuestra Experiencia</h2>
        </header>

        <div className="expGrid" role="list">
          {techItems.map((t) => (
            <div
              key={t.id}
              className="expChip"
              role="listitem"
              style={{ ['--tech-accent' as never]: t.accentRgb }}
            >
              <span className="expIcon" aria-hidden="true">
                {t.icon}
              </span>
              <span className="expLabel">{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PortfolioSection() {
  return (
    <section id="proyectos" className="portfolio">
      <div className="portfolioInner">
        <header className="portfolioHead">
          <div className="portfolioKicker">Proyectos</div>
          <h2 className="portfolioTitle">Nuestros Proyectos</h2>
          <p className="portfolioSub"></p>
        </header>

        <div className="portfolioSplit">
          <aside className="portfolioRobot" aria-hidden="true">
            <img className="portfolioRobotImg" src={astroImg} alt="" loading="lazy" />
          </aside>

          <div className="portfolioProjects">
            <div className="workGrid">
              {workItems.map((item) => (
                <WorkCard key={item.title} item={item} />
              ))}
            </div>
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

      <div className="heroInner">
        <div className="heroCopy">
          <h1 className="heroTitle">
            ORBITAL FRAMEWORKS<span className="heroCursor" aria-hidden="true">._</span>
          </h1>
          <p className="heroSubtitle">WEB DESIGN &amp; SOFTWARE SOLUTIONS</p>
        </div>

        <div className="heroShapes" aria-hidden="true">
          <div
            className="pyramid"
            ref={(node) => {
              pyramidRef.current = node
            }}
            style={{ ['--bx' as never]: '0px', ['--by' as never]: '0px' }}
          >
            <Cube className="p1" size={160} a="var(--orbital-red)" b="var(--orbital-red)" />
            <Cube className="p2" size={160} a="var(--orbital-red)" b="var(--orbital-red)" />
            <Cube className="p3" size={160} a="var(--orbital-red)" b="var(--orbital-red)" />
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
      { id: 'experiencia', label: 'Experiencia' },
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
      <ExperienceSection />
      <PortfolioSection />
    </>
  )
}

export default App
