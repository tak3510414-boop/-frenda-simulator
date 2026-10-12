(()=>{"use strict";
const R=window.FRENDA_RANCH=window.FRENDA_RANCH||{},$=id=>document.getElementById(id);
function imageOf(x){return x?.official_image||""}
async function render(){
 await Promise.resolve(window.RANCH_CLOUD_READY);
 if(!window.FRENDA_DATA||!window.FRENDA_MASTER){$("empty").textContent="共通データを読み込めませんでした。";$("saveState").textContent="NG";return}
 const ids=R.ownedIds(),s=await R.reconcile(ids),active=s.creatures.filter(c=>c.status==="resident"),shown=active.slice(0,R.MAX_INITIAL),byId=R.masterMap();
 $("ownedCount").textContent=ids.length;$("registryCount").textContent=s.creatures.length;$("residentCount").textContent=shown.length;$("saveState").textContent="OK";
 const p=$("pasture"),empty=$("empty");R.ai?.stop?.();p.querySelectorAll(".mon").forEach(x=>x.remove());empty.style.display=shown.length?"none":"grid";if(!shown.length)empty.textContent="本編の所持ピックがありません。";
 const aiItems=[];
 shown.forEach((c,i)=>{const m=byId.get(String(c.pickId));if(!m)return;const d=document.createElement("div");d.className="mon idle";d.dataset.ranchId=c.ranchId;const im=document.createElement("img");im.src=imageOf(m);im.alt=m.name_ja||"";const b=document.createElement("b");b.textContent=m.name_ja||c.pickId;d.append(im,b);p.appendChild(d);aiItems.push({id:c.ranchId,el:d,creature:c,record:m})});
 R.ai?.start?.(aiItems);
 const dd=window.FRENDA_DATA?.dungeon?.read?.();$("detail").textContent=`保存キー: ${R.saveKey()} ／ 本編参照: ${dd?.initialized?"Dungeon所持データ":"Simulator所持データ（フォールバック）"} ／ 進化履歴: ${s.evolutionHistory?.length||0} ／ 生活AI: ${R.ai?.enabled?"ON":"OFF"} ／ 本編書込: なし`;
}
window.addEventListener("DOMContentLoaded",render);
})();
// Updated: 2026-10-12 20:45 JST
