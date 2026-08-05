# economic_tutoring 公式サイト

大学生向けの経済学系専門科目オンライン個別指導・学習管理サービスの公式サイトです。

## 公開URL

- トップ: https://economic-tutoring.pages.dev/
- 料金・サービス: https://economic-tutoring.pages.dev/pricing.html
- 受講者専用学習環境・確認小テスト: https://economic-tutoring.pages.dev/web-learning.html

## ページの役割

- `index.html`: 30秒以内に対象・支援内容・料金目安・相談方法を判断するトップ
- `pricing.html`: 単発3商品、月額伴走2プラン、確認小テストオプションの料金と提供範囲を比較する詳細ページ
- `web-learning.html`: 標準の受講者専用学習環境と任意の確認小テストを、実画面と学習サイクルで説明するページ
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

公開前後は `PUBLICATION-CHECKLIST.md` を確認してください。
