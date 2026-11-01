/* Frenda Frontier Ver1.118 / animated prologue on the approved town map. */
(()=>{'use strict';
const F=window.FRENDA_FRONTIER, P=F.TOWN_PROGRESS, O=F.OPENING, W=F.WILDERNESS;
if(!F||!P||!O||!W)return;
const C=F.OPENING_CINEMATIC={active:false,revision:118};
const esc=s=>String(s??'').replace(/[&<>"']/g,k=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[k]));
const north={x:355,y:24},camp={x:500,y:115},stall={x:548,y:139};
C.north=north;C.camp=camp;
C.isOpening=s=>{const o=s?.story?.opening;return !!o&&!Number.isInteger(o.townPreviewStage)&&['arrival','tent','mission1'].includes(o.phase)};
const inheritedMount=W.mount;
W.mount=function(host,rerender,actions={}){return C.isOpening(F.readSave())?C.mount(host,rerender,actions):inheritedMount(host,rerender,actions)};
C.mount=async(host,rerender,actions={})=>{
 P.stop();const token=P.token;const active=()=>token===P.token&&document.getElementById('frontierCinematicCanvas')?.isConnected;
 const s=F.readSave(),o=s.story.opening,auto=(o.phase==='arrival'&&!o.cinematicComplete)||(o.phase==='tent'&&!o.cinematicComplete);
 let stage=o.phase==='arrival'?0:1,scene=P.scene(stage),position=P.position&&scene.walkable(P.position.x,P.position.y)?{...P.position}:P.spawn(stage);
 if(!position)position=P.spawn(stage)||{x:500,y:146};P.position=position;
 let artwork=null,players=null,cam={x:0,y:0},facing=0,route=[],movingResolve=null,lastFrame=0,buildAt=0,building=false,locked=auto,cinematicFinished=false;
 C.active=auto;O.cinematicActive=auto;
 host.classList.remove('townSceneLayout');host.classList.add('progressTownLayout','frontierOpeningStage');document.body.classList.add('progressTownActive');
 const g=O.guidance();
 host.innerHTML=`<div class="openingObjective" id="openingObjective"><span>序章</span><b>次にすること：${esc(g.title)}</b></div><div class="openingCanvasWrap" id="openingCanvasWrap"><canvas id="frontierCinematicCanvas" aria-label="開拓地。オープニングでは主人公が自動で移動します。終了後は道をタップすると移動します。"></canvas><div id="openingSpeech" class="openingSpeech" hidden><small id="openingSpeaker"></small><p id="openingWords"></p></div><button id="openingSkip" class="openingSkip" ${auto?'':'hidden'} type="button">演出をスキップ</button></div><p class="openingLocationHelp" id="openingHint" role="status">${auto?'物語が始まります。主人公が自動で移動します。':'北の道を登ると「はじまりの森」へ入れます。'}</p><div class="openingSecondary"><button id="openingOverview" class="cmdBtn" type="button">${W.overview?'近くを見る':'地図全体'}</button><button id="openingMissions" class="cmdBtn" type="button">現在のミッション</button><details><summary>TEST・その他</summary><button id="openingReplay" class="cmdBtn" type="button">序章から見直す（TEST）</button></details></div>`;
 const cv=document.getElementById('frontierCinematicCanvas'),wrap=document.getElementById('openingCanvasWrap'),speech=document.getElementById('openingSpeech'),speaker=document.getElementById('openingSpeaker'),words=document.getElementById('openingWords'),hint=document.getElementById('openingHint'),skip=document.getElementById('openingSkip');
 const size=()=>{const w=Math.max(280,Math.min(980,wrap.getBoundingClientRect().width||window.innerWidth||390)),h=window.visualViewport?.height||window.innerHeight||780,available=Math.max(220,Math.min(610,h-290)),cssHeight=W.overview?w*.48:Math.min(available,w);cv.width=W.overview?1000:480;cv.height=W.overview?480:Math.max(200,Math.min(480,Math.round(cssHeight*480/w)));cv.style.width='100%';cv.style.height=`${cssHeight}px`;};
 size();window.addEventListener('resize',size);window.visualViewport?.addEventListener?.('resize',size);
 const cleanup=()=>{window.removeEventListener('resize',size);window.visualViewport?.removeEventListener?.('resize',size);};
 const stopIfDead=()=>{if(active())return false;cleanup();C.active=false;O.cinematicActive=false;return true};
 const draw=now=>{
  if(!artwork||!players)return;
  const focus=position;cam={x:W.overview?0:Math.max(0,Math.min(1000-cv.width,focus.x-cv.width/2)),y:W.overview?0:Math.max(0,Math.min(480-cv.height,focus.y-cv.height/2))};
  const c=cv.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,cv.width,cv.height);
  P.drawBackground(c,artwork,stage,cam);
  if(building){const t=Math.min(1,Math.max(0,(now-buildAt)/1750));c.save();c.globalAlpha=t*t*(3-2*t);P.drawBackground(c,artwork,1,cam);c.restore();}
  if(!locked){const p=stage===1?north:null;if(p){const x=p.x-cam.x,y=p.y-cam.y;c.save();c.fillStyle='#fff4c0';c.strokeStyle='#163b2c';c.lineWidth=3;c.beginPath();c.arc(x,y,10,0,Math.PI*2);c.fill();c.stroke();c.font='bold 12px sans-serif';c.textAlign='center';c.fillStyle='#102a1d';c.fillText('▼ 森の入口',x,y-17);c.restore();}}
  F.RESIDENTS?.drawTown?.(c,cam,position,true);P.drawPlayer(c,players[facing],facing,position,cam);F.RESIDENTS?.drawTown?.(c,cam,position,false);
 };
 const tick=now=>{if(stopIfDead())return;const dt=lastFrame?Math.min(.05,Math.max(0,(now-lastFrame)/1000)):0;lastFrame=now;let budget=(locked?190:100)*dt;
  while(route.length&&budget>0){const p=route[0],dx=p.x-position.x,dy=p.y-position.y,d=Math.hypot(dx,dy);if(d<.2){route.shift();continue}facing=Math.abs(dx)>Math.abs(dy)?dx<0?2:3:dy<0?1:0;const n=Math.min(d,budget);position.x+=dx/d*n;position.y+=dy/d*n;budget-=n;if(n>=d)route.shift();}
  P.position=position;
  if(!route.length&&movingResolve){const done=movingResolve;movingResolve=null;done(true);}
  draw(now);requestAnimationFrame(tick);
 };
 const wait=ms=>new Promise(resolve=>setTimeout(()=>resolve(active()),ms));
 const caption=async(who,line,ms=2300)=>{if(!active())return false;speaker.textContent=who;words.textContent=line;speech.hidden=false;return wait(ms)};
 const walk=async(p,label)=>{if(!active())return false;const target=P.nearest(scene,p,40);if(!target)throw Error(`${label}への道が見つかりません。`);route=P.path(scene,position,target);if(!route.length)throw Error(`${label}への通路がつながっていません。`);if(route.length===1){position={...route[0]};route=[];return true}return new Promise(resolve=>movingResolve=resolve)};
 const markSeen=()=>F.mutateSave(s=>{const o=O.ensureSceneState(s.story.opening);for(const id of ['arrival','entranceClue','camp','firstDeparture']){o.sceneSeen[id]=true;o.sceneQueue=o.sceneQueue.filter(x=>x!==id)}o.cinematicComplete=true;o.prologueVersion=Math.max(2,Number(o.prologueVersion)||2)});
 const finish=()=>{if(!active()||cinematicFinished)return;cinematicFinished=true;cleanup();route=[];movingResolve?.(false);movingResolve=null;const phase=O.phase();try{
  if(phase==='arrival'){if(!O.state().entranceInspected)O.inspectEntrance();O.advance();}
  if(O.phase()==='tent')O.advance();markSeen();
  C.active=false;O.cinematicActive=false;locked=false;speech.hidden=true;skip.hidden=true;hint.textContent='テントが完成しました。北の道を進むと「はじまりの森」に入れます。';
  rerender();
 }catch(err){C.active=false;O.cinematicActive=false;locked=false;skip.hidden=true;hint.textContent=`進行を確認してください：${err.message}`;}};
 const play=async()=>{try{
  if(!active())return;
  if(O.phase()==='arrival'){
   await caption('ナレーション','森の入口に、昨日までなかった迷宮が現れた。',2400);
   if(!active())return;
   const approach=walk(north,'森の入口');
   await caption('旅の冒険者','あの森の奥で、青白い光が見えたんだ。',2650);
   if(!await approach||!active())return;
   await caption('開拓者','古い石に、木の根と光の模様……。一体何だろう？',2700);
   if(!active())return;
   if(!O.state().entranceInspected)O.inspectEntrance();
   await caption('旅の冒険者','迷宮から帰ってくる人には、休める場所が必要だ。',2450);
   if(!active())return;
   const returnWalk=walk(camp,'テント予定地');
   await caption('開拓者','ここならテントを張れそう。小さな拠点を作ろう！',2500);
   if(!await returnWalk||!active())return;
   await caption('ナレーション','杭を打ち、ロープを張って、布を広げる。',1500);
   if(!active())return;
   speech.hidden=true;building=true;buildAt=performance.now();hint.textContent='テントを設営中……';
   await wait(1900);if(!active())return;
   building=false;O.advance();stage=1;scene=P.scene(1);artwork=artwork;hint.textContent='テントが完成しました！';
  }
  if(O.phase()==='tent'){
   await caption('旅の冒険者','立派な拠点だ！ これで帰ってくる場所ができた。',2350);
   await caption('開拓者','次は、食料や薬草を置ける小さな店を作りたい。',2450);
   await caption('旅の冒険者','木材を3つ、商品を1つ。森で集めたらロープで戻ろう。',2800);
  }
  finish();
 }catch(err){if(active()){C.active=false;O.cinematicActive=false;locked=false;skip.hidden=true;speech.hidden=true;hint.textContent=`演出を続けられません：${err.message}。地図から手動で進めてください。`;}}};
 const enterForest=()=>{if(!O.canExplore()){hint.textContent='先に拠点を作りましょう。';return}actions.startDungeon?.()};
 const interact=()=>{if(!active()||locked)return;const phase=O.phase();if(phase==='arrival'&&!O.state().entranceInspected&&Math.hypot(position.x-north.x,position.y-north.y)<28){O.inspectEntrance();rerender();return}
  if(phase==='arrival'&&O.state().entranceInspected&&Math.hypot(position.x-camp.x,position.y-camp.y)<32){O.advance();rerender();return}
  if(phase==='tent'&&Math.hypot(position.x-camp.x,position.y-camp.y)<35){O.advance();rerender();return}
  if(phase==='mission1'&&O.stallReady()&&Math.hypot(position.x-stall.x,position.y-stall.y)<40){O.setupStall();rerender();return}
  if(phase==='mission1'&&Math.hypot(position.x-north.x,position.y-north.y)<32)enterForest();};
 cv.onclick=e=>{if(locked)return;const b=cv.getBoundingClientRect(),p={x:(e.clientX-b.left)/b.width*cv.width+cam.x,y:(e.clientY-b.top)/b.height*cv.height};const phase=O.phase();let destination=p;
  if(Math.hypot(p.x-north.x,p.y-north.y)<65)destination=north;
  else if(Math.hypot(p.x-camp.x,p.y-camp.y)<62)destination=camp;
  else if(phase==='mission1'&&O.stallReady()&&Math.hypot(p.x-stall.x,p.y-stall.y)<50)destination=stall;
  const dest=P.nearest(scene,destination,35);if(!dest){hint.textContent='通れる道を選んでください。';return}route=P.path(scene,position,dest);if(!route.length){hint.textContent='その地点へは歩けません。';return}
  if(route.length<=1){route=[];interact();return}
  hint.textContent=destination===north?'北の森へ向かっています。':destination===camp?'テントのそばへ移動します。':'移動中……';
  // User route interaction is invoked at the end of movement by the regular animation loop.
  movingResolve=ok=>{if(ok){hint.textContent='目的地に着きました。';interact();}};
 };
 document.getElementById('openingMissions').onclick=()=>{if(locked)return;actions.missions?.()};
 document.getElementById('openingOverview').onclick=()=>{if(locked)return;W.overview=!W.overview;rerender()};
 document.getElementById('openingReplay').onclick=()=>{try{O.switchPoint('opening-arrival');P.position=null;rerender()}catch(err){hint.textContent=err.message}};
 skip.onclick=()=>{if(!active())return;finish()};
 try{
  [artwork,players]=await Promise.all([P.art(),Promise.all(['front','back','left','right','up-left','up-right','down-left','down-right'].map((d,i)=>P.image('frontier-sprite-player-'+d+(i<4?'-v069.png':'-v152.png'))))]);
  if(!active())return;draw();requestAnimationFrame(tick);if(auto)play();else {O.cinematicActive=false;C.active=false;}
 }catch(err){C.active=false;O.cinematicActive=false;locked=false;skip.hidden=true;hint.textContent=`必要な画像を読み込めません：${err.message}`;}
};
})();
// Updated: 2026-11-01 21:25 JST / Ver1.118
