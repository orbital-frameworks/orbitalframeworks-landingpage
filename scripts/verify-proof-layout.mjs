import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createNegotiationServer } from './serve-negotiation.mjs'

const chromePath = ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(existsSync)
assert.ok(chromePath, 'Chrome/Chromium is required for evidence composition QA')

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const raw = process.env.QA_PROOF_MEASURE_ONLY === '1'
let webServer
let origin = process.env.QA_ORIGIN
if (!origin) {
  webServer = createNegotiationServer()
  await new Promise((resolve) => webServer.listen(0, '127.0.0.1', resolve))
  origin = `http://127.0.0.1:${webServer.address().port}`
}

const port = await new Promise((resolve, reject) => {
  const probe = createServer()
  probe.once('error', reject)
  probe.listen(0, '127.0.0.1', () => {
    const selected = probe.address().port
    probe.close((error) => error ? reject(error) : resolve(selected))
  })
})
const profile = mkdtempSync(join(tmpdir(), 'orbital-proof-composition-'))
const chrome = spawn(chromePath, [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
  `--user-data-dir=${profile}`, `--remote-debugging-port=${port}`, 'about:blank',
], { stdio: 'ignore' })
let ws
try {
  let tab
  for (let i = 0; i < 55; i += 1) {
    await wait(130)
    try {
      const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
      tab = tabs.find((candidate) => candidate.type === 'page' && candidate.webSocketDebuggerUrl)
      if (tab) break
    } catch { /* Browser is starting. */ }
  }
  assert.ok(tab, 'Chrome CDP page available')
  ws = new WebSocket(tab.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject })
  const pending = new Map()
  let id = 0
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.id && pending.has(data.id)) {
      pending.get(data.id)(data.result)
      pending.delete(data.id)
    }
  }
  const send = (method, params = {}) => new Promise((resolve) => {
    const next = ++id
    pending.set(next, resolve)
    ws.send(JSON.stringify({ id: next, method, params }))
  })
  await send('Page.enable')
  await send('Runtime.enable')

  for (const width of [320, 390, 768, 1024, 1440, 1728, 1920]) {
    await send('Emulation.setDeviceMetricsOverride', {
      width, height: 900, deviceScaleFactor: 1, mobile: width < 768,
    })
    await send('Page.navigate', { url: `${origin}/evidencia/` })
    await wait(450)
    await send('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true })
    const result = await send('Runtime.evaluate', {
      expression: `(() => {
        const measure = (selector) => {
          const el = document.querySelector(selector);
          const range = document.createRange();
          range.selectNodeContents(el);
          const r = el.getBoundingClientRect();
          return {
            x: Math.round(r.left), y: Math.round(r.top),
            width: Math.round(r.width), height: Math.round(r.height),
            lines: [...new Set([...range.getClientRects()].map(x => Math.round(x.top)))].length,
            fontSize: getComputedStyle(el).fontSize,
          };
        };
        return {
          width: innerWidth, horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
          hero: measure('.proofHero'), heroH1: measure('.proofHero h1'),
          heroLead: measure('.proofLead'), aside: measure('.proofHeroAside'),
          workHead: measure('.proofSectionHead'), workH2: measure('.proofSectionHead h2'),
          workDescription: measure('.proofSectionHead > p'),
          criteriaH2: measure('.proofCriteria h2'), ctaH2: measure('.proofCta h2'),
          headingWordWrap: [...document.querySelectorAll('.proofHero h1,.proofSectionHead h2')]
            .some(h => h.scrollWidth > h.clientWidth + 1),
        };
      })()`,
      returnByValue: true,
    })
    const d = result.result?.value
    console.log('COMPOSITION', JSON.stringify(d))
    if (raw) continue
    assert.ok(!d.horizontalOverflow && !d.headingWordWrap, `${width}px: no horizontal overflow or clipped titles`)
    assert.ok(d.heroH1.height < 500, `${width}px: hero heading must not dominate an entire screen`)
    if (width >= 1024) {
      assert.ok(d.heroH1.lines <= 4, `${width}px: hero should fit into <=4 deliberate lines`)
      assert.ok(d.heroH1.y + d.heroH1.height <= 760, `${width}px: hero heading must fit within a normal 900px viewport`)
      assert.ok(d.workH2.lines <= 5, `${width}px: work heading must fit into <=5 lines`)
      assert.ok(d.workH2.height <= 370, `${width}px: work heading must not dominate the next screen`)
      assert.ok(Math.abs((d.aside.y + d.aside.height / 2) - (d.heroH1.y + d.heroH1.height / 2)) < 300,
        `${width}px: aside must share vertical space with heading rather than sit at the bottom`)
    }
  }
  console.log('PROOF_COMPOSITION_PASS')
} finally {
  ws?.close()
  chrome.kill()
  await wait(150)
  rmSync(profile, { recursive: true, force: true })
  if (webServer) await new Promise((resolve) => webServer.close(resolve))
}
