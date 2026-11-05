/* Frenda Frontier Ver1.147 / face-to-face dialogue and story staging. */
(()=>{'use strict';
const F=window.FRENDA_FRONTIER, P=F.TOWN_PROGRESS, O=F.OPENING, W=F.WILDERNESS;
if(!F||!P||!O||!W)return;
const C=F.OPENING_CINEMATIC={active:false,revision:148};
const esc=s=>String(s??'').replace(/[&<>"']/g,k=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[k]));
const north={x:355,y:24},camp={x:500,y:115},stall={x:548,y:139};
// Visible landmarks have stable world positions, distinct from the existing Pokémon rescue spot.
const traveler={x:366,y:150},meetTraveler={x:367,y:191};
const faceToward=(from,to)=>{const dx=to.x-from.x,dy=to.y-from.y;if(Math.abs(dx)<5&&Math.abs(dy)<5)return 0;if(Math.abs(dx)<5)return dy<0?1:0;if(Math.abs(dy)<5)return dx<0?2:3;return dy<0?(dx<0?4:5):(dx<0?6:7)};
C.landmarks={traveler:{...traveler}};
C.north=north;C.camp=camp;
C.isOpening=s=>{const o=s?.story?.opening;return !!o&&!Number.isInteger(o.townPreviewStage)&&['arrival','tent','mission1'].includes(o.phase)};
const inheritedMount=W.mount;
W.mount=function(host,rerender,actions={}){return C.isOpening(F.readSave())?C.mount(host,rerender,actions):inheritedMount(host,rerender,actions)};
C.mount=async(host,rerender,actions={})=>{
 P.stop();const token=P.token;const active=()=>token===P.token&&document.getElementById('frontierCinematicCanvas')?.isConnected;
 const s=F.readSave(),o=s.story.opening,auto=(o.phase==='arrival'&&!o.cinematicComplete)||(o.phase==='tent'&&!o.cinematicComplete);
 let stage=o.phase==='arrival'?0:1,scene=P.scene(stage),position=P.position&&scene.walkable(P.position.x,P.position.y)?{...P.position}:P.spawn(stage);P.activeStage=stage;
 if(!position)position=P.spawn(stage)||{x:500,y:146};P.position=position;
 let artwork=null,players=null,travelerAtlas=null,travelerSprites=null,cam={x:0,y:0},cameraReady=false,facing=0,route=[],movingResolve=null,lastFrame=0,buildAt=0,building=false,locked=auto,cinematicFinished=false,pendingCaption=null;
 let shot='wide',travelerGreeting=false;
 // Actor positions, routes and directions are independent of dialogue text.
 let travelerPosition=stage===1?{x:468,y:148}:{...traveler};
 let travelerFacing=0,travelerRoute=[];
 const faceEachOther=()=>{facing=faceToward(position,travelerPosition);travelerFacing=faceToward(travelerPosition,position)};
 const bothLookAt=(point)=>{facing=faceToward(position,point);travelerFacing=faceToward(travelerPosition,point)};
 const sendTravelerTo=point=>{const dest=P.nearest(scene,point,40);travelerRoute=dest?P.path(scene,travelerPosition,dest).slice(1):[]};
 C.active=auto;O.cinematicActive=auto;
 host.classList.remove('townSceneLayout');host.classList.add('progressTownLayout','frontierOpeningStage');document.body.classList.add('progressTownActive');
 const g=O.guidance();
 host.innerHTML=`<div class="openingObjective" id="openingObjective"><span>序章</span><b>次にすること：${esc(g.title)}</b></div><div class="openingCanvasWrap" id="openingCanvasWrap"><canvas id="frontierCinematicCanvas" aria-label="開拓地。オープニングではヤマトが自動で移動します。終了後は道をタップすると移動します。"></canvas><div id="openingSpeech" class="openingSpeech" hidden><small id="openingSpeaker"></small><img id="openingPortrait" class="openingPortrait" alt="話している人の顔" hidden><p id="openingWords"></p><button type="button" id="openingContinue" class="openingContinue">▶ つづける</button></div><button id="openingSkip" class="openingSkip" ${auto?'':'hidden'} type="button">演出をスキップ</button></div><div class="openingCareChoices" id="openingCareChoices" hidden aria-label="ニャオハのこれから"><b>ニャオハは、これからどうしたいのだろう？</b><p>無理に引き留めず、気持ちを尊重して選びましょう。</p><div><button type="button" id="pokemonChooseTown">一緒に町で暮らす</button><button type="button" id="pokemonChooseForest">森へ戻るのを見守る</button></div></div><p class="openingLocationHelp" id="openingHint" role="status">${auto?'物語が始まります。ヤマトが自動で移動します。':'北の道を登ると「はじまりの森」へ入れます。'}</p><div class="openingSecondary"><button id="openingOverview" class="cmdBtn" type="button">${P.zoomLabel(W.overview)}</button><button id="openingMissions" class="cmdBtn" type="button">現在のミッション</button><details><summary>TEST・その他</summary><button id="openingReplay" class="cmdBtn" type="button">序章から見直す（TEST）</button></details></div>`;
 const cv=document.getElementById('frontierCinematicCanvas'),wrap=document.getElementById('openingCanvasWrap'),speech=document.getElementById('openingSpeech'),speaker=document.getElementById('openingSpeaker'),words=document.getElementById('openingWords'),portrait=document.getElementById('openingPortrait'),continueBtn=document.getElementById('openingContinue'),hint=document.getElementById('openingHint'),skip=document.getElementById('openingSkip'),careChoices=document.getElementById('openingCareChoices');
 const size=()=>{const w=Math.max(280,Math.min(980,wrap.getBoundingClientRect().width||window.innerWidth||390)),h=window.visualViewport?.height||window.innerHeight||780,available=Math.max(220,Math.min(610,h-290)),cssHeight=W.overview?w*.48:Math.min(available,w);const worldWidth=P.worldWidth(W.overview);cv.width=worldWidth;cv.height=W.overview?480:Math.min(480,Math.max(120,Math.round(cssHeight*worldWidth/w)));cv.style.width='100%';cv.style.height=`${cssHeight}px`;};
 size();window.addEventListener('resize',size);window.visualViewport?.addEventListener?.('resize',size);
 const cleanup=()=>{window.removeEventListener('resize',size);window.visualViewport?.removeEventListener?.('resize',size);};
 const stopIfDead=()=>{if(active())return false;cleanup();C.active=false;O.cinematicActive=false;return true};
 // World-space pixel-art landmark. No new image files or network access required.
 const drawTraveler=(c,now)=>{
  // Remains present in the world whenever the introductory traveler speaks.
  if(stage>1)return;
  const x=travelerPosition.x-cam.x,y=travelerPosition.y-cam.y;
  if(x<-75||x>cv.width+75||y<-70||y>cv.height+70)return;
  c.save();c.imageSmoothingEnabled=false;
  c.fillStyle='rgba(10,29,23,.45)';c.beginPath();c.ellipse(x,y+2,11,4,0,0,Math.PI*2);c.fill();
  // Ver1.147: use the dedicated directional traveler sprites in every camera state.
  // Do not synthesize a back view from a plain brown rectangle.
  const dir=travelerFacing===1?'back':[2,6].includes(travelerFacing)?'left':[3,7].includes(travelerFacing)?'right':'front';
  const art=travelerSprites?.[dir];
  const atlasW=travelerAtlas?.naturalWidth||travelerAtlas?.width||0;
  if(art?.naturalWidth){c.drawImage(art,Math.round(x-15),Math.round(y-36),30,38)}
  else if(atlasW>=320&&travelerFacing===0){
   const sx=atlasW>=768?4*64:64;
   // Match the player world sprite height (P.drawPlayer: 34 world pixels).
   c.drawImage(travelerAtlas,sx,0,64,80,Math.round(x-14),Math.round(y-34),28,34);
  }else{
   // No atlas? Keep a clearly recognizable traveler instead of an invisible NPC.
   // Scale the pixel-art fallback by exactly the same ratio as the atlas.
   // Matching 34px pixel figure: back for looking into the forest,
   // front for conversation, and profile for side-facing directions.
   const back=[1,4,5].includes(travelerFacing),side=[2,3,6,7].includes(travelerFacing);
   c.save();c.translate(Math.round(x),Math.round(y));
   if(side&&[2,6].includes(travelerFacing))c.scale(-1,1);
   c.fillStyle='#3d342b';c.fillRect(-10,-5,8,5);c.fillRect(3,-5,8,5); // boots
   c.fillStyle='#76553b';c.fillRect(-12,-22,24,18); // coat
   c.fillStyle='#406889';c.fillRect(-11,-23,22,12);
   c.fillStyle='#553c2e';c.fillRect(back?-10:-12,-21,back?20:8,19); // backpack
   c.fillStyle='#ddaf89';c.fillRect(side?0:-9,-29,side?8:18,10); // face
   c.fillStyle='#263e54';c.fillRect(-13,-33,26,6);c.fillRect(-9,-37,18,6); // hat
   if(back){c.fillStyle='#573b2d';c.fillRect(-9,-28,18,12);c.fillStyle='#9b754c';c.fillRect(-2,-26,4,10)}
   else if(side){c.fillStyle='#1d2b30';c.fillRect(5,-25,2,2)}
   else{c.fillStyle='#1d2b30';c.fillRect(-5,-25,2,2);c.fillRect(4,-25,2,2)}
   c.restore();
  }
  // An unmistakable name label, not a dialogue that refers to someone off screen.
  const label='旅人',w=54,bx=Math.round(x-w/2),by=Math.round(y-56);
  if(by>=-5){c.fillStyle='rgba(17,42,35,.93)';c.strokeStyle='#efdfa9';c.lineWidth=1;c.fillRect(bx,by,w,17);c.strokeRect(bx,by,w,17);c.fillStyle='#fff3d6';c.textAlign='center';c.font='bold 11px sans-serif';c.fillText(label,x,by+12)}
  if(!travelerGreeting&&locked){c.fillStyle='#ffe58c';c.font='bold 15px sans-serif';c.textAlign='center';c.fillText('!',x,y-41)}
  c.restore();
 };
 const drawObjectiveMarker=(c,point,primary,secondary,now,accent='#f7e6a7')=>{
  if(!point)return;
  const x=point.x-cam.x,y=point.y-cam.y;
  if(x<-130||x>cv.width+130||y<-110||y>cv.height+120)return;
  const pulse=.6+.4*Math.sin(now/220),ring=18+pulse*7;
  c.save();
  c.strokeStyle=`rgba(255,245,184,${.72+.22*pulse})`;
  c.lineWidth=3;c.beginPath();c.arc(x,y,ring,0,Math.PI*2);c.stroke();
  c.fillStyle='rgba(255,244,195,.96)';c.strokeStyle='#173827';c.lineWidth=2;
  c.beginPath();c.moveTo(x,y-ring-24);c.lineTo(x-11,y-ring-4);c.lineTo(x+11,y-ring-4);c.closePath();c.fill();c.stroke();
  c.beginPath();c.arc(x,y,8+Math.sin(now/180)*1.5,0,Math.PI*2);c.fill();c.stroke();
  const boxW=Math.max(124,Math.min(210,Math.max(primary.length*14,secondary?secondary.length*7.8:0)+20));
  const boxH=secondary?38:24,bx=Math.round(x-boxW/2),by=Math.round(y-ring-62);
  c.fillStyle='rgba(18,44,33,.94)';c.strokeStyle=accent;c.lineWidth=2;
  c.fillRect(bx,by,boxW,boxH);c.strokeRect(bx,by,boxW,boxH);
  c.textAlign='center';c.fillStyle='#fff4cf';c.font='bold 12px sans-serif';c.fillText(primary,x,by+15);
  if(secondary){c.fillStyle='#d7f6df';c.font='11px sans-serif';c.fillText(secondary,x,by+30);}
  c.restore();
 };
 const draw=now=>{
  if(!artwork||!players)return;
  // Gentle cinematic focus keeps the speaker, stone and player in the same view.
  const subject=shot==='traveler'?traveler:shot==='pokemon'?F.POKEMON_CARE?.RESCUE_POINT:null;
  const focus=subject?{x:position.x*.50+subject.x*.50,y:position.y*.50+subject.y*.50}:position;
  const toX=W.overview?0:Math.max(0,Math.min(1000-cv.width,focus.x-cv.width/2));
  const toY=W.overview?0:Math.max(0,Math.min(480-cv.height,focus.y-cv.height/2));
  if(!cameraReady){cam={x:toX,y:toY};cameraReady=true}else{cam.x+=(toX-cam.x)*.14;cam.y+=(toY-cam.y)*.14}
  const c=cv.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,cv.width,cv.height);
  P.drawBackground(c,artwork,stage,cam);
  if(building){const t=Math.min(1,Math.max(0,(now-buildAt)/1750));c.save();c.globalAlpha=t*t*(3-2*t);P.drawBackground(c,artwork,1,cam);c.restore();}
  if(!locked){const p=stage===1?north:null;if(p){const x=p.x-cam.x,y=p.y-cam.y;c.save();c.fillStyle='#fff4c0';c.strokeStyle='#163b2c';c.lineWidth=3;c.beginPath();c.arc(x,y,10,0,Math.PI*2);c.fill();c.stroke();c.font='bold 12px sans-serif';c.textAlign='center';c.fillStyle='#102a1d';c.fillText('▼ 森の入口',x,y-17);c.restore();}}
  drawTraveler(c,now);
  const phase=O.phase();
  if(stage===1&&phase==='mission1')drawObjectiveMarker(c,stall,O.stallReady()?'⭐ ここで露店を設営':'⭐ 露店予定地','テントの右どなり',now);
  // The tent already exists in stage 1. Do not cover it with a construction-site marker.
  F.POKEMON_CARE?.drawAtEntrance?.(c,cam,stage);
  F.RESIDENTS?.drawTown?.(c,cam,position,true);P.drawPlayer(c,players[facing],facing,position,cam);F.RESIDENTS?.drawTown?.(c,cam,position,false);
  if(stage===1&&F.POKEMON_CARE?.canInteract?.()&&!locked){
   const p=F.POKEMON_CARE.interactionPoint(),x=p.x-cam.x,y=p.y-cam.y;
   if(x>=-90&&x<cv.width+90&&y>=0&&y<cv.height+50){c.save();c.fillStyle='rgba(20,52,32,.94)';c.strokeStyle='#f9dfac';c.lineWidth=2;c.fillRect(x-95,y-61,190,24);c.strokeRect(x-95,y-61,190,24);c.font='bold 12px sans-serif';c.fillStyle='#fff5ce';c.textAlign='center';c.fillText(F.POKEMON_CARE.canTreatVisual()?'🌿 ニャオハを手当て':F.POKEMON_CARE.visual()?.status==='healthy'?'🐾 ニャオハに話す':'🌿 薬草を探そう',x,y-44);c.restore()}
  }
 };
 const tick=now=>{if(stopIfDead())return;const dt=lastFrame?Math.min(.05,Math.max(0,(now-lastFrame)/1000)):0;lastFrame=now;let budget=(locked?190:100)*dt;
  while(route.length&&budget>0){const p=route[0],dx=p.x-position.x,dy=p.y-position.y,d=Math.hypot(dx,dy);if(d<.2){route.shift();continue}facing=Math.abs(dx)>Math.abs(dy)?dx<0?2:3:dy<0?1:0;const n=Math.min(d,budget);position.x+=dx/d*n;position.y+=dy/d*n;budget-=n;if(n>=d)route.shift();}
  P.position=position;
  let npcBudget=(locked?124:84)*dt;
  while(travelerRoute.length&&npcBudget>0){const q=travelerRoute[0],dx=q.x-travelerPosition.x,dy=q.y-travelerPosition.y,d=Math.hypot(dx,dy);if(d<.3){travelerRoute.shift();continue}travelerFacing=faceToward(travelerPosition,q);const n=Math.min(d,npcBudget);travelerPosition.x+=dx/d*n;travelerPosition.y+=dy/d*n;npcBudget-=n;if(n>=d)travelerRoute.shift()}
  if(!route.length&&movingResolve){const done=movingResolve;movingResolve=null;done(true);}
  draw(now);requestAnimationFrame(tick);
 };
 const wait=ms=>new Promise(resolve=>setTimeout(()=>resolve(active()),ms));
 // Ver1.128: conversation never advances on a timer. The player chooses when
 // to read the next line, while movement and building remain cinematic.
 const caption=(who,line,progress='',focusMode=null,portraitKey=null)=>new Promise(resolve=>{
  if(!active()){resolve(false);return;}
  if(focusMode)shot=focusMode;
  else if((who==='旅人'||who==='旅の冒険者')&&stage===0&&shot!=='pokemon')shot='traveler';
  if((who==='旅人'||who==='旅の冒険者'||who==='ヤマト')&&shot==='traveler'&&travelerGreeting)faceEachOther();
  if(shot==='pokemon'&&F.POKEMON_CARE?.RESCUE_POINT)bothLookAt(F.POKEMON_CARE.RESCUE_POINT);
  speaker.textContent=progress?`${progress}　${who}`:who;
  const faceWho=portraitKey||(/^(ナレーション|おはなし|次の目的|次にすること)$/.test(who)?'none':who);
  const src=F.DIALOGUE_FX?.portraitFor?.(faceWho);speech.classList.toggle('noPortrait',!src);if(src){portrait.src=src;portrait.hidden=false;portrait.alt=faceWho+'の顔'}else portrait.hidden=true;
  // Never compare visible DOM text to the source line. Easy Japanese rewriting can
  // change the displayed characters while text is being typed, causing a deadlock.
  let typingDone=false;
  speech.hidden=false;
  const reveal=F.DIALOGUE_FX?.type?.(words,line,()=>{typingDone=true});
  if(!reveal){words.textContent=line;typingDone=true;}
  continueBtn.textContent='▶ つづける';
  const advance=()=>{if(!pendingCaption||pendingCaption.done)return;if(!typingDone){reveal?.();typingDone=true;return}F.DIALOGUE_FX?.stop?.(words);pendingCaption.done=true;pendingCaption=null;continueBtn.onclick=null;speech.onclick=null;speech.hidden=true;resolve(active())};
  pendingCaption={done:false,advance,resolve};
  continueBtn.onclick=advance;
  speech.onclick=e=>{if(e.target===continueBtn)return;advance()};
 });
 const chapter=async id=>{
  const scene=O.SCENES[id];if(!scene)return true;
  const focusMode=id==='pokemonFound'?'pokemon':id==='pokemonRescue'?'wide':null;
  for(let i=0;i<scene.lines.length;i++){
   const line=scene.lines[i];
   if(!await caption(line.speaker||'ナレーション',line.text,`${scene.chapter||'物語'} ${i+1}/${scene.lines.length}`,focusMode,line.portrait))return false;
  }
  return true;
 };
 const walk=async(p,label)=>{
  if(!active())return false;
  const target=P.nearest(scene,p,40);
  if(!target)throw Error(`${label}への道が見つかりません。`);
  const planned=P.path(scene,position,target);
  if(!planned.length)throw Error(`${label}への通路がつながっていません。`);
  if(planned.length===1){position={...planned[0]};route=[];return true;}
  route=planned;
  return new Promise((resolve,reject)=>{
   let complete=false;
   const timer=setTimeout(()=>{
    if(complete)return;complete=true;route=[];movingResolve=null;
    reject(Error(`${label}への移動が完了しませんでした。序章をやり直してください。`));
   },15000);
   movingResolve=ok=>{if(complete)return;complete=true;clearTimeout(timer);resolve(!!ok);};
  });
 };
 const markSeen=(skipped=false)=>F.mutateSave(s=>{
  const o=O.ensureSceneState(s.story.opening);o.sceneSkipped=o.sceneSkipped||{};
  for(const id of ['arrival','entranceClue','pokemonFound','pokemonRescue','pokemonCamp','pokemonFirstDeparture','camp','firstDeparture']){
   if(skipped)o.sceneSkipped[id]=true;else o.sceneSeen[id]=true;
   o.sceneQueue=o.sceneQueue.filter(x=>x!==id);
  }
  o.cinematicComplete=true;o.prologueVersion=Math.max(2,Number(o.prologueVersion)||2);
 });
 const finish=(skipped=false)=>{
  if(!active()||cinematicFinished)return;
  cinematicFinished=true;cleanup();route=[];
  if(pendingCaption){F.DIALOGUE_FX?.stop?.(words);pendingCaption.done=true;pendingCaption.resolve(false);pendingCaption=null;}
  continueBtn.onclick=null;speech.onclick=null;
  movingResolve?.(false);movingResolve=null;
  try{
   if(O.phase()==='arrival'){if(!O.state().entranceInspected)O.inspectEntrance();if(F.POKEMON_CARE?.enabled()){F.POKEMON_CARE.find();F.POKEMON_CARE.rescue()}O.advance()}
   if(F.POKEMON_CARE?.enabled())F.POKEMON_CARE.placeCamp();
   if(O.phase()==='tent')O.advance();
   markSeen(skipped);
   C.active=false;O.cinematicActive=false;locked=false;speech.hidden=true;skip.hidden=true;
   hint.textContent='テントが完成しました。北の道を進むと「はじまりの森」に入れます。';
   rerender();
  }catch(err){C.active=false;O.cinematicActive=false;locked=false;skip.hidden=true;hint.textContent=`進行を確認してください：${err.message}`;}
 };
 const play=async()=>{try{
  if(!active())return;
  if(O.phase()==='arrival'){
   const opening=O.SCENES.arrival;
   // Do not introduce the traveler before putting them visibly in the frame.
   if(!await caption('ヤマト',opening.lines[0].text,`序章 1/${opening.lines.length}`,'wide'))return;
   if(!await caption('ナレーション',opening.lines[1].text,`序章 2/${opening.lines.length}`,'wide'))return;
   shot='traveler';hint.textContent='道の脇で入口を見張る旅の冒険者がいる。近づいて話を聞こう。';
   if(!await walk(meetTraveler,'旅の冒険者')||!active())return;
   travelerGreeting=true;faceEachOther();
   for(let i=2;i<=4;i++)if(!await caption(opening.lines[i].speaker,opening.lines[i].text,`序章 ${i+1}/${opening.lines.length}`,'traveler'))return;
   shot='wide';
   hint.textContent='北の道の先には森の入口がある。まずは草むらから聞こえた声をたしかめよう。';
   for(let i=5;i<opening.lines.length;i++)if(!await caption(opening.lines[i].speaker,opening.lines[i].text,`序章 ${i+1}/${opening.lines.length}`,'wide'))return;
   if(!O.state().entranceInspected)O.inspectEntrance();
   if(F.POKEMON_CARE?.enabled()){
    F.POKEMON_CARE.find();
    shot='pokemon';
    hint.textContent='草の中で、小さな声が聞こえる。そっと近づこう。';
    const rescuePoint=F.POKEMON_CARE.RESCUE_POINT;
    if(!await walk({x:rescuePoint.x-8,y:rescuePoint.y+38},'草の中のポケモン')||!active())return;
    facing=faceToward(position,rescuePoint);travelerFacing=faceToward(travelerPosition,rescuePoint);
    if(!await chapter('pokemonFound'))return;
    F.POKEMON_CARE.rescue();
    if(!await chapter('pokemonRescue'))return;
   }
   shot='wide';
   sendTravelerTo({x:465,y:148});
   if(!await caption('おはなし','ニャオハをだいて、ふたりは風の弱い草地へ向かった。','テントを立てる'))return;
   if(!await caption('ヤマト','あの子が休めるように、テントを立てよう。','テントを立てる'))return;
   if(!await walk(camp,'テント予定地')||!active())return;
   if(!await caption('ナレーション','地面をならし、木のぼうを立てる。大きなぬのをかけると、テントの形になった。','テント設営'))return;
   speech.hidden=true;building=true;buildAt=performance.now();hint.textContent='テントを設営しています……';
   if(!await wait(2100)||!active())return;
   building=false;O.advance();stage=1;P.activeStage=stage;scene=P.scene(1);travelerRoute=[];travelerPosition=P.nearest(scene,{x:468,y:148},40)||{x:468,y:148};faceEachOther();hint.textContent='テントができた！';
   if(F.POKEMON_CARE?.enabled()){
    F.POKEMON_CARE.placeCamp();
    if(!await chapter('pokemonCamp'))return;
   }
  }
  if(O.phase()==='tent'){
   if(!F.POKEMON_CARE?.enabled()&&!await chapter('camp'))return;
   O.advance();
  }
  if(O.phase()==='mission1'&&auto){
   if(!await chapter(F.POKEMON_CARE?.enabled()?'pokemonFirstDeparture':'firstDeparture'))return;
  }
  finish(false);
 }catch(err){if(active()){C.active=false;O.cinematicActive=false;locked=false;skip.hidden=true;speech.hidden=true;hint.textContent=`演出を続けられません：${err.message}。地図から手動で進めてください。`;}}};
 const enterForest=()=>{if(!O.canExplore()){hint.textContent='先に拠点を作りましょう。';return}actions.startDungeon?.()};
 const interact=()=>{if(!active()||locked)return;const phase=O.phase();
  const care=F.POKEMON_CARE;
  if(phase==='mission1'&&care?.canInteract?.()&&Math.hypot(position.x-care.interactionPoint().x,position.y-care.interactionPoint().y)<48){
   if(care.read()?.status==='recovering'){
    if(!care.canTreat()){hint.textContent='薬草がまだありません。北の道から森へ入り、薬草1個を持ち帰りましょう。';return}
    try{care.treat();hint.textContent='ニャオハに薬草を使いました。少しずつ元気になってきました。';rerender();setTimeout(()=>O.presentPendingScene?.(),100)}catch(err){hint.textContent=err.message}
   }else if(care.read()?.status==='healthy'){
    careChoices.hidden=false;hint.textContent='ニャオハの気持ちを確かめましょう。';
   }
   return;
  }if(phase==='arrival'&&!O.state().entranceInspected&&Math.hypot(position.x-north.x,position.y-north.y)<28){O.inspectEntrance();rerender();return}
  if(phase==='arrival'&&O.state().entranceInspected&&Math.hypot(position.x-camp.x,position.y-camp.y)<32){O.advance();rerender();return}
  if(phase==='tent'&&Math.hypot(position.x-camp.x,position.y-camp.y)<35){O.advance();rerender();return}
  if(phase==='mission1'&&Math.hypot(position.x-stall.x,position.y-stall.y)<44){if(O.stallReady()){O.setupStall();rerender();return}hint.textContent='ここが露店予定地です。テントの右どなりで、木材と売る商品がそろったら設営できます。';return}
  if(phase==='mission1'&&Math.hypot(position.x-north.x,position.y-north.y)<32)enterForest();};
 cv.onclick=e=>{if(locked)return;const b=cv.getBoundingClientRect(),p={x:(e.clientX-b.left)/b.width*cv.width+cam.x,y:(e.clientY-b.top)/b.height*cv.height};const phase=O.phase();let destination=p;
  if(phase==='mission1'&&F.POKEMON_CARE?.canInteract?.()&&Math.hypot(p.x-F.POKEMON_CARE.interactionPoint().x,p.y-F.POKEMON_CARE.interactionPoint().y)<90)destination=F.POKEMON_CARE.interactionPoint();
  else if(Math.hypot(p.x-north.x,p.y-north.y)<65)destination=north;
  else if(Math.hypot(p.x-camp.x,p.y-camp.y)<62)destination=camp;
  else if(phase==='mission1'&&O.stallReady()&&Math.hypot(p.x-stall.x,p.y-stall.y)<50)destination=stall;
  const dest=P.nearest(scene,destination,35);if(!dest){hint.textContent='通れる道を選んでください。';return}route=P.path(scene,position,dest);if(!route.length){hint.textContent='その地点へは歩けません。';return}
  if(route.length<=1){route=[];interact();return}
  hint.textContent=destination===north?'北の森へ向かっています。':F.POKEMON_CARE?.canInteract?.()&&Math.hypot(destination.x-F.POKEMON_CARE.interactionPoint().x,destination.y-F.POKEMON_CARE.interactionPoint().y)<1?'ニャオハのところへ移動しています。':destination===camp?'テントのそばへ移動します。':destination===stall?'露店予定地へ向かっています。':'移動中……';
  // User route interaction is invoked at the end of movement by the regular animation loop.
  movingResolve=ok=>{if(ok){hint.textContent='目的地に着きました。';interact();}};
 };
 const chooseCare=choice=>{try{if(!F.POKEMON_CARE?.bond?.(choice))return;careChoices.hidden=true;hint.textContent=choice==='town'?'ニャオハは自分の意思で町に残りました。':'ニャオハは森へ帰ることを選びました。';rerender();setTimeout(()=>O.presentPendingScene?.(),100)}catch(e){hint.textContent=e.message}};
 document.getElementById('pokemonChooseTown').onclick=()=>chooseCare('town');
 document.getElementById('pokemonChooseForest').onclick=()=>chooseCare('forest');
 document.getElementById('openingMissions').onclick=()=>{if(locked)return;actions.missions?.()};
 document.getElementById('openingOverview').onclick=()=>{if(locked)return;P.nextZoom();rerender()};
 document.getElementById('openingReplay').onclick=()=>{try{O.switchPoint('opening-arrival');P.position=null;rerender()}catch(err){hint.textContent=err.message}};
 skip.onclick=()=>{if(!active())return;finish(true)};
 try{
  [artwork,players,travelerAtlas,travelerSprites]=await Promise.all([P.art(),Promise.all(['front','back','left','right','up-left','up-right','down-left','down-right'].map((d,i)=>P.image('frontier-sprite-player-'+d+(i<4?'-v069.png':'-v152.png')))),P.image('frontier-sprite-npcs-v124.png').catch(()=>null),Promise.all(['front','back','left','right'].map(async d=>[d,await P.image('frontier-traveler-'+d+'-v147.png').catch(()=>null)])).then(Object.fromEntries)]);
  if(!active())return;draw();requestAnimationFrame(tick);if(auto)play();else {O.cinematicActive=false;C.active=false;}
 }catch(err){C.active=false;O.cinematicActive=false;locked=false;skip.hidden=true;hint.textContent=`必要な画像を読み込めません：${err.message}`;}
};
})();
// Updated: 2026-11-01 21:25 JST / Ver1.118

// Updated: 2026-11-03 04:38 JST / Ver1.128: manual-paced dialogue, stage-by-stage opening, save-safe skip.
// Bundle updated: 2026-11-03 04:47 JST / Frenda Frontier Ver1.128.

// Updated: 2026-11-03 06:55 JST / Ver1.129: injured Pokemon rescue, care location and choice.

// Updated: 2026-11-03 06:59 JST / Ver1.129 

// Updated: 2026-11-03 07:32 JST / Ver1.130: same world-camera zoom as the playable town.

// Updated: 2026-11-03 08:47 JST / Ver1.131: traveler, luminous stone, close-up, staged dialogue.
// Updated: 2026-11-03 09:05 JST / Ver1.132: traveler player-scale, forest-road runestone, safe distance to Nyahoja.
// Updated: 2026-11-03 09:28 JST / Ver1.133: clearer premise, road-side traveler staging, stone inspection pose.

// Updated: 2026-11-03 10:14 JST / Ver1.137: stall marker, stall-site guidance text, clearer tap destination feedback.

// Updated: 2026-11-03 10:45 JST / Ver1.138: active stage exposed to independent companion follower.

// Updated: 2026-11-03 18:55 JST / Ver1.143: simpler opening-building captions for third-grade readers.

// Updated: 2026-11-03 19:37 JST / Ver1.144: facing dialogue, pointing to stone, rescue approach, traveler walking to camp.

// Updated: 2026-11-03 20:50 JST / Ver1.145: stone moved from town to separate forest-gateway map.

// Updated: 2026-11-03 JST / Ver1.146: speaking portraits, tick sound, typewriter for cinematic dialogue.

// Updated: 2026-11-03 21:43 JST / Ver1.146: integrated scene art, portrait dialogues, tick sound.

// Updated: 2026-11-04 07:28 JST / Ver1.147: opening portraits, four-direction traveler sprites, guaranteed route completion.

// Updated: 2026-11-04 18:38 JST / Ver1.148: Yamato name, per-line Pokemon portrait, no completed-tent site marker.

// Updated: 2026-11-05 JST / Ver1.149: narration hides portrait unless a line explicitly names a face.

// Updated: 2026-11-05 JST / Ver1.150: per-scene emotional faces and narration handling.

// Updated: 2026-11-05 12:32 JST / Ver1.150 (Nyahoja emotion routing and portrait race fix).
