/* Frenda Frontier Ver1.132 / consistent character proportions and properly located forest runestone. */
(()=>{'use strict';
const F=window.FRENDA_FRONTIER, P=F.TOWN_PROGRESS, O=F.OPENING, W=F.WILDERNESS;
if(!F||!P||!O||!W)return;
const C=F.OPENING_CINEMATIC={active:false,revision:132};
const esc=s=>String(s??'').replace(/[&<>"']/g,k=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[k]));
const north={x:355,y:24},camp={x:500,y:115},stall={x:548,y:139};
// Visible landmarks have stable world positions, distinct from the existing Pokémon rescue spot.
const traveler={x:427,y:173},meetTraveler={x:447,y:148},stone={x:310,y:92},inspectStone={x:347,y:96};
C.landmarks={traveler:{...traveler},stone:{...stone}};
C.north=north;C.camp=camp;
C.isOpening=s=>{const o=s?.story?.opening;return !!o&&!Number.isInteger(o.townPreviewStage)&&['arrival','tent','mission1'].includes(o.phase)};
const inheritedMount=W.mount;
W.mount=function(host,rerender,actions={}){return C.isOpening(F.readSave())?C.mount(host,rerender,actions):inheritedMount(host,rerender,actions)};
C.mount=async(host,rerender,actions={})=>{
 P.stop();const token=P.token;const active=()=>token===P.token&&document.getElementById('frontierCinematicCanvas')?.isConnected;
 const s=F.readSave(),o=s.story.opening,auto=(o.phase==='arrival'&&!o.cinematicComplete)||(o.phase==='tent'&&!o.cinematicComplete);
 let stage=o.phase==='arrival'?0:1,scene=P.scene(stage),position=P.position&&scene.walkable(P.position.x,P.position.y)?{...P.position}:P.spawn(stage);
 if(!position)position=P.spawn(stage)||{x:500,y:146};P.position=position;
 let artwork=null,players=null,travelerAtlas=null,cam={x:0,y:0},cameraReady=false,facing=0,route=[],movingResolve=null,lastFrame=0,buildAt=0,building=false,locked=auto,cinematicFinished=false,pendingCaption=null;
 let shot='wide',stoneRevealed=!!o.entranceInspected,travelerGreeting=false;
 C.active=auto;O.cinematicActive=auto;
 host.classList.remove('townSceneLayout');host.classList.add('progressTownLayout','frontierOpeningStage');document.body.classList.add('progressTownActive');
 const g=O.guidance();
 host.innerHTML=`<div class="openingObjective" id="openingObjective"><span>序章</span><b>次にすること：${esc(g.title)}</b></div><div class="openingCanvasWrap" id="openingCanvasWrap"><canvas id="frontierCinematicCanvas" aria-label="開拓地。オープニングでは主人公が自動で移動します。終了後は道をタップすると移動します。"></canvas><div id="openingSpeech" class="openingSpeech" hidden><small id="openingSpeaker"></small><p id="openingWords"></p><button type="button" id="openingContinue" class="openingContinue">▶ つづける</button></div><button id="openingSkip" class="openingSkip" ${auto?'':'hidden'} type="button">演出をスキップ</button></div><div class="openingCareChoices" id="openingCareChoices" hidden aria-label="ニャオハのこれから"><b>ニャオハは、これからどうしたいのだろう？</b><p>無理に引き留めず、気持ちを尊重して選びましょう。</p><div><button type="button" id="pokemonChooseTown">一緒に町で暮らす</button><button type="button" id="pokemonChooseForest">森へ戻るのを見守る</button></div></div><p class="openingLocationHelp" id="openingHint" role="status">${auto?'物語が始まります。主人公が自動で移動します。':'北の道を登ると「はじまりの森」へ入れます。'}</p><div class="openingSecondary"><button id="openingOverview" class="cmdBtn" type="button">${P.zoomLabel(W.overview)}</button><button id="openingMissions" class="cmdBtn" type="button">現在のミッション</button><details><summary>TEST・その他</summary><button id="openingReplay" class="cmdBtn" type="button">序章から見直す（TEST）</button></details></div>`;
 const cv=document.getElementById('frontierCinematicCanvas'),wrap=document.getElementById('openingCanvasWrap'),speech=document.getElementById('openingSpeech'),speaker=document.getElementById('openingSpeaker'),words=document.getElementById('openingWords'),continueBtn=document.getElementById('openingContinue'),hint=document.getElementById('openingHint'),skip=document.getElementById('openingSkip'),careChoices=document.getElementById('openingCareChoices');
 const size=()=>{const w=Math.max(280,Math.min(980,wrap.getBoundingClientRect().width||window.innerWidth||390)),h=window.visualViewport?.height||window.innerHeight||780,available=Math.max(220,Math.min(610,h-290)),cssHeight=W.overview?w*.48:Math.min(available,w);const worldWidth=P.worldWidth(W.overview);cv.width=worldWidth;cv.height=W.overview?480:Math.min(480,Math.max(120,Math.round(cssHeight*worldWidth/w)));cv.style.width='100%';cv.style.height=`${cssHeight}px`;};
 size();window.addEventListener('resize',size);window.visualViewport?.addEventListener?.('resize',size);
 const cleanup=()=>{window.removeEventListener('resize',size);window.visualViewport?.removeEventListener?.('resize',size);};
 const stopIfDead=()=>{if(active())return false;cleanup();C.active=false;O.cinematicActive=false;return true};
 // World-space pixel-art landmark. No new image files or network access required.
 const drawStone=(c,x,y,now,scale=1,glow=false)=>{
  c.save();c.translate(x,y);c.scale(scale,scale);
  const pulse=.55+.45*Math.sin(now/300);
  // A small bare-earth patch anchors the stone in the grass beside the trail.
  c.fillStyle='rgba(141,125,79,.52)';c.beginPath();c.ellipse(0,6,29,13,0,0,Math.PI*2);c.fill();
  c.fillStyle='rgba(18,26,29,.50)';c.beginPath();c.ellipse(0,6,26,8,0,0,Math.PI*2);c.fill();
  if(glow){const h=c.createRadialGradient(0,-17,4,0,-17,43);h.addColorStop(0,`rgba(157,251,255,${.37+.18*pulse})`);h.addColorStop(1,'rgba(84,208,255,0)');c.fillStyle=h;c.fillRect(-46,-64,92,85)}
  // Broken monolith, with cracks, roots and a cyan inlaid rune.
  c.fillStyle='#253a40';c.beginPath();c.moveTo(-23,6);c.lineTo(-19,-20);c.lineTo(-11,-44);c.lineTo(12,-47);c.lineTo(24,-31);c.lineTo(21,2);c.lineTo(10,8);c.closePath();c.fill();
  c.fillStyle='#65767a';c.beginPath();c.moveTo(-17,-22);c.lineTo(-9,-40);c.lineTo(5,-41);c.lineTo(3,-2);c.lineTo(-16,3);c.closePath();c.fill();
  c.fillStyle='#a6a8a0';c.fillRect(-12,-38,14,3);c.fillStyle='#384c50';c.fillRect(11,-29,8,26);
  c.strokeStyle='#243c42';c.lineWidth=2;c.beginPath();c.moveTo(0,-39);c.lineTo(-4,-25);c.lineTo(0,-13);c.lineTo(-8,-7);c.stroke();
  c.lineCap='round';c.lineJoin='round';c.strokeStyle=glow?`rgba(134,247,255,${.75+.25*pulse})`:'#8ed2d5';c.lineWidth=2.7;
  c.beginPath();c.moveTo(-3,-30);c.lineTo(2,-23);c.lineTo(0,-10);c.moveTo(2,-23);c.lineTo(9,-30);c.moveTo(0,-10);c.lineTo(-8,-18);c.moveTo(0,-10);c.lineTo(9,-13);c.stroke();
  c.fillStyle='#bafaff';c.fillRect(-3,-33,4,4);c.fillRect(-11,-19,4,4);c.fillRect(7,-15,4,4);
  c.restore();
 };
 C.drawRunestone=(c,cam={x:0,y:0},now=performance.now())=>drawStone(c,stone.x-cam.x,stone.y-cam.y,now,.67,true);
 const drawTraveler=(c,now)=>{
  // Remains present in the world whenever the introductory traveler speaks.
  if(stage>1)return;
  const x=traveler.x-cam.x,y=traveler.y-cam.y;
  if(x<-75||x>cv.width+75||y<-70||y>cv.height+70)return;
  c.save();c.imageSmoothingEnabled=false;
  c.fillStyle='rgba(10,29,23,.45)';c.beginPath();c.ellipse(x,y+2,11,4,0,0,Math.PI*2);c.fill();
  const atlasW=travelerAtlas?.naturalWidth||travelerAtlas?.width||0;
  if(atlasW>=320){
   const sx=atlasW>=768?4*64:64;
   // Match the player world sprite height (P.drawPlayer: 34 world pixels).
   c.drawImage(travelerAtlas,sx,0,64,80,Math.round(x-14),Math.round(y-34),28,34);
  }else{
   // No atlas? Keep a clearly recognizable traveler instead of an invisible NPC.
   // Scale the pixel-art fallback by exactly the same ratio as the atlas.
   c.save();c.translate(Math.round(x),Math.round(y));c.scale(34/55,34/55);
   const X=0,Y=0;
   c.fillStyle='#543e2d';c.fillRect(X-19,Y-22,6,25);c.fillRect(X+14,Y-22,6,25); // pack straps
   c.fillStyle='#76553b';c.fillRect(X-12,Y-24,24,25);
   c.fillStyle='#406889';c.fillRect(X-13,Y-26,26,13);
   c.fillStyle='#d8ae87';c.fillRect(X-9,Y-40,18,16);
   c.fillStyle='#273c50';c.fillRect(X-14,Y-46,28,9);c.fillRect(X-8,Y-52,16,10);
   c.fillStyle='#1b2931';c.fillRect(X-5,Y-33,3,3);c.fillRect(X+4,Y-33,3,3);
   c.fillStyle='#403c35';c.fillRect(X-10,Y+1,8,5);c.fillRect(X+3,Y+1,8,5);
   c.fillStyle='#e6c69c';c.fillRect(X+12,Y-25,5,11);c.restore();
  }
  // An unmistakable name label, not a dialogue that refers to someone off screen.
  const label='旅の冒険者',w=87,bx=Math.round(x-w/2),by=Math.round(y-55);
  if(by>=-5){c.fillStyle='rgba(17,42,35,.93)';c.strokeStyle='#efdfa9';c.lineWidth=1;c.fillRect(bx,by,w,17);c.strokeRect(bx,by,w,17);c.fillStyle='#fff3d6';c.textAlign='center';c.font='bold 11px sans-serif';c.fillText(label,x,by+12)}
  if(!travelerGreeting&&locked){c.fillStyle='#ffe58c';c.font='bold 15px sans-serif';c.textAlign='center';c.fillText('!',x+14,y-37)}
  c.restore();
 };
 const drawStoneDetail=(c,now)=>{
  if(stage!==0||shot!=='stone')return;
  const w=Math.min(151,cv.width*.46),h=139,x=10,y=10;
  c.save();c.fillStyle='rgba(18,32,34,.96)';c.fillRect(x,y,w,h);c.strokeStyle='#a8eced';c.lineWidth=2;c.strokeRect(x+1,y+1,w-2,h-2);
  drawStone(c,x+w/2,y+95,now,1.25,true);
  c.fillStyle='#e8fbfa';c.textAlign='center';c.font='bold 12px sans-serif';c.fillText('古い石',x+w/2,y+16);
  c.font='bold 10px sans-serif';c.fillStyle='#b0f1f0';c.fillText('木の根のような模様',x+w/2,y+119);c.fillText('青白くまたたく光',x+w/2,y+133);
  c.restore();
 };
 const draw=now=>{
  if(!artwork||!players)return;
  // Gentle cinematic focus keeps the speaker, stone and player in the same view.
  const subject=shot==='traveler'?traveler:shot==='stone'?stone:shot==='pokemon'?F.POKEMON_CARE?.RESCUE_POINT:null;
  const focus=subject?{x:position.x*.50+subject.x*.50,y:position.y*.50+subject.y*.50}:position;
  const toX=W.overview?0:Math.max(0,Math.min(1000-cv.width,focus.x-cv.width/2));
  const toY=W.overview?0:Math.max(0,Math.min(480-cv.height,focus.y-cv.height/2));
  if(!cameraReady){cam={x:toX,y:toY};cameraReady=true}else{cam.x+=(toX-cam.x)*.14;cam.y+=(toY-cam.y)*.14}
  const c=cv.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,cv.width,cv.height);
  P.drawBackground(c,artwork,stage,cam);
  if(building){const t=Math.min(1,Math.max(0,(now-buildAt)/1750));c.save();c.globalAlpha=t*t*(3-2*t);P.drawBackground(c,artwork,1,cam);c.restore();}
  if(!locked){const p=stage===1?north:null;if(p){const x=p.x-cam.x,y=p.y-cam.y;c.save();c.fillStyle='#fff4c0';c.strokeStyle='#163b2c';c.lineWidth=3;c.beginPath();c.arc(x,y,10,0,Math.PI*2);c.fill();c.stroke();c.font='bold 12px sans-serif';c.textAlign='center';c.fillStyle='#102a1d';c.fillText('▼ 森の入口',x,y-17);c.restore();}}
  if(stage===1&&stoneRevealed)C.drawRunestone(c,cam,now);
  if(stage===0){drawStone(c,stone.x-cam.x,stone.y-cam.y,now,.67,stoneRevealed);if(stoneRevealed&&shot!=='stone'){const sx=stone.x-cam.x,sy=stone.y-cam.y;c.save();c.fillStyle='#d9ffff';c.font='bold 12px sans-serif';c.textAlign='center';c.shadowColor='#003948';c.shadowBlur=4;c.fillText('✦ 模様のある石',sx,sy-43);c.restore()}}
  drawTraveler(c,now);
  F.POKEMON_CARE?.drawAtEntrance?.(c,cam,stage);
  F.RESIDENTS?.drawTown?.(c,cam,position,true);P.drawPlayer(c,players[facing],facing,position,cam);F.RESIDENTS?.drawTown?.(c,cam,position,false);
  drawStoneDetail(c,now);
  if(stage===1&&F.POKEMON_CARE?.canInteract?.()&&!locked){
   const p=F.POKEMON_CARE.interactionPoint(),x=p.x-cam.x,y=p.y-cam.y;
   if(x>=-90&&x<cv.width+90&&y>=0&&y<cv.height+50){c.save();c.fillStyle='rgba(20,52,32,.94)';c.strokeStyle='#f9dfac';c.lineWidth=2;c.fillRect(x-95,y-61,190,24);c.strokeRect(x-95,y-61,190,24);c.font='bold 12px sans-serif';c.fillStyle='#fff5ce';c.textAlign='center';c.fillText(F.POKEMON_CARE.canTreatVisual()?'🌿 ニャオハを手当て':F.POKEMON_CARE.visual()?.status==='healthy'?'🐾 ニャオハに話す':'🌿 薬草を探そう',x,y-44);c.restore()}
  }
 };
 const tick=now=>{if(stopIfDead())return;const dt=lastFrame?Math.min(.05,Math.max(0,(now-lastFrame)/1000)):0;lastFrame=now;let budget=(locked?190:100)*dt;
  while(route.length&&budget>0){const p=route[0],dx=p.x-position.x,dy=p.y-position.y,d=Math.hypot(dx,dy);if(d<.2){route.shift();continue}facing=Math.abs(dx)>Math.abs(dy)?dx<0?2:3:dy<0?1:0;const n=Math.min(d,budget);position.x+=dx/d*n;position.y+=dy/d*n;budget-=n;if(n>=d)route.shift();}
  P.position=position;
  if(!route.length&&movingResolve){const done=movingResolve;movingResolve=null;done(true);}
  draw(now);requestAnimationFrame(tick);
 };
 const wait=ms=>new Promise(resolve=>setTimeout(()=>resolve(active()),ms));
 // Ver1.128: conversation never advances on a timer. The player chooses when
 // to read the next line, while movement and building remain cinematic.
 const caption=(who,line,progress='',focusMode=null)=>new Promise(resolve=>{
  if(!active()){resolve(false);return;}
  if(focusMode)shot=focusMode;else if(who==='旅の冒険者'&&stage===0&&shot!=='stone'&&shot!=='pokemon')shot='traveler';
  speaker.textContent=progress?`${progress}　${who}`:who;
  words.textContent=line;speech.hidden=false;
  continueBtn.textContent='▶ つづける';
  const advance=()=>{if(!pendingCaption||pendingCaption.done)return;pendingCaption.done=true;pendingCaption=null;continueBtn.onclick=null;speech.onclick=null;speech.hidden=true;resolve(active())};
  pendingCaption={done:false,advance,resolve};
  continueBtn.onclick=advance;
  speech.onclick=e=>{if(e.target===continueBtn)return;advance()};
 });
 const chapter=async id=>{
  const scene=O.SCENES[id];if(!scene)return true;
  const focusMode=id==='entranceClue'?'stone':id==='pokemonFound'||id==='pokemonRescue'?'pokemon':null;
  if(focusMode==='stone')stoneRevealed=true;
  for(let i=0;i<scene.lines.length;i++){
   const line=scene.lines[i];
   if(!await caption(line.speaker||'ナレーション',line.text,`${scene.chapter||'物語'} ${i+1}/${scene.lines.length}`,focusMode))return false;
  }
  return true;
 };
 const walk=async(p,label)=>{if(!active())return false;const target=P.nearest(scene,p,40);if(!target)throw Error(`${label}への道が見つかりません。`);route=P.path(scene,position,target);if(!route.length)throw Error(`${label}への通路がつながっていません。`);if(route.length===1){position={...route[0]};route=[];return true}return new Promise(resolve=>movingResolve=resolve)};
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
  if(pendingCaption){pendingCaption.done=true;pendingCaption.resolve(false);pendingCaption=null;}
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
   if(!await caption('ナレーション',opening.lines[0].text,`序章 1/${opening.lines.length}`,'wide'))return;
   if(!await caption('ナレーション',opening.lines[1].text,`序章 2/${opening.lines.length}`,'wide'))return;
   shot='traveler';hint.textContent='道の先に旅の冒険者がいる。近づいて話を聞こう。';
   if(!await walk(meetTraveler,'旅の冒険者')||!active())return;
   travelerGreeting=true;
   for(let i=2;i<=4;i++)if(!await caption(opening.lines[i].speaker,opening.lines[i].text,`序章 ${i+1}/${opening.lines.length}`,'traveler'))return;
   shot='stone';stoneRevealed=true;
   hint.textContent='北の道の先に、模様のある古い石が見える。';
   if(!await walk(inspectStone,'古い石')||!active())return;
   for(let i=5;i<opening.lines.length;i++)if(!await caption(opening.lines[i].speaker,opening.lines[i].text,`序章 ${i+1}/${opening.lines.length}`,'stone'))return;
   if(!O.state().entranceInspected)O.inspectEntrance();
   if(!await chapter('entranceClue'))return;
   if(F.POKEMON_CARE?.enabled()){
    F.POKEMON_CARE.find();
    if(!await chapter('pokemonFound'))return;
    F.POKEMON_CARE.rescue();
    if(!await chapter('pokemonRescue'))return;
   }
   shot='wide';
   const returnWalk=walk(camp,'テント予定地');
   if(!await caption('ナレーション','ふたりは森の入口に背を向け、風をしのげる草地へ戻った。','テント設営'))return;
   if(!await caption('開拓者','まずは小さくてもいい。ここを、無事に帰ってきた人の目印にしよう。','テント設営'))return;
   if(!await returnWalk||!active())return;
   if(!await caption('ナレーション','地面を確かめ、杭を打ち、ロープを張る。布が風を受けて少しずつ形を作っていく。','テント設営'))return;
   speech.hidden=true;building=true;buildAt=performance.now();hint.textContent='テントを設営しています……';
   if(!await wait(2100)||!active())return;
   building=false;O.advance();stage=1;scene=P.scene(1);hint.textContent='テントが完成しました！';
   if(F.POKEMON_CARE?.enabled()){
    F.POKEMON_CARE.placeCamp();
    if(!await chapter('pokemonCamp'))return;
   }
  }
  if(O.phase()==='tent'){
   if(!await chapter('camp'))return;
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
  if(phase==='mission1'&&O.stallReady()&&Math.hypot(position.x-stall.x,position.y-stall.y)<40){O.setupStall();rerender();return}
  if(phase==='mission1'&&Math.hypot(position.x-north.x,position.y-north.y)<32)enterForest();};
 cv.onclick=e=>{if(locked)return;const b=cv.getBoundingClientRect(),p={x:(e.clientX-b.left)/b.width*cv.width+cam.x,y:(e.clientY-b.top)/b.height*cv.height};const phase=O.phase();let destination=p;
  if(phase==='mission1'&&F.POKEMON_CARE?.canInteract?.()&&Math.hypot(p.x-F.POKEMON_CARE.interactionPoint().x,p.y-F.POKEMON_CARE.interactionPoint().y)<90)destination=F.POKEMON_CARE.interactionPoint();
  else if(Math.hypot(p.x-north.x,p.y-north.y)<65)destination=north;
  else if(Math.hypot(p.x-camp.x,p.y-camp.y)<62)destination=camp;
  else if(phase==='mission1'&&O.stallReady()&&Math.hypot(p.x-stall.x,p.y-stall.y)<50)destination=stall;
  const dest=P.nearest(scene,destination,35);if(!dest){hint.textContent='通れる道を選んでください。';return}route=P.path(scene,position,dest);if(!route.length){hint.textContent='その地点へは歩けません。';return}
  if(route.length<=1){route=[];interact();return}
  hint.textContent=destination===north?'北の森へ向かっています。':F.POKEMON_CARE?.canInteract?.()&&Math.hypot(destination.x-F.POKEMON_CARE.interactionPoint().x,destination.y-F.POKEMON_CARE.interactionPoint().y)<1?'ニャオハのところへ移動しています。':destination===camp?'テントのそばへ移動します。':'移動中……';
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
  [artwork,players,travelerAtlas]=await Promise.all([P.art(),Promise.all(['front','back','left','right','up-left','up-right','down-left','down-right'].map((d,i)=>P.image('frontier-sprite-player-'+d+(i<4?'-v069.png':'-v152.png')))),P.image('frontier-sprite-npcs-v124.png').catch(()=>null)]);
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
