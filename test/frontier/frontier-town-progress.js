/* Frenda Frontier Ver1.63 — approved town stages, rendering and shared navigation. */
(()=>{'use strict';const F=window.FRENDA_FRONTIER=window.FRENDA_FRONTIER||{},P=F.TOWN_PROGRESS={width:1000,height:480,token:0};
P.stages=[
 {name:'① 未開拓地',lv:0,point:'gather',added:'構築物なし。自然の草地と踏み跡だけです。'},
 {name:'② テントで野営',lv:0,point:'gather',added:'テントと焚き火を設置。将来の施設区画は空けておきます。'},
 {name:'③ 露店 Lv1',lv:1,point:'stall',added:'テントの隣に露店と荷箱。最初の商売を始めます。'},
 {name:'④ 店舗兼住宅 Lv2',lv:2,point:'complete',added:'小さな木造店舗兼住宅。テントと露店を撤去します。'},
 {name:'⑤ 店舗 Lv3・倉庫',lv:3,point:'lv3',added:'店舗を拡張し、隣の区画に倉庫を設置。工房の工事が始まります。'},
 {name:'⑥ 店舗 Lv4・職人の定住',lv:4,point:'lv4',added:'鍛冶屋と職人の住居。主要路と橋を整備します。'},
 {name:'⑦ 店舗 Lv5・旅人の町',lv:5,point:'lv5',added:'市場・酒場兼宿屋・冒険掲示板。広場にベンチと花壇を設置します。'},
 {name:'⑧ 店舗 Lv6・冒険の拠点',lv:6,point:'lv6',added:'預かり所・噴水・街灯・住居を整備。掲示板は噴水のそばです。'},
 {name:'⑨ 店舗 Lv7・完成した町',lv:7,point:'lv7',added:'店舗専用化と店主の専用住宅。倉庫、市場、鍛冶屋、酒場、広場が最終形になります。'}
];
const crops=[[12,90,1000,475],[12,610,1000,475],[12,1130,1000,395]],names=['frontier-town-stages-a-v163.png','frontier-town-stages-b-v163.png','frontier-town-stages-c-v163.png'];
const cache=new Map();P.image=src=>{if(!cache.has(src))cache.set(src,new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('画像を読み込めません：'+src));im.src=src}));return cache.get(src)};
P.spriteCrops=[[2, 3, 43, 68], [2, 4, 43, 67], [2, 7, 43, 64], [2, 4, 43, 67], [170, 37, 307, 486], [183, 23, 297, 486], [85, 5, 307, 471], [155, 54, 304, 471]];
P.drawPlayer=(c,im,i,p,cam={x:0,y:0})=>{const crop=P.spriteCrops[i],h=34,w=Math.min(34,h*crop[2]/crop[3]);c.drawImage(im,...crop,p.x-cam.x-w/2,p.y-cam.y-h,w,h)};
P.art=()=>Promise.all(names.map(P.image));P.stop=()=>{P.token++};
P.stageFor=s=>{const o=s?.story?.opening;if(!o)return null;if(Number.isInteger(o.townPreviewStage))return Math.max(0,Math.min(8,o.townPreviewStage));if(o.phase==='arrival')return 0;if(['tent','mission1'].includes(o.phase))return 1;if(['stocking','first_sale','upgrade'].includes(o.phase))return 2;if(o.phase==='building')return 2;return Math.max(3,Math.min(8,(Number(s.development?.town?.facilities?.shop)||2)+1))};
const navMasks=new Map();
P.drawBackground=(c,art,stage,cam={x:0,y:0})=>{c.drawImage(art[Math.floor(stage/3)],...crops[stage%3],-cam.x,-cam.y,P.width,P.height);if(P.debugNav){if(!navMasks.has(stage)){const cv=document.createElement('canvas');cv.width=1000;cv.height=480;const q=cv.getContext('2d'),scene=P.scene(stage);for(let y=0;y<480;y+=8)for(let x=0;x<1000;x+=8){q.fillStyle=scene.walkable(x+4,y+4)?'rgba(0,200,100,.40)':'rgba(220,30,30,.30)';q.fillRect(x,y,8,8)}navMasks.set(stage,cv)}c.drawImage(navMasks.get(stage),-cam.x,-cam.y)}};
const box=(id,name,x,y,w,h,kind='building')=>({id,name,x,y,w,h,kind,door:{x:x+w/2,y:y+h+12}});
P.objects=stage=>{let a=[];if(stage===0)return a;if(stage<=2){a.push(box('tent','テント',465,30,80,75));if(stage===2)a.push(box('shop','露店',525,45,60,70));return a;}
 const shop=stage<=4?box('shop','店舗',440,20,120,100):box('shop','店舗',425,15,185,125);a.push(shop);
 if(stage>=4)a.push(box('warehouse','倉庫',890,20,90,110));
 if(stage===4)a.push(box('construction','工房の工事',140,35,140,90,'decoration'));
 if(stage>=5)a.push(box('forge','鍛冶屋',95,20,180,stage===6?105:135));
 if(stage===5)a.push(box('house','職人の住居',155,205,135,110));
 if(stage>=6){a.push(box('market','市場',100,stage===6?155:195,240,stage===6?80:100),box('inn','酒場兼宿屋',720,stage===6?165:190,210,stage===6?100:110));
  a.push(box('house2','住居',330,stage===6?275:335,130,stage===6?60:55));
  if(stage===6)a.push(box('house','職人の住居',155,265,130,70),box('adventure_board','冒険掲示板',540,155,80,65));
  else a.push(box('bank','預かり所',130,335,145,55),box('house3','住居',710,335,130,55),box('adventure_board','冒険掲示板',570,205,65,65),box('fountain','噴水',480,255,65,65,'decoration'));
 }
 if(stage===8)a.push(box('owner_home','店主の家',765,20,115,110));return a;
};
// Roads and entrances use the same coordinates for navigation and on-screen access indicators.
P.roads=stage=>{const lower=stage===2?345:stage===5||stage===6?355:400;return[
 {a:[335,0],b:[335,lower],w:40},{a:[20,stage>=5&&stage!==6?170:145],b:[980,stage>=5&&stage!==6?170:145],w:42},
 {a:[25,stage===6?270:stage>=7?310:290],b:[970,stage===6?270:stage>=7?310:290],w:40},{a:[365,145],b:[365,lower],w:38},{a:[680,145],b:[680,lower],w:38},{a:[500,130],b:[500,lower],w:40},
 {a:[650,0],b:[650,lower],w:40},{a:[20,lower],b:[975,lower],w:34},
 ...(stage>=5?[{a:[500,lower],b:[500,480],w:42}]:[])
 ]};
const distance=(x,y,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy)};
P.scene=stage=>{const objects=P.objects(stage),roads=P.roads(stage),links=[];
 for(const o of objects.filter(o=>o.kind==='building')){const p=o.door;let hit=null,best=Infinity;for(const r of roads){const dx=r.b[0]-r.a[0],dy=r.b[1]-r.a[1],t=Math.max(0,Math.min(1,((p.x-r.a[0])*dx+(p.y-r.a[1])*dy)/(dx*dx+dy*dy||1))),q=[r.a[0]+t*dx,r.a[1]+t*dy],d=Math.hypot(p.x-q[0],p.y-q[1]);if(d<best){best=d;hit=q}}if(hit)links.push({a:[p.x,p.y],b:hit,w:24});}
 const paths=[...roads,...links];const walkable=(x,y)=>{if(x<8||x>992||y<4||y>474)return false;const bridge=stage>=5&&Math.abs(x-500)<23&&y>=350;if(y>(stage===2?385:stage===5?405:stage===6?390:430)&&!bridge)return false;if(objects.some(o=>x>o.x-3&&x<o.x+o.w+3&&y>o.y-3&&y<o.y+o.h-2))return false;return paths.some(r=>distance(x,y,r.a,r.b)<=r.w/2)||objects.some(o=>Math.hypot(x-o.door.x,y-o.door.y)<22)};
 return{stage,objects,paths,walkable};};
P.path=(scene,from,to)=>{const step=8,cols=125,rows=60,sx=Math.floor(from.x/step),sy=Math.floor(from.y/step),tx=Math.floor(to.x/step),ty=Math.floor(to.y/step),start=sy*cols+sx,goal=ty*cols+tx;
 const ok=(x,y)=>x>=0&&x<cols&&y>=0&&y<rows&&scene.walkable(x*step+4,y*step+4);if(!ok(tx,ty))return[];const queue=[start],prev=new Map([[start,-1]]);for(let i=0;i<queue.length;i++){const k=queue[i];if(k===goal)break;const x=k%cols,y=Math.floor(k/cols);for(const[d,e]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const nx=x+d,ny=y+e,n=ny*cols+nx;if(!ok(nx,ny)||prev.has(n)||(d&&e&&(!ok(x+d,y)||!ok(x,y+e))))continue;prev.set(n,k);queue.push(n)}}if(!prev.has(goal))return[];const a=[];for(let k=goal;k!==-1;k=prev.get(k))a.push({x:k%cols*step+4,y:Math.floor(k/cols)*step+4});return a.reverse();};
P.drawAccess=(c,scene,cam)=>{c.save();c.lineWidth=3;c.strokeStyle='#dcc494';for(const o of scene.objects.filter(o=>o.kind==='building')){c.beginPath();c.moveTo(o.door.x-cam.x,o.door.y-10-cam.y);c.lineTo(o.door.x-cam.x,o.door.y+6-cam.y);c.stroke()}c.restore()};
P.mount=async(host,rerender,actions={})=>{P.stop();const token=P.token,s=F.readSave(),stage=P.stageFor(s),spec=P.stages[stage],scene=P.scene(stage),overview=F.WILDERNESS?.overview??false;
 const storyPreview=Number.isInteger(s.story?.opening?.townPreviewStage);host.classList.remove('townSceneLayout');host.classList.add('progressTownLayout');document.body.classList.add('progressTownActive');const guidance=F.OPENING?.guidance?.();
 host.innerHTML=(guidance?`<details class="progressGuide"><summary>次にすること<span>${guidance.title}</span></summary>${F.OPENING.guide()}</details>`:'')+`<canvas id="progressCanvas" style="display:block;width:100%;height:auto;touch-action:manipulation;background:#183927" aria-label="${spec.name}の町マップ"></canvas><p id="progressMessage" class="progressMessage" role="status">施設をタップして入口へ移動し、下のボタンから利用できます。</p><div class="progressCommands"><button id="progressZoom" class="cmdBtn">${overview?'近くを見る':'町全体'}</button><button id="progressHome" class="cmdBtn">${spec.lv>=1?'店舗へ':'店舗は未設営'}</button><button id="progressMissions" class="cmdBtn">ミッション</button></div>`;
 if(document.getElementById('nextActions'))F.OPENING?.bind?.(rerender,actions);const cv=document.getElementById('progressCanvas'),msg=document.getElementById('progressMessage');cv.width=overview?1000:480;cv.height=480;document.getElementById('viewTitle').textContent=spec.name;document.getElementById('viewSubtitle').textContent=spec.added;document.getElementById('viewMeta').textContent='施設 '+scene.objects.filter(o=>o.kind==='building').length;document.getElementById('progressMissions').hidden=!actions.missions;document.getElementById('progressMissions').onclick=()=>actions.missions?.();
 document.getElementById('progressZoom').onclick=()=>{F.WILDERNESS.overview=!overview;rerender()};const enter=document.getElementById('progressHome');enter.onclick=()=>{if(spec.lv>=1){if(actions.facility)actions.facility('shop');else actions.shop?.();}else msg.textContent='まだ店舗はありません。'};
 let position=P.position||{x:500,y:155};if(!scene.walkable(position.x,position.y))position={x:500,y:155};P.position=position;let route=[],cam={x:0,y:0},last=0,target=null,facing=0;
 try{const [art,players]=await Promise.all([P.art(),Promise.all(['front','back','left','right','up-left','up-right','down-left','down-right'].map((d,i)=>P.image('frontier-sprite-player-'+d+(i<4?'-v069.png':'-v152.png'))))]);if(token!==P.token)return;
 const draw=()=>{cam={x:overview?0:Math.max(0,Math.min(1000-cv.width,position.x-cv.width/2)),y:0};const c=cv.getContext('2d');c.clearRect(0,0,cv.width,cv.height);c.imageSmoothingEnabled=false;P.drawBackground(c,art,stage,cam);P.drawAccess(c,scene,cam);P.drawPlayer(c,players[facing],facing,position,cam);};draw();
 cv.onclick=e=>{const b=cv.getBoundingClientRect(),p={x:(e.clientX-b.left)/b.width*cv.width+cam.x,y:(e.clientY-b.top)/b.height*cv.height};target=scene.objects.find(o=>p.x>=o.x&&p.x<=o.x+o.w&&p.y>=o.y&&p.y<=o.y+o.h);const end=target?target.door:p;route=P.path(scene,position,end);if(route.length===1&&target&&target.kind==='building'){enter.textContent=target.name+'を利用する';const readyId=target.id;enter.onclick=()=>{if(actions.facility)actions.facility(readyId);else msg.textContent='この画面では外観と移動のみ利用できます。'};}msg.textContent=route.length?(target?target.name+'の入口へ移動中':'移動中'):'そこには進めません。道か施設の入口を選んでください。';};
 const tick=now=>{if(token!==P.token||!cv.isConnected)return;let budget=Math.min(.05,(now-last)/1000)*95;last=now;while(route.length&&budget>0){const q=route[0],dx=q.x-position.x,dy=q.y-position.y,d=Math.hypot(dx,dy);if(d<.01){route.shift();continue}facing=Math.abs(dx)>.01&&Math.abs(dy)>.01?(dy<0?(dx<0?4:5):(dx<0?6:7)):(Math.abs(dx)>Math.abs(dy)?(dx>0?3:2):(dy>0?0:1));const n=Math.min(d,budget);position.x+=dx/d*n;position.y+=dy/d*n;budget-=n;if(n===d)route.shift();if(!route.length){msg.textContent=target?target.name+'の入口に到着しました。':'到着しました。';if(target&&target.kind==='building'){enter.textContent=target.name+'を利用する';enter.onclick=()=>{if(actions.facility)actions.facility(target.id);else msg.textContent='この確認画面では外観と移動のみ利用できます。'};}}}draw();requestAnimationFrame(tick)};requestAnimationFrame(tick);
 }catch(e){if(token===P.token)msg.textContent=e.message;}
};
// Stage switching uses isolated test saves. Real mission requirements are unchanged.
if(F.OPENING){const O=F.OPENING,make=O.makePoint,sw=O.switchPoint;
 O.points.unshift(...P.stages.map((x,i)=>['town'+i,'町全体：'+x.name]));
 O.makePoint=id=>{if(!/^town[0-8]$/.test(id))return make(id);const n=Number(id.slice(4)),s=make(P.stages[n].point);s.story.opening.townPreviewStage=n;if(n===0)s.story.opening.phase='arrival';s.development.town.facilities.shop=P.stages[n].lv;
 Object.assign(s.development.town.facilities,{warehouse:n>=4?Math.min(2,n-3):0,forge:n>=5?Math.min(6,(n-4)*2):0,house:n>=5?Math.min(6,(n-4)*2):0,market:n>=6?(n===8?2:1):0,inn:n>=6?(n===8?6:1):0,adventure_board:n>=6?(n>=7?2:1):0,plaza:n>=6?(n>=7?2:1):0,bank:n>=7?1:0,owner_home:n>=8?1:0});s.shelves=Array([0,3,3,4,5,6,6,9][P.stages[n].lv]).fill(null);return s;};
 O.switchPoint=id=>{P.stop();P.position={x:500,y:155};sw(id)};
 const old=F.WILDERNESS.mount,stop=F.WILDERNESS.stop;F.WILDERNESS.stop=()=>{P.stop();stop()};F.WILDERNESS.mount=(...args)=>{const stage=P.stageFor(F.readSave());if(stage!==null)return P.mount(...args);return old(...args)};
}
})();
// Updated: 2026-10-25 JST / Ver1.63

// Updated: 2026-10-25 JST / Ver1.65

// Bundle updated: 2026-10-25 18:48 JST / Frontier Ver1.65
