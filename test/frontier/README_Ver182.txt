Frenda Frontier Ver1.82 最小差分

適用先：GitHub の /test/frontier/

ZIP内の構成（4ファイル）
- test/frontier/index.html
- test/frontier/frontier-sprite-index.js
- test/frontier/frontier-sprites.js
- test/frontier/README_Ver182.txt

アップロードするのはプログラムファイル3点（index.html、frontier-sprite-index.js、frontier-sprites.js）です。READMEは説明用なのでアップロード不要です。

変更内容
- 表示バージョンを1.82へ更新。
- 個別画像ファイルは同梱せず、PokeAPI／Pokémon Showdownの候補URLからドット絵を取得します。
- 全国図鑑No.001〜0649はPokeAPIの第5世代 Black/White画像を優先します。通信失敗や未対応種は他の外部候補を試し、すべて失敗した場合に生成代替絵を表示します。
- `pokemon-sprites/`、`manifest.json`、画像ライセンスファイルはZIPに含めていません。追加アップロード画像は0枚です。

注意
- 外部画像を表示するため、実行時はインターネット接続が必要です。
- 画像ファイルを同梱しない構成ですが、外部画像の表示が利用許諾を意味するわけではありません。公開配布前には各画像の権利・クレジット条件を確認してください。
- iPhone Safariでの実機表示確認は未実施です。
