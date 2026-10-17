import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createNegotiationServer } from './serve-negotiation.mjs'

const chromeBin = ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(existsSync)
assert.ok(chromeBin, 'Chrome or Chromium is required for visual QA')

let localServer
let origin = process.env.QA_ORIGIN
if (!origin) {
  localServer = createNegotiationServer()
  await new Promise((resolve) => localServer.listen(0, '127.0.0.1', resolve))
  origin = `http://127.0.0.1:${localServer.address().port}`
}
const root = resolve(process.cwd())
const tmpBase = existsSync('/tmp') ? '/tmp' : tmpdir()
const profile = mkdtempSync(join(tmpBase, 'orbital-wasy-visual-chrome-'))
const cdpPort = await new Promise((resolvePort, reject) => {
  const probe = createServer()
  probe.once('error', reject)
  probe.listen(0, '127.0.0.1', () => {
    const port = probe.address().port
    probe.close((error) => error ? reject(error) : resolvePort(port))
  })
})

const chrome = spawn(chromeBin, [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--disable-breakpad',
  '--disable-crash-reporter',
  `--user-data-dir=${profile}`,
  `--remote-debugging-port=${cdpPort}`,
  'about:blank',
], { stdio: 'ignore' })

let ws
try {
  let target
  for (let attempt = 0; attempt < 30; attempt += 1) {
    await new Promise((resolveWait) => setTimeout(resolveWait, 100))
    try {
      const response = await fetch(`http://127.0.0.1:${cdpPort}/json/list`)
      const targets = await response.json()
      target = targets.find((candidate) => candidate.type === 'page')
      if (target?.webSocketDebuggerUrl) break
    } catch {
      // Chrome is still starting.
    }
  }
  assert.ok(target?.webSocketDebuggerUrl, 'Chrome page target must be reachable via CDP')

  ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolveOpen, reject) => {
    ws.onopen = resolveOpen
    ws.onerror = reject
  })

  let id = 0
  const pending = new Map()
  const consoleErrors = []
  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message.result)
      pending.delete(message.id)
    }
    if (message.method === 'Runtime.exceptionThrown') {
      consoleErrors.push(message.params.exceptionDetails.text)
    }
  })

  const send = (method, params = {}) => new Promise((resolveMessage) => {
    const messageId = ++id
    pending.set(messageId, resolveMessage)
    ws.send(JSON.stringify({ id: messageId, method, params }))
  })
  const evaluate = async (expression) => {
    const response = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    return response.result?.value
  }

  await send('Page.enable')
  await send('Runtime.enable')

  const routes = [
    { name: 'home', path: '/', expectedHref: '/casos/wasy/' },
    { name: 'case', path: '/casos/wasy/', expectedHref: 'https://wasy.store/' },
    { name: 'evidence', path: '/evidencia/', expectedHref: '/casos/wasy/' },
    { name: 'checkio', path: '/casos/checkio/', expectedHref: 'https://checkio-frontend.onrender.com/landing', checkCapabilities: true },
    { name: 'localisa', path: '/casos/localisa/', expectedHref: 'https://www.localisa.pe/', checkCapabilities: true },
    { name: 'perulog', path: '/casos/perulog-pallets/', expectedHref: 'https://perulogpallets.com.pe/', checkCapabilities: true },
  ]
  const viewports = [
    { name: 'mobile-320', width: 320, height: 760, mobile: true },
    { name: 'mobile-375', width: 375, height: 812, mobile: true },
    { name: 'mobile', width: 390, height: 844, mobile: true, capture: true },
    { name: 'mobile-414', width: 414, height: 896, mobile: true },
    { name: 'tablet-768', width: 768, height: 1024, mobile: true },
    { name: 'desktop', width: 1440, height: 1057, mobile: false, capture: true },
  ]

  for (const viewport of viewports) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
      mobile: viewport.mobile,
    })

    for (const route of routes) {
      await send('Page.navigate', { url: `${origin}${route.path}` })
      await new Promise((resolveWait) => setTimeout(resolveWait, 800))
      await evaluate("localStorage.setItem('orbital-analytics-consent', 'denied')")
      await evaluate(`(async () => {
        document.documentElement.style.scrollBehavior = 'auto';
        const image = [...document.images].find((candidate) => candidate.alt.toLowerCase().includes(${JSON.stringify(route.checkCapabilities ? route.name : 'wasy')}));
        if (!image) return { found: false };
        image.scrollIntoView({ block: 'center', behavior: 'instant' });
        if (!image.complete) await new Promise((resolveImage) => image.addEventListener('load', resolveImage, { once: true }));
        try { await image.decode(); } catch {}
        const links = [...document.querySelectorAll('a')].map((link) => link.getAttribute('href'));
        return {
          found: true,
          decoded: image.complete && image.naturalWidth > 0,
          currentSrc: image.currentSrc,
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          offenders: [...document.querySelectorAll('body *')]
            .filter((element) => element.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
            .slice(0, 5)
            .map((element) => ({ tag: element.tagName, className: element.className, right: Math.round(element.getBoundingClientRect().right) })),
          expectedLink: links.includes(${JSON.stringify(route.expectedHref)}),
          bodyHasExpected: ${Boolean(route.checkCapabilities)} ? true : document.body.innerText.toLowerCase().includes('wasy'),
          hasCapabilities: Boolean(document.querySelector('.caseCapabilities')),
          flowStepsCount: document.querySelectorAll('.caseFlowGrid article').length,
          flowStepsFitViewport: [...document.querySelectorAll('.caseFlowStep')].every((step) => {
            const rect = step.getBoundingClientRect();
            return rect.left >= -1 && rect.right <= window.innerWidth + 1;
          }),
          wasyOverlayAbsent: !document.querySelector('.workCard--wasy .workMediaOverlay'),
          hasOtherMediaOverlay: Boolean(document.querySelector('.workCard:not(.workCard--wasy) .workMediaOverlay')),
        };
      })()`)
      await new Promise((resolveWait) => setTimeout(resolveWait, 250))
      const result = await evaluate(`window.__unused ?? (async () => {
        document.documentElement.style.scrollBehavior = 'auto';
        const image = [...document.images].find((candidate) => candidate.alt.toLowerCase().includes(${JSON.stringify(route.checkCapabilities ? route.name : 'wasy')}));
        if (image) {
          const initialRect = image.getBoundingClientRect();
          const absoluteTop = window.scrollY + initialRect.top;
          const targetTop = Math.max(0, absoluteTop - Math.max(0, (window.innerHeight - initialRect.height) / 2));
          window.scrollTo({ top: targetTop, behavior: 'instant' });
        }
        await new Promise((resolveFrame) => requestAnimationFrame(() => requestAnimationFrame(resolveFrame)));
        const links = [...document.querySelectorAll('a')].map((link) => link.getAttribute('href'));
        const imageRect = image?.getBoundingClientRect();
        return {
          found: Boolean(image),
          decoded: Boolean(image?.complete && image?.naturalWidth > 0),
          currentSrc: image?.currentSrc || '',
          naturalWidth: image?.naturalWidth || 0,
          naturalHeight: image?.naturalHeight || 0,
          imageTop: Math.round(imageRect?.top || 0),
          imageBottom: Math.round(imageRect?.bottom || 0),
          imageInViewport: Boolean(imageRect && imageRect.bottom > 0 && imageRect.top < window.innerHeight),
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          offenders: [...document.querySelectorAll('body *')]
            .filter((element) => element.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
            .slice(0, 5)
            .map((element) => ({ tag: element.tagName, className: element.className, right: Math.round(element.getBoundingClientRect().right) })),
          expectedLink: links.includes(${JSON.stringify(route.expectedHref)}),
          bodyHasExpected: ${Boolean(route.checkCapabilities)} ? true : document.body.innerText.toLowerCase().includes('wasy'),
          hasCapabilities: Boolean(document.querySelector('.caseCapabilities')),
          flowStepsCount: document.querySelectorAll('.caseFlowGrid article').length,
          flowStepsFitViewport: [...document.querySelectorAll('.caseFlowStep')].every((step) => {
            const rect = step.getBoundingClientRect();
            return rect.left >= -1 && rect.right <= window.innerWidth + 1;
          }),
          wasyOverlayAbsent: !document.querySelector('.workCard--wasy .workMediaOverlay'),
          hasOtherMediaOverlay: Boolean(document.querySelector('.workCard:not(.workCard--wasy) .workMediaOverlay')),
        };
      })()`)

      assert.equal(result.found, true, `${route.name}/${viewport.name}: hero/card image must be present`)
      assert.equal(result.decoded, true, `${route.name}/${viewport.name}: hero/card image must decode`)
      assert.equal(result.imageInViewport, true, `${route.name}/${viewport.name}: image must be visible in captured viewport (${JSON.stringify(result)})`)
      assert.equal(result.overflow, false, `${route.name}/${viewport.name}: no horizontal overflow (${JSON.stringify(result)})`)
      assert.equal(result.expectedLink, true, `${route.name}/${viewport.name}: expected CTA must exist`)
      assert.equal(result.bodyHasExpected, true, `${route.name}/${viewport.name}: expected copy must be visible`)

      if (route.name === 'home') {
        assert.equal(result.wasyOverlayAbsent, true, `${route.name}/${viewport.name}: Wasy .workMediaOverlay must be absent`)
        assert.equal(result.hasOtherMediaOverlay, true, `${route.name}/${viewport.name}: non-Wasy cards must retain .workMediaOverlay`)
      }
      if (route.name === 'case') {
        assert.equal(result.hasCapabilities, false, `${route.name}/${viewport.name}: .caseCapabilities must not exist for Wasy`)
        assert.equal(result.flowStepsCount, 3, `${route.name}/${viewport.name}: .caseFlowGrid must have exactly 3 steps`)
        assert.equal(result.flowStepsFitViewport, true, `${route.name}/${viewport.name}: three Wasy flow cards must fit horizontally without clipping`)
      }
      if (route.checkCapabilities) {
        assert.equal(result.hasCapabilities, true, `${route.name}/${viewport.name}: .caseCapabilities must exist for ${route.name}`)
        assert.equal(result.flowStepsCount, 3, `${route.name}/${viewport.name}: .caseFlowGrid must have 3 steps for ${route.name}`)
      }

      if (viewport.capture && (route.name === 'home' || route.name === 'case' || route.name === 'evidence')) {
        const capture = await send('Page.captureScreenshot', { format: 'png', fromSurface: true })
        const output = join(root, 'docs', `qa-wasy-${route.name}-${viewport.name}-2026-10-16.png`)
        writeFileSync(output, Buffer.from(capture.data, 'base64'))
      }
      console.log(`PASS ${route.name}/${viewport.name} ${result.naturalWidth}x${result.naturalHeight} ${result.currentSrc}`)
    }
  }

  assert.deepEqual(consoleErrors, [], `Browser exceptions: ${consoleErrors.join('; ')}`)
  console.log('WASY_VISUAL_QA_PASS')
} finally {
  if (ws) ws.close()
  chrome.kill()
  await new Promise((resolveWait) => setTimeout(resolveWait, 100))
  rmSync(profile, { recursive: true, force: true })
  if (localServer) localServer.close()
}
