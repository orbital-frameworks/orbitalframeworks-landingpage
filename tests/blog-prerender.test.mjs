import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync, accessSync, constants } from 'node:fs'
import { resolve, join } from 'node:path'

const root = resolve(process.cwd())
function resolveDistDir() {
  if (process.env.DIST_DIR) return resolve(root, process.env.DIST_DIR)
  const defaultDist = join(root, 'dist')
  if (existsSync('/tmp/orbital-dist')) {
    try {
      accessSync(defaultDist, constants.W_OK)
    } catch {
      return '/tmp/orbital-dist'
    }
  }
  return defaultDist
}
const distDir = resolveDistDir()

test('1. Blog index and pilot article are prerendered in dist', () => {
  const blogIndexPath = join(distDir, 'blog/index.html')
  assert.ok(existsSync(blogIndexPath), `Prerendered HTML must exist at ${blogIndexPath}`)
  const blogHtml = readFileSync(blogIndexPath, 'utf8')
  assert.ok(blogHtml.length > 3000, `Blog index must be substantial (got ${blogHtml.length} chars)`)
  assert.ok(!blogHtml.includes('<div id="root"></div>'), 'Blog index must not have empty root')
  assert.ok(blogHtml.includes('Orbital Insights'), 'Blog index must include section title')

  const articlePath = join(distDir, 'blog/software-a-medida-o-saas-como-decidir/index.html')
  assert.ok(existsSync(articlePath), `Prerendered HTML must exist at ${articlePath}`)
  const articleHtml = readFileSync(articlePath, 'utf8')
  assert.ok(articleHtml.length > 5000, `Article must be substantial (got ${articleHtml.length} chars)`)
  assert.ok(!articleHtml.includes('<div id="root"></div>'), 'Article must not have empty root')
  assert.ok(articleHtml.includes('Software a medida o SaaS'), 'Article must include headline')

  const b2b02Path = join(distDir, 'blog/automatizacion-procesos-vs-excel-riesgo-operativo/index.html')
  assert.equal(existsSync(b2b02Path), false, 'Embargoed B2B-02 must not be prerendered')
  assert.ok(!blogHtml.includes('automatizacion-procesos-vs-excel-riesgo-operativo'), 'Embargoed article must not be in the blog index')
})

test('2. Canonical, hreflang, and RSS metadata in blog pages', () => {
  const blogHtml = readFileSync(join(distDir, 'blog/index.html'), 'utf8')
  assert.ok(blogHtml.includes('<link rel="canonical" href="https://orbitalframeworks.qzz.io/blog/" />'))
  assert.ok(blogHtml.includes('<link rel="alternate" hreflang="es-PE" href="https://orbitalframeworks.qzz.io/blog/" />'))
  assert.ok(blogHtml.includes('<link rel="alternate" type="application/rss+xml"'))

  const articleHtml = readFileSync(join(distDir, 'blog/software-a-medida-o-saas-como-decidir/index.html'), 'utf8')
  assert.ok(articleHtml.includes('<link rel="canonical" href="https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/" />'))
  assert.ok(articleHtml.includes('<link rel="alternate" hreflang="es-PE" href="https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/" />'))
  assert.ok(articleHtml.includes('<meta property="og:type" content="article" />'))

})

test('3. Blog and Article Schema.org JSON-LD structured data', () => {
  const blogHtml = readFileSync(join(distDir, 'blog/index.html'), 'utf8')
  const blogLdMatch = blogHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
  assert.ok(blogLdMatch, 'Blog index must contain JSON-LD')
  const blogLd = JSON.parse(blogLdMatch[1])
  const blogEntity = blogLd['@graph'].find((item) => item['@type'] === 'Blog')
  assert.ok(blogEntity, 'Blog entity must exist in blog JSON-LD')
  assert.equal(blogEntity.url, 'https://orbitalframeworks.qzz.io/blog/')

  const articleHtml = readFileSync(join(distDir, 'blog/software-a-medida-o-saas-como-decidir/index.html'), 'utf8')
  const articleLdMatch = articleHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
  assert.ok(articleLdMatch, 'Article must contain JSON-LD')
  const articleLd = JSON.parse(articleLdMatch[1])
  const articleEntity = articleLd['@graph'].find((item) => item['@type'] === 'BlogPosting')
  assert.ok(articleEntity, 'BlogPosting entity must exist in article JSON-LD')
  assert.equal(articleEntity.url, 'https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/')
  assert.equal(articleEntity.author.name, 'Orbital Frameworks')
  assert.equal(articleEntity.datePublished, '2026-10-17')

  const breadcrumb = articleLd['@graph'].find((item) => item['@type'] === 'BreadcrumbList')
  assert.ok(breadcrumb, 'BreadcrumbList must exist in article JSON-LD')
  assert.equal(breadcrumb.itemListElement.length, 3)
  assert.equal(breadcrumb.itemListElement[0].name, 'Inicio')
  assert.equal(breadcrumb.itemListElement[1].name, 'Blog')
  assert.equal(breadcrumb.itemListElement[2].item, 'https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/')

  assert.equal(existsSync(join(distDir, 'blog/automatizacion-procesos-vs-excel-riesgo-operativo/index.html')), false,
    'Embargoed article must not have a publicly served BlogPosting document')
})

test('4. Editorial publication guardrails and verified links', () => {
  const articleHtml = readFileSync(join(distDir, 'blog/software-a-medida-o-saas-como-decidir/index.html'), 'utf8')

  // A public and indexable article must not still be marked unpublishable.
  assert.ok(!articleHtml.includes('BORRADOR EN REVISIÓN EDITORIAL [NO PUBLICABLE]'))
  assert.ok(!articleHtml.includes('90% del requerimiento'), 'Must not present an arbitrary SaaS fit threshold')
  assert.ok(!articleHtml.includes('soberanía total sobre el código'), 'Must not guarantee ownership without contract')

  // Factual content: decision matrix
  assert.ok(articleHtml.includes('Pregunta de diagnóstico operativo'), 'Must contain decision matrix')
  assert.ok(articleHtml.includes('Señal favorable para SaaS estándar'))
  assert.ok(articleHtml.includes('Señal favorable para Software a medida'))

  // Interlinking to verified services and cases
  assert.ok(articleHtml.includes('/servicios/desarrollo-software-medida/'), 'Must link to custom software service')
  assert.ok(articleHtml.includes('/servicios/automatizacion-procesos/'), 'Must link to process automation service')
  assert.ok(articleHtml.includes('/casos/checkio/'), 'Must link to Checkio case')

  // Official contact channel without hallucinated phone numbers
  assert.ok(articleHtml.includes('contact.orbitalframeworks@gmail.com'), 'Must contain official email')
  assert.ok(!articleHtml.includes('+51 9'), 'Must not contain fake phone numbers')

})

test('5. RSS feed.xml is published, valid XML, and contains pilot article', () => {
  const feedPath = join(distDir, 'feed.xml')
  assert.ok(existsSync(feedPath), 'feed.xml must exist in dist')
  const feedXml = readFileSync(feedPath, 'utf8')
  assert.ok(feedXml.includes('<?xml version="1.0" encoding="UTF-8"?>'))
  assert.ok(feedXml.includes('<rss version="2.0"'))
  assert.ok(feedXml.includes('<title>Orbital Insights | Orbital Frameworks</title>'))
  assert.ok(feedXml.includes('https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/'))
  assert.ok(!feedXml.includes('https://orbitalframeworks.qzz.io/blog/automatizacion-procesos-vs-excel-riesgo-operativo/'),
    'Embargoed article must not be published in RSS')
})

test('6. Discovery, sitemap, llms.txt, and LinkedIn handoff pack', () => {
  const homeHtml = readFileSync(join(distDir, 'index.html'), 'utf8')
  assert.ok(homeHtml.includes('href="/blog/"'), 'Home must visibly link to blog')

  const sitemap = readFileSync(join(root, 'public/sitemap.xml'), 'utf8')
  assert.ok(sitemap.includes('https://orbitalframeworks.qzz.io/blog/'))
  assert.ok(sitemap.includes('https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/'))
  assert.ok(!sitemap.includes('https://orbitalframeworks.qzz.io/blog/automatizacion-procesos-vs-excel-riesgo-operativo/'),
    'Embargoed article must not be discoverable in sitemap')

  const llms = readFileSync(join(root, 'public/llms.txt'), 'utf8')
  assert.ok(llms.includes('https://orbitalframeworks.qzz.io/blog/'))

  const linkedinDocPath = join(root, 'docs/linkedin-pilot-handoff-2026-10-17.md')
  assert.ok(existsSync(linkedinDocPath), 'LinkedIn handoff doc must exist')
  const linkedinDoc = readFileSync(linkedinDocPath, 'utf8')
  assert.ok(linkedinDoc.includes('utm_source=linkedin&amp;utm_medium=organic_social&amp;utm_campaign=pilot_saas_vs_custom') || linkedinDoc.includes('utm_source=linkedin&utm_medium=organic_social&utm_campaign=pilot_saas_vs_custom'))
  assert.ok(linkedinDoc.includes('no se ha publicado automáticamente'))
})
