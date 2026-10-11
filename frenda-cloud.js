/* FRENDA_CLOUD_VERSION: 1.5 / production unified local+cloud user list + remembered cloud sessions + cloud-only save; local and cloud saves NEVER synchronize */
(()=>{
"use strict";
if(!window.FRENDA_USER?.active)return;

const CLOUD_VERSION="1.5";
const SUPABASE_URL="https://rzacvrioutgsaimobins.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_H9HFETl_RY8B3Wgr_vYV0Q_a-JPngR4";
const TABLE="frenda_saves";

let client=null,session=null,cfg=null,authUnsub=null,button=null,modal=null,launcherObserver=null,storageUnsub=null,syncTimer=null,userBadge=null;
let statusText="ローカルユーザー",syncing=false,lastUploaded="",activeCloudProfileId="",pendingCloudProfileId="";
const CLOUD_PROFILE_META="cloud-profiles:v1";
const ACTIVE_ACCOUNT_META="active-user:v1";

function escapeHTML(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function safeJSON(v){try{return JSON.stringify(v??null)}catch{return ""}}
function userApi(){return window.FRENDA_USER}
function cloudMode(){return !!session&&userApi()?.mode==="cloud"&&userApi()?.cloudUserId===session?.user?.id}
function columnName(){return cfg?.column||"simulator_data"}
const REGRESSION_SAVE_BLOCK_TEXT="";
function regressionCaseActive(){return false}
function setStatus(text,kind=""){
  statusText=text;
  if(button){const prefix=kind==="error"?"⚠️":session?"☁️":"👤";button.textContent=`${prefix} ${text}`;button.dataset.kind=kind;}
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
function localProfileId(){return userApi()?.localProfileId||"A"}
function localProfileName(){return userApi()?.localProfileName||"ローカルA"}
function localProfiles(){
  const list=userApi()?.localProfiles;
  return Array.isArray(list)&&list.length?list:[{id:"A",name:"ローカルA"},{id:"B",name:"ローカルB"}];
}
function sanitizeName(name){return String(name||"").trim().replace(/\s+/g," ").slice(0,20)}
function metaGet(name){try{return userApi()?.accountGet?.(name)??null}catch{return null}}
function metaSet(name,value){try{return !!userApi()?.accountSet?.(name,value)}catch{return false}}
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
function migrateLegacySupabaseSession(){
  try{
    if(readCloudProfiles().length)return false;
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i)||"";if(!/^sb-.*-auth-token$/.test(k))continue;
      const raw=localStorage.getItem(k);if(!raw)continue;let x;try{x=JSON.parse(raw)}catch{continue}
      const s=x?.currentSession||x?.session||x;
      const user=s?.user;if(!user?.id||!user?.email||!s?.access_token||!s?.refresh_token)continue;
      const p={id:"C1",userId:String(user.id),email:String(user.email),name:String(user.email),accessToken:String(s.access_token),refreshToken:String(s.refresh_token),expiresAt:Number(s.expires_at||0)||0,updatedAt:new Date().toISOString()};
      if(!writeCloudProfiles([p]))return false;
      if(userApi()?.mode==="cloud"&&userApi()?.cloudUserId===p.userId)setActiveAccount("cloud",p.id);
      return true;
    }
  }catch(e){console.warn("FRENDA_CLOUD_LEGACY_SESSION_MIGRATION_FAILED",e)}
  return false;
}
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
  userApi()?.deactivateCloud?.();if(!userApi()?.switchLocalProfile?.(profile)){setStatus("ローカルユーザー切替に失敗しました。","error");return false}setActiveAccount("local",profile);closeModal();location.reload();return true;
}
function switchLocalProfile(profile){
  profile=String(profile||"").trim().toUpperCase();if(regressionCaseActive()){setStatus("回帰テスト中はユーザーを切り替えません。","error");return false}const info=localProfiles().find(x=>x.id===profile);if(!info){setStatus("ローカルユーザーが見つかりません。","error");return false}
  if(session||cloudMode()){leaveCloudForLocal(profile);return true}if(profile===localProfileId()){setActiveAccount("local",profile);return true}if(!confirm(`${info.name}に切り替えますか？`))return false;if(!userApi()?.switchLocalProfile?.(profile)){setStatus("ローカルユーザー切替に失敗しました。","error");return false}setActiveAccount("local",profile);closeModal();location.reload();return true;
}
function createLocalProfile(name){
  if(session||cloudMode()){setStatus("ローカルユーザーの追加はローカルユーザーに切り替えてから行ってください。","error");return false}if(regressionCaseActive()){setStatus("回帰テスト中はユーザーを追加できません。","error");return false}name=sanitizeName(name);if(!name){setStatus("ユーザー名を入力してください。","error");return false}if(allDisplayNames().includes(name)){setStatus("同じ表示名のユーザーがあります。","error");return false}if(!confirm(`「${name}」を追加しますか？`))return false;const created=userApi()?.createLocalProfile?.(name);if(!created){setStatus("ローカルユーザーを追加できませんでした。","error");return false}setActiveAccount("local",created.id);closeModal();location.reload();return true;
}
function renameLocalProfile(profile){
  if(regressionCaseActive()){setStatus("回帰テスト中はユーザー名を変更できません。","error");return false}profile=String(profile||"").trim().toUpperCase();const info=localProfiles().find(x=>x.id===profile);if(!info)return false;const entered=prompt(`「${info.name}」の新しい名前を入力してください（20文字以内）`,info.name);if(entered===null)return false;const newName=sanitizeName(entered);if(!newName){setStatus("ユーザー名を入力してください。","error");return false}if(allDisplayNames("local",profile).includes(newName)){setStatus("同じ表示名のユーザーがあります。","error");return false}if(newName===info.name)return true;if(!confirm(`「${info.name}」を「${newName}」に変更しますか？\n\nセーブデータはそのままです。`))return false;const renamed=userApi()?.renameLocalProfile?.(profile,newName);if(!renamed){setStatus("ユーザー名を変更できませんでした。","error");return false}closeModal();location.reload();return true;
}
function deleteLocalProfile(profile){
  profile=String(profile||"").toUpperCase();if(regressionCaseActive()){setStatus("回帰テスト中はユーザーを削除できません。","error");return false}if(session||cloudMode()){setStatus("ローカルユーザーの削除はローカルユーザーに切り替えてから行ってください。","error");return false}const list=localProfiles(),info=list.find(x=>x.id===profile);if(!info)return false;if(list.length<=1){setStatus("ローカルユーザーは最低1人必要です。","error");return false}if(localProfileId()===profile){setStatus("現在使用中のユーザーは削除できません。","error");return false}if(!confirm(`「${info.name}」を削除しますか？\n\nこのユーザーのセーブデータも削除されます。`))return false;if(!confirm(`最終確認です。\n\n「${info.name}」とセーブデータを完全に削除します。\nこの操作は元に戻せません。`))return false;const deleted=userApi()?.deleteLocalProfile?.(profile);if(!deleted){setStatus("ユーザーを削除できませんでした。","error");return false}closeModal();location.reload();return true;
}
function userBadgeTarget(){
  if(document.getElementById("headerMainTitle"))return document.querySelector(".careCluster")||document.querySelector(".headerTop")||document.querySelector("header");
  if(document.getElementById("expSharedStatus074"))return document.getElementById("expSharedStatus074")||document.querySelector(".headerTop")||document.querySelector("header");
  return document.querySelector(".headerTop")||document.querySelector("header")||document.body;
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

function injectButton(){
  injectStyles();ensureUserBadge();
}
function closeModal(){modal?.remove();modal=null}
function renderUnifiedUsers(){
  const regression=regressionCaseActive(),activeLocal=!session&&!regression?localProfileId():"",clouds=readCloudProfiles(),locals=localProfiles();
  const localRows=locals.map(p=>{const active=activeLocal===p.id,disabled=regression;const edit=!regression?`<button type="button" class="frendaUnifiedEdit" data-local-rename="${escapeHTML(p.id)}" title="表示名を変更">✏️</button>`:'<span></span>';return `<div class="frendaUnifiedRow"><button type="button" class="frendaUnifiedSelect ${active?'active':''}" data-user-type="local" data-user-id="${escapeHTML(p.id)}" ${disabled?'disabled':''}>👤 ${escapeHTML(p.name)}${active?'<span class="frendaUnifiedMeta">使用中・この端末に保存</span>':'<span class="frendaUnifiedMeta">この端末に保存</span>'}</button>${edit}<button type="button" class="frendaUnifiedDelete" data-local-delete="${escapeHTML(p.id)}" ${disabled||active||locals.length<=1?'disabled':''} title="${active?'使用中のユーザーは削除できません':'この端末から削除'}">🗑️</button></div>`}).join("");
  const cloudRows=clouds.map(p=>{const active=!!session&&currentCloudProfile()?.id===p.id,needs=!sessionUsable(p);const edit=!regression?`<button type="button" class="frendaUnifiedEdit" data-cloud-rename="${escapeHTML(p.id)}" title="表示名を変更">✏️</button>`:'<span></span>';return `<div class="frendaUnifiedRow"><button type="button" class="frendaUnifiedSelect ${active?'active':''} ${needs?'needsAuth':''}" data-user-type="cloud" data-user-id="${escapeHTML(p.id)}" ${regression?'disabled':''}>☁️ ${escapeHTML(p.name)}<span class="frendaUnifiedMeta">${active?'使用中・クラウド保存':needs?'再ログインが必要':escapeHTML(p.email)}</span></button>${edit}<button type="button" class="frendaUnifiedDelete" data-cloud-delete="${escapeHTML(p.id)}" ${regression||active?'disabled':''} title="${active?'使用中のユーザーは削除できません':'この端末の一覧から削除'}">🗑️</button></div>`}).join("");
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
  modal.innerHTML=`<div class="frendaCloudPanel" role="dialog" aria-modal="true"><div class="frendaCloudHead"><b>ユーザーを選ぶ</b><button type="button" class="frendaCloudClose">閉じる</button></div><div class="frendaCloudInfo"><b>現在：${escapeHTML(label.icon+' '+label.text)}</b><br>👤はこの端末、☁️はクラウドに保存します。ローカルとクラウドは同期しません。${regression?'<br><b>🔒 回帰テスト中は切替・追加・変更・永続保存を行いません。</b>':''}<br><small>Cloud v${CLOUD_VERSION}</small></div><div class="frendaUnifiedList">${renderUnifiedUsers()}</div><div class="frendaUnifiedAddChoices"><button type="button" id="frendaAddLocal" ${regression?'disabled':''}>＋ この端末に追加</button><button type="button" id="frendaAddCloud" ${regression?'disabled':''}>＋ クラウドを追加</button></div><div id="frendaLocalAddForm" class="frendaUnifiedForm"><label>ユーザー名</label><input id="frendaLocalNewName" maxlength="20" placeholder="例：ぱぱ"><div class="frendaCloudActions"><button type="button" id="frendaLocalAddBtn" class="frendaCloudPrimary wide">追加する</button></div></div><div id="frendaCloudAddForm" class="frendaUnifiedForm"><label>表示名</label><input id="frendaCloudDisplayName" maxlength="20" placeholder="例：長女"><label>メールアドレス</label><input id="frendaCloudEmail" type="email" autocomplete="username"><label>パスワード</label><input id="frendaCloudPassword" type="password" autocomplete="current-password"><div class="frendaCloudInfo">初回だけメールアドレスとパスワードで認証します。<b>パスワードは端末に保存しません。</b> 認証後はSupabaseのセッションを記憶し、通常は一覧からタップするだけで切り替えます。</div><div class="frendaCloudActions"><button type="button" id="frendaCloudAddBtn" class="frendaCloudPrimary wide">認証して追加</button></div></div><div id="frendaCloudStatus" class="frendaCloudStatus">${escapeHTML(statusText)}</div></div>`;
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
  const listener=client.auth.onAuthStateChange((_event,newSession)=>{session=newSession||null;if(session&&activeCloudProfileId)persistCloudProfileSession(activeCloudProfileId,session);userApi()?.refreshUI?.()});authUnsub=listener?.data?.subscription||null;return client;
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
async function leaveCloudDirect(){
  try{
    if(cloudMode())await pushNow(true);
    if(session&&activeCloudProfileId)persistCloudProfileSession(activeCloudProfileId,session);
    userApi()?.deactivateCloud?.();
    session=null;activeCloudProfileId="";
    userApi()?.refreshUI?.();
    return true;
  }catch(e){console.error("FRENDA_CLOUD_LEAVE_FAILED",e);return false}
}
async function activateProfileDirect(profileId){
  const p=cloudProfileById(profileId);if(!p)return {ok:false,message:"クラウドユーザーが見つかりません"};
  if(session&&currentCloudProfile()?.id===p.id)return {ok:true,profileId:p.id};
  if(cloudMode())await pushNow(true);
  if(session&&activeCloudProfileId)persistCloudProfileSession(activeCloudProfileId,session);
  if(!sessionUsable(p))return {ok:false,needsAuth:true,profile:p};
  if(!await restoreCloudProfileSession(p))return {ok:false,needsAuth:true,profile:p};
  const {data:row,error}=await rowForUser();if(error)return {ok:false,message:"クラウドセーブ確認失敗："+error.message};
  activatePayload(row?.[columnName()]??null);activeCloudProfileId=p.id;userApi()?.refreshUI?.();
  return {ok:true,profileId:p.id};
}
async function authenticateProfileDirect({displayName,email,password,profileId=""}={}){
  displayName=sanitizeName(displayName);email=String(email||"").trim();
  if(!displayName||!email||!password)return {ok:false,message:"表示名・メールアドレス・パスワードを入力してください。"};
  const existing=profileId?cloudProfileById(profileId):null,previous=activeCloudProfileId;
  try{
    await ensureClient();
    if(cloudMode())await pushNow(true);
    if(session&&previous)persistCloudProfileSession(previous,session);
    activeCloudProfileId=existing?.id||"";
    const {data,error}=await client.auth.signInWithPassword({email,password});if(error)throw error;
    session=data.session||null;if(!session)throw new Error("ログインセッションを取得できません");
    if(existing?.userId&&existing.userId!==session.user.id)throw new Error("登録済みユーザーと異なるアカウントです");
    const p=persistCloudProfileSession(existing?.id||"",session,displayName);if(!p)throw new Error("端末へのユーザー登録に失敗しました");
    activeCloudProfileId=p.id;
    const {data:row,error:rowError}=await rowForUser();if(rowError)throw rowError;
    activatePayload(row?.[columnName()]??null);userApi()?.refreshUI?.();
    return {ok:true,profileId:p.id};
  }catch(e){
    activeCloudProfileId=previous;
    console.error("FRENDA_CLOUD_PROVIDER_LOGIN_FAILED",e);
    return {ok:false,message:"ログイン失敗："+(e?.message||e)};
  }
}
async function renameProfileDirect(profileId,name){
  const p=cloudProfileById(profileId);name=sanitizeName(name);if(!p||!name)return false;
  if(allDisplayNames("cloud",p.id).includes(name))return false;
  const ok=writeCloudProfiles(readCloudProfiles().map(x=>x.id===p.id?{...x,name}:x));if(ok)userApi()?.refreshUI?.();return ok;
}
async function deleteProfileDirect(profileId){
  const p=cloudProfileById(profileId);if(!p)return false;
  if(session&&currentCloudProfile()?.id===p.id)return false;
  const ok=writeCloudProfiles(readCloudProfiles().filter(x=>x.id!==p.id));
  if(ok){const a=readActiveAccount();if(a.type==="cloud"&&a.id===p.id)setActiveAccount("local",localProfileId());userApi()?.refreshUI?.()}
  return ok;
}
async function rowForUser(){if(!session)return {data:null,error:new Error("not signed in")};return await client.from(TABLE).select(`user_id,${columnName()},updated_at`).eq("user_id",session.user.id).maybeSingle()}
function cachePayload(payload){try{userApi()?.writeCloudCache?.(payload,session?.user?.id)}catch(e){console.warn("FRENDA_USER_CACHE_WRITE",e)}}
function activatePayload(payload){userApi()?.activateCloud?.(session.user.id,payload??null)}
function subscribeStorage(){
  storageUnsub?.();storageUnsub=null;if(regressionCaseActive())return;const s=userApi()?.storage;if(!s?.subscribe)return;
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
  }catch(e){console.error("FrendaCloud push",e);setStatus("クラウド保存エラー","error");return false}
  finally{syncing=false}
}
async function pullNow(force=false){
  if(!session||syncing)return false;syncing=true;setStatus("クラウド読込中…");
  try{
    const {data,error}=await rowForUser();if(error)throw error;const payload=data?.[columnName()]??null;
    if(!payload){if(force)setStatus("クラウドセーブはまだありません");return false}
    activatePayload(payload);lastUploaded=safeJSON(payload);setStatus("クラウドから読み込みました");closeModal();location.reload();return true;
  }catch(e){console.error("FrendaCloud pull",e);setStatus("クラウド読込エラー","error");return false}
  finally{syncing=false}
}
async function initializeCloudSession(){
  migrateLegacySupabaseSession();
  const active=readActiveAccount();
  if(active.type!=="cloud"){
    activeCloudProfileId="";session=null;const wasCloud=userApi()?.mode==="cloud";userApi()?.deactivateCloud?.();setStatus(`${localProfileName()}・この端末に保存`);if(wasCloud){location.reload();return}return;
  }
  const profile=cloudProfileById(active.id);if(!profile){setActiveAccount("local",localProfileId());userApi()?.deactivateCloud?.();setStatus("クラウドユーザー情報が見つからないためローカルへ戻しました。","error");return}
  if(!await restoreCloudProfileSession(profile)){
    setActiveAccount("local",localProfileId());userApi()?.deactivateCloud?.();setStatus(`${profile.name}は再ログインが必要です。ユーザー一覧から選択してください。`,`error`);return;
  }
  const uid=session.user.id;activeCloudProfileId=profile.id;
  if(userApi()?.mode!=="cloud"||userApi()?.cloudUserId!==uid){const {data,error}=await rowForUser();if(error){setStatus("クラウドセーブ確認失敗","error");return}activatePayload(data?.[columnName()]??null);location.reload();return}
  const {data,error}=await rowForUser();if(error){setStatus("クラウド読込エラー","error");return}const remote=data?.[columnName()]??null,current=cfg?.getData?.()??null,cached=userApi()?.readCloudCache?.(uid)??null;
  if(regressionCaseActive()){const remoteStr=safeJSON(remote),cachedStr=safeJSON(cached);if(remote&&remoteStr!==cachedStr){activatePayload(remote);lastUploaded=remoteStr;location.reload();return}lastUploaded=remoteStr;storageUnsub?.();storageUnsub=null;setStatus(REGRESSION_SAVE_BLOCK_TEXT);return}
  if(remote){const remoteStr=safeJSON(remote),currentStr=safeJSON(current),cachedStr=safeJSON(cached);if(remoteStr!==cachedStr){activatePayload(remote);lastUploaded=remoteStr;location.reload();return}if(currentStr!==remoteStr){await pushNow(true)}else{lastUploaded=remoteStr;cachePayload(remote)}}else{await pushNow(true)}subscribeStorage();setStatus(`${profile.name}・クラウド保存`);
}
async function init(options){
  cfg=options||{};try{await ensureClient()}catch(e){setStatus(e?.message||"認証ライブラリ未接続","error");return}await initializeCloudSession();userApi()?.refreshUI?.();
}
const provider={
  version:CLOUD_VERSION,testMode:false,cloudOnly:true,localCloudSync:false,passwordStored:false,
  getProfiles:()=>readCloudProfiles().map(p=>({id:p.id,userId:p.userId,email:p.email,name:p.name,remembered:sessionUsable(p)})),
  getActiveProfile:()=>{const p=currentCloudProfile();return p?{id:p.id,userId:p.userId,email:p.email,name:p.name,remembered:sessionUsable(p)}:null},
  activateProfile:activateProfileDirect,authenticateProfile:authenticateProfileDirect,renameProfile:renameProfileDirect,deleteProfile:deleteProfileDirect,leaveCloud:leaveCloudDirect
};
userApi()?.registerCloudProvider?.(provider);
window.FrendaCloud={
  version:CLOUD_VERSION,profileMode:true,testMode:false,cloudOnly:true,localCloudSync:false,sharedUserUI:true,rememberedCloudProfiles:true,passwordStored:false,unifiedEntryOnlySupported:true,
  init,scheduleSync,pushNow,pullNow,isLoggedIn:()=>!!session,getUser:()=>session?.user||null,getCloudProfiles:provider.getProfiles,open:()=>userApi()?.open?.(),provider
};
})();
/* Ver1.5 Foundation Phase2 hotfix: 共通frenda-user.js Ver1.2へUIを完全移管。Cloud本番はSupabase認証・保存だけを担うheadless providerとしてregisterCloudProviderする。パスワード非保存・ローカル/クラウド非同期を維持。Updated: 2026-10-11 12:40 JST */

/* Legacy simulator cloud path: used only when FRENDA_USER is not active. */
if(!window.FRENDA_USER?.active){
(()=>{
"use strict";

const CLOUD_VERSION="1.5";
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
/* FRENDA_CLOUD_VERSION 1.4: unified production users for FRENDA_USER apps; simulator legacy path retained unchanged in behavior. Updated: 2026-10-11 11:20 JST */
