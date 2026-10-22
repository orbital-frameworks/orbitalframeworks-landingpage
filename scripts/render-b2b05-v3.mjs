#!/usr/bin/env node
// One-slide surgical correction: give Orbi a distinct place on slide 5.
// B2B05 V1 and V2 are immutable. Nothing is published or scheduled.
import { readFile, writeFile, mkdir, copyFile, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { dirname, join, resolve } from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const prior = join(root, 'docs/social/b2b05/v2')
const dest = join(root, 'docs/social/b2b05/v3')
const { chromium } = createRequire('/srv/orbital/workspaces/Content-Factory/package.json')('playwright')
const digest = async file => createHash('sha256').update(await readFile(file)).digest('hex')
const correction = [
  '/* V3: Move only the final Orbi into the green guide space beside the introduction. */',
  '.page5 .intro{width:645px}',
  '.page5 .orbi-b2b05{left:748px;top:448px;width:305px;height:305px}',
  '.page5 .cta .arrow{opacity:1}'
].join('\n')

await mkdir(join(dest,'assets'), {recursive:true})
const original = await readFile(join(prior,'source.html'),'utf8')
if(!original.includes('.page5 .orbi-b2b05') || !original.includes('</style>'))
  throw Error('V2_SOURCE_CHANGED')
const source = original.replace('</style>',correction+'\n</style>')
await writeFile(join(dest,'source.html'),source)
for(const filename of ['orbi-confused.png','orbi-presenting.png','orbi-pointing.png'])
  await copyFile(join(prior,'assets',filename),join(dest,'assets',filename))

const browser = await chromium.launch({headless:true,executablePath:'/usr/bin/google-chrome',
  args:['--no-sandbox','--disable-dev-shm-usage']})
try {
  const [basePage, page] = await Promise.all([
    browser.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:1}),
    browser.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:1})
  ])
  await Promise.all([
    basePage.goto('file://'+join(prior,'source.html'),{waitUntil:'load'}),
    page.goto('file://'+join(dest,'source.html'),{waitUntil:'load'})
  ])
  await Promise.all([basePage.evaluate(()=>document.fonts.ready),page.evaluate(()=>document.fonts.ready)])
  const previousText=await basePage.locator('.page').evaluateAll(nodes=>nodes.map(n=>n.innerText))
  const checks=await page.locator('.page').evaluateAll(nodes=>nodes.map((node,index)=>{
    const frame=node.getBoundingClientRect()
    const content=node.querySelectorAll('h1,h2,h3,p,.tier,.ticket,.cta,.ftxt,.frow,.check,.pane')
    const overflow=[...content].filter(el=>{
      const style=getComputedStyle(el)
      return (el.scrollWidth>el.clientWidth+8&&style.overflowX!=='visible') ||
        (el.scrollHeight>el.clientHeight+8&&style.overflowY!=='visible')
    }).map(el=>el.className||el.tagName)
    const figure=node.querySelector('img.orbi-b2b05')
    const mascot=figure?(()=>{
      const b=figure.getBoundingClientRect()
      return {loaded:figure.complete && figure.naturalWidth===1080,
        x:b.x-frame.x,y:b.y-frame.y,w:b.width,h:b.height}
    })():null
    return {slide:index+1,width:frame.width,height:frame.height,overflow,
      text:node.innerText,mascot}
  }))
  if(checks.length!==5 || checks.some((p,i)=>p.width!==1080||p.height!==1350||
      p.overflow.length||p.text!==previousText[i]||([1,3,5].includes(i+1)?!p.mascot:p.mascot)))
    throw Error('V3_TEXT_OR_LAYOUT_REGRESSION:'+JSON.stringify(checks.map(({text,...other})=>other)))
  const fifth=checks[4].mascot
  if(!fifth.loaded||fifth.x<0||fifth.y<0||fifth.x+fifth.w>1080||fifth.y+fifth.h>1350)
    throw Error('FINAL_ORBI_NOT_FULLY_VISIBLE')
  const spatial=await page.evaluate(()=>{
    const root=document.querySelector('.page5')
    const q=selector=>{
      const r=root.querySelector(selector).getBoundingClientRect()
      const p=root.getBoundingClientRect()
      return {x:r.x-p.x,y:r.y-p.y,right:r.right-p.x,bottom:r.bottom-p.y}
    }
    return { intro:q('.intro'), mascot:q('.orbi-b2b05'),
      firstCheck:q('.checks .check'), cta:q('.cta') }
  })
  // The mascot's box is to the right of the introduction, not painted over
  // the CTA; allow transparent decorative pixels above the first checklist.
  if(spatial.mascot.x < spatial.intro.right+15 || spatial.mascot.bottom >= spatial.cta.y)
    throw Error('ORBI_NOT_IN_SEPARATE_GUIDE_SPACE:'+JSON.stringify(spatial))
  const outputs=[]
  for(let i=1;i<=5;i++){
    const filename='slide-'+String(i).padStart(2,'0')+'.png'
    await page.locator('.page[data-slide="'+i+'"]').screenshot({path:join(dest,filename)})
    outputs.push(filename)
  }
  await page.pdf({path:join(dest,'orbital-b2b05-carousel-v3.pdf'),
    printBackground:true,preferCSSPageSize:true,width:'1080px',height:'1350px'})
  outputs.push('orbital-b2b05-carousel-v3.pdf')
  const comparisons=[]
  for(let i=1;i<=5;i++){
    const name='slide-'+String(i).padStart(2,'0')+'.png'
    const from=await digest(join(prior,name))
    const to=await digest(join(dest,name))
    const changed=from!==to
    if(changed!==(i===5))throw Error('UNINTENDED_SLIDE_CHANGE_'+i)
    comparisons.push({slide:i,changed,shaV2:from,shaV3:to})
  }
  const outputsMeta=await Promise.all(outputs.map(async file=>({
    file,sha256:await digest(join(dest,file)),bytes:(await stat(join(dest,file))).size
  })))
  const manifest={schema:'orbital.b2b05.carousel.v3',status:'REVIEW_NOT_PUBLISHED',
    createdAt:new Date().toISOString(),derivedFrom:'docs/social/b2b05/v2/source.html',
    correction:'Orbi in green guide space on slide 05 only',changes:comparisons,
    layout:checks.map(({text,...p})=>({...p,hashText:createHash('sha256').update(text).digest('hex')})),
    spatial,outputs:outputsMeta}
  await writeFile(join(dest,'render-manifest.json'),JSON.stringify(manifest,null,2)+'\n')
  await basePage.close()
  console.log(JSON.stringify({status:'RENDER_PASS',changedSlides:comparisons.filter(x=>x.changed).map(x=>x.slide),
    identical:[1,2,3,4],pages:5,spatial}))
} finally {await browser.close()}
