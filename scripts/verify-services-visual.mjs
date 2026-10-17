import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createNegotiationServer } from './serve-negotiation.mjs'

const chromeBin = ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(existsSync)
if (!chromeBin) {
  console.log('NOTICE: Chrome/Chromium binary not found; skipping headless visual verification.')
  process.exit(0)
}

const localServer = createNegotiationServer()
await new Promise((resolve) => localServer.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${localServer.address().port}`

const tmpBase = existsSync('/tmp') ? '/tmp' : tmpdir()
const profile = mkdtempSync(join(tmpBase, 'orbital-services-visual-chrome-'))
const cdpPort = await new Promise((resolvePort, reject) => {
  const probe = createServer()
  probe.once('error', reject)
  probe.listen(0, '127.0.0.1', () => {
    const port = probe.address().port
    probe.close((error) => (error ? reject(error) : resolvePort(port)))
  })
})

const chrome = spawn(
  chromeBin,
  [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-breakpad',
    '--disable-crash-reporter',
    `--user-data-dir=${profile}`,
    `--remote-debugging-port=${cdpPort}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
)

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
      // Waiting for Chrome
    }
  }
  assert.ok(target?.webSocketDebuggerUrl, 'Chrome page target must be reachable via CDP')

  ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolveOpen, reject) => {
    ws.onopen = resolveOpen
    ws.onerror = reject
  })

  let messageId = 1
  const pending = new Map()
  ws.onmessage = (event) => {
    const payload = JSON.parse(event.data)
    if (payload.id && pending.has(payload.id)) {
      const { resolve, reject } = pending.get(payload.id)
      pending.delete(payload.id)
      if (payload.error) reject(new Error(payload.error.message))
      else resolve(payload.result)
    }
  }

  function send(method, params = {}) {
    const id = messageId++
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject })
      ws.send(JSON.stringify({ id, method, params }))
    })
  }

  await send('Page.enable')
  await send('Runtime.enable')

  const viewports = [
    { width: 320, height: 640 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ]

  const serviceRoutes = [
    '/servicios/desarrollo-software-medida/',
    '/servicios/automatizacion-procesos/',
    '/servicios/landing-pages-b2b/',
  ]

  for (const route of serviceRoutes) {
    for (const vp of viewports) {
      await send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.width < 768,
      })

      await send('Page.navigate', { url: `${origin}${route}` })
      await new Promise((r) => setTimeout(r, 300))

      const evalResult = await send('Runtime.evaluate', {
        expression: `(() => {
          const h1 = document.querySelector('h1');
          const breadcrumb = document.querySelector('.serviceBreadcrumb');
          const primaryCta = document.querySelector('.servicePrimaryCta');
          const proofBadge = document.querySelector('.serviceProofBadge');
          const scrollWidth = document.documentElement.scrollWidth;
          const innerWidth = window.innerWidth;
          return {
            h1Text: h1 ? h1.innerText.trim() : null,
            hasBreadcrumb: Boolean(breadcrumb),
            hasPrimaryCta: Boolean(primaryCta),
            hasProofBadge: Boolean(proofBadge),
            noOverflow: scrollWidth <= innerWidth + 1,
            scrollWidth,
            innerWidth,
          };
        })()`,
        returnByValue: true,
      })

      const info = evalResult.result.value
      assert.ok(info.h1Text && info.h1Text.length > 0, `H1 must exist and be non-empty on ${route} @ ${vp.width}px`)
      assert.ok(info.hasBreadcrumb, `Breadcrumb must exist on ${route} @ ${vp.width}px`)
      assert.ok(info.hasPrimaryCta, `Primary CTA must exist on ${route} @ ${vp.width}px`)
      assert.ok(info.hasProofBadge, `Proof badge must exist on ${route} @ ${vp.width}px`)
      assert.ok(
        info.noOverflow,
        `No horizontal overflow allowed on ${route} @ ${vp.width}px (scrollWidth: ${info.scrollWidth}, innerWidth: ${info.innerWidth})`,
      )

      console.log(`PASS ${route} @ ${vp.width}x${vp.height} (no overflow, H1: "${info.h1Text.slice(0, 30)}...")`)
    }
  }

  console.log('All responsive viewports verified with 0 horizontal overflow.')
} finally {
  if (ws) ws.close()
  chrome.kill('SIGKILL')
  await new Promise((r) => localServer.close(r))
  try {
    rmSync(profile, { recursive: true, force: true })
  } catch {
    // Ignore profile cleanup error
  }
}
