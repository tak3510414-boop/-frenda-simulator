/* FRENDA_UI_VERSION: 1.2 / Updated: 2026-09-27 20:41 JST */
(()=>{
"use strict";
const VERSION="1.2";
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function formatRemain(ms,doneText="帰還できます"){
 if(ms<=0)return doneText;
 const s=Math.floor(ms/1000),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),ss=s%60;
 return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(ss).padStart(2,"0")}`;
}
function formatShortDateTime(ts){return new Date(ts).toLocaleString("ja-JP",{month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"})}
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
function createEyeCare({data,onTick,extraStorageKeys=[]}={}){
 if(!data)throw new Error("FRENDA_DATA is required");
 const KEY=data.KEYS.eyeTimer,PLAY_MS=30*60*1000,REST_MS=10*60*1000;
 let handle=null,locked=false,started=false;
 const read=()=>{const x=data.readJSON(KEY,null);return x&&typeof x==="object"?x:null};
 const write=x=>{try{data.writeJSON(KEY,x)}catch{}return x};
 const fresh=(now=Date.now())=>write({phase:"play",playUntil:now+PLAY_MS,updatedAt:now});
 function resolve(now=Date.now()){
  let x=read();
  if(!x||!Number.isFinite(Number(x.playUntil)))return fresh(now);
  if(x.phase==="rest"){
   const restUntil=Number(x.restUntil)||Number(x.playUntil)+REST_MS;
   if(now<restUntil){x.restUntil=restUntil;x.reason=x.reason||"auto";return x}
   return fresh(now);
  }
  const playUntil=Number(x.playUntil);
  if(now<playUntil)return x;
  const restUntil=playUntil+REST_MS;
  if(now<restUntil){x={phase:"rest",playUntil,restUntil,reason:"auto",updatedAt:now};write(x);return x}
  return fresh(now);
 }
 function fmt(ms){const s=Math.max(0,Math.ceil(ms/1000)),m=Math.floor(s/60),ss=s%60;return `${String(m).padStart(2,"0")}:${String(ss).padStart(2,"0")}`}
 function ensureOverlay(state){
  let ov=document.getElementById("eyeRestOverlay");
  if(!ov){ov=document.createElement("div");ov.id="eyeRestOverlay";ov.className="eyeRestOverlay";ov.innerHTML=`<div class="eyeRestPanel" role="status" aria-live="polite"><div class="eyeRestIcon">🌿👀</div><div class="eyeRestTitle">目を休めよう</div><div class="eyeRestText" id="eyeRestText"></div><div class="eyeRestCountdown" id="eyeRestCountdown">10:00</div><div class="eyeRestRule">10分休んだら → また30分遊べます</div></div>`;document.body.appendChild(ov)}
  const txt=ov.querySelector("#eyeRestText");
  if(txt)txt.innerHTML=state?.reason==="manual"?"自分から10分休憩を始めました。<br>休憩が終わるまでゲームは操作できません。":"30分遊びました。最低10分、画面から目を離して休憩してください。<br>休憩が終わるまでゲームは操作できません。";
  return ov;
 }
 function setLocked(rest,state){
  locked=rest;document.body.classList.toggle("eyeResting",rest);
  const main=document.querySelector("main"),buttons=document.querySelector(".headerBtns"),manual=document.getElementById("manualRestBtn");
  try{if(main)main.inert=rest;if(buttons)buttons.inert=rest;if(manual)manual.disabled=rest}catch{}
  if(rest)ensureOverlay(state);else document.getElementById("eyeRestOverlay")?.remove();
 }
 function startManualRest(){const now=Date.now(),x=resolve(now);if(x.phase==="rest")return;write({phase:"rest",playUntil:now,restUntil:now+REST_MS,reason:"manual",updatedAt:now});tick()}
 function tick(){
  const now=Date.now(),x=resolve(now),rest=x.phase==="rest",until=rest?Number(x.restUntil):Number(x.playUntil),remain=Math.max(0,until-now),badge=document.getElementById("eyeTimerBadge");
  if(badge){badge.className=`eyeTimerBadge ${rest?"rest":remain<=60000?"danger":remain<=300000?"warn":""}`;badge.textContent=rest?`🌿 休憩 ${fmt(remain)}`:`👁 あと ${fmt(remain)}`;badge.title="30分遊んだら10分休憩"}
  setLocked(rest,x);
  const count=document.getElementById("eyeRestCountdown");if(count)count.textContent=fmt(remain);
  if(typeof onTick==="function")onTick(now,x,remain);
 }
 function keydown(e){if(locked&&!document.getElementById("eyeRestOverlay")?.contains(e.target)){e.preventDefault();e.stopImmediatePropagation()}}
 function storage(e){if(e.key===KEY||extraStorageKeys.includes(e.key))tick()}
 function visibility(){if(document.visibilityState==="visible")tick()}
 function click(e){const b=e.target.closest?.("#manualRestBtn");if(b&&!locked)startManualRest()}
 function start(){
  if(started)return;started=true;
  document.addEventListener("keydown",keydown,true);window.addEventListener("storage",storage);document.addEventListener("visibilitychange",visibility);document.addEventListener("click",click);
  tick();handle=setInterval(tick,1000);
 }
 function stop(){if(handle)clearInterval(handle);handle=null;if(started){document.removeEventListener("keydown",keydown,true);window.removeEventListener("storage",storage);document.removeEventListener("visibilitychange",visibility);document.removeEventListener("click",click);started=false}}
 return Object.freeze({start,stop,tick,startManualRest,isLocked:()=>locked,resolve,format:fmt});
}

const VIEW_SIZES=Object.freeze(["large","medium","small"]);
function createPickFilter(defaults={}){return Object.assign({search:"",series:"all",type:"all",grade:"all",status:"all",sort:"standard"},defaults)}
function pickFilterSeries(records,compare){
 const out=[...new Set((records||[]).map(r=>String(r?.series||"").trim()).filter(Boolean))];
 return out.sort(typeof compare==="function"?compare:(a,b)=>String(a).localeCompare(String(b),"ja",{numeric:true}));
}
function pickFilterTypes(records,typeOrder=[]){
 const out=[...new Set((records||[]).flatMap(r=>[r?.type1,r?.type2]).filter(Boolean))];
 return out.sort((a,b)=>{const ai=typeOrder.indexOf(a),bi=typeOrder.indexOf(b);if(typeOrder.length&&(ai>=0||bi>=0))return (ai<0?999:ai)-(bi<0?999:bi)||String(a).localeCompare(String(b),"ja");return String(a).localeCompare(String(b),"ja")});
}
function pickFilterGrades(records){return [...new Set((records||[]).map(r=>Number(r?.grade)).filter(n=>Number.isFinite(n)&&n>0))].sort((a,b)=>a-b)}
function normalizePickFilter(filter,records,{statusOptions=[],sortOptions=[],seriesCompare=null,typeOrder=[],defaultSort="standard"}={}){
 const series=pickFilterSeries(records,seriesCompare),types=pickFilterTypes(records,typeOrder),grades=pickFilterGrades(records).map(String);
 if(filter.series!=="all"&&!series.includes(filter.series))filter.series="all";
 if(filter.type!=="all"&&!types.includes(filter.type))filter.type="all";
 if(filter.grade!=="all"&&!grades.includes(String(filter.grade)))filter.grade="all";
 if(statusOptions.length&&!statusOptions.some(([v])=>v===filter.status))filter.status="all";
 if(sortOptions.length&&!sortOptions.some(([v])=>v===filter.sort))filter.sort=defaultSort;
 return filter;
}
function applyPickFilter(records,filter,{statusPredicate=null,sorters={}}={}){
 let rows=(records||[]).map((r,i)=>({r,i})),q=String(filter?.search||"").trim().toLocaleLowerCase("ja");
 if(q)rows=rows.filter(({r})=>[r?.name_ja,r?.name_en,r?.pick_no,r?.series].some(v=>String(v||"").toLocaleLowerCase("ja").includes(q)));
 if(filter?.series!=="all")rows=rows.filter(({r})=>String(r?.series||"").trim()===filter.series);
 if(filter?.type!=="all")rows=rows.filter(({r})=>r?.type1===filter.type||r?.type2===filter.type);
 if(filter?.grade!=="all")rows=rows.filter(({r})=>Number(r?.grade)===Number(filter.grade));
 if(typeof statusPredicate==="function")rows=rows.filter(({r})=>statusPredicate(r,filter?.status));
 const builtins={
  standard:(a,b)=>a.i-b.i,
  number:(a,b)=>String(a.r?.pick_no||"").localeCompare(String(b.r?.pick_no||""),"ja",{numeric:true})||a.i-b.i,
  name:(a,b)=>String(a.r?.name_ja||"").localeCompare(String(b.r?.name_ja||""),"ja")||a.i-b.i,
  grade:(a,b)=>(Number(b.r?.grade)||0)-(Number(a.r?.grade)||0)||(Number(b.r?.poke_ene)||0)-(Number(a.r?.poke_ene)||0)||a.i-b.i,
  energy:(a,b)=>(Number(b.r?.poke_ene)||0)-(Number(a.r?.poke_ene)||0)||(Number(b.r?.grade)||0)-(Number(a.r?.grade)||0)||a.i-b.i
 };
 const cmp=sorters?.[filter?.sort]||builtins[filter?.sort]||builtins.standard;
 rows.sort(cmp);return rows.map(x=>x.r);
}
function pickFilterHTML({scope,filter,records,statusOptions,sortOptions,shownCount,seriesCompare=null,typeOrder=[],classes={},footerExtra="",searchPlaceholder="名前・番号で検索"}={}){
 const series=pickFilterSeries(records,seriesCompare),types=pickFilterTypes(records,typeOrder),grades=pickFilterGrades(records);
 const cls=Object.assign({wrap:"commonPickFilter",grid:"commonPickFilterGrid",foot:"commonPickFilterFoot",count:"commonPickFilterCount",reset:"commonPickFilterReset",search:"search"},classes||{});
 const opts=(items,value)=>items.map(([v,l])=>`<option value="${escapeHtml(v)}" ${String(value)===String(v)?"selected":""}>${escapeHtml(l)}</option>`).join("");
 return `<div class="${cls.wrap}"><div class="${cls.grid}">
  <label class="${cls.search}"><span>検索</span><input type="search" value="${escapeHtml(filter.search)}" placeholder="${escapeHtml(searchPlaceholder)}" data-ui-pick-filter="${escapeHtml(scope)}" data-ui-filter-key="search"></label>
  <label><span>弾</span><select data-ui-pick-filter="${escapeHtml(scope)}" data-ui-filter-key="series">${opts([["all","すべての弾"],...series.map(x=>[x,x])],filter.series)}</select></label>
  <label><span>タイプ</span><select data-ui-pick-filter="${escapeHtml(scope)}" data-ui-filter-key="type">${opts([["all","全タイプ"],...types.map(x=>[x,x])],filter.type)}</select></label>
  <label><span>★ランク</span><select data-ui-pick-filter="${escapeHtml(scope)}" data-ui-filter-key="grade">${opts([["all","全★"],...grades.map(x=>[String(x),`★${x}`])],filter.grade)}</select></label>
  <label><span>状態</span><select data-ui-pick-filter="${escapeHtml(scope)}" data-ui-filter-key="status">${opts(statusOptions||[],filter.status)}</select></label>
  <label><span>並び順</span><select data-ui-pick-filter="${escapeHtml(scope)}" data-ui-filter-key="sort">${opts(sortOptions||[],filter.sort)}</select></label>
 </div><div class="${cls.foot}"><span class="${cls.count}">表示 ${shownCount}/${(records||[]).length}</span>${footerExtra}<button type="button" class="${cls.reset}" data-ui-pick-filter-reset="${escapeHtml(scope)}">条件クリア</button></div></div>`;
}
function bindPickFilter({root=document,scope,filter,render,defaults={}}={}){
 root.querySelectorAll(`[data-ui-pick-filter="${scope}"]`).forEach(el=>{const key=el.dataset.uiFilterKey;if(el.tagName==="INPUT")el.oninput=e=>{filter[key]=e.target.value;const pos=e.target.selectionStart??filter[key].length;render();requestAnimationFrame(()=>{const n=root.querySelector(`[data-ui-pick-filter="${scope}"][data-ui-filter-key="${key}"]`);if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch{}}})};else el.onchange=e=>{filter[key]=e.target.value;render()}});
 const reset=root.querySelector(`[data-ui-pick-filter-reset="${scope}"]`);if(reset)reset.onclick=()=>{Object.assign(filter,createPickFilter(defaults));render()};
}
function loadViewSize(key,fallback="medium"){try{const v=localStorage.getItem(key);return VIEW_SIZES.includes(v)?v:fallback}catch{return fallback}}
function saveViewSize(key,size){try{if(VIEW_SIZES.includes(size))localStorage.setItem(key,size)}catch{}return size}
function viewSizeHTML({scope,current,wrapperClass="viewSizeControl",label="表示"}={}){return `<div class="${wrapperClass}"><span>${escapeHtml(label)}</span>${[["large","大"],["medium","中"],["small","小"]].map(([v,l])=>`<button type="button" class="${current===v?"active":""}" data-ui-view-scope="${escapeHtml(scope)}" data-ui-view-size="${v}" aria-pressed="${current===v?"true":"false"}">${l}</button>`).join("")}</div>`}
function bindViewSize({root=document,scope,key,onChange}={}){root.querySelectorAll(`[data-ui-view-scope="${scope}"]`).forEach(b=>b.onclick=()=>{const size=saveViewSize(key,b.dataset.uiViewSize);if(typeof onChange==="function")onChange(size)})}

function pickCardHTML({classes="",attributes={},badges="",image="",alt="",name="",body=""}={}){
 const cls=String(classes||"").trim(),attrs=Object.entries(attributes||{}).filter(([,v])=>v!==null&&typeof v!=="undefined"&&v!==false).map(([k,v])=>` ${escapeHtml(k)}="${escapeHtml(v===true?"":v)}"`).join("");
 return `<div class="pickCard${cls?` ${escapeHtml(cls)}`:""}"${attrs}>${badges||""}<img src="${escapeHtml(image)}" alt="${escapeHtml(alt)}"><b>${escapeHtml(name)}</b>${body||""}</div>`;
}
function toggleSelection(list,id,max=Infinity,{disabled=false}={}){
 const out=Array.isArray(list)?list.slice():[];
 if(disabled)return out;
 if(out.includes(id))return out.filter(x=>x!==id);
 if(out.length<Math.max(0,Number(max)||0))out.push(id);
 return out;
}
function removeSelection(list,id){return (Array.isArray(list)?list:[]).filter(x=>x!==id)}
function normalizeSelection(list,{max=Infinity,allowed=null}={}){
 const ok=typeof allowed==="function"?allowed:()=>true,out=[];
 for(const id of Array.isArray(list)?list:[]){if(!ok(id)||out.includes(id))continue;out.push(id);if(out.length>=max)break}
 return out;
}
const pickCard=Object.freeze({html:pickCardHTML});
const selection=Object.freeze({toggle:toggleSelection,remove:removeSelection,normalize:normalizeSelection});
const dialog=Object.freeze({confirm:message=>window.confirm(String(message)),alert:message=>window.alert(String(message))});

const pickFilter=Object.freeze({create:createPickFilter,series:pickFilterSeries,types:pickFilterTypes,grades:pickFilterGrades,normalize:normalizePickFilter,apply:applyPickFilter,html:pickFilterHTML,bind:bindPickFilter});
const viewSize=Object.freeze({SIZES:VIEW_SIZES,load:loadViewSize,save:saveViewSize,html:viewSizeHTML,bind:bindViewSize});

window.FRENDA_UI=Object.freeze({VERSION,escapeHtml,formatRemain,formatShortDateTime,sleep,createEyeCare,pickFilter,viewSize,pickCard,selection,dialog});
})();
