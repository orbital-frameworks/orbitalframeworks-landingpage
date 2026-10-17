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

const services = [
  {
    slug: 'desarrollo-software-medida',
    canonical: 'https://orbitalframeworks.qzz.io/servicios/desarrollo-software-medida/',
    title: 'Desarrollo de software a medida en Perú | Orbital Frameworks',
    expectedCaseUrl: '/casos/checkio/',
    serviceType: 'Desarrollo de software a medida',
  },
  {
    slug: 'automatizacion-procesos',
    canonical: 'https://orbitalframeworks.qzz.io/servicios/automatizacion-procesos/',
    title: 'Automatización de procesos y WhatsApp para empresas | Orbital Frameworks',
    expectedCaseUrl: '/casos/wasy/',
    serviceType: 'Automatización de procesos',
  },
  {
    slug: 'landing-pages-b2b',
    canonical: 'https://orbitalframeworks.qzz.io/servicios/landing-pages-b2b/',
    title: 'Landing pages para empresas B2B en Perú | Orbital Frameworks',
    expectedCaseUrl: '/casos/perulog-pallets/',
    serviceType: 'Landing pages y presencia digital',
  },
]

test('1. Service pages are built and prerendered in dist', () => {
  for (const svc of services) {
    const htmlPath = join(distDir, 'servicios', svc.slug, 'index.html')
    assert.ok(existsSync(htmlPath), `Prerendered HTML must exist for ${svc.slug} at ${htmlPath}`)
    const html = readFileSync(htmlPath, 'utf8')
    assert.ok(html.length > 5000, `HTML for ${svc.slug} must be substantial (got ${html.length} chars)`)
    assert.ok(!html.includes('<div id="root"></div>'), `HTML for ${svc.slug} must not contain empty root`)
  }
})

test('2. Service pages have correct Canonical and hreflang metadata', () => {
  for (const svc of services) {
    const htmlPath = join(distDir, 'servicios', svc.slug, 'index.html')
    const html = readFileSync(htmlPath, 'utf8')
    assert.ok(html.includes(`<link rel="canonical" href="${svc.canonical}" />`), `Canonical link missing in ${svc.slug}`)
    assert.ok(html.includes(`<link rel="alternate" hreflang="es-PE" href="${svc.canonical}" />`), `hreflang es-PE missing in ${svc.slug}`)
    assert.ok(html.includes(`<link rel="alternate" hreflang="x-default" href="${svc.canonical}" />`), `hreflang x-default missing in ${svc.slug}`)
  }
})

test('3. Service pages expose customized titles, descriptions and social meta', () => {
  for (const svc of services) {
    const htmlPath = join(distDir, 'servicios', svc.slug, 'index.html')
    const html = readFileSync(htmlPath, 'utf8')
    assert.ok(html.includes(`<title>${svc.title}</title>`), `Title incorrect in ${svc.slug}`)
    assert.ok(html.includes(`<meta property="og:title" content="${svc.title}" />`), `og:title incorrect in ${svc.slug}`)
    assert.ok(html.includes(`<meta property="og:url" content="${svc.canonical}" />`), `og:url incorrect in ${svc.slug}`)
    assert.ok(html.includes(`<meta name="twitter:title" content="${svc.title}" />`), `twitter:title incorrect in ${svc.slug}`)
  }
})

test('4. Service pages emit valid Schema.org JSON-LD Service & Breadcrumbs', () => {
  for (const svc of services) {
    const htmlPath = join(distDir, 'servicios', svc.slug, 'index.html')
    const html = readFileSync(htmlPath, 'utf8')
    const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
    assert.ok(jsonLdMatch, `JSON-LD must be present in ${svc.slug}`)
    const jsonLd = JSON.parse(jsonLdMatch[1])
    assert.ok(jsonLd['@graph'], `@graph must exist in ${svc.slug} JSON-LD`)

    const serviceEntity = jsonLd['@graph'].find((item) => item['@type'] === 'Service')
    assert.ok(serviceEntity, `Service entity must exist in ${svc.slug}`)
    assert.equal(serviceEntity.url, svc.canonical)
    assert.equal(serviceEntity.serviceType, svc.serviceType)
    assert.deepEqual(serviceEntity.areaServed, { '@type': 'Country', name: 'Perú' })
    assert.deepEqual(serviceEntity.provider, { '@id': 'https://orbitalframeworks.qzz.io/#organization' })

    const breadcrumb = jsonLd['@graph'].find((item) => item['@type'] === 'BreadcrumbList')
    assert.ok(breadcrumb, `BreadcrumbList must exist in ${svc.slug}`)
    assert.equal(breadcrumb.itemListElement.length, 3)
    assert.equal(breadcrumb.itemListElement[0].name, 'Inicio')
    assert.equal(breadcrumb.itemListElement[1].name, 'Servicios')
    assert.equal(breadcrumb.itemListElement[2].item, svc.canonical)
  }
})

test('5. Factual guardrails, boundary honesty, and contact channels', () => {
  for (const svc of services) {
    const htmlPath = join(distDir, 'servicios', svc.slug, 'index.html')
    const html = readFileSync(htmlPath, 'utf8')

    // Must have honesty criteria (when not recommended)
    assert.ok(html.includes('Cuándo NO recomendamos este servicio'), `Boundary condition must be present in ${svc.slug}`)
    assert.ok(html.includes('Para quién está pensado este servicio'), `Audience section must be present in ${svc.slug}`)
    assert.ok(html.includes('El problema que resolvemos'), `Problem section must be present in ${svc.slug}`)

    // Must link to verified case
    assert.ok(html.includes(svc.expectedCaseUrl), `Must link to verified proof case ${svc.expectedCaseUrl} in ${svc.slug}`)

    // Must have official contact email and no invented phones
    assert.ok(html.includes('contact.orbitalframeworks@gmail.com'), `Official email missing in ${svc.slug}`)
    assert.ok(!html.includes('+51 9'), `Must not contain fake phone numbers in ${svc.slug}`)
  }
})

test('6. Internal cross-linking and discovery', () => {
  const homeHtmlPath = join(distDir, 'index.html')
  const homeHtml = readFileSync(homeHtmlPath, 'utf8')

  for (const svc of services) {
    // Home links to each service
    assert.ok(homeHtml.includes(`/servicios/${svc.slug}/`), `Home must link to /servicios/${svc.slug}/`)

    // Each service links to other services
    const htmlPath = join(distDir, 'servicios', svc.slug, 'index.html')
    const html = readFileSync(htmlPath, 'utf8')
    for (const other of services) {
      if (other.slug === svc.slug) continue
      assert.ok(html.includes(`/servicios/${other.slug}/`), `${svc.slug} must link to ${other.slug}`)
    }
  }

  // Sitemap, llms.txt, and index.md include services
  const sitemap = readFileSync(join(root, 'public/sitemap.xml'), 'utf8')
  const llms = readFileSync(join(root, 'public/llms.txt'), 'utf8')
  const indexMd = readFileSync(join(root, 'public/index.md'), 'utf8')

  for (const svc of services) {
    assert.ok(sitemap.includes(svc.canonical), `Sitemap must include ${svc.canonical}`)
    assert.ok(llms.includes(svc.canonical), `llms.txt must include ${svc.canonical}`)
    assert.ok(indexMd.includes(svc.canonical), `index.md must include ${svc.canonical}`)
  }
})
