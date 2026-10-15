// Read-only gate for the owner's 2026-10-15 retirement of the ended trial offer.
// node tools/verify-campaign-retirement.mjs [f9aa4df] [--manifest]
// Optional HTTP readback: --public --public-base=http://127.0.0.1:4199/
// Old campaign-addition/release-specific verifiers intentionally remain intact.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {siteFiles} from './site-files.mjs';
import {renderComponents} from './site-templates.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
const baseline=args.find(arg=>!arg.startsWith('--'))||'f9aa4df';
const readBytes=file=>fs.readFileSync(path.join(root,file));
const read=file=>readBytes(file).toString('utf8');
const git=(...values)=>execFileSync('git',values,{cwd:root});
const oldBytes=file=>git('show',`${baseline}:${file}`);
const old=file=>oldBytes(file).toString('utf8');
const hash=value=>createHash('sha256').update(value).digest('hex');
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const issues=[];
const check=(pass,label)=>{if(!pass)issues.push(label);};
const loadConfig=source=>{const ctx={window:{}};vm.runInNewContext(source,ctx,{timeout:1000});return JSON.parse(JSON.stringify(ctx.window.ECONOMIC_TUTORING));};
const config=loadConfig(read('site-config.js'));
const beforeConfig=loadConfig(old('site-config.js'));
const expectedConfig=structuredClone(beforeConfig);
expectedConfig.trialCampaign=null;
check(equal(config,expectedConfig),'config changed beyond trialCampaign:null');
check(read('site-config.js')===old('site-config.js').replace(/  trialCampaign: \{[\s\S]*?\n  \},/,'  trialCampaign: null,'),'configuration source changed beyond retiring the campaign field');
check(Object.keys(config.products).length===7 && config.products.trial.price===3000,'seven original products and normal trial price');
const meta=JSON.parse(read('downloads/economic-tutoring-ai-sources.json'));
const updateDate=meta.generated_at_jst.slice(0,10);
const jpDate=`${Number(updateDate.slice(0,4))}年${Number(updateDate.slice(5,7))}月${Number(updateDate.slice(8,10))}日`;

// Only these literal, owner-scoped non-template copy replacements are allowed.
// Every other byte of every authored page is compared with the baseline below.
const replacements=[
 ['初回相談・体験の料金・キャンペーン条件を確認する →','初回相談・体験の料金・申込みの流れを見る →'],
 ['<a href="#autumn-trial">2026年10月の期間限定無料体験の条件</a>をご確認ください。',''],
 ['無料の初回相談・体験 <b>期間限定・60分・条件を見る →</b>','初回相談・体験 <b>60分3,000円（税込）・相談する →</b>'],
 ['<a href="#autumn-trial">2026年9/28〜10/14申込対象の無料体験は、こちらの条件をご確認ください。</a>',''],
 ['初回相談・体験 <b>期間限定の条件を見る</b>','初回相談・体験 <b>60分3,000円（税込）・相談する →</b>'],
 ['初回相談・体験 <b>料金・適用条件を見る →</b>','初回相談・体験 <b>60分3,000円（税込）・相談する →</b>'],
 ['無料の相談・体験の条件を見る','初回相談・体験について相談する'],
 ['<br><a href="#autumn-trial">2026年9/28〜10/14申込対象の無料体験の条件</a>。',''],
 ['通常料金と期間限定キャンペーンの条件を合わせてご確認ください。','料金と申込みの流れをご確認ください。'],
 ['<details><summary>無料の相談や無料体験ですか？</summary><p>サービス内容や対応可否のお問い合わせと、実際に状況確認・指導を行う初回相談・体験は別です。初回相談・体験は通常60分3,000円（税込）。2026年9/28〜10/14申込み・10/1〜20実施の秋学期キャンペーンは、対象条件を満たす新規の方・1人1回・最大6名に限り0円です。継続契約は必須ではありません。<a href="#autumn-trial">無料体験の条件を確認する</a>。恒常的な無料個別診断サービスではありません。</p></details>',
  '<details><summary>初回相談・体験の料金はいくらですか？</summary><p>サービス内容や対応可否のお問い合わせと、実際に状況確認・指導を行う初回相談・体験は別です。初回相談・体験は60分3,000円（税込）です。継続契約は必須ではありません。</p></details>'],
 ['初回相談・体験は通常60分3,000円ですが、2026年10月の期間限定無料体験もあります。対象・申込期間・上限などは、このページで一緒に確認したいです。その後に続けるかは別に決められます。','初回相談・体験は60分3,000円（税込）です。内容と申込みの流れを、このページで一緒に確認したいです。その後に続けるかは別に決められます。'],
 ['2026年10月の初回無料体験は、<a href="/#autumn-trial">キャンペーンの期間・対象・上限</a>をご確認ください。',''],
 ['「相談と授業体験では何をしますか？申込み後の流れ、準備するもの、無料キャンペーンの条件も教えて」','「相談と授業体験では何をしますか？60分3,000円の内容と、申込み後の流れ、準備するものも教えて」'],
 ['キャンペーンの期間・条件、更新日、根拠となる公式URL','申込み時の確認事項、更新日、根拠となる公式URL'],
 ['キャンペーンの適用・残席・対応可否・日程は個別確認が必要です。','対応可否・日程・契約条件は個別確認が必要です。']
];
function expectedRetirement(html){
  // Delete only the ended banner/offer; retain the old normal-price fallback.
  html=html.replace(/\n    <div class="campaign-banner" data-campaign-banner>[\s\S]*?<\/div>/g,'');
  html=html.replace(/\n          <aside class="trial-campaign" id="autumn-trial"[\s\S]*?<\/aside>/g,block=>{
    const standard=block.match(/<div class="inquiry-trial" data-standard-trial hidden>[\s\S]*?<\/div>/)?.[0];
    if(!standard)throw new Error('Baseline normal-trial fallback missing');
    return standard.replace('<div class="inquiry-trial" data-standard-trial hidden>','<div class="inquiry-trial" id="autumn-trial" data-standard-trial>');
  });
  html=html.replace(/<div data-campaign-offer>[\s\S]*?<\/div>/g,'').replaceAll('<div data-standard-offer hidden>','<div data-standard-offer>');
  html=html.replace(/<!-- site:trial-inline -->[\s\S]*?<!-- \/site:trial-inline -->/g,'<!-- site:trial-inline --><!-- /site:trial-inline -->');
  html=html.replace('<p class="hub-plan-price-note">表示は通常料金です。2026年9/28〜10/14申込み・10/1〜20実施の期間限定無料体験は、対象・上限などの条件があります。<a href="#autumn-trial">条件を見る →</a></p>','');
  for(const [before,after] of replacements)html=html.replaceAll(before,after);
  html=html.replaceAll('href="#autumn-trial"','href="#contact"').replaceAll('site-config.js?v=32','site-config.js?v=33');
  html=html.replace(/<time datetime="2026-10-10" data-ai-updated>2026年10月10日<\/time>/,`<time datetime="${updateDate}" data-ai-updated>${jpDate}</time>`);
  return html.replace(/[\t ]+$/gm,'');
}
const baselineFiles=git('ls-tree','-r','--name-only',baseline).toString('utf8').trim().split('\n');
const files=siteFiles(root).sort();
check(equal(files,baselineFiles.filter(f=>f.endsWith('.html')).sort())&&files.length===53,'exact 53-page authored inventory changed');
const pages=new Map(files.map(file=>[file,read(file)]));
const forbidden=/秋学期スタートキャンペーン|無料の相談|無料の初回|無料体験|初回無料|条件付き0円|data-campaign-|2026年9\/28〜10\/14|最大6名/;
let normalContactPages=0,guideBodies=0,universityPages=0,jsonLdBlocks=0,localLinks=0,prices=0;
const sameJsonLd=value=>[...value.matchAll(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g)].map(m=>m[0]);
for(const [file,html] of pages){
  check(html===expectedRetirement(old(file)),`${file}: changed beyond the exact approved retirement transform`);
  check(!forbidden.test(html),`${file}: retired public promotion remains`);
  check(equal(sameJsonLd(html),sameJsonLd(old(file))),`${file}: structured data changed`);
  jsonLdBlocks+=sameJsonLd(html).length;
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  check(ids.length===new Set(ids).size,`${file}: duplicate IDs`);
  check((html.match(/<h1(?:\s|>)/g)||[]).length===1,`${file}: H1 count`);
  if(html.includes('<!-- site:contact -->')){
    const standard=html.match(/<div class="inquiry-trial" id="autumn-trial" data-standard-trial>[\s\S]*?<\/div>/)?.[0]||'';
    check(standard.includes('3,000円')&&!standard.includes(' hidden'),`${file}: visible no-JS normal trial / legacy anchor missing`);
    normalContactPages++;
  }
  const comp=renderComponents(config,html.match(/data-page="([^"]+)"/)?.[1]||'top');
  for(const kind of ['header','footer','contact','trial-feature']){
    const block=html.match(new RegExp(`<!-- site:${kind} -->([\\s\\S]*?)<!-- /site:${kind} -->`));
    if(block)check(block[1]===comp[kind].replace(/[\t ]+$/gm,''),`${file}: stale ${kind} component`);
  }
  for(const m of html.matchAll(/\bdata-price="([^"]+)"[^>]*>([^<]+)</g)){
    check(m[2]===config.products[m[1]]?.price.toLocaleString('ja-JP')+'円',`${file}: price mismatch ${m[1]}`);prices++;
  }
  for(const m of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
    const value=m[1];if(/^(?:mailto:|tel:|data:)/.test(value)||/^https?:/.test(value)&&!value.startsWith('https://economic-tutoring.pages.dev/'))continue;
    const url=new URL(value,'https://economic-tutoring.pages.dev/'+file);let dest=decodeURIComponent(url.pathname).slice(1);if(!dest||dest.endsWith('/'))dest+='index.html';if(!path.extname(dest))dest+='.html';
    check(fs.existsSync(path.join(root,dest)),`${file}: missing local reference ${value}`);
    if(url.hash&&pages.has(dest))check(pages.get(dest).includes(`id="${decodeURIComponent(url.hash.slice(1))}"`),`${file}: missing anchor ${value}`);
    localLinks++;
  }
  if(file.startsWith('guides/')&&file!=='guides/index.html')guideBodies++;
  if(file.startsWith('universities/'))universityPages++;
}
check(normalContactPages===49&&guideBodies===9&&universityPages===31,'normal contacts / original guides / university page counts');
const body=file=>read(file).match(/<section\b[^>]*id="referral"[\s\S]*?<\/section>/)?.[0];
check(body('pricing.html')===old('pricing.html').match(/<section\b[^>]*id="referral"[\s\S]*?<\/section>/)?.[0],'referral/pair benefit changed');
const protectedExceptions=new Set([...files,'README.md','site-config.js','tools/render-static.mjs','tools/site-templates.mjs','tools/build-ai-information.py','downloads/economic-tutoring-ai-information.txt','downloads/economic-tutoring-ai-sources.json']);
const protectedFiles=baselineFiles.filter(file=>!protectedExceptions.has(file));
for(const file of protectedFiles)check(readBytes(file).equals(oldBytes(file)),`${file}: protected source/asset/data/old verifier changed`);
check(read('tools/render-static.mjs')===old('tools/render-static.mjs').replaceAll('site-config.js?v=32','site-config.js?v=33'),'renderer changed beyond config cache version');
check(read('tools/site-templates.mjs')===old('tools/site-templates.mjs').replace('  const standardTrial = `<div class="inquiry-trial" data-standard-trial${campaign ? \' hidden\' : \'\'}>', '  // Preserve historical post links without retaining the ended offer itself.\n  const standardTrial = `<div class="inquiry-trial"${campaign ? \'\' : \' id="autumn-trial"\'} data-standard-trial${campaign ? \' hidden\' : \'\'}>'),'template changed beyond normal-trial legacy anchor');
check(read('README.md').replace(/^2026-10-15のキャンペーン終了対応[^\n]+\n\n/m,'')===old('README.md'),'README changed beyond dated retirement note');

const oldPack=old('downloads/economic-tutoring-ai-information.txt');
const pack=read('downloads/economic-tutoring-ai-information.txt');
const prefix=value=>value.split('\n第3部｜公式HPの公開本文・関連リンク\n')[0].replace(/^作成日時：[^\n]+/m,'作成日時：[snapshot]');
const oldScope='・本文には通常料金への表示切替用内容を含む箇所があります。キャンペーンと通常条件を混同せず、第1部の期間・適用条件を参照してください。\n・この資料は作成時点のスナップショットです。申込み時は公式の料金・条件と運営者の返信を再確認。日付を過ぎた0円キャンペーンを恒常特典として案内しないでください。';
const newScope='・初回相談・体験は60分3,000円（税込）です。内容・対応可否・日程・契約条件は個別に確認します。\n・この資料は作成時点のスナップショットです。申込み時は公式の料金・条件と運営者の返信を再確認してください。';
const expectedPrefix=prefix(oldPack).replace(oldScope,newScope).replace(/【期間限定：秋学期スタートキャンペーン】[\s\S]*?(?=【紹介・ペア特典】)/,'');
check(prefix(pack)===expectedPrefix,'AI pack: extra changes in product/owner clarification/contract text');
check(!forbidden.test(pack)&&!pack.includes('autumn-trial'),'AI pack contains ended promotion or stale campaign link');
check(hash(pack)===meta.pack_sha256&&Buffer.byteLength(pack)===meta.pack_bytes,'AI pack hash/bytes do not match metadata');
check(hash(readBytes('site-config.js'))===meta.config_sha256,'AI config hash stale');
const oldMeta=JSON.parse(old('downloads/economic-tutoring-ai-sources.json'));
check(meta.page_count===51&&meta.guide_count===9&&meta.product_count===7&&meta.pages.length===51,'AI 51 public pages / 9 guides / 7 products');
check(equal(meta.pages.map(p=>[p.file,p.url,p.title]),oldMeta.pages.map(p=>[p.file,p.url,p.title])),'AI original page inventory/title/canonical changed');
const fixedMetadata=value=>Object.fromEntries(Object.entries(value).filter(([key])=>!['generated_at_jst','source_base_commit','config_sha256','pack_sha256','pack_bytes','pages'].includes(key)));
check(equal(fixedMetadata(meta),fixedMetadata(oldMeta)),'AI non-version scope/limitations metadata changed');
let expectedBuilder=old('tools/build-ai-information.py').replace("    campaign = cfg['trialCampaign']\n",'').replace(oldScope,newScope)
  .replace(/    start = datetime\.fromisoformat\(campaign\['applicationStartsAt'\]\)[\s\S]*?(?=    parts\.append\(f'''\n)/,'')
  .replace(/【期間限定：\{campaign\['name'\]\}】[\s\S]*?(?=【紹介・ペア特典】)/,'')
  .replace("'2026年9月28日〜10月14日', '資料 51'","'3,000円／60分', '資料 51'")
  .replace('        assert marker in content, marker\n',"        assert marker in content, marker\n    assert not re.search(r'秋学期スタートキャンペーン|無料体験|autumn-trial|2026年9月28日〜10月14日', content)\n");
const builderApproved=read('tools/build-ai-information.py')===expectedBuilder;
check(builderApproved,'AI exporter logic changed beyond removing expired campaign and adding its absence assertion');
let sourceHashes=0;
if(builderApproved){
  // Only import the exact reviewed parser. Do not call its write-producing main.
  const extracted=JSON.parse(execFileSync('python3',['-B','-c',`import json,runpy,sys\nfrom pathlib import Path\nfrom urllib.parse import urljoin\nm=runpy.run_path('tools/build-ai-information.py',run_name='readonly_retirement_audit')\nout=[]\nfor file in json.load(sys.stdin):\n p=m['PublicText']();p.feed(Path(file).read_text(encoding='utf-8'));p.close()\n out.append({'text':p.result(),'title':''.join(p.title_parts).strip(),'url':p.canonical,'links':list(dict.fromkeys(urljoin(p.canonical,h) for h in p.links))})\nprint(json.dumps(out,ensure_ascii=False))`],{cwd:root,input:JSON.stringify(meta.pages.map(p=>p.file)),encoding:'utf8',maxBuffer:6*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}}));
  const publicHeader='\n第3部｜公式HPの公開本文・関連リンク\n';
  const publicParts=[publicHeader+'目次（51ページ）\n'];
  for(const [i,p] of meta.pages.entries())publicParts.push(`${String(i+1).padStart(2,'0')}. ${p.title}\n    ${p.url}\n`);
  for(const [i,p] of meta.pages.entries()){
    const current=extracted[i],matches=hash(readBytes(p.file))===p.html_sha256;check(matches,`AI stale HTML source ${p.file}`);if(matches)sourceHashes++;
    check(hash(current.text)===p.text_sha256&&current.title===p.title&&current.url===p.url,`AI public text/title/canonical mismatch ${p.file}`);
    publicParts.push(`\n${'='.repeat(50)}\n資料 ${String(i+1).padStart(2,'0')}｜${p.title}\n公式URL：${p.url}\n本文\n${current.text}\n\n本文内のリンク（同一ページ内へのリンクを含む）\n`);
    publicParts.push(...current.links.map(link=>'・'+link+'\n'));
  }
  check(pack.slice(pack.indexOf(publicHeader))===publicParts.join('\n'),'AI full public bodies/links/TOC differ or have extra text');
}
for(const item of Object.values(config.products)){
  check(pack.includes(`【${item.name}】`)&&pack.includes(`${item.price.toLocaleString('ja-JP')}円／${item.unit}`)&&pack.includes(item.summary),`AI complete product ${item.name}`);
  for(const text of [...item.includes,...item.excludes])check(pack.includes(text),`AI scope missing ${item.name}: ${text}`);
}
check(read('ai/index.html').includes(`<time datetime="${updateDate}" data-ai-updated>${jpDate}</time>`),'AI displayed update date differs from manifest');
check(!/\/Users\/|funnel\.csv|IN_PROGRESS/.test(pack),'AI internal/customer material exposure');

// Exact pre-existing untracked payload and the separate unpublished top draft.
const untracked=git('ls-files','--others','--exclude-standard','-z').toString('utf8').split('\0').filter(file=>file==='pricing 2.html'||file.startsWith('social-assets-system-only/')||file.startsWith('social-assets-v120/')).sort();
const untrackedRecords=untracked.map(file=>({file,sha256:hash(readBytes(file))}));
check(untracked.length===156&&hash(JSON.stringify(untrackedRecords))==='72037e891061af2a459dc1bfd54eaec4005743f7f7d0511fd9d67f15b9cb20f4','pre-existing untracked pricing/social materials changed');
function tree(dir,prefix=''){return fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(entry=>entry.isDirectory()?tree(path.join(dir,entry.name),prefix+entry.name+'/'):entry.isFile()?[{file:prefix+entry.name,sha256:hash(fs.readFileSync(path.join(dir,entry.name)))}]:[]);}
const draftRecords=tree(path.resolve(root,'../../outputs/hp-home-structure/2026-10-13'));
check(draftRecords.length===14&&hash(JSON.stringify(draftRecords))==='47b3be78bbc0db6d89228c783f94cb07b3a264b0a57c926437800467446701dc','separate unpublished homepage proposal changed');
const controlBytes=readBytes('../economic-tutoring-growth/automation-control.json'),control=JSON.parse(controlBytes);
check(hash(controlBytes)==='e22a45075e5446309d9d3104fe906d27e7da8e8811820e18c97680cd2fe17e88'&&control.mode==='PAUSED_BY_OWNER'&&!control.owner_pause.automatic_resume_allowed,'owner pause changed');

const deployFiles=baselineFiles.filter(file=>!file.startsWith('tools/')&&/\.(?:html|js|css|png|svg|xml|txt|json)$/.test(file));
const routeFor=file=>'/'+file.replace(/index\.html$/,'').replace(/\.html$/,'');
const manifest={status:'LOCAL_REVIEW_CANDIDATE_NOT_PUBLISHED',baseline,gitRoot:root,gitHead:git('rev-parse','HEAD').toString('utf8').trim(),branch:git('branch','--show-current').toString('utf8').trim(),files:deployFiles.map(file=>({file,route:routeFor(file)+(file==='site-config.js'?'?v=33':''),bytes:readBytes(file).length,sha256:hash(readBytes(file)),changed:!readBytes(file).equals(oldBytes(file))}))};
const report={ok:issues.length===0,checkedAt:new Date().toISOString(),baseline,gitRoot:root,gitHead:manifest.gitHead,pages:files.length,normalTrialVisibleWithoutJs:normalContactPages,legacyFragmentPointsToNormalTrial:normalContactPages,completeProducts:7,preservedGuideBodies:guideBodies,universityPages,jsonLdBlocks,localReferencesChecked:localLinks,canonicalPriceNodesChecked:prices,protectedExistingFiles:protectedFiles.length,preexistingUntrackedFilesPreserved:untracked.length,separateUnpublishedProposalPreserved:true,ownerPause:'PAUSED_BY_OWNER; unchanged',ai:{pages:51,guides:9,products:7,currentHtmlSourceHashes:sourceHashes,fullPublicBodiesAndLinks:'strictly reconstructed',bytes:meta.pack_bytes,sha256:meta.pack_sha256},scope:'Local source/byte/static-link checks only. No publication, contract change, form submission or browser visual QA.',issues};
if(args.includes('--manifest'))report.candidateManifest=manifest;
console.log(JSON.stringify(report,null,2));
if(issues.length)process.exitCode=1;
if(!issues.length&&args.includes('--public')){
  const base=new URL(args.find(arg=>arg.startsWith('--public-base='))?.slice(14)||'https://economic-tutoring.pages.dev/');const results=[];
  for(let i=0;i<manifest.files.length;i+=4)await Promise.all(manifest.files.slice(i,i+4).map(async item=>{try{const response=await fetch(new URL(item.route,base),{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(20000)});const bytes=Buffer.from(await response.arrayBuffer());results.push({file:item.file,route:item.route,status:response.status,matches:hash(bytes)===item.sha256,bytes:bytes.length});}catch(error){results.push({file:item.file,route:item.route,matches:false,error:error.message});}}));
  const ok=results.every(item=>item.status===200&&item.matches);console.log(JSON.stringify({publicReadback:true,ok,base:base.href,checkedAt:new Date().toISOString(),results},null,2));if(!ok)process.exitCode=1;
}
