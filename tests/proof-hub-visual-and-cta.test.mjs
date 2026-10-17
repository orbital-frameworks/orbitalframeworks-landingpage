import test from 'node:test'
import assert from 'node:assert/strict'
import { accessSync, constants, existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

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

const distDir = resolveDistDir()

test('1. Evidence page prerendered HTML exists and exposes official Gmail compose CTA', () => {
  const evidencePath = join(distDir, 'evidencia/index.html')
  assert.ok(existsSync(evidencePath), 'evidencia/index.html must be prerendered in dist')

  const html = readFileSync(evidencePath, 'utf8')
  assert.ok(html.includes('Trabajo que se puede revisar antes de conversar.'), 'Hero heading must be present')
  assert.ok(html.includes('https://orbitalframeworks.qzz.io/evidencia/'), 'Canonical URL must be present')

  // Verify primary CTA: direct Gmail compose flow with business parameters
  const ctaMatch = html.match(/<a class="btn btnPrimary" href="([^"]+)" target="_blank" rel="noopener noreferrer">Plantear una situación<\/a>/)
  assert.ok(ctaMatch, 'Primary CTA button must exist with text "Plantear una situación" and safe external target')

  const ctaUrl = ctaMatch[1]
  assert.ok(ctaUrl.startsWith('https://mail.google.com/mail/?view=cm'), 'CTA must use the Gmail compose flow')
  assert.ok(ctaUrl.includes('contact.orbitalframeworks%40gmail.com'), 'CTA must preserve official contact email')
  assert.ok(ctaUrl.includes('su=Revisar%20una%20situaci%C3%B3n%20-%20Orbital%20Frameworks'), 'CTA must include encoded subject')
  assert.ok(ctaUrl.includes('body='), 'CTA must include structured template body')

  // Zero secrets, zero unverified phone numbers or unapproved contact channels
  assert.doesNotMatch(html, /sk-[a-zA-Z0-9]+|AIza[0-9A-Za-z-_]{35}/, 'No secrets or API keys in evidence page')
  assert.doesNotMatch(html, /\+51\s*9\d{8}/, 'No unverified phone numbers in evidence page')
})
test('2. Proof hub preserves natural image dimensions and aspect ratios for all 4 projects without crop or distortion', () => {
  const evidencePath = join(distDir, 'evidencia/index.html')
  const html = readFileSync(evidencePath, 'utf8')

  const expectedProjects = [
    {
      title: 'Localisa',
      alt: 'Vista de Localisa',
      width: 1905,
      height: 852,
      expectedRatio: 1905 / 852, // ~2.2359
    },
    {
      title: 'Wasy',
      alt: 'Captura del catálogo público de Wasy con productos y carrito',
      width: 960,
      height: 704,
      expectedRatio: 960 / 704, // ~1.3636
    },
    {
      title: 'Checkio',
      alt: 'Vista de Checkio',
      width: 1917,
      height: 904,
      expectedRatio: 1917 / 904, // ~2.1205
    },
    {
      title: 'PeruLog Pallets',
      alt: 'Vista de PeruLog Pallets',
      width: 1336,
      height: 601,
      expectedRatio: 1336 / 601, // ~2.2229
    },
  ]

  for (const proj of expectedProjects) {
    const escapedAlt = proj.alt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const imgRegex = new RegExp(`<img[^>]*alt="${escapedAlt}"[^>]*>`, 'i')
    const match = html.match(imgRegex)
    assert.ok(match, `Image for ${proj.title} with alt "${proj.alt}" must exist in evidence markup`)

    const tag = match[0]
    const widthMatch = tag.match(/width="(\d+)"/)
    const heightMatch = tag.match(/height="(\d+)"/)

    assert.ok(widthMatch, `Image for ${proj.title} must have explicit width attribute`)
    assert.ok(heightMatch, `Image for ${proj.title} must have explicit height attribute`)

    const width = parseInt(widthMatch[1], 10)
    const height = parseInt(heightMatch[1], 10)

    assert.equal(width, proj.width, `${proj.title} width must equal native dimension ${proj.width}`)
    assert.equal(height, proj.height, `${proj.title} height must equal native dimension ${proj.height}`)

    const ratio = width / height
    assert.ok(
      Math.abs(ratio - proj.expectedRatio) < 0.001,
      `${proj.title} ratio must match native aspect ratio ${proj.expectedRatio}, got ${ratio}`,
    )

    // Ensure async decoding and lazy loading
    assert.ok(tag.includes('loading="lazy"'), `${proj.title} image must use loading="lazy"`)
    assert.ok(tag.includes('decoding="async"'), `${proj.title} image must use decoding="async"`)

    // Ensure no fixed 704px height distortion on non-Wasy projects
    if (proj.title !== 'Wasy') {
      assert.notEqual(height, 704, `${proj.title} must not have hardcoded height 704`)
    }
  }
})

test('3. ProofHubPage.css enforces responsive containment without fixed-height or forced cover cropping', () => {
  const cssPath = join(root, 'src/ProofHubPage.css')
  const css = readFileSync(cssPath, 'utf8')

  // Check rule for .proofItemMedia img
  const mediaImgRuleMatch = css.match(/\.proofItemMedia\s+img\s*\{([^}]+)\}/)
  assert.ok(mediaImgRuleMatch, 'CSS rule for .proofItemMedia img must exist')

  const mediaImgStyles = mediaImgRuleMatch[1]
  assert.ok(mediaImgStyles.includes('object-fit: contain') || mediaImgStyles.includes('object-fit:contain'), 'Must use object-fit: contain')
  assert.ok(mediaImgStyles.includes('height: auto') || mediaImgStyles.includes('height:auto'), 'Must use height: auto to preserve natural ratio')
  assert.ok(mediaImgStyles.includes('width: 100%') || mediaImgStyles.includes('width:100%'), 'Must use width: 100% for fluid grid container')
  assert.doesNotMatch(mediaImgStyles, /object-fit:\s*cover/, 'Must not force object-fit: cover on evidence media')
  assert.doesNotMatch(mediaImgStyles, /aspect-ratio:\s*16\/10/, 'Must not force aspect-ratio: 16/10 on evidence media')

  // Check container .proofItemMedia
  const containerRuleMatch = css.match(/\.proofItemMedia\s*\{([^}]+)\}/)
  assert.ok(containerRuleMatch, 'CSS rule for .proofItemMedia container must exist')
  const containerStyles = containerRuleMatch[1]
  assert.ok(containerStyles.includes('overflow: clip') || containerStyles.includes('overflow:clip') || containerStyles.includes('overflow: hidden') || containerStyles.includes('overflow:hidden'), 'Container must clip overflow neatly')
})

test('4. scripts/verify-wasy-visual.mjs safely handles sandbox environments and avoids EROFS crashes', () => {
  const scriptPath = join(root, 'scripts/verify-wasy-visual.mjs')
  const scriptContent = readFileSync(scriptPath, 'utf8')

  // Verify that screenshotDirectory is configurable and falls back to tmpBase
  assert.ok(scriptContent.includes('QA_SCREENSHOT_DIR'), 'Must respect QA_SCREENSHOT_DIR environment variable')
  assert.ok(scriptContent.includes('orbital-landing-visual-qa'), 'Must use tmp directory as safe fallback')

  // Verify that it does not hardcode writes to docs/
  assert.doesNotMatch(scriptContent, /writeFileSync\(\s*join\([^)]*['"]docs['"]/, 'Must never write screenshots into docs/ repository directory')

  // Verify EROFS/EACCES error handling
  assert.ok(scriptContent.includes('EROFS'), 'Must include EROFS handling')
})

test('5. scripts/verify-wasy-visual.mjs includes 320, 390, 768, and 1440 viewport audits with evidence route verification', () => {
  const scriptPath = join(root, 'scripts/verify-wasy-visual.mjs')
  const scriptContent = readFileSync(scriptPath, 'utf8')

  // Required viewports
  assert.match(scriptContent, /width:\s*320/, 'Must test 320px mobile viewport')
  assert.match(scriptContent, /width:\s*390/, 'Must test 390px mobile viewport')
  assert.match(scriptContent, /width:\s*768/, 'Must test 768px tablet viewport')
  assert.match(scriptContent, /width:\s*1440/, 'Must test 1440px desktop viewport')

  // Evidence route coverage
  assert.match(scriptContent, /path:\s*['"]\/evidencia\/['"]/, 'Must include evidence route in visual test list')
  assert.match(scriptContent, /images\.length,\s*4/, 'Must assert all four project screenshots in evidence route')
  assert.match(scriptContent, /Math\.abs\(naturalRatio\s*-\s*renderedRatio\)\s*<\s*0\.025/, 'Must enforce natural aspect ratio within tight tolerance')
  assert.match(scriptContent, /overflow:\s*document\.documentElement\.scrollWidth\s*>\s*document\.documentElement\.clientWidth/, 'Must verify zero horizontal overflow')
})

test('6. ProofHubPage.css provides responsive breakpoints for 320/390/768 mobile/tablet viewports and 1440 desktop', () => {
  const cssPath = join(root, 'src/ProofHubPage.css')
  const css = readFileSync(cssPath, 'utf8')

  // Breakpoints
  assert.ok(css.includes('@media (max-width:920px)'), 'Must define breakpoint at 920px for tablet/single column collapse')
  assert.ok(css.includes('@media (max-width:640px)'), 'Must define breakpoint at 640px for mobile ergonomics')

  // Responsive single column
  const mq920Match = css.match(/@media\s*\(max-width:\s*920px\)\s*\{([^}]+)\}/)
  assert.ok(mq920Match, 'Must have rules inside 920px media query')
  assert.ok(mq920Match[1].includes('grid-template-columns: 1fr'), 'Must collapse grids to single column on tablet/mobile')

  // Mobile CTA and actions adapt
  const mq640Match = css.match(/@media\s*\(max-width:\s*640px\)\s*\{([\s\S]+?)\}\s*$/)
  assert.ok(mq640Match, 'Must have rules inside 640px media query')
  assert.ok(mq640Match[1].includes('width: 100%'), 'Buttons must expand to full width on mobile viewports')
})
