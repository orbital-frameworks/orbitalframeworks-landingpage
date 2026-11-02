#!/usr/bin/env node
// One approved campaign, two unattended stages. No LLM or new worker graph.
// 06:40 Lima: build + commit/push article; 08:30: arm existing LinkedIn runner.
// Git and LinkedIn operations are idempotent and preserve unrelated work.
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, copyFileSync, chmodSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT='/srv/orbital/workspaces/orbitalframeworks-landingpage'
const PRIVATE='/srv/orbital/runtimes/private/social-release'
const RELAY='/srv/orbital/workspaces/orbital-operations/tools/orbital-relay/scripts/relayctl.mjs'
const ENV='/srv/orbital/secrets/private/orbital-relay.env'
const SLUG='digitalizacion-asistencia-personal-campo-trazabilidad'
const CANONICAL='https://orbitalframeworks.qzz.io/blog/'+SLUG+'/'
const PDF='docs/social/b2b06-field/v3/orbital-attendance-carousel-v3.pdf'
const COPY='docs/social/b2b06-field/LINKEDIN_COPY_DRAFT_20261103.txt'
const ARTICLE='docs/social/b2b06-field/ARTICLE_DRAFT_20261103.md'
const APPROVAL='docs/social/b2b06-field/APPROVED_RELEASE_20261102.md'
const JOB='docs/social/b2b06-field/RELEASE_JOB_APPROVED_20261103.json'
const PATCH='docs/social/b2b06-field/RELEASE_AFTER_APPROVAL_20261103.patch'
const MANIFEST='docs/blog-linkedin-manifest.json'
const STATE=join(PRIVATE,'b2b06-20261103-release-state.json')
const EARLIEST=Date.parse('2026-11-03T11:40:00Z') // 06:40 Lima
const LATEST=Date.parse('2026-11-03T15:00:00Z') // 10:00 Lima
const ARTICLE_SHA='54533ccb39768818bddfcf4806e8662a96d3ea7fcff59e4b731288eaeeb20bc2'
const PDF_SHA='ad831b217d5b883d24d54558d48304469128b1c5bb66ed2ff26c70d8c1e883ed'
const COPY_SHA='b09665d3767ba83f9eb3be491469d10a9061bdeeb0a33b32e0745209d346ca28'
const PATCH_SHA='3fd66479da92e51e472ce6154bf5cbf159d33c5ada87b87364e8ce17c075691e'
const RELEASE_FILES=['src/blogData.ts','public/sitemap.xml','public/feed.xml',
  'scripts/blog-linkedin-gate.mjs','tests/agent-readiness.test.mjs',
  'tests/blog-index-search.test.mjs','tests/blog-prerender.test.mjs',
  'tests/blog-linkedin-gate.test.mjs']
const sha=data=>createHash('sha256').update(data).digest('hex')
const read=path=>readFileSync(join(ROOT,path),'utf8')
const json=path=>JSON.parse(read(path))
const state=existsSync(STATE)?JSON.parse(readFileSync(STATE,'utf8')):{phase:'PENDING',attempts:{}}
const emit=x=>process.stdout.write(JSON.stringify({campaign:'b2b06-v3',...x})+'\n')
const persist=(phase,fields={})=>{
  Object.assign(state,{phase,at:new Date().toISOString()},fields)
  writeFileSync(STATE+'.'+process.pid+'.tmp',JSON.stringify(state,null,2)+'\n',{mode:0o600})
  renameSync(STATE+'.'+process.pid+'.tmp',STATE)
  emit({phase,...fields})
}
function exec(command,args,opts={}){
  const result=spawnSync(command,args,{cwd:ROOT,encoding:'utf8',maxBuffer:5*1024*1024,
    timeout:opts.timeout||240000,input:opts.input})
  if(result.error||result.status!==0)
    throw Error('EXEC_'+command+'_'+args.slice(0,3).join('_')+'_EXIT_'+result.status+' '+
      String(result.stderr||result.stdout||result.error).slice(-360))
  return String(result.stdout||'').trim()
}
function assertOwner(){
  if(exec('id',['-un'])!=='orbital-private')throw Error('OWNER_ONLY_RELEASE')
  mkdirSync(PRIVATE,{recursive:true,mode:0o700})
}
function preflight(){
  assertOwner()
  if(sha(readFileSync(join(ROOT,ARTICLE)))!==ARTICLE_SHA||
    sha(readFileSync(join(ROOT,PDF)))!==PDF_SHA||
    sha(read(COPY).trim())!==COPY_SHA||
    sha(readFileSync(join(ROOT,PATCH)))!==PATCH_SHA)
    throw Error('APPROVED_ARTIFACT_OR_PATCH_HASH_CHANGED')
  const approval=read(APPROVAL)
  if(!approval.includes('APROBADO POR EL PROPIETARIO')||
    !approval.includes(PDF_SHA)||!approval.includes(COPY_SHA)||
    !approval.includes('07:00')||!approval.includes('09:00'))
    throw Error('EXPLICIT_APPROVAL_DATE_OR_HASH_NOT_BOUND')
  const job=json(JOB)
  if(job.pdfSha256!==PDF_SHA||job.copySha256!==COPY_SHA||
    job.scheduledAt!=='2026-11-03T14:00:00Z'||job.approval?.explicit!==true)
    throw Error('APPROVED_LINKEDIN_JOB_MISMATCH')
  if(!read(COPY).includes(job.utmUrl))throw Error('LINKEDIN_COPY_UTM_MISSING')
  return job
}
function notify(kind,detail){
  const type=kind==='success'?'WORK_RUN_COMPLETED':'WORK_RUN_FAILED'
  const sev=kind==='success'?'info':'error'
  const script='set -a; source "$1"; set +a; exec /usr/local/bin/node "$2" emit orbital-landing "$3" "$4" personal "$5"'
  const out=spawnSync('/bin/bash',['-c',script,'b2b06-relay',ENV,RELAY,type,sev,
    ('B2B06 V3 '+detail).slice(0,780)],{encoding:'utf8',timeout:30000})
  try{
    const data=JSON.parse(String(out.stdout).trim())
    return out.status===0&&data.delivery?.confirmed===true
  }catch{return false}
}
function handleFault(stage,error){
  const reason=String(error?.message||error).slice(0,450)
  const attempts=(state.attempts?.[stage]||0)+1
  const repeat=state.lastError===reason && state.lastStage===stage
  const update={attempts:{...state.attempts,[stage]:attempts},lastError:reason,lastStage:stage}
  persist(state.phase,update)
  if(!repeat)notify('error',stage+' · '+reason)
  emit({stage,status:'FAILED_RETRYABLE_WITHOUT_REPEATING_PUBLICATION',reason,attempts})
  process.exitCode=1
}
async function verifyPublic(){
  const ctrl=AbortSignal.timeout(18000)
  const res=await Promise.all([fetch(CANONICAL,{signal:ctrl}),
    fetch('https://orbitalframeworks.qzz.io/sitemap.xml',{signal:ctrl}),
    fetch('https://orbitalframeworks.qzz.io/feed.xml',{signal:ctrl})])
  if(res.some(x=>!x.ok))return false
  const [html,sitemap,feed]=await Promise.all(res.map(x=>x.text()))
  return html.includes('<h1')&&html.includes('Control de asistencia')&&
    html.includes('rel="canonical"')&&html.includes(CANONICAL)&&
    html.includes('BlogPosting')&&sitemap.includes(CANONICAL)&&feed.includes(SLUG)
}
function safePush(shaToPush){
  let remote=exec('git',['ls-remote','origin','refs/heads/main']).split(/\s+/)[0]
  if(remote===shaToPush)return
  if(exec('git',['rev-parse','HEAD'])!==shaToPush)throw Error('LOCAL_GIT_HEAD_CHANGED_AFTER_RELEASE_COMMIT')
  exec('git',['merge-base','--is-ancestor',remote,shaToPush])
  try{exec('git',['push','origin','HEAD:main'],{timeout:130000})}
  catch(error){
    remote=exec('git',['ls-remote','origin','refs/heads/main']).split(/\s+/)[0]
    if(remote!==shaToPush)throw error
  }
  remote=exec('git',['ls-remote','origin','refs/heads/main']).split(/\s+/)[0]
  if(remote!==shaToPush)throw Error('REMOTE_RELEASE_SHA_UNVERIFIED')
}
function prepareArticle(){
  if(exec('git',['branch','--show-current'])!=='main')throw Error('RELEASE_NEEDS_MAIN_BRANCH')
  if(exec('git',['diff','--cached','--name-only']))throw Error('UNRELATED_STAGED_CHANGES_PRESENT')
  if(exec('git',['status','--porcelain','--',...RELEASE_FILES]))
    throw Error('RELEASE_SOURCE_HAS_UNCOMMITTED_CHANGES')
  const current=exec('git',['rev-parse','HEAD'])
  const upstream=exec('git',['ls-remote','origin','refs/heads/main']).split(/\s+/)[0]
  if(current!==upstream){
    exec('git',['fetch','origin','main'])
    exec('git',['merge','--ff-only','origin/main'])
    if(exec('git',['status','--porcelain','--',...RELEASE_FILES]))
      throw Error('UPSTREAM_TOUCHED_APPROVED_RELEASE_SCOPE')
  }
  exec('git',['apply','--check',PATCH])
  exec('git',['apply',PATCH])
  persist('ARTICLE_PREPARED')
}
function commitArticle(){
  // If tests fail, preserve the prepared files; a later timer retries tests,
  // not the patch, and does not discard any unrelated work.
  exec('npm',['run','lint'])
  exec('npm',['run','build'])
  exec('npm',['test'])
  if(!existsSync(join(ROOT,'dist/blog',SLUG,'index.html')))throw Error('ARTICLE_PRERENDER_MISSING')
  exec('git',['add','--',...RELEASE_FILES])
  const staged=exec('git',['diff','--cached','--name-only']).split('\n').filter(Boolean)
  if(staged.some(f=>!RELEASE_FILES.includes(f)))throw Error('UNRELATED_STAGED_CHANGE_DETECTED')
  exec('git',['diff','--cached','--check'])
  exec('git',['commit','-m','release(blog): publish approved B2B06 V3 article on 03 Nov'])
  persist('ARTICLE_COMMITTED',{articleSha:exec('git',['rev-parse','HEAD'])})
}
async function article(){
  if(Date.now()<EARLIEST||Date.now()>LATEST)throw Error('OUTSIDE_APPROVED_ARTICLE_WINDOW')
  if(['ARTICLE_PUBLIC_VERIFIED','SOCIAL_ARMED'].includes(state.phase)){
    emit({status:'ALREADY_ARTICLE_PUBLIC',sha:state.articleSha});return
  }
  if(state.phase==='PENDING')prepareArticle()
  if(state.phase==='ARTICLE_PREPARED')commitArticle()
  if(state.phase==='ARTICLE_COMMITTED'){
    safePush(state.articleSha)
    persist('ARTICLE_PUSHED')
  }
  if(state.phase==='ARTICLE_PUSHED'){
    if(await verifyPublic()){
      persist('ARTICLE_PUBLIC_VERIFIED',{publicUrl:CANONICAL})
      if(!state.articleNoticeSent)persist('ARTICLE_PUBLIC_VERIFIED',
        {articleNoticeSent:notify('success','Artículo público verificado (HTTP/SEO/sitemap/RSS): '+CANONICAL)})
    }else emit({status:'DEPLOY_PENDING_RECHECK_AT_NEXT_TIMER',sha:state.articleSha})
  }
}
async function social(){
  if(Date.now()<Date.parse('2026-11-03T13:30:00Z')||Date.now()>LATEST)
    throw Error('OUTSIDE_APPROVED_LINKEDIN_PREPARATION_WINDOW')
  if(state.phase==='SOCIAL_ARMED'){emit({status:'LINKEDIN_ALREADY_ARMED'});return}
  if(!['ARTICLE_PUBLIC_VERIFIED','SOCIAL_MANIFEST_COMMITTED','SOCIAL_MANIFEST_PUSHED',
    'PINNED_GATE_UPDATED','SOCIAL_ARMED'].includes(state.phase)){
    if(state.phase==='ARTICLE_PUSHED'&&await verifyPublic())
      persist('ARTICLE_PUBLIC_VERIFIED',{publicUrl:CANONICAL})
    else {emit({status:'ARTICLE_NOT_YET_VERIFIED_NO_LINKEDIN_JOB'});return}
  }
  const {runGateCheck}=await import(pathToFileURL(join(ROOT,'scripts/blog-linkedin-gate.mjs')))
  const gate=await runGateCheck({rootPath:ROOT,slug:SLUG,dryRun:true,customCopy:read(COPY).trim()})
  if(!gate.ok||gate.verdict!=='PASS'||gate.checks?.length!==15||
    gate.checks.some(x=>x.passed!==true))
    throw Error('EDITORIAL_GATE_NOT_15_OF_15:'+String(gate.errorCode||'not_validated'))
  const job=json(JOB)
  let manifest=json(MANIFEST)
  if(manifest.publications?.[SLUG]?.status==='DISTRIBUTED')
    throw Error('ALREADY_DISTRIBUTED_DO_NOT_PUBLISH')
  const entry={slug:SLUG,title:json(JOB).documentTitle,campaign:job.campaign,utmUrl:job.utmUrl,
    canonicalUrl:CANONICAL,status:'LISTO_PARA_DISTRIBUCION_EXTERNA',
    gateVerdict:'PASS',autopostAuthorized:true,approvalReference:APPROVAL,
    approvedPdfSha256:PDF_SHA,approvedCopySha256:COPY_SHA,
    blogPublishedAt:state.at,scheduledLinkedInAt:job.scheduledAt,failedChecks:[]}
  if(state.phase==='ARTICLE_PUBLIC_VERIFIED'){
    // Git's index is built from HEAD, preserving unrelated unstaged changes
    // (which can be present in the owner checkout's real working tree).
    if(exec('git',['diff','--cached','--name-only']))throw Error('UNRELATED_STAGED_CHANGES_BEFORE_MANIFEST')
    const clean=JSON.parse(exec('git',['show','HEAD:'+MANIFEST]))
    if(clean.publications?.[SLUG]?.status==='DISTRIBUTED')throw Error('ALREADY_DISTRIBUTED')
    clean.publications[SLUG]=entry
    clean.lastUpdated=new Date().toISOString()
    const blob=exec('git',['hash-object','-w','--stdin'],{input:JSON.stringify(clean,null,2)+'\n'})
    exec('git',['update-index','--add','--cacheinfo','100644,'+blob,MANIFEST])
    manifest.publications[SLUG]=entry
    manifest.lastUpdated=clean.lastUpdated
    writeFileSync(join(ROOT,MANIFEST),JSON.stringify(manifest,null,2)+'\n')
    exec('git',['diff','--cached','--check'])
    exec('git',['commit','-m','docs(social): approve B2B06 V3 external distribution'])
    persist('SOCIAL_MANIFEST_COMMITTED',{manifestSha:exec('git',['rev-parse','HEAD'])})
  }
  if(state.phase==='SOCIAL_MANIFEST_COMMITTED'){
    safePush(state.manifestSha)
    persist('SOCIAL_MANIFEST_PUSHED')
  }
  if(state.phase==='SOCIAL_MANIFEST_PUSHED'){
    // Stop only the release timer (not the rest of Orbital), replace the two
    // pinned gate inputs atomically, then restart it even if preflight fails.
    exec('systemctl',['--user','stop','orbital-social-release.timer'])
    try{
      // is-active: 0 means active, 3 means inactive. Pause the timer, but
      // never overwrite a module while a release service is using it.
      const active=spawnSync('systemctl',['--user','is-active','orbital-social-release.service'],
        {encoding:'utf8',timeout:8000})
      if(active.status===0)throw Error('SOCIAL_RELEASE_SERVICE_RUNNING_DURING_PIN_REFRESH')
      if(active.status!==3)throw Error('SOCIAL_RELEASE_SERVICE_STATE_UNKNOWN')
      for(const [source,dest,mode] of [
        ['scripts/blog-linkedin-gate.mjs',join(PRIVATE,'bin/blog-linkedin-gate.mjs'),0o500],
        ['src/blogData.ts',join(PRIVATE,'src/blogData.ts'),0o400]]){
        const tmp=dest+'.b2b06.tmp'
        copyFileSync(join(ROOT,source),tmp);chmodSync(tmp,mode);renameSync(tmp,dest)
      }
    }finally{exec('systemctl',['--user','start','orbital-social-release.timer'])}
    persist('PINNED_GATE_UPDATED')
  }
  if(state.phase==='PINNED_GATE_UPDATED'){
    const {validateCampaign}=await import(pathToFileURL(join(PRIVATE,'bin/social-release-core.mjs')))
    const {checkLiveBlog}=await import(pathToFileURL(join(PRIVATE,'bin/social-release-publisher.mjs')))
    const ready=json(MANIFEST)
    const timing=validateCampaign(job,{root:ROOT,manifest:ready,now:new Date('2026-11-03T13:59:00Z')})
    if(timing!=='NOT_DUE')throw Error('LINKEDIN_QUEUE_TIME_INVALID')
    const gate=await checkLiveBlog({...job,_copyFile:join(ROOT,COPY)})
    if(gate.verdict!=='PASS'||gate.checks!==15)throw Error('OWNER_PINNED_GATE_NOT_PASS')
    const queued=join(PRIVATE,'queue',SLUG+'.json')
    if(existsSync(queued)){
      if(JSON.stringify(JSON.parse(readFileSync(queued,'utf8')))!==JSON.stringify(job))
        throw Error('QUEUE_ALREADY_CONTAINS_DIFFERENT_JOB')
    }else writeFileSync(queued,JSON.stringify(job,null,2)+'\n',{mode:0o600,flag:'wx'})
    persist('SOCIAL_ARMED',{scheduledLinkedInAt:job.scheduledAt})
    notify('success','LinkedIn armado para 09:00 Lima, V3 aprobada, documento y gate 15/15. El post aún no se ha enviado.')
  }
}
async function main(){
  const mode=process.argv[2]
  const job=preflight()
  if(mode==='--preflight'){
    if(state.phase==='PENDING'){
      exec('git',['apply','--check',PATCH])
      exec('git',['push','--dry-run','origin','HEAD:main'])
    }
    const {validateCampaign}=await import(pathToFileURL(join(ROOT,'scripts/social-release-core.mjs')))
    const fake=json(MANIFEST)
    fake.publications[SLUG]={status:'LISTO_PARA_DISTRIBUCION_EXTERNA',gateVerdict:'PASS',
      campaign:job.campaign,utmUrl:job.utmUrl,canonicalUrl:CANONICAL}
    if(validateCampaign(job,{now:new Date('2026-11-03T13:59:00Z'),root:ROOT,manifest:fake})!=='NOT_DUE')
      throw Error('APPROVED_TIME_WRONG')
    emit({status:'READY',article:'2026-11-03 07:00 Lima',
      linkedin:'2026-11-03 09:00 Lima',state:state.phase})
    return
  }
  if(!['--article','--social'].includes(mode))throw Error('INVALID_OPERATION')
  try{if(mode==='--article')await article();else await social()}
  catch(error){handleFault(mode,error)}
}
main().catch(e=>{emit({status:'UNRECOVERABLE_PREFLIGHT',reason:String(e.message)});process.exitCode=1})
