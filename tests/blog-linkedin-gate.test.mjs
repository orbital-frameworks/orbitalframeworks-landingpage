import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { existsSync, mkdtempSync, readFileSync, rmSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import {
  BACKLOG_TOPICS,
  HISTORIC_LINKEDIN_POSTS,
  checkDuplicatePolicy,
  fetchArticleHttp,
  generateLinkedInPack,
  generateUtmUrl,
  loadManifest,
  runGateCheck,
  sanitizeAndValidateUtmUrl,
  saveManifest,
  validateArticleHtml,
  resolveDistDir,
} from '../scripts/blog-linkedin-gate.mjs'

const root = resolve(process.cwd())
const distDir = resolveDistDir(root)

test('1. Backlog topics and pilot article metadata alignment', () => {
  assert.equal(BACKLOG_TOPICS.length, 8, 'Must declare exactly 8 B2B topics')
  const pilot = BACKLOG_TOPICS.find((t) => t.id === 'B2B-01')
  assert.ok(pilot, 'B2B-01 pilot topic must exist')
  assert.equal(pilot.status, 'PUBLISHED', 'Pilot topic must be in PUBLISHED status')
  assert.equal(pilot.campaign, 'pilot_saas_vs_custom', 'Pilot campaign UTM must be pilot_saas_vs_custom')

  const b2b02 = BACKLOG_TOPICS.find((t) => t.id === 'B2B-02')
  assert.ok(b2b02, 'B2B-02 topic must exist')
  assert.equal(b2b02.status, 'PUBLISHED', 'B2B-02 approved for publication on 20/10/2026')
  assert.equal(b2b02.campaign, 'camp_excel_vs_automation', 'B2B-02 campaign UTM must be camp_excel_vs_automation')

  const b2b03 = BACKLOG_TOPICS.find((t) => t.id === 'B2B-03')
  assert.equal(b2b03?.status, 'PUBLISHED', 'B2B-03 approved for publication on 22/10/2026')
  assert.equal(b2b03?.campaign, 'camp_b2b_landing_vs_corp')

  const drafts = BACKLOG_TOPICS.filter((t) => !['B2B-01', 'B2B-02', 'B2B-03'].includes(t.id))
  for (const draft of drafts) {
    assert.equal(
      draft.status,
      'DRAFT_NO_PUBLICABLE',
      `Topic ${draft.id} (${draft.slug}) must be DRAFT_NO_PUBLICABLE pending owner answers`,
    )
    assert.ok(draft.campaign.startsWith('camp_'), `Draft ${draft.id} must have structured campaign slug`)
  }
})

test('2. Deterministic UTM link generation and strict PII rejection', () => {
  const canonical = 'https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/'
  const utmUrl = generateUtmUrl(canonical, 'pilot_saas_vs_custom')

  assert.equal(
    utmUrl,
    'https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/?utm_source=linkedin&utm_medium=organic_social&utm_campaign=pilot_saas_vs_custom',
    'UTM URL must be deterministically formatted',
  )

  // Strict PII rejection: must throw RECHAZADO_POR_POLITICA_PII
  const piiUrl = `${canonical}?utm_source=linkedin&utm_medium=organic_social&utm_campaign=pilot&email=director@empresa.com&user=admin`
  assert.throws(
    () => sanitizeAndValidateUtmUrl(piiUrl, { strict: true }),
    (err) => {
      assert.equal(err.code, 'RECHAZADO_POR_POLITICA_PII')
      assert.ok(err.detectedPii.includes('email'))
      assert.ok(err.detectedPii.includes('user'))
      return true
    },
    'Must reject URLs containing personal identifiable information (PII)',
  )

  // Permissive sanitization mode cleans query parameters without throwing
  const sanitized = sanitizeAndValidateUtmUrl(piiUrl, { strict: false })
  assert.ok(!sanitized.cleanUrl.includes('email='))
  assert.ok(!sanitized.cleanUrl.includes('user='))
  assert.ok(sanitized.cleanUrl.includes('utm_source=linkedin'))
})

test('3. Positive Gate Verification on prerendered pilot article HTML', () => {
  const articleHtmlPath = join(distDir, 'blog/software-a-medida-o-saas-como-decidir/index.html')
  assert.ok(existsSync(articleHtmlPath), `Pilot article HTML must exist at ${articleHtmlPath}`)
  const html = readFileSync(articleHtmlPath, 'utf8')
  const sitemapXml = readFileSync(join(root, 'public/sitemap.xml'), 'utf8')

  const result = validateArticleHtml(html, {
    slug: 'software-a-medida-o-saas-como-decidir',
    expectedTitle: 'Software a medida o SaaS: cómo decidir según el proceso de tu empresa',
    expectedCanonical: 'https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/',
    sitemapXml,
    httpStatus: 200,
  })

  assert.equal(result.verdict, 'PASS', 'Pilot article HTML must pass all gate checks')
  assert.equal(result.failedChecks.length, 0, 'Must have zero failed checks')

  // Verify key checks passed
  const checkIds = result.checks.map((c) => c.id)
  assert.ok(checkIds.includes('http_200'))
  assert.ok(checkIds.includes('html_substantial'))
  assert.ok(checkIds.includes('no_spa_blank_fallback'))
  assert.ok(checkIds.includes('canonical_tag'))
  assert.ok(checkIds.includes('h1_heading'))
  assert.ok(checkIds.includes('og_title'))
  assert.ok(checkIds.includes('og_url'))
  assert.ok(checkIds.includes('robots_indexable'))
  assert.ok(checkIds.includes('no_draft_banner'))
  assert.ok(checkIds.includes('cta_contact_channel'))
  assert.ok(checkIds.includes('factual_integrity'))
  assert.ok(checkIds.includes('internal_navigation'))
  assert.ok(checkIds.includes('sitemap_inclusion'))
})

test('4. Gate Fail-Closed: Draft articles reject publication handoff', async () => {
  // Test case A: an unapproved backlog topic must remain blocked.
  const draftResult = await runGateCheck({
    slug: 'costo-total-propiedad-licencias-saas-vs-software-a-medida',
    rootPath: root,
    dryRun: true,
  })

  assert.equal(draftResult.ok, false, 'Draft article must fail gate check')
  assert.equal(draftResult.verdict, 'FAIL', 'Draft article must return FAIL verdict')
  assert.equal(draftResult.errorCode, 'ERR_ARTICLE_IN_DRAFT', 'Error code must be ERR_ARTICLE_IN_DRAFT')

  // Test case B: HTML containing draft banner indicator
  const mockDraftHtml = `
    <!doctype html>
    <html>
      <head>
        <title>Test</title>
        <link rel="canonical" href="https://orbitalframeworks.qzz.io/blog/test/">
        <meta property="og:title" content="Test">
        <meta property="og:description" content="Test description for evaluating draft detection">
        <meta property="og:url" content="https://orbitalframeworks.qzz.io/blog/test/">
        <meta property="og:type" content="article">
      </head>
      <body>
        <article class="blogArticleMain">
          <h1>Test Article Title</h1>
          <div class="blogDraftBanner">BORRADOR EN REVISIÓN EDITORIAL [NO PUBLICABLE]</div>
          <p>${'Contenido sustancial '.repeat(200)}</p>
          <a href="/servicios/desarrollo-software-medida/">Servicios</a>
          <a href="/casos/checkio/">Checkio</a>
          <a href="mailto:contact.orbitalframeworks@gmail.com">Contacto</a>
        </article>
      </body>
    </html>
  `

  const draftHtmlResult = validateArticleHtml(mockDraftHtml, {
    slug: 'test',
    expectedTitle: 'Test Article Title',
    expectedCanonical: 'https://orbitalframeworks.qzz.io/blog/test/',
    httpStatus: 200,
  })

  assert.equal(draftHtmlResult.verdict, 'FAIL', 'HTML with draft banner must fail')
  const failed = draftHtmlResult.failedChecks.map((f) => f.id)
  assert.ok(failed.includes('no_draft_banner'), 'Failed checks must include no_draft_banner')
})

test('4b. Failed preflight never creates a pack or mutates manifest even without --dry-run', async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), 'orbital-failed-preflight-'))
  try {
    const manifestPath = join(tempRoot, 'manifest.json')
    const rejected = await runGateCheck({
      rootPath: tempRoot,
      manifestPath,
      slug: 'software-a-medida-o-saas-como-decidir',
      htmlContent: '<html><body>Not the approved article.</body></html>',
      mockStatus: 404,
    })
    assert.equal(rejected.ok, false)
    assert.equal(rejected.errorCode, 'ARTICLE_PREFLIGHT_FAILED')
    assert.equal(rejected.packPath, null)
    assert.equal(existsSync(manifestPath), false)
    assert.equal(existsSync(join(tempRoot, 'docs/linkedin-pilot-handoff-2026-10-17.md')), false)
  } finally {
    rmSync(tempRoot, { recursive: true, force: true })
  }
})

test('5. Gate Fail-Closed: Non-200 HTTP responses & Server errors', () => {
  const validHtml = readFileSync(
    join(distDir, 'blog/software-a-medida-o-saas-como-decidir/index.html'),
    'utf8',
  )

  // 404 Not Found
  const notFoundResult = validateArticleHtml(validHtml, {
    slug: 'software-a-medida-o-saas-como-decidir',
    expectedTitle: 'Software a medida o SaaS: cómo decidir según el proceso de tu empresa',
    httpStatus: 404,
  })
  assert.equal(notFoundResult.verdict, 'FAIL')
  assert.ok(notFoundResult.failedChecks.some((f) => f.id === 'http_200'))

  // 521 Cloudflare Web Server Is Down
  const error521Result = validateArticleHtml(validHtml, {
    slug: 'software-a-medida-o-saas-como-decidir',
    expectedTitle: 'Software a medida o SaaS: cómo decidir según el proceso de tu empresa',
    httpStatus: 521,
  })
  assert.equal(error521Result.verdict, 'FAIL')
  assert.ok(error521Result.failedChecks.some((f) => f.id === 'http_200'))
})

test('6. Gate Fail-Closed: Blank SPA shell fallback detection', () => {
  const spaFallbackHtml = `
    <!doctype html>
    <html lang="es">
      <head>
        <title>Orbital Frameworks</title>
        <link rel="canonical" href="https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/">
        <meta property="og:title" content="Software a medida o SaaS">
        <meta property="og:description" content="Criterios técnicos para evaluar cuándo adoptar SaaS">
        <meta property="og:url" content="https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/">
        <meta property="og:type" content="article">
      </head>
      <body>
        <div id="root"></div>
        <script type="module" src="/src/main.tsx"></script>
      </body>
    </html>
  `

  const result = validateArticleHtml(spaFallbackHtml, {
    slug: 'software-a-medida-o-saas-como-decidir',
    expectedTitle: 'Software a medida o SaaS: cómo decidir según el proceso de tu empresa',
    httpStatus: 200,
  })

  assert.equal(result.verdict, 'FAIL', 'SPA blank root fallback must be rejected')
  const failedIds = result.failedChecks.map((f) => f.id)
  assert.ok(failedIds.includes('html_substantial'), 'Must fail substantial HTML check')
  assert.ok(failedIds.includes('no_spa_blank_fallback'), 'Must fail SPA blank root check')
  assert.ok(failedIds.includes('h1_heading'), 'Must fail H1 heading check')
})

test('7. Gate Fail-Closed: Robots noindex directive detection', () => {
  const noindexHtml = `
    <!doctype html>
    <html>
      <head>
        <title>Software a medida o SaaS: cómo decidir según el proceso de tu empresa</title>
        <link rel="canonical" href="https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/">
        <meta name="robots" content="noindex, nofollow" />
        <meta property="og:title" content="Software a medida o SaaS">
        <meta property="og:description" content="Criterios técnicos para evaluar cuándo adoptar SaaS">
        <meta property="og:url" content="https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/">
        <meta property="og:type" content="article">
      </head>
      <body>
        <article class="blogArticleMain">
          <h1>Software a medida o SaaS: cómo decidir según el proceso de tu empresa</h1>
          <p>${'Contenido indexable de prueba '.repeat(200)}</p>
          <a href="/servicios/desarrollo-software-medida/">Servicios</a>
          <a href="/casos/checkio/">Checkio</a>
          <a href="mailto:contact.orbitalframeworks@gmail.com">Contacto</a>
        </article>
      </body>
    </html>
  `

  const result = validateArticleHtml(noindexHtml, {
    slug: 'software-a-medida-o-saas-como-decidir',
    expectedTitle: 'Software a medida o SaaS: cómo decidir según el proceso de tu empresa',
    httpStatus: 200,
  })

  assert.equal(result.verdict, 'FAIL', 'noindex directive must fail closed')
  assert.ok(result.failedChecks.some((f) => f.id === 'robots_indexable'))
})

test('8. Gate Fail-Closed: Factual integrity (No fake phone numbers or false ROI claims)', () => {
  const fakeClaimHtml = `
    <!doctype html>
    <html>
      <head>
        <title>Software a medida o SaaS</title>
        <link rel="canonical" href="https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/">
        <meta property="og:title" content="Software a medida o SaaS">
        <meta property="og:description" content="Criterios técnicos para evaluar cuándo adoptar SaaS">
        <meta property="og:url" content="https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/">
        <meta property="og:type" content="article">
      </head>
      <body>
        <article class="blogArticleMain">
          <h1>Software a medida o SaaS: cómo decidir según el proceso de tu empresa</h1>
          <p>Llámanos directamente al +51 987654321 y obtén un ahorro del 90% garantizado en tu operación.</p>
          <p>${'Párrafo de relleno '.repeat(200)}</p>
          <a href="/servicios/desarrollo-software-medida/">Servicios</a>
          <a href="/casos/checkio/">Checkio</a>
          <a href="mailto:contact.orbitalframeworks@gmail.com">Contacto</a>
        </article>
      </body>
    </html>
  `

  const result = validateArticleHtml(fakeClaimHtml, {
    slug: 'software-a-medida-o-saas-como-decidir',
    expectedTitle: 'Software a medida o SaaS',
    httpStatus: 200,
  })

  assert.equal(result.verdict, 'FAIL', 'Fake claim and fake phone number must be rejected')
  assert.ok(result.failedChecks.some((f) => f.id === 'factual_integrity'))
})

test('9. HTTP Loopback Mock Server: verifies fetchArticleHttp success, errors and timeout', async () => {
  // Create an ephemeral local HTTP server
  const server = createServer((req, res) => {
    if (req.url === '/ok') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end('<!doctype html><html><body><h1>Mock Success</h1></body></html>')
    } else if (req.url === '/error500') {
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end('Internal Server Error')
    } else if (req.url === '/slow') {
      // Intentionally do not respond quickly to test timeout
      setTimeout(() => {
        res.writeHead(200)
        res.end('slow')
      }, 500)
    } else {
      res.writeHead(404)
      res.end('Not Found')
    }
  })

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address()
  const base = `http://127.0.0.1:${port}`

  try {
    // 1. Success case
    const okRes = await fetchArticleHttp(`${base}/ok`)
    assert.equal(okRes.ok, true)
    assert.equal(okRes.status, 200)
    assert.ok(okRes.body.includes('Mock Success'))

    // 2. HTTP 500 case
    const errRes = await fetchArticleHttp(`${base}/error500`)
    assert.equal(errRes.ok, false)
    assert.equal(errRes.status, 500)

    // 3. Timeout case (fail-closed)
    const timeoutRes = await fetchArticleHttp(`${base}/slow`, { timeoutMs: 50 })
    assert.equal(timeoutRes.ok, false)
    assert.equal(timeoutRes.status, 504)
    assert.ok(timeoutRes.error.includes('Network timeout'))

    // 4. Connection refused (bad port) -> fail-closed
    const badPortRes = await fetchArticleHttp(`http://127.0.0.1:${port + 1}/test`)
    assert.equal(badPortRes.ok, false)
    assert.ok(badPortRes.error.includes('fetch error'))
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

test('10. Manifest and Duplicate Policy: preserves historic post and blocks duplicate distribution', async () => {
  const scratch = mkdtempSync(join(tmpdir(), 'orbital-linkedin-manifest-'))
  const tmpManifestPath = join(scratch, 'test-temp-manifest.json')

  try {
    const manifest = {
      schemaVersion: '1.0.0',
      project: 'orbitalframeworks-landingpage',
      lastUpdated: new Date().toISOString(),
      policy: {
        autopostAllowed: false,
        duplicatePolicy: 'BLOCK_DUPLICATE_DISTRIBUTION',
        historicalPostsImmutable: true,
      },
      historicPosts: HISTORIC_LINKEDIN_POSTS,
      publications: {
        'already-distributed-slug': {
          slug: 'already-distributed-slug',
          campaign: 'camp_distributed',
          status: 'DISTRIBUTED',
          autopostAuthorized: false,
        },
      },
    }

    await saveManifest(tmpManifestPath, manifest)
    const reloaded = loadManifest(tmpManifestPath)
    assert.equal(reloaded.historicPosts.length, 1)
    assert.equal(reloaded.historicPosts[0].urn, 'urn:li:share:7516883410074836992')
    assert.equal(reloaded.historicPosts[0].hasLink, false)
    assert.equal(reloaded.historicPosts[0].policy, 'IMMUTABLE_PRESERVE')

    // Duplicate distribution blocked without --force
    const blockedCheck = checkDuplicatePolicy(
      reloaded,
      'already-distributed-slug',
      'camp_distributed',
      { force: false },
    )
    assert.equal(blockedCheck.allowed, false)
    assert.ok(blockedCheck.reason.includes('DUPLICATE_DISTRIBUTION_BLOCKED'))

    // Allowed with force: true
    const forceCheck = checkDuplicatePolicy(
      reloaded,
      'already-distributed-slug',
      'camp_distributed',
      { force: true },
    )
    assert.equal(forceCheck.allowed, true)
  } finally {
    rmSync(scratch, { recursive: true, force: true })
  }
})

test('11. LinkedIn Handoff Pack Generator: produces verified, zero-token markdown review package', () => {
  const utmUrl =
    'https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/?utm_source=linkedin&utm_medium=organic_social&utm_campaign=pilot_saas_vs_custom'

  const pack = generateLinkedInPack({
    slug: 'software-a-medida-o-saas-como-decidir',
    title: 'Software a medida o SaaS: cómo decidir según el proceso de tu empresa',
    utmUrl,
    campaign: 'pilot_saas_vs_custom',
    gateVerdict: 'PASS',
    date: '2026-10-17',
  })

  // Structure and safety verifications
  assert.ok(pack.includes('LISTO_PARA_DISTRIBUCION_EXTERNA'), 'Status must be LISTO_PARA_DISTRIBUCION_EXTERNA')
  assert.ok(pack.includes('Autopost') && pack.includes('DESHABILITADO'), 'Must state autopost is disabled')
  assert.ok(pack.includes(utmUrl), 'Must contain verified clean UTM URL')
  assert.ok(pack.includes('utm_source`: `linkedin`'), 'Must specify utm_source')
  assert.ok(pack.includes('utm_medium`: `organic_social`'), 'Must specify utm_medium')
  assert.ok(pack.includes('utm_campaign`: `pilot_saas_vs_custom`'), 'Must specify utm_campaign')
  assert.ok(pack.includes('urn:li:share:7516883410074836992'), 'Must cite historic LinkedIn post preservation')
  assert.ok(pack.includes('Google Consent Mode v2'), 'Must mention Consent Mode v2')
  assert.ok(pack.includes('article_to_service'), 'Must mention article_to_service event')
  assert.ok(pack.includes('contact.orbitalframeworks@gmail.com'), 'Must mention official contact email')
  assert.ok(!pack.includes('generate_lead en el navegador'), 'Must forbid browser-side generate_lead')
})

test('12. B2B-02 LinkedIn Pack Generator: produces verified pack with approved copy', () => {
  const utmUrl =
    'https://orbitalframeworks.qzz.io/blog/automatizacion-procesos-vs-excel-riesgo-operativo/?utm_source=linkedin&utm_medium=organic_social&utm_campaign=camp_excel_vs_automation'

  const pack = generateLinkedInPack({
    slug: 'automatizacion-procesos-vs-excel-riesgo-operativo',
    title: 'Automatización de procesos vs hojas de cálculo: cuándo Excel se convierte en un riesgo operativo',
    utmUrl,
    campaign: 'camp_excel_vs_automation',
    gateVerdict: 'PASS',
    date: '2026-10-18',
  })

  assert.ok(pack.includes('LISTO_PARA_DISTRIBUCION_EXTERNA'))
  assert.ok(pack.includes('Autopost') && pack.includes('DESHABILITADO'))
  assert.ok(pack.includes(utmUrl))
  assert.ok(pack.includes('Excel puede funcionar muy bien para analizar datos'))
  assert.ok(pack.includes('camp_excel_vs_automation'))
})

test('13. Local-only gate cannot make an article eligible for external distribution', async () => {
  const scratch = mkdtempSync(join(tmpdir(), 'orbital-local-preflight-'))
  const manifestPath = join(scratch, 'manifest.json')
  const packPath = join(root, 'docs/linkedin-automatizacion-procesos-vs-excel-riesgo-operativo-handoff.md')
  const originalPack = readFileSync(packPath, 'utf8')
  try {
    const result = await runGateCheck({
      slug: 'automatizacion-procesos-vs-excel-riesgo-operativo',
      rootPath: root,
      manifestPath,
      localOnly: true,
      dryRun: false,
    })
    assert.equal(result.ok, true)
    assert.equal(result.verdict, 'LOCAL_ONLY')
    assert.equal(result.externalDistributionAuthorized, false)
    assert.equal(result.packPath, null)
    assert.equal(existsSync(manifestPath), false)
    assert.equal(readFileSync(packPath, 'utf8'), originalPack)
  } finally {
    rmSync(scratch, {recursive: true, force: true})
  }
})
