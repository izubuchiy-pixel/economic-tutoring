// Local-only regression checks for the 2026-10-28 supplemental consultation scope.
// This check never publishes, edits Google Forms, or reads customer records.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {siteFiles} from './site-files.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const baseline = process.argv[2] || 'bc254a18c9a3506777c62bc9e818f08f3f0173e7';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const previous = file => execFileSync('git', ['show', `${baseline}:${file}`], {cwd:root, encoding:'utf8'});
const sha = data => createHash('sha256').update(data).digest('hex');
const changedPages = new Set(['index.html', 'subjects.html', 'pricing.html', 'ai/index.html']);
const files = siteFiles(root);
assert.equal(files.length, 53);
let preservedPages = 0;
for (const file of files) {
  const html = read(file);
  if (!changedPages.has(file)) {
    assert.equal(html, previous(file), `${file}: unrelated page changed`);
    preservedPages++;
  }
  const data = text => [...text.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
  assert.deepEqual(data(html), data(previous(file)), `${file}: structured data changed`);
  assert.equal((html.match(/class="contact-form-button"/g)||[]).length,
    (previous(file).match(/class="contact-form-button"/g)||[]).length, `${file}: duplicate form entry`);
  if (changedPages.has(file)) {
    assert.ok(html.includes('id="learner-contact"'), `${file}: inclusive contact missing`);
    for (const value of ['社会人・大学院生の方も、同じフォームから。', '本人（学生以外）', '大学院生・専門職大学院生は「学生本人」', '学校情報は在学中の方のみ'])
      assert.ok(html.includes(value), `${file}: current form guidance missing ${value}`);
    assert.ok(!html.includes('当てはまらない方は無理に選ばず'), `${file}: retired form workaround remains`);
    assert.ok(html.includes('会社名・年齢は不要'), `${file}: unnecessary personal data`);
    assert.ok(html.includes('class="nav-cta" href="#contact"'), `${file}: header bypasses contact routing`);
    for (const link of [...html.matchAll(/href="(mailto:[^"]+)"/g)]) {
      const url = new URL(link[1]);
      assert.equal(url.pathname, 'economic.tutoring.office@gmail.com');
      const body = url.searchParams.get('body');
      for (const value of ['学習の目的', '科目・教材名', '現在困っていること', '期限', '在学中の方のみ'])
        assert.ok(body.includes(value), `${file}: missing intake information ${value}`);
      assert.ok(!body.includes('会社名') && !body.includes('年齢'));
    }
  }
}
for (const file of ['site-config.js','script.js','styles.css','hp-refresh.css','site-polish.css',
  'robots.txt','sitemap.xml','sitemap.txt','terms.html','privacy.html','tokusho.html'])
  assert.equal(read(file), previous(file), `${file}: price/contract/runtime/settings changed`);
const tracked = execFileSync('git',['ls-tree','-r','--name-only','HEAD'],{cwd:root,encoding:'utf8'}).split('\n');
assert.equal(fs.existsSync(path.join(root,'_redirects')), tracked.includes('_redirects'), 'redirect configuration added/removed');
if (tracked.includes('_redirects')) assert.equal(read('_redirects'),previous('_redirects'));
const ctx = {window:{}};
vm.runInNewContext(read('site-config.js'), ctx);
const config = ctx.window.ECONOMIC_TUTORING;
assert.equal(Object.keys(config.products).length, 7);
assert.equal(config.trialCampaign, null);
for (const key of ['single','monthly','learning-check-course','referral','compare']) {
  const section = html => html.match(new RegExp(`<section[^>]*id="${key}"[\\s\\S]*?<\\/section>`))?.[0];
  assert.equal(section(read('pricing.html')), section(previous('pricing.html')), `pricing #${key}: changed`);
}
for (const key of ['micro','macro','statistics','econometrics','mathematics']) {
  const detail = html => html.match(new RegExp(`<details id="${key}"[\\s\\S]*?<\\/details>`))?.[0];
  assert.equal(detail(read('subjects.html')), detail(previous('subjects.html')), `subject ${key}: changed`);
}
const subjects = read('subjects.html');
for (const value of ['id="learner-scope"','経済学部以外','MBA・専門職大学院','統計検定2級',
  '市場と経済の分析','数量分析と確率・統計','担当講師が対応できる範囲','講師全員がすべての分野に対応するわけではありません',
  '研究の分析設計','業務データの解析代行','論文・課題の代筆','試験中の解答支援',
  '単位取得・成績・資格合格は保証しません','https://www.saa.or.jp/publication/pdf/lv1_studyguide.pdf',
  'https://www.toukei-kentei.jp/grade/grade2/','2026年10月28日']) assert.ok(subjects.includes(value), value);
assert.ok(read('index.html').includes('大学生のための 経済学・統計学専門サポート'));
assert.ok(read('index.html').includes('href="/subjects#learner-scope"'));
assert.ok(read('subjects.html').includes('class="hub-mobile-cta" href="#contact"'));
assert.ok(!/社会人に人気|需要が急増|合格保証プラン|資格専門校です/.test(subjects));

const manifest = JSON.parse(read('downloads/economic-tutoring-ai-sources.json'));
const pack = read('downloads/economic-tutoring-ai-information.txt');
assert.equal(manifest.page_count, 51);
assert.equal(manifest.guide_count, 9);
assert.equal(manifest.product_count, 7);
assert.equal(sha(pack), manifest.pack_sha256);
assert.equal(sha(read('site-config.js')), manifest.config_sha256);
for (const page of manifest.pages) assert.equal(sha(read(page.file)), page.html_sha256, page.file);
for (const value of ['社会人という理由で別料金にはせず','研究の分析設計','本人（学生以外）','学校・期限欄は任意','既存の初回相談フォームから相談できます'])
  assert.ok(pack.includes(value), `AI scope missing ${value}`);
assert.ok(!/フォームが社会人向けへ変更済みと解釈しない|当てはまらない方は既存のInstagram DMまたはメールから/.test(pack), 'AI pack has retired form workaround');
for (const product of Object.values(config.products)) {
  assert.ok(pack.includes(`【${product.name}】`));
  assert.ok(pack.includes(`${product.price.toLocaleString('ja-JP')}円／${product.unit}`));
}
assert.ok(!/\/Users\/|funnel\.csv|trial-followup-|learner_contract_receipt_links/.test(pack), 'private content in public download');
console.log(JSON.stringify({ok:true,baseline:execFileSync('git',['rev-parse',baseline],{cwd:root,encoding:'utf8'}).trim(),
  pages:53,changedPages:[...changedPages],preservedPages,productsUnchanged:7,guideBodiesUnchanged:9,
  aiSourcePages:51,aiBytes:Buffer.byteLength(pack),aiSha256:sha(pack),
  contractsAndRuntimeUnchanged:true,newForms:0,newTracking:0,externalWrites:0,
  checkedAt:new Date().toISOString()},null,2));
