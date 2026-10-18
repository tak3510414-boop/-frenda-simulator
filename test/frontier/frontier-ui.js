/* Frenda Frontier Ver0.08 / denser 2.5D art-backed UI */
(()=>{"use strict";
const F=window.FRENDA_FRONTIER,$=id=>document.getElementById(id),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let currentView="home", homeMode="town", talkIndex=0, storeBusy=false;
const image=r=>r?.official_image||"";
const rec=id=>F.pickRecord(id);
const talkLines=[
  'この先の森には、めずらしい素材があるらしいよ。',
  '店の商品が増えると、旅人も少しずつ集まってくるんだ。',
  '鍛冶屋がにぎわうと、もっと奥の森の噂も聞けるかもね。',
  '相棒と息を合わせれば、森の奥まで行けるはずだよ。'
];
function toast(t){const e=$('toast');if(!e)return;e.textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),1700)}
function ensureModal(){let m=document.getElementById('frontierModal');if(m)return m;m=document.createElement('div');m.id='frontierModal';m.className='modal hidden';m.innerHTML='<div class="modalPanel"><div id="frontierModalBody"></div><div class="modalActions" id="frontierModalActions"></div></div>';document.body.appendChild(m);m.addEventListener('click',e=>{if(e.target===m)closeModal()});return m}
function modal(html,actions=[]){ensureModal();const m=$('frontierModal'), body=$('frontierModalBody'), a=$('frontierModalActions');body.innerHTML=html;a.innerHTML='';actions.forEach(x=>{const b=document.createElement('button');b.className=x.className||'cmdBtn';b.textContent=x.label;b.onclick=()=>{if(x.close!==false)closeModal();x.fn?.()};a.appendChild(b)});m.classList.remove('hidden')}
function closeModal(){const m=$('frontierModal');if(m)m.classList.add('hidden')}
function setView(v){currentView=v;document.querySelectorAll('#mainNav button').forEach(b=>b.classList.toggle('on',b.dataset.view===v));renderAll()}

function human(color='blue', size='adult'){
  const pal={
    blue:{cap:'#4d82d6',cap2:'#2d5fa8',body:'#5b8fe0',line:'#2f548b',vest:'#cfe4ff'},
    green:{cap:'#71aa63',cap2:'#4f7a45',body:'#87bf79',line:'#4c7343',vest:'#dcedd3'},
    purple:{cap:'#9772c6',cap2:'#6d4f91',body:'#a987d1',line:'#674c8b',vest:'#efe3fb'},
    orange:{cap:'#d78b49',cap2:'#96582b',body:'#e19c62',line:'#945b34',vest:'#ffe1c7'}
  }[color]||{cap:'#4d82d6',cap2:'#2d5fa8',body:'#5b8fe0',line:'#2f548b',vest:'#cfe4ff'};
  return `<div class="humanWrap ${size==='kid'?'kid':''}"><svg viewBox="0 0 64 82" aria-hidden="true">
    <ellipse cx="32" cy="74" rx="14" ry="5.3" fill="#000" opacity=".17"/>
    <rect x="18" y="35" width="28" height="20" rx="6" fill="${pal.body}" stroke="${pal.line}" stroke-width="2.5"/>
    <rect x="20" y="37" width="24" height="9" rx="4" fill="${pal.vest}" opacity=".95"/>
    <rect x="14" y="38" width="7" height="16" rx="3" fill="#f3d2b3" stroke="#9a6948" stroke-width="1.6"/>
    <rect x="43" y="38" width="7" height="16" rx="3" fill="#f3d2b3" stroke="#9a6948" stroke-width="1.6"/>
    <rect x="21" y="55" width="8" height="14" rx="2.5" fill="#5868b7"/>
    <rect x="35" y="55" width="8" height="14" rx="2.5" fill="#5868b7"/>
    <rect x="20" y="67" width="10" height="4.5" rx="2" fill="#665140"/>
    <rect x="34" y="67" width="10" height="4.5" rx="2" fill="#665140"/>
    <rect x="19" y="11" width="26" height="8" rx="4" fill="${pal.cap2}"/>
    <path d="M16 18 Q32 2 48 18 L48 22 L16 22 Z" fill="${pal.cap}" stroke="${pal.cap2}" stroke-width="1.9"/>
    <rect x="14" y="21" width="36" height="4.8" rx="2.4" fill="${pal.cap2}"/>
    <rect x="22" y="20" width="20" height="5" rx="2.5" fill="#79513a"/>
    <rect x="19" y="25" width="26" height="18" rx="9" fill="#f1cfaf" stroke="#9a6948" stroke-width="2"/>
    <circle cx="28" cy="34" r="1.6" fill="#473229"/>
    <circle cx="36" cy="34" r="1.6" fill="#473229"/>
    <path d="M25 39 Q32 42 39 39" fill="none" stroke="#9a6948" stroke-width="1.9" stroke-linecap="round"/>
  </svg></div>`;
}
function svgWrap(viewBox, inner, mode='meet'){return `<svg class="sceneArt" viewBox="${viewBox}" preserveAspectRatio="xMidYMid ${mode}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`}
function townArt(){return svgWrap('0 0 1000 720',`
<defs>
 <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#84c6ef"/><stop offset="1" stop-color="#d2eef8"/></linearGradient>
 <linearGradient id="grass" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#96cf76"/><stop offset="1" stop-color="#6ea54f"/></linearGradient>
 <linearGradient id="dirt" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#d8c9a9"/><stop offset="1" stop-color="#bea882"/></linearGradient>
 <linearGradient id="stone" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#d7d0be"/><stop offset="1" stop-color="#bfb49f"/></linearGradient>
 <linearGradient id="shopWall" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#efe2bf"/><stop offset="1" stop-color="#d3c29c"/></linearGradient>
 <linearGradient id="homeWall" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#dfdccd"/><stop offset="1" stop-color="#cfc9b5"/></linearGradient>
 <filter id="drop" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="#000" flood-opacity=".16"/></filter>
</defs>
<rect width="1000" height="720" fill="url(#sky)"/>
<rect y="252" width="1000" height="468" fill="url(#grass)"/>
<path d="M450 225 L550 225 L550 372 L785 520 L785 612 L215 612 L215 520 L450 372 Z" fill="url(#dirt)" opacity=".95" stroke="#c1ab83" stroke-width="6"/>
<path d="M500 225 V612" stroke="#c8b68d" stroke-width="7" opacity=".78"/>
<path d="M215 520 H785" stroke="#c8b68d" stroke-width="7" opacity=".78"/>
<path d="M308 313 L214 372" stroke="#c8b68d" stroke-width="7" opacity=".78"/>
<path d="M694 313 L786 372" stroke="#c8b68d" stroke-width="7" opacity=".78"/>
<ellipse cx="500" cy="448" rx="242" ry="168" fill="#d5c7a9" opacity=".28"/>
<g filter="url(#drop)">
  <g transform="translate(66 132)">
    <rect x="0" y="52" width="220" height="146" rx="18" fill="url(#shopWall)" stroke="#7a5539" stroke-width="8"/>
    <polygon points="18,52 110,-18 202,52" fill="#c4604a" stroke="#7a5539" stroke-width="8"/>
    <rect x="24" y="96" width="32" height="48" rx="5" fill="#92613d" stroke="#65442b" stroke-width="5"/>
    <rect x="164" y="96" width="32" height="48" rx="5" fill="#92613d" stroke="#65442b" stroke-width="5"/>
    <rect x="82" y="126" width="54" height="62" rx="10" fill="#8d5f3e" stroke="#65442b" stroke-width="6"/>
    <rect x="48" y="136" width="140" height="48" rx="14" fill="#f7edd2" stroke="#8a6b3a" stroke-width="5"/>
    <text x="118" y="168" font-size="30" font-weight="900" text-anchor="middle" fill="#2f3e31">SHOP</text>
    <rect x="0" y="104" width="82" height="22" rx="5" fill="#f4efe1" stroke="#8c6c43" stroke-width="4"/>
    <rect x="8" y="107" width="66" height="16" fill="url(#stone)"/>
    <path d="M8 107 H74" stroke="#c96854" stroke-width="6" stroke-dasharray="10 8"/>
  </g>
  <g transform="translate(677 132)">
    <rect x="0" y="52" width="194" height="146" rx="18" fill="url(#homeWall)" stroke="#7a5539" stroke-width="8"/>
    <polygon points="18,52 96,-20 176,52" fill="#4d7ec7" stroke="#7a5539" stroke-width="8"/>
    <rect x="22" y="98" width="30" height="44" rx="5" fill="#edf3ff" stroke="#7a5c40" stroke-width="5"/>
    <rect x="142" y="98" width="30" height="44" rx="5" fill="#edf3ff" stroke="#7a5c40" stroke-width="5"/>
    <rect x="72" y="124" width="48" height="64" rx="10" fill="#8d5f3e" stroke="#65442b" stroke-width="6"/>
    <rect x="58" y="137" width="78" height="42" rx="12" fill="#f7edd2" stroke="#8a6b3a" stroke-width="5"/>
    <text x="97" y="166" font-size="30" font-weight="900" text-anchor="middle" fill="#2f3e31">家</text>
  </g>
  <g transform="translate(76 500)">
    <rect x="0" y="40" width="176" height="90" rx="14" fill="#dac7a9" stroke="#7a5539" stroke-width="7"/>
    <polygon points="14,40 88,-4 162,40" fill="#9f6d3e" stroke="#7a5539" stroke-width="7"/>
    <rect x="36" y="68" width="104" height="28" rx="9" fill="#f4ead0" stroke="#8c6b37" stroke-width="4"/>
    <text x="88" y="89" font-size="24" font-weight="900" text-anchor="middle" fill="#2f3e31">鍛冶屋</text>
  </g>
  <g transform="translate(754 500)">
    <rect x="0" y="40" width="160" height="90" rx="14" fill="#d6c09a" stroke="#7a5539" stroke-width="7"/>
    <polygon points="14,40 80,-4 146,40" fill="#b58949" stroke="#7a5539" stroke-width="7"/>
    <rect x="42" y="68" width="76" height="28" rx="9" fill="#f4ead0" stroke="#8c6b37" stroke-width="4"/>
    <text x="80" y="89" font-size="24" font-weight="900" text-anchor="middle" fill="#2f3e31">倉庫</text>
  </g>
  <g transform="translate(500 492)">
    <circle r="78" fill="#d5ccbb" stroke="#7f8f8a" stroke-width="8"/>
    <circle r="48" fill="#7ec9ee" stroke="#4d89a9" stroke-width="8"/>
    <circle r="17" cy="-4" fill="#dad6c7" stroke="#7f8f8a" stroke-width="5"/>
    <path d="M0 -18 V-42" stroke="#7ec9ee" stroke-width="10" stroke-linecap="round"/>
    <path d="M-16 -34 Q0 -58 16 -34" fill="none" stroke="#c6f2ff" stroke-width="6" stroke-linecap="round"/>
  </g>
</g>
<g opacity=".94">
  <g transform="translate(48 290)"><circle r="38" fill="#6aa352"/><circle cx="-11" cy="-8" r="17" fill="#91c373"/><rect x="-8" y="28" width="16" height="26" rx="5" fill="#7a5a3a"/></g>
  <g transform="translate(958 292)"><circle r="38" fill="#6aa352"/><circle cx="-11" cy="-8" r="17" fill="#91c373"/><rect x="-8" y="28" width="16" height="26" rx="5" fill="#7a5a3a"/></g>
  <g transform="translate(226 286)"><circle r="28" fill="#78ad62"/><rect x="-6" y="22" width="12" height="16" rx="4" fill="#7a5a3a"/></g>
  <g transform="translate(780 284)"><circle r="28" fill="#78ad62"/><rect x="-6" y="22" width="12" height="16" rx="4" fill="#7a5a3a"/></g>
</g>
<g>
 <g transform="translate(314 280)"><circle r="9" fill="#f7b5d4"/><circle cx="16" r="9" fill="#ffe286"/><circle cx="32" r="9" fill="#c6a9ff"/><circle cx="11" cy="15" r="9" fill="#96e58c"/><circle cx="27" cy="15" r="9" fill="#ffc88d"/></g>
 <g transform="translate(754 280)"><circle r="9" fill="#f7b5d4"/><circle cx="16" r="9" fill="#ffe286"/><circle cx="32" r="9" fill="#c6a9ff"/><circle cx="11" cy="15" r="9" fill="#96e58c"/><circle cx="27" cy="15" r="9" fill="#ffc88d"/></g>
 <g transform="translate(258 610)"><circle r="7" fill="#ffd567"/><circle cx="14" r="7" fill="#ff9ab8"/><circle cx="28" r="7" fill="#7bd27b"/></g>
 <g transform="translate(738 610)"><circle r="7" fill="#ffd567"/><circle cx="14" r="7" fill="#ff9ab8"/><circle cx="28" r="7" fill="#7bd27b"/></g>
</g>`,`meet`)}
function houseArt(){return svgWrap('0 0 1000 720',`
<defs>
 <linearGradient id="woodWall" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#d8a468"/><stop offset="1" stop-color="#c38951"/></linearGradient>
 <pattern id="planks" width="44" height="44" patternUnits="userSpaceOnUse"><rect width="44" height="44" fill="url(#woodWall)"/><rect y="0" width="44" height="22" fill="#d9a86e" opacity=".38"/><path d="M42 0 V44" stroke="#99663d" stroke-width="3" opacity=".58"/></pattern>
 <filter id="hdrop" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="7" stdDeviation="7" flood-color="#000" flood-opacity=".18"/></filter>
</defs>
<rect width="1000" height="720" fill="url(#planks)"/>
<rect x="20" y="20" width="960" height="680" rx="18" fill="none" stroke="#8b603a" stroke-width="12"/>
<g filter="url(#hdrop)">
 <rect x="84" y="124" width="228" height="256" rx="20" fill="#f3f3f5" stroke="#6a4b32" stroke-width="9"/>
 <rect x="84" y="124" width="228" height="82" rx="14" fill="#7193d1"/>
 <rect x="340" y="188" width="340" height="252" rx="18" fill="#92aa6d" stroke="#d7c47c" stroke-width="10"/>
 <ellipse cx="449" cy="367" rx="50" ry="36" fill="#9a714e" stroke="#6d4a31" stroke-width="8"/>
 <rect x="626" y="165" width="120" height="126" rx="12" fill="#dfe9f7" stroke="#7a5c40" stroke-width="8"/>
 <path d="M686 165 V291 M626 228 H746" stroke="#a29b8c" stroke-width="6"/>
 <rect x="784" y="148" width="90" height="144" rx="12" fill="#7b5538" stroke="#573824" stroke-width="8"/>
 <rect x="807" y="173" width="44" height="96" fill="#88afe0"/>
 <rect x="772" y="430" width="160" height="108" rx="12" fill="#d7cfbf" stroke="#7b6a56" stroke-width="7"/>
 <rect x="786" y="444" width="56" height="64" rx="7" fill="#bfccd2" stroke="#70808b" stroke-width="4"/>
 <circle cx="892" cy="462" r="13" fill="#7b6a56"/><rect x="850" y="484" width="54" height="18" rx="6" fill="#7b6a56"/>
 <rect x="96" y="474" width="146" height="94" rx="12" fill="#8a5c39" stroke="#5f3f2a" stroke-width="8"/>
 <rect x="112" y="492" width="114" height="18" rx="4" fill="#7aa5e2"/>
 <rect x="112" y="518" width="114" height="18" rx="4" fill="#cfdb78"/>
 <rect x="112" y="544" width="114" height="10" rx="4" fill="#e8d89c"/>
 <rect x="274" y="525" width="118" height="58" rx="10" fill="#8f613f" stroke="#6b482f" stroke-width="7"/>
 <rect x="286" y="537" width="94" height="34" rx="6" fill="#a37149"/>
 <g transform="translate(124 595)"><circle r="20" fill="#5da45b"/><rect x="-5" y="10" width="10" height="14" rx="3" fill="#7a5a3a"/></g>
 <g transform="translate(900 588)"><circle r="20" fill="#5da45b"/><rect x="-5" y="10" width="10" height="14" rx="3" fill="#7a5a3a"/></g>
</g>`,`meet`)}
function storeArt(){return svgWrap('0 0 1000 720',`
<defs>
 <linearGradient id="storeWood" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#d6a16a"/><stop offset="1" stop-color="#c1874f"/></linearGradient>
 <pattern id="storeFloor" width="42" height="42" patternUnits="userSpaceOnUse"><rect width="42" height="42" fill="url(#storeWood)"/><rect y="0" width="42" height="21" fill="#dfaf77" opacity=".35"/><path d="M40 0 V42" stroke="#9c683e" stroke-width="3" opacity=".55"/></pattern>
 <filter id="sdrop" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="7" stdDeviation="6" flood-color="#000" flood-opacity=".18"/></filter>
</defs>
<rect width="1000" height="720" fill="url(#storeFloor)"/>
<g filter="url(#sdrop)">
 <g transform="translate(82 108)">
  <rect x="0" y="0" width="152" height="278" rx="12" fill="#7a5132" stroke="#553821" stroke-width="8"/>
  <g transform="translate(18 18)">
   <rect width="116" height="24" rx="5" fill="#5f4229"/><rect y="96" width="116" height="24" rx="5" fill="#5f4229"/><rect y="192" width="116" height="24" rx="5" fill="#5f4229"/>
   <rect x="8" y="30" width="18" height="54" rx="4" fill="#7690c8"/><rect x="34" y="30" width="18" height="54" rx="4" fill="#d77a5b"/><rect x="60" y="30" width="18" height="54" rx="4" fill="#8db56b"/><rect x="86" y="30" width="18" height="54" rx="4" fill="#c39a56"/>
   <rect x="8" y="126" width="18" height="54" rx="4" fill="#7690c8"/><rect x="34" y="126" width="18" height="54" rx="4" fill="#d77a5b"/><rect x="60" y="126" width="18" height="54" rx="4" fill="#8db56b"/><rect x="86" y="126" width="18" height="54" rx="4" fill="#c39a56"/>
  </g>
 </g>
 <g transform="translate(423 92)">
  <rect x="0" y="0" width="192" height="240" rx="12" fill="#7a5132" stroke="#553821" stroke-width="8"/>
  <g transform="translate(20 18)">
   <rect width="152" height="24" rx="5" fill="#5f4229"/><rect y="86" width="152" height="24" rx="5" fill="#5f4229"/><rect y="148" width="152" height="24" rx="5" fill="#5f4229"/>
   <circle cx="22" cy="62" r="14" fill="#6ea8dd"/><circle cx="60" cy="62" r="14" fill="#df6460"/><circle cx="98" cy="62" r="14" fill="#79bc72"/><circle cx="136" cy="62" r="14" fill="#d8b45b"/>
   <circle cx="22" cy="124" r="14" fill="#6ea8dd"/><circle cx="60" cy="124" r="14" fill="#df6460"/><circle cx="98" cy="124" r="14" fill="#79bc72"/><circle cx="136" cy="124" r="14" fill="#d8b45b"/>
  </g>
 </g>
 <g transform="translate(760 108)">
  <rect x="0" y="0" width="154" height="278" rx="12" fill="#7a5132" stroke="#553821" stroke-width="8"/>
  <g transform="translate(18 18)">
   <rect width="118" height="24" rx="5" fill="#5f4229"/><rect y="96" width="118" height="24" rx="5" fill="#5f4229"/><rect y="192" width="118" height="24" rx="5" fill="#5f4229"/>
   <rect x="10" y="30" width="18" height="54" rx="4" fill="#7690c8"/><rect x="36" y="30" width="18" height="54" rx="4" fill="#d77a5b"/><rect x="62" y="30" width="18" height="54" rx="4" fill="#8db56b"/><rect x="88" y="30" width="18" height="54" rx="4" fill="#c39a56"/>
   <rect x="10" y="126" width="18" height="54" rx="4" fill="#7690c8"/><rect x="36" y="126" width="18" height="54" rx="4" fill="#d77a5b"/><rect x="62" y="126" width="18" height="54" rx="4" fill="#8db56b"/><rect x="88" y="126" width="18" height="54" rx="4" fill="#c39a56"/>
  </g>
 </g>
 <rect x="388" y="334" width="252" height="152" rx="12" fill="#8a5a37" stroke="#5d3e29" stroke-width="8"/>
 <rect x="454" y="304" width="68" height="42" rx="9" fill="#5b647d" stroke="#d5e0f2" stroke-width="5"/>
 <rect x="152" y="502" width="102" height="138" rx="10" fill="#a57143" stroke="#714a2f" stroke-width="8"/>
 <rect x="268" y="502" width="102" height="138" rx="10" fill="#a57143" stroke="#714a2f" stroke-width="8"/>
 <rect x="458" y="566" width="142" height="76" rx="12" fill="#bd6348" stroke="#d8c58a" stroke-width="8"/>
 <circle cx="777" cy="500" r="27" fill="#907053" stroke="#68482f" stroke-width="7"/><circle cx="840" cy="500" r="27" fill="#907053" stroke="#68482f" stroke-width="7"/>
 <g transform="translate(928 334)"><circle r="28" fill="#5ea661"/><rect x="-5" y="22" width="10" height="18" rx="3" fill="#7a5a3a"/></g>
 <g transform="translate(116 448)"><rect x="0" y="0" width="52" height="38" rx="6" fill="#84613c" stroke="#63432b" stroke-width="5"/><rect x="68" y="0" width="52" height="38" rx="6" fill="#84613c" stroke="#63432b" stroke-width="5"/></g>
</g>`,`meet`)}
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
    {t:'話す', fn:()=>{talkIndex=(talkIndex+1)%5;renderAll()}},
    {t:'家へ', fn:()=>{homeMode='house';renderAll()}},
    {t:'相棒', fn:showPartnerModal, c:'primary'},
    {t:'冒険', fn:()=>setView('adventure'), c:'primary'},
    {t:'お店', fn:()=>setView('store')},
    {t:'物語', fn:showStory}
  ];
}
function header(s){
  const st=F.stageInfo(s.development.stage);
  $('headStats').innerHTML=`<span class="pill">🪙 ${Number(s.coins||0).toLocaleString('ja-JP')}</span><span class="pill">📅 ${s.day}日目</span><span class="pill">🏘️ ${esc(st.name)}</span>`;
  const title={home:'拠点',adventure:'冒険',store:'お店'};
  const sub={home:homeMode==='house'?'家の中':'町の全体イメージ',adventure:F.run?.active?'ダンジョン探索中':'はじまりの森',store:'店の中（販売中）'};
  $('viewTitle').textContent=title[currentView]||'Frenda Frontier';
  $('viewSubtitle').textContent=sub[currentView]||'';
  $('viewMeta').textContent=`現在地：${esc(st.caption)}`;
}
function homeScene(s){const st=F.stageInfo(s.development.stage), p=rec(s.partnerId);
  if(homeMode==='house'){
    return `<div class="houseScene gameScene">${houseArt()}<div class="sceneHud"><div class="miniTags"><span class="tag">家の中</span>${p?`<span class="tag">相棒：${esc(p.name_ja)}</span>`:''}</div></div><div class="spriteLayer"><div style="position:absolute;left:34%;top:80%;">${human('blue')}</div>${p?`<div class="partnerSprite" style="left:45%;top:75%;"><img src="${esc(image(p))}" alt=""></div>`:''}</div><div class="dialogBox"><h3>家の中</h3><p>${esc(homeDialog(s))}</p></div><div class="commandBox"><div class="commandTitle">▶ コマンド</div><div class="cmdList" id="cmdHome"></div></div></div>`;
  }
  return `<div class="townScene gameScene">${townArt()}<div class="sceneHud"><div class="miniTags"><span class="tag">${esc(st.name)}</span><span class="tag">発展 ${s.development.points}pt</span>${p?`<span class="tag">相棒：${esc(p.name_ja)}</span>`:''}</div></div><div class="spriteLayer"><div style="position:absolute;left:28%;top:74%;">${human('blue')}</div><div style="position:absolute;left:39%;top:84%;">${human('orange')}</div><div style="position:absolute;left:61%;top:74%;">${human('purple')}</div><div style="position:absolute;left:84%;top:86%;">${human('green')}</div><div style="position:absolute;left:50%;top:90%;">${human('blue')}</div>${p?`<div class="partnerSprite" style="left:55%;top:90%;"><img src="${esc(image(p))}" alt=""></div>`:''}</div><div class="dialogBox"><h3>町の人との会話</h3><p>${esc(homeDialog(s))}</p></div><div class="commandBox"><div class="commandTitle">▶ コマンド</div><div class="cmdList" id="cmdHome"></div></div></div>`;
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
function storeScene(s){return `<div class="storeScene gameScene">${storeArt()}<div class="sceneHud"><div class="miniTags"><span class="tag">棚 ${s.shelves.filter(Boolean).length}/3</span><span class="tag">売上 ${Number(s.sales.revenue||0)}G</span><span class="tag">来店 ${s.sales.customers}人</span></div></div><div class="spriteLayer"><div style="position:absolute;left:53%;top:67%;">${human('orange')}</div><div style="position:absolute;left:79%;top:84%;">${human('blue')}</div><div style="position:absolute;left:18%;top:88%;">${human('green')}</div></div><div class="dialogBox"><h3>店の中（販売中）</h3><p id="storeDialogText">${esc(s.shelves.some(Boolean)?'店員\n「いらっしゃいませ！ どの商品を見ていきますか？」':'店員\n「まずは倉庫から商品を並べてみましょう。」')}</p></div><div class="commandBox"><div class="commandTitle">▶ コマンド</div><div class="cmdList" id="cmdStore"></div></div></div>`}
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
