// Read-only release gate for the owner-approved 2026-10-10 role explanations.
// Usage: node tools/verify-support-distinction.mjs [737edeb] [--public]
// Optional: --public-base=https://economic-tutoring.pages.dev/
// This gate does not authorize later product/copy changes. Update its reviewed
// copy fingerprints only after a new explicit approval and independent review.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {siteFiles} from './site-files.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const baseline = args.find(arg => !arg.startsWith('--')) || '737edeb';
const publicBase = new URL(args.find(arg => arg.startsWith('--public-base='))?.slice(14) || 'https://economic-tutoring.pages.dev/');
const hash = data => createHash('sha256').update(data).digest('hex');
const readBytes = file => fs.readFileSync(path.join(root, file));
const read = file => readBytes(file).toString('utf8');
const git = (...args) => execFileSync('git', args, {cwd:root});
const oldBytes = file => git('show', `${baseline}:${file}`);
const old = file => oldBytes(file).toString('utf8');
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const sorted = values => [...values].sort();
const issues = [];
const check = (pass, message) => {if (!pass) issues.push(message);};
const normalizeVersion = html => html.replaceAll('site-config.js?v=32', 'site-config.js?v=31');
const main = html => html.match(/<main\b[^>]*>[\s\S]*?<\/main>/)?.[0] || '';
const sectionPattern = id => new RegExp(`<section\\b[^>]*\\bid="${id}"[^>]*>[\\s\\S]*?<\\/section>`, 'g');
const section = (html, id) => [...html.matchAll(sectionPattern(id))].map(match => match[0]);
const sections = {
  'index.html': ['services'],
  'pricing.html': ['compare', 'single', 'monthly', 'faq'],
  'web-learning.html': ['paths', 'showcase']
};
// Independent reading review found only approved role-copy changes in these
// exact blocks: no new fees, entitlements, restrictions or outcome promises.
// Pinning the reviewed blocks makes new claims fail even inside allowed areas.
const reviewedSections = {
  'index.html#services': '3b055d359e12a32dd0c86a3cfd5c5f3d5adf8d88777e18e833f2c2a9df8752ad',
  'pricing.html#compare': '9407b3cc34ef502b413dda7955a5a323980639a04681d8fd8c28f6e2c55fed4d',
  'pricing.html#single': '10f7aa9787e9ba72422f67b10d931067d6fe4c1af7f44478f5b2bc86da35611a',
  'pricing.html#monthly': '86a57ca81d55ad8e8da2e4bb6997f9e8e56ff179490a784f5e0dfb67a5464399',
  'pricing.html#faq': '91d742aa74866019a59c2e1fd866f5bd41efc2e1a443c87f1a7c97a932428914',
  'web-learning.html#paths': '6165d93e2d0a29c0abcc5bfbc1e445577cb178d0356b061a8e4fed9a5058ae6a',
  'web-learning.html#showcase': '646fbbd3a33da96f9c9b727d9c57c2754527f5806e9561b6a347efa68d30b746'
};
const reviewedAiMain = '600e2fe4f8c55994762014cc20f1d767badebb6990c8c2a3a592d4f3f43277d4';
const reviewedBuilder = '1278cfcaa901703346b020f6a0b7be9f3cda25573651d06ae1e5aa9de8074ad3';
const reviewedPackPrefix = 'c2cfc6bc6236ec97fee2452c5af9291d97a6e53090d10323952a53c4557abec2';
const unchangedAutomation = 'e22a45075e5446309d9d3104fe906d27e7da8e8811820e18c97680cd2fe17e88';
const summaries = {
  single: 'ご本人が持ち込む分からない問題・単元を中心に、その回の説明・練習・理解確認を進めます。',
  support4: '本人と合意したゴールへ、講師が1科目の月間計画を立て、授業・授業外の質問対応・普段の学習管理をつなげて進めます。受講者専用学習環境で取り組みと理解を確認し、次回授業へ反映します。',
  support8: '本人と合意したゴールへ、講師が最大2科目の週単位計画と優先順位を立て、授業・授業外の質問対応・普段の学習管理をつなげて進めます。取り組みと理解に合わせて計画・次回授業を調整します。'
};
const loadConfig = source => {
  const context = {window:{}};
  vm.runInNewContext(source, context, {timeout:1000});
  return JSON.parse(JSON.stringify(context.window.ECONOMIC_TUTORING));
};
const config = loadConfig(read('site-config.js'));
const beforeConfig = loadConfig(old('site-config.js'));
const configWithoutSummaries = value => {
  const copy = structuredClone(value);
  for (const key of Object.keys(summaries)) copy.products[key].summary = '[approved summary]';
  return copy;
};
const sourceWithoutSummaries = (source, value) => {
  for (const key of Object.keys(summaries)) {
    const needle = `summary: ${JSON.stringify(value.products[key].summary)}`;
    check(source.split(needle).length === 2, `site-config: summary occurrence ${key}`);
    source = source.replace(needle, `summary: "[approved ${key} summary]"`);
  }
  return source;
};
check(Object.keys(config.products).length === 7, 'products: expected exactly seven');
check(same(configWithoutSummaries(config), configWithoutSummaries(beforeConfig)), 'config: non-summary product/price/scope/benefit/function fields changed');
check(sourceWithoutSummaries(read('site-config.js'), config) === sourceWithoutSummaries(old('site-config.js'), beforeConfig), 'config: executable source changed outside three summaries');
for (const [key, value] of Object.entries(summaries)) check(config.products[key].summary === value, `config: expected approved ${key} explanation`);

const baselineFiles = git('ls-tree', '-r', '--name-only', baseline).toString('utf8').trim().split('\n').filter(Boolean);
const baselineHtml = sorted(baselineFiles.filter(file => file.endsWith('.html')));
const files = sorted(siteFiles(root));
check(files.length === 53 && same(files, baselineHtml), 'pages: exact original 53-page publication inventory');
const pages = new Map();
const changedHtml = [];
let versionedPages = 0;
let unchangedUniversityPages = 0;
let guideBodies = 0;
let structuredDataBlocks = 0;
let formReferences = 0;
const references = html => [...normalizeVersion(html).matchAll(/\b(?:href|src|action)="[^"]*"/g)].map(match => match[0]);
const jsonLd = html => [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g)].map(match => match[0]);
const stripApproved = (html, file) => {
  let result = normalizeVersion(html);
  for (const id of sections[file] || []) result = result.replace(sectionPattern(id), `[approved section ${id}]`);
  if (file === 'ai/index.html') result = result.replace(/<main\b[^>]*>[\s\S]*?<\/main>/, '[approved AI instructions]');
  return result;
};
for (const file of baselineHtml) {
  const html = read(file);
  const previous = old(file);
  pages.set(file, html);
  if (html !== previous) changedHtml.push(file);
  const oldVersions = [...previous.matchAll(/site-config\.js\?v=31/g)];
  const newVersions = [...html.matchAll(/site-config\.js\?v=32/g)];
  if (oldVersions.length) {
    check(oldVersions.length === 1 && newVersions.length === 1 && !html.includes('site-config.js?v=31'), `${file}: existing v31 must become exactly one v32`);
    versionedPages++;
  } else check(newVersions.length === 0, `${file}: previously unversioned reference must remain unchanged`);
  check(stripApproved(html, file) === stripApproved(previous, file), `${file}: HTML outside approved role explanations/config version changed`);
  check(same(references(html), references(previous)), `${file}: form/SNS/asset/link references changed`);
  check(same(jsonLd(html), jsonLd(previous)), `${file}: structured data changed`);
  structuredDataBlocks += jsonLd(html).length;
  formReferences += [...html.matchAll(/https:\/\/docs\.google\.com\/forms\/[^"\s<]+/g)].length;
  for (const id of sections[file] || []) {
    const current = section(html, id);
    check(current.length === 1 && section(previous, id).length === 1, `${file}#${id}: section count`);
    check(hash(current[0] || '') === reviewedSections[`${file}#${id}`], `${file}#${id}: diverged from independently reviewed copy; new claims/conditions not authorized`);
  }
  if (file.startsWith('universities/')) {
    check(html === previous, `${file}: university HTML must remain byte-identical`);
    unchangedUniversityPages++;
  }
  if (file.startsWith('guides/') && file !== 'guides/index.html') {
    const body = value => value.match(/<article class="guide-article">[\s\S]*?<\/article>/)?.[0] || '';
    check(body(html) !== '' && body(html) === body(previous), `${file}: original guide article changed`);
    guideBodies++;
  }
}
check(versionedPages === 22 && unchangedUniversityPages === 31 && guideBodies === 9, 'expected 22 version bumps, 31 unchanged university pages and nine guide bodies');
check(hash(main(pages.get('ai/index.html'))) === reviewedAiMain, 'AI page: diverged from reviewed template/example/metadata copy');

// In addition to the reviewed fingerprints, prove that the generated product
// detail blocks, lessonless cards and all pre-existing contractual FAQs remain
// exactly as before after masking only the three approved summary paragraphs.
const detailsPattern = /<div class="hub-plan-details reveal" data-plan-details="[^"]+">[\s\S]*?<\/div><!-- \/site:plans -->/g;
const maskSummaryParagraphs = (source, value) => {
  for (const key of Object.keys(summaries)) source = source.replace(`<p>${value.products[key].summary}</p>`, `<p>[${key} summary]</p>`);
  return source;
};
const pricing = pages.get('pricing.html');
const beforePricing = old('pricing.html');
const details = [...pricing.matchAll(detailsPattern)].map(match => maskSummaryParagraphs(match[0], config));
const oldDetails = [...beforePricing.matchAll(detailsPattern)].map(match => maskSummaryParagraphs(match[0], beforeConfig));
check(details.length === 3 && same(details, oldDetails), 'pricing: all seven generated products/scopes/optional paid addon preserved');
const cards = source => [...source.matchAll(/<article class="service-card">[\s\S]*?<\/article>/g)].map(match => match[0]);
for (const [file, id, index] of [['index.html','services',2], ['pricing.html','compare',2], ['web-learning.html','paths',1]]) {
  check(cards(section(pages.get(file), id)[0])[index] === cards(section(old(file), id)[0])[index], `${file}: lessonless course card changed`);
}
const faqItems = source => [...section(source, 'faq')[0].matchAll(/<details>[\s\S]*?<\/details>/g)].map(match => match[0]);
check(same(faqItems(pricing).slice(3), faqItems(beforePricing).slice(2)), 'pricing: existing course/addon/payment/no-guarantee FAQs changed');
check(pricing.includes('別料金の任意追加') || pricing.includes('必須ではありません。月額伴走中、必要な科目だけに1科目あたり月額5,500円で追加できます。'), 'optional paid quiz boundary missing');

// Protect every existing file (including old verification gates, data,
// templates, CSS and JS), not just selected public assets.
const approvedFiles = new Set([...Object.keys(sections), 'ai/index.html', 'site-config.js', 'README.md',
  'tools/build-ai-information.py', 'tools/render-static.mjs',
  'downloads/economic-tutoring-ai-information.txt', 'downloads/economic-tutoring-ai-sources.json']);
const protectedFiles = baselineFiles.filter(file => !file.endsWith('.html') && !approvedFiles.has(file));
for (const file of protectedFiles) check(fs.existsSync(path.join(root, file)) && readBytes(file).equals(oldBytes(file)), `${file}: protected existing asset/tool/data changed`);
const trackedNow = git('ls-files').toString('utf8').trim().split('\n');
check(trackedNow.every(file => baselineFiles.includes(file) || file === 'tools/verify-support-distinction.mjs'), 'unapproved new tracked deployment file');
check(read('tools/render-static.mjs') === old('tools/render-static.mjs').replaceAll('site-config.js?v=31', 'site-config.js?v=32'), 'renderer: changed beyond cache version replacement');
const builderApproved = hash(readBytes('tools/build-ai-information.py')) === reviewedBuilder;
check(builderApproved, 'builder: changed beyond reviewed explanatory prose');
const maskJapaneseBlocks = source => source.replace(/((?:f|r|u|b)?)("""|''')([\s\S]*?)\2/g, (whole, prefix, quote, body) => {
  if (!/[ぁ-んァ-ン一-龥]/.test(body)) return whole;
  const expressions = [...body.matchAll(/\{[^{}\n]*\}/g)].map(match => match[0]);
  return `${prefix}${quote}[reviewed prose]${expressions.join('')}${quote}`;
});
check(maskJapaneseBlocks(read('tools/build-ai-information.py')) === maskJapaneseBlocks(old('tools/build-ai-information.py')), 'builder: executable logic/interpolations changed');
const readme = read('README.md');
const newReadmeParagraph = /^2026-10-10の単発と伴走の説明：[^\n]+\n\n/gm;
check([...readme.matchAll(newReadmeParagraph)].length === 1 && readme.replace(newReadmeParagraph, '') === old('README.md'), 'README: changed outside one initial operation note');

let aiReport = null;
try {
  const pack = read('downloads/economic-tutoring-ai-information.txt');
  const meta = JSON.parse(read('downloads/economic-tutoring-ai-sources.json'));
  const beforeMeta = JSON.parse(old('downloads/economic-tutoring-ai-sources.json'));
  check(meta.page_count === 51 && meta.guide_count === 9 && meta.product_count === 7 && meta.pages.length === 51, 'AI: 51 pages / nine guides / seven products');
  check(same(meta.pages.map(p => [p.file,p.url,p.title]), beforeMeta.pages.map(p => [p.file,p.url,p.title])), 'AI: original public inventory/titles/official URLs changed');
  const stableMetadata = value => Object.fromEntries(Object.entries(value).filter(([key]) => !['generated_at_jst','source_base_commit','config_sha256','pack_sha256','pack_bytes','pages'].includes(key)));
  check(same(stableMetadata(meta), stableMetadata(beforeMeta)), 'AI: scope/limitations/other metadata changed');
  check(hash(pack) === meta.pack_sha256 && Buffer.byteLength(pack) === meta.pack_bytes, 'AI: pack hash/bytes do not match manifest');
  check(hash(readBytes('site-config.js')) === meta.config_sha256, 'AI: stale configuration hash');
  const prefix = pack.split('\n第3部｜公式HPの公開本文・関連リンク\n')[0].replace(/^作成日時：[^\n]+/m, '作成日時：[snapshot]');
  check(hash(prefix) === reviewedPackPrefix, 'AI: reviewed service/owner-clarification text changed; new conditions or guarantees not authorized');
  // Import only the exact reviewed exporter, with its write-producing main()
  // never called. An altered builder must not be executed by a read-only gate.
  if (!builderApproved) throw new Error('unreviewed exporter will not be executed');
  const exported = JSON.parse(execFileSync('python3', ['-B', '-c',
    `import json,runpy,sys\nfrom pathlib import Path\nfrom urllib.parse import urljoin\nm=runpy.run_path('tools/build-ai-information.py',run_name='readonly_review')\nresult=[]\nfor file in json.load(sys.stdin):\n p=m['PublicText'](); p.feed(Path(file).read_text(encoding='utf-8')); p.close()\n result.append({'file':file,'text':p.result(),'title':''.join(p.title_parts).strip(),'url':p.canonical,'links':list(dict.fromkeys(urljoin(p.canonical,h) for h in p.links))})\nprint(json.dumps(result,ensure_ascii=False))`],
    {cwd:root, input:JSON.stringify(meta.pages.map(p => p.file)), encoding:'utf8', maxBuffer:5*1024*1024,
      env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}}));
  let currentHashes = 0;
  const publicPartHeader = '\n第3部｜公式HPの公開本文・関連リンク\n';
  const expectedPublicParts = [publicPartHeader + '目次（51ページ）\n'];
  for (const [index,page] of meta.pages.entries()) {
    expectedPublicParts.push(`${String(index+1).padStart(2,'0')}. ${page.title}\n    ${page.url}\n`);
  }
  for (const [index, page] of meta.pages.entries()) {
    const current = exported[index];
    const matches = pages.has(page.file) && hash(readBytes(page.file)) === page.html_sha256;
    check(matches, `AI: stale source HTML hash ${page.file}`);
    if (matches) currentHashes++;
    check(hash(current.text) === page.text_sha256 && current.title === page.title && current.url === page.url, `AI: current public text/title/canonical mismatch ${page.file}`);
    const fullEntry = `\n${'='.repeat(50)}\n資料 ${String(index+1).padStart(2,'0')}｜${page.title}\n公式URL：${page.url}\n本文\n${current.text}\n\n本文内のリンク（同一ページ内へのリンクを含む）\n\n${current.links.map(link => '・'+link+'\n').join('\n')}`;
    check(pack.includes(fullEntry), `AI: exported full body/links differ from current HTML ${page.file}`);
    expectedPublicParts.push(`\n${'='.repeat(50)}\n資料 ${String(index+1).padStart(2,'0')}｜${page.title}\n公式URL：${page.url}\n本文\n${current.text}\n\n本文内のリンク（同一ページ内へのリンクを含む）\n`);
    expectedPublicParts.push(...current.links.map(link => '・'+link+'\n'));
    if (!['index.html','pricing.html','web-learning.html'].includes(page.file)) {
      check(page.text_sha256 === beforeMeta.pages.find(p => p.file === page.file)?.text_sha256, `AI: unapproved public body change ${page.file}`);
    }
  }
  check(pack.indexOf(publicPartHeader) >= 0 && pack.slice(pack.indexOf(publicPartHeader)) === expectedPublicParts.join('\n'), 'AI: extra, missing, reordered or modified text beyond exact 51 public pages/links');
  const generatedDate = meta.generated_at_jst.slice(0,10);
  const displayed = pages.get('ai/index.html').match(/<time datetime="([^"]+)" data-ai-updated>([^<]+)<\/time>/);
  check(displayed?.[1] === generatedDate && displayed?.[2] === `${Number(generatedDate.slice(0,4))}年${Number(generatedDate.slice(5,7))}月${Number(generatedDate.slice(8,10))}日`, 'AI: displayed update date not synchronized');
  const timestamp = pack.match(/^作成日時：([^\n]+)（日本時間）$/m)?.[1];
  check(timestamp && Math.floor(Date.parse(timestamp)/1000) === Math.floor(Date.parse(meta.generated_at_jst)/1000), 'AI: pack and manifest creation time not synchronized');
  check(/^[0-9a-f]{40}$/.test(meta.source_base_commit), 'AI: invalid source base commit');
  execFileSync('git',['merge-base','--is-ancestor',baseline,meta.source_base_commit],{cwd:root});
  execFileSync('git',['merge-base','--is-ancestor',meta.source_base_commit,'HEAD'],{cwd:root});
  for (const product of Object.values(config.products)) {
    check(pack.includes(`【${product.name}】`) && pack.includes(`${product.price.toLocaleString('ja-JP')}円／${product.unit}`) && pack.includes(product.summary), `AI: complete current product/price/summary ${product.name}`);
    for (const item of [...product.includes,...product.excludes]) check(pack.includes(item), `AI: product scope missing ${product.name} / ${item}`);
  }
  for (const marker of ['複数回利用することもできます','回数だけで伴走へ切り替えるものではありません',
    'ご本人と合意した目標','計画と優先順位を設計','日々の学習・課題・進捗確認',
    '指導方針は単発・伴走で共通','自分で使える形への定着を目指します',
    '即時返信・無制限質問を保証するものではありません',
    '月額伴走の基本料金に有料小テストが無条件で含まれるわけではありません',
    '通常3,000円','最大6名','期間外・対象外は通常料金','本人同意',
    '申込み送信＝日程確定・契約成立ではありません','ご自身のAI','資料にない実績・料金・対応可否・空き枠を作らない']) {
    check(pack.includes(marker), `AI: expected role/quality/contract boundary missing ${marker}`);
  }
  check(!/\/Users\/|funnel\.csv|IN_PROGRESS|IMG_43|返信遅延/.test(pack), 'AI: internal/customer material exposed');
  check(!/fetch\(|XMLHttpRequest|sendBeacon|localStorage/.test(read('ai-information.js')), 'AI: uploads/chat/tracking added');
  aiReport = {publicPages:51, originalGuides:9, products:7, currentHtmlHashes:currentHashes,
    completeCurrentPublicBodiesAndLinks:exported.length, packBytes:meta.pack_bytes,
    packSha256:meta.pack_sha256, synchronizedDate:generatedDate};
} catch (error) {issues.push(`AI snapshot: ${error.message}`);}

try {
  const controlBytes = readBytes('../economic-tutoring-growth/automation-control.json');
  const control = JSON.parse(controlBytes);
  check(hash(controlBytes) === unchangedAutomation, 'automation: owner-paused local control changed during this release');
  check(control.mode === 'PAUSED_BY_OWNER' && control.owner_pause.automatic_resume_allowed === false
    && control.owner_pause.resume_requires_explicit_owner_request === true, 'automation: owner pause/explicit resumption boundary not retained');
} catch (error) {issues.push(`automation local non-change check: ${error.message}`);}

const ok = issues.length === 0;
console.log(JSON.stringify({ok, baseline, checkedAt:new Date().toISOString(), htmlPages:files.length,
  changedHtmlPages:changedHtml.length, configVersionBumps:versionedPages,
  unchangedUniversityPages, preservedGuideBodies:guideBodies, preservedStructuredDataBlocks:structuredDataBlocks,
  preservedFormReferences:formReferences, protectedExistingFiles:protectedFiles.length,
  ownerAutomationPause:'local control unchanged; no external automation service read or write',
  reviewedCopyBoundaries:'specific approved blocks pinned; new guarantees, restrictions and entitlements rejected',
  aiInformation:aiReport, issues},null,2));
if (!ok) process.exitCode = 1;

if (ok && args.includes('--public')) {
  const publicFiles = [...changedHtml, 'site-config.js', 'downloads/economic-tutoring-ai-information.txt', 'downloads/economic-tutoring-ai-sources.json'];
  const results = [];
  for (let start=0; start<publicFiles.length; start+=4) {
    await Promise.all(publicFiles.slice(start,start+4).map(async file => {
      const route = `/${file.replace(/index\.html$/,'').replace(/\.html$/,'')}`;
      const url = new URL(route, publicBase);
      if (file === 'site-config.js') url.search='?v=32';
      try {
        const response = await fetch(url,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(20000)});
        const bytes = Buffer.from(await response.arrayBuffer());
        results.push({file,route:url.pathname+url.search,status:response.status,matches:bytes.equals(readBytes(file)),bytes:bytes.length,sha256:hash(bytes)});
      } catch (error) {results.push({file,route:url.pathname+url.search,error:error.message,matches:false});}
    }));
  }
  const publicOk = results.every(item => item.status === 200 && item.matches);
  console.log(JSON.stringify({public:true,ok:publicOk,checkedAt:new Date().toISOString(),base:publicBase.href,results},null,2));
  if (!publicOk) process.exitCode=1;
}
