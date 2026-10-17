/* Frenda Frontier Ver0.07 / art-backed single-screen UI */
(()=>{"use strict";
const F=window.FRENDA_FRONTIER,$=id=>document.getElementById(id),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let currentView="home", homeMode="town", talkIndex=0, storeBusy=false;
const image=r=>r?.official_image||"";
const rec=id=>F.pickRecord(id);
const talkLines=[
  'この先の森には、めずらしい素材があるらしいよ。',
  '店の商品が増えると、旅人も少しずつ集まってくるんだ。',
  '鍛冶屋がにぎわうと、もっと奥の森の噂も聞けるかもね。'
];
function toast(t){const e=$("toast");if(!e)return;e.textContent=t;e.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("on"),1700)}
function ensureModal(){let m=document.getElementById("frontierModal");if(m)return m;m=document.createElement("div");m.id="frontierModal";m.className="modal hidden";m.innerHTML='<div class="modalPanel"><div id="frontierModalBody"></div><div class="modalActions" id="frontierModalActions"></div></div>';document.body.appendChild(m);m.addEventListener("click",e=>{if(e.target===m)closeModal()});return m}
function modal(html,actions=[]){ensureModal();const m=$("frontierModal"), body=$("frontierModalBody"), a=$("frontierModalActions");body.innerHTML=html;a.innerHTML="";actions.forEach(x=>{const b=document.createElement("button");b.className=x.className||"cmdBtn";b.textContent=x.label;b.onclick=()=>{if(x.close!==false)closeModal();x.fn?.()};a.appendChild(b)});m.classList.remove("hidden")}
function closeModal(){const m=$("frontierModal");if(m)m.classList.add("hidden")}
function setView(v){currentView=v;document.querySelectorAll("#mainNav button").forEach(b=>b.classList.toggle("on",b.dataset.view===v));renderAll()}

function human(color='blue', size='adult'){
  const pal={
    blue:{cap:'#467fd1',cap2:'#2d5fa8',body:'#4b86d8',line:'#305488'},
    green:{cap:'#66a85d',cap2:'#44763d',body:'#76ba6b',line:'#4b7c45'},
    purple:{cap:'#8c69c0',cap2:'#634988',body:'#9b79cb',line:'#694f8f'},
    orange:{cap:'#d08447',cap2:'#935629',body:'#d89357',line:'#915e35'}
  }[color]||{cap:'#467fd1',cap2:'#2d5fa8',body:'#4b86d8',line:'#305488'};
  return `<div class="humanWrap ${size==='kid'?'kid':''}"><svg viewBox="0 0 56 70" aria-hidden="true">
    <ellipse cx="28" cy="63" rx="13" ry="4.8" fill="#000" opacity=".16"/>
    <rect x="14" y="33" width="28" height="18" rx="5" fill="${pal.body}" stroke="${pal.line}" stroke-width="2.4"/>
    <rect x="14" y="47" width="28" height="4" fill="#e9edf5" opacity=".8"/>
    <rect x="10" y="35" width="7" height="14" rx="3" fill="#efccab" stroke="#9a6948" stroke-width="1.5"/>
    <rect x="39" y="35" width="7" height="14" rx="3" fill="#efccab" stroke="#9a6948" stroke-width="1.5"/>
    <rect x="18" y="50" width="8" height="12" rx="2" fill="#5565b5"/>
    <rect x="30" y="50" width="8" height="12" rx="2" fill="#5565b5"/>
    <rect x="17" y="60" width="10" height="4" rx="2" fill="#665140"/>
    <rect x="29" y="60" width="10" height="4" rx="2" fill="#665140"/>
    <rect x="17" y="8" width="22" height="7" rx="4" fill="${pal.cap2}"/>
    <path d="M15 13 Q28 0 41 13 L41 17 L15 17 Z" fill="${pal.cap}" stroke="${pal.cap2}" stroke-width="1.8"/>
    <rect x="13" y="16" width="30" height="4.5" rx="2.2" fill="${pal.cap2}"/>
    <rect x="19" y="17" width="18" height="4" rx="2" fill="#664533"/>
    <rect x="17" y="20" width="22" height="17" rx="8" fill="#efccab" stroke="#9a6948" stroke-width="1.8"/>
    <circle cx="24" cy="28" r="1.5" fill="#443028"/>
    <circle cx="32" cy="28" r="1.5" fill="#443028"/>
    <path d="M22 33 Q28 36 34 33" fill="none" stroke="#9a6948" stroke-width="1.8" stroke-linecap="round"/>
  </svg></div>`;
}
function svgWrap(viewBox, inner){return `<svg class="sceneArt" viewBox="${viewBox}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`}
function townArt(){return svgWrap('0 0 960 640',`
<defs>
 <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#88c8ef"/><stop offset="1" stop-color="#bfe3f4"/></linearGradient>
 <linearGradient id="grass" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#90c86c"/><stop offset="1" stop-color="#6ea44d"/></linearGradient>
 <linearGradient id="wall" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#e7dbbc"/><stop offset="1" stop-color="#d1c09b"/></linearGradient>
 <linearGradient id="stone" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#d9cfbc"/><stop offset="1" stop-color="#c5b89b"/></linearGradient>
 <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#000" flood-opacity=".16"/></filter>
</defs>
<rect width="960" height="640" fill="url(#sky)"/>
<rect y="248" width="960" height="392" fill="url(#grass)"/>
<ellipse cx="480" cy="402" rx="188" ry="124" fill="#cbbd9f" opacity=".55"/>
<polygon points="432,214 528,214 528,356 760,470 760,534 200,534 200,470 432,356" fill="#d8c69d" stroke="#c1ae84" stroke-width="6"/>
<path d="M475 214 v320" stroke="#c8b68d" stroke-width="6" opacity=".8"/>
<path d="M240 468 h480" stroke="#c8b68d" stroke-width="6" opacity=".8"/>
<path d="M302 278 l-102 64" stroke="#c8b68d" stroke-width="6" opacity=".8"/>
<path d="M658 278 l102 64" stroke="#c8b68d" stroke-width="6" opacity=".8"/>
<g filter="url(#shadow)">
  <g transform="translate(92 118)">
    <rect x="0" y="40" width="190" height="128" rx="16" fill="url(#wall)" stroke="#7d5637" stroke-width="7"/>
    <polygon points="16,40 96,-16 174,40" fill="#c25b47" stroke="#7d5637" stroke-width="7"/>
    <rect x="18" y="76" width="28" height="40" rx="4" fill="#8c5d3b" stroke="#6b482f" stroke-width="4"/>
    <rect x="140" y="76" width="28" height="40" rx="4" fill="#8c5d3b" stroke="#6b482f" stroke-width="4"/>
    <rect x="69" y="106" width="52" height="52" rx="8" fill="#8f613f" stroke="#6b482f" stroke-width="5"/>
    <rect x="45" y="118" width="104" height="44" rx="12" fill="#f3e9c9" stroke="#8c6b37" stroke-width="4"/>
    <text x="97" y="146" font-size="26" font-weight="900" text-anchor="middle" fill="#2d3c2d">SHOP</text>
    <rect x="0" y="82" width="60" height="18" rx="4" fill="#f7f0df" stroke="#8a6840" stroke-width="3"/>
    <rect x="6" y="84" width="48" height="14" fill="url(#stone)"/>
    <path d="M6 84 h48" stroke="#c7604f" stroke-width="5" stroke-dasharray="8 8"/>
  </g>
  <g transform="translate(575 115)">
    <rect x="0" y="40" width="170" height="128" rx="16" fill="#ddd8c5" stroke="#7d5637" stroke-width="7"/>
    <polygon points="16,40 86,-18 154,40" fill="#4f82c7" stroke="#7d5637" stroke-width="7"/>
    <rect x="16" y="76" width="26" height="38" rx="4" fill="#f3f6fa" stroke="#7a5c40" stroke-width="4"/>
    <rect x="128" y="76" width="26" height="38" rx="4" fill="#f3f6fa" stroke="#7a5c40" stroke-width="4"/>
    <rect x="64" y="108" width="42" height="50" rx="8" fill="#8f613f" stroke="#6b482f" stroke-width="5"/>
    <rect x="55" y="115" width="60" height="35" rx="10" fill="#f4ead0" stroke="#8c6b37" stroke-width="4"/>
    <text x="85" y="138" font-size="26" font-weight="900" text-anchor="middle" fill="#2d3c2d">家</text>
  </g>
  <g transform="translate(120 438)">
    <rect x="0" y="34" width="150" height="76" rx="12" fill="#d7c4a6" stroke="#7d5637" stroke-width="6"/>
    <polygon points="12,34 74,-4 138,34" fill="#9f6d3e" stroke="#7d5637" stroke-width="6"/>
    <rect x="30" y="60" width="92" height="24" rx="8" fill="#f3e9c9" stroke="#8c6b37" stroke-width="4"/>
    <text x="76" y="79" font-size="22" font-weight="900" text-anchor="middle" fill="#2d3c2d">鍛冶屋</text>
  </g>
  <g transform="translate(690 438)">
    <rect x="0" y="34" width="150" height="76" rx="12" fill="#d7c4a6" stroke="#7d5637" stroke-width="6"/>
    <polygon points="12,34 74,-4 138,34" fill="#bb8d4c" stroke="#7d5637" stroke-width="6"/>
    <rect x="36" y="60" width="80" height="24" rx="8" fill="#f3e9c9" stroke="#8c6b37" stroke-width="4"/>
    <text x="76" y="79" font-size="22" font-weight="900" text-anchor="middle" fill="#2d3c2d">倉庫</text>
  </g>
  <g transform="translate(480 444)">
    <circle r="64" fill="#d4c9b2" stroke="#7e8b85" stroke-width="7"/>
    <circle r="40" fill="#7fc8ed" stroke="#4e88a9" stroke-width="7"/>
    <circle r="14" cy="-2" fill="#d6d3bf" stroke="#7e8b85" stroke-width="4"/>
    <path d="M0 -10 v-28" stroke="#7fc8ed" stroke-width="8" stroke-linecap="round"/>
    <path d="M-12 -22 q12 -18 24 0" fill="none" stroke="#bfefff" stroke-width="5" stroke-linecap="round"/>
  </g>
</g>
<g opacity=".9">
 <g transform="translate(72 265)"><circle r="34" fill="#6aa352"/><circle cx="-10" cy="-8" r="15" fill="#8dc06f"/><rect x="-8" y="24" width="16" height="24" rx="5" fill="#7a5a3a"/></g>
 <g transform="translate(862 270)"><circle r="34" fill="#6aa352"/><circle cx="-10" cy="-8" r="15" fill="#8dc06f"/><rect x="-8" y="24" width="16" height="24" rx="5" fill="#7a5a3a"/></g>
 <g transform="translate(183 250)"><circle r="28" fill="#76ad60"/><rect x="-6" y="20" width="12" height="18" rx="4" fill="#7a5a3a"/></g>
 <g transform="translate(713 250)"><circle r="28" fill="#76ad60"/><rect x="-6" y="20" width="12" height="18" rx="4" fill="#7a5a3a"/></g>
</g>
<g>
 <g transform="translate(272 268)"><circle r="8" fill="#f7b5d4"/><circle cx="14" r="8" fill="#ffe286"/><circle cx="28" r="8" fill="#c6a9ff"/><circle cx="9" cy="13" r="8" fill="#96e58c"/><circle cx="24" cy="13" r="8" fill="#ffc88d"/></g>
 <g transform="translate(707 268)"><circle r="8" fill="#f7b5d4"/><circle cx="14" r="8" fill="#ffe286"/><circle cx="28" r="8" fill="#c6a9ff"/><circle cx="9" cy="13" r="8" fill="#96e58c"/><circle cx="24" cy="13" r="8" fill="#ffc88d"/></g>
</g>`)}
function houseArt(){return svgWrap('0 0 960 640',`
<defs>
 <linearGradient id="woodWall" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#d3a068"/><stop offset="1" stop-color="#bf8650"/></linearGradient>
 <pattern id="planks" width="36" height="36" patternUnits="userSpaceOnUse"><rect width="36" height="36" fill="url(#woodWall)"/><path d="M34 0 V36" stroke="#9f6c41" stroke-width="3" opacity=".6"/></pattern>
 <filter id="hShadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity=".18"/></filter>
</defs>
<rect width="960" height="640" fill="url(#planks)"/>
<rect x="20" y="20" width="920" height="600" rx="14" fill="none" stroke="#8b603a" stroke-width="10"/>
<g filter="url(#hShadow)">
 <rect x="90" y="118" width="214" height="230" rx="18" fill="#f3f3f5" stroke="#6a4b32" stroke-width="8"/>
 <rect x="90" y="118" width="214" height="70" rx="12" fill="#7093d2"/>
 <rect x="335" y="192" width="315" height="238" rx="16" fill="#8ea56a" stroke="#d6c27b" stroke-width="9"/>
 <ellipse cx="444" cy="347" rx="48" ry="34" fill="#9b724e" stroke="#6d4a31" stroke-width="7"/>
 <rect x="618" y="162" width="112" height="118" rx="12" fill="#dfe9f7" stroke="#7a5c40" stroke-width="8"/>
 <path d="M674 162 V280 M618 221 H730" stroke="#a29b8c" stroke-width="5"/>
 <rect x="772" y="154" width="82" height="132" rx="10" fill="#7b5538" stroke="#573824" stroke-width="8"/>
 <rect x="792" y="176" width="42" height="88" fill="#88afe0"/>
 <g transform="translate(744 430)">
  <rect x="0" y="0" width="130" height="72" rx="10" fill="#d8d0c0" stroke="#7b6a56" stroke-width="6"/>
  <rect x="12" y="12" width="44" height="48" rx="6" fill="#bfc8ce" stroke="#70808b" stroke-width="4"/>
  <circle cx="95" cy="25" r="12" fill="#7b6a56"/>
  <rect x="58" y="42" width="56" height="14" rx="5" fill="#7b6a56"/>
 </g>
 <g transform="translate(90 462)">
  <rect x="0" y="0" width="124" height="78" rx="12" fill="#8a5c39" stroke="#5f3f2a" stroke-width="7"/>
  <rect x="16" y="16" width="92" height="16" rx="3" fill="#7aa5e2"/>
  <rect x="16" y="38" width="92" height="16" rx="3" fill="#cfdb78"/>
 </g>
 <g transform="translate(275 500)">
  <rect x="0" y="0" width="116" height="52" rx="10" fill="#8f613f" stroke="#6b482f" stroke-width="7"/>
  <rect x="10" y="10" width="96" height="32" rx="6" fill="#a37149"/>
 </g>
 <g transform="translate(130 515)"><circle r="18" fill="#5da45b"/><rect x="-5" y="10" width="10" height="14" rx="3" fill="#7a5a3a"/></g>
</g>`)}
function storeArt(){return svgWrap('0 0 960 640',`
<defs>
 <linearGradient id="storeWood" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#d2a06b"/><stop offset="1" stop-color="#be8650"/></linearGradient>
 <pattern id="storeFloor" width="36" height="36" patternUnits="userSpaceOnUse"><rect width="36" height="36" fill="url(#storeWood)"/><path d="M34 0 V36" stroke="#a06b43" stroke-width="3" opacity=".55"/></pattern>
 <filter id="sShadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="7" stdDeviation="6" flood-color="#000" flood-opacity=".18"/></filter>
</defs>
<rect width="960" height="640" fill="url(#storeFloor)"/>
<g filter="url(#sShadow)">
 <g transform="translate(112 108)">
  <rect x="0" y="0" width="132" height="240" rx="10" fill="#7a5132" stroke="#553821" stroke-width="8"/>
  <g transform="translate(18 22)">
   <rect width="96" height="20" rx="4" fill="#5f4229"/><rect y="88" width="96" height="20" rx="4" fill="#5f4229"/><rect y="176" width="96" height="20" rx="4" fill="#5f4229"/>
   <rect x="6" y="24" width="14" height="48" rx="4" fill="#7690c8"/><rect x="28" y="24" width="14" height="48" rx="4" fill="#d77a5b"/><rect x="50" y="24" width="14" height="48" rx="4" fill="#8db56b"/><rect x="72" y="24" width="14" height="48" rx="4" fill="#c39a56"/>
   <rect x="6" y="112" width="14" height="48" rx="4" fill="#7690c8"/><rect x="28" y="112" width="14" height="48" rx="4" fill="#d77a5b"/><rect x="50" y="112" width="14" height="48" rx="4" fill="#8db56b"/><rect x="72" y="112" width="14" height="48" rx="4" fill="#c39a56"/>
  </g>
 </g>
 <g transform="translate(400 90)">
  <rect x="0" y="0" width="180" height="220" rx="10" fill="#7a5132" stroke="#553821" stroke-width="8"/>
  <g transform="translate(18 20)">
   <rect width="144" height="20" rx="4" fill="#5f4229"/><rect y="78" width="144" height="20" rx="4" fill="#5f4229"/><rect y="136" width="144" height="20" rx="4" fill="#5f4229"/>
   <circle cx="18" cy="52" r="12" fill="#6ea8dd"/><circle cx="54" cy="52" r="12" fill="#df6460"/><circle cx="90" cy="52" r="12" fill="#79bc72"/><circle cx="126" cy="52" r="12" fill="#d8b45b"/>
   <circle cx="18" cy="110" r="12" fill="#6ea8dd"/><circle cx="54" cy="110" r="12" fill="#df6460"/><circle cx="90" cy="110" r="12" fill="#79bc72"/><circle cx="126" cy="110" r="12" fill="#d8b45b"/>
  </g>
 </g>
 <g transform="translate(666 108)">
  <rect x="0" y="0" width="132" height="240" rx="10" fill="#7a5132" stroke="#553821" stroke-width="8"/>
  <g transform="translate(18 22)">
   <rect width="96" height="20" rx="4" fill="#5f4229"/><rect y="88" width="96" height="20" rx="4" fill="#5f4229"/><rect y="176" width="96" height="20" rx="4" fill="#5f4229"/>
   <rect x="6" y="24" width="14" height="48" rx="4" fill="#7690c8"/><rect x="28" y="24" width="14" height="48" rx="4" fill="#d77a5b"/><rect x="50" y="24" width="14" height="48" rx="4" fill="#8db56b"/><rect x="72" y="24" width="14" height="48" rx="4" fill="#c39a56"/>
   <rect x="6" y="112" width="14" height="48" rx="4" fill="#7690c8"/><rect x="28" y="112" width="14" height="48" rx="4" fill="#d77a5b"/><rect x="50" y="112" width="14" height="48" rx="4" fill="#8db56b"/><rect x="72" y="112" width="14" height="48" rx="4" fill="#c39a56"/>
  </g>
 </g>
 <rect x="390" y="300" width="230" height="132" rx="12" fill="#8a5a37" stroke="#5d3e29" stroke-width="8"/>
 <rect x="447" y="274" width="60" height="38" rx="8" fill="#59627b" stroke="#d5e0f2" stroke-width="5"/>
 <rect x="198" y="445" width="90" height="120" rx="10" fill="#a57143" stroke="#714a2f" stroke-width="8"/>
 <rect x="302" y="445" width="90" height="120" rx="10" fill="#a57143" stroke="#714a2f" stroke-width="8"/>
 <rect x="448" y="505" width="130" height="70" rx="12" fill="#bd6348" stroke="#d8c58a" stroke-width="8"/>
 <circle cx="739" cy="466" r="24" fill="#907053" stroke="#68482f" stroke-width="7"/><circle cx="795" cy="466" r="24" fill="#907053" stroke="#68482f" stroke-width="7"/>
 <g transform="translate(842 302)"><circle r="26" fill="#5ea661"/><rect x="-5" y="20" width="10" height="18" rx="3" fill="#7a5a3a"/></g>
</g>`)}
function homeDialog(s){
  if(homeMode==='house'){const p=rec(s.partnerId);return p?`相棒ポケモン\n「${p.name_ja}と いっしょに がんばろう！」`:'まずは相棒を決めよう。'}
  if(talkIndex>0)return `町の人\n「${talkLines[(talkIndex-1)%talkLines.length]}」`;
  return F.goal(s).text.replace(/！/g,'！\n');
}
function homeCommands(){
  if(homeMode==='house') return [
    {t:'町へ', fn:()=>{homeMode='town';renderAll()}},
    {t:'相棒', fn:showPartnerModal, c:'primary'},
    {t:'倉庫', fn:showWarehouse},
    {t:'物語', fn:showStory},
    {t:'冒険', fn:()=>setView('adventure')}
  ];
  return [
    {t:'話す', fn:()=>{talkIndex=(talkIndex+1)%4;renderAll()}},
    {t:'家へ', fn:()=>{homeMode='house';renderAll()}},
    {t:'相棒', fn:showPartnerModal, c:'primary'},
    {t:'冒険', fn:()=>setView('adventure'), c:'primary'},
    {t:'お店', fn:()=>setView('store')},
    {t:'物語', fn:showStory}
  ];
}
function header(s){
  const st=F.stageInfo(s.development.stage);
  $("headStats").innerHTML=`<span class="pill">🪙 ${Number(s.coins||0).toLocaleString('ja-JP')}</span><span class="pill">📅 ${s.day}日目</span><span class="pill">🏘️ ${esc(st.name)}</span>`;
  const title={home:'拠点',adventure:'冒険',store:'お店'};
  const sub={home:homeMode==='house'?'家の中':'町の全体イメージ',adventure:F.run?.active?'ダンジョン探索中':'はじまりの森',store:'店の中（販売中）'};
  $("viewTitle").textContent=title[currentView]||'Frenda Frontier';
  $("viewSubtitle").textContent=sub[currentView]||'';
  $("viewMeta").textContent=`現在地：${esc(st.caption)}`;
}
function homeScene(s){const st=F.stageInfo(s.development.stage), p=rec(s.partnerId);
  if(homeMode==='house'){
    return `<div class="houseScene gameScene">${houseArt()}<div class="sceneHud"><div class="miniTags"><span class="tag">家の中</span>${p?`<span class="tag">相棒：${esc(p.name_ja)}</span>`:''}</div></div><div class="spriteLayer"><div style="position:absolute;left:46%;top:67%;">${human('blue')}</div>${p?`<div class="partnerSprite" style="left:54%;top:60%;"><img src="${esc(image(p))}" alt=""></div>`:''}</div><div class="dialogBox"><h3>家の中</h3><p>${esc(homeDialog(s))}</p></div><div class="commandBox"><div class="commandTitle">▶ コマンド</div><div class="cmdList" id="cmdHome"></div></div></div>`;
  }
  return `<div class="townScene gameScene">${townArt()}<div class="sceneHud"><div class="miniTags"><span class="tag">${esc(st.name)}</span><span class="tag">発展 ${s.development.points}pt</span>${p?`<span class="tag">相棒：${esc(p.name_ja)}</span>`:''}</div></div><div class="spriteLayer"><div style="position:absolute;left:25%;top:63%;">${human('blue')}</div><div style="position:absolute;left:38%;top:73%;">${human('orange')}</div><div style="position:absolute;left:62%;top:63%;">${human('purple')}</div><div style="position:absolute;left:82%;top:83%;">${human('green')}</div><div style="position:absolute;left:49%;top:78%;">${human('blue')}</div>${p?`<div class="partnerSprite" style="left:54%;top:78%;"><img src="${esc(image(p))}" alt=""></div>`:''}</div><div class="dialogBox"><h3>町の人との会話</h3><p>${esc(homeDialog(s))}</p></div><div class="commandBox"><div class="commandTitle">▶ コマンド</div><div class="cmdList" id="cmdHome"></div></div></div>`;
}
function showPartnerModal(){
  const s=F.readSave(), list=F.eligiblePartners();
  let html=`<h2>🤝 相棒を選ぶ</h2><p>${F.usingTrialPartners?.()?'TEST環境なので体験用相棒を表示しています。':'序盤は★3以下のピックが対象です。'}</p><div class="partnerGrid">`;
  list.slice(0,60).forEach(r=>{html+=`<button class="partnerCard ${String(r.master_id)===String(s.partnerId)?'on':''}" data-pid="${esc(r.master_id)}">${image(r)?`<img src="${esc(image(r))}" alt="">`:'<div>?</div>'}<span><b>${esc(r.name_ja)}</b><small>${esc(r.pick_no||r.master_id)}</small><div><span class="badge">★${r.grade||'?'}</span><span class="badge">${esc(r.type1||'')}</span>${F.usingTrialPartners?.()?'<span class="badge">体験用</span>':''}</div></span></button>`});
  html+='</div>'; modal(html,[{label:'閉じる'}]);
  document.querySelectorAll('[data-pid]').forEach(b=>b.onclick=()=>{try{F.selectPartner(b.dataset.pid);closeModal();toast('相棒を選びました');renderAll()}catch(e){toast(e.message)}});
}
function showWarehouse(){const s=F.readSave();const e=Object.entries(s.warehouse).filter(([,n])=>Number(n)>0);let html='<h2>📦 倉庫</h2>';if(!e.length)html+='<p>まだ何もありません。冒険で持ち帰りましょう。</p>';else html+='<div class="choiceGrid">'+e.map(([id,n])=>{const it=F.item(id);return `<div class="choiceCard"><div style="width:52px;height:72px;display:grid;place-items:center;font-size:32px;background:#f2f6f3;border-radius:7px">${it.icon}</div><span><b>${esc(it.name)}</b><small>${esc(it.kind)} / 相場 ${it.base}G</small><div class="badge">×${n}</div></span></div>`}).join('')+'</div>';modal(html,[{label:'閉じる'}])}
function showStory(){const s=F.readSave(),step=F.storyStep(s);let html='<h2>📖 物語</h2><div class="choiceGrid">';F.STORY.forEach(x=>{html+=`<div class="choiceCard" style="grid-template-columns:1fr"><span><b>${x.at<=step?'✅':'🔒'} ${esc(x.title)}</b><small>${esc(x.text)}</small></span></div>`});html+='</div>';modal(html,[{label:'閉じる'}])}
function stockChooser(slot){const s=F.readSave();const e=Object.entries(s.warehouse).filter(([id,n])=>Number(n)>0&&F.item(id));if(!e.length){toast('倉庫に商品がありません');return}let html=`<h2>棚${slot+1}に並べる</h2><div class="choiceGrid">`;e.forEach(([id,n])=>{const it=F.item(id);html+=`<button class="choiceCard" data-stock-item="${esc(id)}"><div style="width:52px;height:72px;display:grid;place-items:center;font-size:32px;background:#f2f6f3;border-radius:7px">${it.icon}</div><span><b>${esc(it.name)}</b><small>相場 ${it.base}G / 倉庫×${n}</small></span></button>`});html+='</div>';modal(html,[{label:'閉じる'}]);document.querySelectorAll('[data-stock-item]').forEach(b=>b.onclick=()=>{const id=b.dataset.stockItem,it=F.item(id);closeModal();modal(`<h2>${it.icon} ${esc(it.name)}</h2><p>相場：<b>${it.base}G</b></p><label>販売価格 <input id="stockPrice" type="number" value="${it.base}" min="10" max="${it.base*3}" style="width:110px;padding:6px;border:1px solid #cbd9ce;border-radius:8px;text-align:right"> G</label>`,[{label:'棚に並べる',className:'cmdBtn primary',fn:()=>{try{F.stockShelf(slot,id,$('stockPrice')?.value||it.base);toast('商品を並べました');renderAll()}catch(e){toast(e.message)}}},{label:'戻る'}])})}
function chooseShelfForPrice(){const s=F.readSave();const list=s.shelves.map((sh,i)=>sh?{...sh,slot:i}:null).filter(Boolean);if(!list.length){toast('棚に商品がありません');return}let html='<h2>値段を変える</h2><div class="choiceGrid">';list.forEach(sh=>{const it=F.item(sh.itemId);html+=`<button class="choiceCard" data-price-slot="${sh.slot}"><div style="width:52px;height:72px;display:grid;place-items:center;font-size:32px;background:#f2f6f3;border-radius:7px">${it.icon}</div><span><b>${esc(it.name)}</b><small>現在 ${sh.price}G / 相場 ${it.base}G</small></span></button>`});html+='</div>';modal(html,[{label:'閉じる'}]);document.querySelectorAll('[data-price-slot]').forEach(b=>b.onclick=()=>{const slot=Number(b.dataset.priceSlot);const sh=F.readSave().shelves[slot],it=F.item(sh.itemId);closeModal();modal(`<h2>${esc(it.name)}の値段</h2><p>相場：${it.base}G</p><label>販売価格 <input id="editPrice" type="number" value="${sh.price}" min="10" max="${it.base*3}" style="width:110px;padding:6px;border:1px solid #cbd9ce;border-radius:8px;text-align:right"> G</label>`,[{label:'変更する',className:'cmdBtn primary',fn:()=>{F.changePrice(slot,$('editPrice').value);toast('値段を変更しました');renderAll()}},{label:'棚から戻す',fn:()=>{F.unstockShelf(slot);toast('倉庫へ戻しました');renderAll()}},{label:'閉じる'}])})}
async function runStore(){if(storeBusy)return;const s=F.readSave();if(!s.shelves.some(Boolean)){toast('棚に商品がありません');return}storeBusy=true;for(let n=0;n<4;n++){const r=F.simulateCustomer();const log=$('storeDialogText');if(r.bought){F.applySale(r);if(log)log.textContent=`✅ ${r.customer.name}が ${r.choice.item.name} を${r.choice.price}Gで買いました。\n${r.customer.name}「${r.customer.line}」`;} else {if(log)log.textContent=`…${r.customer.name}は「${r.reason}」で帰りました。\n${r.customer.name}「また見にくるよ。」`}await new Promise(res=>setTimeout(res,520));renderAll()}F.mutateSave(x=>x.day++);storeBusy=false;renderAll();toast('今日の営業を終えました')}
function storeScene(s){return `<div class="storeScene gameScene">${storeArt()}<div class="sceneHud"><div class="miniTags"><span class="tag">棚 ${s.shelves.filter(Boolean).length}/3</span><span class="tag">売上 ${Number(s.sales.revenue||0)}G</span><span class="tag">来店 ${s.sales.customers}人</span></div></div><div class="spriteLayer"><div style="position:absolute;left:50%;top:54%;">${human('orange')}</div><div style="position:absolute;left:72%;top:72%;">${human('blue')}</div><div style="position:absolute;left:81%;top:77%;">${human('purple')}</div><div style="position:absolute;left:24%;top:88%;">${human('green')}</div></div><div class="dialogBox"><h3>店の中（販売中）</h3><p id="storeDialogText">${esc(s.shelves.some(Boolean)?'店員\n「いらっしゃいませ！ どの商品を見ていきますか？」':'店員\n「まずは倉庫から商品を並べてみましょう。」')}</p></div><div class="commandBox"><div class="commandTitle">▶ コマンド</div><div class="cmdList" id="cmdStore"></div></div></div>`}
function boardTile(run,x,y){const t=run.map[y][x];let inner='';if(t==='gather')inner+='<span class="leaf"></span>';if(t==='stairs')inner+='<span class="stairsIcon"></span>';const e=run.enemies.find(q=>q.hp>0&&q.x===x&&q.y===y);if(e){const er=rec(e.recordId);inner+=`<div class="enemySprite" style="left:50%;top:95%;">${image(er)?`<img src="${esc(image(er))}" alt="">`:''}<span class="enemyLabel">${esc(e.name)} HP${e.hp}</span></div>`}if(run.partnerHp>0&&run.partner.x===x&&run.partner.y===y){const p=rec(F.readSave().partnerId);inner+=`<div class="partnerSprite" style="left:50%;top:95%;">${image(p)?`<img src="${esc(image(p))}" alt="">`:''}</div>`}if(run.player.x===x&&run.player.y===y){inner+=`<div style="position:absolute;left:50%;top:95%;transform:translate(-50%,-100%);">${human('blue','kid')}</div>`}return `<div class="tile ${t}" data-x="${x}" data-y="${y}">${inner}</div>`}
function runResultModal(){const r=F.run?.result;if(!r)return;const items=Object.entries(r.delivered||{}).map(([id,n])=>`${F.item(id)?.name||id}×${n}`).join('、')||'なし';modal(`<h2>${r.success?'🏠 無事帰還！':'😵 冒険失敗'}</h2><p>持ち帰ったもの：<b>${esc(items)}</b></p>${Object.keys(r.lost||{}).length?'<p>倒れたため、一部を失いました。</p>':''}`,[{label:'拠点へ',fn:()=>{setView('home')}},{label:'お店へ',fn:()=>{setView('store')}}])}
function stairsChoice(){const run=F.run;if(!run?.active)return;const last=run.floor>=run.maxFloor;modal(`<h2>🪜 階段</h2><p>${last?'最深部に向かいますか？':'次の階へ進むか、帰還するか選んでください。'}</p>`,[{label:'帰還する',fn:()=>{F.finishRun(true,'return');renderAll();runResultModal()}},{label:last?'最深部へ':'次の階へ',className:'cmdBtn primary',fn:()=>{F.nextFloor();renderAll();if(!F.run?.active)runResultModal()}},{label:'閉じる'}])}
function showBag(){const run=F.run;if(!run?.active)return;const e=Object.entries(run.bag||{});let html='<h2>🎒 持ち物</h2>';if(!e.length)html+='<p>まだ何も持っていません。</p>';else html+='<div class="choiceGrid">'+e.map(([id,n])=>{const it=F.item(id);return `<div class="choiceCard"><div style="width:52px;height:72px;display:grid;place-items:center;font-size:32px;background:#f2f6f3;border-radius:7px">${it.icon}</div><span><b>${esc(it.name)}</b><small>${esc(it.kind)}</small><div class="badge">×${n}</div></span></div>`}).join('')+'</div>';modal(html,[{label:'閉じる'}])}
function move(dx,dy){F.move(dx,dy);renderAll();if(F.run && !F.run.active)runResultModal()}
function advScene(s){const run=F.run; if(!run?.active){return `<div class="advScene gameScene"><svg class="sceneArt" viewBox="0 0 960 640" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="fg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#507d47"/><stop offset="1" stop-color="#2c4c29"/></linearGradient></defs><rect width="960" height="640" fill="url(#fg)"/><g opacity=".9"><circle cx="120" cy="90" r="54" fill="#597f4e"/><circle cx="865" cy="92" r="58" fill="#5b8450"/><circle cx="178" cy="556" r="52" fill="#597f4e"/><circle cx="810" cy="525" r="60" fill="#648d57"/></g><path d="M402 224 L540 224 L750 510 L210 510 Z" fill="#886642" opacity=".6"/><path d="M450 282 L510 282 L560 336 L400 336 Z" fill="#98b96f"/></svg><div class="hudStrip"><span class="hudPill">B1F</span><span class="hudPill">❤️ 30/30</span><span class="hudPill">🐾 ${s.partnerId?(24+Math.max(0,Number(rec(s.partnerId)?.grade)||1)*3):0}/${s.partnerId?(24+Math.max(0,Number(rec(s.partnerId)?.grade)||1)*3):0}</span><span class="hudPill">Lv 1</span><span class="hudPill">🍙 32</span><span class="hudPill">🎒 0/10</span></div><div class="boardWrap" style="display:grid;place-items:center;background:linear-gradient(135deg,#4a7a44,#2f532c);"><div class="tapHint">森の入口</div><div style="position:absolute;left:40%;top:46%;transform:translate(-50%,-100%);">${human('blue')}</div>${s.partnerId?`<div class="partnerSprite" style="left:48%;top:46%;"><img src="${esc(image(rec(s.partnerId)))}" alt=""></div>`:''}<div class="enemySprite" style="left:67%;top:42%;"><img src="${esc(image(rec(F.DUNGEON_ENEMIES[0].recordId)))}" alt=""><span class="enemyLabel">！</span></div><div class="stairsIcon" style="position:absolute;left:74%;top:72%;"></div></div><div class="dialogBox"><h3>ダンジョン（フィールド）</h3><p>森を探索し、素材を集めて帰ろう。\n出発すると、相棒が敵と自動で戦います。</p></div><div class="commandBox"><div class="commandTitle">▶ コマンド</div><div class="cmdList" id="cmdAdv"></div></div></div>`}
 return `<div class="advScene gameScene"><div class="hudStrip"><span class="hudPill">B${run.floor}F</span><span class="hudPill">❤️ ${run.playerHp}/${run.playerMaxHp}</span><span class="hudPill">🐾 ${run.partnerHp}/${run.partnerMaxHp}</span><span class="hudPill">Lv ${run.partnerLv}</span><span class="hudPill">🍙 ${run.food}</span><span class="hudPill">🎒 ${F.bagSlots(run.bag)}/${run.bagLimit}</span></div><div class="boardWrap"><div class="tapHint">となりのマスをタップで移動</div><div class="board">${Array.from({length:F.H},(_,y)=>Array.from({length:F.W},(_,x)=>boardTile(run,x,y)).join('')).join('')}</div></div><div class="dialogBox"><h3>ダンジョン（メニュー）</h3><p>${esc((run.log.slice(-2).join('\n')||'相棒と一緒に進もう。'))}</p></div><div class="commandBox"><div class="commandTitle">▶ コマンド</div><div class="cmdList" id="cmdAdv"></div><div class="dirPad"><button class="up" data-move="0,-1">▲</button><button data-move="-1,0">◀</button><button data-move="0,1">▼</button><button data-move="1,0">▶</button></div></div></div>`}
function renderHome(s){$('sceneMount').innerHTML=homeScene(s);const box=$('cmdHome');homeCommands().forEach(c=>{const b=document.createElement('button');b.className='cmdBtn '+(c.c||'');b.textContent=c.t;b.onclick=c.fn;box.appendChild(b)})}
function renderStore(s){$('sceneMount').innerHTML=storeScene(s);const box=$('cmdStore');[{t:'棚1',fn:()=>stockChooser(0)},{t:'棚2',fn:()=>stockChooser(1)},{t:'棚3',fn:()=>stockChooser(2)},{t:'ねだん',fn:chooseShelfForPrice},{t:'営業',fn:runStore,c:'primary'},{t:'倉庫',fn:showWarehouse}].forEach(c=>{const b=document.createElement('button');b.className='cmdBtn '+(c.c||'');b.textContent=c.t;b.disabled=(c.t==='営業'&&!s.shelves.some(Boolean))||storeBusy;b.onclick=c.fn;box.appendChild(b)})}
function renderAdventure(s){$('sceneMount').innerHTML=advScene(s);const box=$('cmdAdv'); if(!F.run?.active){[{t:'出発',fn:()=>{try{F.startRun();renderAll()}catch(e){toast(e.message)}},c:'primary'},{t:'相棒',fn:showPartnerModal},{t:'持ち物',fn:showWarehouse},{t:'拠点',fn:()=>setView('home')}].forEach(c=>{const b=document.createElement('button');b.className='cmdBtn '+(c.c||'');b.textContent=c.t;b.onclick=c.fn;box.appendChild(b)});return}
 [{t:'どうぐ',fn:showBag},{t:'つよさ',fn:()=>toast(`相棒Lv${F.run.partnerLv}`)},{t:'階段',fn:stairsChoice,c:F.isOnStairs()?'primary':''},{t:'ロープ',fn:()=>{if(F.escape()){renderAll();runResultModal()}},c:'warn'},{t:'拠点',fn:()=>setView('home')}].forEach(c=>{const b=document.createElement('button');b.className='cmdBtn '+(c.c||'');b.textContent=c.t;b.disabled=(c.t==='階段'&&!F.isOnStairs())||(c.t==='ロープ'&&F.run.escape<=0);b.onclick=c.fn;box.appendChild(b)});
 $('sceneMount').querySelectorAll('.tile').forEach(d=>d.onclick=()=>{const x=Number(d.dataset.x),y=Number(d.dataset.y),dx=x-F.run.player.x,dy=y-F.run.player.y;if(Math.abs(dx)+Math.abs(dy)!==1){toast('となりのマスをタップしてください');return}move(dx,dy)});
 $('sceneMount').querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>{const [dx,dy]=b.dataset.move.split(',').map(Number);move(dx,dy)})
}
function renderAll(){const s=F.readSave();s.development.stage=F.developmentStage(s.development.points);F.writeSave(s);header(s);if(currentView==='home')renderHome(s);if(currentView==='store')renderStore(s);if(currentView==='adventure')renderAdventure(s)}
function bind(){document.querySelectorAll('#mainNav button').forEach(b=>b.onclick=()=>setView(b.dataset.view));window.addEventListener('keydown',e=>{if(!F.run?.active)return;const m={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[e.key];if(m){e.preventDefault();move(...m)}})}
function init(){if(!window.FRENDA_MASTER?.records||!window.FRENDA_DATA) throw new Error('Frontier共通データを読み込めませんでした。');const host=$('frontierUserHost'), badge=document.getElementById('frendaActiveUserBadge');if(host&&badge)host.appendChild(badge);bind();renderAll();if(window.FRENDA_USER?.mode==='cloud')$('sceneMount').insertAdjacentHTML('beforeend','<div class="tag" style="position:absolute;left:12px;top:12px;z-index:12;">☁️ Frontier専用クラウド列は後続版で正式実装予定</div>')}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>{try{init()}catch(e){console.error(e);document.body.insertAdjacentHTML('beforeend',`<div class="modal"><div class="modalPanel"><h2>起動エラー</h2><p>${esc(e.message)}</p></div></div>`)}}); else init();
})();
