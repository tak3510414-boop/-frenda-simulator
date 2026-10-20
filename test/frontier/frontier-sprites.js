/* Frenda Frontier Ver0.58 / Pokemon sprite resolver / Updated: 2026-10-20 */
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
F.speciesVisualHtml=(sp,opt={})=>{if(!sp)return '<span class="speciesVisual fallbackOnly"><span class="speciesFallback">?</span></span>';const small=!!opt.small,facing=String(opt.facing||'down'),urls=F.pokemonSpriteUrls(sp,{...opt,back:facing==='up'}),icon=TYPE_ICON[sp.type1]||'🐾',initial=String(sp.name||'?').slice(0,1),img=urls.length?`<img class="pokemonSpriteImg" src="${attr(urls[0])}" data-next="${attr(urls.slice(1).join('|'))}" alt="${attr(sp.name||'ポケモン')}" draggable="false" onerror="window.FRENDA_FRONTIER.spriteImgError(this)">`:'';return `<span class="speciesVisual ${small?'small':''} facing-${attr(facing)} ${urls.length?'':'fallbackOnly'}" data-species="${attr(sp.id||'')}"><span class="speciesFallback" data-type="${attr(sp.type1||'')}"><b>${icon}</b><i>${attr(initial)}</i></span>${img}</span>`};
async function fetchIndex(url){const r=await fetch(url,{cache:'force-cache'});if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()}
F.ensureSpriteDex=()=>{if(ready)return Promise.resolve({ready:true,count:dex.size,cached:true});if(loading)return loading;if(typeof fetch!=='function')return Promise.resolve({ready:false,count:dex.size,error:'fetch unavailable'});loading=(async()=>{const errors=[];for(const url of INDEX_URLS){try{const j=await fetchIndex(url),added=ingest(j);if(added>0){ready=dex.size>500;saveCache();window.dispatchEvent(new CustomEvent('frontier:sprites-ready',{detail:{count:dex.size,ready,url}}));if(ready)return{ready,count:dex.size,url}}}catch(e){errors.push(`${url}: ${e?.message||e}`)}}console.warn('Frontier sprite dex:',errors.join(' / '));return{ready:false,count:dex.size,error:errors.join(' / ')}})().finally(()=>{loading=null});return loading};
})();
