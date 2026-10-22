#!/usr/bin/env node
// B2B-03 release-specific LinkedIn document publisher. Never falls back to text-only.
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync, openSync, closeSync, unlinkSync, renameSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { openCompanyBrowser } from './linkedin-company-publisher.mjs'
import { runGateCheck, generateUtmUrl } from './blog-linkedin-gate.mjs'

const mode = process.argv.includes('--publish') ? 'publish' : 'preflight'
const root = resolve(import.meta.dirname, '..')
const slug = 'landing-page-b2b-tecnica-vs-web-corporativa'
const campaign = 'camp_b2b_landing_vs_corp'
const companyId = '134014070'
const base = `https://orbitalframeworks.qzz.io/blog/${slug}/`
const expectedPdfHash = '721b83695e651ecf034700d847f17bdbb5d6828f2b544227c5d8f1dd54ea946f'
const expectedCopyHash = '04e52f18ca35e47d80d631da023bba731c536f7de4a812d480be45344a4e5892'
const pdf = join(root, 'docs/social/b2b03/v4/orbital-b2b03-carousel-v4.pdf')
const docTitle = 'Landing B2B o web corporativa | Orbital Frameworks'
const profileRoot = '/srv/orbital/runtimes/private/linkedin-company-admin-browser'
const journalRoot = join(profileRoot, 'publication-journal')
const journalPath = join(journalRoot, `${slug}.json`)
const receiptPath = join(root, 'docs/social/b2b03/v4/LINKEDIN_RELEASE_20261022.json')

const hash = (data) => createHash('sha256').update(data).digest('hex')
const output = (data) => console.log(JSON.stringify(data, null, 2))
const assert = (condition, message) => { if (!condition) throw new Error(message) }
const writeJournal = (data) => {
  const tmp = `${journalPath}.${process.pid}.tmp`
  writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', { mode: 0o600 })
  renameSync(tmp, journalPath)
}

async function main() {
  const pdfDigest = hash(readFileSync(pdf))
  assert(pdfDigest === expectedPdfHash, 'APPROVED_PDF_SHA_MISMATCH')
  const manifest = JSON.parse(readFileSync(join(root, 'docs/social/b2b03/v4/render-manifest.json'), 'utf8'))
  assert(manifest.canvas?.count === 5, 'APPROVED_PDF_PAGE_COUNT_MISMATCH')
  const brief = readFileSync(join(root, 'docs/social/b2b03/publishing-brief.md'), 'utf8')
  const match = brief.match(/## Copy LinkedIn[^]*?```text\s*([\s\S]*?)\s*```/)
  assert(match, 'APPROVED_COPY_NOT_FOUND')
  const utmUrl = generateUtmUrl(base, campaign)
  const text = match[1].trim().replaceAll('{{UTM_URL}}', utmUrl)
  const copyDigest = hash(text)
  assert(copyDigest === expectedCopyHash, 'APPROVED_COPY_SHA_MISMATCH')
  const gate = await runGateCheck({ slug, dryRun: true, customCopy: text })
  assert(gate.ok && gate.verdict === 'PASS' && gate.checks.length === 15, 'LIVE_BLOG_GATE_FAILED')

  assert(!existsSync(journalPath), 'PRIOR_SUBMISSION_JOURNAL_EXISTS_RECONCILE_FIRST')
  assert(!existsSync(receiptPath), 'LINKEDIN_POST_RECEIPT_EXISTS_NO_DUPLICATE')
  if (mode === 'publish') {
    const limaNow = new Date().toLocaleString('sv-SE', { timeZone: 'America/Lima', hour12: false }).replace(' ', 'T')
    assert(limaNow >= '2026-10-22T10:00:00', 'BEFORE_APPROVED_10AM_PUBLISH_WINDOW')
  }

  let lock = null
  const lockPath = join(journalRoot, '.b2b03-document-publish.lock')
  if (mode === 'publish') {
    mkdirSync(journalRoot, { recursive: true, mode: 0o700 })
    lock = openSync(lockPath, 'wx', 0o600)
  }
  let context
  try {
    context = await openCompanyBrowser()
    const page = context.pages()[0] || await context.newPage()
    const response = await page.goto(`https://www.linkedin.com/company/${companyId}/admin/page-posts/published/`, { waitUntil: 'domcontentloaded', timeout: 24000 })
    assert(response?.status() === 200 && page.url().includes(`/company/${companyId}/admin`), 'WRONG_COMPANY_ADMIN')
    await page.locator('[data-urn^="urn:li:activity:"]').first().waitFor({ state: 'attached', timeout: 20000 })
    const firstLine = text.split('\n')[0]
    const recent = await page.locator('[data-urn^="urn:li:activity:"]').evaluateAll(cards => cards.map(el => ({
      urn: el.getAttribute('data-urn'), text: el.innerText || '',
    })))
    assert(!recent.some(post => post.text.includes(firstLine) || post.text.includes('camp_b2b_landing_vs_corp')), 'LINKEDIN_DUPLICATE_FOUND')

    await page.getByRole('button', { name: /Crear publicación|Create a post/i }).first().click()
    let dialog = page.getByRole('dialog').last()
    await dialog.waitFor({ state: 'visible', timeout: 12000 })
    // LinkedIn mounts an empty dialog before hydrating the corporate author.
    // Wait for the actual author instead of rejecting the skeleton immediately.
    await dialog.getByText('Orbital Frameworks', { exact: true }).first()
      .waitFor({ state: 'visible', timeout: 12000 })
    assert((await dialog.innerText()).includes('Orbital Frameworks'), 'LINKEDIN_WRONG_AUTHOR')
    // The approved ordering matters: typing a URL before opening the document
    // picker can replace the upload surface with a link preview on LinkedIn.
    await dialog.getByRole('button', { name: 'Más', exact: true }).click()
    await page.getByRole('button', { name: 'Añadir un documento' }).click()
    const fileInput = page.locator('input[type="file"]').last()
    await fileInput.waitFor({ state: 'attached', timeout: 9000 })
    await fileInput.setInputFiles(pdf)
    const uploadDialog = page.getByRole('dialog').last()
    await uploadDialog.getByText('orbital-b2b03-carousel-v4.pdf', { exact: true }).waitFor({ state: 'visible', timeout: 15000 })
    await uploadDialog.getByPlaceholder('Añade un título descriptivo al documento').fill(docTitle)
    await uploadDialog.getByRole('button', { name: 'Hecho' }).click()
    dialog = page.getByRole('dialog').last()
    await dialog.getByText('Tu documento ha terminado de cargarse').waitFor({ state: 'visible', timeout: 60000 })
    assert(await dialog.getByRole('button', { name: 'Eliminar contenido multimedia' }).count() === 1, 'PDF_NOT_ATTACHED_TO_COMPOSER')

    const editor = dialog.locator('[role="textbox"][contenteditable="true"]').first()
    await editor.fill(text)
    await page.waitForTimeout(900)
    const actualCopy = await editor.evaluate(el => [...el.children].map(x => x.textContent || '').join('\n'))
    assert(actualCopy === text, 'LINKEDIN_COPY_NOT_EXACT')
    assert((await dialog.innerText()).includes('Tu documento ha terminado de cargarse'), 'DOCUMENT_PREVIEW_LOST')
    const publish = dialog.getByRole('button', { name: /^(Publicar|Post)$/i }).first()
    assert(await publish.isEnabled(), 'PUBLISH_BUTTON_DISABLED')

    if (mode === 'preflight') {
      output({ status: 'PREVIEW_READY_NO_SUBMISSION', gate: '15/15', author: 'Orbital Frameworks',
        companyId, pdfSha256: pdfDigest, pdfPages: manifest.canvas.count, documentLoaded: true,
        textSha256: copyDigest, exactCopy: true, utmUrl, journalCreated: false })
      return
    }

    // Exactly one potentially irreversible click. If any step after this
    // becomes ambiguous, preserve SUBMISSION_PENDING for reconciliation.
    const pending = { phase: 'SUBMISSION_PENDING', slug, companyId, pdfSha256: pdfDigest,
      copySha256: copyDigest, utmUrl, submittedAt: new Date().toISOString() }
    writeFileSync(journalPath, JSON.stringify(pending, null, 2) + '\n', { flag: 'wx', mode: 0o600 })
    await publish.click({ timeout: 12000 })
    await dialog.waitFor({ state: 'hidden', timeout: 30000 })

    let post = null
    for (let attempt = 0; attempt < 4 && !post; attempt++) {
      await page.goto(`https://www.linkedin.com/company/${companyId}/admin/page-posts/published/`, { waitUntil: 'domcontentloaded', timeout: 24000 })
      await page.locator('[data-urn^="urn:li:activity:"]').first().waitFor({ state: 'attached', timeout: 20000 })
      await page.waitForTimeout(1500 + attempt * 1400)
      const cards = await page.locator('[data-urn^="urn:li:activity:"]').evaluateAll(els => els.map(el => ({
        urn: el.getAttribute('data-urn'), text: el.innerText || '',
      })))
      post = cards.find(x => x.text.includes(firstLine))
    }
    assert(post && /^urn:li:activity:\d+$/.test(post.urn), 'PUBLISHED_RECEIPT_AMBIGUOUS_DO_NOT_RETRY')
    const url = `https://www.linkedin.com/feed/update/${post.urn}?actorCompanyId=${companyId}`
    const publicResponse = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 24000 })
    await page.waitForTimeout(2200)
    const publicBody = await page.locator('body').innerText()
    assert(publicResponse?.status() === 200 && publicBody.includes(firstLine), 'PUBLIC_POST_NOT_VERIFIED_DO_NOT_RETRY')
    const receipt = { status: 'PUBLISHED_VERIFIED', slug, url, urn: post.urn, companyId,
      pdfSha256: pdfDigest, pdfPages: manifest.canvas.count, copySha256: copyDigest,
      utmUrl, postTextVerified: true, postedAt: new Date().toISOString(),
      documentVisibleHint: /Landing B2B o web corporativa|documento|document/i.test(publicBody) }
    writeJournal({ ...pending, ...receipt, phase: 'PUBLISHED_VERIFIED' })
    writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' })
    output(receipt)
  } finally {
    if (context) await context.close().catch(() => {})
    if (lock !== null) {
      closeSync(lock)
      unlinkSync(lockPath)
    }
  }
}

main().catch(error => { console.error(JSON.stringify({ status: 'FAIL_OR_AMBIGUOUS_DO_NOT_RETRY', reason: error.message })); process.exitCode = 1 })
