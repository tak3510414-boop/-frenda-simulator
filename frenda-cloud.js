/* FRENDA_CLOUD_VERSION: 1.2 / production profile-aware cloud for Dungeon/Expedition; legacy simulator sync retained */
(()=>{
"use strict";
if(!window.FRENDA_USER?.active)return;
const CLOUD_VERSION="1.2";
const SUPABASE_URL="https://rzacvrioutgsaimobins.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_H9HFETl_RY8B3Wgr_vYV0Q_a-JPngR4";
const TABLE="frenda_saves";
let client=null,session=null,cfg=null,authUnsub=null,button=null,modal=null,storageUnsub=null,syncTimer=null,userBadge=null,observer=null;
let statusText="未ログイン（ローカル）",syncing=false,lastUploaded="";
function escapeHTML(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function safeJSON(v){try{return JSON.stringify(v??null)}catch{return ""}}
function userApi(){return window.FRENDA_USER}
function cloudMode(){return !!session&&userApi()?.mode==="cloud"&&userApi()?.cloudUserId===session?.user?.id}
function columnName(){return cfg?.column||"simulator_data"}
function setStatus(text,kind=""){
 statusText=text;if(button){button.textContent=session?`☁️ ${text}`:`👤 ${text}`;button.dataset.kind=kind}const s=modal?.querySelector("#frendaCloudStatus");if(s)s.textContent=text;updateUserBadge();
}
function injectStyles(){
 if(document.getElementById("frendaCloudProfileStyles"))return;
 const st=document.createElement("style");st.id="frendaCloudProfileStyles";st.textContent=`
 .frendaCloudBtn{display:none!important}.frendaActiveUserBadge{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:4px!important;box-sizing:border-box!important;max-width:190px!important;min-height:28px!important;padding:5px 9px!important;border-radius:999px!important;border:1px solid #a9c9d9!important;background:#eef9ff!important;color:#16475f!important;font-size:10px!important;font-weight:1000!important;line-height:1!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;cursor:pointer!important;box-shadow:none!important;flex:0 1 auto!important}.frendaActiveUserBadge[data-mode="cloud"]{background:#e6f6ff!important;color:#075a7a!important;border-color:#8fd4ef!important}.frendaActiveUserBadge[data-mode="local"]{background:#f2f4f6!important;color:#40515e!important;border-color:#c7d0d6!important}.frendaActiveUserBadge .frendaActiveUserText{display:block!important;min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}@media(max-width:700px){.frendaActiveUserBadge{max-width:132px!important;min-height:25px!important;padding:4px 7px!important;font-size:8.5px!important}}
 .frendaCloudOverlay{position:fixed;inset:0;z-index:3000;background:#0008;display:flex;align-items:center;justify-content:center;padding:16px}.frendaCloudPanel{width:min(440px,100%);max-height:92dvh;overflow:auto;background:#fff;color:#17202a;border-radius:18px;padding:16px;box-shadow:0 20px 70px #0007;font-family:-apple-system,BlinkMacSystemFont,"Hiragino Sans","Yu Gothic",sans-serif}.frendaCloudHead{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}.frendaCloudHead b{font-size:18px}.frendaCloudClose{background:#edf2f7!important;color:#243747!important;padding:8px 10px!important}.frendaCloudPanel label{display:block;font-size:12px;font-weight:800;margin:9px 0 4px}.frendaCloudPanel input{width:100%;padding:11px;border:1px solid #c8d2d9;border-radius:10px;font:inherit;background:#fff;color:#17202a}.frendaCloudActions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.frendaCloudActions button{width:100%;padding:10px!important;border-radius:10px!important}.frendaCloudActions .wide{grid-column:1/-1}.frendaCloudPrimary{background:#1769e0!important;color:#fff!important}.frendaCloudSecondary{background:#edf2f7!important;color:#243747!important}.frendaCloudDanger{background:#a33!important;color:#fff!important}.frendaCloudInfo{font-size:12px;line-height:1.55;color:#64737e;background:#eef9ff;border:1px solid #b9ddeb;border-radius:10px;padding:10px;margin-top:10px}.frendaCloudUser{font-size:13px;font-weight:800;word-break:break-all;margin:6px 0}.frendaCloudStatus{margin-top:9px;font-size:12px;font-weight:800;color:#31566d;min-height:1.4em}.frendaLocalTitle{font-size:12px;font-weight:900;margin-top:10px;color:#40515e}.frendaLocalProfiles{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0 4px}.frendaLocalProfileItem{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:5px;min-width:0}.frendaLocalProfileItem [data-local-profile]{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:10px!important;border-radius:10px!important;background:#f2f4f6!important;color:#31424f!important;border:1px solid #c7d0d6!important;font-weight:900!important}.frendaLocalProfileItem [data-local-profile].active{background:#dff3ff!important;color:#075a7a!important;border-color:#69bde4!important}.frendaLocalProfileRename,.frendaLocalProfileDelete{width:38px!important;padding:8px 6px!important;border-radius:10px!important;font-weight:900!important}.frendaLocalProfileRename{background:#fff7df!important;color:#6a5100!important;border:1px solid #e4cf85!important}.frendaLocalProfileDelete{background:#fff0f0!important;color:#9b1c1c!important;border:1px solid #efb2b2!important}.frendaLocalProfileDelete:disabled{opacity:.45!important;cursor:not-allowed!important}.frendaLocalAdd{display:grid;grid-template-columns:1fr auto;gap:8px;margin-top:9px}.frendaLocalAdd button{padding:9px 12px!important;border-radius:10px!important;background:#166534!important;color:#fff!important;font-weight:900!important;white-space:nowrap!important}`;
 document.head.appendChild(st)
}
function localProfileId(){return userApi()?.localProfileId||"A"}
function localProfileName(){return userApi()?.localProfileName||"ローカルA"}
function localProfiles(){const list=userApi()?.localProfiles;return Array.isArray(list)&&list.length?list:[{id:"A",name:"ローカルA"},{id:"B",name:"ローカルB"}]}
function activeUserLabel(){const email=session?.user?.email||"";if(email)return {mode:"cloud",icon:"☁️",text:email,title:`クラウドユーザー：${email}`};const name=localProfileName();return {mode:"local",icon:"👤",text:name,title:`ローカルユーザー：${name}`}}
function userBadgeTarget(){if(document.getElementById("headerMainTitle"))return document.querySelector(".careCluster")||document.querySelector(".headerTop")||document.querySelector("header");return document.getElementById("expSharedStatus074")||document.querySelector(".headerTop")||document.querySelector("header")}
function ensureUserBadge(){injectStyles();const target=userBadgeTarget();if(!target)return null;let el=document.getElementById("frendaActiveUserBadge");if(!el){el=document.createElement("button");el.type="button";el.id="frendaActiveUserBadge";el.className="frendaActiveUserBadge";el.innerHTML='<span class="frendaActiveUserIcon"></span><span class="frendaActiveUserText"></span>';el.onclick=openModal}if(el.parentElement!==target){target.insertBefore(el,target.firstChild)}userBadge=el;updateUserBadge();return el}
function updateUserBadge(){const el=userBadge||document.getElementById("frendaActiveUserBadge");if(!el)return;const info=activeUserLabel();el.dataset.mode=info.mode;el.title=info.title;el.setAttribute("aria-label",info.title);const icon=el.querySelector(".frendaActiveUserIcon"),text=el.querySelector(".frendaActiveUserText");if(icon)icon.textContent=info.icon;if(text)text.textContent=info.text}
function watchBadge(){ensureUserBadge();if(observer)return;observer=new MutationObserver(()=>ensureUserBadge());observer.observe(document.documentElement,{childList:true,subtree:true})}
function injectButton(){if(button)return;injectStyles();watchBadge();button=document.createElement("button");button.type="button";button.className="frendaCloudBtn";button.textContent="👤 ローカル";button.onclick=openModal;(document.querySelector(".headerBtns")||document.querySelector("header")||document.body).appendChild(button)}
function closeModal(){modal?.remove();modal=null}
function switchLocalProfile(profile){profile=String(profile||"").trim().toUpperCase();if(session){setStatus("クラウドユーザー中はログアウトしてから切り替えてください。","error");return false}const info=localProfiles().find(x=>String(x.id).toUpperCase()===profile);if(!info)return false;if(profile===localProfileId())return true;if(!confirm(`${info.name}に切り替えますか？`))return false;if(!userApi()?.switchLocalProfile?.(profile)){setStatus("ローカルユーザー切替に失敗しました。","error");return false}closeModal();location.reload();return true}
function createLocalProfile(name){if(session)return false;name=String(name||"").trim().replace(/\s+/g," ");if(!name){setStatus("ローカルユーザー名を入力してください。","error");return false}if(name.length>20){setStatus("名前は20文字以内にしてください。","error");return false}if(localProfiles().some(x=>x.name===name)){setStatus("同じ名前のローカルユーザーがあります。","error");return false}if(!confirm(`「${name}」を追加しますか？`))return false;const created=userApi()?.createLocalProfile?.(name);if(!created){setStatus("ローカルユーザーを追加できませんでした。","error");return false}closeModal();location.reload();return true}
function renameLocalProfile(profile){if(session)return false;profile=String(profile||"").trim().toUpperCase();const info=localProfiles().find(x=>String(x.id).toUpperCase()===profile);if(!info)return false;const entered=prompt(`「${info.name}」の新しい名前を入力してください（20文字以内）`,info.name);if(entered===null)return false;const newName=String(entered||"").trim().replace(/\s+/g," ");if(!newName||newName.length>20){setStatus("名前は1～20文字で入力してください。","error");return false}if(localProfiles().some(x=>String(x.id).toUpperCase()!==profile&&x.name===newName)){setStatus("同じ名前のローカルユーザーがあります。","error");return false}if(newName===info.name)return true;if(!confirm(`「${info.name}」を「${newName}」に変更しますか？\n\nセーブデータはそのままです。`))return false;if(!userApi()?.renameLocalProfile?.(profile,newName)){setStatus("名前を変更できませんでした。","error");return false}closeModal();location.reload();return true}
function deleteLocalProfile(profile){if(session||cloudMode())return false;profile=String(profile||"").trim().toUpperCase();const list=localProfiles(),info=list.find(x=>String(x.id).toUpperCase()===profile);if(!info)return false;if(list.length<=1){setStatus("ローカルユーザーは最低1人必要です。","error");return false}if(localProfileId()===profile){setStatus("現在使用中のローカルユーザーは削除できません。","error");return false}if(!confirm(`「${info.name}」を削除しますか？\n\nこのユーザーのセーブデータも削除されます。`))return false;if(!confirm(`最終確認です。\n\n「${info.name}」とセーブデータを完全に削除します。\nこの操作は元に戻せません。\n\n本当に削除しますか？`))return false;if(!userApi()?.deleteLocalProfile?.(profile)){setStatus("ローカルユーザーを削除できませんでした。","error");return false}closeModal();location.reload();return true}
function openModal(){
 closeModal();modal=document.createElement("div");modal.className="frendaCloudOverlay";const email=session?.user?.email||"";
 modal.innerHTML=session?`<div class="frendaCloudPanel" role="dialog" aria-modal="true"><div class="frendaCloudHead"><b>☁️ クラウドユーザー</b><button type="button" class="frendaCloudClose">閉じる</button></div><div class="frendaCloudUser">${escapeHTML(email)}</div><div class="frendaCloudInfo">このユーザーのゲームデータはSupabaseだけに保存します。ローカルユーザーとは同期しません。<br><small>Cloud v${CLOUD_VERSION}</small></div><div id="frendaCloudStatus" class="frendaCloudStatus">${escapeHTML(statusText)}</div><div class="frendaCloudActions"><button type="button" id="frendaCloudPush" class="frendaCloudPrimary">今すぐ保存</button><button type="button" id="frendaCloudPull" class="frendaCloudSecondary">クラウドから再読込</button><button type="button" id="frendaCloudLogout" class="frendaCloudDanger wide">ログアウト</button></div></div>`:`<div class="frendaCloudPanel" role="dialog" aria-modal="true"><div class="frendaCloudHead"><b>👤 ユーザー切替</b><button type="button" class="frendaCloudClose">閉じる</button></div><div class="frendaCloudInfo"><b>現在：${escapeHTML(localProfileName())}</b><br>ローカルユーザーは端末内だけに保存します。クラウドユーザーとは同期しません。<br><small>User v${escapeHTML(userApi()?.version||"-")} / Cloud v${CLOUD_VERSION}</small></div><div class="frendaLocalTitle">ローカルユーザー</div><div class="frendaLocalProfiles">${localProfiles().map(p=>{const active=localProfileId()===p.id,del=active||localProfiles().length<=1;return `<div class="frendaLocalProfileItem"><button type="button" data-local-profile="${escapeHTML(p.id)}" class="${active?'active':''}">👤 ${escapeHTML(p.name)}</button><button type="button" class="frendaLocalProfileRename" data-local-rename="${escapeHTML(p.id)}" title="名前を変更">✏️</button><button type="button" class="frendaLocalProfileDelete" data-local-delete="${escapeHTML(p.id)}" ${del?'disabled':''} title="${active?'使用中のユーザーは削除できません':'削除'}">🗑️</button></div>`}).join("")}</div><div class="frendaLocalAdd"><input id="frendaLocalNewName" type="text" maxlength="20" placeholder="新しいユーザー名"><button type="button" id="frendaLocalAddBtn">＋ 追加</button></div><div class="frendaLocalTitle">クラウドユーザーへログイン</div><label>メールアドレス</label><input id="frendaCloudEmail" type="email" autocomplete="username"><label>パスワード</label><input id="frendaCloudPassword" type="password" autocomplete="current-password"><div id="frendaCloudStatus" class="frendaCloudStatus">${escapeHTML(statusText)}</div><div class="frendaCloudActions"><button type="button" id="frendaCloudLogin" class="frendaCloudPrimary wide">ログイン</button></div></div>`;
 document.body.appendChild(modal);modal.addEventListener("click",e=>{if(e.target===modal)closeModal()});modal.querySelector(".frendaCloudClose").onclick=closeModal;
 if(session){modal.querySelector("#frendaCloudPush").onclick=()=>pushNow(true);modal.querySelector("#frendaCloudPull").onclick=()=>pullNow(true);modal.querySelector("#frendaCloudLogout").onclick=logout}
 else{modal.querySelectorAll("[data-local-profile]").forEach(el=>el.onclick=()=>switchLocalProfile(el.dataset.localProfile));modal.querySelectorAll("[data-local-rename]").forEach(el=>el.onclick=()=>renameLocalProfile(el.dataset.localRename));modal.querySelectorAll("[data-local-delete]").forEach(el=>el.onclick=()=>deleteLocalProfile(el.dataset.localDelete));const add=modal.querySelector("#frendaLocalAddBtn"),inp=modal.querySelector("#frendaLocalNewName");if(add)add.onclick=()=>createLocalProfile(inp?.value||"");if(inp)inp.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();createLocalProfile(inp.value)}};modal.querySelector("#frendaCloudLogin").onclick=async()=>{const email=modal.querySelector("#frendaCloudEmail").value.trim(),password=modal.querySelector("#frendaCloudPassword").value;if(!email||!password){setStatus("メールアドレスとパスワードを入力してください。","error");return}await login(email,password)}}
}
async function rowForUser(){if(!session)return {data:null,error:new Error("not signed in")};return await client.from(TABLE).select(`user_id,${columnName()},updated_at`).eq("user_id",session.user.id).maybeSingle()}
function cachePayload(payload,{dirty=false}={}){try{userApi()?.writeCloudCache?.(payload,session?.user?.id);if(dirty)userApi()?.markCloudDirty?.(session?.user?.id)}catch(e){console.warn("FRENDA_USER_CACHE_WRITE",e)}}
function activatePayload(payload){userApi()?.activateCloud?.(session.user.id,payload??null,{dirty:false})}
function subscribeStorage(){storageUnsub?.();storageUnsub=null;const s=userApi()?.storage;if(!s?.subscribe)return;storageUnsub=s.subscribe(ev=>{if(!cloudMode()||syncing)return;if(ev.type==="clear"||(ev.key&&cfg?.watchStorage?.(String(ev.key))))scheduleSync()})}
async function login(email,password){if(!client)return;setStatus("ログイン中…");const {data,error}=await client.auth.signInWithPassword({email,password});if(error){setStatus("ログイン失敗："+error.message,"error");return}session=data.session||null;if(!session){setStatus("ログインセッションを取得できません。","error");return}setStatus("クラウドセーブ確認中…");const {data:row,error:rowError}=await rowForUser();if(rowError){setStatus("クラウドセーブ確認失敗："+rowError.message,"error");return}activatePayload(row?.[columnName()]??null);closeModal();location.reload()}
async function logout(){if(!client)return;if(syncTimer){clearTimeout(syncTimer);syncTimer=null}if(cloudMode())await pushNow(true);await client.auth.signOut();session=null;storageUnsub?.();storageUnsub=null;userApi()?.deactivateCloud?.();setStatus("未ログイン（ローカル）");closeModal();location.reload()}
function scheduleSync(){if(!cloudMode())return false;if(syncTimer)clearTimeout(syncTimer);const current=cfg?.getData?.();if(current)cachePayload(current,{dirty:true});syncTimer=setTimeout(()=>{syncTimer=null;pushNow(false)},700);setStatus("クラウド保存待ち…");return true}
async function pushNow(force=false){if(!cloudMode()||syncing||!cfg?.getData)return false;syncing=true;setStatus("クラウド保存中…");try{const payload=cfg.getData(),str=safeJSON(payload);cachePayload(payload,{dirty:true});if(!force&&str&&str===lastUploaded&&!userApi()?.cloudDirty?.(session.user.id)){setStatus("クラウド保存済み");return true}const row={user_id:session.user.id,[columnName()]:payload,updated_at:new Date().toISOString()};const {error}=await client.from(TABLE).upsert(row,{onConflict:"user_id"});if(error)throw error;lastUploaded=str;userApi()?.writeCloudCache?.(payload,session.user.id);userApi()?.clearCloudDirty?.(session.user.id);setStatus("クラウド保存済み");return true}catch(e){console.error("FrendaCloud profile push",e);setStatus("クラウド保存エラー","error");return false}finally{syncing=false}}
async function pullNow(){if(!session||syncing)return false;syncing=true;setStatus("クラウド読込中…");try{const {data,error}=await rowForUser();if(error)throw error;const payload=data?.[columnName()]??null;if(!payload){setStatus("クラウドセーブはまだありません");return false}activatePayload(payload);lastUploaded=safeJSON(payload);setStatus("クラウドから読み込みました");closeModal();location.reload();return true}catch(e){console.error("FrendaCloud profile pull",e);setStatus("クラウド読込エラー","error");return false}finally{syncing=false}}
async function initializeCloudSession(){
 if(!session){const wasCloud=userApi()?.mode==="cloud";userApi()?.deactivateCloud?.();setStatus("未ログイン（ローカル）");if(wasCloud){location.reload();return}return}
 const uid=session.user.id;
 if(userApi()?.mode!=="cloud"||userApi()?.cloudUserId!==uid){const {data,error}=await rowForUser();if(error){setStatus("クラウドセーブ確認失敗","error");return}activatePayload(data?.[columnName()]??null);location.reload();return}
 const {data,error}=await rowForUser();if(error){setStatus("クラウド読込エラー","error");return}
 const remote=data?.[columnName()]??null,current=cfg?.getData?.()??null,cached=userApi()?.readCloudCache?.(uid)??null;
 if(userApi()?.cloudDirty?.(uid)){await pushNow(true);subscribeStorage();setStatus("クラウド保存済み");return}
 if(remote){const remoteStr=safeJSON(remote),currentStr=safeJSON(current),cachedStr=safeJSON(cached);if(remoteStr!==cachedStr){activatePayload(remote);lastUploaded=remoteStr;location.reload();return}if(currentStr!==remoteStr){await pushNow(true)}else{lastUploaded=remoteStr;cachePayload(remote)}}
 else{await pushNow(true)}
 subscribeStorage();setStatus("クラウド保存済み")
}
async function init(options){cfg=options||{};injectButton();if(!window.supabase?.createClient){setStatus("クラウド未接続","error");return}client=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});if(authUnsub){try{authUnsub.unsubscribe()}catch{}}const {data,error}=await client.auth.getSession();if(error){setStatus("認証確認エラー","error");return}session=data.session||null;ensureUserBadge();updateUserBadge();const listener=client.auth.onAuthStateChange((_event,newSession)=>{session=newSession||null;updateUserBadge()});authUnsub=listener?.data?.subscription||null;await initializeCloudSession()}
window.FrendaCloud={version:CLOUD_VERSION,profileMode:true,cloudOnly:true,localCloudSync:false,init,scheduleSync,pushNow,pullNow,isLoggedIn:()=>!!session,getUser:()=>session?.user||null,open:openModal};
})();

/* Legacy simulator cloud path: used only when FRENDA_USER is not active. */
if(!window.FRENDA_USER?.active){
(()=>{
"use strict";

const CLOUD_VERSION="1.2";
const SUPABASE_URL="https://rzacvrioutgsaimobins.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_H9HFETl_RY8B3Wgr_vYV0Q_a-JPngR4";
const TABLE="frenda_saves";

let client=null;
let session=null;
let cfg=null;
let syncTimer=null;
let syncing=false;
let applying=false;
let lastUploaded="";
let authUnsub=null;
let button=null;
let modal=null;
let statusText="未ログイン";
let storagePatched=false;
let initialized=false;

const META_KEYS=new Set(["format_version","simulator_version","dungeon_version","appVersion","saveVersion","exported_at","master_version"]);
function comparableValue(v){
  if(Array.isArray(v))return v.map(comparableValue);
  if(v&&typeof v==="object"){
    const o={};
    for(const k of Object.keys(v).sort()){
      if(META_KEYS.has(k))continue;
      o[k]=comparableValue(v[k]);
    }
    return o;
  }
  return v;
}
function safeJSON(v){try{return JSON.stringify(comparableValue(v))}catch{return ""}}
function hashString(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16)}
function reloadGuardKey(){return `frendaCloudReloadGuard:${cfg?.app||"app"}:${session?.user?.id||"anon"}`}
function clearReloadGuard(){try{sessionStorage.removeItem(reloadGuardKey())}catch{}}
function setReloadGuard(sig){try{sessionStorage.setItem(reloadGuardKey(),sig)}catch{}}
function getReloadGuard(){try{return sessionStorage.getItem(reloadGuardKey())||""}catch{return ""}}

function setStatus(text,kind=""){
  statusText=text;
  if(button){
    const prefix=kind==="error"?"⚠️":"☁️";
    button.textContent=`${prefix} ${text}`;
    button.dataset.kind=kind;
  }
  const s=modal?.querySelector("#frendaCloudStatus");
  if(s)s.textContent=text;
}
function injectStyles(){
  if(document.getElementById("frendaCloudStyles"))return;
  const st=document.createElement("style");st.id="frendaCloudStyles";st.textContent=`
  .frendaCloudBtn{background:#eaf4ff!important;color:#17384d!important;border:1px solid #b9d7eb!important;border-radius:999px!important;padding:7px 10px!important;font-size:11px!important;font-weight:900!important;white-space:nowrap!important;box-shadow:none!important}
  .frendaCloudBtn[data-kind="error"]{background:#fff0f0!important;color:#9a2e2e!important;border-color:#e9b8b8!important}
  .frendaCloudBtn[data-kind="syncing"]{background:#fff8dd!important;color:#6f5700!important;border-color:#e5d48a!important}
  .frendaCloudOverlay{position:fixed;inset:0;z-index:3000;background:#0008;display:flex;align-items:center;justify-content:center;padding:16px}
  .frendaCloudPanel{width:min(430px,100%);background:#fff;color:#17202a;border-radius:18px;padding:16px;box-shadow:0 20px 70px #0007;font-family:-apple-system,BlinkMacSystemFont,"Hiragino Sans","Yu Gothic",sans-serif}
  .frendaCloudHead{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}.frendaCloudHead b{font-size:18px}.frendaCloudClose{background:#edf2f7!important;color:#243747!important;padding:8px 10px!important}
  .frendaCloudPanel label{display:block;font-size:12px;font-weight:800;margin:9px 0 4px}.frendaCloudPanel input{width:100%;padding:11px;border:1px solid #c8d2d9;border-radius:10px;font:inherit;background:#fff;color:#17202a}
  .frendaCloudActions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.frendaCloudActions button{width:100%;padding:10px!important;border-radius:10px!important}.frendaCloudActions .wide{grid-column:1/-1}.frendaCloudPrimary{background:#1769e0!important;color:#fff!important}.frendaCloudSecondary{background:#edf2f7!important;color:#243747!important}.frendaCloudDanger{background:#a33!important;color:#fff!important}
  .frendaCloudInfo{font-size:12px;line-height:1.55;color:#64737e;background:#f4f7f9;border-radius:10px;padding:10px;margin-top:10px}.frendaCloudUser{font-size:13px;font-weight:800;word-break:break-all;margin:6px 0}.frendaCloudStatus{margin-top:9px;font-size:12px;font-weight:800;color:#31566d;min-height:1.4em}
  `;document.head.appendChild(st)
}
function injectButton(){
  if(button)return;
  injectStyles();
  button=document.createElement("button");button.type="button";button.className="frendaCloudBtn";button.textContent="☁️ 未ログイン";button.onclick=openModal;
  const host=document.querySelector(".headerBtns")||document.querySelector("header")||document.body;
  host.appendChild(button);
}
function closeModal(){modal?.remove();modal=null}
function openModal(){
  closeModal();
  modal=document.createElement("div");modal.className="frendaCloudOverlay";
  const email=session?.user?.email||"";
  modal.innerHTML=session?`
    <div class="frendaCloudPanel" role="dialog" aria-modal="true">
      <div class="frendaCloudHead"><b>☁️ クラウド同期</b><button type="button" class="frendaCloudClose">閉じる</button></div>
      <div class="frendaCloudUser">${escapeHTML(email)}</div>
      <div class="frendaCloudInfo">${escapeHTML(cfg?.label||"アプリ")}のデータをSupabaseと同期します。通常は端末内へ即保存し、少し後にクラウドへ自動保存します。<br><small>Cloud v${CLOUD_VERSION}</small></div>
      <div id="frendaCloudStatus" class="frendaCloudStatus">${escapeHTML(statusText)}</div>
      <div class="frendaCloudActions">
        <button type="button" id="frendaCloudPush" class="frendaCloudPrimary">この端末を保存</button>
        <button type="button" id="frendaCloudPull" class="frendaCloudSecondary">クラウドから読込</button>
        <button type="button" id="frendaCloudLogout" class="frendaCloudDanger wide">ログアウト</button>
      </div>
    </div>`:`
    <div class="frendaCloudPanel" role="dialog" aria-modal="true">
      <div class="frendaCloudHead"><b>☁️ クラウド同期</b><button type="button" class="frendaCloudClose">閉じる</button></div>
      <div class="frendaCloudInfo">同じアカウントでログインすると、スマホ・PC間で${escapeHTML(cfg?.label||"アプリ")}のデータを引き継げます。<br><small>Cloud v${CLOUD_VERSION}</small></div>
      <label>メールアドレス</label><input id="frendaCloudEmail" type="email" autocomplete="username">
      <label>パスワード</label><input id="frendaCloudPassword" type="password" autocomplete="current-password">
      <div id="frendaCloudStatus" class="frendaCloudStatus">未ログイン</div>
      <div class="frendaCloudActions"><button type="button" id="frendaCloudLogin" class="frendaCloudPrimary wide">ログイン</button></div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener("click",e=>{if(e.target===modal)closeModal()});
  modal.querySelector(".frendaCloudClose").onclick=closeModal;
  if(session){
    modal.querySelector("#frendaCloudPush").onclick=()=>pushNow(true);
    modal.querySelector("#frendaCloudPull").onclick=()=>pullNow(true);
    modal.querySelector("#frendaCloudLogout").onclick=logout;
  }else{
    modal.querySelector("#frendaCloudLogin").onclick=async()=>{
      const email=modal.querySelector("#frendaCloudEmail").value.trim(),password=modal.querySelector("#frendaCloudPassword").value;
      if(!email||!password){setStatus("メールアドレスとパスワードを入力してください。","error");return}
      await login(email,password);
    };
  }
}
function escapeHTML(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function columnName(){return cfg?.column||"simulator_data"}
function patchStorage(){
  if(storagePatched)return;storagePatched=true;
  const p=Storage.prototype,origSet=p.setItem,origRemove=p.removeItem,origClear=p.clear;
  p.setItem=function(k,v){origSet.call(this,k,v);if(this===localStorage&&!applying&&cfg?.watchStorage?.(String(k)))scheduleSync()};
  p.removeItem=function(k){origRemove.call(this,k);if(this===localStorage&&!applying&&cfg?.watchStorage?.(String(k)))scheduleSync()};
  p.clear=function(){origClear.call(this);if(this===localStorage&&!applying)scheduleSync()};
}
async function login(email,password){
  if(!client)return;
  setStatus("ログイン中…","syncing");
  const {data,error}=await client.auth.signInWithPassword({email,password});
  if(error){setStatus("ログイン失敗："+error.message,"error");return}
  session=data.session;setStatus("ログインしました","syncing");closeModal();await pullOrSeed();
}
async function logout(){
  if(!client)return;clearReloadGuard();await client.auth.signOut();session=null;lastUploaded="";setStatus("未ログイン");closeModal()
}
async function rowForUser(){
  if(!session)return {data:null,error:new Error("not signed in")};
  return await client.from(TABLE).select(`user_id,${columnName()},updated_at`).eq("user_id",session.user.id).maybeSingle();
}
async function uploadLocal(local,localStr){
  const payload={user_id:session.user.id,[columnName()]:local,updated_at:new Date().toISOString()};
  const {error}=await client.from(TABLE).upsert(payload,{onConflict:"user_id"});if(error)throw error;
  lastUploaded=localStr;clearReloadGuard();setStatus("同期済み");
}
async function pullOrSeed(){
  if(!session||syncing)return;
  syncing=true;setStatus("同期確認中…","syncing");
  try{
    const {data,error}=await rowForUser();if(error)throw error;
    const local=cfg.getData(),localStr=safeJSON(local);
    if(!data){await uploadLocal(local,localStr);return}
    const cloud=data[columnName()];
    if(cloud===null||typeof cloud==="undefined"){await uploadLocal(local,localStr);return}
    const cloudStr=safeJSON(cloud);
    if(cloudStr!==localStr){
      const sig=hashString(cloudStr);
      if(getReloadGuard()===sig){
        // 同じクラウド内容を直前の再読み込みで適用済み。アプリ側の移行・並び替えで差分が残った場合は、
        // 再読み込みを繰り返さず、現在の端末データをクラウドへ戻して収束させる。
        await uploadLocal(local,localStr);return;
      }
      setReloadGuard(sig);
      applying=true;
      try{await cfg.applyData(cloud)}finally{applying=false}
      lastUploaded=cloudStr;setStatus("クラウドから読み込みました");
      setTimeout(()=>location.reload(),180);
      return;
    }
    lastUploaded=cloudStr;clearReloadGuard();setStatus("同期済み");
  }catch(e){console.error("FrendaCloud pull/seed",e);setStatus("同期エラー","error")}
  finally{syncing=false}
}
async function pullNow(force=false){
  if(!session||syncing)return;syncing=true;setStatus("クラウド読込中…","syncing");
  try{
    const {data,error}=await rowForUser();if(error)throw error;
    const cloud=data?.[columnName()];
    if(cloud===null||typeof cloud==="undefined"){setStatus("クラウドにデータがありません","error");return}
    const cloudStr=safeJSON(cloud),localStr=safeJSON(cfg.getData());
    if(cloudStr===localStr){lastUploaded=cloudStr;clearReloadGuard();setStatus("同期済み");return}
    setReloadGuard(hashString(cloudStr));
    applying=true;try{await cfg.applyData(cloud)}finally{applying=false}
    lastUploaded=cloudStr;setStatus("クラウドから読み込みました");closeModal();setTimeout(()=>location.reload(),180)
  }catch(e){console.error("FrendaCloud pull",e);setStatus("読込エラー","error")}
  finally{syncing=false}
}
async function pushNow(showResult=false){
  if(!session||syncing||applying)return;
  const local=cfg.getData(),s=safeJSON(local);if(!s)return;
  if(!showResult&&s===lastUploaded)return;
  syncing=true;setStatus("クラウド保存中…","syncing");
  try{await uploadLocal(local,s)}
  catch(e){console.error("FrendaCloud push",e);setStatus("保存エラー","error")}
  finally{syncing=false}
}
function scheduleSync(delay=1400){
  if(!session||applying)return;clearTimeout(syncTimer);syncTimer=setTimeout(()=>pushNow(false),delay)
}
async function init(options){
  cfg=options||{};injectButton();patchStorage();
  if(!window.supabase?.createClient){setStatus("クラウド未接続","error");return}
  client=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
  if(authUnsub){try{authUnsub.unsubscribe()}catch{}}
  const {data,error}=await client.auth.getSession();if(error){setStatus("認証確認エラー","error");return}
  session=data.session||null;
  const listener=client.auth.onAuthStateChange((event,newSession)=>{
    const oldUserId=session?.user?.id||null,newUserId=newSession?.user?.id||null;
    session=newSession||null;
    if(!session){lastUploaded="";clearReloadGuard();setStatus("未ログイン");return}
    // TOKEN_REFRESHED / INITIAL_SESSION / タブ復帰などでは再読込しない。
    // 新規ログイン・ユーザー切替時だけ同期確認する。
    if(initialized&&event==="SIGNED_IN"&&newUserId!==oldUserId&&!syncing){setStatus("同期確認中…","syncing");setTimeout(()=>pullOrSeed(),0)}
  });
  authUnsub=listener?.data?.subscription||null;
  initialized=true;
  if(session)await pullOrSeed();else setStatus("未ログイン")
}

window.FrendaCloud={version:CLOUD_VERSION,init,scheduleSync,pushNow,pullNow,isLoggedIn:()=>!!session};
})();

}

/* Updated: 2026-10-11 01:20 JST */
