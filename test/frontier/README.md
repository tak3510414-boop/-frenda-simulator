Frenda Frontier Ver0.20 TEST
Updated: 2026-10-18

Town visual architecture
- Ver0.19の「完成した町の上へ緑マスクを重ねる方式」を廃止。
- Ver0.20では最初から自然な未発展マップをベース画像として使用。
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
