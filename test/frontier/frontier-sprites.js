/* Frenda Frontier Ver1.81 / generated fallback art only / Updated: 2026-10-29 */
(()=>{"use strict";
const F=window.FRENDA_FRONTIER=window.FRENDA_FRONTIER||{};
const TYPE_ICON=Object.freeze({ノーマル:'◉',ほのお:'🔥',みず:'💧',でんき:'⚡',くさ:'🍃',こおり:'❄️',かくとう:'✊',どく:'☠️',じめん:'⛰️',ひこう:'🪽',エスパー:'✦',むし:'🐞',いわ:'◆',ゴースト:'👻',ドラゴン:'◇',あく:'☾',はがね:'⬡',フェアリー:'✿'});
function attr(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
// 画像の権利確認が済むまでは、外部画像・画像索引を取得せず、生成代替絵だけを表示します。
F.spriteDexStatus=()=>({ready:true,count:0,loading:false,imagesIncluded:0,generatedFallbackOnly:true});
F.spriteDexNo=()=>null;
F.hasImmediateSprite=()=>false;
F.pokemonSpriteUrls=()=>[];
F.spriteImgError=img=>{if(!img)return;const parent=img.parentElement;img.remove();parent?.classList.add('fallbackOnly')};
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
 if(!sp)return '<span class="speciesVisual small fallbackOnly"><span class="speciesFallback"><b>🐾</b><i>?</i></span></span>';
 const small=!!opt.small,facing=String(opt.facing||'down');
 return `<span class="speciesVisual ${small?'small':''} facing-${attr(facing)} fallbackOnly" data-species="${attr(sp.id||'')}">${generatedFallbackHtml(sp)}</span>`;
};
F.ensureSpriteDex=()=>Promise.resolve({ready:true,count:0,offline:true,imagesDisabled:true});
})();
