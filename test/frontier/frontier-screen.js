/* Frenda Frontier Ver1.155 / viewport, pagination, walking and dungeon arrival. */
(()=>{'use strict';
const F=window.FRENDA_FRONTIER,P=F.TOWN_PROGRESS;
const S=F.SCREEN={VERSION:'1.155',entering:false};
const $=id=>document.getElementById(id),states=new WeakMap();
let pending=false,lastViewport='',entrySerial=0;
const visible=el=>!!el&&el.isConnected&&!el.hidden&&!el.closest('.hidden')&&getComputedStyle(el).display!=='none';
const navNode=(label)=>{const n=document.createElement('nav');n.className='screenPager';n.dataset.screenOwned='1';n.setAttribute('aria-label',label);n.innerHTML='<button type="button" aria-label="前のページ">◀ 前へ</button><span></span><button type="button" aria-label="次のページ">次へ ▶</button>';return n};
const splitText=el=>{
 if(el.childElementCount||!['P','LI','PRE'].includes(el.tagName)||el.textContent.length<160||el.dataset.screenSplit)return;
 const text=el.textContent;el.textContent='';el.dataset.screenSplit='1';
 for(let at=0;at<text.length;at+=100){const row=document.createElement('span');row.style.display='block';row.textContent=text.slice(at,at+100);el.append(row)}
};
// Hide original nodes instead of rebuilding their HTML: selection/input handlers stay attached.
S.paginate=(root,{reserve=0,force=false,label='表示ページ'}={})=>{
 if(!visible(root)||root.clientHeight<40)return;
 let st=states.get(root);
 if(st&&!st.dirty&&!force)return;
 if(!st){st={page:root.id==='gatewayItems'?(F.GATEWAY.itemPage||0):0,nav:navNode(label),dirty:true};states.set(root,st);
  st.nav.children[0].onclick=()=>{st.page=Math.max(0,st.page-1);st.show?.()};
  st.nav.children[2].onclick=()=>{st.page=Math.min(st.pages.length-1,st.page+1);st.show?.()};
 }
 const nav=st.nav;if(!nav.isConnected){if(root.id==='retroBagItems')root.append(nav);else root.after(nav);}
 root.querySelectorAll('.screenPagedOut,.screenEmptyGroup').forEach(el=>el.classList.remove('screenPagedOut','screenEmptyGroup'));
 const units=[],groups=[];let title=null;
 const walk=(parent)=>{for(const el of [...parent.children]){
  if(el.dataset.screenOwned||el.hidden||getComputedStyle(el).display==='none')continue;
  if(el===root.firstElementChild&&el.tagName==='H2'){title=el;continue;}
  if(el.matches('.retroBagLayout')){units.push(el);continue;}
  splitText(el);
  const structural=el.matches('ul,ol,table,thead,tbody,#frendaUnifiedList,.choiceGrid,.partnerGrid,.returnLootGrid,.returnLootSection,.layerTestList,.storyChapterList,.storyChapter,.dungeonHistoryList,.storyCurrentMission,.storyArchive,.storyArchiveList,.gatewayDestinations,.gatewayItems,.gearCheckGrid,.worldMapPrinciples')||el.dataset.screenSplit||(el.scrollHeight>root.clientHeight&&el.children.length>1&&!el.matches('button,.choiceCard,.partnerCard'));
  if(structural&&el.children.length){groups.push(el);walk(el)}else units.push(el);
 }};walk(root);
 if(!units.length){nav.hidden=true;st.pages=[[]];st.dirty=false;return;}
 const emptyGroups=()=>{for(let i=groups.length-1;i>=0;i--){const group=groups[i];group.classList.toggle('screenEmptyGroup',![...group.children].some(el=>!el.classList.contains('screenPagedOut')&&!el.classList.contains('screenEmptyGroup')&&!el.hidden));}};
 const room=()=>Math.max(30,root.clientHeight);
 // Reserve the pager in the parent's flex layout before measuring actual content.
 nav.hidden=false;nav.style.display='flex';
 for(const u of units)u.classList.add('screenPagedOut');emptyGroups();
 const pages=[];let page=[];
 for(const u of units){
  u.classList.remove('screenPagedOut');emptyGroups();
  if(page.length&&root.scrollHeight>room()+2){
   u.classList.add('screenPagedOut');pages.push(page);for(const x of page)x.classList.add('screenPagedOut');
   page=[];u.classList.remove('screenPagedOut');emptyGroups();
  }
  page.push(u);
 }
 if(page.length)pages.push(page);
 st.units=units;st.groups=groups;st.pages=pages;st.page=Math.min(st.page,pages.length-1);st.dirty=false;
 function show(){
  if(!st.units)return;if(root.id==='gatewayItems')F.GATEWAY.itemPage=st.page;
  const current=new Set(st.pages[st.page]||[]);for(const u of st.units)u.classList.toggle('screenPagedOut',!current.has(u));
  emptyGroups();root.scrollTop=0;
  nav.children[0].disabled=st.page===0;nav.children[2].disabled=st.page>=st.pages.length-1;
  nav.children[1].textContent=`${st.page+1} / ${Math.max(1,st.pages.length)}`;
  nav.hidden=st.pages.length<=1;nav.style.setProperty('display',st.pages.length<=1?'none':'flex','important');
 }
 st.show=show;show();
};
S.reset=root=>{const old=states.get(root);old?.nav.remove();states.delete(root);};
S.dirty=root=>{const st=states.get(root);if(st)st.dirty=true;};
S.request=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;S.sync()})};
S.sync=()=>{
 const h=Math.round(window.visualViewport?.height||window.innerHeight||640),w=Math.round(window.visualViewport?.width||window.innerWidth||390),key=w+'x'+h;
 document.documentElement.style.setProperty('--frontier-vh',h+'px');
 if(lastViewport!==key){lastViewport=key;document.querySelectorAll('#frontierModalBody,.gatewayItems,.gatewayDestinations,.stallStock,.retroBagItems,.modalActions,.screenUserBody').forEach(S.dirty);F.refreshViewport?.();}
 const town=$('progressCanvas');if(town)P.fitCanvas(town.parentElement,town,F.WILDERNESS?.overview||false);
 if($('frontierCinematicCanvas'))F.OPENING_CINEMATIC?.resize?.();
 const pad=document.querySelector('.townWalkPad'),padCanvas=P.walkPadRuntime?.cv;
 if(pad&&padCanvas?.isConnected){const a=pad.parentElement.getBoundingClientRect(),b=padCanvas.getBoundingClientRect();pad.style.bottom=Math.max(6,a.bottom-b.bottom+6)+'px';}
 document.querySelectorAll('.progressGuide[open]>section').forEach(el=>S.paginate(el,{label:'目的のページ'}));
 const userPanel=document.querySelector('.frendaUserPanel');
 if(visible(userPanel)){
  let userBody=userPanel.querySelector('.screenUserBody');if(!userBody){userBody=document.createElement('div');userBody.className='screenUserBody';for(const child of [...userPanel.children])if(!child.classList.contains('frendaUserHead'))userBody.append(child);userPanel.append(userBody);}
  S.paginate(userBody,{label:'ユーザー管理のページ'});
 }
 const m=$('frontierModal');if(visible(m)&&!m.classList.contains('storyModal')){
  const body=$('frontierModalBody'),actions=$('frontierModalActions');
  if(body&&!body.querySelector('.retroBagLayout'))for(const el of body.querySelectorAll('*')){
   if(el.matches('input,textarea,select')||el.clientHeight<1)continue;
   const style=getComputedStyle(el);if(['auto','scroll'].includes(style.overflowY)&&el.scrollHeight>el.clientHeight+2){el.style.setProperty('max-height','none','important');el.style.setProperty('height','auto','important');el.style.setProperty('overflow','visible','important');S.dirty(body);}
  }
  if(actions?.children.length>4)S.paginate(actions,{label:'操作のページ'});
  if(body?.querySelector('.retroBagLayout')){const bag=$('retroBagItems');if(bag)S.paginate(bag,{reserve:37,label:'持ち物のページ'});}
  else if(body)S.paginate(body,{label:'メニューのページ'});
 }
 document.querySelectorAll('.gatewayPage:not(.hidden) .gatewayDestinations,.gatewayPage:not(.hidden) .gatewayItems,.stallStock').forEach(el=>S.paginate(el,{label:'一覧のページ'}));
};
// A complete arrival beat before exploration; opening messages never cover the first view.
S.enterDungeon=(run,ready)=>{
 const token=++entrySerial;S.entering=true;
 document.querySelector('.dungeonEntry')?.remove();
 const n=document.createElement('section');n.className='dungeonEntry';n.setAttribute('role','status');n.setAttribute('aria-label','ダンジョンへ入っています');
 const arch=document.createElement('div');arch.className='entryArch';arch.innerHTML='<div class="entryStairs"></div>';
 const sub=document.createElement('small');sub.textContent='森の階段を おりていく';
 const title=document.createElement('h2');title.textContent=run?.dungeonName||F.dungeonDef?.(run?.dungeonId)?.name||'ダンジョン';
 const floor=document.createElement('p');floor.textContent=`地下 ${Math.max(1,Number(run?.floor)||1)} 階`;
 n.append(arch,sub,title,floor);document.body.append(n);ready?.();
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 setTimeout(()=>{if(token!==entrySerial){n.remove();return;}sub.textContent='ここから ぼうけんが はじまる';n.classList.add('leaving');
  setTimeout(()=>{if(token===entrySerial)S.entering=false;n.remove();S.request()},reduced?0:350);
 },reduced?120:1250);
};
// Navigation selects the closest REACHABLE tile, not a road on the other side of a wall.
const gridFor=scene=>{const step=8,cols=125,rows=60,ok=new Uint8Array(cols*rows);for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if(scene.walkable(x*8+4,y*8+4))ok[y*cols+x]=1;return{step,cols,rows,ok}};
const grids=new Map();
const getGrid=scene=>{if(!grids.has(scene.stage))grids.set(scene.stage,gridFor(scene));return grids.get(scene.stage)};
const segmentClear=(scene,a,b)=>{const distance=Math.hypot(b.x-a.x,b.y-a.y),steps=Math.max(1,Math.ceil(distance/2));for(let i=0;i<=steps;i++)if(!scene.walkable(a.x+(b.x-a.x)*i/steps,a.y+(b.y-a.y)*i/steps))return false;return true;};
P.path=(scene,from,to)=>{
 if(!scene||!from||!to)return[];
 const g=getGrid(scene),{cols,rows,ok}=g;
 const startPoint=P.nearest(scene,from,64);if(!startPoint)return[];
 const start=Math.floor(startPoint.y/8)*cols+Math.floor(startPoint.x/8),q=[start],prev=new Int32Array(cols*rows).fill(-2);prev[start]=-1;
 let best=start,bestDistance=Infinity;
 for(let at=0;at<q.length;at++){
  const k=q[at],x=k%cols,y=Math.floor(k/cols),distance=Math.hypot(x*8+4-to.x,y*8+4-to.y);
  if(distance<bestDistance){best=k;bestDistance=distance;}
  for(const [dx,dy] of [[0,-1],[-1,0],[1,0],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]]){
   const nx=x+dx,ny=y+dy,n=ny*cols+nx;
   if(nx<0||nx>=cols||ny<0||ny>=rows||!ok[n]||prev[n]!==-2||dx&&dy&&(!ok[y*cols+nx]||!ok[ny*cols+x]))continue;
   prev[n]=k;q.push(n);
  }
 }
 if(bestDistance>72)return[];
 const points=[];for(let k=best;k!==-1;k=prev[k])points.push({x:k%cols*8+4,y:Math.floor(k/cols)*8+4});points.reverse();
 if(scene.walkable(from.x,from.y)&&segmentClear(scene,from,points[0]))points.unshift({...from});
 const smooth=[];for(let i=0;i<points.length;){smooth.push(points[i]);let j=points.length-1;while(j>i+1&&!segmentClear(scene,points[i],points[j]))j--;i=j>i?j:points.length;}
 return smooth;
};
P.walkStep=(scene,from,dx,dy,distance)=>{
 let p={...from};const length=Math.hypot(dx,dy);if(!length)return p;dx/=length;dy/=length;
 const n=Math.max(1,Math.ceil(distance/2)),d=distance/n;
 for(let i=0;i<n;i++){
  const x=p.x+dx*d,y=p.y+dy*d;
  if(scene.walkable(x,y)&&segmentClear(scene,p,{x,y}))p={x,y};
  else if(dx&&scene.walkable(x,p.y))p.x=x;
  else if(dy&&scene.walkable(p.x,y))p.y=y;
 }
 return p;
};
const originalStop=P.stop;P.stop=()=>{P.manualInput=null;P.userGoal=null;originalStop()};
const originalDraw=P.drawPlayer;
P.drawPlayer=function(ctx,im,i,p,cam={x:0,y:0}){
 const result=originalDraw.call(this,ctx,im,i,p,cam),goal=P.userGoal;
 if(goal){if(Math.hypot(goal.x-p.x,goal.y-p.y)<10)P.userGoal=null;else{ctx.save();ctx.strokeStyle='#ffe29b';ctx.fillStyle='#22452ecc';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(goal.x-cam.x,goal.y-cam.y,6,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();}}
 return result;
};
P.fitCanvas=(host,cv,overview)=>{
 const width=Math.max(1,cv.clientWidth||host.clientWidth||390),height=Math.max(60,cv.clientHeight||host.clientHeight-92);
 const worldWidth=overview?Math.max(1000,480*width/height):P.worldWidth(false),worldHeight=Math.round(height*worldWidth/width);
 if(cv.width!==Math.round(worldWidth))cv.width=Math.round(worldWidth);if(cv.height!==worldHeight)cv.height=worldHeight;
 return{cssHeight:height,width:cv.width,height:cv.height};
};
P.installWalkPad=(host,cv,canMove,onStop)=>{
 host.querySelector('.townWalkPad')?.remove();const pad=document.createElement('nav');pad.className='townWalkPad';pad.setAttribute('aria-label','街の移動キー');
 let pressSerial=0;
 const dirs={up:[0,-1],left:[-1,0],right:[1,0],down:[0,1]},labels={up:'北へ歩く',left:'西へ歩く',right:'東へ歩く',down:'南へ歩く',stop:'移動を止める'},icons={up:'▲',left:'◀',right:'▶',down:'▼',stop:'止'};
 for(const name of ['up','left','stop','right','down']){
  const b=document.createElement('button');b.type='button';b.dataset.walk=name;b.textContent=icons[name];b.setAttribute('aria-label',labels[name]);pad.append(b);
  let pressedAt=0;
  b.onpointerdown=e=>{e.preventDefault();if(!canMove())return;pressSerial++;pressedAt=performance.now();onStop?.();P.userGoal=null;if(dirs[name]){P.manualInput={dx:dirs[name][0],dy:dirs[name][1]};b.classList.add('pressed');b.setPointerCapture?.(e.pointerId)}else P.manualInput=null};
  const release=()=>{const serial=pressSerial;setTimeout(()=>{if(serial!==pressSerial||!pad.isConnected)return;P.manualInput=null;b.classList.remove('pressed')},Math.max(0,120-(performance.now()-pressedAt)))};b.onpointerup=release;b.onpointercancel=release;b.onlostpointercapture=release;
 }
 host.append(pad);P.walkPadRuntime={cv,canMove,onStop};
};
const keyDirections={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]};
window.addEventListener('keydown',e=>{const a=P.walkPadRuntime,d=keyDirections[e.key];if(!d||F.run?.active||!a?.cv?.isConnected||!a.canMove()||visible($('frontierModal'))||/INPUT|TEXTAREA|SELECT/.test(e.target?.tagName||''))return;e.preventDefault();a.onStop?.();P.manualInput={dx:d[0],dy:d[1]};});
window.addEventListener('keyup',e=>{if(keyDirections[e.key])P.manualInput=null});window.addEventListener('blur',()=>{P.manualInput=null});
document.addEventListener('visibilitychange',()=>{if(document.hidden)P.manualInput=null});
window.addEventListener('resize',S.request);window.visualViewport?.addEventListener('resize',S.request);
const start=()=>{
 const observer=new MutationObserver(records=>{let changed=false;for(const r of records){if(r.target.nodeType===1&&r.target.closest('[data-screen-owned],#openingWords,#gatewayWords,#storyDialogueText,#toast'))continue;const body=r.target.nodeType===1?r.target.closest('#frontierModalBody,.gatewayItems,.gatewayDestinations,.stallStock,.retroBagItems,.modalActions,.screenUserBody'):null;if(body)S.dirty(body);changed=true;}if(changed)S.request()});
 observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open','hidden']});S.request();
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
// Updated: 2026-11-08 JST / Ver1.155
// Updated: 2026-11-08 23:56 JST / Ver1.155 distribution bundle; dependency module versions retained.
