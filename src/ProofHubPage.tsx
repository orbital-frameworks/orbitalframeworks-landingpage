import orbitalLogo from './assets/Orbital Frameworks (1).png'
import checkioImg from './assets/checkio.png'
import wasyImg640 from './assets/wasy-catalog-2026-10-16-640.webp'
import wasyImg from './assets/wasy-catalog-2026-10-16-960.webp'
import lisaImg from './assets/lisa.png'
import perulogImg from './assets/PerulogPallets.png'
import './ProofHubPage.css'

const proofItems = [
  {
    index: '01',
    title: 'Localisa',
    sector: 'Información / Mapa',
    status: 'Mapa interactivo',
    summary: 'Plataforma pública con mapa y filtros para consultar plazas SERUMS en distintas regiones del Perú.',
    verify: 'Se puede abrir la plataforma publicada y comprobar directamente su experiencia de búsqueda y consulta territorial.',
    image: lisaImg,
    imageSrcSet: undefined,
    href: 'https://www.localisa.pe/',
    action: 'Abrir plataforma',
    external: true,
  },
  {
    index: '02',
    title: 'Wasy',
    sector: 'Mercado digital',
    status: 'Catálogo web · App móvil',
    summary: 'Catálogo web para explorar productos, usar carrito y continuar el pedido por WhatsApp.',
    verify: 'El caso documenta el catálogo y el recorrido del pedido; desde allí se puede abrir wasy.store.',
    image: wasyImg,
    imageSrcSet: `${wasyImg640} 640w, ${wasyImg} 960w`,
    href: '/casos/wasy/',
    action: 'Revisar caso',
  },
  {
    index: '03',
    title: 'Checkio',
    sector: 'RRHH / Operación',
    status: 'Plataforma de RR. HH.',
    summary: 'Plataforma para asistencia, incidencias y gestión operativa de colaboradores.',
    verify: 'Se puede revisar el producto y un caso que documenta el problema, el alcance y sus flujos.',
    image: checkioImg,
    imageSrcSet: undefined,
    href: '/casos/checkio/',
    action: 'Revisar caso',
  },
  {
    index: '04',
    title: 'PeruLog Pallets',
    sector: 'B2B / Presencia digital',
    status: 'Soluciones B2B',
    summary: 'Landing comercial B2B para explicar servicios, propuesta de valor y canales de contacto.',
    verify: 'Se puede revisar el sitio publicado como evidencia de diseño y desarrollo de una superficie comercial B2B.',
    image: perulogImg,
    imageSrcSet: undefined,
    href: 'https://perulogpallets.com.pe/',
    action: 'Abrir sitio',
    external: true,
  },
]

export default function ProofHubPage() {
  return (
    <div className="proofPage">
      <header className="proofNav">
        <a href="/" className="proofBrand" aria-label="Volver a Orbital Frameworks">
          <img src={orbitalLogo} alt="Orbital Frameworks" width={200} height={20} />
        </a>
        <nav className="proofNavLinks" aria-label="Navegación de evidencia">
          <a href="#trabajo">Trabajo</a>
          <a href="#criterio">Criterio</a>
          <a href="/#contacto">Contacto</a>
        </nav>
      </header>

      <main>
        <section className="proofHero">
          <div className="proofGrid" aria-hidden="true" />
          <div className="proofHeroCopy">
            <p className="proofEyebrow">Evidencia pública / Orbital Frameworks</p>
            <h1>Trabajo que se puede revisar antes de conversar.</h1>
            <p className="proofLead">Esta página reúne productos y superficies públicas de Orbital Frameworks. El objetivo no es mostrar métricas inventadas, sino permitir revisar qué existe, cómo se presenta y qué tipo de problemas se han trabajado.</p>
            <div className="proofHeroActions">
              <a className="btn btnPrimary" href="#trabajo">Revisar evidencia</a>
              <a className="btn btnGhost" href="/#contacto">Plantear una situación</a>
            </div>
          </div>
          <aside className="proofHeroAside">
            <span>Qué se puede comprobar aquí</span>
            <strong>Productos publicados, casos documentados y superficies comerciales reales.</strong>
            <p>Cuando un proyecto está en beta o en pruebas, se indica expresamente. No se atribuyen clientes, impacto económico ni resultados que no estén respaldados.</p>
          </aside>
        </section>

        <section id="trabajo" className="proofWork">
          <header className="proofSectionHead">
            <div>
              <span className="proofEyebrow">Selección / 04</span>
              <h2>Cuatro formas distintas de convertir una necesidad en software o presencia digital.</h2>
            </div>
            <p>La selección cubre operación interna, comercio digital, información territorial y presencia comercial B2B.</p>
          </header>
          <div className="proofList">
            {proofItems.map((item) => (
              <article className="proofItem" key={item.title}>
                <div className="proofItemMedia">
                  <img src={item.image} srcSet={item.imageSrcSet} sizes={item.imageSrcSet ? '(max-width: 920px) 100vw, 48vw' : undefined} alt={item.title === 'Wasy' ? 'Captura del catálogo público de Wasy con productos y carrito' : `Vista de ${item.title}`} loading="lazy" width={item.imageSrcSet ? 960 : 640} height={item.imageSrcSet ? 704 : 360} decoding="async" />
                </div>
                <div className="proofItemBody">
                  <div className="proofItemMeta"><span>{item.index}</span><span>{item.sector}</span></div>
                  <h3>{item.title}</h3>
                  <p className="proofStatus">{item.status}</p>
                  <p className="proofSummary">{item.summary}</p>
                  <div className="proofVerify"><span>Qué verificar</span><p>{item.verify}</p></div>
                  <a className="proofLink" href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noopener noreferrer' : undefined}>{item.action} ↗</a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="criterio" className="proofCriteria">
          <div className="proofCriteriaIntro">
            <span className="proofEyebrow">Criterio de trabajo</span>
            <h2>La prueba no termina en una captura.</h2>
          </div>
          <div className="proofCriteriaGrid">
            <article><span>01</span><h3>Problema antes que formato</h3><p>Una web, un sistema o una automatización solo tiene sentido si responde a una situación concreta.</p></article>
            <article><span>02</span><h3>Alcance verificable</h3><p>Se distingue lo que ya existe, lo que está en pruebas y lo que todavía no debe presentarse como resultado.</p></article>
            <article><span>03</span><h3>Siguiente paso pequeño</h3><p>La primera conversación busca identificar una intervención útil y acotada, no forzar un proyecto completo.</p></article>
          </div>
        </section>

        <section className="proofCta">
          <div>
            <span className="proofEyebrow">Siguiente conversación</span>
            <h2>Si hay una fricción concreta, se puede revisar antes de decidir qué construir.</h2>
            <p>Describe el negocio, la situación observada y el cambio que tendría valor. Orbital revisará el contexto antes de recomendar una solución.</p>
          </div>
          <a className="btn btnPrimary" href="mailto:contact.orbitalframeworks@gmail.com?subject=Revisar%20una%20situaci%C3%B3n%20-%20Orbital%20Frameworks">Plantear una situación</a>
        </section>
      </main>
    </div>
  )
}
