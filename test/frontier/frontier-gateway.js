/* Frenda Frontier Ver1.145 - Forest gateway, ancient stone and safe expedition packing.
   Independent preparation map. Town and dungeon share the existing warehouse/equipment/run APIs.
   Updated: 2026-11-03 20:50 JST / Ver1.145.
*/
(()=>{'use strict';
const F=window.FRENDA_FRONTIER;if(!F)return;
const G=F.GATEWAY={VERSION:'1.145',LIMIT_TYPES:4,LIMIT_TOTAL:8,LIMIT_EACH:3};
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
function sceneDraw(canvas){
 const c=canvas.getContext('2d');if(!c)return;
 const W=640,H=320;c.clearRect(0,0,W,H);c.imageSmoothingEnabled=false;
 c.fillStyle='#355c46';c.fillRect(0,0,W,H);
 // A distinct narrow mountain pass connects the southern town to the woodland stairs.
 c.fillStyle='#66815c';c.fillRect(0,0,W,218);c.fillStyle='#3f614f';c.fillRect(0,218,W,102);
 for(let y=0;y<H;y+=16){for(let x=0;x<W;x+=16){const a=((x*7+y*13+x*y)%101);if(a<31){c.fillStyle=a%3===0?'#5b8159':'#42694e';c.fillRect(x+3,y+4,5,7)}}}
 c.fillStyle='#b4a47b';c.beginPath();c.moveTo(249,320);c.lineTo(285,240);c.lineTo(358,174);c.lineTo(428,122);c.lineTo(488,54);c.lineTo(565,0);c.lineTo(600,0);c.lineTo(528,73);c.lineTo(468,142);c.lineTo(402,198);c.lineTo(339,264);c.lineTo(307,320);c.closePath();c.fill();
 c.fillStyle='#d2c29a';c.beginPath();c.moveTo(275,320);c.lineTo(301,247);c.lineTo(382,184);c.lineTo(450,133);c.lineTo(514,54);c.lineTo(581,0);c.lineTo(584,0);c.lineTo(517,70);c.lineTo(458,143);c.lineTo(391,195);c.lineTo(329,259);c.lineTo(292,320);c.fill();
 // Keep the central footpath clear; place foliage at the edges.
 const trees=[[35,80],[85,40],[127,108],[52,235],[159,234],[216,45],[549,181],[583,236],[602,94],[164,309],[51,315],[597,311],[15,156]];
 trees.forEach(([x,y],i)=>{c.fillStyle='#1c4435';c.fillRect(x-8,y-4,19,31);c.fillStyle='#244d3b';c.fillRect(x-20,y-20,40,32);c.fillStyle=i%3?'#326b46':'#418053';c.fillRect(x-16,y-27,30,21);c.fillStyle='#5b9364';c.fillRect(x-10,y-29,12,9)});
 // The special stone is close to the stairs, not beside the town NPC.
 c.fillStyle='#384a4d';c.fillRect(384,94,46,76);c.fillStyle='#53656a';c.fillRect(388,86,32,69);c.fillStyle='#77878b';c.fillRect(394,80,17,60);
 c.strokeStyle='#a3f4ff';c.lineWidth=5;c.beginPath();c.moveTo(401,97);c.lineTo(408,117);c.lineTo(400,138);c.moveTo(408,117);c.lineTo(418,105);c.moveTo(408,117);c.lineTo(419,131);c.stroke();
 c.fillStyle='#eafffd';c.font='bold 17px sans-serif';c.fillText('✦',411,70);
 // Stairs descending into the dungeon.
 c.fillStyle='#26312c';c.fillRect(489,12,91,57);c.fillStyle='#59665e';c.fillRect(495,18,77,48);
 for(let i=0;i<5;i++){c.fillStyle=i%2?'#a5a695':'#7a8174';c.fillRect(498,21+i*8,70-i*2,5)}
 c.fillStyle='#f8e7b1';c.font='bold 15px sans-serif';c.textAlign='center';c.fillText('森のかいだん',530,87);
 c.fillStyle='#fff0be';c.font='bold 14px sans-serif';c.fillText('青く光る石',402,186);
 // Small player on arrival, facing the stairs.
 c.fillStyle='#2c3d46';c.fillRect(280,263,22,25);c.fillStyle='#c18b61';c.fillRect(284,255,14,14);
 c.fillStyle='#ca3a27';c.fillRect(279,247,22,12);c.fillStyle='#ffffff';c.fillRect(286,255,10,4);
 c.fillStyle='#323d72';c.fillRect(282,285,8,11);c.fillRect(294,285,8,11);
 c.textAlign='center';c.font='bold 13px sans-serif';c.fillStyle='#fff9de';c.fillText('町からの道',284,314);
}
G.mount=(host,actions={})=>{
 sync();const s=F.readSave();const defs=F.DUNGEON_DEFS||[],ge=F.equipmentStats?.(s)||{items:{}};
 host.classList.add('gatewaySceneLayout');
 host.innerHTML=`<section class="gatewayScene"><div class="gatewayIntro"><b>🌲 森の入口</b><span>町とダンジョンのあいだ</span></div><canvas id="gatewayCanvas" width="640" height="320" aria-label="森の入口。青く光る石と、ダンジョンへおりるかいだんがある。"></canvas><div class="gatewaySceneActions"><button type="button" id="gatewayStone">✨ 光る石をしらべる</button><button type="button" id="gatewayBack">← 町へもどる</button></div><p class="gatewayHint">ここで行き先と持ち物を決めてから出発しよう。石の近くに、森へつづくかいだんがある。</p></section><section class="gatewayPreparation"><div class="gatewayHeading"><h3>🧭 行き先をえらぶ</h3><small>いま行けるダンジョンをえらぼう</small></div><div class="gatewayDestinations" id="gatewayDestinations">${defs.map(d=>{const open=!!F.dungeonUnlocked?.(s,d),play=!!F.dungeonPlayable?.(s,d),chosen=selected===d.id;return `<button type="button" data-gateway-dungeon="${esc(d.id)}" class="gatewayDestination ${chosen?'on':''}" ${play?'':'disabled'}><b>${esc(d.icon||'🗺️')} ${esc(d.name)}${chosen?' ✓':''}</b><small>${esc(play?`${d.maxFloor||'?'}階まで／入れます`:open?'まだじゅんび中':'まだ行けません')}</small></button>`}).join('')}</div><div class="gatewayHeading"><h3>⚔️ そうび</h3><small>そうびは持ち物の8個には入りません</small></div><div class="gatewayEquipment">${(F.EQUIPMENT_SLOTS||[]).map(t=>`<span><b>${esc(t.icon)} ${esc(t.label)}</b><small>${esc(ge.items?.[t.id]?.name||'なし')}</small></span>`).join('')}</div><button class="gatewaySecondary" id="gatewayEquipment">そうびをかえる</button><div class="gatewayHeading"><h3>🎒 持っていく道具</h3><small>${kinds()}/${G.LIMIT_TYPES}種類・${count()}/${G.LIMIT_TOTAL}個</small></div><p class="gatewayLimits">4種類まで／ぜんぶで8個まで／同じ道具は3個まで。ぼうけん中のかばんは10種類まで。ひろう物のために空きをのこそう。ロープは1回ぶん、べつにあります。</p><div class="gatewayItems" id="gatewayItems">${G.packable(s).length?G.packable(s).map(({id,qty,item})=>`<div class="gatewayItem"><div class="gatewayItemTitle"><b>${esc(item.icon||'🎒')} ${esc(item.name)}</b><small>そうこに${qty}個</small></div><div class="gatewayCounter"><button type="button" data-pack-down="${esc(id)}" aria-label="${esc(item.name)}を1つへらす" ${plan[id]?'':'disabled'}>−</button><span>${Number(plan[id])||0}</span><button type="button" data-pack-up="${esc(id)}" aria-label="${esc(item.name)}を1つふやす" ${Number(plan[id]||0)>=Math.min(qty,G.LIMIT_EACH)?'disabled':''}>＋</button></div></div>`).join(''):'<p>そうこに、持っていける道具はありません。道具がなくても出発できます。</p>'}</div><div class="gatewayFooter"><div class="gatewayBagPreview"><b>出発する時の道具</b><span>${Object.entries(plan).length?Object.entries(plan).map(([id,qty])=>esc(`${F.item(id)?.name||id} ×${qty}`)).join(' ・ '):'まだえらんでいません'}</span></div><button class="gatewayDepart" type="button" id="gatewayDepart">🌲 ${esc(F.dungeonDef?.(selected)?.name||'森')}へ出発</button><button type="button" class="gatewaySecondary" id="gatewayBackBottom">町にもどる</button></div></section>`;
 const canvas=host.querySelector('#gatewayCanvas');if(canvas){sceneDraw(canvas);canvas.onclick=e=>{const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*640/r.width,y=(e.clientY-r.top)*320/r.height;if(x>368&&x<452&&y>72&&y<195)showStone();else if(x>485&&y<100){host.querySelector('#gatewayDestinations')?.scrollIntoView?.({block:'nearest'});} };}
 const showStone=()=>{const p=host.querySelector('.gatewayHint');if(p)p.innerHTML='<b>✨ ふしぎな石</b>　森の奥へつづく道のそばで、青い光がまたたいている。石には木の根のようなもようがある。石のすぐ先には、地下へおりるかいだんが見える。';G.inspectStone();};
 host.querySelector('#gatewayStone').onclick=showStone;
 if(!G.stoneSeen(s)){const hint=host.querySelector('.gatewayHint');if(hint)hint.textContent='初めて来た森の入口。青く光る石をタップして、何があるかたしかめよう。';}
 host.querySelector('#gatewayBack').onclick=()=>actions.back?.();host.querySelector('#gatewayBackBottom').onclick=()=>actions.back?.();
 host.querySelector('#gatewayEquipment').onclick=()=>actions.equipment?.();
 host.querySelectorAll('[data-gateway-dungeon]').forEach(b=>b.onclick=()=>{if(G.select(b.dataset.gatewayDungeon))G.mount(host,actions);});
 const change=(id,delta)=>{try{G.setCount(id,(Number(plan[id])||0)+delta);G.mount(host,actions)}catch(e){actions.message?.(e.message)}};
 host.querySelectorAll('[data-pack-up]').forEach(b=>b.onclick=()=>change(b.dataset.packUp,1));
 host.querySelectorAll('[data-pack-down]').forEach(b=>b.onclick=()=>change(b.dataset.packDown,-1));
 host.querySelector('#gatewayDepart').onclick=()=>{try{G.depart(selected);actions.depart?.();}catch(e){actions.message?.(e.message)}};
};
})();
