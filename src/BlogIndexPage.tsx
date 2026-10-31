import { createElement as h, useState, type ReactNode } from 'react'
import orbitalLogo from './assets/Orbital Frameworks (1).png'
import {
  BLOG_CATEGORIES,
  BLOG_CORPUS,
  categoryName,
  type BlogCategoryId,
} from './blogIndexData.ts'
import {
  buildHighlightRegex,
  filterAndSearchBlogPosts,
  tokenizeSearchQuery,
} from './blogSearch.ts'
import './Blog.css'

const ALL = 'todos'
const SEARCH_ID = 'blog-search-field'

const D = (c: string, ...ch: ReactNode[]) => h('div', { className: c }, ...ch)
const S = (c: string, ...ch: ReactNode[]) => h('span', { className: c }, ...ch)

const brand = (label: string) => (
  <a href="/" className="blogBrand">
    <img src={orbitalLogo} alt={label} width={200} height={20} />
  </a>
)

const NAV: [string, string][] = [
  ['/#servicios', 'Servicios'],
  ['/#proyectos', 'Proyectos'],
  ['/evidencia/', 'Evidencia'],
  ['/sobre-orbital-frameworks/', 'Sobre Orbital'],
  ['/#contacto', 'Contacto'],
]

const FOOT: [string, string][] = [
  ['/', 'Inicio'],
  ['/#servicios', 'Servicios'],
  ['/#proyectos', 'Casos'],
  ['/evidencia/', 'Evidencia'],
  ['/blog/', 'Blog'],
  ['/sobre-orbital-frameworks/', 'Sobre Orbital'],
  ['/privacy', 'Privacidad'],
  ['/terms', 'Términos'],
]

const links = (items: [string, string][]) => items.map(([href, text]) => <a key={href} href={href}>{text}</a>)

const HEADER = (
  <header className="blogNav">
    {brand('Volver a Orbital Frameworks')}
    <nav className="blogNavActions" aria-label="Navegación de blog">{links(NAV)}</nav>
  </header>
)

const CRUMB = D(
  'blogBreadcrumbShell',
  <nav className="blogBreadcrumb" aria-label="Ruta de navegación">
    <ol>
      <li><a href="/">Inicio</a></li>
      <li aria-hidden="true">/</li>
      <li aria-current="page"><span>Blog</span></li>
    </ol>
  </nav>,
)

const HERO = (
  <section className="blogHero">
    <div className="blogHeroGrid" aria-hidden="true" />
    {D(
      'blogHeroCopy',
      D('blogEyebrow', BLOG_CORPUS[2][0].eyebrow),
      <h1>Análisis sobre software, automatización y decisiones operativas en empresas.</h1>,
      <p className="blogHeroLead">
        Artículos técnicos, marcos de decisión y evaluaciones de arquitectura elaborados por el equipo de Orbital Frameworks para directores y líderes de operaciones en Perú. Sin testimonios inventados, métricas infladas ni promesas vacías.
      </p>,
      D(
        'blogHeroActions',
        <a href="#articulos" className="blogRssLink">Leer artículos ↓</a>,
        <a href="/servicios/desarrollo-software-medida/" className="blogRssLink">Ver servicios de desarrollo ↗</a>,
      ),
    )}
  </section>
)

const FOOTER = (
  <footer className="blogFooter">
    {D('blogFooterTop', brand('Orbital Frameworks'), <p>Empresa peruana de desarrollo de software y soluciones digitales.</p>)}
    <nav className="blogFooterLinks" aria-label="Enlaces del pie de página">
      {links(FOOT)}
      <a href="https://www.linkedin.com/company/orbitalframeworks/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
    </nav>
    {D('blogFooterBottom', '© 2026 Orbital Frameworks. Todos los derechos reservados.')}
  </footer>
)

const H = (t: string, r: RegExp | null) =>
  r ? t.split(r).map((p, i) => (i % 2 ? <mark key={i} className="blogHighlight">{p}</mark> : p)) : t

export default function BlogIndexPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategoryId, setActiveCategoryId] = useState<BlogCategoryId>(ALL)

  const tokens = tokenizeSearchQuery(searchQuery)
  const highlightRegex = buildHighlightRegex(tokens)
  const allFiltered = filterAndSearchBlogPosts(BLOG_CORPUS, searchQuery)
  const results = activeCategoryId === ALL ? allFiltered : allFiltered.filter(([i]) => i[1] === activeCategoryId)

  const counts: Record<string, number> = { [ALL]: allFiltered.length }
  for (const [i] of allFiltered) counts[i[1]] = -~counts[i[1]]

  const clear = (all?: boolean) => {
    setSearchQuery('')
    if (all) setActiveCategoryId(ALL)
    document.getElementById(SEARCH_ID)?.focus()
  }

  const q = searchQuery.trim()

  return D(
    'blogPage',
    HEADER,
    CRUMB,
    h(
      'main',
      null,
      HERO,
      h(
        'section',
        { className: 'blogIndexMain', id: 'articulos' },
        h('header', { className: 'blogSectionHeader' }, <h2>Artículos y análisis técnicos</h2>, <p>Evaluaciones fundamentadas en experiencias reales de desarrollo y arquitectura de sistemas.</p>),
        D(
          'blogFilterToolbar',
          h(
            'fieldset',
            { className: 'blogCategoryGroup' },
            h('legend', { className: 'blogCategoryGroupLabel' }, 'Filtrar por tema'),
            D(
              'blogCategoryList',
              BLOG_CATEGORIES.map(([id, label]) => {
                const a = activeCategoryId === id
                return (
                  <button
                    key={id}
                    id={'cat-' + id}
                    type="button"
                    aria-pressed={a}
                    className={'blogCategoryBtn' + (a ? ' isCategoryActive' : '')}
                    onClick={() => setActiveCategoryId(id)}
                  >
                    {label}{S('blogCategoryCount', counts[id] || 0)}
                  </button>
                )
              }),
            ),
          ),
          D(
            'blogSearchContainer',
            <label htmlFor={SEARCH_ID} className="blogSearchLabel">Buscar</label>,
            D(
              'blogSearchBox',
              <input
                id={SEARCH_ID}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && clear()}
                placeholder="Buscar en todos los artículos"
                className="blogSearchInput"
                aria-describedby="blog-results-status"
                autoComplete="off"
              />,
              q && (
                <button type="button" onClick={() => clear()} className="blogSearchClearBtn" aria-label="Limpiar búsqueda">
                  ×
                </button>
              ),
            ),
          ),
          D(
            'blogResultsBar',
            h('div', { id: 'blog-results-status', className: 'blogResultsStatus', role: 'status', 'aria-live': 'polite' }, `${results.length} artículo${results.length === 1 ? '' : 's'}${q ? ' para "' + q + '"' : ''}`),
            (activeCategoryId !== ALL || q) && (
              <button type="button" onClick={() => clear(true)} className="blogResetBtn">
                Restablecer
              </button>
            ),
          ),
        ),
        !results.length
          ? D(
              'blogEmptyState',
              <h3 className="blogEmptyTitle">Sin artículos</h3>,
              <button type="button" onClick={() => clear(true)} className="blogEmptyResetBtn blogRssLink">Ver todos</button>,
            )
          : D(
              'blogPostsGrid',
              results.map(([item, , s]) => {
                const p = item[0]
                return (
                  <article key={p.slug} className="blogPostCard">
                    <a href={p.route} className="blogPostCardSurface" aria-label={`Leer artículo: ${p.title}`}>
                      {D(
                        'blogPostCardTop',
                        D('blogPostCardBadges', S('blogPostCardCategoryBadge', categoryName(item[1])), S('blogPostCardEyebrow', p.eyebrow)),
                        <h3 className="blogPostCardTitle">{H(p.title, highlightRegex)}</h3>,
                        <p className="blogPostCardSummary">
                          {q ? S('blogSnippetMatchBlock', <b>{s[0]}: </b>, H(s[1], highlightRegex)) : p.metaDescription}
                        </p>,
                      )}
                      {D(
                        'blogPostCardBottom',
                        <span>{p.datePublished} · {p.readingTime}</span>,
                        S('blogPostCardReadLink', 'Leer análisis →'),
                      )}
                    </a>
                  </article>
                )
              }),
            ),
        D(
          'blogFeedNote',
          <span>¿Utilizas un lector RSS?</span>,
          <a className="blogRssLink" href="/feed.xml">Abrir feed RSS</a>,
        ),
      ),
    ),
    FOOTER,
  )
}
