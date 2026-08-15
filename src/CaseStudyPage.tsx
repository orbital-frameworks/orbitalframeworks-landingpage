import checkioImg from './assets/checkio.png'
import veterpImg from './assets/veterp_sis.png'
import orbitalLogo from './assets/Orbital Frameworks (1).png'
import { caseStudies, type CaseStudySlug } from './caseStudies'
import './CaseStudyPage.css'

const images: Record<CaseStudySlug, string> = {
  checkio: checkioImg,
  veterp: veterpImg,
}

export default function CaseStudyPage({ slug }: { slug: CaseStudySlug }) {
  const study = caseStudies[slug]

  return (
    <div className="casePage">
      <header className="caseNav">
        <a href="/" className="caseBrand" aria-label="Volver a Orbital Frameworks">
          <img src={orbitalLogo} alt="Orbital Frameworks" />
        </a>
        <div className="caseNavActions">
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
            <div className="caseHeroMeta">
              <span>{study.status}</span>
              <a href={study.publicUrl} target="_blank" rel="noopener noreferrer">Abrir producto público ↗</a>
            </div>
          </div>
          <div className="caseHeroMedia">
            <img src={images[slug]} alt={`Vista del producto ${study.title}`} />
          </div>
        </section>

        <section className="caseNarrative">
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

        <section className="caseFlows">
          <header>
            <div className="caseSectionLabel">Recorrido operativo</div>
            <h2>Cómo se conecta el trabajo.</h2>
          </header>
          <div className="caseFlowGrid">
            {study.flows.map((flow) => (
              <article key={flow.title}>
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

        <section className="caseEvidence">
          <div>
            <div className="caseSectionLabel">Evidencia revisada</div>
            <h2>Qué respalda este caso.</h2>
            <ul>{study.evidence.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <aside>
            <div className="caseSectionLabel">Límites del caso</div>
            <ul>{study.limits.map((item) => <li key={item}>{item}</li>)}</ul>
          </aside>
        </section>

        <section className="caseCta">
          <div>
            <span>Siguiente conversación</span>
            <h2>¿Tienes un problema operativo parecido?</h2>
            <p>Describe la situación actual y el resultado que tendría valor. Orbital revisará el contexto antes de recomendar una solución.</p>
          </div>
          <a className="btn btnPrimary" href="mailto:contact.orbitalframeworks@gmail.com?subject=Revisar%20un%20caso%20-%20Orbital%20Frameworks">Plantear un caso</a>
        </section>
      </main>
    </div>
  )
}
