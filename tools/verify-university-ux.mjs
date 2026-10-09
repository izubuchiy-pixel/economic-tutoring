import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const directory=JSON.parse(read('tools/university-directory.json'));
const curricula=JSON.parse(read('tools/university-curricula.json'));
const baseline=process.argv[2]||directory.sourceCommit;
const html=read('universities/index.html');
const old=execFileSync('git',['show',`${baseline}:universities/index.html`],{cwd:root,encoding:'utf8'});
assert.equal(read('tools/university-curricula.json'),execFileSync('git',['show',`${baseline}:tools/university-curricula.json`],{cwd:root,encoding:'utf8'}),'Official course evidence must stay unchanged.');
assert.equal(directory.entries.length,21);
assert.equal((html.match(/data-university="/g)||[]).length,21);
assert.equal((html.match(/data-course-entry/g)||[]).length,158);
assert.equal((html.match(/data-university-group/g)||[]).length,5);
const currentGuideUrls=new Set();
for(const u of directory.entries){
  assert(old.includes(`<p>${u.introduction}</p>`),`Baseline introduction missing: ${u.slug}`);
  assert(html.includes(`<p>${u.introduction}</p>`),`Current introduction missing: ${u.slug}`);
  const card=html.match(new RegExp(`<article[^>]+data-university="${u.slug}"[^>]*>([\\s\\S]*?)<\\/article>`))?.[1];
  assert(card,`University card missing: ${u.slug}`);
  const opening=html.match(new RegExp(`<article[^>]+data-university="${u.slug}"[^>]*>`))?.[0];
  assert(!/\bhidden\b/.test(opening),'No-JS fallback must leave cards visible.');
  if(u.supplement)assert(card.includes(u.supplement),`Supplement missing: ${u.slug}`);
  for(const href of u.hrefs){
    assert(old.includes(`href="${href}"`),`Baseline learning link missing: ${href}`);
    assert(card.includes(`href="${href}"`),`Current learning link missing: ${href}`);
    currentGuideUrls.add(href);
  }
  const expected=curricula.universities.find(x=>x.slug===u.slug);
  assert.equal((card.match(/data-course-entry/g)||[]).length,expected.courses.length);
}
assert.equal(currentGuideUrls.size,30);
assert(/data-university-finder hidden/.test(html),'Search should stay hidden until enhancement initializes.');
const select=html.match(/<select id="university-subject">([\s\S]*?)<\/select>/)?.[1];
assert(select);
const options=[...select.matchAll(/<option value="([^"]*)">([^<]+)<\/option>/g)].map(x=>[x[1],x[2]]);
assert.deepEqual(options,[['','全科目'],['math','数学・経済数学'],['micro','ミクロ経済学'],['macro','マクロ経済学'],['statistics','統計学'],['econometrics','計量経済学'],['data','データ分析'],['other','その他']]);
assert.equal(select.replace(/<option value="[^"]*">[^<]+<\/option>/g,'').trim(),'','Malformed or unmatched option markup.');
assert(html.includes('id="sophia"'),'Old Sophia anchor must remain.');
assert(html.includes('id="sokei"'),'University group anchor must remain.');
assert(html.includes('university-finder.css?v=1'));
assert(html.includes('university-finder.js?v=1'));
console.log(JSON.stringify({ok:true,universities:21,officialCourseGroups:158,existingLearningUrls:30,selectOptions:8,originalDescriptionsPreserved:true,officialEvidenceUnchanged:true,noJsFallbackPreserved:true},null,2));
