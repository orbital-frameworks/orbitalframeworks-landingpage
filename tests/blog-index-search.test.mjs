import test from 'node:test'
import assert from 'node:assert/strict'

import {
  BLOG_CATEGORIES,
  BLOG_CORPUS,
  FIELD_BODY,
  FIELD_DESCRIPTION,
  FIELD_HEADING,
  FIELD_LEAD,
  FIELD_TABLE,
  FIELD_TITLE,
  extractHtmlSearchFields,
} from '../src/blogIndexData.ts'

import {
  buildHighlightRegex,
  extractSnippet,
  filterAndSearchBlogPosts,
  normalizeSearchText,
  tokenizeSearchQuery,
} from '../src/blogSearch.ts'

const slugs = (results) => results.map(([item]) => item[0].slug)

test('blog corpus keeps every published post in stable editorial order with explicit taxonomy', () => {
  assert.equal(BLOG_CORPUS.length, 8)
  assert.deepEqual(
    BLOG_CATEGORIES.map(([, label]) => label),
    ['Todos', 'Web y conversión', 'Automatización y operaciones', 'Software y sistemas'],
  )
  assert.deepEqual(
    BLOG_CORPUS.map((item) => item[0].slug),
    [
      'como-hacer-un-briefing-tecnico-de-software-b2b',
      'web-con-visitas-pero-sin-consultas',
      'integracion-pedidos-whatsapp-almacen-operaciones',
      'software-a-medida-o-saas-como-decidir',
      'automatizacion-procesos-vs-excel-riesgo-operativo',
      'landing-page-b2b-tecnica-vs-web-corporativa',
      'digitalizacion-asistencia-personal-campo-trazabilidad',
      'lisa-serums-mapa-datos-automatizacion',
    ],
  )
  assert.deepEqual(
    Object.fromEntries(BLOG_CORPUS.map((item) => [item[0].slug, item[1]])),
    {
      'como-hacer-un-briefing-tecnico-de-software-b2b': 'software-y-sistemas',
      'web-con-visitas-pero-sin-consultas': 'web-y-conversion',
      'integracion-pedidos-whatsapp-almacen-operaciones': 'automatizacion-y-operaciones',
      'software-a-medida-o-saas-como-decidir': 'software-y-sistemas',
      'automatizacion-procesos-vs-excel-riesgo-operativo': 'automatizacion-y-operaciones',
      'landing-page-b2b-tecnica-vs-web-corporativa': 'web-y-conversion',
      'digitalizacion-asistencia-personal-campo-trazabilidad': 'automatizacion-y-operaciones',
      'lisa-serums-mapa-datos-automatizacion': 'software-y-sistemas',
    },
  )
})

test('corpus extraction covers titles, leads, descriptions, headings, paragraphs, and tables for every article', () => {
  for (const item of BLOG_CORPUS) {
    assert.ok(item[2].length >= 4, `Article ${item[0].slug} must have at least 4 fields`)
    assert.ok(item[2].some((f) => f[0] === FIELD_TITLE && f[2].length > 0))
    assert.ok(item[2].some((f) => f[0] === FIELD_DESCRIPTION && f[2].length > 0))
    assert.ok(item[2].some((f) => f[0] === FIELD_LEAD && f[2].length > 0))

    if (item[0].slug === 'integracion-pedidos-whatsapp-almacen-operaciones') {
      // WhatsApp article uses one sanitized full-text field to avoid duplicating its HTML in memory.
      assert.ok(item[2].some((f) => f[0] === FIELD_BODY))
    } else {
      assert.ok(item[2].some((f) => f[0] === FIELD_HEADING))
      assert.ok(item[2].some((f) => f[0] === FIELD_BODY))
      if (item[0].decisionMatrix && item[0].decisionMatrix.length > 0) {
        assert.ok(item[2].some((f) => f[0] === FIELD_TABLE))
      }
    }
  }
})

test('normalization is accent-insensitive, case-insensitive, punctuation-safe, and deduplicates terms', () => {
  assert.equal(normalizeSearchText('  AUTOMATIZACIÓN, Perú  '), 'automatizacion peru')
  assert.equal(normalizeSearchText('¿Software a Medida? (SaaS vs. Custom)'), 'software a medida saas vs custom')
  assert.deepEqual(tokenizeSearchQuery('SaaS, saas + OPERACIÓN'), ['saas', 'operacion'])
  assert.deepEqual(tokenizeSearchQuery('   '), [])

  const regex = buildHighlightRegex(tokenizeSearchQuery('SaaS'))
  assert.ok(regex)
  assert.deepEqual('Software SaaS'.split(regex).filter(Boolean), ['Software ', 'SaaS'])
  assert.equal(buildHighlightRegex([]), null)
})

test('deep body search returns a contextual fragment, not only metadata', () => {
  const results = filterAndSearchBlogPosts(BLOG_CORPUS, 'transacciones ACID')
  assert.deepEqual(slugs(results), ['automatizacion-procesos-vs-excel-riesgo-operativo'])
  assert.match(results[0][2][1], /transacciones ACID/i)
  assert.match(results[0][2][0], /escala gradual/i)
  assert.ok(results[0][1] > 0)
})

test('special WhatsApp HTML contributes headings, paragraphs, lists, and table rows to search', () => {
  const htmlFields = extractHtmlSearchFields(`
    <h2>Operación &amp; despacho</h2>
    <p>Texto visible <strong>con contexto</strong>.</p>
    <ul><li>Lista operativa</li></ul>
    <table><tr><th>Estado</th><td>Stock reservado</td></tr></table>
    <script>contenido-que-no-debe-indexarse</script>
    <style>.css-que-no-debe-indexarse { display: none; }</style>
  `)
  assert.equal(htmlFields.length, 1, 'Special HTML is compacted into one sanitized search field')
  assert.ok(htmlFields.some(([kind, , text]) => kind === FIELD_BODY && text.includes('Operación & despacho')))
  assert.ok(htmlFields.some(([, , text]) => text.includes('Lista operativa')))
  assert.ok(htmlFields.some(([, , text]) => text.includes('Estado Stock reservado')))
  assert.ok(htmlFields.every(([, , text]) => !text.includes('contenido-que-no-debe-indexarse')))
  assert.ok(htmlFields.every(([, , text]) => !text.includes('css-que-no-debe-indexarse')))

  const results = filterAndSearchBlogPosts(BLOG_CORPUS, 'caducidad transporte')
  assert.deepEqual(slugs(results), ['integracion-pedidos-whatsapp-almacen-operaciones'])
  assert.equal(results[0][2][0], 'Artículo sobre WhatsApp')
  assert.match(results[0][2][1], /caducidad o transporte/i)
})

test('multiple words use AND semantics across the complete article corpus', () => {
  const results = filterAndSearchBlogPosts(BLOG_CORPUS, 'comprador intención')
  assert.deepEqual(slugs(results), ['landing-page-b2b-tecnica-vs-web-corporativa'])
  assert.deepEqual(filterAndSearchBlogPosts(BLOG_CORPUS, 'comprador término-inexistente'), [])
})

test('multiple words can match across different fields within the same article', () => {
  // 'visitas' is in title/lead, 'fricción' is in title
  const results = filterAndSearchBlogPosts(BLOG_CORPUS, 'visitas friccion')
  assert.ok(slugs(results).includes('web-con-visitas-pero-sin-consultas'))
})

test('relevance favors title matches and preserves source order for ties', () => {
  const makeItem = (slug, sourceOrder, fields) => [{ slug, metaDescription: '' }, 'software-y-sistemas', fields, sourceOrder]
  const items = [
    makeItem('body-first', 0, [[FIELD_BODY, 'Cuerpo', 'software operativo']]),
    makeItem('title-second', 1, [[FIELD_TITLE, 'Título', 'Software operativo']]),
    makeItem('body-third', 2, [[FIELD_BODY, 'Cuerpo', 'software operativo']]),
  ]

  assert.deepEqual(
    filterAndSearchBlogPosts(items, 'software operativo').map(([item]) => item[0].slug),
    ['title-second', 'body-first', 'body-third'],
  )
})

test('relevance hierarchy ranks title > heading > lead > metaDescription > table > body', () => {
  const makeSingleFieldItem = (slug, sourceOrder, kind, text) => [
    { slug, metaDescription: '' },
    'software-y-sistemas',
    [[kind, String(kind), text]],
    sourceOrder,
  ]

  const items = [
    makeSingleFieldItem('match-body', 0, FIELD_BODY, 'análisis de sistemas'),
    makeSingleFieldItem('match-table', 1, FIELD_TABLE, 'análisis de sistemas'),
    makeSingleFieldItem('match-desc', 2, FIELD_DESCRIPTION, 'análisis de sistemas'),
    makeSingleFieldItem('match-lead', 3, FIELD_LEAD, 'análisis de sistemas'),
    makeSingleFieldItem('match-heading', 4, FIELD_HEADING, 'análisis de sistemas'),
    makeSingleFieldItem('match-title', 5, FIELD_TITLE, 'análisis de sistemas'),
  ]

  const ranked = filterAndSearchBlogPosts(items, 'análisis')
  const rankedSlugs = ranked.map(([item]) => item[0].slug)

  assert.deepEqual(rankedSlugs, [
    'match-title',
    'match-heading',
    'match-lead',
    'match-desc',
    'match-table',
    'match-body',
  ])
})

test('category and query combine without leaking results from another category', () => {
  const allMatches = filterAndSearchBlogPosts(BLOG_CORPUS, 'operación')
  const automationMatches = allMatches.filter(([item]) => item[1] === 'automatizacion-y-operaciones')
  assert.ok(allMatches.length > automationMatches.length)
  assert.ok(automationMatches.length > 0)
  assert.ok(automationMatches.every(([item]) => item[1] === 'automatizacion-y-operaciones'))
  assert.equal(filterAndSearchBlogPosts(BLOG_CORPUS, 'transacciones ACID').filter(([item]) => item[1] === 'web-y-conversion').length, 0)
})

test('empty or whitespace query returns all category items in source order without match scoring', () => {
  const defaultAll = filterAndSearchBlogPosts(BLOG_CORPUS, '')
  assert.equal(defaultAll.length, BLOG_CORPUS.length)
  assert.deepEqual(
    defaultAll.map((r) => r[0][0].slug),
    BLOG_CORPUS.map((item) => item[0].slug),
  )
  assert.ok(defaultAll.every((r) => r[1] === 0))

  const defaultWeb = filterAndSearchBlogPosts(BLOG_CORPUS, '   ').filter(([item]) => item[1] === 'web-y-conversion')
  assert.equal(defaultWeb.length, 2)
  assert.ok(defaultWeb.every((r) => r[0][1] === 'web-y-conversion' && r[1] === 0))
})

test('snippet extraction trims cleanly and adds ellipsis when match is deep in text', () => {
  const field = [
    FIELD_BODY,
    'Sección profunda',
    'Inicio del párrafo con bastante texto introductorio antes de llegar a la frase clave de operaciones y luego continúa con más texto posterior para probar el truncamiento.',
  ]
  const snippet = extractSnippet(field, ['clave', 'operaciones'], 50)
  assert.equal(snippet[0], 'Sección profunda')
  assert.ok(snippet[1].includes('clave'))
  assert.ok(snippet[1].startsWith('…') || snippet[1].endsWith('…'))
})
