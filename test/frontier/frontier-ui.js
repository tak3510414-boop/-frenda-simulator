/* Frenda Frontier Ver0.05 / image-style single-screen UI */
(()=>{"use strict";
const F=window.FRENDA_FRONTIER,$=id=>document.getElementById(id),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let currentView="home", homeMode="town", talkIndex=0, storeBusy=false;
const image=r=>r?.official_image||"";
const rec=id=>F.pickRecord(id);
const talkLines=[
  'この先の森には、めずらしい素材があるらしいよ。',
  '店の商品が増えてくると、お客さんも少しずつ増えるみたい。',
  '相棒ポケモンと一緒なら、はじめての冒険でも心強いね。'
];
function toast(t){const e=$("toast");if(!e)return;e.textContent=t;e.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("on"),1700)}
function ensureModal(){let m=document.getElementById("frontierModal");if(m)return m;m=document.createElement("div");m.id="frontierModal";m.className="modal hidden";m.innerHTML='<div class="modalPanel"><div id="frontierModalBody"></div><div class="modalActions" id="frontierModalActions"></div></div>';document.body.appendChild(m);m.addEventListener("click",e=>{if(e.target===m)closeModal()});return m}
function modal(html,actions=[]){ensureModal();const m=$("frontierModal");$("frontierModalBody").innerHTML=html;const a=$("frontierModalActions");a.innerHTML="";actions.forEach(x=>{const b=document.createElement("button");b.className=x.className||"cmdBtn";b.textContent=x.label;b.onclick=()=>{if(x.close!==false)closeModal();x.fn?.()};a.appendChild(b)});m.classList.remove("hidden")}
function closeModal(){const m=$("frontierModal");if(m)m.classList.add("hidden")}
function setView(v){currentView=v;document.querySelectorAll("#mainNav button").forEach(b=>b.classList.toggle("on",b.dataset.view===v));renderAll()}
function human(color='blue',label=''){return `<div class="pxHuman ${color}"><span class="sh"></span><span class="hat"></span><span class="hd"></span><span class="face"></span><span class="arm l"></span><span class="arm r"></span><span class="bd"></span><span class="lg"></span></div>${label?`<div class="tag" style="position:absolute;left:-8px;top:-14px;">${esc(label)}</div>`:''}`}
function header(s){const st=F.stageInfo(s.development.stage);$("headStats").innerHTML=`<span class="pill">🪙 ${Number(s.coins||0).toLocaleString('ja-JP')}</span><span class="pill">📅 ${s.day}日目</span><span class="pill">🏘️ ${esc(st.name)}</span>`;const title={home:'拠点',adventure:'冒険',store:'お店'};const sub={home:homeMode==='house'?'家の中':'町の全体イメージ',adventure:F.run?.active?'ダンジョン探索中':'はじまりの森',store:'店の中（販売中）'};$("viewTitle").textContent=title[currentView]||'Frenda Frontier';$("viewSubtitle").textContent=sub[currentView]||'';$("viewMeta").textContent=`現在地：${esc(st.caption)}`}
function homeDialog(s){if(homeMode==='house'){const p=rec(s.partnerId);return p?`相棒ポケモン
「${p.name_ja}と いっしょに がんばろう！」`:'まずは相棒を決めよう。'}
 if(talkIndex>0)return `町の人
「${talkLines[(talkIndex-1)%talkLines.length]}」`;
 return F.goal(s).text.replace(/！/g,'！\n');
}
function homeCommands(s){if(homeMode==='house'){return [
  {t:'町へ', fn:()=>{homeMode='town';renderAll()}},
  {t:'相棒', fn:showPartnerModal, c:'primary'},
  {t:'倉庫', fn:showWarehouse},
  {t:'物語', fn:showStory},
  {t:'冒険', fn:()=>setView('adventure')}
 ]}
 return [
   {t:'話す', fn:()=>{talkIndex=(talkIndex+1)%4;renderAll()}},
   {t:'家へ', fn:()=>{homeMode='house';renderAll()}},
   {t:'相棒', fn:showPartnerModal, c:'primary'},
   {t:'冒険', fn:()=>setView('adventure'), c:'primary'},
   {t:'お店', fn:()=>setView('store')},
   {t:'物語', fn:showStory}
 ]
}
function homeScene(s){const st=F.stageInfo(s.development.stage), p=rec(s.partnerId);
 if(homeMode==='house') return `
 <div class="houseScene gameScene">
  <div class="sceneHud"><div class="miniTags"><span class="tag">家の中</span>${p?`<span class="tag">相棒：${esc(p.name_ja)}</span>`:''}</div></div>
  <div class="wallPanel"></div>
  <div class="bedBig"></div>
  <div class="bookShelf" style="left:61%;top:16%;width:17%;height:16%;"></div>
  <div class="bookShelf" style="left:11%;bottom:13%;width:14%;height:10%;"></div>
  <div class="rugRect" style="left:34%;top:26%;width:32%;height:30%;"></div>
  <div class="tableSmall" style="left:43%;top:43%;width:10%;height:10%;"></div>
  <div class="kitchen"></div>
  <div class="stove"></div>
  <div style="position:absolute;left:41%;top:52%;">${human('blue')}</div>
  ${p?`<div class="partnerSprite" style="left:51%;top:40%;"><img src="${esc(image(p))}" alt=""></div>`:''}
  <div class="dialogBox"><h3>家の中</h3><p>${esc(homeDialog(s))}</p></div>
  <div class="commandBox"><div class="commandTitle">▶ コマンド</div><div class="cmdList" id="cmdHome"></div></div>
 </div>`;
 return `
 <div class="townScene gameScene">
  <div class="sceneHud"><div class="miniTags"><span class="tag">${esc(st.name)}</span><span class="tag">発展 ${s.development.points}pt</span>${p?`<span class="tag">相棒：${esc(p.name_ja)}</span>`:''}</div></div>
  <div class="tree" style="left:7%;top:15%;"></div>
  <div class="tree" style="left:83%;top:17%;"></div>
  <div class="tree" style="left:8%;top:72%;"></div>
  <div class="tree" style="left:84%;top:72%;"></div>
  <div class="flower" style="left:30%;top:26%;"></div><div class="flower" style="left:73%;top:27%;"></div>
  <div class="townRoadV"></div><div class="townRoadH"></div>
  <div class="shopExt" style="left:7%;top:22%;width:23%;height:22%;"><div class="roofRed"></div><div class="sign" style="left:10%;top:56%;">SHOP</div><div class="door" style="left:39%;bottom:4%;width:22%;height:32%;"></div><div class="win" style="left:8%;top:22%;width:18%;height:18%;"></div><div class="win" style="right:8%;top:22%;width:18%;height:18%;"></div></div>
  <div class="houseExt" style="left:57%;top:21%;width:21%;height:23%;"><div class="roofBlue"></div><div class="sign" style="left:33%;top:52%;">家</div><div class="door" style="left:37%;bottom:4%;width:24%;height:34%;"></div><div class="win" style="left:12%;top:24%;width:16%;height:16%;"></div><div class="win" style="right:12%;top:24%;width:16%;height:16%;"></div></div>
  <div class="smithExt" style="left:9%;top:66%;width:17%;height:16%;"><div class="roofBrown"></div><div class="sign" style="left:10%;top:54%;">鍛冶屋</div></div>
  <div class="whExt" style="left:68%;top:66%;width:17%;height:16%;"><div class="roofGold"></div><div class="sign" style="left:17%;top:54%;">倉庫</div></div>
  <div class="fountain"></div>
  <div style="position:absolute;left:19%;top:58%;">${human('blue')}</div>
  <div style="position:absolute;left:31%;top:51%;">${human('orange')}</div>
  <div style="position:absolute;left:58%;top:58%;">${human('purple')}</div>
  <div style="position:absolute;left:80%;top:75%;">${human('green')}</div>
  <div style="position:absolute;left:42%;top:60%;">${human('blue')}</div>
  ${p?`<div class="partnerSprite" style="left:47%;top:60%;"><img src="${esc(image(p))}" alt=""></div>`:''}
  <div class="dialogBox"><h3>町の人との会話</h3><p>${esc(homeDialog(s))}</p></div>
  <div class="commandBox"><div class="commandTitle">▶ コマンド</div><div class="cmdList" id="cmdHome"></div></div>
 </div>`;
}
function showPartnerModal(){const s=F.readSave();const list=F.eligiblePartners();let html=`<h2>🤝 相棒を選ぶ</h2><p>${F.usingTrialPartners?.()?'TEST環境なので体験用相棒を表示しています。':'序盤は★3以下のピックが対象です。'}</p><div class="partnerGrid">`;list.slice(0,60).forEach(r=>{html+=`<button class="partnerCard ${String(r.master_id)===String(s.partnerId)?'on':''}" data-pid="${esc(r.master_id)}">${image(r)?`<img src="${esc(image(r))}" alt="">`:'<div>?</div>'}<span><b>${esc(r.name_ja)}</b><small>${esc(r.pick_no||r.master_id)}</small><div><span class="badge">★${r.grade||'?'}</span><span class="badge">${esc(r.type1||'')}</span>${F.usingTrialPartners?.()?'<span class="badge">体験用</span>':''}</div></span></button>`});html+='</div>';modal(html,[{label:'閉じる'}]);document.querySelectorAll('[data-pid]').forEach(b=>b.onclick=()=>{try{F.selectPartner(b.dataset.pid);closeModal();toast('相棒を選びました');renderAll()}catch(e){toast(e.message)}})}
function showWarehouse(){const s=F.readSave();const e=Object.entries(s.warehouse).filter(([,n])=>Number(n)>0);let html='<h2>📦 倉庫</h2>';if(!e.length)html+='<p>まだ何もありません。冒険で持ち帰りましょう。</p>';else html+='<div class="choiceGrid">'+e.map(([id,n])=>{const it=F.item(id);return `<div class="choiceCard"><div style="width:52px;height:72px;display:grid;place-items:center;font-size:32px;background:#f2f6f3;border-radius:7px">${it.icon}</div><span><b>${esc(it.name)}</b><small>${esc(it.kind)} / 相場 ${it.base}G</small><div class="badge">×${n}</div></span></div>`}).join('')+'</div>';modal(html,[{label:'閉じる'}])}
function showStory(){const s=F.readSave(),step=F.storyStep(s);let html='<h2>📖 物語</h2><div class="choiceGrid">';F.STORY.forEach(x=>{html+=`<div class="choiceCard" style="grid-template-columns:1fr"><span><b>${x.at<=step?'✅':'🔒'} ${esc(x.title)}</b><small>${esc(x.text)}</small></span></div>`});html+='</div>';modal(html,[{label:'閉じる'}])}
function stockChooser(slot){const s=F.readSave();const e=Object.entries(s.warehouse).filter(([id,n])=>Number(n)>0&&F.item(id));if(!e.length){toast('倉庫に商品がありません');return}let html=`<h2>棚${slot+1}に並べる</h2><div class="choiceGrid">`;e.forEach(([id,n])=>{const it=F.item(id);html+=`<button class="choiceCard" data-stock-item="${esc(id)}"><div style="width:52px;height:72px;display:grid;place-items:center;font-size:32px;background:#f2f6f3;border-radius:7px">${it.icon}</div><span><b>${esc(it.name)}</b><small>相場 ${it.base}G / 倉庫×${n}</small></span></button>`});html+='</div>';modal(html,[{label:'閉じる'}]);document.querySelectorAll('[data-stock-item]').forEach(b=>b.onclick=()=>{const id=b.dataset.stockItem,it=F.item(id);closeModal();modal(`<h2>${it.icon} ${esc(it.name)}</h2><p>相場：<b>${it.base}G</b></p><label>販売価格 <input id="stockPrice" type="number" value="${it.base}" min="10" max="${it.base*3}" style="width:110px;padding:6px;border:1px solid #cbd9ce;border-radius:8px;text-align:right"> G</label>`,[{label:'棚に並べる',className:'cmdBtn primary',fn:()=>{try{F.stockShelf(slot,id,$('stockPrice')?.value||it.base);toast('商品を並べました');renderAll()}catch(e){toast(e.message)}}},{label:'戻る'}])})}
function chooseShelfForPrice(){const s=F.readSave();const list=s.shelves.map((sh,i)=>sh?{...sh,slot:i}:null).filter(Boolean);if(!list.length){toast('棚に商品がありません');return}let html='<h2>値段を変える</h2><div class="choiceGrid">';list.forEach(sh=>{const it=F.item(sh.itemId);html+=`<button class="choiceCard" data-price-slot="${sh.slot}"><div style="width:52px;height:72px;display:grid;place-items:center;font-size:32px;background:#f2f6f3;border-radius:7px">${it.icon}</div><span><b>${esc(it.name)}</b><small>現在 ${sh.price}G / 相場 ${it.base}G</small></span></button>`});html+='</div>';modal(html,[{label:'閉じる'}]);document.querySelectorAll('[data-price-slot]').forEach(b=>b.onclick=()=>{const slot=Number(b.dataset.priceSlot);const sh=F.readSave().shelves[slot],it=F.item(sh.itemId);closeModal();modal(`<h2>${esc(it.name)}の値段</h2><p>相場：${it.base}G</p><label>販売価格 <input id="editPrice" type="number" value="${sh.price}" min="10" max="${it.base*3}" style="width:110px;padding:6px;border:1px solid #cbd9ce;border-radius:8px;text-align:right"> G</label>`,[{label:'変更する',className:'cmdBtn primary',fn:()=>{F.changePrice(slot,$('editPrice').value);toast('値段を変更しました');renderAll()}},{label:'棚から戻す',fn:()=>{F.unstockShelf(slot);toast('倉庫へ戻しました');renderAll()}},{label:'閉じる'}])})}
async function runStore(){if(storeBusy)return;const s=F.readSave();if(!s.shelves.some(Boolean)){toast('棚に商品がありません');return}storeBusy=true;let lines=['お店を開きました。'];for(let n=0;n<4;n++){const r=F.simulateCustomer();if(r.bought){F.applySale(r);lines=[`✅ ${r.customer.name}が ${r.choice.item.name} を${r.choice.price}Gで買いました。`,`${r.customer.name}「${r.customer.line}」`]} else {lines=[`…${r.customer.name}は「${r.reason}」で帰りました。`,`${r.customer.name}「また見にくるよ。」`]}const log=$('storeDialogText');if(log)log.textContent=lines.join('\n');await new Promise(res=>setTimeout(res,520));renderAll()}F.mutateSave(x=>x.day++);storeBusy=false;renderAll();toast('今日の営業を終えました')}
function storeScene(s){const shelves=s.shelves;const items=s.shelves.filter(Boolean).map(sh=>F.item(sh.itemId)?.name||'');const msg=items.length?`店員\n「いらっしゃいませ！ ${items[0]} などをご用意しています。」`:'店員\n「まずは倉庫から商品を並べてみましょう。」';return `
 <div class="storeScene gameScene">
  <div class="sceneHud"><div class="miniTags"><span class="tag">棚 ${s.shelves.filter(Boolean).length}/3</span><span class="tag">売上 ${Number(s.sales.revenue||0)}G</span><span class="tag">来店 ${s.sales.customers}人</span></div></div>
  <div class="shelfWall" style="left:11%;top:12%;width:18%;height:24%;"><div class="goods">${Array.from({length:8},(_,i)=>`<span class="good" style="opacity:${shelves[0]?1:.2}"></span>`).join('')}</div></div>
  <div class="shelfWall" style="left:40%;top:12%;width:18%;height:24%;"><div class="goods">${Array.from({length:8},(_,i)=>`<span class="good" style="opacity:${shelves[1]?1:.2}"></span>`).join('')}</div></div>
  <div class="shelfWall" style="left:69%;top:12%;width:18%;height:24%;"><div class="goods">${Array.from({length:8},(_,i)=>`<span class="good" style="opacity:${shelves[2]?1:.2}"></span>`).join('')}</div></div>
  <div class="crate" style="left:10%;top:43%;width:12%;height:14%;"></div>
  <div class="crate" style="left:24%;top:43%;width:12%;height:14%;"></div>
  <div class="counter"></div>
  <div class="cashierBox" style="left:48%;top:31%;width:7%;height:7%;"></div>
  <div class="plant" style="left:89%;top:33%;"></div>
  <div style="position:absolute;left:47%;top:28%;">${human('orange')}</div>
  <div style="position:absolute;left:73%;top:48%;">${human('purple')}</div>
  <div style="position:absolute;left:18%;top:55%;">${human('blue')}</div>
  <div class="dialogBox"><h3>店の中（販売中）</h3><p id="storeDialogText">${esc(msg)}</p></div>
  <div class="commandBox"><div class="commandTitle">▶ コマンド</div><div class="cmdList" id="cmdStore"></div></div>
 </div>`}
function boardTile(run,x,y){const t=run.map[y][x];let inner='';if(t==='gather')inner+='<span class="leaf"></span>';if(t==='stairs')inner+='<span class="stairsIcon"></span>';const e=run.enemies.find(q=>q.hp>0&&q.x===x&&q.y===y);if(e){const er=rec(e.recordId);inner+=`<div class="enemySprite" style="left:50%;top:50%;transform:translate(-50%,-50%);">${image(er)?`<img src="${esc(image(er))}" alt="">`:''}<span class="enemyLabel">${esc(e.name)} HP${e.hp}</span></div>`}if(run.partnerHp>0&&run.partner.x===x&&run.partner.y===y){const p=rec(F.readSave().partnerId);inner+=`<div class="partnerSprite" style="left:50%;top:50%;transform:translate(-50%,-50%);">${image(p)?`<img src="${esc(image(p))}" alt="">`:''}</div>`}if(run.player.x===x&&run.player.y===y){inner+=`<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);">${human('blue')}</div>`}return `<div class="tile ${t}" data-x="${x}" data-y="${y}">${inner}</div>`}
function runResultModal(){const r=F.run?.result;if(!r)return;const items=Object.entries(r.delivered||{}).map(([id,n])=>`${F.item(id)?.name||id}×${n}`).join('、')||'なし';modal(`<h2>${r.success?'🏠 無事帰還！':'😵 冒険失敗'}</h2><p>持ち帰ったもの：<b>${esc(items)}</b></p>${Object.keys(r.lost||{}).length?'<p>倒れたため、一部を失いました。</p>':''}`,[{label:'拠点へ',fn:()=>{setView('home')}},{label:'お店へ',fn:()=>{setView('store')}}])}
function stairsChoice(){const run=F.run;if(!run?.active)return;const last=run.floor>=run.maxFloor;modal(`<h2>🪜 階段</h2><p>${last?'最深部に向かいますか？':'次の階へ進むか、帰還するか選んでください。'}</p>`,[{label:'帰還する',fn:()=>{F.finishRun(true,'return');renderAll();runResultModal()}},{label:last?'最深部へ':'次の階へ',className:'cmdBtn primary',fn:()=>{F.nextFloor();renderAll();if(!F.run?.active)runResultModal()}},{label:'閉じる'}])}
function showBag(){const run=F.run;if(!run?.active)return;const e=Object.entries(run.bag||{});let html='<h2>🎒 持ち物</h2>';if(!e.length)html+='<p>まだ何も持っていません。</p>';else html+='<div class="choiceGrid">'+e.map(([id,n])=>{const it=F.item(id);return `<div class="choiceCard"><div style="width:52px;height:72px;display:grid;place-items:center;font-size:32px;background:#f2f6f3;border-radius:7px">${it.icon}</div><span><b>${esc(it.name)}</b><small>${esc(it.kind)}</small><div class="badge">×${n}</div></span></div>`}).join('')+'</div>';modal(html,[{label:'閉じる'}])}
function move(dx,dy){F.move(dx,dy);renderAll();if(F.run && !F.run.active)runResultModal()}
function advScene(s){const run=F.run; if(!run?.active){return `
 <div class="advScene gameScene">
   <div class="forestBg"></div>
   <div class="hudStrip"><span class="hudPill">B1F</span><span class="hudPill">❤️ 30/30</span><span class="hudPill">🐾 ${s.partnerId?(24+Math.max(0,Number(rec(s.partnerId)?.grade)||1)*3):0}/${s.partnerId?(24+Math.max(0,Number(rec(s.partnerId)?.grade)||1)*3):0}</span><span class="hudPill">Lv 1</span><span class="hudPill">🍙 32</span><span class="hudPill">🎒 0/10</span></div>
   <div class="boardWrap" style="display:grid;place-items:center;background:linear-gradient(135deg,#4a7a44,#2f532c);">
      <div class="tapHint">森の入口</div>
      <div class="tree" style="left:8%;top:12%;position:absolute;"></div>
      <div class="tree" style="left:76%;top:12%;position:absolute;"></div>
      <div class="tree" style="left:80%;top:62%;position:absolute;"></div>
      <div class="tree" style="left:18%;top:70%;position:absolute;"></div>
      <div style="position:absolute;left:40%;top:46%;">${human('blue')}</div>
      ${s.partnerId?`<div class="partnerSprite" style="left:48%;top:46%;"><img src="${esc(image(rec(s.partnerId)))}" alt=""></div>`:''}
      <div class="enemySprite" style="left:67%;top:42%;"><img src="${esc(image(rec(F.DUNGEON_ENEMIES[0].recordId)))}" alt=""><span class="enemyLabel">！</span></div>
      <div class="stairsIcon" style="position:absolute;left:74%;top:72%;"></div>
   </div>
   <div class="dialogBox"><h3>ダンジョン（フィールド）</h3><p>森を探索し、素材を集めて帰ろう。\n出発すると、相棒が敵と自動で戦います。</p></div>
   <div class="commandBox"><div class="commandTitle">▶ コマンド</div><div class="cmdList" id="cmdAdv"></div></div>
 </div>` }
 return `
 <div class="advScene gameScene">
   <div class="hudStrip"><span class="hudPill">B${run.floor}F</span><span class="hudPill">❤️ ${run.playerHp}/${run.playerMaxHp}</span><span class="hudPill">🐾 ${run.partnerHp}/${run.partnerMaxHp}</span><span class="hudPill">Lv ${run.partnerLv}</span><span class="hudPill">🍙 ${run.food}</span><span class="hudPill">🎒 ${F.bagSlots(run.bag)}/${run.bagLimit}</span></div>
   <div class="boardWrap"><div class="tapHint">となりのマスをタップで移動</div><div class="board">${Array.from({length:F.H},(_,y)=>Array.from({length:F.W},(_,x)=>boardTile(run,x,y)).join('')).join('')}</div></div>
   <div class="dialogBox"><h3>ダンジョン（メニュー）</h3><p>${esc((run.log.slice(-2).join('\n')||'相棒と一緒に進もう。'))}</p></div>
   <div class="commandBox"><div class="commandTitle">▶ コマンド</div><div class="cmdList" id="cmdAdv"></div><div class="dirPad"><button class="up" data-move="0,-1">▲</button><button data-move="-1,0">◀</button><button data-move="0,1">▼</button><button data-move="1,0">▶</button></div></div>
 </div>`}
function renderHome(s){$('sceneMount').innerHTML=homeScene(s);const box=$('cmdHome');homeCommands(s).forEach(c=>{const b=document.createElement('button');b.className='cmdBtn '+(c.c||'');b.textContent=c.t;b.onclick=c.fn;box.appendChild(b)})}
function renderStore(s){$('sceneMount').innerHTML=storeScene(s);const box=$('cmdStore');[
 {t:'棚1',fn:()=>stockChooser(0)},{t:'棚2',fn:()=>stockChooser(1)},{t:'棚3',fn:()=>stockChooser(2)},{t:'ねだん',fn:chooseShelfForPrice},{t:'営業',fn:runStore,c:'primary'},{t:'倉庫',fn:showWarehouse}
].forEach(c=>{const b=document.createElement('button');b.className='cmdBtn '+(c.c||'');b.textContent=c.t;b.disabled=(c.t==='営業'&&!s.shelves.some(Boolean))||storeBusy;b.onclick=c.fn;box.appendChild(b)})}
function renderAdventure(s){$('sceneMount').innerHTML=advScene(s);const box=$('cmdAdv'); if(!F.run?.active){[
  {t:'出発',fn:()=>{try{F.startRun();renderAll()}catch(e){toast(e.message)}},c:'primary'},
  {t:'相棒',fn:showPartnerModal},{t:'持ち物',fn:showWarehouse},{t:'拠点',fn:()=>setView('home')}
 ].forEach(c=>{const b=document.createElement('button');b.className='cmdBtn '+(c.c||'');b.textContent=c.t;b.onclick=c.fn;box.appendChild(b)});return}
 [
  {t:'どうぐ',fn:showBag},{t:'つよさ',fn:()=>toast(`相棒Lv${F.run.partnerLv}`)},{t:'階段',fn:stairsChoice,c:F.isOnStairs()?'primary':''},{t:'ロープ',fn:()=>{if(F.escape()){renderAll();runResultModal()}},c:'warn'},{t:'拠点',fn:()=>setView('home')}
 ].forEach(c=>{const b=document.createElement('button');b.className='cmdBtn '+(c.c||'');b.textContent=c.t;b.disabled=(c.t==='階段'&&!F.isOnStairs())||(c.t==='ロープ'&&F.run.escape<=0);b.onclick=c.fn;box.appendChild(b)});
 $('sceneMount').querySelectorAll('.tile').forEach(d=>d.onclick=()=>{const x=Number(d.dataset.x),y=Number(d.dataset.y),dx=x-F.run.player.x,dy=y-F.run.player.y;if(Math.abs(dx)+Math.abs(dy)!==1){toast('となりのマスをタップしてください');return}move(dx,dy)});
 $('sceneMount').querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>{const [dx,dy]=b.dataset.move.split(',').map(Number);move(dx,dy)})
}
function renderAll(){const s=F.readSave();s.development.stage=F.developmentStage(s.development.points);F.writeSave(s);header(s);if(currentView==='home')renderHome(s);if(currentView==='store')renderStore(s);if(currentView==='adventure')renderAdventure(s)}
function bind(){document.querySelectorAll('#mainNav button').forEach(b=>b.onclick=()=>setView(b.dataset.view));window.addEventListener('keydown',e=>{if(!F.run?.active)return;const m={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[e.key];if(m){e.preventDefault();move(...m)}})}
function init(){if(!window.FRENDA_MASTER?.records||!window.FRENDA_DATA) throw new Error('Frontier共通データを読み込めませんでした。');const host=$('frontierUserHost'), badge=document.getElementById('frendaActiveUserBadge');if(host&&badge)host.appendChild(badge);bind();renderAll();if(window.FRENDA_USER?.mode==='cloud')$('sceneMount').insertAdjacentHTML('beforeend','<div class="tag" style="position:absolute;left:12px;top:12px;z-index:12;">☁️ Frontier専用クラウド列は後続版で正式実装予定</div>')}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>{try{init()}catch(e){console.error(e);document.body.insertAdjacentHTML('beforeend',`<div class="modal"><div class="modalPanel"><h2>起動エラー</h2><p>${esc(e.message)}</p></div></div>`)}}); else init();
})();
