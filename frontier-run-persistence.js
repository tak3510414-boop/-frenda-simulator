/* Frenda Frontier Ver1.76 — resume an active dungeon run after reload. */
(()=>{'use strict';
const F=window.FRENDA_FRONTIER;
const storage=()=>window.FRENDA_USER?.storage||window.localStorage;
const key=()=>`${F.SAVE_KEY}:active-dungeon-run`;
F.clearDungeonRun=()=>{try{storage()?.removeItem(key())}catch(e){console.warn('Dungeon run save could not be cleared.',e)}};
F.persistDungeonRun=()=>{try{const run=F.run;if(run?.active)storage()?.setItem(key(),JSON.stringify(run));else F.clearDungeonRun();return true}catch(e){console.warn('Dungeon run save failed.',e);return false}};
F.restoreDungeonRun=()=>{try{const raw=storage()?.getItem(key());if(!raw)return false;const run=JSON.parse(raw),d=F.dungeonDef?.(run?.dungeonId);if(!run?.active||!d||!run.map?.length||!run.player||!Number.isFinite(Number(run.player.x))||!Number.isFinite(Number(run.player.y))||!F.dungeonPlayable?.(F.readSave(),d)){F.clearDungeonRun();return false}F.run=run;return true}catch(e){F.clearDungeonRun();return false}};
const mutators=['startRun','testJumpToFinalFloor','move','swingDungeon','attackAt','waitTurn','setDungeonFacing','nextFloor','finishRun','escape','pickupDungeonItem','exchangeDungeonItem','placeDungeonItem','throwDungeonItem','useDungeonItem','dungeonEquipItem','triggerDungeonTrap'];
for(const name of mutators){const fn=F[name];if(typeof fn!=='function'||fn.__persistsActiveRun)continue;const wrapped=function(...args){const result=fn.apply(this,args);F.persistDungeonRun();return result};wrapped.__persistsActiveRun=true;F[name]=wrapped;}
window.addEventListener?.('pagehide',F.persistDungeonRun);
document.addEventListener?.('visibilitychange',()=>{if(document.hidden)F.persistDungeonRun()});
})();
