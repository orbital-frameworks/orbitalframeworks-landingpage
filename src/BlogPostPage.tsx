import orbitalLogo from './assets/Orbital Frameworks (1).png'
import { blogPosts, type BlogPostSlug } from './blogData'
import { b2b05ArticleHtml } from './blogB2B05Html'
import ContactCapturePanel from './ContactCapturePanel'
import './Blog.css'

export default function BlogPostPage({ slug }: { slug: BlogPostSlug }) {
  const post = blogPosts[slug]

  return (
    <div className="blogPage">
      <header className="blogNav">
        <a href="/" className="blogBrand" aria-label="Volver a Orbital Frameworks">
          <img src={orbitalLogo} alt="Orbital Frameworks" width={200} height={20} />
        </a>
        <nav className="blogNavActions" aria-label="Navegación de artículo">
          {[
            ['/#servicios', 'Servicios'],
            ['/#proyectos', 'Proyectos'],
            ['/evidencia/', 'Evidencia'],
            ['/blog/', 'Blog'],
            ['/#contacto', 'Contacto'],
          ].map(([h, l]) => <a key={h} href={h}>{l}</a>)}
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
            {slug === 'integracion-pedidos-whatsapp-almacen-operaciones' ? (
              <div className="blogB2B05Prose" dangerouslySetInnerHTML={{ __html: b2b05ArticleHtml }} />
            ) : (
              <>
              <p className="blogHeroLead" style={{ marginTop: '24px' }}>
                {post.lead}
              </p>
              {post.sections.map((section) => (
              <section key={section.heading} className="blogSectionBlock">
                <h2>{section.heading}</h2>
                {section.content.map((paragraph, pIdx) => (
                  <p key={pIdx}>{paragraph}</p>
                ))}

                {/* Render Decision Matrix within the decision matrix section */}
                {section.heading.includes('Matriz de decisión') && (
                  <div className="blogMatrixShell">
                    <table className="blogMatrixTable">
                      <thead>
                        <tr>
                          <th scope="col">Pregunta de diagnóstico operativo</th>
                          <th scope="col">
                            {post.slug === 'automatizacion-procesos-vs-excel-riesgo-operativo'
                              ? 'Señal para mantener / optimizar hoja de cálculo'
                              : 'Señal favorable para SaaS estándar'}
                          </th>
                          <th scope="col">
                            {post.slug === 'automatizacion-procesos-vs-excel-riesgo-operativo'
                              ? 'Señal para automatizar o migrar a sistema dedicado'
                              : 'Señal favorable para Software a medida'}
                          </th>
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
              </>
            )}

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

            <section className="blogCtaBox" id="contacto">
              <ContactCapturePanel
                sourcePage={`/blog/${slug}/`}
                articleSlug={slug}
                headline={post.cta.headline}
                subheadline={post.cta.description}
                customSubject={post.cta.subject}
                customBody={post.cta.body}
                gmailLabel="Consultar por correo ↗"
                compact={true}
              />
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
          {[
            ['/', 'Inicio'],
            ['/#servicios', 'Servicios'],
            ['/#proyectos', 'Casos'],
            ['/evidencia/', 'Evidencia'],
            ['/blog/', 'Blog'],
            ['/sobre-orbital-frameworks/', 'Sobre Orbital'],
            ['/privacy', 'Privacidad'],
            ['/terms', 'Términos'],
          ].map(([h, l]) => <a key={h} href={h}>{l}</a>)}
          <a href="https://www.linkedin.com/company/orbitalframeworks/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
        </nav>

        <div className="blogFooterBottom">
          <p>© 2026 Orbital Frameworks. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
