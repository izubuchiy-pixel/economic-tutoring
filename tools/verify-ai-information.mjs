import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {siteFiles} from './site-files.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=f=>fs.readFileSync(root+f,'utf8');
const baseline=process.argv.find((x,i)=>i>1&&!x.startsWith('--'))||'14a345a';
const hash=s=>createHash('sha256').update(s).digest('hex');
const meta=JSON.parse(read('downloads/economic-tutoring-ai-sources.json'));
const pack=read('downloads/economic-tutoring-ai-information.txt');
const excluded=['404.html','ai/index.html','before-university/index.html'];
const expected=siteFiles(root).filter(f=>!excluded.includes(f)).sort();
function verify(m,text,source=read){
 assert.equal(expected.length,54,'approved source count');
 assert.equal(m.page_count,54);assert.equal(m.guide_count,9);assert.equal(m.product_count,7);
 assert.deepEqual(m.pages.map(p=>p.file).sort(),expected,'exact source coverage');
 assert.equal(hash(text),m.pack_sha256,'pack bytes');
 assert.equal(Buffer.byteLength(text),m.pack_bytes);
 assert.equal(hash(source('site-config.js')),m.config_sha256,'configuration');
 assert.ok(!/草案|未公開|\/Users\/|IN_PROGRESS|funnel\.csv/.test(text),'private content');
 const ctx={window:{}};vm.runInNewContext(source('site-config.js'),ctx);
 const products=ctx.window.ECONOMIC_TUTORING.products;
 assert.equal(Object.keys(products).length,7);
 for(const p of Object.values(products)){
  assert.ok(text.includes(`【${p.name}】`),p.name);
  assert.ok(text.includes(`${p.price.toLocaleString('ja-JP')}円／${p.unit}`),p.name+' price');
  for(const item of [...p.includes,...p.excludes])assert.ok(text.includes(item),item);
 }
 for(const marker of ['6,600円','18,000円','29,800円','入会金：0円',
 '60分3,000円（税込）の初回相談・体験は、これから継続的な受講を検討している方向けです',
 '単発・短期の申込みに体験は必須ではありません',
 '掲載の新料金は改定公開後の新規受付が対象です',
 '入学前の学習支援は準備中で、募集は開始していません。料金・教材範囲・質問対応の条件は未確定です',
 'ご自身のAI','全文を扱えるかは利用先・設定によって異なります'])assert.ok(text.includes(marker),marker);
 for(const p of m.pages){assert.equal(hash(source(p.file)),p.html_sha256,p.file+': current source');assert.ok(text.includes('公式URL：'+p.url),p.url);}
 const pre=source('before-university/index.html');
 assert.ok(pre.includes('募集は始めていません')&&pre.includes('料金・質問対応の範囲・開始時期は未確定'));
 assert.ok(!pre.includes('6,500円')&&!pre.includes('6500'));
 assert.ok(pre.includes('noindex,nofollow'));
 const page=source('ai/index.html');
 assert.ok(page.includes('download="economic-tutoring-ai-information.txt"'));
 assert.ok(page.includes('このHP内にAIチャットを設置するものではありません'));
 assert.ok(page.includes('data-copy-ai-question'));
 const date=m.generated_at_jst.slice(0,10).split('-').map(Number);
 assert.ok(page.includes(`${date[0]}年${date[1]}月${date[2]}日`),'displayed snapshot date');
 assert.ok(!/fetch\(|XMLHttpRequest|sendBeacon|localStorage/.test(source('ai-information.js')));
}
verify(meta,pack);
// Fail-closed regression cases: neither updated hashes nor edited metadata may hide contradictions.
const cases=[
 ['missing source',()=>{const m=structuredClone(meta);m.pages.pop();verify(m,pack)}],
 ['source changed',()=>verify(meta,pack,f=>f==='approach/index.html'?read(f)+'changed':read(f))],
 ['pack altered',()=>verify(meta,pack+'changed')],
 ['wrong price with refreshed hash',()=>{const t=pack.replaceAll('6,600円','6,500円');verify({...meta,pack_sha256:hash(t),pack_bytes:Buffer.byteLength(t)},t)}],
 ['unreleased service offered',()=>verify(meta,pack,f=>f==='before-university/index.html'?read(f).replace('募集は始めていません','募集開始しました'):read(f))],
 ['trial eligibility removed',()=>{const t=pack.replaceAll('これから継続的な受講を検討している方向けです','どなたでも利用できます');verify({...meta,pack_sha256:hash(t),pack_bytes:Buffer.byteLength(t)},t)}]
];
for(const [name,fn] of cases)assert.throws(fn,undefined,name);
// Preserve all current approved content except the explicitly scoped pre-university clarification.
const beforeFiles=execFileSync('git',['ls-tree','-r','--name-only',baseline],{cwd:root,encoding:'utf8'}).trim().split('\n');
for(const f of beforeFiles.filter(f=>f.endsWith('.html'))){
 let old=execFileSync('git',['show',baseline+':'+f],{cwd:root,encoding:'utf8'});
 if(f==='before-university/index.html'&&!old.includes('大学入学を控えた高校生など'))old=old.replace('入学前の方に向けた学習サービスを準備・検討しています。','大学入学を控えた高校生など、入学前の方に向けた学習サービスを準備・検討しています。').replace('学びながら出てくる疑問を質問できます。質問の対象・回数・回答方法や目安は未確定です。','学びながら出てくる疑問を質問できる形を検討しています。質問の対象・回数・回答方法や目安は未確定です。');
 let current=read(f);
 if(process.argv.includes('--allow-trial-wording-update')) {
   old=old.replaceAll('継続受講を検討する','これから継続的な受講を検討している');
   if(f==='ai/index.html')old=old.replace(/<time datetime="[^"]+" data-ai-updated>[^<]+<\/time>/,current.match(/<time datetime="[^"]+" data-ai-updated>[^<]+<\/time>/)[0]);
 }
 if(process.argv.includes('--allow-teaching-example-update')&&f==='approach/index.html') {
   const strip=s=>s.replace(/<section class="section section-white" id="teaching-example">[\s\S]*?<\/section>/,'').replace(/<link rel="stylesheet" href="\/(?:proof-example|teaching-example)\.css\?v=1">/,'');
   old=strip(old);current=strip(current);
 }
 assert.equal(current,old,f+': unrelated HTML changed');
}
for(const f of ['site-config.js','script.js','robots.txt','_redirects','styles.css','hp-refresh.css','entry-navigation.css'].filter(f=>beforeFiles.includes(f)))assert.equal(read(f),execFileSync('git',['show',baseline+':'+f],{cwd:root,encoding:'utf8'}),f+': unchanged');
console.log(JSON.stringify({ok:true,baseline,publicSourcePages:54,negativeCases:cases.map(([name])=>name),allSourceHashesMatch:true,pricesAndUnreleasedTermsVerified:true},null,2));
