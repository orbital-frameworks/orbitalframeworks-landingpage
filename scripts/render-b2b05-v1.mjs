#!/usr/bin/env node
// Production of reviewable B2B-05 assets. Never publishes or schedules.
import {readFile, writeFile, mkdir, stat} from 'node:fs/promises'
import {join, resolve, dirname} from 'node:path'
import {createHash} from 'node:crypto'
import {createRequire} from 'node:module'
import {fileURLToPath} from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dest = join(root, 'docs/social/b2b05/v1')
const {chromium} = createRequire('/srv/orbital/workspaces/Content-Factory/package.json')('playwright')
const digest = async file => createHash('sha256').update(await readFile(join(dest,file))).digest('hex')
const slug = 'integracion-pedidos-whatsapp-almacen-operaciones'
const utm = 'https://orbitalframeworks.qzz.io/blog/' + slug + '/?utm_source=linkedin&utm_medium=organic_social&utm_campaign=camp_whatsapp_to_warehouse'
const escapeHtml = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')
const inline = s => escapeHtml(s).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
  .replace(/\*([^*]+)\*/g,'<em>$1</em>')
  .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,(_all,label,href)=>'<a href="'+href+'">'+label+'</a>')

function markdownToHtml(source) {
  const lines=source.replace(/^---\n[\s\S]*?\n---\n/,'').split(/\r?\n/)
  const out=[];let paragraph=[],items=[],table=[]
  const flush=()=>{
    if(paragraph.length){out.push('<p>'+inline(paragraph.join(' '))+'</p>');paragraph=[]}
    if(items.length){out.push('<ul>'+items.map(x=>'<li>'+inline(x)+'</li>').join('')+'</ul>');items=[]}
    if(table.length){out.push('<table>'+table.map((row,i)=>'<tr>'+row.map(x=>i?'<td>'+inline(x)+'</td>':'<th>'+inline(x)+'</th>').join('')+'</tr>').join('')+'</table>');table=[]}
  }
  for(const raw of lines){
    const line=raw.trim()
    if(!line){flush();continue}
    if(/^\|[-:| ]+\|$/.test(line))continue
    if(line.startsWith('|')&&line.endsWith('|')){if(paragraph.length||items.length)flush();table.push(line.slice(1,-1).split('|').map(x=>x.trim()));continue}
    if(table.length)flush()
    const heading=line.match(/^(#{1,3})\s+(.+)$/)
    if(heading){flush();const n=heading[1].length;out.push('<h'+n+'>'+inline(heading[2])+'</h'+n+'>');continue}
    if(/^[-*] /.test(line)){if(paragraph.length)flush();items.push(line.slice(2));continue}
    if(items.length)flush()
    if(/^\d+\.\s/.test(line)){flush();out.push('<p class="question">'+inline(line)+'</p>');continue}
    if(line==='---'){flush();out.push('<hr>');continue}
    paragraph.push(line)
  }
  flush();return out.join('\n')
}

await mkdir(dest,{recursive:true})
const article=await readFile(join(dest,'article.md'),'utf8')
const copy=await readFile(join(dest,'linkedin-copy.txt'),'utf8')
if(!article.includes('BORRADOR_PARA_REVISION_NO_PUBLICAR')||!copy.includes('{{UTM_URL}}')) throw Error('DRAFT_STATUS_MISSING')
const copyPreview=copy.trim().replace('{{UTM_URL}}',utm)
const copySha=createHash('sha256').update(copyPreview).digest('hex')
await writeFile(join(dest,'linkedin-copy-preview.txt'),copyPreview+'\n')
const articleCss=[
  "@font-face{font-family:Plex;src:url('../../../../public/fonts/ibm-plex-sans-latin.woff2')}",
  "@font-face{font-family:Big;src:url('../../../../public/fonts/big-shoulders-display-latin.woff2')}",
  "@page{size:A4;margin:22mm 21mm 19mm}",
  "body{font:13px/1.52 Plex,Arial,sans-serif;color:#162a31;background:white}",
  ".ribbon{padding:14px 20px;background:#f3d6c7;color:#653b2a;font:bold 12px Plex;margin-bottom:31px}",
  "h1,h2,h3{font-family:Big,Impact,sans-serif;line-height:1.06;break-after:avoid}",
  "h1{font-size:48px;margin:8px 0 23px}h2{font-size:31px;margin:31px 0 13px}h3{font-size:23px;margin:17px 0 10px}",
  "p{margin:0 0 14px}li{margin:0 0 7px}ul{padding-left:23px;margin:8px 0 18px}",
  "a{color:#196b61;text-decoration:underline}table{border-collapse:collapse;width:100%;font-size:11px;margin:12px 0 20px}",
  "td,th{padding:9px;border:1px solid #afc4b8;vertical-align:top;text-align:left}th{background:#e3f0e3}tr{break-inside:avoid}",
  "hr{border:0;border-top:1px solid #c4cec4}",
  "@media screen{body{padding:35px 48px;max-width:890px;margin:40px auto;box-shadow:0 8px 60px #58646344}}"
].join('')
const articleHtml='<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Orbital Insights — B2B-05 · Borrador</title><style>'+articleCss+'</style></head><body><div class="ribbon">BORRADOR PARA REVISIÓN · NO PUBLICADO · 22 OCT 2026</div>'+markdownToHtml(article)+'</body></html>'
await writeFile(join(dest,'article-print.html'),articleHtml)

const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']})
try{
  const page=await browser.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:1})
  await page.goto('file://'+join(dest,'source.html'),{waitUntil:'load'})
  await page.evaluate(()=>document.fonts.ready)
  const checks=await page.locator('.page').evaluateAll(nodes=>nodes.map((node,i)=>{
    const r=node.getBoundingClientRect()
    const overflow=[...node.querySelectorAll('h1,h2,h3,p,.tier,.ticket,.cta,.ftxt,.frow,.check,.pane')]
      .filter(el=>{
        const c=getComputedStyle(el)
        return (el.scrollWidth>el.clientWidth+8&&c.overflowX!=='visible') ||
          (el.scrollHeight>el.clientHeight+8&&c.overflowY!=='visible')
      })
      .map(el=>({element:el.tagName,cls:String(el.className),text:(el.innerText||'').slice(0,48),
        w:el.scrollWidth,cw:el.clientWidth,h:el.scrollHeight,ch:el.clientHeight}))
    return {slide:i+1,width:Math.round(r.width),height:Math.round(r.height),textLength:node.innerText.length,overflow}
  }))
  if(checks.length!==5||checks.some(x=>x.width!==1080||x.height!==1350||x.overflow.length))
    throw Error('SLIDE_OVERFLOW:'+JSON.stringify(checks))
  const geom=await page.evaluate(()=>{
    const line=document.querySelector('.page3 .flowline').getBoundingClientRect()
    const nodes=[...document.querySelectorAll('.page3 .node')].map(n=>n.getBoundingClientRect())
    return {lineCenterX:line.x+line.width/2,nodeCenters:nodes.map(n=>n.x+n.width/2),
      lineStart:line.y,lineEnd:line.bottom,firstCenterY:nodes[0].y+nodes[0].height/2,lastCenterY:nodes.at(-1).y+nodes.at(-1).height/2}
  })
  if(geom.nodeCenters.some(x=>Math.abs(x-geom.lineCenterX)>1.5)||geom.lineStart>geom.firstCenterY||geom.lineEnd<geom.lastCenterY)
    throw Error('FLOW_CONNECTIONS_FAIL:'+JSON.stringify(geom))
  const outputs=[]
  for(let i=1;i<=5;i++){
    const filename='slide-'+String(i).padStart(2,'0')+'.png'
    await page.locator('.page[data-slide="'+i+'"]').screenshot({path:join(dest,filename)})
    outputs.push(filename)
  }
  const carousel='orbital-b2b05-carousel-v1.pdf'
  await page.pdf({path:join(dest,carousel),printBackground:true,preferCSSPageSize:true,width:'1080px',height:'1350px'})
  outputs.push(carousel)
  for(const [mode,width,height,cardWidth,text] of [
    ['mobile',530,1120,390,'Un pedido puede llegar por WhatsApp en segundos. ¿El almacén tiene la última versión?'],
    ['desktop',960,1030,575,'El problema aparece cuando ventas y almacén tienen versiones diferentes del pedido.']
  ]){
    const html='<!doctype html><html><head><style>body{background:#e7eae8;padding:25px 0;margin:0;font:20px Arial}.card{width:'+cardWidth+'px;margin:auto;background:white;border-radius:15px;overflow:hidden;box-shadow:0 12px 40px #22334025}.header{padding:20px;display:flex;gap:13px;align-items:center;font-weight:bold}.header img{width:48px;height:48px;object-fit:contain}.header small{font-weight:normal;font-size:13px;color:#6b7882;display:block;margin-top:3px}p{padding:0 20px;font-size:19px;line-height:1.4}.slide{width:100%;display:block}footer{padding:13px 20px;color:#62747c;font-size:13px}</style></head><body><div class="card"><div class="header"><img src="../../../../public/Logo_favicon.png"><span>Orbital Frameworks<small>Documento · vista simulada</small></span></div><p>'+text+'</p><img class="slide" src="slide-01.png"><footer>5 páginas · Preview editorial, no publicación real</footer></div></body></html>'
    await writeFile(join(dest,mode+'-preview.html'),html)
    const preview=await browser.newPage({viewport:{width,height},deviceScaleFactor:1})
    await preview.goto('file://'+join(dest,mode+'-preview.html'),{waitUntil:'load'})
    await preview.screenshot({path:join(dest,mode+'-preview.png')})
    await preview.close();outputs.push(mode+'-preview.png')
  }
  const print=await browser.newPage({viewport:{width:960,height:1200}})
  await print.goto('file://'+join(dest,'article-print.html'),{waitUntil:'load'})
  await print.evaluate(()=>document.fonts.ready)
  await print.pdf({path:join(dest,'orbital-b2b05-article-review.pdf'),printBackground:true,format:'A4',displayHeaderFooter:false})
  await print.close();outputs.push('orbital-b2b05-article-review.pdf')
  const files=await Promise.all(outputs.map(async file=>({file,bytes:(await stat(join(dest,file))).size,sha256:await digest(file)})))
  const manifest={schema:'orbital.b2b05.v1',status:'READY_FOR_OWNER_REVIEW_NOT_PUBLISHED',createdAt:new Date().toISOString(),
    campaign:'camp_whatsapp_to_warehouse',article:'docs/social/b2b05/v1/article.md',
    htmlSource:'docs/social/b2b05/v1/source.html',copyPlaceholder:'docs/social/b2b05/v1/linkedin-copy.txt',
    copyPreviewSha256:copySha,utmUrl:utm,canvas:{width:1080,height:1350,pages:5},
    slideQA:checks,geometry:geom,outputs:files}
  await writeFile(join(dest,'render-manifest.json'),JSON.stringify(manifest,null,2)+'\n')
  console.log(JSON.stringify({status:'RENDER_PASS',pageCount:checks.length,overflows:0,geom,
    files:files.map(x=>({name:x.file,bytes:x.bytes,sha256:x.sha256})),copySha}))
} finally{await browser.close()}
