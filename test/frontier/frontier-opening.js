/* Frenda Frontier Ver1.128 — character-driven story, gradual mysteries and story pacing. */
(()=>{'use strict';
const F=window.FRENDA_FRONTIER,originalKey=F.SAVE_KEY,storyKey=originalKey+':opening147';
const O=F.OPENING={originalKey,storyKey,rules:Object.freeze({stallWood:3,storeWood:6,storeCoins:150,provisional:true}),levels:[{level:1,name:'露店',shelves:3},{level:2,name:'小屋',shelves:3},{level:3,name:'木造店舗',shelves:4},{level:4,name:'拡張店舗',shelves:5},{level:5,name:'店舗兼住宅',shelves:6},{level:6,name:'店舗専用＋専用住宅',shelves:9}],tentBox:{x:610,y:105,w:96,h:80},stallBox:{x:730,y:215,w:122,h:70},shopBox:{x:688,y:82,w:176,h:172}};
const initial=()=>({phase:'arrival',woodReturned:0,goodsReturned:0,mission1:false,mission2:false,prologueVersion:2,entranceInspected:false,prologueComplete:false,tentPitched:false,endingSeen:false,sceneQueue:[],sceneSeen:{}});
O.active=()=>F.SAVE_KEY===storyKey||F.SAVE_KEY.startsWith(originalKey+':mission148test:');
O.isTestPoint=()=>F.SAVE_KEY.includes(':mission148test:');
O.SCENES=Object.freeze({
 arrival:{chapter:'序章',title:'森の入口に、まだ名のない町',icon:'🌲',lines:[
  {speaker:'ナレーション',text:'旅人の道が途切れる場所。木々の手前に、大きな荷物を背負った旅の冒険者が立っている。',icon:'🌲'},
  {speaker:'ナレーション',text:'旅の冒険者は、森の奥へ伸びる道を心配そうに見つめていた。昨日、この先に見慣れない階段が現れたという。',icon:'🪜'},
  {speaker:'旅の冒険者',text:'あんたも、あの穴を見に来たのか？　昨日まで何もなかった場所だ。',portrait:'traveler'},
  {speaker:'開拓者',text:'迷宮……？　こんなところに、どうして。',portrait:'player'},
  {speaker:'旅の冒険者',text:'中へ入った仲間は戻ったが、食料も道具も底をついていた。帰る場所さえあればな。',portrait:'traveler'},
  {speaker:'ナレーション',text:'ふたりが北の道を進むと、草むらに埋もれた古い石が見えた。刻まれた模様が、青白くまたたいている。',icon:'✨'},
  {speaker:'開拓者',text:'まずは入口を調べよう。それから、みんなが帰ってこられる場所を作る。',portrait:'player'},
  {speaker:'次の目的',text:'北の道を登り、森の入口にある古い石を調べよう。',icon:'📜'}
 ]},
 entranceClue:{chapter:'序章',title:'青白い光の手がかり',icon:'✨',lines:[
  {speaker:'ナレーション',text:'道の脇に、腰ほどの高さの古い石が立っていた。割れた表面には木の根のような模様が刻まれ、そのすき間が青白く光っている。',icon:'🪨'},
  {speaker:'開拓者',text:'光っているのは、この石そのもの……？　木の根の模様が、森の奥を指しているようにも見える。',portrait:'player'},
  {speaker:'旅の冒険者',text:'森の奥では「森の主」が道を守る……そんな昔話がある。確かなことは誰も知らない。',portrait:'traveler'},
  {speaker:'開拓者',text:'調べるのはあとでもできる。先に、安全に帰ってこられる目印が必要だ。',portrait:'player'},
  {speaker:'ナレーション',text:'開けた草地にテントを張れば、迷宮帰りの旅人を迎えられそうだ。',icon:'⛺'},
  {speaker:'次の目的',text:'草地のテント予定地へ歩いていき、そこで設営しよう。',icon:'📜'}
 ]},
 camp:{chapter:'序章',title:'はじめての拠点',icon:'⛺',lines:[
  {speaker:'ナレーション',text:'草地に一本の杭が打たれ、やがて小さなテントが立った。',icon:'⛺'},
  {speaker:'旅の冒険者',text:'助かるよ。これで迷宮から戻ったとき、ひと息つける。',portrait:'traveler'},
  {speaker:'開拓者',text:'でも、休むだけでは足りない。薬草や食べ物を置ける店も必要だ。',portrait:'player'},
  {speaker:'旅の冒険者',text:'最初は露店でいい。木材さえ集まれば、誰かの役に立つ店になる。',portrait:'traveler'},
  {speaker:'ナレーション',text:'森の入口にはまだ建物も人通りもない。それでも、小さな町の一歩が始まった。',icon:'🌱'},
  {speaker:'次の目的',text:'北の道を登り、はじまりの森へ入ろう。',icon:'📜'}
 ]},
 firstDeparture:{chapter:'序章',title:'最初の探索へ',icon:'🗡️',lines:[
  {speaker:'開拓者',text:'露店を作るため、木材を三つ。それから売るための商品を一つ以上。',portrait:'player'},
  {speaker:'旅の冒険者',text:'迷宮では、一歩進むたびに敵も動く。HPと満腹度を見て、無理をしないことだ。',portrait:'traveler'},
  {speaker:'旅の冒険者',text:'道具は「持ち物」から使える。武器の種類によって、届く距離も違う。',portrait:'traveler'},
  {speaker:'開拓者',text:'帰るときはロープだね。拾ったものを持ち帰れなければ、店は作れない。',portrait:'player'},
  {speaker:'旅の冒険者',text:'そのとおり。今回は深く潜る必要はない。B1Fで材料を集めたら帰ってこよう。',portrait:'traveler'},
  {speaker:'ナレーション',text:'テントの向こうに、はじまりの森へ続く道が見える。',icon:'🌲'},
  {speaker:'次の目的',text:'北の道からはじまりの森へ。B1Fで木材3個と商品1点を拾い、ロープで帰ろう。',icon:'📜'}
 ]},
 firstReturn:{chapter:'第1章',title:'最初の収穫',icon:'🪵',lines:[
  {speaker:'ナレーション',text:'冒険から戻ると、テントの前に旅人が集まっていた。',icon:'⛺'},
  {speaker:'旅の冒険者',text:'戻ってきた！　無事でよかった。荷物がずいぶん増えているね。',portrait:'traveler'},
  {speaker:'開拓者',text:'木材と、売れそうな品を持ってきた。これなら店を始められる。',portrait:'player'},
  {speaker:'旅の冒険者',text:'食べ物や薬が買える場所があれば、もっと奥へ挑める人も増えるだろう。',portrait:'traveler'},
  {speaker:'ナレーション',text:'集めた素材が、冒険者たちの暮らしにつながっていく。',icon:'🌱'},
  {speaker:'次の目的',text:'木材3個で露店を設営し、商品を1点以上並べて開業しよう。',icon:'📜'}
 ]},
 stallOpen:{chapter:'第1章',title:'はじめての店',icon:'🏮',lines:[
  {speaker:'ナレーション',text:'木の棚に商品を並べると、森の入口に小さな露店が開いた。',icon:'🏮'},
  {speaker:'旅の冒険者',text:'こんな場所に店ができるなんて。これなら次の冒険も安心だ。',portrait:'traveler'},
  {speaker:'開拓者',text:'まだ一人もお客さんが来ていないけど、きっと役に立つはず。',portrait:'player'},
  {speaker:'次の目的',text:'露店で営業し、最初のお客さんに商品を届けよう。',icon:'📜'}
 ]},
 firstSale:{chapter:'第1章',title:'最初のお客さん',icon:'🪙',lines:[
  {speaker:'旅の冒険者',text:'これがあって助かった！　次は少し奥まで行けそうだ。',portrait:'traveler'},
  {speaker:'開拓者',text:'ありがとう。この店を、みんなが立ち寄れる場所に育てよう。',portrait:'player'},
  {speaker:'旅の冒険者',text:'そういえば、奥で青白い光を見た人がいる。あの古い石の模様と関係があるのかもな。',portrait:'traveler'},
  {speaker:'開拓者',text:'町を育てながら、森の秘密も少しずつ確かめていこう。',portrait:'player'},
  {speaker:'次の目的',text:'木材6個と150Gを集め、店舗Lv2の小屋を建てよう。',icon:'📜'}
 ]},
 forestRumor:{chapter:'第2章',title:'森の奥の光',icon:'✨',lines:[
  {speaker:'ナレーション',text:'町を訪れる人が増えるにつれて、森の奥の光の噂も広がった。',icon:'🌲'},
  {speaker:'旅の冒険者',text:'最深部には森の主がいる。あの場所を荒らす者を追い返しているらしい。',portrait:'traveler'},
  {speaker:'開拓者',text:'秘宝を持ち帰るだけでは、森を傷つけてしまうかもしれない。',portrait:'player'},
  {speaker:'次の目的',text:'装備と物資を整え、はじまりの森のB30Fを目指そう。',icon:'📜'}
 ]},
 shopComplete:{chapter:'第1章',title:'帰る場所をつくる',icon:'🏠',lines:[
  {speaker:'ナレーション',text:'テント脇の露店に代わって、小さな木の店が完成した。',icon:'🏠'},
  {speaker:'旅の冒険者',text:'おかえり、と言ってくれる場所ができたんだな。',portrait:'traveler'},
  {speaker:'開拓者',text:'ここから少しずつ大きくしよう。この町なら、きっとできる。',portrait:'player'},
  {speaker:'次の目的',text:'商売と冒険を続けて町を育て、森の奥の謎を探ろう。',icon:'📜'}
 ]},
 lv3Visitor:{chapter:'第1章',title:'旅の職人ミナ',icon:'🛠️',lines:[
  {speaker:'ナレーション',text:'小さな店の前に、道具袋を背負った旅の職人が立ち止まった。',icon:'🛠️'},
  {speaker:'ミナ',text:'この店、いいですね。でも迷宮から戻る人が増えると、棚が足りなくなりそう。',portrait:'traveler'},
  {speaker:'開拓者',text:'実は、もっと多くの道具を置ける店にしたいんだ。',portrait:'player'},
  {speaker:'ミナ',text:'私はミナ。木工も鍛冶も勉強中です。木材と費用があれば、棚を増やす工事を手伝えますよ。',portrait:'traveler'},
  {speaker:'開拓者',text:'一緒にやってみよう。ここが、旅人を支える町になるように。',portrait:'player'},
  {speaker:'次の目的',text:'木材5個と220Gを集め、店の前でミナに相談しよう。',icon:'📜'}
 ]},
 lv3Start:{chapter:'第1章',title:'店を広げる約束',icon:'🏗️',lines:[
  {speaker:'ミナ',text:'資材は揃いました！　まず柱を立てて、売り場を広げます。',portrait:'traveler'},
  {speaker:'開拓者',text:'今度は四つ目の棚も置けそうだね。',portrait:'player'},
  {speaker:'ミナ',text:'工事中は無理に触らず、森へ出かけて戻ってきたら見に来てください。',portrait:'traveler'},
  {speaker:'次の目的',text:'冒険などで時間を進めた後、店の前で工事の完成を確認しよう。',icon:'📜'}
 ]},
 lv3Finished:{chapter:'第1章',title:'広がる店と新しい仲間',icon:'🏪',lines:[
  {speaker:'ナレーション',text:'木の香りが残る新しい店に、四つ目の商品棚が置かれた。',icon:'🏪'},
  {speaker:'ミナ',text:'これでたくさんの品を並べられます。私も、この町で腕を磨きたいな。',portrait:'traveler'},
  {speaker:'開拓者',text:'いつか工房も作ろう。ここに戻ってきてくれる人が増えるといい。',portrait:'player'},
  {speaker:'ミナ',text:'約束です。森の奥の光も気になりますが、まずはこの町を強くしましょう。',portrait:'traveler'},
  {speaker:'次の目的',text:'店舗Lv3完成。冒険と商売を続け、町の次の発展と森の調査に備えよう。',icon:'📜'}
 ]},
 lv4Invite:{chapter:'第1章',title:'ミナの決心',icon:'⚒️',lines:[
  {speaker:'ナレーション',text:'店が大きくなったある朝、ミナは森の奥から持ち帰られた鉄のかけらを見つめていた。',icon:'🌲'},
  {speaker:'ミナ',text:'これだけ良い鉄があるなら、ここに鍛冶屋を作れます。傷んだ剣や防具を直せる場所があれば、冒険者も安心して森へ行けますよ。',portrait:'traveler'},
  {speaker:'開拓者',text:'工房があれば、森で得た素材もただ売るだけでなく役に立つね。',portrait:'player'},
  {speaker:'ミナ',text:'私もこの町で暮らして働きたい。工房と住む家、それにお店を少し広げるための材料を集めてくれませんか？',portrait:'traveler'},
  {speaker:'次の目的',text:'木材8個・鉄のかけら3個・350Gを集め、西の工房予定地でミナと相談する。',icon:'📜'}
 ]},
 lv4Start:{chapter:'第1章',title:'鍛冶の火を灯すために',icon:'🏗️',lines:[
  {speaker:'ミナ',text:'集めてくれた材料で、工房と小さな家を建てます。お店にも五つ目の棚を作りますね。',portrait:'traveler'},
  {speaker:'開拓者',text:'新しい町の景色が見えてきたね。',portrait:'player'},
  {speaker:'次の目的',text:'森を探索するなどして時間を進め、西の工房予定地で完成を確認する。',icon:'📜'}
 ]},
 lv4Finished:{chapter:'第1章',title:'職人の住む町',icon:'⚒️',lines:[
  {speaker:'ナレーション',text:'金床が響く音と、炉の火が町に新しい朝を告げる。工房の隣にはミナの住まいもできた。',icon:'🏠'},
  {speaker:'ミナ',text:'これからはこの町の職人です。朝から昼は鍛冶屋で仕事をして、夕方には家に戻ります。',portrait:'traveler'},
  {speaker:'開拓者',text:'みんなが戻れる場所がまた一つ増えた。ありがとう、ミナ。',portrait:'player'},
  {speaker:'ミナ',text:'装備中の武器なら工房で強化できます。鉄のかけらと加工費を忘れずに。',portrait:'traveler'},
  {speaker:'次の目的',text:'工房でミナの仕事を確認し、冒険の装備を整えよう。',icon:'📜'}
 ]},
 lv5Merchant:{chapter:'第1章',title:'旅商人の約束',icon:'🧺',lines:[
  {speaker:'ナレーション',text:'工房から金床の音が聞こえる昼下がり。東の街道を荷車がゆっくりと近づいてきた。',icon:'🛞'},
  {speaker:'旅商人リオ',text:'森の迷宮に入る冒険者が増えたと聞きました。でも道中で食料や薬草を買える場所が少なくて困っています。',portrait:'traveler'},
  {speaker:'開拓者',text:'ここに市場があれば、必要な品を買えて、冒険で持ち帰った品も役立てられるね。',portrait:'player'},
  {speaker:'旅商人リオ',text:'宿もあると、夜まで休めない旅人を助けられます。掲示板には森で見た青い光の噂を書き残せそう。',portrait:'traveler'},
  {speaker:'次の目的',text:'東の予定地に市場・酒場兼宿屋・掲示板を建てよう。まず材料を集めます。',icon:'📜'}
 ]},
 lv5Start:{chapter:'第1章',title:'旅人のための建築',icon:'🏗️',lines:[
  {speaker:'旅商人リオ',text:'資材がそろいました！ 市場の棚、酒場の客席、冒険掲示板をいっしょに作りましょう。',portrait:'traveler'},
  {speaker:'ミナ',text:'工房の道具も使えます。私はお店の六つ目の棚を仕上げますね。',portrait:'traveler'},
  {speaker:'次の目的',text:'冒険や商売で時間を進め、東の建築予定地で完成を確認しましょう。',icon:'📜'}
 ]},
 lv5Finished:{chapter:'第1章',title:'旅人の集まる町',icon:'🏮',lines:[
  {speaker:'ナレーション',text:'町に市場の呼び声が響き、夕暮れになると酒場の窓に明かりがともった。道の中央には新しい掲示板がある。',icon:'🏮'},
  {speaker:'旅商人リオ',text:'市場には毎日品物が並びます。今度の冒険に必要な食料を買い足してください。',portrait:'traveler'},
  {speaker:'ミナ',text:'これでお店は六つの棚になりました。鍛冶屋にも新しいお客さんが来てくれそうです。',portrait:'traveler'},
  {speaker:'開拓者',text:'人が増えれば森の手がかりも集まる。この町を迷宮を調べる人たちの拠点にしよう。',portrait:'player'},
  {speaker:'次の目的',text:'完成した酒場兼宿屋を訪れ、旅人の声を聞こう。',icon:'📜'}
 ]},
 lv5Tavern:{chapter:'第1章',title:'酒場に残された噂',icon:'🍺',lines:[
  {speaker:'旅商人リオ',text:'今朝、森から帰った冒険者が「最深部の青白い光」を見たそうです。',portrait:'traveler'},
  {speaker:'開拓者',text:'最初に見たあの光と同じだ。もっと深い階に何かがありそうだね。',portrait:'player'},
  {speaker:'次の目的',text:'準備を整え、はじまりの森の最深部を目指そう。',icon:'🌲'}
 ]},
 forestEnding:{chapter:'終章',title:'森と町の約束',icon:'🌳',lines:[
  {speaker:'ナレーション',text:'最深部。森の主は、最後まで行く手を守るように立ちはだかった。',icon:'🌲'},
  {speaker:'森の主',text:'言葉はない。ただ、森を守るようにこちらを見つめている。',portrait:'forest',icon:'🌳'},
  {speaker:'開拓者',text:'宝だけを持ち帰るつもりはない。森と町の両方を守れる道を探そう。',portrait:'player'},
  {speaker:'ナレーション',text:'森の主は道をあけた。秘宝の力は森と町へ広がり、荒れた土地を少しずつ潤していく。',icon:'✨'},
  {speaker:'旅の冒険者',text:'この町があるから、みんなまた冒険に出られるんだね。',portrait:'traveler'},
  {speaker:'開拓者',text:'帰ってきたみんなが「ただいま」と言える町にしよう。',portrait:'player'},
  {speaker:'次の目的',text:'物語はひと区切り。町づくりと冒険はこれからも続く。',icon:'📜'}
 ]}
});
// Ver1.124: chapter continuation after the Lv2 shop. All data are optional for old saves.
O.LV3_COST=Object.freeze({wood:5,coins:220,steps:2});
O.lv3Status=(s=F.readSave())=>{
 const o=s?.story?.opening||{},lv=Number(s?.development?.town?.facilities?.shop)||0;
 if(lv>=3||o.lv3Finished)return{phase:'finished',lv,wood:Number(s?.warehouse?.wood)||0,coins:Number(s?.coins)||0};
 if(o.phase!=='complete'||lv<2)return{phase:'locked',lv};
 const wood=Math.max(0,Number(s.warehouse?.wood)||0),coins=Math.max(0,Number(s.coins)||0);
 const project=o.lv3Project,elapsed=project?Math.max(0,(Number(s.clock?.actionCount)||0)-(Number(project.startedAt)||0)):0;
 if(project)return{phase:elapsed>=Math.max(1,Number(project.steps)||O.LV3_COST.steps)?'finish':'building',lv,wood,coins,elapsed,steps:Math.max(1,Number(project.steps)||O.LV3_COST.steps)};
 if(!o.lv3Met)return{phase:'meet',lv,wood,coins};
 return{phase:wood>=O.LV3_COST.wood&&coins>=O.LV3_COST.coins?'ready':'gather',lv,wood,coins};
};
O.meetLv3=()=>F.mutateSave(s=>{const st=O.lv3Status(s);if(st.phase!=='meet')throw new Error('今はミナとの面会を開始できません。');const o=s.story.opening;o.lv3Met=true;O.enqueueSceneInSave(s,'lv3Visitor');F.addHistory(s,'story','旅の職人ミナと出会い、店舗Lv3への増築を相談した。')});
O.startLv3Build=()=>F.mutateSave(s=>{const st=O.lv3Status(s);if(st.phase!=='ready')throw new Error('木材5個と220G、ミナとの約束が必要です。');const o=s.story.opening;s.warehouse.wood-=O.LV3_COST.wood;if(s.warehouse.wood<=0)delete s.warehouse.wood;s.coins-=O.LV3_COST.coins;o.lv3Project={startedAt:Number(s.clock?.actionCount)||0,steps:O.LV3_COST.steps,paid:true};O.enqueueSceneInSave(s,'lv3Start');F.addHistory(s,'construction','ミナと店舗Lv3の増築を開始。木材5個と220Gを支払った。')});
O.finishLv3Build=()=>F.mutateSave(s=>{const st=O.lv3Status(s);if(st.phase!=='finish')throw new Error('増築工事はまだ終わっていません。');const o=s.story.opening;delete o.lv3Project;o.lv3Finished=true;s.development.town.facilities.shop=3;s.development.town.shopLevel=3;s.shelves=Array.isArray(s.shelves)?s.shelves:[];while(s.shelves.length<4)s.shelves.push(null);O.enqueueSceneInSave(s,'lv3Finished');F.addHistory(s,'construction','店舗Lv3が完成。四つ目の商品棚を設置した。')});
// Ver1.125: One-at-a-time Lv4 quests; build the existing forge/house, not duplicate residents or services.
O.LV4_COST=Object.freeze({wood:8,iron:3,coins:350,steps:3,shopShelves:5});
O.lv4Status=(s=F.readSave())=>{
 const o=s?.story?.opening||{},lv=Math.max(0,Number(s?.development?.town?.facilities?.shop)||0);
 const wood=Math.max(0,Number(s?.warehouse?.wood)||0),iron=Math.max(0,Number(s?.warehouse?.iron)||0),coins=Math.max(0,Number(s?.coins)||0);
 if(!o||o.phase!=='complete'||lv<3)return{phase:'locked',lv,wood,iron,coins};
 if(lv>=4||o.lv4Finished)return{phase:'finished',lv,wood,iron,coins};
 const project=o.lv4Project;
 if(project){const elapsed=Math.max(0,(Number(s.clock?.actionCount)||0)-(Number(project.startedAt)||0)),steps=Math.max(1,Number(project.steps)||O.LV4_COST.steps);
  return{phase:elapsed>=steps?'finish':'building',lv,wood,iron,coins,elapsed,steps};}
 if(!o.lv4Met)return{phase:'meet',lv,wood,iron,coins};
 return{phase:wood>=O.LV4_COST.wood&&iron>=O.LV4_COST.iron&&coins>=O.LV4_COST.coins?'ready':'gather',lv,wood,iron,coins};
};
O.visitLv4Workshop=()=>F.mutateSave(s=>{
 if(!s.story?.opening?.lv4Finished||s.story.opening.lv4WorkshopVisited)return;
 if((Number(s.development?.town?.facilities?.forge)||0)<1)return;
 s.story.opening.lv4WorkshopVisited=true;F.addHistory(s,'story','完成した鍛冶屋を訪れ、ミナの仕事を確認した。');
});
O.meetLv4=()=>F.mutateSave(s=>{const st=O.lv4Status(s);if(st.phase!=='meet')throw new Error('工房の話は店舗Lv3完成後に始まります。');s.story.opening.lv4Met=true;O.enqueueSceneInSave(s,'lv4Invite');F.addHistory(s,'story','ミナと職人の定住・鍛冶屋の建設について相談した。')});
O.startLv4Build=()=>F.mutateSave(s=>{const st=O.lv4Status(s),cost=O.LV4_COST;if(st.phase!=='ready')throw new Error('木材8個・鉄3個・350Gとミナとの相談が必要です。');
 s.warehouse.wood-=cost.wood;if(s.warehouse.wood<=0)delete s.warehouse.wood;
 s.warehouse.iron-=cost.iron;if(s.warehouse.iron<=0)delete s.warehouse.iron;
 s.coins-=cost.coins;s.story.opening.lv4Project={startedAt:Number(s.clock?.actionCount)||0,steps:cost.steps,paid:true};
 O.enqueueSceneInSave(s,'lv4Start');F.addHistory(s,'construction','店舗Lv4・鍛冶屋・ミナの住居の建築を開始（木材8、鉄3、350G）。')});
O.finishLv4Build=()=>F.mutateSave(s=>{const st=O.lv4Status(s);if(st.phase!=='finish')throw new Error('建設工事はまだ終わっていません。');
 const o=s.story.opening;delete o.lv4Project;o.lv4Finished=true;
 const t=s.development.town;t.facilities=t.facilities||{};
 t.facilities.shop=Math.max(4,Number(t.facilities.shop)||0);t.shopLevel=t.facilities.shop;
 // Source of truth is the existing facilities map used by forge, resident and town renderer.
 for(const id of ['warehouse','forge','house'])t.facilities[id]=Math.max(1,Number(t.facilities[id])||0);
 t.forgeBuilt=true;t.houseBuilt=true;t.residentCount=Math.max(1,Number(t.residentCount)||0);
 s.shelves=Array.isArray(s.shelves)?s.shelves:[];while(s.shelves.length<O.LV4_COST.shopShelves)s.shelves.push(null);
 // N.ensure later provides the settler record exactly once; we do not pre-create it here.
 O.enqueueSceneInSave(s,'lv4Finished');F.addHistory(s,'construction','店舗Lv4・鍛冶屋・ミナの住居が完成。棚5枠、職人1名の生活拠点ができた。')});
// Ver1.126: All new progress fields are optional inside story.opening (no save-schema reset).
O.LV5_COST=Object.freeze({wood:10,iron:4,coins:500,steps:4,shopShelves:6});
O.lv5Status=(s=F.readSave())=>{
 const o=s?.story?.opening||{},lv=Math.max(0,Number(s?.development?.town?.facilities?.shop)||0);
 const wood=Math.max(0,Number(s?.warehouse?.wood)||0),iron=Math.max(0,Number(s?.warehouse?.iron)||0),coins=Math.max(0,Number(s?.coins)||0);
 if(lv>=5||o.lv5Finished)return{phase:'finished',lv,wood,iron,coins};
 const legacyLv4=lv===4&&!o.lv4Finished&&(Number(s?.development?.town?.facilities?.forge)||0)>=1;
 if(o.phase!=='complete'||lv<4||(!o.lv4WorkshopVisited&&!legacyLv4))return{phase:'locked',lv,wood,iron,coins};
 const project=o.lv5Project;
 if(project){const elapsed=Math.max(0,(Number(s.clock?.actionCount)||0)-(Number(project.startedAt)||0)),steps=Math.max(1,Number(project.steps)||O.LV5_COST.steps);
  return{phase:elapsed>=steps?'finish':'building',lv,wood,iron,coins,elapsed,steps};}
 if(!o.lv5Met)return{phase:'meet',lv,wood,iron,coins};
 return{phase:wood>=O.LV5_COST.wood&&iron>=O.LV5_COST.iron&&coins>=O.LV5_COST.coins?'ready':'gather',lv,wood,iron,coins};
};
O.meetLv5=()=>F.mutateSave(s=>{const st=O.lv5Status(s);if(st.phase!=='meet')throw new Error('酒場と市場の相談は、鍛冶屋を確認した後に始まります。');
 s.story.opening.lv5Met=true;O.enqueueSceneInSave(s,'lv5Merchant');F.addHistory(s,'story','東の街道で旅商人リオと出会い、市場・酒場兼宿屋・掲示板の建設を相談した。');});
O.startLv5Build=()=>F.mutateSave(s=>{const st=O.lv5Status(s),cost=O.LV5_COST;if(st.phase!=='ready')throw new Error('木材10個・鉄4個・500Gと旅商人リオとの約束が必要です。');
 s.warehouse.wood-=cost.wood;if(s.warehouse.wood<=0)delete s.warehouse.wood;
 s.warehouse.iron-=cost.iron;if(s.warehouse.iron<=0)delete s.warehouse.iron;
 s.coins-=cost.coins;s.story.opening.lv5Project={startedAt:Number(s.clock?.actionCount)||0,steps:cost.steps,paid:true};
 O.enqueueSceneInSave(s,'lv5Start');F.addHistory(s,'construction','市場・酒場兼宿屋・冒険掲示板・店舗Lv5の建設を開始した。');});
O.finishLv5Build=()=>F.mutateSave(s=>{const st=O.lv5Status(s);if(st.phase!=='finish')throw new Error('工事がまだ完成していません。');
 const o=s.story.opening,t=s.development.town;delete o.lv5Project;o.lv5Finished=true;t.facilities=t.facilities||{};
 // Reuse the existing market, inn and adventure board services; do not create parallel facilities.
 t.facilities.shop=Math.max(5,Number(t.facilities.shop)||0);t.shopLevel=t.facilities.shop;
 for(const id of ['market','inn','adventure_board'])t.facilities[id]=Math.max(1,Number(t.facilities[id])||0);
 s.shelves=Array.isArray(s.shelves)?s.shelves:[];while(s.shelves.length<O.LV5_COST.shopShelves)s.shelves.push(null);
 O.enqueueSceneInSave(s,'lv5Finished');F.addHistory(s,'construction','店舗Lv5と市場・酒場兼宿屋・冒険掲示板が完成。既存商品を保持して棚を6枠へ増設した。');});
O.visitLv5Tavern=()=>F.mutateSave(s=>{const o=s.story?.opening;if(!o||o.lv5TavernVisited||Number(s.development?.town?.facilities?.inn)<1||Number(s.development?.town?.facilities?.shop)<5)return;
 o.lv5TavernVisited=true;O.enqueueSceneInSave(s,'lv5Tavern');F.addHistory(s,'story','完成した酒場兼宿屋を訪れ、森の青白い光に関する噂を聞いた。');});
O.ensureSceneState=o=>{if(!Array.isArray(o.sceneQueue))o.sceneQueue=[];if(!o.sceneSeen||typeof o.sceneSeen!=='object')o.sceneSeen={};return o};
O.enqueueSceneInSave=(s,id)=>{const o=O.ensureSceneState(s?.story?.opening||{});if(!s?.story?.opening||!O.SCENES[id]||o.sceneSeen[id]||o.sceneQueue.includes(id))return false;o.sceneQueue.push(id);return true};
O.enqueueScene=id=>{if(!O.active()||O.isTestPoint())return false;let queued=false;F.mutateSave(s=>{queued=O.enqueueSceneInSave(s,id)});return queued};
O.completeScene=id=>{F.mutateSave(s=>{const o=O.ensureSceneState(s?.story?.opening||{});if(!s?.story?.opening)return;o.sceneQueue=o.sceneQueue.filter(x=>x!==id);o.sceneSeen[id]=true});O.presentingScene=false;
 const afterCamp=id==='camp'&&O.active()&&!O.isTestPoint()&&O.phase()==='tent';
 if(afterCamp){O.advance();O.onWorldChanged?.()}
 // Multiple scenes can be queued on the same event. Continue only after the previous dialogue closes.
 if(O.active()&&!O.isTestPoint()&&!afterCamp)setTimeout(()=>O.presentPendingScene(),0);
};
O.presentPendingScene=()=>{if(O.cinematicActive)return false;if(!O.active()||O.isTestPoint()||O.presentingScene||typeof F.playStoryDialogue!=='function')return false;const o=O.ensureSceneState(F.readSave().story?.opening||{}),id=o.sceneQueue[0],scene=O.SCENES[id];if(!scene)return false;O.presentingScene=true;F.playStoryDialogue(scene,()=>O.completeScene(id));return true};
// Approved exterior stages. The maximum shop plot stays reserved at every level.
O.exteriorCrops=[[60,140,310,260],[425,125,410,290],[850,110,420,310],[1275,110,499,310],[8,500,557,320],[570,500,600,320],[1220,520,260,300],[1530,580,230,240]];
O.currentLevel=()=>Math.max(2,Math.min(6,Number((O.visibleState||F.readSave()).development.town.facilities.shop)||2));
O.maxShopPlot={x:646,y:80,w:260,h:174};
O.currentShopBox=()=>{const lv=O.currentLevel(),w=[0,0,148,190,220,260,260][lv],h=[0,0,116,132,150,174,174][lv];return{x:776-w/2,y:254-h,w,h}};
O.ownerHomeBox={x:926,y:142,w:88,h:112};O.ownerWarehouseBox={x:1034,y:176,w:70,h:78};
O.enter=()=>{if(F.SAVE_KEY!==storyKey&&F.run?.active)throw new Error('探索から帰還してから切り替えてください。');F.SAVE_KEY=storyKey;O.testPoint='current';let s=F.readSave();if(!s.story?.opening){s=F.freshSave();for(const id of Object.keys(s.development.town.facilities))s.development.town.facilities[id]=0;s.development.town.projects={};s.development.town.order=[];s.development.town.shopLevel=0;s.shelves=[];s.story.opening=initial();O.enqueueSceneInSave(s,'arrival');F.writeSave(s)}else{const o=O.ensureSceneState(s.story.opening);let changed=false;if(!o.prologueVersion){if(o.phase==='mission1'&&!o.woodReturned&&!o.goodsReturned&&!(Number(s.development.town.facilities.shop)||0))o.phase='arrival';else if(!['arrival','tent'].includes(o.phase))o.prologueComplete=true;o.prologueVersion=1;changed=true}if(Number(o.prologueVersion)<2){o.entranceInspected=true;o.prologueVersion=2;changed=true}if(o.entranceInspected==null){o.entranceInspected=o.phase!=='arrival';changed=true}if(o.phase==='arrival'&&!o.prologueComplete&&!o.sceneSeen.arrival&&!o.sceneQueue.includes('arrival')){O.enqueueSceneInSave(s,'arrival');changed=true}if(changed||!Array.isArray(s.story.opening.sceneQueue))F.writeSave(s)}};
// Investigation is a one-time active step for new campaigns. Returning players retain their progress.
O.inspectEntrance=()=>F.mutateSave(s=>{const o=s.story?.opening;if(!o||o.phase!=='arrival')throw new Error('今は入口を調べる段階ではありません。');if(o.entranceInspected)return false;o.entranceInspected=true;O.enqueueSceneInSave(s,'entranceClue');F.addHistory(s,'story','森の入口で、木の根と光の模様が刻まれた古い石を見つけた。');return true});
O.leave=()=>{if(F.run?.active)throw new Error('探索から帰還してから切り替えてください。');F.SAVE_KEY=originalKey};
O.state=()=>F.readSave().story.opening||initial();O.phase=()=>O.state().phase;
O.canStore=()=>['stocking','first_sale','upgrade','complete'].includes(O.phase());
O.canExplore=()=>['mission1','stocking','first_sale','upgrade','building','complete'].includes(O.phase());
O.goods=s=>Object.entries(s.warehouse||{}).filter(([id,n])=>id!=='wood'&&n>0&&F.item(id)).reduce((n,[,qty])=>n+qty,0);
O.stallReady=()=>{const s=F.readSave(),o=s.story.opening;return o.phase==='mission1'&&o.woodReturned>=O.rules.stallWood&&o.goodsReturned>0&&(s.warehouse.wood||0)>=O.rules.stallWood&&O.goods(s)>0};
O.ready=()=>{const s=F.readSave();return s.story.opening.phase==='upgrade'&&s.story.opening.mission2&&(s.warehouse.wood||0)>=O.rules.storeWood&&s.coins>=O.rules.storeCoins};
O.advance=()=>F.mutateSave(s=>{const o=s.story.opening;if(o.phase==='arrival'){if(!o.entranceInspected)throw new Error('先に森の入口を調べてください。');o.phase='tent';o.tentPitched=true;O.enqueueSceneInSave(s,'camp');F.addHistory(s,'story','森の入口にテントを張り、冒険者が戻れる拠点を作り始めた。')}else if(o.phase==='tent'){o.phase='mission1';o.prologueComplete=true;O.enqueueSceneInSave(s,'firstDeparture');F.addHistory(s,'opening','テントを拠点に、露店を開く準備を始めた。')}else if(o.phase==='building'){const p=o.townProject,elapsed=Math.max(0,(s.clock?.actionCount||0)-(p?.startedAt||0));if(!p||elapsed<(Number(p.steps)||1))throw new Error('建築中です。探索で時間を進めてください。');o.phase='complete';s.development.town.facilities.shop=2;s.development.town.shopLevel=2;delete o.townProject;O.enqueueSceneInSave(s,'shopComplete');F.addHistory(s,'opening','店舗Lv2の小屋が完成。テントと露店を撤去した。')}else throw new Error('今は次へ進めません。')});
O.setupStall=()=>{if(!O.stallReady())throw new Error('ダンジョンから設営用の木材と売る商品を持ち帰ってください。');return F.mutateSave(s=>{s.warehouse.wood-=O.rules.stallWood;if(!s.warehouse.wood)delete s.warehouse.wood;s.story.opening.phase='stocking';s.development.town.facilities.shop=1;s.development.town.shopLevel=1;s.shelves=[null,null,null];F.addHistory(s,'opening','木材で露店Lv1を設営した。商品を並べて開業しよう。')})};
O.open=()=>F.mutateSave(s=>{const o=s.story.opening;if(o.phase!=='stocking')throw new Error('露店はすでに開業済みです。');if(!s.shelves.some(sh=>sh&&sh.qty>0&&F.item(sh.itemId)))throw new Error('商品を1点以上並べてください。');o.mission1=true;o.phase='first_sale';O.enqueueSceneInSave(s,'stallOpen');F.addHistory(s,'mission','ミッション①達成：はじめての露店を開こう。次は初めての商品販売。')});
O.build=()=>{if(!O.ready())throw new Error('初売り達成と木材・建築費が必要です。');return F.mutateSave(s=>{s.warehouse.wood-=O.rules.storeWood;if(!s.warehouse.wood)delete s.warehouse.wood;s.coins-=O.rules.storeCoins;s.story.opening.phase='building';s.story.opening.townProject={stage:3,steps:1,startedAt:Number(s.clock?.actionCount)||0,paid:true};F.addHistory(s,'opening','店舗Lv2の小屋の建築を開始した。探索で工事を進めよう。')})};
O.originalSolids=()=>{if(!O.active())return[];const p=O.phase();return p==='arrival'?[]:['tent','mission1'].includes(p)?[O.tentBox]:['stocking','first_sale','upgrade'].includes(p)?[O.tentBox,O.stallBox]:p==='building'?[O.tentBox,O.shopBox]:[O.shopBox]};
O.solids=()=>{const a=O.originalSolids();if(O.phase()!=='complete')return a;return O.currentLevel()>=6?[O.currentShopBox(),O.ownerHomeBox,O.ownerWarehouseBox]:[O.currentShopBox()]};
O.draw=(c,art,cam)=>{if(!O.active())return;const s=O.visibleState||F.readSave(),p=s.story.opening.phase,draw=(i,b)=>c.drawImage(art[i],b.x-cam.x,b.y-cam.y,b.w,b.h);if(!['arrival','complete'].includes(p))draw(5,O.tentBox);if(['stocking','first_sale','upgrade'].includes(p)){draw(7,O.stallBox);c.font='17px sans-serif';c.textAlign='center';s.shelves.forEach((sh,i)=>{if(sh)c.fillText(F.item(sh.itemId)?.icon||'📦',O.stallBox.x+32+i*29-cam.x,O.stallBox.y+49-cam.y)})}if(p==='complete'){const level=O.currentLevel(),sprite=(i,b)=>c.drawImage(art[6],...O.exteriorCrops[i],b.x-cam.x,b.y-cam.y,b.w,b.h);if(level>=6){c.fillStyle='#b7a380';c.fillRect(765-cam.x,262-cam.y,318,24);for(const b of[O.ownerHomeBox,O.ownerWarehouseBox])c.fillRect(b.x+b.w/2-10-cam.x,b.y+b.h-cam.y,20,32)}sprite(level===6?5:level-2,O.currentShopBox());if(level>=6){sprite(6,O.ownerHomeBox);sprite(7,O.ownerWarehouseBox)}}if(p==='building'){const b=O.shopBox,x=b.x-cam.x,y=b.y-cam.y;c.fillStyle='#c3a776';c.fillRect(x,y,b.w,b.h);c.strokeStyle='#815b32';c.lineWidth=5;c.strokeRect(x+4,y+4,b.w-8,b.h-8);for(const dx of[8,b.w-12])for(const dy of[8,b.h-12]){c.fillStyle='#79522f';c.fillRect(x+dx,y+dy-20,6,28)}c.fillStyle='#89633d';for(let i=0;i<4;i++)c.fillRect(x+20,y+28+i*13,b.w-40,8)}};
// Ver1.83: the campaign now opens at the forest entrance; TEST story points stay isolated.
O.testPoint='current';
O.testEnabled=()=>window.FRENDA_TEST?.active!==false;
O.points=[['lv3','外観確認：店舗Lv3'],['lv4','外観確認：店舗Lv4'],['lv5','外観確認：店舗Lv5'],['lv6','外観確認：店舗Lv6'],['current','現在のプレーを続ける'],['opening-arrival','導入：迷宮発見直後'],['opening-inspected','導入：入口調査後'],['opening-tent','導入：テント設営後'],['gather','テント設営済み・資材集め前'],['returned','資材と商品を持ち帰った後'],['stall','露店設営後・商品を並べる前'],['stocked','商品陳列済み・開業前'],['opened','露店開業後・初売り前'],['sold','初売り後・建築材料集め前'],['ready','店舗Lv2の建築材料が揃った時'],['building','店舗Lv2の建築中'],['complete','店舗Lv2の完成後'],['lv3-meet','店舗Lv2完成・ミナに会う前'],['lv3-ready','店舗Lv3の材料準備完了'],['lv3-building','店舗Lv3の工事中'],['lv3-finish','店舗Lv3の完成確認待ち']];
O.makePoint=id=>{const s=F.freshSave();for(const k of Object.keys(s.development.town.facilities))s.development.town.facilities[k]=0;s.development.town.projects={};s.development.town.order=[];s.development.town.shopLevel=0;s.shelves=[];s.story.opening=initial();const o=s.story.opening;if(id==='opening-arrival')return s;if(id==='opening-inspected'){o.entranceInspected=true;return s}if(id==='opening-tent'){o.entranceInspected=true;o.phase='tent';o.tentPitched=true;return s}if(id==='gather'){o.entranceInspected=true;o.phase='mission1';o.prologueComplete=true;o.tentPitched=true;return s}s.story.firstAdventure=true;s.story.firstReturn=true;o.prologueComplete=true;o.tentPitched=true;o.entranceInspected=true;o.woodReturned=O.rules.stallWood;o.goodsReturned=1;s.warehouse={wood:O.rules.stallWood,bread:1};if(id==='returned')return s;o.phase='stocking';s.development.town.facilities.shop=1;s.development.town.shopLevel=1;s.shelves=[null,null,null];s.warehouse={bread:1};if(id==='stall')return s;s.story.firstStock=true;s.shelves[0]={itemId:'bread',qty:1,price:F.item('bread').base};s.warehouse={};if(id==='stocked')return s;o.mission1=true;o.phase='first_sale';if(id==='opened')return s;o.phase='upgrade';o.mission2=true;s.sales.count=1;s.sales.revenue=F.item('bread').base;s.sales.customers=1;s.story.firstSale=true;s.story.firstLoop=true;s.development.points=2;s.coins=F.ECONOMY_RULES.startCoins+F.item('bread').base;s.shelves=[null,null,null];if(id==='sold')return s;s.warehouse={wood:O.rules.storeWood};s.coins=Math.max(s.coins,O.rules.storeCoins);o.woodReturned=O.rules.stallWood+O.rules.storeWood;if(id==='ready')return s;o.phase='building';s.coins-=O.rules.storeCoins;s.warehouse={};o.townProject={stage:3,steps:1,startedAt:Number(s.clock?.actionCount)||0,paid:true};if(id==='building')return s;o.phase='complete';delete o.townProject;const level=/^lv[3-6]$/.test(id)?Number(id.slice(2)):2;s.development.town.facilities.shop=level;s.development.town.shopLevel=level;s.shelves=Array([0,3,3,4,5,6,9][level]).fill(null);if(level===6)s.development.town.facilities.owner_home=1;
 if(/^lv3-/.test(id)){
  s.development.town.facilities.shop=2;s.development.town.shopLevel=2;s.shelves=[null,null,null];o.lv3Met=id!=='lv3-meet';
  if(id==='lv3-ready')s.warehouse.wood=O.LV3_COST.wood;
  if(id==='lv3-building'||id==='lv3-finish')o.lv3Project={startedAt:0,steps:O.LV3_COST.steps,paid:true};
  if(id==='lv3-finish')s.clock.actionCount=O.LV3_COST.steps;
 }
 return s};
O.switchPoint=id=>{if(!O.testEnabled())throw new Error('TEST機能は利用できません。');if(!O.points.some(p=>p[0]===id))throw new Error('選択した時点がありません。');if(F.run?.active)throw new Error('探索から帰還してから時点を切り替えてください。');if(id==='current')O.enter();else{F.SAVE_KEY=originalKey+':mission148test:'+id;O.visibleState=null;F.writeSave(O.makePoint(id));O.testPoint=id}F.run=null;if(F.WILDERNESS){F.WILDERNESS.stop();F.WILDERNESS.position={x:774,y:306};F.WILDERNESS.active=true}};
O.guidance=()=>{
 const s=F.readSave(),p=O.phase(),stocked=s.shelves.some(sh=>sh&&sh.qty>0),wood=Number(s.warehouse.wood)||0,goods=O.goods(s);
 if(p==='arrival')return s.story.opening.entranceInspected?{title:'森の入口を確認しました',text:'青白い光と古い石の手がかりが見つかりました。草地のテント予定地に歩いていき、そこで設営しましょう。',label:'テントを設営する',act:'campSetup'}:{title:'森の入口に何がある？',text:'森の奥に続く階段が見つかりました。北の道を登り、古い石のある森の入口を調べましょう。',label:'🔎 森の入口を調べる',act:'inspect'};
 if(p==='tent')return{title:'露店の準備を始めよう',text:'北の道を登ると、はじまりの森です。まず木材と商品を集めましょう。',label:'開拓を始める',act:'advance'};
 if(p==='mission1')return O.stallReady()?{title:'資材と商品が揃いました',text:'テントのそばの露店予定地に近づき、木材で設営しましょう。',label:'露店を設営する',act:'setup'}:{title:'まずは露店を開く準備をしよう',text:`北の道を登って探索を開始し、B1Fで木材${O.rules.stallWood}個と売る商品を1点以上拾いましょう。集めたら「ロープ」で拠点へ持ち帰れます。`,label:F.run?.active?'探索を再開する':'はじまりの森へ',act:'adventure'};
 if(p==='stocking')return stocked?{title:'商品が並びました。開業しましょう',text:'露店の近くで開業しましょう。最初のミッションを達成できます。',label:'露店を開業する',act:'open'}:{title:'露店に商品を1点並べよう',text:'露店のそばまで歩き、「商品を並べる」から商品を1点陳列しましょう。',label:'商品を並べる',act:'shop'};
 if(p==='first_sale')return stocked?{title:'最初のお客さんに商品を売ろう',text:'露店の前まで歩き、営業しましょう。適正価格の商品には、迷宮帰りの冒険者が最初のお客さんとして立ち寄ります。',label:'露店へ行く',act:'shop'}:goods>0?{title:'売る商品を並べよう',text:'露店の空いている陳列枠を選び、保管中の商品を並べてから営業しましょう。',label:'商品を並べる',act:'shop'}:{title:'商品を仕入れよう',text:'商品がなくなりました。はじまりの森で商品を拾い、持ち帰って露店に並べましょう。',label:'はじまりの森へ',act:'adventure'};
 if(p==='upgrade'){
  if(O.ready())return{title:'店舗Lv2を建てられます',text:'店舗予定地まで歩き、材料と建築費を渡して建築を始めましょう。',label:'店舗Lv2を建築する',act:'build'};
  const stockedGoods=stocked||goods>0,needWood=wood<O.rules.storeWood,needMoney=s.coins<O.rules.storeCoins;
  const act=needWood||(!stockedGoods&&needMoney)?'adventure':'shop';
  const missing=[];if(needWood)missing.push(`木材 ${wood}/${O.rules.storeWood}個`);if(needMoney)missing.push(`所持金 ${s.coins}/${O.rules.storeCoins}G`);if(!stockedGoods)missing.push('販売商品なし');
  return{title:'店舗Lv2の小屋の資材を揃えよう',text:`${missing.join(' ／ ')}。木材や商品は迷宮で集め、建築費は適正価格で営業して貯めます。`,label:act==='adventure'?'迷宮で材料を集める':'露店で営業する',act};
 }
 if(p==='building'){const q=s.story.opening.townProject,elapsed=Math.max(0,(s.clock?.actionCount||0)-(q?.startedAt||0)),ready=!!q&&elapsed>=(Number(q.steps)||1);return ready?{title:'店舗Lv2の工事が完了しました',text:'新しい建物を確認すると、テントと露店が片付きます。',label:'完成した店を確認する',act:'finish'}:{title:'店舗Lv2を建築しています',text:`工事の進み具合：${Math.min(elapsed,Number(q?.steps)||1)}/${Number(q?.steps)||1}。迷宮へ出て時間を進めると完成します。`,label:'迷宮へ行く',act:'adventure'}};
 if(p==='complete'&&s.story?.rumor&&!s.story.opening.forestLordDefeated)return{title:'第2章：森の奥の光',text:'町で広がった噂によると、森の最深部には森を守る主がいるようです。町を拠点に準備を整え、はじまりの森の最深部を目指しましょう。',label:'はじまりの森を調査する',act:'adventure'};
 if(p==='complete'&&s.story?.opening?.forestLordDefeated)return{title:'エピローグ：森と町の新しい暮らし',text:'森の主との出会いを経て、町と森はともに歩み始めました。ここからも冒険と町づくりを続けられます。',label:'町の店へ戻る',act:'shop'};
 return{title:'店舗Lv2の小屋が完成しました',text:'テントと露店を片付けました。店内の3棚へ商品を並べて営業できます。',label:'店舗Lv2に入る',act:'shop'}
};
O.guide=()=>{const g=O.guidance(),o=O.state();return `<section class="frontierStoryGuide frontierStoryGuideCompact" aria-label="現在の目標"><b class="frontierStoryObjective">次にすること：${g.title}</b><p>${g.text}</p></section>`};
O.missions=()=>{const s=F.readSave(),o=s.story.opening,lv=Number(s.development.town.facilities.shop)||0,stocked=s.shelves.some(sh=>sh&&sh.qty>0),done1=o.mission1,done2=o.mission2,done3=o.phase==='complete',prologueDone=!!o.prologueComplete;return[{name:'導入：迷宮のそばに拠点を作る',state:prologueDone?'達成':'進行中',steps:[['不思議な迷宮の発見を知る',true],['森の入口を調べて手がかりを見つける',!!o.entranceInspected],['旅人向けの店を開くためテントを張る',!!o.tentPitched],['テントを拠点に開拓を始める',prologueDone]]},{name:'ミッション 1：はじめての露店を開こう',state:done1?'達成':prologueDone?'進行中':'未解放',steps:[['設営用の木材を持ち帰る',done1||lv>=1||o.woodReturned>=O.rules.stallWood],['売る商品を持ち帰る',done1||o.goodsReturned>0],['テントの脇に露店Lv1を設営する',done1||lv>=1],['商品を1点以上並べる',done1||stocked],['露店を開業する',done1]]},{name:'ミッション 2：初めて商品を売ろう',state:done2?'達成':done1?'進行中':'未解放',steps:[['露店で商品を1件以上売る',done2]]},{name:'ミッション 3：店舗Lv2の小屋を建てよう',state:done3?'達成':done2?'進行中':'未解放',steps:[['木材と建築費を揃える',done3||o.phase==='building'||(done2&&O.ready())],['材料を渡して建築を開始する',done3||o.phase==='building'],['工事を進めて完成を確認する',done3]]}]};
O.chapters=()=>{const s=F.readSave(),o=s.story.opening;return[
 {name:'序章：森の入口に拠点を',done:!!o.prologueComplete,active:!o.prologueComplete,detail:'迷宮のそばにテントを張り、冒険者を迎える。'},
 {name:'第1章：冒険者の店',done:o.phase==='complete'||!!o.forestLordDefeated,active:!!o.mission1&&!o.forestLordDefeated,detail:'素材を集め、露店と店舗兼住宅を育てる。'},
 {name:'第2章：森の奥の光',done:!!o.forestLordDefeated,active:!!s.story?.rumor&&!o.forestLordDefeated,detail:s.story?.rumor?'はじまりの森の最深部を調べる。':'町に広がる噂を集める。'},
 {name:'終章：森の主',done:!!o.forestLordDefeated,active:!!s.story?.rumor&&!o.forestLordDefeated,detail:o.forestLordDefeated?'森と町がともに歩み始めた。':'最深部で森を守る主と向き合う。'}
 ]};
O.currentMission=()=>{
 const save=F.readSave();
 if(O.lv4Status(save).phase==='finished'&&save.story?.opening?.lv4Finished&&!save.story?.opening?.lv4WorkshopVisited)
  return{name:'ミッション10：鍛冶屋を訪ねよう',state:'進行中',steps:[['工房と住居が完成した',true],['町の西の鍛冶屋を訪ね、ミナの仕事を確認する',false]]};
 const lv4=O.lv4Status();
 if(lv4.phase!=='locked'&&lv4.phase!=='finished'){
  if(lv4.phase==='meet')return{name:'ミッション7：ミナの決心',state:'進行中',steps:[['店舗Lv3が完成した',true],['西側の工房予定地でミナと話す',false]]};
  if(lv4.phase==='gather'||lv4.phase==='ready')return{name:'ミッション8：工房と家の建築準備',state:'進行中',steps:[[`木材 ${lv4.wood} / ${O.LV4_COST.wood}個`,lv4.wood>=O.LV4_COST.wood],[`鉄のかけら ${lv4.iron} / ${O.LV4_COST.iron}個`,lv4.iron>=O.LV4_COST.iron],[`所持金 ${lv4.coins} / ${O.LV4_COST.coins}G`,lv4.coins>=O.LV4_COST.coins],['西の予定地でミナに材料を渡す',false]]};
  return{name:'ミッション9：工房と店舗Lv4の完成',state:'進行中',steps:[['工事を開始した',true],[`工事 ${Math.min(lv4.elapsed,lv4.steps)} / ${lv4.steps}`,lv4.phase==='finish'],['西の予定地で完成を確認する',false]]};
 }
 const st=O.lv3Status();
 if(st.phase!=='locked'&&st.phase!=='finished'){
  if(st.phase==='meet')return{name:'ミッション4：旅の職人に会う',state:'進行中',steps:[['店舗Lv2が完成した',true],['店の東の道にいるミナに話しかける',false]]};
  if(st.phase==='gather'||st.phase==='ready')return{name:'ミッション5：店舗Lv3の増築準備',state:'進行中',steps:[[`木材 ${st.wood} / ${O.LV3_COST.wood}個`,st.wood>=O.LV3_COST.wood],[`所持金 ${st.coins} / ${O.LV3_COST.coins}G`,st.coins>=O.LV3_COST.coins],['ミナのところで工事を始める',false]]};
  return{name:'ミッション6：店舗Lv3の完成',state:'進行中',steps:[['増築工事を始める',true],[`工事の進行 ${Math.min(st.elapsed,st.steps)} / ${st.steps}`,st.phase==='finish'],['店の前で完成を確認する',false]]};
 }
 const list=O.missions(),current=list.find(m=>m.state==='進行中');if(current)return current;const g=O.guidance();return{name:g.title,state:'進行中',steps:[[g.text,false]]}};
O.missionsHTML=()=>{const m=O.currentMission();return `<h2>📋 現在のミッション</h2><section class="storyCurrentMission"><b>${m.name}</b><ul>${m.steps.map(([t,d])=>`<li>${d?'✓':'□'} ${t}</li>`).join('')}</ul></section>`};
// Extend the current mission display; never expose future missions.
const previousCurrentMission126=O.currentMission;
O.currentMission=()=>{
 const s=F.readSave(),st=O.lv5Status(s),o=s.story?.opening||{};
 if(st.phase==='finished'&&o.lv5Finished&&!o.lv5TavernVisited)
  return{name:'ミッション14：新しい酒場を訪ねよう',state:'進行中',steps:[['市場・酒場・掲示板の完成',true],['東の酒場兼宿屋へ行き、旅人の話を聞く',false]]};
 if(st.phase==='meet')return{name:'ミッション11：旅商人リオとの出会い',state:'進行中',steps:[['鍛冶屋でミナの仕事を確認する',true],['町の東の道で旅商人リオに話しかける',false]]};
 if(['gather','ready'].includes(st.phase))return{name:'ミッション12：旅人を迎える準備',state:'進行中',steps:[[`木材 ${st.wood}/${O.LV5_COST.wood}個`,st.wood>=O.LV5_COST.wood],[`鉄のかけら ${st.iron}/${O.LV5_COST.iron}個`,st.iron>=O.LV5_COST.iron],[`建築費 ${st.coins}/${O.LV5_COST.coins}G`,st.coins>=O.LV5_COST.coins],['東の予定地でリオに資材を渡す',false]]};
 if(['building','finish'].includes(st.phase))return{name:'ミッション13：店舗Lv5と旅人の町',state:'進行中',steps:[['建設を開始する',true],[`工事 ${Math.min(st.elapsed,st.steps)}/${st.steps}`,st.phase==='finish'],['東の建築予定地で完成を確認する',false]]};
 return previousCurrentMission126();
};
// Replaying the opening is presentation-only, including TEST checkpoints.
// Isolated TEST checkpoints; never modify the normal play save.
O.points.push(['lv4-meet','店舗Lv3完成・工房の相談前'],['lv4-ready','工房・店舗Lv4の資材準備完了'],['lv4-building','工房・店舗Lv4の工事中'],['lv4-finish','工房・店舗Lv4の完成確認待ち']);
const previousMakePoint125=O.makePoint;
O.makePoint=id=>{
 if(!/^lv4-(meet|ready|building|finish)$/.test(id))return previousMakePoint125(id);
 const s=previousMakePoint125('lv3');
 s.story.opening.phase='complete';s.story.opening.lv3Finished=true;
 s.story.opening.lv4Met=id!=='lv4-meet';s.development.town.facilities.shop=3;s.development.town.shopLevel=3;
 s.shelves=[null,null,null,null];s.warehouse={};s.clock.actionCount=0;
 if(id==='lv4-ready'){s.warehouse={wood:O.LV4_COST.wood,iron:O.LV4_COST.iron};s.coins=O.LV4_COST.coins;}
 if(['lv4-building','lv4-finish'].includes(id))s.story.opening.lv4Project={startedAt:0,steps:O.LV4_COST.steps,paid:true};
 if(id==='lv4-finish')s.clock.actionCount=O.LV4_COST.steps;
 return s;
};
// TEST checkpoints are isolated from the current campaign save.
O.points.push(['lv5-meet','店舗Lv4完成・リオと面会前'],['lv5-ready','店舗Lv5の建築資材が揃った時'],['lv5-building','店舗Lv5の工事中'],['lv5-finish','店舗Lv5の完成確認待ち'],['lv5-tavern','店舗Lv5完成・酒場訪問前']);
const previousMakePoint126=O.makePoint;
O.makePoint=id=>{
 if(!/^lv5-(meet|ready|building|finish|tavern)$/.test(id))return previousMakePoint126(id);
 const s=previousMakePoint126('lv4-meet'),o=s.story.opening,t=s.development.town;
 o.phase='complete';o.lv3Finished=true;o.lv4Finished=true;o.lv4Met=true;o.lv4WorkshopVisited=true;
 t.facilities.shop=4;t.shopLevel=4;
 for(const fid of ['forge','house','warehouse'])t.facilities[fid]=1;
 t.residentCount=Math.max(1,Number(t.residentCount)||0);
 s.shelves=Array(5).fill(null);s.clock.actionCount=0;s.warehouse={};s.coins=0;
 o.lv5Met=id!=='lv5-meet';
 if(id==='lv5-ready'){s.warehouse={wood:O.LV5_COST.wood,iron:O.LV5_COST.iron};s.coins=O.LV5_COST.coins;}
 if(['lv5-building','lv5-finish'].includes(id))o.lv5Project={startedAt:0,steps:O.LV5_COST.steps,paid:true};
 if(id==='lv5-finish')s.clock.actionCount=O.LV5_COST.steps;
 if(id==='lv5-tavern'){o.lv5Finished=true;t.facilities.shop=5;t.shopLevel=5;for(const fid of ['market','inn','adventure_board'])t.facilities[fid]=1;s.shelves=Array(6).fill(null);}
 return s;
};
O.replayScene=id=>typeof F.playStoryDialogue==='function'?F.playStoryDialogue(O.SCENES[id]||O.SCENES.arrival,()=>{}):false;
// Completed dialogue is available to reread without changing story or saves.
O.storyArchiveHTML=()=>{const o=O.state(),ids=Object.keys(O.SCENES).filter(id=>o.sceneSeen?.[id]||o.sceneSkipped?.[id]);const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));return `<h3>📖 これまでの物語</h3>${ids.length?ids.map(id=>{const scene=O.SCENES[id];return `<details class="storyArchiveEntry"><summary>${esc(scene.icon||'📜')} ${esc(scene.chapter||'物語')}：${esc(scene.title||id)}${o.sceneSkipped?.[id]&&!o.sceneSeen?.[id]?'（スキップ・読み返せます）':''}</summary><div>${scene.lines.map(line=>`<p><b>${esc(line.speaker||'ナレーション')}</b>　${esc(line.text)}</p>`).join('')}</div></details>`}).join(''):'<p>物語を進めると、見終わった会話をここから読み返せます。</p>'}`};
const oldMissionsHTML=O.missionsHTML;O.missionsHTML=()=>oldMissionsHTML()+O.storyArchiveHTML();
O.testControls=()=>!O.testEnabled()?'':`<details class="test-menu-panel" style="margin:10px 12px;padding:8px;background:#edf2fa;border:1px solid #adbed9;border-radius:8px"><summary>TEST：開始時点を切り替える</summary><label style="display:block;margin:8px 0">プレー開始時点 <select id="testStoryPoint" style="width:100%;padding:8px;margin-top:5px">${O.points.map(([id,label])=>`<option value="${id}" ${O.testPoint===id?'selected':''}>${label}</option>`).join('')}</select></label><small>切替先のTEST枠に、その時点の進行・所持品をセットします。現在のプレー枠は保持されます。探索中は帰還後に切り替えてください。</small></details>`;
O.panel=()=>{const s=F.readSave(),r=O.rules;return `<div style="padding:10px 12px"><span>保管中：木材 ${s.warehouse.wood||0}個 ／ 所持金 ${s.coins}G</span><details style="margin-top:8px"><summary>TEST用の仮設定</summary><p>露店設営：木材${r.stallWood}個。店舗Lv2：木材${r.storeWood}個＋${r.storeCoins}G。必要数・費用は後で調整します。</p></details></div>`};
O.bind=(rerender,actions={})=>{const picker=document.getElementById('testStoryPoint');if(picker)picker.onchange=()=>{try{O.switchPoint(picker.value);rerender()}catch(e){picker.value=O.testPoint;const msg=document.getElementById('wildernessMessage');if(msg)msg.textContent=e.message}};
// All campaign actions are now triggered near their map locations instead of using guide buttons.
// The map calls O.presentPendingScene only after its artwork has loaded.
};
// Ver1.111: story and normal game both use the approved shop maximum Lv6.
// Old opening Lv7 is folded into Lv6, preserving all nine stocked shelves.
const storyShelfCapacity=Object.freeze([0,3,3,4,5,6,9]);
const oldCapacity=F.shopCapacity;
F.shopCapacity=s=>s?.story?.opening?storyShelfCapacity[Math.max(0,Math.min(6,Number(s?.development?.town?.facilities?.shop)||0))]:oldCapacity(s);
const normalize=F.normalizeSave;
F.normalizeSave=s=>{
 const opening=!!s?.story?.opening,rawLevel=opening?Number(s?.development?.town?.facilities?.shop)||0:null;
 const preservedShelves=opening&&rawLevel>=6&&Array.isArray(s.shelves)?s.shelves.slice(0,9):null;
 const out=normalize(s);
 if(!opening)return out;
 const level=Math.max(0,Math.min(6,rawLevel));
 out.development.town.facilities.shop=level;
 out.development.town.shopLevel=level;
 if(level===6){
  out.development.town.facilities.owner_home=Math.max(1,Number(out.development.town.facilities.owner_home)||0);
  // The old Lv7 had nine shelves; never drop stock when migrating its save.
  if(preservedShelves)out.shelves=preservedShelves;
  while(out.shelves.length<9)out.shelves.push(null);
 }
 return out;
};
const interior=F.interiorModel;
F.interiorModel=(id,s)=>{
 if(id!=='shop'||!s?.story?.opening)return interior(id,s);
 const lv=Number(s.development.town.facilities.shop)||0;
 if(lv<2)throw new Error('露店には店内がありません。');
 const old=JSON.parse(JSON.stringify(s));delete old.story.opening;
 // The existing Lv6 room plan already has nine shelves; reuse it for story Lv6.
 old.development.town.facilities.shop=lv===6?6:lv-1;
 const m=interior(id,old);m.planLv=m.lv;m.lv=lv;m.max=6;return m;
};

const approvedGuidance=O.guidance;O.guidance=()=>{const s=F.readSave(),st=O.lv3Status(s);
 if(st.phase==='meet')return{title:'旅の職人ミナに話しかけよう',text:'店舗Lv2の東側の道に来た職人ミナをタップし、増築の相談をしましょう。'};
 if(st.phase==='gather')return{title:'店舗Lv3の資材を集めよう',text:`木材 ${st.wood}/${O.LV3_COST.wood}個、所持金 ${st.coins}/${O.LV3_COST.coins}G。足りない材料は森で、費用は商売で集めましょう。`};
 if(st.phase==='ready')return{title:'店舗Lv3の増築を始めよう',text:'資材が揃いました。店の東側で待っているミナに話しかけて着工しましょう。'};
 if(st.phase==='building')return{title:'店舗Lv3を増築中',text:`工事の進行 ${Math.min(st.elapsed,st.steps)}/${st.steps}。森で探索するなどして時間を進め、店の東側に戻りましょう。`};
 if(st.phase==='finish')return{title:'店舗Lv3の完成を確認しよう',text:'工事が完了しています。店の東側にいるミナに話しかけて完成を確認しましょう。'};
 const l4=O.lv4Status(s);
 if(l4.phase==='meet')return{title:'ミナと工房の相談をしよう',text:'店舗Lv3が完成しました。西側の工房予定地にいるミナをタップして話しましょう。'};
 if(l4.phase==='gather')return{title:'鍛冶屋の材料を集めよう',text:`木材 ${l4.wood}/${O.LV4_COST.wood}個、鉄 ${l4.iron}/${O.LV4_COST.iron}個、所持金 ${l4.coins}/${O.LV4_COST.coins}G。足りない分は森で集め、店の売上で工事費を用意しましょう。`};
 if(l4.phase==='ready')return{title:'西の予定地で工房を建てよう',text:'材料が揃いました。西側の工房予定地でミナに渡して工事を始めましょう。'};
 if(l4.phase==='building')return{title:'鍛冶屋と店舗Lv4を建設中',text:`進行 ${Math.min(l4.elapsed,l4.steps)}/${l4.steps}。冒険などで時間を進めたら、西側の予定地に戻りましょう。`};
 if(l4.phase==='finish')return{title:'新しい工房の完成を確認しよう',text:'工事が終わりました。西側の予定地でミナと完成を確認しましょう。'};
 if(s.story?.opening?.lv4Finished&&!s.story?.opening?.lv4WorkshopVisited)return{title:'新しい鍛冶屋へ行こう',text:'町の西に完成した鍛冶屋を訪れ、ミナの仕事を確かめましょう。朝から昼に工房で武器の強化ができます。'};
 const g=approvedGuidance();if(O.phase()==='complete'&&O.currentLevel()>2&&!s.story?.rumor&&!s.story?.opening?.forestLordDefeated){const lv=O.currentLevel();return{title:`店舗Lv${lv}の外観確認`,text:`陳列${O.levels[lv-1].shelves}棚。外観と店内を確認できます。`,label:`店舗Lv${lv}に入る`,act:'shop'}}return g};
const earlierGuidance126=O.guidance;
O.guidance=()=>{
 const s=F.readSave(),st=O.lv5Status(s),o=s.story?.opening||{};
 if(st.phase==='meet')return{title:'東の道で旅商人に会おう',text:'鍛冶屋を訪ねました。東の街道で荷車を停めている旅商人リオに話しかけましょう。'};
 if(['gather','ready'].includes(st.phase))return{title:'市場と酒場の資材を集めよう',text:`木材 ${st.wood}/${O.LV5_COST.wood}個、鉄 ${st.iron}/${O.LV5_COST.iron}個、所持金 ${st.coins}/${O.LV5_COST.coins}G。揃ったら東の予定地で着工しましょう。`};
 if(st.phase==='building')return{title:'旅人の町を建設中',text:`工事の進行 ${Math.min(st.elapsed,st.steps)}/${st.steps}。冒険などで時間を進め、東の予定地へ戻りましょう。`};
 if(st.phase==='finish')return{title:'市場と酒場が完成しました',text:'東の予定地で旅商人リオと完成を確認しましょう。'};
 if(st.phase==='finished'&&o.lv5Finished&&!o.lv5TavernVisited)return{title:'酒場兼宿屋へ行こう',text:'町の東の酒場へ歩いて行き、旅人たちの噂を聞きましょう。'};
 if(st.phase==='finished'&&o.lv5TavernVisited&&!o.forestLordDefeated)return{title:'森の奥の光を調べよう',text:'酒場で森の最深部の噂を聞きました。装備と食料を整え、町の北の道からはじまりの森へ向かいましょう。'};
 return earlierGuidance126();
};
// Ver1.127 — final shop, detached home, and the town's completion story.
// Store these flags alongside older opening progress, without changing save schema.
O.LV6_COST=Object.freeze({wood:12,iron:5,coins:700,steps:5,shopShelves:9});
O.SCENES=Object.freeze({...O.SCENES,
 lv6Meet:{chapter:'第1章',title:'最後の店づくり',icon:'🏡',lines:[
  {speaker:'ナレーション',text:'市場と酒場が賑わう一方、店には冒険者の道具があふれ、店主が休む場所も手狭になっていた。',icon:'🏮'},
  {speaker:'ミナ',text:'お店は売り場だけにして、休むための家は別に建てましょう。そうすれば棚をもっと増やせます。',portrait:'traveler'},
  {speaker:'旅商人リオ',text:'預かり所と広場も整えれば、旅人たちは安心して次の冒険に向かえます。',portrait:'traveler'},
  {speaker:'開拓者',text:'商売だけでなく、帰ってこられる町にしよう。ここが最後の大きな建築だ。',portrait:'player'},
  {speaker:'次の目的',text:'木材12個、鉄のかけら5個、700Gを用意して町の中央の建築予定地へ。',icon:'📜'}
 ]},
 lv6Start:{chapter:'第1章',title:'新しい家とお店の工事',icon:'🏗️',lines:[
  {speaker:'ミナ',text:'これから店を広げ、店主の家と預かり所を建てます。危ないから工事中は道を空けてくださいね。',portrait:'traveler'},
  {speaker:'旅商人リオ',text:'広場には旅人が集まる場所を作ります。町が完成するのが楽しみです。',portrait:'traveler'},
  {speaker:'次の目的',text:'冒険や商売で時間を進めて、中央の予定地で完成を確認しよう。',icon:'📜'}
 ]},
 lv6Finish:{chapter:'第1章',title:'帰ってこられる町',icon:'🏘️',lines:[
  {speaker:'ナレーション',text:'朝の光が町を照らす。九つの棚が並ぶ新しい店、店主の家、預かり所、そして旅人が集う広場が完成した。',icon:'✨'},
  {speaker:'ミナ',text:'店主さんの家はお店とは別棟です。これで夜もゆっくり休めますね。',portrait:'traveler'},
  {speaker:'旅商人リオ',text:'遠くの街道からも旅人が訪れます。この町の物語は、ここからも続きます。',portrait:'traveler'},
  {speaker:'開拓者',text:'次は森の奥に残された謎だ。この町を守るため、準備をして向かおう。',portrait:'player'},
  {speaker:'次の目的',text:'店主の専用住宅へ行き、完成した暮らしを確かめよう。',icon:'🏡'}
 ]},
 lv6Home:{chapter:'第1章',title:'店主の新しい家',icon:'🏡',lines:[
  {speaker:'ナレーション',text:'お店から少し離れた新しい家。窓の外には、賑やかな町の灯りが見える。',icon:'🌙'},
  {speaker:'開拓者',text:'みんなが帰れる場所を作れた。今度は森の主と向き合う準備をしよう。',portrait:'player'},
  {speaker:'次の目的',text:'北の道からはじまりの森へ向かい、森の主の謎を解こう。',icon:'🌲'}
 ]},
 lv6Finale:{chapter:'エピローグ',title:'森と町の新しい朝',icon:'🌅',lines:[
  {speaker:'ナレーション',text:'森の主との約束を経て、森からの風が完成した町の広場を通り抜けた。',icon:'🌲'},
  {speaker:'ミナ',text:'鍛冶の音も、旅人たちの足音も、ここでは毎日の暮らしになりました。',portrait:'traveler'},
  {speaker:'開拓者',text:'不思議な迷宮を見つけたあの日から、こんな町になるなんて。今日もみんなを迎えよう。',portrait:'player'},
  {speaker:'ナレーション',text:'第1部 完。町での商売と冒険は引き続き楽しめます。',icon:'✨'}
 ]}
});
O.lv6Status=(s=F.readSave())=>{
 const o=s?.story?.opening||{},lv=Math.max(0,Number(s?.development?.town?.facilities?.shop)||0);
 const wood=Math.max(0,Number(s?.warehouse?.wood)||0),iron=Math.max(0,Number(s?.warehouse?.iron)||0),coins=Math.max(0,Number(s?.coins)||0);
 if(lv>=6||o.lv6Finished)return{phase:'finished',lv,wood,iron,coins};
 if(o.phase!=='complete'||lv<5||!o.lv5TavernVisited)return{phase:'locked',lv,wood,iron,coins};
 const pr=o.lv6Project;
 if(pr){const elapsed=Math.max(0,(Number(s?.clock?.actionCount)||0)-(Number(pr.startedAt)||0)),steps=Math.max(1,Number(pr.steps)||O.LV6_COST.steps);
  return{phase:elapsed>=steps?'finish':'building',lv,wood,iron,coins,elapsed,steps};}
 if(!o.lv6Met)return{phase:'meet',lv,wood,iron,coins};
 return{phase:wood>=O.LV6_COST.wood&&iron>=O.LV6_COST.iron&&coins>=O.LV6_COST.coins?'ready':'gather',lv,wood,iron,coins};
};
O.meetLv6=()=>F.mutateSave(s=>{
 if(O.lv6Status(s).phase!=='meet')throw new Error('酒場で旅人の噂を聞いてから、最後の増築を始めましょう。');
 s.story.opening.lv6Met=true;O.enqueueSceneInSave(s,'lv6Meet');F.addHistory(s,'story','市場と酒場の次に、店主の家と店舗Lv6の最終建築を決めた。');
});
O.startLv6Build=()=>F.mutateSave(s=>{
 if(O.lv6Status(s).phase!=='ready')throw new Error('木材12個・鉄5個・700Gとミナとの相談が必要です。');
 const cost=O.LV6_COST,w=s.warehouse;
 w.wood-=cost.wood;if(w.wood<=0)delete w.wood;
 w.iron-=cost.iron;if(w.iron<=0)delete w.iron;
 s.coins-=cost.coins;
 s.story.opening.lv6Project={startedAt:Number(s.clock?.actionCount)||0,steps:cost.steps,paid:true};
 O.enqueueSceneInSave(s,'lv6Start');F.addHistory(s,'construction','店舗Lv6・店主の住宅・預かり所・広場の建設を開始した。');
});
O.maybeLv6Finale=()=>{
 let added=false;
 F.mutateSave(s=>{
  const o=s.story?.opening;
  if(!o||o.lv6FinaleSeen||!o.lv6HomeVisited||!o.forestLordDefeated)return;
  o.lv6FinaleSeen=true;O.enqueueSceneInSave(s,'lv6Finale');
  F.addHistory(s,'story','森の主との約束と町の完成を迎え、第1部を締めくくった。');added=true;
 });return added;
};
O.finishLv6Build=()=>{
 F.mutateSave(s=>{
  if(O.lv6Status(s).phase!=='finish')throw new Error('工事はまだ完成していません。');
  const o=s.story.opening,t=s.development.town,f=t.facilities||{};
  delete o.lv6Project;o.lv6Finished=true;
  f.shop=Math.max(6,Number(f.shop)||0);f.owner_home=Math.max(1,Number(f.owner_home)||0);
  f.bank=Math.max(1,Number(f.bank)||0);f.plaza=Math.max(2,Number(f.plaza)||0);
  f.adventure_board=Math.max(2,Number(f.adventure_board)||0);
  t.facilities=f;t.shopLevel=f.shop;
  // Preserve quantity, price and order in all existing slots.
  s.shelves=Array.isArray(s.shelves)?s.shelves:[];
  while(s.shelves.length<O.LV6_COST.shopShelves)s.shelves.push(null);
  O.enqueueSceneInSave(s,'lv6Finish');F.addHistory(s,'construction','店舗Lv6・店主の別棟住宅・預かり所・広場が完成。売場は9棚となった。');
 });
};
O.visitLv6Home=()=>{
 let seen=false;
 F.mutateSave(s=>{
  const o=s.story?.opening;
  if(!o||o.lv6HomeVisited||Number(s.development?.town?.facilities?.shop)<6||Number(s.development?.town?.facilities?.owner_home)<1)return;
  o.lv6HomeVisited=true;O.enqueueSceneInSave(s,'lv6Home');F.addHistory(s,'story','新しい店主の専用住宅を訪れた。');seen=true;
 });
 if(seen)O.maybeLv6Finale();return seen;
};
// The newest chapter takes priority over the older Lv5 forest guidance.
const previousLv6Mission=O.currentMission;
O.currentMission=()=>{
 const s=F.readSave(),o=s.story?.opening||{},st=O.lv6Status(s),cost=O.LV6_COST;
 if(st.phase==='meet')return{name:'ミッション15：ミナと最後の増築を相談',state:'進行中',steps:[['酒場で森の噂を聞いた',true],['中央の建築予定地でミナと話す',false]]};
 if(['gather','ready'].includes(st.phase))return{name:'ミッション16：店舗Lv6の資材集め',state:'進行中',steps:[[`木材 ${st.wood}/${cost.wood}`,st.wood>=cost.wood],[`鉄のかけら ${st.iron}/${cost.iron}`,st.iron>=cost.iron],[`建築費 ${st.coins}/${cost.coins}G`,st.coins>=cost.coins],['中央の予定地で着工する',false]]};
 if(['building','finish'].includes(st.phase))return{name:'ミッション17：最後の建築',state:'進行中',steps:[['工事開始',true],[`進行 ${Math.min(st.elapsed,st.steps)}/${st.steps}`,st.phase==='finish'],['中央の現場で完成を確認する',false]]};
 if(st.phase==='finished'&&o.lv6Finished&&!o.lv6HomeVisited)return{name:'ミッション18：新しい家を訪ねよう',state:'進行中',steps:[['店舗Lv6と別棟住宅が完成',true],['店主の専用住宅に入る',false]]};
 if(st.phase==='finished'&&o.lv6HomeVisited&&!o.forestLordDefeated)return{name:'ミッション19：森の主と向き合おう',state:'進行中',steps:[['町の最終整備を完了する',true],['森の最深部B30Fを踏破する',false]]};
 if(st.phase==='finished'&&o.lv6HomeVisited&&o.forestLordDefeated)return{name:'第1部 完：森と町の約束',state:'達成',steps:[['町の完成',true],['森の主との約束',true]]};
 return previousLv6Mission();
};
const previousLv6Guidance=O.guidance;
O.guidance=()=>{
 const s=F.readSave(),o=s.story?.opening||{},st=O.lv6Status(s),cost=O.LV6_COST;
 if(st.phase==='meet')return{title:'ミナと最後の建築を相談しよう',text:'町の中央の建築予定地にいるミナを訪ね、店と住居を分ける相談をしましょう。'};
 if(['gather','ready'].includes(st.phase))return{title:'店主の家と店舗Lv6の資材を集めよう',text:`木材 ${st.wood}/${cost.wood}・鉄 ${st.iron}/${cost.iron}・所持金 ${st.coins}/${cost.coins}G。揃ったら中央の建築予定地へ。`};
 if(st.phase==='building')return{title:'店舗Lv6と住宅を建設中',text:`工事 ${Math.min(st.elapsed,st.steps)}/${st.steps}。冒険や商売で時間を進め、中央の現場に戻りましょう。`};
 if(st.phase==='finish')return{title:'最後の工事が完成しました',text:'町の中央でミナに完成を確認してもらいましょう。'};
 if(st.phase==='finished'&&o.lv6Finished&&!o.lv6HomeVisited)return{title:'店主の新しい家へ行こう',text:'完成した町の東にある店主の専用住宅へ入りましょう。'};
 if(st.phase==='finished'&&o.lv6HomeVisited&&!o.forestLordDefeated)return{title:'北の道から森の最深部へ',text:'新しい町を守るため、はじまりの森B30Fの森の主と向き合いましょう。'};
 if(st.phase==='finished'&&o.lv6HomeVisited&&o.forestLordDefeated)return{title:'第1部の物語を完了しました',text:'森と町の約束が結ばれました。商売・開拓・冒険は引き続き楽しめます。'};
 return previousLv6Guidance();
};
// Replay and testing checkpoints are isolated from the regular save.
O.points.push(['lv6-meet','店舗Lv5完成・最終建築の相談前'],['lv6-ready','店舗Lv6の建築資材が揃った時'],['lv6-building','店舗Lv6の工事中'],['lv6-finish','店舗Lv6の完成確認待ち'],['lv6-home','店舗Lv6完成・住宅訪問前']);
const previousLv6MakePoint=O.makePoint;
O.makePoint=id=>{
 if(!/^lv6-(meet|ready|building|finish|home)$/.test(id))return previousLv6MakePoint(id);
 const s=previousLv6MakePoint('lv5-tavern'),o=s.story.opening,t=s.development.town;
 o.lv5TavernVisited=true;o.lv6Met=id!=='lv6-meet';
 s.clock.actionCount=0;s.warehouse={};s.coins=300;
 if(id==='lv6-ready'){s.warehouse={wood:O.LV6_COST.wood,iron:O.LV6_COST.iron};s.coins=O.LV6_COST.coins;}
 if(['lv6-building','lv6-finish'].includes(id))o.lv6Project={startedAt:0,steps:O.LV6_COST.steps,paid:true};
 if(id==='lv6-finish')s.clock.actionCount=O.LV6_COST.steps;
 if(id==='lv6-home'){o.lv6Finished=true;t.facilities.shop=6;t.shopLevel=6;t.facilities.owner_home=1;t.facilities.bank=1;t.facilities.plaza=2;s.shelves=Array(9).fill(null);}
 return s;
};

// Ver1.128: Additional dialogue beats are inserted BEFORE each scene's current objective.
// This is presentation-only: scene IDs, triggers, save flags and construction prices remain unchanged.
const O_STORY_BEATS_128={
 firstReturn:[
  ['開拓者','迷宮の中では、木材一本だって貴重だった。帰り道を忘れたらと思うと怖かったよ。'],
  ['旅の冒険者','怖いと思えたなら、ちゃんと周りを見ていた証拠だ。今日は無事に帰れた。それが一番だよ。'],
  ['開拓者','この木材が、次に帰ってくる誰かの助けになる。そう考えると、少し誇らしいね。']
 ],
 stallOpen:[
  ['ナレーション','値札を並べ、風で飛ばないよう棚に紐を結ぶ。小さな工夫ばかりだが、どれも初めての仕事だった。'],
  ['開拓者','本当に買ってくれる人がいるかな。必要な物を、必要な値段で届けたい。'],
  ['旅の冒険者','店を開けて、待ってみよう。お客さんの声を聞くことも大事な仕事だ。']
 ],
 firstSale:[
  ['ナレーション','初めて受け取った硬貨は、手の中で小さな音を立てた。店の品が誰かの冒険を支えたのだ。'],
  ['開拓者','売れたことも嬉しいけれど、「助かった」と言ってもらえたのが何より嬉しい。'],
  ['旅の冒険者','帰ってきた人がまた出かける。ここは、そのための場所になり始めているんだね。']
 ],
 shopComplete:[
  ['ナレーション','雨が降っても商品を守れる屋根。閉店後に道具を片づけられる棚。露店では難しかったことが、少しずつできる。'],
  ['開拓者','もっと大きな町になるのはまだ先だろうけど、まずはこの店を大切にしよう。']
 ],
 lv3Visitor:[
  ['ミナ','ここに来るまで、いくつもの町で修業してきました。でも、しばらく落ち着いて働ける場所は見つからなくて。'],
  ['開拓者','この町もまだ始まったばかりだよ。だからこそ、これからどんな場所にするか、一緒に決められる。'],
  ['ミナ','それなら、まず棚づくりから手伝わせてください。腕前で信用してもらえるよう、丁寧に仕上げます。']
 ],
 lv3Start:[
  ['ナレーション','ミナは柱のゆがみを直し、棚板を一枚ずつ確かめていった。仕事の速さより、使う人の安全を優先している。']
 ],
 lv3Finished:[
  ['ミナ','旅の途中では、作った物がその後どう使われるか、なかなか見届けられませんでした。'],
  ['開拓者','ここなら、明日も来月も同じ棚を見られる。壊れたら一緒に直そう。'],
  ['ミナ','それって、素敵ですね。私も少しずつ、この町の一員になれたらいいな。']
 ],
 lv4Invite:[
  ['ミナ','迷宮帰りの人の剣は、刃が欠けたり、柄が緩んだりしています。直せる人がいないまま、また森へ出るのは危険です。'],
  ['開拓者','店が品を届け、工房が道具を直す。別々の仕事だけど、どちらも旅人が帰ってくるために必要なんだね。'],
  ['ミナ','はい。それに、ここで暮らせたら、直した道具が誰を助けたのかも分かります。']
 ],
 lv4Finished:[
  ['ナレーション','炉に火が入ると、鍛冶屋から一定のリズムで金槌の音が聞こえ始めた。帰る家のある職人が、この町で働いている。'],
  ['開拓者','帰る場所を作るつもりが、暮らす人の町にもなってきたんだ。']
 ],
 lv5Merchant:[
  ['旅商人リオ','私はリオ。荷を運びながら町を巡っています。ここの道は、以前よりずっと人が増えました。'],
  ['旅商人リオ','でも日が暮れると、休める場所を探して困る人がまだいます。食料の買い足しにも長い道を戻らなければなりません。'],
  ['開拓者','帰還する場所だけでなく、次の旅に出るまで過ごせる場所にしたいね。'],
  ['旅商人リオ','それなら、市場と泊まれる酒場を一緒に作りましょう。私は道具を運び、人を呼びます。']
 ],
 lv5Finished:[
  ['ナレーション','市場では朝から品物の声が響き、夜になると酒場に灯りがともる。町には、一日の流れが生まれた。'],
  ['開拓者','今夜は休んでいく人もいるんだね。もう、ただの立ち寄り場所ではない。']
 ],
 lv5Tavern:[
  ['ナレーション','酒場の片隅で、森から帰った冒険者たちが地図を広げている。'],
  ['旅商人リオ','光は見た人によって場所が違います。でも、みんな「木の根のような模様があった」と話します。'],
  ['開拓者','入口に落ちていた古い石と同じ模様だ。偶然とは思えない。'],
  ['旅商人リオ','ただ、最深部まで行って戻れた人は少ないそうです。焦って結論を出さず、準備をして確かめましょう。']
 ],
 forestRumor:[
  ['ナレーション','何度も聞いた話の中には、はっきりしない部分も多かった。森の主が敵なのか、何かを守っているのかも分からない。'],
  ['開拓者','だからこそ、自分の目で見たい。森を荒らさずに進む方法があるかもしれない。']
 ],
 lv6Meet:[
  ['ミナ','はじめはテントひとつだったのに、いまは店も工房もあります。次は働く場所と休む場所をきちんと分けましょう。'],
  ['開拓者','この店で人と出会って、町が育ってきた。これからは、誰もが長く暮らせる町にしたい。']
 ],
 lv6Finish:[
  ['ナレーション','かつて草しかなかった広場を、冒険者と商人が行き交う。工房の槌音と子どもの笑い声が重なる。'],
  ['開拓者','ここを通る人にとっては、これが毎日の景色になる。あの日の選択が、少しずつ形になったんだ。']
 ],
 lv6Home:[
  ['ナレーション','窓からは店の灯りが見える。働いたあとに帰る家があるという当たり前のことが、今日は少し特別に思えた。'],
  ['開拓者','森の謎が解けなくても、ここまで来た時間は無駄じゃない。それだけは忘れないでおこう。']
 ],
 forestEnding:[
  ['ナレーション','倒れた森の主に近づくと、青白い光がその足元の古い石へと流れ込んだ。森を傷つけるための力には見えなかった。'],
  ['開拓者','この光は、森を生かすためのものだったんだ。自分たちは何を守ろうとしていたのだろう。'],
  ['ナレーション','森の主は静かに身を起こし、道をあける。言葉はなくても、こちらを拒んでいないことだけは伝わった。']
 ],
 lv6Finale:[
  ['旅商人リオ','私はまた街道へ出ます。でもここに戻れば、みんなの顔が見られる。それが商人には一番嬉しいことです。'],
  ['開拓者','森の入口にテントを張ったのは、たった一人でも無事に帰ってこられる場所が欲しかったから。'],
  ['ナレーション','その小さな願いは、いまでは町の人たちの暮らしを支えている。物語は終わりではなく、次の日へ続く。']
 ]
};
O.SCENES=Object.freeze(Object.fromEntries(Object.entries(O.SCENES).map(([id,scene])=>{
 const beats=O_STORY_BEATS_128[id];if(!beats)return[id,scene];
 const lines=scene.lines.slice();
 const newLines=beats.map(([speaker,text])=>({speaker,text,portrait:speaker==='開拓者'?'player':speaker==='ナレーション'?undefined:'traveler'}));
 // The guardian's discovery must occur before he steps aside, and the final
 // reflection must occur BEFORE the ending card; other scenes keep the goal last.
 if(id==='forestEnding'){
  const at=lines.findIndex(x=>/森の主は道をあけた/.test(x.text));
  lines.splice(at>=0?at:Math.max(0,lines.length-1),0,...newLines);
 }else if(id==='lv6Finale'){
  const at=lines.findIndex(x=>/第1部 完/.test(x.text));
  lines.splice(at>=0?at:lines.length,0,...newLines);
 }else{
  const at=lines[lines.length-1]?.speaker==='次の目的'?lines.length-1:lines.length;
  lines.splice(at,0,...newLines);
 }
 return[id,Object.freeze({...scene,lines:Object.freeze(lines)})];
})));
// Introduce the forest mystery over the course of town development, not right
// after the first sale. The archived scene ID stays the same.
const enqueueSceneBefore128=O.enqueueSceneInSave;
O.enqueueSceneInSave=(save,id)=>id==='forestRumor'&&!save?.story?.opening?.lv5TavernVisited?false:enqueueSceneBefore128(save,id);
const visitTavernBefore128=O.visitLv5Tavern;
O.visitLv5Tavern=(...args)=>{const result=visitTavernBefore128(...args);const save=F.readSave();if(save.story?.opening?.lv5TavernVisited&&save.story?.rumor){O.enqueueScene('forestRumor')}return result};

const startRun=F.startRun,finishRun=F.finishRun,visit=F.applyCustomerVisit;
O.tutorialSupplies=s=>{const o=s.story?.opening;if(o?.phase!=='mission1')return[];const wood=Math.max(0,O.rules.stallWood-(Number(o.woodReturned)||0)),goods=Math.max(0,1-(Number(o.goodsReturned)||0));return[...(wood?[['wood',wood]]:[]),...(goods?[['bread',1]]:[])];};
F.startRun=(...args)=>{if(O.active()&&!O.canExplore())throw new Error('拠点の「次にすること」を確認してください。');const supplies=O.active()?O.tutorialSupplies(F.readSave()):[],run=startRun(...args);if(supplies.length){const candidates=[];for(let y=1;y<run.map.length-1;y++)for(let x=1;x<run.map[y].length-1;x++){const d=Math.abs(x-run.player.x)+Math.abs(y-run.player.y);if(d>=1&&run.map[y][x]==='floor'&&!run.enemies.some(e=>e.x===x&&e.y===y)&&!(run.traps||[]).some(t=>t.x===x&&t.y===y))candidates.push({x,y,d});}candidates.sort((a,b)=>a.d-b.d);supplies.forEach(([itemId,qty],i)=>{const p=candidates[i];if(p){run.floorItems.push({x:p.x,y:p.y,itemId,qty,openingSupply:true});run.map[p.y][p.x]='gather';}});run.log.push('露店設営に必要な木材と商品を探そう。持ち帰った分は追加配置されません。');}return run;};
F.finishRun=(...args)=>{const runBefore=F.run,wasActive=!!runBefore?.active,runId=runBefore?.dungeonId,runFloor=Number(runBefore?.floor)||0,runMax=Number(runBefore?.maxFloor)||0,result=finishRun(...args);if(wasActive&&result&&O.active()){F.mutateSave(s=>{const o=s.story.opening;O.ensureSceneState(o);o.woodReturned+=Number(result.delivered?.wood)||0;o.goodsReturned+=Object.entries(result.delivered||{}).filter(([id])=>id!=='wood'&&F.item(id)).reduce((n,[,q])=>n+q,0);if(result.success&&o.phase==='mission1'&&o.woodReturned>=O.rules.stallWood&&o.goodsReturned>0)O.enqueueSceneInSave(s,'firstReturn');if(result.success&&result.reason==='clear'&&runId==='beginner_forest'&&runFloor>=runMax&&!o.forestLordDefeated){o.forestLordDefeated=true;o.endingSeen=true;O.enqueueSceneInSave(s,'forestEnding');F.addHistory(s,'story','森の主と向き合い、森と町をつなぐ道を見つけた。')}});if(result.reason==='clear')O.syncEnding?.()}return result};
F.applyCustomerVisit=result=>{const saved=F.readSave(),soldBefore=saved.sales.count,rumorBefore=!!saved.story?.rumor,value=visit(result),after=F.readSave(),sold=Number(after.sales?.count)||0;if(O.active()&&O.phase()==='first_sale'&&sold>soldBefore)F.mutateSave(s=>{s.story.opening.mission2=true;s.story.opening.phase='upgrade';O.enqueueSceneInSave(s,'firstSale');if(!rumorBefore&&s.story?.rumor)O.enqueueSceneInSave(s,'forestRumor');F.addHistory(s,'mission','ミッション②達成：初めて商品を売ろう。')});else if(O.active()&&!rumorBefore&&after.story?.rumor)O.enqueueScene('forestRumor');return value};
// The final epilogue is also available if the boss was defeated before shop Lv6 completion.
const previousFinishRun127=F.finishRun;
F.finishRun=(...args)=>{const result=previousFinishRun(...args);if(result&&O.active()&&!O.isTestPoint()){
 const s=F.readSave();if(s.story?.opening?.lv6HomeVisited&&s.story?.opening?.forestLordDefeated)O.maybeLv6Finale();
 }return result;};
O.enter();
})();
// Updated: 2026-10-25 JST / Ver1.47

// Updated: 2026-10-25 JST / Ver1.48

// Updated: 2026-10-25 14:08 JST / Ver1.58

// Updated: 2026-10-25 JST / Ver1.60

// Updated: 2026-10-25 JST / Ver1.65

// Bundle updated: 2026-10-25 18:48 JST / Frontier Ver1.65

// Updated: 2026-10-25 20:21 JST / Ver1.67

// Updated: 2026-10-30 17:51 JST / Ver1.83

// Updated: 2026-10-30 19:52 JST / Ver1.84: tent setup is an explicit point action.

// Updated: 2026-11-01 19:14 JST / Ver1.111: canonical shop Lv1-6 and safe old Lv7 shelf migration.

// Updated: 2026-11-01 19:35 JST / Ver1.112 cumulative release; HUD redesigned (index/UI/data), previous mechanics retained.

// Updated: 2026-11-01 19:47 JST / Ver1.113: included from Ver1.112 unchanged logic for cumulative TEST release.

// Updated: 2026-11-01 20:27 JST / Ver1.116: interactive opening investigation, scene sequence and replayable journal.

// Updated: 2026-11-01 21:10 JST / Ver1.117 — current mission only; location actions and automatic first-exploration transition.

// Updated: 2026-11-01 21:30 JST / Ver1.118: suppress blocking dialogues while the opening cinematic is moving.

// Updated: 2026-11-02 21:50 JST / Ver1.124: Lv2 to Lv3 story quests, resource checks and save-safe construction.

// Updated: 2026-11-02 21:59 JST / Ver1.125: one-at-a-time Lv4 story, forge and residence construction.

// Updated: 2026-11-02 22:02 JST / Ver1.125: final forge-visit quest.

// Updated: 2026-11-03 03:50 JST / Ver1.126: Lv5 market, tavern, story and save-compatible missions.

// Updated: 2026-11-03 03:53 JST / Ver1.126 release.

// Updated: 2026-11-03 03:55 JST / Ver1.126 release.

// Updated: 2026-11-03 JST / Ver1.127: Lv6 development, detached home, single active mission.

// Updated: 2026-11-03 04:38 JST / Ver1.128: character arcs and forest mystery paced across chapters; no save-schema changes.
// Bundle updated: 2026-11-03 04:47 JST / Frenda Frontier Ver1.128.

// Updated: 2026-11-03 08:47 JST / Ver1.131: dialogue matched to visible scene objects.
