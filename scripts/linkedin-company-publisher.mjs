import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, openSync, closeSync, unlinkSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { runGateCheck, loadManifest } from './blog-linkedin-gate.mjs'

export const COMPANY_ID = '134014070'
export const COMPANY_NAME = 'Orbital Frameworks'
export const HISTORIC_PILOT_SLUG = 'software-a-medida-o-saas-como-decidir'
const DEFAULT_PROFILE_ROOT = '/srv/orbital/runtimes/private/linkedin-company-admin-browser'
const DEFAULT_MODULE_ROOT = '/srv/orbital/workspaces/Content-Factory'
const SHA_RE = /^[a-f0-9]{64}$/

export function parsePackCopy(markdown, expectedUtmUrl) {
  const matches = [...String(markdown).matchAll(/```text\s*\n([\s\S]*?)\n```/g)]
  if (matches.length !== 1) throw new Error('PACK_TEXT_BLOCK_NOT_UNIQUE')
  const copy = matches[0][1].trim()
  if (copy.length < 100 || copy.length > 2900) throw new Error('PACK_TEXT_LENGTH_INVALID')
  const links = copy.match(/https?:\/\/[^\s]+/g) ?? []
  if (links.length !== 1 || links[0] !== expectedUtmUrl) throw new Error('PACK_UTM_MISMATCH')
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(copy)) throw new Error('PACK_CONTROL_CHARACTER')
  return copy
}

export function digestCopy(copy) {
  return createHash('sha256').update(copy, 'utf8').digest('hex')
}

export function assertPublishAuthorization({ slug, digest, approvedDigest, manifest, allowHistoricFollowup = false }) {
  if (!SHA_RE.test(approvedDigest || '') || approvedDigest !== digest) throw new Error('EXACT_COPY_APPROVAL_REQUIRED')
  if (slug === HISTORIC_PILOT_SLUG && !allowHistoricFollowup) throw new Error('HISTORIC_TOPIC_FOLLOWUP_REQUIRES_SEPARATE_APPROVAL')
  if (manifest?.policy?.historicalPostsImmutable !== true) throw new Error('HISTORIC_POST_PROTECTION_MISSING')
  const record = manifest.publications?.[slug]
  if (!record || record.status !== 'LISTO_PARA_DISTRIBUCION_EXTERNA' || record.gateVerdict !== 'PASS')
    throw new Error('NOT_READY_FOR_DISTRIBUTION')
  if (record.linkedinPostUrl || record.status === 'DISTRIBUTED') throw new Error('ALREADY_DISTRIBUTED')
  if (record.autopostAuthorized === true || manifest.policy.autopostAllowed === true)
    throw new Error('BULK_AUTOPOST_POLICY_NOT_SUPPORTED')
}

export function detectExistingPost(cards, utmUrl, firstLine) {
  return cards.find(x => x.text.includes(utmUrl) || (x.text.includes(firstLine) && x.text.includes('Orbital Frameworks'))) ?? null
}

function getBrowserPackage() {
  try { return createRequire(import.meta.url)('playwright') } catch {}
  const moduleRoot = process.env.ORBITAL_LINKEDIN_PLAYWRIGHT_ROOT || DEFAULT_MODULE_ROOT
  try { return createRequire(join(moduleRoot, 'package.json'))('playwright') }
  catch { throw new Error('PLAYWRIGHT_NOT_AVAILABLE: set ORBITAL_LINKEDIN_PLAYWRIGHT_ROOT to an existing audited Playwright install') }
}

export function livePostLink(post) {
  const urn = post?.shareUrn || post?.urn
  if (!/^urn:li:(share|activity):\d+$/.test(urn || '')) throw new Error('PUBLISHED_POST_ID_UNVERIFIED')
  return `https://www.linkedin.com/feed/update/${urn}?actorCompanyId=${COMPANY_ID}`
}

export async function openCompanyBrowser({ profileRoot = DEFAULT_PROFILE_ROOT } = {}) {
  const { chromium } = getBrowserPackage()
  const context = await chromium.launchPersistentContext(join(profileRoot, 'profile'), {
    executablePath: '/usr/bin/google-chrome', headless: true,
    viewport: { width: 1360, height: 950 },
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--no-first-run'],
    timeout: 24000,
  })
  return context
}

async function companyPage(context) {
  const page = context.pages()[0] || await context.newPage()
  const response = await page.goto(`https://www.linkedin.com/company/${COMPANY_ID}/admin/page-posts/published`, {waitUntil:'domcontentloaded',timeout:24000})
  await page.getByRole('button', { name: /Crear publicación|Create a post/i }).first().waitFor({ state: 'visible', timeout: 12000 })
  const heading = await page.locator('body').innerText()
  if (response?.status() !== 200 || !heading.includes(COMPANY_NAME) || !page.url().includes(`/company/${COMPANY_ID}/admin/`))
    throw new Error('CORPORATE_ADMIN_SESSION_UNVERIFIED')
  return page
}

async function recentCompanyPosts(page) {
  return page.evaluate(() => [...document.querySelectorAll('[data-urn^="urn:li:activity:"]')].map(card => {
    const promo = card.querySelector('a[href*="/ad-beta/boost/"]')
    let shareUrn = null
    if (promo) { try { shareUrn = new URL(promo.href).searchParams.get('content') } catch {} }
    return { urn: card.getAttribute('data-urn'), shareUrn, text: card.textContent ?? '' }
  }))
}

function atomicJson(path, value) {
  const temp = `${path}.new-${process.pid}`
  writeFileSync(temp, JSON.stringify(value, null, 2) + '\n', { mode: 0o600 })
  renameSync(temp, path)
}

export function registerReceipt({ manifestPath, slug, post, digest, utmUrl, now = new Date().toISOString() }) {
  const url = livePostLink(post)
  const m = loadManifest(manifestPath)
  if (!m.publications?.[slug] || m.publications[slug].status !== 'LISTO_PARA_DISTRIBUCION_EXTERNA')
    throw new Error('MANIFEST_CHANGED_DURING_PUBLICATION')
  if (m.publications[slug].utmUrl !== utmUrl) throw new Error('MANIFEST_URL_CHANGED_DURING_PUBLICATION')
  if (m.publications[slug].linkedinPostUrl) throw new Error('DUPLICATE_RECEIPT')
  m.publications[slug] = {
    ...m.publications[slug], status: 'DISTRIBUTED', publishedAt: now,
    linkedinPostUrl: url, linkedinPostUrn: post.shareUrn || post.urn,
    approvedCopySha256: digest, utmUrl,
  }
  m.lastUpdated = now
  atomicJson(manifestPath, m)
  return url
}

async function loadPrepared({ root, slug }) {
  const manifestPath = resolve(root, 'docs/blog-linkedin-manifest.json')
  const manifest = loadManifest(manifestPath)
  const relativePack = manifest.publications?.[slug]?.packPath
  if (!relativePack || !/^docs\/linkedin-[a-z0-9-]+\.md$/.test(relativePack))
    throw new Error('PREPARED_EDITORIAL_PACK_NOT_FOUND')
  const packPath = resolve(root, relativePack)
  const markdown = readFileSync(packPath, 'utf8')
  const sections = [...markdown.matchAll(/```text\s*\n([\s\S]*?)\n```/g)]
  if (sections.length !== 1) throw new Error('PACK_TEXT_BLOCK_NOT_UNIQUE')
  // The public article must pass RIGHT BEFORE company navigation; local HTML is insufficient.
  const gate = await runGateCheck({ rootPath: root, slug, dryRun: true, customCopy: sections[0][1] })
  if (!gate.ok || gate.verdict !== 'PASS') throw new Error(`LIVE_ARTICLE_GATE_FAILED:${gate.errorCode || gate.failedChecks?.map(x=>x.id).join(',') || 'unknown'}`)
  const text = parsePackCopy(markdown, gate.utmUrl)
  return { gate, text, digest: digestCopy(text), manifestPath }
}

export async function runCompanyPublication({ root = resolve(dirname(fileURLToPath(import.meta.url)), '..'),
  slug, mode = 'preview', approvedDigest, allowHistoricFollowup = false,
  profileRoot = DEFAULT_PROFILE_ROOT, browserFactory = openCompanyBrowser } = {}) {
  if (!['preview', 'probe', 'composer-check', 'publish'].includes(mode)) throw new Error('INVALID_MODE')
  if (mode === 'probe') {
    const context = await browserFactory({profileRoot})
    try {
      const page = await companyPage(context)
      return { status: 'ADMIN_SESSION_VERIFIED', companyId: COMPANY_ID, path: new URL(page.url()).pathname }
    } finally { await context.close() }
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || '')) throw new Error('SLUG_REQUIRED')
  const prepared = await loadPrepared({ root, slug })
  const {gate, text, digest, manifestPath} = prepared
  const common = { status:'READY_FOR_APPROVAL', slug, companyId: COMPANY_ID, digest, length: text.length, utmUrl: gate.utmUrl }
  if (mode === 'preview') return { ...common, publishableWithoutApproval: false, historicFollowup: slug === HISTORIC_PILOT_SLUG }
  if (mode === 'composer-check') {
    const context = await browserFactory({profileRoot})
    try {
      const page = await companyPage(context)
      await page.getByRole('button',{name:/Crear publicación|Create a post/i}).first().click()
      const dialog = page.getByRole('dialog').last()
      await dialog.waitFor({state:'visible',timeout:12000})
      await dialog.getByText(COMPANY_NAME, {exact:true}).first().waitFor({state:'visible',timeout:8000})
      if (!(await dialog.innerText()).includes(COMPANY_NAME)) throw new Error('WRONG_AUTHOR')
      const editor = dialog.locator('[role="textbox"][contenteditable="true"]').first()
      await editor.fill(text)
      await page.waitForTimeout(950)
      const actual = await editor.evaluate(el => [...el.children].map(x => x.textContent || '').join('\n'))
      if (actual !== text) throw new Error('COMPOSER_TEXT_MISMATCH')
      if (!await dialog.getByRole('button',{name:/^(Publicar|Post)$/i}).first().isEnabled())
        throw new Error('PUBLISH_BUTTON_NOT_READY')
      return {...common,status:'COMPOSER_READY_NO_SUBMISSION',publishableWithoutApproval:false}
    } finally { await context.close() }
  }
  const manifest = loadManifest(manifestPath)
  assertPublishAuthorization({slug, digest, approvedDigest, manifest, allowHistoricFollowup})
  if (manifest.publications[slug].utmUrl !== gate.utmUrl || manifest.publications[slug].campaign !== gate.campaign)
    throw new Error('MANIFEST_CAMPAIGN_OR_URL_CHANGED')

  const journalRoot = join(profileRoot, 'publication-journal')
  mkdirSync(journalRoot, { recursive: true, mode: 0o700 })
  const lockFile = join(journalRoot, '.publish.lock')
  let lock
  try { lock = openSync(lockFile, 'wx', 0o600) }
  catch { throw new Error('PUBLISH_ALREADY_IN_PROGRESS_OR_STALE_LOCK') }
  const journalPath = join(journalRoot, `${slug}.json`)
  let context
  try {
    if (existsSync(journalPath)) throw new Error('JOURNAL_EXISTS_RECONCILE_BEFORE_RETRY')
    context = await browserFactory({profileRoot})
    const page = await companyPage(context)
    let published = await recentCompanyPosts(page)
    const firstLine = text.split('\n')[0].slice(0,100)
    const dup = detectExistingPost(published, gate.utmUrl, firstLine)
    if (dup) throw new Error(`REMOTE_DUPLICATE_EXISTS:${dup.shareUrn || dup.urn}`)
    await page.getByRole('button',{name:/Crear publicación|Create a post/i}).first().click()
    const dialog = page.getByRole('dialog').last()
    await dialog.waitFor({ state: 'visible', timeout: 12000 })
    await dialog.getByText(COMPANY_NAME, {exact:true}).first().waitFor({state:'visible',timeout:8000})
    const authorLabel = await dialog.innerText()
    if (!authorLabel.includes(COMPANY_NAME)) throw new Error('WRONG_AUTHOR')
    const editor = dialog.locator('[role="textbox"][contenteditable="true"]').first()
    await editor.fill(text)
    await page.waitForTimeout(950)
    const actual = await editor.evaluate(el => [...el.children].map(x => x.textContent || '').join('\n'))
    if (actual !== text) throw new Error('COMPOSER_TEXT_MISMATCH')
    const button = dialog.getByRole('button',{name:/^(Publicar|Post)$/i}).first()
    if (!await button.isEnabled()) throw new Error('PUBLISH_BUTTON_NOT_READY')
    // An on-disk pending receipt ensures a crash never retries a possibly sent post.
    atomicJson(journalPath, {phase:'SUBMISSION_PENDING',slug,digest,utmUrl:gate.utmUrl,at:new Date().toISOString()})
    await button.click({timeout:12000})
    await page.waitForTimeout(2200)
    await page.goto(`https://www.linkedin.com/company/${COMPANY_ID}/admin/page-posts/published`,{waitUntil:'domcontentloaded',timeout:24000})
    await page.waitForTimeout(1700)
    published = await recentCompanyPosts(page)
    const post = published.find(x => x.text.includes(gate.utmUrl) && x.text.includes(firstLine))
    if (!post) throw new Error('SUBMITTED_BUT_REMOTE_RECEIPT_MISSING_DO_NOT_RETRY')
    const publicUrl = livePostLink(post)
    const publicResp = await page.goto(publicUrl,{waitUntil:'domcontentloaded',timeout:24000})
    const publicText = await page.locator('body').innerText()
    if (publicResp?.status() !== 200 || !publicText.includes(firstLine) || !publicText.includes(gate.utmUrl))
      throw new Error('SUBMITTED_BUT_PUBLIC_CONFIRMATION_MISSING_DO_NOT_RETRY')
    const receiptUrl = registerReceipt({manifestPath,slug,post,digest,utmUrl:gate.utmUrl})
    atomicJson(journalPath,{phase:'PUBLISHED_VERIFIED',slug,digest,postUrl:receiptUrl,at:new Date().toISOString()})
    return { status:'PUBLISHED_VERIFIED', slug, postUrl: receiptUrl, companyId: COMPANY_ID }
  } finally {
    if (context) await context.close().catch(()=>{})
    if (lock !== undefined) closeSync(lock)
    try { unlinkSync(lockFile) } catch {}
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const args = process.argv.slice(2)
  const mode = args.includes('--publish') ? 'publish' : args.includes('--composer-check') ? 'composer-check' : args.includes('--probe') ? 'probe' : 'preview'
  const getArg = name => { const i = args.indexOf(name); return i < 0 ? null : args[i+1] }
  const slug = getArg('--slug') || HISTORIC_PILOT_SLUG
  runCompanyPublication({
    mode,slug,approvedDigest:getArg('--approve-sha256'),
    allowHistoricFollowup:args.includes('--allow-historic-followup'),
  }).then(result=>console.log(JSON.stringify(result,null,2))).catch(err=>{
    console.error(JSON.stringify({status:'BLOCKED',reason:err.message},null,2))
    process.exitCode=1
  })
}
