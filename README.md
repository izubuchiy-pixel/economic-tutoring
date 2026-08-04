# economic_tutoring 完成版

大学生向けの経済学系専門科目オンライン個別指導・学習伴走サービスの公式LPです。

## 公開URL

https://economic-tutoring.pages.dev/

## GitHub / Cloudflare Pages の設定

- Production branch: `main`
- Framework preset: `None`
- Build command: `exit 0`
- Build output directory: `.`
- Root directory: 空欄

リポジトリ直下のファイルを更新して `main` にコミットすると、Cloudflare Pagesが自動で再公開します。

## 主なファイル

- `index.html`: LP本体
- `styles.css`: 既存デザイン
- `enhancements.css`: 今回追加した表示・レスポンシブ調整
- `script.js`: メニュー、コピー、上位プラン切替
- `terms.html`: 利用案内・受講規約
- `privacy.html`: プライバシーポリシー
- `tokusho.html`: 特定商取引法に基づく表記
- `og.png`: SNS共有画像
- `favicon.svg`: ブラウザのタブ用アイコン
- `404.html`, `robots.txt`, `sitemap.xml`

## 専用学習環境付きプランの公開

提供開始前は79,800円プランを表示しません。提供可能になったら、`script.js` 内の次の値を変更します。

```js
const SHOW_DEDICATED_LEARNING_PLAN = true;
```

それまでは「より手厚い個別サポートはご相談ください」と表示されます。

## 公開前確認

`PUBLICATION-CHECKLIST.md` の項目を確認してください。特に日程変更・キャンセル条件は、実際の運用に合わせて確定が必要です。
