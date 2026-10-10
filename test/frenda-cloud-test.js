/* FRENDA_CLOUD_TEST_VERSION: 0.3 / cloud-only save test runtime; local user and cloud user NEVER synchronize */
(()=>{
"use strict";

const CLOUD_TEST_VERSION="0.3";
const SUPABASE_URL="https://rzacvrioutgsaimobins.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_H9HFETl_RY8B3Wgr_vYV0Q_a-JPngR4";
const TABLE="frenda_saves";

let client=null,session=null,cfg=null,authUnsub=null,button=null,modal=null,launcherObserver=null,storageUnsub=null,syncTimer=null;
let statusText="未ログイン（ローカル）",syncing=false,lastUploaded="";

function escapeHTML(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function safeJSON(v){try{return JSON.stringify(v??null)}catch{return ""}}
function testApi(){return window.FRENDA_TEST}
function cloudMode(){return !!session&&testApi()?.mode==="cloud"&&testApi()?.cloudUserId===session?.user?.id}
function columnName(){return cfg?.column||"simulator_data"}
function setStatus(text,kind=""){
  statusText=text;
  if(button){const prefix=kind==="error"?"⚠️":session?"☁️":"🧪";button.textContent=`${prefix} ${text}`;button.dataset.kind=kind;}
  const s=modal?.querySelector("#frendaCloudStatus");if(s)s.textContent=text;
}
function injectStyles(){
  if(document.getElementById("frendaCloudTestStyles"))return;
  const st=document.createElement("style");st.id="frendaCloudTestStyles";st.textContent=`
  .frendaCloudBtn{background:#fff8dd!important;color:#6f5700!important;border:1px solid #e5d48a!important;border-radius:999px!important;padding:7px 10px!important;font-size:11px!important;font-weight:900!important;white-space:nowrap!important;box-shadow:none!important}
  .frendaCloudBtn[data-kind="error"]{background:#fff0f0!important;color:#9a2e2e!important;border-color:#e9b8b8!important}
  .frendaCloudTestLauncher{position:fixed!important;left:3px!important;top:calc(env(safe-area-inset-top,0px) + 3px)!important;z-index:100000!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:28px!important;min-height:28px!important;padding:4px 6px!important;border:1px solid #c9ad58!important;border-radius:8px!important;background:#ffe39aee!important;color:#553400!important;font-size:15px!important;line-height:1!important;font-weight:1000!important;box-shadow:0 2px 7px #0003!important;cursor:pointer!important;pointer-events:auto!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important}
  .frendaCloudOverlay{position:fixed;inset:0;z-index:3000;background:#0008;display:flex;align-items:center;justify-content:center;padding:16px}
  .frendaCloudPanel{width:min(430px,100%);background:#fff;color:#17202a;border-radius:18px;padding:16px;box-shadow:0 20px 70px #0007;font-family:-apple-system,BlinkMacSystemFont,"Hiragino Sans","Yu Gothic",sans-serif}
  .frendaCloudHead{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}.frendaCloudHead b{font-size:18px}.frendaCloudClose{background:#edf2f7!important;color:#243747!important;padding:8px 10px!important}
  .frendaCloudPanel label{display:block;font-size:12px;font-weight:800;margin:9px 0 4px}.frendaCloudPanel input{width:100%;padding:11px;border:1px solid #c8d2d9;border-radius:10px;font:inherit;background:#fff;color:#17202a}
  .frendaCloudActions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.frendaCloudActions button{width:100%;padding:10px!important;border-radius:10px!important}.frendaCloudActions .wide{grid-column:1/-1}.frendaCloudPrimary{background:#1769e0!important;color:#fff!important}.frendaCloudSecondary{background:#edf2f7!important;color:#243747!important}.frendaCloudDanger{background:#a33!important;color:#fff!important}
  .frendaCloudInfo{font-size:12px;line-height:1.55;color:#64737e;background:#eef9ff;border:1px solid #b9ddeb;border-radius:10px;padding:10px;margin-top:10px}.frendaCloudUser{font-size:13px;font-weight:800;word-break:break-all;margin:6px 0}.frendaCloudStatus{margin-top:9px;font-size:12px;font-weight:800;color:#31566d;min-height:1.4em}
  `;document.head.appendChild(st);
}
function bindLauncher(el){
  if(!el)return false;el.classList.add("frendaCloudTestLauncher");el.style.pointerEvents="auto";el.style.cursor="pointer";el.style.opacity="1";
  el.setAttribute("role","button");el.setAttribute("tabindex","0");el.setAttribute("title","🧪 テスト認証を開く");el.setAttribute("aria-label","テスト認証を開く");
  el.onclick=openModal;el.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openModal()}};
  const fallback=document.getElementById("frendaCloudTestLauncher");if(fallback&&fallback!==el)fallback.remove();return true;
}
function ensureLauncher(){
  const native=document.getElementById("frendaDungeonTestBadge")||document.getElementById("frendaExpeditionTestBadge");if(bindLauncher(native))return native;
  let el=document.getElementById("frendaCloudTestLauncher");if(!el){el=document.createElement("button");el.type="button";el.id="frendaCloudTestLauncher";el.className="frendaCloudTestLauncher";el.textContent="🧪";document.body.appendChild(el)}bindLauncher(el);return el;
}
function watchLauncher(){ensureLauncher();if(launcherObserver)return;launcherObserver=new MutationObserver(()=>ensureLauncher());launcherObserver.observe(document.documentElement,{childList:true,subtree:true})}
function injectButton(){if(button)return;injectStyles();watchLauncher();button=document.createElement("button");button.type="button";button.className="frendaCloudBtn";button.textContent="🧪 テスト認証";button.onclick=openModal;(document.querySelector(".headerBtns")||document.querySelector("header")||document.body).appendChild(button)}
function closeModal(){modal?.remove();modal=null}
function openModal(){
  closeModal();modal=document.createElement("div");modal.className="frendaCloudOverlay";const email=session?.user?.email||"";
  modal.innerHTML=session?`
    <div class="frendaCloudPanel" role="dialog" aria-modal="true">
      <div class="frendaCloudHead"><b>☁️ クラウドユーザー</b><button type="button" class="frendaCloudClose">閉じる</button></div>
      <div class="frendaCloudUser">${escapeHTML(email)}</div>
      <div class="frendaCloudInfo"><b>クラウド専用保存モード</b><br>このユーザーのゲーム進行はSupabaseだけを正本として扱います。ローカルユーザーのセーブとは比較・同期しません。画面内の一時データはテスト用メモリ／sessionStorageキャッシュで、永続セーブではありません。<br><small>Cloud Test v${CLOUD_TEST_VERSION}</small></div>
      <div id="frendaCloudStatus" class="frendaCloudStatus">${escapeHTML(statusText)}</div>
      <div class="frendaCloudActions"><button type="button" id="frendaCloudPush" class="frendaCloudPrimary">今すぐ保存</button><button type="button" id="frendaCloudPull" class="frendaCloudSecondary">クラウド再読込</button><button type="button" id="frendaCloudLogout" class="frendaCloudDanger wide">ログアウト</button></div>
    </div>`:`
    <div class="frendaCloudPanel" role="dialog" aria-modal="true">
      <div class="frendaCloudHead"><b>🧪 テスト認証</b><button type="button" class="frendaCloudClose">閉じる</button></div>
      <div class="frendaCloudInfo"><b>未ログイン時はローカルユーザーです。</b><br>ログインすると、そのアカウント専用のクラウドセーブへ切り替わります。ローカルセーブをクラウドへコピーする処理は行いません。<br><small>Cloud Test v${CLOUD_TEST_VERSION}</small></div>
      <label>メールアドレス</label><input id="frendaCloudEmail" type="email" autocomplete="username">
      <label>パスワード</label><input id="frendaCloudPassword" type="password" autocomplete="current-password">
      <div id="frendaCloudStatus" class="frendaCloudStatus">${escapeHTML(statusText)}</div>
      <div class="frendaCloudActions"><button type="button" id="frendaCloudLogin" class="frendaCloudPrimary wide">ログイン</button></div>
    </div>`;
  document.body.appendChild(modal);modal.addEventListener("click",e=>{if(e.target===modal)closeModal()});modal.querySelector(".frendaCloudClose").onclick=closeModal;
  if(session){modal.querySelector("#frendaCloudPush").onclick=()=>pushNow(true);modal.querySelector("#frendaCloudPull").onclick=()=>pullNow(true);modal.querySelector("#frendaCloudLogout").onclick=logout}
  else modal.querySelector("#frendaCloudLogin").onclick=async()=>{const email=modal.querySelector("#frendaCloudEmail").value.trim(),password=modal.querySelector("#frendaCloudPassword").value;if(!email||!password){setStatus("メールアドレスとパスワードを入力してください。","error");return}await login(email,password)};
}
async function rowForUser(){if(!session)return {data:null,error:new Error("not signed in")};return await client.from(TABLE).select(`user_id,${columnName()},updated_at`).eq("user_id",session.user.id).maybeSingle()}
function cachePayload(payload){try{testApi()?.writeCloudCache?.(payload,session?.user?.id)}catch(e){console.warn("FRENDA_TEST_CACHE_WRITE",e)}}
function activatePayload(payload){testApi()?.activateCloud?.(session.user.id,payload??null)}
function subscribeStorage(){
  storageUnsub?.();storageUnsub=null;const s=testApi()?.storage;if(!s?.subscribe)return;
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
  if(!client)return;if(syncTimer){clearTimeout(syncTimer);syncTimer=null}if(cloudMode())await pushNow(true);
  await client.auth.signOut();session=null;storageUnsub?.();storageUnsub=null;testApi()?.deactivateCloud?.();setStatus("未ログイン（ローカル）");closeModal();location.reload();
}
function scheduleSync(){
  if(!cloudMode())return false;if(syncTimer)clearTimeout(syncTimer);
  const current=cfg?.getData?.();if(current)cachePayload(current);
  syncTimer=setTimeout(()=>{syncTimer=null;pushNow(false)},900);setStatus("クラウド保存待ち…");return true;
}
async function pushNow(force=false){
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
  const {data,error}=await client.auth.getSession();if(error){setStatus("認証確認エラー","error");return}session=data.session||null;
  const listener=client.auth.onAuthStateChange((_event,newSession)=>{session=newSession||null});authUnsub=listener?.data?.subscription||null;
  await initializeCloudSession();
}

window.FrendaCloud={
  version:`test-${CLOUD_TEST_VERSION}`,testMode:true,cloudOnly:true,localCloudSync:false,syncDisabled:false,
  init,scheduleSync,pushNow,pullNow,isLoggedIn:()=>!!session,getUser:()=>session?.user||null,open:openModal
};
})();
