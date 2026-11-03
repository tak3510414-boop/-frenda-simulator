/* Frenda Frontier Ver1.130 — close-follow camera for town and opening; accurate hit testing. */
(()=>{'use strict';const F=window.FRENDA_FRONTIER=window.FRENDA_FRONTIER||{},P=F.TOWN_PROGRESS={width:1000,height:480,token:0};
// The camera zoom is visual only. Never modify the world coordinates, navigation,
// map geometry or persisted player position when zooming.
P.ZOOM_WIDTHS=Object.freeze({near:320,closer:240});
P.zoomMode='near';
P.worldWidth=overview=>overview?1000:P.ZOOM_WIDTHS[P.zoomMode]||320;
P.zoomLabel=overview=>overview?'近くを見る':P.zoomMode==='near'?'さらに拡大':'町全体';
P.nextZoom=()=>{const W=F.WILDERNESS;if(W?.overview){W.overview=false;P.zoomMode='near';}else if(P.zoomMode==='near'){P.zoomMode='closer';}else{W.overview=true;}return {overview:!!W?.overview,zoomMode:P.zoomMode};};
P.stages=[
 {name:'① 未開拓地',lv:0,point:'gather',added:'構築物なし。自然の草地と踏み跡だけです。'},
 {name:'② テントで野営',lv:0,point:'gather',added:'テントと焚き火を設置。将来の施設区画は空けておきます。'},
 {name:'③ 露店 Lv1',lv:1,point:'stall',added:'テントの隣に露店と荷箱。最初の商売を始めます。'},
 {name:'④ 店舗兼住宅 Lv2',lv:2,point:'complete',added:'小さな木造店舗兼住宅。テントと露店を撤去します。'},
 {name:'⑤ 店舗 Lv3・倉庫',lv:3,point:'lv3',added:'店舗を拡張し、隣の区画に倉庫を設置。工房の工事が始まります。'},
 {name:'⑥ あなたのお店 Lv4・職人の定住',lv:4,point:'lv4',added:'あなたのお店を5棚に増築。職人ミナの小さな鍛冶工房と住まいもできました。'},
 {name:'⑦ 店舗 Lv5・旅人の町',lv:5,point:'lv5',added:'市場・酒場兼宿屋・冒険掲示板。広場にベンチと花壇を設置します。'},
 {name:'⑧ 店舗 Lv6 建設中',lv:5,point:'lv5',added:'店主の住宅と新店舗の建設が進んでいます。'},
 {name:'⑨ 店舗 Lv6・完成した町',lv:6,point:'lv6',added:'店舗は9棚・住居は別棟。預かり所と広場も完成した町。'}
];
const crops=[[12,90,1000,475],[12,610,1000,475],[12,1130,1000,395]],names=['frontier-town-stages-a-v163.png','frontier-town-stages-b-v163.png','frontier-town-stages-c-v163.png'];
const cache=new Map();P.image=src=>{if(!cache.has(src))cache.set(src,new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('画像を読み込めません：'+src));im.src=src}));return cache.get(src)};
P.spriteCrops=[[2, 3, 43, 68], [2, 4, 43, 67], [2, 7, 43, 64], [2, 4, 43, 67], [170, 37, 307, 486], [183, 23, 297, 486], [85, 5, 307, 471], [155, 54, 304, 471]];
P.drawPlayer=(c,im,i,p,cam={x:0,y:0})=>{const crop=P.spriteCrops[i],h=34,w=Math.min(34,h*crop[2]/crop[3]);c.drawImage(im,...crop,p.x-cam.x-w/2,p.y-cam.y-h,w,h)};
P.art=()=>Promise.all(names.map(P.image));P.stop=()=>{P.token++;P.resizeCleanup?.();P.resizeCleanup=null;};
P.stageFor=s=>{const o=s?.story?.opening;if(!o)return null;if(Number.isInteger(o.townPreviewStage))return Math.max(0,Math.min(8,o.townPreviewStage));if(o.phase==='arrival')return 0;if(['tent','mission1'].includes(o.phase))return 1;if(['stocking','first_sale','upgrade'].includes(o.phase))return 2;if(o.phase==='building')return 2;if(o.lv6Project)return 7;const shop=Number(s.development?.town?.facilities?.shop)||2;return shop>=6?8:Math.max(3,Math.min(6,shop+1))};
const navMasks=new Map();
P.drawBackground=(c,art,stage,cam={x:0,y:0})=>{c.drawImage(art[Math.floor(stage/3)],...crops[stage%3],-cam.x,-cam.y,P.width,P.height);if(P.debugNav){if(!navMasks.has(stage)){const cv=document.createElement('canvas');cv.width=1000;cv.height=480;const q=cv.getContext('2d'),scene=P.scene(stage);for(let y=0;y<480;y+=8)for(let x=0;x<1000;x+=8){q.fillStyle=scene.walkable(x+4,y+4)?'rgba(0,200,100,.40)':'rgba(220,30,30,.30)';q.fillRect(x,y,8,8)}navMasks.set(stage,cv)}c.drawImage(navMasks.get(stage),-cam.x,-cam.y)}};
const box=(id,name,x,y,w,h,kind='building')=>({id,name,x,y,w,h,kind,door:{x:x+w/2,y:y+h+12}});
// Geometry is measured against the cropped artwork in world coordinates (1000 × 480).
const measured=(id,name,x,y,w,h,dx,dy,kind='building')=>({...box(id,name,x,y,w,h,kind),door:{x:dx,y:dy}});
P.objects=stage=>{
 const b=measured,d=(id,x,y,w,h)=>b(id,'障害物',x,y,w,h,0,0,'decoration');
 if(stage===0)return[];
 if(stage<=2)return[b('tent','テント',459,34,82,64,500,115),...(stage===2?[b('shop','露店',518,48,63,76,548,139),d('crates',580,101,27,28)]:[])];
 if(stage===3)return[b('shop','店舗',449,20,105,77,501,110)];
 if(stage===4)return[b('shop','店舗',442,18,120,83,503,114),b('warehouse','倉庫',888,28,68,72,922,117),d('construction',121,49,175,52)];
 if(stage===5)return[b('shop','店舗',430,18,155,120,505,150),b('warehouse','倉庫',887,34,79,96,926,142),b('forge','鍛冶屋',110,30,108,114,164,156),b('house','職人の住居',151,210,105,116,204,338),d('forge_materials',220,105,74,51),d('home_fence_left',132,270,19,64),d('home_fence_right',256,270,43,64)];
 if(stage===6)return[b('shop','店舗',431,16,171,92,519,118),b('warehouse','倉庫',849,24,112,89,923,127),b('forge','鍛冶屋',113,21,149,86,166,119),b('market','市場',112,151,218,80,221,240),b('inn','酒場兼宿屋',711,147,204,99,816,257),b('house','職人の住居',145,250,110,88,209,348),b('house2','住居',323,252,125,86,383,350),b('adventure_board','冒険掲示板',546,150,66,58,578,218),d('flower_nw',394,170,52,46),d('flower_sw',414,218,66,30),d('flower_se',538,228,66,20)];
 const last=stage===8;
 return[b('shop','店舗',last?431:431,13,175,last?114:94,519,last?139:122),b('forge','鍛冶屋',101,17,190,105,166,139),b('warehouse','倉庫',last?894:849,27,last?77:112,last?100:84,923,last?139:125),b('market','市場',last?83:101,last?173:160,last?250:232,last?96:69,219,last?277:237),b('inn','酒場兼宿屋',704,last?171:145,220,last?103:101,814,last?289:259),b('bank','預かり所',128,last?283:244,145,last?86:76,201,last?382:334),b('house2','住居',333,last?320:286,103,last?61:78,384,last?391:381),b('house3','住居',708,last?323:318,112,last?61:63,752,last?394:395),b('adventure_board','冒険掲示板',last?576:588,last?176:151,61,last?66:53,last?606:619,last?255:218),d('fountain',last?460:463,last?199:185,87,last?57:60),
 d('flower_nw',last?394:392,last?181:179,51,44),d('flower_sw',last?403:408,last?260:246,73,31),d('flower_se',last?544:539,last?263:247,58,31),
 ...(last?[b('owner_home','店主の家',755,31,125,99,810,142)]:[])];
};
const poly=(points,w=26)=>points.slice(1).map((p,i)=>({a:points[i],b:p,w}));
P.roads=stage=>{
 const line=(p,w)=>poly(p,w);let r=[];
 if(stage<=4){const compressed=stage===2,top=compressed?175:146,mid=compressed?350:291,bottom=compressed?350:395;
 r=[...line([[355,4],[343,60],[344,120],[355,top],[356,225],[365,280],[372,mid],[365,bottom]]),...line([[25,top],[975,top]]),...line([[25,mid],[975,mid]]),...line([[25,bottom],[975,bottom]]),...line([[644,4],[632,85],[649,top],[650,230],[672,mid],[674,bottom]]),...line([[166,top],[166,mid],[156,bottom]]),...line([[816,top],[816,mid],[806,bottom]]),...line([[500,110],[500,top]]),...line([[500,mid],[500,bottom]])];
 if(stage===4)r.push(...line([[500,395],[500,474]],32));return r;}
 if(stage===5)return [...line([[355,4],[341,60],[344,120],[354,175],[355,225],[362,285],[375,332],[398,350]]),...line([[25,170],[975,173]]),...line([[20,350],[975,350]]),...line([[505,145],[505,350],[505,474]],30),...line([[654,4],[632,90],[649,173],[650,230],[662,282],[687,350]])];
 if(stage===6)return [...line([[355,4],[349,140],[359,243],[355,350]]),...line([[640,4],[648,142],[650,243],[658,350]]),...line([[30,143],[975,143]]),...line([[30,244],[975,244]]),...line([[25,350],[975,350]]),...line([[515,115],[511,244],[510,474]],30),...line([[166,117],[166,143]]),...line([[220,235],[220,244]]),...line([[816,250],[816,350]]),...line([[511,215],[578,215]])];
 const last=stage===8,top=last?158:146,lower=last?390:382;
 r=[...line([[355,4],[355,top],[360,286],[355,lower]]),...line([[640,4],[646,top],[647,285],[652,lower]]),...line([[28,top],[975,top]]),...line([[28,lower],[975,lower]]),...line([[515,top],[515,177],[445,177],[445,247],[445,285],[509,285],[509,lower],[509,474]],30),...line([[515,177],[563,177],[563,246]]),...line([[563,246],[620,246],[647,246]]),...line([[563,246],[563,285],[509,285]]),...line([[28,last?277:236],[355,last?277:236]]),...line([[647,292],[975,292]]),...line([[814,last?284:253],[814,lower]])];
 // The front of the fountain is clear; the bowl, planters and benches are not roads.
 r.push(...line([[445,last?255:247],[509,last?255:247],[563,last?255:247]]));return r;
};
const distance=(x,y,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy)};
P.scene=stage=>{const objects=P.objects(stage),roads=P.roads(stage),links=[];
 for(const o of objects.filter(o=>o.kind==='building')){const p=o.door;let hit=null,best=Infinity;for(const r of roads){const dx=r.b[0]-r.a[0],dy=r.b[1]-r.a[1],t=Math.max(0,Math.min(1,((p.x-r.a[0])*dx+(p.y-r.a[1])*dy)/(dx*dx+dy*dy||1))),q=[r.a[0]+t*dx,r.a[1]+t*dy],d=Math.hypot(p.x-q[0],p.y-q[1]);if(d<best){best=d;hit=q}}if(hit)links.push({a:[p.x,p.y],b:hit,w:34});}
 const paths=[...roads,...links];const walkable=(x,y)=>{if(x<8||x>992||y<4||y>474)return false;const bridge=stage>=4&&Math.abs(x-(stage===5?505:stage>=6?stage===6?510:509:500))<16&&y>=(stage===6?350:stage===5?350:395);if(y>([405,405,365,405,405,365,358,400,405][stage])&&!bridge)return false;if(objects.some(o=>x>o.x-3&&x<o.x+o.w+3&&y>o.y-3&&y<o.y+o.h-2))return false;return paths.some(r=>distance(x,y,r.a,r.b)<=Math.min(13,r.w/2))||objects.some(o=>o.kind==='building'&&Math.hypot(x-o.door.x,y-o.door.y)<8)};
 return{stage,objects,paths,walkable};};
P.nearest=(scene,p,max=32)=>{let best=null,dist=Infinity;for(let y=Math.max(4,Math.floor((p.y-max)/8)*8+4);y<Math.min(477,p.y+max);y+=8)for(let x=Math.max(4,Math.floor((p.x-max)/8)*8+4);x<Math.min(997,p.x+max);x+=8){const d=Math.hypot(x-p.x,y-p.y);if(d<=max&&d<dist&&scene.walkable(x,y)){best={x,y};dist=d;}}return best;};
P.spawn=stage=>P.nearest(P.scene(stage),{x:stage===5?505:stage>=6?515:500,y:stage===5?172:stage>=6?145:stage===2?175:146},48);
P.path=(scene,from,to)=>{from=P.nearest(scene,from,32);to=P.nearest(scene,to,12);if(!from||!to)return[];const step=8,cols=125,rows=60,sx=Math.floor(from.x/step),sy=Math.floor(from.y/step),tx=Math.floor(to.x/step),ty=Math.floor(to.y/step),start=sy*cols+sx,goal=ty*cols+tx;
 const ok=(x,y)=>x>=0&&x<cols&&y>=0&&y<rows&&scene.walkable(x*step+4,y*step+4);if(!ok(tx,ty))return[];const queue=[start],prev=new Map([[start,-1]]);for(let i=0;i<queue.length;i++){const k=queue[i];if(k===goal)break;const x=k%cols,y=Math.floor(k/cols);for(const[d,e]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const nx=x+d,ny=y+e,n=ny*cols+nx;if(!ok(nx,ny)||prev.has(n)||(d&&e&&(!ok(x+d,y)||!ok(x,y+e))))continue;prev.set(n,k);queue.push(n)}}if(!prev.has(goal))return[];const a=[];for(let k=goal;k!==-1;k=prev.get(k))a.push({x:k%cols*step+4,y:Math.floor(k/cols)*step+4});return a.reverse();};
// Ver1.119: the forest gate remains in the same northern road at every town level.
P.FOREST_GATE=Object.freeze({x:355,y:36});
P.isForestTap=(p,gate=P.FOREST_GATE)=>((p.y<=43&&Math.abs(p.x-gate.x)<=40)||(p.y>=59&&p.y<=90&&Math.abs(p.x-gate.x)<=73));

// Lv2 storefront project: construction is started or completed on-site, not at the existing stall.
P.SHOP_BUILD_SITE=Object.freeze({x:500,y:171});
P.LV3_SITE=Object.freeze({x:608,y:145}); // East side of the Lv2 shop, on an existing public road.
P.LV4_SITE=Object.freeze({x:355,y:180}); // West road, outside the planned forge footprint.
P.LV5_SITE=Object.freeze({x:816,y:173});
P.LV6_SITE=Object.freeze({x:641,y:146}); // Public central road, accessible from stages 6 and 7. // East public road; future inn/mart stand nearby after completion.
P.forestPath=(stage,from)=>{const scene=P.scene(stage),end=P.nearest(scene,P.FOREST_GATE,70);return end?P.path(scene,from,end):[]};
P.drawAccess=(c,scene,cam)=>{c.save();c.lineWidth=3;c.strokeStyle='#dcc494';for(const o of scene.objects.filter(o=>o.kind==='building')){c.beginPath();c.moveTo(o.door.x-cam.x,o.door.y-10-cam.y);c.lineTo(o.door.x-cam.x,o.door.y+6-cam.y);c.stroke()}c.restore()};
// Keep the same horizontal zoom; crop vertically to the real visible viewport.
P.viewportPlan=(width,viewportHeight,overhead,overview)=>{
 const cssHeight=overview?width*.48:Math.min(width,Math.max(150,viewportHeight-overhead));
 const worldWidth=P.worldWidth(overview);
 // Keep the canvas CSS aspect ratio equal to the world-coordinate aspect ratio.
 // This is critical: touch positions, camera pan, sprite and building positions
 // are all defined in world units; CSS-only scaling would break hit testing.
 const worldHeight=overview?480:Math.min(480,Math.max(120,Math.round(cssHeight*worldWidth/Math.max(1,width))));
 return{cssHeight,width:worldWidth,height:worldHeight};
};
P.fitCanvas=(host,cv,overview)=>{const height=e=>e?.getBoundingClientRect?.().height||0,width=cv.getBoundingClientRect().width||390;
 const overhead=height(document.querySelector('header'))+height(document.getElementById('mainNav'))+height(document.querySelector('.gameHeader'))+height(host.querySelector('.progressGuide'))+height(document.getElementById('progressMessage'))+height(host.querySelector('.progressCommands'))+28;
 const plan=P.viewportPlan(width,window.visualViewport?.height||window.innerHeight||800,overhead,overview);cv.width=plan.width;cv.height=plan.height;cv.style.height=plan.cssHeight+'px';return plan;
};
P.mount=async(host,rerender,actions={})=>{P.stop();const token=P.token,s=F.readSave(),stage=P.stageFor(s),spec=P.stages[stage],scene=P.scene(stage),overview=F.WILDERNESS?.overview??false;P.activeStage=stage;
 const storyPreview=Number.isInteger(s.story?.opening?.townPreviewStage);
 const canEnterForest=()=>!!actions.startDungeon&&!storyPreview&&(!F.OPENING?.active?.()||!!F.OPENING.canExplore?.());
 const constructionActive=()=>!!actions.construction&&!storyPreview&&['upgrade','building'].includes(F.OPENING?.phase?.());
 const lv3Active=()=>!!actions.lv3Site&&!storyPreview&&['meet','gather','ready','building','finish'].includes(F.OPENING?.lv3Status?.(F.readSave()).phase);
 const lv4Active=()=>!!actions.lv4Site&&!storyPreview&&['meet','gather','ready','building','finish'].includes(F.OPENING?.lv4Status?.(F.readSave()).phase);
 const lv5Active=()=>!!actions.lv5Site&&!storyPreview&&['meet','gather','ready','building','finish'].includes(F.OPENING?.lv5Status?.(F.readSave()).phase);
 const lv6Active=()=>!!actions.lv6Site&&!storyPreview&&['meet','gather','ready','building','finish'].includes(F.OPENING?.lv6Status?.(F.readSave()).phase);
 host.classList.remove('townSceneLayout');host.classList.add('progressTownLayout');document.body.classList.add('progressTownActive');const guidance=F.OPENING?.guidance?.();
 host.innerHTML=(guidance?`<details class="progressGuide"><summary>次にすること<span>${guidance.title}</span></summary>${F.OPENING.guide()}</details>`:'')+`<canvas id="progressCanvas" style="display:block;width:100%;height:auto;touch-action:manipulation;background:#183927" aria-label="${spec.name}の町マップ"></canvas><p id="progressMessage" class="progressMessage" role="status">${canEnterForest()?'北の道の「⬆ はじまりの森」をタップして、歩いて森へ入れます。':'施設をタップして入口へ移動し、下のボタンから利用できます。'}</p><div class="progressCommands ${F.RESIDENTS?.eligible(s)?'hasResident':''}"><button id="progressZoom" class="cmdBtn">${P.zoomLabel(overview)}</button><button id="progressHome" class="cmdBtn">${spec.lv>=1?'店舗へ':'店舗は未設営'}</button><button id="progressMissions" class="cmdBtn">ミッション</button>${F.RESIDENTS?.eligible(s)?'<button id="progressResident" class="cmdBtn">ミナのところへ</button>':''}</div>`;
 if(document.getElementById('nextActions'))F.OPENING?.bind?.(rerender,actions);const cv=document.getElementById('progressCanvas'),msg=document.getElementById('progressMessage');cv.width=overview?1000:480;cv.height=480;document.getElementById('viewTitle').textContent=spec.name;document.getElementById('viewSubtitle').textContent=spec.added;document.getElementById('viewMeta').textContent='施設 '+scene.objects.filter(o=>o.kind==='building').length;document.getElementById('progressMissions').hidden=!actions.missions;document.getElementById('progressMissions').onclick=()=>actions.missions?.();
 document.getElementById('progressZoom').onclick=()=>{P.nextZoom();rerender()};const enter=document.getElementById('progressHome');enter.onclick=()=>{if(spec.lv>=1){if(actions.facility)actions.facility('shop');else actions.shop?.();}else msg.textContent='まだ店舗はありません。'};
 const fit=()=>P.fitCanvas(host,cv,overview);fit();window.addEventListener('resize',fit);window.visualViewport?.addEventListener?.('resize',fit);host.querySelector('.progressGuide')?.addEventListener?.('toggle',fit);P.resizeCleanup=()=>{window.removeEventListener?.('resize',fit);window.visualViewport?.removeEventListener?.('resize',fit);};
 // Ver1.121: Keep the previous position when a stage changes. If a building occupies it,
 // choose the closest road instead of abruptly returning to the stage spawn.
 let position=P.position? (scene.walkable(P.position.x,P.position.y)?{...P.position}:P.nearest(scene,P.position,160)) : null;
 if(!position)position=P.spawn(stage);
 if(!position)throw Error('町の開始地点を確認してください。');
 P.position={...position};let route=[],cam={x:0,y:0},last=0,target=null,facing=0;
 const arriveAtConstruction=()=>{route=[];target=null;P.position={...position};msg.textContent='店舗Lv2の予定地に到着しました。';actions.construction?.();};
 const arriveAtLv3=()=>{route=[];target=null;P.position={...position};msg.textContent='ミナのところに到着しました。';actions.lv3Site?.();};
 const arriveAtLv4=()=>{route=[];target=null;P.position={...position};msg.textContent='工房の予定地に着きました。';actions.lv4Site?.();};
 const arriveAtLv5=()=>{route=[];target=null;P.position={...position};msg.textContent='東の建設予定地に着きました。';actions.lv5Site?.();};
 const arriveAtLv6=()=>{route=[];target=null;P.position={...position};msg.textContent='最後の建築予定地へ到着しました。';actions.lv6Site?.();};
 const routeToLv3=()=>{if(!lv3Active())return;const end=P.nearest(scene,P.LV3_SITE,30);if(!end){msg.textContent='ミナのいる道を見つけられません。';return;}const path=P.path(scene,position,end);if(!path.length){msg.textContent='ミナのところへ通れる道がありません。';return;}target={id:'lv3_carpenter_mina',kind:'lv3Site',name:'旅の職人ミナ',door:end};route=path;msg.textContent='🛠 ミナのところへ歩いています……';if(route.length<=1)arriveAtLv3();};
 const routeToLv4=()=>{if(!lv4Active())return;const end=P.nearest(scene,P.LV4_SITE,35);if(!end){msg.textContent='工房予定地に通れる道がありません。';return;}const path=P.path(scene,position,end);if(!path.length){msg.textContent='工房予定地までの道を確認できません。';return;}target={id:'lv4_carpenter_mina',kind:'lv4Site',name:'ミナと工房予定地',door:end};route=path;msg.textContent='⚒️ 工房予定地へ歩いています……';if(route.length<=1)arriveAtLv4();};
 const homeVisitPending=()=>!!actions.facility&&!storyPreview&&!!F.readSave()?.story?.opening?.lv6Finished&&!F.readSave()?.story?.opening?.lv6HomeVisited;
 const routeToOwnerHome=()=>{const home=scene.objects.find(x=>x.id==='owner_home');if(!home){msg.textContent='専用住宅がまだ表示されていません。';return;}const end=P.nearest(scene,home.door,36);const path=end?P.path(scene,position,end):[];if(!path.length){msg.textContent='専用住宅への道が見つかりません。';return;}target={id:'owner_home',kind:'ownerHome',name:'店主の専用住宅',door:end};route=path;msg.textContent='🏡 店主の専用住宅へ向かっています……';if(route.length<=1){route=[];target=null;actions.facility?.('owner_home')}};
 const routeToLv6=()=>{if(!lv6Active())return;const end=P.nearest(scene,P.LV6_SITE,56);if(!end){msg.textContent='中央の予定地が見つかりません。';return;}const path=P.path(scene,position,end);if(!path.length){msg.textContent='中央の予定地まで通れる道がありません。';return;}target={id:'lv6_final_construction',kind:'lv6Site',name:'店舗Lv6と店主の家',door:end};route=path;msg.textContent='🏡 中央の建築予定地へ歩いています……';if(route.length<=1)arriveAtLv6();};
 const routeToLv5=()=>{if(!lv5Active())return;const end=P.nearest(scene,P.LV5_SITE,48);if(!end){msg.textContent='旅商人のいる道を見つけられません。';return;}const path=P.path(scene,position,end);if(!path.length){msg.textContent='東の建設予定地まで通れる道がありません。';return;}target={id:'lv5_market_merchant',kind:'lv5Site',name:'旅商人リオと建設予定地',door:end};route=path;msg.textContent='🧺 旅商人リオのところへ歩いています……';if(route.length<=1)arriveAtLv5();};
 const routeToConstruction=()=>{if(!constructionActive())return;const end=P.nearest(scene,P.SHOP_BUILD_SITE,28);if(!end){msg.textContent='建築予定地を見つけられません。';return;}const path=P.path(scene,position,end);if(!path.length){msg.textContent='建築予定地へ通れる道がありません。';return;}target={id:'shop_l2_construction',name:'店舗Lv2建築予定地',kind:'construction',door:end};route=path;msg.textContent='🏗 店舗Lv2の予定地へ歩いて移動中……';if(route.length<=1)arriveAtConstruction();};
 if(constructionActive()){enter.textContent='🏗 店舗Lv2の建築場所へ';enter.onclick=routeToConstruction;}
 if(lv3Active()){enter.textContent='🛠 ミナのところへ';enter.onclick=routeToLv3;}
 if(lv4Active()){enter.textContent='⚒️ 工房予定地へ';enter.onclick=routeToLv4;}
 if(lv5Active()){enter.textContent='🧺 東の建築予定地へ';enter.onclick=routeToLv5;}
 if(lv6Active()){enter.textContent='🏡 最後の建築予定地へ';enter.onclick=routeToLv6;}
 if(homeVisitPending()){enter.textContent='🏡 店主の専用住宅へ';enter.onclick=routeToOwnerHome;}

 const residentButton=document.getElementById('progressResident');if(residentButton)residentButton.onclick=()=>{const N=F.RESIDENTS;N.step();const a=N.actor;if(!a)return;N.pauseUntil=Date.now()+20000;const o=a.inside?scene.objects.find(x=>x.id===(a.inside==='forge'?'forge':N.homeId(F.readSave()))):null;target=o?{...o,kind:'residentRoom'}:{id:a.id,name:a.name,kind:'resident',door:{...a.position}};route=P.path(scene,position,target.door);if(target.kind==='resident')while(route.length>1&&Math.hypot(route[route.length-1].x-target.door.x,route[route.length-1].y-target.door.y)<28)route.pop();msg.textContent='ミナのところへ移動中';if(route.length===1){route=[];if(target.kind==='resident')actions.resident?.();else actions.facility?.(target.id);}};
 try{const [art,players]=await Promise.all([P.art(),Promise.all(['front','back','left','right','up-left','up-right','down-left','down-right'].map((d,i)=>P.image('frontier-sprite-player-'+d+(i<4?'-v069.png':'-v152.png'))))]);if(token!==P.token)return;
 const draw=()=>{const focus=position;cam={x:overview?0:Math.max(0,Math.min(1000-cv.width,focus.x-cv.width/2)),y:overview?0:Math.max(0,Math.min(480-cv.height,focus.y-cv.height/2))};const c=cv.getContext('2d');c.clearRect(0,0,cv.width,cv.height);c.imageSmoothingEnabled=false;P.drawBackground(c,art,stage,cam);if(stage>=1&&s.story?.opening?.entranceInspected)F.OPENING_CINEMATIC?.drawRunestone?.(c,cam);P.drawAccess(c,scene,cam);
 if(constructionActive()){
  const site=P.SHOP_BUILD_SITE,x=site.x-cam.x,y=site.y-cam.y,buildingNow=F.OPENING?.phase?.()==='building';
  // Once work begins, a translucent wooden frame surrounds the future Lv2 shop footprint.
  if(buildingNow){const bx=449-cam.x,by=25-cam.y;c.save();c.strokeStyle='#f7ce80';c.lineWidth=4;c.setLineDash([8,5]);c.strokeRect(bx,by,105,78);c.setLineDash([]);c.strokeStyle='#76502b';c.lineWidth=5;for(const xx of [bx+6,bx+99]){c.beginPath();c.moveTo(xx,by+3);c.lineTo(xx,by+77);c.stroke()}c.restore()}
  if(x>=-110&&x<=cv.width+110&&y>=-35&&y<=cv.height+35){
   c.save();c.fillStyle='rgba(70,48,27,.96)';c.strokeStyle='#f8de9f';c.lineWidth=2;
   c.fillRect(x-96,y-41,192,30);c.strokeRect(x-96,y-41,192,30);
   c.fillStyle='#fff4cd';c.font='bold 13px sans-serif';c.textAlign='center';c.fillText(buildingNow?'🏗 店舗Lv2 工事中':'🏗 店舗Lv2 建築予定地',x,y-21);
   c.fillStyle='#f8dd90';c.beginPath();c.moveTo(x-7,y-7);c.lineTo(x+7,y-7);c.lineTo(x,y+2);c.closePath();c.fill();c.restore();
  }
 }

 if(lv3Active()){
  const x=P.LV3_SITE.x-cam.x,y=P.LV3_SITE.y-cam.y,st=F.OPENING?.lv3Status?.();
  if(x>=-85&&x<=cv.width+85&&y>=-65&&y<=cv.height+65){
   c.save();c.fillStyle='#332b27';c.fillRect(x-7,y-18,14,7);c.fillStyle='#d9a477';c.fillRect(x-5,y-11,10,8);
   c.fillStyle='#4b6da0';c.fillRect(x-6,y-3,12,14);c.fillStyle='#43372d';c.fillRect(x-6,y+11,5,6);c.fillRect(x+1,y+11,5,6);
   c.strokeStyle='#f2d696';c.lineWidth=1.6;c.fillStyle='rgba(34,29,25,.94)';c.fillRect(x-75,y-52,150,27);c.strokeRect(x-75,y-52,150,27);
   c.fillStyle='#fff0b9';c.font='bold 12px sans-serif';c.textAlign='center';c.fillText(st?.phase==='finish'?'🏗 工事完成：ミナ':st?.phase==='building'?'🏗 工事中：ミナ':'🛠 職人ミナに話す',x,y-34);c.restore();
  }
 }
 if(lv4Active()){
  const x=P.LV4_SITE.x-cam.x,y=P.LV4_SITE.y-cam.y,st=F.OPENING?.lv4Status?.();
  if(x>=-110&&x<=cv.width+110&&y>=-70&&y<=cv.height+70){
   c.save();c.fillStyle='#251e1a';c.fillRect(x-7,y-17,14,6);c.fillStyle='#e5b990';c.fillRect(x-5,y-11,10,8);
   c.fillStyle='#598b75';c.fillRect(x-6,y-3,12,13);c.fillStyle='#392c24';c.fillRect(x-6,y+10,5,6);c.fillRect(x+1,y+10,5,6);
   c.fillStyle='rgba(36,29,24,.95)';c.strokeStyle='#f4df9a';c.lineWidth=2;c.fillRect(x-100,y-52,200,29);c.strokeRect(x-100,y-52,200,29);
   c.fillStyle='#fff1c2';c.textAlign='center';c.font='bold 12px sans-serif';c.fillText(st?.phase==='finish'?'🏠 工房完成：ミナ':st?.phase==='building'?'🏗 工房と住居を建設中':'⚒️ ミナ／工房予定地',x,y-33);c.restore();
  }
 }
 if(lv5Active()){
  const x=P.LV5_SITE.x-cam.x,y=P.LV5_SITE.y-cam.y,st=F.OPENING?.lv5Status?.();
  if(x>=-128&&x<=cv.width+128&&y>=-65&&y<=cv.height+70){
   c.save();c.fillStyle='#5b3822';c.fillRect(x-11,y-21,22,8);c.fillStyle='#e5ba8b';c.fillRect(x-8,y-13,16,10);
   c.fillStyle='#48678b';c.fillRect(x-8,y-3,16,15);c.fillStyle='#503826';c.fillRect(x-7,y+12,6,7);c.fillRect(x+1,y+12,6,7);
   c.fillStyle='rgba(33,26,23,.95)';c.strokeStyle='#f5df9d';c.lineWidth=2;c.fillRect(x-111,y-55,222,30);c.strokeRect(x-111,y-55,222,30);
   c.fillStyle='#fff1c4';c.textAlign='center';c.font='bold 12px sans-serif';
   c.fillText(st?.phase==='finish'?'🏮 市場・酒場の工事完成':st?.phase==='building'?'🏗 市場・酒場を建築中':'🧺 旅商人リオ／建設予定地',x,y-35);c.restore();
  }
 }
 if(lv6Active()){
  const x=P.LV6_SITE.x-cam.x,y=P.LV6_SITE.y-cam.y,st=F.OPENING?.lv6Status?.();
  if(x>=-130&&x<=cv.width+130&&y>=-70&&y<=cv.height+70){
   c.save();c.fillStyle='rgba(35,29,24,.96)';c.strokeStyle='#f3d99d';c.lineWidth=2;
   c.fillRect(x-113,y-54,226,30);c.strokeRect(x-113,y-54,226,30);
   c.fillStyle='#fff1c4';c.textAlign='center';c.font='bold 12px sans-serif';
   c.fillText(st?.phase==='finish'?'🏡 最後の工事が完成':st?.phase==='building'?'🏗 店舗Lv6・住宅 建築中':'🏡 最後の建築予定地：ミナ',x,y-35);
   c.fillStyle='#f0d495';c.beginPath();c.moveTo(x-7,y-16);c.lineTo(x+7,y-16);c.lineTo(x,y-5);c.closePath();c.fill();c.restore();
  }
 }
 if(canEnterForest()){
  const gx=P.FOREST_GATE.x-cam.x,gy=83-cam.y;
  if(gx>=-90&&gx<=cv.width+90&&gy>=-20&&gy<=cv.height+30){
   c.save();c.fillStyle='rgba(15,44,33,.92)';c.strokeStyle='#f3d48a';c.lineWidth=2;
   c.fillRect(gx-73,gy-24,146,30);c.strokeRect(gx-73,gy-24,146,30);
   c.fillStyle='#fff2be';c.font='bold 13px sans-serif';c.textAlign='center';c.fillText('⬆ はじまりの森',gx,gy-5);c.restore();
  }
 }
 if(stage===5){
  const signs=[{x:505,y:150,name:'🏪 あなたのお店 Lv4',emphasis:true},{x:166,y:116,name:'⚒ ミナの鍛冶工房'},{x:204,y:342,name:'🏠 ミナの住居'}];
  c.save();c.textAlign='center';c.font='bold 11px sans-serif';
  for(const mark of signs){const x=mark.x-cam.x,y=mark.y-cam.y;
   if(x<-110||x>cv.width+110||y<0||y>cv.height)continue;
   const w=mark.emphasis?154:124,h=23;
   c.fillStyle=mark.emphasis?'rgba(37,76,41,.96)':'rgba(40,36,32,.87)';c.strokeStyle=mark.emphasis?'#ffdb87':'#d9cdb1';c.lineWidth=1.5;
   c.fillRect(x-w/2,y-34,w,h);c.strokeRect(x-w/2,y-34,w,h);
   c.fillStyle='#fff3d5';c.fillText(mark.name,x,y-18);
  }c.restore();
 }
 F.SHOP_VISITS?.drawTown(c,cam);F.RESIDENTS?.drawTown(c,cam,position,true);P.drawPlayer(c,players[facing],facing,position,cam);F.RESIDENTS?.drawTown(c,cam,position,false);};draw();
 cv.onclick=e=>{const b=cv.getBoundingClientRect(),p={x:(e.clientX-b.left)/b.width*cv.width+cam.x,y:(e.clientY-b.top)/b.height*cv.height};// Tap the northern path or the forest sign; route there first, then enter.
  // The future store is beside the existing stall. Tapping its marker or shop opens the site workflow.
  if(lv6Active()&&Math.abs(p.x-P.LV6_SITE.x)<54&&Math.abs(p.y-(P.LV6_SITE.y-20))<29){routeToLv6();return;}
  if(lv5Active()&&Math.abs(p.x-P.LV5_SITE.x)<56&&Math.abs(p.y-(P.LV5_SITE.y-20))<29){routeToLv5();return;}
  if(lv4Active()&&Math.abs(p.x-P.LV4_SITE.x)<56&&Math.abs(p.y-(P.LV4_SITE.y-19))<29){routeToLv4();return;}
  if(lv3Active()&&Math.abs(p.x-P.LV3_SITE.x)<54&&Math.abs(p.y-(P.LV3_SITE.y-17))<29){routeToLv3();return;}
  if(constructionActive()&&Math.abs(p.x-P.SHOP_BUILD_SITE.x)<58&&Math.abs(p.y-P.SHOP_BUILD_SITE.y)<38){routeToConstruction();return;}
  if(canEnterForest()&&P.isForestTap(p)) {
   const end=P.nearest(scene,P.FOREST_GATE,70);
   route=end?P.path(scene,position,end):[];
   if(!route.length){msg.textContent='森への道を確認できません。道の中央から進んでください。';return;}
   target={id:'beginner_forest',kind:'forest',name:'はじまりの森',door:end};
   msg.textContent='⬆ はじまりの森へ歩いて向かっています……';
   if(route.length<=1){target=null;route=[];actions.startDungeon?.();}
   return;
  }
  const npc=F.RESIDENTS?.hitTown(p);if(npc)F.RESIDENTS.pauseUntil=Date.now()+15000;target=npc?{id:'forge_mina',kind:'resident',name:'ミナ',door:{...F.RESIDENTS.actor.position}}:scene.objects.find(o=>p.x>=o.x&&p.x<=o.x+o.w&&p.y>=o.y&&p.y<=o.y+o.h);if(target?.kind==='decoration'){msg.textContent='道を選んでください。';return;}const end=target?target.door:(P.nearest(scene,p,18)||p);route=P.path(scene,position,end);if(npc)while(route.length>1&&Math.hypot(route[route.length-1].x-end.x,route[route.length-1].y-end.y)<28)route.pop();if(route.length===1&&target?.kind==='resident'){route=[];actions.resident?.();}if(route.length===1&&target&&target.kind==='building'){enter.textContent=target.name+'を利用する';const readyId=target.id;enter.onclick=()=>{if(actions.facility)actions.facility(readyId);else msg.textContent='この画面では外観と移動のみ利用できます。'};}msg.textContent=route.length?(target?.kind==='resident'?'ミナの近くへ移動中':target?target.name+'の入口へ移動中':'移動中'):'そこには進めません。道か施設の入口を選んでください。';};
 const completeRoute=()=>{if(target?.kind==='ownerHome'){route=[];target=null;actions.facility?.('owner_home');return true;}if(target?.kind==='lv6Site'){arriveAtLv6();return true;}if(target?.kind==='lv5Site'){arriveAtLv5();return true;}if(target?.kind==='lv4Site'){arriveAtLv4();return true;}if(target?.kind==='lv3Site'){arriveAtLv3();return true;}if(target?.kind==='construction'){arriveAtConstruction();return true;}if(target?.kind==='forest'){P.position={...position};target=null;msg.textContent='はじまりの森へ入ります。';actions.startDungeon?.();return true;}msg.textContent=target?.kind==='resident'?'鍛冶職人ミナの近くに着きました。':target?target.name+'の入口に到着しました。':'到着しました。';if(target?.kind==='resident')actions.resident?.();if(target?.kind==='residentRoom')actions.facility?.(target.id);if(target&&target.kind==='building'){enter.textContent=target.name+'を利用する';enter.onclick=()=>{if(actions.facility)actions.facility(target.id);else msg.textContent='この確認画面では外観と移動のみ利用できます。'};}return false;};
 const tick=now=>{if(token!==P.token||!cv.isConnected)return;F.RESIDENTS?.step(Date.now(),position);let budget=Math.min(.05,(now-last)/1000)*95;last=now;while(route.length&&budget>0){const q=route[0],dx=q.x-position.x,dy=q.y-position.y,d=Math.hypot(dx,dy);if(d<.01){route.shift();if(!route.length&&completeRoute())return;continue}facing=Math.abs(dx)>.01&&Math.abs(dy)>.01?(dy<0?(dx<0?4:5):(dx<0?6:7)):(Math.abs(dx)>Math.abs(dy)?(dx>0?3:2):(dy>0?0:1));const n=Math.min(d,budget);position.x+=dx/d*n;position.y+=dy/d*n;P.position={...position};budget-=n;if(n===d)route.shift();if(!route.length&&completeRoute())return;}draw();requestAnimationFrame(tick)};requestAnimationFrame(tick);
 }catch(e){if(token===P.token)msg.textContent=e.message;}
};
// Stage switching uses isolated test saves. Real mission requirements are unchanged.
if(F.OPENING){const O=F.OPENING,make=O.makePoint,sw=O.switchPoint;
 O.points.unshift(...P.stages.map((x,i)=>['town'+i,'町全体：'+x.name]));
 O.makePoint=id=>{if(!/^town[0-8]$/.test(id))return make(id);const n=Number(id.slice(4)),s=make(P.stages[n].point);s.story.opening.townPreviewStage=n;if(n===0)s.story.opening.phase='arrival';s.development.town.facilities.shop=P.stages[n].lv;
 Object.assign(s.development.town.facilities,{warehouse:n>=4?Math.min(2,n-3):0,forge:n>=5?Math.min(6,(n-4)*2):0,house:n>=5?Math.min(6,(n-4)*2):0,market:n>=6?(n===8?2:1):0,inn:n>=6?(n===8?6:1):0,adventure_board:n>=6?(n>=7?2:1):0,plaza:n>=6?(n>=7?2:1):0,bank:n>=7?1:0,owner_home:n>=8?1:0});s.shelves=Array([0,3,3,4,5,6,9][P.stages[n].lv]).fill(null);return s;};
 O.switchPoint=id=>{P.stop();P.position=null;sw(id)};
 const old=F.WILDERNESS.mount,stop=F.WILDERNESS.stop;F.WILDERNESS.stop=()=>{P.stop();stop()};F.WILDERNESS.mount=(...args)=>{const stage=P.stageFor(F.readSave());if(stage!==null)return P.mount(...args);return old(...args)};
}
})();
// Updated: 2026-10-25 JST / Ver1.63

// Updated: 2026-10-25 JST / Ver1.65

// Bundle updated: 2026-10-25 18:48 JST / Frontier Ver1.65

// Updated: 2026-10-25 19:47 JST / Ver1.66

// Updated: 2026-10-25 19:54 JST / Ver1.66

// Updated: 2026-10-25 20:51 JST / Ver1.68

// Updated: 2026-10-25 21:08 JST / Ver1.69

// Updated: 2026-10-26 JST / Ver1.70

// Updated: 2026-10-26 18:44 JST / Ver1.70

// Updated: 2026-11-02 19:25 JST / Ver1.119: walk into the northern forest entrance at every live town stage.

// Updated: 2026-11-02 19:58 JST / Ver1.120: construction site path, build/finish event trigger.

// Updated: 2026-11-02 20:30 JST / Ver1.121: prevent apparent teleport on town re-render, track player rather than NPC.

// Updated: 2026-11-02 21:50 JST / Ver1.124: Lv3 carpenter NPC, tap-to-walk, on-site dialogue and shop expansion.

// Updated: 2026-11-02 21:59 JST / Ver1.125: Lv4 construction point, route and progress marker on west road.

// Updated: 2026-11-03 03:50 JST / Ver1.126: east market / inn site pathing and interactive marker.

// Updated: 2026-11-03 03:53 JST / Ver1.126 release.

// Updated: 2026-11-03 03:53 JST / Ver1.126: subpixel route completion invokes arrival callback exactly once.

// Updated: 2026-11-03 03:55 JST / Ver1.126 release.

// Updated: 2026-11-03 JST / Ver1.127: final stage 8 maps to store Lv6, on-site event.
// Bundle updated: 2026-11-03 04:47 JST / Frenda Frontier Ver1.128.

// Updated: 2026-11-03 07:32 JST / Ver1.130: 1.5x near / 2x closer camera and full-town overview.

// Updated: 2026-11-03 09:05 JST / Ver1.132: preserve the discovered runestone in the same location after camp.

// Updated: 2026-11-03 10:45 JST / Ver1.138: expose active progress-town stage for follower reset after construction.

// Updated: 2026-11-03 17:14 JST / Ver1.142: 26px street shoulders, narrower forest/site tap targets, shop-first stage signs.
