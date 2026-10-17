import checkioImg from './assets/checkio.png'
import wasyImg640 from './assets/wasy-catalog-2026-10-16-640.webp'
import wasyImg from './assets/wasy-catalog-2026-10-16-960.webp'
import lisaImg from './assets/lisa.png'
import perulogImg from './assets/PerulogPallets.png'
import orbitalLogo from './assets/Orbital Frameworks (1).png'
import { caseStudies, type CaseStudySlug } from './caseStudies'
import './CaseStudyPage.css'

const images: Record<CaseStudySlug, string> = {
  checkio: checkioImg,
  wasy: wasyImg,
  localisa: lisaImg,
  'perulog-pallets': perulogImg,
}

export default function CaseStudyPage({ slug }: { slug: CaseStudySlug }) {
  const study = caseStudies[slug]
  const gmailComposeUrl = 'https://mail.google.com/mail/?view=cm&fs=1&to=contact.orbitalframeworks%40gmail.com&su=Revisar%20un%20caso%20-%20Orbital%20Frameworks&body=Proyecto%20o%20negocio%3A%0A%0AProblema%20actual%3A%0A%0AC%C3%B3mo%20se%20resuelve%20hoy%3A%0A%0AResultado%20que%20tendr%C3%ADa%20valor%3A%0A'

  return (
    <div className="casePage">
      <header className="caseNav">
        <a href="/" className="caseBrand" aria-label="Volver a Orbital Frameworks">
          <img src={orbitalLogo} alt="Orbital Frameworks" width={200} height={20} />
        </a>
        <div className="caseNavActions">
          <a href="/evidencia/">Evidencia</a>
          <a href="/sobre-orbital-frameworks/">Sobre Orbital</a>
          <a href="/#proyectos">Todos los proyectos</a>
          <a href="/#contacto">Contacto</a>
        </div>
      </header>

      <main>
        <section className="caseHero">
          <div className="caseHeroGrid" aria-hidden="true" />
          <div className="caseHeroCopy">
            <div className="caseEyebrow">{study.eyebrow}</div>
            <h1>{study.title}</h1>
            <p>{study.summary}</p>
            <div className="caseHeroActions">
              <a className="caseProductCta" href={study.publicUrl} target="_blank" rel="noopener noreferrer">Abrir producto público ↗</a>
            </div>
            <div className="caseHeroMeta">
              <span>{study.status}</span>
              <span>Producto verificable en web</span>
            </div>
          </div>
          <div className={`caseHeroMedia${slug === 'wasy' ? ' caseHeroMedia--wasy' : ''}`}>
            <img src={images[slug]} srcSet={slug === 'wasy' ? `${wasyImg640} 640w, ${wasyImg} 960w` : undefined} sizes={slug === 'wasy' ? '(max-width: 980px) 100vw, 55vw' : undefined} alt={slug === 'wasy' ? 'Captura del catálogo público de Wasy con productos y carrito' : `Vista del producto ${study.title}`} width={960} height={slug === 'wasy' ? 704 : 540} loading="eager" decoding="async" />
          </div>
        </section>

        <section className={`caseNarrative${slug === 'wasy' ? ' caseNarrative--wasy' : ''}`}>
          <article>
            <span>01 / Problema</span>
            <p>{study.problem}</p>
          </article>
          <article>
            <span>02 / Enfoque</span>
            <p>{study.approach}</p>
          </article>
          <article>
            <span>03 / Estado verificable</span>
            <p>{study.outcome}</p>
          </article>
        </section>

        {slug !== 'wasy' && study.capabilities.length > 0 && (
          <section className="caseCapabilities">
            <header>
              <div className="caseSectionLabel">Alcance funcional</div>
              <h2>Qué existe dentro del producto.</h2>
            </header>
            <div className="caseCapabilityGrid">
              {study.capabilities.map((capability, index) => (
                <div key={capability} className="caseCapability">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{capability}</strong>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className={`caseFlows${slug === 'wasy' ? ' caseFlows--wasy' : ''}`}>
          <header className={slug === 'wasy' ? 'caseFlowsHeader--wasy' : undefined}>
            <div className="caseSectionLabel">Recorrido operativo</div>
            <h2>Cómo se conecta el trabajo.</h2>
          </header>
          <div className="caseFlowGrid">
            {study.flows.map((flow, index) => (
              <article key={flow.title} className={slug === 'wasy' ? 'caseFlowStep' : undefined}>
                {slug === 'wasy' && (
                  <div className="caseFlowStepMeta">
                    <span className="caseFlowStepNumber">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                )}
                <h3>{flow.title}</h3>
                <p>{flow.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="caseDecisions">
          <header>
            <div className="caseSectionLabel">Decisiones de producto</div>
            <h2>Qué se priorizó y por qué.</h2>
          </header>
          <div className="caseDecisionList">
            {study.decisions.map((decision, index) => (
              <article key={decision.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{decision.title}</h3>
                  <p>{decision.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="caseEvidence" aria-label="Evidencia pública y revisión del producto">
          <div className="caseEvidenceMain">
            <header className="caseEvidenceHead">
              <div className="caseSectionLabel">Evidencia pública</div>
              <h2>Lo que puedes comprobar.</h2>
              <p>Referencias concretas para explorar el trabajo realizado.</p>
            </header>
            <ul className="caseEvidenceList">{study.evidence.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <aside className="caseEvidenceVisit">
            <div className="caseSectionLabel">Revisión directa</div>
            <h3>Explora el producto.</h3>
            <p>Abre la versión pública y revisa la experiencia por tu cuenta.</p>
            <div className="caseEvidenceVisitBottom">
              <span className="caseEvidenceStatus">{study.status}</span>
              <a href={study.publicUrl} target="_blank" rel="noopener noreferrer" aria-label={`Abrir ${study.title} en una pestaña nueva`}>Abrir producto público <span aria-hidden="true">↗</span></a>
            </div>
          </aside>
        </section>

        <section className="caseCta">
          <div>
            <span>Siguiente conversación</span>
            <h2>¿Tienes un problema operativo parecido?</h2>
            <p>Describe la situación actual y el resultado que tendría valor. Orbital revisará el contexto antes de recomendar una solución.</p>
          </div>
          <a className="btn btnPrimary" href={gmailComposeUrl} target="_blank" rel="noopener noreferrer">Escribir a Orbital ↗</a>
        </section>
      </main>
    </div>
  )
}
