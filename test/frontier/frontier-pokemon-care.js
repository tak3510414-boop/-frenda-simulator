/* Frenda Frontier Ver1.137 — rescue, treatment, trust and voluntary coexistence.
   Updated: 2026-11-03 06:55 JST
   New-campaign only. Existing saves without pokemonCare remain unchanged. */
(()=>{'use strict';
const F=window.FRENDA_FRONTIER, O=F?.OPENING, P=F?.TOWN_PROGRESS;
if(!F||!O||!P)return;
const PC=F.POKEMON_CARE={VERSION:1,SPECIES_ID:'species:ニャオハ',NAME:'ニャオハ',RESCUE_POINT:{x:382,y:71},CAMP_POINT:{x:556,y:140}};
const originalMakePoint=O.makePoint,originalEnter=O.enter,originalSwitchPoint=O.switchPoint,originalMission=O.currentMission,originalGuidance=O.guidance,originalSupplies=O.tutorialSupplies;
const originalCanExplore=O.canExplore,originalSetupStall=O.setupStall;
const originalDrawPlayer=P.drawPlayer;
const STATE=['unseen','found','rescued','recovering','healthy','trusted','released'];
// New story scenes appear only after their gameplay events; skipped scenes remain readable in the archive.
O.SCENES=Object.freeze({...O.SCENES,
 pokemonFound:{chapter:'序章',title:'草むらの小さな声',icon:'🐾',lines:[
  {speaker:'ナレーション',text:'古い石を調べ終えると、そばの草むらがかすかに揺れた。',icon:'🌿'},
  {speaker:'開拓者',text:'……今、声がした？　あそこに何かいる。',portrait:'player'},
  {speaker:'旅の冒険者',text:'ニャオハだ。足を痛めているみたいだな。驚かせないよう、ゆっくり近づこう。',portrait:'traveler'},
  {speaker:'ナレーション',text:'小さなニャオハは逃げようとしたが、力が入らず、地面に伏せてしまった。',icon:'🐾'},
  {speaker:'開拓者',text:'大丈夫。君を捕まえたいんじゃない。まず、痛いところを見せてくれるかな。',portrait:'player'}
 ]},
 pokemonRescue:{chapter:'序章',title:'ここから始まる約束',icon:'🌱',lines:[
  {speaker:'ナレーション',text:'主人公が手を差し出すと、ニャオハはしばらく見つめ、そっと身を寄せた。',icon:'🐾'},
  {speaker:'旅の冒険者',text:'森の中は危険だ。雨を避けられる場所を作ろう。ニャオハにも休息が必要だ。',portrait:'traveler'},
  {speaker:'開拓者',text:'この子を安心して休ませたい。冒険者だけでなく、森で暮らすポケモンにも安全な場所が必要なんだ。',portrait:'player'},
  {speaker:'ナレーション',text:'ニャオハの息づかいを確かめながら、ふたりは草地へゆっくり戻った。',icon:'🌿'}
 ]},
 pokemonCamp:{chapter:'序章',title:'小さな患者',icon:'⛺',lines:[
  {speaker:'ナレーション',text:'テントに柔らかな布を敷くと、ニャオハはようやく目を閉じた。',icon:'⛺'},
  {speaker:'旅の冒険者',text:'重いけがではなさそうだけど、薬草で手当てできれば安心だ。森の浅いところで見つかるはず。',portrait:'traveler'},
  {speaker:'開拓者',text:'最初の冒険で薬草を探してこよう。木材や商品のことは、そのあとでもいい。',portrait:'player'},
  {speaker:'旅の冒険者',text:'うん。ニャオハが休めるように、私はここで見守っているよ。',portrait:'traveler'},
  {speaker:'次の目的',text:'はじまりの森B1Fで薬草1個を拾い、ロープで帰還しよう。テントのそばで手当てができる。',icon:'📜'}
 ]},
 pokemonFirstDeparture:{chapter:'序章',title:'ニャオハのための初探索',icon:'🌲',lines:[
  {speaker:'旅の冒険者',text:'ニャオハは私が見守るよ。君ははじまりの森で薬草を一つ探してきてほしい。',portrait:'traveler'},
  {speaker:'開拓者',text:'まずはあの子を元気にしよう。森の浅い場所から探してみる。',portrait:'player'},
  {speaker:'旅の冒険者',text:'店のための木材3個と商品1点も見つけられたら助かるけれど、無理をしないで。',portrait:'traveler'},
  {speaker:'旅の冒険者',text:'戦いは一歩ずつ。HPと満腹度を確認し、B1Fで必要なものが集まったらロープで帰ろう。',portrait:'traveler'},
  {speaker:'次の目的',text:'北の道からはじまりの森B1Fへ。薬草1個を拾い、ロープでテントへ戻ろう。',icon:'📜'}
 ]},
 pokemonRecovered:{chapter:'第1章',title:'薬草を届けた日',icon:'🌿',lines:[
  {speaker:'ナレーション',text:'主人公が薬草を使って手当てすると、ニャオハは体を起こし、ゆっくりと前足を伸ばした。',icon:'🌿'},
  {speaker:'開拓者',text:'よかった……！　少し楽になったみたい。',portrait:'player'},
  {speaker:'旅の冒険者',text:'自分で歩けるようになったね。でも、急いで連れていかないで。ニャオハがどうしたいか、確かめよう。',portrait:'traveler'},
  {speaker:'ナレーション',text:'ニャオハは主人公の足元に近づいて、小さく鳴いた。',icon:'🐾'},
  {speaker:'次の目的',text:'テントのそばでニャオハにもう一度話しかけよう。',icon:'📜'}
 ]},
 pokemonCoexist:{chapter:'第1章',title:'ともに暮らす選択',icon:'🐾',lines:[
  {speaker:'ナレーション',text:'ニャオハは森へ続く道を見つめたあと、主人公の隣にちょこんと座った。',icon:'🐾'},
  {speaker:'開拓者',text:'ここで暮らしてみる？　嫌になったら、いつでも森に遊びに行けるよ。',portrait:'player'},
  {speaker:'旅の冒険者',text:'それがいい。ポケモンは道具じゃない。人もポケモンも、安心して帰れる町にしたいね。',portrait:'traveler'},
  {speaker:'ナレーション',text:'ニャオハは元気よく鳴いた。町に、はじめてのポケモンの住民が増えた。',icon:'🌱'},
  {speaker:'次の目的',text:'ニャオハの居場所ができた。次は木材と商品を集めて、町の露店を作ろう。',icon:'📜'}
 ]},
 pokemonFarewell:{chapter:'第1章',title:'森との小さなつながり',icon:'🍃',lines:[
  {speaker:'ナレーション',text:'ニャオハは一度振り返って主人公を見つめたあと、森の奥へ走っていった。',icon:'🌲'},
  {speaker:'開拓者',text:'元気でね。森が危なくなったら、いつでもここに戻っておいで。',portrait:'player'},
  {speaker:'旅の冒険者',text:'守ることは、引き留めることだけじゃない。あの子が自分で選べるようにしたんだね。',portrait:'traveler'},
  {speaker:'次の目的',text:'森と町、どちらにも居場所がある。木材と商品を集めて、旅人のための露店を作ろう。',icon:'📜'}
 ]},
 pokemonForestClue:{chapter:'第2章',title:'ニャオハが教えてくれたこと',icon:'✨',lines:[
  {speaker:'旅商人リオ',text:'森のポケモンたちが、青白い光の強い日には遠くまで逃げているそうです。',portrait:'traveler'},
  {speaker:'開拓者',text:'ニャオハも、あの異変のせいで傷ついていたのかもしれない。',portrait:'player'},
  {speaker:'ミナ',text:'森の主が悪いとは限りません。何かから森を守ろうとしているのかも。',portrait:'traveler'},
  {speaker:'次の目的',text:'森の異変を止めるため、最深部を調べよう。倒すだけではなく、守っている理由を確かめる。',icon:'📜'}
 ]},
 pokemonForestHarmony:{chapter:'終章',title:'ポケモンとともにある町',icon:'🌳',lines:[
  {speaker:'ナレーション',text:'森の異変がおさまると、木々の間から少しずつポケモンの声が聞こえるようになった。',icon:'🌲'},
  {speaker:'開拓者',text:'人間だけの町じゃない。ポケモンたちも安心して過ごせる場所を作っていこう。',portrait:'player'},
  {speaker:'旅の冒険者',text:'森に帰る子も、町に残る子もいる。それぞれの暮らしを大切にしよう。',portrait:'traveler'},
  {speaker:'ナレーション',text:'ニャオハとの小さな出会いが、森と町をつなぐ最初の約束になった。',icon:'🐾'}
 ]}
});
const fresh=()=>({version:1,speciesId:PC.SPECIES_ID,name:PC.NAME,status:'unseen',trust:0,helpedAtDay:null,choice:null});
function initialEligible(s){const o=s?.story?.opening;return !!o&&o.phase==='arrival'&&!o.tentPitched&&!o.cinematicComplete&&!o.prologueComplete&&!o.sceneSeen?.entranceClue;}
function careOf(s){const a=s?.story?.opening?.pokemonCare;return a&&a.version===1&&STATE.includes(a.status)?a:null;}
PC.read=(s=F.readSave())=>careOf(s);
// Canvas renders at ~60fps: never deserialize localStorage during each animation frame.
PC.visualKey=null;PC.visualCare=null;PC.visualHerbs=0;
PC.refreshVisual=()=>{const s=F.readSave();PC.visualKey=F.SAVE_KEY;PC.visualCare=careOf(s);PC.visualHerbs=Number(s.warehouse?.herb)||0};
PC.visual=()=>{if(PC.visualKey!==F.SAVE_KEY)PC.refreshVisual();return PC.visualCare};
PC.canTreatVisual=()=>PC.visual()?.status==='recovering'&&PC.visualHerbs>=1;
PC.enabled=()=>!!careOf(F.readSave());
PC.begin=()=>{if(!O.active())return false;const s=F.readSave();if(!initialEligible(s)||careOf(s))return false;
 F.mutateSave(v=>{if(initialEligible(v)&&!careOf(v))v.story.opening.pokemonCare=fresh()});PC.refreshVisual();return PC.enabled();};
function update(fn){if(!O.active())return false;let changed=false;F.mutateSave(s=>{const c=careOf(s);if(c)changed=!!fn(s,c)});if(changed)PC.refreshVisual();return changed;}
PC.find=()=>update((s,c)=>{if(c.status!=='unseen')return false;c.status='found';c.trust=10;F.addHistory(s,'pokemon','森の入口で傷ついたニャオハを見つけた。');return true});
PC.rescue=()=>update((s,c)=>{if(c.status==='unseen'){c.status='found';c.trust=10}if(c.status!=='found')return false;c.status='rescued';c.trust=25;F.addHistory(s,'pokemon','ニャオハを驚かせないように抱き上げ、救助した。');return true});
PC.placeCamp=()=>update((s,c)=>{if(c.status!=='rescued')return false;c.status='recovering';c.trust=35;F.addHistory(s,'pokemon','ニャオハをテントの安全な場所で休ませた。');return true});
PC.canTreat=(s=F.readSave())=>careOf(s)?.status==='recovering'&&Number(s.warehouse?.herb||0)>=1;
PC.treat=()=>{if(!PC.canTreat())throw Error('薬草が1個必要です。はじまりの森で集めて持ち帰りましょう。');
 return update((s,c)=>{if(c.status!=='recovering'||Number(s.warehouse?.herb||0)<1)return false;
  s.warehouse.herb-=1;if(s.warehouse.herb<=0)delete s.warehouse.herb;
  c.status='healthy';c.trust=65;c.helpedAtDay=s.day;
  O.enqueueSceneInSave(s,'pokemonRecovered');F.addHistory(s,'pokemon','薬草1個でニャオハを手当てした。少しずつ元気を取り戻した。');return true});};
PC.bond=choice=>{if(!['town','forest'].includes(choice))throw Error('一緒に暮らすか、森へ帰るか選択してください。');
 return update((s,c)=>{if(c.status!=='healthy')return false;
  c.status=choice==='town'?'trusted':'released';c.choice=choice;c.trust=choice==='town'?100:80;
  if(choice==='town'){
   s.pokemon=s.pokemon||{};s.pokemon.storyCompanions=Array.isArray(s.pokemon.storyCompanions)?s.pokemon.storyCompanions:[];
   if(!s.pokemon.storyCompanions.includes(PC.SPECIES_ID))s.pokemon.storyCompanions.push(PC.SPECIES_ID);
   s.pokemon.companionUnlocks=s.pokemon.companionUnlocks||{};
   s.pokemon.companionUnlocks[PC.SPECIES_ID]=s.pokemon.companionUnlocks[PC.SPECIES_ID]||{source:'frontier_rescue',day:s.day};
  }
  O.enqueueSceneInSave(s,choice==='town'?'pokemonCoexist':'pokemonFarewell');
  F.addHistory(s,'pokemon',choice==='town'?'ニャオハが自分の意思で町に残り、仲間になった。':'ニャオハは森へ帰り、町とのつながりを残した。');return true});};
// The rescue is never forced on saves that have already left the opening.
O.makePoint=function(id){const s=originalMakePoint.call(this,id);if(id==='opening-arrival'){s.story.opening.pokemonCare=fresh();}return s};
O.enter=function(...args){const result=originalEnter.apply(this,args);PC.begin();PC.refreshVisual();return result};
if(typeof originalSwitchPoint==='function')O.switchPoint=function(...args){const result=originalSwitchPoint.apply(this,args);PC.refreshVisual();return result};
PC.begin();PC.refreshVisual();
// A single current mission; no disclosure of future objectives.
O.currentMission=function(){const s=F.readSave(),c=careOf(s);if(c&&s.story.opening.phase==='mission1'){
 if(c.status==='recovering')return{name:'ミッション：傷ついたニャオハを手当てしよう',state:'進行中',steps:[['森からニャオハを助け出した',true],[`薬草を持ち帰る（${Number(s.warehouse?.herb)||0}/1）`,PC.canTreat(s)],['テントのそばでニャオハに薬草を使う',false]]};
 if(c.status==='healthy')return{name:'ミッション：ニャオハの気持ちを確かめよう',state:'進行中',steps:[['薬草を使って看病した',true],['ニャオハのところへ行って話しかける',false],['ニャオハ自身の意思を尊重する',false]]};
 }
 return originalMission.call(this);
};
O.guidance=function(){const s=F.readSave(),c=careOf(s);if(c&&s.story.opening.phase==='mission1'){
 if(c.status==='recovering')return PC.canTreat(s)?{title:'ニャオハを手当てしよう',text:'薬草が手に入りました。テントのそばで休むニャオハに近づいて手当てしましょう。',act:'care'}:{title:'ニャオハのために薬草を探そう',text:'弱ったニャオハがテントで待っています。北の道から「はじまりの森」B1Fへ入り、薬草1個を持ち帰りましょう。',act:'adventure'};
 if(c.status==='healthy')return{title:'ニャオハともう一度話そう',text:'けがが治ってきました。テントのそばのニャオハに近づき、これからどこで暮らすか見守りましょう。',act:'bond'};
 }
 return originalGuidance.call(this);
};
// Tutorial pickup is placed only once per dungeon attempt and does not create warehouse items.
O.tutorialSupplies=function(s){const supplied=originalSupplies.call(this,s),c=careOf(s);if(c?.status==='recovering'&&Number(s.warehouse?.herb||0)<1&&!supplied.some(x=>x[0]==='herb'))supplied.push(['herb',1]);return supplied};
// New campaigns can explore for healing; other saved games retain previous behavior.
O.canExplore=function(...args){return originalCanExplore.apply(this,args)};
O.setupStall=function(...args){const c=PC.read();if(c&&['rescued','recovering','healthy'].includes(c.status))throw Error('まずニャオハの手当てと、その後の気持ちを確かめましょう。');return originalSetupStall.apply(this,args)};
// Sprite: use the same PokeAPI sprites family used elsewhere; always draw a local fallback.
let pokeImage=null;
if(typeof Image!=='undefined'){
 try{pokeImage=new Image();pokeImage.decoding='async';pokeImage.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/906.png'}catch{}
}
function fallback(c,x,y,size){c.save();c.translate(x,y);c.scale(size/36,size/36);c.fillStyle='#284f38';c.fillRect(-12,-12,24,19);c.fillRect(-17,-22,9,14);c.fillRect(7,-22,9,14);c.fillStyle='#8ac586';c.fillRect(-10,-10,20,15);c.fillStyle='#f6ead8';c.fillRect(-8,-3,16,8);c.fillStyle='#305040';c.fillRect(-6,-5,3,3);c.fillRect(4,-5,3,3);c.restore()}
PC.drawAt=(ctx,x,y,size=35)=>{if(pokeImage?.complete&&pokeImage.naturalWidth)ctx.drawImage(pokeImage,x-size/2,y-size*.72,size,size);else fallback(ctx,x,y-size*.15,size)};
PC.drawAtEntrance=(ctx,cam,stage)=>{const care=PC.visual();if(!care||stage!==0||!['unseen','found'].includes(care.status))return;PC.drawAt(ctx,PC.RESCUE_POINT.x-cam.x,PC.RESCUE_POINT.y-cam.y,52)};
P.drawPlayer=function(ctx,im,i,p,cam){const result=originalDrawPlayer.call(this,ctx,im,i,p,cam),c=PC.visual();if(!c)return result;
 const atCamp=['recovering','healthy'].includes(c.status);
 if(c.status==='rescued')PC.drawAt(ctx,p.x-cam.x+20,p.y-cam.y+10,32);
 else if(atCamp)PC.drawAt(ctx,PC.CAMP_POINT.x-cam.x,PC.CAMP_POINT.y-cam.y,50);
 else if(c.status==='trusted')PC.drawAt(ctx,p.x-cam.x-31,p.y-cam.y+11,36);
 return result};
PC.interactionPoint=()=>PC.CAMP_POINT;
// Endgame links are opt-in for campaigns that actually completed the rescue.
const previousTavern=O.visitLv5Tavern;
if(typeof previousTavern==='function')O.visitLv5Tavern=function(...args){const result=previousTavern.apply(this,args);const save=F.readSave();if(careOf(save)&&save.story?.opening?.lv5TavernVisited&&O.active()&&!O.isTestPoint())O.enqueueScene('pokemonForestClue');return result};
const previousFinishRun=F.finishRun;
if(typeof previousFinishRun==='function')F.finishRun=function(...args){const result=previousFinishRun.apply(this,args);const save=F.readSave();if(result?.success&&result.reason==='clear'&&save.story?.opening?.forestLordDefeated&&careOf(save)&&O.active()&&!O.isTestPoint())O.enqueueScene('pokemonForestHarmony');PC.refreshVisual();return result};
const previousMissionsHTML=O.missionsHTML;
O.missionsHTML=function(){const content=previousMissionsHTML.call(this),care=PC.read();if(!care)return content;
 const label=({unseen:'まだ出会っていない',found:'森で発見',rescued:'救助中',recovering:'テントで療養中',healthy:'元気になった',trusted:'町で一緒に暮らしている',released:'森へ帰った'})[care.status]||care.status;
 return content+`<section class="storyCurrentMission"><b>🐾 ニャオハとの関係</b><p>現在：${label} ／ 信頼 ${care.trust}/100</p><small>ニャオハの意思を尊重しながら、森と町の両方に居場所を作ろう。</small></section>`};
PC.canInteract=()=>['recovering','healthy'].includes(PC.visual()?.status);
// Events are localized in the arrival cutscene and the camp interaction, not a menu shortcut.
// Updated: 2026-11-03 06:55 JST / Ver1.129
})();

// Updated: 2026-11-03 06:59 JST / Ver1.129: new story-based rescue and coexistence.

// Updated: 2026-11-03 10:14 JST / Ver1.137: enlarge Nyahoja on entrance, camp and trusted-follow states.
