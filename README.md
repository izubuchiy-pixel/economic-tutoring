# economic_tutoring 公式サイト

大学生向けの経済学系専門科目オンライン個別指導・学習管理サービスの公式サイトです。

## 公開URL

2026-10-09の全体表示整理：`site-polish.css` を既存53HTMLの最後に読み込み、見出し・余白・カード・入口ボタンの見た目を共通化。濃紺の案内枠のリンクを明るくし、確認小テストオプションは追加料金の枠として区別。フッターは同じ12リンクを学習の入口・サービス・利用条件の3分類に整理しました。本文・料金・キャンペーン・9教材・大学の授業情報・フォーム・SNSは変更しません。AI用TXTの公開本文も作成日時以外保持し、出典JSONを現在HTMLのハッシュへ同期。検査は `node tools/verify-site-polish.mjs a5948e1`、公開読戻しは同じコマンドに `--public` を付けます。過去のリリース専用差分検査を今回の許可へ転用しません。

2026-10-09の証明学習の案内：トップの説明例を自作の「積の微分」に整理し、定義・条件・証明の一手から本人の説明・類題へつなぐ指導方針を、対応科目・慶應経済数学・AI用情報に同期しました。要点を先に示し、導出と確認問題・解答は開閉式です。教科書写真や個別案件は公開せず、大学の採用教材・出題範囲は断定しません。料金・商品・キャンペーン・既存9教材・SNSは維持。今回の承認範囲・数式・情報パック・保持は `node tools/verify-proof-guidance.mjs ada53ae`、公開読戻しは同じコマンドに `--public` を付けて検査します。旧AI入口追加時の検査はそのリリース用であり、今回の変更を承認するものではありません。

2026-10-09のAI情報入口：`/ai/` で公開情報一式のTXTをダウンロードし、各自のAIへ渡して質問する使い方を案内します。埋め込みチャット・AI API・ユーザー情報のアップロード機能はありません。トップには短い入口、共通フッターにはリンクのみ追加。価格・商品・無料教材本文・SNS運用は維持します。

- AIでETの情報を確認する: https://economic-tutoring.pages.dev/ai/
- 公開情報ファイル: https://economic-tutoring.pages.dev/downloads/economic-tutoring-ai-information.txt

資料は51情報ページの公開本文とリンク、`site-config.js`、本人確認済み授業説明から `python3 -B tools/build-ai-information.py` で生成します。404と利用案内ページ自身、未追跡の草案、内部運用、顧客情報、外部note本文・SNS全履歴・ログイン後の環境は含めません。画像は代替テキストの範囲のみです。生成後 `node tools/verify-ai-information.mjs f89ae4a` で範囲と保持を検査。公開後は `--public` で実配信を読み戻します。確認済みの基準版として `f89ae4a` を明示しています。

情報変更時にはこの生成を手動で行い、ページの更新日・収録範囲も確認してください。新しい定期作業は追加していません。料金・キャンペーン情報は日付付きスナップショットで、申込み時の最新条件・残席・対応可否・日程は公式案内と本人返信で確認します。草案の作成日時点の情報を恒常無料の条件として案内しないでください。

2026-10-09の入口整理：トップの困りごとから無料解説・大学別案内へ接続し、対応科目の経済数学から「式変形／微分／最大化」を直接選べるようにしました。学習ガイド一覧には4つの困りごと別入口と科目別ジャンプを追加。教材9本の本文・大学情報・料金・キャンペーン・フォームは維持しています。追加の表示は `entry-navigation.css` を3ページだけで読み込みます。公開前は `node tools/verify-entry-navigation.mjs` で元の素材の保持とリンク先を検査します。

- トップ: https://economic-tutoring.pages.dev/
- 経済学塾・オンライン家庭教師: https://economic-tutoring.pages.dev/economics-tutor
- 対応科目: https://economic-tutoring.pages.dev/subjects
- Instagram専用LP: https://economic-tutoring.pages.dev/instagram/
- 料金・サービス: https://economic-tutoring.pages.dev/pricing
- 受講者専用学習環境・学習確認: https://economic-tutoring.pages.dev/web-learning
- 学習ガイド一覧: https://economic-tutoring.pages.dev/guides/
- 大学・科目別の入口（早慶・上智・GMARCH・関関同立・日東駒専・産近甲龍の21大学・30入口）: https://economic-tutoring.pages.dev/universities/
- ミクロ・マクロ経済学の入口（早稲田・慶應・上智）: https://economic-tutoring.pages.dev/universities/#economics-subjects
- 保護者向け・ご家族への説明: https://economic-tutoring.pages.dev/parents/
- 経済学部の数学ガイド: https://economic-tutoring.pages.dev/guides/economics-math-basics
- 大学統計学の勉強順ガイド: https://economic-tutoring.pages.dev/guides/university-statistics-study-order
- 計量経済学・回帰分析ガイド: https://economic-tutoring.pages.dev/guides/econometrics-regression-basics
- IS-LM分析ガイド: https://economic-tutoring.pages.dev/guides/macro-is-lm-shifts
- ナッシュ均衡ガイド: https://economic-tutoring.pages.dev/guides/game-theory-nash-equilibrium
- 行列・連立方程式ガイド: https://economic-tutoring.pages.dev/guides/matrix-linear-equations
- 限界代替率MRSガイド: https://economic-tutoring.pages.dev/guides/micro-marginal-rate-substitution
- ソローモデルガイド: https://economic-tutoring.pages.dev/guides/macro-solow-steady-state
- ε-δ論法ガイド: https://economic-tutoring.pages.dev/guides/epsilon-delta-definition

## ページの役割

- `index.html`: Google検索から訪れた学生・保護者がサービス全体を確認する公式ホーム
- `economics-tutor.html`: 「経済学 塾」「経済学 家庭教師」「経済学 オンライン塾・オンライン家庭教師」で探す大学生・保護者へ、1対1指導の形式、対象、科目、料金、相談条件を説明する検索入口
- `subjects.html`: ミクロ・マクロ・統計・計量・経済数学、授業・試験・再履修の対応内容
- `instagram/index.html`: Instagramから訪れた人向けの相談獲得LP。DMを主導線、初回相談・体験フォームを第2導線、メールを補助導線とし、検索結果には掲載しない
- `pricing.html`: 単発3商品、月額伴走2プラン、確認小テストオプション、授業なしの月4回・学習確認コースを比較する詳細ページ
- `web-learning.html`: 伴走プランの受講者専用学習環境と、授業なしの学習確認コースの6段階サイクルを、公開サンプルとともに説明するページ
- `guides/index.html`: 9本の学習ガイドを科目別に選べる一覧ページ
- `guides/economics-math-basics.html`: 変数・限界・偏微分・制約条件のどこで止まっているかを診断し、利潤最大化とラグランジュ法を数値例でつなぐ検索入口
- `guides/university-statistics-study-order.html`: 標準偏差・標準誤差・信頼区間・検定の対象の違いを、一つの数値例と確認問題でつなぐ検索入口
- `guides/econometrics-regression-basics.html`: 母集団モデル・推定式・残差、係数・標準誤差・因果解釈、欠落変数バイアスを分けて説明する検索入口
- `guides/macro-is-lm-shifts.html`: 財市場・貨幣市場、曲線上の移動とシフト、財政政策後のクラウディング・アウトを図と連立方程式で説明する検索入口
- `guides/game-theory-nash-equilibrium.html`: 最適反応、支配戦略、複数均衡、混合戦略を一つの利得表でつなぐ検索入口
- `guides/matrix-linear-equations.html`: 連立方程式をAx=bへ変換し、行列式・逆行列・解の一意性と経済モデルでの用途を説明する検索入口
- `guides/micro-marginal-rate-substitution.html`: 限界効用、無差別曲線の傾き、価格比、予算制約、内点解と端点解をつなぐ検索入口
- `guides/macro-solow-steady-state.html`: 資本蓄積、定常状態、貯蓄率の水準効果と長期成長率の違いを図と数値例で説明する検索入口
- `guides/epsilon-delta-definition.html`: 量化記号の順序、δの逆算、一次・二次関数の証明を前向きに書き切る検索入口
- `terms.html`: 利用案内・受講規約
- `privacy.html`: プライバシーポリシー
- `tokusho.html`: 特定商取引法に基づく表記
- `404.html`: 不正URLの案内

## 共通管理

### 大学別の主な授業情報（2026年10月10日）

- `tools/university-curricula.json` に21大学・158科目群の正式名称、対象学科・年度、配当、必修／選択、確認範囲、公式出典を保持します。連続・関連科目は科目群としてまとめており、158件の独立ページを作成した意味ではありません。
- `tools/university-curricula.mjs` が既存30大学別ページと一覧へ追加表示します。担当別シラバス本文を確認した6科目群の内容例と、未確認の152科目群を区別し、ET独自の復習案も分離します。学科全科目の網羅・開講・対応保証は行いません。
- `node tools/render-static.mjs` で更新を反映し、AI情報を `python3 -B tools/build-ai-information.py` で同期します。`node tools/verify-university-curricula.mjs a219b79` で既存例題・料金・商品等の保全と生成再実行の一致を検証します。
- 調査の原データと別担当監査は上位ワークスペースの `outputs/hp-university-curricula/2026-10-10/` に保存しています。年度・担当の変更時は新しい公式根拠を確認してから更新します。停止中のSNS定時運用の再開許可ではありません。

`site-config.js` で次を一元管理しています。

- ブランド名、Instagram、メール、CTA
- 商品名、料金、授業回数・確認サイクル、対象科目数
- 各プランの要約、含まれる内容、含まれない内容
- 標準の受講者専用学習環境、確認小テストオプション、月4回・学習確認コースの共通説明

料金・商品・提供範囲の変更には本人承認が必要です。承認済みの変更は `site-config.js` を正本として管理します。

`tools/site-templates.mjs` が共通ヘッダー・フッター・問い合わせ欄・料金詳細を定義し、`node tools/render-static.mjs` で追跡済みHTMLへ静的に反映します。重要情報はJavaScriptが動かない場合にも読めます。`script.js` はメニュー、コピー、深いリンク先の展開などの操作を担当します。プラン概要の直書き表示とJSON-LDも正本に合わせて照合してください。

公開前に次を実行します。

```sh
node tools/render-university-entries.mjs
node tools/render-static.mjs
node tools/verify-site.mjs
git diff --check
```

共通部品の生成対象はGit追跡済みHTMLと `tools/site-files.mjs` の明示的な入口ページのみです（現在53ページ）。未追跡の作業用HTMLや素材フォルダには触れません。個別原稿と出典は `tools/university-entry-data.mjs`、そこから読み込む `tools/university-entry-data-batch2.mjs`・`tools/university-entry-data-economics.mjs`・`tools/university-entry-data-economics-batch2.mjs` で管理し、専用レンダラーは26ページを生成します。上智・関西学院・立教・慶應の経済数学ページと保護者ページの本文は直接編集します。科目別URL・問い合わせ例の識別子は共通ヘルパーで生成し、同じ大学のミクロ・マクロが混ざらないようにします。ミクロ・マクロの個別入口は現在、早稲田・慶應・上智・関西学院・立教の5大学です。

大学名だけの置換で増やさず、公式情報の確認範囲、固有の復習案・解説付き例題を確認してから追加します。公開済みでも検索登録・順位・流入を確認済みとは扱いません。HP・SEO作業は本人依頼時だけで、投稿自動化に混ぜません。

## サイト構成

- 公式ホームを全体案内の中心にし、単発・授業あり伴走・授業なし学習確認の3つから目的別ページへ案内します。
- Instagram専用LPはDMを主導線にした短い入口として維持し、詳細は料金・対応科目・学習環境へ分けます。
- 学習ガイドは検索入口として本文を維持し、`guides/index.html`から横断できるようにします。
- `hp-refresh.css` は全ページ共通のヘッダー・フッター・相談欄、および公式ホームと各案内ページの白地中心のデザインを担当します。学習ガイド9本の本文・数式・URLは維持します。

## Cloudflare Pages

### 初回体験の案内（2026-10-04）

- トップ・保護者・慶應経済数学の `site:trial-feature` は共通テンプレートから生成します。キャンペーン期間・価格・人数は `site-config.js` の既存条件を参照し、入会金0円とは区別します。
- 共通バナーは同じページの条件欄へ案内します。条件欄のない法務・404ページだけホームの条件欄へ移動します。Instagram専用LPは既存のDM優先経路を保持します。
- `script.js` は受付期限後、冒頭の無料体験カード・バナーを非表示にし、通常60分3,000円と通常の相談ボタンへ切り替えます。JavaScriptなしでも静的な申込・実施日と対象条件を明記しています。実際の残席は自動把握せず、架空の残席を表示しません。
- `node tools/verify-autumn-campaign.mjs` で受付開始・終了の境界、通常料金、冒頭カードとボタンの切替を確認します。公開前後は `node tools/verify-http.mjs <base URL>` で配信内容と保存版を照合します。
- 初回は相談しながら一つのテーマを実際の授業のように説明・練習し、その後に受講を検討します。相談・授業体験・振り返りを合わせて60分で、時間配分は固定しません。継続は任意です。実績・講師情報は確認できるもののみ掲載します。
- 共通の相談欄はキャンペーン中と通常時を切り替え、同じ体験説明を重ねません。期限後は共通欄の0円案内も隠して通常料金を表示します。対象・期間・人数・併用条件は省略しません。大学別・保護者への入口は共通メニューから移動できます。

- Production branch: `main`
- Framework preset: `None`
- Build command: `exit 0`
- Build output directory: `.`
- Root directory: 空欄

リポジトリ直下のファイルを `main` にコミットすると、自動で再公開されます。

検索用ホームとInstagram用LPは同一サイト内で管理します。旧Netlify版は、Netlify側の管理画面でトップ `https://economic-tutoring.pages.dev/` への恒久転送を設定し、同一内容の別サイトとして残しません。

公開前後は `PUBLICATION-CHECKLIST.md` を確認してください。
