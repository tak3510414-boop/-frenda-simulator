Frenda Frontier Ver0.23 TEST
Updated: 2026-10-18

Town visual architecture
- Ver0.19の「完成した町の上へ緑マスクを重ねる方式」を廃止。
- Ver0.23では最初から自然な未発展マップをベース画像として使用。
- 建築済み施設だけを frontier-asset-town-parts.png から切り出してレイヤー合成する。
- 店Lv2 / 鍛冶屋 / 住居 / 広場整備 / 市場を独立状態として保持するため、発展順が違っても表示できる。
- 「店を大きくする」「鍛冶屋を呼ぶ」は最初の主要分岐。どちらを先に選んでもよい。
- 町の会話欄は動的HTMLオーバーレイへ移行し、発展状態に応じて文言を変更。
- 町画像内の「建設」「いどう」「図鑑」も操作対象化。

File layout
All files stay directly under /test/frontier/ .
- index.html
- frontier-core.js
- frontier-data.js
- frontier-render.js
- frontier-save.js
- frontier-ui.js
- frontier-asset-town-visual.png : natural undeveloped town base
- frontier-asset-town-parts.png : developed facility sprite/patch atlas
- frontier-asset-house-visual.png
- frontier-asset-store-visual.png

Existing Simulator / Dungeon / Expedition data is not modified.


## Ver0.23 TEST
町画面のTEST機能を「🧪 レイヤー」に変更。各町レイヤーを「自動／ON／OFF」で個別指定できる。テスト指定は発展pt・実際の建設状態・冒険・倉庫・売上を変更しない。レイヤー一覧は frontier-data.js の TOWN_LAYER_DEFS から自動生成されるため、将来レイヤー追加時にTEST画面のハードコード追加は不要。


## Ver0.23 変更点
- 町の固定ベースを未整備の開拓地へ差し替え。
- TEST「全部OFF」は、固定ベースのみ＝初期状態を表示。
- 初期状態には噴水・旗・街灯・石畳・整備階段・完成店舗を置かない。
- 初期の商売設備は、露店＋掘っ立て小屋を基準とする。
- TEST中の会話文は、実データではなく現在の表示レイヤー状態に合わせて変化。
