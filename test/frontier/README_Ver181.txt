Frenda Frontier Ver1.81 最小差分

適用先：GitHub の /test/frontier/

ZIP内の構成（3ファイル）
- test/frontier/index.html
- test/frontier/frontier-sprites.js
- test/frontier/README_Ver181.txt

この2つのプログラムファイルを /test/frontier/ の同名ファイルへ上書きしてください。画像フォルダや個別画像のアップロードは不要です。

変更内容
- 表示バージョンを1.81へ更新。
- PokeAPI画像、Showdown画像、外部図鑑索引の読込を停止。
- ポケモン表示はVer1.79系の生成代替絵を使います。画像取得失敗を待たず、常に代替絵を表示します。
- `pokemon-sprites/` フォルダ、`frontier-sprite-index.js`、画像ライセンス・クレジット一覧は差分から除外しました。

この差分ZIPにポケモン画像ファイルは含まれません。公開用画像の権利とクレジット条件が確認できるまで、外部画像も取得しない構成です。代替絵はコードから描画します。

iPhone Safariでの実機表示確認は未実施です。
