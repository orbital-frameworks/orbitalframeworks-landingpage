import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, utimesSync, closeSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { acquireRunLock } from '../scripts/social-release-runner.mjs'

const root=resolve(import.meta.dirname,'..')
const cli=join(root,'scripts/social-release-runner.mjs')
function homeFixture(fn) {
  const home=mkdtempSync(join(tmpdir(),'social-release-queue-'))
  mkdirSync(join(home,'queue'),{mode:0o700})
  try{return fn(home)}finally{rmSync(home,{recursive:true,force:true})}
}
function run(home) {
  const output=execFileSync(process.execPath,[cli,'--dry-run'],{
    env:{...process.env,SOCIAL_RELEASE_HOME:home,SOCIAL_RELEASE_PROJECT_ROOT:root},encoding:'utf8',timeout:15000})
  return output.trim().split('\n').filter(Boolean).map(JSON.parse)
}
test('empty owner queue cannot submit anything',()=>homeFixture(home=>{
  assert.deepEqual(run(home),[{status:'NO_APPROVED_RELEASES',publisherClicks:0}])
}))
test('an already-distributed B2B-03 can never be resubmitted from the queue',()=>homeFixture(home=>{
  const slug='landing-page-b2b-tecnica-vs-web-corporativa'
  const job={schema:'orbital.social-release.v1',slug,companyId:'134014070',
    approval:{explicit:true,reference:'docs/social/b2b03/v4/APPROVED_RELEASE_20261021.md'},
    campaign:'camp_b2b_landing_vs_corp',scheduledAt:'2026-10-22T15:10:00Z',
    expiresAt:'2026-10-22T16:10:00Z',
    canonicalUrl:`https://orbitalframeworks.qzz.io/blog/${slug}/`,
    utmUrl:`https://orbitalframeworks.qzz.io/blog/${slug}/?utm_source=linkedin&utm_medium=organic_social&utm_campaign=camp_b2b_landing_vs_corp`,
    pdfPath:'docs/social/b2b03/v4/orbital-b2b03-carousel-v4.pdf',
    pdfSha256:'721b83695e651ecf034700d847f17bdbb5d6828f2b544227c5d8f1dd54ea946f',
    copyPath:'docs/social/b2b03/copy.txt',copySha256:'04e52f18ca35e47d80d631da023bba731c536f7de4a812d480be45344a4e5892',
    pdfPages:5,documentTitle:'Landing B2B o web corporativa | Orbital Frameworks'}
  writeFileSync(join(home,'queue',slug+'.json'),JSON.stringify(job))
  const result=run(home)
  assert.equal(result.length,1)
  assert.equal(result[0].slug,slug)
  // On the real VPS B2B-03 also has a PUBLISHED_VERIFIED private journal.
  assert.ok(['SKIP_ALREADY_DISTRIBUTED','SKIP_COMPLETED'].includes(result[0].action))
  assert.equal(result[0].dryRun,true)
}))
test('malformed queue input is rejected before any provider action',()=>homeFixture(home=>{
  writeFileSync(join(home,'queue','fake-slug.json'),'{"slug":"other-slug"}')
  assert.match(JSON.stringify(run(home)),/QUEUE_FILENAME_CAMPAIGN_MISMATCH/)
}))
test('fresh concurrent locks block and only demonstrably dead stale locks recover',()=>homeFixture(home=>{
  const path=join(home,'.runner.lock')
  const owner=acquireRunLock(path)
  assert.throws(()=>acquireRunLock(path),/RECENT_LOCK/)
  closeSync(owner)
  const old=new Date(Date.now()-12*60000)
  utimesSync(path,old,old)
  assert.throws(()=>acquireRunLock(path),/LOCK_OWNER_ALIVE/)
  writeFileSync(path,JSON.stringify({pid:99999999})+'\n')
  utimesSync(path,old,old)
  const recovered=acquireRunLock(path)
  closeSync(recovered)
  unlinkSync(path)
}))
