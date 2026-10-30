// Strict scope check for the two owner-approved 2026-10-30 HP fixes.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {siteFiles} from './site-files.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const baseline = '8c1494a36d4777b4df4286c0162a7d31d8791d8d';
const bytes = file => fs.readFileSync(root + file);
const read = file => bytes(file).toString('utf8');
const old = file => execFileSync('git', ['show', `${baseline}:${file}`], {cwd:root});
const sha = value => createHash('sha256').update(value).digest('hex');
const heading = ['微分はできるのに、最適化で止まる理由', '経済数学、どこから復習する？'];
const description = ['何を変数として、何を最大にするのかを整理します。', '式変形・微分・最適化。必要なところから復習できます。'];
const oldIcon = '  <link rel="icon" href="/favicon.svg" type="image/svg+xml">';
const newIcon = '  <link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">\n  <link rel="icon" href="/favicon.png" type="image/png" sizes="96x96">\n  <link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any">';
assert.equal(read('index.html'), old('index.html').toString().replace(oldIcon,newIcon)
  .replace(heading[0],heading[1]).replace(description[0],description[1]), 'Only approved home-page replacements allowed');
assert.ok([...heading[1] + description[1]].length <= [...heading[0] + description[0]].length, 'Card text must not grow');
const pages = siteFiles(root);
assert.equal(pages.length,53);
for (const file of pages.filter(file=>file!=='index.html')) assert.deepEqual(bytes(file),old(file),file);
// All other pre-existing public assets/configuration retain exact bytes.
const allowed = new Set(['index.html','downloads/economic-tutoring-ai-information.txt','downloads/economic-tutoring-ai-sources.json','README.md','tools/preview.mjs','tools/verify-http.mjs']);
const tracked = execFileSync('git',['ls-tree','-r','--name-only',baseline],{cwd:root,encoding:'utf8'}).trim().split('\n');
for (const file of tracked.filter(file=>!allowed.has(file))) assert.deepEqual(bytes(file),old(file),file);
const stripDate = text => text.replace(/^作成日時：.*$/m,'作成日時：');
assert.equal(stripDate(read('downloads/economic-tutoring-ai-information.txt')),
  stripDate(old('downloads/economic-tutoring-ai-information.txt').toString()).replace(heading[0],heading[1]).replace(description[0],description[1]));
const manifest = JSON.parse(read('downloads/economic-tutoring-ai-sources.json'));
const priorManifest = JSON.parse(old('downloads/economic-tutoring-ai-sources.json'));
assert.equal(manifest.page_count,51);
assert.equal(manifest.guide_count,9);
assert.equal(manifest.product_count,7);
assert.equal(manifest.pack_sha256,sha(bytes('downloads/economic-tutoring-ai-information.txt')));
assert.equal(manifest.config_sha256,sha(bytes('site-config.js')));
for (const page of manifest.pages) {
  assert.equal(page.html_sha256,sha(bytes(page.file)),page.file);
  if (page.file!=='index.html') assert.deepEqual(page,priorManifest.pages.find(p=>p.file===page.file));
}
const png = bytes('favicon.png');
assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
assert.equal(png.readUInt32BE(16),96);
assert.equal(png.readUInt32BE(20),96);
const ico = bytes('favicon.ico');
assert.equal(ico.readUInt16LE(0),0);
assert.equal(ico.readUInt16LE(2),1);
assert.equal(ico.readUInt16LE(4),3);
for (const [i,size] of [16,32,48].entries()) {
  const start=6+i*16, length=ico.readUInt32LE(start+8), offset=ico.readUInt32LE(start+12);
  assert.equal(ico[start],size);
  assert.equal(ico[start+1],size);
  assert.ok(offset+length<=ico.length);
  const image=ico.subarray(offset,offset+length);
  assert.equal(image.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(image.readUInt32BE(16),size);
  assert.equal(image.readUInt32BE(20),size);
}
const report = {ok:true,baseline,changedHtmlPages:1,unchangedHtmlPages:52,guideBodiesUnchanged:9,
  productsUnchanged:7,cardTextCharactersBefore:[...heading[0]+description[0]].length,
  cardTextCharactersAfter:[...heading[1]+description[1]].length,pngSize:96,icoSizes:[16,32,48],
  existingSvgUnchanged:true,aiSourcePages:51,formsAndNotificationSettingsChanged:false,
  checkedAt:new Date().toISOString()};
if (process.argv.includes('--public')) {
  report.public=[];
  for (const [route,file] of [['/','index.html'],['/favicon.ico','favicon.ico'],['/favicon.png','favicon.png'],['/favicon.svg','favicon.svg']]) {
    const res=await fetch('https://economic-tutoring.pages.dev'+route,{signal:AbortSignal.timeout(20000),headers:{'Cache-Control':'no-cache'}});
    const received=Buffer.from(await res.arrayBuffer());
    report.public.push({route,status:res.status,contentType:res.headers.get('content-type'),matches:sha(received)===sha(bytes(file)),sha256:sha(received)});
  }
  assert.ok(report.public.every(row=>row.status===200 && row.matches),'Live release differs from approved local files');
}
console.log(JSON.stringify(report,null,2));
if (process.argv.includes('--report')) {
  const target=process.argv[process.argv.indexOf('--report')+1];
  assert.ok(target && target.endsWith('.json'));
  fs.writeFileSync(target,JSON.stringify(report,null,2)+'\n');
}
