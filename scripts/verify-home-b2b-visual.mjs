import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createNegotiationServer } from './serve-negotiation.mjs'

const browserPath = ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(existsSync)
assert.ok(browserPath, 'Chrome/Chromium required for commercial landing QA')
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const server = createNegotiationServer()
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}`
const debugProbe = createServer()
await new Promise((resolve) => debugProbe.listen(0, '127.0.0.1', resolve))
const debugPort = debugProbe.address().port
await new Promise((resolve) => debugProbe.close(resolve))
const profile = mkdtempSync(join(tmpdir(), 'orbital-b2b-hero-'))
const browser = spawn(browserPath, [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
  `--user-data-dir=${profile}`, `--remote-debugging-port=${debugPort}`, 'about:blank',
], { stdio: 'ignore' })
let ws
try {
  let tab
  for (let i = 0; i < 60; i += 1) {
    await sleep(140)
    try {
      const tabs = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json()
      tab = tabs.find((entry) => entry.type === 'page' && entry.webSocketDebuggerUrl)
      if (tab) break
    } catch { /* Chrome starting */ }
  }
  assert.ok(tab, 'Chrome tab must be available')
  ws = new WebSocket(tab.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject })
  let serial = 0
  const pending = new Map()
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data)
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg.result); pending.delete(msg.id) }
  }
  const send = (method, params = {}) => new Promise((resolve) => {
    const id = ++serial
    pending.set(id, resolve)
    ws.send(JSON.stringify({ id, method, params }))
  })
  await send('Page.enable')
  await send('Runtime.enable')
  for (const width of [320, 390, 768, 1024, 1440, 1728]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 })
    await send('Page.navigate', { url: origin })
    await sleep(470)
    await send('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true })
    const response = await send('Runtime.evaluate', {
      expression: `(() => {
        const measure = (el) => {const r=el.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}}
        const h1 = document.querySelector('.heroTitle');
        const primary = document.querySelector('.heroActions a.btnPrimary');
        const cards = [...document.querySelectorAll('.servicesGrid .serviceCard')];
        const serviceTitle = document.querySelector('.servicesTitle');
        const contactTitle = document.querySelector('.contactTitle');
        return {
          overflow:document.documentElement.scrollWidth > innerWidth,
          h1:measure(h1), h1Text:h1.textContent.trim(),
          words:[...h1.children].map(el=>({text:el.textContent.trim(),scroll:el.scrollWidth,client:el.clientWidth})),
          primary:measure(primary),primaryText:primary.textContent.trim(),primaryHref:primary.getAttribute('href'),
          serviceTitle:measure(serviceTitle),serviceText:serviceTitle.textContent.trim(),
          contactTitle:measure(contactTitle),
          cardCount:cards.length,cardLinks:cards.map(a=>a.getAttribute('href')),
        };
      })()`,
      returnByValue: true,
    })
    const data = response.result?.value
    assert.ok(data && !data.overflow, `${width}px must not overflow horizontally`)
    assert.match(data.h1Text, /SOFTWARE.*PARA.*TU.*EMPRESA/)
    assert.ok(data.h1.h > 70 && data.h1.h < 680, `${width}px commercial headline must fit a normal screen`)
    assert.equal(data.primaryHref, '#contacto')
    assert.ok(data.primary.w >= 160 && data.primary.x >= -1 && data.primary.x + data.primary.w <= width + 1,
      `${width}px primary CTA must fit the viewport`)
    assert.ok(data.serviceTitle.h < 460 && data.contactTitle.h < 460, `${width}px headings must not dominate entire screens`)
    assert.equal(data.cardCount, 4)
    assert.ok(data.cardLinks.every(Boolean), 'All service cards must link to a service or contact')
    console.log('B2B_LAYOUT_PASS', width, 'hero', data.h1.h, 'px', 'CTA', data.primary.w, 'px', 'services', data.serviceTitle.h, 'px')
    if (process.env.QA_CAPTURE_HOME === '1' && [390, 1440].includes(width)) {
      const capture = await send('Page.captureScreenshot', { format: 'png', fromSurface: true })
      writeFileSync(join(tmpdir(), `orbital-b2b-home-${width}.png`), Buffer.from(capture.data, 'base64'))
    }
  }
  console.log('B2B_HOME_VISUAL_PASS')
} finally {
  ws?.close()
  browser.kill()
  await sleep(200)
  rmSync(profile, { recursive: true, force: true })
  await new Promise((resolve) => server.close(resolve))
}
