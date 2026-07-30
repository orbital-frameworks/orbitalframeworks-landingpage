import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'

const root = process.cwd()
const dist = join(root, 'dist')
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
const robotsPath = requireFile('robots.txt')
const sitemapPath = requireFile('sitemap.xml')
requireFile('favicon-32.png')
requireFile('favicon-192.png')
requireFile('apple-touch-icon.png')

for (const file of [
  'portfolio/checkio-640.webp',
  'portfolio/checkio-960.webp',
  'portfolio/veterp-640.webp',
  'portfolio/veterp-960.webp',
  'portfolio/localisa-640.webp',
  'portfolio/localisa-960.webp',
  'portfolio/perulog-pallets-640.webp',
  'portfolio/perulog-pallets-960.webp',
]) requireFile(file)

const html = existsSync(indexPath) ? readFileSync(indexPath, 'utf8') : ''
const robots = existsSync(robotsPath) ? readFileSync(robotsPath, 'utf8') : ''
const sitemap = existsSync(sitemapPath) ? readFileSync(sitemapPath, 'utf8') : ''

check('Prerendered root is not empty', !html.includes('<div id="root"></div>'))
check('Primary heading is prerendered', html.includes('class="heroTitle"') && ['SISTEMAS', 'DIGITALES', 'PRESENCIA'].every((word) => html.includes(`>${word}<`)))
check('Canonical URL is present', html.includes('<link rel="canonical" href="https://orbitalframeworks.qzz.io/"'))
check('Search crawlers are allowed', robots.includes('User-agent: *') && robots.includes('Allow: /'))
check('Sitemap is declared in robots', robots.includes('Sitemap: https://orbitalframeworks.qzz.io/sitemap.xml'))
check('Sitemap contains canonical URL', sitemap.includes('<loc>https://orbitalframeworks.qzz.io/</loc>'))

const structuredDataMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
let structuredData = null
try {
  structuredData = structuredDataMatch ? JSON.parse(structuredDataMatch[1]) : null
} catch (error) {
  failures.push('Structured data parses')
  console.log(`FAIL Structured data parses — ${error.message}`)
}

const structuredTypes = structuredData?.['@graph']?.map((item) => item['@type']) ?? []
check('Structured data graph is complete', ['Organization', 'WebSite', 'WebPage', 'ItemList', 'Service'].every((type) => structuredTypes.includes(type)), structuredTypes.join(', '))
check('Structured logo uses published asset', html.includes('https://orbitalframeworks.qzz.io/favicon-192.png') && !html.includes('Logo_favicon.png'))

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
  check('Client JavaScript stays within visual baseline', jsSize <= 250_000, `${jsSize} bytes`)
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
