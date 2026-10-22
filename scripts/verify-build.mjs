import { accessSync, constants, existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'

const root = process.cwd()
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
const dist = resolveDistDir()
const failures = []

function check(label, condition, detail = '') {
  const passed = Boolean(condition)
  console.log(`${passed ? 'PASS' : 'FAIL'} ${label}${detail ? ` — ${detail}` : ''}`)
  if (!passed) failures.push(label)
}

function requireFile(relativePath) {
  const fullPath = join(dist, relativePath)
  check(`Published asset ${relativePath}`, existsSync(fullPath))
  return fullPath
}

const indexPath = requireFile('index.html')
const privacyPath = requireFile('privacy.html')
const termsPath = requireFile('terms.html')
const oauthAppPath = requireFile('orbital-leads-gmail.html')
requireFile('privacy/index.html')
requireFile('terms/index.html')
const aboutPath = requireFile('sobre-orbital-frameworks/index.html')
const proofPath = requireFile('evidencia/index.html')
const checkioCasePath = requireFile('casos/checkio/index.html')
const wasyCasePath = requireFile('casos/wasy/index.html')
const localisaCasePath = requireFile('casos/localisa/index.html')
const perulogCasePath = requireFile('casos/perulog-pallets/index.html')
const devSoftwarePath = requireFile('servicios/desarrollo-software-medida/index.html')
const autoProcesosPath = requireFile('servicios/automatizacion-procesos/index.html')
const landingB2bPath = requireFile('servicios/landing-pages-b2b/index.html')
const blogPath = requireFile('blog/index.html')
const pilotArticlePath = requireFile('blog/software-a-medida-o-saas-como-decidir/index.html')
const b2b03ArticlePath = requireFile('blog/landing-page-b2b-tecnica-vs-web-corporativa/index.html')
const feedPath = requireFile('feed.xml')
const robotsPath = requireFile('robots.txt')
const sitemapPath = requireFile('sitemap.xml')
requireFile('favicon-32.png')
requireFile('favicon-192.png')
requireFile('apple-touch-icon.png')
const gscTokenPath = requireFile('google466769daa2952733.html')

for (const file of [
  'portfolio/checkio-640.webp',
  'portfolio/checkio-960.webp',
  'portfolio/wasy-640.webp',
  'portfolio/wasy-960.webp',
  'portfolio/localisa-640.webp',
  'portfolio/localisa-960.webp',
  'portfolio/perulog-pallets-640.webp',
  'portfolio/perulog-pallets-960.webp',
  'portfolio/astro-480.webp',
  'portfolio/astro-720.webp',
  'fonts/big-shoulders-display-latin.woff2',
  'fonts/ibm-plex-sans-latin.woff2',
  'fonts/ibm-plex-mono-400-latin.woff2',
  'fonts/ibm-plex-mono-500-latin.woff2',
  'fonts/ibm-plex-mono-600-latin.woff2',
]) requireFile(file)

const html = existsSync(indexPath) ? readFileSync(indexPath, 'utf8') : ''
const privacy = existsSync(privacyPath) ? readFileSync(privacyPath, 'utf8') : ''
const terms = existsSync(termsPath) ? readFileSync(termsPath, 'utf8') : ''
const oauthApp = existsSync(oauthAppPath) ? readFileSync(oauthAppPath, 'utf8') : ''
const about = existsSync(aboutPath) ? readFileSync(aboutPath, 'utf8') : ''
const proof = existsSync(proofPath) ? readFileSync(proofPath, 'utf8') : ''
const checkioCase = existsSync(checkioCasePath) ? readFileSync(checkioCasePath, 'utf8') : ''
const wasyCase = existsSync(wasyCasePath) ? readFileSync(wasyCasePath, 'utf8') : ''
const localisaCase = existsSync(localisaCasePath) ? readFileSync(localisaCasePath, 'utf8') : ''
const perulogCase = existsSync(perulogCasePath) ? readFileSync(perulogCasePath, 'utf8') : ''
const devSoftware = existsSync(devSoftwarePath) ? readFileSync(devSoftwarePath, 'utf8') : ''
const autoProcesos = existsSync(autoProcesosPath) ? readFileSync(autoProcesosPath, 'utf8') : ''
const landingB2b = existsSync(landingB2bPath) ? readFileSync(landingB2bPath, 'utf8') : ''
const blog = existsSync(blogPath) ? readFileSync(blogPath, 'utf8') : ''
const pilotArticle = existsSync(pilotArticlePath) ? readFileSync(pilotArticlePath, 'utf8') : ''
const b2b03Article = existsSync(b2b03ArticlePath) ? readFileSync(b2b03ArticlePath, 'utf8') : ''
const feed = existsSync(feedPath) ? readFileSync(feedPath, 'utf8') : ''
const robots = existsSync(robotsPath) ? readFileSync(robotsPath, 'utf8') : ''
const sitemap = existsSync(sitemapPath) ? readFileSync(sitemapPath, 'utf8') : ''
const gscToken = existsSync(gscTokenPath) ? readFileSync(gscTokenPath, 'utf8') : ''

check('GSC verification token has canonical content', gscToken.trim() === 'google-site-verification: google466769daa2952733.html')

check('Prerendered root is not empty', !html.includes('<div id="root"></div>'))
check('Primary B2B heading is prerendered', html.includes('class="heroTitle"') && ['SOFTWARE', 'PARA TU'].every((word) => html.includes(`>${word}<`)) && html.includes('>EMPRESA'))
check('Canonical URL is present', html.includes('<link rel="canonical" href="https://orbitalframeworks.qzz.io/"'))
check('Search crawlers are allowed', robots.includes('User-agent: *') && robots.includes('Allow: /'))
check('Sitemap is declared in robots', robots.includes('Sitemap: https://orbitalframeworks.qzz.io/sitemap.xml'))
check('Sitemap contains canonical URL', sitemap.includes('<loc>https://orbitalframeworks.qzz.io/</loc>'))
check('Sitemap contains legal pages', sitemap.includes('<loc>https://orbitalframeworks.qzz.io/privacy</loc>') && sitemap.includes('<loc>https://orbitalframeworks.qzz.io/terms</loc>'))
check('Sitemap contains institutional page', sitemap.includes('/sobre-orbital-frameworks/'))
check('Sitemap contains proof hub', sitemap.includes('/evidencia/'))
check('Sitemap contains case studies', ['/casos/checkio/', '/casos/wasy/', '/casos/localisa/', '/casos/perulog-pallets/'].every((path) => sitemap.includes(path)))
check('Sitemap contains service pages', ['/servicios/desarrollo-software-medida/', '/servicios/automatizacion-procesos/', '/servicios/landing-pages-b2b/'].every((path) => sitemap.includes(path)))
check('Sitemap contains blog index', sitemap.includes('/blog/'))
check('Sitemap contains pilot article', sitemap.includes('/blog/software-a-medida-o-saas-como-decidir/'))
check('Sitemap contains B2B-03 article', sitemap.includes('/blog/landing-page-b2b-tecnica-vs-web-corporativa/'))
check('Privacy page is prerendered and distinct', privacy.includes('Política de privacidad') && privacy.includes('Google API Services User Data Policy') && privacy.includes('Limited Use') && privacy.includes('https://orbitalframeworks.qzz.io/privacy') && !privacy.includes('class="heroTitle"'))
check('Terms page is prerendered and distinct', terms.includes('Términos de uso') && terms.includes('Orbital Leads') && terms.includes('https://orbitalframeworks.qzz.io/terms') && !terms.includes('class="heroTitle"'))
check('Privacy and Terms are different documents', privacy !== terms)
check('OAuth app homepage is prerendered', oauthApp.includes('<h1>Orbital Leads Gmail</h1>') && oauthApp.includes('Aplicación OAuth interna / Orbital Frameworks'))
check('OAuth app homepage is excluded from search indexing', oauthApp.includes('<meta name="robots" content="noindex, follow" />'))
check('Home links visibly to legal pages', html.includes('href="/privacy"') && html.includes('href="/terms"') && html.includes('Orbital Leads'))
check('Home links visibly to blog', html.includes('href="/blog/"'))
check('About page is prerendered', about.includes('Qué es Orbital Frameworks.') && about.includes('Orbital Frameworks es una empresa peruana de desarrollo de software y soluciones digitales.') && about.includes('https://orbitalframeworks.qzz.io/sobre-orbital-frameworks/'))
check('Proof hub is prerendered', proof.includes('Trabajo que se puede revisar antes de conversar.') && proof.includes('https://orbitalframeworks.qzz.io/evidencia/'))
const expectedPortfolioOrder = ['/casos/localisa/', '/casos/wasy/', '/casos/checkio/', '/casos/perulog-pallets/']
const portfolioMarkup = html.slice(html.indexOf('class="workGrid"'), html.indexOf('class="portfolioCta"'))
const actualPortfolioOrder = [...portfolioMarkup.matchAll(/<a class="workCard[^"]*"[^>]*href="([^"]+)"/g)].map((match) => match[1])
check('Project cards follow approved priority', JSON.stringify(actualPortfolioOrder) === JSON.stringify(expectedPortfolioOrder), actualPortfolioOrder.join(' → '))
const proofMarkup = proof.slice(proof.indexOf('class="proofList"'), proof.indexOf('class="proofCriteria"'))
const actualProofOrder = [...proofMarkup.matchAll(/<article class="proofItem">[\s\S]*?<h3>([^<]+)<\/h3>/g)].map((match) => match[1])
check('Proof hub follows approved project priority', JSON.stringify(actualProofOrder) === JSON.stringify(['Localisa', 'Wasy', 'Checkio', 'PeruLog Pallets']), actualProofOrder.join(' → '))
check('Checkio case is prerendered', checkioCase.includes('Qué existe dentro del producto.') && checkioCase.includes('https://orbitalframeworks.qzz.io/casos/checkio/'))
check('Wasy case is prerendered', !wasyCase.includes('caseCapabilities') && wasyCase.includes('Cómo se conecta el trabajo.') && wasyCase.includes('https://orbitalframeworks.qzz.io/casos/wasy/') && wasyCase.includes('https://wasy.store/'))
check('Localisa case is prerendered', localisaCase.includes('Qué existe dentro del producto.') && localisaCase.includes('https://orbitalframeworks.qzz.io/casos/localisa/'))
check('PeruLog case is prerendered', perulogCase.includes('Qué existe dentro del producto.') && perulogCase.includes('https://orbitalframeworks.qzz.io/casos/perulog-pallets/'))
check('Case pages expose primary product CTA', [checkioCase, wasyCase, localisaCase, perulogCase].every((page) => page.includes('Abrir producto público')))
check('Retired VetERP is absent from built public content', !html.includes('VetERP') && !sitemap.includes('/casos/veterp/') && !wasyCase.includes('VetERP'))
check('Service pages are prerendered and distinct', [devSoftware, autoProcesos, landingB2b].every((page) => !page.includes('<div id="root"></div>') && page.includes('Cuándo NO recomendamos este servicio') && page.includes('contact.orbitalframeworks@gmail.com')))
check('Service pages expose distinct canonicals', Boolean(
  devSoftware.includes('<link rel="canonical" href="https://orbitalframeworks.qzz.io/servicios/desarrollo-software-medida/"') &&
  autoProcesos.includes('<link rel="canonical" href="https://orbitalframeworks.qzz.io/servicios/automatizacion-procesos/"') &&
  landingB2b.includes('<link rel="canonical" href="https://orbitalframeworks.qzz.io/servicios/landing-pages-b2b/"')
))
check('Service pages link to verified cases', Boolean(
  devSoftware.includes('/casos/checkio/') &&
  autoProcesos.includes('/casos/wasy/') &&
  landingB2b.includes('/casos/perulog-pallets/')
))
check('Home links to dedicated service pages', Boolean(
  html.includes('/servicios/desarrollo-software-medida/') &&
  html.includes('/servicios/automatizacion-procesos/') &&
  html.includes('/servicios/landing-pages-b2b/')
))
check('Service pages emit Service and BreadcrumbList schemas', [devSoftware, autoProcesos, landingB2b].every((page) => page.includes('"@type": "Service"') && page.includes('"@type": "BreadcrumbList"')))
check('Institutional and conversion sections are prerendered', html.includes('Cómo trabajamos / Primera conversación') && html.includes('Quiénes somos / Orbital Frameworks') && html.includes('Qué incluir en el mensaje'))
check('Blog index is prerendered and distinct', blog.includes('Orbital Insights') && !blog.includes('<div id="root"></div>') && blog.includes('Software a medida o SaaS'))
check('Blog index emits Blog and BreadcrumbList schemas', blog.includes('"@type": "Blog"') && blog.includes('"@type": "BreadcrumbList"'))
check('Pilot article is prerendered and distinct', pilotArticle.includes('Software a medida o SaaS: cómo decidir según el proceso de tu empresa') && !pilotArticle.includes('<div id="root"></div>'))
check('Pilot article is approved for publication, without false draft banner or unsupported ROI', !pilotArticle.includes('BORRADOR EN REVISIÓN EDITORIAL [NO PUBLICABLE]') && !pilotArticle.includes('90% del requerimiento') && !pilotArticle.includes('soberanía total sobre el código'))
check('Pilot article links to verified services and case studies', pilotArticle.includes('/servicios/desarrollo-software-medida/') && pilotArticle.includes('/casos/checkio/'))
check('Pilot article emits BlogPosting schema and BreadcrumbList', pilotArticle.includes('"@type": "BlogPosting"') && pilotArticle.includes('"@type": "BreadcrumbList"') && pilotArticle.includes('"name": "Orbital Frameworks"'))
check('RSS feed is valid XML and contains pilot article', feed.includes('<rss version="2.0"') && feed.includes('<title>Orbital Insights | Orbital Frameworks</title>') && feed.includes('/blog/software-a-medida-o-saas-como-decidir/'))
check('B2B-03 is published with SSR, canonical, indexability and structured data', b2b03Article.includes('Landing page B2B o web corporativa: cuál necesita realmente tu empresa') && !b2b03Article.includes('<div id="root"></div>') && !b2b03Article.includes('BORRADOR EN REVISIÓN EDITORIAL [NO PUBLICABLE]') && b2b03Article.includes('https://orbitalframeworks.qzz.io/blog/landing-page-b2b-tecnica-vs-web-corporativa/') && b2b03Article.includes('"@type": "BlogPosting"') && b2b03Article.includes('"@type": "BreadcrumbList"') && !b2b03Article.includes('noindex'))
check('B2B-03 is discoverable from blog and RSS', blog.includes('landing-page-b2b-tecnica-vs-web-corporativa') && feed.includes('/blog/landing-page-b2b-tecnica-vs-web-corporativa/'))

const notFoundPath = requireFile('404.html')
requireFile('404/index.html')
const notFoundHtml = existsSync(notFoundPath) ? readFileSync(notFoundPath, 'utf8') : ''
check('404 error page is prerendered with noindex', Boolean(notFoundHtml) && notFoundHtml.includes('<meta name="robots" content="noindex, follow" />'))
check('404 error page has canonical /404', Boolean(notFoundHtml) && notFoundHtml.includes('<link rel="canonical" href="https://orbitalframeworks.qzz.io/404" />'))
check('404 error page does not contain contradictory homepage schema', Boolean(notFoundHtml) && !notFoundHtml.includes('"@type": "WebSite"') && !notFoundHtml.includes('"@type": "WebPage"'))


const structuredDataMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
let structuredData = null
try {
  structuredData = structuredDataMatch ? JSON.parse(structuredDataMatch[1]) : null
} catch (error) {
  failures.push('Structured data parses')
  console.log(`FAIL Structured data parses — ${error.message}`)
}

const structuredTypes = structuredData?.['@graph']?.map((item) => item['@type']) ?? []
const portfolioList = structuredData?.['@graph']?.find((item) => item['@type'] === 'ItemList' && item['@id'] === 'https://orbitalframeworks.qzz.io/#portfolio')
check('SEO project list follows approved priority', JSON.stringify(portfolioList?.itemListElement?.map((item) => item.name)) === JSON.stringify(['Localisa', 'Wasy', 'Checkio', 'PeruLog Pallets']))
check('Structured data graph is complete', ['Organization', 'WebSite', 'WebPage', 'ItemList', 'Service', 'Person'].every((type) => structuredTypes.includes(type)), structuredTypes.join(', '))
check('Identity metadata is explicit', html.includes('<meta name="application-name" content="Orbital Frameworks"') && html.includes('"alternateName": [') && html.includes('Orbital Frameworks Perú'))
check('Team entities are structured', html.includes('"name": "Angel Reaño"') && html.includes('"name": "Mathias Javier Murillo"'))
check('About page uses AboutPage schema', about.includes('"@type": "AboutPage"') && about.includes('"mainEntity": {') && about.includes('#organization'))
check('Structured logo uses published asset', html.includes('https://orbitalframeworks.qzz.io/favicon-192.png') && !html.includes('Logo_favicon.png'))

const orgEntity = structuredData?.['@graph']?.find((item) => item['@type'] === 'Organization')
check('Organization schema includes contactPoint', Boolean(orgEntity?.contactPoint && orgEntity.contactPoint.length > 0 && orgEntity.contactPoint[0].email === 'contact.orbitalframeworks@gmail.com'))
check('Organization schema has a country-only PostalAddress', Boolean(
  orgEntity?.address?.['@type'] === 'PostalAddress' &&
  orgEntity.address.addressCountry === 'PE' &&
  !orgEntity.address.streetAddress &&
  !orgEntity.address.postalCode &&
  !orgEntity.address.addressLocality &&
  !orgEntity.address.addressRegion
))
check('Organization schema excludes fabricated Lima references', Boolean(orgEntity && !JSON.stringify(orgEntity).includes('Lima')))
check('Organization schema specifies Peru as served country', Boolean(
  orgEntity &&
  (Array.isArray(orgEntity.areaServed)
    ? orgEntity.areaServed.some((area) => area.name === 'Perú' || area['@type'] === 'Country')
    : orgEntity.areaServed?.name === 'Perú' || orgEntity.areaServed?.['@type'] === 'Country')
))

const llmsPath = requireFile('llms.txt')
const llmsContent = existsSync(llmsPath) ? readFileSync(llmsPath, 'utf8') : ''
check('llms.txt contains when-to-use guidance', llmsContent.toLowerCase().includes('when to use'))

const md404Path = requireFile('404.md')
const md404Content = existsSync(md404Path) ? readFileSync(md404Path, 'utf8') : ''
check('404.md has >=20 characters and agent links', md404Content.length >= 20 && md404Content.includes('llms.txt') && md404Content.includes('sitemap.xml'))

const mdIndexPath = requireFile('index.md')
const mdIndexContent = existsSync(mdIndexPath) ? readFileSync(mdIndexPath, 'utf8') : ''
check('index.md has substantial content and brand positioning', mdIndexContent.length >= 200 && mdIndexContent.includes('Orbital Frameworks') && mdIndexContent.includes('desarrollo de software'))

const customHttpPath = join(root, 'customHttp.yml')
const customHttpContent = existsSync(customHttpPath) ? readFileSync(customHttpPath, 'utf8') : ''
check('customHttp.yml declares Vary: Accept and markdown content type', customHttpContent.includes('Vary') && customHttpContent.includes('Accept') && customHttpContent.includes('text/markdown'))

const assetsDir = join(dist, 'assets')
const assetFiles = existsSync(assetsDir) ? readdirSync(assetsDir) : []
const jsFiles = assetFiles.filter((name) => name.endsWith('.js'))
const cssFiles = assetFiles.filter((name) => name.endsWith('.css'))
check('Single client bundle', jsFiles.length === 1, jsFiles.join(', '))
check('Visual stylesheet is present', cssFiles.length === 1, cssFiles.join(', '))

if (jsFiles.length === 1) {
  const jsPath = join(assetsDir, jsFiles[0])
  const jsSize = statSync(jsPath).size
  const js = readFileSync(jsPath, 'utf8')
  // Native blog article data is currently bundled with the SPA. Preserve the
  // original 330 kB envelope for two articles and allow only 10 kB extra per
  // subsequent authored article (B2B-05 includes a verified 1,600-word table/
  // checklist guide), until routes are code-split. Do not raise the
  // limit globally for unrelated JavaScript.
  const blogSource = readFileSync(join(root, 'src/blogData.ts'), 'utf8')
  const articleCount = [...blogSource.matchAll(/^  '[a-z0-9-]+': \{/gm)].length
  const jsBudget = 330_000 + Math.max(0, articleCount - 2) * 10_000
  check('Client JavaScript stays within visual baseline', jsSize <= jsBudget,
    `${jsSize} / ${jsBudget} bytes (${articleCount} authored articles)`)
  check('Client bundle has no dynamic code execution', !/\beval\s*\(|new\s+Function\s*\(|document\.write\s*\(/.test(js))
}

const forbiddenExtensions = new Set(['.exe', '.msi', '.apk', '.dmg', '.pkg', '.zip', '.rar', '.7z', '.bat', '.cmd', '.ps1', '.scr', '.jar', '.deb', '.rpm', '.iso', '.bin'])
const publishedFiles = []
function collectFiles(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name)
    if (entry.isDirectory()) collectFiles(fullPath)
    else publishedFiles.push(fullPath)
  }
}
collectFiles(dist)
const forbiddenPublishedFiles = publishedFiles.filter((file) => forbiddenExtensions.has(extname(file).toLowerCase()))
check('No executable or archive downloads are published', forbiddenPublishedFiles.length === 0, forbiddenPublishedFiles.map((file) => file.slice(dist.length + 1)).join(', '))
check('HTML does not expose download attributes', !/\sdownload(?:=|\s|>)/i.test(html))
check('HTML does not embed active third-party documents', !/<(?:iframe|object|embed)\b/i.test(html))
check('HTML has no binary or archive links', !/href=["'][^"']+\.(?:exe|msi|apk|dmg|pkg|zip|rar|7z|bat|cmd|ps1|scr|jar|deb|rpm|iso|bin)(?:[?#][^"']*)?["']/i.test(html))

if (failures.length > 0) {
  throw new Error(`Build verification failed: ${failures.length} check(s) did not pass`)
}

console.log('Build verification passed')
