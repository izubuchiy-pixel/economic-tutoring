import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=f=>fs.readFileSync(new URL(f,new URL('../',import.meta.url)),'utf8');
const pages=['index.html','subjects.html','guides/index.html'];
for(const file of pages) {
  const html=read(file);
  assert.ok(html.includes('/entry-navigation.css?v=1'),file+': scoped style included');
  for(const match of html.matchAll(/href="([^"]+)"/g)) {
    const href=match[1];
    if(!href.startsWith('/')&&!href.startsWith('#'))continue;
    const [route,fragment]=href.split('#');
    if(!fragment)continue;
    let destination=file;
    if(route) destination=route==='/'?'index.html':route.endsWith('/')?route.slice(1)+'index.html':route.slice(1)+'.html';
    assert.ok(read(destination).includes(`id="${fragment}"`),`${file}: ${href} destination exists`);
  }
}
const catalog=[...read('guides/index.html').matchAll(/class="hub-guide" href="([^"]+)"/g)].map(m=>m[1]);
assert.equal(catalog.length,9,'nine original guides remain in catalog');
assert.equal(new Set(catalog).size,9,'no duplicate catalog entries');
assert.equal((read('guides/index.html').match(/class="learning-start-card"/g)||[]).length,4);
assert.ok(read('index.html').includes('ガイドは登録不要'));
assert.ok(read('subjects.html').includes('/universities/keio/economics-math/'));
// Run before committing the release. Compare against the tracked pre-change snapshot.
const protectedFiles=['site-config.js','script.js','sitemap.xml','sitemap.txt','robots.txt','pricing.html','terms.html','privacy.html','tokusho.html','instagram/index.html',...catalog.map(href=>href.slice(1)+'.html')];
const universityFiles=execFileSync('git',['ls-files','universities/**/*.html','universities/index.html','parents/index.html'],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(Boolean);
for(const file of [...protectedFiles,...universityFiles]) {
  const before=execFileSync('git',['show','HEAD:'+file],{cwd:root,encoding:'utf8'});
  assert.equal(read(file),before,file+': preserved byte-for-byte');
}
console.log(JSON.stringify({ok:true,changedEntryPages:pages.length,originalGuideCount:catalog.length,protectedFiles:protectedFiles.length+universityFiles.length,checks:['all entry fragments resolve','scoped stylesheet','existing guide bodies preserved','products/campaign/form/scripts/legal/university pages preserved']},null,2));
