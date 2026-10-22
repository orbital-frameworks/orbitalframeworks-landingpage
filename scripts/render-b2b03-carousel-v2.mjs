import { readFile, writeFile, copyFile, mkdir, stat } from 'node:fs/promises'
import { join, resolve, dirname } from 'node:path'
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dest = join(projectRoot, 'docs/social/b2b03/v2')
const assets = join(dest, 'assets')
const logo = join(projectRoot, 'src/assets/Orbital Frameworks (1).png')
const mascotDir = '/srv/orbital/workspaces/Content-Factory/projects/orbital-frameworks/brand/mascot/exports'
const fonts = join(projectRoot, 'public/fonts')
const sources = [
  [logo, 'logo-original.png'],
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
  const outputs=[]
  for (let i=1;i<=5;i++) {
    const filename='slide-'+String(i).padStart(2,'0')+'.png'
    await page.locator('.page[data-slide="'+i+'"]').screenshot({path:join(dest,filename)})
    outputs.push(filename)
  }
  const pdfPath=join(dest,'orbital-b2b03-carousel-v2.pdf')
  await page.pdf({ path:pdfPath, printBackground:true,preferCSSPageSize:true,
    width:'1080px',height:'1350px' })
  outputs.push('orbital-b2b03-carousel-v2.pdf')
  // Only a preview: not a sent LinkedIn publication.
  const mobileHtml='<!doctype html><html lang="es"><head><style>'+
  'body{margin:0;background:#e9ebed;font-family:Arial;padding:30px 0} .phone{width:440px;background:white;margin:auto;border-radius:26px;overflow:hidden;box-shadow:0 12px 25px #8893a340}'+
  '.head{display:flex;gap:13px;align-items:center;padding:20px} .avatar{background:#101d2b;color:white;width:45px;height:45px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-weight:bold}'+
  '.name{font-weight:bold;font-size:19px} .status{font-size:14px;color:#65747c} .copy{padding:0 20px 12px;font-size:18px;line-height:1.35}'+
  '.document{display:block;width:440px;height:550px;object-fit:cover} .bottomline{padding:15px 20px;color:#67747c;font-size:14px}</style></head><body>'+
  '<div class="phone"><div class="head"><div class="avatar">OF</div><div><div class="name">Orbital Frameworks</div><div class="status">Documento · vista simulada</div></div></div>'+
  '<div class="copy">¿Tu web realmente ayuda al cliente a dar el siguiente paso?<br><br>Una landing y una web corporativa resuelven necesidades distintas… <span style="color:#64748b">ver más</span></div>'+
  '<img class="document" src="slide-01.png"><div class="bottomline">Carrusel de 5 páginas · Preview editorial</div></div></body></html>'
  await writeFile(join(dest,'mobile-preview.html'),mobileHtml)
  const p2=await browser.newPage({viewport:{width:520,height:920},deviceScaleFactor:1})
  await p2.goto('file://'+join(dest,'mobile-preview.html'),{waitUntil:'load'})
  await p2.screenshot({path:join(dest,'mobile-preview.png')})
  await p2.close()
  outputs.push('mobile-preview.png')
  const desktopHtml = '<!doctype html><html lang="es"><head><style>body{margin:0;padding:45px;background:#eff1f1;font:20px Arial} .post{width:645px;margin:auto;background:white;box-shadow:0 8px 25px #7786a044;border-radius:14px;overflow:hidden}.head{padding:24px;font-weight:bold}.copy{padding:0 24px 18px}.post img{display:block;width:645px;height:auto}</style></head><body><div class="post"><div class="head">Orbital Frameworks · Publicación con documento</div><div class="copy">¿Tu web realmente ayuda al cliente a dar el siguiente paso? El carrusel explica cómo decidir…</div><img src="slide-01.png"></div></body></html>'
  await writeFile(join(dest,'desktop-preview.html'),desktopHtml)
  const p3=await browser.newPage({viewport:{width:800,height:1020},deviceScaleFactor:1})
  await p3.goto('file://'+join(dest,'desktop-preview.html'),{waitUntil:'load'})
  await p3.screenshot({path:join(dest,'desktop-preview.png')})
  await p3.close()
  outputs.push('desktop-preview.png')
  const checksums=[]
  for(const file of outputs)checksums.push({file,sha256:await hash(join(dest,file)),bytes:(await stat(join(dest,file))).size})
  const output={schema:'orbital.b2b03.carousel.v2',createdAt:new Date().toISOString(),title:'Tu web se ve bien. ¿Pero lleva a algún lugar?',status:'PREVIEW_NOT_APPROVED_NOT_PUBLISHED',
    canvas:{width:1080,height:1350,count:5},provenance,outputs:checksums,layout:boxes,
    source:'docs/social/b2b03/v2/source.html',renderer:'scripts/render-b2b03-carousel-v2.mjs'}
  await writeFile(join(dest,'render-manifest.json'),JSON.stringify(output,null,2)+'\n')
  console.log(JSON.stringify({status:'RENDER_PASS',slides:boxes,outputs:checksums.map(x=>({file:x.file,bytes:x.bytes})),brandAssets:provenance.map(x=>x.output)}))
} finally { await browser.close() }
