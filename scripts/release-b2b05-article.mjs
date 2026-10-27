#!/usr/bin/env node
// Single-campaign article release: owner-only systemd one-shot, not a generic
// deployment agent. All published media must match the owner's approved hash.
// No LinkedIn clicks occur here.
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync } from 'node:fs'
import { join } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'

const ROOT='/srv/orbital/workspaces/orbitalframeworks-landingpage'
const PRIVATE='/srv/orbital/runtimes/private/social-release'
const RELAY_ENV='/srv/orbital/secrets/private/orbital-relay.env'
const RELAY='/srv/orbital/workspaces/orbital-operations/tools/orbital-relay/scripts/relayctl.mjs'
const SLUG='integracion-pedidos-whatsapp-almacen-operaciones'
const CAMPAIGN='camp_whatsapp_to_warehouse'
const APPROVAL='docs/social/b2b05/v3/PUBLICATION_APPROVAL_20261022.md'
const PDF='docs/social/b2b05/v3/orbital-b2b05-carousel-v3.pdf'
const COPY='docs/social/b2b05/v3/linkedin-copy-approved.txt'
const SHORT_SOURCE='docs/social/b2b05/v3/redirect-pedidos.html'
const SHORT_PUBLIC='public/pedidos/index.html'
const shortUrl='https://orbitalframeworks.qzz.io/pedidos/'
const ARTICLE='docs/social/b2b05/v1/article.md'
const canonical='https://orbitalframeworks.qzz.io/blog/'+SLUG+'/'
const utm=canonical+'?utm_source=linkedin&utm_medium=organic_social&utm_campaign='+CAMPAIGN
const approved={
  article:'d727b141071da46d9f7cbf5f727746164bb60db746ef0cd0b1f1a86470be075f',
  pdf:'134de8e5f671a2a0195ce778a18dc8bfbfb23368fc0d36cd7262af227074a96a',
  copyFile:'05efb6e30580925aa42e74eb6c0a026142b0ac8f165cd018f65bfc0525c1ada2',
  shortSource:'42c147d1da5f7b13ede9eef1fe1f3fdeb354e061598d19cbd3918c01f4fa354e'
}
const due=Date.parse('2026-10-27T16:00:00Z')
const expires=Date.parse('2026-10-27T18:00:00Z')
const read=relative=>readFileSync(join(ROOT,relative),'utf8')
const hash=relative=>createHash('sha256').update(readFileSync(join(ROOT,relative))).digest('hex')
const statePath=join(PRIVATE,'b2b05-article-release.json')
const emit=data=>process.stdout.write(JSON.stringify({campaign:CAMPAIGN,...data})+'\n')
const atomic=(path,obj)=>{
  const tmp=path+'.'+process.pid+'.tmp'
  writeFileSync(tmp,JSON.stringify(obj,null,2)+'\n',{mode:0o600})
  renameSync(tmp,path)
}
let state=existsSync(statePath)?JSON.parse(readFileSync(statePath,'utf8')):{phase:'NOT_RELEASED',campaign:CAMPAIGN}
const update=(phase,details={})=>{
  state={...state,phase,at:new Date().toISOString(),...details};atomic(statePath,state);emit({phase})
}
const run=(cmd,args,{cwd=ROOT,input}={})=>{
  const r=spawnSync(cmd,args,{cwd,input,encoding:'utf8',timeout:240000,maxBuffer:5*1024*1024})
  if(r.error||r.status!==0) {
    const stdout=String(r.stdout||'')
    const stderr=String(r.stderr||r.error||'')
    const diagnostic=stdout+'\n'+stderr
    const primary=diagnostic.split('\n').filter(line=>/FAIL|requires ImageMagick|Error:|error TS|failed|ENOENT|EACCES/i.test(line)).slice(0,6).join(' | ')
    throw Error('COMMAND_FAILED:'+cmd+' '+args.slice(0,4).join(' ')+
      ' exit='+r.status+' cause='+primary.slice(0,420)+' tail='+diagnostic.slice(-250))
  }
  return r.stdout.trim()
}
const assertStagedOnly=allowed=>{
  const paths=run('git',['diff','--cached','--name-only']).split('\n').filter(Boolean)
  if(paths.some(x=>!allowed.includes(x)))throw Error('OTHER_WORK_STAGED_DO_NOT_COMMIT')
  return paths
}
const notify=(event,message)=>{
  // This is an owner snapshot: the Telegram token is loaded only by relay child.
  const script='set -a; source "$1"; set +a; exec /usr/local/bin/node "$2" emit orbital-landing "$3" "$4" personal "$5"'
  const sev=event==='WORK_RUN_COMPLETED'?'info':'error'
  const r=spawnSync('/bin/bash',['-c',script,'b2b05-relay',RELAY_ENV,RELAY,event,sev,message],
    {encoding:'utf8',timeout:30000})
  return r.status===0
}
function preflight(){
  if(run('id',['-un'])!=='orbital-private')throw Error('OWNER_ONLY_RELEASE')
  for(const [name,file] of [['article',ARTICLE],['pdf',PDF],['copyFile',COPY],['shortSource',SHORT_SOURCE]]){
    if(hash(file)!==approved[name])throw Error('OWNER_APPROVED_HASH_MISMATCH:'+name)
  }
  const approval=read(APPROVAL)
  if(!approval.includes('APROBADO') || !approval.includes(approved.article) ||
    !approval.includes(approved.pdf) || !approval.includes(approved.copyFile) ||
    !approval.includes('32bd263a04fb3cef2f816eb5e39074c775cbc90056e05985b544aa7a72ad5131') ||
    !approval.includes(approved.shortSource) || !approval.includes(shortUrl))
    throw Error('EXPLICIT_APPROVAL_RECORD_INCOMPLETE')
  const copy=read(COPY).trim()
  if(!copy.includes(shortUrl) || copy.includes('utm_source=') ||
    copy.includes('Preparamos también una guía práctica'))
    throw Error('NEW_EDITORIAL_COPY_OR_BRANDED_LINK_NOT_APPROVED')
  const redirect=read(SHORT_SOURCE)
  if (!redirect.includes('http-equiv="refresh"') ||
      !redirect.includes(utm.replaceAll('&','&amp;')))
    throw Error('BRANDED_SHORTLINK_DOES_NOT_PRESERVE_APPROVED_UTM')
  return copy
}
function preparedFromInterruptedRun(){
  // An interrupted prior execution left exactly the four intended content
  // edits plus the *new* shortlink file. Resume it, never clear it or
  // overwrite unrelated changes to the checkout.
  const expected=['public/feed.xml','public/sitemap.xml','scripts/blog-linkedin-gate.mjs','src/blogData.ts']
  const modified=run('git',['diff','--name-only','--',...expected]).split('\n').filter(Boolean).sort()
  if(modified.join('|')!==expected.join('|'))return false
  const short=join(ROOT,SHORT_PUBLIC)
  if(!existsSync(short)||createHash('sha256').update(readFileSync(short)).digest('hex')!==approved.shortSource)
    return false
  const data=read('src/blogData.ts')
  const start=data.indexOf("  '"+SLUG+"': {")
  const end=data.indexOf("  'software-a-medida-o-saas-como-decidir': {",start)
  if(start<0||end<=start)return false
  const block=data.slice(start,end)
  if(!block.includes("status: 'PUBLISHED'")||block.includes('DRAFT_NO_PUBLICABLE'))return false
  const gate=read('scripts/blog-linkedin-gate.mjs')
  const index=gate.indexOf("slug: '"+SLUG+"'")
  const endGate=gate.indexOf('},',index)
  if(index<0||endGate<0||!gate.slice(index,endGate).includes("status: 'PUBLISHED'"))return false
  if(!read('public/feed.xml').includes(canonical)||!read('public/sitemap.xml').includes(canonical))
    return false
  return true
}
function prepareReleaseFiles(){
  const sensitive=['src/blogData.ts','scripts/blog-linkedin-gate.mjs','public/sitemap.xml','public/feed.xml',SHORT_PUBLIC]
  if(run('git',['diff','--cached','--name-only']))throw Error('OTHER_WORK_ALREADY_STAGED')
  if(run('git',['status','--porcelain','--',...sensitive]))throw Error('RELEASE_SOURCES_HAVE_UNCOMMITTED_CHANGES')
  if(existsSync(join(ROOT,SHORT_PUBLIC)))throw Error('BRANDED_SHORTLINK_ALREADY_PUBLISHED')
  const head=run('git',['rev-parse','HEAD'])
  const upstream=run('git',['ls-remote','origin','refs/heads/main']).split(/\s+/)[0]
  if(head!==upstream){
    // Recover a harmless intervening push via an ordinary fast-forward.
    // Git aborts rather than overwrite any unrelated local work.
    run('git',['fetch','origin','main'])
    run('git',['merge','--ff-only','origin/main'])
    if(run('git',['rev-parse','HEAD'])!==upstream)throw Error('REMOTE_HEAD_NOT_RECONCILED')
    if(run('git',['status','--porcelain','--',...sensitive]))throw Error('RELEASE_SOURCES_CHANGED_ON_FAST_FORWARD')
  }
  const source='src/blogData.ts'
  const content=read(source)
  const start=content.indexOf("  'integracion-pedidos-whatsapp-almacen-operaciones': {")
  const end=content.indexOf("  'software-a-medida-o-saas-como-decidir': {",start)
  if(start<0||end<=start)throw Error('ARTICLE_BLOCK_BOUNDARIES_CHANGED')
  const before=content.slice(start,end)
  if((before.match(/status: 'DRAFT_NO_PUBLICABLE'/g)||[]).length!==1)throw Error('EXPECTED_DRAFT_STATUS_MISSING')
  writeFileSync(join(ROOT,source),content.slice(0,start)+before.replace(
    "status: 'DRAFT_NO_PUBLICABLE'","status: 'PUBLISHED'").replace(
    "statusLabel: 'Programado para el 27 de octubre de 2026'","statusLabel: ''").replace(
    "statusNotice: 'Artículo y recursos aprobados. No visible ni publicable antes de su fecha de lanzamiento.'","statusNotice: ''")+content.slice(end))
  const backlog='scripts/blog-linkedin-gate.mjs'
  const data=read(backlog)
  const snippetStart=data.indexOf("slug: 'integracion-pedidos-whatsapp-almacen-operaciones'")
  if(snippetStart<0)throw Error('BACKLOG_TOPIC_MISSING')
  const snippetEnd=data.indexOf('},',snippetStart)
  const beforeStatus=data.slice(snippetStart,snippetEnd)
  if(!beforeStatus.includes("status: 'DRAFT_NO_PUBLICABLE'"))throw Error('BACKLOG_DRAFT_NOT_FOUND')
  writeFileSync(join(ROOT,backlog),data.slice(0,snippetStart)+beforeStatus.replace(
    "status: 'DRAFT_NO_PUBLICABLE'","status: 'PUBLISHED'")+data.slice(snippetEnd))
  const sitemap='public/sitemap.xml'
  const xml=read(sitemap)
  if(xml.includes(canonical))throw Error('SITEMAP_ALREADY_HAS_ARTICLE')
  const row='  <url>\n    <loc>'+canonical+'</loc>\n    <lastmod>2026-10-27</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n'
  let newXml=xml.replace('</urlset>',row+'</urlset>')
  newXml=newXml.replace(/(<loc>https:\/\/orbitalframeworks\.qzz\.io\/blog\/<\/loc>\s*<lastmod>)[^<]+/,
    '$1'+'2026-10-27')
  if(newXml===xml)throw Error('SITEMAP_UPDATE_FAILED')
  writeFileSync(join(ROOT,sitemap),newXml)
  const feed='public/feed.xml',rss=read(feed)
  if(rss.includes(canonical))throw Error('RSS_ALREADY_HAS_ARTICLE')
  const item='    <item>\n      <title>Del pedido por WhatsApp al almacén: cómo conectar ventas, inventario y operaciones sin duplicar datos</title>\n'+
    '      <link>'+canonical+'</link>\n      <guid isPermaLink="true">'+canonical+'</guid>\n'+
    '      <pubDate>Tue, 27 Oct 2026 16:00:00 GMT</pubDate>\n'+
    '      <description>Cómo estructurar y conectar pedidos recibidos por WhatsApp con ventas, inventario y operaciones.</description>\n'+
    '      <author>contact.orbitalframeworks@gmail.com (Orbital Frameworks)</author>\n    </item>\n'
  let updated=rss.replace('    <item>',item+'    <item>').replace(/<lastBuildDate>[^<]*<\/lastBuildDate>/,
    '<lastBuildDate>Tue, 27 Oct 2026 16:00:00 GMT</lastBuildDate>')
  if(updated===rss)throw Error('RSS_INSERT_FAILED')
  writeFileSync(join(ROOT,feed),updated)
  // GitHub Pages/Amplify are static hosts. This reviewable noindex HTML
  // redirect is activated only with the article on 27 Oct, not beforehand.
  mkdirSync(join(ROOT,'public/pedidos'),{recursive:true})
  writeFileSync(join(ROOT,SHORT_PUBLIC),read(SHORT_SOURCE),{flag:'wx'})
}
async function verifyPublic(){
  const timeout=AbortSignal.timeout(17000)
  const [page,sitemap,rss]=await Promise.all([
    fetch(canonical,{signal:timeout}),fetch('https://orbitalframeworks.qzz.io/sitemap.xml',{signal:timeout}),
    fetch('https://orbitalframeworks.qzz.io/feed.xml',{signal:timeout})
  ])
  if(!page.ok||!sitemap.ok||!rss.ok)throw Error('B2B05_PUBLIC_RESPONSE_NOT_OK')
  const [html,xml,feed]=await Promise.all([page.text(),sitemap.text(),rss.text()])
  if(!html.includes('El pedido llegó') && !html.includes('Del pedido por WhatsApp'))throw Error('PUBLIC_ARTICLE_CONTENT_MISSING')
  if(!html.includes(canonical)||!html.includes('BlogPosting')||!xml.includes(canonical)||!feed.includes(canonical))
    throw Error('PUBLIC_ARTICLE_SEO_FEED_INCOMPLETE')
  const short=await fetch(shortUrl,{signal:timeout,redirect:'manual'})
  if(short.status!==200||short.url!==shortUrl)
    throw Error('PUBLIC_BRANDED_SHORTLINK_NOT_LIVE')
  const {approvedShortRedirectTarget}=await import('file://'+join(PRIVATE,'bin/social-release-publisher.mjs'))
  if(approvedShortRedirectTarget(await short.text())!==utm)
    throw Error('PUBLIC_BRANDED_SHORTLINK_TARGET_MISMATCH')
  const {runGateCheck}=await import('file://'+join(ROOT,'scripts/blog-linkedin-gate.mjs'))
  const verdict=await runGateCheck({rootPath:ROOT,slug:SLUG,dryRun:true,customCopy:read(COPY).trim()})
  if(!verdict.ok||verdict.verdict!=='PASS'||verdict.checks?.length!==15||
    verdict.checks.some(x=>x.passed!==true))throw Error('EDITORIAL_GATE_NOT_15_OF_15:'+String(verdict.errorCode||'unverified'))
}
function reconcileManifest(){
  const file='docs/blog-linkedin-manifest.json'
  if(run('git',['diff','--cached','--name-only']))throw Error('OTHER_WORK_STAGED_BEFORE_MANIFEST')
  const original=JSON.parse(read(file))
  if(original.publications?.[SLUG]?.status==='DISTRIBUTED')throw Error('ALREADY_LINKEDIN_DISTRIBUTED')
  const copyHash=createHash('sha256').update(read(COPY).trim()).digest('hex')
  const entry={
    slug:SLUG,title:'Del pedido por WhatsApp al almacén: cómo conectar ventas, inventario y operaciones sin duplicar datos',
    campaign:CAMPAIGN,utmUrl:utm,shortUrl,canonicalUrl:canonical,
    status:'LISTO_PARA_DISTRIBUCION_EXTERNA',gateVerdict:'PASS',autopostAuthorized:true,
    approvalReference:APPROVAL,approvedPdfSha256:approved.pdf,approvedCopySha256:copyHash,
    blogPublishedAt:'2026-10-27T16:00:00Z',scheduledLinkedInAt:'2026-10-27T18:00:00Z',
    failedChecks:[]
  }
  const base=JSON.parse(run('git',['show','HEAD:'+file]))
  base.publications[SLUG]=entry
  const generated=JSON.stringify(base,null,2)+'\n'
  const blob=run('git',['hash-object','-w','--stdin'],{input:generated})
  run('git',['update-index','--add','--cacheinfo','100644',blob,file])
  assertStagedOnly([file])
  original.publications[SLUG]=entry
  writeFileSync(join(ROOT,file),JSON.stringify(original,null,2)+'\n')
  run('git',['diff','--cached','--check'])
  run('git',['commit','-m','docs(social): reconcile B2B05 published blog and approved social gate'])
  run('git',['push','origin','main'])
  return entry
}
async function scheduleLinkedIn(entry){
  const {validateCampaign}=await import('./social-release-core.mjs')
  const job={
    schema:'orbital.social-release.v1',slug:SLUG,companyId:'134014070',
    approval:{explicit:true,reference:APPROVAL},campaign:CAMPAIGN,
    scheduledAt:'2026-10-27T18:00:00Z',expiresAt:'2026-10-27T19:00:00Z',
    canonicalUrl:canonical,utmUrl:utm,shortUrl,pdfPath:PDF,pdfSha256:approved.pdf,
    copyPath:COPY,copySha256:entry.approvedCopySha256,pdfPages:5,
    documentTitle:'Del pedido al almacén | Orbital Frameworks'
  }
  const manifest=JSON.parse(read('docs/blog-linkedin-manifest.json'))
  const verdict=validateCampaign(job,{root:ROOT,manifest,now:new Date('2026-10-27T18:00:00Z')})
  if(verdict!=='NOT_DUE')throw Error('SOCIAL_JOB_PREVALIDATION_FAILED')
  // This installer copies the freshly published blogData gate into the owner
  // runtime. The shared Team checkout is never executed as a root service.
  run('/bin/bash',['deploy/social-release/install-owner.sh'])
  const queueFile=join(PRIVATE,'queue',SLUG+'.json')
  if(existsSync(queueFile)){
    const prior=JSON.parse(readFileSync(queueFile,'utf8'))
    if(JSON.stringify(prior)!==JSON.stringify(job))throw Error('EXISTING_SOCIAL_JOB_CHANGED')
  }else writeFileSync(queueFile,JSON.stringify(job,null,2)+'\n',{mode:0o600,flag:'wx'})
}
async function main(){
  mkdirSync(PRIVATE,{recursive:true,mode:0o700})
  preflight()
  if(process.argv.includes('--dry-run')){
    emit({status:'PREFLIGHT_READY',schedule:'2026-10-27T16:00:00Z',
      linkedin:'2026-10-27T18:00:00Z',articleSha256:approved.article,pdfSha256:approved.pdf})
    return
  }
  if(!process.argv.includes('--publish'))throw Error('EXPLICIT_PUBLISH_FLAG_REQUIRED')
  const now=Date.now()
  if(now<due||now>expires)throw Error('OUTSIDE_APPROVED_RELEASE_WINDOW')
  try{
    if(state.phase==='COMPLETE')return emit({status:'ALREADY_COMPLETED'})
    if(state.phase==='NOT_RELEASED'){
      if (preparedFromInterruptedRun()) {
        emit({status:'RECOVERED_PREPARED_ARTICLE_FROM_INTERRUPTED_RUN'})
      } else {
        prepareReleaseFiles()
      }
      update('LOCAL_CONTENT_PREPARED')
    }
    if(state.phase==='LOCAL_CONTENT_PREPARED'){
      // Test built site before changing remote production.
      run('npm',['run','build'])
      const draftPath=join(ROOT,'dist/blog',SLUG,'index.html')
      if(!existsSync(draftPath))throw Error('B2B05_PRERENDER_NOT_GENERATED')
      if(!existsSync(join(ROOT,'dist/pedidos/index.html')))
        throw Error('BRANDED_SHORTLINK_NOT_GENERATED_IN_DEPLOY_ARTIFACT')
      const releasePaths=['src/blogData.ts','scripts/blog-linkedin-gate.mjs','public/sitemap.xml','public/feed.xml',SHORT_PUBLIC]
      run('git',['add','--',...releasePaths])
      assertStagedOnly(releasePaths)
      run('git',['diff','--cached','--check'])
      run('git',['commit','-m','release(blog): publish B2B05 on authorized 27 Oct window'])
      const pushedSha=run('git',['rev-parse','HEAD'])
      // An ambiguous Git push must NOT be blindly replayed.
      update('LOCAL_RELEASE_COMMITTED',{sha:pushedSha})
      run('git',['push','origin','main'])
      update('ARTICLE_PUSHED',{sha:pushedSha})
    }
    if(state.phase==='LOCAL_RELEASE_COMMITTED'){
      const remote=run('git',['ls-remote','origin','refs/heads/main']).split(/\s+/)[0]
      if(remote!==state.sha)throw Error('LOCAL_COMMIT_REMOTE_AMBIGUOUS_NO_REPUSH')
      update('ARTICLE_PUSHED')
    }
    if(state.phase==='ARTICLE_PUSHED'){
      let verified=false,last=''
      for(let i=0;i<30;i++){
        try{await verifyPublic();verified=true;break}catch(e){last=e.message}
        await sleep(20000)
      }
      if(!verified)throw Error('PUBLIC_GATE_NOT_VERIFIED:'+last)
      update('ARTICLE_PUBLIC_VERIFIED',{canonical})
    }
    if(state.phase==='ARTICLE_PUBLIC_VERIFIED'){
      const entry=reconcileManifest()
      update('EDITORIAL_MANIFEST_READY',{manifest:entry.status})
    }
    if(state.phase==='EDITORIAL_MANIFEST_READY'){
      const manifest=JSON.parse(read('docs/blog-linkedin-manifest.json'))
      await scheduleLinkedIn(manifest.publications[SLUG])
      update('COMPLETE',{linkedInScheduledAt:'2026-10-27T18:00:00Z'})
      const message='B2B05 artículo publicado y verificado: '+canonical+
        ' · Gate 15/15. LinkedIn PDF V3 aprobado, programado para martes 27/10 13:00 Lima. No se ha publicado LinkedIn todavía.'
      update('COMPLETE',{telegramDeliveryConfirmed:notify('WORK_RUN_COMPLETED',message)})
    }
  }catch(error){
    update(state.phase,{lastError:String(error.message||error).slice(0,450)})
    notify('WORK_RUN_FAILED','B2B05 article release: '+state.phase+' · '+String(error.message||error).slice(0,450))
    throw error
  }
}
try{await main()}catch(error){emit({status:'BLOCKED',phase:state.phase,error:String(error.message||error)});process.exitCode=1}
