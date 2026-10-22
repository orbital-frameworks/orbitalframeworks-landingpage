// Deterministic, side-effect-free campaign checks shared by the durable worker.
import { createHash } from 'node:crypto'
import { readFileSync, realpathSync, statSync } from 'node:fs'
import { resolve, relative, isAbsolute } from 'node:path'

export const JOB_SCHEMA = 'orbital.social-release.v1'
export const COMPANY_ID = '134014070'
export const sha256 = data => createHash('sha256').update(data).digest('hex')
export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const hashPattern = /^[a-f0-9]{64}$/
const utc = s => typeof s === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(s) && Number.isFinite(Date.parse(s))

export function assertSafeRelativePath(root, path, type = 'file') {
  if (typeof path !== 'string' || !path || isAbsolute(path) || path.split(/[\\/]/).includes('..'))
    throw new Error('PATH_OUTSIDE_APPROVED_WORKSPACE')
  const absolute = resolve(root, path)
  const real = realpathSync(absolute)
  const rel = relative(realpathSync(root), real)
  if (!rel || rel.startsWith('..') || isAbsolute(rel) || !statSync(real).isFile())
    throw new Error('PATH_OUTSIDE_APPROVED_WORKSPACE')
  if (type === 'pdf' && !path.endsWith('.pdf')) throw new Error('DOCUMENT_MUST_BE_PDF')
  return real
}

export function validateCampaign(job, { now = new Date(), root, manifest, checkFiles = true } = {}) {
  if (!job || job.schema !== JOB_SCHEMA || !slugPattern.test(job.slug || '') || job.companyId !== COMPANY_ID)
    throw new Error('INVALID_CAMPAIGN_OR_COMPANY')
  if (job.approval?.explicit !== true || typeof job.approval?.reference !== 'string' ||
    !/^docs\/social\/[A-Za-z0-9/_-]+\.md$/.test(job.approval.reference))
    throw new Error('EXPLICIT_APPROVAL_MISSING')
  if (!utc(job.scheduledAt) || !utc(job.expiresAt) || Date.parse(job.scheduledAt) >= Date.parse(job.expiresAt))
    throw new Error('INVALID_PUBLISH_WINDOW')
  if (Date.parse(job.expiresAt) - Date.parse(job.scheduledAt) > 72 * 3600000)
    throw new Error('PUBLISH_WINDOW_TOO_BROAD')
  if (!hashPattern.test(job.pdfSha256 || '') || !hashPattern.test(job.copySha256 || ''))
    throw new Error('APPROVED_HASH_MISSING')
  if (typeof job.documentTitle !== 'string' || !job.documentTitle.trim() || job.documentTitle.length > 60)
    throw new Error('DOCUMENT_TITLE_INVALID')
  if (typeof job.campaign !== 'string' || !/^[a-z0-9_]+$/.test(job.campaign))
    throw new Error('INVALID_CAMPAIGN_NAME')
  const canonical = `https://orbitalframeworks.qzz.io/blog/${job.slug}/`
  if (job.canonicalUrl !== canonical) throw new Error('CANONICAL_URL_MISMATCH')
  const url = new URL(job.utmUrl)
  if (url.origin + url.pathname !== canonical.slice(0,-1) && url.origin + url.pathname !== canonical)
    throw new Error('UTM_ARTICLE_MISMATCH')
  if (url.searchParams.get('utm_source') !== 'linkedin' || url.searchParams.get('utm_medium') !== 'organic_social' || url.searchParams.get('utm_campaign') !== job.campaign)
    throw new Error('UTM_CAMPAIGN_MISMATCH')
  if (url.searchParams.size !== 3) throw new Error('UTM_UNAPPROVED_PARAMS')
  if (!Number.isInteger(job.pdfPages) || job.pdfPages < 1 || job.pdfPages > 20)
    throw new Error('PDF_PAGE_COUNT_INVALID')
  const status = manifest?.publications?.[job.slug]
  if (status?.status === 'DISTRIBUTED' || status?.linkedinPostUrl || status?.linkedinPostUrn)
    throw new Error('ALREADY_DISTRIBUTED_NO_DUPLICATE')
  if (manifest && (status?.status !== 'LISTO_PARA_DISTRIBUCION_EXTERNA' ||
    status.gateVerdict !== 'PASS' || status.campaign !== job.campaign || status.utmUrl !== job.utmUrl))
    throw new Error('MANIFEST_NOT_READY_OR_CAMPAIGN_MISMATCH')
  if (checkFiles) {
    if (!root) throw new Error('WORKSPACE_REQUIRED')
    const pdf = assertSafeRelativePath(root, job.pdfPath, 'pdf')
    const copy = assertSafeRelativePath(root, job.copyPath)
    if (sha256(readFileSync(pdf)) !== job.pdfSha256) throw new Error('APPROVED_PDF_SHA_MISMATCH')
    const text = readFileSync(copy, 'utf8').trim()
    if (sha256(text) !== job.copySha256) throw new Error('APPROVED_COPY_SHA_MISMATCH')
    if (!text.includes(job.utmUrl)) throw new Error('APPROVED_COPY_UTM_NOT_PRESENT')
    const approval = readFileSync(assertSafeRelativePath(root,job.approval.reference),'utf8')
    if (!approval.includes(job.copySha256) || !approval.includes(job.pdfSha256) ||
      !/aprobado|aprobaci[oó]n|approved/i.test(approval))
      throw new Error('CAMPAIGN_APPROVAL_DOCUMENT_DOES_NOT_BIND_APPROVED_HASHES')
  }
  const current = now.getTime()
  if (!Number.isFinite(current)) throw new Error('INVALID_CURRENT_TIME')
  if (current < Date.parse(job.scheduledAt)) return 'NOT_DUE'
  if (current > Date.parse(job.expiresAt)) throw new Error('PUBLISH_WINDOW_EXPIRED')
  return 'DUE'
}

export function nextReleaseAction({ job, state, manifest, now, root, checkFiles = true }) {
  // Missing or ambiguous state is not a reason to submit again.
  if (state?.phase === 'SUBMISSION_PENDING' || state?.phase === 'NEEDS_RECONCILIATION') return 'RECONCILE'
  if (state?.phase === 'PUBLISHED_VERIFIED' || state?.phase === 'ALREADY_DISTRIBUTED') return 'SKIP_COMPLETED'
  if (state?.phase === 'PREFLIGHT_FAILED' || state?.phase === 'BLOCKED' || state?.phase === 'RECONCILIATION_FAILED') return 'SKIP_BLOCKED'
  if (state?.phase === 'PREFLIGHT_RETRYABLE' && Date.parse(state.nextRetryAt || '') > now.getTime()) return 'NOT_DUE'
  try {
    const verdict = validateCampaign(job, { now, root, manifest, checkFiles })
    return verdict === 'NOT_DUE' ? 'NOT_DUE' : 'PUBLISH'
  } catch (error) {
    if (error.message === 'ALREADY_DISTRIBUTED_NO_DUPLICATE') return 'SKIP_ALREADY_DISTRIBUTED'
    throw error
  }
}
