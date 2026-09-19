import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {universityEntries} from './university-entry-data.mjs';
import {renderComponents} from './site-templates.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'site-config.js'),'utf8'),context);
const site=context.window.ECONOMIC_TUTORING;
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const paras=items=>items.map(p=>`<p>${esc(p)}</p>`).join('\n');
for(const d of universityEntries) {
 const url=`https://economic-tutoring.pages.dev/universities/${d.slug}/economics-math/`;
 const comp=renderComponents(site,`university-${d.slug}`);
 const html=`<!doctype html>
<html lang="ja"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.title)}</title><meta name="description" content="${esc(d.description)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article"><meta property="og:title" content="${esc(d.title)}"><meta property="og:description" content="${esc(d.description)}"><meta property="og:url" content="${url}">
<link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/enhancements.css"><link rel="stylesheet" href="/hp-refresh.css?v=5"><link rel="stylesheet" href="/entry-pages.css?v=1">
<script src="/site-config.js" defer></script><script src="/script.js?v=34" defer></script>
<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'WebPage',name:d.title,url,inLanguage:'ja',isPartOf:{'@type':'WebSite',name:site.brand,url:'https://economic-tutoring.pages.dev/'}})}</script>
</head><body class="entry-page" data-page="university-${d.slug}">
<!-- site:header -->${comp.header}<!-- /site:header -->
<main id="main">
<section class="entry-hero"><div class="shell">
 <p class="breadcrumb"><a href="/">ホーム</a> / <a href="/universities/">大学・科目別</a> / ${d.school}</p>
 <div class="entry-hero-grid"><div><p class="entry-kicker">${esc(d.school)}・${esc(d.course)}</p><h1>${esc(d.heading)}</h1><p class="entry-lead">${esc(d.lead)}</p>
 <div class="hero-actions"><a class="button button-navy" href="#contact">今の授業について相談する</a><a class="button button-outline" href="#example">解説付きの例題を読む</a></div>
 <p class="fineprint">オンライン個別指導。初回相談・体験：60分 <span data-price="trial">${new Intl.NumberFormat('ja-JP').format(site.products.trial.price)}円</span>（税込）。</p></div>
 <aside class="entry-overview"><h2>学び直しの出発点</h2><ol>${d.overview.map(t=>`<li>${esc(t)}</li>`).join('')}</ol><p>公式情報の確認範囲と、当サービス独自の復習案を分けて記載しています。</p></aside></div>
 <p class="entry-disclaimer">当サービスは${d.school}とは独立した民間の学習支援サービスです。大学の公式・公認・提携サービスではありません。掲載は同大学での指導実績や全科目への対応を示すものではありません。</p>
 <nav class="entry-jumps" aria-label="このページの内容"><a href="#course">科目情報と確認範囲</a><a href="#route">復習の順番</a><a href="#example">解説付き例題</a><a href="#prepare">相談方法</a></nav>
</div></section>
<section class="entry-section" id="course"><div class="shell"><h2>${esc(d.courseHeading)}</h2>${paras([d.fact,d.interpretation])}<p class="entry-note">${esc(d.boundary)}</p><p><a href="#sources">参照した大学公式資料を見る</a></p></div></section>
<section class="entry-section" id="route"><div class="shell"><h2>どこで止まるかで、戻る場所を変えます。</h2><div class="entry-grid">
${d.routes.map(([label,title,text,guide])=>`<article class="entry-card"><span class="entry-number">${esc(label)}</span><h3>${esc(title)}</h3><p>${esc(text)}</p><a href="/guides/${guide}">関連する無料学習ガイドへ →</a></article>`).join('\n')}
</div><p>学習ガイドは一般的な解説です。ご自身の授業範囲と照らし、必要な部分から使ってください。相談や登録をせずに読めます。</p></div></section>
<section class="entry-section" id="example"><div class="shell"><p class="entry-kicker">自作の確認問題と解説</p><h2>${esc(d.exampleTitle)}</h2><div class="entry-example"><p>${esc(d.question)}</p><p class="entry-equation">${d.equation}</p><p>${esc(d.prompt)}</p><details><summary>解き方と、考え方を読む</summary>${paras(d.answer)}</details></div><p class="entry-note">${esc(d.branch)}</p><p class="fineprint">例題・復習案の作成：economic_tutoring。大学の課題・過去問の転載ではなく、出題予想でもありません。</p></div></section>
<section class="entry-section" id="prepare"><div class="shell"><h2>科目名と、いま止まっている場所から。</h2><ol class="entry-path"><li><h3>年度・学科・科目名を確認</h3><p>クラスや入学年度によって内容が違う場合があります。現在の単元、試験などの期限も、分かる範囲でお知らせください。</p></li><li><h3>説明しきれなくても、短く相談</h3><p>${esc(d.inquiry)}</p></li><li><h3>内容を確認して、支援方法を相談</h3><p>実際の資料を見て対応可否を確認し、必要な前提と優先順位、回数・日程を相談します。最初のフォームへの資料添付は不要です。必要な場合は返信後に共有方法を案内し、共有できる部分だけを扱います。学籍番号・他の学生の氏名等は隠してください。</p></li></ol><p><a href="/pricing">現行の料金・提供範囲</a> ／ <a href="/parents/">保護者へ送れる説明ページ</a></p></div></section>
<section class="entry-section"><div class="shell entry-faq"><h2>相談前に知っておきたいこと</h2><details><summary>${esc(d.faq[0])}</summary><p>${esc(d.faq[1])}</p></details><details><summary>試験範囲の全部を、短期間で終えられますか？</summary><p>範囲・残り時間・現在の理解を確認して優先順位を提案します。必要回数や単位取得を事前に保証しません。履修・評価・卒業要件は大学にご確認ください。</p></details><details><summary>課題やレポートを代わりに完成させてもらえますか？</summary><p>提出物や試験答案の代行は行いません。考え方の説明や類題の練習を通じ、ご本人が取り組むための支援を行います。</p></details></div></section>
<!-- site:contact -->${comp.contact}<!-- /site:contact -->
<section class="entry-section entry-sources" id="sources"><div class="shell"><h2>参照資料・確認範囲</h2><ul>${d.sources.map(([title,href])=>`<li><a href="${esc(href)}" target="_blank" rel="noopener">${esc(title)}</a></li>`).join('')}</ul><p>確認日：${esc(d.confirmedAt || '2026年9月19日〜20日')}。${esc(d.boundary)} 復習案・例題の編集：economic_tutoring。</p></div></section>
</main><!-- site:footer -->${comp.footer}<!-- /site:footer --></body></html>
`;
 const folder=path.join(root,'universities',d.slug,'economics-math');
 fs.mkdirSync(folder,{recursive:true});
 fs.writeFileSync(path.join(folder,'index.html'),html);
}
console.log(`Rendered ${universityEntries.length} individually authored university pages.`);
