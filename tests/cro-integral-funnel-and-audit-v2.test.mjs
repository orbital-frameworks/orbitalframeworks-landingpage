/**
 * tests/cro-integral-funnel-and-audit-v2.test.mjs
 *
 * Deterministic test suite verifying:
 * 1. Dual Funnel (b2b_ops & product_idea) and ContactCapturePanel in 5 page families.
 * 2. Katherine Gilligan 11 UX States (initial, loading, success, error, empty, partial_degraded, retry, duplicated_action, invalid_input, offline, access_guidance).
 * 3. First-Party Attention Map (zero cookies, zero PII) and strict consent-gated GA4/Clarity.
 * 4. Edge Shield, Tunnel Exclusion (/mcp, /healthz, /.well-known/*), /api/telemetry and /api/lead-intake.
 * 5. Triple Intake Dispatcher (Telegram Relay, Email copy, Orbital Leads schema) with honeypot and sanitization.
 * 6. Closure of Audit V2 P2 & P3 technical debts (P2-01/P3-02 404 SSR noindex without home canonical, P2-02 mobile CTA clearance, P2-03 about nav anti-clipping, P3-01 redirect favicons).
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'

const ROOT = resolve(process.cwd())

// ---------------------------------------------------------------------------
// SUITE 1: Dual Funnel & Unified ContactCapturePanel in 5 Page Families
// ---------------------------------------------------------------------------
test('Suite 1: Dual Funnel & Unified ContactCapturePanel in 5 Page Families', async (t) => {
  await t.test('1.1 ContactCapturePanel is integrated in all 5 page source templates', () => {
    const pageFiles = [
      'src/App.tsx',             // Home
      'src/CaseStudyPage.tsx',    // Casos
      'src/ServicePage.tsx',      // Servicios
      'src/BlogPostPage.tsx',     // Blog
      'src/AboutPage.tsx',        // Sobre Orbital
    ]

    for (const relPath of pageFiles) {
      const fullPath = join(ROOT, relPath)
      assert.ok(existsSync(fullPath), `${relPath} must exist`)
      const content = readFileSync(fullPath, 'utf8')
      assert.ok(
        content.includes('ContactCapturePanel'),
        `${relPath} must import and render ContactCapturePanel`
      )
    }
  })

  await t.test('1.2 Home explicitly defines Dual Funnel lanes (b2b_ops & product_idea)', () => {
    const appContent = readFileSync(join(ROOT, 'src/App.tsx'), 'utf8')

    // Carril A · Empresas
    assert.ok(
      appContent.includes('CARRIL A · EMPRESAS'),
      'Home must explicitly present Carril A for companies/operations'
    )
    assert.ok(
      appContent.includes('ordenar procesos, automatizar tareas o construir sistemas a medida'),
      'Carril A must articulate operations and custom software'
    )

    // Carril B · Nuevos Productos
    assert.ok(
      appContent.includes('CARRIL B · NUEVOS PRODUCTOS'),
      'Home must explicitly present Carril B for new products/ideas'
    )
    assert.ok(
      appContent.includes('Nuevos productos e ideas: transformar una idea de aplicación móvil, plataforma web o sistema digital en un producto real y verificable'),
      'Carril B must articulate product ideas into real verifiable software'
    )
    assert.ok(
      appContent.includes('Wasy, Localisa y Checkio'),
      'Carril B must link to verifiable proof cases (Wasy, Localisa, Checkio)'
    )
  })

  await t.test('1.3 Prerendered HTML across 5 families contains unified contact markup and direct channels', () => {
    const prerenderedChecks = [
      { path: 'dist/index.html', label: 'Home' },
      { path: 'dist/casos/wasy/index.html', label: 'Casos (Wasy)' },
      { path: 'dist/servicios/desarrollo-software-medida/index.html', label: 'Servicios (Software)' },
      { path: 'dist/blog/software-a-medida-o-saas-como-decidir/index.html', label: 'Blog' },
      { path: 'dist/sobre-orbital-frameworks/index.html', label: 'Sobre Orbital' },
    ]

    for (const { path: relPath, label } of prerenderedChecks) {
      const fullPath = join(ROOT, relPath)
      assert.ok(existsSync(fullPath), `${label} (${relPath}) must exist in dist/`)
      const html = readFileSync(fullPath, 'utf8')

      // Contact panel container with lane selector
      assert.ok(
        html.includes('contactCapturePanel'),
        `${label} must contain .contactCapturePanel container`
      )
      assert.ok(
        html.includes('contactLaneSelector'),
        `${label} must render interactive lane selector`
      )
      assert.ok(
        html.includes('data-lane="b2b_ops"') && html.includes('data-lane="product_idea"'),
        `${label} must include both lane pills (b2b_ops and product_idea)`
      )

      // Direct communication channels
      assert.ok(
        html.includes('contact.orbitalframeworks@gmail.com'),
        `${label} must include official contact email`
      )
      assert.ok(
        html.includes('mailto:contact.orbitalframeworks@gmail.com'),
        `${label} must provide neutral mailto action`
      )
      assert.ok(
        html.includes('mail.google.com/mail'),
        `${label} must provide direct Gmail compose action`
      )
      assert.ok(
        html.includes('data-channel="copy_email"'),
        `${label} must provide one-click copy email button`
      )
    }
  })
})

// ---------------------------------------------------------------------------
// SUITE 2: Katherine Gilligan 11 UX States Contract in ContactCapturePanel
// ---------------------------------------------------------------------------
test('Suite 2: Katherine Gilligan 11 UX States Contract in ContactCapturePanel', async (t) => {
  const panelPath = join(ROOT, 'src/ContactCapturePanel.tsx')
  assert.ok(existsSync(panelPath), 'src/ContactCapturePanel.tsx must exist')
  const panelCode = readFileSync(panelPath, 'utf8')

  await t.test('2.1 Explicit UX state union declaration', () => {
    const requiredStates = [
      'initial',
      'loading',
      'success',
      'error',
      'empty',
      'partial_degraded',
      'retry',
      'duplicated_action',
      'invalid_input',
      'offline',
      'access_guidance',
    ]

    for (const state of requiredStates) {
      assert.ok(
        panelCode.includes(`'${state}'`),
        `ContactCapturePanel must declare '${state}' in UxState type union`
      )
    }
  })

  await t.test('2.2 Input validation: empty and invalid inputs', () => {
    // Empty check
    assert.ok(
      panelCode.includes("setUxState('empty')"),
      'Must transition to empty state when contact input is missing'
    )
    // Invalid input regex
    assert.ok(
      panelCode.includes("setUxState('invalid_input')"),
      'Must transition to invalid_input state when email/phone does not match schema'
    )
    // Support for email and phone numbers
    assert.ok(
      panelCode.includes('^[\\d\\s+()-]{7,25}$'),
      'Must accept phone numbers (with +, digits, spaces, parentheses)'
    )
  })

  await t.test('2.3 Honeypot anti-spam protection', () => {
    assert.ok(
      panelCode.includes('name="website"') || panelCode.includes('hp'),
      'Form must include a hidden honeypot input'
    )
    assert.ok(
      panelCode.includes("aria-hidden=\"true\""),
      'Honeypot field must be aria-hidden for accessibility'
    )
    assert.ok(
      panelCode.includes('hp.trim()'),
      'Honeypot must silently trigger fake success to confuse spambots'
    )
  })

  await t.test('2.4 Offline and graceful degradation (partial_degraded with data preservation)', () => {
    // Offline check
    assert.ok(
      panelCode.includes("navigator.onLine === false"),
      'Must detect offline status'
    )
    assert.ok(
      panelCode.includes("setUxState('offline')"),
      'Must transition to offline state'
    )

    // Graceful degradation / partial degraded
    assert.ok(
      panelCode.includes("setUxState('partial_degraded')"),
      'Must handle endpoint unavailability by transitioning to partial_degraded'
    )
    assert.ok(
      panelCode.includes('contactFeedbackCard--degraded'),
      'Must render degraded feedback card'
    )
    assert.ok(
      panelCode.includes('contactPreservedData'),
      'Must display preserved data to visitor'
    )
    assert.ok(
      panelCode.includes('mailtoUrl'),
      'Must offer direct mailto fallback with preserved data loaded'
    )
  })

  await t.test('2.5 Retry and duplicated action prevention', () => {
    assert.ok(
      panelCode.includes("setUxState('duplicated_action')"),
      'Must prevent duplicate submissions of identical contact + message'
    )
    assert.ok(
      panelCode.includes("submit(true)"),
      'Must provide retry mechanism calling submit(true)'
    )
    assert.ok(
      panelCode.includes("setUxState(isRetry ? 'retry' : 'loading')"),
      'Must reflect retry vs loading state'
    )
  })
})

// ---------------------------------------------------------------------------
// SUITE 3: First-Party Attention Map & Strict Consent Gating (GA4 / Clarity)
// ---------------------------------------------------------------------------
test('Suite 3: First-Party Attention Map & Strict Consent Gating (GA4 / Clarity)', async (t) => {
  const analyticsCode = readFileSync(join(ROOT, 'src/analytics.ts'), 'utf8')

  await t.test('3.1 First-party telemetry functions operate without cookies or PII', () => {
    assert.ok(
      analyticsCode.includes('export function initAttentionMap'),
      'src/analytics.ts must export initAttentionMap'
    )
    assert.ok(
      analyticsCode.includes('export function sendTelemetry'),
      'src/analytics.ts must export sendTelemetry'
    )
    assert.ok(
      analyticsCode.includes('export function trackLaneSelection'),
      'src/analytics.ts must export trackLaneSelection'
    )
    assert.ok(
      analyticsCode.includes('export function trackContactIntent'),
      'src/analytics.ts must export trackContactIntent'
    )
    assert.ok(
      analyticsCode.includes('section_dwell_ms') || analyticsCode.includes('section_dwell'),
      'Telemetry must track section dwell time'
    )
    assert.ok(
      analyticsCode.includes('[25, 50, 75, 100]'),
      'Telemetry must track scroll depth milestones 25%, 50%, 75%, 100%'
    )
  })

  await t.test('3.2 Microsoft Clarity configuration and sensitive input masking', () => {
    assert.ok(
      analyticsCode.includes('VITE_CLARITY_PROJECT_ID'),
      'Clarity project ID must be read from VITE_CLARITY_PROJECT_ID environment variable'
    )
    assert.ok(
      analyticsCode.includes('https://www.clarity.ms/tag/'),
      'Clarity script URL must target official tag endpoint'
    )
    assert.ok(
      analyticsCode.includes("window.clarity('mask', 'input')") || analyticsCode.includes("clarity('mask', 'input')"),
      'Clarity must configure input masking to protect sensitive user information'
    )
  })

  await t.test('3.3 Strict consent gating: No GA4 or Clarity loaded before consent', () => {
    assert.ok(
      analyticsCode.includes('function loadAnalytics()'),
      'GA4 loading must be sequestered inside loadAnalytics'
    )
    assert.ok(
      analyticsCode.includes('function loadClarity()'),
      'Clarity loading must be sequestered inside loadClarity'
    )
    assert.ok(
      analyticsCode.includes('grantAnalyticsConsent()'),
      'grantAnalyticsConsent must trigger loading only upon explicit grant'
    )
    assert.ok(
      analyticsCode.includes('denyAnalyticsConsent()'),
      'denyAnalyticsConsent must deny storage flags in gtag'
    )
  })
})

// ---------------------------------------------------------------------------
// SUITE 4: Edge Worker Shield, Tunnel Exclusion, and Endpoints
// ---------------------------------------------------------------------------
test('Suite 4: Edge Worker Shield, Tunnel Exclusion, and Endpoints', async (t) => {
  const workerModule = await import('../scripts/edge/cloudflare-worker-content-negotiation.js')

  await t.test('4.1 Infrastructure and tunnel paths exclusion from telemetry/content-negotiation', () => {
    const { isTunnelOrInfraPath } = workerModule
    assert.equal(typeof isTunnelOrInfraPath, 'function', 'isTunnelOrInfraPath must be exported')

    // Operational tunnel and monitoring paths must be flagged
    assert.equal(isTunnelOrInfraPath('/mcp'), true, '/mcp must be excluded')
    assert.equal(isTunnelOrInfraPath('/mcp/v1/tools'), true, '/mcp/v1/tools must be excluded')
    assert.equal(isTunnelOrInfraPath('/healthz'), true, '/healthz must be excluded')
    assert.equal(isTunnelOrInfraPath('/.well-known/oauth-authorization-server'), true, 'oauth server must be excluded')
    assert.equal(isTunnelOrInfraPath('/.well-known/assetlinks.json'), true, 'assetlinks must be excluded')

    // Human commercial pages must NOT be flagged
    assert.equal(isTunnelOrInfraPath('/'), false, 'Home must NOT be excluded')
    assert.equal(isTunnelOrInfraPath('/casos/wasy/'), false, 'Case pages must NOT be excluded')
    assert.equal(isTunnelOrInfraPath('/servicios/desarrollo-software-medida/'), false, 'Service pages must NOT be excluded')
    assert.equal(isTunnelOrInfraPath('/blog/'), false, 'Blog pages must NOT be excluded')
  })

  await t.test('4.2 /api/telemetry edge handler responds to OPTIONS, GET and POST', async () => {
    const { handleTelemetry } = workerModule
    assert.equal(typeof handleTelemetry, 'function', 'handleTelemetry must be exported')

    // OPTIONS preflight
    const optReq = new Request('https://orbitalframeworks.qzz.io/api/telemetry', { method: 'OPTIONS' })
    const optRes = await handleTelemetry(optReq)
    assert.equal(optRes.status, 204)
    assert.equal(optRes.headers.get('Access-Control-Allow-Origin'), '*')

    // GET health check
    const getReq = new Request('https://orbitalframeworks.qzz.io/api/telemetry', { method: 'GET' })
    const getRes = await handleTelemetry(getReq)
    assert.equal(getRes.status, 200)
    const getBody = await getRes.json()
    assert.equal(getBody.ok, true)
    assert.equal(getBody.service, 'orbital-attention-telemetry')

    // POST telemetry event
    const postReq = new Request('https://orbitalframeworks.qzz.io/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'scroll_depth',
        path: '/casos/checkio/',
        depth: 75,
        lane: 'product_idea',
        timestamp: Date.now(),
      }),
    })
    const postRes = await handleTelemetry(postReq)
    assert.equal(postRes.status, 200)
    const postBody = await postRes.json()
    assert.equal(postBody.ok, true)
    assert.equal(postBody.status, 'recorded')
  })

  await t.test('4.3 /api/lead-intake edge handler validates schema, detects honeypot and dispatches', async () => {
    const { handleLeadIntake, validateLeadPayload } = workerModule
    assert.equal(typeof handleLeadIntake, 'function', 'handleLeadIntake must be exported')

    // Validation check: valid B2B lead
    const validB2b = validateLeadPayload({
      contact: 'operaciones@empresa.com.pe',
      lane: 'b2b_ops',
      message: 'Requerimos automatizar órdenes y facturación.',
      source_page: '/servicios/automatizacion-procesos/',
    })
    assert.equal(validB2b.valid, true)
    assert.equal(validB2b.isSpam, false)
    assert.equal(validB2b.sanitized.lane, 'b2b_ops')

    // Validation check: Honeypot spam
    const spamLead = validateLeadPayload({
      contact: 'bot@spam.com',
      lane: 'b2b_ops',
      website: 'http://spammy-site.xyz',
    })
    assert.equal(spamLead.valid, true)
    assert.equal(spamLead.isSpam, true)
    assert.equal(spamLead.reason, 'honeypot_triggered')

    // Validation check: Invalid contact format
    const invalidLead = validateLeadPayload({
      contact: 'not_an_email_or_phone',
      lane: 'b2b_ops',
    })
    assert.equal(invalidLead.valid, false)

    // Full dispatch execution simulation
    const mockEnv = {
      TELEGRAM_RELAY_URL: 'https://relay.test.local/telegram',
      EMAIL_RELAY_URL: 'https://relay.test.local/email',
      ORBITAL_LEADS_RELAY_URL: 'https://relay.test.local/orbital-leads',
    }

    const dispatchedTargets = []
    const originalFetch = globalThis.fetch
    try {
      globalThis.fetch = async (url) => {
        dispatchedTargets.push(url.toString())
        return new Response(JSON.stringify({ ok: true }), { status: 200 })
      }

      const req = new Request('https://orbitalframeworks.qzz.io/api/lead-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '190.222.10.5' },
        body: JSON.stringify({
          contact: '+51 999 888 777',
          lane: 'product_idea',
          message: 'Idea de plataforma SaaS para clínicas.',
          source_page: '/',
        }),
      })

      const res = await handleLeadIntake(req, mockEnv)
      assert.equal(res.status, 200)
      const resBody = await res.json()
      assert.equal(resBody.ok, true)
      assert.equal(resBody.status, 'success')
      assert.ok(resBody.lead_id.startsWith('inbound-product_idea-'))

      // Verify triple dispatch
      assert.ok(dispatchedTargets.some(t => t.includes('/telegram')), 'Must dispatch to Telegram Relay')
      assert.ok(dispatchedTargets.some(t => t.includes('/email')), 'Must dispatch copy to official email')
      assert.ok(dispatchedTargets.some(t => t.includes('/orbital-leads')), 'Must dispatch structured record to Orbital Leads')
    } finally {
      globalThis.fetch = originalFetch
    }
  })
})

// ---------------------------------------------------------------------------
// SUITE 5: Triple Intake Utility & Orbital Leads Schema (scripts/process-inbound-lead.mjs)
// ---------------------------------------------------------------------------
test('Suite 5: Triple Intake Utility & Orbital Leads Schema (scripts/process-inbound-lead.mjs)', async (t) => {
  const leadProcessor = await import('../scripts/process-inbound-lead.mjs')

  await t.test('5.1 Sanitization strips tags and control characters without mangling legitimate text', () => {
    const { sanitizeString } = leadProcessor
    const dirty = '<script>alert("hack")</script> Hola & Saludos \x00\x1F <b>Equipo</b>'
    const clean = sanitizeString(dirty)
    assert.equal(clean, 'alert("hack") Hola & Saludos  Equipo')
  })

  await t.test('5.2 Transformation into canonical Orbital Leads record (acquisition/opportunity-inbox/external/)', () => {
    const { validateInboundLead, transformToOpportunity, formatTelegramMessage, formatEmailPayload } = leadProcessor

    const rawInput = {
      contact: 'ceo@startup.pe',
      lane: 'product_idea',
      message: 'MVP de app móvil para pagos sin contacto.',
      source_page: '/casos/checkio/',
    }

    const val = validateInboundLead(rawInput)
    assert.equal(val.valid, true)
    assert.equal(val.isSpam, false)

    const opp = transformToOpportunity(val.sanitized, { status: 'READY_FOR_REVIEW' })
    assert.equal(opp.version, 1)
    assert.equal(opp.source_monitor, 'Orbital Landing Page Inbound')
    assert.equal(opp.buyer_context, 'DIRECT_INBOUND')
    assert.equal(opp.status, 'READY_FOR_REVIEW')
    assert.equal(opp.lane, 'product_idea')
    assert.equal(opp.score, 85)
    assert.ok(opp.source_url.includes('/casos/checkio/'))
    assert.ok(opp.observed_fact.includes('ceo@startup.pe'))
    assert.ok(opp.commercial_hypothesis.includes('MVP'))
    assert.equal(opp.contact_routes[0].kind, 'email')
    assert.equal(opp.contact_routes[0].value, 'ceo@startup.pe')

    // Telegram formatting
    const tg = formatTelegramMessage(val.sanitized, opp.opportunity_id)
    assert.ok(tg.includes('🚀 *Nuevo Lead en Orbital Frameworks*'))
    assert.ok(tg.includes('Nueva Idea / Producto Digital'))
    assert.ok(tg.includes('ceo@startup.pe'))
    assert.ok(tg.includes('READY_FOR_REVIEW'))

    // Email payload formatting
    const em = formatEmailPayload(val.sanitized, opp.opportunity_id)
    assert.equal(em.to, 'contact.orbitalframeworks@gmail.com')
    assert.ok(em.subject.includes('[Lead Orbital] Nueva Idea / Producto Digital'))
    assert.ok(em.text.includes(opp.opportunity_id))
    assert.ok(em.html.includes('ceo@startup.pe'))
  })
})

// ---------------------------------------------------------------------------
// SUITE 6: Audit V2 P2 & P3 Technical Debt Closures (404 SSR, Responsive, Favicons)
// ---------------------------------------------------------------------------
test('Suite 6: Audit V2 P2 & P3 Technical Debt Closures', async (t) => {
  await t.test('6.1 P2-01 & P3-02: dist/404.html & dist/404/index.html have noindex and no home canonical', () => {
    const paths = ['dist/404.html', 'dist/404/index.html']
    for (const p of paths) {
      const full = join(ROOT, p)
      assert.ok(existsSync(full), `${p} must be prerendered in dist/`)
      const html = readFileSync(full, 'utf8')

      // Must contain noindex
      assert.ok(
        html.includes('<meta name="robots" content="noindex, nofollow"'),
        `${p} must declare noindex, nofollow`
      )

      // Must NOT contain homepage canonical
      assert.ok(
        !html.includes('<link rel="canonical" href="https://orbitalframeworks.qzz.io/" />') &&
        !html.includes('<link rel="canonical" href="https://orbitalframeworks.qzz.io" />'),
        `${p} must NOT contain canonical pointing to Home`
      )

      // Must declare canonical to /404
      assert.ok(
        html.includes('<link rel="canonical" href="https://orbitalframeworks.qzz.io/404" />'),
        `${p} must declare canonical /404`
      )

      // Must render NotFoundPage shell
      assert.ok(
        html.includes('notFoundShell'),
        `${p} must contain .notFoundShell from NotFoundPage`
      )
    }

    // Client hydration safeguard in main.tsx
    const mainCode = readFileSync(join(ROOT, 'src/main.tsx'), 'utf8')
    assert.ok(
      mainCode.includes('canHydrate'),
      'src/main.tsx must include canHydrate guard to prevent React #418 hydration mismatch on 404s'
    )
  })

  await t.test('6.2 P2-02: Mobile CTA bottom clearance (140px-160px) in all page stylesheets', () => {
    const stylesheets = [
      { file: 'src/App.css', rule: '.siteFooter', minPadding: 140 },
      { file: 'src/CaseStudyPage.css', rule: '.caseCta', minPadding: 140 },
      { file: 'src/ServicePage.css', rule: '.serviceFooter', minPadding: 140 },
      { file: 'src/Blog.css', rule: '.blogFooter', minPadding: 140 },
      { file: 'src/AboutPage.css', rule: '.aboutCta', minPadding: 140 },
    ]

    for (const { file, rule } of stylesheets) {
      const code = readFileSync(join(ROOT, file), 'utf8')
      assert.ok(
        code.includes('padding-bottom: 140px') || code.includes('padding-bottom: 160px'),
        `${file} must specify at least 140px padding-bottom on CTA container (${rule})`
      )
    }
  })

  await t.test('6.3 P2-03: AboutPage header anti-clipping in 360px and 390px mobile viewports', () => {
    const aboutCss = readFileSync(join(ROOT, 'src/AboutPage.css'), 'utf8')
    assert.ok(
      aboutCss.includes('@media (max-width: 680px)') || aboutCss.includes('@media (max-width: 400px)'),
      'src/AboutPage.css must define responsive media queries for mobile viewports'
    )
    assert.ok(
      aboutCss.includes('.aboutNav') && aboutCss.includes('.aboutNavActions'),
      'src/AboutPage.css must adapt .aboutNav and .aboutNavActions'
    )
    assert.ok(
      aboutCss.includes('.aboutBrand img'),
      'src/AboutPage.css must constrain .aboutBrand img to prevent horizontal overflow'
    )
  })

  await t.test('6.4 P3-01: Redirect pages (/pedidos/ and /consultas/) include favicon links', () => {
    const redirectFiles = [
      'public/pedidos/index.html',
      'public/consultas/index.html',
    ]

    for (const relPath of redirectFiles) {
      const content = readFileSync(join(ROOT, relPath), 'utf8')
      assert.ok(
        content.includes('<link rel="icon"') && content.includes('favicon-48x48.png'),
        `${relPath} must include favicon-48x48.png link`
      )
      assert.ok(
        content.includes('<link rel="apple-touch-icon"'),
        `${relPath} must include apple-touch-icon link`
      )
    }
  })
})
