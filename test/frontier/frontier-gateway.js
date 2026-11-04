/* Frenda Frontier Ver1.145 - Forest gateway, ancient stone and safe expedition packing.
   Independent preparation map. Town and dungeon share the existing warehouse/equipment/run APIs.
   Updated: 2026-11-03 20:50 JST / Ver1.145.
*/
(()=>{'use strict';
const F=window.FRENDA_FRONTIER;if(!F)return;
const G=F.GATEWAY={VERSION:'1.147',LIMIT_TYPES:4,LIMIT_TOTAL:8,LIMIT_EACH:3};
let plan={},selected='beginner_forest',key='';
const esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const count=()=>Object.values(plan).reduce((n,v)=>n+v,0);
const kinds=()=>Object.values(plan).filter(v=>v>0).length;
const sync=()=>{if(key!==F.SAVE_KEY){key=F.SAVE_KEY;plan={};selected=F.DEFAULT_DUNGEON_ID||'beginner_forest';}};
const canCarry=id=>!!F.item?.(id)?.dungeonUse;
G.packable=s=>Object.entries(s.warehouse||{}).filter(([id,n])=>canCarry(id)&&Number(n)>0).map(([id,n])=>({id,qty:Math.floor(Number(n)),item:F.item(id)}));
G.plan=()=>{sync();return {...plan}};
G.setCount=(id,qty)=>{sync();const save=F.readSave(),stock=Math.floor(Number(save.warehouse?.[id])||0);if(!canCarry(id)||stock<=0)throw Error('この道具は持ちこめません。');
 qty=Number(qty);if(!Number.isInteger(qty)||qty<0)throw Error('数をたしかめてください。');
 if(qty>Math.min(G.LIMIT_EACH,stock))throw Error('同じ道具は3個までです。');
 const old=Number(plan[id])||0;
 if(qty>0&&!old&&kinds()>=G.LIMIT_TYPES)throw Error('道具は4種類までです。');
 if(count()-old+qty>G.LIMIT_TOTAL)throw Error('持ちこめるのは全部で8個までです。');
 if(qty)plan[id]=qty;else delete plan[id];return G.plan();};
G.selected=()=>{sync();return selected};
G.select=id=>{sync();const s=F.readSave(),d=F.dungeonDef?.(id);if(!d||!F.dungeonUnlocked?.(s,d)||!F.dungeonPlayable?.(s,d))return false;selected=id;return true};
G.stoneSeen=(s=F.readSave())=>!!s.story?.gateway?.stoneSeen;
G.inspectStone=()=>{F.mutateSave(s=>{s.story=s.story||{};s.story.gateway=s.story.gateway||{};if(!s.story.gateway.stoneSeen){s.story.gateway.stoneSeen=true;F.addHistory?.(s,'story','森の入口で青く光る石と、ふしぎな階段を見つけた。')}});return true;};
G.validate=(s=F.readSave(),dungeonId=selected)=>{
 sync();const d=F.dungeonDef?.(dungeonId);
 if(!d||!F.dungeonPlayable?.(s,d))throw Error('このダンジョンへはまだ行けません。');
 if(F.run?.active)throw Error('今のぼうけんを終えてから出発してください。');
 if(F.OPENING?.active?.()&&!F.OPENING?.canExplore?.())throw Error('まず町でテントを立ててください。');
 if(!G.stoneSeen(s))throw Error('出発する前に、青い石をしらべてね。');
 if(kinds()>G.LIMIT_TYPES||count()>G.LIMIT_TOTAL)throw Error('道具が多すぎます。');
 for(const [id,qty] of Object.entries(plan)){
  if(!canCarry(id)||!Number.isInteger(qty)||qty<1||qty>G.LIMIT_EACH||qty>Number(s.warehouse?.[id]||0))throw Error('倉庫の道具の数が変わりました。もう一度じゅんびしてください。');
 }
 return d;
};
G.depart=(dungeonId=selected)=>{
 const s=F.readSave();G.validate(s,dungeonId);const loadout={...plan};
 // F.startRun is wrapped by the opening story and tutorial scripts. Preserve those hooks.
 const run=F.startRun(dungeonId);
 if(!run?.active)throw Error('出発できませんでした。');
 if(Object.keys(loadout).length){
  // All checks are repeated inside the synchronous warehouse transaction.
  F.mutateSave(v=>{for(const [id,qty] of Object.entries(loadout))if(Number(v.warehouse?.[id]||0)<qty)throw Error('倉庫の数が足りません。');
   for(const [id,qty] of Object.entries(loadout)){v.warehouse[id]-=qty;if(v.warehouse[id]<=0)delete v.warehouse[id]}
   F.addHistory?.(v,'adventure',`出発じゅんび：${Object.entries(loadout).map(([id,n])=>`${F.item(id)?.name||id}×${n}`).join('、')}を持っていった。`);
  });
  run.bag=run.bag||{};for(const [id,qty] of Object.entries(loadout))run.bag[id]=(Number(run.bag[id])||0)+qty;
  run.startingBag={...loadout};
 }
 // frontier-run-persistence wraps startRun and saves it BEFORE our loadout is attached.
 // Save once again after packing, otherwise a reload would lose the carried items.
 F.persistDungeonRun?.();
 plan={};return run;
};
// The approved scenery is an exported art asset. Characters and interactions are
// separate DOM elements so we never mistake a static screenshot for a playable map.
const ART='frontier-gateway-forest-v146.webp';
let art=null;
function sceneDraw(canvas){
 const c=canvas.getContext('2d');if(!c)return;
 const fallback=()=>{c.fillStyle='#244a35';c.fillRect(0,0,canvas.width,canvas.height);c.fillStyle='#d8c58c';c.beginPath();c.moveTo(canvas.width*.43,canvas.height);c.lineTo(canvas.width*.45,0);c.lineTo(canvas.width*.57,0);c.lineTo(canvas.width*.56,canvas.height);c.fill();c.fillStyle='#a9eafa';c.font='bold 56px sans-serif';c.textAlign='center';c.fillText('✧',canvas.width*.54,canvas.height*.4)};
 if(art?.complete&&art.naturalWidth){c.drawImage(art,0,0,canvas.width,canvas.height);return}
 fallback();if(!art){art=new Image();art.onload=()=>{if(canvas.isConnected){c.clearRect(0,0,canvas.width,canvas.height);sceneDraw(canvas)}};art.onerror=()=>{art=null};art.src=ART}
}
let mountSerial=0;
G.mount=(host,actions={})=>{
 sync();++mountSerial;const s=F.readSave(),defs=F.DUNGEON_DEFS||[],ge=F.equipmentStats?.(s)||{items:{}};
 const seen=G.stoneSeen(s),companion=F.POKEMON_CARE?.read?.(s)?.status==='trusted';
 const FX=F.DIALOGUE_FX;
 host.classList.add('gatewaySceneLayout');
 host.innerHTML=`<section class="gatewayScene gatewayPictureScene">
 <div class="gatewayIntro"><b>🌲 森の入口</b><span>町とダンジョンの あいだ</span></div>
 <div class="gatewayObjective">📋 <b>今すること：</b><span>${seen?'行き先と持ち物を えらぼう':'青い石を しらべよう'}</span></div>
 <div class="gatewayVisual" id="gatewayVisual">
  <canvas id="gatewayCanvas" width="903" height="721" aria-label="森の入口。青く光る石と森のかいだんが見える。"></canvas>
  <img id="gatewayHero" class="gatewayExplorer" src="frontier-gateway-player-v146.png" alt="森を見ている主人公">
  ${companion?'<img id="gatewayCompanion" class="gatewayCompanion" src="frontier-gateway-nyahoja-v146.png" alt="主人公と歩くニャオハ">':''}
  <button id="gatewayStoneTarget" type="button" class="gatewayStoneTarget" aria-label="青い石をしらべる"><span>✦</span></button>
  <button id="gatewayStairsTarget" type="button" class="gatewayStairsTarget" aria-label="森のかいだんからダンジョンを選ぶ"><span>▼</span></button>
 </div>
 <div class="gatewayDialogue" id="gatewayDialogue" aria-live="off"><span class="gatewaySpeaker" id="gatewaySpeaker">主人公</span>
  <img id="gatewayPortrait" class="gatewayPortrait" src="frontier-portrait-player-v147.png" alt="話している人の顔">
  <p id="gatewayWords" class="gatewayWords"></p>
  <button id="gatewayNext" type="button" class="gatewayNext" aria-label="メッセージを全部読む">▶</button></div>
 <div class="gatewayVoiceRow"><span>文字がひとつずつ出るよ</span><button id="gatewaySound" type="button">🔊 文字の音 ${FX?.enabled===false?'OFF':'ON'}</button></div>
 <div class="gatewaySceneActions"><button type="button" id="gatewayStone">✨ 石をしらべる</button><button type="button" id="gatewayBack">← 町へもどる</button></div>
 </section><section class="gatewayPreparation"><div class="gatewayHeading"><h3>🧭 行き先をえらぶ</h3><small>今行けるダンジョンをえらぼう</small></div>
 <div class="gatewayDestinations" id="gatewayDestinations">${defs.map(d=>{const open=!!F.dungeonUnlocked?.(s,d),play=!!F.dungeonPlayable?.(s,d),chosen=selected===d.id;return `<button type="button" data-gateway-dungeon="${esc(d.id)}" class="gatewayDestination ${chosen?'on':''}" ${play?'':'disabled'}><b>${esc(d.icon||'🗺️')} ${esc(d.name)}${chosen?' ✓':''}</b><small>${esc(play?`${d.maxFloor||'?'}階まで／入れます`:open?'まだじゅんび中':'まだ行けません')}</small></button>`}).join('')}</div>
 <div class="gatewayHeading"><h3>⚔️ そうび</h3><small>持ち物8個には数えません</small></div><div class="gatewayEquipment">${(F.EQUIPMENT_SLOTS||[]).map(t=>`<span><b>${esc(t.icon)} ${esc(t.label)}</b><small>${esc(ge.items?.[t.id]?.name||'なし')}</small></span>`).join('')}</div><button class="gatewaySecondary" id="gatewayEquipment">そうびをかえる</button>
 <div class="gatewayHeading"><h3>🎒 持っていく道具</h3><small>${kinds()}/${G.LIMIT_TYPES}種類・${count()}/${G.LIMIT_TOTAL}個</small></div>
 <p class="gatewayLimits">4種類まで／ぜんぶで8個まで／同じ道具は3個まで。ぼうけん中のかばんは10種類まで。ロープは別に1回ぶんあるよ。</p>
 <div class="gatewayItems" id="gatewayItems">${G.packable(s).length?G.packable(s).map(({id,qty,item})=>`<div class="gatewayItem"><div class="gatewayItemTitle"><b>${esc(item.icon||'🎒')} ${esc(item.name)}</b><small>そうこに${qty}個</small></div><div class="gatewayCounter"><button type="button" data-pack-down="${esc(id)}" aria-label="${esc(item.name)}を1つへらす" ${plan[id]?'':'disabled'}>−</button><span>${Number(plan[id])||0}</span><button type="button" data-pack-up="${esc(id)}" aria-label="${esc(item.name)}を1つふやす" ${Number(plan[id]||0)>=Math.min(qty,G.LIMIT_EACH)?'disabled':''}>＋</button></div></div>`).join(''):'<p>そうこに道具はありません。持ち物なしでも出発できるよ。</p>'}</div>
 <div class="gatewayFooter"><div class="gatewayBagPreview"><b>出発する時の道具</b><span>${Object.entries(plan).length?Object.entries(plan).map(([id,qty])=>esc(`${F.item(id)?.name||id} ×${qty}`)).join(' ・ '):'まだえらんでいません'}</span></div><button class="gatewayDepart" type="button" id="gatewayDepart">🌲 ${esc(F.dungeonDef?.(selected)?.name||'森')}へ出発</button><button type="button" class="gatewaySecondary" id="gatewayBackBottom">町にもどる</button></div></section>`;
 const $=q=>host.querySelector(q),canvas=$('#gatewayCanvas');if(canvas)sceneDraw(canvas);
 let reveal=null,completed=true;
 const say=(who,text)=>{
  const words=$('#gatewayWords'),whoNode=$('#gatewaySpeaker'),portrait=$('#gatewayPortrait');if(!words)return;
  whoNode.textContent=who;portrait.src=FX?.portraitFor?.(who)||'frontier-portrait-player-v147.png';portrait.alt=`${who}の顔`;
  words.textContent='';completed=false;
  const finished=()=>{completed=true};
  reveal=FX?.type?FX.type(words,text,finished):(()=>{words.textContent=text;completed=true});
  if(!FX?.type){reveal()}
 };
 const goPreparation=()=>{$('#gatewayDestinations')?.scrollIntoView?.({block:'start',behavior:'smooth'});say('主人公','どこへ行こう？ 出かける前に、道具も見ておこう。')};
 const showStone=()=>{
  const player=$('#gatewayHero'),cat=$('#gatewayCompanion');
  if(player){player.classList.add('nearStone');cat?.classList.add('nearStone')}
  G.inspectStone();
  const objective=$('.gatewayObjective span');if(objective)objective.textContent='行き先と持ち物を えらぼう';
  say('主人公','石に、木の根みたいな もようがあるね。森のかいだんと、何かつながっているのかな。');
  $('#gatewayStairsTarget')?.classList.add('highlight');
 };
 $('#gatewayStone').onclick=showStone;$('#gatewayStoneTarget').onclick=showStone;
 $('#gatewayStairsTarget').onclick=goPreparation;
 $('#gatewayBack').onclick=()=>actions.back?.();$('#gatewayBackBottom').onclick=()=>actions.back?.();
 $('#gatewayEquipment').onclick=()=>actions.equipment?.();
 $('#gatewayNext').onclick=()=>{if(!completed)reveal?.();else goPreparation()};
 $('#gatewaySound').onclick=()=>{if(FX){FX.setEnabled(!FX.enabled);$('#gatewaySound').textContent=`${FX.enabled?'🔊':'🔇'} 文字の音 ${FX.enabled?'ON':'OFF'}`}};
 $('#gatewayVisual').addEventListener('click',e=>{
  if(e.target.closest('button'))return;
  const rect=$('#gatewayCanvas').getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width,y=(e.clientY-rect.top)/rect.height;
  if(x>.45&&x<.71&&y>.27&&y<.58)showStone();else if(x>.38&&x<.70&&y<.25)goPreparation();
 });
 $('#gatewayDestinations').querySelectorAll('[data-gateway-dungeon]').forEach(b=>b.onclick=()=>{if(G.select(b.dataset.gatewayDungeon))G.mount(host,actions)});
 const change=(id,delta)=>{try{G.setCount(id,(Number(plan[id])||0)+delta);G.mount(host,actions)}catch(e){actions.message?.(e.message)}};
 host.querySelectorAll('[data-pack-up]').forEach(b=>b.onclick=()=>change(b.dataset.packUp,1));
 host.querySelectorAll('[data-pack-down]').forEach(b=>b.onclick=()=>change(b.dataset.packDown,-1));
 $('#gatewayDepart').onclick=()=>{try{G.depart(selected);actions.depart?.()}catch(e){actions.message?.(e.message)}};
 // Only the real companion appears. Before rescue, Nyahoja is still in the story.
 if(companion)say('ニャオハ',seen?'行く前に、持ち物を見ておこう！':'あの石、青くひかっているね。しらべてみよう！');
 else say('主人公',seen?'また森へ行くんだ。先にじゅんびをしておこう。':'あの青い石、なんだろう。近くで見てみよう。');
};
})();

// Updated: 2026-11-03 21:43 JST / Ver1.146: integrated scene art, portrait dialogues, tick sound.

// Updated: 2026-11-04 07:28 JST / Ver1.147: portrait reference alignment.
