#!/usr/bin/env node
// Compile one reviewed, immutable article Markdown into safe static HTML for SSR.
// No external Markdown dependencies or raw HTML pass-through.
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'

const root=resolve(import.meta.dirname,'..')
const source=resolve(root,'docs/social/b2b05/v1/article.md')
const dest=resolve(root,'src/blogB2B05Html.ts')
const bytes=readFileSync(source)
const full=bytes.toString('utf8')
const sha=createHash('sha256').update(bytes).digest('hex')
const esc=text=>String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
const inline=text=>esc(text)
  .replace(/\[([^\]]+)\]\((https:\/\/[^)]+)\)/g,(_all,label,href)=>{
    const parsed=new URL(href.replace(/&amp;/g,'&'))
    if(parsed.protocol!=='https:')throw Error('INVALID_URL_IN_ARTICLE')
    return '<a href="'+esc(parsed.href)+'" rel="noopener noreferrer">'+label+'</a>'
  })
  .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
  .replace(/\*([^*]+)\*/g,'<em>$1</em>')

const raw=full.replace(/^---\n[\s\S]*?\n---\n/,'')
const cut=raw.indexOf('\n## 1.')
if(cut<0||!raw.includes('## Conclusión:')) throw Error('APPROVED_ARTICLE_SECTIONS_CHANGED')
const bodyStart=raw.indexOf('\n\n',raw.indexOf('**Orbital Insights'))+2
const bodyEnd=raw.indexOf('\n### ¿Tu empresa recibe pedidos')
if(bodyStart<=0||bodyEnd<=bodyStart)throw Error('APPROVED_ARTICLE_CTA_CHANGED')
const lines=raw.slice(bodyStart,bodyEnd).trim().split(/\r?\n/)
const blocks=[]
let paragraph=[],list=[],listType=null,table=[]
const flush=()=>{
  if(paragraph.length){blocks.push('<p>'+inline(paragraph.join(' '))+'</p>');paragraph=[]}
  if(list.length){blocks.push('<'+listType+'>'+list.map(s=>'<li>'+inline(s)+'</li>').join('')+'</'+listType+'>');list=[];listType=null}
  if(table.length){blocks.push('<div class="blogB2B05TableScroll"><table>'+table.map((row,i)=>'<tr>'+row.map(v=>i?'<td>'+inline(v)+'</td>':'<th>'+inline(v)+'</th>').join('')+'</tr>').join('')+'</table></div>');table=[]}
}
for(const item of lines){
  const line=item.trim()
  if(!line){flush();continue}
  if(/^\|[-:| ]+\|$/.test(line))continue
  if(line.startsWith('|')&&line.endsWith('|')){
    if(paragraph.length||list.length)flush()
    table.push(line.slice(1,-1).split('|').map(s=>s.trim()));continue
  }
  if(table.length)flush()
  const heading=line.match(/^(#{2,3})\s+(.+)$/)
  if(heading){flush();const n=heading[1].length;blocks.push('<h'+n+'>'+inline(heading[2])+'</h'+n+'>');continue}
  const bullet=line.match(/^[-*]\s+(.+)$/)
  const numbered=line.match(/^\d+\.\s+(.+)$/)
  if(bullet||numbered){
    if(paragraph.length)flush()
    const type=bullet?'ul':'ol'
    if(list.length&&listType!==type)flush()
    listType=type;list.push((bullet||numbered)[1]);continue
  }
  if(list.length)flush()
  if(line==='---'){flush();blocks.push('<hr>');continue}
  paragraph.push(line)
}
flush()
const html=blocks.join('\n')
if(!html.includes('Wasy')||!html.includes('<table>')||blocks.length<23)
  throw Error('HTML_ARTICLE_CONTENT_INCOMPLETE')
const module=[
  '// Generated from the exact approved B2B-05 V1 article. Do not hand edit.',
  '// Source SHA-256: '+sha,
  'export const b2b05ArticleSourceSha256 = '+JSON.stringify(sha),
  'export const b2b05ArticleHtml = '+JSON.stringify(html)+'\n'
].join('\n')
writeFileSync(dest,module)
console.log(JSON.stringify({status:'ARTICLE_COMPILED',sourceSha256:sha,sections:blocks.length,htmlBytes:Buffer.byteLength(html)}))
