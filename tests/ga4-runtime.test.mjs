import test from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createNegotiationServer } from '../scripts/serve-negotiation.mjs'

function findChrome() {
  for (const bin of ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser']) {
    if (existsSync(bin)) return bin
  }
  return null
}

test('GA4 browser runtime contract with an emulated official loader', async (t) => {
  const chromeBin = findChrome()
  if (!chromeBin) {
    t.skip('Chrome binary not found in environment; skipping browser-level CDP test')
    return
  }

  const serverRoot = process.env.DIST_DIR ? resolve(process.cwd(), process.env.DIST_DIR) : process.cwd()
  const server = createNegotiationServer({ rootDir: serverRoot })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const serverPort = server.address().port
  const origin = `http://127.0.0.1:${serverPort}`

  const cdpPort = await new Promise((resolvePort, reject) => {
    const probe = createServer()
    probe.once('error', reject)
    probe.listen(0, '127.0.0.1', () => {
      const port = probe.address().port
      probe.close((error) => error ? reject(error) : resolvePort(port))
    })
  })
  const tmpBase = existsSync('/tmp') ? '/tmp' : tmpdir()
  const chromeProfile = mkdtempSync(join(tmpBase, 'orbital-ga4-chrome-'))
  const chrome = spawn(chromeBin, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-breakpad',
    '--disable-crash-reporter',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${chromeProfile}`,
    `--remote-debugging-port=${cdpPort}`,
    `${origin}/`,
  ], { stdio: ['ignore', 'ignore', 'pipe'] })
  let chromeStderr = ''
  chrome.stderr.on('data', (chunk) => {
    chromeStderr = (chromeStderr + String(chunk)).slice(-4000)
  })

  let ws
  try {
    // Wait for CDP to become ready
    let targetPage = null
    // GitHub-hosted runners can need several seconds to start Chrome/CDP
    // after installing dependencies. Wait for the actual browser target.
    for (let i = 0; i < 80; i++) {
      await new Promise((r) => setTimeout(r, 200))
      try {
        const res = await fetch(`http://127.0.0.1:${cdpPort}/json/list`)
        const pages = await res.json()
        targetPage = pages.find((p) => p.type === 'page'
          && p.webSocketDebuggerUrl && p.url.includes(String(serverPort)))
        if (targetPage?.webSocketDebuggerUrl) break
      } catch {
        // Retry
      }
      if (chrome.exitCode !== null) break
    }

    assert.ok(targetPage?.webSocketDebuggerUrl,
      `Chrome page target must be reachable via CDP (exit=${chrome.exitCode ?? 'running'}; stderr=${chromeStderr})`)

    ws = new WebSocket(targetPage.webSocketDebuggerUrl)
    await new Promise((resolve, reject) => {
      ws.onopen = resolve
      ws.onerror = reject
    })

    let idSeq = 1
    const pending = new Map()
    const networkRequests = []
    const interceptedGCollect = []

    ws.addEventListener('message', async (evt) => {
      const msg = JSON.parse(evt.data)
      if (msg.id && pending.has(msg.id)) {
        const { resolve } = pending.get(msg.id)
        pending.delete(msg.id)
        resolve(msg.result)
        return
      }

      if (msg.method === 'Network.requestWillBeSent') {
        networkRequests.push(msg.params.request)
      }

      if (msg.method === 'Fetch.requestPaused') {
        const { requestId, request } = msg.params
        if (request.url.includes('googletagmanager.com/gtag/js')) {
          // This test isolates app behavior from Google's network. Production QA must
          // separately verify the authentic gtag.js and Google ingestion endpoints.
          const emulatedGtagScript = `
            (function() {
              let processed = 0;
              function drainDataLayer() {
                if (!window.dataLayer) return;
                while (processed < window.dataLayer.length) {
                  const item = window.dataLayer[processed++];
                  if (item && item[0] === 'event') {
                    const eventName = item[1];
                    const params = item[2] || {};
                    const url = new URL('https://www.google-analytics.com/g/collect');
                    url.searchParams.set('v', '2');
                    url.searchParams.set('tid', 'G-487MJFCW45');
                    url.searchParams.set('en', eventName);
                    for (const [k, v] of Object.entries(params)) {
                      if (v !== undefined) url.searchParams.set('ep.' + k, String(v));
                    }
                    fetch(url.toString(), { mode: 'no-cors' }).catch(() => {});
                  }
                }
              }
              drainDataLayer();
              const orig = window.dataLayer.push;
              window.dataLayer.push = function() {
                const res = orig.apply(this, arguments);
                drainDataLayer();
                return res;
              };
            })();
          `
          await sendCdp('Fetch.fulfillRequest', {
            requestId,
            responseCode: 200,
            responseHeaders: [{ name: 'Content-Type', value: 'application/javascript' }],
            body: Buffer.from(emulatedGtagScript).toString('base64'),
          })
        } else if (request.url.includes('google-analytics.com/g/collect')) {
          interceptedGCollect.push(request.url)
          await sendCdp('Fetch.fulfillRequest', {
            requestId,
            responseCode: 204,
            responseHeaders: [{ name: 'Access-Control-Allow-Origin', value: '*' }],
          })
        } else {
          await sendCdp('Fetch.continueRequest', { requestId })
        }
      }
    })

    const sendCdp = (method, params = {}) =>
      new Promise((resolve) => {
        const id = idSeq++
        pending.set(id, { resolve })
        ws.send(JSON.stringify({ id, method, params }))
      })

    const evalInPage = async (expression) => {
      const r = await sendCdp('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true,
      })
      return r.result?.value
    }

    const waitForPage = async (expression, message) => {
      for (let attempt = 0; attempt < 30; attempt += 1) {
        if (await evalInPage(expression)) return
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
      assert.fail(message)
    }

    await sendCdp('Network.enable')
    await sendCdp('Page.enable')
    await sendCdp('Fetch.enable', {
      patterns: [
        { urlPattern: '*googletagmanager.com*' },
        { urlPattern: '*google-analytics.com*' },
      ],
    })

    // ---------------------------------------------------------
    // Phase 1: Unconsented default state
    // ---------------------------------------------------------
    await evalInPage('localStorage.clear()')
    await sendCdp('Page.reload')
    await waitForPage('!!document.querySelector(".analyticsConsent")', 'Analytics consent banner must be visible')

    const initialScript = await evalInPage('!!document.querySelector("script[data-ga4-id]")')
    assert.equal(initialScript, false, 'No GA4 script tag before consent')

    const dlCount = await evalInPage('window.dataLayer?.length || 0')
    assert.ok(dlCount >= 2, 'Default consent and configuration must be present in dataLayer')

    const dlDefaultConsent = await evalInPage('Array.from(window.dataLayer[0])')
    assert.equal(dlDefaultConsent[0], 'consent')
    assert.equal(dlDefaultConsent[1], 'default')
    assert.equal(dlDefaultConsent[2].analytics_storage, 'denied')
    assert.equal(dlDefaultConsent[2].ad_storage, 'denied')
    assert.equal(dlDefaultConsent[2].ad_user_data, 'denied')
    assert.equal(dlDefaultConsent[2].ad_personalization, 'denied')

    const dlSignals = await evalInPage('Array.from(window.dataLayer[1])')
    assert.equal(dlSignals[0], 'set')
    assert.equal(dlSignals[1].allow_google_signals, false)
    assert.equal(dlSignals[1].restricted_data_processing, true)

    const isArgsObj = await evalInPage('Object.prototype.toString.call(window.dataLayer[0])')
    assert.equal(isArgsObj, '[object Arguments]', 'dataLayer entries must be Arguments objects, not arrays')

    assert.equal(interceptedGCollect.length, 0, 'No /g/collect request before consent')

    // ---------------------------------------------------------
    // Phase 2: Rejection of consent
    // ---------------------------------------------------------
    await evalInPage('document.querySelectorAll(".analyticsConsent button")[0].click()')
    await new Promise((r) => setTimeout(r, 300))

    const storedConsentDeny = await evalInPage('localStorage.getItem("orbital-analytics-consent")')
    assert.equal(storedConsentDeny, 'denied', 'Denying consent must persist "denied" in localStorage')

    const scriptAfterDeny = await evalInPage('!!document.querySelector("script[data-ga4-id]")')
    assert.equal(scriptAfterDeny, false, 'No GA4 script tag injected after denying consent')

    assert.equal(interceptedGCollect.length, 0, 'No /g/collect request after rejection')

    // ---------------------------------------------------------
    // Phase 3: Granting consent
    // ---------------------------------------------------------
    await evalInPage('localStorage.clear()')
    await sendCdp('Page.reload')
    await waitForPage('document.querySelectorAll(".analyticsConsent button").length === 2', 'Analytics consent controls must be ready')

    // Click "Aceptar analítica"
    await evalInPage('document.querySelectorAll(".analyticsConsent button")[1].click()')
    await new Promise((r) => setTimeout(r, 600))

    const storedConsentGrant = await evalInPage('localStorage.getItem("orbital-analytics-consent")')
    assert.equal(storedConsentGrant, 'granted', 'Accepting consent must persist "granted" in localStorage')

    const scriptTagCount = await evalInPage('document.querySelectorAll("script[data-ga4-id]").length')
    assert.equal(scriptTagCount, 1, 'Exactly ONE GA4 script tag must be injected')

    const scriptSrc = await evalInPage('document.querySelector("script[data-ga4-id]").src')
    assert.ok(scriptSrc.includes('id=G-487MJFCW45'), 'Script src must target measurement ID G-487MJFCW45')

    // Check dataLayer events after accept
    const dlTotal = await evalInPage('window.dataLayer.length')
    assert.ok(dlTotal >= 5, 'dataLayer must contain consent update, js, config, and page_view')

    // Verify g/collect emission for page_view
    assert.ok(interceptedGCollect.length >= 1, 'At least one /g/collect request emitted after accepting')
    const pageViewCollect = interceptedGCollect.find((u) => u.includes('en=page_view'))
    assert.ok(pageViewCollect, 'google-analytics.com/g/collect received en=page_view')
    assert.ok(pageViewCollect.includes('tid=G-487MJFCW45'), 'g/collect carries stream ID G-487MJFCW45')
    assert.ok(pageViewCollect.includes('ep.page_path=%2F'), 'g/collect carries page_path=/')

    // ---------------------------------------------------------
    // Phase 4: Contact intent (email copy with fallback)
    // ---------------------------------------------------------
    const beforeCopyLen = interceptedGCollect.length
    await evalInPage(`
      if (navigator.clipboard) {
        navigator.clipboard.writeText = () => Promise.resolve()
      }
      const btn = document.querySelector("button[data-analytics-action='copy_email']") || document.querySelectorAll("button")[2]
      btn?.click()
    `)
    await new Promise((r) => setTimeout(r, 400))

    const copyIntentCollect = interceptedGCollect.slice(beforeCopyLen).find((u) => u.includes('en=contact_intent'))
    assert.ok(copyIntentCollect, 'Emitted contact_intent on email copy action')
    assert.ok(copyIntentCollect.includes('ep.method=copy_email'), 'contact_intent method is copy_email')
    assert.ok(copyIntentCollect.includes('ep.contact_channel=clipboard'), 'contact_channel is clipboard')

    // Confirm generate_lead is NEVER emitted
    const anyLead = interceptedGCollect.some((u) => u.includes('en=generate_lead'))
    assert.equal(anyLead, false, 'Never emit generate_lead on unconfirmed interactions')

    // ---------------------------------------------------------
    // Phase 5: Contact intent (mailto anchor click)
    // ---------------------------------------------------------
    const beforeMailtoLen = interceptedGCollect.length
    await evalInPage(`
      document.querySelector('a[href^="mailto:"]').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    `)
    await new Promise((r) => setTimeout(r, 400))

    const mailtoIntentCollect = interceptedGCollect.slice(beforeMailtoLen).find((u) => u.includes('en=contact_intent'))
    assert.ok(mailtoIntentCollect, 'Emitted contact_intent on mailto link click')
    assert.ok(mailtoIntentCollect.includes('ep.method=email'), 'contact_intent method is email')
    assert.ok(mailtoIntentCollect.includes('ep.contact_channel=mailto'), 'contact_channel is mailto')

    // ---------------------------------------------------------
    // Phase 6: Contact intent (Gmail compose anchor click)
    // ---------------------------------------------------------
    const beforeGmailLen = interceptedGCollect.length
    await evalInPage(`
      document.querySelector('a[href^="https://mail.google.com/"]').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    `)
    await new Promise((r) => setTimeout(r, 400))

    const gmailIntentCollect = interceptedGCollect.slice(beforeGmailLen).find((u) => u.includes('en=contact_intent'))
    assert.ok(gmailIntentCollect, 'Emitted contact_intent on Gmail compose link click')
    assert.ok(gmailIntentCollect.includes('ep.method=gmail'), 'contact_intent method is gmail')
    assert.ok(gmailIntentCollect.includes('ep.contact_channel=gmail_compose'), 'contact_channel is gmail_compose')

    // ---------------------------------------------------------
    // Phase 7: All dataLayer entries are Arguments objects
    // ---------------------------------------------------------
    const dlItemsCount = await evalInPage('window.dataLayer.length')
    for (let i = 0; i < dlItemsCount; i++) {
      const typeStr = await evalInPage(`Object.prototype.toString.call(window.dataLayer[${i}])`)
      assert.equal(typeStr, '[object Arguments]', `window.dataLayer[${i}] must be Arguments object`)
    }

    // ---------------------------------------------------------
    // Phase 8: Explicit distinction: Mock loader vs Authentic Script
    // ---------------------------------------------------------
    // Synthetic tests verify the client-side injection contract, arguments structure,
    // and network request composition without claiming backend Google Analytics reception.
    // Authentic end-to-end ingestion requires live platform access (ACCOUNT_ACCESS_GATE).
    assert.ok(interceptedGCollect.length >= 4, 'Synthetic test intercepted expected /g/collect emissions')
    for (const collectUrl of interceptedGCollect) {
      assert.ok(collectUrl.startsWith('https://www.google-analytics.com/g/collect'), 'Emitted request targets official GA4 endpoint')
      assert.ok(collectUrl.includes('tid=G-487MJFCW45'), 'Emitted request targets approved stream ID')
    }

    // ---------------------------------------------------------
    // Phase 9: Funnel navigation (article -> service -> contact) & PII sanitization
    // ---------------------------------------------------------
    // Journey 1: Article with UTM -> Service link -> Contact
    const beforeFunnelLen = interceptedGCollect.length
    await sendCdp('Page.navigate', {
      url: `${origin}/blog/software-a-medida-o-saas-como-decidir/?utm_source=linkedin&utm_medium=organic_social&utm_campaign=pilot_saas_vs_custom&email=ceo%40empresa.pe`,
    })
    await waitForPage('!!document.querySelector(".blogArticleMain")', 'Blog article page must be loaded')
    await new Promise((r) => setTimeout(r, 400))

    // 9a. Verify page_view on article retains UTM parameters but strips PII (email)
    const articlePageView = interceptedGCollect.slice(beforeFunnelLen).find(
      (u) => u.includes('en=page_view') && u.includes('software-a-medida-o-saas-como-decidir')
    )
    assert.ok(articlePageView, 'Article page_view must be emitted')
    const decodedArticlePageView = decodeURIComponent(articlePageView)
    assert.ok(decodedArticlePageView.includes('utm_source=linkedin'), 'Retains utm_source in page_location')
    assert.ok(decodedArticlePageView.includes('utm_medium=organic_social'), 'Retains utm_medium in page_location')
    assert.ok(decodedArticlePageView.includes('utm_campaign=pilot_saas_vs_custom'), 'Retains utm_campaign in page_location')
    assert.ok(!decodedArticlePageView.includes('ceo@empresa.pe') && !decodedArticlePageView.includes('email='), 'PII parameter email must be stripped from page_location')

    // 9b. Click internal service link from article (article -> service intent)
    const beforeArticleLinkLen = interceptedGCollect.length
    await evalInPage(`
      const serviceLink = document.querySelector('a[href^="/servicios/desarrollo-software-medida"]')
      if (serviceLink) {
        serviceLink.click()
      }
    `)
    await waitForPage('!!document.querySelector(".serviceHeroCopy")', 'Service page must be loaded following link navigation')
    await new Promise((r) => setTimeout(r, 400))

    const articleToServiceCollect = interceptedGCollect.slice(beforeArticleLinkLen).find(
      (u) => u.includes('en=article_intent') && u.includes('ep.intent_type=article_to_service')
    )
    assert.ok(articleToServiceCollect, 'Must emit article_intent with intent_type=article_to_service')
    assert.ok(articleToServiceCollect.includes('ep.article_slug=software-a-medida-o-saas-como-decidir'), 'Carries article_slug')

    // 9c. Verify service page_view following funnel progression
    const servicePageView = interceptedGCollect.slice(beforeArticleLinkLen).find(
      (u) => u.includes('en=page_view') && u.includes('desarrollo-software-medida')
    )
    assert.ok(servicePageView, 'Service page_view must be emitted in funnel sequence')

    // 9d. Click contact CTA on service page (service -> contact intent)
    const beforeServiceContactLen = interceptedGCollect.length
    await evalInPage(`
      const serviceMailto = document.querySelector('.serviceHeroActions a[href^="mailto:"]')
      serviceMailto?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    `)
    await new Promise((r) => setTimeout(r, 400))

    const serviceToContactCollect = interceptedGCollect.slice(beforeServiceContactLen).find(
      (u) => u.includes('en=service_intent') && u.includes('ep.intent_type=service_to_contact')
    )
    assert.ok(serviceToContactCollect, 'Must emit service_intent with intent_type=service_to_contact')
    assert.ok(serviceToContactCollect.includes('ep.service_slug=desarrollo-software-medida'), 'Carries service_slug')

    const serviceContactIntentCollect = interceptedGCollect.slice(beforeServiceContactLen).find(
      (u) => u.includes('en=contact_intent')
    )
    assert.ok(serviceContactIntentCollect, 'Must emit contact_intent from service page')
    assert.ok(serviceContactIntentCollect.includes('ep.source_path=%2Fservicios%2Fdesarrollo-software-medida%2F'), 'Carries service source_path')

    // ---------------------------------------------------------
    // Journey 2: Direct Article -> Contact intent
    // ---------------------------------------------------------
    await sendCdp('Page.navigate', {
      url: `${origin}/blog/software-a-medida-o-saas-como-decidir/`,
    })
    await waitForPage('!!document.querySelector(".blogArticleMain")', 'Blog article page must be loaded for direct contact test')
    await new Promise((r) => setTimeout(r, 400))

    const beforeDirectArticleContactLen = interceptedGCollect.length
    await evalInPage(`
      const mailtoLink = document.querySelector('.blogCtaActions a[href^="mailto:"]')
      mailtoLink?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    `)
    await new Promise((r) => setTimeout(r, 400))

    const directArticleToContactCollect = interceptedGCollect.slice(beforeDirectArticleContactLen).find(
      (u) => u.includes('en=article_intent') && u.includes('ep.intent_type=article_to_contact')
    )
    assert.ok(directArticleToContactCollect, 'Must emit article_intent with intent_type=article_to_contact on article mailto click')

    const directArticleContactIntentCollect = interceptedGCollect.slice(beforeDirectArticleContactLen).find(
      (u) => u.includes('en=contact_intent')
    )
    assert.ok(directArticleContactIntentCollect, 'Must emit contact_intent on direct article contact click')
    assert.ok(directArticleContactIntentCollect.includes('ep.method=email'), 'contact_intent has method=email')

    // 9e. Confirm generate_lead is NEVER emitted anywhere in the entire funnel
    const anyLeadInFunnel = interceptedGCollect.some((u) => u.includes('en=generate_lead'))
    assert.equal(anyLeadInFunnel, false, 'Never emit generate_lead on unconfirmed interactions across any funnel step')
  } finally {
    if (ws) ws.close()
    chrome.kill()
    await new Promise((r) => server.close(r))
    await new Promise((r) => setTimeout(r, 100))
    rmSync(chromeProfile, { recursive: true, force: true })
  }
})
