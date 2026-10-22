import { readFile, writeFile, copyFile, mkdir, stat } from 'node:fs/promises'
import { join, resolve, dirname } from 'node:path'
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dest = join(projectRoot, 'docs/social/b2b03/v3')
const assets = join(dest, 'assets')
const logo = join(projectRoot, 'src/assets/Orbital Frameworks (1).png')
const mascotDir = '/srv/orbital/workspaces/Content-Factory/projects/orbital-frameworks/brand/mascot/exports'
const fonts = join(projectRoot, 'public/fonts')
const sources = [
  [logo, 'logo-original.png'],
  [join(projectRoot,'public/Logo_favicon.png'), 'logo-symbol.png'],
  [join(mascotDir, '03_thinking.png'), 'orbi-thinking.png'],
  [join(mascotDir, '10_pointing.png'), 'orbi-pointing.png'],
  [join(fonts, 'big-shoulders-display-latin.woff2'), 'big-shoulders.woff2'],
  [join(fonts, 'ibm-plex-sans-latin.woff2'), 'plex-sans.woff2'],
  [join(fonts, 'ibm-plex-mono-400-latin.woff2'), 'plex-mono.woff2'],
]

const requireFactory = createRequire('/srv/orbital/workspaces/Content-Factory/package.json')
const { chromium } = requireFactory('playwright')
const hash = async (file) => createHash('sha256').update(await readFile(file)).digest('hex')

await mkdir(assets, { recursive: true })
const provenance = []
for (const [input, output] of sources) {
  const target = join(assets, output)
  await copyFile(input, target)
  provenance.push({ output: 'assets/' + output, source: input, sha256: await hash(target) })
}
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true,
  args: ['--no-sandbox','--disable-dev-shm-usage'] })
try {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 })
  await page.goto('file://' + join(dest,'source.html'), { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  const boxes = await page.locator('.page').evaluateAll(nodes => nodes.map(node => {
    const r=node.getBoundingClientRect()
    const text = node.innerText
    const overflows=[...node.querySelectorAll('h1,h2,.sub,.lead,.question,.illustration,.diagram,.flowcase,.footer,.bottom,.top,footer')]
      .filter(el => (el.scrollHeight > el.clientHeight + 12 || el.scrollWidth > el.clientWidth + 12))
      .map(el=>({tag:el.tagName,className:el.className,text:(el.innerText||'').slice(0,55),h:el.scrollHeight,clientH:el.clientHeight}))
    return { width:Math.round(r.width),height:Math.round(r.height),textLength:text.length,overflows }
  }))
  if(boxes.length!==5 || boxes.some(x=>x.width!==1080||x.height!==1350||x.overflows.length))
    throw new Error('CANVAS_OR_TEXT_OVERFLOW:'+JSON.stringify(boxes))
  const embeddedMascotSources=await Promise.all(['orbi-thinking.png','orbi-pointing.png'].map(async name=>({
    name, src:'data:image/png;base64,'+(await readFile(join(assets,name))).toString('base64')
  })))
  const semanticQA = await page.evaluate(async (embeddedMascotSources) => {
    const root = document.querySelector('.s3 .diagram')
    const tree = document.querySelector('.s3 .tree')
    const hub = document.querySelector('.s3 .hub')
    const nodes = [...document.querySelectorAll('.s3 .node')]
    const p = el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,cx:r.x+r.width/2,top:r.y,bottom:r.y+r.height}}
    const hv=p(hub),t=p(tree),n=nodes.map(p)
    const samples = await Promise.all(embeddedMascotSources.map(async ({name,src})=>{
      const im=new Image();im.src=src;await im.decode()
      const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight
      c.getContext('2d').drawImage(im,0,0)
      const a=c.getContext('2d').getImageData(0,0,c.width,c.height).data
      let transparent=0
      for(let i=3;i<a.length;i+=4) if(a[i]===0)transparent++
      return {name,alphaAtCorner:a[3],transparentRatio:transparent/(im.naturalWidth*im.naturalHeight)}
    }))
    return {brandReady:document.querySelectorAll('.top .logo-pill img').length===5,
      artificialMascotDiscs:document.querySelectorAll('.orbi-disc').length,
      visualDisclaimerCount:[...document.querySelectorAll('.page')].filter(x=>x.innerText.includes('no captura de un sitio real')).length,
      tree:{hubCenter:hv.cx,stemCenter:t.cx,nodeCenters:n.map(x=>x.cx),nodeTops:n.map(x=>x.top),treeBottom:t.bottom,hubBottom:hv.bottom,
        horizontalStart:t.x+parseFloat(getComputedStyle(tree,'::after').left),
        horizontalEnd:t.x+t.w-parseFloat(getComputedStyle(tree,'::after').right),diagram:p(root)},
      alpha:samples}
  },embeddedMascotSources)
  if(semanticQA.artificialMascotDiscs>0 || semanticQA.visualDisclaimerCount>0 ||
    semanticQA.alpha.some(x=>x.alphaAtCorner!==0 || x.transparentRatio<0.25) ||
    Math.abs(semanticQA.tree.hubCenter-semanticQA.tree.stemCenter)>2 ||
    Math.abs(semanticQA.tree.horizontalStart-semanticQA.tree.nodeCenters[0])>2 ||
    Math.abs(semanticQA.tree.horizontalEnd-semanticQA.tree.nodeCenters[2])>2 ||
    Math.abs(semanticQA.tree.treeBottom-semanticQA.tree.nodeTops[0])>2 ||
    Math.abs(semanticQA.tree.hubBottom-(semanticQA.tree.treeBottom-101))>2)
    throw new Error('BRAND_OR_DIAGRAM_QA_FAIL:'+JSON.stringify(semanticQA))
  const outputs=[]
  for (let i=1;i<=5;i++) {
    const filename='slide-'+String(i).padStart(2,'0')+'.png'
    await page.locator('.page[data-slide="'+i+'"]').screenshot({path:join(dest,filename)})
    outputs.push(filename)
  }
  const pdfPath=join(dest,'orbital-b2b03-carousel-v3.pdf')
  await page.pdf({ path:pdfPath, printBackground:true,preferCSSPageSize:true,
    width:'1080px',height:'1350px' })
  outputs.push('orbital-b2b03-carousel-v3.pdf')
  // Only a preview: not a sent LinkedIn publication.
  const mobileHtml='<!doctype html><html lang="es"><head><style>'+
  'body{margin:0;background:#e9ebed;font-family:Arial;padding:30px 0} .phone{width:440px;background:white;margin:auto;border-radius:26px;overflow:hidden;box-shadow:0 12px 25px #8893a340}'+
  '.head{display:flex;gap:13px;align-items:center;padding:20px} .avatar{background:#101d2b;color:white;width:45px;height:45px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-weight:bold}.avatar img{width:34px;height:34px;object-fit:contain}'+
  '.name{font-weight:bold;font-size:19px} .status{font-size:14px;color:#65747c} .copy{padding:0 20px 12px;font-size:18px;line-height:1.35}'+
  '.document{display:block;width:440px;height:550px;object-fit:cover} .bottomline{padding:15px 20px;color:#67747c;font-size:14px}</style></head><body>'+
  '<div class="phone"><div class="head"><div class="avatar"><img src="assets/logo-symbol.png" alt=""></div><div><div class="name">Orbital Frameworks</div><div class="status">Documento · vista simulada</div></div></div>'+
  '<div class="copy">Tu web se ve bien. ¿Y después?<br><br>Una landing y una web corporativa cumplen funciones diferentes… <span style="color:#64748b">ver más</span></div>'+
  '<img class="document" src="slide-01.png"><div class="bottomline">Carrusel de 5 páginas · Preview editorial</div></div></body></html>'
  await writeFile(join(dest,'mobile-preview.html'),mobileHtml)
  const p2=await browser.newPage({viewport:{width:520,height:920},deviceScaleFactor:1})
  await p2.goto('file://'+join(dest,'mobile-preview.html'),{waitUntil:'load'})
  await p2.screenshot({path:join(dest,'mobile-preview.png')})
  await p2.close()
  outputs.push('mobile-preview.png')
  const desktopHtml = '<!doctype html><html lang="es"><head><style>body{margin:0;padding:45px;background:#eff1f1;font:20px Arial} .post{width:645px;margin:auto;background:white;box-shadow:0 8px 25px #7786a044;border-radius:14px;overflow:hidden}.head{padding:24px;font-weight:bold}.copy{padding:0 24px 18px}.post img{display:block;width:645px;height:auto}</style></head><body><div class="post"><div class="head">Orbital Frameworks · Publicación con documento</div><div class="copy">Tu web se ve bien. ¿Y después? El carrusel muestra cómo orientar una decisión…</div><img src="slide-01.png"></div></body></html>'
  await writeFile(join(dest,'desktop-preview.html'),desktopHtml)
  const p3=await browser.newPage({viewport:{width:800,height:1020},deviceScaleFactor:1})
  await p3.goto('file://'+join(dest,'desktop-preview.html'),{waitUntil:'load'})
  await p3.screenshot({path:join(dest,'desktop-preview.png')})
  await p3.close()
  outputs.push('desktop-preview.png')
  const checksums=[]
  for(const file of outputs)checksums.push({file,sha256:await hash(join(dest,file)),bytes:(await stat(join(dest,file))).size})
  const output={schema:'orbital.b2b03.carousel.v3',createdAt:new Date().toISOString(),title:'Tu web se ve bien. ¿Y después?',status:'PREVIEW_NOT_APPROVED_NOT_PUBLISHED',
    canvas:{width:1080,height:1350,count:5},provenance,outputs:checksums,layout:boxes,semanticQA,
    source:'docs/social/b2b03/v3/source.html',renderer:'scripts/render-b2b03-carousel-v3.mjs'}
  await writeFile(join(dest,'render-manifest.json'),JSON.stringify(output,null,2)+'\n')
  console.log(JSON.stringify({status:'RENDER_PASS',slides:boxes,outputs:checksums.map(x=>({file:x.file,bytes:x.bytes})),brandAssets:provenance.map(x=>x.output)}))
} finally { await browser.close() }
