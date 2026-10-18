/* Frenda Frontier Ver0.11 / scene redesign closer to reference */
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
    blue:{hat:'#477ed0',hat2:'#274d87',body:'#4f87d8',trim:'#e7eefc',line:'#2c4f81'},
    green:{hat:'#6aa05a',hat2:'#446c3d',body:'#7fb46b',trim:'#eaf4e0',line:'#456941'},
    purple:{hat:'#9370c4',hat2:'#64498b',body:'#ac8bd6',trim:'#f1ebfb',line:'#67498c'},
    orange:{hat:'#d38948',hat2:'#93572e',body:'#e1a06b',trim:'#fff0de',line:'#925a35'}
  }[color]||{hat:'#477ed0',hat2:'#274d87',body:'#4f87d8',trim:'#e7eefc',line:'#2c4f81'};
  return `<div class="humanWrap ${size==='kid'?'kid':''}"><svg viewBox="0 0 68 82" aria-hidden="true">
    <ellipse cx="34" cy="77" rx="14" ry="4.8" fill="#000" opacity=".18"/>
    <path d="M22 20 Q34 8 46 20 L46 24 L22 24 Z" fill="${pal.hat}" stroke="${pal.hat2}" stroke-width="2.2"/>
    <rect x="21" y="23" width="26" height="4.2" rx="2.1" fill="${pal.hat2}"/>
    <rect x="25" y="24" width="18" height="16" rx="8" fill="#f1cfaf" stroke="#9a6948" stroke-width="2"/>
    <circle cx="30.5" cy="32" r="1.5" fill="#4b3528"/><circle cx="37.5" cy="32" r="1.5" fill="#4b3528"/>
    <path d="M29 36 Q34 39 39 36" fill="none" stroke="#9a6948" stroke-width="1.7" stroke-linecap="round"/>
    <rect x="21" y="40" width="26" height="22" rx="6" fill="${pal.body}" stroke="${pal.line}" stroke-width="2.4"/>
    <rect x="23.5" y="43" width="21" height="8" rx="4" fill="${pal.trim}" opacity=".95"/>
    <rect x="16.5" y="45" width="7.2" height="14.5" rx="3" fill="#f3d2b3" stroke="#9a6948" stroke-width="1.3"/>
    <rect x="44.3" y="45" width="7.2" height="14.5" rx="3" fill="#f3d2b3" stroke="#9a6948" stroke-width="1.3"/>
    <rect x="23.5" y="61" width="8.6" height="13" rx="2.6" fill="#5a69bb"/>
    <rect x="35.9" y="61" width="8.6" height="13" rx="2.6" fill="#5a69bb"/>
    <rect x="22.8" y="73" width="9.5" height="4.3" rx="2.1" fill="#6a503f"/>
    <rect x="35.8" y="73" width="9.5" height="4.3" rx="2.1" fill="#6a503f"/>
  </svg></div>`;
}
function svgWrap(viewBox, inner, mode='meet'){return `<svg class="sceneArt" viewBox="${viewBox}" preserveAspectRatio="xMidYMid ${mode}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`}
function townArt(){return svgWrap('0 0 1000 760',`
<defs>
 <linearGradient id="skyTown2" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#8fd2ef"/><stop offset="1" stop-color="#dff4fb"/></linearGradient>
 <linearGradient id="grassTown2" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#9dd176"/><stop offset="1" stop-color="#6aa24c"/></linearGradient>
 <pattern id="roofRed" width="18" height="12" patternUnits="userSpaceOnUse"><rect width="18" height="12" fill="#c46049"/><path d="M0 12 H18 M0 6 H18" stroke="#9a4b37" stroke-width="1.5"/><path d="M9 0 V12" stroke="#b55c46" stroke-width="1.2"/></pattern>
 <pattern id="roofBlue" width="18" height="12" patternUnits="userSpaceOnUse"><rect width="18" height="12" fill="#4c7ec8"/><path d="M0 12 H18 M0 6 H18" stroke="#325ea0" stroke-width="1.5"/><path d="M9 0 V12" stroke="#5b8fd6" stroke-width="1.2"/></pattern>
 <pattern id="cobble2" width="28" height="28" patternUnits="userSpaceOnUse"><rect width="28" height="28" fill="#d3cbba"/><path d="M1 8 Q7 2 14 8 T27 8 M1 20 Q7 14 14 20 T27 20" fill="none" stroke="#b7ad98" stroke-width="2"/><path d="M7 0 V28 M21 0 V28" stroke="#c4b9a4" stroke-width="1.3" opacity=".55"/></pattern>
 <filter id="tsh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000" flood-opacity=".18"/></filter>
</defs>
<rect width="1000" height="760" fill="url(#skyTown2)"/>
<rect y="220" width="1000" height="540" fill="url(#grassTown2)"/>
<g filter="url(#tsh)">
 <path d="M120 520 L500 250 L880 520 L500 700 Z" fill="url(#cobble2)" stroke="#b5aa95" stroke-width="8"/>
 <path d="M500 250 V700" stroke="#c2b59f" stroke-width="10" opacity=".7"/>
 <path d="M120 520 H880" stroke="#c2b59f" stroke-width="10" opacity=".7"/>
 <path d="M500 250 L262 394" stroke="#c2b59f" stroke-width="8" opacity=".7"/>
 <path d="M500 250 L738 394" stroke="#c2b59f" stroke-width="8" opacity=".7"/>
 <g transform="translate(500 520)">
  <circle r="94" fill="#d8d1c0" stroke="#8f9b95" stroke-width="8"/>
  <circle r="60" fill="#75c7ed" stroke="#4f8ca7" stroke-width="8"/>
  <circle cy="-3" r="21" fill="#e1ddd1" stroke="#7f8a84" stroke-width="5"/>
  <path d="M0 -26 V-58" stroke="#75c7ed" stroke-width="12" stroke-linecap="round"/>
  <path d="M-18 -47 Q0 -70 18 -47" fill="none" stroke="#d7f8ff" stroke-width="7" stroke-linecap="round"/>
 </g>
 <g transform="translate(85 104)">
  <rect x="0" y="74" width="226" height="154" rx="18" fill="#eedfbb" stroke="#7b5639" stroke-width="8"/>
  <polygon points="18,74 113,4 208,74" fill="url(#roofRed)" stroke="#7b5639" stroke-width="8"/>
  <rect x="34" y="126" width="32" height="50" rx="6" fill="#92613d" stroke="#65442b" stroke-width="5"/>
  <rect x="172" y="126" width="32" height="50" rx="6" fill="#92613d" stroke="#65442b" stroke-width="5"/>
  <rect x="94" y="152" width="52" height="70" rx="10" fill="#8d5f3e" stroke="#65442b" stroke-width="6"/>
  <rect x="46" y="152" width="144" height="52" rx="14" fill="#f7edd2" stroke="#8a6b3a" stroke-width="5"/>
  <text x="118" y="187" font-size="35" font-weight="900" text-anchor="middle" fill="#2f3e31">SHOP</text>
  <rect x="12" y="120" width="86" height="22" rx="6" fill="#f4efe1" stroke="#8c6c43" stroke-width="4"/>
  <rect x="20" y="123" width="70" height="16" fill="#f1ece0"/>
  <path d="M20 123 H90" stroke="#d26a57" stroke-width="6" stroke-dasharray="11 7"/>
 </g>
 <g transform="translate(690 104)">
  <rect x="0" y="74" width="220" height="154" rx="18" fill="#dfdccf" stroke="#7b5639" stroke-width="8"/>
  <polygon points="18,74 110,-2 202,74" fill="url(#roofBlue)" stroke="#7b5639" stroke-width="8"/>
  <rect x="32" y="124" width="31" height="49" rx="6" fill="#edf3ff" stroke="#7a5c40" stroke-width="5"/>
  <rect x="157" y="124" width="31" height="49" rx="6" fill="#edf3ff" stroke="#7a5c40" stroke-width="5"/>
  <rect x="86" y="150" width="48" height="72" rx="10" fill="#8d5f3e" stroke="#65442b" stroke-width="6"/>
  <rect x="72" y="160" width="76" height="42" rx="12" fill="#f7edd2" stroke="#8a6b3a" stroke-width="5"/>
  <text x="110" y="189" font-size="34" font-weight="900" text-anchor="middle" fill="#2f3e31">家</text>
 </g>
 <g transform="translate(62 576)">
  <rect x="0" y="34" width="188" height="96" rx="14" fill="#dbc7a8" stroke="#7a5539" stroke-width="7"/>
  <polygon points="14,34 94,-12 174,34" fill="#9c6a3d" stroke="#7a5539" stroke-width="7"/>
  <rect x="40" y="66" width="108" height="30" rx="10" fill="#f4ead0" stroke="#8c6b37" stroke-width="4"/>
  <text x="94" y="88" font-size="25" font-weight="900" text-anchor="middle" fill="#2f3e31">鍛冶屋</text>
 </g>
 <g transform="translate(756 576)">
  <rect x="0" y="34" width="170" height="96" rx="14" fill="#d8c39f" stroke="#7a5539" stroke-width="7"/>
  <polygon points="14,34 85,-12 156,34" fill="#ba8d49" stroke="#7a5539" stroke-width="7"/>
  <rect x="48" y="66" width="74" height="30" rx="10" fill="#f4ead0" stroke="#8c6b37" stroke-width="4"/>
  <text x="85" y="88" font-size="25" font-weight="900" text-anchor="middle" fill="#2f3e31">倉庫</text>
 </g>
</g>
<g>
 <g transform="translate(44 322)"><circle r="42" fill="#6ea754"/><circle cx="-12" cy="-12" r="17" fill="#98ca7a"/><rect x="-8" y="30" width="16" height="28" rx="5" fill="#7a5a3a"/></g>
 <g transform="translate(956 322)"><circle r="42" fill="#6ea754"/><circle cx="-12" cy="-12" r="17" fill="#98ca7a"/><rect x="-8" y="30" width="16" height="28" rx="5" fill="#7a5a3a"/></g>
 <g transform="translate(270 306)"><circle r="28" fill="#7cb163"/><rect x="-6" y="22" width="12" height="20" rx="4" fill="#7a5a3a"/></g>
 <g transform="translate(730 306)"><circle r="28" fill="#7cb163"/><rect x="-6" y="22" width="12" height="20" rx="4" fill="#7a5a3a"/></g>
 <g transform="translate(330 302)"><circle r="9" fill="#f7b5d4"/><circle cx="16" r="9" fill="#ffe286"/><circle cx="32" r="9" fill="#c6a9ff"/><circle cx="11" cy="15" r="9" fill="#96e58c"/><circle cx="27" cy="15" r="9" fill="#ffc88d"/></g>
 <g transform="translate(705 302)"><circle r="9" fill="#f7b5d4"/><circle cx="16" r="9" fill="#ffe286"/><circle cx="32" r="9" fill="#c6a9ff"/><circle cx="11" cy="15" r="9" fill="#96e58c"/><circle cx="27" cy="15" r="9" fill="#ffc88d"/></g>
 <g transform="translate(305 628)"><rect x="-34" y="-20" width="68" height="34" rx="8" fill="#8c633e" stroke="#63442d" stroke-width="5"/><circle cx="-17" cy="-25" r="12" fill="#e28b55"/><circle cx="7" cy="-27" r="13" fill="#e8c65f"/><circle cx="25" cy="-23" r="11" fill="#7ebc68"/></g>
 <g transform="translate(684 622)"><rect x="-42" y="-22" width="84" height="38" rx="8" fill="#9b7047" stroke="#67472e" stroke-width="5"/><path d="M-30 -26 Q-16 -48 -2 -26 M4 -26 Q18 -48 32 -26" fill="none" stroke="#e8d38a" stroke-width="9" stroke-linecap="round"/></g>
</g>`,`slice`)}
function houseArt(){return svgWrap('0 0 1000 760',`
<defs>
 <linearGradient id="wallWarm2" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ddb07a"/><stop offset="1" stop-color="#c68b53"/></linearGradient>
 <pattern id="planks2" width="48" height="48" patternUnits="userSpaceOnUse"><rect width="48" height="48" fill="url(#wallWarm2)"/><rect width="48" height="24" fill="#e2b883" opacity=".36"/><path d="M46 0 V48" stroke="#9a663d" stroke-width="3" opacity=".58"/></pattern>
 <filter id="hdrop2" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000" flood-opacity=".18"/></filter>
</defs>
<rect width="1000" height="760" fill="#d8e7d1"/>
<rect y="208" width="1000" height="552" fill="url(#planks2)"/>
<rect y="198" width="1000" height="18" fill="#8b603a"/>
<g filter="url(#hdrop2)">
 <rect x="88" y="304" width="236" height="272" rx="20" fill="#f3f3f5" stroke="#6a4b32" stroke-width="9"/>
 <rect x="88" y="304" width="236" height="88" rx="14" fill="#7395d4"/>
 <rect x="354" y="332" width="344" height="268" rx="18" fill="#90a96c" stroke="#d7c47c" stroke-width="10"/>
 <ellipse cx="470" cy="512" rx="54" ry="38" fill="#9a714e" stroke="#6d4a31" stroke-width="8"/>
 <rect x="640" y="318" width="126" height="132" rx="12" fill="#dfe9f7" stroke="#7a5c40" stroke-width="8"/>
 <path d="M703 318 V450 M640 384 H766" stroke="#a29b8c" stroke-width="6"/>
 <rect x="804" y="308" width="92" height="152" rx="12" fill="#7b5538" stroke="#573824" stroke-width="8"/>
 <rect x="828" y="334" width="44" height="102" fill="#88afe0"/>
 <rect x="88" y="610" width="158" height="100" rx="12" fill="#8a5c39" stroke="#5f3f2a" stroke-width="8"/>
 <rect x="104" y="628" width="126" height="18" rx="4" fill="#7aa5e2"/><rect x="104" y="654" width="126" height="18" rx="4" fill="#cfdb78"/><rect x="104" y="680" width="126" height="10" rx="4" fill="#e8d89c"/>
 <rect x="268" y="626" width="126" height="62" rx="10" fill="#8f613f" stroke="#6b482f" stroke-width="7"/>
 <rect x="280" y="638" width="102" height="38" rx="6" fill="#a37149"/>
 <rect x="772" y="512" width="164" height="112" rx="12" fill="#d7cfbf" stroke="#7b6a56" stroke-width="7"/>
 <rect x="786" y="526" width="58" height="68" rx="7" fill="#bfccd2" stroke="#70808b" stroke-width="4"/>
 <circle cx="895" cy="544" r="13" fill="#7b6a56"/><rect x="852" y="568" width="56" height="18" rx="6" fill="#7b6a56"/>
 <g transform="translate(522 644)" opacity=".95"><ellipse rx="76" ry="46" fill="#d9c78d" stroke="#a98955" stroke-width="6"/><ellipse rx="52" ry="28" fill="#7fa66f"/><text y="8" text-anchor="middle" font-size="21" font-weight="900" fill="#f7f1dc">相棒の場所</text></g>
 <g transform="translate(656 626)"><rect width="82" height="82" rx="10" fill="#8b603d" stroke="#624129" stroke-width="6"/><rect x="10" y="12" width="13" height="54" fill="#6d8fc7"/><rect x="29" y="8" width="13" height="58" fill="#c77765"/><rect x="48" y="16" width="13" height="50" fill="#86ad68"/><rect x="67" y="10" width="9" height="56" fill="#d1b05c"/></g>
 <g transform="translate(132 724)"><circle r="20" fill="#5da45b"/><rect x="-5" y="12" width="10" height="14" rx="3" fill="#7a5a3a"/></g>
</g>`,`slice`)}
function storeArt(){return svgWrap('0 0 1000 760',`
<defs>
 <linearGradient id="storeWarm2" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#d9a66f"/><stop offset="1" stop-color="#c2854d"/></linearGradient>
 <pattern id="storeFloor2" width="42" height="42" patternUnits="userSpaceOnUse"><rect width="42" height="42" fill="url(#storeWarm2)"/><rect y="0" width="42" height="21" fill="#dfaf77" opacity=".35"/><path d="M40 0 V42" stroke="#9c683e" stroke-width="3" opacity=".55"/></pattern>
 <filter id="sdrop2" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="#000" flood-opacity=".18"/></filter>
</defs>
<rect width="1000" height="760" fill="#dceacf"/>
<rect y="208" width="1000" height="552" fill="url(#storeFloor2)"/>
<rect y="198" width="1000" height="18" fill="#94643c"/>
<g filter="url(#sdrop2)">
 <rect x="84" y="108" width="162" height="292" rx="12" fill="#7a5132" stroke="#553821" stroke-width="8"/>
 <g transform="translate(102 126)">
  <rect width="126" height="24" rx="5" fill="#5f4229"/><rect y="98" width="126" height="24" rx="5" fill="#5f4229"/><rect y="196" width="126" height="24" rx="5" fill="#5f4229"/>
  <rect x="10" y="32" width="18" height="56" rx="4" fill="#7690c8"/><rect x="36" y="32" width="18" height="56" rx="4" fill="#d77a5b"/><rect x="62" y="32" width="18" height="56" rx="4" fill="#8db56b"/><rect x="88" y="32" width="18" height="56" rx="4" fill="#c39a56"/>
  <rect x="10" y="130" width="18" height="56" rx="4" fill="#7690c8"/><rect x="36" y="130" width="18" height="56" rx="4" fill="#d77a5b"/><rect x="62" y="130" width="18" height="56" rx="4" fill="#8db56b"/><rect x="88" y="130" width="18" height="56" rx="4" fill="#c39a56"/>
 </g>
 <rect x="402" y="90" width="196" height="120" rx="12" fill="#7a5132" stroke="#553821" stroke-width="8"/>
 <g transform="translate(424 110)"><rect width="152" height="24" rx="5" fill="#5f4229"/><circle cx="28" cy="68" r="15" fill="#6ea8dd"/><circle cx="64" cy="68" r="15" fill="#df6460"/><circle cx="100" cy="68" r="15" fill="#79bc72"/><circle cx="136" cy="68" r="15" fill="#d8b45b"/></g>
 <rect x="754" y="108" width="162" height="292" rx="12" fill="#7a5132" stroke="#553821" stroke-width="8"/>
 <g transform="translate(772 126)">
  <rect width="126" height="24" rx="5" fill="#5f4229"/><rect y="98" width="126" height="24" rx="5" fill="#5f4229"/><rect y="196" width="126" height="24" rx="5" fill="#5f4229"/>
  <rect x="10" y="32" width="18" height="56" rx="4" fill="#7690c8"/><rect x="36" y="32" width="18" height="56" rx="4" fill="#d77a5b"/><rect x="62" y="32" width="18" height="56" rx="4" fill="#8db56b"/><rect x="88" y="32" width="18" height="56" rx="4" fill="#c39a56"/>
  <rect x="10" y="130" width="18" height="56" rx="4" fill="#7690c8"/><rect x="36" y="130" width="18" height="56" rx="4" fill="#d77a5b"/><rect x="62" y="130" width="18" height="56" rx="4" fill="#8db56b"/><rect x="88" y="130" width="18" height="56" rx="4" fill="#c39a56"/>
 </g>
 <rect x="356" y="338" width="288" height="154" rx="14" fill="#8a5a37" stroke="#5d3e29" stroke-width="8"/>
 <rect x="450" y="300" width="76" height="44" rx="9" fill="#5b647d" stroke="#d5e0f2" stroke-width="5"/>
 <rect x="140" y="526" width="110" height="146" rx="10" fill="#a57143" stroke="#714a2f" stroke-width="8"/>
 <rect x="264" y="526" width="110" height="146" rx="10" fill="#a57143" stroke="#714a2f" stroke-width="8"/>
 <rect x="440" y="598" width="158" height="84" rx="14" fill="#ba6348" stroke="#d8c58a" stroke-width="8"/>
 <circle cx="770" cy="522" r="30" fill="#907053" stroke="#68482f" stroke-width="7"/><circle cx="838" cy="522" r="30" fill="#907053" stroke="#68482f" stroke-width="7"/>
 <g transform="translate(924 350)"><circle r="30" fill="#5ea661"/><rect x="-5" y="24" width="10" height="18" rx="3" fill="#7a5a3a"/></g>
 <g transform="translate(120 454)"><rect x="0" y="0" width="56" height="40" rx="6" fill="#84613c" stroke="#63432b" stroke-width="5"/><rect x="74" y="0" width="56" height="40" rx="6" fill="#84613c" stroke="#63432b" stroke-width="5"/></g>
 <path d="M508 690 C610 660 710 682 832 650" fill="none" stroke="#f2d6a5" stroke-width="14" stroke-linecap="round" opacity=".48"/>
</g>`,`slice`)}
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
    return `<div class="houseScene gameScene">${houseArt()}<div class="sceneHud"><div class="miniTags"><span class="tag">家の中</span>${p?`<span class="tag">相棒：${esc(p.name_ja)}</span>`:''}</div></div><div class="spriteLayer"><div style="position:absolute;left:38%;top:84%;">${human('blue')}</div>${p?`<div class="partnerSprite" style="left:48%;top:76%;"><img src="${esc(image(p))}" alt=""></div>`:''}</div><div class="dialogBox"><h3>家の中</h3><p>${esc(homeDialog(s))}</p></div><div class="commandBox"><div class="commandTitle">▶ コマンド</div><div class="cmdList" id="cmdHome"></div></div></div>`;
  }
  return `<div class="townScene gameScene">${townArt()}<div class="sceneHud"><div class="miniTags"><span class="tag">${esc(st.name)}</span><span class="tag">発展 ${s.development.points}pt</span>${p?`<span class="tag">相棒：${esc(p.name_ja)}</span>`:''}</div></div><div class="spriteLayer"><div style="position:absolute;left:28%;top:80%;">${human('blue')}</div><div style="position:absolute;left:40%;top:88%;">${human('orange')}</div><div style="position:absolute;left:62%;top:80%;">${human('purple')}</div><div style="position:absolute;left:73%;top:88%;">${human('green')}</div><div style="position:absolute;left:50%;top:92%;">${human('blue')}</div>${p?`<div class="partnerSprite" style="left:55%;top:87%;"><img src="${esc(image(p))}" alt=""></div>`:''}</div><div class="dialogBox"><h3>町の人との会話</h3><p>${esc(homeDialog(s))}</p></div><div class="commandBox"><div class="commandTitle">▶ コマンド</div><div class="cmdList" id="cmdHome"></div></div></div>`;
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
function storeScene(s){return `<div class="storeScene gameScene">${storeArt()}<div class="sceneHud"><div class="miniTags"><span class="tag">棚 ${s.shelves.filter(Boolean).length}/3</span><span class="tag">売上 ${Number(s.sales.revenue||0)}G</span><span class="tag">来店 ${s.sales.customers}人</span></div></div><div class="spriteLayer"><div style="position:absolute;left:51%;top:67%;">${human('orange')}</div><div style="position:absolute;left:76%;top:85%;">${human('blue')}</div><div style="position:absolute;left:22%;top:85%;">${human('green')}</div><div style="position:absolute;left:34%;top:82%;">${human('purple','kid')}</div><div style="position:absolute;left:66%;top:82%;">${human('green','kid')}</div></div><div class="dialogBox"><h3>店の中（販売中）</h3><p id="storeDialogText">${esc(s.shelves.some(Boolean)?'店員\n「いらっしゃいませ！ どの商品を見ていきますか？」':'店員\n「まずは倉庫から商品を並べてみましょう。」')}</p></div><div class="commandBox"><div class="commandTitle">▶ コマンド</div><div class="cmdList" id="cmdStore"></div></div></div>`}
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
