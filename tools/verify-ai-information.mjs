import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=f=>fs.readFileSync(new URL(f,new URL('../',import.meta.url)),'utf8');
const baseline=process.argv[2]||'f89ae4a';
const hash=s=>createHash('sha256').update(s).digest('hex');
const meta=JSON.parse(read('downloads/economic-tutoring-ai-sources.json'));
const pack=read('downloads/economic-tutoring-ai-information.txt');
assert.equal(hash(pack),meta.pack_sha256);
assert.equal(meta.page_count,51);
assert.equal(meta.guide_count,9);
assert.equal(meta.product_count,7);
assert.equal(hash(read('site-config.js')),meta.config_sha256);
assert.ok(!/草案|未公開|\/Users\/|IN_PROGRESS|funnel\.csv/.test(pack));
const ctx={window:{}};vm.runInNewContext(read('site-config.js'),ctx);
const cfg=ctx.window.ECONOMIC_TUTORING;
for(const p of Object.values(cfg.products)){
  assert.ok(pack.includes(`【${p.name}】`));
  assert.ok(pack.includes(`${p.price.toLocaleString('ja-JP')}円／${p.unit}`));
  for(const item of [...p.includes,...p.excludes])assert.ok(pack.includes(item),item);
}
for(const marker of ['入会金：0円','通常3,000円','最大6名','期間外・対象外は通常料金',
  '実際の残席','本人同意','iPadで板書','似た問題','ノートとペン','継続契約は必須ではありません',
  '無料ガイドで進められる部分は自習','申込み送信＝日程確定・契約成立ではありません',
  'ご自身のAI','全文を扱えるかは利用先・設定によって異なります'])assert.ok(pack.includes(marker),marker);
for(const p of meta.pages){
  assert.equal(hash(fs.readFileSync(root+p.file)),p.html_sha256,p.file+': current source');
  assert.ok(pack.includes('公式URL：'+p.url),p.url);
}
// Existing pages keep exactly their previous contents except the one new footer link
// and the explicitly approved home-page information-pack section.
const beforeFiles=execFileSync('git',['ls-tree','-r','--name-only',baseline],{cwd:root,encoding:'utf8'}).trim().split('\n');
const strip=s=>s.replace(/^          <a href="\/ai\/">自分のAIでETを確認する<\/a>\n/gm,'')
  .replace(/    <section class="section section-white" id="ai-information">[\s\S]*?    <\/section>\n/,'');
for(const f of beforeFiles.filter(f=>f.endsWith('.html'))){
 const old=execFileSync('git',['show',baseline+':'+f],{cwd:root,encoding:'utf8'});
 assert.equal(strip(read(f)),old,f+': unrelated content changed');
}
for(const f of ['site-config.js','script.js','robots.txt','_redirects','styles.css','hp-refresh.css','entry-navigation.css'].filter(f=>beforeFiles.includes(f)))
 assert.equal(read(f),execFileSync('git',['show',baseline+':'+f],{cwd:root,encoding:'utf8'}),f+': unchanged');
const page=read('ai/index.html');
assert.ok(page.includes('download="economic-tutoring-ai-information.txt"'));
assert.ok(page.includes('このHP内にAIチャットを設置するものではありません'));
assert.ok(page.includes('data-copy-ai-question'));
assert.ok(page.includes('2026年10月9日'));
assert.ok(page.includes('id="autumn-trial"'));
assert.ok(!/fetch\(|XMLHttpRequest|sendBeacon|localStorage/.test(read('ai-information.js')));
const report={ok:true,baseline,existingHtmlPreservedExceptApprovedLinkAndHomeSection:52,publicSourcePages:meta.page_count,
  guideBodies:9,completeProducts:7,packBytes:Buffer.byteLength(pack),packSha256:meta.pack_sha256,
  checks:['source hashes','scope and exclusions','all product inclusions/exclusions','dated campaign and normal price',
    'teacher-approved lesson methods','no internal/private sources','no AI API or uploads','existing materials preserved'],
  checkedAt:new Date().toISOString()};
console.log(JSON.stringify(report,null,2));
if(process.argv.includes('--public')){
 const routes=['/ai/','/ai-information.css?v=1','/ai-information.js?v=1','/downloads/economic-tutoring-ai-information.txt','/downloads/economic-tutoring-ai-sources.json'];
 const results=[];
 for(const route of routes){
   const res=await fetch('https://economic-tutoring.pages.dev'+route,{signal:AbortSignal.timeout(20000),headers:{'Cache-Control':'no-cache'}});
   const bytes=Buffer.from(await res.arrayBuffer());
   const file=route.split('?')[0].slice(1)+(route.split('?')[0].endsWith('/')?'index.html':'');
   const matches=hash(bytes)===hash(fs.readFileSync(root+file));
   results.push({route,status:res.status,matches,bytes:bytes.length,sha256:hash(bytes),contentType:res.headers.get('content-type')});
 }
 console.log(JSON.stringify({public:true,ok:results.every(r=>r.status===200&&r.matches),checkedAt:new Date().toISOString(),results},null,2));
 assert.ok(results.every(r=>r.status===200&&r.matches));
}
