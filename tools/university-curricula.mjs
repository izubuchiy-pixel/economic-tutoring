import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const data=()=>JSON.parse(fs.readFileSync(path.join(root,'tools/university-curricula.json'),'utf8'));
const wrap=(kind,html)=>`<!-- curriculum:${kind} -->${html}<!-- /curriculum:${kind} -->`;
const strip=html=>html.replace(/<!-- curriculum:([a-z-]+) -->[\s\S]*?<!-- \/curriculum:\1 -->/g,'');

// Owner-requested directory grouping. Preserve Sophia's descriptions, links,
// course list and old deep link while showing one card per university.
export function groupSophiaWithSokei(input) {
 let html=input.replace('<a href="#sokei">早慶・2大学</a>','<a href="#sokei">早慶上智・3大学</a>')
   .replace('<a href="#sophia">上智大学</a>','')
   .replace('<p class="entry-kicker">早慶</p><h2>早稲田・慶應義塾</h2>',
     '<p class="entry-kicker">早慶上智</p><h2>早稲田・慶應義塾・上智</h2>')
   .replace('<h2>早稲田・慶應義塾・上智</h2><div class="entry-grid two">',
     '<h2>早稲田・慶應義塾・上智</h2><div class="entry-grid">');
 const standalone=html.match(/<section class="entry-section" id="sophia">[\s\S]*?<\/section>/);
 if(!standalone)return html;
 const cards=standalone[0].match(/<article class="entry-card">[\s\S]*?<\/article>/g);
 if(cards?.length!==3)throw new Error('Sophia directory cards changed; review grouping before moving');
 const subjectLinks=cards.slice(1).map(card=>card
   .replace('<article class="entry-card"><h3>','<li><strong>')
   .replace('</h3>','</strong>')
   .replace('</article>','</li>')).join('');
 const sophia=cards[0].replace('<article class="entry-card">',
   '<article class="entry-card"><span id="sophia" aria-hidden="true"></span>')
   .replace('</article>',`<ul>${subjectLinks}</ul></article>`);
 const sokei=html.match(/<section class="entry-section" id="sokei">[\s\S]*?<\/section>/);
 if(!sokei)throw new Error('Sokei directory section missing');
 html=html.replace(sokei[0],sokei[0].replace(/(\s*<\/div><\/div><\/section>)$/,`\n      ${sophia}$1`));
 return html.replace(standalone[0]+'\n    ','');
}

export function curriculumSection(university,confirmedAt) {
 const u=university;
 const sourceById=new Map(u.sources.map(source=>[source.id,source]));
 return wrap('overview',`<section class="entry-section curriculum-section" id="curriculum"><div class="shell">
 <p class="entry-kicker">授業の見取り図</p><h2>${esc(u.school)}で確認した主な授業</h2>
 <p>${esc(u.faculty)}／${esc(u.yearLabel)}。基礎から次の段階につながる科目をまとめました。すべての授業を網羅した一覧ではありません。</p>
 <p class="entry-note">${esc(u.scopeNote)}</p>
 <p class="curriculum-instruction">科目名を開くと、確認範囲・復習の出発点・大学公式資料を読めます。</p>
 <div class="curriculum-list">${u.courses.map((course,i)=>`<details class="curriculum-course" id="curriculum-${i+1}">
 <summary><span class="curriculum-name">${esc(course.name)}</span><span class="curriculum-meta"><span>${esc(course.stage)}</span><span>${esc(course.requirement)}</span></span><span class="curriculum-toggle" aria-hidden="true">＋</span></summary>
 <div class="curriculum-body"><p class="curriculum-evidence"><strong>公式情報の確認範囲：</strong>${esc(course.verification)}</p>
 ${course.topics?`<p><strong>確認できた内容：</strong>${esc(course.topics)}</p>`:'<p class="fineprint">この追加一覧では個別担当の授業計画まで確認していません。科目名だけから、実際の内容・進度・評価方法を確定していません。</p>'}
 <p><strong>個別指導での確認案（ET独自）：</strong>${esc(course.studyFocus)}</p>
 <p class="fineprint">この復習案は大学の指定順序や出題予想ではありません。実際の授業範囲を確認してから使います。</p>
 <ul class="curriculum-links">${course.sourceIds.map(id=>{const s=sourceById.get(id);if(!s)throw new Error(`${u.slug}: missing source ${id}`);return `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>（${esc(s.year)}）</li>`;}).join('')}</ul>
 </div></details>`).join('\n')}</div>
 <details class="curriculum-source-details"><summary>資料年度・確認日・未確認の範囲</summary><p>確認日：${esc(confirmedAt)}。資料の年度と現在の開講年度は同一とは限りません。古い年度の資料はその年度の根拠として扱い、今年の開講を保証しません。</p><ul>${u.sources.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>（${esc(s.year)}）<br>${esc(s.evidence)}</li>`).join('')}</ul><p>履修登録・卒業要件・開講の有無は、本人の入学年度・学科に対応する最新の大学資料と窓口で確認してください。学習支援の対応可否は実際の資料を見て確認します。全科目への対応を保証する一覧ではありません。</p></details>
 </div></section>`);
}

function primaryPath(u) {
 const base=`universities/${u.slug}/`;
 if(fs.existsSync(path.join(root,base,'economics-math/index.html')))return `/${base}economics-math/`;
 if(fs.existsSync(path.join(root,base,'microeconomics/index.html')))return `/${base}microeconomics/`;
 throw new Error(`No existing page for ${u.slug}`);
}

export function enhanceUniversityPage(file,input) {
 if(!file.startsWith('universities/'))return input;
 const {universities,confirmedAt}=data();
 let html=strip(input);
 if(!html.includes('/university-curricula.css'))html=html.replace('</head>','  <link rel="stylesheet" href="/university-curricula.css?v=1">\n</head>');
 if(file==='universities/index.html') {
   html=groupSophiaWithSokei(html);
   const boundary=html.indexOf('<section class="entry-section" id="sokei">');
   if(boundary<0)throw new Error('University directory group boundary missing');
   const found=new Set();
   html=html.slice(0,boundary)+html.slice(boundary).replace(/<article class="entry-card">[\s\S]*?<\/article>/g,article=>{
     const slug=article.match(/href="\/universities\/([^/]+)\//)?.[1];
     const u=universities.find(u=>u.slug===slug);
     if(!u||found.has(slug))return article;
     found.add(slug);
     const base=primaryPath(u);
     const overview=wrap('directory',`<div class="curriculum-directory"><p class="curriculum-directory-label">主な授業の公式情報</p><p class="fineprint">${esc(u.faculty)}／${esc(u.yearLabel)}</p><details><summary>${u.courses.length}つの科目群を見る</summary><ul>${u.courses.map((c,i)=>`<li><a href="${base}#curriculum-${i+1}">${esc(c.name)}</a><span>${esc(c.stage)}／${esc(c.requirement)}</span></li>`).join('')}</ul></details><a class="text-link" href="${base}#curriculum">必修・選択と確認範囲を見る →</a></div>`);
     return article.replace(/<h3>[\s\S]*?<\/h3>/,`<h3>${esc(u.school)}<br>主な授業と学習の入口</h3>`).replace('</article>',overview+'</article>');
   });
   if(found.size!==universities.length)throw new Error(`Directory matched ${found.size}/${universities.length} universities`);
   return html;
 }
 const slug=file.split('/')[1];
 const u=universities.find(u=>u.slug===slug);
 if(!u)throw new Error(`Curriculum missing for ${slug}`);
 const section=curriculumSection(u,confirmedAt);
 const target=html.match(/<section class="entry-section" id="route">/);
 if(!target)throw new Error(`${file}: route insertion point missing`);
 html=html.replace(target[0],section+target[0]);
 html=html.replace(/(<nav class="entry-jumps" aria-label="このページの内容">)/, '$1'+wrap('jump','<a href="#curriculum">主な授業の一覧</a>'));
 return html;
}
