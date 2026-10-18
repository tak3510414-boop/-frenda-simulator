Frenda Frontier Ver0.25 TEST
Updated: 2026-10-18

配置先: /test/frontier/
全ファイルを同一フォルダへ配置します。assetsサブフォルダは使用しません。

## Ver0.25 主変更
- 0ptの初期開拓地を正式な固定ベースとして維持。
- 2pt / 4pt / 6pt / 8pt / 10pt / 12pt / 14pt / 16pt / 18pt / 20pt / 22pt / 24pt…の細かな景観レイヤーを追加。
- 2pt: 最初の旅人、4pt: 露店の商品、6pt: 踏み跡、8pt: 柵、10pt: 松明、12pt: 住民、14pt: 花、16pt: 一部石敷き、18pt: 街灯、20pt: 旗、22pt: ベンチ、24pt以降: 広場条件を満たすと噴水。
- 発展ルートを standard / commerce / forge / life / adventure として保持。8pt以降、同じ発展ptでもルートにより追加景観が変化。
- 施設を FACILITY_DEFS のマスター方式へ移行。施設追加時に町本体ロジックを個別改修しない構造。
- 保存schemaVersion=2。Ver0.24以前のshopLevel/forgeBuilt等をfacilities mapへ自動移行。
- TEST「レイヤー」は各レイヤーを 自動 / ON / OFF で個別指定。全部OFFは0pt初期景観。
- TESTの発展確認は+2pt単位。

## 主要ファイル
- index.html
- frontier-data.js
- frontier-save.js
- frontier-core.js
- frontier-render.js
- frontier-ui.js
- frontier-asset-town-base-v025.png
- frontier-asset-town-parts-v025.png
- frontier-asset-town-detail-v025.png
- frontier-asset-house-visual.png
- frontier-asset-store-visual.png

## 拡張ルール
新施設は FACILITY_DEFS に一意ID・カテゴリ・初期Lv・最大Lv・段階定義を追加し、必要なら TOWN_LAYER_DEFS に表示レイヤーを追加します。既存施設名を条件分岐として本体コードへベタ書きしないことを基準とします。
