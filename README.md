# economic_tutoring 公式サイト

大学生向けの経済学系専門科目オンライン個別指導・学習管理サービスの公式サイトです。

## 公開URL

- トップ: https://economic-tutoring.pages.dev/
- 対応科目: https://economic-tutoring.pages.dev/subjects.html
- Instagram専用LP: https://economic-tutoring.pages.dev/instagram/
- 料金・サービス: https://economic-tutoring.pages.dev/pricing.html
- 受講者専用学習環境・確認小テスト: https://economic-tutoring.pages.dev/web-learning.html
- 経済学部の数学ガイド: https://economic-tutoring.pages.dev/guides/economics-math-basics.html
- 大学統計学の勉強順ガイド: https://economic-tutoring.pages.dev/guides/university-statistics-study-order.html
- 計量経済学・回帰分析ガイド: https://economic-tutoring.pages.dev/guides/econometrics-regression-basics.html

## ページの役割

- `index.html`: Google検索から訪れた学生・保護者がサービス全体を確認する公式ホーム
- `subjects.html`: ミクロ・マクロ・統計・計量・経済数学、授業・試験・再履修の対応内容
- `instagram/index.html`: Instagramから訪れた人向けの相談獲得LP。検索結果には掲載しない
- `pricing.html`: 単発3商品、月額伴走2プラン、確認小テストオプションの料金と提供範囲を比較する詳細ページ
- `web-learning.html`: 標準の受講者専用学習環境と任意の確認小テストを、実画面と学習サイクルで説明するページ
- `guides/economics-math-basics.html`: 経済学部で数学につまずいた学生向けに、科目別の復習順と例題を示す検索入口
- `guides/university-statistics-study-order.html`: 記述統計から推定・検定までの接続を、確認問題と数値例で示す検索入口
- `guides/econometrics-regression-basics.html`: 回帰係数・誤差項・標準誤差・因果解釈を分けて説明する検索入口
- `terms.html`: 利用案内・受講規約
- `privacy.html`: プライバシーポリシー
- `tokusho.html`: 特定商取引法に基づく表記
- `404.html`: 不正URLの案内

## 共通管理

`site-config.js` で次を一元管理しています。

- ブランド名、Instagram、メール、CTA
- 商品名、料金、授業回数、対象科目数
- 各プランの要約、含まれる内容、含まれない内容
- 標準の受講者専用学習環境と確認小テストオプションの共通説明

料金や連絡先を変更する場合は、原則として `site-config.js` を変更します。`script.js` が共通ヘッダー、フッター、問い合わせ欄、プランカード、法的ページの料金一覧へ反映します。

## Cloudflare Pages

- Production branch: `main`
- Framework preset: `None`
- Build command: `exit 0`
- Build output directory: `.`
- Root directory: 空欄

リポジトリ直下のファイルを `main` にコミットすると、自動で再公開されます。

検索用ホームとInstagram用LPは同一サイト内で管理します。旧Netlify版は、Netlify側の管理画面でトップ `https://economic-tutoring.pages.dev/` への恒久転送を設定し、同一内容の別サイトとして残しません。

公開前後は `PUBLICATION-CHECKLIST.md` を確認してください。
