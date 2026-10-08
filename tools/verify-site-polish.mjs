// Read-only verification for the 2026-10-09 presentation-only refresh.
// Usage: node tools/verify-site-polish.mjs [baseline] [--public]
// Optional: --public-base=https://economic-tutoring.pages.dev/
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {siteFiles} from './site-files.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const baseline = args.find(arg => !arg.startsWith('--')) || 'a5948e1';
const publicBase = new URL(args.find(arg => arg.startsWith('--public-base='))?.slice(14) || 'https://economic-tutoring.pages.dev/');
const verifyPublic = args.includes('--public');
const cssFile = 'site-polish.css';
const footerPattern = /<!-- site:footer -->[\s\S]*?<!-- \/site:footer -->/g;
const polishLinkLine = /^[\t ]*<link\b[^>]*\bhref=["']\/site-polish\.css(?:\?[^"']*)?["'][^>]*>[\t ]*\r?\n/gm;
const readBytes = file => fs.readFileSync(path.join(root, file));
const read = file => readBytes(file).toString('utf8');
const previousBytes = file => execFileSync('git', ['show', `${baseline}:${file}`], {cwd:root});
const previous = file => previousBytes(file).toString('utf8');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const issues = [];
const check = (value, label) => {if (!value) issues.push(label);};
const sorted = values => [...values].sort();
const identical = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const textOnly = html => html.replace(/<[^>]*>/g, '').trim();
const anchors = html => [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
  .map(match => ({href:match[1], label:textOnly(match[2])}));
const anchorSet = html => sorted(anchors(html).map(item => `${item.href}\u0000${item.label}`));
const htmlScripts = html => [...html.matchAll(/<script\b[^>]*\btype="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g)].map(match => match[0]);
const main = html => html.match(/<main\b[^>]*>[\s\S]*?<\/main>/)?.[0] || '';
const article = html => html.match(/<article class="guide-article">[\s\S]*?<\/article>/)?.[0] || '';
const stripApprovedChanges = html => html.replace(footerPattern, '').replace(polishLinkLine, '');

const baselineFiles = execFileSync('git', ['ls-tree', '-r', '--name-only', baseline], {cwd:root, encoding:'utf8'})
  .trim().split('\n').filter(Boolean);
const baselineHtml = sorted(baselineFiles.filter(file => file.endsWith('.html')));
const files = sorted(siteFiles(root));
check(baselineHtml.length === 53, `baseline: expected 53 authored HTML pages, found ${baselineHtml.length}`);
check(identical(files, baselineHtml), 'authored page inventory: added or removed pages');
check(fs.existsSync(path.join(root, cssFile)), 'new shared stylesheet: missing');

const footerGroups = new Map([
  ['学習の入口', ['/subjects', '/universities/', '/guides/', '/ai/']],
  ['サービス', ['/', '/economics-tutor', '/pricing', '/web-learning', '/parents/']],
  ['利用条件', ['/terms', '/privacy', '/tokusho']]
]);
const pages = new Map();
let preservedHtml = 0;
let guides = 0;
let universityPages = 0;
let structuredDataBlocks = 0;
let preservedFormReferences = 0;
let verifiedFooterGroups = 0;

for (const file of baselineHtml) {
  if (!fs.existsSync(path.join(root, file))) {
    issues.push(`${file}: missing`);
    continue;
  }
  const html = read(file);
  const old = previous(file);
  pages.set(file, html);
  const footers = [...html.matchAll(footerPattern)].map(match => match[0]);
  const oldFooters = [...old.matchAll(footerPattern)].map(match => match[0]);
  check(footers.length === 1 && oldFooters.length === 1, `${file}: shared footer marker count`);
  const polishLinks = [...html.matchAll(/<link\b[^>]*>/g)].filter(match => /\bhref=["']\/site-polish\.css(?:\?[^"']*)?["']/.test(match[0]));
  const polishLines = [...html.matchAll(polishLinkLine)];
  check(polishLinks.length === 1 && polishLines.length === 1, `${file}: exactly one standalone polish CSS link`);
  check(/\brel=["']stylesheet["']/.test(polishLinks[0]?.[0] || ''), `${file}: polish link stylesheet relationship`);
  const head = html.match(/<head\b[^>]*>[\s\S]*?<\/head>/)?.[0] || '';
  const stylesheets = [...head.matchAll(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/g)].map(match => match[0]);
  check(stylesheets.at(-1) === polishLinks[0]?.[0], `${file}: polish CSS is the final stylesheet`);
  const unchanged = stripApprovedChanges(html) === stripApprovedChanges(old);
  check(unchanged, `${file}: content outside the footer and new CSS link changed`);
  if (unchanged) preservedHtml++;

  if (footers.length === 1 && oldFooters.length === 1) {
    const currentLinks = anchors(footers[0]);
    const oldLinks = anchors(oldFooters[0]);
    check(currentLinks.length === 12 && oldLinks.length === 12, `${file}: footer has the original 12 links`);
    check(identical(anchorSet(footers[0]), anchorSet(oldFooters[0])), `${file}: footer href/label multiset changed`);
    const groups = [...footers[0].matchAll(/<div\b[^>]*\bclass="footer-nav-group"[^>]*>([\s\S]*?)<\/div>/g)].map(match => match[1]);
    check(groups.length === 3, `${file}: three footer navigation groups`);
    const headings = groups.map(group => textOnly(group.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/)?.[1] || ''));
    check(identical(headings, [...footerGroups.keys()]), `${file}: footer group headings/order changed`);
    for (const [index, group] of groups.entries()) {
      const expected = footerGroups.get(headings[index]);
      const actual = anchors(group).map(item => item.href);
      const valid = expected && identical(sorted(actual), sorted(expected));
      check(valid, `${file}: incorrect links in footer group ${headings[index] || index + 1}`);
      const remainder = group.replace(/<h2\b[^>]*>[\s\S]*?<\/h2>/g, '')
        .replace(/<a\b[^>]*>[\s\S]*?<\/a>/g, '').trim();
      check(remainder === '', `${file}: unexpected content in footer navigation group`);
      if (valid) verifiedFooterGroups++;
    }
    check(groups.reduce((total, group) => total + anchors(group).length, 0) === 12, `${file}: all footer links belong to a group`);
    // Retain the brand and copyright outside the regrouped navigation.
    const outsideNav = value => value.replace(/<nav class="footer-nav"[^>]*>[\s\S]*?<\/nav>/, '');
    check(outsideNav(footers[0]) === outsideNav(oldFooters[0]), `${file}: footer brand/copyright changed`);
  }

  const forms = value => [...value.matchAll(/(?:href|action)="(https:\/\/docs\.google\.com\/forms\/[^\"]+)"/g)].map(match => match[1]);
  check(identical(forms(html), forms(old)), `${file}: form endpoints changed`);
  preservedFormReferences += forms(html).length;
  const sns = value => [...value.matchAll(/(?:href|src)="(https:\/\/(?:www\.)?(?:instagram\.com|youtube\.com|threads\.net|threads\.com)[^\"]*)"/g)].map(match => match[1]);
  check(identical(sns(html), sns(old)), `${file}: SNS endpoints changed`);
  check(identical(htmlScripts(html), htmlScripts(old)), `${file}: structured data changed`);
  structuredDataBlocks += htmlScripts(html).length;

  if (file.startsWith('guides/') && file !== 'guides/index.html') {
    check(article(html) !== '' && article(html) === article(old), `${file}: original teaching article changed`);
    guides++;
  }
  if (file.startsWith('universities/')) {
    check(main(html) !== '' && main(html) === main(old), `${file}: university information/main content changed`);
    universityPages++;
  }
}
check(guides === 9, `original guide bodies: expected 9, found ${guides}`);

// Existing public runtime, styles, images, sitemaps and configuration are frozen.
// The two generated AI snapshot files may change only as verified below.
const generatedAiFiles = new Set(['downloads/economic-tutoring-ai-information.txt', 'downloads/economic-tutoring-ai-sources.json']);
const protectedFiles = baselineFiles.filter(file => !file.startsWith('tools/') && !generatedAiFiles.has(file)
  && /\.(?:js|css|png|svg|xml|txt|json)$/.test(file));
for (const file of protectedFiles) {
  check(fs.existsSync(path.join(root, file)) && readBytes(file).equals(previousBytes(file)), `${file}: protected public asset changed`);
}

let aiReport = null;
try {
  const pack = read('downloads/economic-tutoring-ai-information.txt');
  const meta = JSON.parse(read('downloads/economic-tutoring-ai-sources.json'));
  const context = {window:{}};
  vm.runInNewContext(read('site-config.js'), context);
  const config = context.window.ECONOMIC_TUTORING;
  check(Object.keys(config.products).length === 7, 'canonical products: expected 7');
  check(meta.page_count === 51 && meta.guide_count === 9 && meta.product_count === 7, 'AI information: page/guide/product counts');
  check(meta.pages.length === 51, 'AI information: 51 source entries');
  const oldMeta = JSON.parse(previous('downloads/economic-tutoring-ai-sources.json'));
  check(identical(meta.pages.map(item => [item.file, item.url]), oldMeta.pages.map(item => [item.file, item.url])), 'AI information: source page inventory changed');
  check(identical(meta.pages.map(item => [item.file, item.title, item.text_sha256]), oldMeta.pages.map(item => [item.file, item.title, item.text_sha256])), 'AI information: exported public text/title changed');
  const withoutCreationTime = value => value.replace(/^作成日時：[^\r\n]+/m, '作成日時：[regenerated snapshot]');
  const exportedTextPreserved = withoutCreationTime(pack) === withoutCreationTime(previous('downloads/economic-tutoring-ai-information.txt'));
  check(exportedTextPreserved, 'AI information: complete published text changed beyond the creation timestamp');
  check(hash(pack) === meta.pack_sha256, 'AI information: pack hash does not match metadata');
  check(Buffer.byteLength(pack) === meta.pack_bytes, 'AI information: pack byte count does not match metadata');
  check(hash(readBytes('site-config.js')) === meta.config_sha256, 'AI information: configuration hash does not match metadata');
  let currentSourceHashes = 0;
  for (const item of meta.pages) {
    check(pages.has(item.file), `AI source: unexpected file ${item.file}`);
    const sourceMatches = hash(readBytes(item.file)) === item.html_sha256;
    check(sourceMatches, `AI source: stale HTML hash ${item.file}`);
    if (sourceMatches) currentSourceHashes++;
    check(pack.includes(`公式URL：${item.url}`), `AI source: missing official URL ${item.url}`);
  }
  for (const product of Object.values(config.products)) {
    check(pack.includes(`【${product.name}】`), `AI product: missing ${product.name}`);
    check(pack.includes(`${product.price.toLocaleString('ja-JP')}円／${product.unit}`), `AI product: price missing ${product.name}`);
    for (const item of [...product.includes, ...product.excludes]) check(pack.includes(item), `AI product: scope missing ${product.name} / ${item}`);
  }
  for (const marker of ['入会金：0円', '通常3,000円', '最大6名', '期間外・対象外は通常料金',
    '実際の残席', '本人同意', 'iPadで板書', '似た問題', 'ノートとペン', '継続契約は必須ではありません',
    '無料ガイドで進められる部分は自習', '申込み送信＝日程確定・契約成立ではありません',
    'ご自身のAI', '全文を扱えるかは利用先・設定によって異なります', '本質的な理解', '定理を使う条件',
    '未習の内容', '月額ありきにせず', '試験日・範囲']) check(pack.includes(marker), `AI information: required boundary/method missing ${marker}`);
  check(!/\/Users\/|funnel\.csv|IN_PROGRESS|IMG_43|体験した方|返信遅延/.test(pack), 'AI information: internal/private material');
  check(!/fetch\(|XMLHttpRequest|sendBeacon|localStorage/.test(read('ai-information.js')), 'AI interface: unexpected uploads or tracking');
  aiReport = {pages:meta.page_count, guides:meta.guide_count, products:meta.product_count,
    packBytes:Buffer.byteLength(pack), packSha256:meta.pack_sha256,
    currentSourceHashes:currentSourceHashes === 51, preservedExportedPublicText:exportedTextPreserved};
} catch (error) {
  issues.push(`AI information verification: ${error.message}`);
}

const localOk = issues.length === 0;
console.log(JSON.stringify({ok:localOk, baseline, checkedAt:new Date().toISOString(),
  htmlPages:files.length, strictlyPreservedHtml:preservedHtml, preservedGuideBodies:guides,
  preservedUniversityPages:universityPages, structuredDataBlocks, preservedFormReferences,
  originalFooterLinksPerPage:12, verifiedFooterGroups, protectedPublicAssets:protectedFiles.length,
  newStylesheet:cssFile, aiInformation:aiReport,
  checks:['exact HTML preservation outside approved footer/CSS changes', 'unchanged authored page inventory',
    'one final CSS link on every page', 'original footer href/label multiset', 'three correctly assigned footer groups',
    'unchanged products, campaign logic, forms, SNS and existing runtime/assets', 'unchanged guide articles and university main content',
    'unchanged structured data', 'regenerated AI snapshot current source hashes and complete product scopes'],
  issues}, null, 2));
if (!localOk) process.exitCode = 1;

if (localOk && verifyPublic) {
  const publicFiles = [...files, cssFile, 'ai-information.css', 'ai-information.js', 'proof-example.css',
    'downloads/economic-tutoring-ai-information.txt', 'downloads/economic-tutoring-ai-sources.json'];
  const routeFor = file => `/${file.replace(/index\.html$/, '').replace(/\.html$/, '')}`;
  const results = [];
  for (let start = 0; start < publicFiles.length; start += 4) {
    await Promise.all(publicFiles.slice(start, start + 4).map(async file => {
      const route = routeFor(file);
      const url = new URL(route, publicBase);
      if (file === cssFile || file === 'ai-information.css' || file === 'ai-information.js' || file === 'proof-example.css') url.search = '?v=1';
      try {
        const response = await fetch(url, {headers:{'Cache-Control':'no-cache'}, signal:AbortSignal.timeout(20000)});
        const bytes = Buffer.from(await response.arrayBuffer());
        const matches = bytes.equals(readBytes(file));
        results.push({file, route, status:response.status, matches, bytes:bytes.length, sha256:hash(bytes),
          contentType:response.headers.get('content-type')});
      } catch (error) {
        results.push({file, route, error:error.message, matches:false});
      }
    }));
  }
  results.sort((a, b) => a.file.localeCompare(b.file));
  const ok = results.length === 59 && results.every(result => result.status === 200 && result.matches);
  console.log(JSON.stringify({public:true, ok, base:publicBase.origin, checkedAt:new Date().toISOString(),
    htmlPages:files.length, routes:results.length, results}, null, 2));
  if (!ok) process.exitCode = 1;
}
