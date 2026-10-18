Frenda Frontier Ver0.26 TEST
Updated: 2026-10-18

## Ver0.26 主変更
- 町レイヤーの描画順を band 方式へ変更。
  ground → structure → low → character → front の順で固定し、道路・石畳が人物の上へ出る問題を防止。
- 主人公・相棒の表示位置を保護帯として扱い、地面・施設・低い小物・追加人物の差分が上から被らないように修正。
- 施設画像を大型の町断片ではなく施設単位のアトラス `frontier-asset-town-facilities-v026.png` へ整理。
- 細かな発展差分は `frontier-asset-town-detail-v026.png` を継続利用し、役割別 band を定義。
- TESTレイヤー画面に描画帯を表示。新施設・新景観も band を指定して追加可能。
- Ver0.25以前のセーブ互換を維持。

## 配置
ZIP内の `test/frontier/` のファイルを `/test/frontier/` 直下へアップロードしてください。
assetsサブフォルダは不要です。

## 主要ファイル
- index.html
- frontier-data.js / frontier-save.js / frontier-core.js / frontier-render.js / frontier-ui.js
- frontier-asset-town-base-v026.png
- frontier-asset-town-facilities-v026.png
- frontier-asset-town-detail-v026.png
- frontier-asset-house-visual.png
- frontier-asset-store-visual.png
