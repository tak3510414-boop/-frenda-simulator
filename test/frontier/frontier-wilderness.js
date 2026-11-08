/* Frenda Frontier Ver1.117 — world interaction points and construction animation. */
(()=>{'use strict';
const F=window.FRENDA_FRONTIER, W=F.WILDERNESS={active:true,width:1536,height:1024,structures:[],position:{x:775,y:315},facing:'down',overview:false,token:0};
const cell=12,cols=128,rows=86;
// Authored terrain zones: grass clearings and trails; water and woodland are closed.
const clearings=[[[.04,.08],[.25,.06],[.28,.20],[.20,.26],[.06,.23]],[[.39,.08],[.57,.08],[.60,.20],[.51,.26],[.40,.22]],[[.68,.08],[.90,.09],[.94,.22],[.74,.26]],[[.04,.36],[.24,.36],[.28,.48],[.17,.55],[.06,.49]],[[.40,.35],[.60,.36],[.61,.55],[.42,.56]],[[.73,.36],[.95,.36],[.96,.53],[.78,.56]],[[.05,.65],[.17,.65],[.19,.75],[.06,.77]],[[.28,.65],[.40,.66],[.42,.76],[.28,.77]],[[.60,.65],[.74,.65],[.77,.77],[.61,.77]]];
const trails=[{p:[[.33,0],[.32,.12],[.31,.22],[.34,.30]],w:40},{p:[[.02,.30],[.18,.28],[.33,.30],[.50,.27],[.65,.30],[.82,.28],[.98,.31]],w:40},{p:[[.65,.08],[.63,.20],[.65,.31],[.65,.48],[.62,.58]],w:36},{p:[[.34,.30],[.33,.44],[.30,.58]],w:40},{p:[[.03,.59],[.20,.59],[.35,.60],[.51,.61],[.68,.59],[.83,.60],[.97,.61]],w:42},{p:[[.50,.27],[.50,.50],[.50,.84]],w:44},{p:[[0,.80],[.21,.79],[.42,.80],[.51,.81],[.72,.80],[1,.80]],w:36}];
trails.push({p:[[.17,.52],[.17,.59]],w:38},{p:[[.82,.52],[.82,.60]],w:38},{p:[[.18,.23],[.18,.29]],w:38},{p:[[.50,.22],[.50,.28]],w:38},{p:[[.80,.22],[.82,.29]],w:38},{p:[[.12,.60],[.12,.80]],w:32},{p:[[.34,.60],[.34,.80]],w:32},{p:[[.68,.60],[.68,.80]],w:32});
const rocks=[[.565,.46,18],[.44,.44,16],[.25,.31,17],[.915,.49,18]];
const inside=(x,y,p)=>{let yes=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const[a,b]=p[i],[c,d]=p[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)yes=!yes}return yes};
const dist=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy)};
W.walkable=(x,y)=>{if(W.structures.some(b=>x>b.x-10&&x<b.x+b.w+10&&y>b.y-8&&y<b.y+b.h))return false;if(F.OPENING?.active()&&F.OPENING.phase()==='complete'&&F.OPENING.currentLevel()>=6&&x>=765&&x<=1104&&y>=254&&y<=290)return true;if(x<18||x>1518||y<8||y>860)return false;if(rocks.some(([a,b,r])=>Math.hypot(x-a*1536,y-b*1024)<r+10))return false;if(clearings.some(p=>inside(x/1536,y/1024,p)))return true;return trails.some(t=>t.p.slice(1).some((b,i)=>dist({x,y},{x:t.p[i][0]*1536,y:t.p[i][1]*1024},{x:b[0]*1536,y:b[1]*1024})<t.w/2))};
let grid=Array.from({length:rows},(_,y)=>Array.from({length:cols},(_,x)=>W.walkable(x*cell+6,y*cell+6)));
W.path=(from,to)=>{const sx=Math.floor(from.x/cell),sy=Math.floor(from.y/cell),tx=Math.floor(to.x/cell),ty=Math.floor(to.y/cell);if(!grid[ty]?.[tx]||!grid[sy]?.[sx])return[];const start=sy*cols+sx,goal=ty*cols+tx,q=[start],prev=new Map([[start,-1]]);for(let i=0;i<q.length;i++){const k=q[i];if(k===goal)break;const x=k%cols,y=Math.floor(k/cols);for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,n=ny*cols+nx;if(nx<0||nx>=cols||!grid[ny]?.[nx]||prev.has(n))continue;prev.set(n,k);q.push(n)}}if(!prev.has(goal))return[];const p=[];for(let k=goal;k!==-1;k=prev.get(k))p.push({x:k%cols*cell+6,y:Math.floor(k/cols)*cell+6});return p.reverse()};
const images={},load=src=>images[src]||(images[src]=new Promise((resolve,reject)=>{const i=new Image;i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('マップ画像を読み込めません。差分ZIPの画像も配置してください。'));i.src=src}));
W.stop=()=>{W.token++;W.route=[]};
// Ver1.117: interactions happen at the physical destination. No guide action buttons.
W.ENTRY={x:510,y:54};
W.CAMP={x:666,y:210};
W.STALL={x:710,y:285};
W.SHOP={x:775,y:285};
W.mount=(host,rerender,actions={})=>{
 W.stop();
 W.structures=F.OPENING?.solids()||[];
 if(F.OPENING?.active())F.OPENING.visibleState=F.readSave();
 grid=Array.from({length:rows},(_,y)=>Array.from({length:cols},(_,x)=>W.walkable(x*cell+6,y*cell+6)));
 const phase=F.OPENING?.active()?F.OPENING.phase():'arrival',count=W.structures.length,token=W.token;
 host.classList.remove('townSceneLayout');
 host.innerHTML=(F.OPENING?.active()?F.OPENING.guide():'')+`<div class="wildernessMiniBar"><b>🌱 ${phase==='complete'?'開拓の町':'森の入口'}</b><span>北へ進むと はじまりの森</span></div><div class="wildernessStage"><canvas id="wildernessCanvas" style="display:block;width:100%;height:auto;touch-action:manipulation;background:#375b32" aria-label="開拓地の地図。道をタップすると歩き、指定の場所へ着くと調査・設営・探索を選べます。"></canvas><div id="wildernessPrompt" class="wildernessPrompt" hidden><b id="wildernessPromptTitle"></b><p id="wildernessPromptText"></p><div id="wildernessPromptActions" class="wildernessPromptActions"></div></div></div><div class="wildernessMiniHelp" id="wildernessMessage">道や目的地をタップすると歩きます。目的地では、その場で行動を選べます。</div><details class="wildernessExtras"><summary>地図・その他の操作</summary><div style="display:flex;gap:7px;padding:8px;flex-wrap:wrap"><button id="wildZoom" class="cmdBtn">${W.overview?'近くを見る':'全体を見る'}</button><button id="wildReset" class="cmdBtn">出発地点へ</button><button id="wildNormal" class="cmdBtn">従来のセーブへ戻る</button></div>${F.OPENING?.active()?F.OPENING.testControls()+F.OPENING.panel():''}</details>`;
 F.OPENING?.bind(rerender,actions);
 F.OPENING.onWorldChanged=rerender;
 const cv=document.getElementById('wildernessCanvas'),msg=document.getElementById('wildernessMessage'),prompt=document.getElementById('wildernessPrompt');
 cv.width=W.overview?1536:720;cv.height=W.overview?1024:820;
 document.getElementById('viewTitle').textContent=phase==='complete'?'はじまりの町':'森の入口';
 document.getElementById('viewSubtitle').textContent='道を歩いて調べ、建設して、冒険へ';
 document.getElementById('viewMeta').textContent='';
 const stats=document.getElementById('headStats');if(stats)stats.innerHTML='<span class="pill">🌱 開拓中</span>';
 document.getElementById('wildZoom').onclick=()=>{W.overview=!W.overview;rerender()};
 document.getElementById('wildReset').onclick=()=>{W.position={x:775,y:315};rerender()};
 document.getElementById('wildNormal').onclick=()=>{try{F.OPENING?.leave();W.active=false;W.stop();rerender()}catch(e){msg.textContent=e.message}};
 let art=null,camera={x:0,y:0},last=0,route=[],goal=null,buildingAt=0,activityLocked=false,promptType=null;
 const dist2=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const siteType=()=>{
  if(!F.OPENING?.active())return null;
  const p=F.OPENING.phase(),s=F.readSave();
  if(p==='arrival')return s.story.opening.entranceInspected?'tent':'inspect';
  if(p==='mission1'&&F.OPENING.stallReady())return 'stall';
  if(['stocking','first_sale'].includes(p))return 'shop';
  if(p==='upgrade')return F.OPENING.ready()?'build':'shop';
  if(p==='building')return 'building';
  if(p==='complete')return 'shop';
  return 'forest';
 };
 const markers=()=>{
  const p=F.OPENING?.phase(),t=siteType(),arr=[];
  if(t==='inspect')arr.push({id:'inspect',pos:W.ENTRY,label:'🔎 森の入口'});
  else if(t==='tent')arr.push({id:'tent',pos:W.CAMP,label:'⛺ テント予定地'});
  else{
   arr.push({id:'forest',pos:W.ENTRY,label:'🌲 はじまりの森'});
   if(['stall','shop','build','building'].includes(t))arr.push({id:t,pos:t==='stall'||t==='shop'?W.STALL:W.SHOP,label:t==='stall'?'🏮 露店予定地':t==='building'?'🏗️ 建設現場':'🏠 お店'});
  }
  return arr;
 };
 const drawMarker=(c,m)=>{
  const x=Math.round(m.pos.x-camera.x),y=Math.round(m.pos.y-camera.y),label=m.label;
  if(x<0||x>cv.width||y<0||y>cv.height)return;
  c.save();c.fillStyle='rgba(13,32,25,.92)';c.strokeStyle='#f2dda6';c.lineWidth=2;c.beginPath();c.arc(x,y,11,0,Math.PI*2);c.fill();c.stroke();c.fillStyle='#ffe7a4';c.fillRect(x-3,y-3,6,6);
  c.font='bold 13px sans-serif';let w=Math.min(cv.width-10,c.measureText(label).width+18),lx=Math.max(5,Math.min(cv.width-w-5,x-w/2));c.fillStyle='rgba(18,31,26,.91)';c.fillRect(lx,y-40,w,24);c.strokeStyle='#d4c48a';c.lineWidth=1;c.strokeRect(lx,y-40,w,24);c.fillStyle='#fff2ce';c.textAlign='center';c.fillText(label,lx+w/2,y-24);c.restore();
 };
 const draw=now=>{
  if(token!==W.token||!cv.isConnected)return;
  const c=cv.getContext('2d');c.imageSmoothingEnabled=false;
  camera=W.overview?{x:0,y:0}:{x:Math.max(0,Math.min(1536-cv.width,W.position.x-cv.width/2)),y:Math.max(0,Math.min(1024-cv.height,W.position.y-cv.height/2))};
  c.clearRect(0,0,cv.width,cv.height);if(!art)return;
  c.drawImage(art[0],0,0,1536,1024,-camera.x,-camera.y,1536,1024);
  F.OPENING?.draw(c,art,camera);
  if(buildingAt>0){
   const elapsed=Math.max(0,(now||performance.now())-buildingAt),t=Math.min(1,elapsed/1250),b=F.OPENING?.tentBox||{x:610,y:105,w:96,h:80},h=b.h*(.12+.88*t);
   c.save();c.globalAlpha=Math.min(1,.26+t*.78);c.drawImage(art[5],b.x-camera.x,b.y+b.h-h-camera.y,b.w,h);c.restore();
  }
  for(const m of markers())if(!activityLocked||m.id!=='tent')drawMarker(c,m);
  const im=art[1+['down','up','left','right'].indexOf(W.facing)],pos=W.position;
  if(im)c.drawImage(im,pos.x-camera.x-19,pos.y-camera.y-48,38,54);
 };
 const hidePrompt=()=>{prompt.hidden=true;promptType=null};
 const buildTent=()=>{
  if(activityLocked||F.OPENING?.phase()!=='arrival'||!F.readSave().story?.opening?.entranceInspected)return;
  activityLocked=true;hidePrompt();host.classList.add('wildernessBusy');msg.textContent='杭を打ち、布を張っています……';
  buildingAt=performance.now();const sequence=()=>{if(token!==W.token)return;const elapsed=performance.now()-buildingAt;draw(performance.now());if(elapsed<1500){requestAnimationFrame(sequence);return}
   try{buildingAt=0;F.OPENING.advance();msg.textContent='テントが完成しました！';rerender()}catch(e){activityLocked=false;host.classList.remove('wildernessBusy');msg.textContent=e.message;draw()}
  };requestAnimationFrame(sequence);
 };
 const showPrompt=kind=>{
  if(activityLocked||!prompt.hidden&&promptType===kind)return;
  hidePrompt();promptType=kind;const title=document.getElementById('wildernessPromptTitle'),body=document.getElementById('wildernessPromptText'),btns=document.getElementById('wildernessPromptActions');
  const defs={
   inspect:['森の入口','古い石に青白い光の跡がある。詳しく調べますか？','入口を調べる'],
   tent:['テント設営予定地','冒険者が帰ってくる目印を、ここに作ろう。','ここにテントを建てる'],
   forest:['はじまりの森','この先は迷宮。装備を整えて森に入りますか？','はじまりの森へ入る'],
   stall:['露店設営予定地','木材が揃っています。ここに露店を設営しますか？','ここに露店を建てる'],
   shop:['お店','棚に商品を並べたり、営業したりできます。','お店を利用する'],
   build:['店舗建設予定地','必要な木材と建築費が揃いました。工事を始めますか？','ここに店舗を建てる'],
   building:['建設現場','工事の進み具合を確認できます。','工事を確認する']
  },d=defs[kind];if(!d)return;
  title.textContent=d[0];body.textContent=d[1];btns.innerHTML='';
  const add=(label,fn,primary)=>{const b=document.createElement('button');b.type='button';b.className='cmdBtn'+(primary?' primary':'');b.textContent=label;b.onclick=()=>{if(!W.active)return;try{fn()}catch(e){msg.textContent=e.message}};btns.appendChild(b)};
  add(d[2],()=>{
   hidePrompt();
   if(kind==='inspect'){F.OPENING.inspectEntrance();rerender();return}
   if(kind==='tent'){buildTent();return}
   if(kind==='forest'){
    if(F.OPENING?.phase()==='tent'){F.OPENING.advance();rerender();return}
    if(!F.OPENING?.canExplore()){msg.textContent='まずはテントを作りましょう。';return}
    actions.startDungeon?.();return;
   }
   if(kind==='stall'){msg.textContent='木材で柱を立て、屋根をかけ、棚を作っています……';activityLocked=true;host.classList.add('wildernessBusy');setTimeout(()=>{if(token!==W.token)return;try{F.OPENING.setupStall();activityLocked=false;host.classList.remove('wildernessBusy');rerender();setTimeout(()=>F.OPENING?.presentPendingScene?.(),180)}catch(e){activityLocked=false;host.classList.remove('wildernessBusy');msg.textContent=e.message}},2200);return}
   if(kind==='shop'){actions.shop?.();return}
   if(kind==='build'){F.OPENING.build();rerender();return}
   if(kind==='building'){
    const g=F.OPENING.guidance();if(g.act==='finish'){F.OPENING.advance();rerender()}else msg.textContent=g.text;
   }
  },true);
  add('やめる',()=>{hidePrompt();msg.textContent='道をタップして別の場所へ行けます。'},false);
  prompt.hidden=false;
 };
 const checkArrival=()=>{
  if(activityLocked||!F.OPENING?.active())return;
  for(const m of markers()){
   if(dist2(W.position,m.pos)<=28){showPrompt(m.id);return}
  }
 };
 cv.onclick=e=>{
  if(!art||activityLocked)return;
  hidePrompt();const b=cv.getBoundingClientRect(),p={x:(e.clientX-b.left)/b.width*cv.width+camera.x,y:(e.clientY-b.top)/b.height*cv.height+camera.y};
  // A marker is a destination; tapping its label or circle walks to its approachable tile.
  const m=markers().find(m=>Math.abs(p.x-m.pos.x)<90&&p.y>=m.pos.y-58&&p.y<=m.pos.y+38);
  const target=m?m.pos:p;
  goal=m?.id||null;route=W.path(W.position,target);
  if(!route.length){msg.textContent='そこへは歩いて行けません。草地や道を選んでください。';return}
  if(m&&dist2(W.position,m.pos)<=28){route=[];showPrompt(m.id);return}
  msg.textContent=m?`${m.label.replace(/^. /,'')}へ歩いています。`:'移動しています。';
 };
 const tick=now=>{
  if(token!==W.token||!cv.isConnected)return;
  const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;
  let budget=140*dt,moved=false;
  while(route.length&&budget>0){const t=route[0],dx=t.x-W.position.x,dy=t.y-W.position.y,d=Math.hypot(dx,dy);if(d<.1){route.shift();continue}
   W.facing=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');const step=Math.min(d,budget);W.position.x+=dx/d*step;W.position.y+=dy/d*step;budget-=step;moved=true;if(step===d)route.shift();
  }
  if(moved&&!route.length){msg.textContent='目的地に到着しました。';checkArrival();goal=null}
  draw(now);requestAnimationFrame(tick)
 };
 const paths=['frontier-wilderness-v145.png','frontier-sprite-player-front-v069.png','frontier-sprite-player-back-v069.png','frontier-sprite-player-left-v069.png','frontier-sprite-player-right-v069.png','frontier-tent-v130.png','frontier-shop-exteriors-v158.png','frontier-stall-v133.png'];
 Promise.all(paths.map(load)).then(a=>{if(token!==W.token)return;art=a;draw();requestAnimationFrame(tick);setTimeout(()=>{if(token===W.token)F.OPENING?.presentPendingScene()},350)}).catch(e=>{if(token===W.token){msg.textContent=e.message;setTimeout(()=>F.OPENING?.presentPendingScene(),350)}});
};

})();
// Updated: 2026-10-25 JST / Ver1.45

// Updated: 2026-10-25 JST / Ver1.46

// Updated: 2026-10-25 JST / Ver1.47

// Updated: 2026-10-25 JST / Ver1.48

// Updated: 2026-10-25 JST / Ver1.51

// Updated: 2026-10-25 13:54 JST / Ver1.57: humble plank-built starter shop exterior.

// Updated: 2026-10-25 14:08 JST / Ver1.58

// Bundle updated: 2026-10-25 18:48 JST / Frontier Ver1.65

// Updated: 2026-11-01 21:10 JST / Ver1.117 — north forest entrance, in-world camp/stall interactions, animated tent placement.
// Bundle updated: 2026-11-03 04:47 JST / Frenda Frontier Ver1.128.

// Updated: 2026-11-05 20:18 JST / Ver1.151: consent-based stall introduction/construction and single-action return summary.
// Updated: 2026-11-08 22:56 JST / Ver1.154 distribution bundle; module version markers are retained.
