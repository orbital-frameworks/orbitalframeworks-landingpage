import test from 'node:test'
import assert from 'node:assert/strict'
import { outboundLinkTargets, approvedShortRedirectTarget } from '../scripts/social-release-publisher.mjs'
import { validateCampaign, sha256, JOB_SCHEMA, COMPANY_ID } from '../scripts/social-release-core.mjs'
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

test('LinkedIn safety/go wrapper and shortlink do not hide the approved destination',()=>{
  const short='https://lnkd.in/dNfcPkrS'
  const approved='https://orbitalframeworks.qzz.io/blog/test/?utm_source=linkedin&utm_medium=organic_social&utm_campaign=camp_test'
  const links=outboundLinkTargets([
    {href:'https://www.linkedin.com/safety/go/?url='+encodeURIComponent(short)+'&urlhash=abc',text:short},
    {href:approved,text:'Ver artículo'}
  ])
  assert.ok(links.includes(short))
  assert.ok(links.includes(approved))
  assert.ok(!links.includes('https://www.linkedin.com/safety/go/?url='+encodeURIComponent(short)+'&urlhash=abc'))
})

test('the exact B2B05 branded short page preserves complete LinkedIn UTM and is noindex',()=>{
  const source=readFileSync(new URL('../docs/social/b2b05/v3/redirect-pedidos.html',import.meta.url),'utf8')
  const expected='https://orbitalframeworks.qzz.io/blog/integracion-pedidos-whatsapp-almacen-operaciones/?utm_source=linkedin&utm_medium=organic_social&utm_campaign=camp_whatsapp_to_warehouse'
  assert.equal(approvedShortRedirectTarget(source),expected)
  assert.throws(()=>approvedShortRedirectTarget(source.replace('content="noindex, follow"','content="index, follow"')),/NOINDEX_MISSING/)
  assert.throws(()=>approvedShortRedirectTarget(source.replace('http-equiv="refresh"','http-equiv="ordinary"')),/REFRESH_MISSING/)
})

test('only approved B2B05 exact branded link is allowed, not a third-party shortener',()=>{
  const root=mkdtempSync(join(tmpdir(),'orbital-b2b05-link-'))
  try {
    mkdirSync(join(root,'docs/social/b2b05/v3'),{recursive:true})
    const slug='integracion-pedidos-whatsapp-almacen-operaciones'
    const utm='https://orbitalframeworks.qzz.io/blog/'+slug+
      '/?utm_source=linkedin&utm_medium=organic_social&utm_campaign=camp_whatsapp_to_warehouse'
    const shortUrl='https://orbitalframeworks.qzz.io/pedidos/'
    const copy='Nuevo copy aprobado con '+shortUrl
    const pdf='PDF fixture for shortlink tests'
    const pdfSha256=sha256(pdf),copySha256=sha256(copy)
    writeFileSync(join(root,'docs/post.pdf'),pdf)
    writeFileSync(join(root,'docs/copy.txt'),copy)
    const approval='docs/social/b2b05/v3/PUBLICATION_APPROVAL_20261022.md'
    writeFileSync(join(root,approval),'APROBADO copy='+copySha256+' pdf='+pdfSha256)
    const job={schema:JOB_SCHEMA,slug,companyId:COMPANY_ID,approval:{explicit:true,reference:approval},
      campaign:'camp_whatsapp_to_warehouse',scheduledAt:'2026-10-28T21:00:00Z',
      expiresAt:'2026-10-28T22:00:00Z',
      canonicalUrl:'https://orbitalframeworks.qzz.io/blog/'+slug+'/',
      utmUrl:utm,shortUrl,copyPath:'docs/copy.txt',copySha256,
      pdfPath:'docs/post.pdf',pdfSha256,pdfPages:5,documentTitle:'Pedidos y almacén'}
    const manifest={publications:{[slug]:{status:'LISTO_PARA_DISTRIBUCION_EXTERNA',
      gateVerdict:'PASS',campaign:job.campaign,utmUrl:utm,shortUrl}}}
    assert.equal(validateCampaign(job,{root,manifest,now:new Date('2026-10-28T21:10:00Z')}),'DUE')
    assert.throws(()=>validateCampaign({...job,shortUrl:'https://bit.ly/abc'},{root,manifest}),/APPROVED_SHORTLINK_INVALID/)
    assert.throws(()=>validateCampaign({...job,shortUrl:'https://orbitalframeworks.qzz.io/other/'},{root,manifest}),/SHORTLINK_NOT_APPROVED/)
    assert.throws(()=>validateCampaign({...job,shortUrl:undefined},{root,manifest}),/APPROVED_COPY_LINK_NOT_PRESENT/)
  }finally{rmSync(root,{recursive:true,force:true})}
})
