# economic_tutoring v2

経済学部生向けオンライン個別指導の営業用LPです。

## 公開方法

このフォルダの中身を、GitHubの `economic-tutoring` リポジトリ直下へそのままアップロードしてください。Cloudflare Pagesでそのリポジトリを接続すると、自動で公開・更新できます。

主要ファイル:
- index.html
- styles.css
- script.js
- og.png
- 404.html
- robots.txt
- sitemap.xml

canonical・OGP・sitemapは以下のCloudflare Pages URLに設定しています。
https://economic-tutoring.pages.dev/

Cloudflare Pagesでは、Framework presetを `None`、Build commandを `exit 0`、Build output directoryを `.` に設定してください。
