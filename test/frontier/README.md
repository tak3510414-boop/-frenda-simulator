# Frenda Frontier Ver0.31 / TEST

Updated: 2026-10-19

## Ver0.31 修正

- Ver0.30で町画面が「町の画像を読み込めませんでした」になる不具合を修正。
- 原因は、frontier-ui.js が参照する旧 v027 の町レイヤー画像と家・店画像を Ver0.30 ZIP に収録していなかったため。
- Ver0.31では実行時に参照する画像を **すべてZIPへ収録**し、`/test/frontier/` 直下だけで完結する構成へ変更。
- 画像名を v031 に更新して iPhone / GitHub Pages の旧キャッシュも回避。
- 町の追加レイヤー画像が万一欠けても、ベース画像まで巻き込んで真っ暗にならないよう画像読み込みを耐障害化。

## 配置

ZIP内の `test/frontier/` の中身を、そのまま GitHub の `/test/frontier/` へ上書きしてください。
サブフォルダ `assets` は不要です。

## Ver0.30から継続

- 町をタップして主人公が移動
- 相棒追従
- 12px単位の通行判定
- 施設・景観レイヤー由来の collision / interaction / area gate
- 移動位置保存
- TEST通行オーバーレイ
