#!/usr/bin/env node
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { readFile, writeFile, stat, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(fileURLToPath(import.meta.url));
const { chromium }=createRequire('/srv/orbital/workspaces/Content-Factory/package.json')('playwright');
const sha=async(file)=>createHash('sha256').update(await readFile(join(root,file))).digest('hex');
const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
let results=[];
try{
 const page=await browser.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:1});
 await page.goto('file://'+join(root,'source.html'),{waitUntil:'load'});
 await page.evaluate(()=>document.fonts.ready);
 await page.waitForTimeout(500);
 const inspection=await page.evaluate(()=>{
  return [...document.querySelectorAll('.page')].map((p,i)=>{
   const b=p.getBoundingClientRect();const images=[...p.querySelectorAll('img')].map(im=>({src:im.getAttribute('src'),loaded:im.complete&&im.naturalWidth>0}));
   const text=[...p.querySelectorAll('h1,h2,.sub,.tag,.foot,.cta,.flow,.duo,.proofrow,.legal,.heroFrame,.desktop,.mobile')].map(x=>{
    const r=x.getBoundingClientRect();return {sel:x.className||x.tagName,top:Math.round(r.top-b.top),left:Math.round(r.left-b.left),right:Math.round(r.right-b.left),bottom:Math.round(r.bottom-b.top)};
   });
   return {slide:i+1,width:b.width,height:b.height,images,overflowX:p.scrollWidth>p.clientWidth+2,overflowY:p.scrollHeight>p.clientHeight+2,offCanvas:text.filter(x=>x.left<0||x.right>1081||x.top<0||x.bottom>1351)};
  });
 });
 if(inspection.length!==5||inspection.some(x=>x.width!==1080||x.height!==1350||x.images.some(img=>!img.loaded)||x.overflowX||x.overflowY||x.offCanvas.length))throw Error('RENDER_QA_FAILED '+JSON.stringify(inspection));
 for(let i=1;i<=5;i++){const filename='slide-'+String(i).padStart(2,'0')+'.png';await page.locator('.page[data-slide="'+i+'"]').screenshot({path:join(root,filename),animations:'disabled'});results.push(filename)}
 await page.pdf({path:join(root,'lisa-orbital-carousel-v1.pdf'),preferCSSPageSize:true,printBackground:true});
 results.push('lisa-orbital-carousel-v1.pdf');
 const artifacts=await Promise.all(results.map(async(file)=>({file,bytes:(await stat(join(root,file))).size,sha256:await sha(file)})));
 const assets=await readdir(join(root,'assets'));
 const provenance=await Promise.all(assets.sort().map(async file=>({file:'assets/'+file,sha256:await sha('assets/'+file)})));
 const manifest={schema:'orbital.carousel.review.v1',status:'OWNER_REVIEW_NOT_APPROVED_NOT_SCHEDULED',createdAt:new Date().toISOString(),canvas:{width:1080,height:1350,slides:5},source:'source.html',renderer:'render.mjs',inspections:inspection,artifacts,provenance};
 await writeFile(join(root,'render-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 console.log(JSON.stringify({status:'RENDER_PASS',artifacts,inspection},null,2));
}finally{await browser.close()}
