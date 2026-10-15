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
 const host=$("environmentList");if(!host)return;const e=R.ai?.environment?.()||{phase:"-",weather:"-"},scale=R.getTimeScale?.()||1,dayLabel=scale===10?"約6分":"約1時間";host.innerHTML="";for(const t of [`時間帯：${e.phase}`,`天気：${e.weather}`,`牧場時間：×${scale}`,`牧場の1日：${dayLabel}`]){const d=document.createElement("span");d.className="relationChip";d.textContent=t;host.appendChild(d)}
 const p=$("pasture");if(p){p.dataset.phase=e.phase;p.dataset.weather=e.weather;if(e.phase==="夜")p.style.filter="brightness(.78) saturate(.92)";else if(e.phase==="夕方")p.style.filter="sepia(.12) brightness(.96)";else p.style.filter="none"}
}





function renderFacilitySpots(s){
 const layer=$("facilityLayer");if(!layer)return;const d=R.updateDevelopment?.(s)||s?.development||{};layer.innerHTML="";
 const spots={shade:["🌳","木陰"],pond:["💧","水辺"],play:["⚽","遊び場"],hut:["🏡","おやすみ小屋"]};
 const pos={shade:[16.5,22],pond:[83.5,22],play:[16.5,81],hut:[83.5,80]};for(const f of (R.FACILITIES||[])){if(f.id==="meadow"||!(d.unlocked||[]).includes(f.id)||!spots[f.id])continue;const x=document.createElement("div");x.className="facilitySpot";x.dataset.facility=f.id;x.innerHTML=`<span class="ico">${spots[f.id][0]}</span><span>${spots[f.id][1]}</span>`;const q=pos[f.id];if(q){x.style.left=q[0]+"%";x.style.top=q[1]+"%";x.style.right="auto";x.style.bottom="auto";x.style.transform="translate(-50%,-50%)"}layer.appendChild(x)}
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
const GROWTH_LABELS=["","小さな花が咲きました","踏み石が増えました","低木が育ちました","柵が整いました","水辺に草が増えました","若木が育ちました","休憩スペースができました","遊び場がにぎやかになりました","小屋のまわりが華やぎました","牧場がすっかり育ちました"];
let growthStageRendered=-1;
function applyGrowthVisuals(d){
 const w=$("ranchWorld");if(!w)return;const points=Math.max(0,Number(d?.points)||0),ratio=Math.max(0,Math.min(1,points/120)),stage=Math.max(0,Math.min(10,Math.floor(points/12)));
 w.dataset.growthStage=String(stage);w.style.setProperty("--growth-ratio",String(ratio));
 const sky=$("starterSkyVeil"),ground=$("starterGroundVeil");if(sky)sky.style.opacity=String(.62*(1-ratio));if(ground)ground.style.opacity=String(.82*(1-ratio));
 w.querySelectorAll("[data-grow-step]").forEach(x=>x.classList.toggle("shown",Number(x.dataset.growStep)<=stage));
 if(growthStageRendered>=0&&stage>growthStageRendered){const toast=$("discoverToast");if(toast){toast.textContent=`🌱 ${GROWTH_LABELS[stage]||"牧場が育ちました"}`;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),2600)}}
 growthStageRendered=stage
}
const MAP_AREAS={
 meadow:{name:"ひろば",icon:"🌿",x:.50,y:.50},
 shade:{name:"木陰",icon:"🌳",x:.165,y:.22},
 pond:{name:"水辺",icon:"💧",x:.835,y:.22},
 play:{name:"遊び場",icon:"⚽",x:.165,y:.81},
 hut:{name:"小屋",icon:"🏡",x:.835,y:.80}
};
let mapRenderedLevel=0;
let mapScale=1,mapBound=false;
const MAP_SCALE_MIN=.045,MAP_SCALE_MAX=1.65;
function mapEls(){return{p:$("pasture"),w:$("ranchWorld"),stage:$("ranchStage")}}
function scaledSize(w){return{width:w.offsetWidth*mapScale,height:w.offsetHeight*mapScale}}
function syncMapStage(){
 const {w,stage}=mapEls();if(!w||!stage)return;
 const sw=Math.max(1,w.offsetWidth*mapScale),sh=Math.max(1,w.offsetHeight*mapScale);
 stage.style.width=`${sw}px`;stage.style.height=`${sh}px`;stage.style.minWidth=`${sw}px`;stage.style.minHeight=`${sh}px`;
}
function setFitMode(on){
 const {p}=mapEls();if(!p)return;
 p.classList.toggle("fit-mode",!!on);
}
let zoomRaf=0,pendingZoom=null;
function commitMapScale(scale,cx,cy){
 const {p,w,stage}=mapEls();if(!p||!w||!stage)return;
 // 手動ズーム時は固定ビューポートへ戻す。全体表示時だけ高さを内容に合わせる。
 setFitMode(false);p.style.height="";
 const old=mapScale,rect=p.getBoundingClientRect(),sr=stage.getBoundingClientRect();
 cx=cx??rect.left+p.clientWidth/2;cy=cy??rect.top+p.clientHeight/2;
 const wx=(cx-sr.left)/Math.max(.001,old),wy=(cy-sr.top)/Math.max(.001,old);
 mapScale=Math.max(MAP_SCALE_MIN,Math.min(MAP_SCALE_MAX,scale));
 w.style.transform=`translateZ(0) scale(${mapScale})`;
 syncMapStage();
 const sr2=stage.getBoundingClientRect();
 p.scrollLeft=Math.max(0,p.scrollLeft+(sr2.left+wx*mapScale-cx));
 p.scrollTop=Math.max(0,p.scrollTop+(sr2.top+wy*mapScale-cy));
 const z=$("zoomPct");if(z)z.textContent=Math.round(mapScale*100)+"%";
}
function applyMapScale(scale,cx,cy){
 pendingZoom={scale,cx,cy};
 if(zoomRaf)return;
 zoomRaf=requestAnimationFrame(()=>{zoomRaf=0;const q=pendingZoom;pendingZoom=null;if(q)commitMapScale(q.scale,q.cx,q.cy)});
}
function fitMap(){
 const {p,w,stage}=mapEls();if(!p||!w||!stage)return;
 // 「全体」は横幅に牧場全域を合わせ、表示枠の高さ自体も縮小後の牧場へ追従させる。
 // これにより transform だけ縮小した時に残っていた下側の大きな空白を作らない。
 setFitMode(true);
 const ww=w.offsetWidth||5400;
 const pad=12,availW=Math.max(1,p.clientWidth-pad*2);
 mapScale=Math.max(MAP_SCALE_MIN,Math.min(1,availW/ww));
 w.style.transform=`translateZ(0) scale(${mapScale})`;
 syncMapStage();
 p.scrollLeft=0;p.scrollTop=0;
 const z=$("zoomPct");if(z)z.textContent=Math.round(mapScale*100)+"%";
 requestAnimationFrame(()=>{p.scrollLeft=0;p.scrollTop=0;const hud=p.querySelector(".mapHud"),h=(hud?.offsetHeight||0)+stage.offsetHeight+20;p.style.height=`${Math.ceil(h)}px`;});
}
function focusMapArea(id,behavior="smooth"){
 const {p,w}=mapEls(),a=MAP_AREAS[id]||MAP_AREAS.meadow;if(!p||!w)return;
 const ww=w.offsetWidth*mapScale,wh=w.offsetHeight*mapScale;
 const left=Math.max(0,Math.min(Math.max(0,ww-p.clientWidth),ww*a.x-p.clientWidth/2));
 const top=Math.max(0,Math.min(Math.max(0,wh-p.clientHeight),wh*a.y-p.clientHeight/2));
 p.scrollTo({left,top,behavior});
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
 const unlocked=new Set(d.unlocked||["meadow"]),w=$("ranchWorld"),jump=$("mapJump");if(!w||!jump)return;
 const previous=mapRenderedLevel;w.dataset.mapLevel=String(lv);applyGrowthVisuals(d);
 document.querySelectorAll(".fogZone").forEach(z=>z.classList.toggle("revealed",unlocked.has(z.dataset.area)));
 jump.innerHTML="";
 for(const f of (R.FACILITIES||[])){if(!unlocked.has(f.id))continue;const b=document.createElement("button");b.type="button";b.dataset.mapTarget=f.id;b.textContent=`${f.icon}${f.name}`;b.onclick=()=>focusMapArea(f.id);jump.appendChild(b)}
 bindMapPan();syncMapStage();
 if(!previous){requestAnimationFrame(()=>{const p=$("pasture"),w=$("ranchWorld");if(!p||!w)return;const base=Math.min(1,Math.max(.42,p.clientWidth/(w.offsetWidth*.72)));applyMapScale(base);setTimeout(()=>focusMapArea("meadow","auto"),30)})}
 else if(lv>previous){
   const fac=(R.FACILITIES||[]).find(f=>f.level===lv);if(fac){setTimeout(()=>focusMapArea(fac.id),250);const toast=$("discoverToast");if(toast){toast.textContent=`✨ ${fac.name}を発見！`;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),2500)}}
 }
 mapRenderedLevel=lv;
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
 renderIndividuals(s);renderProfiles(s);renderRelations(s);renderGroups(s);renderEvolutionAudit(s);wireRegressionTests();wireTimeTestControls();renderEnvironment();renderOffline(s);renderDevelopment(s);renderFacilitySpots(s);renderMap(s);renderDiary(s);R.startLiveGrowthClock?.();setInterval(renderEnvironment,15000);setInterval(()=>R.touchActive?.(),15000);
 const dd=window.FRENDA_DATA?.dungeon?.read?.();$("detail").textContent=`保存キー: ${R.saveKey()} ／ 本編参照: ${dd?.initialized?"Dungeon所持データ":"Simulator所持データ（フォールバック）"} ／ 進化履歴: ${s.evolutionHistory?.length||0} ／ 生活AI: ${R.ai?.enabled?"ON":"OFF"} ／ 交流: ON ／ 本編書込: なし`;
}
window.addEventListener("ranch:time-scale-changed",()=>{renderTimeTestControls();renderEnvironment()});
window.addEventListener("ranch:social-updated",()=>{const s=R.readSave?.();if(s){renderIndividuals(s);renderProfiles(s);renderRelations(s);renderGroups(s);renderEvolutionAudit(s);renderDevelopment(s);renderFacilitySpots(s);renderDiary(s)}});window.addEventListener("ranch:development-updated",()=>{const s=R.readSave?.();if(s){renderDevelopment(s);renderFacilitySpots(s);renderMap(s);renderDiary(s)}});
window.addEventListener("DOMContentLoaded",render);window.addEventListener("pagehide",()=>R.touchActive?.());document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")R.touchActive?.()});
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
