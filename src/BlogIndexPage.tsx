import orbitalLogo from './assets/Orbital Frameworks (1).png'
import { blogPosts, blogPostSlugs } from './blogData'
import './Blog.css'

export default function BlogIndexPage() {
  const posts = blogPostSlugs.map((slug) => blogPosts[slug])

  return (
    <div className="blogPage">
      <header className="blogNav">
        <a href="/" className="blogBrand" aria-label="Volver a Orbital Frameworks">
          <img src={orbitalLogo} alt="Orbital Frameworks" width={200} height={20} />
        </a>
        <nav className="blogNavActions" aria-label="Navegación de blog">
          <a href="/#servicios">Servicios</a>
          <a href="/#proyectos">Proyectos</a>
          <a href="/evidencia/">Evidencia</a>
          <a href="/sobre-orbital-frameworks/">Sobre Orbital</a>
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
            <li aria-current="page">
              <span>Blog</span>
            </li>
          </ol>
        </nav>
      </div>

      <main>
        <section className="blogHero">
          <div className="blogHeroGrid" aria-hidden="true" />
          <div className="blogHeroCopy">
            <div className="blogEyebrow">Orbital Insights / Criterios técnicos de software</div>
            <h1>Análisis sobre software, automatización y decisiones operativas en empresas.</h1>
            <p className="blogHeroLead">
              Artículos técnicos, marcos de decisión y evaluaciones de arquitectura elaborados por el equipo de Orbital Frameworks para directores y líderes de operaciones en Perú. Sin testimonios inventados, métricas infladas ni promesas vacías.
            </p>
            <div className="blogHeroActions">
              <a href="/feed.xml" className="blogRssLink" title="Feed RSS de Orbital Insights">
                <span aria-hidden="true">📡</span> Suscribirse vía RSS (feed.xml)
              </a>
              <a href="/servicios/desarrollo-software-medida/" className="blogRssLink">
                Ver servicios de desarrollo ↗
              </a>
            </div>
          </div>
        </section>

        <section className="blogIndexMain">
          <header className="blogSectionHeader">
            <h2>Artículos y análisis técnicos</h2>
            <p>Evaluaciones fundamentadas en experiencias reales de desarrollo y arquitectura de sistemas.</p>
          </header>

          <div className="blogPostsGrid">
            {posts.map((post) => (
              <article key={post.slug} className="blogPostCard">
                <div className="blogPostCardTop">
                  <div className="blogPostCardBadges">
                    <span className="blogPostCardEyebrow">{post.eyebrow}</span>
                    {post.status === 'DRAFT_NO_PUBLICABLE' && (
                      <span className="blogDraftBadge">{post.statusLabel}</span>
                    )}
                  </div>
                  <h3 className="blogPostCardTitle">
                    <a href={post.route}>{post.title}</a>
                  </h3>
                  <p className="blogPostCardSummary">{post.metaDescription}</p>
                </div>

                <div className="blogPostCardBottom">
                  <span>
                    {post.datePublished} · {post.readingTime}
                  </span>
                  <a href={post.route} className="blogPostCardReadLink">
                    Leer análisis <span aria-hidden="true">→</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
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
