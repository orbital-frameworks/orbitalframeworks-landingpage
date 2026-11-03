#!/usr/bin/env node
// LISA V3: targeted Orby scale/placement and oval removal only.
// V1/V2 remain untouched. All content and verified product screenshots are reused.
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { readFile, writeFile, copyFile, mkdir, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const root=dirname(fileURLToPath(import.meta.url)), v2=resolve(root,'../v2');
const {chromium}=createRequire('/srv/orbital/workspaces/Content-Factory/package.json')('playwright');
const sha=async path=>createHash('sha256').update(await readFile(path)).digest('hex');
await mkdir(join(root,'assets'),{recursive:true});
for(const filename of await readdir(join(v2,'assets'))){
  const source=join(v2,'assets',filename);
  if((await stat(source)).isFile())await copyFile(source,join(root,'assets',filename));
}
const source=await readFile(join(v2,'source.html'),'utf8');
const override=String.raw`
/* V3: remove leftover cover oval, not part of the canonical mascot. */
.s1:before{content:none!important;display:none!important}
/* Increase Orby's *visible* size while respecting source PNG alpha margins.
   Other slide elements, brand marks, screenshots and copy remain unchanged. */
.s1 .orbi{width:240px;right:15px;top:330px}
.s2 .orbi{width:310px;right:15px;top:430px}
.s4 .orbi{width:250px;right:40px;top:1000px}
.s4 .result{width:730px}
.s5 .orbi{width:240px;right:15px;top:600px}
`;
const tag='</style></head><body>';
if(source.split(tag).length!==2)throw Error('V2_SOURCE_LAYOUT_CHANGED');
const html=source.replace(tag,override+'\n'+tag);
await writeFile(join(root,'source.html'),html);

const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
let report;
try{
  const page=await browser.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:1});
  await page.goto('file://'+join(root,'source.html'),{waitUntil:'load'});
  await page.evaluate(()=>document.fonts.ready);
  const check=await page.evaluate(()=>{
    const mascotSlides=[1,2,4,5], threshold=7;
    const overlap=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>threshold&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>threshold;
    return [...document.querySelectorAll('.page')].map((node,index)=>{
      const p=index+1,origin=node.getBoundingClientRect();
      const images=[...node.querySelectorAll('img')].map(img=>({file:img.getAttribute('src'),loaded:img.complete&&img.naturalWidth>0}));
      const targets=[...node.querySelectorAll('.sub,.result,.cta,.legal,.lisaCard,.teamnote,.heroFrame,.flow,.foot')].map(el=>({type:el.className,rect:el.getBoundingClientRect()}));
      const outerOverflow=node.scrollWidth>node.clientWidth+1||node.scrollHeight>node.clientHeight+1;
      const box=node.querySelector('.orbi')?.getBoundingClientRect();
      // Canonical Orby PNGs have the same alpha bounds. Verified from the
      // original 1080x1080 assets; only pixels with alpha > 40 count as ink.
      const ink=box&&{left:box.left+box.width*(76/1080),right:box.left+box.width*(962/1080),top:box.top+box.height*(268/1080),bottom:box.top+box.height*(914/1080)};
      const overlaps=ink?targets.filter(v=>overlap(ink,v.rect)).map(v=>v.type):[];
      const within=ink?ink.left>=origin.left&&ink.right<=origin.right&&ink.top>=origin.top&&ink.bottom<origin.bottom-105:true;
      const ovalPresent=p===1?getComputedStyle(node,'::before').content!=='none':false;
      return {slide:p,imagesOk:images.every(x=>x.loaded),canvas:[origin.width,origin.height],outerOverflow,orbiCssWidth:box?.width||0,orbiInk:ink&&Object.fromEntries(['left','right','top','bottom'].map(k=>[k,Math.round(ink[k]-origin[k==='left'||k==='right'?'left':'top'])])),within,overlaps,ovalPresent};
    });
  });
  if(check.length!==5||check.some(x=>!x.imagesOk||x.canvas[0]!==1080||x.canvas[1]!==1350||x.outerOverflow||!x.within||x.overlaps.length||x.ovalPresent))throw Error('V3_VISUAL_GEOMETRY_FAIL '+JSON.stringify(check));
  for(let i=1;i<=5;i++)await page.locator(`.page[data-slide="${i}"]`).screenshot({path:join(root,'slide-'+String(i).padStart(2,'0')+'.png')});
  await page.pdf({path:join(root,'lisa-orbital-carousel-v3.pdf'),preferCSSPageSize:true,printBackground:true});
  const files=[...Array.from({length:5},(_,i)=>'slide-'+String(i+1).padStart(2,'0')+'.png'),'lisa-orbital-carousel-v3.pdf'];
  const artifacts=await Promise.all(files.map(async file=>({file,sha256:await sha(join(root,file)),bytes:(await stat(join(root,file))).size})));
  const v2manifest=JSON.parse(await readFile(join(v2,'render-manifest.json'),'utf8'));
  const v2s3=v2manifest.artifacts.find(a=>a.file==='slide-03.png')?.sha256;
  const s3same=v2s3===artifacts.find(a=>a.file==='slide-03.png').sha256;
  if(!s3same)throw Error('REGRESSION: SLIDE_3_CHANGED');
  report={schema:'orbital.carousel.review.v3',status:'OWNER_REVIEW_NOT_PUBLISHED_NOT_SCHEDULED',derivedFrom:'../v2/source.html',description:'Orby scale and placement plus removal of stray decorative oval',createdAt:new Date().toISOString(),slides:check,slide3UnchangedFromV2:s3same,artifacts};
  await writeFile(join(root,'render-manifest.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({render:'PASS',slide3UnchangedFromV2:s3same,slideshow:check.map(x=>({page:x.slide,orbyCssWidth:x.orbiCssWidth,orbiInk:x.orbiInk,overlaps:x.overlaps,oval:x.ovalPresent})),pdfSha256:artifacts.at(-1).sha256},null,2));
}finally{await browser.close()}
