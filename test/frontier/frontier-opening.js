/* Frenda Frontier Ver1.84 — visible tent setup action at the opening point. */
(()=>{'use strict';
const F=window.FRENDA_FRONTIER,originalKey=F.SAVE_KEY,storyKey=originalKey+':opening147';
const O=F.OPENING={originalKey,storyKey,rules:Object.freeze({stallWood:3,storeWood:6,storeCoins:150,provisional:true}),levels:[{level:1,name:'露店',shelves:3},{level:2,name:'店舗兼住宅',shelves:3},{level:3,name:'店舗兼住宅',shelves:4},{level:4,name:'店舗兼住宅',shelves:5},{level:5,name:'店舗兼住宅',shelves:6},{level:6,name:'店舗兼住宅',shelves:6},{level:7,name:'店舗専用＋専用住宅',shelves:9}],tentBox:{x:610,y:105,w:96,h:80},stallBox:{x:730,y:215,w:122,h:70},shopBox:{x:688,y:82,w:176,h:172}};
const initial=()=>({phase:'arrival',woodReturned:0,goodsReturned:0,mission1:false,mission2:false,prologueVersion:1,prologueComplete:false,tentPitched:false,endingSeen:false,sceneQueue:[],sceneSeen:{}});
O.active=()=>F.SAVE_KEY===storyKey||F.SAVE_KEY.startsWith(originalKey+':mission148test:');
O.isTestPoint=()=>F.SAVE_KEY.includes(':mission148test:');
O.SCENES=Object.freeze({
 arrival:{lines:[
  {speaker:'ナレーション',text:'フロンティアのはずれ。森の入口に、不思議な迷宮が見つかった。',icon:'🌲'},
  {speaker:'旅の冒険者',text:'奥では珍しい素材が見つかるらしい。冒険者が集まり始めているんだ。',portrait:'traveler'},
  {speaker:'開拓者',text:'戻ってきた人が、ほっとできる場所が必要だ。ここに拠点を作ろう。',portrait:'player'},
  {speaker:'次の目的',text:'画面下の「テント設営」を選び、冒険者が戻れる拠点を作ろう。',icon:'📜'}
 ]},
 camp:{lines:[
  {speaker:'ナレーション',text:'小さなテントが、フロンティア最初の拠点になった。',icon:'🌲'},
  {speaker:'開拓者',text:'森で集めた品を並べれば、旅人を助ける店も開けそうだ。',portrait:'player'},
  {speaker:'次の目的',text:'はじまりの森で木材と商品を集め、ロープで帰還する。',icon:'📜'}
 ]},
 firstReturn:{lines:[
  {speaker:'ナレーション',text:'森から戻ると、旅人たちがテントのそばへ集まっていた。',icon:'🌲'},
  {speaker:'旅の冒険者',text:'薬や食料を買える場所があれば、もっと奥まで進めるのに。',portrait:'traveler'},
  {speaker:'開拓者',text:'冒険の成果を、この町の暮らしにつなげよう。',portrait:'player'},
  {speaker:'次の目的',text:'木材で露店を設営し、商品を並べて開業する。',icon:'📜'}
 ]},
 stallOpen:{lines:[
  {speaker:'ナレーション',text:'はじめての露店に灯りがともった。',icon:'🏮'},
  {speaker:'旅の冒険者',text:'次の冒険の帰りも、ここに立ち寄らせてもらうよ。',portrait:'traveler'},
  {speaker:'次の目的',text:'店を営業して、最初のお客さんに商品を届ける。',icon:'📜'}
 ]},
 firstSale:{lines:[
  {speaker:'旅の冒険者',text:'この品があって助かった。森の奥で、青白く光る石を見たんだ。',portrait:'traveler'},
  {speaker:'開拓者',text:'迷宮の奥に何かあるのかもしれない。町を育てながら調べてみよう。',portrait:'player'},
  {speaker:'次の目的',text:'店と町を発展させ、森の噂を集める。',icon:'📜'}
 ]},
 forestRumor:{lines:[
  {speaker:'ナレーション',text:'町に人が集まるにつれ、森の奥の光の噂も広がっていった。',icon:'🌲'},
  {speaker:'旅の冒険者',text:'最深部には森の主がいる。森を荒らす者を追い返しているそうだ。',portrait:'traveler'},
  {speaker:'開拓者',text:'宝を探すだけじゃない。森のことも確かめよう。',portrait:'player'},
  {speaker:'次の目的',text:'はじまりの森の最深部を目指す。',icon:'📜'}
 ]},
 shopComplete:{lines:[
  {speaker:'ナレーション',text:'テント脇の露店は、冒険者が帰ってこられる店へと育った。',icon:'🏮'},
  {speaker:'旅の冒険者',text:'ここがあるから、また迷宮へ出かけられる。',portrait:'traveler'},
  {speaker:'次の目的',text:'冒険と商売を続け、次の依頼に備える。',icon:'📜'}
 ]},
 forestEnding:{lines:[
  {speaker:'ナレーション',text:'最深部。森の主は、最後まで行く手を守るように立ちはだかった。',icon:'🌲'},
  {speaker:'森の主',text:'言葉はない。ただ、森を守るようにこちらを見つめている。',portrait:'forest',icon:'🌳'},
  {speaker:'開拓者',text:'宝だけを持ち帰るつもりはない。森と町の両方を守れる道を探そう。',portrait:'player'},
  {speaker:'ナレーション',text:'森の主は道をあけた。秘宝の力は森と町へ広がり、荒れた土地を少しずつ潤していく。',icon:'✨'},
  {speaker:'旅の冒険者',text:'この町があるから、みんなまた冒険に出られるんだね。',portrait:'traveler'},
  {speaker:'開拓者',text:'帰ってきたみんなが「ただいま」と言える町にしよう。',portrait:'player'},
  {speaker:'次の目的',text:'物語はひと区切り。町づくりと冒険はこれからも続く。',icon:'📜'}
 ]}
});
O.ensureSceneState=o=>{if(!Array.isArray(o.sceneQueue))o.sceneQueue=[];if(!o.sceneSeen||typeof o.sceneSeen!=='object')o.sceneSeen={};return o};
O.enqueueSceneInSave=(s,id)=>{const o=O.ensureSceneState(s?.story?.opening||{});if(!s?.story?.opening||!O.SCENES[id]||o.sceneSeen[id]||o.sceneQueue.includes(id))return false;o.sceneQueue.push(id);return true};
O.enqueueScene=id=>{if(!O.active()||O.isTestPoint())return false;let queued=false;F.mutateSave(s=>{queued=O.enqueueSceneInSave(s,id)});return queued};
O.completeScene=id=>{F.mutateSave(s=>{const o=O.ensureSceneState(s?.story?.opening||{});if(!s?.story?.opening)return;o.sceneQueue=o.sceneQueue.filter(x=>x!==id);o.sceneSeen[id]=true});O.presentingScene=false};
O.presentPendingScene=()=>{if(!O.active()||O.isTestPoint()||O.presentingScene||typeof F.playStoryDialogue!=='function')return false;const o=O.ensureSceneState(F.readSave().story?.opening||{}),id=o.sceneQueue[0],scene=O.SCENES[id];if(!scene)return false;O.presentingScene=true;F.playStoryDialogue(scene,()=>O.completeScene(id));return true};
// Approved exterior stages. The maximum shop plot stays reserved at every level.
O.exteriorCrops=[[60,140,310,260],[425,125,410,290],[850,110,420,310],[1275,110,499,310],[8,500,557,320],[570,500,600,320],[1220,520,260,300],[1530,580,230,240]];
O.currentLevel=()=>Math.max(2,Math.min(7,Number((O.visibleState||F.readSave()).development.town.facilities.shop)||2));
O.maxShopPlot={x:646,y:80,w:260,h:174};
O.currentShopBox=()=>{const lv=O.currentLevel(),w=[0,0,148,190,220,260,260,260][lv],h=[0,0,116,132,150,174,174,174][lv];return{x:776-w/2,y:254-h,w,h}};
O.ownerHomeBox={x:926,y:142,w:88,h:112};O.ownerWarehouseBox={x:1034,y:176,w:70,h:78};
O.enter=()=>{if(F.SAVE_KEY!==storyKey&&F.run?.active)throw new Error('探索から帰還してから切り替えてください。');F.SAVE_KEY=storyKey;O.testPoint='current';let s=F.readSave();if(!s.story?.opening){s=F.freshSave();for(const id of Object.keys(s.development.town.facilities))s.development.town.facilities[id]=0;s.development.town.projects={};s.development.town.order=[];s.development.town.shopLevel=0;s.shelves=[];s.story.opening=initial();O.enqueueSceneInSave(s,'arrival');F.writeSave(s)}else{const o=O.ensureSceneState(s.story.opening);let changed=false;if(!o.prologueVersion){if(o.phase==='mission1'&&!o.woodReturned&&!o.goodsReturned&&!(Number(s.development.town.facilities.shop)||0))o.phase='arrival';else if(!['arrival','tent'].includes(o.phase))o.prologueComplete=true;o.prologueVersion=1;changed=true}if(o.phase==='arrival'&&!o.prologueComplete&&!o.sceneSeen.arrival&&!o.sceneQueue.includes('arrival')){O.enqueueSceneInSave(s,'arrival');changed=true}if(changed||!Array.isArray(s.story.opening.sceneQueue))F.writeSave(s)}};
O.leave=()=>{if(F.run?.active)throw new Error('探索から帰還してから切り替えてください。');F.SAVE_KEY=originalKey};
O.state=()=>F.readSave().story.opening||initial();O.phase=()=>O.state().phase;
O.canStore=()=>['stocking','first_sale','upgrade','complete'].includes(O.phase());
O.canExplore=()=>['mission1','stocking','first_sale','upgrade','building','complete'].includes(O.phase());
O.goods=s=>Object.entries(s.warehouse||{}).filter(([id,n])=>id!=='wood'&&n>0&&F.item(id)).reduce((n,[,qty])=>n+qty,0);
O.stallReady=()=>{const s=F.readSave(),o=s.story.opening;return o.phase==='mission1'&&o.woodReturned>=O.rules.stallWood&&o.goodsReturned>0&&(s.warehouse.wood||0)>=O.rules.stallWood&&O.goods(s)>0};
O.ready=()=>{const s=F.readSave();return s.story.opening.phase==='upgrade'&&s.story.opening.mission2&&(s.warehouse.wood||0)>=O.rules.storeWood&&s.coins>=O.rules.storeCoins};
O.advance=()=>F.mutateSave(s=>{const o=s.story.opening;if(o.phase==='arrival'){o.phase='tent';o.tentPitched=true;O.enqueueSceneInSave(s,'camp');F.addHistory(s,'story','森の入口にテントを張り、冒険者が戻れる拠点を作り始めた。')}else if(o.phase==='tent'){o.phase='mission1';o.prologueComplete=true;F.addHistory(s,'opening','テントを拠点に、露店を開く準備を始めた。')}else if(o.phase==='building'){const p=o.townProject,elapsed=Math.max(0,(s.clock?.actionCount||0)-(p?.startedAt||0));if(!p||elapsed<(Number(p.steps)||1))throw new Error('建築中です。探索で時間を進めてください。');o.phase='complete';s.development.town.facilities.shop=2;s.development.town.shopLevel=2;delete o.townProject;O.enqueueSceneInSave(s,'shopComplete');F.addHistory(s,'opening','店舗兼住宅Lv2が完成。テントと露店を撤去した。')}else throw new Error('今は次へ進めません。')});
O.setupStall=()=>{if(!O.stallReady())throw new Error('ダンジョンから設営用の木材と売る商品を持ち帰ってください。');return F.mutateSave(s=>{s.warehouse.wood-=O.rules.stallWood;if(!s.warehouse.wood)delete s.warehouse.wood;s.story.opening.phase='stocking';s.development.town.facilities.shop=1;s.development.town.shopLevel=1;s.shelves=[null,null,null];F.addHistory(s,'opening','木材で露店Lv1を設営した。商品を並べて開業しよう。')})};
O.open=()=>F.mutateSave(s=>{const o=s.story.opening;if(o.phase!=='stocking')throw new Error('露店はすでに開業済みです。');if(!s.shelves.some(sh=>sh&&sh.qty>0&&F.item(sh.itemId)))throw new Error('商品を1点以上並べてください。');o.mission1=true;o.phase='first_sale';O.enqueueSceneInSave(s,'stallOpen');F.addHistory(s,'mission','ミッション①達成：はじめての露店を開こう。次は初めての商品販売。')});
O.build=()=>{if(!O.ready())throw new Error('初売り達成と木材・建築費が必要です。');return F.mutateSave(s=>{s.warehouse.wood-=O.rules.storeWood;if(!s.warehouse.wood)delete s.warehouse.wood;s.coins-=O.rules.storeCoins;s.story.opening.phase='building';s.story.opening.townProject={stage:3,steps:1,startedAt:Number(s.clock?.actionCount)||0,paid:true};F.addHistory(s,'opening','店舗兼住宅Lv2の建築を開始した。探索で工事を進めよう。')})};
O.originalSolids=()=>{if(!O.active())return[];const p=O.phase();return p==='arrival'?[]:['tent','mission1'].includes(p)?[O.tentBox]:['stocking','first_sale','upgrade'].includes(p)?[O.tentBox,O.stallBox]:p==='building'?[O.tentBox,O.shopBox]:[O.shopBox]};
O.solids=()=>{const a=O.originalSolids();if(O.phase()!=='complete')return a;return O.currentLevel()>=7?[O.currentShopBox(),O.ownerHomeBox,O.ownerWarehouseBox]:[O.currentShopBox()]};
O.draw=(c,art,cam)=>{if(!O.active())return;const s=O.visibleState||F.readSave(),p=s.story.opening.phase,draw=(i,b)=>c.drawImage(art[i],b.x-cam.x,b.y-cam.y,b.w,b.h);if(!['arrival','complete'].includes(p))draw(5,O.tentBox);if(['stocking','first_sale','upgrade'].includes(p)){draw(7,O.stallBox);c.font='17px sans-serif';c.textAlign='center';s.shelves.forEach((sh,i)=>{if(sh)c.fillText(F.item(sh.itemId)?.icon||'📦',O.stallBox.x+32+i*29-cam.x,O.stallBox.y+49-cam.y)})}if(p==='complete'){const level=O.currentLevel(),sprite=(i,b)=>c.drawImage(art[6],...O.exteriorCrops[i],b.x-cam.x,b.y-cam.y,b.w,b.h);if(level>=7){c.fillStyle='#b7a380';c.fillRect(765-cam.x,262-cam.y,318,24);for(const b of[O.ownerHomeBox,O.ownerWarehouseBox])c.fillRect(b.x+b.w/2-10-cam.x,b.y+b.h-cam.y,20,32)}sprite(level-2,O.currentShopBox());if(level>=7){sprite(6,O.ownerHomeBox);sprite(7,O.ownerWarehouseBox)}}if(p==='building'){const b=O.shopBox,x=b.x-cam.x,y=b.y-cam.y;c.fillStyle='#c3a776';c.fillRect(x,y,b.w,b.h);c.strokeStyle='#815b32';c.lineWidth=5;c.strokeRect(x+4,y+4,b.w-8,b.h-8);for(const dx of[8,b.w-12])for(const dy of[8,b.h-12]){c.fillStyle='#79522f';c.fillRect(x+dx,y+dy-20,6,28)}c.fillStyle='#89633d';for(let i=0;i<4;i++)c.fillRect(x+20,y+28+i*13,b.w-40,8)}};
// Ver1.83: the campaign now opens at the forest entrance; TEST story points stay isolated.
O.testPoint='current';
O.testEnabled=()=>window.FRENDA_TEST?.active!==false;
O.points=[['lv3','外観確認：店舗Lv3'],['lv4','外観確認：店舗Lv4'],['lv5','外観確認：店舗Lv5'],['lv6','外観確認：店舗Lv6'],['lv7','外観確認：店舗Lv7＋住宅・倉庫'],['current','現在のプレーを続ける'],['opening-arrival','導入：迷宮発見直後'],['opening-tent','導入：テント設営後'],['gather','テント設営済み・資材集め前'],['returned','資材と商品を持ち帰った後'],['stall','露店設営後・商品を並べる前'],['stocked','商品陳列済み・開業前'],['opened','露店開業後・初売り前'],['sold','初売り後・建築材料集め前'],['ready','店舗Lv2の建築材料が揃った時'],['building','店舗Lv2の建築中'],['complete','店舗Lv2の完成後']];
O.makePoint=id=>{const s=F.freshSave();for(const k of Object.keys(s.development.town.facilities))s.development.town.facilities[k]=0;s.development.town.projects={};s.development.town.order=[];s.development.town.shopLevel=0;s.shelves=[];s.story.opening=initial();const o=s.story.opening;if(id==='opening-arrival')return s;if(id==='opening-tent'){o.phase='tent';o.tentPitched=true;return s}if(id==='gather'){o.phase='mission1';o.prologueComplete=true;o.tentPitched=true;return s}s.story.firstAdventure=true;s.story.firstReturn=true;o.prologueComplete=true;o.tentPitched=true;o.woodReturned=O.rules.stallWood;o.goodsReturned=1;s.warehouse={wood:O.rules.stallWood,bread:1};if(id==='returned')return s;o.phase='stocking';s.development.town.facilities.shop=1;s.development.town.shopLevel=1;s.shelves=[null,null,null];s.warehouse={bread:1};if(id==='stall')return s;s.story.firstStock=true;s.shelves[0]={itemId:'bread',qty:1,price:F.item('bread').base};s.warehouse={};if(id==='stocked')return s;o.mission1=true;o.phase='first_sale';if(id==='opened')return s;o.phase='upgrade';o.mission2=true;s.sales.count=1;s.sales.revenue=F.item('bread').base;s.sales.customers=1;s.story.firstSale=true;s.story.firstLoop=true;s.development.points=2;s.coins=F.ECONOMY_RULES.startCoins+F.item('bread').base;s.shelves=[null,null,null];if(id==='sold')return s;s.warehouse={wood:O.rules.storeWood};s.coins=Math.max(s.coins,O.rules.storeCoins);o.woodReturned=O.rules.stallWood+O.rules.storeWood;if(id==='ready')return s;o.phase='building';s.coins-=O.rules.storeCoins;s.warehouse={};o.townProject={stage:3,steps:1,startedAt:Number(s.clock?.actionCount)||0,paid:true};if(id==='building')return s;o.phase='complete';delete o.townProject;const level=/^lv[3-7]$/.test(id)?Number(id.slice(2)):2;s.development.town.facilities.shop=level;s.development.town.shopLevel=level;s.shelves=Array([0,3,3,4,5,6,6,9][level]).fill(null);return s};
O.switchPoint=id=>{if(!O.testEnabled())throw new Error('TEST機能は利用できません。');if(!O.points.some(p=>p[0]===id))throw new Error('選択した時点がありません。');if(F.run?.active)throw new Error('探索から帰還してから時点を切り替えてください。');if(id==='current')O.enter();else{F.SAVE_KEY=originalKey+':mission148test:'+id;O.visibleState=null;F.writeSave(O.makePoint(id));O.testPoint=id}F.run=null;if(F.WILDERNESS){F.WILDERNESS.stop();F.WILDERNESS.position={x:774,y:306};F.WILDERNESS.active=true}};
O.guidance=()=>{
 const s=F.readSave(),p=O.phase(),stocked=s.shelves.some(sh=>sh&&sh.qty>0),wood=Number(s.warehouse.wood)||0,goods=O.goods(s);
 if(p==='arrival')return{title:'森の入口に拠点を作ろう',text:'テントを設営し、冒険者が帰ってこられる場所を作る。',label:'テント設営メニュー',act:'campSetup'};
 if(p==='tent')return{title:'露店の準備を始めよう',text:'森から木材と商品を持ち帰り、最初の露店を開こう。',label:'開拓を始める',act:'advance'};
 if(p==='mission1')return O.stallReady()?{title:'資材と商品が揃いました',text:'木材を使って、テントの脇に露店を設営しましょう。',label:'露店を設営する',act:'setup'}:{title:'まずは露店を開く準備をしよう',text:`「はじまりの森へ」から探索を開始し、B1Fで木材${O.rules.stallWood}個と売る商品を1点以上拾いましょう。集めたら「ロープ」で拠点へ持ち帰れます。`,label:F.run?.active?'探索を再開する':'はじまりの森へ',act:'adventure'};
 if(p==='stocking')return stocked?{title:'商品が並びました。開業しましょう',text:'店頭に商品を1点並べました。露店を開業すると、最初のミッションを達成します。',label:'露店を開業する',act:'open'}:{title:'露店に商品を1点並べよう',text:'「商品を並べる」から露店へ進み、「陳列枠1：空き」を選んで、持ち帰った商品を並べましょう。',label:'商品を並べる',act:'shop'};
 if(p==='first_sale')return stocked?{title:'最初のお客さんに商品を売ろう',text:'露店へ行って営業しましょう。適正価格の商品には、迷宮帰りの冒険者が最初のお客さんとして立ち寄ります。',label:'露店へ行く',act:'shop'}:goods>0?{title:'売る商品を並べよう',text:'露店の空いている陳列枠を選び、保管中の商品を並べてから営業しましょう。',label:'商品を並べる',act:'shop'}:{title:'商品を仕入れよう',text:'商品がなくなりました。はじまりの森で商品を拾い、持ち帰って露店に並べましょう。',label:'はじまりの森へ',act:'adventure'};
 if(p==='upgrade'){
  if(O.ready())return{title:'店舗Lv2を建てられます',text:'木材と建築費を渡すと、テントと露店に代わる店舗兼住宅の建築が始まります。',label:'店舗Lv2を建築する',act:'build'};
  const stockedGoods=stocked||goods>0,needWood=wood<O.rules.storeWood,needMoney=s.coins<O.rules.storeCoins;
  const act=needWood||(!stockedGoods&&needMoney)?'adventure':'shop';
  const missing=[];if(needWood)missing.push(`木材 ${wood}/${O.rules.storeWood}個`);if(needMoney)missing.push(`所持金 ${s.coins}/${O.rules.storeCoins}G`);if(!stockedGoods)missing.push('販売商品なし');
  return{title:'店舗兼住宅Lv2の資材を揃えよう',text:`${missing.join(' ／ ')}。木材や商品は迷宮で集め、建築費は適正価格で営業して貯めます。`,label:act==='adventure'?'迷宮で材料を集める':'露店で営業する',act};
 }
 if(p==='building'){const q=s.story.opening.townProject,elapsed=Math.max(0,(s.clock?.actionCount||0)-(q?.startedAt||0)),ready=!!q&&elapsed>=(Number(q.steps)||1);return ready?{title:'店舗Lv2の工事が完了しました',text:'新しい建物を確認すると、テントと露店が片付きます。',label:'完成した店を確認する',act:'finish'}:{title:'店舗Lv2を建築しています',text:`工事の進み具合：${Math.min(elapsed,Number(q?.steps)||1)}/${Number(q?.steps)||1}。迷宮へ出て時間を進めると完成します。`,label:'迷宮へ行く',act:'adventure'}};
 if(p==='complete'&&s.story?.rumor&&!s.story.opening.forestLordDefeated)return{title:'第2章：森の奥の光',text:'町で広がった噂によると、森の最深部には森を守る主がいるようです。町を拠点に準備を整え、はじまりの森の最深部を目指しましょう。',label:'はじまりの森を調査する',act:'adventure'};
 if(p==='complete'&&s.story?.opening?.forestLordDefeated)return{title:'エピローグ：森と町の新しい暮らし',text:'森の主との出会いを経て、町と森はともに歩み始めました。ここからも冒険と町づくりを続けられます。',label:'町の店へ戻る',act:'shop'};
 return{title:'店舗兼住宅Lv2が完成しました',text:'テントと露店を片付けました。店内の3棚へ商品を並べて営業できます。',label:'店舗Lv2に入る',act:'shop'}
};
O.guide=()=>{const g=O.guidance();return `<section style="padding:14px;background:#fff8dc;border-bottom:2px solid #d5b860"><b style="font-size:17px">次にすること：${g.title}</b><p style="line-height:1.7;margin:8px 0">${g.text}</p><div id="nextActions" style="display:flex;gap:8px;flex-wrap:wrap"></div></section>`};
O.missions=()=>{const s=F.readSave(),o=s.story.opening,lv=Number(s.development.town.facilities.shop)||0,stocked=s.shelves.some(sh=>sh&&sh.qty>0),done1=o.mission1,done2=o.mission2,done3=o.phase==='complete',prologueDone=!!o.prologueComplete;return[{name:'導入：迷宮のそばに拠点を作る',state:prologueDone?'達成':'進行中',steps:[['不思議な迷宮の発見を知る',true],['旅人向けの店を開くためテントを張る',!!o.tentPitched],['テントを拠点に開拓を始める',prologueDone]]},{name:'ミッション 1：はじめての露店を開こう',state:done1?'達成':prologueDone?'進行中':'未解放',steps:[['設営用の木材を持ち帰る',done1||lv>=1||o.woodReturned>=O.rules.stallWood],['売る商品を持ち帰る',done1||o.goodsReturned>0],['テントの脇に露店Lv1を設営する',done1||lv>=1],['商品を1点以上並べる',done1||stocked],['露店を開業する',done1]]},{name:'ミッション 2：初めて商品を売ろう',state:done2?'達成':done1?'進行中':'未解放',steps:[['露店で商品を1件以上売る',done2]]},{name:'ミッション 3：店舗兼住宅Lv2を建てよう',state:done3?'達成':done2?'進行中':'未解放',steps:[['木材と建築費を揃える',done3||o.phase==='building'||(done2&&O.ready())],['材料を渡して建築を開始する',done3||o.phase==='building'],['工事を進めて完成を確認する',done3]]}]};
O.chapters=()=>{const s=F.readSave(),o=s.story.opening;return[
 {name:'序章：森の入口に拠点を',done:!!o.prologueComplete,active:!o.prologueComplete,detail:'迷宮のそばにテントを張り、冒険者を迎える。'},
 {name:'第1章：冒険者の店',done:o.phase==='complete'||!!o.forestLordDefeated,active:!!o.mission1&&!o.forestLordDefeated,detail:'素材を集め、露店と店舗兼住宅を育てる。'},
 {name:'第2章：森の奥の光',done:!!o.forestLordDefeated,active:!!s.story?.rumor&&!o.forestLordDefeated,detail:s.story?.rumor?'はじまりの森の最深部を調べる。':'町に広がる噂を集める。'},
 {name:'終章：森の主',done:!!o.forestLordDefeated,active:!!s.story?.rumor&&!o.forestLordDefeated,detail:o.forestLordDefeated?'森と町がともに歩み始めた。':'最深部で森を守る主と向き合う。'}
 ]};
O.missionsHTML=()=>`<h2>フロンティアの物語</h2><p>冒険で出会った人々の願いが、町の発展と森の謎につながっていきます。</p><div class="storyChapterList">${O.chapters().map((c,i)=>`<section class="storyChapter ${c.done?'done':c.active?'active':'locked'}"><b>${c.done?'✓':c.active?'▶':'🔒'} ${c.name}</b><small>${c.detail}</small></section>`).join('')}</div><h3>開拓ミッション</h3>${O.missions().map(m=>`<section style="padding:12px 0;border-bottom:1px solid #ccd8ce"><b>${m.name}</b><span style="float:right;font-weight:bold">${m.state}</span><ul style="padding-left:20px;line-height:1.9">${m.steps.map(([t,d])=>`<li>${d?'✓':'□'} ${t}</li>`).join('')}</ul></section>`).join('')}`;
O.testControls=()=>!O.testEnabled()?'':`<details class="test-menu-panel" style="margin:10px 12px;padding:8px;background:#edf2fa;border:1px solid #adbed9;border-radius:8px"><summary>TEST：開始時点を切り替える</summary><label style="display:block;margin:8px 0">プレー開始時点 <select id="testStoryPoint" style="width:100%;padding:8px;margin-top:5px">${O.points.map(([id,label])=>`<option value="${id}" ${O.testPoint===id?'selected':''}>${label}</option>`).join('')}</select></label><small>切替先のTEST枠に、その時点の進行・所持品をセットします。現在のプレー枠は保持されます。探索中は帰還後に切り替えてください。</small></details>`;
O.panel=()=>{const s=F.readSave(),r=O.rules;return `<div style="padding:10px 12px"><span>保管中：木材 ${s.warehouse.wood||0}個 ／ 所持金 ${s.coins}G</span><details style="margin-top:8px"><summary>TEST用の仮設定</summary><p>露店設営：木材${r.stallWood}個。店舗Lv2：木材${r.storeWood}個＋${r.storeCoins}G。必要数・費用は後で調整します。</p></details></div>`};
O.bind=(rerender,actions={})=>{const g=O.guidance(),el=document.getElementById('nextActions');if(!el)return;const add=(label,fn,primary=false)=>{const b=document.createElement('button');b.className='cmdBtn'+(primary?' primary':'');b.textContent=label;b.onclick=()=>{try{fn?.()}catch(e){(document.getElementById('wildernessMessage')||document.getElementById('progressMessage')).textContent=e.message}};el.appendChild(b)};const acts={advance:()=>{O.advance();rerender()},campSetup:()=>actions.campSetup?.(),adventure:()=>actions.adventure?.(),shop:()=>actions.shop?.(),setup:()=>{O.setupStall();rerender()},open:()=>{O.open();rerender()},build:()=>{O.build();rerender()},finish:()=>{O.advance();rerender()}};add(g.label,acts[g.act],g.act==='campSetup');add('ミッション一覧',()=>actions.missions?.());const picker=document.getElementById('testStoryPoint');if(picker)picker.onchange=()=>{try{O.switchPoint(picker.value);rerender()}catch(e){picker.value=O.testPoint;(document.getElementById('wildernessMessage')||document.getElementById('progressMessage')).textContent=e.message}};O.presentPendingScene()};

// New 1..7 numbering is isolated to the new story save; legacy progress stays unchanged.
const oldCapacity=F.shopCapacity;F.shopCapacity=s=>s?.story?.opening?([0,3,3,4,5,6,6,9][Number(s.development.town.facilities.shop)||0]||0):oldCapacity(s);
const normalize=F.normalizeSave;F.normalizeSave=s=>{const level=s?.story?.opening?Number(s?.development?.town?.facilities?.shop)||0:null,rawShelves=level===7?(s.shelves||[]).slice():null;const out=normalize(s);if(level!==null){out.development.town.facilities.shop=Math.max(0,Math.min(7,level));out.development.town.shopLevel=out.development.town.facilities.shop;if(level===7){out.shelves=rawShelves.slice(0,9);while(out.shelves.length<9)out.shelves.push(null)}}return out};
const interior=F.interiorModel;F.interiorModel=(id,s)=>{if(id!=='shop'||!s?.story?.opening)return interior(id,s);const lv=Number(s.development.town.facilities.shop)||0;if(lv<2)throw new Error('露店には店内がありません。');const old=JSON.parse(JSON.stringify(s));delete old.story.opening;old.development.town.facilities.shop=lv-1;const m=interior(id,old);m.planLv=m.lv;m.lv=lv;m.max=7;return m};

const approvedGuidance=O.guidance;O.guidance=()=>{const g=approvedGuidance(),s=F.readSave();if(O.phase()==='complete'&&O.currentLevel()>2&&!s.story?.rumor&&!s.story?.opening?.forestLordDefeated){const lv=O.currentLevel();return{title:`店舗Lv${lv}の外観確認`,text:`陳列${O.levels[lv-1].shelves}棚。外観と店内を確認できます。`,label:`店舗Lv${lv}に入る`,act:'shop'}}return g};
const startRun=F.startRun,finishRun=F.finishRun,visit=F.applyCustomerVisit;
O.tutorialSupplies=s=>{const o=s.story?.opening;if(o?.phase!=='mission1')return[];const wood=Math.max(0,O.rules.stallWood-(Number(o.woodReturned)||0)),goods=Math.max(0,1-(Number(o.goodsReturned)||0));return[...(wood?[['wood',wood]]:[]),...(goods?[['bread',1]]:[])];};
F.startRun=(...args)=>{if(O.active()&&!O.canExplore())throw new Error('拠点の「次にすること」を確認してください。');const supplies=O.active()?O.tutorialSupplies(F.readSave()):[],run=startRun(...args);if(supplies.length){const candidates=[];for(let y=1;y<run.map.length-1;y++)for(let x=1;x<run.map[y].length-1;x++){const d=Math.abs(x-run.player.x)+Math.abs(y-run.player.y);if(d>=1&&run.map[y][x]==='floor'&&!run.enemies.some(e=>e.x===x&&e.y===y)&&!(run.traps||[]).some(t=>t.x===x&&t.y===y))candidates.push({x,y,d});}candidates.sort((a,b)=>a.d-b.d);supplies.forEach(([itemId,qty],i)=>{const p=candidates[i];if(p){run.floorItems.push({x:p.x,y:p.y,itemId,qty,openingSupply:true});run.map[p.y][p.x]='gather';}});run.log.push('露店設営に必要な木材と商品を探そう。持ち帰った分は追加配置されません。');}return run;};
F.finishRun=(...args)=>{const runBefore=F.run,wasActive=!!runBefore?.active,runId=runBefore?.dungeonId,runFloor=Number(runBefore?.floor)||0,runMax=Number(runBefore?.maxFloor)||0,result=finishRun(...args);if(wasActive&&result&&O.active()){F.mutateSave(s=>{const o=s.story.opening;O.ensureSceneState(o);o.woodReturned+=Number(result.delivered?.wood)||0;o.goodsReturned+=Object.entries(result.delivered||{}).filter(([id])=>id!=='wood'&&F.item(id)).reduce((n,[,q])=>n+q,0);if(result.success&&o.phase==='mission1'&&o.woodReturned>=O.rules.stallWood&&o.goodsReturned>0)O.enqueueSceneInSave(s,'firstReturn');if(result.success&&result.reason==='clear'&&runId==='beginner_forest'&&runFloor>=runMax&&!o.forestLordDefeated){o.forestLordDefeated=true;o.endingSeen=true;O.enqueueSceneInSave(s,'forestEnding');F.addHistory(s,'story','森の主と向き合い、森と町をつなぐ道を見つけた。')}});if(result.reason==='clear')O.syncEnding?.()}return result};
F.applyCustomerVisit=result=>{const saved=F.readSave(),soldBefore=saved.sales.count,rumorBefore=!!saved.story?.rumor,value=visit(result),after=F.readSave(),sold=Number(after.sales?.count)||0;if(O.active()&&O.phase()==='first_sale'&&sold>soldBefore)F.mutateSave(s=>{s.story.opening.mission2=true;s.story.opening.phase='upgrade';O.enqueueSceneInSave(s,'firstSale');if(!rumorBefore&&s.story?.rumor)O.enqueueSceneInSave(s,'forestRumor');F.addHistory(s,'mission','ミッション②達成：初めて商品を売ろう。')});else if(O.active()&&!rumorBefore&&after.story?.rumor)O.enqueueScene('forestRumor');return value};
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
