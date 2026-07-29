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
check('Current sitemap date', sitemap.includes('<lastmod>2026-07-29</lastmod>'))
check('HTTPS final URL', pageResponse.url.startsWith('https://'), pageResponse.url)

const cacheControl = pageResponse.headers.get('cache-control') ?? '(missing)'
const age = pageResponse.headers.get('age') ?? '(missing)'
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
