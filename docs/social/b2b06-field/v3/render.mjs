import { readFile, writeFile, stat, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname,join,resolve } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const root=dirname(fileURLToPath(import.meta.url));
const {chromium}=createRequire('/srv/orbital/workspaces/Content-Factory/package.json')('playwright');
const sha=async p=>createHash('sha256').update(await readFile(p)).digest('hex');
const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
try {
 const page=await browser.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:1});
 await page.goto('file://'+join(root,'source.html'),{waitUntil:'load'});
 await page.evaluate(()=>document.fonts.ready);
 const inspect=await page.locator('.page').evaluateAll(els=>els.map((n,i)=>{
   const r=n.getBoundingClientRect();const elements=[...n.querySelectorAll('h1,h2,.sub,.heroFlow,.three,.rail,.main,.checklist,.orbi,.bottomCard,.foot')];
   return {slide:i+1,width:r.width,height:r.height,textLength:n.innerText.length,overflowX:n.scrollWidth>n.clientWidth+2,overflowY:n.scrollHeight>n.clientHeight+2,offCanvas:elements.filter(e=>{const q=e.getBoundingClientRect();return q.left<r.left-1||q.right>r.right+1||q.top<r.top-1||q.bottom>r.bottom+1}).map(e=>e.className||e.tagName)};
 }));
 if(inspect.length!==5 || inspect.some(x=>x.width!==1080||x.height!==1350||x.overflowX||x.overflowY||x.offCanvas.length))throw Error('LAYOUT_INVALID:'+JSON.stringify(inspect));
 const collisions=await page.evaluate(()=>{
   const bounds=(selector)=>{const el=document.querySelector(selector);if(!el)return null;const r=el.getBoundingClientRect();return{top:r.top,bottom:r.bottom,left:r.left,right:r.right}};
   const maxCard=Math.max(...[...document.querySelectorAll('.s2 .record')].map(e=>e.getBoundingClientRect().bottom));
   const s2Summary=bounds('.s2 .summary');const s3Sub=bounds('.s3 .sub');const s3Rail=bounds('.s3 .rail');
   const s4Main=bounds('.s4 .main'),s4Standout=bounds('.s4 .standout');
   const s5Checklist=bounds('.s5 .checklist'),s5Cta=bounds('.s5 .bottomCard');
   return [{name:'page-2-summary-after-cards',gap:s2Summary.top-maxCard},{name:'page-3-rail-after-description',gap:s3Rail.top-s3Sub.bottom},{name:'page-4-callout-after-visual',gap:s4Standout.top-s4Main.bottom},{name:'page-5-cta-after-checklist',gap:s5Cta.top-s5Checklist.bottom}];
 });
 if(collisions.some(x=>x.gap<8))throw Error('VISUAL_COLLISION:'+JSON.stringify(collisions));
 const orbiQa=await page.evaluate(()=>[...document.querySelectorAll('.page')].map((page,i)=>{
   const base=page.getBoundingClientRect();
   const st=getComputedStyle(page,'::after');
   const image=getComputedStyle(page).getPropertyValue('--orbi-asset')||st.backgroundImage;
   const img=i===4?page.querySelector('.orbi'):null;
   const r=img?.getBoundingClientRect();
   const x=img?r.left-base.left:parseFloat(st.left);
   const y=img?r.top-base.top:parseFloat(st.top);
   const w=img?r.width:parseFloat(st.width);
   const h=img?r.height:parseFloat(st.height);
   const meaningful=!!img || (image.includes('orbi-')&&st.content!=='none'&&st.content!=='normal');
   const inside=Number.isFinite(x)&&Number.isFinite(y)&&x>=0&&y>=0&&x+w<=1080&&y+h<1244;
   // A rough bounding-box P1 check for the actual text blocks; transparent
   // mascot pixels are allowed to sit on cards/diagrams but never on copy.
   const boxes=[...page.querySelectorAll('.display,.sub,.summary,.result,.standout,.checklist,.bottomCard,.footerNote,.mast,.foot,.tag')].map(el=>({el,r:el.getBoundingClientRect()}));
   const textOverlap=boxes.filter(({el,r})=>{
     if(i===3&&el.classList.contains('standout'))return false;
     const intersectX=Math.min(base.left+x+w,r.right)-Math.max(base.left+x,r.left);
     const intersectY=Math.min(base.top+y+h,r.bottom)-Math.max(base.top+y,r.top);
     return intersectX>24&&intersectY>24;
   }).map(({el})=>el.className);
   return {slide:i+1,image:img?img.getAttribute('src'):image,x,y,w,h,meaningful,inside,textOverlap};
 }));
 // Absence on the explanatory diagram and polar radar is an intentional
 // editorial constraint, not a missing visual asset.
 const expectedMascotSlides=new Set([1,2,5]);
 if(orbiQa.some(x=>expectedMascotSlides.has(x.slide)
   ? (!x.meaningful||!x.inside||x.textOverlap.length)
   : x.meaningful))throw Error('ORBI_EDITORIAL_RESTRAINT_QA_FAILED:'+JSON.stringify(orbiQa));
 const out=[];for(let i=1;i<=5;i++){let f=`slide-${String(i).padStart(2,'0')}.png`;await page.locator(`.page[data-slide="${i}"]`).screenshot({path:join(root,f)});out.push(f)}
 let pdf='orbital-attendance-carousel-v3.pdf';await page.pdf({path:join(root,pdf),printBackground:true,preferCSSPageSize:true});out.push(pdf)
 const artifacts=await Promise.all(out.map(async file=>({file,bytes:(await stat(join(root,file))).size,sha256:await sha(join(root,file))})));
 const assets=(await readdir(join(root,'assets'))).sort();const provenance=await Promise.all(assets.map(async file=>({file:`assets/${file}`,sha256:await sha(join(root,'assets',file))})));
 const manifest={schema:'orbital.carousel.preview.v3',status:'DRAFT_UNAPPROVED_NO_PUBLICATION',createdAt:new Date().toISOString(),campaign:'field-attendance-20261103',canvas:{width:1080,height:1350,count:5},source:'source.html',renderer:'render.mjs',layout:inspect,collisions,orbiQa,artifacts,provenance};
 await writeFile(join(root,'render-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 console.log(JSON.stringify({status:'RENDER_PASS',pages:inspect.length,artifacts,layout:inspect,collisions,orbiQa},null,2));
}finally{await browser.close()}
