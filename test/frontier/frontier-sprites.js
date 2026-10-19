/* Frenda Frontier Ver0.55 / Pokemon sprite resolver / Updated: 2026-10-20 */
(()=>{"use strict";
const F=window.FRENDA_FRONTIER=window.FRENDA_FRONTIER||{};
const CACHE_KEY="frenda:frontier:sprite-dex:v1";
const INDEX_URL="https://towakey.github.io/pokedex/api/v1/pokedex/index.json";
const SPRITE_BASE="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";
const TYPE_ICON={ノーマル:'◉',ほのお:'🔥',みず:'💧',でんき:'⚡',くさ:'🍃',こおり:'❄️',かくとう:'✊',どく:'☠️',じめん:'⛰️',ひこう:'🪽',エスパー:'✦',むし:'🐞',いわ:'◆',ゴースト:'👻',ドラゴン:'◇',あく:'☾',はがね:'⬡',フェアリー:'✿'};
// 初回通信前でも、TESTで使いやすい代表種だけは即座に表示できるようにする。
const SEED=Object.freeze({
 'ピカチュウ':'0025','イーブイ':'0133','ヒトカゲ':'0004','フシギダネ':'0001','ゼニガメ':'0007',
 'ニャオハ':'0906','ホゲータ':'0909','クワッス':'0912','プリン':'0039','ペリッパー':'0279','エルフーン':'0547',
 'オトシドリ':'0962','カミツオロチ':'1019','コライドン':'1007','ミライドン':'1008','オーガポン':'1017'
});
const alias=Object.freeze({'パルデアウパー':'0194','パルデアケンタロス':'0128'});
const dex=new Map(Object.entries(SEED));
let ready=false,loading=null;
function attr(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function loadCache(){try{const c=JSON.parse(localStorage.getItem(CACHE_KEY)||'null');if(c?.v!==1||!Array.isArray(c.items))return false;for(const [name,no] of c.items){if(name&&no)dex.set(String(name),String(no).padStart(4,'0'))}ready=dex.size>Object.keys(SEED).length;return ready}catch(e){return false}}
function saveCache(){try{localStorage.setItem(CACHE_KEY,JSON.stringify({v:1,items:[...dex.entries()]}))}catch(e){}}
loadCache();
F.spriteDexStatus=()=>({ready,count:dex.size,loading:!!loading});
F.spriteDexNo=sp=>{const name=typeof sp==='string'?sp:sp?.name;if(!name)return null;return dex.get(String(name))||alias[String(name)]||null};
F.pokemonSpriteUrls=(sp,opt={})=>{const no=F.spriteDexNo(sp);if(!no)return[];const n=String(Number(no));if(!n||n==='NaN')return[];const back=!!opt.back;return back?[
 `${SPRITE_BASE}other/showdown/back/${n}.gif`,`${SPRITE_BASE}back/${n}.png`,`${SPRITE_BASE}${n}.png`
 ]:[
 `${SPRITE_BASE}other/showdown/${n}.gif`,`${SPRITE_BASE}${n}.png`,`${SPRITE_BASE}other/home/${n}.png`
 ]};
F.spriteImgError=img=>{if(!img)return;const next=String(img.dataset.next||'').split('|').filter(Boolean);if(next.length){img.dataset.next=next.slice(1).join('|');img.src=next[0];return}img.remove();img.parentElement?.classList.add('fallbackOnly')};
F.speciesVisualHtml=(sp,opt={})=>{if(!sp)return '<span class="speciesVisual fallbackOnly"><span class="speciesFallback">?</span></span>';const small=!!opt.small,facing=String(opt.facing||'down'),urls=F.pokemonSpriteUrls(sp,{...opt,back:facing==='up'}),icon=TYPE_ICON[sp.type1]||'🐾',initial=String(sp.name||'?').slice(0,1),img=urls.length?`<img class="pokemonSpriteImg" src="${attr(urls[0])}" data-next="${attr(urls.slice(1).join('|'))}" alt="${attr(sp.name||'ポケモン')}" draggable="false" onerror="window.FRENDA_FRONTIER.spriteImgError(this)">`:'';return `<span class="speciesVisual ${small?'small':''} facing-${attr(facing)} ${urls.length?'':'fallbackOnly'}" data-species="${attr(sp.id||'')}"><span class="speciesFallback" data-type="${attr(sp.type1||'')}"><b>${icon}</b><i>${attr(initial)}</i></span>${img}</span>`};
F.ensureSpriteDex=()=>{if(ready)return Promise.resolve({ready:true,count:dex.size,cached:true});if(loading)return loading;if(typeof fetch!=='function')return Promise.resolve({ready:false,count:dex.size,error:'fetch unavailable'});loading=fetch(INDEX_URL,{cache:'force-cache'}).then(r=>{if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()}).then(j=>{for(const p of (j?.pokedex||[])){const name=p?.name?.jpn,no=p?.globalNo;if(name&&no)dex.set(String(name),String(no).padStart(4,'0'))}ready=dex.size>500;saveCache();window.dispatchEvent(new CustomEvent('frontier:sprites-ready',{detail:{count:dex.size,ready}}));return{ready,count:dex.size}}).catch(e=>{console.warn('Frontier sprite dex:',e);return{ready:false,count:dex.size,error:String(e?.message||e)}}).finally(()=>{loading=null});return loading};
})();
