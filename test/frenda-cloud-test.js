/* FRENDA_CLOUD_TEST_VERSION: 0.1 / auth-only test runtime; NEVER reads/writes frenda_saves */
(()=>{
"use strict";

const CLOUD_TEST_VERSION="0.1";
const SUPABASE_URL="https://rzacvrioutgsaimobins.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_H9HFETl_RY8B3Wgr_vYV0Q_a-JPngR4";

let client=null;
let session=null;
let cfg=null;
let authUnsub=null;
let button=null;
let modal=null;
let statusText="未ログイン（同期停止）";
let initialized=false;

function escapeHTML(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function setStatus(text,kind=""){
  statusText=text;
  if(button){
    const prefix=kind==="error"?"⚠️":session?"☁️":"🧪";
    button.textContent=`${prefix} ${text}`;
    button.dataset.kind=kind;
  }
  const s=modal?.querySelector("#frendaCloudStatus");
  if(s)s.textContent=text;
}
function injectStyles(){
  if(document.getElementById("frendaCloudTestStyles"))return;
  const st=document.createElement("style");st.id="frendaCloudTestStyles";st.textContent=`
  .frendaCloudBtn{background:#fff8dd!important;color:#6f5700!important;border:1px solid #e5d48a!important;border-radius:999px!important;padding:7px 10px!important;font-size:11px!important;font-weight:900!important;white-space:nowrap!important;box-shadow:none!important}
  .frendaCloudBtn[data-kind="error"]{background:#fff0f0!important;color:#9a2e2e!important;border-color:#e9b8b8!important}
  .frendaCloudOverlay{position:fixed;inset:0;z-index:3000;background:#0008;display:flex;align-items:center;justify-content:center;padding:16px}
  .frendaCloudPanel{width:min(430px,100%);background:#fff;color:#17202a;border-radius:18px;padding:16px;box-shadow:0 20px 70px #0007;font-family:-apple-system,BlinkMacSystemFont,"Hiragino Sans","Yu Gothic",sans-serif}
  .frendaCloudHead{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}.frendaCloudHead b{font-size:18px}.frendaCloudClose{background:#edf2f7!important;color:#243747!important;padding:8px 10px!important}
  .frendaCloudPanel label{display:block;font-size:12px;font-weight:800;margin:9px 0 4px}.frendaCloudPanel input{width:100%;padding:11px;border:1px solid #c8d2d9;border-radius:10px;font:inherit;background:#fff;color:#17202a}
  .frendaCloudActions{display:grid;grid-template-columns:1fr;gap:8px;margin-top:12px}.frendaCloudActions button{width:100%;padding:10px!important;border-radius:10px!important}.frendaCloudPrimary{background:#1769e0!important;color:#fff!important}.frendaCloudDanger{background:#a33!important;color:#fff!important}
  .frendaCloudInfo{font-size:12px;line-height:1.55;color:#64737e;background:#fff8dd;border:1px solid #ead991;border-radius:10px;padding:10px;margin-top:10px}.frendaCloudUser{font-size:13px;font-weight:800;word-break:break-all;margin:6px 0}.frendaCloudStatus{margin-top:9px;font-size:12px;font-weight:800;color:#31566d;min-height:1.4em}
  `;document.head.appendChild(st)
}
function injectButton(){
  if(button)return;
  injectStyles();
  button=document.createElement("button");button.type="button";button.className="frendaCloudBtn";button.textContent="🧪 テスト認証";button.onclick=openModal;
  const host=document.querySelector(".headerBtns")||document.querySelector("header")||document.body;host.appendChild(button);
}
function closeModal(){modal?.remove();modal=null}
function openModal(){
  closeModal();
  modal=document.createElement("div");modal.className="frendaCloudOverlay";
  const email=session?.user?.email||"";
  modal.innerHTML=session?`
    <div class="frendaCloudPanel" role="dialog" aria-modal="true">
      <div class="frendaCloudHead"><b>🧪 テスト認証</b><button type="button" class="frendaCloudClose">閉じる</button></div>
      <div class="frendaCloudUser">${escapeHTML(email)}</div>
      <div class="frendaCloudInfo"><b>自動同期は停止中です。</b><br>${escapeHTML(cfg?.label||"アプリ")}のローカルセーブも、Supabaseの <code>frenda_saves</code> も読み書きしません。ここではログイン状態だけを確認します。<br><small>Cloud Test v${CLOUD_TEST_VERSION}</small></div>
      <div id="frendaCloudStatus" class="frendaCloudStatus">${escapeHTML(statusText)}</div>
      <div class="frendaCloudActions"><button type="button" id="frendaCloudLogout" class="frendaCloudDanger">ログアウト</button></div>
    </div>`:`
    <div class="frendaCloudPanel" role="dialog" aria-modal="true">
      <div class="frendaCloudHead"><b>🧪 テスト認証</b><button type="button" class="frendaCloudClose">閉じる</button></div>
      <div class="frendaCloudInfo"><b>自動同期は停止中です。</b><br>ログインしてもゲームのセーブデータはクラウドへ送信せず、クラウドのセーブデータも読み込みません。<br><small>Cloud Test v${CLOUD_TEST_VERSION}</small></div>
      <label>メールアドレス</label><input id="frendaCloudEmail" type="email" autocomplete="username">
      <label>パスワード</label><input id="frendaCloudPassword" type="password" autocomplete="current-password">
      <div id="frendaCloudStatus" class="frendaCloudStatus">${escapeHTML(statusText)}</div>
      <div class="frendaCloudActions"><button type="button" id="frendaCloudLogin" class="frendaCloudPrimary">ログイン</button></div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener("click",e=>{if(e.target===modal)closeModal()});
  modal.querySelector(".frendaCloudClose").onclick=closeModal;
  if(session)modal.querySelector("#frendaCloudLogout").onclick=logout;
  else modal.querySelector("#frendaCloudLogin").onclick=async()=>{
    const email=modal.querySelector("#frendaCloudEmail").value.trim(),password=modal.querySelector("#frendaCloudPassword").value;
    if(!email||!password){setStatus("メールアドレスとパスワードを入力してください。","error");return}
    await login(email,password);
  };
}
async function login(email,password){
  if(!client)return;
  setStatus("ログイン中…");
  const {data,error}=await client.auth.signInWithPassword({email,password});
  if(error){setStatus("ログイン失敗："+error.message,"error");return}
  session=data.session||null;setStatus("ログイン済み（同期停止）");closeModal();
}
async function logout(){
  if(!client)return;
  await client.auth.signOut();session=null;setStatus("未ログイン（同期停止）");closeModal();
}
function syncBlocked(action){
  console.info(`FrendaCloudTest: ${action} blocked; save sync is disabled in /test/.`);
  setStatus("同期停止中（テスト環境）");
  return Promise.resolve(false);
}
async function init(options){
  cfg=options||{};injectButton();
  if(!window.supabase?.createClient){setStatus("認証ライブラリ未接続","error");return}
  client=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storage:window.sessionStorage}});
  if(authUnsub){try{authUnsub.unsubscribe()}catch{}}
  const {data,error}=await client.auth.getSession();
  if(error){setStatus("認証確認エラー","error");return}
  session=data.session||null;
  const listener=client.auth.onAuthStateChange((_event,newSession)=>{session=newSession||null;setStatus(session?"ログイン済み（同期停止）":"未ログイン（同期停止）")});
  authUnsub=listener?.data?.subscription||null;
  initialized=true;
  setStatus(session?"ログイン済み（同期停止）":"未ログイン（同期停止）");
}

window.FrendaCloud={
  version:`test-${CLOUD_TEST_VERSION}`,
  testMode:true,
  syncDisabled:true,
  init,
  scheduleSync:()=>false,
  pushNow:()=>syncBlocked("push"),
  pullNow:()=>syncBlocked("pull"),
  isLoggedIn:()=>!!session,
  getUser:()=>session?.user||null,
  open:openModal
};
})();
