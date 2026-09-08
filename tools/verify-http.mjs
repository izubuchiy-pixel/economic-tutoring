import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base=new URL(process.argv[2]||'http://127.0.0.1:4173');
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
urls.push('/instagram/','/hp-refresh.css','/styles.css','/enhancements.css','/script.js','/site-config.js','/robots.txt','/sitemap.xml','/assets/showcase-home-desktop.png');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const results=[];
for(let start=0;start<urls.length;start+=4) await Promise.all(urls.slice(start,start+4).map(async route=>{
 let file=route.slice(1);
 if(!file||file.endsWith('/'))file+='index.html';
 if(!path.extname(file))file+='.html';
 const url=new URL(route,base);
 // Versioned assets use the same version as the deployed HTML.
 if(route==='/hp-refresh.css')url.search='?v=5';
 if(route==='/script.js')url.search='?v=34';
 try {
   const res=await fetch(url,{signal:AbortSignal.timeout(20000),headers:{'Cache-Control':'no-cache'}});
   const bytes=Buffer.from(await res.arrayBuffer());
   const matches=hash(bytes)===hash(fs.readFileSync(path.join(root,file)));
   results.push({route,status:res.status,matches,bytes:bytes.length});
 } catch(e) { results.push({route,error:e.message}); }
}));
const ok=results.every(r=>r.status===200&&r.matches);
console.log(JSON.stringify({ok,base:base.origin,checkedAt:new Date().toISOString(),routes:results.sort((a,b)=>a.route.localeCompare(b.route))},null,2));
process.exitCode=ok?0:1;
