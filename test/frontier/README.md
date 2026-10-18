Frenda Frontier Ver0.28 TEST

配置先: /test/frontier/

## Ver0.28 主変更
- TEST「全部 ON」を、生素材の全重ねから「最大発展の完成表示」へ変更。
- 生素材の全重ねは「⚠ 生レイヤー確認」に分離。
- exclusiveGroup / rank による段階レイヤー排他制御を追加。
- 道Lv1/Lv2、松明/街灯など同系統の段階差分は同時表示しない。
- 個別レイヤーを強制ONすると、同じ排他グループの兄弟レイヤーを自動OFF。
- 全部OFFは0pt初期景観、全部自動は通常ゲーム判定。
- 旧Ver0.26以前のセーブを継続利用可能。
- 画像名をv027化し、GitHub Pages/iPhoneの旧画像キャッシュを回避。

## 町画像
- frontier-asset-town-base-v027.png
- frontier-asset-town-facilities-v027.png
- frontier-asset-town-detail-v027.png
- frontier-asset-town-max-v027.png
- frontier-asset-house-visual.png
- frontier-asset-store-visual.png

「全部 ON（完成）」では frontier-asset-town-max-v027.png を使用します。
「⚠ 生レイヤー確認」は素材の重なりや座標を調べる開発用表示で、見た目の完成状態ではありません。


## Ver0.28 町域拡張基盤
- 町域は `AREA_DEFS` のマスター方式。将来の未知の新エリアも本体ロジックを増やさず追加可能。
- 状態は `locked → discovered → clearing → usable → developed`。
- 初期は中心開拓地だけが利用可能。西の森外縁／南の街道沿い／東の川辺／北の高台はプレイ進行と選択で開拓する。
- セーブは schemaVersion 3。旧Ver0.27以前から自動移行する。
- TESTでは町域ごとに状態を表示だけ強制できる。通常データは変更しない。
- 施設配置先用 `facilityAreas` もセーブに用意し、今後の新施設を複数エリアへ配置できる土台を追加。
