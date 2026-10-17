import { useState } from 'react'
import orbitalLogo from './assets/Orbital Frameworks (1).png'
import { blogPosts, type BlogPostSlug } from './blogData'
import { trackContactIntent, trackArticleIntent } from './analytics'
import './Blog.css'

export default function BlogPostPage({ slug }: { slug: BlogPostSlug }) {
  const post = blogPosts[slug]
  const [copied, setCopied] = useState(false)

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=contact.orbitalframeworks%40gmail.com&su=${encodeURIComponent(
    post.cta.subject,
  )}&body=${encodeURIComponent(post.cta.body)}`

  const handleCopyEmail = () => {
    trackContactIntent('copy_email', { source_page: `/blog/${slug}/`, article_slug: slug })
    trackArticleIntent('article_to_contact', 'copy_email', slug)
    navigator.clipboard?.writeText('contact.orbitalframeworks@gmail.com').catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="blogPage">
      <header className="blogNav">
        <a href="/" className="blogBrand" aria-label="Volver a Orbital Frameworks">
          <img src={orbitalLogo} alt="Orbital Frameworks" width={200} height={20} />
        </a>
        <nav className="blogNavActions" aria-label="Navegación de artículo">
          <a href="/#servicios">Servicios</a>
          <a href="/#proyectos">Proyectos</a>
          <a href="/evidencia/">Evidencia</a>
          <a href="/blog/">Blog</a>
          <a href="/#contacto">Contacto</a>
        </nav>
      </header>

      <div className="blogBreadcrumbShell">
        <nav aria-label="Ruta de navegación" className="blogBreadcrumb">
          <ol>
            <li>
              <a href="/">Inicio</a>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <a href="/blog/">Blog</a>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">
              <span>{post.title}</span>
            </li>
          </ol>
        </nav>
      </div>

      <main>
        <article className="blogArticleMain">
          <header className="blogHeroCopy">
            <div className="blogEyebrow">{post.eyebrow}</div>
            <h1>{post.title}</h1>
            <div className="blogHeroMeta">
              <span>Publicado: {post.datePublished}</span>
              <span aria-hidden="true">·</span>
              <span>{post.readingTime}</span>
              <span aria-hidden="true">·</span>
              <span>Por {post.author.name}</span>
            </div>

            {post.status === 'DRAFT_NO_PUBLICABLE' && (
              <div className="blogDraftBanner" role="region" aria-label="Aviso de estado editorial">
                <div className="blogDraftHeader">
                  <span className="blogDraftBadge">{post.statusLabel}</span>
                </div>
                <p className="blogDraftNotice">{post.statusNotice}</p>
                <div className="blogDraftQuestionBox">
                  <strong>Pregunta priorizada para el equipo técnico y de operaciones:</strong>
                  <p>«{post.prioritizedOwnerQuestion}»</p>
                </div>
              </div>
            )}
          </header>

          <div className="blogArticleContent">
            <p className="blogHeroLead" style={{ marginTop: '24px' }}>
              {post.lead}
            </p>

            {post.sections.map((section, idx) => (
              <section key={section.heading} className="blogSectionBlock">
                <h2>{section.heading}</h2>
                {section.content.map((paragraph, pIdx) => (
                  <p key={pIdx}>{paragraph}</p>
                ))}

                {/* Render Decision Matrix within Section 5 */}
                {idx === 4 && (
                  <div className="blogMatrixShell">
                    <table className="blogMatrixTable">
                      <thead>
                        <tr>
                          <th scope="col">Pregunta de diagnóstico operativo</th>
                          <th scope="col">Señal favorable para SaaS estándar</th>
                          <th scope="col">Señal favorable para Software a medida</th>
                        </tr>
                      </thead>
                      <tbody>
                        {post.decisionMatrix.map((row) => (
                          <tr key={row.question}>
                            <td>{row.question}</td>
                            <td>{row.saasOption}</td>
                            <td>{row.customOption}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}

            <div className="blogLinksBox">
              <h3>Servicios y referencias verificadas</h3>
              <ul className="blogLinksList">
                {post.internalLinks.map((link) => (
                  <li key={link.url} className="blogLinksItem">
                    <a href={link.url}>{link.anchor} ↗</a>
                    <span>{link.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <section className="blogCtaBox">
              <h3>{post.cta.headline}</h3>
              <p>{post.cta.description}</p>
              <div className="blogCtaActions">
                <a
                  className="blogPrimaryBtn"
                  href={gmailComposeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Consultar por correo ↗
                </a>
                <button
                  type="button"
                  className="blogGhostBtn"
                  onClick={handleCopyEmail}
                >
                  {copied ? '✓ Correo copiado' : 'Copiar correo'}
                </button>
              </div>
            </section>
          </div>
        </article>
      </main>

      <footer className="blogFooter">
        <div className="blogFooterTop">
          <a href="/" className="blogBrand" aria-label="Orbital Frameworks">
            <img src={orbitalLogo} alt="Orbital Frameworks" width={160} height={16} />
          </a>
          <p>Empresa peruana de desarrollo de software y soluciones digitales.</p>
        </div>

        <nav className="blogFooterLinks" aria-label="Enlaces del pie de página">
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

        <div className="blogFooterBottom">
          <p>© 2026 Orbital Frameworks. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
