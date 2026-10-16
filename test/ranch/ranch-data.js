(()=>{"use strict";
window.FRENDA_RANCH=window.FRENDA_RANCH||{};
const R=window.FRENDA_RANCH;
R.VERSION="0.64";R.SCHEMA_VERSION=4;R.MAX_INITIAL=6;
R.masterRecords=()=>Array.isArray(window.FRENDA_MASTER?.records)?window.FRENDA_MASTER.records:[];
R.masterMap=()=>new Map(R.masterRecords().map(x=>[String(x.master_id),x]));
R.ownedIds=()=>{const D=window.FRENDA_DATA;const d=D?.dungeon?.read?.();if(d?.initialized&&Array.isArray(d.owned))return [...new Set(d.owned.map(x=>String(x?.id||"")).filter(Boolean))];const a=D?.readList?.(D?.KEYS?.simulator?.owned)||[];return [...new Set(a.map(String).filter(Boolean))]};
R.record=id=>R.masterMap().get(String(id))||null;
R.pickName=id=>String(R.record(id)?.name_ja||"");
R.loadEvolutionIndex=async()=>{try{return await window.FRENDA_DATA?.evolution?.loadIndex?.()||null}catch(e){console.warn("RANCH_EVOLUTION_LOAD",e);return null}};

/* Ver0.58 Frenda World: discovery catalog. World definitions only; no main-game writes. */
R.WORLD_AREAS=Object.freeze([
{id:"ranch",name:"フレンダ牧場",realm:"ground",unlock:1},
{id:"forest",name:"木陰の森",realm:"ground",unlock:2},
{id:"lake",name:"水辺",realm:"ground",unlock:3},
{id:"mine",name:"ひかり石の鉱山",realm:"underground",unlock:4},
{id:"cave",name:"深層洞窟",realm:"underground",unlock:5},
{id:"sea",name:"海辺",realm:"sea",unlock:6},
{id:"undersea",name:"海中世界",realm:"undersea",unlock:7},
{id:"sky",name:"空のフィールド",realm:"sky",unlock:8},
{id:"ruins",name:"天空遺跡",realm:"sky",unlock:9},
{id:"dark_castle",name:"闇の城",realm:"unknown",unlock:10}
]);

R.DISCOVERY_STEPS=Object.freeze([{id:"ranch",name:"🌿 フレンダ牧場",level:1,hint:"ここが世界の出発点。"},{id:"forest",name:"🌳 木陰の森",level:2,hint:"草むらの先から木々のざわめきが聞こえる。"},{id:"lake",name:"💧 水辺",level:3,hint:"遠くから水の音がする。"},{id:"mine",name:"⛏️ ひかり石の鉱山",level:4,hint:"岩陰から不思議な光が漏れている。"},{id:"beyond",name:"❓ さらに遠く",level:5,hint:"世界はここで終わっていない。"}]);

R.DISCOVERY_EVENTS=Object.freeze({2:{pre:"が草むらの奥をじっと見ています……",wait:"が草むらの奥へ入っていった……",found:"🌳 木陰の森を発見！"},3:{pre:"が遠くの水音に気づきました……",wait:"が音のする方へ走っていった……",found:"💧 水辺を発見！"},4:{pre:"が岩陰の光を見つけました……",wait:"が暗い裂け目をのぞき込んでいます……",found:"⛏️ ひかり石の鉱山を発見！"},5:{pre:"が、さらに遠くから何かを感じています……",wait:"がまだ見ぬ世界へ向かいました……",found:"✨ 世界の境界がさらに広がった！"}});

R.WORLD_DEPTH=Object.freeze({
 meadow:{kind:"surface",depth:0,next:["shade"]},
 shade:{kind:"forest",depth:1,next:["pond","mine"]},
 pond:{kind:"waterside",depth:1,next:["sea"]},
 mine:{kind:"underground",depth:2,next:["deep_cave"]},
 beyond:{kind:"frontier",depth:3,next:["sky","sea","dark_castle"]}
});
})();
// Updated: 2026-10-13 12:45 JST
