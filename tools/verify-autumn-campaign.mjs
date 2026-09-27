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
const script=fs.readFileSync(new URL('script.js',root),'utf8');
const logic=script.slice(script.indexOf('  const campaign = site.trialCampaign;'),script.indexOf('  document.querySelectorAll("[data-direct-consultation]'));
assert.ok(logic.length>500);
for(const [iso,expected,hidden] of [
 ['2026-09-30T23:59:59+09:00','10/1受付開始予定',false],
 ['2026-10-01T00:00:00+09:00','申込対象期間',false],
 ['2026-10-14T23:59:59+09:00','申込対象期間',false],
 ['2026-10-15T00:00:00+09:00','申込期間は終了',true],
 ['2026-11-01T00:00:00+09:00','申込期間は終了',true]
]) {
 const status={textContent:''},banner={hidden:false},note={textContent:''};
 const selectors={'[data-campaign-status]':[status],'[data-campaign-banner]':[banner],'[data-campaign-apply-note]':[note]};
 vm.runInNewContext(logic,{site,Date:{now:()=>Date.parse(iso),parse:Date.parse},document:{querySelectorAll:s=>selectors[s]||[]}});
 assert.ok(status.textContent.includes(expected),iso);
 assert.equal(banner.hidden,hidden,iso);
 if(hidden) assert.ok(note.textContent.includes('通常60分3,000円'));
}
for(const file of ['index.html','pricing.html','instagram/index.html','parents/index.html']) {
 const html=fs.readFileSync(new URL(file,root),'utf8');
 for(const text of ['id="autumn-trial"','2026年10月1日〜14日','10月20日','最大6名','1人1回','通常3,000円','29,800円','併用はできません','自動課金はありません']) assert.ok(html.includes(text),file+': '+text);
 assert.equal((html.match(/id="autumn-trial"/g)||[]).length,1);
}
console.log('PASS: campaign dates (JST), static terms, normal prices, and expiry behavior.');
