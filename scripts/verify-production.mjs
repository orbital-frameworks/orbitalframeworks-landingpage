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
const { text: sitemap } = await fetchText('/sitemap.xml')

check('Expected production title', html.includes('<title>Desarrollo de software en Perú | Orbital Frameworks</title>'))
check('Prerendered heading', html.includes('Construimos y mejoramos herramientas digitales para problemas concretos.'))
check('Checkio public link', html.includes('https://checkio-frontend.onrender.com/landing'))
check('VetERP public link', html.includes('https://veterp.qzz.io/'))
check('Localisa public link', html.includes('https://www.localisa.pe/'))
check('PeruLog public link', html.includes('https://perulogpallets.com.pe/'))
check('Responsive portfolio images', html.includes('/portfolio/checkio-640.webp') && html.includes('/portfolio/perulog-pallets-960.webp'))
check('Institutional about copy', html.includes('combina criterio de producto, diseño y desarrollo') && !html.includes('identidad personal completa'))
check('Current sitemap date', sitemap.includes('<lastmod>2026-07-29</lastmod>'))
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
