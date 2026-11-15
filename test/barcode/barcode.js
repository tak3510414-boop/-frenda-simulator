/* FRENDA_BARCODE_VERSION: 0.8 / isolated TEST prototype / regional starter trios */
(()=>{
'use strict';
const VERSION='0.8';
const DB=window.FRENDA_MASTER,CORE=window.FRENDA_CORE;
const app=document.getElementById('app');
const STORE_KEY='frenda:barcode:test:ver02:state';
const REG_KEY='frenda:barcode:test:ver02:registry';
const AUDIO_KEY='frenda:barcode:test:ver02:audio';
const GIFT_KEY='frenda:barcode:test:ver06:gift:registry';
const SPEED_KEY='frenda:barcode:test:ver06:auto-speed';
const RATES=[['2',45],['3',30],['4',15],['5',5],['special',5]];
const STAT_KEYS=['hp','atk','def','sp_atk','sp_def'];
const BOOST_RATE=1.30,BOOST_LIMIT=3;
const PREMIUM_RATES=[['4',80],['5',15],['special',5]];
const TICKET_TYPES=['2','3','4','5','special','premium'];
const byId=new Map((DB?.records||[]).map(r=>[String(r.master_id),r]));
const RATE_POOLS=Object.fromEntries(RATES.map(([k])=>[k,(DB?.records||[]).filter(r=>group(r)===k&&battleOK(r))]));
// The same nine regional starter groups as the existing Frenda Dungeon.
// Only groups for which all three Grade-2 records have battle stats are selectable.
const STARTER_SET_DEFS=[
 {key:'kanto',label:'カントー',names:['フシギダネ','ヒトカゲ','ゼニガメ']},
 {key:'johto',label:'ジョウト',names:['チコリータ','ヒノアラシ','ワニノコ']},
 {key:'hoenn',label:'ホウエン',names:['キモリ','アチャモ','ミズゴロウ']},
 {key:'sinnoh',label:'シンオウ',names:['ナエトル','ヒコザル','ポッチャマ']},
 {key:'unova',label:'イッシュ',names:['ツタージャ','ポカブ','ミジュマル']},
 {key:'kalos',label:'カロス',names:['ハリマロン','フォッコ','ケロマツ']},
 {key:'alola',label:'アローラ',names:['モクロー','ニャビー','アシマリ']},
 {key:'galar',label:'ガラル',names:['サルノリ','ヒバニー','メッソン']},
 {key:'paldea',label:'パルデア',names:['ニャオハ','ホゲータ','クワッス']}
];
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const dateJST=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const stamp=()=>new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(new Date());
const number=v=>Number.isFinite(+v)?+v:0;
function group(r){return Number(r?.grade)>=2&&Number(r?.grade)<=5?String(r.grade):'special'}
function grade(r){return group(r)==='special'?'スペシャル':'★'.repeat(number(r?.grade))}
function getJSON(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function putJSON(key,v){localStorage.setItem(key,JSON.stringify(v))}
function newPlayer(){return {starterSetKey:null,starterIds:[],starterOptions:null,owned:{},reads:{},used:{},battle:null,dailyGachaDate:null,dailyGachaCount:0,tickets:{},dexRewardsPaid:0,pendingReward:null,lastReward:null,created:stamp()}}
let state=getJSON(STORE_KEY,{profile:'A',profiles:{A:newPlayer(),B:newPlayer(),C:newPlayer()}});
let registry=getJSON(REG_KEY,{});
let giftRegistry=getJSON(GIFT_KEY,{});
if(!state.profiles||typeof state.profiles!=='object')state={profile:'A',profiles:{A:newPlayer(),B:newPlayer(),C:newPlayer()}};
for(const x of ['A','B','C']){
 const q=state.profiles[x]??=newPlayer();
 q.tickets??={};q.dailyGachaCount??=(q.dailyGachaDate?1:0);
 q.pendingReward??=null;q.lastReward??=null;q.dexRewardsPaid??=0;
 q.owned??={};q.reads??={};q.used??={};
}
let view='home',filter='',sort='series',lastRead=null,showScan=false,scanStream=null,scanTimer=null,scanBusy=false,scanNative=null,autoTimer=null,autoSpeed=Math.min(5,Math.max(1,Number(getJSON(SPEED_KEY,1))||1)),autoRunning=false,battleBusy=false,battleEpoch=0,audio=getJSON(AUDIO_KEY,true),battleError='';
let filterSet={series:'all',grade:'all',type:'all',status:'all'},filterOpen=false,cardSize='medium',dexLimit=70,searchComposing=false,scanEpoch=0,scanPhase=0,scanStatus='',detailId=null,historyCode=null;
const p=()=>state.profiles[state.profile];
function boostLevel(id){return Math.min(BOOST_LIMIT,Math.max(0,number(p().owned[id]?.count)-1))}
function boostMultiplier(id){return Math.pow(BOOST_RATE,boostLevel(id))}
function isMax(id){return boostLevel(id)>=BOOST_LIMIT}
function ticketName(k){return k==='premium'?'★4以上ボーナス券':k==='special'?'スペシャル保証券':`★${k}以上保証券`}
function giftTicket(k){const q=p();q.tickets??={};q.tickets[k]=number(q.tickets[k])+1}
function awardDexTickets(){
 const q=p(),milestones=Math.floor(Object.keys(q.owned).length/10),old=number(q.dexRewardsPaid);
 if(milestones>old){giftTicket('premium');q.tickets.premium+=milestones-old-1;q.dexRewardsPaid=milestones;}
}
function isGameStarted(){return Array.isArray(p().starterIds)&&p().starterIds.length===3}

function save(){putJSON(STORE_KEY,state);putJSON(REG_KEY,registry);putJSON(GIFT_KEY,giftRegistry)}
function beep(freq=700){if(!audio)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=new C(),o=c.createOscillator(),g=c.createGain();o.frequency.value=freq;o.type='sine';g.gain.value=.035;o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.07);o.onended=()=>c.close()}catch{}}
function pic(r,kind='normal'){
 if(kind==='none')return '<div class="question">？</div>';
 const src=String(r?.official_image||'');
 if(!/^https:\/\//.test(src))return `<div class="fallback">画像未登録<br>${esc(r?.name_ja||'')}</div>`;
 return `<img src="${esc(src)}" alt="${esc(r.name_ja)}のピック" loading="lazy" referrerpolicy="no-referrer" class="${kind==='silhouette'?'muted':''}" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<div class=&quot;fallback&quot;>画像を表示できません<\/div>')">`;
}
function usedLeft(id){const d=p().used[id];return Math.max(0,3-((d?.date===dateJST())?number(d.count):0))}
function battleRecord(r){const c=boostLevel(r.master_id),mult=Math.pow(BOOST_RATE,c),out={...r};for(const k of STAT_KEYS)if(Number.isFinite(+r[k])&&+r[k]>0)out[k]=Math.max(1,Math.round(+r[k]*mult));out._mult=mult;return out}
function battleOK(r){return Boolean(r&&STAT_KEYS.every(k=>Number(r[k])>0)&&Number(r.move_power_ref)>0)}
function noStats(r){return !battleOK(r)}
function progress(){const owned=Object.keys(p().owned).length,found=new Set();for(const x of Object.values(p().reads)){found.add(x.pickId);if(x.originalPickId)found.add(x.originalPickId)}for(const id of Object.keys(p().owned))found.add(id);return {owned,found:found.size,total:byId.size,pending:Object.values(p().reads).filter(x=>x.status==='pending').length}}
function nav(v){
 stopScan();if(autoTimer){clearTimeout(autoTimer);autoTimer=null}autoRunning=false;battleEpoch++;battleBusy=false;
 view=v;filter='';sort='series';filterSet={series:'all',grade:'all',type:'all',status:'all'};filterOpen=false;dexLimit=70;lastRead=null;
 if(window.history?.pushState&&v!=='home')try{window.history.pushState({frendaBarcode:true,view:v},'',location.href)}catch{}
 render()
}
function cash(s){return `<span class="chip">${esc(s)}</span>`}
function topNav(title){return `<section class="panel row between"><h2 style="margin:0">${esc(title)}</h2><button class="secondary small" data-action="home">ホームへ</button></section>`}
function buttons(){return `<div class="button-grid"><button data-action="scan">📷 バーコードスキャン<small>カメラで新しいピックを発見</small></button><button data-action="pending">⚔ 出現中一覧<small>バトルに挑戦</small></button><button data-action="owned">🗂 所持ピック<small>出撃回数・強化倍率</small></button><button data-action="dex">📖 ポケモン図鑑<small>発見・入手を記録</small></button><button data-action="history">🕒 読取履歴<small>初回日時・現在の状態</small></button><button data-action="daily">🎰 ガチャ<small>デイリー・7回ボーナス・図鑑報酬・保証券</small></button><button data-action="gift">🎁 プレゼントコード<small>コードを使ってピック出現</small></button><button data-action="settings">⚙ テスト設定<small>プレイヤー切替・動作確認</small></button></div>`}
function home(){const s=progress(),starters=(p().starterIds||[]).map(id=>byId.get(id)).filter(Boolean);return `<section class="panel hero"><h2>バーコードを探してピックを集めよう！</h2><p class="sub">商品についているJAN・UPCコードをカメラで読み取ると、ピックが出現します。敵を倒してゲット！ 同じピックなら重複強化か再抽選を選択できます。</p><button class="green" data-action="scan">📷 バーコードをスキャン</button></section><section class="panel"><p class="sub">デイリーガチャ：${p().dailyGachaDate===dateJST()?'本日は使用済み':'本日まだ引けます'}</p><div class="metrics"><div class="metric"><b>${s.owned}</b><span>入手済みピック</span></div><div class="metric"><b>${s.found}</b><span>発見ピック</span></div><div class="metric"><b>${s.pending}</b><span>出現中</span></div></div><p class="sub">現在のテストプレイヤー：${esc(state.profile)} ／ マスター：${DB.records.length}件 ／ 7回ボーナスまで ${number(p().dailyGachaCount)%7}/7 ／ 高レア券 ${number(p().tickets?.premium)}枚</p>${starters.length?`<div class="row">${starters.map(r=>cash('初期ピック：'+r.name_ja+'（出撃'+usedLeft(r.master_id)+'/3）')).join('')}${p().battle?'<span class="chip wait">中断中のバトルあり</span>':''}</div>`:''}</section><section class="panel">${buttons()}</section>${p().battle?`<section class="panel"><p class="warn">中断したバトルがあります。新しいバトルは開始できません。</p><button data-action="battle">バトルを再開</button></section>`:''}`}
function starterOptions(){
 const player=p();
 if(Array.isArray(player.starterOptions)&&player.starterOptions.length)return player.starterOptions;
 player.starterOptions=STARTER_SET_DEFS.map(def=>{
  const ids=def.names.map(name=>{
   const pool=DB.records.filter(r=>r.name_ja===name&&Number(r.grade)===2&&battleOK(r));
   return pool.length?pool[Math.floor(cryptoRandom()*pool.length)].master_id:null;
  });
  return ids.every(Boolean)?{key:def.key,label:def.label,names:def.names.slice(),ids}:null;
 }).filter(Boolean);
 save();
 return player.starterOptions;
}
function starter(){
 const groups=starterOptions();
 if(!groups.length)return '<section class="panel"><h2>御三家を準備できませんでした</h2><p class="warn">使用可能な★2の御三家3体が、現在のマスターには揃っていません。</p></section>';
 return `<section class="panel hero"><h2>最初の御三家を選ぼう！</h2><p class="sub">既存フレンダダンジョンと同じ、地方別の3体セットから選択します。選んだ3体をすべて入手して開始。各ピックは最初から残り出撃3/3回、強化×1.00です。</p></section><section class="panel"><div class="starter-set-grid">${groups.map(set=>`<article class="starter-set-card"><h3>${esc(set.label)}の御三家</h3><div class="starter-trio">${set.ids.map(id=>{const r=byId.get(id);return `<div class="starter-pick"><div class="picture">${pic(r)}</div><b>${esc(r.name_ja)}</b><small>${grade(r)}</small></div>`}).join('')}</div><button type="button" data-action="starter-set" data-id="${esc(set.key)}">この御三家3体で始める</button></article>`).join('')}</div></section>`;
}
function chooseStarterSet(key){
 const player=p();
 if(Array.isArray(player.starterIds)&&player.starterIds.length)return;
 const chosen=starterOptions().find(x=>x.key===key&&x.ids.length===3);
 if(!chosen||!chosen.ids.every(id=>byId.has(id)))return;
 if(!confirm(`${chosen.label}の御三家3体で始めますか？\n${chosen.names.join('・')}\n選択後は3体とも所持ピックとして登録します。`))return;
 const now=stamp();
 chosen.ids.forEach(id=>{if(!player.owned[id])player.owned[id]={count:1,firstAt:now,lastAt:now}});
 awardDexTickets();
 player.starterSetKey=chosen.key;
 player.starterIds=chosen.ids.slice();
 save();
 nav('home');
}

function recordCard(r,mode,data={}){const o=p().owned[r.master_id],owned=!!o,ct=o?.count||0,mult=boostMultiplier(r.master_id),status=data.status||'none';let button='';if(mode==='pending'){button=`<button data-action="choose" data-code="${esc(data.barcode)}" ${p().battle?'disabled':''}>バトルを選択</button>`}else if(mode==='owned'){button=`<button data-action="detail" data-id="${esc(r.master_id)}">詳細</button>`}else if(mode==='history'){button=`<button data-action="history-detail" data-code="${esc(data.barcode)}">詳細</button>`}else if(mode==='dex'&&status!=='none'){button=`<button data-action="detail" data-id="${esc(r.master_id)}">詳細</button>`}
return `<article class="pick-card"><div class="picture">${pic(r,mode==='dex'?(status==='none'?'none':status==='pending'?'silhouette':'normal'):'normal')}</div><b>${esc(r.name_ja)}</b><span class="${group(r)==='special'?'special':'stars'}">${grade(r)}</span><span class="sub">${esc(r.series||'')} ／ ${esc(r.pick_no||'')}</span>${mode==='pending'?`<span class="chip wait">${data.source==='gift'?'🎁 プレゼント':'出現中'}・${number(data.attempts)}戦</span>`:''}${owned?`<span class="sub">累計${ct}枚 ／ 強化×${mult.toFixed(2)}${ct>=4?' MAX':''}</span><span class="stamina">本日 ${usedLeft(r.master_id)}/3 回</span>`:''}${mode==='dex'?`<span class="chip ${status==='owned'?'ok':'wait'}">${status==='owned'?'入手済み':status==='pending'?'発見済み':'未発見'}</span>`:''}${button}</article>`}
function filterOptions(items,selected){return items.map(([value,label])=>`<option value="${esc(value)}" ${selected===value?'selected':''}>${esc(label)}</option>`).join('')}
function controls(name,mode='owned'){
 const series=[...new Set(DB.records.map(r=>r.series||'その他'))];
 const types=[...new Set(DB.records.flatMap(r=>[r.type1,r.type2]).filter(Boolean))];
 const gradeOptions=[['all','全レア度'],['2','★2'],['3','★3'],['4','★4'],['5','★5'],['special','スペシャル']];
 const statuses=mode==='dex'?[['all','全状態'],['owned','入手済み'],['pending','発見済み・未所持'],['none','未発見']]:mode==='history'?[['all','全状態'],['owned','入手済み'],['pending','出現中']]:[['all','全状態']];
 const n=Object.values(filterSet).filter(x=>x!=='all').length;
 const panel=filterOpen?`<div class="filter-panel" role="group" aria-label="ピックの絞り込み"><div class="filter-grid"><label>シリーズ<select data-filter-key="series">${filterOptions([['all','全シリーズ'],...series.map(s=>[s,s])],filterSet.series)}</select></label><label>タイプ<select data-filter-key="type">${filterOptions([['all','全タイプ'],...types.map(s=>[s,s])],filterSet.type)}</select></label><label>レア度<select data-filter-key="grade">${filterOptions(gradeOptions,filterSet.grade)}</select></label>${statuses.length>1?`<label>所持・発見状態<select data-filter-key="status">${filterOptions(statuses,filterSet.status)}</select></label>`:''}</div><button class="secondary small" data-action="clear-filters">条件をリセット</button></div>`:'';
 return `<div class="compact-toolbar"><input id="searchPick" type="search" autocomplete="off" placeholder="${esc(name)}を検索" value="${esc(filter)}"><button type="button" class="secondary ${n?'active-filter':''}" data-action="toggle-filter">⚙ 絞り込み${n?'('+n+')':''}</button><select id="sortPick" aria-label="並び替え">${filterOptions([['series','シリーズ順'],['name','名前順'],['grade','レア度順'],['recent','新しい順'],['energy','ポケエネ順']],sort)}</select></div><div class="size-toolbar"><span class="sub">表示サイズ</span>${[['small','小'],['medium','中'],['large','大']].map(([v,l])=>`<button type="button" class="size-btn ${cardSize===v?'selected-size':''}" data-action="card-size" data-id="${v}">${l}</button>`).join('')}</div>${panel}`
}
function sorted(records,mode){
 const query=filter.trim().toLocaleLowerCase('ja');
 return records.filter(z=>{
  const r=z.r,status=z.status||(p().owned[r.master_id]?'owned':'pending');
  if(query&&![r.name_ja,r.master_id,r.series,r.pick_no,z.barcode,r.type1,r.type2].some(v=>String(v??'').toLocaleLowerCase('ja').includes(query)))return false;
  if(filterSet.series!=='all'&&String(r.series||'その他')!==filterSet.series)return false;
  if(filterSet.type!=='all'&&r.type1!==filterSet.type&&r.type2!==filterSet.type)return false;
  if(filterSet.grade!=='all'&&group(r)!==filterSet.grade)return false;
  if(filterSet.status!=='all'&&status!==filterSet.status)return false;
  return true
 }).sort((a,b)=>{
  const idcmp=()=>String(a.r.master_id).localeCompare(String(b.r.master_id),'ja',{numeric:true});
  if(sort==='grade')return (number(b.r.grade)-number(a.r.grade))||idcmp();
  if(sort==='name')return String(a.r.name_ja).localeCompare(String(b.r.name_ja),'ja')||idcmp();
  if(sort==='recent')return String(b.time||'').localeCompare(String(a.time||''))||idcmp();
  if(sort==='energy')return number(b.r.poke_ene)-number(a.r.poke_ene)||idcmp();
  return String(a.r.series||'').localeCompare(String(b.r.series||''),'ja')||String(a.r.pick_no||'').localeCompare(String(b.r.pick_no||''),'ja',{numeric:true})||idcmp()
 })
}
function pending(){
 const entries=Object.entries(p().reads).filter(([,v])=>v.status==='pending').map(([barcode,v])=>({r:byId.get(v.pickId),...v,barcode,time:v.scannedAt,status:'pending'})).filter(x=>x.r);
 const data=sorted(entries,'pending');return `${topNav('出現中一覧')}${p().battle?'<section class="panel callout">進行中のバトルがあります。<button data-action="battle" class="small">バトルを再開</button></section>':''}<section class="panel">${controls('名前・バーコード','pending')}<p class="sub">表示 ${data.length}/${entries.length}件 ／ 期限・件数制限なし</p><div class="pick-grid size-${cardSize}">${data.map(x=>recordCard(x.r,'pending',x)).join('')||'<div class="empty">該当する出現中ピックはありません</div>'}</div></section>`
}
function ownedPage(){
 const rows=Object.keys(p().owned).map(id=>({r:byId.get(id),time:p().owned[id].lastAt,status:'owned'})).filter(x=>x.r),data=sorted(rows,'owned');
 return `${topNav('所持ピック')}<section class="panel">${controls('名前・シリーズ・ピックID','owned')}<p class="sub">表示 ${data.length}/${rows.length}種類 ／ 重複分は所持枚数と強化倍率に反映</p><div class="pick-grid size-${cardSize}">${data.map(x=>recordCard(x.r,'owned')).join('')||'<div class="empty">条件に合う所持ピックはありません</div>'}</div></section>`
}
function dex(){
 const reads=Object.values(p().reads),found=new Set();for(const x of reads){found.add(x.pickId);if(x.originalPickId)found.add(x.originalPickId)}const owned=new Set(Object.keys(p().owned));for(const id of owned)found.add(id);
 const list=DB.records.map(r=>({r,status:owned.has(r.master_id)?'owned':found.has(r.master_id)?'pending':'none'}));let d=sorted(list,'dex'),s=progress();
 const series=[...new Set(DB.records.map(x=>x.series||'その他'))];
 return `${topNav('ポケモン図鑑')}<section class="panel"><div class="metrics"><div class="metric"><b>${s.owned}/${s.total}</b><span>入手率 ${(s.owned/s.total*100).toFixed(1)}%</span></div><div class="metric"><b>${s.found}/${s.total}</b><span>発見率 ${(s.found/s.total*100).toFixed(1)}%</span></div><div class="metric"><b>${series.length}</b><span>シリーズ数</span></div></div><div class="progress"><div style="width:${s.owned/s.total*100}%"></div></div></section><section class="panel">${controls('図鑑から名前を検索','dex')}<p class="sub">表示 ${d.length}/${list.length}件 ／ ？：未発見・暗いピック：発見済み・カラー：入手済み</p><div class="pick-grid size-${cardSize}" id="dexGrid">${d.slice(0,dexLimit).map(x=>recordCard(x.r,'dex',{status:x.status})).join('')||'<div class="empty">条件に合うピックはありません</div>'}</div>${d.length>dexLimit?`<button class="secondary" data-action="more-dex">さらに表示（残り${d.length-dexLimit}件）</button>`:''}</section><section class="panel"><h3>シリーズ別コンプリート</h3>${series.map(name=>{const all=DB.records.filter(x=>(x.series||'その他')===name),own=all.filter(x=>owned.has(x.master_id)).length,fnd=all.filter(x=>found.has(x.master_id)).length;return `<div style="margin:8px 0"><div class="row between"><span class="sub">${esc(name)} ${own===all.length?'🏆':''}</span><span class="sub">${own}/${all.length}（発見${fnd}）</span></div><div class="progress"><div style="width:${own/all.length*100}%"></div></div></div>`}).join('')}</section>`
}
function history(){
 const rows=Object.entries(p().reads).filter(([,x])=>x.source!=='gift').map(([barcode,x])=>({r:byId.get(x.pickId),barcode,...x,time:x.scannedAt})).filter(x=>x.r),data=sorted(rows,'history');
 return `${topNav('バーコード読取履歴')}<section class="panel">${controls('名前・バーコード番号','history')}<p class="sub">表示 ${data.length}/${rows.length}件 ／ 初回読取日時（日本時間）</p>${data.map(x=>`<div class="row between history-row"><div><b>${esc(x.r.name_ja)}</b><span class="sub"> ${grade(x.r)} ／ ${esc(x.barcode)}</span><div class="sub">${esc(x.scannedAt)}</div></div><div><span class="chip ${x.status==='owned'?'ok':'wait'}">${x.status==='owned'?'入手済み':x.status==='ticket'?'保証券に交換済み':x.status==='decision'?'選択待ち':'出現中'}</span><button class="secondary small" data-action="history-detail" data-code="${esc(x.barcode)}">詳細</button></div></div>`).join('')||'<div class="empty">該当する読取履歴はありません</div>'}</section>`
}
function statGraph(name,base,current,max){
 const original=Math.max(0,number(base)),effective=Math.max(0,number(current));
 const scale=Math.max(number(max),original,effective,1),basePct=Math.max(0,Math.min(100,original/scale*100)),boostPct=Math.max(0,Math.min(100-basePct,(effective-original)/scale*100));
 return `<div class="ability-stat"><div class="ability-stat-head"><b>${esc(name)}</b><strong>${esc(effective)}</strong></div><div class="ability-track"><span class="ability-base" style="width:${basePct}%"></span><span class="ability-growth" style="width:${boostPct}%"></span></div></div>`
}
function stats(r,baseline=false){if(!r)return '';
 const b=!baseline&&p().owned[r.master_id]?battleRecord(r):r;
 const fields=[['HP','hp',240],['ATK','atk',220],['DEF','def',220],['SP.ATK','sp_atk',220],['SP.DEF','sp_def',220],['すばやさ','speed_level',5]];
 const power=Number(r.move_power_ref)>0?r.move_power_ref:'未登録';
 const accuracy=r.move_accuracy_always?'必中':Number(r.move_accuracy_ref)>0?`${r.move_accuracy_ref}%`:'未登録';
 const fin=r.finisher_move||'なし';const specials=Array.isArray(r.special)?r.special.join(' / '):r.special||'なし';
 return `<h3 class="detail-section">能力</h3><div class="ability-legend"><span><i class="legend-base"></i>初期値</span><span><i class="legend-growth"></i>重複強化分</span></div><div class="ability-grid">${fields.map(([name,key,max])=>statGraph(name,r[key],b[key],max)).join('')}</div><h3 class="detail-section">わざ・特殊要素</h3><div class="move-info"><div><span>タイプ</span><b>${esc([r.type1,r.type2].filter(Boolean).join('・')||'未登録')}</b></div><div><span>通常わざ</span><b>${esc(r.move||'未登録')} ／ ${esc(r.move_type||'-')} ／ ${esc(r.move_class||'-')}</b></div><div><span>参考威力・命中</span><b>${esc(power)} ／ ${esc(accuracy)}</b></div><div><span>必殺技</span><b>${esc(fin)}</b></div><div><span>特殊要素</span><b>${esc(specials)}</b></div><div><span>ポケエネ</span><b>${esc(r.poke_ene??'未登録')}</b></div></div>`
}
function detail(id){
 const r=byId.get(id);if(!r)return topNav('ピック詳細')+'<div class="panel">マスターにありません</div>';
 const owned=p().owned[id],pend=Object.entries(p().reads).filter(([,x])=>x.pickId===id&&x.status==='pending'),found=owned||pend.length;
 return `${topNav('ピック詳細')}<section class="panel detail-sheet"><div class="detail-hero"><div class="picture detail-pic">${pic(r,owned?'normal':found?'silhouette':'none')}</div><div><h2>${grade(r)} ${esc(r.name_ja)}</h2><p class="sub">${esc(r.series)} ／ ${esc(r.pick_no||r.master_id)}</p><p>${owned?`累計${owned.count}枚 ／ 強化×${battleRecord(r)._mult.toFixed(2)}${owned.count>=4?' MAX':''}`:found?'発見済み・未入手':'未発見'}</p>${owned?`<p class="stamina">本日 残り${usedLeft(r.master_id)}/3回</p>`:''}</div></div>${found?stats(r):''}${pend.length?`<p><button data-action="choose" data-code="${esc(pend[0][0])}">このピックに挑戦</button></p>`:''}</section>`
}
function historyDetail(code){const x=p().reads[code],r=byId.get(x?.pickId);return `${topNav('読取履歴詳細')}<section class="panel"><h2>${esc(r?.name_ja||'不明')}</h2><p>バーコード：${esc(code)}</p><p>初回読取：${esc(x?.scannedAt)}</p><p>状態：${x?.status==='owned'?'入手済み':x?.status==='ticket'?'保証券に交換済み':x?.status==='decision'?'選択待ち':'出現中'}</p><p>元のピック：${esc(byId.get(x?.originalPickId)?.name_ja||r?.name_ja||'不明')}</p><p>勝利・取得：${esc(x?.captureAt||'未取得')}</p><p>挑戦回数：${number(x?.attempts)}</p>${x?.status==='pending'?`<button data-action="choose" data-code="${esc(code)}">バトル</button>`:`<button data-action="detail" data-id="${esc(x?.pickId)}">ピック詳細</button>`}</section>`}
function estimate(m,e){const a=battleRecord(m),b=e;return (number(a.hp)||0)+(number(a.atk)+number(a.sp_atk))*1.5+(number(a.def)+number(a.sp_def))*.5 + number(CORE.eff(a.move_type,b))*35}
function choose(code){const enemy=byId.get(p().reads[code]?.pickId);if(!enemy||p().reads[code]?.status!=='pending'){nav('pending');return}if(p().battle){alert('中断中のバトルがあります。先に再開してください。');nav('battle');return}lastRead=code;view='choose';filter='';sort='grade';render()}
function chooseScreen(){const code=lastRead,enemy=byId.get(p().reads[code]?.pickId);if(!enemy)return topNav('バトル準備')+`<section class="panel">出現中一覧から選んでください。</section>`;const rows=Object.keys(p().owned).map(id=>byId.get(id)).filter(Boolean);const active=rows.filter(r=>usedLeft(r.master_id)>0&&battleOK(r));active.sort((a,b)=>estimate(b,enemy)-estimate(a,enemy));return `${topNav('1対1 バトル準備')}<section class="panel"><div class="row"><div class="picture" style="width:140px;height:140px">${pic(enemy)}</div><div><h2>${grade(enemy)} ${esc(enemy.name_ja)}</h2><p class="sub">${esc(enemy.series)} ／ 敵は未強化</p><span class="chip wait">この戦闘は開始時に出撃1回消費</span></div></div>${stats(enemy,true)}${noStats(enemy)?'<p class="callout">マスターにバトル能力値が不足しています。この敵との戦闘はマスター補完後に可能になります。</p>':''}</section><section class="panel"><h2>おすすめの出撃ピック</h2><p class="sub">強化後能力・タイプ・出撃回数を基に並べています。推奨順はテスト用の簡易評価で、勝利保証ではありません。</p><div class="pick-grid">${active.slice(0,3).map(r=>fighterCard(r,code,true)).join('')}</div></section><section class="panel"><h2>すべての所持ピック</h2><div class="pick-grid">${active.map(r=>fighterCard(r,code,false)).join('')||'<p>出撃可能なピックがありません。日本時間の翌日0時に回復します。</p>'}</div></section>`}
function fighterCard(r,code,recommended){return `<article class="pick-card"><div class="picture">${pic(r)}</div><b>${esc(r.name_ja)}</b><span class="sub">${grade(r)} 強化×${battleRecord(r)._mult.toFixed(2)}</span><span class="stamina">残り${usedLeft(r.master_id)}/3回</span><button data-action="start-battle" data-code="${esc(code)}" data-id="${esc(r.master_id)}">${recommended?'おすすめ：':''}出撃する</button></article>`}
function battleRandom(b){
 // Battle-local deterministic PRNG, saved after every action to prevent reroll on reload.
 let x=(b.rng>>>0)||0x9e3779b9;x^=(x<<13);x^=(x>>>17);x^=(x<<5);b.rng=x>>>0;return (b.rng>>>0)/4294967296
}
function startBattle(code,id){
 if(p().battle){nav('battle');return}
 if(!navigator.onLine){alert('通信できない状態です。獲得バトルは開始できません。');return}
 const enemy=byId.get(p().reads[code]?.pickId),me=byId.get(id);
 if(!enemy||!me||p().reads[code].status!=='pending'||!p().owned[id]||usedLeft(id)<1){alert('開始条件を満たしていません。');nav('pending');return}
 if(!battleOK(enemy)||!battleOK(me)){alert('マスター能力値の未登録があるため、このテスト版では戦闘できません。');return}
 if(!confirm(`${me.name_ja}で${enemy.name_ja}に挑みますか？\nバトル開始時に出撃回数を1回消費します。`))return;
 const day=dateJST(),u=p().used[id];p().used[id]={date:day,count:(u?.date===day?number(u.count):0)+1};
 const ally=battleRecord(me),speedA=number(ally.speed_level),speedB=number(enemy.speed_level);
 const b={id:'demo-'+Date.now(),code,ally:id,enemy:enemy.master_id,allyStats:ally,enemyStats:{...enemy},allyHp:number(ally.hp),enemyHp:number(enemy.hp),turn:1,phaseIndex:0,rng:(Math.floor(cryptoRandom()*4294967295)||1),first:'ally',model:localStorage.getItem('frenda:damageModel:v1')==='v2'?'v2':'v1',log:[],createdAt:stamp()};
 b.first=speedA===speedB?(battleRandom(b)<.5?'ally':'enemy'):(speedA>speedB?'ally':'enemy');
 b.log=[`${grade(enemy)} ${enemy.name_ja}とのバトル開始！`,`${b.first==='ally'?ally.name_ja:enemy.name_ja}が先攻！`];
 p().battle=b;p().reads[code].attempts=(p().reads[code].attempts||0)+1;
 battleError='';autoRunning=true;battleBusy=false;save();view='battle';render();autoTimer=setTimeout(autoTick,350);
}
function takeDamage(att,def,b){
 // Exact damage/accuracy/spread/nice constants from Dungeon attackValue (no party luck in 1v1).
 const x=CORE.dmg(att,def,b.model||'v1'),acc=Math.max(0,Math.min(1,number(x.accuracy??1))),hit=battleRandom(b)<acc;
 if(!hit)return {n:0,hit:false,eff:x.e,nice:false};
 const spreadPct=95+Math.floor(battleRandom(b)*11),nice=battleRandom(b)<.05;
 const n=Math.max(1,Math.round(Math.max(1,number(x.hitN??x.n))*(spreadPct/100)*(nice?1.2:1)));
 return {n,hit:true,eff:x.e,nice};
}
const fxSleep=(ms)=>new Promise(resolve=>setTimeout(resolve,Math.max(50,Math.round(ms/(autoRunning?autoSpeed:1)))));
function battleStageMessage(v){const el=$('battleMessage');if(el)el.textContent=v}
function battleHpUI(side,hp,max){const el=$(side==='ally'?'myHpFill':'enemyHpFill'),txt=$(side==='ally'?'myHpText':'enemyHpText');if(el)el.style.width=`${Math.max(0,Math.min(100,hp/Math.max(1,max)*100))}%`;if(txt)txt.textContent=`HP ${hp}/${max}`}
function typeEffectLabel(e){const low=CORE.FRIENDA_EFFECT?.VERY_LOW||.59;if(e<=low+.0001)return 'ほとんどこうかがない';if(e>1)return '効果ばつぐん！';if(e<1)return '効果はいまひとつ';return ''}
async function animateAttack(a,side,x,newHp,maxHp,epoch){
 if(epoch!==battleEpoch||view!=='battle')return;
 const attackingMe=side==='ally',attacker=$(attackingMe?'myFighter':'enemyFighter'),defender=$(attackingMe?'enemyFighter':'myFighter');
 const direction=attackingMe?'enemy':'ally',special=!!(a.finisher_move&&String(a.finisher_move).trim());
 battleStageMessage(`${a.name_ja}の${special?'必殺技 ':''}${CORE.skillName(a)}！`);
 const specialNode=$('battleSpecialBanner');if(special&&specialNode){specialNode.textContent=`SPECIAL ATTACK　${a.name_ja}　${CORE.skillName(a)}`;specialNode.classList.add('show')}
 attacker?.classList.add('activeTurn',attackingMe?'attackLeft':'attackRight');
 const fx=$('battleFxLayer');if(fx){fx.textContent=`${a.move_type||'ノーマル'} ✦`;fx.className=`battle-fx-layer show ${attackingMe?'to-enemy':'to-ally'}`}
 await fxSleep(special?370:230);
 if(epoch!==battleEpoch||view!=='battle')return;
 attacker?.classList.remove('attackLeft','attackRight');specialNode?.classList.remove('show');
 if(!x.hit){battleStageMessage('ミス！ 攻撃は外れた！');await impact('ミス！',epoch);}
 else{
  defender?.classList.add('hit');battleStageMessage(typeEffectLabel(x.e)||`${x.n}ダメージ！`);
  if(typeEffectLabel(x.e))await impact(typeEffectLabel(x.e),epoch);
  if(epoch!==battleEpoch||view!=='battle')return;
  const d=document.createElement('span');d.className='damage-pop';d.textContent=x.nice?`✨ -${x.n}`:`-${x.n}`;defender?.appendChild(d);
  battleStageMessage(x.nice?`✨ ナイスアタック！ ${x.n}ダメージ！`:`${x.n}ダメージ！`);
  await fxSleep(330);if(epoch!==battleEpoch||view!=='battle')return;
  battleHpUI(attackingMe?'enemy':'ally',newHp,maxHp);
  if(newHp<=0)await impact('K.O.!',epoch);
  defender?.classList.remove('hit');
 }
 fx?.classList.remove('show');attacker?.classList.remove('activeTurn');
 await fxSleep(140);
}
async function impact(msg,epoch){const el=$('battleImpact');if(!el)return;el.textContent=msg;el.classList.remove('show');void el.offsetWidth;el.classList.add('show');await fxSleep(390);if(epoch===battleEpoch)el.classList.remove('show')}
async function battleTurn(){
 const b=p().battle;if(!b||battleBusy||view!=='battle')return;
 if(!navigator.onLine){battleError='通信がありません。復旧後に再開できます。';render();return}
 battleBusy=true;const epoch=battleEpoch,order=b.first==='ally'?['ally','enemy']:['enemy','ally'];
 const isCurrent=()=>epoch===battleEpoch&&view==='battle'&&p().battle===b;
 try{
  if(b.phaseIndex===0){battleStageMessage(`TURN ${b.turn}　${b.first==='ally'?b.allyStats.name_ja:b.enemyStats.name_ja}が先攻！`);await fxSleep(320)}
  for(let i=b.phaseIndex||0;i<2;i++){
   if(!isCurrent()||b.allyHp<=0||b.enemyHp<=0)break;
   const side=order[i],mine=side==='ally',a=mine?b.allyStats:b.enemyStats,d=mine?b.enemyStats:b.allyStats,x=takeDamage(a,d,b);
   if(mine)b.enemyHp=Math.max(0,b.enemyHp-x.n);else b.allyHp=Math.max(0,b.allyHp-x.n);
   b.log.push(`${a.name_ja}の${CORE.skillName(a)}！ ${x.hit?`${x.n}ダメージ${x.nice?' ✨ナイスアタック！':''}`:'ミス！'}`);
   b.log=b.log.slice(-60);b.phaseIndex=i+1;save(); // commit HP, RNG and phase BEFORE animation
   await animateAttack(a,side,x,mine?b.enemyHp:b.allyHp,number(d.hp),epoch);
   if(!isCurrent())return;
  }
  if(!isCurrent())return;
  if(b.enemyHp<=0){captureAfterVictory(b.code);beep(950);lastRead={result:'win',pickId:b.enemy,barcode:b.code};p().battle=null;view='result';autoRunning=false;}
  else if(b.allyHp<=0){p().battle=null;lastRead={result:'lost',pickId:b.enemy,barcode:b.code};view='result';beep(280);autoRunning=false;}
  else{b.turn++;b.phaseIndex=0}
  save();battleBusy=false;render();
 }finally{if(epoch===battleEpoch)battleBusy=false}
}
function captureAfterVictory(code){const read=p().reads[code];if(!read)return;const id=read.pickId;const claims=Object.entries(p().reads).filter(([,v])=>v.pickId===id&&v.status==='pending');for(const [barcode,entry] of claims){entry.status='owned';entry.captureAt=stamp();if(!p().owned[id])p().owned[id]={count:0,firstAt:entry.captureAt};p().owned[id].count++;p().owned[id].lastAt=stamp()}awardDexTickets();return claims.length}
function forfeit(){if(!p().battle||battleBusy)return;if(!confirm('このバトルをあきらめますか？ 出撃回数は返却されません。'))return;const b=p().battle;p().battle=null;lastRead={result:'forfeit',pickId:b.enemy,barcode:b.code};view='result';save();render()}
function battlePage(){
 const b=p().battle;if(!b)return `${topNav('バトル')}<section class="panel empty">進行中のバトルはありません</section>`;
 const me=b.allyStats,en=b.enemyStats,mePct=Math.max(0,Math.min(100,b.allyHp/me.hp*100)),enPct=Math.max(0,Math.min(100,b.enemyHp/en.hp*100));
 return `${topNav('バトル中')}<section class="panel"><div class="row between"><h2 style="margin:0">第${b.turn}ターン</h2><span class="chip" id="autoSpeedStatus">${autoRunning?'🤖 AUTO':'⏸ 一時停止'} ×${autoSpeed}</span></div><div id="battleStage" class="battle-stage"><div id="battleTurnSplash" class="battle-turn-splash"></div><div id="battleSpecialBanner" class="battle-special-banner"></div><div id="battleImpact" class="battle-impact"></div><div id="battleFxLayer" class="battle-fx-layer"></div><div class="battle-board"><div class="combatant" id="myFighter"><strong>自分：${esc(me.name_ja)}</strong><div class="picture">${pic(me)}</div><div class="hp-track"><div id="myHpFill" class="hp-fill ${mePct<35?'low':''}" style="width:${mePct}%"></div></div><div id="myHpText" class="sub">HP ${b.allyHp}/${me.hp}</div></div><div class="combatant" id="enemyFighter"><strong>敵：${esc(en.name_ja)}</strong><div class="picture">${pic(en)}</div><div class="hp-track"><div id="enemyHpFill" class="hp-fill ${enPct<35?'low':''}" style="width:${enPct}%"></div></div><div id="enemyHpText" class="sub">HP ${b.enemyHp}/${en.hp}</div></div></div></div><p id="battleMessage" class="battle-message">${b.phaseIndex?'ターン途中から再開できます。':'攻撃の準備ができました。'}</p><div class="combat-log" role="log">${b.log.slice(-7).map(x=>`<p>${esc(x)}</p>`).join('')}</div>${battleError?`<p class="warn">${esc(battleError)}</p>`:''}<div class="button-row" style="margin-top:10px"><button class="secondary" data-action="auto">${autoRunning?'⏸ 一時停止':'▶ AUTO再開'}</button><button class="secondary" data-action="speed">速度 ×${autoSpeed}</button><button class="danger" data-action="forfeit" ${battleBusy?'disabled':''}>あきらめる</button></div><p class="sub">ダンジョン共通ダメージ計算（${esc(b.model||'v1')}）：タイプ相性・±5%・5%ナイス攻撃／攻撃演出はピック画像版に移植。1対1のためパーティ・アイテム効果はありません。</p></section>`;
}
function resultPage(){
 const info=lastRead;if(!info?.result)return home();const r=byId.get(info.pickId),o=p().owned[info.pickId];const won=info.result==='win';
 const actions=won?'<button data-action="pending">出現中一覧に戻る</button><button class="secondary" data-action="home">ホームへ</button>':`<button data-action="retry" data-code="${esc(info.barcode)}">別のピックで再戦</button><button class="secondary" data-action="pending">出現中一覧に戻る</button>`;
 return `${topNav('バトル結果')}<section class="panel" style="text-align:center"><h2>${won?'🎉 バトル勝利！':info.result==='forfeit'?'バトルを棄権':'バトル敗北'}</h2><div class="picture" style="height:220px">${pic(r)}</div><h2>${grade(r)} ${esc(r.name_ja)}</h2><p>${won?`ピックを獲得しました！ 累計${o?.count||0}枚・強化×${boostMultiplier(info.pickId).toFixed(2)}`:'このピックは出現中です。別の所持ピックを選んで再挑戦できます。'}</p><div class="button-row">${actions}</div></section>`
}
function registerBarcode(code){
 const canonical=normalize(code);if(!canonical){showCodeError('バーコードの桁数またはチェックデジットが正しくありません。');return}
 if(p().pendingReward){view='claim';render();return}
 showCodeError('');stopScan();let entry=registry[canonical];
 if(!entry){const result=drawPick();entry={pickId:result.master_id,grade:group(result),createdAt:stamp()};registry[canonical]=entry}
 const r=byId.get(entry.pickId);if(!r){showCodeError('対応ピックが現在のマスターにありません。');return}
 let read=p().reads[canonical],status='';
 if(read){status='already'}
 else if(p().owned[entry.pickId]){
  read={pickId:entry.pickId,originalPickId:entry.pickId,scannedAt:stamp(),status:'decision',attempts:0,source:'barcode'};
  p().reads[canonical]=read;
  p().pendingReward={source:'barcode',barcode:canonical,pickId:entry.pickId,originalPickId:entry.pickId,grade:group(r),rerolled:false,createdAt:stamp()};
  status='decision';
 }else{read={pickId:entry.pickId,originalPickId:entry.pickId,scannedAt:stamp(),status:'pending',attempts:0,source:'barcode'};p().reads[canonical]=read;status='new'}
 save();lastRead={barcode:canonical,pickId:read.pickId,status};beep(950);if(navigator.vibrate)try{navigator.vibrate(70)}catch{}view=status==='decision'?'claim':'encounter';render()
}
function cryptoRandom(){const x=new Uint32Array(1);crypto.getRandomValues(x);return x[0]/4294967296}
function drawPick(forcedGroup){const groups=RATES.reduce((s,[k,rate])=>{s.push([k,rate]);return s},[]);let z=cryptoRandom()*100,k=groups[groups.length-1][0];if(forcedGroup&&RATE_POOLS[forcedGroup]?.length){k=forcedGroup}else for(const [key,rate] of groups){z-=rate;if(z<0){k=key;break}}const pool=RATE_POOLS[k]||[];if(!pool.length)throw Error('抽選対象がありません');const appearance={};for(const row of Object.values(registry))appearance[row.pickId]=(appearance[row.pickId]||0)+1;let weights=pool.map(r=>1/Math.sqrt(1+(appearance[r.master_id]||0))),sum=weights.reduce((a,b)=>a+b,0),u=cryptoRandom()*sum;for(let i=0;i<pool.length;i++){u-=weights[i];if(u<0)return pool[i]}return pool[pool.length-1]}
function normalize(value){const code=String(value||'').replace(/\s/g,'');if(!/^\d+$/.test(code)||![8,12,13].includes(code.length))return null;let digits=code.split('').map(Number),check=digits.pop(),sum=0;for(let i=digits.length-1,weight=3;i>=0;i--,weight=weight===3?1:3)sum+=digits[i]*weight;const computed=(10-sum%10)%10;if(computed!==check)return null;return code.length===12?'0'+code:code}
function encounter(){const x=lastRead,r=byId.get(x?.pickId);if(!r)return home();const owned=p().owned[r.master_id],isNew=x.status==='new',read=p().reads[x.barcode];return `${topNav('バーコード読み取り結果')}<section class="panel" style="text-align:center"><p class="${x.status==='already'?'warn':'safe'}">${x.status==='already'?'このバーコードは読み取り済み':isNew?'新しいピックが出現！':'所持済みピックが出現！'}</p><div class="picture" style="height:230px">${pic(r)}</div><h2>${grade(r)} ${esc(r.name_ja)}</h2><p class="sub">コード：${esc(x.barcode)} ／ ${esc(r.series)}</p>${read?.originalPickId&&read.originalPickId!==read.pickId?`<p class="sub">元の出現：${esc(byId.get(read.originalPickId)?.name_ja||'?')} ／ 再抽選後：${esc(byId.get(read.pickId)?.name_ja||'?')}</p>`:''}${owned?`<p>累計${owned.count}枚・強化×${battleRecord(r)._mult.toFixed(2)}${owned.count>=4?' MAX':''}</p>`:read?.status==='ticket'?'<p>このバーコードでは保証ガチャ券を獲得済みです。</p>':'<p>出現中一覧に登録しました。勝利すればゲット！</p>'}<div class="button-row">${read?.status==='pending'?`<button data-action="choose" data-code="${esc(x.barcode)}">今すぐバトル</button>`:`<button data-action="detail" data-id="${esc(r.master_id)}">ピック詳細</button>`}<button class="secondary" data-action="scan">次のバーコード</button><button class="secondary" data-action="home">あとで</button></div></section>`}
function scanMessage(message){scanStatus=message;const e=$('scanState');if(e)e.textContent=message}
function showCodeError(message){const e=$('testCodeError');if(e){e.textContent=message;e.hidden=!message}if(!e)scanMessage(message)}
function scanPage(){return `${topNav('バーコードスキャン')}<section class="panel"><div class="callout">この画面を開くとカメラが自動起動します。初回のみブラウザの使用許可が必要です。HTTPS接続が必要です。このVer08の共通台帳はブラウザ内のテストデータです。</div><div class="scan-view" style="margin-top:12px"><video id="video" autoplay playsinline muted></video><div class="scan-guide"></div></div><p id="scanState" class="sub" role="status">${esc(scanStatus||'カメラを準備しています…')}</p><p id="scanDiagnostics" class="sub" aria-live="polite">カメラ解像度：起動前</p><div class="button-row"><button class="secondary" data-action="camera" id="cameraRetry" hidden>📷 カメラを再試行</button><button class="secondary" data-action="stopcamera" id="cameraStop">カメラ停止</button></div></section>`}
function cameraControls(retry){const retryButton=$('cameraRetry'),stopButton=$('cameraStop');if(retryButton)retryButton.hidden=!retry;if(stopButton)stopButton.hidden=retry}
async function startScan(){
 if(!navigator.onLine){scanMessage('通信がありません。');cameraControls(true);return}
 if(!isSecureContext){scanMessage('HTTPSで開いてください。');cameraControls(true);return}
 if(!navigator.mediaDevices?.getUserMedia){scanMessage('このブラウザではカメラを利用できません。');cameraControls(true);return}
 if(!('BarcodeDetector' in window)&&!window.ZXingWASM?.readBarcodes){scanMessage('読取ライブラリを読み込めません。通信状態を確認してください。');cameraControls(true);return}
 stopScan();cameraControls(false);scanMessage('カメラを準備しています…');const epoch=scanEpoch;
 try{
  const stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}}});
  if(epoch!==scanEpoch||view!=='scan'){stream.getTracks().forEach(t=>t.stop());return}
  scanStream=stream;const v=$('video');if(!v){stopScan();return}v.srcObject=stream;await v.play();
  if(epoch!==scanEpoch||view!=='scan'){stopScan();return}
  scanNative=null;if('BarcodeDetector' in window){try{scanNative=new BarcodeDetector({formats:['ean_13','ean_8','upc_a']})}catch{scanNative=null}}
  scanPhase=0;scanBusy=false;showScan=true;
  const track=stream.getVideoTracks()[0],settings=track?.getSettings?.()||{};
  const res=$('scanDiagnostics');if(res)res.textContent=`実際のカメラ解像度：${v.videoWidth||settings.width||'?'}×${v.videoHeight||settings.height||'?'} ／ 読取：全画面・中央拡大・階調補正を交互に検証`;
  scanMessage('バーコードを中央の枠内に、水平に写してください。');scanLoop()
 }catch(e){if(epoch===scanEpoch&&view==='scan'){scanMessage('カメラ起動に失敗：'+(e.name||e.message)+'。許可設定を確認して再試行してください。');cameraControls(true)}}
}
function stopScan(){
 scanEpoch++;showScan=false;
 if(scanTimer){clearTimeout(scanTimer);scanTimer=null}
 if(scanStream){scanStream.getTracks().forEach(t=>t.stop());scanStream=null}
 const v=$('video');if(v)v.srcObject=null
}
async function scanLoop(){
 if(!showScan||scanBusy)return;
 const epoch=scanEpoch;scanBusy=true;
 try{
  const v=$('video');if(!v||!v.videoWidth){return}
  let code=null;
  if(scanNative){try{for(const x of await scanNative.detect(v)||[]){code=normalize(x.rawValue);if(code)break}}catch(e){scanNative=null}}
  if(!code&&window.ZXingWASM?.readBarcodes){
   const c=$('scanCanvas');const ctx=c?.getContext('2d',{willReadFrequently:true});
   if(ctx){
    const w=v.videoWidth,h=v.videoHeight,phase=scanPhase++%3;
    // Frame 0: high-resolution full frame; frame 1/2: native-resolution center crop.
    // The crop magnifies narrow bars instead of shrinking the entire PC camera frame to 850 px.
    const crop=phase!==0,sx=crop?Math.round(w*.10):0,sy=crop?Math.round(h*.20):0,sw=crop?Math.round(w*.80):w,sh=crop?Math.round(h*.60):h;
    const scale=Math.min(1,1800/Math.max(sw,sh));c.width=Math.max(1,Math.round(sw*scale));c.height=Math.max(1,Math.round(sh*scale));
    ctx.drawImage(v,sx,sy,sw,sh,0,0,c.width,c.height);
    const data=ctx.getImageData(0,0,c.width,c.height);
    if(phase===2){ // Higher local contrast helps thin black/white bars on some webcams.
     const a=data.data;for(let i=0;i<a.length;i+=4){const gray=(a[i]*77+a[i+1]*150+a[i+2]*29)>>8;const boosted=Math.max(0,Math.min(255,Math.round((gray-128)*1.8+128)));a[i]=a[i+1]=a[i+2]=boosted}
    }
    const found=await window.ZXingWASM.readBarcodes(data,{formats:['EAN13','EAN8','UPCA'],tryHarder:true,maxNumberOfSymbols:3});
    for(const x of found||[]){code=normalize(x.text||x.rawValue);if(code)break}
   }
  }
  if(epoch!==scanEpoch||!showScan)return;
  if(code){stopScan();registerBarcode(code);return}
 }catch(e){if(epoch===scanEpoch&&showScan)scanMessage('認識処理中：'+(e.message||e))}
 finally{
  scanBusy=false;
  if(epoch===scanEpoch&&showScan)scanTimer=setTimeout(scanLoop,180)
 }
}
function addDirectPick(id,source){
 const r=byId.get(id);if(!r)return null;
 const owned=p().owned[id]||(p().owned[id]={count:0,firstAt:stamp()});owned.count++;owned.lastAt=stamp();
 let collected=0;
 for(const read of Object.values(p().reads))if(read.pickId===id&&read.status==='pending'){
  read.status='owned';read.captureAt=stamp();owned.count++;collected++;
 }
 awardDexTickets();save();return {pick:r,count:owned.count,extra:collected,mult:boostMultiplier(id)};
}
// Gacha: choose rarity first, then weighted pick (unowned x3). This does NOT modify shared barcode records.
function gradeCandidates(minGrade){
 if(minGrade==='special')return ['special'];
 const n=Number(minGrade);return Number.isInteger(n)&&n>=2&&n<=5?['2','3','4','5'].filter(x=>Number(x)>=n):[];
}
function drawGacha(kind,excludeId=null,excludeMax=false){
 let rarityRates=kind==='premium'?PREMIUM_RATES:kind==='daily'?RATES:
  RATES.filter(([k])=>gradeCandidates(kind).includes(k));
 const options=rarityRates.map(([k,w])=>({k,w,pool:RATE_POOLS[k].filter(r=>r.master_id!==excludeId&&(!excludeMax||!isMax(r.master_id)))})).filter(x=>x.pool.length);
 if(!options.length)return null;
 let z=cryptoRandom()*options.reduce((s,x)=>s+x.w,0),picked=options[options.length-1];
 for(const x of options){z-=x.w;if(z<0){picked=x;break}}
 const weights=picked.pool.map(r=>p().owned[r.master_id]?1:3);
 let n=cryptoRandom()*weights.reduce((a,b)=>a+b,0);
 for(let i=0;i<picked.pool.length;i++){n-=weights[i];if(n<0)return picked.pool[i]}
 return picked.pool[picked.pool.length-1];
}
function claimTitle(q){return q.source==='barcode'?'バーコードの重複ピック':q.source==='gift'?'プレゼントコードの重複ピック':'ガチャの重複ピック'}
function claimPage(){
 const q=p().pendingReward,r=byId.get(q?.pickId);
 if(!q||!r)return `${topNav('獲得処理')}<section class="panel">保存済みの抽選情報がありません。</section>`;
 const max=isMax(r.master_id);
 return `${topNav('ピックの重複を確認')}<section class="panel reward-panel"><h2>${esc(claimTitle(q))}</h2><p class="sub">結果は保存済みです。画面を閉じても同じ結果から続けられます。</p><div class="picture" style="height:210px">${pic(r)}</div><h2>${grade(r)} ${esc(r.name_ja)}</h2><p>所持${number(p().owned[r.master_id]?.count)}枚 ／ ${max?'MAX ×2.197':`強化×${boostMultiplier(r.master_id).toFixed(3)}`}</p><p class="sub">再抽選は1回のみ・元の分類以上を保証（スペシャルはスペシャルのみ）。</p><div class="button-row">${!max?'<button data-action="claim-boost">重複強化</button>':`<button data-action="claim-ticket">${esc(ticketName(group(r)))}を受け取る</button>`}<button class="secondary" data-action="claim-reroll">別ピックを1回再抽選</button></div></section>`;
}
function finishClaim(q,id,kind){
 const r=byId.get(id);if(!r){alert('マスターに対象ピックがありません。');return}
 const ply=p();let pending=false,info=null;
 if(q.source==='barcode'||q.source==='gift'){
  const read=ply.reads[q.barcode];if(!read){alert('元の読取記録がありません。');return}
  read.pickId=id;if(q.rerolled)read.rerolledPickId=id;
  if(ply.owned[id]){
   read.status='owned';read.captureAt=stamp();info=addDirectPick(id,q.source);
  }else{read.status='pending';pending=true}
 }else{info=addDirectPick(id,q.source)}
 ply.pendingReward=null;
 ply.lastReward={result:pending?'pending':kind||q.source,pickId:id,barcode:q.barcode||null,info,at:stamp()};
 lastRead=pending?{barcode:q.barcode,pickId:id,status:'new'}:ply.lastReward;
 save();view=pending?'encounter':'reward';render();
}
function finishTicket(q,gradeKey){
 const ply=p(),read=q.barcode?ply.reads[q.barcode]:null;
 if(read){read.status='ticket';read.captureAt=stamp();read.pickId=q.pickId;if(q.rerolled)read.rerolledPickId=q.pickId}
 giftTicket(gradeKey);ply.pendingReward=null;
 ply.lastReward={result:'ticket',ticket:gradeKey,pickId:q.pickId,barcode:q.barcode||null,at:stamp()};lastRead=ply.lastReward;save();view='reward';render();
}
function decideClaim(action){
 const q=p().pendingReward;if(!q)return;
 const r=byId.get(q.pickId);if(!r){alert('対象ピックがありません。');return}
 if(action==='boost'){
  if(isMax(q.pickId)){alert('すでに強化MAXです。');return}
  finishClaim(q,q.pickId,'boost');return;
 }
 if(action==='ticket'){
  if(!isMax(q.pickId)){alert('強化MAXのときだけ券へ交換できます。');return}
  finishTicket(q,group(r));return;
 }
 if(action==='reroll'){
  if(q.rerolled)return;
  const next=drawGacha(group(r),q.originalPickId||q.pickId,false);
  if(!next){alert('再抽選可能なピックがありません。');return}
  q.pickId=next.master_id;q.rerolled=true;q.rerolledAt=stamp();save();
  // A second duplicate is automatically settled. No further reroll or choice.
  if(p().owned[next.master_id]&&isMax(next.master_id)){finishTicket(q,group(next));return}
  finishClaim(q,next.master_id,'reroll');return;
 }
}
function startGacha(source,ticketKey=null){
 if(p().pendingReward){view='claim';render();return}
 if(source==='daily'&&p().dailyGachaDate===dateJST()){alert('本日のガチャは利用済みです。');return}
 if(source==='ticket'&&number(p().tickets[ticketKey])<1)return;
 const r=drawGacha(source==='daily'?'daily':ticketKey,null,source==='ticket');
 if(!r){alert('この券で入手可能なピックがありません。券は消費しません。');return}
 const q=p();
 if(source==='daily'){
  q.dailyGachaDate=dateJST();q.dailyGachaCount=number(q.dailyGachaCount)+1;
  if(q.dailyGachaCount%7===0)giftTicket('premium');
 }else if(source==='ticket')q.tickets[ticketKey]--;
 q.pendingReward={source,pickId:r.master_id,originalPickId:r.master_id,grade:group(r),rerolled:false,createdAt:stamp(),ticketKey};
 save(); // persist draw, daily usage and ticket consumption BEFORE displaying result
 if(source==='ticket'||!q.owned[r.master_id])finishClaim(q.pendingReward,r.master_id,source);
 else{view='claim';render()}
}
function dailyPage(){
 const q=p(),drawn=q.dailyGachaDate===dateJST(),d=number(q.dailyGachaCount),tickets=q.tickets||{},dexCount=Object.keys(q.owned).length;
 return `${topNav('ガチャ')}<section class="panel hero"><h2>🎰 デイリーガチャ</h2><p>毎日1回、ピックを直接獲得。レア度別出現率はバーコードと同じ。未所持ピックは同じレア度内で抽選重み3倍。</p><p class="sub">本日：${drawn?'使用済み':'未使用'} ／ 累計${d}回 ／ 7回ボーナス ${d%7}/7</p><button data-action="daily-pull" ${drawn||q.pendingReward?'disabled':''}>${drawn?'本日はガチャ終了':'ガチャを1回引く'}</button><p class="sub">★2 45%、★3 30%、★4 15%、★5 5%、スペシャル 5%。日本時間0時更新。</p></section><section class="panel"><h2>🎟 所持ガチャ券</h2><p class="sub">図鑑：${dexCount}種類獲得 ／ 次の報酬まで${10-dexCount%10}種類。7回ごとのデイリーボーナスと、図鑑10種類ごとの達成報酬は★4以上ボーナス券。券の抽選はMAX済みを除外し、再抽選も新しい券の発行もありません。</p>${TICKET_TYPES.map(k=>`<div class="row between ticket-row"><span>${esc(ticketName(k))} ×${number(tickets[k])}</span><button class="secondary small" data-action="ticket-pull" data-id="${k}" ${number(tickets[k])<1||q.pendingReward?'disabled':''}>使用</button></div>`).join('')}<p class="sub">★4以上券：★4 80%、★5 15%、スペシャル 5%。条件に合う候補がない場合は券を消費しません。</p></section><section class="panel"><p class="callout">このVer07はブラウザ内だけのテスト版です。本番ではSupabaseのサーバー時刻・利用回数・ガチャ券・獲得処理を一つの安全な取引で管理します。</p></section>`;
}
function pullDaily(){if(p().pendingReward){view='claim';render();return}if(!confirm('デイリーガチャを引きますか？（1日1回）'))return;startGacha('daily')}
function rewardPage(){
 const x=lastRead?.result?lastRead:p().lastReward,r=byId.get(x?.pickId);if(!x)return home();
 if(x.result==='ticket')return `${topNav('ガチャ券獲得')}<section class="panel reward-panel"><h2>🎟 ${esc(ticketName(x.ticket))}を獲得！</h2><p>ガチャ画面から好きなときに使用できます。</p><div class="button-row"><button data-action="daily">ガチャ画面へ</button><button class="secondary" data-action="home">ホームへ</button></div></section>`;
 if(!r)return home();const o=p().owned[r.master_id];
 return `${topNav('ピック獲得')}<section class="panel reward-panel"><h2>🎉 ピックを獲得！</h2><div class="picture" style="height:220px">${pic(r)}</div><h2>${grade(r)} ${esc(r.name_ja)}</h2><p>累計 ${number(o?.count)}枚 ／ 強化×${boostMultiplier(r.master_id).toFixed(3)}${isMax(r.master_id)?' MAX':''}</p><p class="sub">バトルなしで獲得。出撃回数は消費しません。</p><div class="button-row"><button data-action="daily">ガチャへ</button><button data-action="owned">所持ピックへ</button><button class="secondary" data-action="home">ホームへ</button></div></section>`;
}
function createGiftCode(){
 const mode=$('giftMode')?.value,val=$('giftValue')?.value;if(!['grade','pick'].includes(mode)){alert('種類を指定してください。');return}
 if(mode==='grade'&&!RATES.some(([k])=>k===val)){alert('レア度を指定してください。');return}
 if(mode==='pick'&&!battleOK(byId.get(val))){alert('バトル可能なピックIDを指定してください。');return}
 let code;for(let tries=0;tries<40;tries++){const s=Array.from(crypto.getRandomValues(new Uint8Array(8)),x=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[x%32]).join('');code='FG-'+s.slice(0,4)+'-'+s.slice(4);if(!giftRegistry[code])break}
 if(giftRegistry[code]){alert('コード生成に失敗しました。');return}
 giftRegistry[code]={kind:mode,value:val,createdAt:stamp(),usedBy:null,usedAt:null};save();const out=$('giftCreated');if(out){out.hidden=false;out.textContent='発行済み：'+code+'（1回限定）'}
}
function giftPage(){return `${topNav('プレゼントコード')}<section class="panel"><h2>🎁 プレゼントコードを入力</h2><p class="sub">コードを利用すると指定のピックが出現。未所持ならバトル、所持済みならその場で強化します。</p><div class="row"><input id="giftCodeInput" type="text" autocapitalize="characters" autocomplete="off" placeholder="FG-XXXX-XXXX" class="grow"><button data-action="gift-redeem">コードを使う</button></div><p id="giftError" class="warn" role="alert" hidden></p></section><section class="panel"><p class="callout">これは同一ブラウザ内だけの検証用コードです。端末間共有・管理者認証・1回限りの厳格な保証は、サーバー実装まで未対応です。</p></section>`}
function giftError(msg){const el=$('giftError');if(el){el.textContent=msg;el.hidden=!msg}}
function redeemGift(){
 const code=String($('giftCodeInput')?.value||'').trim().toUpperCase(),gift=giftRegistry[code];
 if(p().pendingReward){view='claim';render();return}
 if(!gift){giftError('プレゼントコードが存在しません。');return}if(gift.usedAt){giftError('このコードは使用済みです。');return}
 let r;if(gift.kind==='pick')r=byId.get(gift.value);else r=drawPick(gift.value);
 if(!r){giftError('対象ピックを取得できません。');return}
 gift.usedBy=state.profile;gift.usedAt=stamp();gift.pickId=r.master_id;
 if(p().owned[r.master_id]){
  p().reads[code]={pickId:r.master_id,originalPickId:r.master_id,scannedAt:stamp(),source:'gift',status:'decision',attempts:0};
  p().pendingReward={source:'gift',barcode:code,pickId:r.master_id,originalPickId:r.master_id,grade:group(r),rerolled:false,createdAt:stamp()};
  view='claim';
 }else{
  p().reads[code]={pickId:r.master_id,originalPickId:r.master_id,scannedAt:stamp(),source:'gift',status:'pending',attempts:0};
  lastRead={barcode:code,pickId:r.master_id,status:'new'};view='encounter';
 }
 save();render();
}
function debugPickOptions(){const owned=Object.keys(p().owned);const all=[...DB.records].filter(battleOK).sort((a,b)=>String(a.name_ja).localeCompare(String(b.name_ja),'ja'));
 return `<option value="">ピックを選択</option>${owned.length?`<optgroup label="現在の所持ピック">${owned.map(id=>byId.get(id)).filter(Boolean).map(r=>`<option value="${esc(r.master_id)}">${esc(r.name_ja)} / ${esc(r.pick_no||r.master_id)} / ${esc(r.series)}</option>`).join('')}</optgroup>`:''}<optgroup label="すべてのバトル可能ピック">${all.map(r=>`<option value="${esc(r.master_id)}">${esc(r.name_ja)} / ${esc(r.pick_no||r.master_id)} / ${esc(r.series)}</option>`).join('')}</optgroup>`;
}
function simulateExactPick(){const id=$('debugPick')?.value;if(!byId.has(id)){alert('ピックを選択してください。');return}
 for(let i=0;i<100;i++){const prefix='290'+String(Math.floor(cryptoRandom()*1e9)).padStart(9,'0'),code=prefix+checksum(prefix);if(!registry[code]){registry[code]={pickId:id,grade:group(byId.get(id)),createdAt:stamp(),debug:true};save();registerBarcode(code);return}}
 alert('テストコードを生成できませんでした。')
}
function settings(){return `${topNav('テスト設定')}<section class="panel"><h2>テストプレイヤー</h2><div class="row"><select id="profileSel"><option ${state.profile==='A'?'selected':''}>A</option><option ${state.profile==='B'?'selected':''}>B</option><option ${state.profile==='C'?'selected':''}>C</option></select><span class="sub">3人の独立したテストユーザー</span></div><p class="sub">共通台帳はこのブラウザのテストデータです。別端末との共有はまだできません。</p></section><section class="panel"><h2>管理者用テスト（本番には設置しません）</h2><p class="sub">本番では管理者認証・サーバー権限が必須です。ここは動作試験専用で、誰でも操作できます。</p><div class="row"><input id="testCode" inputmode="numeric" maxlength="13" placeholder="JAN-13 / JAN-8 / UPC-A" class="grow"><button data-action="test-code">コードをテスト</button></div><p id="testCodeError" class="warn" role="alert" hidden></p><div class="button-row"><button class="secondary" data-action="simulate">有効なテストコードを自動生成してスキャン</button><button class="secondary" data-action="toggle-audio">効果音 ${audio?'ON':'OFF'}</button></div></section><section class="panel"><h3>同一ピックを指定して重複強化テスト</h3><p class="sub">毎回異なる、有効な試験用バーコードを作成して指定ピックに割り当てます。累計4枚で強化MAX。MAXでは保証券と再抽選を確認できます。</p><div class="row"><select id="debugPick" class="grow">${debugPickOptions()}</select><button data-action="debug-pick">指定ピックを出現</button></div></section><section class="panel"><h3>🎁 プレゼントコード発行（ローカル実験用）</h3><div class="filter-grid"><label>発行方式<select id="giftMode"><option value="grade">レア度指定</option><option value="pick">特定ピックID指定</option></select></label><label>指定値<select id="giftValue">${RATES.map(([v])=>`<option value="${v}">${v==='special'?'スペシャル':'★'+v}</option>`).join('')}</select></label></div><button data-action="gift-generate">1回限定コードを発行</button><p id="giftCreated" class="callout" hidden></p></section><section class="panel"><h2>初期化（テスト専用）</h2><div class="button-row"><button class="danger" data-action="reset-player">現在のプレイヤーを初期化</button><button class="danger" data-action="reset-demo">共通テスト台帳を含めて初期化</button></div><p class="sub">個人の初期化では、共通バーコード台帳とプレゼントコードの発行履歴は残します。</p></section>`}
function checksum(prefix){let digits=String(prefix).split('').map(Number),s=0;for(let i=digits.length-1,w=3;i>=0;i--,w=w===3?1:3)s+=digits[i]*w;return String((10-s%10)%10)}
function render(){
 if(!DB?.records||!CORE){app.innerHTML='<div class="panel warn">マスターまたは戦闘計算を読み込めません。</div>';return}
 if(!isGameStarted()){app.innerHTML=starter();return}
 if(p().pendingReward&&view!=='claim')view='claim';
 const pages={home,pending,owned:ownedPage,dex,history,scan:scanPage,settings,daily:dailyPage,gift:giftPage,reward:rewardPage,claim:claimPage,battle:battlePage,choose:chooseScreen,encounter,result:resultPage,detail:()=>detail(detailId),historyDetail:()=>historyDetail(historyCode)};
 app.innerHTML=(pages[view]||home)()
}
function onAction(e){
 const button=e.target.closest('[data-action]');if(!button)return;const act=button.dataset.action,id=button.dataset.id,code=button.dataset.code;
 switch(act){
 case 'home':nav('home');break;case 'daily':nav('daily');break;case 'gift':nav('gift');break;case 'pending':nav('pending');break;case 'owned':nav('owned');break;case 'dex':nav('dex');break;case 'history':nav('history');break;case 'scan':nav('scan');startScan();break;case 'settings':nav('settings');break;
 case 'camera':startScan();break;case 'stopcamera':stopScan();scanMessage('カメラ停止中です。再開するには「カメラを再試行」を押してください。');cameraControls(true);break;
 case 'starter-set':chooseStarterSet(id);break;
 case 'choose':choose(code);break;case 'retry':if(code&&p().reads[code]?.status==='pending')choose(code);else nav('pending');break;
 case 'start-battle':startBattle(code,id);break;
 case 'battle':if(p().battle){battleError='';stopScan();view='battle';autoRunning=true;render();if(autoTimer)clearTimeout(autoTimer);autoTimer=setTimeout(autoTick,350)}else nav('home');break;
 case 'detail':detailId=id;view='detail';render();break;
 case 'history-detail':historyCode=code;view='historyDetail';render();break;

 case 'auto':autoRunning=!autoRunning;if(autoTimer){clearTimeout(autoTimer);autoTimer=null}if(autoRunning)autoTimer=setTimeout(autoTick,90);if(!battleBusy)render();break;
 case 'speed':autoSpeed=autoSpeed%5+1;putJSON(SPEED_KEY,autoSpeed);if(!battleBusy)render();else{const e=$('autoSpeedStatus');if(e)e.textContent='×'+autoSpeed}break;
 case 'forfeit':if(battleBusy){alert('攻撃演出の完了後にあきらめる操作をしてください。');break}autoRunning=false;if(autoTimer){clearTimeout(autoTimer);autoTimer=null}forfeit();break;
 case 'claim-boost':decideClaim('boost');break;case 'claim-ticket':decideClaim('ticket');break;case 'claim-reroll':decideClaim('reroll');break;
 case 'ticket-pull':startGacha('ticket',id);break;
 case 'test-code':registerBarcode($('testCode')?.value||'');break;case 'daily-pull':pullDaily();break;case 'gift-redeem':redeemGift();break;case 'gift-generate':createGiftCode();break;case 'debug-pick':simulateExactPick();break;
 case 'simulate':{let val='490'+String(Math.floor(Math.random()*1e9)).padStart(9,'0');val+=checksum(val);registerBarcode(val);break}
 case 'toggle-audio':audio=!audio;putJSON(AUDIO_KEY,audio);render();break;
 case 'reset-player':if(confirm('テストプレイヤー'+state.profile+'のデータを初期化しますか？')){state.profiles[state.profile]=newPlayer();save();nav('home')}break;
 case 'reset-demo':if(confirm('全プレイヤーと共通テスト台帳をすべて初期化しますか？')){state={profile:'A',profiles:{A:newPlayer(),B:newPlayer(),C:newPlayer()}};registry={};giftRegistry={};save();nav('home')}break;
 case 'toggle-filter':filterOpen=!filterOpen;render();break;
 case 'clear-filters':filter='';sort='series';filterSet={series:'all',grade:'all',type:'all',status:'all'};dexLimit=70;render();break;
 case 'card-size':if(['small','medium','large'].includes(id)){cardSize=id;render()}break;
 case 'more-dex':dexLimit+=120;render();break;
 }
}
async function autoTick(){autoTimer=null;if(!autoRunning||!p().battle||view!=='battle')return;await battleTurn();if(autoRunning&&p().battle&&view==='battle')autoTimer=setTimeout(autoTick,Math.max(120,Math.round(560/autoSpeed)))}
app.addEventListener('click',onAction);
function updateSearchInput(el){
 filter=el.value;dexLimit=70;
 const start=el.selectionStart,end=el.selectionEnd,scrollY=window.scrollY;
 render();const inp=$('searchPick');if(inp){inp.focus({preventScroll:true});try{inp.setSelectionRange(start,end)}catch{}}window.scrollTo(0,scrollY)
}
app.addEventListener('compositionstart',e=>{if(e.target.id==='searchPick')searchComposing=true});
app.addEventListener('compositionend',e=>{if(e.target.id==='searchPick'){searchComposing=false;updateSearchInput(e.target)}});
app.addEventListener('input',e=>{if(e.target.id==='searchPick'&&!searchComposing&&!e.isComposing)updateSearchInput(e.target)});
app.addEventListener('change',e=>{
 if(e.target.id==='sortPick'){sort=e.target.value;render()}
 if(e.target.dataset.filterKey){filterSet[e.target.dataset.filterKey]=e.target.value;dexLimit=70;render()}
 if(e.target.id==='giftMode'){const o=$('giftValue');if(o)o.innerHTML=e.target.value==='pick'?debugPickOptions():RATES.map(([v])=>`<option value="${v}">${v==='special'?'スペシャル':'★'+v}</option>`).join('')}
 if(e.target.id==='profileSel'){if(p().battle)alert('戦闘途中のプレイヤーでも切替できますが、元に戻して再開してください。');state.profile=e.target.value;save();nav('home')}
});
$('homeTop').addEventListener('click',()=>nav('home'));
window.addEventListener('popstate',event=>{stopScan();if(autoTimer){clearTimeout(autoTimer);autoTimer=null}autoRunning=false;battleEpoch++;battleBusy=false;view=event.state?.frendaBarcode&&['home','pending','owned','dex','history','settings','scan'].includes(event.state.view)?event.state.view:'home';filter='';filterOpen=false;render();if(view==='scan'){scanMessage('ブラウザの戻る操作で開きました。「カメラを再試行」を押してください。');cameraControls(true)}});
window.addEventListener('pagehide',stopScan);
window.addEventListener('offline',()=>{if(autoTimer){clearTimeout(autoTimer);autoTimer=null}autoRunning=false;battleEpoch++;battleBusy=false;if(view==='battle'){battleError='通信が切断されました。戦闘は保存済みです。';render()}});
window.addEventListener('online',()=>{if(view==='battle'){battleError='通信が回復しました。途中から再開できます。';render()}});
// Migrate previously acquired collections without changing the save key or double-paying rewards.
for(const user of Object.values(state.profiles)){
 const milestone=Math.floor(Object.keys(user.owned||{}).length/10),paid=number(user.dexRewardsPaid);
 if(milestone>paid){user.tickets??={};user.tickets.premium=number(user.tickets.premium)+milestone-paid;user.dexRewardsPaid=milestone}
}
save();
window.FRENDA_BARCODE_TEST=Object.freeze({version:VERSION,normalize,group,drawPick,drawGacha,registerBarcode,usedLeft,boostMultiplier,publicSnapshot:()=>({state:JSON.parse(JSON.stringify(state)),registry:JSON.parse(JSON.stringify(registry)),gifts:JSON.parse(JSON.stringify(giftRegistry))}),testHelpers:{drawPick,addDirectPick,simulateExactPick,decideClaim,startGacha}});
render();
})();
/* Updated: 2026-11-15 16:26 JST / Ver08 */
