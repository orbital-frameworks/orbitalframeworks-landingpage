import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { generateLinkedInPack } from '../scripts/blog-linkedin-gate.mjs'
import {
  parsePackCopy, digestCopy, assertPublishAuthorization,
  detectExistingPost, livePostLink, registerReceipt,
  HISTORIC_PILOT_SLUG, COMPANY_ID,
} from '../scripts/linkedin-company-publisher.mjs'

const slug = HISTORIC_PILOT_SLUG
const utm = 'https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/?utm_source=linkedin&utm_medium=organic_social&utm_campaign=pilot_saas_vs_custom'
const copy = 'Antes de elegir un sistema, conviene revisar el proceso y el costo de su mantenimiento.\n\nMira la guía completa: '+utm
const pack = '# Pack\n\n'+String.fromCharCode(96).repeat(3)+'text\n'+copy+'\n'+String.fromCharCode(96).repeat(3)+'\n'
const ready = () => ({
  policy: { historicalPostsImmutable: true, autopostAllowed:false },
  publications: { [slug]: { status:'LISTO_PARA_DISTRIBUCION_EXTERNA', gateVerdict:'PASS',campaign:'pilot_saas_vs_custom',utmUrl:utm } }
})

test('parses exactly one approved text block with precisely the verified UTM',()=>{
  assert.equal(parsePackCopy(pack,utm),copy)
  assert.match(digestCopy(copy),/^[a-f0-9]{64}$/)
  assert.throws(()=>parsePackCopy(pack,utm+'changed'),/PACK_UTM_MISMATCH/)
  assert.throws(()=>parsePackCopy(pack+pack,utm),/PACK_TEXT_BLOCK_NOT_UNIQUE/)
  assert.throws(()=>parsePackCopy('no fenced block',utm),/PACK_TEXT_BLOCK_NOT_UNIQUE/)
})
test('a new article must have its own reviewed LinkedIn copy, not the SaaS template',()=>{
  const opts={slug:'un-nuevo-tema',title:'Un nuevo tema',utmUrl:utm,campaign:'camp_un_nuevo_tema',gateVerdict:'PASS'}
  assert.throws(()=>generateLinkedInPack(opts),/EDITORIAL_COPY_REQUIRED/)
  const generated=generateLinkedInPack({...opts,customCopy:copy})
  assert.match(generated,/Antes de elegir un sistema/)
  assert.match(generated,/linkedin-un-nuevo-tema-handoff\.md/)
})
test('publishing requires exact sha256 and protects historic pilot unless explicitly approved as follow-up',()=>{
  const digest=digestCopy(copy), m=ready()
  assert.throws(()=>assertPublishAuthorization({slug,digest,manifest:m}),/EXACT_COPY_APPROVAL_REQUIRED/)
  assert.throws(()=>assertPublishAuthorization({slug,digest,approvedDigest:'0'.repeat(64),manifest:m}),/EXACT_COPY_APPROVAL_REQUIRED/)
  assert.throws(()=>assertPublishAuthorization({slug,digest,approvedDigest:digest,manifest:m}),/HISTORIC_TOPIC_FOLLOWUP/)
  assert.doesNotThrow(()=>assertPublishAuthorization({slug,digest,approvedDigest:digest,manifest:m,allowHistoricFollowup:true}))
  const other=ready()
  other.publications[slug].status='DISTRIBUTED'
  assert.throws(()=>assertPublishAuthorization({slug,digest,approvedDigest:digest,manifest:other,allowHistoricFollowup:true}),/NOT_READY_FOR_DISTRIBUTION/)
  m.policy.autopostAllowed=true
  assert.throws(()=>assertPublishAuthorization({slug,digest,approvedDigest:digest,manifest:m,allowHistoricFollowup:true}),/BULK_AUTOPOST_POLICY_NOT_SUPPORTED/)
})
test('remote duplicate detection and public URL require grounded post identifiers',()=>{
  assert.equal(detectExistingPost([{urn:'urn:li:activity:1',text:copy}],utm,copy.split('\n')[0]).urn,'urn:li:activity:1')
  assert.equal(detectExistingPost([{urn:'urn:li:activity:2',text:'unrelated'}],utm,copy.split('\n')[0]),null)
  assert.equal(livePostLink({shareUrn:'urn:li:share:7516883410074836992'}),
    'https://www.linkedin.com/feed/update/urn:li:share:7516883410074836992?actorCompanyId='+COMPANY_ID)
  assert.throws(()=>livePostLink({urn:'unverified'}),/PUBLISHED_POST_ID_UNVERIFIED/)
})
test('receipt writes precise post URL and prevents second manifest recording',()=>{
  const root=mkdtempSync(join(tmpdir(),'orbital-linkedin-receipt-'))
  const file=join(root,'manifest.json')
  try{
    writeFileSync(file,JSON.stringify(ready()))
    const url=registerReceipt({manifestPath:file,slug,post:{shareUrn:'urn:li:share:998877665544'},digest:digestCopy(copy),utmUrl:utm,now:'2026-10-17T20:00:00.000Z'})
    assert.match(url,/urn:li:share:998877665544/)
    const record=JSON.parse(readFileSync(file,'utf8')).publications[slug]
    assert.equal(record.status,'DISTRIBUTED')
    assert.equal(record.approvedCopySha256,digestCopy(copy))
    assert.equal(record.utmUrl,utm)
    assert.throws(()=>registerReceipt({manifestPath:file,slug,post:{shareUrn:'urn:li:share:1'},digest:digestCopy(copy),utmUrl:utm}),/MANIFEST_CHANGED_DURING_PUBLICATION/)
  }finally{rmSync(root,{recursive:true,force:true})}
})
