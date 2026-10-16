// Frenda World Ver0.74 - World Generation 2 life AI
(()=>{"use strict";
const R=window.FRENDA_RANCH=window.FRENDA_RANCH||{},$=id=>document.getElementById(id);
function imageOf(x){return x?.official_image||""}


function renderGroups(s){
 const host=$("groupList");if(!host)return;const groups=(s?.social?.groups||[]).filter(g=>(g.members||[]).length>=3);
 if(!groups.length){host.textContent="まだグループはできていません。仲良くなると自然に集まります。";return}
 const names=new Map((s.creatures||[]).map(c=>[String(c.ranchId),R.pickName(c.pickId)||c.pickId]));host.innerHTML="";
 for(const g of groups){const d=document.createElement("div");d.className="groupCard";d.innerHTML=`<b>👥 ${g.name||"いつもの仲間"}</b><span>${(g.members||[]).map(id=>names.get(String(id))||"?").join("・")}</span>`;host.appendChild(d)}
}

function renderIndividuals(s){
 const host=$("individualList");if(!host)return;host.innerHTML="";
 for(const c of (s?.creatures||[]).filter(x=>x.status==="resident").slice(0,R.MAX_INITIAL)){const t=R.ai?.traits?.(c)||{},e=c.life?.experience||{},d=document.createElement("div");d.className="groupCard";const name=R.pickName(c.pickId)||c.pickId,label=R.ai?.personalityLabel?.(c)||"-";const tendency=t.social>.68?"交流好き":t.explore>.68?"探索好き":t.calm>.68?"のんびり":t.activity>.68?"活発":"マイペース";d.innerHTML=`<b>🐾 ${name}：${label}</b><span>${tendency} ／ 散歩 ${Math.floor(Number(e.walk)||0)}・交流 ${Math.floor(Number(e.social)||0)}・休憩 ${Math.floor(Number(e.rest)||0)}</span>`;host.appendChild(d)}
}

function renderProfiles(s){
 const host=$("profileList");if(!host)return;host.innerHTML="";
 const bonds=Object.values(s?.social?.bonds||{}).filter(Boolean);
 const names=new Map((s?.creatures||[]).map(c=>[String(c.ranchId),R.pickName(c.pickId)||c.pickId]));
 const byId=R.masterMap?.()||new Map();
 for(const c of (s?.creatures||[]).filter(x=>x.status==="resident").slice(0,R.MAX_INITIAL)){
  const card=document.createElement("div");card.className="profileCard";
  const m=byId.get(String(c.pickId))||{}, name=R.pickName(c.pickId)||c.pickId, label=R.ai?.personalityLabel?.(c)||"-", e=c.life?.experience||{};
  const mine=bonds.filter(b=>String(b.a)===String(c.ranchId)||String(b.b)===String(c.ranchId));
  const best=mine.slice().sort((a,b)=>(Number(b.score)||0)-(Number(a.score)||0))[0];
  const other=best?String(best.a)===String(c.ranchId)?best.b:best.a:null;
  const relation=best?`${names.get(String(other))||"?"}：${R.ai?.relationLabel?.(best)||R.ai?.bondRank?.(best.score)?.label||"顔見知り"}`:"まだ特別な仲間はいません";
  const allMem=(Array.isArray(c.memories)?c.memories:[]).slice().sort((a,b)=>String(b.at).localeCompare(String(a.at)));const important=allMem.filter(x=>x.important).slice(0,3),normal=allMem.filter(x=>!x.important).slice(0,Math.max(0,5-important.length));const mem=[...important,...normal];
  card.innerHTML=`<div class="profileHead">${m.official_image?`<img src="${m.official_image}" alt="">`:""}<div><b>🐾 ${name}</b><div class="profileMeta"><span class="profileChip">性格：${label}</span><span class="profileChip">牧場生活：${Number(c.life?.days||0).toFixed(2)}日</span><span class="profileChip">散歩 ${Math.floor(Number(e.walk)||0)}</span><span class="profileChip">交流 ${Math.floor(Number(e.social)||0)}</span><span class="profileChip">休憩 ${Math.floor(Number(e.rest)||0)}</span></div><div style="margin-top:7px;font-size:12px">🤝 ${relation}</div></div></div><div class="memoryList">${mem.length?mem.map(x=>{const dt=new Date(x.at),time=Number.isNaN(dt.getTime())?"":`${dt.getMonth()+1}/${dt.getDate()}`;return `<div class="memoryItem${x.important?" important":""}"><small>${time}</small><b>${x.important?"⭐ ":""}${x.title||"思い出"}</b><div>${x.text||""}</div></div>`}).join(""):'<div class="memoryItem">まだ思い出はありません。</div>'}</div>`;
  host.appendChild(card);
 }
}

function renderRelations(s){
 const host=$("relationList");if(!host)return;const bonds=Object.values(s?.social?.bonds||{}).filter(Boolean).sort((a,b)=>(Number(b.score)||0)-(Number(a.score)||0));
 if(!bonds.length){host.textContent="まだ交流記録はありません。";return}
 const names=new Map((s.creatures||[]).map(c=>[String(c.ranchId),R.pickName(c.pickId)||c.pickId]));host.innerHTML="";
 for(const b of bonds.slice(0,12)){const d=document.createElement("span");d.className="relationChip";const rank=R.ai?.bondRank?.(b.score)||{label:b.rankLabel||"顔見知り"},label=R.ai?.relationLabel?.(b)||rank.label;const extra=label==="ライバル"?`・意識 ${Number(b.rivalry)||0}`:(Number(b.quarrels)||0)>0?`・ケンカ ${Number(b.quarrels)||0}回`:"";d.textContent=`${names.get(String(b.a))||"?"} × ${names.get(String(b.b))||"?"}：${label} ${Number(b.score)||0}${extra}`;host.appendChild(d)}
}

function renderEvolutionAudit(s){const h=$("evolutionAuditList");if(!h)return;const a=R.evolutionAudit?.(s)||{};h.innerHTML="";for(const x of [`進化履歴：${a.evolutions||0}件`,`現役：${a.residents||0}・退牧：${a.departed||0}`,`個体ID重複：${a.duplicateRanchIds||0}`,`履歴整合：${a.historyIntegrity===false?"NG":"OK"}`]){const d=document.createElement("span");d.className="relationChip";d.textContent=x;h.appendChild(d)}}
function renderEnvironment(){
 const host=$("environmentList");if(!host)return;const e=R.ai?.environment?.()||{phase:"-",weather:"-"},scale=R.getTimeScale?.()||1,dayLabel=scale===10?"約6分":"約1時間";host.innerHTML="";for(const t of [`時間帯：${e.phase}`,`天気：${e.weather}`,`ワールド時間：×${scale}`,`ワールドの1日：${dayLabel}`]){const d=document.createElement("span");d.className="relationChip";d.textContent=t;host.appendChild(d)}
 const p=$("pasture");if(p){p.dataset.phase=e.phase;p.dataset.weather=e.weather;if(e.phase==="夜")p.style.filter="brightness(.78) saturate(.92)";else if(e.phase==="夕方")p.style.filter="sepia(.12) brightness(.96)";else p.style.filter="none"}
}





function renderFacilitySpots(s){
 const layer=$("facilityLayer");if(!layer)return;const d=R.updateDevelopment?.(s)||s?.development||{};layer.innerHTML="";
 const spots={shade:["🌳","木陰の森"],pond:["💧","水辺"],play:["⛏️","鉱山入口"],hut:["✨","世界の境界"]};
 const pos={shade:[28,39],pond:[74,46],play:[19,34],hut:[82,72]};for(const f of (R.FACILITIES||[])){if(f.id==="meadow"||!(d.unlocked||[]).includes(f.id)||!spots[f.id])continue;const x=document.createElement("div");x.className="facilitySpot";x.dataset.facility=f.id;x.innerHTML=`<span class="ico">${spots[f.id][0]}</span><span>${spots[f.id][1]}</span>`;const q=pos[f.id];if(q){x.style.left=q[0]+"%";x.style.top=q[1]+"%";x.style.right="auto";x.style.bottom="auto";x.style.transform="translate(-50%,-50%)"}layer.appendChild(x)}
}

function renderDevelopment(s){
 const host=$("developmentList"),facHost=$("facilityList");if(!host||!facHost)return;const d=R.updateDevelopment?.(s)||s?.development||{points:0,level:1,unlocked:["meadow"]};
 const thresholds=[0,12,35,70,120],next=d.level<5?thresholds[d.level]:null,growth=Math.max(0,Math.min(10,Math.floor((Number(d.points)||0)/12)));host.innerHTML="";for(const t of [`牧場Lv.${d.level}`,`発展P：${Math.floor(Number(d.points)||0)}`,`景観成長：${growth}/10`,next!=null?`次の発見まで：${Math.max(0,Math.ceil(next-(Number(d.points)||0)))}P`:"すべての施設が開放済み"]){const x=document.createElement("span");x.className="relationChip";x.textContent=t;host.appendChild(x)}
 facHost.innerHTML="";for(const f of (R.FACILITIES||[])){const unlocked=(d.unlocked||[]).includes(f.id),x=document.createElement("div");x.className="facilityCard"+(unlocked?"":" locked");x.innerHTML=`<b>${f.icon} ${f.name}</b><span>${unlocked?f.desc:`牧場Lv.${f.level}で発見`}</span>`;facHost.appendChild(x)}
}

function renderDiary(s){
 const host=$("diaryList");if(!host)return;const diary=(s?.diary||[]).slice().sort((a,b)=>String(b.at).localeCompare(String(a.at))).slice(0,12);
 if(!diary.length){host.innerHTML='<div class="diaryEmpty">まだ日記はありません。ポケモンたちの生活を見守ってみましょう。</div>';return}
 host.innerHTML="";for(const e of diary){const d=document.createElement("div");d.className="diaryEntry"+(e.important?" important":"");const dt=new Date(e.at);const time=Number.isNaN(dt.getTime())?"":`${dt.getMonth()+1}/${dt.getDate()} ${String(dt.getHours()).padStart(2,"0")}:${String(dt.getMinutes()).padStart(2,"0")}`;d.innerHTML=`<div class="diaryHead"><b>${e.important?"⭐ ":""}${e.title||"牧場のできごと"}</b><small>${time}</small></div><div>${e.text||""}</div>`;host.appendChild(d)}
}

function renderOffline(s){
 const box=$("offlineBox"),host=$("offlineList");if(!box||!host)return;const o=s?.offlineSummary;if(!o||Number(o.elapsedMinutes)<2){box.style.display="none";return}box.style.display="block";const m=Number(o.elapsedMinutes)||0;const label=m>=60?`${Math.floor(m/60)}時間${m%60?`${m%60}分`:""}`:`${m}分`;host.innerHTML="";for(const t of [`留守：約${label}`,`牧場時間：${Number(o.ranchDays||0).toFixed(2)}日`,`散歩 ${o.activity?.walk||0}・休憩 ${o.activity?.rest||0}・交流 ${o.activity?.social||0}`]){const d=document.createElement("span");d.className="relationChip";d.textContent=t;host.appendChild(d)}
}


function wireRegressionTests(){
 const out=$("regressionResult"),e=$("testEvolutionBtn"),r=$("testReacquireBtn");if(!out)return;
 if(e)e.onclick=()=>{const x=R.runEvolutionRegression?.();out.textContent=`進化テスト：${x?.ok?"PASS":"FAIL"} ／ ${x?.detail||""}`};
 if(r)r.onclick=()=>{const x=R.runReacquireRegression?.();out.textContent=`再入手テスト：${x?.ok?"PASS":"FAIL"} ／ ${x?.detail||""}`};
}


function renderTimeTestControls(){
 const scale=R.getTimeScale?.()||1,b1=$("timeScale1"),b10=$("timeScale10"),restore=$("growthTestRestore");
 if(b1)b1.classList.toggle("active",scale===1);if(b10)b10.classList.toggle("active",scale===10);if(restore)restore.disabled=!R.hasGrowthBackup?.()
}
function wireTimeTestControls(){
 const b1=$("timeScale1"),b10=$("timeScale10"),start=$("growthTestStart"),restore=$("growthTestRestore");
 if(b1&&!b1.dataset.bound){b1.dataset.bound="1";b1.onclick=()=>{R.setTimeScale?.(1);renderTimeTestControls();renderEnvironment()}}
 if(b10&&!b10.dataset.bound){b10.dataset.bound="1";b10.onclick=()=>{R.setTimeScale?.(10);renderTimeTestControls();renderEnvironment()}}
 if(start&&!start.dataset.bound){start.dataset.bound="1";start.onclick=()=>{if(R.beginGrowthTest?.())location.reload()}}
 if(restore&&!restore.dataset.bound){restore.dataset.bound="1";restore.onclick=()=>{if(R.restoreGrowthTest?.())location.reload()}}
 renderTimeTestControls()
}
const GROWTH_LABELS=[];
let growthStageRendered=-1;
function applyGrowthVisuals(d){
 const w=$("ranchWorld");if(!w)return;
 const points=Math.max(0,Number(d?.points)||0);
 w.dataset.growthStage=String(Math.max(0,Math.min(10,Math.floor(points/12))));
}
const MAP_AREAS={
 meadow:{name:"はじまり",icon:"🌿",x:.50,y:.52,level:1},
 shade:{name:"木陰の森",icon:"🌳",x:.28,y:.39,level:2},
 pond:{name:"水辺",icon:"💧",x:.74,y:.46,level:3},
 play:{name:"鉱山",icon:"⛏️",x:.19,y:.34,level:4},
 hut:{name:"世界の境界",icon:"✨",x:.82,y:.72,level:5}
};
const WORLD_BOUNDS={
 1:{x:1950,y:900,w:1500,h:900},
 2:{x:900,y:500,w:3000,h:1500},
 3:{x:650,y:350,w:4100,h:1900},
 4:{x:300,y:150,w:4800,h:2300},
 5:{x:0,y:0,w:5400,h:2700}
};
let mapRenderedLevel=0;
let mapScale=1,mapBound=false;
const MAP_SCALE_MIN=.045,MAP_SCALE_MAX=1.65;
function mapEls(){return{p:$("pasture"),w:$("ranchWorld"),stage:$("ranchStage")}}
function currentWorldBounds(){
 const {w}=mapEls(),lv=Math.max(1,Math.min(5,Number(w?.dataset?.mapLevel)||mapRenderedLevel||1));
 return WORLD_BOUNDS[lv]||WORLD_BOUNDS[1]
}
function syncMapStage(){
 const {w,stage}=mapEls();if(!w||!stage)return;
 const b=currentWorldBounds(),sw=Math.max(1,b.w*mapScale),sh=Math.max(1,b.h*mapScale);
 // CSS変数 + important で、旧バージョンの固定5400x2700指定を確実に上書きする。
 stage.style.setProperty("--stage-w",`${sw}px`);
 stage.style.setProperty("--stage-h",`${sh}px`);
 stage.style.setProperty("width",`${sw}px`,"important");
 stage.style.setProperty("height",`${sh}px`,"important");
 stage.style.setProperty("min-width","0px","important");
 stage.style.setProperty("min-height","0px","important");
 w.style.transform=`translate3d(${-b.x*mapScale}px,${-b.y*mapScale}px,0) scale(${mapScale})`;
}
function setFitMode(on){
 const {p}=mapEls();if(!p)return;
 p.classList.toggle("fit-mode",!!on)
}
function screenToWorld(cx,cy){
 const {p,stage}=mapEls(),b=currentWorldBounds();if(!p||!stage)return{x:b.x+b.w/2,y:b.y+b.h/2};
 const sr=stage.getBoundingClientRect();
 return{x:b.x+(cx-sr.left)/Math.max(.001,mapScale),y:b.y+(cy-sr.top)/Math.max(.001,mapScale)}
}
let zoomRaf=0,pendingZoom=null;
function commitMapScale(scale,cx,cy){
 const {p,stage}=mapEls();if(!p||!stage)return;
 const pr=p.getBoundingClientRect(),px=cx??(pr.left+p.clientWidth/2),py=cy??(pr.top+p.clientHeight/2),worldPt=screenToWorld(px,py),b=currentWorldBounds();
 setFitMode(false);
 p.style.removeProperty("--fit-height");
 p.style.removeProperty("height");p.style.removeProperty("max-height");p.style.removeProperty("min-height");
 mapScale=Math.max(MAP_SCALE_MIN,Math.min(MAP_SCALE_MAX,scale));
 syncMapStage();
 requestAnimationFrame(()=>{
   const lx=(worldPt.x-b.x)*mapScale,ly=(worldPt.y-b.y)*mapScale;
   p.scrollLeft=Math.max(0,stage.offsetLeft+lx-(px-pr.left));
   p.scrollTop=Math.max(0,stage.offsetTop+ly-(py-pr.top));
 });
 const z=$("zoomPct");if(z)z.textContent=Math.round(mapScale*100)+"%"
}
function applyMapScale(scale,cx,cy){
 pendingZoom={scale,cx,cy};
 if(zoomRaf)return;
 zoomRaf=requestAnimationFrame(()=>{zoomRaf=0;const q=pendingZoom;pendingZoom=null;if(q)commitMapScale(q.scale,q.cx,q.cy)})
}
function fitMap(){
 const {p,stage,w}=mapEls();if(!p||!stage)return;
 if(w)delete w.dataset.activeArea;
 const b=currentWorldBounds(),pad=12,availW=Math.max(1,p.clientWidth-pad*2);
 setFitMode(true);
 p.style.removeProperty("height");p.style.removeProperty("max-height");p.style.removeProperty("min-height");
 mapScale=Math.max(MAP_SCALE_MIN,Math.min(1,availW/b.w));
 syncMapStage();
 p.scrollLeft=0;p.scrollTop=0;
 const z=$("zoomPct");if(z)z.textContent=Math.round(mapScale*100)+"%";
 requestAnimationFrame(()=>{
   p.scrollLeft=0;p.scrollTop=0;
   const hud=p.querySelector(".mapHud"),hudH=Math.ceil(hud?.getBoundingClientRect().height||0);
   const stageH=Math.ceil(b.h*mapScale);
   const fitH=Math.max(1,hudH+stageH+26);
   p.style.setProperty("--fit-height",`${fitH}px`);
   p.style.setProperty("height",`${fitH}px`,"important");
   p.style.setProperty("min-height","0px","important");
   p.style.setProperty("max-height",`${fitH}px`,"important");
 });
}
function focusMapArea(id,behavior="smooth"){
 const {p,stage,w}=mapEls(),a=MAP_AREAS[id]||MAP_AREAS.meadow,b=currentWorldBounds();if(!p||!stage)return;
 if(w)w.dataset.activeArea=id;
 const worldX=5400*a.x,worldY=2700*a.y;
 const targetScale=Math.max(mapScale,Math.min(.72,p.clientWidth/1100));
 if(targetScale>mapScale*1.12){commitMapScale(targetScale,p.getBoundingClientRect().left+p.clientWidth/2,p.getBoundingClientRect().top+p.clientHeight/2)}
 setFitMode(false);
 p.style.removeProperty("--fit-height");
 p.style.removeProperty("height");p.style.removeProperty("max-height");p.style.removeProperty("min-height");
 const lx=(worldX-b.x)*mapScale,ly=(worldY-b.y)*mapScale;
 const left=Math.max(0,Math.min(Math.max(0,stage.scrollWidth-p.clientWidth),stage.offsetLeft+lx-p.clientWidth/2));
 const top=Math.max(0,Math.min(Math.max(0,stage.scrollHeight-p.clientHeight),stage.offsetTop+ly-p.clientHeight/2));
 p.scrollTo({left,top,behavior})
}
function bindMapPan(){
 if(mapBound)return;mapBound=true;const {p}=mapEls();if(!p)return;
 let pts=new Map(),drag=null,pinch=null;
 const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),mid=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
 p.addEventListener("pointerdown",e=>{p.classList.add("gesture-active");
   if(e.target.closest("button"))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});p.setPointerCapture?.(e.pointerId);
   if(pts.size===1){drag={id:e.pointerId,x:e.clientX,y:e.clientY,sl:p.scrollLeft,st:p.scrollTop};p.classList.add("dragging")}
   if(pts.size===2){const a=[...pts.values()],m=mid(a[0],a[1]);pinch={d:dist(a[0],a[1]),scale:mapScale,cx:m.x,cy:m.y};drag=null}
 });
 let moveRaf=0,lastMove=null;
 p.addEventListener("pointermove",e=>{
   if(!pts.has(e.pointerId))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});lastMove=e;
   if(moveRaf)return;
   moveRaf=requestAnimationFrame(()=>{moveRaf=0;const ev=lastMove;if(!ev)return;
     if(pts.size>=2&&pinch){const a=[...pts.values()],d=dist(a[0],a[1]),m=mid(a[0],a[1]);applyMapScale(pinch.scale*(d/pinch.d),m.x,m.y);return}
     if(drag&&drag.id===ev.pointerId){p.scrollLeft=drag.sl-(ev.clientX-drag.x);p.scrollTop=drag.st-(ev.clientY-drag.y)}
   });
 });
 const up=e=>{pts.delete(e.pointerId);if(pts.size<2)pinch=null;if(!pts.size){drag=null;p.classList.remove("dragging");p.classList.remove("gesture-active")}else{const [a]=pts.entries();drag={id:a[0],x:a[1].x,y:a[1].y,sl:p.scrollLeft,st:p.scrollTop}}};
 p.addEventListener("pointerup",up);p.addEventListener("pointercancel",up);
 p.addEventListener("wheel",e=>{if(!e.ctrlKey)return;e.preventDefault();applyMapScale(mapScale*(e.deltaY<0?1.12:.89),e.clientX,e.clientY)},{passive:false});
 $("zoomIn")?.addEventListener("click",()=>applyMapScale(mapScale*1.2));
 $("zoomOut")?.addEventListener("click",()=>applyMapScale(mapScale/1.2));
 $("zoomFit")?.addEventListener("click",fitMap);
}
function renderMap(s){
 const d=R.updateDevelopment?.(s)||s?.development||{level:1,unlocked:["meadow"]},lv=Math.max(1,Math.min(5,Number(d.level)||1));
 const w=$("ranchWorld"),jump=$("mapJump");if(!w||!jump)return;
 const previous=mapRenderedLevel;
 w.dataset.mapLevel=String(lv);
 applyGrowthVisuals(d);
 jump.innerHTML="";
 for(const [id,a] of Object.entries(MAP_AREAS)){
   if(a.level>lv)continue;
   const btn=document.createElement("button");btn.type="button";btn.dataset.mapTarget=id;btn.textContent=`${a.icon}${a.name}`;btn.onclick=()=>focusMapArea(id);jump.appendChild(btn)
 }
 mapRenderedLevel=lv;
 bindMapPan();
 syncMapStage();
 if(!previous){
   requestAnimationFrame(()=>fitMap())
 }else if(lv>previous){
   requestAnimationFrame(()=>fitMap());
   const a=Object.values(MAP_AREAS).find(x=>x.level===lv),toast=$("discoverToast");
   if(a&&toast){toast.textContent=`✨ ${a.name}への道がひらけた！`;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),2600)}
 }
}

async function render(){
 await Promise.resolve(window.RANCH_CLOUD_READY);
 if(!window.FRENDA_DATA||!window.FRENDA_MASTER){$("empty").textContent="共通データを読み込めませんでした。";$("saveState").textContent="NG";return}
 const ids=R.ownedIds(),s=await R.reconcile(ids);R.compactMemories?.(s);R.writeSave?.(s);const active=s.creatures.filter(c=>c.status==="resident"),shown=active.slice(0,R.MAX_INITIAL),byId=R.masterMap();
 $("ownedCount").textContent=ids.length;$("registryCount").textContent=s.creatures.length;$("residentCount").textContent=shown.length;$("saveState").textContent="OK";
 const p=$("pasture"),world=$("ranchWorld")||p,empty=$("empty");R.ai?.stop?.();world.querySelectorAll(".mon").forEach(x=>x.remove());empty.style.display=shown.length?"none":"grid";if(!shown.length)empty.textContent="本編の所持ピックがありません。";
 const aiItems=[];
 shown.forEach((c,i)=>{const m=byId.get(String(c.pickId));if(!m)return;const d=document.createElement("div");d.className="mon idle";d.dataset.ranchId=c.ranchId;const im=document.createElement("img");im.src=imageOf(m);im.alt=m.name_ja||"";const b=document.createElement("b");b.textContent=m.name_ja||c.pickId;d.append(im,b);world.appendChild(d);aiItems.push({id:c.ranchId,el:d,creature:c,record:m})});
 R.ai?.start?.(aiItems);
 renderIndividuals(s);renderProfiles(s);renderRelations(s);renderGroups(s);renderEvolutionAudit(s);wireRegressionTests();wireTimeTestControls();renderEnvironment();renderOffline(s);renderDevelopment(s);renderFacilitySpots(s);renderMap(s);renderDiary(s);renderWorldDiscovery(s);worldDiscoveryCeremony(s);R.startLiveGrowthClock?.();setInterval(renderEnvironment,15000);setInterval(()=>R.touchActive?.(),15000);
 const dd=window.FRENDA_DATA?.dungeon?.read?.();$("detail").textContent=`保存キー: ${R.saveKey()} ／ 本編参照: ${dd?.initialized?"Dungeon所持データ":"Simulator所持データ（フォールバック）"} ／ 進化履歴: ${s.evolutionHistory?.length||0} ／ 生活AI: ${R.ai?.enabled?"ON":"OFF"} ／ 交流: ON ／ 本編書込: なし`;
}
window.addEventListener("ranch:time-scale-changed",()=>{renderTimeTestControls();renderEnvironment()});
window.addEventListener("ranch:social-updated",()=>{const s=R.readSave?.();if(s){renderIndividuals(s);renderProfiles(s);renderRelations(s);renderGroups(s);renderEvolutionAudit(s);renderDevelopment(s);renderFacilitySpots(s);renderDiary(s)}});window.addEventListener("ranch:development-updated",()=>{const s=R.readSave?.();if(s){renderDevelopment(s);renderFacilitySpots(s);renderMap(s);renderDiary(s)}});
window.addEventListener("DOMContentLoaded",render);window.addEventListener("pagehide",()=>R.touchActive?.());document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")R.touchActive?.()});

function renderWorldDiscovery(s){const box=document.getElementById("discoveryCards"),lead=document.getElementById("discoveryLead");if(!box)return;const lv=Math.max(1,Number(s?.development?.level)||1),steps=R.DISCOVERY_STEPS||[];box.innerHTML=steps.map(x=>`<div class="discoveryCard ${x.level>lv?"locked":x.level===lv&&lv>1?"new":""}">${x.level<=lv?x.name:"🔒 未知の場所"}<br><small>${x.level<=lv?x.hint:"ポケモンが見つけるまで分かりません。"}</small></div>`).join("");const cur=steps.filter(x=>x.level<=lv).slice(-1)[0];if(lead&&cur)lead.textContent=lv===1?"ポケモンたちが牧場の外を気にしています。どこへ行くのでしょう？":`${cur.name}まで世界が広がりました。`}

function worldDiscoveryCeremony(s){
 const lv=Math.max(1,Number(s?.development?.level)||1),cue=document.getElementById("discoveryCue"),key="frendaWorldShownLevel";
 let prev=Math.max(1,Number(localStorage.getItem(key)||1));
 if(lv<prev){localStorage.setItem(key,String(lv));prev=lv}
 if(lv<=prev||!cue)return;
 const ev=R.DISCOVERY_EVENTS?.[lv];
 const c=(s?.creatures||[]).find(x=>x?.status==="resident"),rec=c?R.masterMap?.().get(String(c.pickId)):null,who=rec?.name_ja||"ポケモン";
 if(!ev){localStorage.setItem(key,String(lv));return}
 cue.textContent=`${who}${ev.pre}`;cue.classList.add("show");
 setTimeout(()=>{cue.textContent=`${who}${ev.wait}`},1400);
 setTimeout(()=>{cue.textContent="！"},3000);
 setTimeout(()=>{cue.textContent=ev.found},3650);
 setTimeout(()=>{cue.classList.remove("show");localStorage.setItem(key,String(lv));fitMap()},5900)
}
})();
// Updated: 2026-10-13 13:55 JST / Ver0.30 profile-memory album

function bindRegressionButtons034(){
 const out=document.getElementById("regressionResult"),e=document.getElementById("testEvolutionBtn"),r=document.getElementById("testReacquireBtn");
 if(e&&!e.dataset.b34){e.dataset.b34="1";e.onclick=()=>{const x=R.runEvolutionRegression?.();if(out)out.textContent=`進化テスト：${x?.ok?"PASS":"FAIL"} ／ ${x?.detail||""}`}}
 if(r&&!r.dataset.b34){r.dataset.b34="1";r.onclick=()=>{const x=R.runReacquireRegression?.();if(out)out.textContent=`再入手テスト：${x?.ok?"PASS":"FAIL"} ／ ${x?.detail||""}`}}
}
document.addEventListener("DOMContentLoaded",bindRegressionButtons034);
setTimeout(bindRegressionButtons034,500);
setTimeout(bindRegressionButtons034,1500);
