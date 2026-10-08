import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const root=fileURLToPath(new URL('../',import.meta.url));
const baseline=process.argv[2]||'ada53ae';
const read=f=>fs.readFileSync(root+f,'utf8');
const old=f=>execFileSync('git',['show',baseline+':'+f],{cwd:root,encoding:'utf8'});
const hash=s=>createHash('sha256').update(s).digest('hex');
const modified=['index.html','subjects.html','ai/index.html','universities/keio/economics-math/index.html'];
const tracked=execFileSync('git',['ls-tree','-r','--name-only',baseline],{cwd:root,encoding:'utf8'}).trim().split('\n');
for(const f of tracked.filter(f=>f.endsWith('.html')&&!modified.includes(f)))assert.equal(read(f),old(f),f+': unchanged');
for(const f of ['site-config.js','script.js','styles.css','enhancements.css','hp-refresh.css','entry-navigation.css','ai-information.js','ai-information.css','robots.txt','_redirects','sitemap.xml','sitemap.txt'].filter(f=>tracked.includes(f)))assert.equal(read(f),old(f),f+': unchanged');
const stripHome=s=>s.replace(/  <link rel="stylesheet" href="\/proof-example.css\?v=1">\n/,'')
 .replace(/          <article><h3>経済数学・微積で、[\s\S]*?<\/article>/,'')
 .replace(/    <section class="section section-ivory" id="teaching-example">[\s\S]*?    <\/section>/,'')
 .replace(/          <ol class="hub-editorial-list">[\s\S]*?<\/ol>/,'');
assert.equal(stripHome(read('index.html')),stripHome(old('index.html')),'home: only approved guidance');
const stripSubjects=s=>s.replace(/          <details id="mathematics">[\s\S]*?<\/details>/,'');
assert.equal(stripSubjects(read('subjects.html')),stripSubjects(old('subjects.html')),'subjects: math only');
const stripUni=s=>s.replace(/\n <details><summary>計算はできても、定義や証明で止まるときは？<\/summary>[\s\S]*?<\/details>/,'');
assert.equal(stripUni(read(modified[3])),old(modified[3]),'university: official syllabus/example unchanged');
const stripAI=s=>s.replace(/<textarea id="ai-question-template"[\s\S]*?<\/textarea>/,'')
 .replace(/        <div class="ai-question-grid">[\s\S]*?        <\/div>/,'');
assert.equal(stripAI(read('ai/index.html')),stripAI(old('ai/index.html')),'AI: questions only');
const pack=read('downloads/economic-tutoring-ai-information.txt');
const meta=JSON.parse(read('downloads/economic-tutoring-ai-sources.json'));
assert.equal(hash(pack),meta.pack_sha256);
assert.equal(meta.page_count,51);assert.equal(meta.guide_count,9);assert.equal(meta.product_count,7);
for(const p of meta.pages){assert.equal(hash(read(p.file)),p.html_sha256);assert.ok(pack.includes('公式URL：'+p.url));}
const ctx={window:{}};vm.runInNewContext(read('site-config.js'),ctx);
for(const p of Object.values(ctx.window.ECONOMIC_TUTORING.products)){
 assert.ok(pack.includes(`【${p.name}】`));assert.ok(pack.includes(`${p.price.toLocaleString('ja-JP')}円／${p.unit}`));
 for(const item of [...p.includes,...p.excludes])assert.ok(pack.includes(item),item);
}
for(const marker of ['本質的な理解','定理を使う条件','未習の内容','月額ありきにせず','試験日・範囲','最大6名','通常3,000円','申込み送信＝日程確定・契約成立ではありません'])assert.ok(pack.includes(marker),marker);
assert.ok(!/\/Users\/|funnel\.csv|IN_PROGRESS|IMG_43|体験した方|返信遅延/.test(pack),'no private or internal material');
assert.ok(read('index.html').includes('vは微分可能なので連続'));
assert.ok(read('index.html').includes('取り組んだあとに、解答・理由を見る'));
assert.ok(!read('index.html').includes('<details class="proof-answer" open'));
// Independent arithmetic check: decomposition, rule, and expanded-polynomial derivative.
for(const [a,b,ah,bh] of [[2,3,5,7],[-2,1,0,-4],[0,0,1,1]])assert.equal(ah*bh-a*b,(ah-a)*bh+a*(bh-b));
for(const x of [-2,-1,0,1,2,4]){
 const viaProduct=2*x*(x-1)+x*x, viaExpansion=3*x*x-2*x;
 assert.equal(viaProduct,viaExpansion);
 const h=0.00001,H=t=>t*t*(t-1);
 assert.ok(Math.abs((H(x+h)-H(x-h))/(2*h)-viaProduct)<1e-7);
}
const report={ok:true,baseline,changedPages:4,preservedOtherHtml:tracked.filter(f=>f.endsWith('.html')&&!modified.includes(f)).length,
 protectedProducts:7,preservedGuides:9,packSha256:meta.pack_sha256,
 checks:['scoped changes','official course info preserved','privacy exclusions','complete product scopes','source hashes','algebra decomposition','product/expanded derivative','finite-difference check','answer initially hidden'],checkedAt:new Date().toISOString()};
console.log(JSON.stringify(report,null,2));
if(process.argv.includes('--public')){
 const paths=['index.html','subjects.html',modified[3],'ai/index.html','proof-example.css','downloads/economic-tutoring-ai-information.txt','downloads/economic-tutoring-ai-sources.json'];
 const results=[];
 for(const file of paths){
  const route=file.replace(/index\.html$/,'').replace(/\.html$/,'');
  const res=await fetch('https://economic-tutoring.pages.dev/'+route,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(20000)});
  const bytes=Buffer.from(await res.arrayBuffer());
  results.push({file,status:res.status,matches:hash(bytes)===hash(fs.readFileSync(root+file)),sha256:hash(bytes)});
 }
 assert.ok(results.every(r=>r.status===200&&r.matches),JSON.stringify(results));
 console.log(JSON.stringify({public:true,ok:true,results,checkedAt:new Date().toISOString()},null,2));
}
