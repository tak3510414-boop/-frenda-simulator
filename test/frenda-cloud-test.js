/* FRENDA_CLOUD_TEST_VERSION: 1.1 / unified local+cloud user list + remembered cloud sessions + cloud-only save + regression write guard; local and cloud saves NEVER synchronize */
(()=>{
"use strict";

const CLOUD_TEST_VERSION="1.1";
const SUPABASE_URL="https://rzacvrioutgsaimobins.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_H9HFETl_RY8B3Wgr_vYV0Q_a-JPngR4";
const TABLE="frenda_saves";

let client=null,session=null,cfg=null,authUnsub=null,button=null,modal=null,launcherObserver=null,storageUnsub=null,syncTimer=null,userBadge=null;
let statusText="ローカルユーザー",syncing=false,lastUploaded="",activeCloudProfileId="",pendingCloudProfileId="";
const CLOUD_PROFILE_META="cloud-profiles:v1";
const ACTIVE_ACCOUNT_META="active-user:v1";

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
  .frendaLocalProfiles{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0 4px}.frendaLocalProfileItem{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:5px;min-width:0}.frendaLocalProfileItem [data-local-profile]{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:10px!important;border-radius:10px!important;background:#f2f4f6!important;color:#31424f!important;border:1px solid #c7d0d6!important;font-weight:900!important}.frendaLocalProfileItem [data-local-profile].active{background:#dff3ff!important;color:#075a7a!important;border-color:#69bde4!important}.frendaLocalProfileItem [data-local-profile]:disabled,.frendaLocalProfileRename:disabled,.frendaLocalProfileDelete:disabled{opacity:.55!important;cursor:not-allowed!important}.frendaLocalProfileRename,.frendaLocalProfileDelete{width:38px!important;padding:8px 6px!important;border-radius:10px!important;font-weight:900!important}.frendaLocalProfileRename{background:#fff7df!important;color:#6a5100!important;border:1px solid #e4cf85!important}.frendaLocalProfileDelete{background:#fff0f0!important;color:#9b1c1c!important;border:1px solid #efb2b2!important}.frendaLocalTitle{font-size:12px;font-weight:900;margin-top:10px;color:#40515e}
  .frendaLocalAdd{display:grid;grid-template-columns:1fr auto;gap:8px;margin-top:9px}.frendaLocalAdd input{min-width:0}.frendaLocalAdd button{padding:9px 12px!important;border-radius:10px!important;background:#166534!important;color:#fff!important;font-weight:900!important;white-space:nowrap!important}.frendaLocalAdd button:disabled{opacity:.55!important;cursor:not-allowed!important}
  .frendaUnifiedList{display:grid;gap:8px;margin:10px 0}.frendaUnifiedRow{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:5px;min-width:0}.frendaUnifiedRow .frendaUnifiedSelect{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:11px!important;border-radius:11px!important;background:#f2f4f6!important;color:#31424f!important;border:1px solid #c7d0d6!important;font-weight:900!important;text-align:left!important}.frendaUnifiedRow .frendaUnifiedSelect.active{background:#dff3ff!important;color:#075a7a!important;border-color:#69bde4!important}.frendaUnifiedRow .frendaUnifiedSelect.needsAuth{background:#fff7df!important;color:#6a5100!important;border-color:#e4cf85!important}.frendaUnifiedEdit,.frendaUnifiedDelete{width:38px!important;padding:8px 6px!important;border-radius:10px!important;font-weight:900!important}.frendaUnifiedEdit{background:#fff7df!important;color:#6a5100!important;border:1px solid #e4cf85!important}.frendaUnifiedDelete{background:#fff0f0!important;color:#9b1c1c!important;border:1px solid #efb2b2!important}.frendaUnifiedAddChoices{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:9px}.frendaUnifiedAddChoices button{padding:10px!important;border-radius:10px!important;font-weight:900!important}.frendaUnifiedForm{display:none;margin-top:10px;padding:10px;border:1px solid #d3dde3;border-radius:12px;background:#fafcfd}.frendaUnifiedForm.show{display:block}.frendaUnifiedMeta{display:block;font-size:10px;font-weight:700;opacity:.72;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.frendaUnifiedBack{margin-top:8px;background:#edf2f7!important;color:#243747!important}.frendaCloudInfo{font-size:12px;line-height:1.55;color:#64737e;background:#eef9ff;border:1px solid #b9ddeb;border-radius:10px;padding:10px;margin-top:10px}.frendaCloudUser{font-size:13px;font-weight:800;word-break:break-all;margin:6px 0}.frendaCloudStatus{margin-top:9px;font-size:12px;font-weight:800;color:#31566d;min-height:1.4em}
  `;document.head.appendChild(st);
}
function localProfileId(){return testApi()?.localProfileId||"A"}
function localProfileName(){return testApi()?.localProfileName||"ローカルA"}
function localProfiles(){
  const list=testApi()?.localProfiles;
  return Array.isArray(list)&&list.length?list:[{id:"A",name:"ローカルA"},{id:"B",name:"ローカルB"}];
}
function sanitizeName(name){return String(name||"").trim().replace(/\s+/g," ").slice(0,20)}
function metaGet(name){try{return testApi()?.accountGet?.(name)??null}catch{return null}}
function metaSet(name,value){try{return !!testApi()?.accountSet?.(name,value)}catch{return false}}
function readCloudProfiles(){
  try{
    const raw=metaGet(CLOUD_PROFILE_META);if(!raw)return [];
    const a=JSON.parse(raw);if(!Array.isArray(a))return [];
    const out=[],seen=new Set();
    for(const p of a){
      const id=String(p?.id||"").trim().toUpperCase(),userId=String(p?.userId||"").trim(),email=String(p?.email||"").trim(),name=sanitizeName(p?.name),accessToken=String(p?.accessToken||""),refreshToken=String(p?.refreshToken||"");
      if(!/^C[1-9]\d*$/.test(id)||!userId||!email||!name||seen.has(id))continue;
      seen.add(id);out.push({id,userId,email,name,accessToken,refreshToken,expiresAt:Number(p?.expiresAt||0)||0,updatedAt:String(p?.updatedAt||"")});
    }
    return out;
  }catch(e){console.warn("FRENDA_CLOUD_PROFILE_READ_FAILED",e);return []}
}
function writeCloudProfiles(list){return metaSet(CLOUD_PROFILE_META,JSON.stringify(list))}
function cloudProfileById(id){id=String(id||"").trim().toUpperCase();return readCloudProfiles().find(p=>p.id===id)||null}
function cloudProfileByUserId(uid){uid=String(uid||"").trim();return readCloudProfiles().find(p=>p.userId===uid)||null}
function currentCloudProfile(){return cloudProfileById(activeCloudProfileId)||cloudProfileByUserId(session?.user?.id)||null}
function allDisplayNames(excludeType="",excludeId=""){const names=[];for(const p of localProfiles())if(!(excludeType==="local"&&p.id===excludeId))names.push(p.name);for(const p of readCloudProfiles())if(!(excludeType==="cloud"&&p.id===excludeId))names.push(p.name);return names}
function nextCloudProfileId(list=readCloudProfiles()){let max=0;for(const p of list){const m=/^C(\d+)$/.exec(p.id);if(m)max=Math.max(max,Number(m[1])||0)}return `C${max+1}`}
function readActiveAccount(){
  try{const x=JSON.parse(metaGet(ACTIVE_ACCOUNT_META)||"null");if(x?.type==="cloud"&&cloudProfileById(x.id))return {type:"cloud",id:String(x.id).toUpperCase()};if(x?.type==="local"&&localProfiles().some(p=>p.id===String(x.id).toUpperCase()))return {type:"local",id:String(x.id).toUpperCase()}}catch{}
  return {type:"local",id:localProfileId()};
}
function setActiveAccount(type,id){return metaSet(ACTIVE_ACCOUNT_META,JSON.stringify({type,id:String(id||"").toUpperCase()}))}
function sessionUsable(p){return !!(p?.accessToken&&p?.refreshToken)}
function persistCloudProfileSession(profileId,sess,displayName=""){
  if(!sess?.user?.id)return null;
  const list=readCloudProfiles();let p=list.find(x=>x.id===String(profileId||"").toUpperCase())||list.find(x=>x.userId===sess.user.id)||null;
  if(!p)p={id:nextCloudProfileId(list),userId:sess.user.id,email:sess.user.email||"",name:sanitizeName(displayName)||String(sess.user.email||"クラウドユーザー")};
  p={...p,userId:sess.user.id,email:sess.user.email||p.email,name:sanitizeName(displayName)||p.name,accessToken:sess.access_token||p.accessToken,refreshToken:sess.refresh_token||p.refreshToken,expiresAt:Number(sess.expires_at||0)||p.expiresAt||0,updatedAt:new Date().toISOString()};
  const next=list.some(x=>x.id===p.id)?list.map(x=>x.id===p.id?p:x):[...list,p];if(!writeCloudProfiles(next))return null;activeCloudProfileId=p.id;return p;
}
function invalidateCloudProfileAuth(profileId){const list=readCloudProfiles(),id=String(profileId||"").toUpperCase();writeCloudProfiles(list.map(p=>p.id===id?{...p,accessToken:"",refreshToken:"",updatedAt:new Date().toISOString()}:p))}
function renameCloudProfile(profileId){
  if(regressionCaseActive()){setStatus("回帰テスト中はクラウドユーザー名を変更できません。","error");return false}
  const p=cloudProfileById(profileId);if(!p)return false;const entered=prompt(`「${p.name}」の新しい表示名を入力してください（20文字以内）`,p.name);if(entered===null)return false;const name=sanitizeName(entered);if(!name){setStatus("表示名を入力してください。","error");return false}if(allDisplayNames("cloud",p.id).includes(name)){setStatus("同じ表示名のユーザーがあります。","error");return false}if(name===p.name)return true;const list=readCloudProfiles().map(x=>x.id===p.id?{...x,name}:x);if(!writeCloudProfiles(list)){setStatus("表示名を変更できませんでした。","error");return false}closeModal();location.reload();return true;
}
function deleteCloudProfile(profileId){
  if(regressionCaseActive()){setStatus("回帰テスト中はクラウドユーザーを削除できません。","error");return false}
  const p=cloudProfileById(profileId);if(!p)return false;
  const active=!!session&&currentCloudProfile()?.id===p.id;if(active){setStatus("現在使用中のクラウドユーザーは削除できません。先に別のユーザーへ切り替えてください。","error");return false}
  if(!confirm(`「${p.name}」をこの端末のユーザー一覧から削除しますか？\n\nクラウドのセーブデータとSupabaseアカウントは削除されません。`))return false;
  if(!confirm(`最終確認です。\n\nこの端末に記憶した「${p.name}」のログイン情報を削除します。\n再度使う場合は、メールアドレスとパスワードで追加し直してください。`))return false;
  const next=readCloudProfiles().filter(x=>x.id!==p.id);if(!writeCloudProfiles(next)){setStatus("クラウドユーザーを削除できませんでした。","error");return false}
  const a=readActiveAccount();if(a.type==="cloud"&&a.id===p.id)setActiveAccount("local",localProfileId());
  closeModal();location.reload();return true;
}
function activeUserLabel(){
  if(regressionCaseActive())return {mode:session?"cloud":"local",icon:"🔒",text:"回帰テスト",title:"回帰テスト一時データ（永続保存なし）"};
  if(session){const p=currentCloudProfile();const text=p?.name||session.user?.email||"クラウドユーザー";return {mode:"cloud",icon:"☁️",text,title:`${text}（クラウド保存）`}}
  const name=localProfileName();return {mode:"local",icon:"👤",text:name,title:`${name}（この端末に保存）`};
}
async function leaveCloudForLocal(profile){
  if(regressionCaseActive()){setStatus("回帰テスト中はユーザーを切り替えません。","error");return false}
  profile=String(profile||"").trim().toUpperCase();const info=localProfiles().find(x=>x.id===profile);if(!info)return false;if(!confirm(`${info.name}に切り替えますか？`))return false;
  if(cloudMode())await pushNow(true);if(session&&activeCloudProfileId)persistCloudProfileSession(activeCloudProfileId,session);
  testApi()?.deactivateCloud?.();if(!testApi()?.switchLocalProfile?.(profile)){setStatus("ローカルユーザー切替に失敗しました。","error");return false}setActiveAccount("local",profile);closeModal();location.reload();return true;
}
function switchLocalProfile(profile){
  profile=String(profile||"").trim().toUpperCase();if(regressionCaseActive()){setStatus("回帰テスト中はユーザーを切り替えません。","error");return false}const info=localProfiles().find(x=>x.id===profile);if(!info){setStatus("ローカルユーザーが見つかりません。","error");return false}
  if(session||cloudMode()){leaveCloudForLocal(profile);return true}if(profile===localProfileId()){setActiveAccount("local",profile);return true}if(!confirm(`${info.name}に切り替えますか？`))return false;if(!testApi()?.switchLocalProfile?.(profile)){setStatus("ローカルユーザー切替に失敗しました。","error");return false}setActiveAccount("local",profile);closeModal();location.reload();return true;
}
function createLocalProfile(name){
  if(session||cloudMode()){setStatus("ローカルユーザーの追加はローカルユーザーに切り替えてから行ってください。","error");return false}if(regressionCaseActive()){setStatus("回帰テスト中はユーザーを追加できません。","error");return false}name=sanitizeName(name);if(!name){setStatus("ユーザー名を入力してください。","error");return false}if(allDisplayNames().includes(name)){setStatus("同じ表示名のユーザーがあります。","error");return false}if(!confirm(`「${name}」を追加しますか？`))return false;const created=testApi()?.createLocalProfile?.(name);if(!created){setStatus("ローカルユーザーを追加できませんでした。","error");return false}setActiveAccount("local",created.id);closeModal();location.reload();return true;
}
function renameLocalProfile(profile){
  if(session||cloudMode()){setStatus("ローカルユーザー名の変更はローカルユーザーに切り替えてから行ってください。","error");return false}if(regressionCaseActive()){setStatus("回帰テスト中はユーザー名を変更できません。","error");return false}profile=String(profile||"").trim().toUpperCase();const info=localProfiles().find(x=>x.id===profile);if(!info)return false;const entered=prompt(`「${info.name}」の新しい名前を入力してください（20文字以内）`,info.name);if(entered===null)return false;const newName=sanitizeName(entered);if(!newName){setStatus("ユーザー名を入力してください。","error");return false}if(allDisplayNames("local",profile).includes(newName)){setStatus("同じ表示名のユーザーがあります。","error");return false}if(newName===info.name)return true;if(!confirm(`「${info.name}」を「${newName}」に変更しますか？\n\nセーブデータはそのままです。`))return false;const renamed=testApi()?.renameLocalProfile?.(profile,newName);if(!renamed){setStatus("ユーザー名を変更できませんでした。","error");return false}closeModal();location.reload();return true;
}
function deleteLocalProfile(profile){
  profile=String(profile||"").toUpperCase();if(regressionCaseActive()){setStatus("回帰テスト中はユーザーを削除できません。","error");return false}if(session||cloudMode()){setStatus("ローカルユーザーの削除はローカルユーザーに切り替えてから行ってください。","error");return false}const list=localProfiles(),info=list.find(x=>x.id===profile);if(!info)return false;if(list.length<=1){setStatus("ローカルユーザーは最低1人必要です。","error");return false}if(localProfileId()===profile){setStatus("現在使用中のユーザーは削除できません。","error");return false}if(!confirm(`「${info.name}」を削除しますか？\n\nこのユーザーのセーブデータも削除されます。`))return false;if(!confirm(`最終確認です。\n\n「${info.name}」とセーブデータを完全に削除します。\nこの操作は元に戻せません。`))return false;const deleted=testApi()?.deleteLocalProfile?.(profile);if(!deleted){setStatus("ユーザーを削除できませんでした。","error");return false}closeModal();location.reload();return true;
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
function renderUnifiedUsers(){
  const regression=regressionCaseActive(),activeLocal=!session&&!regression?localProfileId():"",clouds=readCloudProfiles(),locals=localProfiles();
  const localRows=locals.map(p=>{const active=activeLocal===p.id,disabled=regression;const edit=active&&!regression?`<button type="button" class="frendaUnifiedEdit" data-local-rename="${escapeHTML(p.id)}" title="現在のユーザー名を変更">✏️</button>`:'<span></span>';return `<div class="frendaUnifiedRow"><button type="button" class="frendaUnifiedSelect ${active?'active':''}" data-user-type="local" data-user-id="${escapeHTML(p.id)}" ${disabled?'disabled':''}>👤 ${escapeHTML(p.name)}${active?'<span class="frendaUnifiedMeta">使用中・この端末に保存</span>':'<span class="frendaUnifiedMeta">この端末に保存</span>'}</button>${edit}<button type="button" class="frendaUnifiedDelete" data-local-delete="${escapeHTML(p.id)}" ${disabled||active||locals.length<=1?'disabled':''} title="${active?'使用中のユーザーは削除できません':'この端末から削除'}">🗑️</button></div>`}).join("");
  const cloudRows=clouds.map(p=>{const active=!!session&&currentCloudProfile()?.id===p.id,needs=!sessionUsable(p);const edit=active&&!regression?`<button type="button" class="frendaUnifiedEdit" data-cloud-rename="${escapeHTML(p.id)}" title="現在のユーザー名を変更">✏️</button>`:'<span></span>';return `<div class="frendaUnifiedRow"><button type="button" class="frendaUnifiedSelect ${active?'active':''} ${needs?'needsAuth':''}" data-user-type="cloud" data-user-id="${escapeHTML(p.id)}" ${regression?'disabled':''}>☁️ ${escapeHTML(p.name)}<span class="frendaUnifiedMeta">${active?'使用中・クラウド保存':needs?'再ログインが必要':escapeHTML(p.email)}</span></button>${edit}<button type="button" class="frendaUnifiedDelete" data-cloud-delete="${escapeHTML(p.id)}" ${regression||active?'disabled':''} title="${active?'使用中のユーザーは削除できません':'この端末の一覧から削除'}">🗑️</button></div>`}).join("");
  return localRows+cloudRows;
}
function showAddForm(kind,profileId=""){
  if(!modal)return;modal.querySelectorAll('.frendaUnifiedForm').forEach(x=>x.classList.remove('show'));
  const el=modal.querySelector(kind==='cloud'?'#frendaCloudAddForm':'#frendaLocalAddForm');if(el)el.classList.add('show');
  if(kind==='cloud'&&profileId){const p=cloudProfileById(profileId);pendingCloudProfileId=profileId;const n=modal.querySelector('#frendaCloudDisplayName'),e=modal.querySelector('#frendaCloudEmail');if(n)n.value=p?.name||'';if(e){e.value=p?.email||'';e.readOnly=!!p}}
  else if(kind==='cloud')pendingCloudProfileId="";
}
function openModal(){
  closeModal();modal=document.createElement("div");modal.className="frendaCloudOverlay";const regression=regressionCaseActive(),label=activeUserLabel();
  modal.innerHTML=`<div class="frendaCloudPanel" role="dialog" aria-modal="true"><div class="frendaCloudHead"><b>ユーザーを選ぶ</b><button type="button" class="frendaCloudClose">閉じる</button></div><div class="frendaCloudInfo"><b>現在：${escapeHTML(label.icon+' '+label.text)}</b><br>👤はこの端末、☁️はクラウドに保存します。ローカルとクラウドは同期しません。${regression?'<br><b>🔒 回帰テスト中は切替・追加・変更・永続保存を行いません。</b>':''}<br><small>Cloud Test v${CLOUD_TEST_VERSION}</small></div><div class="frendaUnifiedList">${renderUnifiedUsers()}</div><div class="frendaUnifiedAddChoices"><button type="button" id="frendaAddLocal" ${regression?'disabled':''}>＋ この端末に追加</button><button type="button" id="frendaAddCloud" ${regression?'disabled':''}>＋ クラウドを追加</button></div><div id="frendaLocalAddForm" class="frendaUnifiedForm"><label>ユーザー名</label><input id="frendaLocalNewName" maxlength="20" placeholder="例：ぱぱ"><div class="frendaCloudActions"><button type="button" id="frendaLocalAddBtn" class="frendaCloudPrimary wide">追加する</button></div></div><div id="frendaCloudAddForm" class="frendaUnifiedForm"><label>表示名</label><input id="frendaCloudDisplayName" maxlength="20" placeholder="例：長女"><label>メールアドレス</label><input id="frendaCloudEmail" type="email" autocomplete="username"><label>パスワード</label><input id="frendaCloudPassword" type="password" autocomplete="current-password"><div class="frendaCloudInfo">初回だけメールアドレスとパスワードで認証します。<b>パスワードは端末に保存しません。</b> 認証後はSupabaseのセッションを記憶し、通常は一覧からタップするだけで切り替えます。</div><div class="frendaCloudActions"><button type="button" id="frendaCloudAddBtn" class="frendaCloudPrimary wide">認証して追加</button></div></div><div id="frendaCloudStatus" class="frendaCloudStatus">${escapeHTML(statusText)}</div></div>`;
  document.body.appendChild(modal);modal.addEventListener("click",e=>{if(e.target===modal)closeModal()});modal.querySelector('.frendaCloudClose').onclick=closeModal;
  modal.querySelectorAll('[data-user-type="local"]').forEach(el=>el.onclick=()=>switchLocalProfile(el.dataset.userId));
  modal.querySelectorAll('[data-user-type="cloud"]').forEach(el=>el.onclick=()=>switchCloudProfile(el.dataset.userId));
  modal.querySelectorAll('[data-local-rename]').forEach(el=>el.onclick=()=>renameLocalProfile(el.dataset.localRename));
  modal.querySelectorAll('[data-local-delete]').forEach(el=>el.onclick=()=>deleteLocalProfile(el.dataset.localDelete));
  modal.querySelectorAll('[data-cloud-rename]').forEach(el=>el.onclick=()=>renameCloudProfile(el.dataset.cloudRename));
  modal.querySelectorAll('[data-cloud-delete]').forEach(el=>el.onclick=()=>deleteCloudProfile(el.dataset.cloudDelete));
  const al=modal.querySelector('#frendaAddLocal'),ac=modal.querySelector('#frendaAddCloud');if(al)al.onclick=()=>showAddForm('local');if(ac)ac.onclick=()=>showAddForm('cloud');
  const lab=modal.querySelector('#frendaLocalAddBtn');if(lab)lab.onclick=()=>createLocalProfile(modal.querySelector('#frendaLocalNewName')?.value||'');
  const cab=modal.querySelector('#frendaCloudAddBtn');if(cab)cab.onclick=()=>addOrReauthCloudProfile(modal.querySelector('#frendaCloudDisplayName')?.value||'',modal.querySelector('#frendaCloudEmail')?.value||'',modal.querySelector('#frendaCloudPassword')?.value||'',pendingCloudProfileId);
}
async function ensureClient(){
  if(client)return client;if(!window.supabase?.createClient)throw new Error("認証ライブラリ未接続");
  client=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:true,detectSessionInUrl:false}});
  const listener=client.auth.onAuthStateChange((_event,newSession)=>{session=newSession||null;if(session&&activeCloudProfileId)persistCloudProfileSession(activeCloudProfileId,session);updateUserBadge()});authUnsub=listener?.data?.subscription||null;return client;
}
async function addOrReauthCloudProfile(displayName,email,password,profileId=""){
  if(regressionCaseActive()){setStatus("回帰テスト中はクラウドユーザーを追加できません。","error");return false}
  displayName=sanitizeName(displayName);email=String(email||"").trim();if(!displayName||!email||!password){setStatus("表示名・メールアドレス・パスワードを入力してください。","error");return false}
  const existing=profileId?cloudProfileById(profileId):null;if(!existing&&allDisplayNames().includes(displayName)){setStatus("同じ表示名のユーザーがあります。","error");return false}if(existing&&allDisplayNames("cloud",existing.id).includes(displayName)){setStatus("同じ表示名のユーザーがあります。","error");return false}
  const previousProfileId=activeCloudProfileId;
  try{
    await ensureClient();if(cloudMode())await pushNow(true);if(session&&previousProfileId)persistCloudProfileSession(previousProfileId,session);
    activeCloudProfileId=existing?.id||"";setStatus("認証中…");
    const {data,error}=await client.auth.signInWithPassword({email,password});if(error)throw error;session=data.session||null;if(!session)throw new Error("ログインセッションを取得できません");if(existing?.userId&&existing.userId!==session.user.id)throw new Error("登録済みユーザーと異なるアカウントです");
    const p=persistCloudProfileSession(existing?.id||"",session,displayName);if(!p)throw new Error("端末へのユーザー登録に失敗しました");activeCloudProfileId=p.id;setActiveAccount("cloud",p.id);const {data:row,error:rowError}=await rowForUser();if(rowError)throw rowError;activatePayload(row?.[columnName()]??null);closeModal();location.reload();return true;
  }catch(e){activeCloudProfileId=previousProfileId;console.error("FRENDA_CLOUD_PROFILE_LOGIN_FAILED",e);setStatus("ログイン失敗："+(e?.message||e),"error");return false}
}
async function restoreCloudProfileSession(profile){
  if(!profile||!sessionUsable(profile))return false;try{await ensureClient();activeCloudProfileId=profile.id;const {data,error}=await client.auth.setSession({access_token:profile.accessToken,refresh_token:profile.refreshToken});if(error||!data?.session)throw error||new Error("セッションを復元できません");if(data.session.user?.id!==profile.userId)throw new Error("保存された認証情報のユーザーが一致しません");session=data.session;persistCloudProfileSession(profile.id,session);return true}catch(e){console.warn("FRENDA_CLOUD_PROFILE_RESTORE_FAILED",profile?.id,e);invalidateCloudProfileAuth(profile?.id);session=null;return false}
}
async function switchCloudProfile(profileId){
  if(regressionCaseActive()){setStatus("回帰テスト中はユーザーを切り替えません。","error");return false}const p=cloudProfileById(profileId);if(!p)return false;
  if(session&&currentCloudProfile()?.id===p.id){setActiveAccount("cloud",p.id);return true}if(!confirm(`「${p.name}」に切り替えますか？`))return false;if(cloudMode())await pushNow(true);if(session&&activeCloudProfileId)persistCloudProfileSession(activeCloudProfileId,session);
  if(!sessionUsable(p)){showAddForm('cloud',p.id);setStatus("認証期限切れです。パスワードを入力して再ログインしてください。","error");return false}
  setStatus(`${p.name}に切り替えています…`);if(!await restoreCloudProfileSession(p)){showAddForm('cloud',p.id);setStatus("再ログインが必要です。パスワードを入力してください。","error");return false}
  setActiveAccount("cloud",p.id);const {data:row,error}=await rowForUser();if(error){setStatus("クラウドセーブ確認失敗："+error.message,"error");return false}activatePayload(row?.[columnName()]??null);closeModal();location.reload();return true;
}
async function rowForUser(){if(!session)return {data:null,error:new Error("not signed in")};return await client.from(TABLE).select(`user_id,${columnName()},updated_at`).eq("user_id",session.user.id).maybeSingle()}
function cachePayload(payload){try{testApi()?.writeCloudCache?.(payload,session?.user?.id)}catch(e){console.warn("FRENDA_TEST_CACHE_WRITE",e)}}
function activatePayload(payload){testApi()?.activateCloud?.(session.user.id,payload??null)}
function subscribeStorage(){
  storageUnsub?.();storageUnsub=null;if(regressionCaseActive())return;const s=testApi()?.storage;if(!s?.subscribe)return;
  storageUnsub=s.subscribe(ev=>{if(!cloudMode()||syncing)return;if(ev.type==="clear"||(ev.key&&cfg?.watchStorage?.(String(ev.key))))scheduleSync()});
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
  const active=readActiveAccount();
  if(active.type!=="cloud"){
    activeCloudProfileId="";session=null;const wasCloud=testApi()?.mode==="cloud";testApi()?.deactivateCloud?.();setStatus(`${localProfileName()}・この端末に保存`);if(wasCloud){location.reload();return}return;
  }
  const profile=cloudProfileById(active.id);if(!profile){setActiveAccount("local",localProfileId());testApi()?.deactivateCloud?.();setStatus("クラウドユーザー情報が見つからないためローカルへ戻しました。","error");return}
  if(!await restoreCloudProfileSession(profile)){
    setActiveAccount("local",localProfileId());testApi()?.deactivateCloud?.();setStatus(`${profile.name}は再ログインが必要です。ユーザー一覧から選択してください。`,`error`);return;
  }
  const uid=session.user.id;activeCloudProfileId=profile.id;
  if(testApi()?.mode!=="cloud"||testApi()?.cloudUserId!==uid){const {data,error}=await rowForUser();if(error){setStatus("クラウドセーブ確認失敗","error");return}activatePayload(data?.[columnName()]??null);location.reload();return}
  const {data,error}=await rowForUser();if(error){setStatus("クラウド読込エラー","error");return}const remote=data?.[columnName()]??null,current=cfg?.getData?.()??null,cached=testApi()?.readCloudCache?.(uid)??null;
  if(regressionCaseActive()){const remoteStr=safeJSON(remote),cachedStr=safeJSON(cached);if(remote&&remoteStr!==cachedStr){activatePayload(remote);lastUploaded=remoteStr;location.reload();return}lastUploaded=remoteStr;storageUnsub?.();storageUnsub=null;setStatus(REGRESSION_SAVE_BLOCK_TEXT);return}
  if(remote){const remoteStr=safeJSON(remote),currentStr=safeJSON(current),cachedStr=safeJSON(cached);if(remoteStr!==cachedStr){activatePayload(remote);lastUploaded=remoteStr;location.reload();return}if(currentStr!==remoteStr){await pushNow(true)}else{lastUploaded=remoteStr;cachePayload(remote)}}else{await pushNow(true)}subscribeStorage();setStatus(`${profile.name}・クラウド保存`);
}
async function init(options){
  cfg=options||{};injectButton();ensureLauncher();try{await ensureClient()}catch(e){setStatus(e?.message||"認証ライブラリ未接続","error");return}ensureUserBadge();updateUserBadge();await initializeCloudSession();updateUserBadge();
}
window.FrendaCloud={
  version:`test-${CLOUD_TEST_VERSION}`,testMode:true,cloudOnly:true,localCloudSync:false,unifiedUsers:true,rememberedCloudProfiles:true,passwordStored:false,regressionSaveGuard:true,localProfiles:true,localProfileAdd:true,localProfileRename:true,localProfileDelete:true,cloudProfileRename:true,cloudProfileDelete:true,isRegressionCase:regressionCaseActive,
  init,scheduleSync,pushNow,pullNow,isLoggedIn:()=>!!session,getUser:()=>session?.user||null,getCloudProfiles:()=>readCloudProfiles().map(p=>({id:p.id,userId:p.userId,email:p.email,name:p.name,remembered:sessionUsable(p)})),open:openModal
};
})();
/* Ver1.1: クラウド切替にも確認を追加。名前変更✏️は現在使用中ユーザーだけ表示。クラウド🗑️を追加し、この端末の登録/認証セッションだけ削除（Supabaseアカウント・クラウドセーブは保持）。Updated: 2026-10-11 08:43 JST */
