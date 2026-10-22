// Browser implementation for one approved LinkedIn company DOCUMENT.
// The scheduled service executes an owner-only snapshot of this module, not a
// mutable Team workspace checkout. Never posts text-only or silently retries.
import { readFileSync } from 'node:fs'
import { runGateCheck } from './blog-linkedin-gate.mjs'

export const PROFILE_ROOT = '/srv/orbital/runtimes/private/linkedin-company-admin-browser/profile'
const COMPANY_ID = '134014070'

export function outboundLinkTargets(anchors) {
  const result=[]
  for (const a of anchors) {
    for (const raw of [a.href,a.text]) {
      try {
        const url=new URL(raw)
        if (url.hostname==='www.linkedin.com' && url.pathname==='/safety/go/') {
          const destination=url.searchParams.get('url')
          if (destination)result.push(destination)
        } else if (url.protocol==='https:') result.push(url.href)
      } catch { /* Plain link labels are not URLs. */ }
    }
  }
  return [...new Set(result)]
}

export async function openVerifiedBrowser() {
  // The owner-run scheduled service uses an owner-only, reviewed dependency
  // snapshot. Do NOT execute a package from a Team-writable checkout here.
  const { chromium } = await import('playwright')
  return chromium.launchPersistentContext(PROFILE_ROOT, {
    executablePath:'/usr/bin/google-chrome',headless:true,
    args:['--disable-dev-shm-usage','--no-first-run']
  })
}

async function openAdmin(page) {
  const url = `https://www.linkedin.com/company/${COMPANY_ID}/admin/page-posts/published/`
  const response = await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000})
  if (response?.status()!==200 || !page.url().includes(`/company/${COMPANY_ID}/admin`))
    throw Error('LINKEDIN_COMPANY_SESSION_NOT_VERIFIED')
  await page.locator('[data-urn^="urn:li:activity:"]').first().waitFor({state:'attached',timeout:22000})
}

async function findPost(page,firstLine) {
  await openAdmin(page)
  const cards = await page.locator('[data-urn^="urn:li:activity:"]').evaluateAll(nodes=>nodes.map(n=>({
    urn:n.getAttribute('data-urn'),text:n.innerText||''
  })))
  return cards.find(x=>x.text.includes(firstLine)) || null
}

export async function checkLiveBlog(job) {
  const controller=new AbortController()
  const timeout=setTimeout(()=>controller.abort(),16000)
  try {
    const [article,sitemap,feed]=await Promise.all([
      fetch(job.canonicalUrl,{signal:controller.signal}),
      fetch('https://orbitalframeworks.qzz.io/sitemap.xml',{signal:controller.signal}),
      fetch('https://orbitalframeworks.qzz.io/feed.xml',{signal:controller.signal})
    ])
    if (![article,sitemap,feed].every(r=>r.ok))throw Error('BLOG_NOT_PUBLIC_HTTP200')
    const [html,xml,rss]=await Promise.all([article.text(),sitemap.text(),feed.text()])
    if (!html.includes('<h1') || !html.includes(job.canonicalUrl) ||
      !html.includes('rel="canonical"') || !html.includes('og:') ||
      /<meta[^>]*name="robots"[^>]*noindex/i.test(html) ||
      !xml.includes(job.canonicalUrl) || !rss.includes(job.slug))
      throw Error('BLOG_PUBLIC_SEO_FEED_GATE_FAILED')
    // Reuse the canonical 15-check editorial gate, pinned in the owner's
    // immutable runner snapshot rather than reimplementing a weaker substitute.
    const copy=readFileSync(job._copyFile,'utf8').trim()
    const gate=await runGateCheck({
      rootPath:'/srv/orbital/workspaces/orbitalframeworks-landingpage',
      slug:job.slug,dryRun:true,customCopy:copy
    })
    if (!gate.ok || gate.verdict!=='PASS' || gate.checks?.length!==15 ||
      gate.checks.some(x=>x.passed!==true))
      throw Error(`BLOG_15_CHECK_GATE_FAILED:${gate.errorCode || gate.failedChecks?.map(x=>x.id).join(',') || 'unverified'}`)
    return {verdict:'PASS',checks:15,httpStatus:article.status,sitemap:true,feed:true}
  } finally {clearTimeout(timeout)}
}

// Returns a public permalink only if LinkedIn shows the approved document
// title, all page navigation controls, and the exact campaign target URL.
export async function verifyPublishedPost(page,job,urn) {
  if (!/^urn:li:activity:\d+$/.test(urn || '')) throw Error('LINKEDIN_POST_URN_UNVERIFIED')
  const url=`https://www.linkedin.com/feed/update/${urn}?actorCompanyId=${COMPANY_ID}`
  const res=await page.goto(url,{waitUntil:'domcontentloaded',timeout:26000})
  await page.waitForTimeout(2200)
  const body=await page.locator('body').innerText()
  const firstLine=readFileSync(job._copyFile,'utf8').trim().split('\n')[0]
  if (res?.status()!==200 || !body.includes('Orbital Frameworks') || !body.includes(firstLine))
    throw Error('LINKEDIN_PUBLIC_POST_AUTHOR_OR_COPY_NOT_VERIFIED')
  if (!body.includes(job.documentTitle.slice(0,Math.min(17,job.documentTitle.length))))
    throw Error('LINKEDIN_DOCUMENT_TITLE_MISSING')
  if (!body.includes(`${job.pdfPages} páginas`))
    throw Error('LINKEDIN_DOCUMENT_PAGE_COUNT_MISSING')
  for(let i=1;i<=job.pdfPages;i++) {
    if (await page.getByLabel(`Página ${i} de ${job.pdfPages}`).count()!==1)
      throw Error(`LINKEDIN_DOCUMENT_PAGE_${i}_NOT_VISIBLE`)
  }
  // LinkedIn often wraps its visible lnkd.in links in /safety/go/?url=...
  // The approved destination must still match after both redirect layers.
  const links=outboundLinkTargets(await page.locator('a[href]').evaluateAll(nodes=>
    nodes.map(a=>({href:a.href,text:a.innerText.trim()})).filter(x=>x.href)))
  if (!links.includes(job.utmUrl)) {
    const short=links.find(x=>x.startsWith('https://lnkd.in/'))
    if (!short)throw Error('LINKEDIN_APPROVED_UTM_LINK_MISSING')
    const probe=await page.context().newPage()
    try {
      const result=await probe.goto(short,{waitUntil:'domcontentloaded',timeout:25000})
      const destinations=await probe.locator('a[href]').evaluateAll(nodes=>nodes.map(x=>x.href))
      if (result?.status()!==200 || !destinations.includes(job.utmUrl))
        throw Error('LINKEDIN_SHORTLINK_TARGET_MISMATCH')
    } finally {await probe.close()}
  }
  return {status:'PUBLISHED_VERIFIED',url,urn,companyId:COMPANY_ID,
    pdfSha256:job.pdfSha256,copySha256:job.copySha256,pdfPages:job.pdfPages,
    utmUrl:job.utmUrl,publicDocumentVerified:true,postTextVerified:true,
    verifiedAt:new Date().toISOString()}
}

export async function reconcileSubmitted(job) {
  const browser=await openVerifiedBrowser()
  try {
    const page=browser.pages()[0]||await browser.newPage()
    const copy=readFileSync(job._copyFile,'utf8').trim()
    const post=await findPost(page,copy.split('\n')[0])
    if (!post)return {status:'NEEDS_RECONCILIATION',reason:'POST_NOT_IN_VISIBLE_FEED_NO_RETRY'}
    try {return await verifyPublishedPost(page,job,post.urn)}
    catch(e){return {status:'NEEDS_RECONCILIATION',reason:e.message,foundUrn:post.urn}}
  } finally {await browser.close()}
}

export async function publishDocumentOnce(job,{recordPending}) {
  await checkLiveBlog(job)
  const browser=await openVerifiedBrowser()
  try {
    const page=browser.pages()[0]||await browser.newPage()
    const copy=readFileSync(job._copyFile,'utf8').trim()
    const firstLine=copy.split('\n')[0]
    if(await findPost(page,firstLine))throw Error('LINKEDIN_DUPLICATE_ALREADY_IN_FEED')
    await page.getByRole('button',{name:/Crear publicación|Create a post/i}).first().click()
    let dialog=page.getByRole('dialog').last()
    await dialog.waitFor({state:'visible',timeout:12000})
    await dialog.getByText('Orbital Frameworks',{exact:true}).first().waitFor({state:'visible',timeout:16000})
    if (!(await dialog.innerText()).includes('Orbital Frameworks'))throw Error('WRONG_LINKEDIN_AUTHOR')
    // Upload BEFORE typing the URL; otherwise LinkedIn's preview can remove the picker.
    await dialog.getByRole('button',{name:'Más',exact:true}).click()
    await page.getByRole('button',{name:'Añadir un documento'}).click()
    const picker=page.locator('input[type="file"]').last()
    await picker.waitFor({state:'attached',timeout:12000})
    await picker.setInputFiles(job._pdfFile)
    const titleDialog=page.getByRole('dialog').last()
    await titleDialog.getByPlaceholder('Añade un título descriptivo al documento').fill(job.documentTitle)
    await titleDialog.getByRole('button',{name:'Hecho'}).click()
    dialog=page.getByRole('dialog').last()
    await dialog.getByText('Tu documento ha terminado de cargarse').waitFor({state:'visible',timeout:65000})
    if(await dialog.getByRole('button',{name:'Eliminar contenido multimedia'}).count()!==1)
      throw Error('LINKEDIN_APPROVED_PDF_NOT_ATTACHED')
    const editor=dialog.locator('[role="textbox"][contenteditable="true"]').first()
    await editor.fill(copy)
    await page.waitForTimeout(1000)
    const actual=await editor.evaluate(el=>[...el.children].map(x=>x.textContent||'').join('\n'))
    if(actual!==copy)throw Error('LINKEDIN_POST_COPY_MISMATCH')
    const button=dialog.getByRole('button',{name:/^(Publicar|Post)$/i}).first()
    if(!await button.isEnabled())throw Error('LINKEDIN_PUBLISH_BUTTON_DISABLED')
    // Durable owner state and provider journal must be written BEFORE the only click.
    await recordPending()
    await button.click({timeout:15000})
    await dialog.waitFor({state:'hidden',timeout:35000})
    for(let attempt=0;attempt<4;attempt++) {
      await page.waitForTimeout(1700+attempt*1800)
      const post=await findPost(page,firstLine)
      if(post)return await verifyPublishedPost(page,job,post.urn)
    }
    throw Error('LINKEDIN_CLICK_SUBMITTED_BUT_POST_NOT_FOUND')
  } finally {await browser.close()}
}
