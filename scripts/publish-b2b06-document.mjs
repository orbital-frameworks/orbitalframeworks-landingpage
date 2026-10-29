#!/usr/bin/env node
// One-off, owner-authorized publication: B2B-06 article + visual PDF document.
// Preflight is read-only on LinkedIn. Publication is single-click, journalled before submit.
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkLiveBlog, openVerifiedBrowser, publishDocumentOnce, reconcileSubmitted } from './social-release-publisher.mjs'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const slug = 'web-con-visitas-pero-sin-consultas'
const campaign = 'camp_web_visitas_contactos'
const pdfRelative = 'docs/social/b2b06/v1/orbital-b2b06-carousel-v1.pdf'
const copyRelative = 'docs/social/b2b06/linkedin-copy-approved.txt'
const approvalFile = 'docs/social/b2b06/PUBLICATION_APPROVAL_20261029.md'
const journalPath = `/srv/orbital/runtimes/private/linkedin-company-admin-browser/publication-journal/${slug}.json`
const receiptPath = join(root,'docs/social/b2b06/LINKEDIN_RELEASE_20261029.json')
const sha256 = value => createHash('sha256').update(value).digest('hex')
const pdfFile = join(root,pdfRelative)
const copyFile = join(root,copyRelative)
const pdfSha256 = sha256(readFileSync(pdfFile))
const copy = readFileSync(copyFile,'utf8').trim()
const copySha256 = sha256(copy)
const approval=readFileSync(join(root,approvalFile),'utf8')
if (!approval.includes(pdfSha256) || !approval.includes(copySha256) || !/APROBADO/i.test(approval))
  throw Error('EXACT_COPY_AND_PDF_NOT_APPROVED')
if (!copy.includes('https://orbitalframeworks.qzz.io/consultas/'))throw Error('APPROVED_COPY_SHORTLINK_MISSING')
const job={
  slug,campaign,companyId:'134014070',
  canonicalUrl:`https://orbitalframeworks.qzz.io/blog/${slug}/`,
  utmUrl:`https://orbitalframeworks.qzz.io/blog/${slug}/?utm_source=linkedin&utm_medium=organic_social&utm_campaign=${campaign}`,
  shortUrl:'https://orbitalframeworks.qzz.io/consultas/',
  pdfPath:pdfRelative,copyPath:copyRelative,pdfSha256,copySha256,pdfPages:5,
  documentTitle:'Tu web recibe visitas, pero nadie pregunta | Orbital',
  _pdfFile:pdfFile,_copyFile:copyFile,
}
const output=value=>process.stdout.write(JSON.stringify(value,null,2)+'\n')
const mode=process.argv.includes('--publish')?'publish':'preflight'
if (existsSync(receiptPath)){
  const receipt=JSON.parse(readFileSync(receiptPath,'utf8'))
  if (receipt.status==='PUBLISHED_VERIFIED') {output({status:'ALREADY_PUBLISHED',receipt});process.exit(0)}
}
if (existsSync(journalPath)) {
  // Once any click could have happened, all subsequent operations are reconciliation-only.
  const journal=JSON.parse(readFileSync(journalPath,'utf8'))
  if(journal.phase==='PUBLISHED_VERIFIED') {output({status:'ALREADY_PUBLISHED',receipt:journal});process.exit(0)}
  if(mode==='preflight') {output({status:'PENDING_RECONCILIATION_NO_NEW_CLICK',journal});process.exit(0)}
  const receipt=await reconcileSubmitted(job)
  if(receipt.status==='PUBLISHED_VERIFIED'){
    writeFileSync(journalPath,JSON.stringify({...receipt,phase:'PUBLISHED_VERIFIED'},null,2)+'\n',{mode:0o600})
    writeFileSync(receiptPath,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'})
  }
  output(receipt)
  process.exit(receipt.status==='PUBLISHED_VERIFIED'?0:2)
}
const gate=await checkLiveBlog(job)
if(gate.verdict!=='PASS' || gate.checks!==15)throw Error('PUBLIC_ARTICLE_15_CHECKS_NOT_PASS')
if(mode==='preflight'){
  const browser=await openVerifiedBrowser()
  try{
    const page=browser.pages()[0]||await browser.newPage()
    const response=await page.goto('https://www.linkedin.com/company/134014070/admin/page-posts/published/',{waitUntil:'domcontentloaded',timeout:30000})
    if(response?.status()!==200 || !page.url().includes('/company/134014070/admin'))throw Error('LINKEDIN_COMPANY_SESSION_NOT_VERIFIED')
    await page.locator('[data-urn^="urn:li:activity:"]').first().waitFor({state:'attached',timeout:22000})
    const post=await page.locator('[data-urn^="urn:li:activity:"]').evaluateAll(nodes=>nodes.map(n=>n.innerText||'').find(t=>t.includes('Tu web puede recibir visitas y aun así no generar conversaciones comerciales.'))||null)
    if(post)throw Error('LINKEDIN_DUPLICATE_ALREADY_IN_FEED')
    output({status:'READY_TO_PUBLISH',identity:'Orbital Frameworks',companyId:job.companyId,gate,pdfSha256,copySha256,pdfPages:5,copyFirstLine:copy.split('\n')[0],journalCreated:false})
  }finally{await browser.close()}
  process.exit(0)
}
// The user explicitly authorized the article and LinkedIn publication today, 2026-10-29.
const limaDate=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Lima',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())
if(limaDate!=='2026-10-29')throw Error('PUBLICATION_OUTSIDE_OWNER_AUTHORIZED_DATE')
mkdirSync(resolve(journalPath,'..'),{recursive:true,mode:0o700})
const receipt=await publishDocumentOnce(job,{recordPending:async()=>{
  const pending={phase:'SUBMISSION_PENDING',slug,companyId:job.companyId,pdfSha256,copySha256,submittedAt:new Date().toISOString()}
  writeFileSync(journalPath,JSON.stringify(pending,null,2)+'\n',{flag:'wx',mode:0o600})
}})
if(receipt.status!=='PUBLISHED_VERIFIED')throw Error('PUBLISHED_RECEIPT_NOT_VERIFIED')
writeFileSync(journalPath,JSON.stringify({...receipt,phase:'PUBLISHED_VERIFIED'},null,2)+'\n',{mode:0o600})
writeFileSync(receiptPath,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'})
output(receipt)
