import { mkdir, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { createRequire } from 'node:module'
const requireFactory = createRequire('/srv/orbital/workspaces/Content-Factory/package.json')
const { chromium } = requireFactory('playwright')
const root = resolve(process.cwd())
const dest = join(root, 'docs/social/b2b03')
const slides = [
 { eyebrow:'ORBITAL INSIGHTS / DECISIÓN B2B',title:['¿Landing page','o web corporativa?'],accent:'NO ES UNA CUESTIÓN DE MODA',note:'Primero entiende cómo decide tu cliente.' },
 { eyebrow:'01 / UNA OFERTA CONCRETA',title:['Cuándo elegir','una landing'],accent:'ENFOQUE COMERCIAL',points:['Público y necesidad definidos','Una propuesta principal','Una acción siguiente clara'] },
 { eyebrow:'02 / VARIOS SERVICIOS',title:['Cuándo elegir','una web completa'],accent:'EXPLORACIÓN Y CONTEXTO',points:['Diferentes tipos de compradores','Información institucional y servicios','Recorrido de investigación amplio'] },
 { eyebrow:'03 / NO ES UN DILEMA',title:['Ambas pueden','trabajar juntas'],accent:'WEB + PÁGINAS POR OFERTA',note:'Una presenta a la empresa. Otras profundizan en soluciones concretas.' },
 { eyebrow:'ANTES DE DISEÑAR',title:['¿Qué necesita','saber tu cliente','para contactarte?'],accent:'PRIMERO EL RECORRIDO. DESPUÉS EL DISEÑO.',note:'Análisis completo en Orbital Insights. Enlace en la publicación.' }
]
const esc = s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
const lines = a=>a.map(x=>'<span class="line">'+esc(x)+'</span>').join('')
const logo = '<span class="symbol"><b class="red">&lt;</b><b class="slash">/</b><b class="red">&gt;</b></span>'
function content(p,i) {
 return '<section class="slide" data-index="'+(i+1)+'"><div class="mesh"></div><div class="top"><div class="brand">'+logo+'<span>ORBITAL<br>FRAMEWORKS</span></div><div class="count">'+String(i+1).padStart(2,'0')+' / 05</div></div>'+
 '<main><div class="eyebrow">'+esc(p.eyebrow)+'</div><h1>'+lines(p.title)+'</h1><div class="rule"></div><p class="accent">'+esc(p.accent)+'</p>'+
 (p.note?'<p class="note">'+esc(p.note)+'</p>':'')+
 (p.points?'<div class="points">'+p.points.map((x,j)=>'<div class="point"><span class="num">'+String(j+1).padStart(2,'0')+'</span><span>'+esc(x)+'</span></div>').join('')+'</div>':'')+
 '</main><footer><span>SOFTWARE / AUTOMATIZACIÓN / DESARROLLO WEB</span><span>ORBITAL FRAMEWORKS</span></footer><i class="border-dots"></i></section>'
}
const style = [
 '@page{size:1080px 1350px;margin:0}',
 '*{box-sizing:border-box}html,body{margin:0;background:#070a10;color:#fff;font-family:Arial,Helvetica,sans-serif}',
 '.slide{position:relative;overflow:hidden;width:1080px;height:1350px;padding:68px 70px 64px;display:flex;flex-direction:column;justify-content:space-between;page-break-after:always;background:radial-gradient(circle at 93% 27%,#8511263f 0%,transparent 43%),linear-gradient(135deg,#0b1019,#05070c 75%)}',
 '.slide:before{content:"";position:absolute;inset:0 auto 0 0;width:14px;background:#ed1539}',
 '.mesh{position:absolute;inset:0;opacity:.35;background-image:linear-gradient(90deg,#aab6cd16 1px,transparent 1px),linear-gradient(#aab6cd16 1px,transparent 1px);background-size:85px 85px}',
 '.top{position:relative;display:flex;align-items:flex-start;justify-content:space-between;z-index:1}',
 '.brand{display:flex;align-items:center;gap:17px;font-weight:900;font-size:25px;letter-spacing:2.2px;line-height:1.05}',
 '.symbol{letter-spacing:-9px;font-size:74px;font-weight:900;line-height:.9;padding-right:11px}.red{color:#ff1537}.slash{color:white;display:inline-block;transform:skew(-15deg)}',
 '.count{font-size:21px;letter-spacing:2px;color:#aab1c0}',
 'main{position:relative;z-index:1;max-width:930px}',
 '.eyebrow{color:#ff3654;font-weight:800;font-size:22px;letter-spacing:2.3px;margin-bottom:29px}',
 'h1{font-size:97px;letter-spacing:-3.5px;line-height:1.07;margin:0;font-weight:900}.line{display:block}',
 '.slide[data-index="5"] h1{font-size:90px}',
 '.rule{margin-top:46px;width:155px;height:8px;background:#f0173a}',
 '.accent{font-size:29px;font-weight:800;letter-spacing:1.6px;color:#ff4a61;margin:34px 0 0}',
 '.note{font-size:42px;line-height:1.32;color:#e0e4eb;max-width:780px;margin-top:35px}',
 '.points{display:flex;flex-direction:column;gap:34px;margin-top:58px}',
 '.point{display:flex;align-items:center;gap:26px;font-size:38px;line-height:1.2;border-left:3px solid #2e3a50;padding-left:20px}',
 '.num{color:#ff3455;font-weight:900;font-size:29px;min-width:61px}',
 'footer{z-index:1;position:relative;border-top:2px solid #425063;padding-top:27px;font-size:17px;letter-spacing:1.3px;color:#a9b4c4;display:flex;justify-content:space-between;gap:25px}',
 '.border-dots{position:absolute;right:0;top:37%;border:4px solid #fa1838;opacity:.25;transform:rotate(45deg);width:225px;height:225px;right:-170px}'
].join('\n')
const html='<!doctype html><html lang="es"><head><meta charset="utf-8"/><style>'+style+'</style></head><body>'+slides.map(content).join('')+'</body></html>'
await mkdir(dest,{recursive:true})
await writeFile(join(dest,'carousel-source.html'),html,'utf8')
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']})
try {
 const page=await browser.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:1})
 await page.setContent(html,{waitUntil:'load'})
 const bounds=await page.locator('.slide').evaluateAll(es=>es.map(el=>({width:el.offsetWidth,height:el.offsetHeight})))
 for(let i=1;i<=slides.length;i++){await page.locator('.slide[data-index="'+i+'"]').screenshot({path:join(dest,'slide-'+String(i).padStart(2,'0')+'.png')})}
 await page.pdf({path:join(dest,'orbital-b2b03-carousel.pdf'),width:'1080px',height:'1350px',printBackground:true,preferCSSPageSize:true})
 console.log(JSON.stringify({slides:bounds,files:['carousel-source.html','orbital-b2b03-carousel.pdf',...slides.map((_,i)=>'slide-'+String(i+1).padStart(2,'0')+'.png')]}))
} finally {await browser.close()}
