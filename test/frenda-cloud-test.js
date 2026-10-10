/* FRENDA_CLOUD_TEST_VERSION: 0.8 / cloud-only save + dynamic local user add/rename/switch + regression cloud-write guard; local user and cloud user NEVER synchronize */
(()=>{
"use strict";

const CLOUD_TEST_VERSION="0.8";
const SUPABASE_URL="https://rzacvrioutgsaimobins.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_H9HFETl_RY8B3Wgr_vYV0Q_a-JPngR4";
const TABLE="frenda_saves";

let client=null,session=null,cfg=null,authUnsub=null,button=null,modal=null,launcherObserver=null,storageUnsub=null,syncTimer=null,userBadge=null;
let statusText="未ログイン（ローカル）",syncing=false,lastUploaded="";

function escapeHTML(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function safeJSON(v){try{return JSON.stringify(v??null)}catch{return ""}}
function testApi(){return window.FRENDA_TEST}
function cloudMode(){return !!session&&testApi()?.mode==="cloud"&&testApi()?.cloudUserId===session?.user?.id}
function columnName(){return cfg?.column||"simulator_data"}
const REGRESSION_SAVE_BLOCK_TEXT="回帰テスト中：クラウド保存禁止";
function regressionCaseActive(){try{return new URLSearchParams(location.search).has("case")}catch{return false}}
function setStatus(text,kind=""){
  statusText=text;
  if(button){const prefix=kind==="error"?"⚠️":session?"☁️":"🧪";button.textContent=`${prefix} ${text}`;button.dataset.kind=kind;}
  const s=modal?.querySelector("#frendaCloudStatus");if(s)s.textContent=text;
  updateUserBadge();
}
function injectStyles(){
  if(document.getElementById("frendaCloudTestStyles"))return;
  const st=document.createElement("style");st.id="frendaCloudTestStyles";st.textContent=`
  .frendaCloudBtn{background:#fff8dd!important;color:#6f5700!important;border:1px solid #e5d48a!important;border-radius:999px!important;padding:7px 10px!important;font-size:11px!important;font-weight:900!important;white-space:nowrap!important;box-shadow:none!important}
  .frendaCloudBtn[data-kind="error"]{background:#fff0f0!important;color:#9a2e2e!important;border-color:#e9b8b8!important}
  .frendaActiveUserBadge{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:4px!important;box-sizing:border-box!important;max-width:190px!important;min-height:28px!important;padding:5px 9px!important;border-radius:999px!important;border:1px solid #a9c9d9!important;background:#eef9ff!important;color:#16475f!important;font-size:10px!important;font-weight:1000!important;line-height:1!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;cursor:pointer!important;box-shadow:none!important;flex:0 1 auto!important}
  .frendaActiveUserBadge[data-mode="cloud"]{background:#e6f6ff!important;color:#075a7a!important;border-color:#8fd4ef!important}
  .frendaActiveUserBadge[data-mode="local"]{background:#f2f4f6!important;color:#40515e!important;border-color:#c7d0d6!important}
  .frendaActiveUserBadge .frendaActiveUserText{display:block!important;min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
  @media(max-width:700px){.frendaActiveUserBadge{max-width:132px!important;min-height:25px!important;padding:4px 7px!important;font-size:8.5px!important}}
  .frendaCloudTestLauncher{position:fixed!important;left:3px!important;top:calc(env(safe-area-inset-top,0px) + 3px)!important;z-index:100000!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:28px!important;min-height:28px!important;padding:4px 6px!important;border:1px solid #c9ad58!important;border-radius:8px!important;background:#ffe39aee!important;color:#553400!important;font-size:15px!important;line-height:1!important;font-weight:1000!important;box-shadow:0 2px 7px #0003!important;cursor:pointer!important;pointer-events:auto!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important}
  .frendaCloudOverlay{position:fixed;inset:0;z-index:3000;background:#0008;display:flex;align-items:center;justify-content:center;padding:16px}
  .frendaCloudPanel{width:min(430px,100%);background:#fff;color:#17202a;border-radius:18px;padding:16px;box-shadow:0 20px 70px #0007;font-family:-apple-system,BlinkMacSystemFont,"Hiragino Sans","Yu Gothic",sans-serif}
  .frendaCloudHead{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}.frendaCloudHead b{font-size:18px}.frendaCloudClose{background:#edf2f7!important;color:#243747!important;padding:8px 10px!important}
  .frendaCloudPanel label{display:block;font-size:12px;font-weight:800;margin:9px 0 4px}.frendaCloudPanel input{width:100%;padding:11px;border:1px solid #c8d2d9;border-radius:10px;font:inherit;background:#fff;color:#17202a}
  .frendaCloudActions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.frendaCloudActions button{width:100%;padding:10px!important;border-radius:10px!important}.frendaCloudActions .wide{grid-column:1/-1}.frendaCloudPrimary{background:#1769e0!important;color:#fff!important}.frendaCloudSecondary{background:#edf2f7!important;color:#243747!important}.frendaCloudDanger{background:#a33!important;color:#fff!important}
  .frendaLocalProfiles{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0 4px}.frendaLocalProfileItem{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:5px;min-width:0}.frendaLocalProfileItem [data-local-profile]{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:10px!important;border-radius:10px!important;background:#f2f4f6!important;color:#31424f!important;border:1px solid #c7d0d6!important;font-weight:900!important}.frendaLocalProfileItem [data-local-profile].active{background:#dff3ff!important;color:#075a7a!important;border-color:#69bde4!important}.frendaLocalProfileItem [data-local-profile]:disabled,.frendaLocalProfileRename:disabled{opacity:.55!important;cursor:not-allowed!important}.frendaLocalProfileRename{width:38px!important;padding:8px 6px!important;border-radius:10px!important;background:#fff7df!important;color:#6a5100!important;border:1px solid #e4cf85!important;font-weight:900!important}.frendaLocalTitle{font-size:12px;font-weight:900;margin-top:10px;color:#40515e}
  .frendaLocalAdd{display:grid;grid-template-columns:1fr auto;gap:8px;margin-top:9px}.frendaLocalAdd input{min-width:0}.frendaLocalAdd button{padding:9px 12px!important;border-radius:10px!important;background:#166534!important;color:#fff!important;font-weight:900!important;white-space:nowrap!important}.frendaLocalAdd button:disabled{opacity:.55!important;cursor:not-allowed!important}
  .frendaCloudInfo{font-size:12px;line-height:1.55;color:#64737e;background:#eef9ff;border:1px solid #b9ddeb;border-radius:10px;padding:10px;margin-top:10px}.frendaCloudUser{font-size:13px;font-weight:800;word-break:break-all;margin:6px 0}.frendaCloudStatus{margin-top:9px;font-size:12px;font-weight:800;color:#31566d;min-height:1.4em}
  `;document.head.appendChild(st);
}
function localProfileId(){return testApi()?.localProfileId||"A"}
function localProfileName(){return testApi()?.localProfileName||"ローカルA"}
function localProfiles(){
  const list=testApi()?.localProfiles;
  return Array.isArray(list)&&list.length?list:[{id:"A",name:"ローカルA"},{id:"B",name:"ローカルB"}];
}
function activeUserLabel(){
  const email=session?.user?.email||"";
  if(email&&regressionCaseActive())return {mode:"cloud",icon:"🔒",text:email,title:`クラウドユーザー：${email}（回帰テスト中は保存禁止）`};
  if(email)return {mode:"cloud",icon:"☁️",text:email,title:`クラウドユーザー：${email}`};
  if(regressionCaseActive())return {mode:"local",icon:"🔒",text:"回帰テスト",title:"回帰テスト一時データ（ローカル保存なし）"};
  const name=localProfileName();return {mode:"local",icon:"👤",text:name,title:`${name}（テスト専用保存）`};
}
function switchLocalProfile(profile){
  profile=String(profile||"").trim().toUpperCase();
  if(session){setStatus("クラウドユーザー中はログアウトしてから切り替えてください。","error");return false}
  if(regressionCaseActive()){setStatus("回帰テスト中はローカルユーザーを切り替えません。","error");return false}
  const info=localProfiles().find(x=>String(x.id).toUpperCase()===profile);if(!info){setStatus("ローカルユーザーが見つかりません。","error");return false}
  if(profile===localProfileId())return true;
  if(!confirm(`${info.name}に切り替えますか？`))return false;
  if(!testApi()?.switchLocalProfile?.(profile)){setStatus("ローカルユーザー切替に失敗しました。","error");return false}
  closeModal();location.reload();return true;
}
function createLocalProfile(name){
  if(session){setStatus("クラウドユーザー中はログアウトしてから追加してください。","error");return false}
  if(regressionCaseActive()){setStatus("回帰テスト中はローカルユーザーを追加できません。","error");return false}
  name=String(name||"").trim().replace(/\s+/g," ");
  if(!name){setStatus("ローカルユーザー名を入力してください。","error");return false}
  if(name.length>20){setStatus("名前は20文字以内にしてください。","error");return false}
  if(localProfiles().some(x=>x.name===name)){setStatus("同じ名前のローカルユーザーがあります。","error");return false}
  if(!confirm(`「${name}」を追加しますか？`))return false;
  const created=testApi()?.createLocalProfile?.(name);
  if(!created){setStatus("ローカルユーザーを追加できませんでした。","error");return false}
  closeModal();location.reload();return true;
}
function renameLocalProfile(profile){
  if(session){setStatus("クラウドユーザー中はログアウトしてから名前を変更してください。","error");return false}
  if(regressionCaseActive()){setStatus("回帰テスト中はローカルユーザー名を変更できません。","error");return false}
  profile=String(profile||"").trim().toUpperCase();
  const info=localProfiles().find(x=>String(x.id).toUpperCase()===profile);if(!info){setStatus("ローカルユーザーが見つかりません。","error");return false}
  const entered=prompt(`「${info.name}」の新しい名前を入力してください（20文字以内）`,info.name);
  if(entered===null)return false;
  const newName=String(entered||"").trim().replace(/\s+/g," ");
  if(!newName){setStatus("ローカルユーザー名を入力してください。","error");return false}
  if(newName.length>20){setStatus("名前は20文字以内にしてください。","error");return false}
  if(localProfiles().some(x=>String(x.id).toUpperCase()!==profile&&x.name===newName)){setStatus("同じ名前のローカルユーザーがあります。","error");return false}
  if(newName===info.name)return true;
  if(!confirm(`「${info.name}」を「${newName}」に変更しますか？\n\nセーブデータはそのままです。`))return false;
  const renamed=testApi()?.renameLocalProfile?.(profile,newName);
  if(!renamed){setStatus("ローカルユーザー名を変更できませんでした。","error");return false}
  closeModal();location.reload();return true;
}
function userBadgeTarget(){
  if(document.getElementById("frendaDungeonTestBadge"))return document.querySelector(".careCluster")||document.querySelector(".headerTop")||document.querySelector("header");
  if(document.getElementById("frendaExpeditionTestBadge"))return document.querySelector("#expSharedStatus074")||document.querySelector(".headerTop")||document.querySelector("header");
  return document.querySelector(".headerTop")||document.querySelector("header");
}
function ensureUserBadge(){
  injectStyles();
  const target=userBadgeTarget();if(!target)return null;
  let el=document.getElementById("frendaActiveUserBadge");
  if(!el){el=document.createElement("button");el.type="button";el.id="frendaActiveUserBadge";el.className="frendaActiveUserBadge";el.innerHTML='<span class="frendaActiveUserIcon"></span><span class="frendaActiveUserText"></span>';el.onclick=openModal;}
  if(el.parentElement!==target){
    if(target.classList?.contains("careCluster"))target.insertBefore(el,target.firstChild);
    else if(target.id==="expSharedStatus074")target.insertBefore(el,target.firstChild);
    else{const buttons=target.querySelector?.(".headerBtns");buttons?target.insertBefore(el,buttons):target.appendChild(el)}
  }
  userBadge=el;updateUserBadge();return el;
}
function updateUserBadge(){
  const el=userBadge||document.getElementById("frendaActiveUserBadge");if(!el)return;
  const info=activeUserLabel();if(el.dataset.mode!==info.mode)el.dataset.mode=info.mode;if(el.title!==info.title)el.title=info.title;if(el.getAttribute("aria-label")!==info.title)el.setAttribute("aria-label",info.title);
  const icon=el.querySelector(".frendaActiveUserIcon"),text=el.querySelector(".frendaActiveUserText");if(icon&&icon.textContent!==info.icon)icon.textContent=info.icon;if(text&&text.textContent!==info.text)text.textContent=info.text;
}

function bindLauncher(el){
  if(!el)return false;el.classList.add("frendaCloudTestLauncher");el.style.pointerEvents="auto";el.style.cursor="pointer";el.style.opacity="1";
  el.setAttribute("role","button");el.setAttribute("tabindex","0");el.setAttribute("title","🧪 テスト認証を開く");el.setAttribute("aria-label","テスト認証を開く");
  el.onclick=openModal;el.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openModal()}};
  const fallback=document.getElementById("frendaCloudTestLauncher");if(fallback&&fallback!==el)fallback.remove();return true;
}
function ensureLauncher(){
  ensureUserBadge();
  const native=document.getElementById("frendaDungeonTestBadge")||document.getElementById("frendaExpeditionTestBadge");if(bindLauncher(native))return native;
  let el=document.getElementById("frendaCloudTestLauncher");if(!el){el=document.createElement("button");el.type="button";el.id="frendaCloudTestLauncher";el.className="frendaCloudTestLauncher";el.textContent="🧪";document.body.appendChild(el)}bindLauncher(el);return el;
}
function watchLauncher(){ensureLauncher();if(launcherObserver)return;launcherObserver=new MutationObserver(()=>{ensureLauncher();ensureUserBadge()});launcherObserver.observe(document.documentElement,{childList:true,subtree:true})}
function injectButton(){if(button)return;injectStyles();watchLauncher();button=document.createElement("button");button.type="button";button.className="frendaCloudBtn";button.textContent="🧪 テスト認証";button.onclick=openModal;(document.querySelector(".headerBtns")||document.querySelector("header")||document.body).appendChild(button)}
function closeModal(){modal?.remove();modal=null}
function openModal(){
  closeModal();modal=document.createElement("div");modal.className="frendaCloudOverlay";const email=session?.user?.email||"",regression=regressionCaseActive();
  modal.innerHTML=session?`
    <div class="frendaCloudPanel" role="dialog" aria-modal="true">
      <div class="frendaCloudHead"><b>☁️ クラウドユーザー</b><button type="button" class="frendaCloudClose">閉じる</button></div>
      <div class="frendaCloudUser">${escapeHTML(email)}</div>
      <div class="frendaCloudInfo"><b>クラウド専用保存モード</b><br>このユーザーのゲーム進行はSupabaseだけを正本として扱います。ローカルユーザーのセーブとは比較・同期しません。画面内の一時データはテスト用メモリ／sessionStorageキャッシュで、永続セーブではありません。${regression?'<br><b>🔒 回帰テスト（case=）中のためクラウドへの保存は完全に禁止されています。</b>':''}<br><small>Cloud Test v${CLOUD_TEST_VERSION}</small></div>
      <div id="frendaCloudStatus" class="frendaCloudStatus">${escapeHTML(statusText)}</div>
      <div class="frendaCloudActions"><button type="button" id="frendaCloudPush" class="frendaCloudPrimary" ${regression?'disabled aria-disabled="true"':''}>${regression?'🔒 保存禁止':'今すぐ保存'}</button><button type="button" id="frendaCloudPull" class="frendaCloudSecondary">クラウド再読込</button><button type="button" id="frendaCloudLogout" class="frendaCloudDanger wide">ログアウト</button></div>
    </div>`:`
    <div class="frendaCloudPanel" role="dialog" aria-modal="true">
      <div class="frendaCloudHead"><b>👤 ユーザー切替</b><button type="button" class="frendaCloudClose">閉じる</button></div>
      <div class="frendaCloudInfo"><b>現在：${regression?'回帰テスト一時データ':escapeHTML(localProfileName())}</b><br>ローカルユーザーごとに独立したテスト専用セーブを使用します。クラウドユーザーとは同期しません。名前変更は表示名だけで、セーブ領域は変わりません。${regression?'<br><b>🔒 回帰テスト中はローカル切替・追加・名前変更・保存を行いません。</b>':''}<br><small>Cloud Test v${CLOUD_TEST_VERSION}</small></div>
      <div class="frendaLocalTitle">ローカルユーザー</div>
      <div class="frendaLocalProfiles">${localProfiles().map(p=>`<div class="frendaLocalProfileItem"><button type="button" data-local-profile="${escapeHTML(p.id)}" class="${!regression&&localProfileId()===p.id?'active':''}" ${regression?'disabled aria-disabled="true"':''}>👤 ${escapeHTML(p.name)}</button><button type="button" class="frendaLocalProfileRename" data-local-rename="${escapeHTML(p.id)}" title="${escapeHTML(p.name)}の名前を変更" aria-label="${escapeHTML(p.name)}の名前を変更" ${regression?'disabled aria-disabled="true"':''}>✏️</button></div>`).join("")}</div>
      <div class="frendaLocalAdd"><input id="frendaLocalNewName" type="text" maxlength="20" placeholder="新しいユーザー名" ${regression?'disabled':''}><button type="button" id="frendaLocalAddBtn" ${regression?'disabled aria-disabled="true"':''}>＋ 追加</button></div>
      <div class="frendaLocalTitle">クラウドユーザーへログイン</div>
      <label>メールアドレス</label><input id="frendaCloudEmail" type="email" autocomplete="username">
      <label>パスワード</label><input id="frendaCloudPassword" type="password" autocomplete="current-password">
      <div id="frendaCloudStatus" class="frendaCloudStatus">${escapeHTML(statusText)}</div>
      <div class="frendaCloudActions"><button type="button" id="frendaCloudLogin" class="frendaCloudPrimary wide">ログイン</button></div>
    </div>`;
  document.body.appendChild(modal);modal.addEventListener("click",e=>{if(e.target===modal)closeModal()});modal.querySelector(".frendaCloudClose").onclick=closeModal;
  if(session){const pushBtn=modal.querySelector("#frendaCloudPush");if(regression){pushBtn.onclick=null;setStatus(REGRESSION_SAVE_BLOCK_TEXT)}else pushBtn.onclick=()=>pushNow(true);modal.querySelector("#frendaCloudPull").onclick=()=>pullNow(true);modal.querySelector("#frendaCloudLogout").onclick=logout}
  else{
    modal.querySelectorAll("[data-local-profile]").forEach(el=>{el.onclick=()=>switchLocalProfile(el.dataset.localProfile)});
    modal.querySelectorAll("[data-local-rename]").forEach(el=>{el.onclick=()=>renameLocalProfile(el.dataset.localRename)});
    const addBtn=modal.querySelector("#frendaLocalAddBtn"),nameInput=modal.querySelector("#frendaLocalNewName");if(addBtn)addBtn.onclick=()=>createLocalProfile(nameInput?.value||"");if(nameInput)nameInput.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();createLocalProfile(nameInput.value)}};
    modal.querySelector("#frendaCloudLogin").onclick=async()=>{const email=modal.querySelector("#frendaCloudEmail").value.trim(),password=modal.querySelector("#frendaCloudPassword").value;if(!email||!password){setStatus("メールアドレスとパスワードを入力してください。","error");return}await login(email,password)};
  }
}
async function rowForUser(){if(!session)return {data:null,error:new Error("not signed in")};return await client.from(TABLE).select(`user_id,${columnName()},updated_at`).eq("user_id",session.user.id).maybeSingle()}
function cachePayload(payload){try{testApi()?.writeCloudCache?.(payload,session?.user?.id)}catch(e){console.warn("FRENDA_TEST_CACHE_WRITE",e)}}
function activatePayload(payload){testApi()?.activateCloud?.(session.user.id,payload??null)}
function subscribeStorage(){
  storageUnsub?.();storageUnsub=null;if(regressionCaseActive())return;const s=testApi()?.storage;if(!s?.subscribe)return;
  storageUnsub=s.subscribe(ev=>{if(!cloudMode()||syncing)return;if(ev.type==="clear"||(ev.key&&cfg?.watchStorage?.(String(ev.key))))scheduleSync()});
}
async function login(email,password){
  if(!client)return;setStatus("ログイン中…");const {data,error}=await client.auth.signInWithPassword({email,password});if(error){setStatus("ログイン失敗："+error.message,"error");return}
  session=data.session||null;if(!session){setStatus("ログインセッションを取得できません。","error");return}
  setStatus("クラウドセーブ確認中…");
  const {data:row,error:rowError}=await rowForUser();if(rowError){setStatus("クラウドセーブ確認失敗："+rowError.message,"error");return}
  const payload=row?.[columnName()]??null;activatePayload(payload);closeModal();location.reload();
}
async function logout(){
  if(!client)return;if(syncTimer){clearTimeout(syncTimer);syncTimer=null}if(cloudMode()&&!regressionCaseActive())await pushNow(true);
  await client.auth.signOut();session=null;storageUnsub?.();storageUnsub=null;testApi()?.deactivateCloud?.();setStatus("未ログイン（ローカル）");closeModal();location.reload();
}
function scheduleSync(){
  if(!cloudMode())return false;if(regressionCaseActive()){if(syncTimer){clearTimeout(syncTimer);syncTimer=null}setStatus(REGRESSION_SAVE_BLOCK_TEXT);return false}if(syncTimer)clearTimeout(syncTimer);
  const current=cfg?.getData?.();if(current)cachePayload(current);
  syncTimer=setTimeout(()=>{syncTimer=null;pushNow(false)},900);setStatus("クラウド保存待ち…");return true;
}
async function pushNow(force=false){
  if(regressionCaseActive()){if(syncTimer){clearTimeout(syncTimer);syncTimer=null}setStatus(REGRESSION_SAVE_BLOCK_TEXT);return false}
  if(!cloudMode()||syncing||!cfg?.getData)return false;syncing=true;setStatus("クラウド保存中…");
  try{
    const payload=cfg.getData(),str=safeJSON(payload);cachePayload(payload);
    if(!force&&str&&str===lastUploaded){setStatus("クラウド保存済み");return true}
    const row={user_id:session.user.id,[columnName()]:payload,updated_at:new Date().toISOString()};const {error}=await client.from(TABLE).upsert(row,{onConflict:"user_id"});if(error)throw error;
    lastUploaded=str;setStatus("クラウド保存済み");return true;
  }catch(e){console.error("FrendaCloudTest push",e);setStatus("クラウド保存エラー","error");return false}
  finally{syncing=false}
}
async function pullNow(force=false){
  if(!session||syncing)return false;syncing=true;setStatus("クラウド読込中…");
  try{
    const {data,error}=await rowForUser();if(error)throw error;const payload=data?.[columnName()]??null;
    if(!payload){if(force)setStatus("クラウドセーブはまだありません");return false}
    activatePayload(payload);lastUploaded=safeJSON(payload);setStatus("クラウドから読み込みました");closeModal();location.reload();return true;
  }catch(e){console.error("FrendaCloudTest pull",e);setStatus("クラウド読込エラー","error");return false}
  finally{syncing=false}
}
async function initializeCloudSession(){
  if(!session){
    const wasCloud=testApi()?.mode==="cloud";testApi()?.deactivateCloud?.();setStatus("未ログイン（ローカル）");
    if(wasCloud){location.reload();return}
    return;
  }
  const uid=session.user.id;
  if(testApi()?.mode!=="cloud"||testApi()?.cloudUserId!==uid){
    const {data,error}=await rowForUser();if(error){setStatus("クラウドセーブ確認失敗","error");return}
    activatePayload(data?.[columnName()]??null);location.reload();return;
  }
  const {data,error}=await rowForUser();if(error){setStatus("クラウド読込エラー","error");return}
  const remote=data?.[columnName()]??null,current=cfg?.getData?.()??null,cached=testApi()?.readCloudCache?.(uid)??null;
  if(regressionCaseActive()){
    const remoteStr=safeJSON(remote),cachedStr=safeJSON(cached);
    if(remote&&remoteStr!==cachedStr){activatePayload(remote);lastUploaded=remoteStr;location.reload();return}
    lastUploaded=remoteStr;storageUnsub?.();storageUnsub=null;setStatus(REGRESSION_SAVE_BLOCK_TEXT);return;
  }
  if(remote){
    const remoteStr=safeJSON(remote),currentStr=safeJSON(current),cachedStr=safeJSON(cached);
    if(remoteStr!==cachedStr){
      // 別端末等でクラウドが更新された場合は、クラウドを正本として取り直す。
      activatePayload(remote);lastUploaded=remoteStr;location.reload();return;
    }
    if(currentStr!==remoteStr){
      // 同じクラウドデータを読み込んだ後、アプリ側の互換移行で形が更新された場合だけクラウドへ反映する。
      await pushNow(true);
    }else{lastUploaded=remoteStr;cachePayload(remote)}
  }else{
    // 新規クラウドユーザー。cloud modeは空のテスト保存領域から始まるため、ローカルデータは混入しない。
    await pushNow(true);
  }
  subscribeStorage();setStatus("クラウド保存済み");
}
async function init(options){
  cfg=options||{};injectButton();ensureLauncher();
  if(!window.supabase?.createClient){setStatus("認証ライブラリ未接続","error");return}
  client=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storage:window.sessionStorage}});
  if(authUnsub){try{authUnsub.unsubscribe()}catch{}}
  const {data,error}=await client.auth.getSession();if(error){setStatus("認証確認エラー","error");return}session=data.session||null;ensureUserBadge();updateUserBadge();
  const listener=client.auth.onAuthStateChange((_event,newSession)=>{session=newSession||null;updateUserBadge()});authUnsub=listener?.data?.subscription||null;
  await initializeCloudSession();
}

window.FrendaCloud={
  version:`test-${CLOUD_TEST_VERSION}`,testMode:true,cloudOnly:true,localCloudSync:false,syncDisabled:false,regressionSaveGuard:true,localProfiles:true,localProfileAdd:true,localProfileRename:true,isRegressionCase:regressionCaseActive,
  init,scheduleSync,pushNow,pullNow,isLoggedIn:()=>!!session,getUser:()=>session?.user||null,open:openModal
};
})();
/* Ver0.8: ローカルユーザー名変更を追加。各ユーザーの✏️から表示名だけを変更し、内部ID・保存領域・セーブデータは維持。クラウドとは同期せず、回帰テスト中は追加・切替・名前変更・永続保存を禁止。Updated: 2026-10-11 00:05 JST */
