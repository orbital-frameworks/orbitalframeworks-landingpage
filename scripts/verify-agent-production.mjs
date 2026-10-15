/**
 * Read-only check of the same hostname used by Is Agentic.
 * Fails until the content-negotiation Worker is active in production.
 */
const origin = process.env.ORBITAL_PUBLIC_URL ?? 'https://orbitalframeworks.qzz.io'
const base = new URL(origin)
const failures = []

async function probe(path, accept) {
  const response = await fetch(new URL(path, base), {
    redirect: 'follow',
    headers: {
      accept,
      'user-agent': 'OrbitalFrameworks-Agent-Readiness-Verification/1.0',
    },
    signal: AbortSignal.timeout(15000),
  })
  return { response, body: await response.text() }
}

function check(label, pass, observed) {
  console.log(`${pass ? 'PASS' : 'FAIL'} ${label} — ${observed}`)
  if (!pass) failures.push(label)
}

function representation(label, data, status, mime, vary = false) {
  const ct = data.response.headers.get('content-type') ?? ''
  const variation = data.response.headers.get('vary') ?? ''
  const hasVary = variation.split(',').some((header) => header.trim().toLowerCase() === 'accept')
  const expectedMimes = Array.isArray(mime) ? mime : [mime]
  const ok = data.response.status === status &&
    expectedMimes.some((type) => ct.toLowerCase().startsWith(type)) &&
    (!vary || hasVary)
  check(label, ok, `HTTP ${data.response.status}; Content-Type: ${ct}; Vary: ${variation || '(none)'}`)
}

const nonce = `__orbital_agent_404_probe_${Date.now()}`
try {
  const [
    htmlHome, markdownHome, html404, markdown404,
    indexMd, notFoundMd, llms, sitemap,
  ] = await Promise.all([
    probe('/', 'text/html'),
    probe('/', 'text/markdown'),
    probe('/' + nonce, 'text/html'),
    probe('/' + nonce, 'text/markdown'),
    probe('/index.md', 'text/markdown'),
    probe('/404.md', 'text/markdown'),
    probe('/llms.txt', 'text/plain'),
    probe('/sitemap.xml', 'application/xml'),
  ])

  representation('Home HTML', htmlHome, 200, 'text/html', true)
  representation('Home Markdown negotiated', markdownHome, 200, 'text/markdown', true)
  representation('Nonexistent page HTML', html404, 404, 'text/html')
  representation('Nonexistent page Markdown negotiated', markdown404, 404, 'text/markdown', true)
  check('Markdown home body', markdownHome.body.startsWith('# Orbital Frameworks') && markdownHome.body.length >= 200, `${markdownHome.body.length} characters`)
  check('Markdown 404 body and links', markdown404.body.length >= 20 && markdown404.body.includes('llms.txt') && markdown404.body.includes('sitemap.xml'), `${markdown404.body.length} characters`)
  representation('/index.md asset', indexMd, 200, 'text/markdown')
  representation('/404.md asset', notFoundMd, 200, 'text/markdown')
  representation('/llms.txt', llms, 200, 'text/plain')
  representation('/sitemap.xml', sitemap, 200, ['application/xml', 'text/xml'])
  check('Agent instructions published', llms.body.toLowerCase().includes('when to use'), `${llms.body.length} characters`)
  check('Sitemap published', sitemap.body.includes('https://orbitalframeworks.qzz.io/'), `${sitemap.body.length} characters`)

  const schema = htmlHome.body.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
  const jsonLd = schema ? JSON.parse(schema[1]) : null
  const organization = jsonLd?.['@graph']?.find((node) => node['@type'] === 'Organization')
  check('Organization contactPoint and country-level PostalAddress',
    Boolean(organization?.contactPoint?.[0]?.email && organization?.address?.['@type'] === 'PostalAddress' && organization?.address?.addressCountry === 'PE'),
    organization ? JSON.stringify({ contact: !!organization.contactPoint?.[0]?.email, address: organization.address }) : 'schema missing')
} catch (error) {
  check('Reachability / parse', false, error.message)
}

if (failures.length) {
  console.error(`AGENT_PRODUCTION_CONTRACT_FAIL: ${failures.length} failed check(s)`)
  process.exitCode = 1
} else {
  console.log('AGENT_PRODUCTION_CONTRACT_PASS')
}
