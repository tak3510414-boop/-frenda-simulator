/* Frenda Frontier Ver1.82 / remote pixel sprites plus generated fallback / Updated: 2026-10-29 */
(()=>{"use strict";
const F=window.FRENDA_FRONTIER=window.FRENDA_FRONTIER||{};
const CACHE_KEY="frenda:frontier:sprite-dex:v3";
const INDEX_URLS=[
 "https://towakey.github.io/pokedex/api/v1/pokedex/index.json",
 "https://raw.githubusercontent.com/Purukitto/pokemon-data.json/master/pokedex.json"
];
const POKE_SPRITE_BASE="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";
const POKE_GEN5_BASE="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/";
const SHOWDOWN_BASE="https://play.pokemonshowdown.com/sprites/";
const TYPE_ICON={ノーマル:'◉',ほのお:'🔥',みず:'💧',でんき:'⚡',くさ:'🍃',こおり:'❄️',かくとう:'✊',どく:'☠️',じめん:'⛰️',ひこう:'🪽',エスパー:'✦',むし:'🐞',いわ:'◆',ゴースト:'👻',ドラゴン:'◇',あく:'☾',はがね:'⬡',フェアリー:'✿'};
// PokeAPIの全種ローカル索引が読み込めない場合に備え、代表種も組み込み保持。
const SEED=Object.freeze({
 'フシギダネ':'0001','フシギソウ':'0002','フシギバナ':'0003','ヒトカゲ':'0004','リザード':'0005','リザードン':'0006','ゼニガメ':'0007','カメール':'0008','カメックス':'0009',
 'キャタピー':'0010','トランセル':'0011','バタフリー':'0012','ビードル':'0013','コクーン':'0014','スピアー':'0015','ポッポ':'0016','コラッタ':'0019','オニスズメ':'0021','ピカチュウ':'0025','ライチュウ':'0026',
 'プリン':'0039','ズバット':'0041','ナゾノクサ':'0043','クサイハナ':'0044','ラフレシア':'0045','パラス':'0046','パラセクト':'0047','コンパン':'0048','モルフォン':'0049','ディグダ':'0050','ニャース':'0052','コダック':'0054','マンキー':'0056','ガーディ':'0058',
 'ニョロモ':'0060','ケーシィ':'0063','ワンリキー':'0066','マダツボミ':'0069','メノクラゲ':'0072','イシツブテ':'0074','ポニータ':'0077','ヤドン':'0079','コイル':'0081','カモネギ':'0083','ゴース':'0092','イワーク':'0095','タマタマ':'0102','カラカラ':'0104','ドガース':'0109','サイホーン':'0111','ラッキー':'0113','モンジャラ':'0114','ストライク':'0123','カイロス':'0127','イーブイ':'0133',
 'ペリッパー':'0279','ポカブ':'0498','チャオブー':'0499','エンブオー':'0500','モンメン':'0546','エルフーン':'0547',
 'ニャオハ':'0906','ホゲータ':'0909','クワッス':'0912','オトシドリ':'0962','コライドン':'1007','ミライドン':'1008','オーガポン':'1017','カミツオロチ':'1019'
});
const alias=Object.freeze({'パルデアウパー':'0194','パルデアケンタロス':'0128'});
const LOCAL_DEX_JA=window.FRENDA_FRONTIER_SPRITE_DEX_JA||{};
const LOCAL_DEX_EN=window.FRENDA_FRONTIER_SPRITE_DEX_EN||{};
const dex=new Map(Object.entries(SEED));
for(const [name,no] of Object.entries(LOCAL_DEX_JA)) if(name&&no)dex.set(String(name),String(no).padStart(4,'0'));
for(const [slug,no] of Object.entries(LOCAL_DEX_EN)) if(slug&&no)dex.set(String(slug),String(no).padStart(4,'0'));
let ready=Object.keys(LOCAL_DEX_JA).length>=900,loading=null;
function attr(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function uniq(a){return [...new Set(a.filter(Boolean))]}
function loadCache(){
 try{const c=JSON.parse(localStorage.getItem(CACHE_KEY)||'null');if(c?.v===3&&Array.isArray(c.items))for(const [name,no] of c.items){if(name&&no&&!dex.has(String(name)))dex.set(String(name),String(no).padStart(4,'0'))}}
 catch(e){}
 ready=Object.keys(LOCAL_DEX_JA).length>=900||dex.size>500;
 return ready;
}
function saveCache(){try{localStorage.setItem(CACHE_KEY,JSON.stringify({v:3,items:[...dex.entries()]}))}catch(e){}}
function ingest(j){let rows=[];
 if(Array.isArray(j))rows=j;
 else if(Array.isArray(j?.pokedex))rows=j.pokedex;
 else if(Array.isArray(j?.pokemon))rows=j.pokemon;
 else if(Array.isArray(j?.results))rows=j.results;
 else if(j?.data&&typeof j.data==='object')rows=Object.values(j.data).flatMap(v=>Array.isArray(v)?v:[v]);
 else if(j?.pokedex&&typeof j.pokedex==='object')rows=Object.values(j.pokedex).flatMap(v=>Array.isArray(v)?v:[v]);
 let added=0;
 for(const p of rows){const name=p?.name?.jpn||p?.name?.japanese||p?.name_ja||(typeof p?.name==='string'&&/[ぁ-んァ-ヶ一-龯]/.test(p.name)?p.name:null),no=p?.globalNo||p?.national_pokedex_number||p?.id||p?.no;if(name&&no){const n=String(Number(no));if(n&&n!=='NaN'){if(!dex.has(String(name))){added++;dex.set(String(name),n.padStart(4,'0'))}}}}
 return added;
}
loadCache();
F.spriteDexStatus=()=>({ready,count:dex.size,loading:!!loading,localSeed:Object.keys(SEED).length,localJapaneseEntries:Object.keys(LOCAL_DEX_JA).length,localEnglishAliases:Object.keys(LOCAL_DEX_EN).length});
function normalizedJapaneseName(name){
 let s=String(name||'').normalize('NFKC').trim().replace(/[（(](?:アローラ|ガラル|ヒスイ|パルデア)(?:の)?(?:すがた)?[）)]/g,'');
 s=s.replace(/^(?:アローラ|ガラル|ヒスイ|パルデア)(?:の)?/,'').replace(/(?:アローラ|ガラル|ヒスイ|パルデア)(?:のすがた)?$/,'');
 return s.replace(/[\s\u3000・]/g,'').trim();
}
const LOCAL_DEX_JA_NORMALIZED=new Map();
for(const [name,no] of Object.entries(LOCAL_DEX_JA)){const key=normalizedJapaneseName(name);if(key&&!LOCAL_DEX_JA_NORMALIZED.has(key))LOCAL_DEX_JA_NORMALIZED.set(key,String(no).padStart(4,'0'))}
F.spriteDexNo=sp=>{
 const name=typeof sp==='string'?sp:sp?.name;
 if(!name)return null;
 const direct=dex.get(String(name))||alias[String(name)];
 if(direct)return direct;
 const ja=normalizedJapaneseName(name),jaNo=LOCAL_DEX_JA_NORMALIZED.get(ja)||dex.get(ja)||alias[ja];
 if(jaNo)return jaNo;
 const en=englishSlug(typeof sp==='string'?{nameEn:sp}:sp),enNo=dex.get(en)||alias[en];
 return enNo||null;
};
F.hasImmediateSprite=sp=>!!F.spriteDexNo(sp);
function englishSlug(sp){let s=String(sp?.nameEn||sp?.representative?.name_en||'').trim();if(!s)return'';s=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/♀/g,'f').replace(/♂/g,'m').toLowerCase().replace(/[^a-z0-9]/g,'');const fixes={mrmime:'mrmime',mimejr:'mimejr',farfetchd:'farfetchd',sirfetchd:'sirfetchd',typenull:'typenull',flabebe:'flabebe',nidoranf:'nidoranf',nidoranm:'nidoranm'};return fixes[s]||s}
F.pokemonSpriteUrls=(sp,opt={})=>{
 const no=F.spriteDexNo(sp),n=no?String(Number(no)):'',slug=englishSlug(sp),back=!!opt.back,urls=[];
 // 画像ファイルは同梱せず、全国図鑑No.001〜0649の第5世代ドット絵を必要時に取得します。
 // 0650以降はShowdown/PokeAPIの候補を試し、取得できなければ生成代替絵を表示します。
 if(n&&n!=='NaN'&&Number(n)>=1&&Number(n)<=649){
  if(back)urls.push(`${POKE_GEN5_BASE}back/${n}.png`,`${POKE_GEN5_BASE}${n}.png`);
  else urls.push(`${POKE_GEN5_BASE}${n}.png`);
 }
 if(slug){if(back)urls.push(`${SHOWDOWN_BASE}ani-back/${slug}.gif`,`${SHOWDOWN_BASE}gen5-back/${slug}.png`);else urls.push(`${SHOWDOWN_BASE}ani/${slug}.gif`,`${SHOWDOWN_BASE}gen5/${slug}.png`)}
 if(n&&n!=='NaN'){
  if(back)urls.push(`${POKE_SPRITE_BASE}other/showdown/back/${n}.gif`,`${POKE_SPRITE_BASE}back/${n}.png`,`${POKE_SPRITE_BASE}${n}.png`);
  else urls.push(`${POKE_SPRITE_BASE}other/showdown/${n}.gif`,`${POKE_SPRITE_BASE}${n}.png`,`${POKE_SPRITE_BASE}other/home/${n}.png`);
 }
 return uniq(urls);
};
F.spriteImgError=img=>{if(!img)return;const next=String(img.dataset.next||'').split('|').filter(Boolean);if(next.length){img.dataset.next=next.slice(1).join('|');img.src=next[0];return}const parent=img.parentElement;img.remove();parent?.classList.add('fallbackOnly')};
const FALLBACK_COLOR=Object.freeze({ノーマル:'#9caa9f',ほのお:'#e47743',みず:'#4d9dd2',でんき:'#d8b52b',くさ:'#63a457',こおり:'#69b8cf',かくとう:'#b6654d',どく:'#9b67aa',じめん:'#ba914c',ひこう:'#789fc9',エスパー:'#d477ab',むし:'#8ba64b',いわ:'#9b8764',ゴースト:'#7760a0',ドラゴン:'#6b69bb',あく:'#5a5360',はがね:'#83949e',フェアリー:'#d77ea8'});
function hashText(value){let h=2166136261;for(const ch of String(value||'')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function generatedFallbackHtml(sp){
 const seed=hashText(String(sp?.id||sp?.name||'?')+'|'+String(sp?.type1||'')),color=FALLBACK_COLOR[sp?.type1]||'#6c9980',accent=['#e0bd63','#89c7c6','#d995ad','#8c9de0','#a1c779'][seed%5],gid=`fg${seed.toString(16)}`;
 const shapes=[
  'M50 10 79 27 87 58 69 84 34 88 13 64 19 31Z',
  'M50 9 C68 16 87 29 84 51 C81 73 65 90 45 86 C25 82 13 68 17 47 C20 29 34 14 50 9Z',
  'M50 9 64 24 86 29 75 49 83 72 58 75 42 91 31 70 12 60 29 44 25 22Z',
  'M50 10 C70 18 85 32 78 51 C88 68 69 88 50 84 C31 91 13 73 22 55 C10 37 29 16 50 10Z'
 ];
 const d=shapes[(seed>>>4)%shapes.length],name=String(sp?.name||'?').slice(0,1),icon=TYPE_ICON[sp?.type1]||'✦';
 return `<span class="speciesFallback" data-type="${attr(sp?.type1||'')}"><svg aria-hidden="true" viewBox="0 0 100 100" style="position:absolute;inset:3px;width:calc(100% - 6px);height:calc(100% - 6px)"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${accent}"/><stop offset="1" stop-color="${color}"/></linearGradient></defs><path d="${d}" fill="url(#${gid})" stroke="#315846" stroke-width="4"/><path d="M27 56 Q50 34 73 56" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="55" r="12" fill="#fff" fill-opacity=".88"/></svg><b aria-hidden="true" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:14px">${icon}</b><i>${attr(name)}</i></span>`;
}
F.speciesVisualHtml=(sp,opt={})=>{
 if(!sp)return '<span class="speciesVisual fallbackOnly"><span class="speciesFallback"><b>🐾</b><i>?</i></span></span>';
 const small=!!opt.small,facing=String(opt.facing||'down'),urls=F.pokemonSpriteUrls(sp,{...opt,back:facing==='up'});
 const img=urls.length?`<img class="pokemonSpriteImg" src="${attr(urls[0])}" data-next="${attr(urls.slice(1).join('|'))}" alt="${attr(sp.name||'ポケモン')}" draggable="false" onerror="window.FRENDA_FRONTIER.spriteImgError(this)">`:'';
 return `<span class="speciesVisual ${small?'small':''} facing-${attr(facing)} ${urls.length?'':'fallbackOnly'}" data-species="${attr(sp.id||'')}">${generatedFallbackHtml(sp)}${img}</span>`;
};
async function fetchIndex(url){const r=await fetch(url,{cache:'force-cache'});if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()}
F.ensureSpriteDex=()=>{if(ready)return Promise.resolve({ready:true,count:dex.size,cached:true});if(loading)return loading;if(typeof fetch!=='function')return Promise.resolve({ready:false,count:dex.size,error:'fetch unavailable'});loading=(async()=>{const errors=[];for(const url of INDEX_URLS){try{const j=await fetchIndex(url),added=ingest(j);if(added>0){ready=dex.size>500;saveCache();window.dispatchEvent(new CustomEvent('frontier:sprites-ready',{detail:{count:dex.size,ready,url}}));if(ready)return{ready,count:dex.size,url}}}catch(e){errors.push(`${url}: ${e?.message||e}`)}}console.warn('Frontier sprite dex:',errors.join(' / '));return{ready:false,count:dex.size,error:errors.join(' / ')}})().finally(()=>{loading=null});return loading};
})();
// Updated: 2026-10-23 07:40 JST / Ver1.15
/* Updated: 2026-10-23 07:40 JST / Ver1.15 */

/* Updated: 2026-10-23 13:34 JST / Ver1.15 */

/* Updated: 2026-10-23 20:00 JST / Ver1.16 */

/* Updated: 2026-10-23 20:14 JST / Ver1.19 */
