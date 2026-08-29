import { readFile } from 'node:fs/promises'

const origin = process.env.ORBITAL_PUBLIC_URL ?? 'https://orbitalframeworks.qzz.io'

async function fetchText(path) {
  const response = await fetch(new URL(path, origin), {
    redirect: 'follow',
    headers: { 'user-agent': 'OrbitalFrameworks-Deployment-Verification/1.0' },
  })

  if (!response.ok) {
    throw new Error(`${path} returned HTTP ${response.status}`)
  }

  return { response, text: await response.text() }
}

const checks = []
function check(label, condition, detail = '') {
  checks.push({ label, passed: Boolean(condition), detail })
}

const { response: pageResponse, text: html } = await fetchText('/')
const { response: privacyResponse, text: privacy } = await fetchText('/privacy')
const { response: termsResponse, text: terms } = await fetchText('/terms')
const { response: oauthAppResponse, text: oauthApp } = await fetchText('/orbital-leads-gmail')
const { text: about } = await fetchText('/sobre-orbital-frameworks/')
const { text: sitemap } = await fetchText('/sitemap.xml')
const expectedSitemap = await readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8')
const structuredDataMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
const structuredData = structuredDataMatch ? JSON.parse(structuredDataMatch[1]) : null
const structuredTypes = structuredData?.['@graph']?.map((item) => item['@type']) ?? []

check('Expected production title', html.includes('<title>Orbital Frameworks | Desarrollo de software en Perú</title>'))
check('Prerendered visual heading', html.includes('class="heroTitle"') && ['SISTEMAS', 'DIGITALES', 'PRESENCIA'].every((word) => html.includes(`>${word}<`)))
check('Checkio public link', html.includes('https://checkio-frontend.onrender.com/landing'))
check('VetERP public link', html.includes('https://veterp.qzz.io/'))
check('Localisa public link', html.includes('https://www.localisa.pe/'))
check('PeruLog public link', html.includes('https://perulogpallets.com.pe/'))
check('Original visual assets', html.includes('/assets/checkio-') && html.includes('/assets/PerulogPallets-') && html.includes('/assets/Astro%20showing-'))
check('Original visual architecture', html.includes('class="servicesManifesto"') && html.includes('class="portfolioRobot"') && html.includes('class="heroShapes"'))
check('Structured data graph', structuredTypes.includes('Organization') && structuredTypes.includes('WebSite') && structuredTypes.includes('WebPage') && structuredTypes.includes('ItemList') && structuredTypes.includes('Service') && structuredTypes.includes('Person'), structuredTypes.join(', '))
check('Identity metadata is explicit', html.includes('<meta name="application-name" content="Orbital Frameworks"') && html.includes('Orbital Frameworks Perú') && html.includes('"name": "Angel Reaño"') && html.includes('"name": "Mathias Javier Murillo"'))
check('Home describes Orbital Leads and links legal pages', html.includes('Orbital Leads') && html.includes('href="/privacy"') && html.includes('href="/terms"'))
check('Privacy URL returns 200 and distinct policy', privacyResponse.status === 200 && privacy.includes('Política de privacidad') && privacy.includes('Google API Services User Data Policy') && privacy.includes('Limited Use') && !privacy.includes('class="heroTitle"'), `${privacyResponse.status} ${privacyResponse.url}`)
check('Privacy keeps exact public URL', privacyResponse.url === new URL('/privacy', origin).href, privacyResponse.url)
check('Terms URL returns 200 and distinct terms', termsResponse.status === 200 && terms.includes('Términos de uso') && terms.includes('Orbital Leads') && !terms.includes('class="heroTitle"'), `${termsResponse.status} ${termsResponse.url}`)
check('Terms keeps exact public URL', termsResponse.url === new URL('/terms', origin).href, termsResponse.url)
check('Privacy and Terms content differ', privacy !== terms)
check('OAuth app homepage is published', oauthAppResponse.status === 200 && oauthApp.includes('<h1>Orbital Leads Gmail</h1>') && oauthApp.includes('Aplicación OAuth interna / Orbital Frameworks'), `${oauthAppResponse.status} ${oauthAppResponse.url}`)
check('OAuth app homepage stays out of search indexing', oauthApp.includes('<meta name="robots" content="noindex, follow" />'))
check('About page is published and structured', about.includes('Qué es Orbital Frameworks.') && about.includes('Orbital Frameworks es una empresa peruana de desarrollo de software y soluciones digitales.') && about.includes('"@type": "AboutPage"'))
check('Structured logo uses published asset', html.includes('https://orbitalframeworks.qzz.io/favicon-192.png') && !html.includes('Logo_favicon.png'))
check('Published sitemap matches repository', sitemap.trim() === expectedSitemap.trim())
check('HTTPS final URL', pageResponse.url.startsWith('https://'), pageResponse.url)

const cacheControl = pageResponse.headers.get('cache-control') ?? '(missing)'
const age = pageResponse.headers.get('age') ?? '(missing)'
const hsts = pageResponse.headers.get('strict-transport-security') ?? '(missing)'
const contentTypeOptions = pageResponse.headers.get('x-content-type-options') ?? '(missing)'
const frameOptions = pageResponse.headers.get('x-frame-options') ?? '(missing)'
const referrerPolicy = pageResponse.headers.get('referrer-policy') ?? '(missing)'
const permissionsPolicy = pageResponse.headers.get('permissions-policy') ?? '(missing)'

check('HTML cache requires revalidation', cacheControl.includes('max-age=0') && cacheControl.includes('must-revalidate'), cacheControl)
check('HSTS enabled', hsts.includes('max-age=31536000'), hsts)
check('MIME sniffing disabled', contentTypeOptions.toLowerCase() === 'nosniff', contentTypeOptions)
check('Framing restricted', frameOptions.toUpperCase() === 'SAMEORIGIN', frameOptions)
check('Referrer policy configured', referrerPolicy === 'strict-origin-when-cross-origin', referrerPolicy)
check('Sensitive browser capabilities disabled', permissionsPolicy.includes('camera=()') && permissionsPolicy.includes('microphone=()') && permissionsPolicy.includes('geolocation=()'), permissionsPolicy)

console.log(`URL: ${pageResponse.url}`)
console.log(`Cache-Control: ${cacheControl}`)
console.log(`Age: ${age}`)

for (const result of checks) {
  console.log(`${result.passed ? 'PASS' : 'FAIL'} ${result.label}${result.detail ? ` — ${result.detail}` : ''}`)
}

const failures = checks.filter((result) => !result.passed)
if (failures.length > 0) {
  throw new Error(`Production verification failed: ${failures.length} check(s) did not pass`)
}

console.log('Production verification passed')
