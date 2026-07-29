import { useMemo, useState } from 'react'
import orbitalLogo from './assets/Orbital Frameworks (1).png'
import './App.css'

type NavItem = { id: string; label: string }

type CaseStudy = {
  name: string
  category: string
  image: string
  imageWidth: number
  imageHeight: number
  problem: string
  built: string
  evidence: string
  status: string
  url?: string
}

const cases: CaseStudy[] = [
  {
    name: 'Checkio',
    category: 'Gestión de personal',
    image: 'checkio',
    imageWidth: 1917,
    imageHeight: 904,
    problem: 'Registrar asistencia y ordenar información operativa del personal sin depender de controles dispersos.',
    built: 'Una plataforma web para gestionar colaboradores, marcaciones, ausencias y seguimiento operativo.',
    evidence: 'La landing pública permite revisar el producto, sus funciones principales y el enfoque de la plataforma.',
    status: 'Producto publicado',
    url: 'https://checkio-frontend.onrender.com/landing',
  },
  {
    name: 'VetERP',
    category: 'Operación veterinaria',
    image: 'veterp',
    imageWidth: 1902,
    imageHeight: 909,
    problem: 'Concentrar agenda, pacientes, inventario y tareas de una clínica veterinaria en una sola herramienta.',
    built: 'Un sistema de gestión veterinaria con módulos para atención, seguimiento clínico y operación interna.',
    evidence: 'La landing pública y la evidencia visual permiten revisar el alcance del sistema. No se presenta como caso de éxito comercial.',
    status: 'Producto en pruebas',
    url: 'https://veterp.qzz.io/',
  },
  {
    name: 'Localisa',
    category: 'Información geográfica para SERUMS',
    image: 'localisa',
    imageWidth: 1905,
    imageHeight: 852,
    problem: 'Facilitar la búsqueda y comparación de plazas SERUMS distribuidas en distintas regiones del Perú.',
    built: 'Una plataforma pública con mapa, filtros y visualización de información para apoyar la revisión de plazas.',
    evidence: 'La plataforma publicada permite revisar directamente el mapa, las funciones, el equipo y la información sobre sus datos.',
    status: 'Plataforma publicada',
    url: 'https://www.localisa.pe/',
  },
  {
    name: 'PeruLog Pallets',
    category: 'Presencia digital B2B',
    image: 'perulog-pallets',
    imageWidth: 1336,
    imageHeight: 601,
    problem: 'Explicar una oferta industrial con claridad y facilitar que un posible cliente continúe la conversación.',
    built: 'Una landing comercial responsive que organiza servicios, propuesta de valor y canales de contacto.',
    evidence: 'El sitio publicado puede abrirse y revisarse directamente.',
    status: 'Sitio publicado',
    url: 'https://perulogpallets.com.pe/',
  },
]

const capabilities = [
  {
    title: 'Software y herramientas internas',
    text: 'Sistemas web, paneles y aplicaciones que ordenan procesos, información y tareas del negocio.',
  },
  {
    title: 'Mejoras sobre lo existente',
    text: 'Correcciones o ampliaciones acotadas sobre una web o herramienta actual cuando rehacerla completa no tiene sentido.',
  },
  {
    title: 'Productos digitales',
    text: 'Diseño y construcción de una primera versión funcional para validar una idea antes de aumentar el alcance.',
  },
  {
    title: 'Presencia y captación',
    text: 'Landing pages y recorridos de consulta que explican mejor una oferta y permiten continuar por el canal correcto.',
  },
]

const conversationSteps = [
  'Revisamos la situación concreta que originó la conversación.',
  'Entendemos cómo funciona hoy y dónde aparece la fricción.',
  'Explicamos qué cambiaríamos y qué conviene dejar intacto.',
  'Definimos cómo sabríamos si la mejora realmente valió la pena.',
]

function Logo() {
  return (
    <a className="logoMark" href="#inicio" aria-label="Orbital Frameworks, volver al inicio">
      <img className="logoImg" src={orbitalLogo} alt="Orbital Frameworks" width="1614" height="152" decoding="async" />
    </a>
  )
}

function NavBar({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="navShell isScrolled">
      <nav className="nav" aria-label="Navegación principal">
        <Logo />
        <button className="navToggle" type="button" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open} onClick={() => setOpen(!open)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
        <div className={`navLinks ${open ? 'isOpen' : ''}`}>
          {items.map((item) => <a key={item.id} className="navLink" href={`#${item.id}`} onClick={() => setOpen(false)}>{item.label}</a>)}
        </div>
      </nav>
    </div>
  )
}

function Hero() {
  return (
    <header className="hero trustHero" id="inicio">
      <div className="heroGlow" aria-hidden="true" />
      <div className="heroGridLines" aria-hidden="true" />
      <div className="heroInner trustHeroInner">
        <div className="heroCopy trustHeroCopy">
          <div className="heroKicker"><span>Orbital Frameworks</span><span>Empresa peruana de desarrollo de software y soluciones digitales</span></div>
          <h1 className="heroTitle trustHeroTitle">Construimos y mejoramos herramientas digitales para problemas concretos.</h1>
          <p className="heroLead trustHeroLead">Desarrollamos software, productos digitales y mejoras sobre webs o sistemas existentes. Primero entendemos el problema; después definimos si realmente hace falta construir algo.</p>
          <div className="heroActions">
            <a className="btn btnPrimary" href="#conversacion">Revisar un problema concreto</a>
            <a className="btn btnGhost" href="#proyectos">Conocer nuestro trabajo</a>
          </div>
          <div className="trustSignals" aria-label="Principios de trabajo">
            <span>Trabajo verificable</span><span>Alcance antes que promesas</span><span>Perú</span>
          </div>
        </div>
        <aside className="heroPanel trustHeroPanel">
          <div className="heroPanelLabel">Cómo abordamos una mejora</div>
          <p className="heroPanelText">No recomendamos un rediseño completo por defecto. Una mejora puede ser una página, un flujo, una automatización o una herramienta interna; también puede concluir que lo actual debe mantenerse.</p>
          <div className="heroPanelList">
            <div><span>PRIMERO</span><strong>Problema, contexto y prioridad</strong></div>
            <div><span>DESPUÉS</span><strong>Cambio acotado y criterio de éxito</strong></div>
            <div><span>SOLO SI APORTA</span><strong>Diseño, desarrollo e implementación</strong></div>
          </div>
        </aside>
      </div>
    </header>
  )
}

function CapabilitiesSection() {
  return (
    <section id="capacidades" className="services trustSection">
      <div className="servicesShell">
        <header className="sectionIntro">
          <div className="servicesKicker">Qué hacemos</div>
          <h2 className="servicesTitle">Soluciones digitales que responden a una necesidad real del negocio.</h2>
          <p className="servicesLead">Trabajamos con empresas que necesitan ordenar una operación, explicar mejor su oferta, corregir una superficie digital o convertir una idea en un producto funcional.</p>
        </header>
        <div className="capabilityGrid">
          {capabilities.map((item, index) => (
            <article className="capabilityCard" key={item.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
        <div className="serviceBoundary">
          <strong>No se parte de una solución predeterminada.</strong>
          <p>Una conversación puede terminar en una mejora pequeña, un proyecto más amplio o la conclusión de que no existe un cambio suficientemente claro para justificar el trabajo.</p>
        </div>
      </div>
    </section>
  )
}

function PortfolioSection() {
  return (
    <section id="proyectos" className="portfolio trustPortfolio">
      <div className="portfolioInner">
        <header className="sectionIntro">
          <div className="portfolioKicker">Trabajo seleccionable y verificable</div>
          <h2 className="portfolioTitle">Cuatro proyectos públicos que muestran capacidades distintas.</h2>
          <p className="portfolioSub">No se presentan como clientes ni como resultados comerciales no demostrados. Cada caso indica qué se construyó, qué puede verificarse y cuál es su estado actual.</p>
        </header>
        <div className="caseGrid">
          {cases.map((item) => {
            const content = (
              <>
                <div className="caseImage">
                  <img
                    src={`/portfolio/${item.image}-960.webp`}
                    srcSet={`/portfolio/${item.image}-640.webp 640w, /portfolio/${item.image}-960.webp 960w`}
                    sizes="(max-width: 720px) 100vw, (max-width: 1100px) 90vw, 470px"
                    alt={`Vista de la landing o producto ${item.name}`}
                    width={item.imageWidth}
                    height={item.imageHeight}
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                  />
                </div>
                <div className="caseBody">
                  <div className="caseMeta"><span>{item.category}</span><strong>{item.status}</strong></div>
                  <h3>{item.name}</h3>
                  <dl>
                    <div><dt>Problema</dt><dd>{item.problem}</dd></div>
                    <div><dt>Qué construimos</dt><dd>{item.built}</dd></div>
                    <div><dt>Evidencia</dt><dd>{item.evidence}</dd></div>
                  </dl>
                  {item.url && <span className="caseLinkText">Ver landing o producto publicado ↗</span>}
                </div>
              </>
            )
            return item.url ? <a className="caseCard" key={item.name} href={item.url} target="_blank" rel="noopener noreferrer">{content}</a> : <article className="caseCard" key={item.name}>{content}</article>
          })}
        </div>
      </div>
    </section>
  )
}

function ConversationSection() {
  return (
    <section id="conversacion" className="conversationSection trustSection">
      <div className="conversationInner">
        <div className="conversationCopy">
          <div className="servicesKicker">Primera conversación</div>
          <h2>Una llamada breve para entender la situación, no para forzar una venta.</h2>
          <p>La conversación parte de una observación concreta. Se revisa qué ocurre hoy, por qué podría importar y qué cambio tendría sentido evaluar.</p>
          <div className="conversationNote">No hace falta preparar una presentación ni decidir una solución antes de hablar.</div>
        </div>
        <ol className="conversationSteps">
          {conversationSteps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span><p>{step}</p></li>)}
        </ol>
      </div>
    </section>
  )
}

function AboutSection() {
  return (
    <section id="equipo" className="aboutSection trustSection">
      <div className="aboutInner">
        <div>
          <div className="servicesKicker">Quiénes somos</div>
          <h2>Una empresa peruana que combina criterio de producto, diseño y desarrollo.</h2>
        </div>
        <div className="aboutCopy">
          <p>Orbital Frameworks desarrolla productos de software, herramientas internas y experiencias digitales para empresas que necesitan resolver una situación concreta, mejorar un proceso o poner en marcha una idea.</p>
          <p>El trabajo se gestiona de forma directa: se entiende el contexto, se acota el alcance y se revisa evidencia funcional antes de ampliar una solución. Los proyectos publicados en esta página permiten comprobar distintos tipos de trabajo sin depender de testimonios o resultados no verificables.</p>
          <a className="textLink" href="https://www.linkedin.com/company/orbitalframeworks/" target="_blank" rel="noopener noreferrer">Ver Orbital Frameworks en LinkedIn ↗</a>
        </div>
      </div>
    </section>
  )
}

function ContactSection() {
  return (
    <section id="contacto" className="contact trustContact">
      <div className="contactInner">
        <div className="contactIntro">
          <div className="contactKicker">Continuar la conversación</div>
          <h2 className="contactTitle">Conversemos sobre una situación concreta.</h2>
          <p className="contactLead">Describe brevemente qué está ocurriendo o responde al correo que recibiste. Revisaremos el contexto antes de proponer una llamada o una solución.</p>
        </div>
        <div className="contactPanel">
          <div className="contactBlock"><span>Qué incluir</span><strong>Negocio, situación observada y resultado que tendría valor.</strong></div>
          <div className="contactBlock"><span>Qué ocurre después</span><strong>Se revisa el mensaje y se responde para aclarar el contexto o coordinar una conversación breve.</strong></div>
          <div className="contactBlock"><span>Canales verificables</span><a href="mailto:contact.orbitalframeworks@gmail.com">contact.orbitalframeworks@gmail.com</a><a href="https://www.linkedin.com/company/orbitalframeworks/" target="_blank" rel="noopener noreferrer">LinkedIn de Orbital Frameworks</a></div>
          <div className="contactActions"><a className="btn btnPrimary" href="mailto:contact.orbitalframeworks@gmail.com?subject=Conversar%20sobre%20una%20mejora%20-%20Orbital%20Frameworks">Conversar sobre una mejora</a><a className="btn btnGhost" href="#proyectos">Revisar proyectos</a></div>
        </div>
      </div>
      <footer className="siteFooter"><span>Orbital Frameworks</span><span>Desarrollo de software y soluciones digitales · Perú</span><a href="#inicio">Volver arriba</a></footer>
    </section>
  )
}

function App() {
  const items = useMemo<NavItem[]>(() => [
    { id: 'capacidades', label: 'Qué hacemos' },
    { id: 'proyectos', label: 'Proyectos' },
    { id: 'conversacion', label: 'Primera conversación' },
    { id: 'equipo', label: 'Quiénes somos' },
    { id: 'contacto', label: 'Contacto' },
  ], [])

  return (
    <>
      <a className="skipLink" href="#contenido">Saltar al contenido</a>
      <NavBar items={items} />
      <main id="contenido">
        <Hero />
        <CapabilitiesSection />
        <PortfolioSection />
        <ConversationSection />
        <AboutSection />
      </main>
      <ContactSection />
    </>
  )
}

export default App
