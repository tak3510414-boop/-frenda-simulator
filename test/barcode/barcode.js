/* FRENDA_BARCODE_VERSION: 0.5 / isolated TEST prototype / regional starter trios */
(()=>{
'use strict';
const VERSION='Ver0.5';
const DB=window.FRENDA_MASTER,CORE=window.FRENDA_CORE;
const app=document.getElementById('app');
const STORE_KEY='frenda:barcode:test:ver02:state';
const REG_KEY='frenda:barcode:test:ver02:registry';
const AUDIO_KEY='frenda:barcode:test:ver02:audio';
const RATES=[['2',45],['3',30],['4',15],['5',5],['special',5]];
const STAT_KEYS=['hp','atk','def','sp_atk','sp_def'];
const byId=new Map((DB?.records||[]).map(r=>[String(r.master_id),r]));
const RATE_POOLS=Object.fromEntries(RATES.map(([k])=>[k,(DB?.records||[]).filter(r=>group(r)===k)]));
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
function newPlayer(){return {starterSetKey:null,starterIds:[],starterOptions:null,owned:{},reads:{},used:{},battle:null,created:stamp()}}
let state=getJSON(STORE_KEY,{profile:'A',profiles:{A:newPlayer(),B:newPlayer(),C:newPlayer()}});
let registry=getJSON(REG_KEY,{});
if(!state.profiles||typeof state.profiles!=='object')state={profile:'A',profiles:{A:newPlayer(),B:newPlayer(),C:newPlayer()}};
for(const x of ['A','B','C'])state.profiles[x]??=newPlayer();
let view='home',filter='',sort='series',lastRead=null,showScan=false,scanStream=null,scanTimer=null,scanBusy=false,scanNative=null,autoTimer=null,autoSpeed=1,audio=getJSON(AUDIO_KEY,true),battleError='';
let filterSet={series:'all',grade:'all',type:'all',status:'all'},filterOpen=false,cardSize='medium',dexLimit=70,searchComposing=false,scanEpoch=0,scanPhase=0,scanStatus='',detailId=null,historyCode=null;
const p=()=>state.profiles[state.profile];
function save(){putJSON(STORE_KEY,state);putJSON(REG_KEY,registry)}
function beep(freq=700){if(!audio)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=new C(),o=c.createOscillator(),g=c.createGain();o.frequency.value=freq;o.type='sine';g.gain.value=.035;o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.07);o.onended=()=>c.close()}catch{}}
function pic(r,kind='normal'){
 if(kind==='none')return '<div class="question">？</div>';
 const src=String(r?.official_image||'');
 if(!/^https:\/\//.test(src))return `<div class="fallback">画像未登録<br>${esc(r?.name_ja||'')}</div>`;
 return `<img src="${esc(src)}" alt="${esc(r.name_ja)}のピック" loading="lazy" referrerpolicy="no-referrer" class="${kind==='silhouette'?'muted':''}" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<div class=&quot;fallback&quot;>画像を表示できません<\/div>')">`;
}
function usedLeft(id){const d=p().used[id];return Math.max(0,3-((d?.date===dateJST())?number(d.count):0))}
function battleRecord(r){const c=Math.min(8,Math.max(0,number(p().owned[r.master_id]?.count)-1)),mult=Math.pow(1.10,c),out={...r};for(const k of STAT_KEYS)if(Number.isFinite(+r[k])&&+r[k]>0)out[k]=Math.max(1,Math.round(+r[k]*mult));out._mult=mult;return out}
function battleOK(r){return Boolean(r&&STAT_KEYS.every(k=>Number(r[k])>0)&&Number(r.move_power_ref)>0)}
function noStats(r){return !battleOK(r)}
function progress(){const owned=Object.keys(p().owned).length,found=new Set(Object.values(p().reads).map(x=>x.pickId));for(const id of Object.keys(p().owned))found.add(id);return {owned,found:found.size,total:byId.size,pending:Object.values(p().reads).filter(x=>x.status==='pending').length}}
function nav(v){
 stopScan();if(autoTimer){clearTimeout(autoTimer);autoTimer=null}
 view=v;filter='';sort='series';filterSet={series:'all',grade:'all',type:'all',status:'all'};filterOpen=false;dexLimit=70;lastRead=null;
 if(window.history?.pushState&&v!=='home')try{window.history.pushState({frendaBarcode:true,view:v},'',location.href)}catch{}
 render()
}
function cash(s){return `<span class="chip">${esc(s)}</span>`}
function topNav(title){return `<section class="panel row between"><h2 style="margin:0">${esc(title)}</h2><button class="secondary small" data-action="home">ホームへ</button></section>`}
function buttons(){return `<div class="button-grid"><button data-action="scan">📷 バーコードスキャン<small>カメラで新しいピックを発見</small></button><button data-action="pending">⚔ 出現中一覧<small>バトルに挑戦</small></button><button data-action="owned">🗂 所持ピック<small>出撃回数・強化倍率</small></button><button data-action="dex">📖 ポケモン図鑑<small>発見・入手を記録</small></button><button data-action="history">🕒 読取履歴<small>初回日時・現在の状態</small></button><button data-action="settings">⚙ テスト設定<small>プレイヤー切替・動作確認</small></button></div>`}
function home(){const s=progress(),starters=(p().starterIds||[]).map(id=>byId.get(id)).filter(Boolean);return `<section class="panel hero"><h2>バーコードを探してピックを集めよう！</h2><p class="sub">商品についているJAN・UPCコードをカメラで読み取ると、ピックが出現します。敵を倒してゲット！ 同じピックは自動強化。</p><button class="green" data-action="scan">📷 バーコードをスキャン</button></section><section class="panel"><div class="metrics"><div class="metric"><b>${s.owned}</b><span>入手済みピック</span></div><div class="metric"><b>${s.found}</b><span>発見ピック</span></div><div class="metric"><b>${s.pending}</b><span>出現中</span></div></div><p class="sub">現在のテストプレイヤー：${esc(state.profile)} ／ マスター：${DB.records.length}件</p>${starters.length?`<div class="row">${starters.map(r=>cash('初期ピック：'+r.name_ja+'（出撃'+usedLeft(r.master_id)+'/3）')).join('')}${p().battle?'<span class="chip wait">中断中のバトルあり</span>':''}</div>`:''}</section><section class="panel">${buttons()}</section>${p().battle?`<section class="panel"><p class="warn">中断したバトルがあります。新しいバトルは開始できません。</p><button data-action="battle">バトルを再開</button></section>`:''}`}
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
 player.starterSetKey=chosen.key;
 player.starterIds=chosen.ids.slice();
 save();
 nav('home');
}

function recordCard(r,mode,data={}){const o=p().owned[r.master_id],owned=!!o,ct=o?.count||0,mult=Math.pow(1.1,Math.min(8,Math.max(0,ct-1))),status=data.status||'none';let button='';if(mode==='pending'){button=`<button data-action="choose" data-code="${esc(data.barcode)}" ${p().battle?'disabled':''}>バトルを選択</button>`}else if(mode==='owned'){button=`<button data-action="detail" data-id="${esc(r.master_id)}">詳細</button>`}else if(mode==='history'){button=`<button data-action="history-detail" data-code="${esc(data.barcode)}">詳細</button>`}else if(mode==='dex'&&status!=='none'){button=`<button data-action="detail" data-id="${esc(r.master_id)}">詳細</button>`}
return `<article class="pick-card"><div class="picture">${pic(r,mode==='dex'?(status==='none'?'none':status==='pending'?'silhouette':'normal'):'normal')}</div><b>${esc(r.name_ja)}</b><span class="${group(r)==='special'?'special':'stars'}">${grade(r)}</span><span class="sub">${esc(r.series||'')} ／ ${esc(r.pick_no||'')}</span>${mode==='pending'?`<span class="chip wait">出現中・${number(data.attempts)}戦</span>`:''}${owned?`<span class="sub">累計${ct}枚 ／ 強化×${mult.toFixed(2)}${ct>=9?' MAX':''}</span><span class="stamina">本日 ${usedLeft(r.master_id)}/3 回</span>`:''}${mode==='dex'?`<span class="chip ${status==='owned'?'ok':'wait'}">${status==='owned'?'入手済み':status==='pending'?'発見済み':'未発見'}</span>`:''}${button}</article>`}
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
 const reads=Object.values(p().reads),found=new Set(reads.map(x=>x.pickId)),owned=new Set(Object.keys(p().owned));for(const id of owned)found.add(id);
 const list=DB.records.map(r=>({r,status:owned.has(r.master_id)?'owned':found.has(r.master_id)?'pending':'none'}));let d=sorted(list,'dex'),s=progress();
 const series=[...new Set(DB.records.map(x=>x.series||'その他'))];
 return `${topNav('ポケモン図鑑')}<section class="panel"><div class="metrics"><div class="metric"><b>${s.owned}/${s.total}</b><span>入手率 ${(s.owned/s.total*100).toFixed(1)}%</span></div><div class="metric"><b>${s.found}/${s.total}</b><span>発見率 ${(s.found/s.total*100).toFixed(1)}%</span></div><div class="metric"><b>${series.length}</b><span>シリーズ数</span></div></div><div class="progress"><div style="width:${s.owned/s.total*100}%"></div></div></section><section class="panel">${controls('図鑑から名前を検索','dex')}<p class="sub">表示 ${d.length}/${list.length}件 ／ ？：未発見・暗いピック：発見済み・カラー：入手済み</p><div class="pick-grid size-${cardSize}" id="dexGrid">${d.slice(0,dexLimit).map(x=>recordCard(x.r,'dex',{status:x.status})).join('')||'<div class="empty">条件に合うピックはありません</div>'}</div>${d.length>dexLimit?`<button class="secondary" data-action="more-dex">さらに表示（残り${d.length-dexLimit}件）</button>`:''}</section><section class="panel"><h3>シリーズ別コンプリート</h3>${series.map(name=>{const all=DB.records.filter(x=>(x.series||'その他')===name),own=all.filter(x=>owned.has(x.master_id)).length,fnd=all.filter(x=>found.has(x.master_id)).length;return `<div style="margin:8px 0"><div class="row between"><span class="sub">${esc(name)} ${own===all.length?'🏆':''}</span><span class="sub">${own}/${all.length}（発見${fnd}）</span></div><div class="progress"><div style="width:${own/all.length*100}%"></div></div></div>`}).join('')}</section>`
}
function history(){
 const rows=Object.entries(p().reads).map(([barcode,x])=>({r:byId.get(x.pickId),barcode,...x,time:x.scannedAt})).filter(x=>x.r),data=sorted(rows,'history');
 return `${topNav('バーコード読取履歴')}<section class="panel">${controls('名前・バーコード番号','history')}<p class="sub">表示 ${data.length}/${rows.length}件 ／ 初回読取日時（日本時間）</p>${data.map(x=>`<div class="row between history-row"><div><b>${esc(x.r.name_ja)}</b><span class="sub"> ${grade(x.r)} ／ ${esc(x.barcode)}</span><div class="sub">${esc(x.scannedAt)}</div></div><div><span class="chip ${x.status==='owned'?'ok':'wait'}">${x.status==='owned'?'入手済み':'出現中'}</span><button class="secondary small" data-action="history-detail" data-code="${esc(x.barcode)}">詳細</button></div></div>`).join('')||'<div class="empty">該当する読取履歴はありません</div>'}</section>`
}
function statGraph(name,base,current,max){
 const original=Math.max(0,number(base)),effective=Math.max(0,number(current));
 const scale=Math.max(number(max),original,effective,1),basePct=Math.max(0,Math.min(100,original/scale*100)),boostPct=Math.max(0,Math.min(100-basePct,(effective-original)/scale*100));
 return `<div class="ability-stat"><div class="ability-stat-head"><b>${esc(name)}</b><strong>${esc(effective)}</strong></div><div class="ability-track"><span class="ability-base" style="width:${basePct}%"></span><span class="ability-growth" style="width:${boostPct}%"></span></div></div>`
}
function stats(r){if(!r)return '';
 const b=p().owned[r.master_id]?battleRecord(r):r;
 const fields=[['HP','hp',240],['ATK','atk',220],['DEF','def',220],['SP.ATK','sp_atk',220],['SP.DEF','sp_def',220],['すばやさ','speed_level',5]];
 const power=Number(r.move_power_ref)>0?r.move_power_ref:'未登録';
 const accuracy=r.move_accuracy_always?'必中':Number(r.move_accuracy_ref)>0?`${r.move_accuracy_ref}%`:'未登録';
 const fin=r.finisher_move||'なし';const specials=Array.isArray(r.special)?r.special.join(' / '):r.special||'なし';
 return `<h3 class="detail-section">能力</h3><div class="ability-legend"><span><i class="legend-base"></i>初期値</span><span><i class="legend-growth"></i>重複強化分</span></div><div class="ability-grid">${fields.map(([name,key,max])=>statGraph(name,r[key],b[key],max)).join('')}</div><h3 class="detail-section">わざ・特殊要素</h3><div class="move-info"><div><span>タイプ</span><b>${esc([r.type1,r.type2].filter(Boolean).join('・')||'未登録')}</b></div><div><span>通常わざ</span><b>${esc(r.move||'未登録')} ／ ${esc(r.move_type||'-')} ／ ${esc(r.move_class||'-')}</b></div><div><span>参考威力・命中</span><b>${esc(power)} ／ ${esc(accuracy)}</b></div><div><span>必殺技</span><b>${esc(fin)}</b></div><div><span>特殊要素</span><b>${esc(specials)}</b></div><div><span>ポケエネ</span><b>${esc(r.poke_ene??'未登録')}</b></div></div>`
}
function detail(id){
 const r=byId.get(id);if(!r)return topNav('ピック詳細')+'<div class="panel">マスターにありません</div>';
 const owned=p().owned[id],pend=Object.entries(p().reads).filter(([,x])=>x.pickId===id&&x.status==='pending'),found=owned||pend.length;
 return `${topNav('ピック詳細')}<section class="panel detail-sheet"><div class="detail-hero"><div class="picture detail-pic">${pic(r,owned?'normal':found?'silhouette':'none')}</div><div><h2>${grade(r)} ${esc(r.name_ja)}</h2><p class="sub">${esc(r.series)} ／ ${esc(r.pick_no||r.master_id)}</p><p>${owned?`累計${owned.count}枚 ／ 強化×${battleRecord(r)._mult.toFixed(2)}${owned.count>=9?' MAX':''}`:found?'発見済み・未入手':'未発見'}</p>${owned?`<p class="stamina">本日 残り${usedLeft(r.master_id)}/3回</p>`:''}</div></div>${found?stats(r):''}${pend.length?`<p><button data-action="choose" data-code="${esc(pend[0][0])}">このピックに挑戦</button></p>`:''}</section>`
}
function historyDetail(code){const x=p().reads[code],r=byId.get(x?.pickId);return `${topNav('読取履歴詳細')}<section class="panel"><h2>${esc(r?.name_ja||'不明')}</h2><p>バーコード：${esc(code)}</p><p>初回読取：${esc(x?.scannedAt)}</p><p>状態：${x?.status==='owned'?'入手済み':'出現中'}</p><p>勝利・取得：${esc(x?.captureAt||'未取得')}</p><p>挑戦回数：${number(x?.attempts)}</p>${x?.status==='pending'?`<button data-action="choose" data-code="${esc(code)}">バトル</button>`:`<button data-action="detail" data-id="${esc(x?.pickId)}">ピック詳細</button>`}</section>`}
function estimate(m,e){const a=battleRecord(m),b=e;return (number(a.hp)||0)+(number(a.atk)+number(a.sp_atk))*1.5+(number(a.def)+number(a.sp_def))*.5 + number(CORE.eff(a.move_type,b))*35}
function choose(code){const enemy=byId.get(p().reads[code]?.pickId);if(!enemy||p().reads[code]?.status!=='pending'){nav('pending');return}if(p().battle){alert('中断中のバトルがあります。先に再開してください。');nav('battle');return}lastRead=code;view='choose';filter='';sort='grade';render()}
function chooseScreen(){const code=lastRead,enemy=byId.get(p().reads[code]?.pickId);if(!enemy)return topNav('バトル準備')+`<section class="panel">出現中一覧から選んでください。</section>`;const rows=Object.keys(p().owned).map(id=>byId.get(id)).filter(Boolean);const active=rows.filter(r=>usedLeft(r.master_id)>0&&battleOK(r));active.sort((a,b)=>estimate(b,enemy)-estimate(a,enemy));return `${topNav('1対1 バトル準備')}<section class="panel"><div class="row"><div class="picture" style="width:140px;height:140px">${pic(enemy)}</div><div><h2>${grade(enemy)} ${esc(enemy.name_ja)}</h2><p class="sub">${esc(enemy.series)} ／ 敵は未強化</p><span class="chip wait">この戦闘は開始時に出撃1回消費</span></div></div>${stats(enemy)}${noStats(enemy)?'<p class="callout">マスターにバトル能力値が不足しています。この敵との戦闘はマスター補完後に可能になります。</p>':''}</section><section class="panel"><h2>おすすめの出撃ピック</h2><p class="sub">強化後能力・タイプ・出撃回数を基に並べています。推奨順はテスト用の簡易評価で、勝利保証ではありません。</p><div class="pick-grid">${active.slice(0,3).map(r=>fighterCard(r,code,true)).join('')}</div></section><section class="panel"><h2>すべての所持ピック</h2><div class="pick-grid">${active.map(r=>fighterCard(r,code,false)).join('')||'<p>出撃可能なピックがありません。日本時間の翌日0時に回復します。</p>'}</div></section>`}
function fighterCard(r,code,recommended){return `<article class="pick-card"><div class="picture">${pic(r)}</div><b>${esc(r.name_ja)}</b><span class="sub">${grade(r)} 強化×${battleRecord(r)._mult.toFixed(2)}</span><span class="stamina">残り${usedLeft(r.master_id)}/3回</span><button data-action="start-battle" data-code="${esc(code)}" data-id="${esc(r.master_id)}">${recommended?'おすすめ：':''}出撃する</button></article>`}
function startBattle(code,id){if(p().battle){nav('battle');return}if(!navigator.onLine){alert('通信できない状態です。獲得バトルは開始できません。');return}const enemy=byId.get(p().reads[code]?.pickId),me=byId.get(id);if(!enemy||!me||p().reads[code].status!=='pending'||!p().owned[id]||usedLeft(id)<1){alert('開始条件を満たしていません。');nav('pending');return}if(!battleOK(enemy)||!battleOK(me)){alert('マスター能力値の未登録があるため、このテスト版では戦闘できません。');return}if(!confirm(`${me.name_ja}で${enemy.name_ja}に挑みますか？\nバトル開始時に出撃回数を1回消費します。`))return;
 const day=dateJST(),u=p().used[id];p().used[id]={date:day,count:(u?.date===day?number(u.count):0)+1};const ally=battleRecord(me),speedA=number(ally.speed_level),speedB=number(enemy.speed_level),first=speedA===speedB?(Math.random()<.5?'ally':'enemy'):(speedA>speedB?'ally':'enemy');p().battle={id:'demo-'+Date.now(),code,ally:id,enemy:enemy.master_id,allyStats:ally,enemyStats:{...enemy},allyHp:number(ally.hp),enemyHp:number(enemy.hp),turn:1,first,log:[`${grade(enemy)} ${enemy.name_ja}とのバトル開始！`,`${first==='ally'?ally.name_ja:enemy.name_ja}が先攻！`],createdAt:stamp(),auto:false};p().reads[code].attempts=(p().reads[code].attempts||0)+1;save();view='battle';render()}
function takeDamage(att,def){const x=CORE.dmg(att,def,'v1');const acc=number(x.accuracy)||1;if(Math.random()>acc)return {n:0,hit:false,eff:x.e,nice:false};const spread=95+Math.floor(Math.random()*11),nice=Math.random()<.05;const n=Math.max(1,Math.round(number(x.hitN||x.n)*spread/100*(nice?1.2:1)));return {n,hit:true,eff:x.e,nice}}
function battleTurn(){const b=p().battle;if(!b)return;if(!navigator.onLine){battleError='通信がありません。復旧後に再開できます。';render();return}const order=b.first==='ally'?['ally','enemy']:['enemy','ally'];for(const side of order){if(b.allyHp<=0||b.enemyHp<=0)break;const my=side==='ally',a=my?b.allyStats:b.enemyStats,d=my?b.enemyStats:b.allyStats,x=takeDamage(a,d);if(my)b.enemyHp=Math.max(0,b.enemyHp-x.n);else b.allyHp=Math.max(0,b.allyHp-x.n);b.log.push(`${a.name_ja}の${CORE.skillName(a)}！ ${x.hit?`${x.n}ダメージ${x.nice?' ✨ナイスアタック！':''}`:'ミス！'}`)}b.turn++;b.log=b.log.slice(-60);if(b.enemyHp<=0){captureAfterVictory(b.code);beep(950);view='result';lastRead={result:'win',pickId:b.enemy,barcode:b.code};p().battle=null}else if(b.allyHp<=0){p().battle=null;lastRead={result:'lost',pickId:b.enemy,barcode:b.code};view='result';beep(280)}save();render()}
function captureAfterVictory(code){const read=p().reads[code];if(!read)return;const id=read.pickId;const claims=Object.entries(p().reads).filter(([,v])=>v.pickId===id&&v.status==='pending');for(const [barcode,entry] of claims){entry.status='owned';entry.captureAt=stamp();if(!p().owned[id])p().owned[id]={count:0,firstAt:entry.captureAt};p().owned[id].count++;p().owned[id].lastAt=stamp()}return claims.length}
function forfeit(){if(!p().battle)return;if(!confirm('このバトルをあきらめますか？ 出撃回数は返却されません。'))return;const b=p().battle;p().battle=null;lastRead={result:'forfeit',pickId:b.enemy,barcode:b.code};view='result';save();render()}
function battlePage(){const b=p().battle;if(!b)return `${topNav('バトル')}<section class="panel empty">進行中のバトルはありません</section>`;const me=b.allyStats,en=b.enemyStats,mePct=Math.max(0,Math.min(100,b.allyHp/me.hp*100)),enPct=Math.max(0,Math.min(100,b.enemyHp/en.hp*100));return `${topNav('バトル中')}<section class="panel"><div class="row between"><h2 style="margin:0">第${b.turn}ターン</h2><span class="chip">手動 / AUTO ${autoSpeed}倍</span></div><div class="battle-board"><div class="combatant"><strong>自分：${esc(me.name_ja)}</strong><div class="picture">${pic(me)}</div><div class="hp-track"><div class="hp-fill ${mePct<35?'low':''}" style="width:${mePct}%"></div></div><div class="sub">HP ${b.allyHp}/${me.hp}</div></div><div class="combatant"><strong>敵：${esc(en.name_ja)}</strong><div class="picture">${pic(en)}</div><div class="hp-track"><div class="hp-fill ${enPct<35?'low':''}" style="width:${enPct}%"></div></div><div class="sub">HP ${b.enemyHp}/${en.hp}</div></div></div><div class="combat-log" role="log">${b.log.slice(-7).map(x=>`<p>${esc(x)}</p>`).join('')}</div>${battleError?`<p class="warn">${esc(battleError)}</p>`:''}<div class="button-row" style="margin-top:10px"><button data-action="turn">こうげき</button><button class="secondary" data-action="auto">${autoTimer?'AUTO停止':'AUTO開始'}</button><button class="secondary" data-action="speed">速度 ×${autoSpeed}</button><button class="danger" data-action="forfeit">あきらめる</button></div><p class="sub">※初期テスト版：フレンダダンジョンと同じ共通計算式・±5%乱数・5%ナイス攻撃を使用。演出と一部の戦闘処理は移植途中です。</p></section>`}
function resultPage(){
 const info=lastRead;if(!info?.result)return home();const r=byId.get(info.pickId),o=p().owned[info.pickId];const won=info.result==='win';
 const actions=won?'<button data-action="pending">出現中一覧に戻る</button><button class="secondary" data-action="home">ホームへ</button>':`<button data-action="retry" data-code="${esc(info.barcode)}">別のピックで再戦</button><button class="secondary" data-action="pending">出現中一覧に戻る</button>`;
 return `${topNav('バトル結果')}<section class="panel" style="text-align:center"><h2>${won?'🎉 バトル勝利！':info.result==='forfeit'?'バトルを棄権':'バトル敗北'}</h2><div class="picture" style="height:220px">${pic(r)}</div><h2>${grade(r)} ${esc(r.name_ja)}</h2><p>${won?`ピックを獲得しました！ 累計${o?.count||0}枚・強化×${Math.pow(1.1,Math.min(8,(o?.count||1)-1)).toFixed(2)}`:'このピックは出現中です。出撃可能なピックを選び、再挑戦できます。'}</p><div class="button-row">${actions}</div></section>`
}
function registerBarcode(code){
 const canonical=normalize(code);if(!canonical){showCodeError('バーコードの桁数またはチェックデジットが正しくありません。');return}
 showCodeError('');stopScan();let entry=registry[canonical];
 if(!entry){const result=drawPick();entry={pickId:result.master_id,grade:group(result),createdAt:stamp()};registry[canonical]=entry}
 const r=byId.get(entry.pickId);if(!r){showCodeError('対応ピックが現在のマスターにありません。');return}
 let read=p().reads[canonical],status='';if(read){status='already'}else if(p().owned[entry.pickId]){
  read={pickId:entry.pickId,scannedAt:stamp(),captureAt:stamp(),status:'owned',attempts:0};p().reads[canonical]=read;
  const o=p().owned[entry.pickId];o.count++;o.lastAt=stamp();status='boost';
  const extra=Object.entries(p().reads).filter(([bc,v])=>bc!==canonical&&v.pickId===entry.pickId&&v.status==='pending');
  for(const [bc,x] of extra){x.status='owned';x.captureAt=stamp();o.count++;o.lastAt=stamp()}
 }else{read={pickId:entry.pickId,scannedAt:stamp(),status:'pending',attempts:0};p().reads[canonical]=read;status='new'}
 save();lastRead={barcode:canonical,pickId:entry.pickId,status};beep(950);if(navigator.vibrate)try{navigator.vibrate(70)}catch{}view='encounter';render()
}
function cryptoRandom(){const x=new Uint32Array(1);crypto.getRandomValues(x);return x[0]/4294967296}
function drawPick(){const groups=RATES.reduce((s,[k,rate])=>{s.push([k,rate]);return s},[]);let z=cryptoRandom()*100,k=groups[groups.length-1][0];for(const [key,rate] of groups){z-=rate;if(z<0){k=key;break}}const pool=RATE_POOLS[k]||[];if(!pool.length)throw Error('抽選対象がありません');const appearance={};for(const row of Object.values(registry))appearance[row.pickId]=(appearance[row.pickId]||0)+1;let weights=pool.map(r=>1/Math.sqrt(1+(appearance[r.master_id]||0))),sum=weights.reduce((a,b)=>a+b,0),u=cryptoRandom()*sum;for(let i=0;i<pool.length;i++){u-=weights[i];if(u<0)return pool[i]}return pool[pool.length-1]}
function normalize(value){const code=String(value||'').replace(/\s/g,'');if(!/^\d+$/.test(code)||![8,12,13].includes(code.length))return null;let digits=code.split('').map(Number),check=digits.pop(),sum=0;for(let i=digits.length-1,weight=3;i>=0;i--,weight=weight===3?1:3)sum+=digits[i]*weight;const computed=(10-sum%10)%10;if(computed!==check)return null;return code.length===12?'0'+code:code}
function encounter(){const x=lastRead,r=byId.get(x?.pickId);if(!r)return home();const owned=p().owned[r.master_id],isNew=x.status==='new';return `${topNav('バーコード読み取り結果')}<section class="panel" style="text-align:center"><p class="${x.status==='already'?'warn':'safe'}">${x.status==='already'?'このバーコードは読み取り済み':isNew?'新しいピックが出現！':'所持済みピックを自動強化！'}</p><div class="picture" style="height:230px">${pic(r)}</div><h2>${grade(r)} ${esc(r.name_ja)}</h2><p class="sub">コード：${esc(x.barcode)} ／ ${esc(r.series)}</p>${owned?`<p>累計${owned.count}枚・強化×${battleRecord(r)._mult.toFixed(2)}${owned.count>=9?' MAX':''}</p>`:'<p>出現中一覧に登録しました。勝利すればゲット！</p>'}<div class="button-row">${p().reads[x.barcode]?.status==='pending'?`<button data-action="choose" data-code="${esc(x.barcode)}">今すぐバトル</button>`:`<button data-action="detail" data-id="${esc(r.master_id)}">ピック詳細</button>`}<button class="secondary" data-action="scan">次のバーコード</button><button class="secondary" data-action="home">あとで</button></div></section>`}
function scanMessage(message){scanStatus=message;const e=$('scanState');if(e)e.textContent=message}
function showCodeError(message){const e=$('testCodeError');if(e){e.textContent=message;e.hidden=!message}if(!e)scanMessage(message)}
function scanPage(){return `${topNav('バーコードスキャン')}<section class="panel"><div class="callout">カメラ読み取り限定です。HTTPSとカメラ許可が必要です。このVer05の共通台帳はまだブラウザ内のテストデータです。</div><div class="scan-view" style="margin-top:12px"><video id="video" autoplay playsinline muted></video><div class="scan-guide"></div></div><p id="scanState" class="sub" role="status">${esc(scanStatus||'カメラを起動してください。')}</p><p id="scanDiagnostics" class="sub" aria-live="polite">カメラ解像度：起動前</p><div class="button-row"><button data-action="camera">📷 カメラを起動</button><button class="secondary" data-action="stopcamera">カメラ停止</button></div></section>`}
async function startScan(){
 if(!navigator.onLine){scanMessage('通信がありません。');return}
 if(!isSecureContext){scanMessage('HTTPSで開いてください。');return}
 if(!navigator.mediaDevices?.getUserMedia){scanMessage('このブラウザではカメラを利用できません。');return}
 if(!('BarcodeDetector' in window)&&!window.ZXingWASM?.readBarcodes){scanMessage('読取ライブラリを読み込めません。通信状態を確認してください。');return}
 stopScan();const epoch=scanEpoch;
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
 }catch(e){scanMessage('カメラ起動に失敗：'+(e.name||e.message))}
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
function settings(){return `${topNav('テスト設定')}<section class="panel"><h2>テストプレイヤー</h2><div class="row"><select id="profileSel"><option ${state.profile==='A'?'selected':''}>A</option><option ${state.profile==='B'?'selected':''}>B</option><option ${state.profile==='C'?'selected':''}>C</option></select><span class="sub">3人の独立したテストユーザー</span></div><p class="sub">共通バーコード台帳はこのブラウザ内の全テストユーザーで共通。別端末との共有はまだできません。</p></section><section class="panel"><h2>管理者テスト機能（本番に設置しない）</h2><p class="sub">テスト用の番号入力です。一般プレイではカメラのみとします。</p><div class="row"><input id="testCode" inputmode="numeric" maxlength="13" placeholder="JAN-13 / JAN-8 / UPC-A" class="grow"><button data-action="test-code">コードをテスト</button></div><p id="testCodeError" class="warn" role="alert" hidden></p><p class="sub">本番ルールでは同一バーコードは初回のみ。別コードで同じピックが出ると自動強化されます。</p><div class="button-row"><button class="secondary" data-action="simulate">有効なテストコードを自動生成してスキャン</button><button class="secondary" data-action="toggle-audio">効果音 ${audio?'ON':'OFF'}</button></div><p class="callout">この機能は画面とロジックの検証用です。実際の商品の存在を確認するものではありません。</p></section><section class="panel"><h2>初期化（テスト専用）</h2><div class="button-row"><button class="danger" data-action="reset-player">現在のプレイヤーを初期化</button><button class="danger" data-action="reset-demo">共通テスト台帳を含めて初期化</button></div></section>`}
function checksum(prefix){let digits=String(prefix).split('').map(Number),s=0;for(let i=digits.length-1,w=3;i>=0;i--,w=w===3?1:3)s+=digits[i]*w;return String((10-s%10)%10)}
function render(){
 if(!DB?.records||!CORE){app.innerHTML='<div class="panel warn">マスターまたは戦闘計算を読み込めません。</div>';return}
 if(!Array.isArray(p().starterIds)||p().starterIds.length!==3){app.innerHTML=starter();return}
 const pages={home,pending,owned:ownedPage,dex,history,scan:scanPage,settings,battle:battlePage,choose:chooseScreen,encounter,result:resultPage,detail:()=>detail(detailId),historyDetail:()=>historyDetail(historyCode)};
 app.innerHTML=(pages[view]||home)()
}
function onAction(e){
 const button=e.target.closest('[data-action]');if(!button)return;const act=button.dataset.action,id=button.dataset.id,code=button.dataset.code;
 switch(act){
 case 'home':nav('home');break;case 'pending':nav('pending');break;case 'owned':nav('owned');break;case 'dex':nav('dex');break;case 'history':nav('history');break;case 'scan':nav('scan');break;case 'settings':nav('settings');break;
 case 'camera':startScan();break;case 'stopcamera':stopScan();scanMessage('カメラ停止中です。');break;
 case 'starter-set':chooseStarterSet(id);break;
 case 'choose':choose(code);break;case 'retry':if(code&&p().reads[code]?.status==='pending')choose(code);else nav('pending');break;
 case 'start-battle':startBattle(code,id);break;
 case 'battle':if(p().battle){battleError='';stopScan();view='battle';render()}else nav('home');break;
 case 'detail':detailId=id;view='detail';render();break;
 case 'history-detail':historyCode=code;view='historyDetail';render();break;
 case 'turn':battleError='';battleTurn();break;
 case 'auto':if(autoTimer){clearTimeout(autoTimer);autoTimer=null;render()}else{autoTimer=setTimeout(autoTick,120);render()}break;
 case 'speed':autoSpeed=autoSpeed%5+1;render();break;
 case 'forfeit':if(autoTimer){clearTimeout(autoTimer);autoTimer=null}forfeit();break;
 case 'test-code':registerBarcode($('testCode')?.value||'');break;
 case 'simulate':{let val='490'+String(Math.floor(Math.random()*1e9)).padStart(9,'0');val+=checksum(val);registerBarcode(val);break}
 case 'toggle-audio':audio=!audio;putJSON(AUDIO_KEY,audio);render();break;
 case 'reset-player':if(confirm('テストプレイヤー'+state.profile+'のデータを初期化しますか？')){state.profiles[state.profile]=newPlayer();save();nav('home')}break;
 case 'reset-demo':if(confirm('全プレイヤーと共通テスト台帳をすべて初期化しますか？')){state={profile:'A',profiles:{A:newPlayer(),B:newPlayer(),C:newPlayer()}};registry={};save();nav('home')}break;
 case 'toggle-filter':filterOpen=!filterOpen;render();break;
 case 'clear-filters':filterSet={series:'all',grade:'all',type:'all',status:'all'};dexLimit=70;render();break;
 case 'card-size':if(['small','medium','large'].includes(id)){cardSize=id;render()}break;
 case 'more-dex':dexLimit+=120;render();break;
 }
}
function autoTick(){if(!autoTimer||!p().battle||view!=='battle'){autoTimer=null;return}battleTurn();if(p().battle&&view==='battle'){autoTimer=setTimeout(autoTick,Math.round(1400/autoSpeed))}else autoTimer=null}
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
 if(e.target.id==='profileSel'){if(p().battle)alert('戦闘途中のプレイヤーでも切替できますが、元に戻して再開してください。');state.profile=e.target.value;save();nav('home')}
});
$('homeTop').addEventListener('click',()=>nav('home'));
window.addEventListener('popstate',event=>{stopScan();if(autoTimer){clearTimeout(autoTimer);autoTimer=null}view=event.state?.frendaBarcode&&['home','pending','owned','dex','history','settings','scan'].includes(event.state.view)?event.state.view:'home';filter='';filterOpen=false;render()});
window.addEventListener('pagehide',stopScan);
window.addEventListener('offline',()=>{if(autoTimer){clearTimeout(autoTimer);autoTimer=null}if(view==='battle'){battleError='通信が切断されました。戦闘は保存済みです。';render()}});
window.addEventListener('online',()=>{if(view==='battle'){battleError='通信が回復しました。途中から再開できます。';render()}});
window.FRENDA_BARCODE_TEST=Object.freeze({version:VERSION,normalize,group,drawPick,registerBarcode,usedLeft,publicSnapshot:()=>({state:JSON.parse(JSON.stringify(state)),registry:JSON.parse(JSON.stringify(registry))})});
render();
})();
/* Updated: 2026-11-15 08:45 JST / Ver05 */
