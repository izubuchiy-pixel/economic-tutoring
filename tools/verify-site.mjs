import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {renderComponents} from './site-templates.mjs';
import {siteFiles,entryPages} from './site-files.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const baseline=process.argv[2] || 'HEAD';
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const previous=f=>execFileSync('git',['show',baseline+':'+f],{cwd:root,encoding:'utf8'});
const context={window:{}};
vm.runInNewContext(read('site-config.js'),context);
const config=context.window.ECONOMIC_TUTORING;
const baselineFiles=new Set(execFileSync('git',['ls-tree','-r','--name-only',baseline],{cwd:root,encoding:'utf8'}).trim().split('\n'));
const files=siteFiles(root);
const pages=new Map(files.map(f=>[f,read(f)]));
const norm=s=>s.replace(/[ \t]+$/gm,'').trim();
const issues=[];
let linkCount=0,jsonCount=0,guideCount=0,componentCount=0;
const check=(value,label)=>{ if(!value)issues.push(label); };
function resolve(url,from) {
 const absolute=new URL(url,'https://economic-tutoring.pages.dev/'+from);
 let file=decodeURIComponent(absolute.pathname).slice(1);
 if(!file||file.endsWith('/')) file+='index.html';
 if(!path.extname(file)) file+='.html';
 return {file,anchor:decodeURIComponent(absolute.hash.slice(1))};
}
for(const [file,html] of pages) {
 const old=baselineFiles.has(file)?previous(file):null;
 check(!!old||entryPages.includes(file),file+': unexpected new page');
 check((html.match(/<h1(?:\s|>)/g)||[]).length===1,file+': h1 count');
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 check(ids.length===new Set(ids).size,file+': duplicate IDs');
 const canonical=s=>s.match(/<link rel="canonical"[^>]+>/)?.[0]||'';
 if(old) check(canonical(html)===canonical(old),file+': canonical changed');
 else check(canonical(html).includes('href="https://economic-tutoring.pages.dev/'+file.replace(/index\.html$/,'')+'"'),file+': new canonical incorrect');
 const json=s=>[...s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
 try {
   if(old) {
     const before=json(old),after=json(html);
     // The approved subject expansion renames only this collection; all other
     // structured-data fields and all other pages retain strict regression checks.
     if(file==='universities/index.html') {
       const name='大学・科目別の経済学・経済数学サポート';
       check(after[0]?.name===name,file+': collection name mismatch');
       before[0].name=name;
     }
     assert.deepEqual(after,before);
   } else check(json(html).length>0,file+': JSON-LD missing');
   jsonCount+=json(html).length;
 }
 catch(error) {issues.push(file+': JSON-LD '+error.message);}
 const comp=renderComponents(config,html.match(/data-page="([^"]+)"/)?.[1]||'top');
 for(const kind of ['header','footer','contact']) {
   const marker=new RegExp('<!-- site:'+kind+' -->([\\s\\S]*?)<!-- /site:'+kind+' -->');
   const match=html.match(marker);
   if(kind!=='contact'||!old||old.includes('data-site-contact')||old.includes('site:contact')) {
     check(!!match,file+': static '+kind+' missing');
     if(match) {check(norm(match[1])===norm(comp[kind]),file+': stale '+kind);componentCount++;}
   }
 }
 if(file.startsWith('guides/')&&file!=='guides/index.html') {
   const article=s=>s.match(/<article class="guide-article">[\s\S]*?<\/article>\s*(?=<div data-site-contact|<!-- site:contact|<\/main>)/)?.[0];
   // The complete teaching article ends before the shared consultation area.
   const body=s=>s.slice(s.indexOf('<article class="guide-article">'),s.indexOf('</main>')).replace(/(?:<div data-site-contact><\/div>|<!-- site:contact -->[\s\S]*?<!-- \/site:contact -->)/g,'').trim();
   check(norm(body(html))===norm(body(old)),file+': teaching article changed');
   guideCount++;
 }
 for(const m of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
   const url=m[1];
   if(url.startsWith('mailto:')||url.startsWith('tel:')||url.startsWith('data:')||/^https?:/.test(url)&&!url.startsWith('https://economic-tutoring.pages.dev/')) continue;
   const {file:dest,anchor}=resolve(url,file);
   check(fs.existsSync(path.join(root,dest)),file+': missing '+url);
   if(anchor&&pages.has(dest)) check(new RegExp('\\bid="'+anchor.replace(/[.*+?^$()|[\]\\]/g,'\\$&')+'"').test(pages.get(dest)),file+': broken anchor '+url);
   linkCount++;
 }
 check(!/<div data-site-(header|footer|contact)>/.test(html),file+': unbuilt component');
}
const pricing=pages.get('pricing.html');
for(const key of Object.keys(config.products)) {
 const item=config.products[key];
 check(pricing.includes(norm(renderComponents(config,'pricing').detailRow(key))), 'pricing: missing complete '+key);
 for(const t of [...item.includes,...(item.excludes||[])]) check(pricing.includes(t),'pricing: missing scope '+key+' '+t);
}
for(const f of ['site-config.js','robots.txt','_redirects']) {
 if(fs.existsSync(path.join(root,f))) check(read(f)===previous(f),f+': changed');
}
check(pages.get('instagram/index.html').includes('noindex,follow'),'Instagram indexing changed');
check(pages.get('index.html').includes('6z-RGrUeDGd1sQDVT5O0i68VGSX6dGDe9CU1xBNgJA4'),'ownership tag missing');
check(read('hp-refresh.css').includes('html:not(.js) .nav'),'no-JS navigation missing');
check(read('hp-refresh.css').includes('visibility:hidden'),'hidden CTA focus exclusion missing');
check(read('script.js').includes('event.key === "Escape"'),'Escape handling missing');
const urls=[...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
const oldUrls=[...previous('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
for(const url of oldUrls) check(urls.includes(url),'old sitemap URL removed '+url);
check(urls.length===18+entryPages.length,'sitemap count');
check(urls.length===new Set(urls).size,'duplicate sitemap URL');
for(const url of urls) check(pages.has(resolve(url,'index.html').file),'sitemap unresolved '+url);
for(const f of entryPages) {
 const html=pages.get(f)||'';
 check(html.includes('id="contact"'),f+': inquiry section missing');
 check(html.includes(config.consultationForm.url),f+': existing form missing');
 check(html.includes('3,000円'),f+': paid trial price missing');
 check(!html.includes('noindex'),f+': entry excluded from search');
 const canonical=html.match(/rel="canonical" href="([^"]+)"/)?.[1];
 check(urls.includes(canonical),f+': entry missing from sitemap');
 if(f.startsWith('universities/')&&f!=='universities/index.html') {
   check(html.includes('id="sources"')&&html.includes('id="example"'),f+': sources/example missing');
   check(html.includes('公式・公認・提携サービスでは'),f+': affiliation boundary missing');
   check(html.includes('href="/parents/"'),f+': parent path missing');
 }
}
check(pages.get('parents/index.html')?.includes('本人が同意した相手・情報・範囲に限って'),'parent consent boundary missing');
const result={ok:issues.length===0,baseline,pages:files.length,staticComponents:componentCount,localLinksChecked:linkCount,jsonLdBlocks:jsonCount,preservedGuideArticles:guideCount,completeProducts:Object.keys(config.products).length,sitemapUrls:urls.length,issues,browserVisualQA:'Not run: not requested',checkedAt:new Date().toISOString()};
console.log(JSON.stringify(result,null,2));
process.exitCode=issues.length?1:0;
