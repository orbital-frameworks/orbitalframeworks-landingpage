import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { sha256, JOB_SCHEMA, COMPANY_ID, validateCampaign, nextReleaseAction } from '../scripts/social-release-core.mjs'

const now = new Date('2026-10-23T15:10:00.000Z')
const slug = 'prueba-de-publicacion-autorizada'
const url = `https://orbitalframeworks.qzz.io/blog/${slug}/`
const utm = `${url}?utm_source=linkedin&utm_medium=organic_social&utm_campaign=camp_publication_test`
const make = () => {
  const root = mkdtempSync(join(tmpdir(), 'orbital-social-release-'))
  mkdirSync(join(root, 'docs'))
  mkdirSync(join(root, 'docs/social/canary'),{recursive:true})
  writeFileSync(join(root, 'docs/post.pdf'), '%PDF synthetic fixture')
  const text = `Texto aprobado con enlace: ${utm}`
  writeFileSync(join(root, 'docs/copy.txt'), text)
  const job = {schema:JOB_SCHEMA,slug,companyId:COMPANY_ID,
    approval:{ explicit:true,reference:'docs/social/canary/approved.md'},campaign:'camp_publication_test',
    scheduledAt:'2026-10-23T15:00:00Z',expiresAt:'2026-10-23T16:00:00Z',
    canonicalUrl:url,utmUrl:utm,pdfPath:'docs/post.pdf',pdfSha256:sha256('%PDF synthetic fixture'),
    copyPath:'docs/copy.txt',copySha256:sha256(text),pdfPages:5,documentTitle:'Documento de prueba'}
  writeFileSync(join(root, 'docs/social/canary/approved.md'),
    `Aprobado por el propietario; copy ${job.copySha256}; PDF ${job.pdfSha256}`)
  return {root,job,dispose:()=>rmSync(root,{recursive:true,force:true})}
}
test('approved PDF, copy, author, schedule and campaign are strictly validated',()=>{
  const {root,job,dispose}=make()
  try {
    const ready={publications:{[slug]:{status:'LISTO_PARA_DISTRIBUCION_EXTERNA',gateVerdict:'PASS',campaign:job.campaign,utmUrl:job.utmUrl}}}
    assert.equal(validateCampaign(job,{root,now,manifest:ready}),'DUE')
    assert.equal(validateCampaign(job,{root,now:new Date('2026-10-23T14:30:00Z')}),'NOT_DUE')
    assert.throws(()=>validateCampaign({...job,approval:null},{root,now}),/EXPLICIT_APPROVAL_MISSING/)
    assert.throws(()=>validateCampaign({...job,pdfSha256:'0'.repeat(64)},{root,now}),/APPROVED_PDF_SHA_MISMATCH/)
    assert.throws(()=>validateCampaign({...job,copySha256:'0'.repeat(64)},{root,now}),/APPROVED_COPY_SHA_MISMATCH/)
    assert.throws(()=>validateCampaign({...job,pdfPath:'../outside.pdf'},{root,now}),/PATH_OUTSIDE_APPROVED_WORKSPACE/)
    assert.throws(()=>validateCampaign({...job,companyId:'wrong'},{root,now}),/INVALID_CAMPAIGN_OR_COMPANY/)
    assert.throws(()=>validateCampaign({...job,utmUrl:utm.replace('linkedin','facebook')},{root,now}),/UTM_CAMPAIGN_MISMATCH/)
    assert.throws(()=>validateCampaign(job,{root,now,manifest:{publications:{}}}),/MANIFEST_NOT_READY/)
    assert.throws(()=>validateCampaign({...job,approval:{explicit:true,reference:'FAKE_APPROVAL'}},{root,now}),/EXPLICIT_APPROVAL_MISSING/)
    assert.throws(()=>validateCampaign(job,{root,now:new Date('2026-10-23T16:00:01Z')}),/PUBLISH_WINDOW_EXPIRED/)
    assert.throws(()=>validateCampaign(job,{root,now,manifest:{publications:{[slug]:{status:'DISTRIBUTED'}}}}),/ALREADY_DISTRIBUTED_NO_DUPLICATE/)
  } finally {dispose()}
})
test('pending and completed states can never cause another publishing click',()=>{
  const {root,job,dispose}=make()
  try {
    for (const phase of ['SUBMISSION_PENDING','NEEDS_RECONCILIATION'])
      assert.equal(nextReleaseAction({job,root,now,state:{phase}}),'RECONCILE')
    for (const phase of ['PUBLISHED_VERIFIED','ALREADY_DISTRIBUTED'])
      assert.equal(nextReleaseAction({job,root,now,state:{phase}}),'SKIP_COMPLETED')
    for (const phase of ['PREFLIGHT_FAILED','BLOCKED','RECONCILIATION_FAILED'])
      assert.equal(nextReleaseAction({job,root,now,state:{phase}}),'SKIP_BLOCKED')
    assert.equal(nextReleaseAction({job,root,now,manifest:{publications:{[slug]:{status:'DISTRIBUTED'}}}}),'SKIP_ALREADY_DISTRIBUTED')
    assert.equal(nextReleaseAction({job,root,now:new Date('2026-10-23T14:59:00Z')}),'NOT_DUE')
  } finally {dispose()}
})
