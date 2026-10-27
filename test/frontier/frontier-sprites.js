/* Frenda Frontier Ver1.79 / Pokemon sprite resolver / Updated: 2026-10-28 */
(()=>{"use strict";
const F=window.FRENDA_FRONTIER=window.FRENDA_FRONTIER||{};
const CACHE_KEY="frenda:frontier:sprite-dex:v2";
const INDEX_URLS=[
 "https://towakey.github.io/pokedex/api/v1/pokedex/index.json",
 "https://raw.githubusercontent.com/Purukitto/pokemon-data.json/master/pokedex.json"
];
const POKE_SPRITE_BASE="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";
const SHOWDOWN_BASE="https://play.pokemonshowdown.com/sprites/";
const TYPE_ICON={ノーマル:'◉',ほのお:'🔥',みず:'💧',でんき:'⚡',くさ:'🍃',こおり:'❄️',かくとう:'✊',どく:'☠️',じめん:'⛰️',ひこう:'🪽',エスパー:'✦',むし:'🐞',いわ:'◆',ゴースト:'👻',ドラゴン:'◇',あく:'☾',はがね:'⬡',フェアリー:'✿'};
// 外部画像が全て読めない場合にも表示できる、通信不要の代替ドット絵。
// 種族名・IDをシードにするため、同じ種は毎回同じ姿になります。
const FALLBACK_PALETTE=Object.freeze({
 'ノーマル':['#c9a873','#8a6540','#fff0c4'],'ほのお':['#ed7443','#a94132','#ffd15a'],'みず':['#62b9d7','#347dba','#c4f1ff'],
 'でんき':['#f0cf47','#b88b22','#fff5a2'],'くさ':['#75b95b','#397c45','#d9f29a'],'こおり':['#a9d8e8','#5989a8','#f5ffff'],
 'かくとう':['#d78662','#914c42','#ffe0ad'],'どく':['#a77acb','#67428d','#e9b7f7'],'じめん':['#c49559','#86603b','#f0d28d'],
 'ひこう':['#9bc8e8','#5d82b2','#e6f8ff'],'エスパー':['#d77ab2','#914d86','#ffd5ec'],'むし':['#9ebd4d','#607d31','#e8f5a2'],
 'いわ':['#a59b83','#686253','#e5d7b4'],'ゴースト':['#9a8bd0','#5c4c98','#d9c8ff'],'ドラゴン':['#8c9dc8','#4c5d91','#e0ebff'],
 'あく':['#827986','#49414f','#d7c9d9'],'はがね':['#aebcc6','#687b88','#eaf4fa'],'フェアリー':['#e7a4c6','#ad668f','#ffe0f1']
});
const FALLBACK_CACHE=new Map();
function fallbackHash(value){let h=2166136261;for(const c of String(value||'?')){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function fallbackCreatureSvg(sp,facing='down'){
 const key=`${sp?.id||''}|${sp?.name||''}|${sp?.type1||''}|${facing}`;
 if(FALLBACK_CACHE.has(key))return FALLBACK_CACHE.get(key);
 const h=fallbackHash(key),palette=FALLBACK_PALETTE[sp?.type1]||['#8eb69a','#527c65','#e2f3d9'],[body,shade,accent]=palette;
 const shape=h%3,side=facing==='left'||facing==='right',back=facing==='up';
 const bodyPath=shape===0?'M22 15h19v4h7v7h4v14h-5v6H20v-4h-5V27h5v-8h2z':shape===1?'M24 13h16v4h7v6h5v16h-5v7h-8v4H23v-4h-7v-7h-4V25h5v-6h7z':'M19 19h27v4h6v7h4v11h-6v7H19v-4h-6V27h6z';
 const ears=h%4===0?'<path d="M22 20 17 8h8l5 8M39 16l5-8h7l-6 14" fill="'+shade+'" stroke="#28352e" stroke-width="2"/>':h%4===1?'<path d="M23 18 20 7l9 8M39 16 45 7l4 12" fill="'+accent+'" stroke="#28352e" stroke-width="2"/>':h%4===2?'<path d="M29 16 27 7l5 5 5-6-1 11" fill="'+shade+'" stroke="#28352e" stroke-width="2"/>':'<path d="M27 16 22 8l9 4 7-6-2 11" fill="'+accent+'" stroke="#28352e" stroke-width="2"/>';
 const tail=sp?.type1==='ほのお'?'<path d="M45 39h7v-5h5v-7h5v11h-5v7h-7v5h-6z" fill="#f05a39" stroke="#28352e" stroke-width="2"/><path d="M55 34h4v6h-4z" fill="#ffd15a"/>':sp?.type1==='みず'?'<path d="M45 39h8v-5h5v-5h5v12h-6v7h-8v4h-5z" fill="'+accent+'" stroke="#28352e" stroke-width="2"/>':sp?.type1==='くさ'?'<path d="M43 39h8v-5h6v-5h7v7h-6v7h-8v7h-7z" fill="'+accent+'" stroke="#28352e" stroke-width="2"/>':sp?.type1==='でんき'?'<path d="M45 38h8l-3 7h7l-11 11 3-8h-7z" fill="#f5d548" stroke="#28352e" stroke-width="2"/>':sp?.type1==='ひこう'?'<path d="M20 29 7 20h13l7 7M45 29l12-9H46l-7 7" fill="'+accent+'" stroke="#28352e" stroke-width="2"/>':'<path d="M45 39h7v-4h5v7h-6v6h-6z" fill="'+shade+'" stroke="#28352e" stroke-width="2"/>';
 const typeDetail=sp?.type1==='むし'?'<path d="M29 17V9m0 4-5-5m5 5 5-5" fill="none" stroke="#28352e" stroke-width="2"/><path d="M21 28h7v8h-7zm15 0h7v8h-7z" fill="#ffffff88" stroke="#28352e" stroke-width="1.5"/>':sp?.type1==='はがね'||sp?.type1==='いわ'?'<path d="M23 29h7v7h-7zm13 7h8v7h-8z" fill="'+accent+'" stroke="#28352e" stroke-width="1.5"/>':sp?.type1==='ゴースト'?'<path d="M20 44h7v5h-7zm18 0h7v5h-7z" fill="'+accent+'"/>':`<path d="M25 29h6v5h-6zm12 5h6v5h-6z" fill="${accent}" opacity=".9"/>`;
 const face=back?'<path d="M25 25h14v11H25z" fill="'+shade+'" stroke="#28352e" stroke-width="1.5"/><path d="M29 28h6v5h-6z" fill="'+accent+'"/>':side?'<rect x="35" y="25" width="5" height="6" fill="#fff" stroke="#28352e" stroke-width="1.5"/><rect x="37" y="27" width="2" height="3" fill="#1d2822"/>':'<rect x="24" y="25" width="5" height="6" fill="#fff" stroke="#28352e" stroke-width="1.5"/><rect x="26" y="27" width="2" height="3" fill="#1d2822"/><rect x="38" y="25" width="5" height="6" fill="#fff" stroke="#28352e" stroke-width="1.5"/><rect x="40" y="27" width="2" height="3" fill="#1d2822"/>';
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" shape-rendering="crispEdges" aria-hidden="true"><ellipse cx="32" cy="56" rx="17" ry="3" fill="#102018" opacity=".25"/>${tail}${ears}<path d="${bodyPath}" fill="${body}" stroke="#28352e" stroke-width="3" stroke-linejoin="miter"/><path d="M23 46h7v7h-7zm15 0h7v7h-7z" fill="${shade}" stroke="#28352e" stroke-width="2"/><path d="M18 32h-5v8h8m27-8h5v8h-8" fill="${body}" stroke="#28352e" stroke-width="2"/>${typeDetail}${face}<path d="M30 37h7v2h-7z" fill="#523c35"/></svg>`;
 FALLBACK_CACHE.set(key,svg);return svg;
}
// 通信前でも実機確認で記号へ戻りにくいよう、代表種＋序盤で出やすい種をローカル保持。
const SEED=Object.freeze({
 'フシギダネ':'0001','フシギソウ':'0002','フシギバナ':'0003','ヒトカゲ':'0004','リザード':'0005','リザードン':'0006','ゼニガメ':'0007','カメール':'0008','カメックス':'0009',
 'キャタピー':'0010','トランセル':'0011','バタフリー':'0012','ビードル':'0013','コクーン':'0014','スピアー':'0015','ポッポ':'0016','コラッタ':'0019','オニスズメ':'0021','ピカチュウ':'0025','ライチュウ':'0026',
 'プリン':'0039','ズバット':'0041','ナゾノクサ':'0043','クサイハナ':'0044','ラフレシア':'0045','パラス':'0046','パラセクト':'0047','コンパン':'0048','モルフォン':'0049','ディグダ':'0050','ニャース':'0052','コダック':'0054','マンキー':'0056','ガーディ':'0058',
 'ニョロモ':'0060','ケーシィ':'0063','ワンリキー':'0066','マダツボミ':'0069','メノクラゲ':'0072','イシツブテ':'0074','ポニータ':'0077','ヤドン':'0079','コイル':'0081','カモネギ':'0083','ゴース':'0092','イワーク':'0095','タマタマ':'0102','カラカラ':'0104','ドガース':'0109','サイホーン':'0111','ラッキー':'0113','モンジャラ':'0114','ストライク':'0123','カイロス':'0127','イーブイ':'0133',
 'ペリッパー':'0279','ポカブ':'0498','チャオブー':'0499','エンブオー':'0500','モンメン':'0546','エルフーン':'0547',
 'ニャオハ':'0906','ホゲータ':'0909','クワッス':'0912','オトシドリ':'0962','コライドン':'1007','ミライドン':'1008','オーガポン':'1017','カミツオロチ':'1019'
});
const alias=Object.freeze({'パルデアウパー':'0194','パルデアケンタロス':'0128'});
const dex=new Map(Object.entries(SEED));
let ready=false,loading=null;
function attr(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function uniq(a){return [...new Set(a.filter(Boolean))]}
function loadCache(){try{const c=JSON.parse(localStorage.getItem(CACHE_KEY)||'null');if(c?.v!==2||!Array.isArray(c.items))return false;for(const [name,no] of c.items){if(name&&no)dex.set(String(name),String(no).padStart(4,'0'))}ready=dex.size>500;return ready}catch(e){return false}}
function saveCache(){try{localStorage.setItem(CACHE_KEY,JSON.stringify({v:2,items:[...dex.entries()]}))}catch(e){}}
function ingest(j){let rows=[];
 if(Array.isArray(j))rows=j;
 else if(Array.isArray(j?.pokedex))rows=j.pokedex;
 else if(Array.isArray(j?.pokemon))rows=j.pokemon;
 else if(Array.isArray(j?.results))rows=j.results;
 else if(j?.data&&typeof j.data==='object')rows=Object.values(j.data).flatMap(v=>Array.isArray(v)?v:[v]);
 else if(j?.pokedex&&typeof j.pokedex==='object')rows=Object.values(j.pokedex).flatMap(v=>Array.isArray(v)?v:[v]);
 let added=0;
 for(const p of rows){const name=p?.name?.jpn||p?.name?.japanese||p?.name_ja||(typeof p?.name==='string'&&/[ぁ-んァ-ヶ一-龯]/.test(p.name)?p.name:null),no=p?.globalNo||p?.national_pokedex_number||p?.id||p?.no;if(name&&no){const n=String(Number(no));if(n&&n!=='NaN'){if(!dex.has(String(name)))added++;dex.set(String(name),n.padStart(4,'0'))}}}
 return added;
}
loadCache();
F.spriteDexStatus=()=>({ready,count:dex.size,loading:!!loading,localSeed:Object.keys(SEED).length});
F.spriteDexNo=sp=>{const name=typeof sp==='string'?sp:sp?.name;if(!name)return null;return dex.get(String(name))||alias[String(name)]||null};
F.hasImmediateSprite=sp=>!!F.spriteDexNo(sp);
function englishSlug(sp){let s=String(sp?.nameEn||sp?.representative?.name_en||'').trim();if(!s)return'';s=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/♀/g,'f').replace(/♂/g,'m').toLowerCase().replace(/[^a-z0-9]/g,'');const fixes={mrmime:'mrmime',mimejr:'mimejr',farfetchd:'farfetchd',sirfetchd:'sirfetchd',typenull:'typenull',flabebe:'flabebe',nidoranf:'nidoranf',nidoranm:'nidoranm'};return fixes[s]||s}
F.pokemonSpriteUrls=(sp,opt={})=>{const no=F.spriteDexNo(sp),n=no?String(Number(no)):'',slug=englishSlug(sp),back=!!opt.back,urls=[];
 // 英名が取れる場合は図鑑番号解決を待たずShowdown CDNから直接候補を作る。
 if(slug){if(back)urls.push(`${SHOWDOWN_BASE}ani-back/${slug}.gif`,`${SHOWDOWN_BASE}gen5-back/${slug}.png`);else urls.push(`${SHOWDOWN_BASE}ani/${slug}.gif`,`${SHOWDOWN_BASE}gen5/${slug}.png`)}
 if(n&&n!=='NaN'){
  if(back)urls.push(`${POKE_SPRITE_BASE}other/showdown/back/${n}.gif`,`${POKE_SPRITE_BASE}back/${n}.png`,`${POKE_SPRITE_BASE}${n}.png`);
  else urls.push(`${POKE_SPRITE_BASE}other/showdown/${n}.gif`,`${POKE_SPRITE_BASE}${n}.png`,`${POKE_SPRITE_BASE}other/home/${n}.png`);
 }
 return uniq(urls);
};
F.spriteImgError=img=>{if(!img)return;const next=String(img.dataset.next||'').split('|').filter(Boolean);if(next.length){img.dataset.next=next.slice(1).join('|');img.src=next[0];return}const parent=img.parentElement;img.remove();parent?.classList.add('fallbackOnly')};
F.speciesVisualHtml=(sp,opt={})=>{if(!sp)return '<span class="speciesVisual fallbackOnly"><span class="speciesFallback"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" shape-rendering="crispEdges" aria-hidden="true"><path d="M20 20h24v6h6v16h-6v6H20v-6h-6V26h6z" fill="#8eb69a" stroke="#28352e" stroke-width="3"/><rect x="24" y="27" width="5" height="6" fill="#fff"/><rect x="37" y="27" width="5" height="6" fill="#fff"/></svg></span></span>';const small=!!opt.small,facing=String(opt.facing||'down'),urls=F.pokemonSpriteUrls(sp,{...opt,back:facing==='up'}),initial=String(sp.name||'?').slice(0,1),svg=fallbackCreatureSvg(sp,facing),fallback=`<span class="speciesFallback" data-type="${attr(sp.type1||'')}">${svg}<i>${attr(initial)}</i></span>`,img=urls.length?`<img class="pokemonSpriteImg" src="${attr(urls[0])}" data-next="${attr(urls.slice(1).join('|'))}" alt="${attr(sp.name||'ポケモン')}" draggable="false" onerror="window.FRENDA_FRONTIER.spriteImgError(this)">`:'';return `<span class="speciesVisual ${small?'small':''} facing-${attr(facing)} ${urls.length?'':'fallbackOnly'}" data-species="${attr(sp.id||'')}">${fallback}${img}</span>`};
async function fetchIndex(url){const r=await fetch(url,{cache:'force-cache'});if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()}
F.ensureSpriteDex=()=>{if(ready)return Promise.resolve({ready:true,count:dex.size,cached:true});if(loading)return loading;if(typeof fetch!=='function')return Promise.resolve({ready:false,count:dex.size,error:'fetch unavailable'});loading=(async()=>{const errors=[];for(const url of INDEX_URLS){try{const j=await fetchIndex(url),added=ingest(j);if(added>0){ready=dex.size>500;saveCache();window.dispatchEvent(new CustomEvent('frontier:sprites-ready',{detail:{count:dex.size,ready,url}}));if(ready)return{ready,count:dex.size,url}}}catch(e){errors.push(`${url}: ${e?.message||e}`)}}console.warn('Frontier sprite dex:',errors.join(' / '));return{ready:false,count:dex.size,error:errors.join(' / ')}})().finally(()=>{loading=null});return loading};
})();
// Updated: 2026-10-23 07:40 JST / Ver1.15
/* Updated: 2026-10-23 07:40 JST / Ver1.15 */

/* Updated: 2026-10-23 13:34 JST / Ver1.15 */

/* Updated: 2026-10-23 20:00 JST / Ver1.16 */

/* Updated: 2026-10-23 20:14 JST / Ver1.19 */
/* Updated: 2026-10-28 JST / Ver1.79: local prebuilt fallback pixel-art */
