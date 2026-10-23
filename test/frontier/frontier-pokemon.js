/* Frenda Frontier Ver1.17 / Pokemon species master + move-based enemy technique AI / Updated: 2026-10-22 */
(()=>{"use strict";
const F=window.FRENDA_FRONTIER=window.FRENDA_FRONTIER||{};
const CATEGORY_PREF={star2_star3:90,treasure:80,super_treasure:70,parallel_art:55,shiny:50,"レガシーピック":40,"ワンダーピック":35,"スペシャルフレンダピック":20};
const TYPE_BIOME_WEIGHT=Object.freeze({
 forest:{"くさ":6,"むし":6,"どく":4,"ノーマル":3,"ひこう":2.5,"フェアリー":1.8,"じめん":1.4,"みず":.8,"でんき":.7,"エスパー":.5,"ほのお":.35,"いわ":.35,"あく":.3,"ゴースト":.25,"かくとう":.25,"こおり":.1,"はがね":.1,"ドラゴン":.08},
 river:{"みず":7,"でんき":2.2,"くさ":1.8,"こおり":1.2,"ノーマル":1,"ひこう":1,"じめん":.6,"フェアリー":.5},
 cave:{"いわ":6,"じめん":6,"どく":3.5,"ゴースト":2.4,"はがね":2.2,"あく":1.8,"かくとう":1.2,"ほのお":.8,"ノーマル":.7},
 road:{"ノーマル":5,"ひこう":3,"かくとう":2,"じめん":1.8,"でんき":1.4,"くさ":1.2,"むし":1.1},
 highland:{"いわ":4.5,"ひこう":4,"こおり":2.5,"かくとう":2,"ドラゴン":1.4,"じめん":1.4,"でんき":1}
});
F.POKEMON_AI_ARCHETYPES=Object.freeze({
 bruiser:{id:"bruiser",label:"接近型",icon:"👊"},
 ranged:{id:"ranged",label:"遠隔型",icon:"✨"},
 guardian:{id:"guardian",label:"守備型",icon:"🛡️"},
 skirmisher:{id:"skirmisher",label:"俊敏型",icon:"💨"},
 ambush:{id:"ambush",label:"待伏型",icon:"🌑"},
 support:{id:"support",label:"支援型",icon:"🌿"},
 wander:{id:"wander",label:"自由型",icon:"🐾"}
});
function num(v,d=0){v=Number(v);return Number.isFinite(v)?v:d}
function median(a){const v=a.map(Number).filter(Number.isFinite).sort((x,y)=>x-y);if(!v.length)return 0;const m=v.length>>1;return v.length%2?v[m]:(v[m-1]+v[m])/2}
function sid(name){return `species:${String(name||"").trim()}`}
function categoryScore(r){return CATEGORY_PREF[String(r?.category||"")]??30}
function repScore(r){return categoryScore(r)+(r?.official_verified?10:0)+(Number.isFinite(Number(r?.grade))?3:0)}
function chooseRepresentative(list){return [...list].sort((a,b)=>repScore(b)-repScore(a)||num(a.grade,99)-num(b.grade,99)||String(a.master_id).localeCompare(String(b.master_id)))[0]||null}
function aiFor(sp){const t=new Set([sp.type1,sp.type2].filter(Boolean));const atk=Math.max(sp.stats.atk,sp.stats.spAtk),def=(sp.stats.def+sp.stats.spDef)/2,spd=sp.stats.speed;if(t.has("ゴースト")||t.has("あく"))return "ambush";if(spd>=105&&spd>atk*.85)return "skirmisher";if(def>=atk*1.18)return "guardian";if(sp.stats.spAtk>=sp.stats.atk*1.22)return "ranged";if(t.has("くさ")||t.has("フェアリー")||t.has("エスパー"))return "support";if(atk>=70)return "bruiser";return "wander"}
// Ver0.97: 敵の特殊行動は「タイプだから」ではなく、実際の技名＋能力傾向から決める。
const STATUS_MOVE_PATTERNS=Object.freeze({
 poison:/どくどく|どくのこな|どくばり|どくづき|ヘドロ|スモッグ|ポイズン|クロスポイズン|ベノム/i,
 paralysis:/でんじは|しびれごな|へびにらみ|ほっぺすりすり|10まんボルト|かみなり|ほうでん|スパーク|でんきショック/i,
 sleep:/ねむりごな|さいみんじゅつ|うたう|キノコのほうし|あくまのキッス|くさぶえ|あくび/i,
 confusion:/こんらん|あやしいひかり|ちょうおんぱ|ねんりき|サイケこうせん|みずのはどう|ばくれつパンチ|おしゃべり/i
});
const PURE_STATUS_MOVE=/どくどく|どくのこな|でんじは|しびれごな|へびにらみ|ねむりごな|さいみんじゅつ|うたう|キノコのほうし|あくまのキッス|くさぶえ|あくび|あやしいひかり|ちょうおんぱ|こんらん/i;
const RANGED_MOVE=/みずでっぽう|ハイドロ|バブル|あわ|かえんほうしゃ|ひのこ|だいもんじ|10まんボルト|でんきショック|かみなり|ほうでん|スパーク|エアカッター|エアスラッシュ|はっぱカッター|タネマシンガン|マジカルリーフ|ねんりき|サイケこうせん|サイコキネシス|シャドーボール|あくのはどう|れいとうビーム|こおりのつぶて|ヘドロばくだん|ヘドロウェーブ|スピードスター|りゅうのはどう|ラスターカノン|はどうだん|パワージェム|ムーンフォース|チャージビーム|ソーラービーム|ウェザーボール|アシッドボム|どくばり|みずのはどう/i;
function statusIdForMove(moveName){const name=String(moveName||'');for(const [id,re] of Object.entries(STATUS_MOVE_PATTERNS))if(re.test(name))return id;return null}
function depthStage(dungeonId,floor){const b=F.dungeonBalance?.(dungeonId,floor)||{},f=Math.max(1,Number(b.normalizedFloor)||Number(floor)||1);return f<=5?0:f<=15?1:2}
F.moveStatusId=statusIdForMove;
F.enemyTechniqueForSpecies=(sp,floor=1,dungeonId=F.DEFAULT_DUNGEON_ID)=>{
 if(!sp)return{id:'basic',kind:'basic',label:'通常攻撃',moveName:'こうげき',rangeMin:1,rangeMax:1,power:1,specialChance:0,cooldownMin:3,cooldownMax:4,statusId:null,statusChance:0,statusOnly:false,retreatChance:0};
 const stage=depthStage(dungeonId,floor),moveName=String(sp.move||'こうげき'),statusId=statusIdForMove(moveName),statusOnly=!!statusId&&PURE_STATUS_MOVE.test(moveName),explicitRanged=RANGED_MOVE.test(moveName)||statusOnly;
 let kind='basic',label='通常攻撃',power=1,rangeMax=1,baseChance=.24;
 if(statusOnly){kind='status';label='状態変化';power=0;rangeMax=stage===0?3:stage===1?4:5;baseChance=[.38,.48,.55][stage]}
 else if(explicitRanged){kind='ranged';label='遠距離技';power=[.72,.78,.84][stage];rangeMax=stage===0?3:stage===1?4:5;baseChance=[.42,.52,.60][stage]}
 else if(sp.ai==='bruiser'||sp.ai==='ambush'){kind='power';label='強打';power=[1.18,1.28,1.35][stage];baseChance=[.30,.40,.48][stage]}
 else if(sp.ai==='guardian'){kind='guard';label='堅実技';power=[1.10,1.18,1.24][stage];baseChance=[.28,.36,.42][stage]}
 else if(sp.ai==='skirmisher'){kind='skirmish';label='俊敏技';power=[1.04,1.10,1.16][stage];baseChance=[.30,.40,.48][stage]}
 else if(sp.ai==='support'&&statusId){kind='status';label='状態変化';power=statusOnly?0:[.65,.72,.78][stage];rangeMax=stage===0?3:stage===1?4:5;baseChance=[.36,.46,.53][stage]}
 const statusBase=statusId?(statusOnly?({sleep:[.52,.58,.62],paralysis:[.58,.64,.68],poison:[.62,.68,.72],confusion:[.54,.60,.64]}[statusId]||[.55,.60,.65])[stage]:({sleep:[.16,.20,.24],paralysis:[.15,.19,.23],poison:[.18,.22,.26],confusion:[.16,.20,.24]}[statusId]||[.16,.20,.24])[stage]):0;
 const cooldownMin=stage===0?3:2,cooldownMax=stage===0?4:3,retreatChance=sp.ai==='skirmisher'?[.12,.22,.30][stage]:(kind==='ranged'?[.08,.14,.20][stage]:0);
 return{id:`${kind}:${moveName}`,kind,label,moveName,moveType:String(sp.moveType||sp.type1||'ノーマル'),rangeMin:1,rangeMax,power,specialChance:baseChance,cooldownMin,cooldownMax,statusId,statusChance:statusBase,statusOnly,retreatChance};
};
function rarity(power){return power<=55?"common":power<=80?"uncommon":power<=105?"rare":"elite"}
function rarityLabel(r){return ({common:"よく見かける",uncommon:"少し珍しい",rare:"珍しい",elite:"強敵"})[r]||r}
let cache=null,cacheRecords=null,cacheLen=-1;
F.buildPokemonSpeciesMaster=()=>{
 const records=window.FRENDA_MASTER?.records||[];
 if(cache&&cacheRecords===records&&cacheLen===records.length)return cache;
 const groups=new Map();
 for(const r of records){const name=String(r?.name_ja||"").trim();if(!name)continue;const id=sid(name);if(!groups.has(id))groups.set(id,[]);groups.get(id).push(r)}
 const species=[];
 for(const [id,list] of groups){const rep=chooseRepresentative(list),types=[...new Set(list.flatMap(r=>[r.type1,r.type2]).filter(Boolean))];
  const stats={hp:median(list.map(r=>r.hp)),atk:median(list.map(r=>r.atk)),def:median(list.map(r=>r.def)),spAtk:median(list.map(r=>r.sp_atk)),spDef:median(list.map(r=>r.sp_def)),speed:median(list.map(r=>r.speed_value))};
  const power=(stats.hp+stats.atk+stats.def+stats.spAtk+stats.spDef+stats.speed)/6;
  const sp={id,name:rep?.name_ja||id.replace(/^species:/,""),nameEn:rep?.name_en||"",type1:rep?.type1||types[0]||null,type2:rep?.type2||types.find(t=>t!==rep?.type1)||null,types,stats,power:Math.round(power*10)/10,rarity:rarity(power),rarityLabel:rarityLabel(rarity(power)),ai:null,recordIds:list.map(r=>String(r.master_id)),records:list,representative:rep,representativeId:rep?.master_id||null,move:rep?.move||"こうげき",moveType:rep?.move_type||rep?.type1||null};
  sp.ai=aiFor(sp);species.push(sp);
 }
 species.sort((a,b)=>a.power-b.power||a.name.localeCompare(b.name,"ja"));
 const byId=new Map(species.map(x=>[x.id,x])),byRecord=new Map();for(const sp of species)for(const rid of sp.recordIds)byRecord.set(String(rid),sp);
 cache={records:species,byId,byRecord,count:species.length};cacheRecords=records;cacheLen=records.length;return cache;
};
F.speciesIdFromRecord=r=>r?.name_ja?sid(r.name_ja):null;
F.speciesById=id=>{const m=F.buildPokemonSpeciesMaster();return m.byId.get(String(id))||m.byRecord.get(String(id))||null};
F.speciesForRecordId=id=>F.buildPokemonSpeciesMaster().byRecord.get(String(id))||null;
F.speciesRecord=id=>F.speciesById(id)?.representative||F.pickRecord?.(id)||null;
F.pokemonSpeciesStats=()=>{const m=F.buildPokemonSpeciesMaster();const byRarity={common:0,uncommon:0,rare:0,elite:0};for(const sp of m.records)byRarity[sp.rarity]=(byRarity[sp.rarity]||0)+1;return{species:m.count,masterRecords:(window.FRENDA_MASTER?.records||[]).length,byRarity}};
F.ownedSpeciesIds=()=>{const ids=new Set((F.ownedIds?.()||[]).map(String)),out=new Set();const m=F.buildPokemonSpeciesMaster();for(const rid of ids){const sp=m.byRecord.get(rid);if(sp)out.add(sp.id)}return out};
function eventUnlockSet(s){const o=s?.pokemon?.companionUnlocks||{};return new Set(Object.entries(o).filter(([,v])=>!!v).map(([id])=>id))}
F.companionAccess=(spOrId,s=F.readSave?.())=>{const sp=typeof spOrId==="object"?spOrId:F.speciesById(spOrId);if(!sp)return{unlocked:false,reasons:[]};const reasons=[];if(F.ownedSpeciesIds().has(sp.id))reasons.push("フレンダ所持連携");if(eventUnlockSet(s).has(sp.id))reasons.push("Frontierイベント");if((s?.pokemon?.storyCompanions||[]).includes(sp.id))reasons.push("物語");return{unlocked:reasons.length>0,reasons}};
F.realEligibleCompanions=(s=F.readSave?.())=>F.buildPokemonSpeciesMaster().records.filter(sp=>F.companionAccess(sp,s).unlocked).sort((a,b)=>a.power-b.power||a.name.localeCompare(b.name,"ja"));
F.trialCompanions=(s=F.readSave?.())=>{if(!window.FRENDA_TEST?.active||F.realEligibleCompanions(s).length)return[];const preferred=["ニャオハ","ホゲータ","クワッス","ピカチュウ","イーブイ","ヒトカゲ"].map(n=>F.speciesById(sid(n))).filter(Boolean);const low=F.buildPokemonSpeciesMaster().records.filter(sp=>sp.rarity==="common").slice(0,12);return [...new Map([...preferred,...low].map(sp=>[sp.id,sp])).values()].slice(0,6)};
F.eligibleCompanions=(s=F.readSave?.())=>{const real=F.realEligibleCompanions(s);return real.length?real:F.trialCompanions(s)};
F.usingTrialPartners=()=>F.realEligibleCompanions(F.readSave?.()).length===0&&F.trialCompanions(F.readSave?.()).length>0;
// 旧API互換。以後の画面・戦闘は species を正本にする。
F.eligiblePartners=()=>F.eligibleCompanions(F.readSave?.()).map(sp=>sp.representative).filter(Boolean);
F.ownedEligiblePartners=()=>F.realEligibleCompanions(F.readSave?.()).map(sp=>sp.representative).filter(Boolean);
F.currentLeaderSpecies=s=>F.speciesById(s?.team?.leaderSpeciesId||s?.partnerId)||null;
F.unlockCompanionSpecies=(speciesId,source="event")=>F.mutateSave(s=>{const sp=F.speciesById(speciesId);if(!sp)throw new Error("不明なポケモンです。");s.pokemon=s.pokemon||{};s.pokemon.companionUnlocks=s.pokemon.companionUnlocks||{};s.pokemon.companionUnlocks[sp.id]={source,day:s.day,at:new Date().toISOString()};return sp.id});
F.markEncounterState=(s,speciesIds,dungeonId)=>{s.pokemon=s.pokemon||{};s.pokemon.encountered=s.pokemon.encountered||{};s.pokemon.firstSeenOrder=Array.isArray(s.pokemon.firstSeenOrder)?s.pokemon.firstSeenOrder:[];for(const id0 of speciesIds||[]){const sp=F.speciesById(id0);if(!sp)continue;const id=sp.id,cur=s.pokemon.encountered[id]||{count:0,firstDay:s.day,firstDungeon:dungeonId||null};cur.count=(Number(cur.count)||0)+1;cur.lastDay=s.day;cur.lastDungeon=dungeonId||cur.lastDungeon||null;s.pokemon.encountered[id]=cur;if(!s.pokemon.firstSeenOrder.includes(id))s.pokemon.firstSeenOrder.push(id)}};
F.frontierDexEntries=s=>{const m=F.buildPokemonSpeciesMaster(),enc=s?.pokemon?.encountered||{},real=new Set(F.realEligibleCompanions(s).map(x=>x.id));return m.records.map(sp=>({species:sp,encountered:!!enc[sp.id],encounterCount:Number(enc[sp.id]?.count)||0,companion:real.has(sp.id),access:F.companionAccess(sp,s)}))};
F.biomeWeight=(sp,biome="forest")=>{const t=TYPE_BIOME_WEIGHT[biome]||TYPE_BIOME_WEIGHT.forest;return Math.max(.02,...sp.types.map(x=>Number(t[x])||0))};
F.enemySpeciesCandidates=(dungeonId=F.DEFAULT_DUNGEON_ID,floor=1)=>{const d=F.dungeonDef?.(dungeonId)||{},biome=d.enemyRules?.biome||"forest",f=Math.max(1,Number(floor)||1),balance=F.dungeonBalance?.(dungeonId,f),max=Number(balance?.enemyMaxRarity??(f<=5?0:f<=15?1:f<=25?2:3)),rank={common:0,uncommon:1,rare:2,elite:3};return F.buildPokemonSpeciesMaster().records.filter(sp=>(rank[sp.rarity]??9)<=max&&F.biomeWeight(sp,biome)>=.1).map(sp=>({species:sp,weight:F.biomeWeight(sp,biome)*(sp.rarity==="common"?1.35:sp.rarity==="uncommon"?1:sp.rarity==="rare"?.55:.18)}))};
F.chooseEnemySpecies=(dungeonId,floor)=>{let pool=F.enemySpeciesCandidates(dungeonId,floor);if(!pool.length)return F.buildPokemonSpeciesMaster().records[0]||null;const spriteState=F.spriteDexStatus?.();if(spriteState&&!spriteState.ready&&F.hasImmediateSprite){const local=pool.filter(x=>F.hasImmediateSprite(x.species));if(local.length>=6)pool=local}const hit=F.weighted(pool.map(x=>({weight:x.weight,value:x.species})));return hit?.value||pool[0].species};
F.chooseDungeonBossSpecies=(dungeonId,floor)=>{const d=F.dungeonDef?.(dungeonId)||{},preferred=Array.isArray(d.boss?.preferredSpecies)?d.boss.preferredSpecies:[],master=F.buildPokemonSpeciesMaster();for(const name of preferred){const hit=master.records.find(sp=>sp.name===name);if(hit)return hit}const pool=F.enemySpeciesCandidates(dungeonId,floor).map(x=>x.species).filter(Boolean).sort((a,b)=>(Number(b.power)||0)-(Number(a.power)||0));return pool[0]||master.records.slice().sort((a,b)=>(Number(b.power)||0)-(Number(a.power)||0))[0]||null};
})();
// Updated: 2026-10-23 07:40 JST / Ver1.15
/* Updated: 2026-10-23 07:40 JST / Ver1.15 */

/* Updated: 2026-10-23 13:34 JST / Ver1.15 */

/* Updated: 2026-10-23 20:00 JST / Ver1.16 */

/* Updated: 2026-10-23 20:14 JST / Ver1.17 */
