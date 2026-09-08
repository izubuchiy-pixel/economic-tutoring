import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { renderComponents } from './site-templates.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'site-config.js'), 'utf8'), context);
const site = context.window.ECONOMIC_TUTORING;
const files = execFileSync('git', ['ls-files', '*.html'], { cwd:root, encoding:'utf8' }).trim().split('\n');
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
