import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
const ctx={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('site-config.js',root),'utf8'),ctx);
const site=ctx.window.ECONOMIC_TUTORING;
assert.equal(site.products.trial.price,3000);
assert.equal(site.products.support4.price,29800);
assert.equal(site.trialCampaign.maxParticipants,6);
assert.equal(site.trialCampaign.sessionStart,'2026-10-01');
assert.equal(site.trialCampaign.sessionDeadline,'2026-10-20');
const script=fs.readFileSync(new URL('script.js',root),'utf8');
const logic=script.slice(script.indexOf('  const campaign = site.trialCampaign;'),script.indexOf('  document.querySelectorAll("[data-direct-consultation]'));
assert.ok(logic.length>500);
for(const [iso,expected,hidden] of [
 ['2026-09-27T23:59:59+09:00','9/28受付開始予定',false],
 ['2026-09-28T00:00:00+09:00','申込対象期間',false],
 ['2026-09-30T23:59:59+09:00','申込対象期間',false],
 ['2026-10-01T00:00:00+09:00','申込対象期間',false],
 ['2026-10-14T23:59:59+09:00','申込対象期間',false],
 ['2026-10-15T00:00:00+09:00','申込期間は終了',true],
 ['2026-11-01T00:00:00+09:00','申込期間は終了',true]
]) {
 const status={textContent:''},banner={hidden:false},inline={hidden:false},note={textContent:''};
 const selectors={'[data-campaign-status]':[status],'[data-campaign-banner]':[banner],'[data-campaign-inline]':[inline],'[data-campaign-apply-note]':[note]};
 vm.runInNewContext(logic,{site,Date:{now:()=>Date.parse(iso),parse:Date.parse},document:{querySelectorAll:s=>selectors[s]||[]}});
 assert.ok(status.textContent.includes(expected),iso);
 assert.equal(banner.hidden,hidden,iso);
 assert.equal(inline.hidden,hidden,iso);
 if(hidden) assert.ok(note.textContent.includes('通常60分3,000円'));
 else if(Date.parse(iso)>=Date.parse(site.trialCampaign.applicationStartsAt)) assert.ok(note.textContent.includes('合言葉の手入力は不要'));
}
for(const file of ['index.html','pricing.html','instagram/index.html','parents/index.html']) {
 const html=fs.readFileSync(new URL(file,root),'utf8');
 for(const text of ['id="autumn-trial"','2026年9月28日〜10月14日','2026年10月1日〜20日','最大6名','1人1回','通常3,000円','29,800円','併用はできません','自動課金はありません']) assert.ok(html.includes(text),file+': '+text);
 assert.equal((html.match(/id="autumn-trial"/g)||[]).length,1);
}
for(const file of ['universities/sophia/economics-math/index.html','universities/kwansei-gakuin/economics-math/index.html','universities/rikkyo/economics-math/index.html','universities/waseda/microeconomics/index.html','guides/economics-math-basics.html']) {
 const html=fs.readFileSync(new URL(file,root),'utf8');
 assert.ok(html.includes('data-campaign-inline'),file);
 assert.ok(html.includes('秋学期スタートキャンペーンは条件付き0円'),file);
 assert.ok(html.includes('申込2026年9/28〜10/14・実施10/1〜20'),file);
 assert.ok(!/初回相談・体験(?:：|は)60分/.test(html),file);
 assert.ok(!html.includes('フォームの「現在困っていること」またはDMへ'),file);
}
console.log('PASS: campaign dates (JST), static terms, normal prices, selection instructions, inline notices, and expiry behavior.');
