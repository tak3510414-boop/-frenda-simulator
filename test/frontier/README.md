# Frenda Frontier Ver0.42 / TEST

## Ver0.42 - RuntimeScene描画の一体化

Ver0.39で定義したエリア共通SceneSpecを、実際のゲームフィールドで使うRuntimeSceneへコンパイルする基盤を実装しました。

### 今回の主な変更

- `compileAreaScene()` を追加し、1つのSceneSpecから以下を一括生成
  - 通行可能領域
  - エリア入口・出口
  - 施設配置スロットと入口候補
  - 工事用領域
  - NPC活動域・ウェイポイント
  - ランドマーク枠
  - 物流・サービス領域
  - 将来拡張port
- 南の街道沿いを、Ver0.38の手描き仮マップから `scene-spec-v2` の自動生成マップへ変更
- 南の街道の通行判定も、個別ベタ書きではなく生成されたRuntimeSceneを使用
- NPC表示位置もSceneSpecのNPC活動域から生成
- 施設枠は「最終建物座標」ではなく、全体構成変更に耐えられる建設可能領域として表示
- エリア仕様画面でSceneSpecとRuntimeSceneの両方を検証
- `AREA_SCENE_SCHEMA` v2 / 世界構造 Ver6 / save schemaVersion 12

### 設計上の目的

今後、全体マップのバランス変更で道路や施設位置が変わっても、エリアごとの個別コードを書き直さないための基盤です。西の森・東の川辺・北の高台や、将来追加される未知のエリアも同じコンパイラへSceneSpecを渡すだけで、最低限遊べるフィールドを生成できます。

Ver0.42時点の生成マップは最終美術ではありません。地形・接続・通行・配置余地を実機で確認するための仮実マップです。全体構成確定後に正式背景・施設・当たり判定へ差し替えても、SceneSpec/RuntimeSceneのデータ構造は維持します。

### 配置

画像アセットは変更していません。ZIP内の `test/frontier/` の7ファイルを `/test/frontier/` へ上書きしてください。Ver0.33以降の既存PNGはそのまま使用します。

## Ver0.42 修正
- SceneSpec生成エリアで renderer JS が未反映・旧キャッシュの場合でも、暗い背景＋キャラだけにならない安全fallback描画を追加。
- generated area renderer は実行時に `window.FRENDA_FRONTIER_RENDERER` から再取得し、読み込み順・旧参照の影響を回避。
- renderer version sentinel: `RENDERER_VERSION=0.41`。


## Ver0.42 実機修正
- iPhone実機で `renderer未反映→安全表示` になるケースを確認。
- SceneSpec生成エリアの基礎描画を `frontier-ui.js` 側へ統合し、`frontier-render.js` の読込タイミング・キャッシュに依存しない構成へ変更。
- 生成マップの地形・通行域・施設候補・接続口は従来どおり同一RuntimeSceneを参照。
- `frontier-render.js` は中心開拓地等の高密度描画を担当し、生成エリアの成立条件から分離。
