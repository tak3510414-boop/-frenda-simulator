(()=>{"use strict";
const R=window.FRENDA_RANCH=window.FRENDA_RANCH||{},$=id=>document.getElementById(id);
function imageOf(x){return x?.official_image||""}

function renderRelations(s){
 const host=$("relationList");if(!host)return;const bonds=Object.values(s?.social?.bonds||{}).filter(Boolean).sort((a,b)=>(Number(b.score)||0)-(Number(a.score)||0));
 if(!bonds.length){host.textContent="まだ交流記録はありません。";return}
 const names=new Map((s.creatures||[]).map(c=>[String(c.ranchId),R.pickName(c.pickId)||c.pickId]));host.innerHTML="";
 for(const b of bonds.slice(0,12)){const d=document.createElement("span");d.className="relationChip";const rank=R.ai?.bondRank?.(b.score)||{label:b.rankLabel||"顔見知り"};d.textContent=`${names.get(String(b.a))||"?"} × ${names.get(String(b.b))||"?"}：${rank.label} ${Number(b.score)||0}`;host.appendChild(d)}
}

function renderEnvironment(){
 const host=$("environmentList");if(!host)return;const e=R.ai?.environment?.()||{phase:"-",weather:"-"};host.innerHTML="";for(const t of [`時間帯：${e.phase}`,`天気：${e.weather}`,"牧場の1日：約1時間"]){const d=document.createElement("span");d.className="relationChip";d.textContent=t;host.appendChild(d)}
 const p=$("pasture");if(p){p.dataset.phase=e.phase;p.dataset.weather=e.weather;if(e.phase==="夜")p.style.filter="brightness(.78) saturate(.92)";else if(e.phase==="夕方")p.style.filter="sepia(.12) brightness(.96)";else p.style.filter="none"}
}

async function render(){
 await Promise.resolve(window.RANCH_CLOUD_READY);
 if(!window.FRENDA_DATA||!window.FRENDA_MASTER){$("empty").textContent="共通データを読み込めませんでした。";$("saveState").textContent="NG";return}
 const ids=R.ownedIds(),s=await R.reconcile(ids),active=s.creatures.filter(c=>c.status==="resident"),shown=active.slice(0,R.MAX_INITIAL),byId=R.masterMap();
 $("ownedCount").textContent=ids.length;$("registryCount").textContent=s.creatures.length;$("residentCount").textContent=shown.length;$("saveState").textContent="OK";
 const p=$("pasture"),empty=$("empty");R.ai?.stop?.();p.querySelectorAll(".mon").forEach(x=>x.remove());empty.style.display=shown.length?"none":"grid";if(!shown.length)empty.textContent="本編の所持ピックがありません。";
 const aiItems=[];
 shown.forEach((c,i)=>{const m=byId.get(String(c.pickId));if(!m)return;const d=document.createElement("div");d.className="mon idle";d.dataset.ranchId=c.ranchId;const im=document.createElement("img");im.src=imageOf(m);im.alt=m.name_ja||"";const b=document.createElement("b");b.textContent=m.name_ja||c.pickId;d.append(im,b);p.appendChild(d);aiItems.push({id:c.ranchId,el:d,creature:c,record:m})});
 R.ai?.start?.(aiItems);
 renderRelations(s);renderEnvironment();setInterval(renderEnvironment,15000);
 const dd=window.FRENDA_DATA?.dungeon?.read?.();$("detail").textContent=`保存キー: ${R.saveKey()} ／ 本編参照: ${dd?.initialized?"Dungeon所持データ":"Simulator所持データ（フォールバック）"} ／ 進化履歴: ${s.evolutionHistory?.length||0} ／ 生活AI: ${R.ai?.enabled?"ON":"OFF"} ／ 交流: ON ／ 本編書込: なし`;
}
window.addEventListener("ranch:social-updated",()=>{const s=R.readSave?.();if(s)renderRelations(s)});
window.addEventListener("DOMContentLoaded",render);
})();
// Updated: 2026-10-12 21:52 JST
