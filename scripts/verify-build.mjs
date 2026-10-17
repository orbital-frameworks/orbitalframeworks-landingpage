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
const robots = existsSync(robotsPath) ? readFileSync(robotsPath, 'utf8') : ''
const sitemap = existsSync(sitemapPath) ? readFileSync(sitemapPath, 'utf8') : ''
const gscToken = existsSync(gscTokenPath) ? readFileSync(gscTokenPath, 'utf8') : ''

check('GSC verification token has canonical content', gscToken.trim() === 'google-site-verification: google466769daa2952733.html')

check('Prerendered root is not empty', !html.includes('<div id="root"></div>'))
check('Primary heading is prerendered', html.includes('class="heroTitle"') && ['SISTEMAS', 'DIGITALES', 'PRESENCIA'].every((word) => html.includes(`>${word}<`)))
check('Canonical URL is present', html.includes('<link rel="canonical" href="https://orbitalframeworks.qzz.io/"'))
check('Search crawlers are allowed', robots.includes('User-agent: *') && robots.includes('Allow: /'))
check('Sitemap is declared in robots', robots.includes('Sitemap: https://orbitalframeworks.qzz.io/sitemap.xml'))
check('Sitemap contains canonical URL', sitemap.includes('<loc>https://orbitalframeworks.qzz.io/</loc>'))
check('Sitemap contains legal pages', sitemap.includes('<loc>https://orbitalframeworks.qzz.io/privacy</loc>') && sitemap.includes('<loc>https://orbitalframeworks.qzz.io/terms</loc>'))
check('Sitemap contains institutional page', sitemap.includes('/sobre-orbital-frameworks/'))
check('Sitemap contains proof hub', sitemap.includes('/evidencia/'))
check('Sitemap contains case studies', ['/casos/checkio/', '/casos/wasy/', '/casos/localisa/', '/casos/perulog-pallets/'].every((path) => sitemap.includes(path)))
check('Privacy page is prerendered and distinct', privacy.includes('Política de privacidad') && privacy.includes('Google API Services User Data Policy') && privacy.includes('Limited Use') && privacy.includes('https://orbitalframeworks.qzz.io/privacy') && !privacy.includes('class="heroTitle"'))
check('Terms page is prerendered and distinct', terms.includes('Términos de uso') && terms.includes('Orbital Leads') && terms.includes('https://orbitalframeworks.qzz.io/terms') && !terms.includes('class="heroTitle"'))
check('Privacy and Terms are different documents', privacy !== terms)
check('OAuth app homepage is prerendered', oauthApp.includes('<h1>Orbital Leads Gmail</h1>') && oauthApp.includes('Aplicación OAuth interna / Orbital Frameworks'))
check('OAuth app homepage is excluded from search indexing', oauthApp.includes('<meta name="robots" content="noindex, follow" />'))
check('Home links visibly to legal pages', html.includes('href="/privacy"') && html.includes('href="/terms"') && html.includes('Orbital Leads'))
check('About page is prerendered', about.includes('Qué es Orbital Frameworks.') && about.includes('Orbital Frameworks es una empresa peruana de desarrollo de software y soluciones digitales.') && about.includes('https://orbitalframeworks.qzz.io/sobre-orbital-frameworks/'))
check('Proof hub is prerendered', proof.includes('Trabajo que se puede revisar antes de conversar.') && proof.includes('https://orbitalframeworks.qzz.io/evidencia/'))
check('Checkio case is prerendered', checkioCase.includes('Qué existe dentro del producto.') && checkioCase.includes('https://orbitalframeworks.qzz.io/casos/checkio/'))
check('Wasy case is prerendered', !wasyCase.includes('caseCapabilities') && wasyCase.includes('Cómo se conecta el trabajo.') && wasyCase.includes('https://orbitalframeworks.qzz.io/casos/wasy/') && wasyCase.includes('https://wasy.store/'))
check('Localisa case is prerendered', localisaCase.includes('Qué existe dentro del producto.') && localisaCase.includes('https://orbitalframeworks.qzz.io/casos/localisa/'))
check('PeruLog case is prerendered', perulogCase.includes('Qué existe dentro del producto.') && perulogCase.includes('https://orbitalframeworks.qzz.io/casos/perulog-pallets/'))
check('Case pages expose primary product CTA', [checkioCase, wasyCase, localisaCase, perulogCase].every((page) => page.includes('Abrir producto público')))
check('Retired VetERP is absent from built public content', !html.includes('VetERP') && !sitemap.includes('/casos/veterp/') && !wasyCase.includes('VetERP'))
check('Institutional and conversion sections are prerendered', html.includes('Cómo trabajamos / Primera conversación') && html.includes('Quiénes somos / Orbital Frameworks') && html.includes('Qué incluir en el mensaje'))

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
  check('Client JavaScript stays within visual baseline', jsSize <= 275_000, `${jsSize} bytes`)
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
