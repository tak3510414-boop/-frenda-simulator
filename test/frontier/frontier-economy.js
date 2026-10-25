/* Frenda Frontier Ver1.59: arrivals and purchases are separate. */
(()=>{'use strict';
const F=window.FRENDA_FRONTIER;
// Provisional tuning values: coordinate these with loot, item prices and building costs.
F.CUSTOMER_BALANCE=Object.freeze({
 provisional:true,slots:6,arrivalWaitMs:6000,browseWaitMs:2000,resultWaitMs:1000,browseShelves:2,browsePauseMs:1000,checkoutPauseMs:1200,
 expectedByLevel:Object.freeze([0,1.2,1.7,2.2,2.8,3.4,4,4.6]),
 timeFactors:Object.freeze({morning:.9,day:1,evening:1.1,night:.3}),
 populationCap:.3,reputationCap:.2,trafficCap:.2,
 budgets:Object.freeze([[30,85],[40,120],[80,200],[25,75]]),
 needs:Object.freeze([['食料','草','巻物','投げ物'],['素材'],['珍品','杖','巻物'],['食料','草','薬']]),
 basePurchase:.45,needBonus:.2,priceSensitivity:.8,maxPurchase:.85
});
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
F.shopDemand=(s)=>{const b=F.CUSTOMER_BALANCE,t=s.development?.town||{},raw=Number(t.facilities?.shop)||0;
 // Legacy Lv1..6 shop numbering maps to the new Lv2..7 buildings.
 const lv=raw===0?0:clamp(s.story?.opening?raw:raw+1,1,7);
 const residents=Math.max(0,Number(t.residentCount)||0),rep=s.reputation||{},reputation=Math.max(0,Number(rep.fair)||0)+Math.max(0,Number(rep.rare)||0);
 const cleared=Object.values(s.dungeons?.cleared||{}).filter(Boolean).length;
 const population=1+Math.min(b.populationCap,residents*.025),reputationFactor=1+Math.min(b.reputationCap,reputation/600),traffic=1+Math.min(b.trafficCap,cleared*.06+(s.story?.firstReturn? .04:0));
 const phase=F.timeInfo(s).id,time=b.timeFactors[phase]??1;
 const expected=clamp(b.expectedByLevel[lv]*population*reputationFactor*traffic*time,0,b.slots*.95);
 return{level:lv,expected,arrivalChance:expected/b.slots,slots:b.slots,phase,residents,population,reputationFactor,traffic};};
F.shopVisitorArrives=(d,rng=Math.random)=>rng()<d.arrivalChance;
F.createShopVisitor=(s,rng=Math.random)=>{const d=F.shopDemand(s),b=F.CUSTOMER_BALANCE;
 const pool=[0,1];if(d.level>=3)pool.push(2);if(d.residents>0)pool.push(3);
 const i=pool[Math.min(pool.length-1,Math.floor(rng()*pool.length))],c={...F.CUSTOMERS[i]},range=b.budgets[i],scale=1+(d.level-1)*.12+Math.min(.15,(d.residents||0)*.01);
 c.budgetValue=Math.floor((range[0]+rng()*(range[1]-range[0]+1))*scale);c.needs=b.needs[i];return c;};
F.customerPurchaseChance=(item,price,customer)=>{const b=F.CUSTOMER_BALANCE;if(!item||!Number.isFinite(price)||price<=0||price>customer.budgetValue)return 0;const ratio=price/Math.max(1,item.base),need=(customer.needs||customer.likes||[]).includes(item.kind);
 return clamp(b.basePurchase+(need?b.needBonus:0)-(ratio-1)*b.priceSensitivity,0,b.maxPurchase);};
F.evaluateShopCustomer=(s,customer,rng=Math.random)=>{const available=(s.shelves||[]).slice(0,F.shopCapacity(s)).map((x,slot)=>x&&x.qty>0?{...x,slot,item:F.item(x.itemId)}:null).filter(x=>x?.item);
 let choice=null,probability=0,best=-Infinity;
 for(const sh of available){const p=F.customerPurchaseChance(sh.item,sh.price,customer);if(p<=0)continue;const score=p+rng()*.05;if(score>best){best=score;choice=sh;probability=p;}}
 const bought=!!choice&&rng()<probability;
 return{customer,budget:customer.budgetValue,choice,bought,probability,phase:F.timeInfo(s),reason:!available.length?'欲しい商品が残っていない':!choice?'予算や希望に合う商品がない':!bought?'今回は購入を見送った':customer.line};};
F.simulateCustomer=(customer)=>{const s=F.readSave();return F.evaluateShopCustomer(s,customer||F.createShopVisitor(s));};
// Only explicit hired, on-duty staff count. An NPC or a high-level shop is not an employee.
F.hasOnDutyShopStaff=s=>Array.isArray(s.employment?.shop)&&s.employment.shop.some(person=>person?.hired===true&&person.onDuty===true);
F.shopPresence=(s,ownerPresent)=>{const staffed=F.hasOnDutyShopStaff(s),capacity=F.shopCapacity(s),phase=s.story?.opening?.phase,allowed=!phase||!['arrival','tent','mission1','stocking','building'].includes(phase),preview=s.settings?.townLayerTest?.scenePreset;return{open:capacity>0&&allowed&&(!preview||preview==='normal')&&(ownerPresent||staffed),owner:!!ownerPresent,staffed};};
F.beginShopSession=()=>F.mutateSave(s=>{F.advanceTimeState(s,Number(F.TIME_ACTION_COSTS?.shopOpen)||1,'shopOpen');F.addHistory(s,'shop','営業を開始した（時間を消費）。');});
F.endShopSession=(visitors,sold)=>F.mutateSave(s=>{F.addHistory(s,'shop',`営業終了：来店${visitors}人、販売${sold}件。`);});
})();
// Updated: 2026-10-25 JST / Ver1.59

// Updated: 2026-10-25 14:32 JST / Ver1.59

// Updated: 2026-10-25 JST / Ver1.60

// Bundle updated: 2026-10-25 18:48 JST / Frontier Ver1.65

// Updated: 2026-10-25 20:21 JST / Ver1.67
