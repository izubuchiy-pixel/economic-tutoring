import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { renderComponents } from './site-templates.mjs';
import { siteFiles } from './site-files.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'site-config.js'), 'utf8'), context);
const site = context.window.ECONOMIC_TUTORING;
const files = siteFiles(root);
let changed=0;
for (const file of files) {
  const absolute=path.join(root,file);
  const before=fs.readFileSync(absolute,'utf8');
  let html=before;
  const page=html.match(/data-page="([^"]+)"/)?.[1] || 'top';
  const components=renderComponents(site,page);
  for (const kind of ['header','footer','contact']) {
    const markup='<!-- site:'+kind+' -->'+components[kind]+'<!-- /site:'+kind+' -->';
    const existing=new RegExp('<!-- site:'+kind+' -->[\\s\\S]*?<!-- /site:'+kind+' -->','g');
    html=html.replace(existing,markup).replace(new RegExp('<div data-site-'+kind+'></div>','g'),markup);
  }
  html=html.replace(/<div class="hub-plan-details reveal" data-plan-details="([^"]+)">[\s\S]*?<\/div><!-- \/site:plans -->/g, (_,keys)=>'<div class="hub-plan-details reveal" data-plan-details="'+keys+'">'+keys.split(',').map(components.detailRow).join('')+'</div><!-- /site:plans -->');
  html=html.replace(/<div class="hub-plan-details reveal" data-plan-details="([^"]+)"><\/div>/g, (_,keys)=>'<div class="hub-plan-details reveal" data-plan-details="'+keys+'">'+keys.split(',').map(components.detailRow).join('')+'</div><!-- /site:plans -->');
  if (!html.includes('/hp-refresh.css')) html=html.replace('</head>','  <link rel="stylesheet" href="/hp-refresh.css?v=5">\n</head>');
  html=html.replace(/hp-refresh\.css\?v=\d+/g,'hp-refresh.css?v=5').replace(/script\.js\?v=\d+/g,'script.js?v=34');
  html=html.replace(/(<\w+[^>]*data-price="([^"]+)"[^>]*>)[^<]*(<\/\w+>)/g, (_,open,key,close) => open+new Intl.NumberFormat('ja-JP').format(site.products[key].price)+'円'+close);
  html=html.replace(/[ \t]+$/gm,'');
  if (html!==before) {fs.writeFileSync(absolute,html);changed++;}
}
console.log('Static shared components: '+files.length+' pages, '+changed+' updated.');

// Keep the diagnostic text sitemap derived from the canonical XML URL list.
// Google supports both formats; no content page or indexing directive changes.
const xml = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
if (!sitemapUrls.length || new Set(sitemapUrls).size !== sitemapUrls.length ||
    sitemapUrls.some(url => !url.startsWith('https://economic-tutoring.pages.dev/') || /[\s<&]/.test(url))) {
  throw new Error('Cannot generate text sitemap from an empty, duplicated, or unsupported URL list');
}
const textSitemap = sitemapUrls.join('\n')+'\n';
const textPath = path.join(root, 'sitemap.txt');
if (!fs.existsSync(textPath) || fs.readFileSync(textPath, 'utf8') !== textSitemap) {
  fs.writeFileSync(textPath, textSitemap);
}
console.log('Text sitemap: '+sitemapUrls.length+' URLs, synchronized with sitemap.xml.');
