import { useState } from 'react'
import orbitalLogo from './assets/Orbital Frameworks (1).png'
import { servicesData, serviceSlugs, type ServiceSlug } from './servicesData'
import { trackContactIntent, trackServiceIntent } from './analytics'
import './ServicePage.css'

export default function ServicePage({ slug }: { slug: ServiceSlug }) {
  const service = servicesData[slug]
  const [copied, setCopied] = useState(false)

  const otherServices = serviceSlugs
    .filter((s) => s !== slug)
    .map((s) => servicesData[s])

  const mailtoUrl = `mailto:contact.orbitalframeworks@gmail.com?subject=${encodeURIComponent(
    service.cta.subject,
  )}&body=${encodeURIComponent(service.cta.body)}`

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=contact.orbitalframeworks%40gmail.com&su=${encodeURIComponent(
    service.cta.subject,
  )}&body=${encodeURIComponent(service.cta.body)}`

  const handleCopyEmail = async () => {
    trackContactIntent('copy_email', { source_page: `/servicios/${slug}/`, service_slug: slug })
    trackServiceIntent('service_to_contact', 'copy_email', slug)
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText('contact.orbitalframeworks@gmail.com')
        setCopied(true)
        setTimeout(() => setCopied(false), 3000)
        return
      }
    } catch {
      // Fallback
    }

    try {
      const textarea = document.createElement('textarea')
      textarea.value = 'contact.orbitalframeworks@gmail.com'
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      // Ignore fallback failure
    }
  }

  return (
    <div className="servicePage">
      <header className="serviceNav">
        <a href="/" className="serviceBrand" aria-label="Volver a Orbital Frameworks">
          <img src={orbitalLogo} alt="Orbital Frameworks" width={200} height={20} />
        </a>
        <nav className="serviceNavActions" aria-label="Navegación de servicios">
          <a href="/#servicios">Servicios</a>
          <a href="/#proyectos">Proyectos</a>
          <a href="/evidencia/">Evidencia</a>
          <a href="/blog/">Blog</a>
          <a href="/sobre-orbital-frameworks/">Sobre Orbital</a>
          <a href="/#contacto">Contacto</a>
        </nav>
      </header>

      <div className="serviceBreadcrumbShell">
        <nav aria-label="Ruta de navegación" className="serviceBreadcrumb">
          <ol>
            <li>
              <a href="/">Inicio</a>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <a href="/#servicios">Servicios</a>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">
              <span>{service.name}</span>
            </li>
          </ol>
        </nav>
      </div>

      <main>
        <section className="serviceHero">
          <div className="serviceHeroGrid" aria-hidden="true" />
          <div className="serviceHeroCopy">
            <div className="serviceEyebrow">{service.eyebrow}</div>
            <h1>{service.heroHeadline}</h1>
            <p className="serviceHeroLead">{service.heroSummary}</p>

            <div className="serviceHeroActions">
              <a
                className="servicePrimaryCta"
                href={mailtoUrl}
              >
                Consultar por correo oficial
              </a>
              <a
                className="serviceSecondaryCta"
                href={gmailComposeUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir en Gmail ↗
              </a>
            </div>

            <div className="serviceHeroProofBanner">
              <span className="serviceProofBadge">{service.proofCase.badge}</span>
              <span className="serviceProofText">
                Ver implementación en{' '}
                <a href={service.proofCase.url}>{service.proofCase.title} →</a>
              </span>
            </div>
          </div>
        </section>

        <section className="serviceSection serviceAudienceSection">
          <header className="serviceSectionHeader">
            <span className="serviceSectionEyebrow">01 / Perfil de empresa</span>
            <h2>Para quién está pensado este servicio.</h2>
            <p>
              Diseñado para organizaciones que necesitan resolver cuellos de botella reales con software
              propio y orden operativo.
            </p>
          </header>

          <div className="serviceThreeColGrid">
            {service.targetAudience.map((item, index) => (
              <article key={item.title} className="serviceGridCard">
                <span className="serviceCardNumber">0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="serviceSection serviceProblemSection">
          <header className="serviceSectionHeader">
            <span className="serviceSectionEyebrow">02 / Diagnóstico operativo</span>
            <h2>El problema que resolvemos.</h2>
            <p>
              Los síntomas más comunes cuando las operaciones crecen y las herramientas genéricas
              dejan de responder.
            </p>
          </header>

          <div className="serviceThreeColGrid">
            {service.problemSolved.map((item, index) => (
              <article key={item.title} className="serviceGridCard serviceProblemCard">
                <span className="serviceCardNumber">0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="serviceSection serviceBoundarySection">
          <header className="serviceSectionHeader">
            <span className="serviceSectionEyebrow">03 / Criterio de honestidad</span>
            <h2>Cuándo NO recomendamos este servicio.</h2>
            <p>
              No forzamos proyectos si no existe una justificación técnica y económica clara para la
              empresa.
            </p>
          </header>

          <div className="serviceThreeColGrid">
            {service.whenNotRecommended.map((item, index) => (
              <article key={item.title} className="serviceGridCard serviceBoundaryCard">
                <span className="serviceCardNumber">NO 0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="serviceSection serviceTechSection">
          <header className="serviceSectionHeader">
            <span className="serviceSectionEyebrow">04 / Metodología y arquitectura</span>
            <h2>Cómo lo construimos y entregables.</h2>
            <p>
              Desarrollo con arquitectura limpia, pruebas automatizadas y entrega de código sin ataduras.
            </p>
          </header>

          <div className="serviceTechGrid">
            <div className="serviceDifferentiatorsList">
              {service.differentiatingValue.map((item) => (
                <article key={item.title} className="serviceDiffItem">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>

            <div className="serviceDeliverablesBox">
              <span className="serviceBoxLabel">Entregables concretos</span>
              <ul className="serviceDeliverablesList">
                {service.deliverables.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="serviceSection serviceProofSection">
          <header className="serviceSectionHeader">
            <span className="serviceSectionEyebrow">05 / Evidencia de trabajo</span>
            <h2>Caso público verificable.</h2>
            <p>
              Superficies reales construidas por Orbital Frameworks que pueden revisarse públicamente.
            </p>
          </header>

          <article className="serviceProofCard">
            <div className="serviceProofCardMain">
              <div className="serviceProofCardHead">
                <span className="serviceProofBadge">{service.proofCase.badge}</span>
                <h3>{service.proofCase.title}</h3>
              </div>
              <p>{service.proofCase.description}</p>
            </div>
            <div className="serviceProofCardAction">
              <a href={service.proofCase.url} className="serviceProofLink">
                Revisar detalle del caso ↗
              </a>
            </div>
          </article>
        </section>

        <section className="serviceSection serviceOthersSection">
          <header className="serviceSectionHeader">
            <span className="serviceSectionEyebrow">06 / Stack de servicios</span>
            <h2>Otras soluciones B2B de Orbital Frameworks.</h2>
            <p>Conozca nuestras otras capacidades técnicas y operativas.</p>
          </header>

          <div className="serviceTwoColGrid">
            {otherServices.map((other) => (
              <article key={other.slug} className="serviceOtherCard">
                <span className="serviceOtherEyebrow">{other.eyebrow}</span>
                <h3>{other.name}</h3>
                <p>{other.heroSummary}</p>
                <a href={other.route} className="serviceOtherLink">
                  Ver servicio: {other.name} →
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="serviceCtaSection" id="contacto">
          <div className="serviceCtaShell">
            <div className="serviceCtaHeader">
              <span className="serviceCtaEyebrow">07 / Próximo paso</span>
              <h2>Hablemos de la operación de tu negocio.</h2>
              <p>
                La primera conversación revisa tu situación concreta, cómo funciona hoy tu proceso,
                qué conviene sistematizar y cómo evaluaríamos el resultado. No exigimos tener definida
                la arquitectura antes de hablar.
              </p>
            </div>

            <div className="serviceCtaDetails">
              <div className="serviceCtaGuide">
                <h3>Qué incluir en el mensaje:</h3>
                <ol>
                  <li>Empresa u organización y sector en Perú.</li>
                  <li>Proceso, cuello de botella o problema concreto a resolver.</li>
                  <li>Herramientas o sistemas actuales (Excel, ERP previo, chats, web).</li>
                  <li>Prioridad y plazo estimado de inicio.</li>
                </ol>
              </div>

              <div className="serviceCtaActionsBox">
                <span className="serviceCtaChannelLabel">Canal directo oficial:</span>
                <a
                  className="serviceCtaPrimaryBtn"
                  href={mailtoUrl}
                >
                  Enviar correo a contact.orbitalframeworks@gmail.com
                </a>

                <div className="serviceCtaSubActions">
                  <a
                    className="serviceCtaSecondaryBtn"
                    href={gmailComposeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Abrir borrador en Gmail ↗
                  </a>

                  <button
                    type="button"
                    className="serviceCtaCopyBtn"
                    onClick={handleCopyEmail}
                  >
                    {copied ? '✓ Correo copiado' : 'Copiar dirección de correo'}
                  </button>
                </div>

                <div className="serviceCtaAssurance">
                  <span>Respuesta habitual: 24 a 48 horas hábiles.</span>
                  <span>Evaluación técnica directa sin presión comercial.</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="serviceFooter">
        <div className="serviceFooterTop">
          <a href="/" className="serviceFooterBrand" aria-label="Orbital Frameworks">
            <img src={orbitalLogo} alt="Orbital Frameworks" width={160} height={16} />
          </a>
          <p>Empresa peruana de desarrollo de software y soluciones digitales.</p>
        </div>

        <nav className="serviceFooterLinks" aria-label="Enlaces del pie de página">
          <a href="/">Inicio</a>
          <a href="/#servicios">Servicios</a>
          <a href="/#proyectos">Casos</a>
          <a href="/evidencia/">Evidencia</a>
          <a href="/blog/">Blog</a>
          <a href="/sobre-orbital-frameworks/">Sobre Orbital</a>
          <a href="/privacy">Privacidad</a>
          <a href="/terms">Términos</a>
          <a
            href="https://www.linkedin.com/company/orbitalframeworks/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn ↗
          </a>
        </nav>

        <div className="serviceFooterBottom">
          <p>© 2026 Orbital Frameworks. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
