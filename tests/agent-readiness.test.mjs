import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, cpSync, rmSync, writeFileSync, mkdtempSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { execSync } from 'node:child_process'
import { tmpdir } from 'node:os'

const root = resolve(process.cwd())

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

  // address assertions (truthful absence of physical address / PostalAddress)
  assert.equal(org.address, undefined, 'Must NOT invent PostalAddress or physical address')
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
  assert.equal(webpage.dateModified, '2026-10-15', 'dateModified in index.html must match release date 2026-10-15')
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
    if (urlPath === '/' || urlPath === '/llms.txt' || urlPath === '/sitemap.xml') continue
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
  assert.ok(indexMd.includes('VetERP'), 'Must list verified projects')
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
          headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
        })
      }
      if (url.pathname === '/' || url.pathname === '/index.html') {
        return new Response(indexHtml, {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
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
    const bodyHomeHtml = await resHomeHtml.text()
    assert.ok(bodyHomeHtml.includes('<!doctype html>') || bodyHomeHtml.includes('<html'))

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
  assert.ok(indexHtml.includes('<title>Orbital Frameworks | Desarrollo de software en Perú</title>'))
  assert.ok(indexHtml.includes('Orbital Frameworks es una empresa peruana de desarrollo de software y soluciones digitales.'))

  // Robots & Sitemap match
  assert.ok(robotsTxt.includes('Sitemap: https://orbitalframeworks.qzz.io/sitemap.xml'))
  assert.ok(sitemapXml.includes('<loc>https://orbitalframeworks.qzz.io/</loc>'))
  assert.ok(sitemapXml.includes('<loc>https://orbitalframeworks.qzz.io/sobre-orbital-frameworks/</loc>'))
  assert.ok(sitemapXml.includes('<loc>https://orbitalframeworks.qzz.io/evidencia/</loc>'))

  // dateModified / lastmod coherence (F5)
  assert.ok(sitemapXml.includes('<loc>https://orbitalframeworks.qzz.io/</loc>\n    <lastmod>2026-10-15</lastmod>'))
  assert.ok(sitemapXml.includes('<loc>https://orbitalframeworks.qzz.io/sobre-orbital-frameworks/</loc>\n    <lastmod>2026-10-15</lastmod>'))
  assert.ok(sitemapXml.includes('<loc>https://orbitalframeworks.qzz.io/evidencia/</loc>\n    <lastmod>2026-10-15</lastmod>'))
  assert.ok(sitemapXml.includes('<loc>https://orbitalframeworks.qzz.io/privacy</loc>\n    <lastmod>2026-08-28</lastmod>'))
  assert.ok(sitemapXml.includes('<loc>https://orbitalframeworks.qzz.io/terms</loc>\n    <lastmod>2026-08-28</lastmod>'))

  // Case studies consistency
  for (const caseName of ['checkio', 'veterp', 'localisa', 'perulog-pallets']) {
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
  const testDist = mkdtempSync(join(tmpdir(), 'orbital-test-dist-'))

  try {
    // Copy all dist baseline files to test directory
    cpSync(join(root, 'dist'), testDist, { recursive: true })
    // Ensure updated llms.txt is present
    writeFileSync(join(testDist, 'llms.txt'), readFileSync(join(root, 'public/llms.txt')))
    // Ensure testDist index.html has the updated JSON-LD without PostalAddress / Lima and with 2026-10-15 dateModified
    const baseHtml = readFileSync(join(testDist, 'index.html'), 'utf8')
    const sourceIndexHtml = readFileSync(join(root, 'index.html'), 'utf8')
    const sourceLdJson = sourceIndexHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1]
    if (sourceLdJson) {
      const updatedTestHtml = baseHtml.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/, `<script type="application/ld+json">${sourceLdJson}</script>`)
      writeFileSync(join(testDist, 'index.html'), updatedTestHtml)
    }

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
    assert.ok(readFileSync(join(root, 'dist', file)).length > 0, `Missing deployment asset: ${file}`)
  }
})
