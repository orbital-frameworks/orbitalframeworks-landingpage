#!/usr/bin/env node
// Owner-only durable scheduling surface. Never executes unapproved campaign files.
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, readdirSync, lstatSync, statSync, openSync, closeSync, unlinkSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { assertSafeRelativePath, nextReleaseAction, slugPattern, validateCampaign } from './social-release-core.mjs'
import { checkLiveBlog, publishDocumentOnce, reconcileSubmitted } from './social-release-publisher.mjs'

const HOME = process.env.SOCIAL_RELEASE_HOME || '/srv/orbital/runtimes/private/social-release'
const dryRun = process.argv.includes('--dry-run')
// The only root override is for *read-only* test mode on GitHub runners.
// Live publication and reconciliation always use the fixed VPS project.
const PROJECT = dryRun && process.env.SOCIAL_RELEASE_PROJECT_ROOT
  ? resolve(process.env.SOCIAL_RELEASE_PROJECT_ROOT)
  : '/srv/orbital/workspaces/orbitalframeworks-landingpage'
const JOURNAL = '/srv/orbital/runtimes/private/linkedin-company-admin-browser/publication-journal'
const OPS_RELAY = '/srv/orbital/workspaces/orbital-operations/tools/orbital-relay/scripts/relayctl.mjs'
const RELAY_ENV = '/srv/orbital/secrets/private/orbital-relay.env'
const emit = x => process.stdout.write(JSON.stringify(x)+'\n')
const readJson = file => JSON.parse(readFileSync(file,'utf8'))
const atomicJson = (file, value) => {
  const tmp = `${file}.${process.pid}.tmp`
  writeFileSync(tmp,JSON.stringify(value,null,2)+'\n',{mode:0o600,flag:'wx'})
  renameSync(tmp,file)
}
const redactReason = error => String(error?.message || error).slice(0,300)
const stateFile = slug => join(HOME,'state',slug+'.json')
const journalFile = slug => join(JOURNAL,slug+'.json')

export function acquireRunLock(lockPath, nowMs=Date.now()) {
  try {
    const fd=openSync(lockPath,'wx',0o600)
    writeFileSync(fd,JSON.stringify({pid:process.pid,startedAt:new Date(nowMs).toISOString()})+'\n')
    return fd
  } catch(error) {
    if(error.code!=='EEXIST')throw error
    const stat=statSync(lockPath)
    if(nowMs-stat.mtimeMs < 9*60000) throw Error('SOCIAL_RELEASE_ALREADY_RUNNING_OR_RECENT_LOCK')
    let pid
    try {pid=JSON.parse(readFileSync(lockPath,'utf8')).pid}catch{}
    if(Number.isInteger(pid) && pid>0) {
      try{process.kill(pid,0);throw Error('SOCIAL_RELEASE_LOCK_OWNER_ALIVE')}
      catch(check) {if(check.code!=='ESRCH')throw check}
    }
    // A dead owner cannot hold this lock. Existing submission journals remain
    // untouched and will be reconciled read-only after crash recovery.
    unlinkSync(lockPath)
    const fd=openSync(lockPath,'wx',0o600)
    writeFileSync(fd,JSON.stringify({pid:process.pid,recoveredStaleAt:new Date(nowMs).toISOString()})+'\n')
    return fd
  }
}

export function notifyTerminal({ slug, state }) {
  if (state.delivery?.confirmed) return state
  const type = state.phase === 'PUBLISHED_VERIFIED' ? 'WORK_RUN_COMPLETED' : 'WORK_RUN_FAILED'
  const severity = type === 'WORK_RUN_COMPLETED' ? 'info' : 'error'
  const summary = `Social release ${slug}: ${state.phase}. ${state.permalink || ''} ${state.reason || ''}`.slice(0,850)
  // Secrets are loaded only in a short-lived relay child, never into Chrome.
  const script = 'set -a; source "$1"; set +a; exec /usr/local/bin/node "$2" emit orbital-landing "$3" "$4" personal "$5"'
  const result = spawnSync('/bin/bash',['-c',script,'social-relay',RELAY_ENV,OPS_RELAY,type,severity,summary],
    {encoding:'utf8',timeout:27000,maxBuffer:1024*128})
  let data
  try {data=JSON.parse(result.stdout.trim())}catch{}
  const confirmed=result.status===0 && data?.delivery?.confirmed === true &&
    data.delivery.receipts?.some(x=>x.channel==='telegram' && x.messageId)
  const next={...state,delivery:{confirmed,messageId:data?.delivery?.receipts?.find(x=>x.channel==='telegram')?.messageId || null,
    attemptedAt:new Date().toISOString(),reason:confirmed?null:'TELEGRAM_DELIVERY_NOT_CONFIRMED'}}
  atomicJson(stateFile(slug),next)
  return next
}

async function processJob(job, now, manifest) {
  const slug=job.slug
  if (!slugPattern.test(slug||'')) throw Error('INVALID_QUEUE_FILENAME_SLUG')
  const saved=existsSync(stateFile(slug)) ? readJson(stateFile(slug)) : null
  const oldJournal=existsSync(journalFile(slug)) ? readJson(journalFile(slug)) : null
  let action = oldJournal?.phase === 'SUBMISSION_PENDING' ||
    oldJournal?.phase === 'NEEDS_RECONCILIATION' ? 'RECONCILE' :
    nextReleaseAction({job,now,root:PROJECT,manifest,state:saved})
  if (oldJournal?.phase === 'PUBLISHED_VERIFIED') action='SKIP_COMPLETED'
  if (saved?.phase === 'NEEDS_RECONCILIATION' && Date.parse(saved.nextRetryAt||'')>now.getTime())
    action='NOT_DUE'
  if (dryRun) return emit({slug,action,dryRun:true})
  if (oldJournal?.phase === 'PUBLISHED_VERIFIED' && saved?.phase !== 'PUBLISHED_VERIFIED') {
    const final={...oldJournal,slug,phase:'PUBLISHED_VERIFIED',permalink:oldJournal.url}
    atomicJson(stateFile(slug),final)
    notifyTerminal({slug,state:final})
    return emit({slug,action:'RECOVERED_FROM_VERIFIED_JOURNAL'})
  }
  if (action === 'NOT_DUE')return emit({slug,action})
  if (action === 'SKIP_COMPLETED'||action==='SKIP_BLOCKED') {
    if(saved && !saved.delivery?.confirmed && saved.phase!=='PREFLIGHT_RETRYABLE') notifyTerminal({slug,state:saved})
    return emit({slug,action})
  }
  if (action === 'SKIP_ALREADY_DISTRIBUTED') {
    // A later Git manifest may be the only proof; never attempt another click.
    atomicJson(stateFile(slug),{phase:'ALREADY_DISTRIBUTED',slug,checkedAt:now.toISOString(),reason:'MANIFEST_DISTRIBUTED_NO_CLICK'})
    return emit({slug,action})
  }
  const prepared={...job,_pdfFile:assertSafeRelativePath(PROJECT,job.pdfPath,'pdf'),
    _copyFile:assertSafeRelativePath(PROJECT,job.copyPath)}
  if (action === 'RECONCILE') {
    try {
      const receipt=await reconcileSubmitted(prepared)
      if(receipt.status==='PUBLISHED_VERIFIED') {
        const complete={...receipt,slug,phase:'PUBLISHED_VERIFIED',permalink:receipt.url}
        atomicJson(stateFile(slug),complete); atomicJson(journalFile(slug),{...receipt,phase:'PUBLISHED_VERIFIED'})
        notifyTerminal({slug,state:complete});return emit({slug,action:'RECONCILED',url:receipt.url})
      }
      const pending={phase:'NEEDS_RECONCILIATION',slug,reason:receipt.reason,
        foundUrn:receipt.foundUrn||null,nextRetryAt:new Date(now.getTime()+15*60_000).toISOString(),
        checkedAt:now.toISOString(),...saved}
      // Preserve last diagnostic over stale state while retaining the original submission record.
      pending.phase='NEEDS_RECONCILIATION'; pending.reason=receipt.reason
      pending.nextRetryAt=new Date(now.getTime()+15*60_000).toISOString()
      atomicJson(stateFile(slug),pending)
      notifyTerminal({slug,state:pending});return emit({slug,action:'NEEDS_RECONCILIATION',reason:receipt.reason})
    } catch(error) {
      const pending={...saved,phase:'NEEDS_RECONCILIATION',slug,reason:redactReason(error),
        nextRetryAt:new Date(now.getTime()+15*60_000).toISOString()}
      atomicJson(stateFile(slug),pending);notifyTerminal({slug,state:pending})
      return emit({slug,action:'NEEDS_RECONCILIATION',reason:pending.reason})
    }
  }
  let phase = saved?.phase === 'PREFLIGHT_RETRYABLE' ? 'PREFLIGHT_RETRYABLE' : 'PREFLIGHT_STARTED'
  const attempts=(saved?.attempts||0)+1
  atomicJson(stateFile(slug),{phase,slug,attempts,checkedAt:now.toISOString()})
  let clickPossible=false
  try {
    validateCampaign(job,{now,root:PROJECT,manifest})
    if(existsSync(journalFile(slug)))throw Error('JOURNAL_EXISTS_NO_SECOND_CLICK')
    await checkLiveBlog(job)
    const receipt=await publishDocumentOnce(prepared,{recordPending:async()=>{
      const pending={phase:'SUBMISSION_PENDING',slug,attempts,submittedAt:new Date().toISOString(),
        pdfSha256:job.pdfSha256,copySha256:job.copySha256}
      // Exclusive journal is durable even if process is interrupted.
      writeFileSync(journalFile(slug),JSON.stringify(pending,null,2)+'\n',{flag:'wx',mode:0o600})
      clickPossible=true
      atomicJson(stateFile(slug),pending)
    }})
    const final={...receipt,phase:'PUBLISHED_VERIFIED',slug,permalink:receipt.url}
    atomicJson(journalFile(slug),final);atomicJson(stateFile(slug),final)
    notifyTerminal({slug,state:final})
    return emit({slug,action:'PUBLISHED_VERIFIED',url:receipt.url})
  } catch(error) {
    const ambiguous=clickPossible || existsSync(journalFile(slug))
    const fatal=/APPROVAL|SHA_MISMATCH|INVALID_|EXPIRED|OUTSIDE_|DUPLICATE|ALREADY_|MANIFEST_|UTM_|JOURNAL_EXISTS|NOT_READY|NO_SECOND_CLICK/.test(redactReason(error))
    phase=ambiguous?'NEEDS_RECONCILIATION':fatal||attempts>=3?'BLOCKED':'PREFLIGHT_RETRYABLE'
    const fault={phase,slug,reason:redactReason(error),attempts,checkedAt:new Date().toISOString(),
      nextRetryAt:phase==='PREFLIGHT_RETRYABLE'?new Date(now.getTime()+attempts*120000).toISOString():
        phase==='NEEDS_RECONCILIATION'?new Date(now.getTime()+15*60000).toISOString():null}
    atomicJson(stateFile(slug),fault)
    if(attempts===1 || phase!=='PREFLIGHT_RETRYABLE')notifyTerminal({slug,state:fault})
    return emit({slug,action:phase,reason:fault.reason})
  }
}

export async function runDue({now=new Date()}={}) {
  for(const folder of [HOME,join(HOME,'queue'),join(HOME,'state'),...(dryRun?[]:[JOURNAL])])
    mkdirSync(folder,{recursive:true,mode:0o700})
  const files=readdirSync(join(HOME,'queue')).filter(x=>x.endsWith('.json')).sort()
  if(files.length===0)return emit({status:'NO_APPROVED_RELEASES',publisherClicks:0})
  const manifest=readJson(join(PROJECT,'docs/blog-linkedin-manifest.json'))
  for(const file of files) {
    const full=join(HOME,'queue',file)
    if(!lstatSync(full).isFile()) {emit({file,status:'INVALID_QUEUE_ENTRY'});continue}
    try {
      const job=readJson(full)
      if(file!==job.slug+'.json')throw Error('QUEUE_FILENAME_CAMPAIGN_MISMATCH')
      await processJob(job,now,manifest)
    } catch(error){
      const slug=file.slice(0,-5)
      const reason=redactReason(error)
      if (!dryRun && slugPattern.test(slug)) {
        const previous=existsSync(stateFile(slug))?readJson(stateFile(slug)):null
        if(!previous || previous.phase!=='BLOCKED' || previous.reason!==reason) {
          const fault={slug,phase:'BLOCKED',reason,checkedAt:new Date().toISOString()}
          atomicJson(stateFile(slug),fault)
          notifyTerminal({slug,state:fault})
        }
      }
      emit({file,status:'JOB_ERROR',reason})
    }
  }
}

if (process.argv[1] && resolve(process.argv[1])===resolve(import.meta.filename)) {
  const lockPath=join(HOME,'.runner.lock')
  mkdirSync(HOME,{recursive:true,mode:0o700})
  let lock
  try{lock=acquireRunLock(lockPath)}
  catch(error){emit({status:'RUNNER_LOCK_BLOCKED',reason:redactReason(error)});process.exit(1)}
  try{await runDue()}
  catch(error){emit({status:'RUNNER_FAILURE',reason:redactReason(error)});process.exitCode=1}
  finally{closeSync(lock);unlinkSync(lockPath)}
}
