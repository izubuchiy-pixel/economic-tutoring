import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {siteFiles} from './site-files.mjs';
import {enhanceUniversityPage} from './university-curricula.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const baseline=process.argv[2]||'a219b79';
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const old=file=>execFileSync('git',['show',`${baseline}:${file}`],{cwd:root,encoding:'utf8'});
const pack=JSON.parse(read('tools/university-curricula.json'));
const expectedSlugs=['waseda','keio','gakushuin','meiji','aoyama-gakuin','rikkyo','chuo','hosei','kansai','kwansei-gakuin','doshisha','ritsumeikan','nihon','toyo','komazawa','senshu','kyoto-sangyo','kindai','konan','ryukoku','sophia'];
assert.deepEqual(pack.universities.map(u=>u.slug),expectedSlugs);
let courses=0,syllabusContent=0;
for(const u of pack.universities) {
 for(const key of ['school','faculty','yearLabel','scopeNote'])assert.ok(u[key]?.trim(),`${u.slug}: ${key}`);
 assert.ok(u.courses.length>=4,`${u.slug}: insufficient verified core coverage`);
 assert.equal(new Set(u.sources.map(s=>s.id)).size,u.sources.length,`${u.slug}: duplicate source`);
 assert.equal(new Set(u.courses.map(c=>c.name)).size,u.courses.length,`${u.slug}: duplicate course group`);
 const ids=new Set(u.sources.map(s=>s.id));
 for(const s of u.sources) {
  for(const key of ['id','title','url','year','evidence'])assert.ok(s[key]?.trim(),`${u.slug} source ${key}`);
  const host=new URL(s.url).hostname;
  assert.ok(host.endsWith('.ac.jp')||host.endsWith('.keio.jp')||host.endsWith('.waseda.jp'),`${u.slug}: non-university source`);
 }
 for(const c of u.courses) {
  for(const key of ['name','stage','requirement','verification','studyFocus'])assert.ok(c[key]?.trim(),`${u.slug} course ${key}`);
  assert.ok(c.sourceIds.length>0&&c.sourceIds.every(id=>ids.has(id)),`${u.slug}: unsupported course ${c.name}`);
  assert.ok(c.topics===null||typeof c.topics==='string'&&c.topics.trim(),`${u.slug}: topics must be supported or null`);
  if(c.topics)syllabusContent++;
  courses++;
 }
}
// Preserve every pre-existing page outside the explicitly approved directory
// descriptions, directory headings, additive course blocks, and AI update date.
for(const file of siteFiles(root)) {
 let before=old(file);
 if(file==='universities/index.html') {
  before=before.replace(/(<meta name="description" content=")[^"]+(">)/,'$1'+ '21大学の経済学系学部の主な授業を、公式カリキュラムをもとに案内。数学・ミクロ・マクロ・統計・計量などの正式科目名、配当年次、必修・選択、資料年度と確認範囲を分けて掲載。30の学習入口で例題や復習順も読めます。'+'$2');
  before=before.replace(/(<meta property="og:description" content=")[^"]+(">)/,'$1'+'21大学の主な授業を公式資料から確認。必修・選択と資料年度を分け、30の学習入口へつなぎます。'+'$2');
  before=before.replace('<p class="entry-kicker">21大学・30の大学×科目の入口</p>', '<p class="entry-kicker">21大学の主な授業・30の学習入口</p>');
  before=before.replace('<p>大学の公式情報と、独自の解説付き例題を各ページにまとめました。科目名は大学・学科により異なります。大学群は探しやすさのための分類で、大学との提携や対応実績の表示ではありません。</p>', '<p>各大学の数学・ミクロ・マクロ・統計など、基礎からつながる主な授業を公式資料で確認しました。大学名の下で科目一覧を開くと、正式科目名・年次・必修／選択を確認できます。詳しい根拠と確認範囲、独自の例題は各案内ページへ。</p><p class="fineprint">同じ大学でも学科・入学年度・担当者で内容や要件は異なります。科目数を揃えるための追加はしていません。大学群は探しやすさのための分類で、大学との提携や対応実績の表示ではありません。</p>');
  before=before.replace('編集：economic_tutoring／2026年9月20日。', '編集：economic_tutoring／2026年10月10日。');
 }
 if(file==='ai/index.html')before=before.replace('<time datetime="2026-10-09" data-ai-updated>2026年10月9日</time>','<time datetime="2026-10-10" data-ai-updated>2026年10月10日</time>');
 const expected=enhanceUniversityPage(file,before);
 assert.equal(read(file),expected,`${file}: unintended change`);
 assert.equal(enhanceUniversityPage(file,expected),expected,`${file}: renderer not idempotent`);
 if(file.startsWith('universities/')&&file!=='universities/index.html') {
  const u=pack.universities.find(u=>u.slug===file.split('/')[1]);
  assert.equal((expected.match(/class="curriculum-course"/g)||[]).length,u.courses.length);
  assert.ok(expected.includes('個別指導での確認案（ET独自）'));
 }
}
assert.equal((read('universities/index.html').match(/class="curriculum-directory"/g)||[]).length,21);
const baselinePaths=new Set(execFileSync('git',['ls-tree','-r','--name-only',baseline],{cwd:root,encoding:'utf8'}).trim().split('\n'));
for(const file of ['site-config.js','robots.txt','_redirects','sitemap.xml','sitemap.txt','script.js']) {
 assert.equal(fs.existsSync(path.join(root,file)),baselinePaths.has(file),`${file}: changed existence`);
 if(baselinePaths.has(file))assert.equal(read(file),old(file),`${file}: changed protected configuration`);
}
const manifest=JSON.parse(read('downloads/economic-tutoring-ai-sources.json'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
assert.equal(manifest.pages.length,51);
for(const page of manifest.pages)assert.equal(hash(fs.readFileSync(path.join(root,page.file))),page.html_sha256,`AI pack source stale: ${page.file}`);
const information=read('downloads/economic-tutoring-ai-information.txt');
for(const u of pack.universities)for(const c of u.courses)assert.ok(information.includes(c.name),`AI pack course missing: ${u.slug} ${c.name}`);
console.log(JSON.stringify({ok:true,universities:21,courseGroups:courses,groupsWithContentSummary:syllabusContent,htmlPages:siteFiles(root).length,unchangedGuides:9,aiSourcePages:51,productsUnchanged:7,rendererIdempotent:true},null,2));
