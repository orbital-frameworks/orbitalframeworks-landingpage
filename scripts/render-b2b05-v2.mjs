#!/usr/bin/env node
// Reproducible surgical V2: authentic Orbi on slides 1,3,5; V1 untouched.
import { readFile, writeFile, mkdir, copyFile, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join, resolve, dirname } from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const base=join(root,'docs/social/b2b05/v1')
const dest=join(root,'docs/social/b2b05/v2')
const mascotRoot='/srv/orbital/workspaces/Content-Factory/projects/orbital-frameworks/brand/mascot/exports'
const {chromium}=createRequire('/srv/orbital/workspaces/Content-Factory/package.json')('playwright')
const sha=async file=>createHash('sha256').update(await readFile(file)).digest('hex')
const poses=[
  {slide:1,source:'11_confused.png',file:'orbi-confused.png',purpose:'Visualiza el traspaso incierto entre ventas y almacén'},
  {slide:3,source:'17_presenting.png',file:'orbi-presenting.png',purpose:'Acompaña el recorrido de estados y responsables'},
  {slide:5,source:'10_pointing.png',file:'orbi-pointing.png',purpose:'Dirige la mirada hacia la guía completa'}
]
const css=[
  '/* B2B05 V2: única intervención, integrar Orbi sin alterar copy ni diagrama */',
  '.orbi-b2b05{position:absolute;display:block;object-fit:contain;z-index:5;pointer-events:none;user-select:none}',
  '.page1 .handoff{top:1025px}',
  '.page1 .orbi-b2b05{left:395px;top:760px;width:290px;height:290px}',
  '.page3 .orbi-b2b05{left:761px;top:1007px;width:270px;height:270px}',
  '.page5 .cta .arrow{opacity:0}',
  '.page5 .orbi-b2b05{left:764px;top:970px;width:260px;height:260px}'
].join('\n')

await mkdir(join(dest,'assets'),{recursive:true})
const baseHtml=await readFile(join(base,'source.html'),'utf8')
let html=baseHtml.replace('</style>',css+'\n</style>')
for(const pose of poses){
  const selector='<section class="page page'+pose.slide
  if(html.split(selector).length!==2)throw Error('ANCHOR_CHANGED:'+selector)
  const n=html.indexOf('>',html.indexOf(selector))+1
  const tag='\n<img class="orbi-b2b05" src="assets/'+pose.file+'" alt="" aria-hidden="true" data-orbi="'+pose.source+'">'
  html=html.slice(0,n)+tag+html.slice(n)
}
await writeFile(join(dest,'source.html'),html)
for(const pose of poses){
  const src=join(mascotRoot,pose.source)
  const out=join(dest,'assets',pose.file)
  await copyFile(src,out)
  pose.sha256=await sha(src)
  if(await sha(out)!==pose.sha256)throw Error('MASCOT_HASH_CHANGED:'+pose.file)
}

const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,
  args:['--no-sandbox','--disable-dev-shm-usage']})
try{
  const page=await browser.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:1})
  const original=await browser.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:1})
  await Promise.all([
    page.goto('file://'+join(dest,'source.html'),{waitUntil:'load'}),
    original.goto('file://'+join(base,'source.html'),{waitUntil:'load'})
  ])
  await Promise.all([page.evaluate(()=>document.fonts.ready),original.evaluate(()=>document.fonts.ready)])
  const oldTexts=await original.locator('.page').evaluateAll(p=>p.map(x=>x.innerText))
  const qa=await page.locator('.page').evaluateAll(p=>p.map((node,i)=>{
    const r=node.getBoundingClientRect()
    const mascots=[...node.querySelectorAll('img.orbi-b2b05')].map(img=>{
      const b=img.getBoundingClientRect()
      return {complete:img.complete,naturalWidth:img.naturalWidth,
        x:b.x-r.x,y:b.y-r.y,width:b.width,height:b.height}
    })
    const clips=[...node.querySelectorAll('h1,h2,h3,p,.tier,.ticket,.cta,.ftxt,.frow,.check,.pane')]
      .filter(el=>{
        const c=getComputedStyle(el)
        return (el.scrollWidth>el.clientWidth+8&&c.overflowX!=='visible')||
          (el.scrollHeight>el.clientHeight+8&&c.overflowY!=='visible')
      }).map(el=>el.tagName+'.'+el.className)
    return {slide:i+1,width:r.width,height:r.height,text:node.innerText,mascots,clips}
  }))
  if(qa.length!==5||qa.some((x,i)=>x.width!==1080||x.height!==1350||x.clips.length||
      x.text!==oldTexts[i]||x.mascots.length!==([1,3,5].includes(i+1)?1:0)||
      x.mascots.some(m=>!m.complete||m.naturalWidth!==1080||m.x<0||m.y<0||
        m.x+m.width>1080||m.y+m.height>1350)))
    throw Error('V2_LAYOUT_OR_COPY_INVALID:'+JSON.stringify(qa.map(({text,...rest})=>rest)))
  const geom=await page.evaluate(()=>{
    const line=document.querySelector('.page3 .flowline').getBoundingClientRect()
    const nodes=[...document.querySelectorAll('.page3 .node')].map(n=>n.getBoundingClientRect())
    return {stemCenter:line.x+line.width/2,nodeCenters:nodes.map(n=>n.x+n.width/2),
      start:line.top,end:line.bottom,
      first:nodes[0].y+nodes[0].height/2,last:nodes.at(-1).y+nodes.at(-1).height/2}
  })
  if(geom.nodeCenters.some(x=>Math.abs(x-geom.stemCenter)>1.5)||geom.start>geom.first||geom.end<geom.last)
    throw Error('FLOW_GEOMETRY_REGRESSION:'+JSON.stringify(geom))
  const outputs=[]
  for(let i=1;i<=5;i++){
    const name='slide-'+String(i).padStart(2,'0')+'.png'
    await page.locator('.page[data-slide="'+i+'"]').screenshot({path:join(dest,name)})
    outputs.push(name)
  }
  await page.pdf({path:join(dest,'orbital-b2b05-carousel-v2.pdf'),
    printBackground:true,preferCSSPageSize:true,width:'1080px',height:'1350px'})
  outputs.push('orbital-b2b05-carousel-v2.pdf')
  for(const [mode,width,height] of [['mobile',530,1120],['desktop',960,1030]]){
    const template=await readFile(join(base,mode+'-preview.html'),'utf8')
    if(!template.includes('slide-01.png'))throw Error('INVALID_PREVIEW_TEMPLATE')
    await writeFile(join(dest,mode+'-preview.html'),template)
    const preview=await browser.newPage({viewport:{width,height},deviceScaleFactor:1})
    await preview.goto('file://'+join(dest,mode+'-preview.html'),{waitUntil:'load'})
    await preview.screenshot({path:join(dest,mode+'-preview.png')})
    await preview.close()
    outputs.push(mode+'-preview.png')
  }
  const v1=JSON.parse(await readFile(join(base,'render-manifest.json'),'utf8'))
  const files=await Promise.all(outputs.map(async file=>({
    file,sha256:await sha(join(dest,file)),bytes:(await stat(join(dest,file))).size
  })))
  const comparisons=[]
  for(let i=1;i<=5;i++){
    const name='slide-'+String(i).padStart(2,'0')+'.png'
    const from=v1.outputs.find(x=>x.file===name).sha256
    const to=files.find(x=>x.file===name).sha256
    const changed=from!==to
    if(changed!==[1,3,5].includes(i))throw Error('UNEXPECTED_SLIDE_DELTA:'+i)
    comparisons.push({slide:i,changed,v1Sha256:from,v2Sha256:to})
  }
  const manifest={
    schema:'orbital.b2b05.carousel.v2',status:'REVIEW_NOT_PUBLISHED',createdAt:new Date().toISOString(),
    source:'docs/social/b2b05/v2/source.html',sourceBase:'docs/social/b2b05/v1/source.html',
    renderer:'scripts/render-b2b05-v2.mjs',articleUnchanged:true,linkedInCopyUnchanged:true,
    slides:5,canvas:{width:1080,height:1350},mascots:poses,
    slideQA:qa.map(({text,...rest})=>({...rest,textSha256:createHash('sha256').update(text).digest('hex')})),
    connections:geom,comparisons,outputs:files
  }
  await writeFile(join(dest,'render-manifest.json'),JSON.stringify(manifest,null,2)+'\n')
  console.log(JSON.stringify({status:'V2_RENDER_PASS',changed:comparisons.filter(x=>x.changed).map(x=>x.slide),
    identicalToV1:comparisons.filter(x=>!x.changed).map(x=>x.slide),
    orbi:poses.map(x=>x.source),files:files.map(x=>x.file)}))
}finally{await browser.close()}
