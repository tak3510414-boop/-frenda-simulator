(()=>{"use strict";
window.FRENDA_RANCH=window.FRENDA_RANCH||{};
const R=window.FRENDA_RANCH;
R.VERSION="0.25";R.SCHEMA_VERSION=4;R.MAX_INITIAL=6;
R.masterRecords=()=>Array.isArray(window.FRENDA_MASTER?.records)?window.FRENDA_MASTER.records:[];
R.masterMap=()=>new Map(R.masterRecords().map(x=>[String(x.master_id),x]));
R.ownedIds=()=>{const D=window.FRENDA_DATA;const d=D?.dungeon?.read?.();if(d?.initialized&&Array.isArray(d.owned))return [...new Set(d.owned.map(x=>String(x?.id||"")).filter(Boolean))];const a=D?.readList?.(D?.KEYS?.simulator?.owned)||[];return [...new Set(a.map(String).filter(Boolean))]};
R.record=id=>R.masterMap().get(String(id))||null;
R.pickName=id=>String(R.record(id)?.name_ja||"");
R.loadEvolutionIndex=async()=>{try{return await window.FRENDA_DATA?.evolution?.loadIndex?.()||null}catch(e){console.warn("RANCH_EVOLUTION_LOAD",e);return null}};
})();
// Updated: 2026-10-13 07:40 JST
