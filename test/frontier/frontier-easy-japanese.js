/* Frenda Frontier Ver1.143
   Easy Japanese: elementary third-grade level, short readable dialogue.
   Keeps game IDs, data records, controls and saved state unchanged.
   Updated: 2026-11-03 18:55 JST */
(()=>{'use strict';
const F=window.FRENDA_FRONTIER,O=F?.OPENING;if(!F||!O||!O.SCENES)return;
const E=F.EASY_JAPANESE={VERSION:'1.143'};
// The opening sequence uses fixed line indices, so keep exactly eight beats.
const FIRST_STORY=[
 '主人公は森へやって来た。「森に、ふしぎなかいだんができた」と聞いたからだ。',
 '森へつづく道に、大きな荷物をもった旅人が立っている。',
 '気をつけて！　きのう、森の中にかいだんができたんだ。',
 'こまっている人を助けたい。まずは、森を見てこよう。',
 '北の道を進んで。左がわに青く光る石があるよ。',
 '主人公は北へ歩いた。道の左がわで、古い石が光っている。',
 'この石は何だろう？　まず、よく見てみよう。',
 '北の道の左がわにある、青く光る石をしらべよう。'
];
const WORDS=[
 ['ここで帰還する','ここで町に帰る'],
 ['ミッション一覧','今すること'],
 ['街道の休み場','町へつづく道の休み場'],
 ['設営する','立てる'],
 ['設営しました','立てました'],
 ['設営した','立てた'],
 ['設営しよう','立てよう'],
 ['設営し','立て'],
 ['設営用','立てるため'],
 ['設営場所','立てる場所'],
 ['設営予定地','立てる場所'],
 ['建築する','たてる'],
 ['建築しよう','たてよう'],
 ['建築した','たてた'],
 ['建築して','たてて'],
 ['建築費','工事のお金'],
 ['確認する','たしかめる'],
 ['確認して','たしかめて'],
 ['確認した','たしかめた'],
 ['確認しよう','たしかめよう'],
 ['確認しました','たしかめました'],
 ['販売する','売る'],
 ['販売した','売った'],
 ['販売して','売って'],
 ['営業する','店を開く'],
 ['営業しよう','店を開こう'],
 ['営業中','店が開いています'],
 ['回復する','なおる'],
 ['回復した','なおった'],
 ['回復して','なおって'],
 ['救助する','助ける'],
 ['救助した','助けた'],
 ['救助しよう','助けよう'],
 ['救助し','助け'],
 ['整備する','きれいにする'],
 ['整備した','きれいにした'],
 ['整備して','きれいにして'],
 ['状態異常','からだのようす'],
 ['森の入口に、まだ名のない町','森のそばの小さな町'],
 ['青白い光の手がかり','青く光る石のひみつ'],
 ['最初の探索へ','はじめてのぼうけん'],
 ['はじめての拠点','はじめてのテント'],
 ['最初の収穫','はじめての持ち帰り'],
 ['旅の職人ミナ','もの作りがとくいなミナ'],
 ['店を広げる約束','お店を大きくしよう'],
 ['広がる店と新しい仲間','お店が大きくなった'],
 ['旅商人の約束','旅のしょう人リオ'],
 ['旅人のための建築','旅人のためのたてもの'],
 ['旅人の集まる町','旅人が集まる町'],
 ['酒場に残された噂','酒場で聞いた話'],
 ['森と町の約束','森と町のやくそく'],
 ['新しい家とお店の工事','家とお店を作ろう'],
 ['小さな患者','テントで休むニャオハ'],
 ['ニャオハのための初探索','ニャオハのためのぼうけん'],
 ['薬草を届けた日','薬草をとどけた日'],
 ['ともに暮らす選択','いっしょにくらす？'],
 ['森との小さなつながり','森に帰るニャオハ'],
 ['森との小さな約束','森とのやくそく'],
 ['ポケモンとともにある町','ポケモンとくらす町'],
 ['開拓者','主人公'],
 ['旅の冒険者','旅人'],
 ['冒険者たち','旅人たち'],
 ['冒険者','旅人'],
 ['ナレーション','おはなし'],
 ['次の目的','次にすること'],
 ['酒場兼宿屋','酒場とやど'],
 ['冒険掲示板','ぼうけんのお知らせ板'],
 ['鍛冶職人','かじ屋さん'],
 ['鍛冶工房','かじ屋'],
 ['鍛冶屋','かじ屋'],
 ['旅商人','旅のしょう人'],
 ['木造店舗','木のお店'],
 ['拡張店舗','大きなお店'],
 ['店舗専用','お店だけの'],
 ['専用住宅','家'],
 ['住宅','家'],
 ['施設','たてもの'],
 ['建築予定地','たてる場所'],
 ['店舗','お店'],
 ['露店','小さなお店'],
 ['設営','せつえい'],
 ['設置','せっち'],
 ['建築','工事'],
 ['拠点','帰る場所'],
 ['街道','町へつづく道'],
 ['迷宮','ふしぎな森'],
 ['階段','かいだん'],
 ['平原','草原'],
 ['探索','ぼうけん'],
 ['冒険','ぼうけん'],
 ['危険','きけん'],
 ['突然','とつぜん'],
 ['昨日','きのう'],
 ['前日','前の日'],
 ['荷物','にもつ'],
 ['背負って','せおって'],
 ['背負った','せおった'],
 ['噂','うわさ'],
 ['確認','かくにん'],
 ['正体','しょうたい'],
 ['状況','ようす'],
 ['異変','おかしなこと'],
 ['異常','おかしい'],
 ['状態','ようす'],
 ['回復','かいふく'],
 ['怪我','けが'],
 ['救助','きゅうじょ'],
 ['看病','おせわ'],
 ['治療','手当て'],
 ['信頼','しんらい'],
 ['一緒','いっしょ'],
 ['共生','いっしょにくらす'],
 ['自然','しぜん'],
 ['不思議','ふしぎ'],
 ['不思議な','ふしぎな'],
 ['必ず','かならず'],
 ['次第','しだい'],
 ['素材','ざいりょう'],
 ['資材','ざいりょう'],
 ['材料','ざいりょう'],
 ['木材','木'],
 ['鉄のかけら','鉄'],
 ['商品棚','しょうひんだな'],
 ['商品','品物'],
 ['陳列','ならべる'],
 ['開業','開店'],
 ['営業','えいぎょう'],
 ['販売','はんばい'],
 ['売上','売れたお金'],
 ['商売','お店'],
 ['市場','いちば'],
 ['商人','しょう人'],
 ['工房','作業場'],
 ['道具袋','どうぐぶくろ'],
 ['旅人向け','旅人のため'],
 ['荷車','にぐるま'],
 ['食料','食べ物'],
 ['薬草','薬草'],
 ['準備','じゅんび'],
 ['用意','ようい'],
 ['必要','ひつよう'],
 ['深く潜る','深く進む'],
 ['秘密','ひみつ'],
 ['謎','なぞ'],
 ['最深部','いちばん奥'],
 ['最初','はじめ'],
 ['最後','さいご'],
 ['完成','できあがり'],
 ['整備','せいび'],
 ['予定','よてい'],
 ['確認待ち','たしかめるのをまっている'],
 ['処理','しょり'],
 ['住民','町の人'],
 ['定住','住みはじめる'],
 ['目的','めあて'],
 ['依頼','おねがい'],
 ['装備','そうび'],
 ['武器','ぶき'],
 ['防具','ぼうぐ'],
 ['敵','てき'],
 ['所持金','もっているお金'],
 ['所持品','もちもの'],
 ['所持','もっている'],
 ['経過','すぎた'],
 ['進捗','進みぐあい'],
 ['達成','できた'],
 ['経験値','けいけんち'],
 ['図鑑','ずかん'],
 ['戦闘','たたかい'],
 ['情報','じょうほう'],
 ['攻撃','こうげき'],
 ['防御','まもり'],
 ['素振り','すぶり'],
 ['罠','わな'],
 ['建設','工事'],
 ['職人','もの作りの人'],
 ['立派','りっぱ'],
 ['痛め','いため'],
 ['痛い','いたい'],
 ['驚','おどろ'],
 ['逃げ','にげ'],
 ['伏せ','ふせ'],
 ['困','こま'],
 ['腕','うで'],
 ['胸','むね'],
 ['別','べつ'],
 ['手狭','せまい'],
 ['杭','木のぼう'],
 ['布','ぬの'],
 ['揺','ゆ'],
 ['窓','まど'],
 ['戻','もど'],
 ['傷んだ','いたんだ'],
 ['傷','きず'],
 ['仲間','なかま'],
 ['暮らす','くらす'],
 ['暮らし','くらし'],
 ['暮れる','日がしずむ'],
 ['続','つづ'],
 ['灯り','あかり'],
 ['響','ひび'],
 ['迎','むか'],
 ['伸','の'],
 ['満腹度','おなか'],
 ['状態異常','からだのようす'],
 ['序章','はじまり'],
 ['終章','おわり'],
 ['章','しょう'],
 ['物語','おはなし'],
 ['開拓','町づくり'],
 ['修業','しゅぎょう'],
 ['腕を磨き','うでをみがき'],
 ['木工','木のしごと'],
 ['鍛冶','かじ'],
 ['相談','そうだん'],
 ['工事','工事'],
 ['街','町'],
 ['守る','守る'],
 ['傷んだ','いたんだ'],
 ['傷','きず'],
 ['遠く','遠く'],
 ['他','ほか'],
 ['沿い','そば'],
 ['付近','ちかく'],
 ['周囲','まわり'],
 ['周辺','まわり'],
 ['変化','かわること'],
 ['向こう','むこう'],
 ['届く','とどく'],
 ['届ける','とどける'],
 ['手続','てつづき'],
 ['受付','うけつけ'],
 ['移動','いどう'],
 ['一度','一回'],
 ['一旦','いったん'],
 ['無事','ぶじ'],
 ['目印','めじるし'],
 ['模様','もよう'],
 ['刻まれ','ほられ'],
 ['腰ほど','おなかくらい'],
 ['壊れ','こわれ'],
 ['調べ','しらべ'],
 ['見つめ','見て'],
 ['見慣れない','見たことのない'],
 ['気づい','気がつい'],
 ['現れ','出てき'],
 ['荒れ','あれ'],
 ['賑わ','にぎわ'],
 ['預かり所','にもつをあずける所'],
 ['別棟','べつのたてもの'],
 ['打つ','打つ'],
 ['設計','せっけい'],
 ['客席','おきゃくさんのせき'],
 ['掲示板','お知らせ板'],
 ['専門','せんもん'],
 ['裏','うら'],
 ['外観','見た目'],
 ['通知','お知らせ'],
 ['履歴','きろく'],
 ['中止','やめる'],
 ['停止','とめる'],
 ['回収','あつめる'],
 ['一部','一部'],
 ['最大','いちばん大きい'],
 ['最小','いちばん小さい'],
 ['名前','名前']
];
// Exact phrase replacements only: no script identifiers, stored game records or data fields.
function simplify(s){
 let x=String(s??'');
 for(const [from,to] of WORDS)if(x.includes(from))x=x.split(from).join(to);
 x=x.replace(/お店をお店を開く/g,'お店を開く')
    .replace(/お店を店を開く/g,'お店を開く')
    .replace(/店を店を開く/g,'店を開く')
    .replace(/かくにんする/g,'たしかめる');
 // Small punctuation and reading improvements, without altering numbers or item IDs.
 x=x.replace(/――/g,'。').replace(/……/g,'…');
 return x;
}
E.simplify=simplify;
E.firstStory=FIRST_STORY;
const original=O.SCENES;
O.SCENES=Object.freeze(Object.fromEntries(Object.entries(original).map(([id,scene])=>{
 const originalLines=scene.lines||[];
 let lines=originalLines.map((line,i)=>({
   ...line,
   speaker:simplify(line.speaker),
   text:id==='arrival'&&FIRST_STORY[i]!==undefined?FIRST_STORY[i]:simplify(line.text)
 }));
 // The cinematic directly uses arrival[0..7] and must retain the same count.
 // Other scenes can break long speech into short, manually paced lines.
 if(id!=='arrival')lines=lines.flatMap(line=>{
   if(line.text.length<65||line.speaker==='次にすること')return[line];
   const parts=line.text.split(/(?<=[。！？])/u).filter(Boolean);
   if(parts.length<2)return[line];
   return parts.map(text=>({...line,text}));
 });
 return[id,Object.freeze({...scene,title:simplify(scene.title),chapter:simplify(scene.chapter),lines:Object.freeze(lines)})];
})));
// Lightweight UI text simplifier. It does not change input values, game state,
// Canvas coordinates, source code, attributes or text inside editable controls.
let busy=false;const queue=new Set();
function applyTextNode(node){
 if(!node||node.nodeType!==3)return;
 const parent=node.parentElement;
 if(!parent||/^(SCRIPT|STYLE|TEXTAREA|CODE|PRE|OPTION)$/.test(parent.tagName)||parent.isContentEditable)return;
 const old=node.nodeValue,updated=simplify(old);
 if(old!==updated)node.nodeValue=updated;
}
function scan(node){
 if(!node)return;
 if(node.nodeType===3){applyTextNode(node);return;}
 if(node.nodeType!==1||/^(SCRIPT|STYLE|TEXTAREA|CODE|PRE|OPTION|SVG)$/.test(node.tagName))return;
 const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);
 while(walker.nextNode())applyTextNode(walker.currentNode);
}
function flush(){busy=false;const items=Array.from(queue);queue.clear();for(const node of items)scan(node);}
function queueNode(node){queue.add(node);if(!busy){busy=true;Promise.resolve().then(flush);}}
if(typeof MutationObserver!=='undefined'){
 const observe=()=>{
   if(!document.body)return;
   queueNode(document.body);
   new MutationObserver(records=>{
     for(const record of records){
       if(record.type==='characterData')queueNode(record.target);
       for(const node of record.addedNodes)queueNode(node);
     }
   }).observe(document.body,{subtree:true,childList:true,characterData:true});
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observe,{once:true});else observe();
}
})();
// Updated: 2026-11-03 18:55 JST / Ver1.143: third-grade-friendly story and UI display text.
