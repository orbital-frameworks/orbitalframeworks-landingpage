#!/usr/bin/env node
// B2B07 LISA V2: reproducible, source-based corrections over preserved V1.
// Uses only the real LISA screenshots and original brand/mascot assets.
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, readdir, copyFile, stat } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const v1 = resolve(root, '../v1');
const { chromium } = createRequire('/srv/orbital/workspaces/Content-Factory/package.json')('playwright');
const sha = async file => createHash('sha256').update(await readFile(file)).digest('hex');
function replaceExactly(source, before, after, expected = 1) {
  const n = source.split(before).length - 1;
  if (n !== expected) throw new Error(`SOURCE_DRIFT: expected ${expected} matches, got ${n}, for ${before.slice(0, 85)}`);
  return source.replaceAll(before, after);
}
await mkdir(join(root, 'assets'), { recursive: true });
const assets = await readdir(join(v1, 'assets'));
for (const asset of assets) {
  const a = join(v1, 'assets', asset);
  if ((await stat(a)).isFile()) await copyFile(a, join(root, 'assets', asset));
}

let html = await readFile(join(v1, 'source.html'), 'utf8');
const brand = '<div class="lisaBadge" aria-label="Identidad oficial LISA"><img class="lisaPin" src="./assets/lisa-character.png" alt=""><img class="lisaName" src="./assets/lisa-logo.png" alt="LISA"></div>';
const editions = [...html.matchAll(/<div class="edition">[^<]*<\/div>/g)].length;
if (editions !== 5) throw new Error(`SOURCE_DRIFT: editions ${editions}`);
html = html.replace(/<div class="edition">[^<]*<\/div>/g, brand);
const footers = [...html.matchAll(/<div class="foot"><span>[^<]*<\/span><span>[^<]*<\/span><\/div>/g)].length;
if (footers !== 5) throw new Error(`SOURCE_DRIFT: footers ${footers}`);
html = html.replace(/<div class="foot"><span>[^<]*<\/span><span>[^<]*<\/span><\/div>/g, '<div class="foot"><span>localisa.pe <span class="footDot">·</span> orbitalframeworks.qzz.io</span></div>');

// V2 editorial fixes: remove production metadata and internal attributions.
html = replaceExactly(html, '<div class="proof">PRODUCTO EN FUNCIONAMIENTO · NO UN MOCKUP</div>', '');
html = replaceExactly(html, '<span class="url">localisa.pe/map · captura real</span>', '<span class="url">localisa.pe/map</span>');
html = replaceExactly(html, '<span class="url">Vista real de escritorio</span>', '<span class="url">localisa.pe/map</span>');
html = replaceExactly(html, '<div class="caption">CAPTURAS AUTÉNTICAS · 03 NOV 2026 <span>· ubicaciones referenciales</span></div>', '<div class="caption">Una plataforma que también se puede explorar desde el celular.</div>');
html = replaceExactly(html, 'PLATAFORMA REAL · DESKTOP Y MÓVIL', 'DISPONIBLE EN COMPUTADORA Y CELULAR');
html = replaceExactly(html, '<div class="author">MATHIAS / SOFTWARE</div>', '');
html = replaceExactly(html, '<div class="author">ANGEL / INFORMACIÓN</div>', '');
html = replaceExactly(html, '<span class="index">01 / FUENTES</span>', '<span class="index">FUENTES</span>');
html = replaceExactly(html, '<span class="index">02 / TRABAJO DE DATOS</span>', '<span class="index">AUTOMATIZACIÓN</span>');
html = replaceExactly(html, '<span class="index">03 / PRODUCTO</span>', '<span class="index">PRODUCTO</span>');
html = replaceExactly(html, '<div class="marker">01 / DESARROLLO</div>', '<div class="marker">DESARROLLO</div>');
html = replaceExactly(html, '<div class="marker">02 / DATA & AUTOMATIZACIÓN</div>', '<div class="marker">DATOS Y AUTOMATIZACIÓN</div>');

// Slide 3 phone: original image stays intact, framed under official LISA branding.
// The branded header is a clearly separate editorial device frame, not a claim
// that the public mobile UI already contains the illustrated symbol.
html = replaceExactly(
  html,
  '<div class="mobile"><img src="./assets/lisa-map-mobile-live.png" alt="Captura real LISA móvil"></div>',
  '<div class="mobile"><div class="mobileBrandBar"><img class="pinMark" src="./assets/lisa-character.png" alt=""><img class="wordMark" src="./assets/lisa-logo.png" alt="LISA"></div><div class="mobileViewport"><img src="./assets/lisa-map-mobile-live.png" alt="Vista pública real de LISA en celular"></div></div>'
);
// Slide 5: the complete original LISA lockup, not only the wordmark.
html = replaceExactly(
  html,
  '<div class="lisaCard"><img src="./assets/lisa-logo.png" alt="Logo oficial LISA"></div>',
  '<div class="lisaCard"><div class="realLisaLockup"><img class="lisaSymbol" src="./assets/lisa-character.png" alt=""><img class="lisaWord" src="./assets/lisa-logo.png" alt="LISA"></div></div>'
);

const css = String.raw`
/* V2 | External-facing social design: no numbering, QA jargon or dates. */
.mast .lisaBadge{display:flex;align-items:center;gap:10px;padding:6px 12px;border:1px solid #a1c6ca;border-radius:13px;background:rgba(255,255,255,.94);height:64px;min-width:181px;justify-content:center}
.mast .lisaBadge .lisaPin{width:36px;height:46px;object-fit:contain}
.mast .lisaBadge .lisaName{width:106px;height:42px;object-fit:contain}
.foot{bottom:37px;font-size:15px;letter-spacing:0;padding-top:13px}
.foot .footDot{color:#0098a3;margin:0 7px}
.dark .foot{color:#9cb8bd}

/* Cover: complete real screenshot 1440x1000; no clipping or imaginary UI. */
.s1 .tag{margin-top:31px}
.s1 .display{font-size:86px;margin-top:19px;max-width:900px;line-height:.93}
.s1 .sub{font-size:26px;margin-top:18px;max-width:850px;line-height:1.25}
.s1 .heroFrame{left:70px;top:546px;width:940px;height:689px}
.s1 .heroFrame .frameCrop{height:636px;overflow:hidden;line-height:0}
.s1 .heroFrame .frameCrop img{display:block;width:100%;height:auto;max-height:none;object-fit:contain;object-position:top;aspect-ratio:1440/1000}
.s1 .orbi{top:415px;right:71px;width:123px}

/* All three pipeline cards: text stays inside its own card. */
.s2 .flow{top:701px;height:335px;grid-template-columns:minmax(0,1fr) 34px minmax(0,1fr) 34px minmax(0,1fr);gap:9px}
.s2 .display{font-size:102px}
.s2 .sub{margin-top:18px;font-size:27px;line-height:1.2;max-width:700px}
.s2 .step{height:312px;min-width:0;overflow:hidden;padding:21px 16px}
.s2 .index{font-size:17px;letter-spacing:-.4px}
.s2 .step strong{font-size:47px;line-height:.98;margin-top:24px;overflow-wrap:normal}
.s2 .step p{font-size:20px;line-height:1.22;margin-top:20px;overflow-wrap:break-word}
.s2 .ar{font-size:49px;justify-self:center}
.s2 .bottom{top:1079px;left:70px;right:70px;font-size:25px;padding:22px 27px}

/* Desktop + mobile product evidence, with visible, real brand in device frame. */
.s3 .desktop{top:662px;left:70px;width:751px;height:485px}
.s3 .desktop .frameCrop{height:416px}
.s3 .mobile{right:79px;top:677px;width:229px;height:482px;border:7px solid #102937;border-radius:25px;overflow:hidden}
.s3 .mobileBrandBar{position:absolute;left:0;right:0;top:0;height:56px;display:flex;align-items:center;gap:5px;justify-content:flex-start;padding:4px 7px;background:#fdfdfd;z-index:2;border-bottom:1px solid #e2e8e9}
.s3 .mobileBrandBar .pinMark{width:28px;height:40px;object-fit:contain}
.s3 .mobileBrandBar .wordMark{width:92px;height:37px;object-fit:contain}
.s3 .mobileViewport{position:absolute;left:0;right:0;top:56px;bottom:0;overflow:hidden}
.s3 .mobileViewport img{position:absolute;top:-53px;left:0;width:100%;height:auto;object-fit:contain;border-radius:0}
.s3 .caption{top:1187px;left:70px;font:22px Plex;color:#236571}

/* No personally attributed role labels; keep work description within cards. */
.s4 .work{height:350px}
.s4 .work h3{font-size:56px;margin-top:32px;margin-bottom:16px}
.s4 .work p{font-size:22px;line-height:1.2;margin-top:0}
.s4 .orbi{width:130px;top:1032px;right:80px}
.s4 .result{top:1092px;width:765px;font-size:25px}

/* Finish with the complete official product mark. */
.s5 .lisaCard{background:#fff;padding:18px 13px;height:150px}
.s5 .realLisaLockup{width:100%;height:110px;display:flex;align-items:center;justify-content:center;gap:9px}
.s5 .realLisaLockup .lisaSymbol{width:83px;height:110px;object-fit:contain}
.s5 .realLisaLockup .lisaWord{width:142px;height:66px;object-fit:contain}
`;
html = replaceExactly(html, '</style></head><body>', css + '\n</style></head><body>');
await writeFile(join(root, 'source.html'), html);

const browser = await chromium.launch({headless:true,executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
let checks;
try {
  const page = await browser.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:1});
  await page.goto('file://' + join(root,'source.html'), {waitUntil:'load'});
  await page.evaluate(()=>document.fonts.ready);
  checks = await page.evaluate(()=>[...document.querySelectorAll('.page')].map((node,i)=>{
    const outer=node.getBoundingClientRect();
    const images=[...node.querySelectorAll('img')].map(im=>({src:im.getAttribute('src'),loaded:im.complete&&im.naturalWidth>0}));
    const selections=[...node.querySelectorAll('h1,h2,.sub,.tag,.foot,.cta,.flow,.step,.work,.proofrow,.realFrame,.mobile,.lisaBadge,.realLisaLockup,.result,.bottom,.caption')].map(el=>{
      const r=el.getBoundingClientRect();return {node:el.className||el.tagName,x:r.left-outer.left,y:r.top-outer.top,right:r.right-outer.left,bottom:r.bottom-outer.top,overflow:!el.classList.contains('display')&&(el.scrollWidth>el.clientWidth+1||el.scrollHeight>el.clientHeight+1)};
    });
    return {slide:i+1,dimensions:[outer.width,outer.height],images,offCanvas:selections.filter(x=>x.x<-1||x.right>1081||x.y<-1||x.bottom>1351),overflow:selections.filter(x=>x.overflow),footer:node.querySelector('.foot')?.innerText,hasDate:/noviembre|2026|capturas auténticas|\/\s*05|m[aá]thias\s*\/|angel\s*\//i.test(node.innerText),contentHeight:node.scrollHeight};
  }));
  if(checks.length!==5||checks.some(x=>x.dimensions[0]!==1080||x.dimensions[1]!==1350||x.images.some(a=>!a.loaded)||x.offCanvas.length||x.overflow.length||x.hasDate)) throw new Error('LAYOUT_OR_BRAND_QA_FAILED '+JSON.stringify(checks));
  const cover = await page.evaluate(()=>{
    const im=document.querySelector('.s1 .heroFrame img');const frame=document.querySelector('.s1 .heroFrame .frameCrop');return {natural:[im.naturalWidth,im.naturalHeight],display:[im.getBoundingClientRect().width,im.getBoundingClientRect().height],frame:[frame.clientWidth,frame.clientHeight]};
  });
  if(cover.display[1]>cover.frame[1]+1||cover.natural[0]!==1440||cover.natural[1]!==1000)throw new Error('COVER_IMAGE_CROPPED '+JSON.stringify(cover));
  const geometry = await page.evaluate(()=>{
    const gap=(above,below)=>document.querySelector(below).getBoundingClientRect().top-document.querySelector(above).getBoundingClientRect().bottom;
    return {
      slide2SubtitleToCards:gap('.s2 .sub','.s2 .flow'),
      slide2CardsToSummary:gap('.s2 .flow','.s2 .bottom'),
      slide3DescriptionToDesktop:gap('.s3 .sub','.s3 .desktop'),
      slide4WorkToResult:gap('.s4 .duo','.s4 .result'),
      slide5ProofToCTA:gap('.s5 .proofrow','.s5 .cta')
    };
  });
  if(geometry.slide2SubtitleToCards<22||geometry.slide2CardsToSummary<10||geometry.slide3DescriptionToDesktop<10||geometry.slide4WorkToResult<10||geometry.slide5ProofToCTA<20)throw new Error('VISUAL_GEOMETRY_COLLISION '+JSON.stringify(geometry));
  for(let i=1;i<=5;i++)await page.locator(`.page[data-slide="${i}"]`).screenshot({path:join(root,'slide-'+String(i).padStart(2,'0')+'.png')});
  await page.pdf({path:join(root,'lisa-orbital-carousel-v2.pdf'),preferCSSPageSize:true,printBackground:true});
  const thumbPage=await browser.newPage({viewport:{width:1120,height:1030}});
  await thumbPage.setContent(`<html><style>body{margin:0;background:#e9eff0;font-family:Arial;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:10px}img{width:350px;height:438px;object-fit:contain;background:white;box-shadow:0 2px 10px #cad3d5}</style>${Array.from({length:5},(_,i)=>`<img src="file://${join(root,'slide-'+String(i+1).padStart(2,'0')+'.png')}">`).join('')}</html>`,{waitUntil:'load'});
  // Browser file permissions may block file images under setContent; use direct browser navigation below if needed.
  await thumbPage.close();
  const artifacts=await Promise.all([...Array.from({length:5},(_,i)=>'slide-'+String(i+1).padStart(2,'0')+'.png'),'lisa-orbital-carousel-v2.pdf'].map(async filename=>({file:filename,bytes:(await stat(join(root,filename))).size,sha256:await sha(join(root,filename))})));
  const sourceAssets=await Promise.all(assets.filter(x=>!x.endsWith('.woff2')).map(async x=>({file:'assets/'+x,sha256:await sha(join(root,'assets',x))})));
  const manifest={schema:'orbital.carousel.review.v2',status:'OWNER_REVIEW_NOT_PUBLISHED_NOT_SCHEDULED',campaign:'b2b07-lisa',createdAt:new Date().toISOString(),canvas:{width:1080,height:1350,slides:5},source:'source.html',renderer:'render.mjs',v1_preserved:true,coverImage:cover,geometry,checks,artifacts,assetProvenance:sourceAssets,notes:['Mobile device branding is a separate editorial header built with the original LISA logo; the underlying viewport is a cropped real screenshot.','No invented product UI, quotes, logos, efficacy metrics or claimed institutional endorsement.']};
  await writeFile(join(root,'render-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log(JSON.stringify({status:'RENDER_PASS',cover,artifacts,checks:checks.map(x=>({slide:x.slide,overflows:x.overflow.length,offCanvas:x.offCanvas.length,brokenImages:x.images.filter(y=>!y.loaded).length}))},null,2));
} finally {await browser.close()}
