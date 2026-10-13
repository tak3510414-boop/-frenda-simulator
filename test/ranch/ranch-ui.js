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
 const host=$("environmentList");if(!host)return;const e=R.ai?.environment?.()||{phase:"-",weather:"-"};host.innerHTML="";for(const t of [`時間帯：${e.phase}`,`天気：${e.weather}`,"牧場の1日：約1時間"]){const d=document.createElement("span");d.className="relationChip";d.textContent=t;host.appendChild(d)}
 const p=$("pasture");if(p){p.dataset.phase=e.phase;p.dataset.weather=e.weather;if(e.phase==="夜")p.style.filter="brightness(.78) saturate(.92)";else if(e.phase==="夕方")p.style.filter="sepia(.12) brightness(.96)";else p.style.filter="none"}
}





function renderFacilitySpots(s){
 const layer=$("facilityLayer");if(!layer)return;const d=R.updateDevelopment?.(s)||s?.development||{};layer.innerHTML="";
 const spots={shade:["🌳","木陰"],pond:["💧","水辺"],play:["⚽","遊び場"],hut:["🏡","小屋"]};
 for(const f of (R.FACILITIES||[])){if(f.id==="meadow"||!(d.unlocked||[]).includes(f.id)||!spots[f.id])continue;const x=document.createElement("div");x.className="facilitySpot";x.dataset.facility=f.id;x.innerHTML=`<span class="ico">${spots[f.id][0]}</span><span>${spots[f.id][1]}</span>`;layer.appendChild(x)}
}

function renderDevelopment(s){
 const host=$("developmentList"),facHost=$("facilityList");if(!host||!facHost)return;const d=R.updateDevelopment?.(s)||s?.development||{points:0,level:1,unlocked:["meadow"]};
 const thresholds=[0,12,35,70,120],next=d.level<5?thresholds[d.level]:null;host.innerHTML="";for(const t of [`牧場Lv.${d.level}`,`発展P：${Math.floor(Number(d.points)||0)}`,next!=null?`次の施設まで：${Math.max(0,next-(Number(d.points)||0))}P`:"すべての施設が開放済み"]){const x=document.createElement("span");x.className="relationChip";x.textContent=t;host.appendChild(x)}
 facHost.innerHTML="";for(const f of (R.FACILITIES||[])){const unlocked=(d.unlocked||[]).includes(f.id),x=document.createElement("div");x.className="facilityCard"+(unlocked?"":" locked");x.innerHTML=`<b>${f.icon} ${f.name}</b><span>${unlocked?f.desc:`牧場Lv.${f.level}で開放`}</span>`;facHost.appendChild(x)}
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

async function render(){
 await Promise.resolve(window.RANCH_CLOUD_READY);
 if(!window.FRENDA_DATA||!window.FRENDA_MASTER){$("empty").textContent="共通データを読み込めませんでした。";$("saveState").textContent="NG";return}
 const ids=R.ownedIds(),s=await R.reconcile(ids);R.compactMemories?.(s);R.writeSave?.(s);const active=s.creatures.filter(c=>c.status==="resident"),shown=active.slice(0,R.MAX_INITIAL),byId=R.masterMap();
 $("ownedCount").textContent=ids.length;$("registryCount").textContent=s.creatures.length;$("residentCount").textContent=shown.length;$("saveState").textContent="OK";
 const p=$("pasture"),empty=$("empty");R.ai?.stop?.();p.querySelectorAll(".mon").forEach(x=>x.remove());empty.style.display=shown.length?"none":"grid";if(!shown.length)empty.textContent="本編の所持ピックがありません。";
 const aiItems=[];
 shown.forEach((c,i)=>{const m=byId.get(String(c.pickId));if(!m)return;const d=document.createElement("div");d.className="mon idle";d.dataset.ranchId=c.ranchId;const im=document.createElement("img");im.src=imageOf(m);im.alt=m.name_ja||"";const b=document.createElement("b");b.textContent=m.name_ja||c.pickId;d.append(im,b);p.appendChild(d);aiItems.push({id:c.ranchId,el:d,creature:c,record:m})});
 R.ai?.start?.(aiItems);
 renderIndividuals(s);renderProfiles(s);renderRelations(s);renderGroups(s);renderEvolutionAudit(s);wireRegressionTests();renderEnvironment();renderOffline(s);renderDevelopment(s);renderFacilitySpots(s);renderDiary(s);setInterval(renderEnvironment,15000);setInterval(()=>R.touchActive?.(),15000);
 const dd=window.FRENDA_DATA?.dungeon?.read?.();$("detail").textContent=`保存キー: ${R.saveKey()} ／ 本編参照: ${dd?.initialized?"Dungeon所持データ":"Simulator所持データ（フォールバック）"} ／ 進化履歴: ${s.evolutionHistory?.length||0} ／ 生活AI: ${R.ai?.enabled?"ON":"OFF"} ／ 交流: ON ／ 本編書込: なし`;
}
window.addEventListener("ranch:social-updated",()=>{const s=R.readSave?.();if(s){renderIndividuals(s);renderProfiles(s);renderRelations(s);renderGroups(s);renderEvolutionAudit(s);renderDevelopment(s);renderFacilitySpots(s);renderDiary(s)}});window.addEventListener("ranch:development-updated",()=>{const s=R.readSave?.();if(s){renderDevelopment(s);renderFacilitySpots(s);renderDiary(s)}});
window.addEventListener("DOMContentLoaded",render);window.addEventListener("pagehide",()=>R.touchActive?.());document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")R.touchActive?.()});
})();
// Updated: 2026-10-13 13:55 JST / Ver0.30 profile-memory album
