# Frenda Frontier Ver0.30 / TEST

Updated: 2026-10-19

## Ver0.30
- 町の見た目レイヤーと同じ定義から collision / walkable / entrance / interaction / NPC waypoint を合成するナビゲーション基盤を追加。
- `TOWN_NAV_BASE` と各 `TOWN_LAYER_DEFS[].nav` を正本とし、画像解析には依存しない。
- `AREA_DEFS[].nav` にエリア寸法・スポーン・接続ゲートを定義。町域の `usable` 状態でゲートが開閉する。
- `townNavModel` / `townPointWalkable` / `townFindPath` / `townNearestInteraction` を追加。将来の主人公・相棒・NPCで共通利用する。
- TEST専用「🚧 通行」で歩行可/不可・未開通ゲート・インタラクション位置をオーバーレイ確認可能。
- バージョン更新時に開発用「生レイヤー確認」を自動解除。
- スマホでヘッダー文字が横幅を押し広げないよう調整。

画像アセットはVer0.27から変更なし。既存の同一フォルダ内画像をそのまま利用します。


## Ver0.30
- 町フィールドのタップ移動を実装。
- 主人公・相棒を背景画像から分離し、移動スプライト化。
- 通行グリッドを12px化し、polygon/rect/circle collisionを合成。
- 相棒は主人公の通った経路を追従。移動位置をセーブ。
