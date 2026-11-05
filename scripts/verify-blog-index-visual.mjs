import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createNegotiationServer } from './serve-negotiation.mjs'

const browserPath = ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(existsSync)
if (!browserPath) {
  console.log('NOTICE: Chrome/Chromium binary not found; skipping headless visual verification.')
  process.exit(0)
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const server = createNegotiationServer()
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}`

const debugProbe = createServer()
await new Promise((resolve) => debugProbe.listen(0, '127.0.0.1', resolve))
const debugPort = debugProbe.address().port
await new Promise((resolve) => debugProbe.close(resolve))

const tmpBase = existsSync('/tmp') ? '/tmp' : tmpdir()
const profile = mkdtempSync(join(tmpBase, 'orbital-blog-index-visual-'))

const args = process.argv.slice(2)
let cliOutputDir = null
for (let i = 0; i < args.length; i += 1) {
  const arg = args[i]
  if (arg === '--output-dir' || arg === '--output' || arg === '-o') {
    cliOutputDir = args[i + 1]
    i += 1
  } else if (arg.startsWith('--output-dir=')) {
    cliOutputDir = arg.slice('--output-dir='.length)
  } else if (arg.startsWith('--output=')) {
    cliOutputDir = arg.slice('--output='.length)
  } else if (!arg.startsWith('-') && !cliOutputDir) {
    cliOutputDir = arg
  }
}

const isWritable = (dir) => {
  try {
    mkdirSync(dir, { recursive: true })
    const probe = join(dir, `.probe-${Date.now()}-${Math.random().toString(36).slice(2)}`)
    writeFileSync(probe, '')
    rmSync(probe, { force: true })
    return true
  } catch {
    return false
  }
}

const customOutputDir = cliOutputDir || process.env.QA_SCREENSHOT_DIR || process.env.ORBITAL_VISUAL_OUTPUT_DIR || process.env.OUTPUT_DIR
let evidenceDir
if (customOutputDir) {
  evidenceDir = resolve(customOutputDir)
  try {
    mkdirSync(evidenceDir, { recursive: true })
  } catch (error) {
    if (error?.code === 'EROFS' || error?.code === 'EACCES') {
      evidenceDir = resolve(join(tmpBase, 'orbital-blog-index-visual'))
      mkdirSync(evidenceDir, { recursive: true })
    } else {
      throw error
    }
  }
} else {
  const defaultDir = join(process.cwd(), 'tests', 'artifacts', 'blog-index')
  if (isWritable(defaultDir)) {
    evidenceDir = defaultDir
  } else {
    evidenceDir = resolve(join(tmpBase, 'orbital-blog-index-visual'))
    mkdirSync(evidenceDir, { recursive: true })
  }
}

const browser = spawn(browserPath, [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--disable-dev-shm-usage',
  `--user-data-dir=${profile}`,
  `--remote-debugging-port=${debugPort}`,
  'about:blank',
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
    } catch {
      // Chrome starting up
    }
  }
  assert.ok(tab, 'Chrome tab must be available')

  ws = new WebSocket(tab.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    ws.onopen = resolve
    ws.onerror = reject
  })

  let serial = 0
  const pending = new Map()
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data)
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      if (msg.error) reject(new Error(msg.error.message))
      else resolve(msg.result)
    }
  }

  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++serial
    pending.set(id, { resolve, reject })
    ws.send(JSON.stringify({ id, method, params }))
  })

  const capture = async (filename) => {
    const result = await send('Page.captureScreenshot', { format: 'png', fromSurface: true })
    const bytes = Buffer.from(result.data, 'base64')
    let path = join(evidenceDir, filename)
    try {
      writeFileSync(path, bytes)
    } catch (error) {
      if ((error?.code === 'EROFS' || error?.code === 'EACCES') && evidenceDir !== resolve(join(tmpBase, 'orbital-blog-index-visual'))) {
        evidenceDir = resolve(join(tmpBase, 'orbital-blog-index-visual'))
        mkdirSync(evidenceDir, { recursive: true })
        path = join(evidenceDir, filename)
        writeFileSync(path, bytes)
      } else {
        throw error
      }
    }
    return { path, hash: createHash('sha256').update(bytes).digest('hex') }
  }

  const tap = async (x, y) => {
    await send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x, y, radiusX: 1, radiusY: 1, force: 1, id: 1 }],
    })
    await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  }

  await send('Page.enable')
  await send('Runtime.enable')

  const viewports = [
    { width: 320, height: 640, expectedCols: 1, label: 'Mobile compact (320px)' },
    { width: 390, height: 844, expectedCols: 1, label: 'Mobile standard (390px)' },
    { width: 768, height: 1024, expectedCols: 2, label: 'Tablet portrait (768px)' },
    { width: 1024, height: 768, expectedCols: 2, label: 'Tablet landscape / compact desktop (1024px)' },
    { width: 1440, height: 900, expectedCols: 3, label: 'Desktop standard (1440px)' },
    { width: 1728, height: 1080, expectedCols: 3, label: 'Wide desktop (1728px)' },
  ]

  console.log(`Visual verification artifacts directory: ${evidenceDir}`)
  console.log(`Starting visual verification of /blog/ across ${viewports.length} viewports...`)

  for (const vp of viewports) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.width < 768,
    })

    await send('Page.navigate', { url: `${origin}/blog/` })
    await sleep(400)
    await send('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true })

    const evalResult = await send('Runtime.evaluate', {
      expression: `(() => {
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;
        const noOverflow = scrollWidth <= innerWidth + 1;

        const grid = document.querySelector('.blogPostsGrid');
        if (!grid) return { error: 'Grid element not found' };

        const gridStyle = window.getComputedStyle(grid);
        const colDef = gridStyle.gridTemplateColumns.trim();
        const computedCols = colDef.split(/\\s+/).length;

        const cards = Array.from(grid.querySelectorAll('.blogPostCard'));
        const distinctLefts = new Set(cards.map((c) => Math.round(c.getBoundingClientRect().left)));
        const geometricCols = distinctLefts.size;

        const titleChecks = cards.map((card) => {
          const title = card.querySelector('.blogPostCardTitle');
          const cardRect = card.getBoundingClientRect();
          const titleRect = title ? title.getBoundingClientRect() : null;
          return {
            hasTitle: Boolean(title),
            text: title ? title.innerText.trim() : '',
            height: titleRect ? Math.round(titleRect.height) : 0,
            fitsInCard: titleRect && cardRect ? titleRect.right <= cardRect.right + 2 : false,
          };
        });

        const categoryButtons = Array.from(document.querySelectorAll('.blogCategoryBtn')).map((btn) => ({
          id: btn.id,
          text: btn.innerText.trim(),
          count: Number(btn.querySelector('.blogCategoryCount')?.textContent),
          active: btn.classList.contains('isCategoryActive'),
          width: Math.round(btn.getBoundingClientRect().width),
          height: Math.round(btn.getBoundingClientRect().height),
        }));

        const searchField = document.querySelector('#blog-search-field');
        const mobileToggle = document.querySelector('.blogCategoryMobileToggle');
        const toggleRect = mobileToggle.getBoundingClientRect();
        const headerRect = document.querySelector('.blogSectionHeader').getBoundingClientRect();
        const gridRect = grid.getBoundingClientRect();
        const links = cards.map((card) => card.querySelector('.blogPostCardSurface')?.getAttribute('href'));

        return {
          noOverflow,
          scrollWidth,
          innerWidth,
          computedCols,
          geometricCols,
          cardCount: cards.length,
          titleChecks,
          categoryButtons,
          mobileToggle: { display: getComputedStyle(mobileToggle).display, height: toggleRect.height,
            expanded: mobileToggle.getAttribute('aria-expanded') },
          articleGap: Math.round(gridRect.top - headerRect.bottom),
          hasSearchField: Boolean(searchField),
          searchLabel: document.querySelector('label[for="blog-search-field"]')?.textContent.trim(),
          links,
        };
      })()`,
      returnByValue: true,
    })

    const data = evalResult.result.value
    assert.ok(!data.error, `Viewport ${vp.width}px evaluation error: ${data.error}`)
    assert.ok(
      data.noOverflow,
      `Horizontal overflow detected at ${vp.width}px: scrollWidth ${data.scrollWidth} > innerWidth ${data.innerWidth}`,
    )
    assert.equal(
      data.geometricCols,
      vp.expectedCols,
      `Expected ${vp.expectedCols} columns at ${vp.width}px, observed geometric cols: ${data.geometricCols}`,
    )
    assert.equal(
      data.cardCount,
      7,
      `Expected 7 cards on initial render at ${vp.width}px, got ${data.cardCount}`,
    )
    assert.equal(data.searchLabel, 'Buscar', `Search must keep its visible label at ${vp.width}px`)
    assert.equal(new Set(data.links).size, 7, `Every card must expose a unique crawlable link at ${vp.width}px`)
    assert.ok(data.links.every((href) => href?.startsWith('/blog/')), `Card links must remain internal blog URLs at ${vp.width}px`)
    if (vp.width <= 700) {
      assert.ok(data.mobileToggle.height >= 44 && data.mobileToggle.expanded === 'false',
        `Mobile category disclosure must be a usable collapsed touch target at ${vp.width}px`)
      assert.ok(data.categoryButtons.every(({ height }) => height === 0),
        `Category options must remain collapsed by default at ${vp.width}px`)
    } else {
      assert.ok(data.categoryButtons.every(({ height }) => height >= 44), `Category controls must be at least 44px tall at ${vp.width}px`)
      assert.equal(data.mobileToggle.display, 'none', `Desktop/tablet categories must remain visible at ${vp.width}px`)
    }
    assert.ok(data.articleGap <= (vp.width <= 700 ? 215 : vp.width <= 1180 ? 195 : 155),
      `Article cards must appear near the header at ${vp.width}px; gap=${data.articleGap}px`)
    assert.deepEqual(
      Object.fromEntries(data.categoryButtons.map(({ id, count }) => [id, count])),
      {
        'cat-todos': 7,
        'cat-web-y-conversion': 2,
        'cat-automatizacion-y-operaciones': 3,
        'cat-software-y-sistemas': 2,
      },
      `Category counters must match the complete corpus at ${vp.width}px`,
    )

    for (const [idx, t] of data.titleChecks.entries()) {
      assert.ok(t.hasTitle && t.height > 0, `Card #${idx + 1} title has zero height at ${vp.width}px`)
      assert.ok(t.fitsInCard, `Card #${idx + 1} title overflows card container at ${vp.width}px`)
    }

    const screenshot = await capture(`blog-index-${vp.width}.png`)
    console.log(`PASS [${vp.label}]: cols=${data.geometricCols}, overflow=none (${data.scrollWidth}px <= ${data.innerWidth}px), cards=${data.cardCount}, screenshot=${screenshot.path}, sha256=${screenshot.hash}`)
    const defaultSort = await send('Runtime.evaluate', {
      expression: `(() => {
        const select = document.querySelector('#blog-sort-order');
        const dates = [...document.querySelectorAll('.blogPostCardBottom > span:first-child')].map(e => e.textContent.trim().slice(0, 10));
        return {value:select?.value, height:select?.getBoundingClientRect().height, dates};
      })()`, returnByValue: true,
    })
    const sort = defaultSort.result.value
    assert.equal(sort.value, 'newest', `Date descending must be the default at ${vp.width}px`)
    assert.ok(sort.height >= 44, `Sort select must be a touch-sized native control at ${vp.width}px`)
    assert.deepEqual(sort.dates, [...sort.dates].sort().reverse(),
      `Articles must default to most recent first at ${vp.width}px`)
    if (vp.width === 390 || vp.width === 1440) {
      await send('Runtime.evaluate', { expression: `document.querySelector('#articulos').scrollIntoView({block:'start'})` })
      await sleep(150)
      const toolbarShot = await capture(`blog-toolbar-${vp.width}.png`)
      console.log('PASS [Compact toolbar screenshot]', vp.width, toolbarShot.path)
    }
    if (vp.width <= 700) {
      await send('Runtime.evaluate', { expression: `document.querySelector('.blogCategoryMobileToggle').click()` })
      await sleep(80)
      const expanded = await send('Runtime.evaluate', {
        expression: `(() => ({
          expanded: document.querySelector('.blogCategoryMobileToggle').getAttribute('aria-expanded'),
          options: [...document.querySelectorAll('.blogCategoryBtn')].map(e => Math.round(e.getBoundingClientRect().height))
        }))()`, returnByValue: true,
      })
      assert.equal(expanded.result.value.expanded, 'true', 'Mobile category selector must expand on click')
      assert.ok(expanded.result.value.options.every((height) => height >= 44),
        'Expanded mobile category options must be touch sized')
      await send('Runtime.evaluate', { expression: `document.querySelector('#cat-web-y-conversion').click()` })
      await sleep(80)
      const selected = await send('Runtime.evaluate', {
        expression: `(() => ({
          expanded: document.querySelector('.blogCategoryMobileToggle').getAttribute('aria-expanded'),
          cards: document.querySelectorAll('.blogPostCard').length,
          label: document.querySelector('.blogCategoryMobileToggle').textContent.trim()
        }))()`, returnByValue: true,
      })
      assert.equal(selected.result.value.expanded, 'false', 'Selecting a category closes the mobile disclosure')
      assert.equal(selected.result.value.cards, 2, 'Selecting web category filters posts')
      assert.match(selected.result.value.label, /Web y conversión/)
      console.log('PASS [Mobile filter disclosure]', vp.width, 'expanded/selected/collapsed')
    }
  }

  // Browser zoom changes the effective CSS viewport. A 1440px display at 200%
  // exposes roughly 720 CSS px, so validate the real reflow at that width.
  await send('Emulation.setDeviceMetricsOverride', {
    width: 720,
    height: 900,
    deviceScaleFactor: 2,
    mobile: false,
  })
  await send('Page.navigate', { url: `${origin}/blog/` })
  await sleep(400)
  const zoomResult = await send('Runtime.evaluate', {
    expression: `(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      columns: new Set(Array.from(document.querySelectorAll('.blogPostCard')).map((card) => Math.round(card.getBoundingClientRect().left))).size,
      clippedTitles: Array.from(document.querySelectorAll('.blogPostCardTitle')).filter((title) => title.scrollWidth > title.clientWidth + 1).length,
    }))()`,
    returnByValue: true,
  })
  const zoomData = zoomResult.result.value
  assert.ok(zoomData.scrollWidth <= zoomData.innerWidth + 1, '200% zoom equivalent must not introduce horizontal overflow')
  assert.equal(zoomData.columns, 1, '200% zoom equivalent must reflow cards into one column')
  assert.equal(zoomData.clippedTitles, 0, '200% zoom equivalent must not clip long titles')
  const zoomScreenshot = await capture('blog-index-zoom-200.png')
  console.log(`PASS [Zoom 200% equivalent]: ${zoomData.innerWidth}px CSS viewport, overflow=none, titles=unclipped, screenshot=${zoomScreenshot.path}, sha256=${zoomScreenshot.hash}`)

  // --- Interactive Client-Side Verification (Search, Filters, Clear, Empty State, Reset) ---
  console.log('Running interactive visual and accessibility simulation...')

  // Test at standard desktop (1440px)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await send('Page.navigate', { url: `${origin}/blog/` })
  await sleep(400)

  // Exercise native sorting with live DOM updates, not only default CSS/SSR.
  const chooseSort = async (value) => {
    await send('Runtime.evaluate', {
      expression: `(() => {
        const select = document.querySelector('#blog-sort-order')
        select.value = ${JSON.stringify(value)}
        select.dispatchEvent(new Event('change', { bubbles: true }))
      })()`,
    })
    await sleep(100)
    const evaluated = await send('Runtime.evaluate', {
      expression: `(() => ({
        dates: [...document.querySelectorAll('.blogPostCardBottom > span:first-child')].map(e => e.textContent.trim().slice(0, 10)),
        titles: [...document.querySelectorAll('.blogPostCardTitle')].map(e => e.innerText.trim())
      }))()`,
      returnByValue: true,
    })
    return evaluated.result.value
  }
  const oldest = await chooseSort('oldest')
  assert.deepEqual(oldest.dates, [...oldest.dates].sort(), 'Oldest sorting must be ascending by publication date')
  const byTitle = await chooseSort('title')
  assert.deepEqual(byTitle.titles, [...byTitle.titles].sort((a, b) => a.localeCompare(b, 'es')),
    'Alphabetical sorting must follow Spanish title order')
  const latest = await chooseSort('newest')
  assert.deepEqual(latest.dates, [...latest.dates].sort().reverse(),
    'Restoring newest sort must return descending dates')
  console.log('PASS [Article Sort]: newest/oldest/title options reorder actual article cards')

  // 1. Native button keyboard reachability and visible focus
  await send('Runtime.evaluate', { expression: `document.activeElement?.blur()` })
  let keyboardData
  for (let step = 0; step < 30; step += 1) {
    await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
    const keyboardResult = await send('Runtime.evaluate', {
      expression: `(() => {
        const focused = document.activeElement;
        const style = getComputedStyle(focused);
        return {
          focusedId: focused?.id,
          pressed: focused?.getAttribute('aria-pressed'),
          tabIndex: focused?.tabIndex,
          outlineWidth: style.outlineWidth,
          outlineStyle: style.outlineStyle,
        };
      })()`,
      returnByValue: true,
    })
    keyboardData = keyboardResult.result.value
    if (keyboardData.focusedId === 'cat-web-y-conversion') break
  }
  assert.equal(keyboardData.focusedId, 'cat-web-y-conversion', 'Category button must accept keyboard focus')
  assert.equal(keyboardData.tabIndex, 0, 'Every category button must remain in native tab order')
  assert.equal(keyboardData.pressed, 'false', 'Focused category must expose its selection state')
  assert.notEqual(keyboardData.outlineStyle, 'none', 'Keyboard-focused category must expose a visible outline')
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 })
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 })
  await sleep(100)
  const keyboardActivation = await send('Runtime.evaluate', {
    expression: `(() => ({
      activeId: document.querySelector('.blogCategoryBtn.isCategoryActive')?.id,
      cards: document.querySelectorAll('.blogPostCard').length,
    }))()`,
    returnByValue: true,
  })
  assert.equal(keyboardActivation.result.value.activeId, 'cat-web-y-conversion', 'Space must activate the focused category button')
  assert.equal(keyboardActivation.result.value.cards, 2, 'Keyboard activation must apply the web category')
  console.log(`PASS [Keyboard]: focused and activated ${keyboardData.focusedId} with Space and ${keyboardData.outlineWidth} outline`)

  // 2. Filter by category
  await send('Runtime.evaluate', {
    expression: `document.querySelector('#cat-software-y-sistemas')?.click()`,
  })
  await sleep(100)

  const catFilterResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const activeBtn = document.querySelector('.blogCategoryBtn.isCategoryActive');
      const cards = Array.from(document.querySelectorAll('.blogPostCard'));
      const statusText = document.querySelector('#blog-results-status')?.innerText.trim();
      const firstTitle = cards[0]?.querySelector('.blogPostCardTitle')?.innerText.trim();
      return {
        activeId: activeBtn?.id,
        cardCount: cards.length,
        statusText,
        firstTitle,
      };
    })()`,
    returnByValue: true,
  })

  const catData = catFilterResult.result.value
  assert.equal(catData.activeId, 'cat-software-y-sistemas', 'Software category should be active')
  assert.equal(catData.cardCount, 2, 'Software category must include both current articles')
  assert.ok(catData.firstTitle.includes('LISA'), 'Newest software article should be LISA')
  await send('Runtime.evaluate', { expression: `document.querySelector('#cat-web-y-conversion')?.click()` })
  await sleep(50)
  await send('Runtime.evaluate', { expression: `document.querySelector('#cat-todos')?.click()` })
  await sleep(50)
  const consecutiveResult = await send('Runtime.evaluate', {
    expression: `(() => ({
      activeId: document.querySelector('.blogCategoryBtn.isCategoryActive')?.id,
      cards: document.querySelectorAll('.blogPostCard').length,
    }))()`,
    returnByValue: true,
  })
  assert.equal(consecutiveResult.result.value.activeId, 'cat-todos', 'Consecutive category changes must end in the requested category')
  assert.equal(consecutiveResult.result.value.cards, 7, 'Consecutive category changes must restore all posts')
  console.log(`PASS [Category Filter]: selected software-y-sistemas -> ${catData.cardCount} card shown (${catData.firstTitle})`)

  // 3. Search query typing and highlight verification
  await send('Runtime.evaluate', {
    expression: `document.querySelector('#cat-todos')?.click()`,
  })
  await sleep(50)

  await send('Runtime.evaluate', {
    expression: `(() => {
      const input = document.querySelector('#blog-search-field');
      const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      valueSetter.call(input, 'saas');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    })()`,
  })
  await sleep(100)

  const searchResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const cards = Array.from(document.querySelectorAll('.blogPostCard'));
      const highlights = Array.from(document.querySelectorAll('.blogHighlight'));
      const clearBtn = document.querySelector('.blogSearchClearBtn');
      const statusText = document.querySelector('#blog-results-status')?.innerText.trim();

      return {
        cardCount: cards.length,
        highlightCount: highlights.length,
        hasClearBtn: Boolean(clearBtn),
        clearLabel: clearBtn?.getAttribute('aria-label'),
        clearSize: clearBtn ? Math.min(clearBtn.getBoundingClientRect().width, clearBtn.getBoundingClientRect().height) : 0,
        statusText,
        counts: Object.fromEntries(Array.from(document.querySelectorAll('.blogCategoryBtn')).map((btn) => [btn.id, Number(btn.querySelector('.blogCategoryCount')?.textContent)])),
      };
    })()`,
    returnByValue: true,
  })

  const searchData = searchResult.result.value
  assert.equal(searchData.cardCount, 1, 'Search for "saas" should return 1 matching card')
  assert.ok(searchData.highlightCount >= 1, 'Matching query terms should be highlighted with .blogHighlight')
  assert.ok(searchData.hasClearBtn, 'Clear button should appear when search has input')
  assert.equal(searchData.clearLabel, 'Limpiar búsqueda', 'Clear button must expose an accessible name')
  assert.ok(searchData.clearSize >= 44, 'Clear button must expose at least a 44px square target')
  assert.deepEqual(searchData.counts, {
    'cat-todos': 1,
    'cat-web-y-conversion': 0,
    'cat-automatizacion-y-operaciones': 0,
    'cat-software-y-sistemas': 1,
  }, 'Search must update every category counter from the matching corpus')
  console.log(`PASS [Search Input]: typed "saas" -> ${searchData.cardCount} card, ${searchData.highlightCount} highlight(s), status: "${searchData.statusText}"`)

  // 4. Clear button functionality
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.blogSearchClearBtn')?.click()`,
  })
  await sleep(100)

  const clearResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const input = document.querySelector('#blog-search-field');
      const cards = Array.from(document.querySelectorAll('.blogPostCard'));
      const statusText = document.querySelector('#blog-results-status')?.innerText.trim();

      return {
        inputValue: input?.value,
        cardCount: cards.length,
        statusText,
        focusedId: document.activeElement?.id,
      };
    })()`,
    returnByValue: true,
  })

  const clearData = clearResult.result.value
  assert.equal(clearData.inputValue, '', 'Input should be cleared')
  assert.equal(clearData.cardCount, 7, 'All 7 cards should be restored after clearing search')
  assert.equal(clearData.focusedId, 'blog-search-field', 'Clearing search must return focus to the search field')
  console.log(`PASS [Clear Button]: input reset to empty -> ${clearData.cardCount} cards restored`)

  // 5. Deep-body and special HTML searches, including filter combination
  const search = async (value) => {
    await send('Runtime.evaluate', {
      expression: `(() => {
        const input = document.querySelector('#blog-search-field');
        const setValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setValue.call(input, ${JSON.stringify(value)});
        input.dispatchEvent(new Event('input', { bubbles: true }));
      })()`,
    })
    await sleep(100)
    const evaluated = await send('Runtime.evaluate', {
      expression: `(() => ({
        count: document.querySelectorAll('.blogPostCard').length,
        title: document.querySelector('.blogPostCardTitle')?.innerText.trim(),
        snippet: document.querySelector('.blogPostCardSummary')?.innerText.trim(),
      }))()`,
      returnByValue: true,
    })
    return evaluated.result.value
  }

  const deepBody = await search('transacciones ACID')
  assert.equal(deepBody.count, 1, 'Deep paragraph query must find exactly one article')
  assert.match(deepBody.snippet, /transacciones ACID/i, 'Deep paragraph query must render matching context')

  const whatsappHtml = await search('caducidad transporte')
  assert.equal(whatsappHtml.count, 1, 'WhatsApp HTML query must find exactly one article')
  assert.match(whatsappHtml.title, /WhatsApp/i, 'WhatsApp HTML query must resolve to the special article')
  assert.match(whatsappHtml.snippet, /caducidad o transporte/i, 'WhatsApp HTML query must expose deep body context')
  const searchScreenshot = await capture('blog-index-search-whatsapp.png')

  await send('Runtime.evaluate', { expression: `document.querySelector('#cat-web-y-conversion')?.click()` })
  await sleep(100)
  const combinedResult = await send('Runtime.evaluate', {
    expression: `(() => ({
      cards: document.querySelectorAll('.blogPostCard').length,
      empty: Boolean(document.querySelector('.blogEmptyState')),
      status: document.querySelector('#blog-results-status')?.innerText.trim(),
    }))()`,
    returnByValue: true,
  })
  assert.equal(combinedResult.result.value.cards, 0, 'Category + query must not leak a result from another category')
  assert.ok(combinedResult.result.value.empty, 'Category + query with no matches must show the recoverable empty state')
  console.log(`PASS [Deep Search]: paragraph and WhatsApp HTML matches expose context; category combination fails closed; screenshot=${searchScreenshot.path}, sha256=${searchScreenshot.hash}`)

  // 6. Empty state and reset button recovery
  await send('Runtime.evaluate', { expression: `document.querySelector('.blogEmptyResetBtn')?.click()` })
  await sleep(100)
  await send('Runtime.evaluate', {
    expression: `(() => {
      const input = document.querySelector('#blog-search-field');
      const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      valueSetter.call(input, 'termino_inexistente_xyz_123');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    })()`,
  })
  await sleep(100)

  const emptyStateResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const emptyBlock = document.querySelector('.blogEmptyState');
      const emptyTitle = emptyBlock?.querySelector('.blogEmptyTitle')?.innerText.trim();
      const resetBtn = document.querySelector('.blogEmptyResetBtn');
      const cardsBeforeReset = document.querySelectorAll('.blogPostCard').length;

      return {
        hasEmptyBlock: Boolean(emptyBlock),
        emptyTitle,
        hasResetBtn: Boolean(resetBtn),
        cardsBeforeReset,
      };
    })()`,
    returnByValue: true,
  })

  const emptyData = emptyStateResult.result.value
  assert.ok(emptyData.hasEmptyBlock, 'Empty state container (.blogEmptyState) should render when 0 results match')
  assert.equal(emptyData.emptyTitle, 'Sin artículos', 'Empty state title should read "Sin artículos"')
  assert.equal(emptyData.cardsBeforeReset, 0, 'No cards should render during 0-results state')
  assert.ok(emptyData.hasResetBtn, 'Reset button should be present in empty state')
  const emptyScreenshot = await capture('blog-index-empty.png')

  await send('Runtime.evaluate', {
    expression: `document.querySelector('.blogEmptyResetBtn')?.click()`,
  })
  await sleep(100)

  const resetResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const input = document.querySelector('#blog-search-field');
      const cardsAfterReset = document.querySelectorAll('.blogPostCard').length;
      return {
        cardsAfterReset,
        inputAfterReset: input?.value,
      };
    })()`,
    returnByValue: true,
  })

  const resetData = resetResult.result.value
  assert.equal(resetData.cardsAfterReset, 7, 'Reset button click should restore all 7 cards')
  assert.equal(resetData.inputAfterReset, '', 'Reset button click should clear input')
  console.log(`PASS [Empty State & Reset]: 0-results empty state rendered -> reset clicked -> ${resetData.cardsAfterReset} cards restored; screenshot=${emptyScreenshot.path}, sha256=${emptyScreenshot.hash}`)

  // Real touch dispatch at the mobile viewport, followed by a real link click.
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  })
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })
  await send('Page.navigate', { url: `${origin}/blog/` })
  await sleep(400)
  const anchorPoint = await send('Runtime.evaluate', {
    expression: `(() => {
      const rect = document.querySelector('a[href="#articulos"]').getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, innerWidth: window.innerWidth, innerHeight: window.innerHeight };
    })()`,
    returnByValue: true,
  })
  const anchor = anchorPoint.result.value
  assert.ok(anchor.x >= 0 && anchor.x <= anchor.innerWidth && anchor.y >= 0 && anchor.y <= anchor.innerHeight, 'Article anchor must be touch-visible in the initial mobile viewport')
  await tap(anchor.x, anchor.y)
  await sleep(700)
  const anchorHash = await send('Runtime.evaluate', { expression: 'location.hash', returnByValue: true })
  assert.equal(anchorHash.result.value, '#articulos', 'Touching the visible article anchor must navigate to #articulos')
  const togglePoint = await send('Runtime.evaluate', {
    expression: `(() => {const r = document.querySelector('.blogCategoryMobileToggle').getBoundingClientRect();
      return {x:r.left+r.width/2,y:r.top+r.height/2}})()`, returnByValue: true,
  })
  await tap(togglePoint.result.value.x, togglePoint.result.value.y)
  await sleep(110)
  const touchExpanded = await send('Runtime.evaluate', {
    expression: `document.querySelector('.blogCategoryMobileToggle').getAttribute('aria-expanded')`, returnByValue: true,
  })
  assert.equal(touchExpanded.result.value, 'true', 'Actual touch must open category disclosure')
  await send('Runtime.evaluate', { expression: `document.querySelector('#cat-automatizacion-y-operaciones').scrollIntoView({block:'center'})` })
  await sleep(120)
  const touchPoint = await send('Runtime.evaluate', {
    expression: `(() => {
      const target = document.querySelector('#cat-automatizacion-y-operaciones');
      const rect = target.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const hit = document.elementFromPoint(x, y);
      return {
        x,
        y,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        hitId: hit?.id,
        rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      };
    })()`,
    returnByValue: true,
  })
  const { x, y, innerWidth, innerHeight, hitId, rect } = touchPoint.result.value
  console.log(`Touch target geometry: center=(${x}, ${y}), viewport=${innerWidth}x${innerHeight}, hit=${hitId}, rect=${JSON.stringify(rect)}`)
  assert.ok(x >= 0 && x <= innerWidth && y >= 0 && y <= innerHeight, 'Touch target center must be inside the visual viewport')
  assert.equal(hitId, 'cat-automatizacion-y-operaciones', 'Touch target must be the topmost element at its center point')
  await tap(x, y)
  await sleep(120)
  const touchResult = await send('Runtime.evaluate', {
    expression: `(() => ({
      activeId: document.querySelector('.blogCategoryBtn.isCategoryActive')?.id,
      cards: document.querySelectorAll('.blogPostCard').length,
    }))()`,
    returnByValue: true,
  })
  assert.equal(touchResult.result.value.activeId, 'cat-automatizacion-y-operaciones', 'Touch must activate the automation category')
  assert.equal(touchResult.result.value.cards, 3, 'Touch category activation must show the three automation posts')
  const touchScreenshot = await capture('blog-index-touch-390.png')

  await send('Runtime.evaluate', { expression: `document.querySelector('.blogPostCardSurface')?.click()` })
  await sleep(300)
  const navigationResult = await send('Runtime.evaluate', {
    expression: `(() => ({ path: location.pathname, heading: document.querySelector('h1')?.innerText.trim() }))()`,
    returnByValue: true,
  })
  assert.match(navigationResult.result.value.path, /^\/blog\/[a-z0-9-]+\/$/, 'Card activation must navigate to a canonical article route')
  assert.ok(navigationResult.result.value.heading, 'Navigated article must expose a visible h1')
  console.log(`PASS [Touch & Link]: touch filtered to ${touchResult.result.value.cards} posts; card navigated to ${navigationResult.result.value.path}; screenshot=${touchScreenshot.path}, sha256=${touchScreenshot.hash}`)

  console.log('All visual and interactive responsive verification checks PASSED successfully.')
} finally {
  try { if (ws) ws.close() } catch {}
  try { browser.kill('SIGTERM') } catch {}
  try { rmSync(profile, { recursive: true, force: true }) } catch {}
  try { await new Promise((r) => server.close(r)) } catch {}
}
