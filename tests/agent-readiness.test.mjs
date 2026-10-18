import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, cpSync, rmSync, writeFileSync, mkdtempSync, mkdirSync, existsSync, accessSync, constants } from 'node:fs'
import { resolve, join } from 'node:path'
import { execSync, spawn } from 'node:child_process'
import { tmpdir } from 'node:os'

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
const builtDist = resolveDistDir()

// Load files
const indexPath = join(root, 'index.html')
const llmsPath = join(root, 'public/llms.txt')
const indexMdPath = join(root, 'public/index.md')
const notFoundMdPath = join(root, 'public/404.md')
const sitemapPath = join(root, 'public/sitemap.xml')
const robotsPath = join(root, 'public/robots.txt')
const customHttpPath = join(root, 'customHttp.yml')

const indexHtml = readFileSync(indexPath, 'utf8')
const llmsTxt = readFileSync(llmsPath, 'utf8')
const indexMd = readFileSync(indexMdPath, 'utf8')
const notFoundMd = readFileSync(notFoundMdPath, 'utf8')
const sitemapXml = readFileSync(sitemapPath, 'utf8')
const robotsTxt = readFileSync(robotsPath, 'utf8')
const customHttp = readFileSync(customHttpPath, 'utf8')

// Parse JSON-LD
const jsonLdMatch = indexHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
assert.ok(jsonLdMatch, 'JSON-LD block must exist in index.html')
const jsonLd = JSON.parse(jsonLdMatch[1])
const org = jsonLd['@graph'].find((item) => item['@type'] === 'Organization')
const webpage = jsonLd['@graph'].find((item) => item['@type'] === 'WebPage')

test('1. Organization JSON-LD completeness & truthfulness', () => {
  assert.ok(org, 'Organization entity must exist in JSON-LD')
  assert.equal(org.name, 'Orbital Frameworks')

  // contactPoint assertions
  assert.ok(Array.isArray(org.contactPoint), 'contactPoint must be an array')
  assert.ok(org.contactPoint.length > 0, 'contactPoint must have at least one entry')
  const primaryContact = org.contactPoint[0]
  assert.equal(primaryContact['@type'], 'ContactPoint')
  assert.equal(primaryContact.contactType, 'customer service')
  assert.equal(primaryContact.email, 'contact.orbitalframeworks@gmail.com')
  assert.equal(primaryContact.url, 'https://orbitalframeworks.qzz.io/')
  assert.equal(primaryContact.telephone, undefined, 'Must NOT invent a phone number')

  // The company's public identity confirms Peru, not a street/postal location.
  // Only declare country-level address information until a company address is verified.
  assert.deepEqual(org.address, { '@type': 'PostalAddress', addressCountry: 'PE' })
  assert.equal(org.address.streetAddress, undefined, 'Must NOT invent a street')
  assert.equal(org.address.addressLocality, undefined, 'Must NOT invent a locality')
  assert.equal(org.address.postalCode, undefined, 'Must NOT invent a postal code')
  assert.ok(!JSON.stringify(org).includes('Lima'), 'Must NOT invent references to Lima')

  // Country Peru assertion
  assert.ok(org.areaServed, 'areaServed must be present')
  const areas = Array.isArray(org.areaServed) ? org.areaServed : [org.areaServed]
  assert.ok(areas.some((area) => area.name === 'Perú' || area['@type'] === 'Country'), 'Must specify country Peru')

  // Brand search keywords
  assert.ok(Array.isArray(org.alternateName), 'alternateName must be an array')
  assert.ok(org.alternateName.includes('Orbital Frameworks Software Development'), 'Must include Software Development alias')
  assert.ok(org.alternateName.includes('Orbital Frameworks Perú'), 'Must include Peru alias')
  assert.ok(org.knowsAbout.includes('software development'), 'knowsAbout must include software development')

  // dateModified synchronization check
  assert.ok(webpage, 'WebPage entity must exist in JSON-LD')
  assert.equal(webpage.dateModified, '2026-10-17', 'dateModified in index.html must match home update date 2026-10-17')
})

test('2. Agent instructions & when-to-use in public/llms.txt', () => {
  assert.ok(llmsTxt.includes('## When to Use This / Cuándo recurrir a Orbital Frameworks'), 'Must contain When to Use section')
  assert.ok(llmsTxt.includes('Casos de uso recomendados (Best-fit use cases)'), 'Must list best-fit use cases')
  assert.ok(llmsTxt.includes('Cuándo no recurrir (When not to use)'), 'Must list boundary/when not to use cases')
  assert.ok(llmsTxt.includes('contact.orbitalframeworks@gmail.com'), 'Must declare official email')
  assert.ok(llmsTxt.includes('https://www.linkedin.com/company/orbitalframeworks/'), 'Must declare official LinkedIn')
  assert.ok(llmsTxt.includes('Orbital Frameworks Software Development'), 'Must mention brand search terms')

  // Check no hallucinated claims or fake metrics
  assert.ok(!llmsTxt.includes('+51 9'), 'Must not have hallucinated mobile numbers')
  assert.ok(!llmsTxt.includes('clientes satisfechos: 1000'), 'Must not have fake metrics')

  // Check absence of unverified remote-only and office claims (F3)
  assert.ok(!llmsTxt.includes('sin sede física'), 'Must not claim lack of physical office')
  assert.ok(!llmsTxt.includes('opera de forma remota'), 'Must not claim remote-only operation')
  assert.ok(!llmsTxt.includes('atención presencial'), 'Must not claim lack of in-person presence')

  // Verify all declared URLs exist in sitemap or repository
  const internalUrls = [...llmsTxt.matchAll(/https:\/\/orbitalframeworks\.qzz\.io([^\s)]+)/g)].map((m) => m[1])
  assert.ok(internalUrls.length >= 6, 'Must list all official internal pages')
  for (const urlPath of internalUrls) {
    if (urlPath === '/' || urlPath === '/llms.txt' || urlPath === '/sitemap.xml' || urlPath === '/feed.xml') continue
    const inSitemap = sitemapXml.includes(`https://orbitalframeworks.qzz.io${urlPath}`)
    assert.ok(inSitemap, `Declared URL ${urlPath} must be present in sitemap.xml`)
  }
})

test('3. Markdown representation for Home (public/index.md)', () => {
  assert.ok(indexMd.length >= 200, 'index.md must be substantial (>200 chars)')
  assert.ok(indexMd.includes('# Orbital Frameworks'), 'Must have brand title')
  assert.ok(indexMd.includes('Empresa peruana de desarrollo de software y soluciones digitales'), 'Must have brand description')
  assert.ok(indexMd.includes('Landing pages'), 'Must list services')
  assert.ok(indexMd.includes('Sistemas empresariales de gestión'), 'Must list ERP services')
  assert.ok(indexMd.includes('Checkio'), 'Must list verified projects')
  assert.ok(indexMd.includes('Wasy'), 'Must list verified projects')
  assert.ok(indexMd.includes('Localisa'), 'Must list verified projects')
  assert.ok(indexMd.includes('PeruLog Pallets'), 'Must list verified projects')
  assert.ok(indexMd.includes('contact.orbitalframeworks@gmail.com'), 'Must list contact email')
  assert.ok(indexMd.includes('https://orbitalframeworks.qzz.io/llms.txt'), 'Must link to llms.txt')
  assert.ok(indexMd.includes('https://orbitalframeworks.qzz.io/sitemap.xml'), 'Must link to sitemap.xml')
  assert.ok(!indexMd.includes('<html') && !indexMd.includes('<!doctype html>'), 'Must be pure markdown, not HTML')

  // Check absence of unverified remote-only and office claims (F3)
  assert.ok(!indexMd.includes('sede física'), 'index.md must not make unverified office claims')
  assert.ok(!indexMd.includes('operación remota'), 'index.md must not make unverified remote operation claims')
})

test('4. Agent-friendly 404 Markdown error body (public/404.md)', () => {
  assert.ok(notFoundMd.length >= 20, '404.md must be at least 20 characters')
  assert.ok(notFoundMd.includes('404'), 'Must mention 404 error')
  assert.ok(notFoundMd.includes('orbitalframeworks.qzz.io/llms.txt'), 'Must contain valid link to llms.txt')
  assert.ok(notFoundMd.includes('orbitalframeworks.qzz.io/sitemap.xml'), 'Must contain valid link to sitemap.xml')
  assert.ok(notFoundMd.includes('contact.orbitalframeworks@gmail.com'), 'Must provide contact info')
})

test('5. customHttp.yml configuration for Content-Type and Vary: Accept', () => {
  assert.ok(customHttp.includes("pattern: '**/*.html'"), 'Must have pattern for html')
  assert.ok(customHttp.includes("pattern: '**/*.md'"), 'Must have pattern for md')
  assert.ok(customHttp.includes('key: Vary\n        value: Accept'), 'Must configure Vary: Accept')
  assert.ok(customHttp.includes('value: text/markdown; charset=utf-8'), 'Must configure text/markdown content-type')
  assert.ok(customHttp.includes("pattern: '/llms.txt'"), 'Must configure /llms.txt')
})

test('6. Cloudflare Worker simulation (scripts/edge/cloudflare-worker-content-negotiation.js)', async () => {
  const workerModule = await import('../scripts/edge/cloudflare-worker-content-negotiation.js')
  const worker = workerModule.default

  // Mock global fetch for Worker simulation
  const originalFetch = globalThis.fetch
  try {
    globalThis.fetch = async (urlOrReq) => {
      const targetUrl = typeof urlOrReq === 'string' ? urlOrReq : (urlOrReq.href || urlOrReq.url || urlOrReq.toString())
      const url = new URL(targetUrl)

      if (url.pathname === '/index.md') {
        return new Response(indexMd, {
          status: 200,
          headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Vary': 'Accept-Encoding',
          },
        })
      }
      if (url.pathname === '/' || url.pathname === '/index.html') {
        return new Response(indexHtml, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Vary': 'Accept-Encoding',
          },
        })
      }
      if (url.pathname === '/404.md') {
        return new Response(notFoundMd, {
          status: 200,
          headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
        })
      }
      return new Response('404 Not Found', {
        status: 404,
        headers: { 'Content-Type': 'text/html' },
      })
    }

    // Simulation A: GET / with Accept: text/markdown
    const reqHomeMd = new Request('https://orbitalframeworks.qzz.io/', {
      headers: { Accept: 'text/markdown' },
    })
    const resHomeMd = await worker.fetch(reqHomeMd)
    assert.equal(resHomeMd.status, 200)
    assert.ok(resHomeMd.headers.get('Content-Type').includes('text/markdown'))
    assert.ok(resHomeMd.headers.get('Vary').includes('Accept'))
    assert.ok(resHomeMd.headers.get('Vary').includes('Accept-Encoding'), 'Must not discard origin cache variants')
    const bodyHomeMd = await resHomeMd.text()
    assert.ok(bodyHomeMd.includes('# Orbital Frameworks'))
    assert.ok(bodyHomeMd.includes('desarrollo de software'))

    // Simulation B: GET / with Accept: text/html
    const reqHomeHtml = new Request('https://orbitalframeworks.qzz.io/', {
      headers: { Accept: 'text/html' },
    })
    const resHomeHtml = await worker.fetch(reqHomeHtml)
    assert.equal(resHomeHtml.status, 200)
    assert.ok(resHomeHtml.headers.get('Content-Type').includes('text/html'))
    assert.ok(resHomeHtml.headers.get('Vary').includes('Accept'))
    assert.ok(resHomeHtml.headers.get('Vary').split(',').some((value) => value.trim().toLowerCase() === 'accept'), 'Vary must have a distinct Accept entry (Accept-Encoding alone does not count)')
    const bodyHomeHtml = await resHomeHtml.text()
    assert.ok(bodyHomeHtml.includes('<!doctype html>') || bodyHomeHtml.includes('<html'))

    // A browser that explicitly prefers HTML must never receive Markdown.
    const reqPreferHtml = new Request('https://orbitalframeworks.qzz.io/', {
      headers: { Accept: 'text/html;q=1, text/markdown;q=0.5' },
    })
    const resPreferHtml = await worker.fetch(reqPreferHtml)
    assert.ok(resPreferHtml.headers.get('Content-Type').includes('text/html'))

    // Non-document methods must pass through, even when requesting Markdown.
    const reqPostMd = new Request('https://orbitalframeworks.qzz.io/', {
      method: 'POST',
      headers: { Accept: 'text/markdown' },
      body: 'test',
    })
    const resPostMd = await worker.fetch(reqPostMd)
    assert.ok(resPostMd.headers.get('Content-Type').includes('text/html'))

    // Simulation C: GET /non-existent-probe-404 with Accept: text/markdown
    const req404Md = new Request('https://orbitalframeworks.qzz.io/non-existent-probe-404', {
      headers: { Accept: 'text/markdown' },
    })
    const res404Md = await worker.fetch(req404Md)
    assert.equal(res404Md.status, 404)
    assert.ok(res404Md.headers.get('Content-Type').includes('text/markdown'))
    assert.ok(res404Md.headers.get('Vary').includes('Accept'))
    const body404Md = await res404Md.text()
    assert.ok(body404Md.length >= 20)
    assert.ok(body404Md.includes('llms.txt'))
    assert.ok(body404Md.includes('sitemap.xml'))

    // Simulation D: GET /non-existent-probe-404 with Accept: text/html
    const req404Html = new Request('https://orbitalframeworks.qzz.io/non-existent-probe-404', {
      headers: { Accept: 'text/html' },
    })
    const res404Html = await worker.fetch(req404Html)
    assert.equal(res404Html.status, 404)
    assert.ok(res404Html.headers.get('Content-Type').includes('text/html'))
    assert.ok(res404Html.headers.get('Vary').includes('Accept'))
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('7. Brand search consistency & dateModified synchronization across assets', () => {
  // Title and descriptions match
  assert.ok(indexHtml.includes('<title>Software a medida y automatización para empresas | Orbital Frameworks</title>'))
  assert.ok(indexHtml.includes('Software a medida, automatización de procesos y soluciones web para empresas en Perú.'))
  const homepageSource = readFileSync(join(root, 'src/App.tsx'), 'utf8')
  assert.ok(homepageSource.includes('Software a medida · Automatización · IA aplicada / Perú'), 'Brand services must be visible in the home hero')

  // Robots & Sitemap match
  assert.ok(robotsTxt.includes('Sitemap: https://orbitalframeworks.qzz.io/sitemap.xml'))
  assert.ok(sitemapXml.includes('<loc>https://orbitalframeworks.qzz.io/</loc>'))
  assert.ok(sitemapXml.includes('<loc>https://orbitalframeworks.qzz.io/sobre-orbital-frameworks/</loc>'))
  assert.ok(sitemapXml.includes('<loc>https://orbitalframeworks.qzz.io/evidencia/</loc>'))

  // dateModified / lastmod coherence (F5)
  assert.ok(sitemapXml.includes('<loc>https://orbitalframeworks.qzz.io/</loc>\n    <lastmod>2026-10-17</lastmod>'))
  assert.ok(sitemapXml.includes('<loc>https://orbitalframeworks.qzz.io/sobre-orbital-frameworks/</loc>\n    <lastmod>2026-10-16</lastmod>'))
  assert.ok(sitemapXml.includes('<loc>https://orbitalframeworks.qzz.io/evidencia/</loc>\n    <lastmod>2026-10-16</lastmod>'))
  assert.ok(sitemapXml.includes('<loc>https://orbitalframeworks.qzz.io/privacy</loc>\n    <lastmod>2026-10-16</lastmod>'))
  assert.ok(sitemapXml.includes('<loc>https://orbitalframeworks.qzz.io/terms</loc>\n    <lastmod>2026-08-28</lastmod>'))

  // Case studies consistency
  for (const caseName of ['checkio', 'wasy', 'localisa', 'perulog-pallets']) {
    assert.ok(sitemapXml.includes(`/casos/${caseName}/`), `Sitemap must list case ${caseName}`)
    assert.ok(llmsTxt.includes(`/casos/${caseName}/`), `llms.txt must list case ${caseName}`)
    assert.ok(indexMd.includes(`/casos/${caseName}/`), `index.md must list case ${caseName}`)
  }
})

test('8. Cloudflare Worker prefersMarkdown RFC 9110 strict q-value negotiation', async () => {
  const workerModule = await import('../scripts/edge/cloudflare-worker-content-negotiation.js')
  const { prefersMarkdown } = workerModule
  assert.ok(typeof prefersMarkdown === 'function', 'prefersMarkdown must be exported')

  // Normal agent requesting markdown
  assert.equal(prefersMarkdown('text/markdown'), true)
  assert.equal(prefersMarkdown('text/html'), false)

  // Explicit priority
  assert.equal(prefersMarkdown('text/markdown;q=0.9, text/html;q=0.5'), true)
  assert.equal(prefersMarkdown('text/html;q=0.9, text/markdown;q=0.5'), false)
  assert.equal(prefersMarkdown('text/html,application/xhtml+xml,application/xml;q=0.9'), false)

  // RFC 9110: q=0 explicitly rejects the representation
  assert.equal(prefersMarkdown('text/markdown;q=0'), false, 'text/markdown;q=0 must not be accepted')
  assert.equal(prefersMarkdown('text/markdown;q=0.0'), false, 'text/markdown;q=0.0 must not be accepted')
  assert.equal(prefersMarkdown('text/markdown;q=0, text/html;q=0.8'), false, 'q=0 markdown must yield false even if html is secondary')

  // Equal weights (must favor HTML to protect browsers)
  assert.equal(prefersMarkdown('text/markdown, text/html'), false, 'Equal weights must favor HTML')
  assert.equal(prefersMarkdown('text/html;q=0.8, text/markdown;q=0.8'), false, 'Equal q weights must favor HTML')

  // Wildcards, non-matching and empty headers
  assert.equal(prefersMarkdown('*/*'), false, '*/* must favor HTML')
  assert.equal(prefersMarkdown('text/plain'), false)
  assert.equal(prefersMarkdown(''), false)
  assert.equal(prefersMarkdown(null), false)
  assert.equal(prefersMarkdown(undefined), false)
})

test('9. verify-build strictly requires index.md and 404.md in dist without silent fallbacks', () => {
  const tmpBase = existsSync('/tmp') ? '/tmp' : tmpdir()
  const testDist = mkdtempSync(join(tmpBase, 'orbital-test-dist-'))

  try {
    // Copy all dist baseline files to test directory
    cpSync(builtDist, testDist, { recursive: true })
    // Ensure updated llms.txt and sitemap.xml are present
    writeFileSync(join(testDist, 'llms.txt'), readFileSync(join(root, 'public/llms.txt')))
    writeFileSync(join(testDist, 'sitemap.xml'), readFileSync(join(root, 'public/sitemap.xml')))

    // Retire VetERP and add Wasy case to testDist fixture
    rmSync(join(testDist, 'casos/veterp'), { recursive: true, force: true })
    mkdirSync(join(testDist, 'casos/wasy'), { recursive: true })
    const realWasyPath = join(builtDist, 'casos/wasy/index.html')
    const wasyCaseHtml = existsSync(realWasyPath)
      ? readFileSync(realWasyPath, 'utf8')
      : checkioCaseHtml
          .replaceAll('https://orbitalframeworks.qzz.io/casos/checkio/', 'https://orbitalframeworks.qzz.io/casos/wasy/')
          .replaceAll('https://checkio-frontend.onrender.com/landing', 'https://wasy.store/')
          .replaceAll('Checkio', 'Wasy')
          .replaceAll('VetERP', 'Wasy')
          .replaceAll('/casos/veterp/', '/casos/wasy/')
          .replaceAll('https://veterp.qzz.io/', 'https://wasy.store/')
          .replace(/<section class="caseCapabilities">[\s\S]*?<\/section>/, '')
    writeFileSync(join(testDist, 'casos/wasy/index.html'), wasyCaseHtml)

    // Ensure testDist index.html has updated country-only schema, dateModified, and no VetERP.
    const baseHtml = readFileSync(join(testDist, 'index.html'), 'utf8')
      .replaceAll('VetERP', 'Wasy')
      .replaceAll('/casos/veterp/', '/casos/wasy/')
      .replaceAll('https://veterp.qzz.io/', 'https://wasy.store/')
    const sourceIndexHtml = readFileSync(join(root, 'index.html'), 'utf8')
    const sourceLdJson = sourceIndexHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1]
    if (sourceLdJson) {
      const updatedTestHtml = baseHtml.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/, `<script type="application/ld+json">${sourceLdJson}</script>`)
      writeFileSync(join(testDist, 'index.html'), updatedTestHtml)
    } else {
      writeFileSync(join(testDist, 'index.html'), baseHtml)
    }

    // Ensure testDist has prerendered 404.html and 404/index.html required by verify-build
    const notFoundHtml = baseHtml
      .replace(/<title>[\s\S]*?<\/title>/, '<title>Página no encontrada | Orbital Frameworks</title>')
      .replace(/<link rel="canonical" href="[^"]*" \/>/, '<link rel="canonical" href="https://orbitalframeworks.qzz.io/404" />')
      .replace(/<meta name="robots" content="[^"]*" \/>/, '<meta name="robots" content="noindex, follow" />')
      .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/, '')
      .replace(/<div id="root">[\s\S]*?<\/div>/, '<div id="root"><main><h1>404</h1><p>Página no encontrada</p><a href="/">Volver al inicio</a></main></div>')
    mkdirSync(join(testDist, '404'), { recursive: true })
    writeFileSync(join(testDist, '404.html'), notFoundHtml)
    writeFileSync(join(testDist, '404/index.html'), notFoundHtml)

    // This fixture models the generated WebP artifacts independently of a stale local dist/.
    mkdirSync(join(testDist, 'portfolio'), { recursive: true })
    writeFileSync(join(testDist, 'portfolio/astro-480.webp'), 'fixture')
    writeFileSync(join(testDist, 'portfolio/astro-720.webp'), 'fixture')
    writeFileSync(join(testDist, 'portfolio/wasy-640.webp'), 'fixture')
    writeFileSync(join(testDist, 'portfolio/wasy-960.webp'), 'fixture')

    // Case A: Missing 404.md -> must fail strictly with non-zero exit code
    rmSync(join(testDist, '404.md'), { force: true })
    rmSync(join(testDist, 'index.md'), { force: true })
    let failedWithoutMarkdown = false
    try {
      execSync(`node scripts/verify-build.mjs`, {
        cwd: root,
        env: { ...process.env, DIST_DIR: testDist },
        stdio: 'pipe',
      })
    } catch (err) {
      failedWithoutMarkdown = true
      const output = err.stdout?.toString() || ''
      assert.ok(output.includes('FAIL Published asset 404.md') || output.includes('FAIL Published asset index.md'), 'Must report missing markdown assets')
    }
    assert.equal(failedWithoutMarkdown, true, 'verify-build MUST fail when index.md / 404.md are missing from dist')

    // Case B: Both 404.md and index.md are present in dist -> must pass
    writeFileSync(join(testDist, '404.md'), readFileSync(join(root, 'public/404.md')))
    writeFileSync(join(testDist, 'index.md'), readFileSync(join(root, 'public/index.md')))
    const outputPass = execSync(`node scripts/verify-build.mjs`, {
      cwd: root,
      env: { ...process.env, DIST_DIR: testDist },
      stdio: 'pipe',
    }).toString()
    assert.ok(outputPass.includes('PASS Published asset 404.md'), 'Must confirm 404.md exists in dist')
    assert.ok(outputPass.includes('PASS Published asset index.md'), 'Must confirm index.md exists in dist')
    assert.ok(outputPass.includes('Build verification passed'), 'Build verification must pass completely')
  } finally {
    rmSync(testDist, { recursive: true, force: true })
  }
})

test('10. Local HTTP Server content negotiation for Home (live loopback socket)', async () => {
  const { createNegotiationServer } = await import('../scripts/serve-negotiation.mjs')
  const server = createNegotiationServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const port = server.address().port
  const baseUrl = `http://127.0.0.1:${port}`

  try {
    // 1. Request with Accept: text/markdown
    const resMd = await fetch(baseUrl + '/', {
      headers: { Accept: 'text/markdown' },
    })
    assert.equal(resMd.status, 200, 'Must return HTTP 200 for Markdown representation')
    const ctMd = resMd.headers.get('content-type') || ''
    assert.ok(ctMd.includes('text/markdown'), `Content-Type must be text/markdown, got: ${ctMd}`)
    const varyMd = resMd.headers.get('vary') || ''
    assert.ok(varyMd.includes('Accept'), `Vary header must include Accept, got: ${varyMd}`)
    const bodyMd = await resMd.text()
    assert.ok(bodyMd.length >= 200, 'Markdown body must be substantial')
    assert.ok(bodyMd.includes('# Orbital Frameworks'), 'Must contain brand header')
    assert.ok(bodyMd.includes('desarrollo de software'), 'Must contain positioning')

    // 2. Request with Accept: text/html
    const resHtml = await fetch(baseUrl + '/', {
      headers: { Accept: 'text/html' },
    })
    assert.equal(resHtml.status, 200, 'Must return HTTP 200 for HTML representation')
    const ctHtml = resHtml.headers.get('content-type') || ''
    assert.ok(ctHtml.includes('text/html'), `Content-Type must be text/html, got: ${ctHtml}`)
    const varyHtml = resHtml.headers.get('vary') || ''
    assert.ok(varyHtml.includes('Accept'), `Vary header must include Accept, got: ${varyHtml}`)
    const bodyHtml = await resHtml.text()
    assert.ok(bodyHtml.includes('<html') || bodyHtml.includes('<!doctype html>'), 'HTML body must contain html document tags')
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

test('11. Local HTTP Server 404 negotiation on nonexistent route (live loopback socket)', async () => {
  const { createNegotiationServer } = await import('../scripts/serve-negotiation.mjs')
  const server = createNegotiationServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const port = server.address().port
  const baseUrl = `http://127.0.0.1:${port}`

  try {
    // 1. Nonexistent route with Accept: text/markdown
    const res404Md = await fetch(baseUrl + '/ruta-totalmente-inexistente-agente', {
      headers: { Accept: 'text/markdown' },
    })
    assert.equal(res404Md.status, 404, 'Must return HTTP 404 for missing route')
    const ct404Md = res404Md.headers.get('content-type') || ''
    assert.ok(ct404Md.includes('text/markdown'), `Content-Type must be text/markdown, got: ${ct404Md}`)
    const vary404Md = res404Md.headers.get('vary') || ''
    assert.ok(vary404Md.includes('Accept'), `Vary header must include Accept, got: ${vary404Md}`)
    const body404Md = await res404Md.text()
    assert.ok(body404Md.length >= 20, '404 Markdown error body must be at least 20 characters')
    assert.ok(body404Md.includes('llms.txt'), '404 Markdown must link to llms.txt')
    assert.ok(body404Md.includes('sitemap.xml'), '404 Markdown must link to sitemap.xml')

    // 2. Nonexistent route with Accept: text/html
    const res404Html = await fetch(baseUrl + '/ruta-totalmente-inexistente-humano', {
      headers: { Accept: 'text/html' },
    })
    assert.equal(res404Html.status, 404, 'Must return HTTP 404 for missing route')
    const ct404Html = res404Html.headers.get('content-type') || ''
    assert.ok(ct404Html.includes('text/html'), `Content-Type must be text/html, got: ${ct404Html}`)
    const vary404Html = res404Html.headers.get('vary') || ''
    assert.ok(vary404Html.includes('Accept'), `Vary header must include Accept, got: ${vary404Html}`)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

test('12. Deployment pipelines produce dist before artifact-dependent tests', () => {
  const amplify = readFileSync(join(root, 'amplify.yml'), 'utf8')
  const pages = readFileSync(join(root, '.github/workflows/deploy-pages.yml'), 'utf8')
  const build = readFileSync(join(root, 'scripts/build.mjs'), 'utf8')

  assert.match(
    amplify,
    /build:\s*\n\s*commands:\s*\n\s*- npm run build\s*\n\s*- npm test/,
    'Amplify must build before running artifact-dependent tests',
  )
  assert.doesNotMatch(
    amplify.split('    build:')[0],
    /^\s*- npm test\s*$/m,
    'Amplify preBuild must not require dist/',
  )
  assert.ok(
    pages.indexOf('run: npm run build') < pages.indexOf('run: npm test') &&
    pages.includes('run: npm test'),
    'GitHub Pages must also test the built artifact before upload',
  )
  assert.doesNotMatch(
    build,
    /Sandbox detected|mkdtempSync|rmSync\(tempDist/,
    'Production build must not silently discard artifacts in an ephemeral directory',
  )
  for (const file of ['index.html', 'index.md', '404.md', 'llms.txt', 'sitemap.xml']) {
    assert.ok(readFileSync(join(builtDist, file)).length > 0, `Missing deployment asset: ${file}`)
  }
})

test('13. The real-host negotiation verifier passes against a local compatible server', async () => {
  const { createNegotiationServer } = await import('../scripts/serve-negotiation.mjs')
  const server = createNegotiationServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const url = `http://127.0.0.1:${server.address().port}`

  try {
    const result = await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, ['scripts/verify-agent-production.mjs'], {
        cwd: root,
        env: { ...process.env, ORBITAL_PUBLIC_URL: url },
        stdio: ['ignore', 'pipe', 'pipe'],
      })
      let stdout = ''
      let stderr = ''
      child.stdout.on('data', (chunk) => { stdout += chunk })
      child.stderr.on('data', (chunk) => { stderr += chunk })
      child.once('error', reject)
      child.once('close', (code) => resolve({ code, stdout, stderr }))
    })
    assert.equal(result.code, 0, result.stdout + result.stderr)
    assert.match(result.stdout, /AGENT_PRODUCTION_CONTRACT_PASS/)
    assert.match(result.stdout, /PASS Home Markdown negotiated/)
    assert.match(result.stdout, /PASS Nonexistent page Markdown negotiated/)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

test('14. Technical SEO: BreadcrumbList schema, OpenGraph article type, and 404 routing configuration', () => {
  const prerenderSrc = readFileSync(join(root, 'scripts/prerender.mjs'), 'utf8')
  const entryServerSrc = readFileSync(join(root, 'src/entry-server.tsx'), 'utf8')
  const mainSrc = readFileSync(join(root, 'src/main.tsx'), 'utf8')
  const notFoundPageSrc = readFileSync(join(root, 'src/NotFoundPage.tsx'), 'utf8')

  // 1. BreadcrumbList schema defined for subpages and case studies
  assert.ok(prerenderSrc.includes('BreadcrumbList'), 'prerender.mjs must define BreadcrumbList schema')
  assert.ok(prerenderSrc.includes('itemListElement'), 'prerender.mjs BreadcrumbList must have itemListElement')
  assert.ok(prerenderSrc.includes("'CreativeWork'"), 'Case studies must include CreativeWork schema')

  // 2. OpenGraph article type for case studies
  assert.ok(prerenderSrc.includes("schemaType === 'case'"), 'prerender.mjs must check case schema type')
  assert.ok(prerenderSrc.includes("content=\"article\""), 'prerender.mjs must assign article og:type to case studies')

  // 3. 404 routing and soft-404 prevention
  assert.ok(entryServerSrc.includes('NotFoundPage'), 'entry-server.tsx must import and route NotFoundPage')
  assert.ok(mainSrc.includes('NotFoundPage'), 'main.tsx must import and route NotFoundPage')
  assert.ok(notFoundPageSrc.includes('404'), 'NotFoundPage must render 404 code')
  assert.ok(notFoundPageSrc.includes('Página no encontrada'), 'NotFoundPage must render descriptive title')
  assert.ok(notFoundPageSrc.includes('Volver al inicio'), 'NotFoundPage must link to home')

  // 4. 404 schema policy: must not emit contradictory homepage JSON-LD
  assert.ok(
    prerenderSrc.includes("if (page.schemaType === '404') return null"),
    'prerender.mjs must return null schema for 404 page',
  )
  assert.ok(
    prerenderSrc.includes('const schema = schemaForPage(page)') &&
    prerenderSrc.includes('if (schema)'),
    'prerender.mjs must strip application/ld+json tag completely when schema is null',
  )
})

test('15. Core Web Vitals (CWV) & Accessibility: explicit image dimensions, animation pausing & tap targets', () => {
  const appSrc = readFileSync(join(root, 'src/App.tsx'), 'utf8')
  const caseStudySrc = readFileSync(join(root, 'src/CaseStudyPage.tsx'), 'utf8')
  const appCss = readFileSync(join(root, 'src/App.css'), 'utf8')
  const caseStudyCss = readFileSync(join(root, 'src/CaseStudyPage.css'), 'utf8')

  // 1. CLS: Explicit width and height attributes on key images
  assert.ok(appSrc.includes('width={200} height={20}'), 'Logo must have explicit width and height in App.tsx')
  assert.ok(appSrc.includes('width={item.imageSrcSet ? 960 : 640} height={item.imageSrcSet ? 704 : 360}'), 'WorkCard preview image must reserve the selected asset dimensions')
  assert.ok(appSrc.includes('width={600} height={806}'), 'Portfolio robot image must have explicit width and height')
  assert.ok(appSrc.includes('/portfolio/astro-480.webp') && appSrc.includes('/portfolio/astro-720.webp'), 'Portfolio robot must use generated responsive WebP assets instead of the source PNG')
  assert.match(appCss, /\.portfolioRobot picture\s*\{[^}]*width:\s*min\(370px,\s*100%\);[^}]*aspect-ratio:\s*600\s*\/\s*806/s,
    'The portfolio picture itself must reserve visible dimensions, not collapse to 0x0 before lazy image load')
  assert.match(appCss, /\.portfolioRobot picture \.portfolioRobotImg\s*\{[^}]*width:\s*100%;[^}]*height:\s*auto/s,
    'The image must fill its layout-stable picture container without distortion')
  assert.ok(caseStudySrc.includes("width={960} height={slug === 'wasy' ? 704 : 540}"), 'Case study hero image must reserve the selected asset dimensions')

  // 2. INP / Performance: Hero 3D animation loop pauses with IntersectionObserver when off-screen
  assert.ok(appSrc.includes('IntersectionObserver'), 'Hero component must use IntersectionObserver to throttle animation loop')
  assert.ok(appSrc.includes('isVisible'), 'Hero component must track visibility')

  // 3. Mobile tap targets: navToggle must have minimum 48x48px size
  assert.ok(appCss.includes('min-width: 48px'), 'navToggle must have min-width: 48px for mobile tap accessibility')
  assert.ok(appCss.includes('min-height: 48px'), 'navToggle must have min-height: 48px for mobile tap accessibility')

  // 4. CSS aspect-ratio on case study media to eliminate shift
  assert.ok(caseStudyCss.includes('aspect-ratio: 16 / 9'), 'caseHeroMedia img must have aspect-ratio: 16 / 9')
})

test('16. GA4 remains consent-gated and tracks only aggregate navigation intents', () => {
  const analytics = readFileSync(join(root, 'src/analytics.ts'), 'utf8')
  const consent = readFileSync(join(root, 'src/AnalyticsConsent.tsx'), 'utf8')
  const appSrc = readFileSync(join(root, 'src/App.tsx'), 'utf8')

  // 1. Gated by deployment environment variable without committed secrets
  assert.ok(analytics.includes('VITE_GA_MEASUREMENT_ID'), 'GA4 must support a deployment environment variable')
  assert.ok(analytics.includes('G-487MJFCW45'), 'The owner-approved GA4 public stream ID must be available in clean production builds')
  assert.ok(analytics.includes('window.dataLayer.push(arguments)'), 'gtag.js must receive real Arguments objects, not inert arrays')
  assert.ok(analytics.includes('window.gtag = gtag'), 'The standard global gtag callable must be available when the consent-gated tag loads')

  // 2. Google Consent Mode v2 default to denied & advertising signals disabled
  assert.ok(analytics.includes("analytics_storage: 'denied'"), 'GA4 consent must default to denied')
  assert.ok(analytics.includes("ad_storage: 'denied'"), 'ad_storage must default to denied')
  assert.ok(analytics.includes("ad_user_data: 'denied'"), 'ad_user_data must default to denied')
  assert.ok(analytics.includes("ad_personalization: 'denied'"), 'ad_personalization must default to denied')
  assert.ok(analytics.includes('allow_google_signals: false'), 'Google signals must be disabled for privacy')
  assert.ok(analytics.includes('restricted_data_processing: true'), 'Restricted data processing must be enabled')

  // 3. Duplicate tag and auto-tracking prevention
  assert.ok(analytics.includes('send_page_view: false'), 'send_page_view must be false in config to prevent duplicate automatic page views')
  assert.ok(analytics.includes('trackPageView'), 'Controlled page view function must exist for SPA navigation')
  assert.ok(analytics.includes('popstate'), 'popstate must be monitored for client-side route tracking')

  // 4. Intent & conversion tracking without message content or PII
  assert.ok(analytics.includes("'contact_intent'"), 'Unconfirmed contact attempts must be tracked as intent, not a completed lead')
  assert.ok(!analytics.includes("gtag('event', 'generate_lead'"), 'Do not count a mailto or clipboard interaction as a generated lead')
  assert.ok(analytics.includes("'copy_email'"), 'Email copy action must be supported in contact intent tracking')
  assert.ok(appSrc.includes("trackContactIntent('copy_email')"), 'App.tsx must invoke trackContactIntent on email copy')
  assert.ok(appSrc.includes('execCommand'), 'App.tsx must provide a clipboard fallback for restricted browser environments')
  assert.ok(!analytics.includes("link.relList.contains('noopener')"), 'Opening a social link must not be miscounted as a product click')
  assert.ok(!analytics.includes("button.dataset.analyticsAction === 'copy_email'"), 'Copied email must not fire twice through button and delegated click handlers')
  assert.ok(analytics.includes("'view_item'"), 'Case navigation must be measured')

  // 5. Consent UX & SSR hydration mismatch prevention
  assert.ok(consent.includes('Aceptar analítica') && consent.includes('No aceptar'), 'Visitors must be able to choose analytics')
  assert.ok(
    consent.includes('useSyncExternalStore') && consent.includes('isClient'),
    'AnalyticsConsent must defer client mounting via useSyncExternalStore to prevent SSR hydration mismatch',
  )
})

test('17. Webmaster and analytics platform verification: GSC token, sitemap indexing, and identity gates', () => {
  const gscPath = join(root, 'public/google466769daa2952733.html')
  assert.ok(readFileSync(gscPath, 'utf8'), 'GSC verification token must exist in public/google466769daa2952733.html')
  assert.equal(readFileSync(gscPath, 'utf8').trim(), 'google-site-verification: google466769daa2952733.html')

  // Verify all 15 sitemap canonical routes are properly formed
  const sitemapContent = readFileSync(join(root, 'public/sitemap.xml'), 'utf8')
  const locMatches = [...sitemapContent.matchAll(/<loc>(https:\/\/orbitalframeworks\.qzz.io[^<]*)<\/loc>/g)].map(m => m[1])
  assert.equal(locMatches.length, 15, 'Sitemap must contain exactly 15 canonical routes')

  const expectedUrls = [
    'https://orbitalframeworks.qzz.io/',
    'https://orbitalframeworks.qzz.io/privacy',
    'https://orbitalframeworks.qzz.io/terms',
    'https://orbitalframeworks.qzz.io/sobre-orbital-frameworks/',
    'https://orbitalframeworks.qzz.io/evidencia/',
    'https://orbitalframeworks.qzz.io/casos/checkio/',
    'https://orbitalframeworks.qzz.io/casos/wasy/',
    'https://orbitalframeworks.qzz.io/casos/localisa/',
    'https://orbitalframeworks.qzz.io/casos/perulog-pallets/',
    'https://orbitalframeworks.qzz.io/servicios/desarrollo-software-medida/',
    'https://orbitalframeworks.qzz.io/servicios/automatizacion-procesos/',
    'https://orbitalframeworks.qzz.io/servicios/landing-pages-b2b/',
    'https://orbitalframeworks.qzz.io/blog/',
    'https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/',
    'https://orbitalframeworks.qzz.io/blog/automatizacion-procesos-vs-excel-riesgo-operativo/',
  ]
  for (const expectedUrl of expectedUrls) {
    assert.ok(locMatches.includes(expectedUrl), `Sitemap must include ${expectedUrl}`)
  }

  // Verify identity gate documentation
  const gateDocPath = join(root, 'docs/measurement-platform-gate-2026-10-15.md')
  const gateDoc = readFileSync(gateDocPath, 'utf8')
  assert.ok(gateDoc.includes('Google Search Console (GSC)'), 'Gate doc must document GSC verification')
  assert.ok(gateDoc.includes('Google Analytics 4 (GA4)'), 'Gate doc must document GA4 gating')
  assert.ok(gateDoc.includes('VITE_GA_MEASUREMENT_ID'), 'Gate doc must document VITE_GA_MEASUREMENT_ID')
  assert.ok(gateDoc.includes('Bing Webmaster Tools'), 'Gate doc must document Bing Webmaster')
  assert.ok(gateDoc.includes('PageSpeed Insights'), 'Gate doc must document PageSpeed baseline')
})

test('18. Production verifier checks the deployed responsive WebP assets, not the obsolete PNG', () => {
  const productionVerifier = readFileSync(join(root, 'scripts/verify-production.mjs'), 'utf8')
  assert.ok(productionVerifier.includes('/portfolio/astro-480.webp'), 'Production check must include the small WebP')
  assert.ok(productionVerifier.includes('/portfolio/astro-720.webp'), 'Production check must include the large WebP')
  assert.ok(productionVerifier.includes('asset.status === 200'), 'Production check must reject missing assets')
  assert.ok(productionVerifier.includes('asset.isWebP'), 'Production check must validate a WebP response body')
  assert.ok(!productionVerifier.includes("check('Original visual assets'"),
    'Production check must not retain the obsolete positive assertion for the PNG')
})

test('19. Licensed corporate fonts self-host without late third-party stylesheet swaps', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8')
  const css = readFileSync(join(root, 'src/index.css'), 'utf8')
  assert.doesNotMatch(html, /fonts\.(?:googleapis|gstatic)\.com/,
    'Site must not depend on an external Google Fonts CSS/asset connection')
  assert.doesNotMatch(html, /onload="this\.onload=null;this\.rel='stylesheet'"/,
    'Corporate font styles must not be applied late through onload')
  const fonts = [
    'big-shoulders-display-latin.woff2',
    'ibm-plex-sans-latin.woff2',
    'ibm-plex-mono-400-latin.woff2',
    'ibm-plex-mono-500-latin.woff2',
    'ibm-plex-mono-600-latin.woff2',
  ]
  for (const filename of fonts) {
    const bytes = readFileSync(join(root, 'public/fonts', filename))
    assert.ok(bytes.byteLength > 10000, `Missing valid font payload: ${filename}`)
    assert.equal(bytes.subarray(0, 4).toString(), 'wOF2', `Not a WOFF2 font: ${filename}`)
    assert.ok(css.includes(`/fonts/${filename}`), `Font not referenced by CSS: ${filename}`)
  }
  for (const license of ['LICENSE-bigshouldersdisplay.txt', 'LICENSE-ibmplexsans.txt', 'LICENSE-ibmplexmono.txt']) {
    assert.match(readFileSync(join(root, 'public/fonts', license), 'utf8'), /SIL OPEN FONT LICENSE/i,
      `Official font redistribution license missing: ${license}`)
  }
  assert.doesNotMatch(html, /<link rel="preload" as="font"/,
    'No blocking font preloads: the measured mobile FCP regression must not return')
})

test('20. Preload only the critical corporate headline font, preserving the glow design', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8')
  const css = readFileSync(join(root, 'src/App.css'), 'utf8')
  assert.match(html, /<link rel="preload" href="\/fonts\/big-shoulders-display-latin\.woff2" as="font" type="font\/woff2" crossorigin\s*\/>/,
    'Preload the exact self-hosted headline font used in the hero on cold navigations')
  assert.equal((html.match(/rel="preload"[^>]*as="font"/g) ?? []).length, 1,
    'Preloading additional fonts measurably delayed mobile FCP; keep exactly the critical font')
  assert.match(css, /\.heroGlow\s*\{[^}]*inset:\s*-40%\s*;/s,
    'The existing decorative hero glow geometry must be preserved')
})
