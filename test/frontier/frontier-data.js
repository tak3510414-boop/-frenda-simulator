// Ver1.44: render the approved interior artwork with save-linked shop stock. Updated 2026-10-24 JST
/* Frenda Frontier Ver1.44 / approved interior layouts / Updated: 2026-10-24 */
(()=>{"use strict";
const F=window.FRENDA_FRONTIER=window.FRENDA_FRONTIER||{};
F.VERSION="1.76";
F.SHOP_CAPACITY=Object.freeze([0,3,4,5,6,6,9]);
F.shopCapacity=s=>F.SHOP_CAPACITY[Math.max(0,Math.min(6,Number(s?.development?.town?.facilities?.shop)||0))]||0;
F.SAVE_KEY="frenda:frontier:v1";
F.W=32;F.H=24;F.DUNGEON_VIEW_COLS=11;F.DUNGEON_VIEW_ROWS=9;F.BAG_LIMIT=10;
F.ITEMS=Object.freeze({
 wood:{id:"wood",icon:"🪵",name:"木材",kind:"素材",base:90,desc:"森で集めた丈夫な木材。"},
 herb:{id:"herb",icon:"🌿",name:"薬草",kind:"草",base:70,dungeonUse:"heal",effectText:"HP14・満腹度5回復",desc:"ダンジョンで使うとHPを14、満腹度を5回復する薬草。"},
 antidote_herb:{id:"antidote_herb",icon:"🍃",name:"解毒草",kind:"草",base:110,dungeonUse:"cure",effectText:"どく回復",cures:["poison"],desc:"どく状態を治す草。"},
 paralysis_herb:{id:"paralysis_herb",icon:"🌱",name:"しびれ取り草",kind:"草",base:120,dungeonUse:"cure",effectText:"まひ回復",cures:["paralysis"],desc:"まひ状態を治す草。"},
 wake_herb:{id:"wake_herb",icon:"🌼",name:"目覚め草",kind:"草",base:120,dungeonUse:"cure",effectText:"ねむり回復",cures:["sleep"],desc:"ねむり状態を治す草。"},
 clarity_herb:{id:"clarity_herb",icon:"🌿",name:"正気草",kind:"草",base:120,dungeonUse:"cure",effectText:"こんらん回復",cures:["confusion"],desc:"こんらん状態を治す草。"},
 panacea:{id:"panacea",icon:"💊",name:"万能薬",kind:"薬",base:360,dungeonUse:"cure",effectText:"状態異常を全回復",cures:["poison","paralysis","sleep","confusion"],desc:"どく・まひ・ねむり・こんらんをすべて治す珍しい薬。"},
 bread:{id:"bread",icon:"🍞",name:"パン",kind:"食料",base:100,dungeonUse:"food",effectText:"満腹度50回復",fullness:50,desc:"食べると満腹度を50回復する。"},
 big_bread:{id:"big_bread",icon:"🥖",name:"大きなパン",kind:"食料",base:200,dungeonUse:"food",effectText:"満腹度100回復",fullness:100,desc:"食べると満腹度を100回復する。"},
 survey_scroll:{id:"survey_scroll",icon:"📜",name:"探索の巻物",kind:"巻物",base:260,dungeonUse:"scroll",effectText:"この階の地形・床アイテム・宝箱を地図化",desc:"読むと現在の階の地形が青地図に一気に記録される。隠れた罠は見えない。"},
 sleep_scroll:{id:"sleep_scroll",icon:"📜",name:"眠りの巻物",kind:"巻物",base:300,dungeonUse:"scroll",effectText:"視界内の敵を眠らせる",desc:"読むと視界内の敵ポケモンを数ターン眠らせる。"},
 purify_scroll:{id:"purify_scroll",icon:"📜",name:"おはらいの巻物",kind:"巻物",base:360,dungeonUse:"scroll",effectText:"装備中の呪いを解除",desc:"読むと装備中の呪われた武器・防具・お守りの呪いを解く。"},
 spark_wand:{id:"spark_wand",icon:"🪄",name:"火花の杖",kind:"杖",base:340,dungeonUse:"wand",effectText:"向いている方向6マス・12ダメージ",desc:"向いている方向へ火花を飛ばす。×数は残り使用回数。壁で止まる。"},
 throw_stone:{id:"throw_stone",icon:"🪨",name:"投げ石",kind:"投げ物",base:45,dungeonUse:"throw",effectText:"向いている方向6マス・7ダメージ",desc:"向いている方向へ投げる。敵に当たれば7ダメージ。外しても1個なくなる。"},
 iron:{id:"iron",icon:"⛏️",name:"鉄のかけら",kind:"素材",base:140,desc:"少量だが価値のある鉱石。"},
 crystal:{id:"crystal",icon:"✨",name:"森の結晶",kind:"珍品",base:260,desc:"森の奥で時々見つかる不思議な結晶。"},
 oldtool:{id:"oldtool",icon:"🧰",name:"古びた道具",kind:"珍品",base:420,desc:"誰かが昔使っていた探検道具。"},
 forest_crest:{id:"forest_crest",icon:"🌿",name:"森の主の証",kind:"秘宝",base:1200,desc:"はじまりの森の最深部で森の主を退けた証。次の冒険への道を開く。"}
});


// Ver0.64: Human-adventurer equipment. Pokemon stay on the town side and do not accompany dungeon runs.
F.EQUIPMENT_SLOTS=Object.freeze([
 {id:"weapon",label:"武器",icon:"⚔️"},
 {id:"armor",label:"防具",icon:"🛡️"},
 {id:"charm",label:"お守り",icon:"🔸"}
]);
F.EQUIPMENT_DEFS=Object.freeze({
 wood_sword:{id:"wood_sword",slot:"weapon",icon:"🗡️",name:"木の剣",attack:3,defense:0,hp:0,weapon:{type:"sword",label:"剣",range:1,directions:8,accuracy:.95,power:1},desc:"開拓者の基本武器。周囲8方向の隣接マスを安定して攻撃できる。"},
 iron_sword:{id:"iron_sword",slot:"weapon",icon:"⚔️",name:"鉄の剣",attack:6,defense:0,hp:0,weapon:{type:"sword",label:"剣",range:1,directions:8,accuracy:.96,power:1.06},desc:"木の剣より高威力な正統派の剣。周囲8方向の隣接攻撃。"},
 wood_spear:{id:"wood_spear",slot:"weapon",icon:"🔱",name:"木の槍",attack:4,defense:0,hp:0,weapon:{type:"spear",label:"槍",range:2,directions:4,accuracy:.92,power:1},desc:"隣接8方向に加え、上下左右なら2マス先まで突ける。"},
 hunter_bow:{id:"hunter_bow",slot:"weapon",icon:"🏹",name:"狩人の弓",attack:3,defense:0,hp:0,weapon:{type:"bow",label:"弓",range:4,directions:8,accuracy:.88,power:.92},desc:"直線8方向の4マス先まで射てる。壁や敵を貫通しない。"},
 iron_hammer:{id:"iron_hammer",slot:"weapon",icon:"🔨",name:"鉄のハンマー",attack:8,defense:0,hp:0,weapon:{type:"hammer",label:"ハンマー",range:1,directions:8,accuracy:.82,power:1.32},desc:"隣接攻撃のみ。命中は低めだが当たれば大ダメージ。"},
 traveler_clothes:{id:"traveler_clothes",slot:"armor",icon:"🥋",name:"旅人の服",attack:0,defense:2,hp:0,desc:"動きやすい旅装。最低限の防御力がある。"},
 leather_armor:{id:"leather_armor",slot:"armor",icon:"🛡️",name:"革のよろい",attack:0,defense:5,hp:0,desc:"野外探索向けの軽い防具。受けるダメージをしっかり抑える。"},
 iron_armor:{id:"iron_armor",slot:"armor",icon:"🛡️",name:"鉄のよろい",attack:0,defense:8,hp:2,damageReduction:1,desc:"重いが頑丈な防具。防御が高く、被ダメージをさらに1軽減する。"},
 traveler_charm:{id:"traveler_charm",slot:"charm",icon:"🧿",name:"旅のお守り",attack:0,defense:0,hp:5,foodSaveEvery:6,desc:"最大HP+5。満腹度の減少を時々抑える。"},
 forest_charm:{id:"forest_charm",slot:"charm",icon:"🍃",name:"森のお守り",attack:1,defense:1,hp:4,damageReduction:1,desc:"攻撃+1・防御+1・最大HP+4。被ダメージを1軽減する。"},
 hunter_charm:{id:"hunter_charm",slot:"charm",icon:"🎯",name:"狩人のお守り",attack:0,defense:0,hp:2,accuracyBonus:.08,criticalBonus:.04,desc:"最大HP+2。武器の命中率+8%、急所率+4%。"}
});
F.STARTER_EQUIPMENT=Object.freeze({
 owned:{wood_sword:1,traveler_clothes:1,traveler_charm:1},
 equipped:{weapon:"wood_sword",armor:"traveler_clothes",charm:"traveler_charm"}
});
F.DUNGEON_EQUIPMENT_TABLE=Object.freeze([
 {equipment:"leather_armor",weight:30,minFloor:1},
 {equipment:"wood_spear",weight:24,minFloor:3},
 {equipment:"iron_sword",weight:20,minFloor:6},
 {equipment:"forest_charm",weight:15,minFloor:8},
 {equipment:"hunter_bow",weight:18,minFloor:10},
 {equipment:"hunter_charm",weight:12,minFloor:12},
 {equipment:"iron_hammer",weight:10,minFloor:16},
 {equipment:"iron_armor",weight:9,minFloor:20}
]);
F.equipment=id=>F.EQUIPMENT_DEFS?.[id]||null;
F.equipmentBySlot=slot=>Object.values(F.EQUIPMENT_DEFS||{}).filter(x=>x.slot===slot);

// Ver0.93: individual equipment can carry a hidden trait and/or curse. Unknown properties are revealed by trying to equip it.
F.EQUIPMENT_TRAITS=Object.freeze({
 fierce:{id:"fierce",name:"猛攻",slots:["weapon"],attack:2,desc:"攻撃+2"},
 precise:{id:"precise",name:"精密",slots:["weapon"],accuracyBonus:.05,desc:"命中率+5%"},
 critical:{id:"critical",name:"会心",slots:["weapon"],criticalBonus:.04,desc:"急所率+4%"},
 sturdy:{id:"sturdy",name:"堅牢",slots:["armor"],defense:2,desc:"防御+2"},
 vitality:{id:"vitality",name:"活力",slots:["armor"],hp:5,desc:"最大HP+5"},
 barrier:{id:"barrier",name:"鉄壁",slots:["armor"],damageReduction:1,desc:"受けるダメージをさらに1軽減"},
 blessing:{id:"blessing",name:"加護",slots:["charm"],hp:4,desc:"最大HP+4"},
 lucky:{id:"lucky",name:"幸運",slots:["charm"],criticalBonus:.04,desc:"急所率+4%"},
 frugal:{id:"frugal",name:"節食",slots:["charm"],foodSaveEvery:4,desc:"満腹度の減少をより抑えやすい"}
});
F.equipmentTrait=id=>F.EQUIPMENT_TRAITS?.[id]||null;
F.equipmentInstanceView=inst=>{
 const raw=typeof inst==="string"?{defId:inst,plus:0,identified:true}:inst||{},d=F.equipment?.(raw.defId||raw.id);
 if(!d)return null;
 const plus=Math.max(0,Math.min(99,Math.floor(Number(raw.plus)||0))),identified=raw.identified!==false,cursed=!!raw.cursed,trait=F.equipmentTrait?.(raw.traitId),validTrait=trait&&Array.isArray(trait.slots)&&trait.slots.includes(d.slot)?trait:null;
 const out=Object.assign({},d,{uid:raw.uid||null,defId:d.id,plus,baseName:d.name,identified,cursed,traitId:validTrait?.id||null,trait:validTrait||null});
 if(d.slot==="weapon")out.attack=(Number(d.attack)||0)+plus;
 if(d.slot==="armor")out.defense=(Number(d.defense)||0)+plus;
 if(validTrait){
  for(const k of ["attack","defense","hp","accuracyBonus","criticalBonus","damageReduction"])out[k]=(Number(out[k])||0)+(Number(validTrait[k])||0);
  if(Number(validTrait.foodSaveEvery)>0)out.foodSaveEvery=out.foodSaveEvery?Math.min(Number(out.foodSaveEvery),Number(validTrait.foodSaveEvery)):Number(validTrait.foodSaveEvery);
 }
 out.name=`${identified&&cursed?"💀 ":""}${d.name}${plus>0?`+${plus}`:""}${identified&&validTrait?`〈${validTrait.name}〉`:""}`;
 out.traitText=identified&&validTrait?validTrait.desc:"";
 out.curseText=identified&&cursed?"呪い：ダンジョン中は通常の装備変更では外せない。":"";
 return out;
};
F.equipmentInstancePreview=inst=>{
 const raw=typeof inst==="string"?{defId:inst,plus:0,identified:true}:inst||{};
 if(raw.identified!==false)return F.equipmentInstanceView(raw);
 const d=F.equipmentInstanceView(Object.assign({},raw,{traitId:null,cursed:false,identified:true}));
 if(d){d.identified=false;d.name=`${d.baseName}${d.plus>0?`+${d.plus}`:""}`;d.trait=null;d.traitId=null;d.traitText="";d.curseText="";}
 return d;
};
F.equipmentInstanceName=inst=>F.equipmentInstanceView(inst)?.name||"不明な装備";

F.GATHER_TABLE=Object.freeze([
 {item:"wood",weight:30,min:1,max:2},{item:"herb",weight:20,min:1,max:2},{item:"bread",weight:18,min:1,max:1},{item:"big_bread",weight:5,min:1,max:1},{item:"iron",weight:15,min:1,max:1},{item:"crystal",weight:6,min:1,max:1},
 {item:"antidote_herb",weight:5,min:1,max:1},{item:"paralysis_herb",weight:4,min:1,max:1},{item:"wake_herb",weight:3,min:1,max:1},{item:"clarity_herb",weight:4,min:1,max:1},{item:"panacea",weight:1,min:1,max:1},{item:"survey_scroll",weight:4,min:1,max:1},{item:"sleep_scroll",weight:3,min:1,max:1},{item:"purify_scroll",weight:2,min:1,max:1},{item:"spark_wand",weight:3,min:2,max:4},{item:"throw_stone",weight:8,min:2,max:4}
]);
// Ver0.76: 宝箱の空腹回復は数値直回復をやめ、パン系アイテムとして手に入る。
F.DUNGEON_CHEST_TABLE=Object.freeze([
 {kind:"item",item:"wood",weight:24,min:1,max:2},
 {kind:"item",item:"herb",weight:22,min:1,max:2},
 {kind:"item",item:"iron",weight:15,min:1,max:1},
 {kind:"item",item:"crystal",weight:6,min:1,max:1},
 {kind:"item",item:"bread",weight:10,min:1,max:1},
 {kind:"item",item:"big_bread",weight:3,min:1,max:1},
 {kind:"item",item:"antidote_herb",weight:4,min:1,max:1},
 {kind:"item",item:"paralysis_herb",weight:3,min:1,max:1},
 {kind:"item",item:"wake_herb",weight:3,min:1,max:1},
 {kind:"item",item:"clarity_herb",weight:3,min:1,max:1},
 {kind:"item",item:"panacea",weight:1,min:1,max:1},
 {kind:"item",item:"survey_scroll",weight:3,min:1,max:1},
 {kind:"item",item:"sleep_scroll",weight:2,min:1,max:1},
 {kind:"item",item:"purify_scroll",weight:2,min:1,max:1},
 {kind:"item",item:"spark_wand",weight:3,min:2,max:4},
 {kind:"item",item:"throw_stone",weight:5,min:2,max:4},
 {kind:"heal",weight:11,min:5,max:9},
 {kind:"equipment",weight:9}
]);

// Ver0.76: Hidden floor traps. They are not shown by sight alone; stepping on one reveals and activates it.
F.DUNGEON_TRAP_DEFS=Object.freeze({
 stumble:{id:"stumble",name:"転びの罠",icon:"↯",weight:30,effect:"stumble",power:1,minFloor:1,desc:"踏むと転び、持ち物を1個近くへ落とすことがある。"},
 thorn:{id:"thorn",name:"トゲの罠",icon:"✹",weight:35,effect:"damage",power:4,minFloor:1,desc:"踏むと足元からトゲが飛び出して少量のダメージを受ける。"},
 hunger:{id:"hunger",name:"空腹の罠",icon:"▽",weight:25,effect:"fullness",power:10,minFloor:1,desc:"踏むと満腹度が10減る。"},
 warp:{id:"warp",name:"ワープの罠",icon:"◎",weight:15,effect:"warp",power:0,minFloor:1,desc:"踏むと同じ階の別の場所へ飛ばされる。"},
 poison:{id:"poison",name:"どくの罠",icon:"☠",weight:18,effect:"status",statusId:"poison",minFloor:6,desc:"B6F以降に出現。踏むとどく状態になる。"},
 paralysis:{id:"paralysis",name:"まひの罠",icon:"⚡",weight:14,effect:"status",statusId:"paralysis",minFloor:11,desc:"B11F以降に出現。踏むとまひ状態になる。"},
 sleep:{id:"sleep",name:"ねむりの罠",icon:"☾",weight:10,effect:"status",statusId:"sleep",minFloor:16,desc:"B16F以降に出現。踏むとねむり状態になる。"}
});
F.dungeonTrap=id=>F.DUNGEON_TRAP_DEFS?.[id]||null;
F.DUNGEON_TRAP_TABLE=Object.freeze(Object.values(F.DUNGEON_TRAP_DEFS).map(t=>({weight:t.weight,value:t.id})));
F.dungeonTrapTable=(floor=1,dungeonId=F.DEFAULT_DUNGEON_ID)=>{const b=F.dungeonBalance?.(dungeonId,floor)||{},nf=Math.max(1,Number(b.normalizedFloor)||Number(floor)||1);return Object.values(F.DUNGEON_TRAP_DEFS).filter(t=>nf>=Math.max(1,Number(t.minFloor)||1)&&(!Number(t.maxFloor)||nf<=Number(t.maxFloor))).map(t=>({weight:t.weight,value:t.id}))};

// Ver0.50: 町・ダンジョン・ショップで共通利用する時間・経済・ダンジョン定義。
// 実時間には連動せず、ゲーム内の大きな行動で時間帯が進む。
F.TIME_PHASES=Object.freeze([
 {id:"morning",label:"朝",icon:"🌅"},{id:"day",label:"昼",icon:"☀️"},{id:"evening",label:"夕方",icon:"🌇"},{id:"night",label:"夜",icon:"🌙"}
]);
F.TIME_ACTION_COSTS=Object.freeze({adventureReturn:2,shopOpen:1,rest:1});
F.ECONOMY_RULES=Object.freeze({currency:"G",startCoins:80,shelfBase:3,customerBase:4,developmentPerSale:2,developmentPerAdventure:2});
// Ver0.72: 不思議のダンジョン系を基準に、最初のダンジョンも「最深部を目指す深い構成」にする。
// Ver0.96: 全ダンジョン共通の難度Tier＋深度カーブ。後続ダンジョンを追加しても第1ダンジョンの数値を作り直さない構造にする。
F.DUNGEON_TIER_DEFS=Object.freeze({
 tier1:Object.freeze({id:"tier1",short:"T1",name:"基礎",role:"最初の標準ダンジョン",globalDepthOffset:0,enemyHpRate:1.00,enemyAtkRate:1.00,enemyCountBonus:0,rarityBonus:0,plusOffset:0,plusCap:5,traitBonus:0,curseBonus:0,gatherRate:1.00,chestBonus:0,trapRate:1.00,recommendedPlus:"+0〜+5"}),
 tier2:Object.freeze({id:"tier2",short:"T2",name:"応用",role:"第2標準ダンジョン想定",globalDepthOffset:18,enemyHpRate:1.03,enemyAtkRate:1.03,enemyCountBonus:1,rarityBonus:1,plusOffset:2,plusCap:7,traitBonus:.03,curseBonus:.02,gatherRate:.95,chestBonus:0,trapRate:1.10,recommendedPlus:"+2〜+7"}),
 tier3:Object.freeze({id:"tier3",short:"T3",name:"上級",role:"第3標準ダンジョン想定",globalDepthOffset:32,enemyHpRate:1.06,enemyAtkRate:1.06,enemyCountBonus:1,rarityBonus:1,plusOffset:4,plusCap:9,traitBonus:.05,curseBonus:.03,gatherRate:.90,chestBonus:0,trapRate:1.20,recommendedPlus:"+4〜+9"}),
 tier4:Object.freeze({id:"tier4",short:"T4",name:"最深級",role:"高難度標準ダンジョン想定",globalDepthOffset:44,enemyHpRate:1.09,enemyAtkRate:1.09,enemyCountBonus:2,rarityBonus:1,plusOffset:5,plusCap:10,traitBonus:.07,curseBonus:.04,gatherRate:.85,chestBonus:0,trapRate:1.32,recommendedPlus:"+5〜+10"})
});
// 6段階の「ダンジョン内進行カーブ」。実際の階数に正規化して使うため、30階以外にも再利用できる。
F.DUNGEON_DEPTH_CURVE=Object.freeze([
 Object.freeze({id:"entry",label:"序盤",enemyMaxRarity:0,enemyBase:5,hpRate:1.00,atkRate:1.00,traitChance:.14,curseChance:.05,plusBias:0}),
 Object.freeze({id:"inner",label:"中盤1",enemyMaxRarity:1,enemyBase:6,hpRate:1.05,atkRate:1.04,traitChance:.20,curseChance:.08,plusBias:0}),
 Object.freeze({id:"deep",label:"中盤2",enemyMaxRarity:1,enemyBase:6,hpRate:1.10,atkRate:1.08,traitChance:.25,curseChance:.10,plusBias:1}),
 Object.freeze({id:"ancient",label:"後半1",enemyMaxRarity:2,enemyBase:7,hpRate:1.16,atkRate:1.14,traitChance:.30,curseChance:.12,plusBias:1}),
 Object.freeze({id:"abyss",label:"後半2",enemyMaxRarity:2,enemyBase:7,hpRate:1.23,atkRate:1.17,traitChance:.35,curseChance:.14,plusBias:2}),
 Object.freeze({id:"core",label:"最深部",enemyMaxRarity:3,enemyBase:8,hpRate:1.32,atkRate:1.22,traitChance:.40,curseChance:.16,plusBias:2})
]);
// 旧API互換：はじまりの森では従来どおり5階ごとの6帯域として見える。
F.DUNGEON_FLOOR_BANDS=Object.freeze(F.DUNGEON_DEPTH_CURVE.map((b,i)=>Object.freeze({...b,from:i*5+1,to:(i+1)*5,label:["森の入口","森の中腹","深い森","古樹の森","森の深奥","最深部"][i]})));
F.DUNGEON_DEFS=Object.freeze([
 {id:"beginner_forest",name:"はじまりの森",icon:"🌲",maxFloor:30,balanceTier:"tier1",depthLabels:["森の入口","森の中腹","深い森","古樹の森","森の深奥","最深部"],progressionRole:"基準ダンジョン",bagLimit:10,startFullness:100,fullnessMax:100,fullnessTickEvery:10,naturalHealEvery:5,escapeCount:1,gatherTable:"default",enemyRules:{biome:"forest"},boss:{title:"森の主",preferredSpecies:["オーロット","ドダイトス","ゴリランダー","ジュナイパー"],hpRate:2.2,atkRate:1.14},clearReward:{itemId:"oldtool",qty:1},bossReward:{itemId:"forest_crest",qty:1},unlock:{type:"always"},description:"人間の開拓者が挑む30階の基準ダンジョン。B30Fの森の主を退け、最深部を踏破しよう。"},
 {id:"rocky_cave",name:"岩山の洞窟",icon:"⛰️",maxFloor:30,balanceTier:"tier2",depthLabels:["岩場の入口","乾いた洞路","鉱脈地帯","崩落区画","深部坑道","地底最深部"],progressionRole:"第2ダンジョン",bagLimit:10,startFullness:100,fullnessMax:100,fullnessTickEvery:10,naturalHealEvery:5,escapeCount:1,gatherTable:"default",enemyRules:{biome:"mountain"},unlock:{type:"clear",dungeonId:"beginner_forest"},implementationStatus:"preview",description:"はじまりの森踏破後に見つかる第2ダンジョン。T2想定。内容は次段階で実装する。"}
]);
F.dungeonDef=id=>(F.DUNGEON_DEFS||[]).find(d=>d.id===id)||null;
F.DEFAULT_DUNGEON_ID="beginner_forest";
F.dungeonClearCount=(s,id)=>Math.max(0,Number(s?.dungeons?.cleared?.[id]?.count)||0);
F.dungeonCleared=(s,id)=>F.dungeonClearCount(s,id)>0;
F.dungeonUnlocked=(s,dungeonOrId)=>{const d=typeof dungeonOrId==="object"?dungeonOrId:F.dungeonDef?.(dungeonOrId);if(!d)return false;const u=d.unlock||{type:"always"};if(u.type==="always")return true;if(u.type==="clear")return F.dungeonCleared(s,u.dungeonId);return false};
F.dungeonPlayable=(s,dungeonOrId)=>{const d=typeof dungeonOrId==="object"?dungeonOrId:F.dungeonDef?.(dungeonOrId);return !!d&&F.dungeonUnlocked(s,d)&&d.implementationStatus!=="preview"};

F.dungeonTierDef=id=>F.DUNGEON_TIER_DEFS?.[id]||F.DUNGEON_TIER_DEFS?.tier1||null;
F.dungeonBalance=(dungeonId=F.DEFAULT_DUNGEON_ID,floor=1)=>{
 const d=F.dungeonDef?.(dungeonId)||F.dungeonDef?.(F.DEFAULT_DUNGEON_ID)||{},tier=F.dungeonTierDef?.(d.balanceTier)||F.DUNGEON_TIER_DEFS.tier1,curve=F.DUNGEON_DEPTH_CURVE||[],maxFloor=Math.max(1,Number(d.maxFloor)||30),f=Math.max(1,Math.min(maxFloor,Number(floor)||1));
 const progress=maxFloor<=1?0:(f-1)/(maxFloor-1),phaseIndex=Math.min(Math.max(0,curve.length-1),Math.floor(progress*curve.length)),phase=curve[phaseIndex]||curve[0]||{},normalizedFloor=maxFloor<=1?1:1+Math.round(progress*29),withinBand=(normalizedFloor-1)%5;
 const label=Array.isArray(d.depthLabels)&&d.depthLabels[phaseIndex]?d.depthLabels[phaseIndex]:(phase.label||""),effectiveDepth=normalizedFloor+Math.max(0,Number(tier.globalDepthOffset)||0);
 return {...phase,label,phaseIndex,normalizedFloor,withinBand,effectiveDepth,tierId:tier.id,tierShort:tier.short,tierName:tier.name,tierRole:tier.role,recommendedPlus:tier.recommendedPlus,enemyMaxRarity:Math.max(0,Math.min(3,(Number(phase.enemyMaxRarity)||0)+(Number(tier.rarityBonus)||0))),enemyBase:Math.max(1,(Number(phase.enemyBase)||5)+(Number(tier.enemyCountBonus)||0)),hpRate:(Number(phase.hpRate)||1)*(Number(tier.enemyHpRate)||1),atkRate:(Number(phase.atkRate)||1)*(Number(tier.enemyAtkRate)||1),traitChance:Math.max(0,Math.min(.65,(Number(phase.traitChance)||0)+(Number(tier.traitBonus)||0))),curseChance:Math.max(0,Math.min(.28,(Number(phase.curseChance)||0)+(Number(tier.curseBonus)||0))),plusOffset:Math.max(0,Number(tier.plusOffset)||0),plusCap:Math.max(0,Number(tier.plusCap)||5),gatherRate:Math.max(.5,Number(tier.gatherRate)||1),chestBonus:Math.floor(Number(tier.chestBonus)||0),trapRate:Math.max(.5,Number(tier.trapRate)||1)};
};
F.dungeonFloorBand=(floor,dungeonId=F.DEFAULT_DUNGEON_ID)=>F.dungeonBalance?.(dungeonId,floor)||null;
F.SHOP_RULES=Object.freeze({baseCustomers:4,maxPriceMultiplier:3,minPrice:1});

// Ver0.33: 施設は選んだ瞬間に完成させず、予定地→資材→骨組み→仕上げ→完成を共通工程として持つ。
F.CONSTRUCTION_PHASES=Object.freeze([
 {id:"planned",label:"建設予定地",icon:"📍",progress:0.12},
 {id:"materials",label:"基礎・資材搬入",icon:"🪵",progress:0.35},
 {id:"frame",label:"柱・骨組み工事",icon:"🛠️",progress:0.62},
 {id:"finishing",label:"屋根・仕上げ工事",icon:"🏗️",progress:0.86}
]);

// Ver0.33: 工事中の見た目は正式ピクセルアート素材を共通アトラスから描画する。
// 新施設は visualSet を追加すれば本体描画ロジックを変更せず拡張できる。
F.CONSTRUCTION_VISUALS=Object.freeze({
 default:{asset:"frontier-asset-construction-v033.png",frameW:220,frameH:190,frames:{planned:0,materials:1,frame:2,finishing:3}},
});
// 工程ごとに現場の当たり判定の広がりも変える。
F.CONSTRUCTION_NAV_PHASES=Object.freeze({
 planned:{inset:24},materials:{inset:16},frame:{inset:9},finishing:{inset:6}
});

// Ver1.16: one layout is shared by construction, rendering and collision.
F.FACILITY_SITES=Object.freeze({
 shop:{areaId:"core",x:54,y:90,w:205,h:170,entrance:{x:156,y:282}},
 house:{areaId:"core",x:325,y:66,w:178,h:158,entrance:{x:324,y:270}},
 owner_home:{areaId:"core",x:590,y:240,w:60,h:100,entrance:{x:655,y:358}},
 forge:{areaId:"core",x:365,y:330,w:165,h:145,entrance:{x:315,y:498}},
 market:{areaId:"core",x:60,y:350,w:165,h:135,entrance:{x:275,y:510}},
 adventure_board:{areaId:"core",x:470,y:235,w:65,h:65,entrance:{x:445,y:318}},
 plaza:{areaId:"core",x:280,y:340,w:62,h:70,entrance:{x:310,y:438}},
 warehouse:{areaId:"core",x:650,y:150,w:190,h:160,entrance:{x:745,y:328}},
 inn:{areaId:"core",x:650,y:390,w:210,h:190,entrance:{x:755,y:598}},
 bank:{areaId:"core",x:870,y:180,w:110,h:130,entrance:{x:925,y:328}}
});
F.SINGLE_TOWN_SCENE=Object.freeze({
 scene:{w:1127,h:842,cell:12},worldRect:{x:0,y:0,w:1000,h:842},spawn:{x:295,y:420},
 bridge:{x:170,y:585,w:190,h:150},campfire:{x:535,y:567,r:22},
 borderBlocks:[{shape:"rect",v:[0,0,42,842],reason:"west_forest"},{shape:"rect",v:[980,0,20,842],reason:"east_forest"},{shape:"rect",v:[0,0,1000,35],reason:"north_forest"},{shape:"rect",v:[0,630,1000,212],reason:"river"}],
 publicWalk:[{shape:"rect",v:[185,585,160,257],reason:"bridge_and_south_path"}]
});
F.facilitySite=id=>F.FACILITY_SITES?.[id]||null;

// Ver0.28: 施設はマスター定義で管理する。今後、新施設を追加しても町本体のロジックを増やさず、
// この定義と対応する表示レイヤーを追加すれば拡張できる構造にする。
F.FACILITY_DEFS=Object.freeze([
 {id:"shop",name:"店",icon:"🏪",category:"commerce",areaTagsAny:["commerce","road","core"],constructionVisualSet:"default",startLevel:0,maxLevel:6,route:"commerce",levels:{
   1:{actionId:"shop1",need:0,label:"最初の露店を作る",desc:"野営地のそばに、暮らしと売り場を兼ねた小さな店を開く。棚3枠。"},
   2:{actionId:"shop2",need:12,label:"店を少し広げる",desc:"店舗兼住宅を増築し、棚を4枠にする。"},
   3:{actionId:"shop3",need:32,label:"売場と住居を広げる",desc:"同じ建物の中で売場を広げ、棚を5枠にする。"},
   4:{actionId:"shop4",need:55,label:"本格店舗へ増築",desc:"町マップの区画内で1階を広げ、棚を6枠にする。"},
   5:{actionId:"shop5",need:70,label:"店舗兼住宅を整える",desc:"店舗の外形を保ち、棚6枠と居住区画を使いやすく整える。"},
   6:{actionId:"shop6",need:85,label:"店舗専用化・隣に専用住宅を建てる",desc:"店舗の外形は縮めず、住居部分を売場に転換して棚を9枠にする。同時に隣の区画へ専用住宅を建てる。"}
 }},
 {id:"forge",name:"鍛冶屋",icon:"⚒️",category:"craft",areaTagsAny:["forge","rock","craft","core"],constructionVisualSet:"default",startLevel:0,maxLevel:6,route:"forge",levels:{
   1:{actionId:"forge",need:12,label:"小さな鍛冶屋を作る",desc:"炉1・金床1・作業台1の小さな作業場。"},
   2:{actionId:"forge2",need:34,label:"素材棚を整える",desc:"炉・金床・作業台を保ち、素材棚を追加する。"},
   3:{actionId:"forge3",need:58,label:"冷却場を作る",desc:"金床を2台に増やし、水槽を備える。"},
   4:{actionId:"forge4",need:75,label:"炉を増やす",desc:"炉2・金床2にして、素材置場を区切る。"},
   5:{actionId:"forge5",need:95,label:"受付と展示を整える",desc:"作業台を2台にし、受付と完成装備の展示棚を設ける。"},
   6:{actionId:"forge6",need:120,label:"鍛冶工房を完成",desc:"炉2・金床3・作業台2・倉庫を備えた一階建て工房。"}
 }},
 {id:"house",name:"住居",icon:"🏠",category:"life",areaTagsAny:["life","residential","core"],constructionVisualSet:"default",startLevel:0,maxLevel:6,route:"life",levels:{
   1:{actionId:"house",need:14,label:"職人の住居を建てる",desc:"鍛冶職人が定住できる家を用意する。"},
   2:{actionId:"house2",need:36,label:"職人の住居を拡張する",desc:"家族と道具のための部屋を広げる。"},
   3:{actionId:"house3",need:60,label:"生活区画を整える",desc:"生活設備を整える。住宅の棟数は増やさない。"},
   4:{actionId:"house4",need:76,label:"居間を広げる",desc:"一階の面積を広げ、居間と寝室を分ける。"},
   5:{actionId:"house5",need:96,label:"家族の部屋を整える",desc:"寝室と収納を増やした住居。"},
   6:{actionId:"house6",need:120,label:"住居を完成させる",desc:"広い居間、台所、収納、寝室を備える最終形。"}
 }},
 {id:"owner_home",name:"店主の専用住宅",icon:"🏡",category:"life",startLevel:0,maxLevel:1,route:"life",autoBuild:true,levels:{1:{actionId:"owner_home",need:9999,label:"店主の専用住宅",desc:"店Lv6の完成と同時に、町の空き区画へ建つ独立した住居。"}}},
 {id:"market",name:"市場",icon:"🧺",category:"commerce",areaTagsAny:["commerce","road","logistics"],constructionVisualSet:"default",startLevel:0,maxLevel:2,route:"commerce",levels:{
   1:{actionId:"market",need:18,label:"小さな市場を開く",desc:"旅商人が立ち寄れる露店スペースを作る。"},
   2:{actionId:"market2",need:42,label:"市場を拡張する",desc:"複数の商人が店を出せる市場へ育てる。"}
 }},
 {id:"adventure_board",name:"冒険掲示板",icon:"📜",category:"adventure",areaTagsAny:["adventure","nature","core"],constructionVisualSet:"default",startLevel:0,maxLevel:2,route:"adventure",levels:{
   1:{actionId:"adventure_board",need:14,label:"冒険掲示板を置く",desc:"旅人や冒険者が情報を交換できる掲示板を設置する。"},
   2:{actionId:"adventure_board2",need:38,label:"冒険者の詰所を整える",desc:"冒険者が集まる場所へ発展させる。"}
 }},
 {id:"plaza",name:"広場",icon:"⛲",category:"civic",areaTagsAny:["core","life","civic"],constructionVisualSet:"default",startLevel:0,maxLevel:2,route:"standard",levels:{
   1:{actionId:"plaza",need:24,label:"小さな広場を整える",desc:"人が集まれる空間を整備する。噴水はこの段階以降に現れる。"},
   2:{actionId:"plaza2",need:48,label:"広場を拡張する",desc:"町の中心となる広場へ発展させる。"}
 }},
 {id:"warehouse",name:"倉庫",icon:"📦",startLevel:0,maxLevel:2,route:"commerce",levels:{1:{actionId:"warehouse",need:12,label:"店の隣に倉庫を作る",desc:"売る品と次の冒険へ残す品を整理できる倉庫。"},2:{actionId:"warehouse2",need:36,label:"倉庫を増築する",desc:"保管場所と作業場を広げる。"}}},
 {id:"inn",name:"酒場兼宿屋",icon:"🍺",startLevel:0,maxLevel:6,route:"life",levels:{
   1:{actionId:"inn",need:28,label:"小さな酒場兼宿屋を建てる",desc:"客席4席・ベッド1床。"},
   2:{actionId:"inn2",need:55,label:"酒場を広げる",desc:"客席8席・ベッド1床。"},
   3:{actionId:"inn3",need:70,label:"客室を増やす",desc:"客席8席・ベッド2床。"},
   4:{actionId:"inn4",need:85,label:"宿泊棟を増築",desc:"客席12席・ベッド3床。"},
   5:{actionId:"inn5",need:105,label:"酒場兼宿屋を拡張",desc:"客席16席・ベッド4床。"},
   6:{actionId:"inn6",need:125,label:"酒場兼宿屋を完成",desc:"客席20席・ベッド6床の最終規模。"}
 }},
 {id:"bank",name:"預かり所",icon:"💰",startLevel:0,maxLevel:1,route:"commerce",levels:{1:{actionId:"bank",need:40,label:"お金の預かり所を開く",desc:"次の冒険へ持ち出さないお金を預ける。"}}}

]);


F.TOWN_GROWTH_STAGES=Object.freeze([
 {id:'camp',label:'① 野営開始',facilities:{},points:2,residents:0},
 {id:'stall',label:'② 最初の店',facilities:{shop:1},points:6,residents:0},
 {id:'shop2',label:'③ 店と暮らし',facilities:{shop:2},points:14,residents:0},
 {id:'warehouse',label:'④ 倉庫の完成',facilities:{shop:2,warehouse:1},points:20,residents:0},
 {id:'craft',label:'⑤ 職人の定住',facilities:{shop:2,warehouse:1,forge:1,house:1},points:28,residents:1},
 {id:'tavern',label:'⑥ 旅人の集まる場所',facilities:{shop:2,warehouse:1,forge:1,house:1,market:1,inn:1,adventure_board:1},points:40,residents:1},
 {id:'hub',label:'⑦ 冒険の拠点',facilities:{shop:3,warehouse:2,forge:2,house:1,market:1,inn:1,adventure_board:2,bank:1,plaza:1},points:55,residents:2},
 {id:'complete',label:'⑧ 発展した町',facilities:{shop:6,owner_home:1,warehouse:2,forge:6,house:6,market:2,inn:6,adventure_board:2,bank:1,plaza:2},points:80,residents:2}
]);
F.TOWN_BUILD_RULES=Object.freeze({
 shop1:{coins:40,items:{wood:2},story:'firstReturn'},shop2:{coins:120,items:{wood:5},requires:{shop:1},story:'firstSale'},
 warehouse:{coins:100,items:{wood:5},requires:{shop:2}},house:{coins:100,items:{wood:5},requires:{warehouse:1}},forge:{coins:160,items:{wood:3,iron:2},requires:{warehouse:1,house:1}},
 market:{coins:120,items:{wood:4},requires:{forge:1},residents:1},adventure_board:{coins:60,items:{wood:2},requires:{forge:1},residents:1},inn:{coins:200,items:{wood:8},requires:{market:1,adventure_board:1}},
 shop3:{coins:250,items:{wood:8},requires:{inn:1}},warehouse2:{coins:180,items:{wood:6,iron:2},requires:{inn:1}},bank:{coins:220,items:{wood:4,iron:3},requires:{shop:3,warehouse:2}},plaza:{coins:160,items:{iron:2},requires:{inn:1}},
 shop4:{coins:400,items:{wood:10,iron:5},requires:{bank:1}},shop5:{coins:600,items:{wood:14,iron:6},requires:{shop:4,bank:1}},shop6:{coins:900,items:{wood:18,iron:8},requires:{shop:5,warehouse:2}},forge2:{coins:200,items:{iron:4},requires:{inn:1}},forge3:{coins:350,items:{iron:6},requires:{bank:1}},forge4:{coins:500,items:{iron:8,wood:8},requires:{forge:3}},forge5:{coins:750,items:{iron:12,wood:12},requires:{forge:4}},forge6:{coins:1100,items:{iron:16,wood:16},requires:{forge:5}},inn2:{coins:300,items:{wood:10},requires:{bank:1}},inn3:{coins:400,items:{wood:12},requires:{inn:2}},inn4:{coins:600,items:{wood:16},requires:{inn:3}},inn5:{coins:850,items:{wood:20},requires:{inn:4}},inn6:{coins:1200,items:{wood:24},requires:{inn:5}},plaza2:{coins:250,items:{iron:4},requires:{bank:1}},
 house2:{coins:180,items:{wood:6},requires:{inn:1}},house3:{coins:300,items:{wood:10},requires:{bank:1}},house4:{coins:420,items:{wood:12,iron:2},requires:{house:3}},house5:{coins:620,items:{wood:16,iron:3},requires:{house:4}},house6:{coins:900,items:{wood:20,iron:5},requires:{house:5}},market2:{coins:200,items:{wood:6},requires:{inn:1}},adventure_board2:{coins:120,items:{wood:4},requires:{inn:1}}
});

// Ver0.38: 全体マップの「形」より先に、今後増えるエリアを同じ規格で扱える世界構造を定義する。
// ここで固定するのはエリアの役割・地形特性・接続能力・収容量など。道路や建物のピクセル座標はまだ固定しない。
F.TOWN_WORLD_DEF=Object.freeze({
 id:"frontier_town",layoutRevision:6,status:"single-town",startArea:"core",coordinateMode:"single-map",
 sceneMode:"single-growing-town",transitionMode:"none",preloadNeighbors:0,hardAreaLimit:1,
 extensible:false,structureVersion:7,
 description:"初代トルネコ型。拠点は1つだけで、冒険と商売の成果に応じて同じ町の建物・施設・景観が段階的に発展する。別町への移動は行わない。"
});
F.TOWN_SCENE_POLICY=Object.freeze({
 mode:"single-growing-town",localSceneDefault:{w:717,h:842},preloadNeighborDepth:0,
 unloadDistantScenes:false,keepLogicalState:true,transition:"none",
 areaSchemaVersion:3,zoneModel:"single-town-layers",note:"1つの町マップを使い続け、発展段階に応じて施設・景観レイヤーと通行域を更新する。"
});

// Ver0.38: エリアの広さは固定1種類にしない。施設密度・NPC数・移動距離の目安として使う。
F.AREA_SIZE_CLASSES=Object.freeze({
 compact:{id:"compact",label:"小区画",icon:"▫️",sceneScale:0.78,facilitySlots:3,landmarkSlots:0,residentCapacity:5,traffic:"low"},
 standard:{id:"standard",label:"標準区画",icon:"◻️",sceneScale:1.00,facilitySlots:5,landmarkSlots:1,residentCapacity:10,traffic:"medium"},
 wide:{id:"wide",label:"広域区画",icon:"⬜",sceneScale:1.32,facilitySlots:8,landmarkSlots:2,residentCapacity:18,traffic:"high"},
 hub:{id:"hub",label:"中心区画",icon:"🔶",sceneScale:1.15,facilitySlots:7,landmarkSlots:2,residentCapacity:16,traffic:"hub"}
});
F.areaSizeClass=id=>F.AREA_SIZE_CLASSES?.[id]||F.AREA_SIZE_CLASSES?.standard||null;

// Ver0.38: 将来の「未知のエリア」は、個別名称を本体へベタ書きせずテンプレートから生成する。
// 追加コンテンツではここへテンプレートを足せば、既存町から自然に接続候補を出せる。
F.EXPANSION_TEMPLATE_DEFS=Object.freeze([
 {id:"deep_forest",name:"深い森",icon:"🌳",sizeClass:"wide",terrainTags:["forest","nature","gathering"],facilityTags:["adventure","gathering","ranch"],travelCost:2,capacity:{facilitySlots:5,landmarkSlots:1},unlockHint:"森側の開拓と探索を進める"},
 {id:"pasture",name:"牧草地",icon:"🌾",sizeClass:"wide",terrainTags:["field","nature","life"],facilityTags:["ranch","life","food"],travelCost:1,capacity:{facilitySlots:6,landmarkSlots:1},unlockHint:"生活・牧場系の需要が高まる"},
 {id:"foothill",name:"山すそ",icon:"🏔️",sizeClass:"standard",terrainTags:["rock","mountain","craft"],facilityTags:["forge","mining","adventure"],travelCost:2,capacity:{facilitySlots:4,landmarkSlots:1},unlockHint:"高台側の道をさらに延ばす"},
 {id:"quarry",name:"採石場候補地",icon:"🪨",sizeClass:"compact",terrainTags:["rock","resource","craft"],facilityTags:["forge","storage","mining"],travelCost:2,capacity:{facilitySlots:3,landmarkSlots:1},unlockHint:"鍛冶・建設資材の需要が増える"},
 {id:"far_bank",name:"川向こう",icon:"🌉",sizeClass:"standard",terrainTags:["water","river","life"],facilityTags:["water","life","commerce"],travelCost:2,capacity:{facilitySlots:5,landmarkSlots:1},unlockHint:"橋または渡河手段を整える"},
 {id:"wetland",name:"湿地",icon:"🪷",sizeClass:"wide",terrainTags:["water","wetland","nature"],facilityTags:["gathering","research","adventure"],travelCost:3,capacity:{facilitySlots:4,landmarkSlots:2},unlockHint:"川辺の安全確保と探索を進める"},
 {id:"trade_route",name:"交易路",icon:"🛣️",sizeClass:"wide",terrainTags:["road","commerce","logistics"],facilityTags:["commerce","storage","inn"],travelCost:2,capacity:{facilitySlots:7,landmarkSlots:1},unlockHint:"街道の往来と商業を発展させる"},
 {id:"plain",name:"平原",icon:"🌱",sizeClass:"wide",terrainTags:["field","road","open"],facilityTags:["life","commerce","ranch"],travelCost:1,capacity:{facilitySlots:8,landmarkSlots:1},unlockHint:"町域拡張の需要が高まる"},
 {id:"highland_meadow",name:"高原",icon:"🌼",sizeClass:"standard",terrainTags:["highland","field","residential"],facilityTags:["life","residential","inn"],travelCost:2,capacity:{facilitySlots:5,landmarkSlots:1},unlockHint:"高台の生活基盤を整える"}
]);
F.expansionTemplate=id=>(F.EXPANSION_TEMPLATE_DEFS||[]).find(x=>x.id===id)||null;

F.TOWN_SCALE_TIERS=Object.freeze([
 {id:"frontier",label:"開拓地",icon:"🏕️",minUsable:1,minPoints:0},
 {id:"hamlet",label:"小さな集落",icon:"🏘️",minUsable:1,minPoints:10},
 {id:"village",label:"村",icon:"🏡",minUsable:1,minPoints:28},
 {id:"lively_village",label:"にぎやかな村",icon:"🏘️",minUsable:1,minPoints:60}
]);
F.WORLD_PORT_VECTOR=Object.freeze({north:[0,-1],south:[0,1],east:[1,0],west:[-1,0],ne:[1,-1],nw:[-1,-1],se:[1,1],sw:[-1,1]});
// Ver0.38: エリア間移動は「隣接=歩行による疑似シームレス」「遠距離=選択式高速移動」を正式基準にする。
// 見た目の接続種別と、実際の移動方式を分離しておくことで、将来 馬車・船・転送などを追加しても既存エリア定義を作り直さない。
F.TRAVEL_MODE_DEFS=Object.freeze({
 walk:{id:"walk",label:"歩行接続",icon:"🚶",selection:false,autoTransition:true,seamlessLike:true},
 fast:{id:"fast",label:"高速移動",icon:"⚡",selection:true,autoTransition:false,seamlessLike:false}
});
F.CONNECTION_KIND_DEFS=Object.freeze({
 forest_path:{id:"forest_path",label:"森道",icon:"🌲",defaultMode:"walk",transition:"edge",transitionMs:260},
 road:{id:"road",label:"街道",icon:"🛣️",defaultMode:"walk",transition:"edge",transitionMs:220},
 bridge:{id:"bridge",label:"橋",icon:"🌉",defaultMode:"walk",transition:"edge",transitionMs:280},
 stairs:{id:"stairs",label:"階段・坂道",icon:"🪜",defaultMode:"walk",transition:"edge",transitionMs:300},
 coach:{id:"coach",label:"馬車",icon:"🛞",defaultMode:"fast",transition:"select",transitionMs:450},
 boat:{id:"boat",label:"船",icon:"⛵",defaultMode:"fast",transition:"select",transitionMs:520}
});
F.FAST_TRAVEL_POLICY=Object.freeze({
 enabled:true,unlockRule:"visited-and-node",destinationRule:"visited-and-usable",requiresSelection:true,
 note:"町内の隣接地区は歩行。町が大きくなった後の遠距離だけ、馬車・船などの移動拠点から目的地を選ぶ。"
});
F.AREA_CONNECTION_DEFS=Object.freeze([
 {id:"core_west",a:"core",aPort:"west",b:"west_forest",bPort:"east",kind:"forest_path",label:"森へ続く道",travelCost:1,travel:{mode:"walk",autoTransition:true,fastTravel:false}},
 {id:"core_south",a:"core",aPort:"south",b:"south_road",bPort:"north",kind:"road",label:"南の街道",travelCost:1,travel:{mode:"walk",autoTransition:true,fastTravel:false}},
 {id:"core_east",a:"core",aPort:"east",b:"east_riverside",bPort:"west",kind:"bridge",label:"川辺への道",travelCost:1,travel:{mode:"walk",autoTransition:true,fastTravel:false}},
 {id:"core_north",a:"core",aPort:"north",b:"north_highland",bPort:"south",kind:"stairs",label:"高台への道",travelCost:2,travel:{mode:"walk",autoTransition:true,fastTravel:false}}
]);
F.connectionKind=id=>F.CONNECTION_KIND_DEFS?.[id]||null;
F.travelMode=id=>F.TRAVEL_MODE_DEFS?.[id]||null;

F.AREA_STATE_ORDER=Object.freeze(["locked","discovered","clearing","usable","developed"]);
F.AREA_STATE_INFO=Object.freeze({
 locked:{label:"未発見",icon:"🔒"}, discovered:{label:"発見",icon:"👀"}, clearing:{label:"開拓中",icon:"🪓"},
 usable:{label:"利用可能",icon:"🚶"}, developed:{label:"整備済み",icon:"🏘️"}
});


// Ver0.44: 各実マップを作り込む前に、全エリアを同じ規格で扱うSceneSpecを定義する。
// 1000x1000の論理座標で設計し、実Canvasサイズへコンパイルする。将来マップ画像のサイズやカメラ方式が変わっても、
// 施設枠・工事枠・NPC活動域・入口/出口・将来拡張口の意味は維持できる。
F.AREA_VIEW_PROFILES=Object.freeze({
 town_mobile:{id:"town_mobile",label:"町フィールド（スマホ）",canvas:{w:717,h:842},playfield:{x:0,y:0,w:590,h:842},uiReserved:{x:590,y:0,w:127,h:842},camera:"fixed-area"}
});
F.AREA_SCENE_SCHEMA=Object.freeze({
 version:2,logical:{w:1000,h:1000},defaultViewProfile:"town_mobile",
 zoneKinds:Object.freeze({
  walk:{label:"主要通行域",icon:"👣"},facility:{label:"施設配置枠",icon:"🏠"},construction:{label:"工事用退避域",icon:"🏗️"},
  npc:{label:"NPC活動域",icon:"🧑"},landmark:{label:"ランドマーク枠",icon:"📍"},service:{label:"物流・裏動線",icon:"📦"}
 }),
 required:["walk","facility","construction","npc"],
 note:"見た目の画像とは独立した論理仕様。Ver0.44からSceneSpecを実マップ用RuntimeSceneへコンパイルし、通行・施設枠・工事域・NPC活動・接続口を同じデータから生成する。"
});
F.areaViewProfile=id=>F.AREA_VIEW_PROFILES?.[id]||F.AREA_VIEW_PROFILES?.[F.AREA_SCENE_SCHEMA?.defaultViewProfile]||null;

// normalized座標はplayfield内を 0..1000 とする。portsも同じ規格で、隣接エリア追加時に接続定義から自動生成する。
F.AREA_SCENE_TEMPLATE_DEFS=Object.freeze({
 hub:{id:"hub",label:"中心・広場型",icon:"🔶",zones:[
  {id:"walk_ns",kind:"walk",shape:"rect",v:[420,0,160,1000]},{id:"walk_ew",kind:"walk",shape:"rect",v:[0,405,1000,190]},
  {id:"walk_center",kind:"walk",shape:"circle",v:[500,500,210]},
  {id:"facility_nw",kind:"facility",slot:1,shape:"rect",v:[55,75,280,250]},{id:"facility_ne",kind:"facility",slot:2,shape:"rect",v:[665,75,280,250]},
  {id:"facility_w",kind:"facility",slot:3,shape:"rect",v:[55,650,260,240]},{id:"facility_e",kind:"facility",slot:4,shape:"rect",v:[685,650,260,240]},
  {id:"facility_mid_w",kind:"facility",slot:5,shape:"rect",v:[65,330,245,185]},{id:"facility_mid_e",kind:"facility",slot:6,shape:"rect",v:[690,330,245,185]},
  {id:"facility_center_s",kind:"facility",slot:7,shape:"rect",v:[355,635,290,205]},
  {id:"landmark_center",kind:"landmark",slot:1,shape:"circle",v:[500,500,120]},{id:"landmark_north",kind:"landmark",slot:2,shape:"rect",v:[420,95,160,135]},
  {id:"construction_w",kind:"construction",shape:"rect",v:[40,285,275,150]},{id:"construction_e",kind:"construction",shape:"rect",v:[685,285,275,150]},
  {id:"construction_s",kind:"construction",shape:"rect",v:[335,700,330,170]},
  {id:"npc_center",kind:"npc",shape:"circle",v:[500,510,255]},{id:"npc_market",kind:"npc",shape:"rect",v:[625,300,315,330]},{id:"npc_life",kind:"npc",shape:"rect",v:[55,575,310,315]},
  {id:"service_north",kind:"service",shape:"rect",v:[350,0,300,155]}
 ],ports:{north:{shape:"rect",v:[420,0,160,82],arrival:[500,105]},south:{shape:"rect",v:[405,918,190,82],arrival:[500,890]},west:{shape:"rect",v:[0,420,82,160],arrival:[105,500]},east:{shape:"rect",v:[918,420,82,160],arrival:[890,500]},nw:{shape:"rect",v:[0,90,82,130],arrival:[105,155]},ne:{shape:"rect",v:[918,90,82,130],arrival:[890,155]}}},
 corridor:{id:"corridor",label:"街道・回廊型",icon:"🛣️",zones:[
  {id:"walk_main",kind:"walk",shape:"rect",v:[405,0,190,1000]},{id:"walk_cross_n",kind:"walk",shape:"rect",v:[210,215,580,150]},{id:"walk_cross_s",kind:"walk",shape:"rect",v:[185,620,630,150]},
  {id:"facility_l1",kind:"facility",slot:1,shape:"rect",v:[40,80,300,190]},{id:"facility_r1",kind:"facility",slot:2,shape:"rect",v:[660,80,300,190]},
  {id:"facility_l2",kind:"facility",slot:3,shape:"rect",v:[40,300,300,190]},{id:"facility_r2",kind:"facility",slot:4,shape:"rect",v:[660,300,300,190]},
  {id:"facility_l3",kind:"facility",slot:5,shape:"rect",v:[40,525,300,190]},{id:"facility_r3",kind:"facility",slot:6,shape:"rect",v:[660,525,300,190]},
  {id:"facility_l4",kind:"facility",slot:7,shape:"rect",v:[40,745,300,190]},{id:"facility_r4",kind:"facility",slot:8,shape:"rect",v:[660,745,300,190]},
  {id:"landmark_mid",kind:"landmark",slot:1,shape:"rect",v:[425,410,150,150]},
  {id:"construction_l",kind:"construction",shape:"rect",v:[65,390,250,170]},{id:"construction_r",kind:"construction",shape:"rect",v:[685,390,250,170]},
  {id:"npc_road",kind:"npc",shape:"rect",v:[345,70,310,860]},{id:"npc_merchants",kind:"npc",shape:"rect",v:[80,240,840,500]},
  {id:"service_logistics",kind:"service",shape:"rect",v:[30,800,330,150]}
 ],ports:{north:{shape:"rect",v:[405,0,190,82],arrival:[500,110]},south:{shape:"rect",v:[405,918,190,82],arrival:[500,890]},west:{shape:"rect",v:[0,420,82,160],arrival:[105,500]},east:{shape:"rect",v:[918,420,82,160],arrival:[890,500]}}},
 branch_forest:{id:"branch_forest",label:"森・枝分かれ型",icon:"🌲",zones:[
  {id:"walk_trunk",kind:"walk",shape:"rect",v:[430,0,155,1000]},{id:"walk_branch_w",kind:"walk",shape:"rect",v:[100,360,390,145]},{id:"walk_branch_e",kind:"walk",shape:"rect",v:[520,610,365,145]},
  {id:"facility_1",kind:"facility",slot:1,shape:"rect",v:[90,95,270,210]},{id:"facility_2",kind:"facility",slot:2,shape:"rect",v:[650,95,255,210]},
  {id:"facility_3",kind:"facility",slot:3,shape:"rect",v:[85,545,275,215]},{id:"facility_4",kind:"facility",slot:4,shape:"rect",v:[645,470,270,205]},
  {id:"facility_5",kind:"facility",slot:5,shape:"rect",v:[365,760,280,185]},
  {id:"landmark_forest",kind:"landmark",slot:1,shape:"circle",v:[510,475,115]},
  {id:"construction_clearing",kind:"construction",shape:"rect",v:[315,285,380,180]},
  {id:"npc_trail",kind:"npc",shape:"rect",v:[330,70,350,860]},{id:"npc_gather",kind:"npc",shape:"rect",v:[80,300,835,460]},
  {id:"service_gather",kind:"service",shape:"rect",v:[70,770,275,160]}
 ],ports:{east:{shape:"rect",v:[918,420,82,160],arrival:[890,500]},west:{shape:"rect",v:[0,420,82,160],arrival:[105,500]},north:{shape:"rect",v:[430,0,155,82],arrival:[510,110]},south:{shape:"rect",v:[430,918,155,82],arrival:[510,890]}}},
 riverside:{id:"riverside",label:"川辺・水路型",icon:"🌊",zones:[
  {id:"walk_bank",kind:"walk",shape:"rect",v:[120,360,760,190]},{id:"walk_spine",kind:"walk",shape:"rect",v:[430,0,160,1000]},
  {id:"facility_1",kind:"facility",slot:1,shape:"rect",v:[70,80,280,220]},{id:"facility_2",kind:"facility",slot:2,shape:"rect",v:[650,80,280,220]},
  {id:"facility_3",kind:"facility",slot:3,shape:"rect",v:[70,610,280,220]},{id:"facility_4",kind:"facility",slot:4,shape:"rect",v:[650,610,280,220]},
  {id:"facility_5",kind:"facility",slot:5,shape:"rect",v:[365,600,270,210]},
  {id:"landmark_water",kind:"landmark",slot:1,shape:"rect",v:[385,310,230,170]},
  {id:"construction_bank",kind:"construction",shape:"rect",v:[115,555,770,140]},
  {id:"npc_waterfront",kind:"npc",shape:"rect",v:[110,260,780,470]},{id:"service_dock",kind:"service",shape:"rect",v:[670,720,250,170]}
 ],ports:{west:{shape:"rect",v:[0,420,82,160],arrival:[105,500]},east:{shape:"rect",v:[918,420,82,160],arrival:[890,500]},south:{shape:"rect",v:[430,918,160,82],arrival:[510,890]},north:{shape:"rect",v:[430,0,160,82],arrival:[510,110]}}},
 terrace:{id:"terrace",label:"高台・段丘型",icon:"⛰️",zones:[
  {id:"walk_steps",kind:"walk",shape:"rect",v:[430,0,150,1000]},{id:"walk_upper",kind:"walk",shape:"rect",v:[180,235,650,155]},{id:"walk_lower",kind:"walk",shape:"rect",v:[140,620,720,165]},
  {id:"facility_1",kind:"facility",slot:1,shape:"rect",v:[75,60,285,200]},{id:"facility_2",kind:"facility",slot:2,shape:"rect",v:[640,60,285,200]},
  {id:"facility_3",kind:"facility",slot:3,shape:"rect",v:[70,410,300,205]},{id:"facility_4",kind:"facility",slot:4,shape:"rect",v:[630,410,300,205]},
  {id:"facility_5",kind:"facility",slot:5,shape:"rect",v:[350,755,300,180]},
  {id:"landmark_view",kind:"landmark",slot:1,shape:"rect",v:[390,395,220,170]},
  {id:"construction_terrace",kind:"construction",shape:"rect",v:[220,535,560,145]},
  {id:"npc_upper",kind:"npc",shape:"rect",v:[150,130,700,340]},{id:"npc_lower",kind:"npc",shape:"rect",v:[120,530,760,360]},
  {id:"service_rock",kind:"service",shape:"rect",v:[675,725,230,175]}
 ],ports:{south:{shape:"rect",v:[430,918,150,82],arrival:[505,890]},north:{shape:"rect",v:[430,0,150,82],arrival:[505,110]},east:{shape:"rect",v:[918,420,82,160],arrival:[890,500]},west:{shape:"rect",v:[0,420,82,160],arrival:[105,500]}}}
});
F.areaSceneTemplateDef=id=>F.AREA_SCENE_TEMPLATE_DEFS?.[id]||null;

// area.world の主要項目
// sizeClass: 実マップの相対規模 / terrainTags: 地形特性 / capacity: 施設・住民の収容目安
// travelCost: 隣接移動の重さ / expansionProfiles: その先に生成しやすい将来エリア候補
F.AREA_DEFS=Object.freeze([
 {id:"core",name:"町",icon:"🏘️",tags:["core","commerce","life","forge","craft","adventure","road","logistics","civic","residential","nature"],
  world:{gx:0,gy:0,role:"hub",sceneStatus:"prototype",sizeClass:"hub",theme:"frontier_core",growth:"single-town",sceneTemplate:"hub",viewProfile:"town_mobile",travelCost:1,
   terrainTags:["open","river_edge","frontier"],capacity:{facilitySlots:12,landmarkSlots:4,residentCapacity:30},futurePorts:[],expansionProfiles:{}},
  startState:"usable",description:"初代不思議のダンジョン型の単一拠点。同じ町の中で店・住居・鍛冶・広場などが段階的に増え、見た目と機能が発展する。別の町域へ移動しない。",transitions:{},
  nav:{scene:{w:1127,h:842,cell:12},worldRect:{x:0,y:0,w:1000,h:842},spawn:{x:295,y:420},entries:{},exits:[]}}
]);
F.areaDef=id=>(F.AREA_DEFS||[]).find(a=>a.id===id)||null;

// Ver0.28: 町の見た目は「固定ベース + 細かな景観レイヤー + 施設レイヤー」。
// TEST画面はこの定義をそのまま列挙する。asset は major/detail のどちらのアトラスを使うかを示す。
F.TOWN_RENDER_BANDS=Object.freeze(["ground","structure","low","character","front"]);
// Ver0.33: 見た目と移動判定を同じ町データから生成する。画像解析は行わない。
// shape: rect=[x,y,w,h] / circle=[cx,cy,r]。walk は block より後に再開放する。
F.TOWN_ACTOR_NAV_PROFILES=Object.freeze({
 player:{radius:10,step:"walk"},partner:{radius:8,step:"follow",followDistance:34},npc:{radius:9,step:"routine"}
});
// Ver1.23: The background is 1086x1448 and is drawn at 590x842. These
// walk corridors follow the visible paving; all grass, fencing, water and
// structure art is blocked even when it has no separate collision sprite.
F.TOWN_PLAYER_WALK_CORRIDORS=Object.freeze([
 // Wider paved lanes add a forgiving shoulder around the visible cobbles for touch movement.
 {shape:"rect",v:[235,0,120,278]},
 {shape:"rect",v:[0,256,276,114]},
 {shape:"rect",v:[248,256,205,114]},
 {shape:"rect",v:[310,244,280,126]},
 {shape:"rect",v:[225,332,130,280]},
 {shape:"rect",v:[238,338,44,92]},
 {shape:"rect",v:[225,578,140,190]},
 {shape:"rect",v:[247,742,96,100]}
]);
F.TOWN_NAV_BASE=Object.freeze({
 areaId:"core",defaultWalkable:true,
 // Ver0.33: 初期開拓地の実景観に合わせて障害物を細分化。
 // 大きな矩形1枚ではなく、小屋・露店・焚き火・資材・川岸などを別判定にする。
 blocks:[
   {shape:"rect",v:[0,0,42,842],reason:"west_forest"},{shape:"rect",v:[570,0,20,842],reason:"east_edge"},
   {shape:"rect",v:[0,0,1000,35],reason:"north_forest"},
   {shape:"rect",v:[0,630,1000,212],reason:"river"},
   {shape:"poly",v:[[72,110],[275,110],[315,155],[315,315],[92,325],[55,265]],reason:"starter_shop"},
   {shape:"poly",v:[[278,50],[455,55],[470,205],[430,245],[275,235]],reason:"starter_hut"},
   {shape:"circle",v:[505,282,43],reason:"campfire"},
   {shape:"rect",v:[70,430,125,48],reason:"logs_west"},{shape:"circle",v:[207,485,26],reason:"stump_west"},
   {shape:"rect",v:[472,430,62,58],reason:"sign_east"},{shape:"rect",v:[506,520,84,115],reason:"tent_east"},
   {shape:"circle",v:[462,355,18],reason:"rock_mid"},{shape:"circle",v:[250,515,20],reason:"rock_southwest"}
 ],
 walk:[
   {shape:"poly",v:[[176,585],[360,585],[365,720],[335,755],[185,755],[165,700]],reason:"bridge"},
   {shape:"rect",v:[185,720,170,122],reason:"south_path"},
   {shape:"poly",v:[[426,0],[535,0],[520,115],[450,125],[420,70]],reason:"north_path"},
   {shape:"rect",v:[420,105,72,165],reason:"north_public_access"}
 ],
 interactions:[
   {id:"starter_shop",type:"facility",label:"露店",x:255,y:320,r:55,facilityId:"shop"},
   {id:"campfire",type:"scenery",label:"焚き火",x:470,y:350,r:42}
 ],
 npcWaypoints:[
   {id:"center",x:350,y:470},{id:"shop_front",x:275,y:350},{id:"bridge_north",x:270,y:600},
   {id:"camp",x:455,y:365},{id:"north_path",x:475,y:135},{id:"south_path",x:270,y:585}
 ]
});
// Ver0.28: 描画順は z 値だけに依存せず band（地面→施設→低い小物→人物→前景）で固定する。
// これにより、将来レイヤーが増えても道・石畳などが人物の上に描画される事故を防ぐ。
F.TOWN_LAYER_DEFS=Object.freeze([
 {id:"base",group:"基礎",label:"0pt 初期開拓地（固定ベース）",icon:"🌿",kind:"base",band:"ground",z:0,locked:true,auto:{type:"always"}},

 {id:"path_clear",group:"道・整備",exclusiveGroup:"road",rank:1,nav:{walk:[{shape:"rect",v:[270,235,175,285],reason:"cleared_path"}]},label:"6pt 踏み跡が少し整う",icon:"👣",kind:"atlas",asset:"detail",band:"ground",z:10,auto:{type:"pointsGte",value:6},atlas:{sx:326,sy:4,sw:150,sh:230,dx:285,dy:250,dw:150,dh:230}},
 {id:"stone_path",group:"道・整備",exclusiveGroup:"road",rank:2,nav:{walk:[{shape:"rect",v:[260,225,205,310],reason:"stone_path"}]},label:"16pt 道の一部が石敷きになる",icon:"🧱",kind:"atlas",asset:"detail",band:"ground",z:20,auto:{type:"pointsGte",value:16},atlas:{sx:814,sy:238,sw:190,sh:260,dx:270,dy:250,dw:190,dh:260}},

 {id:"shop2",group:"施設",exclusiveGroup:"shop_stage",rank:2,nav:{blocks:[{shape:"rect",v:[32,55,286,205],reason:"shop_lv2"}],walk:[{shape:"rect",v:[160,255,78,62],reason:"shop_entrance"}],entrances:[{id:"shop_door",x:198,y:282,facing:"north"}],interactions:[{id:"shop",type:"facility",label:"店",x:198,y:300,r:40,facilityId:"shop"}]},label:"店 Lv2（施設本体）",icon:"🏪",kind:"atlas",asset:"facility",band:"structure",z:30,facilityId:"shop",auto:{type:"facilityGte",facilityId:"shop",value:2},atlas:{sx:0,sy:0,sw:325,sh:285,dx:0,dy:0,dw:325,dh:285}},
 {id:"forge",group:"施設",nav:{blocks:[{shape:"rect",v:[355,55,225,210],reason:"forge"}],walk:[{shape:"rect",v:[430,250,78,62],reason:"forge_entrance"}],entrances:[{id:"forge_door",x:470,y:282,facing:"north"}],interactions:[{id:"forge",type:"facility",label:"鍛冶屋",x:470,y:300,r:42,facilityId:"forge"}]},label:"鍛冶屋 Lv1（施設本体）",icon:"⚒️",kind:"atlas",asset:"facility",band:"structure",z:32,facilityId:"forge",auto:{type:"facilityGte",facilityId:"forge",value:1},atlas:{sx:325,sy:0,sw:382,sh:310,dx:335,dy:0,dw:382,dh:310}},
 {id:"house",group:"施設",nav:{blocks:[{shape:"rect",v:[25,385,285,205],reason:"house"}],walk:[{shape:"rect",v:[145,570,75,70],reason:"house_entrance"}],entrances:[{id:"house_door",x:182,y:610,facing:"north"}],interactions:[{id:"house",type:"facility",label:"住居",x:182,y:625,r:40,facilityId:"house"}]},label:"住居 Lv1（施設本体）",icon:"🏠",kind:"atlas",asset:"facility",band:"structure",z:34,facilityId:"house",auto:{type:"facilityGte",facilityId:"house",value:1},atlas:{sx:340,sy:325,sw:350,sh:320,dx:0,dy:345,dw:350,dh:320}},
 {id:"market",group:"施設",nav:{blocks:[{shape:"rect",v:[448,315,118,110],reason:"market_stall"}],interactions:[{id:"market",type:"facility",label:"市場",x:432,y:420,r:44,facilityId:"market"}]},label:"市場 Lv1（施設本体）",icon:"🧺",kind:"atlas",asset:"facility",band:"structure",z:36,facilityId:"market",auto:{type:"facilityGte",facilityId:"market",value:1},atlas:{sx:690,sy:325,sw:160,sh:300,dx:425,dy:290,dw:160,dh:300}},

 {id:"flowers",group:"装飾・明かり",label:"広場完成：花壇",icon:"🌼",kind:"atlas",asset:"detail",band:"low",z:14,auto:{type:"facilityGte",facilityId:"plaza",value:1},atlas:{sx:336,sy:238,sw:250,sh:100,dx:245,dy:325,dw:250,dh:100}},
 {id:"benches",group:"生活基盤",nav:{blocks:[{shape:"rect",v:[245,445,85,28],reason:"bench"},{shape:"rect",v:[400,445,85,28],reason:"bench"}]},label:"広場完成：休憩ベンチ",icon:"🪑",kind:"atlas",asset:"detail",band:"low",z:16,auto:{type:"facilityGte",facilityId:"plaza",value:1},atlas:{sx:362,sy:502,sw:270,sh:70,dx:225,dy:430,dw:270,dh:70}},
 {id:"plaza_fountain",group:"町並み",nav:{blocks:[{shape:"circle",v:[370,350,58],reason:"fountain"}],interactions:[{id:"fountain",type:"scenery",label:"噴水",x:370,y:420,r:48}]},label:"24pt以降：広場の噴水",icon:"⛲",kind:"atlas",asset:"detail",band:"low",z:18,facilityId:"plaza",auto:{type:"all",rules:[{type:"pointsGte",value:24},{type:"facilityGte",facilityId:"plaza",value:1}]},atlas:{sx:238,sy:502,sw:120,sh:100,dx:310,dy:300,dw:120,dh:100}},

 {id:"visitor_first",group:"人・生活",label:"2pt 最初の旅人",icon:"🚶",kind:"npc",band:"character",z:10,auto:{type:"pointsGte",value:2},parts:[{sprite:0,dx:492,dy:292,dw:64,dh:80}]},
 {id:"resident_more",group:"人・生活",label:"12pt 住民が少し増える",icon:"🧑",kind:"npc",band:"character",z:12,auto:{type:"pointsGte",value:12},parts:[{sprite:1,dx:238,dy:465,dw:64,dh:80},{sprite:2,dx:302,dy:478,dw:64,dh:80}]},

 {id:"street_lamps",group:"装飾・明かり",nav:{blocks:[{shape:"circle",v:[325,370,14],reason:"lamp"},{shape:"circle",v:[435,370,14],reason:"lamp"}]},exclusiveGroup:"town_lighting",rank:2,label:"広場・宿・掲示板完成：街灯",icon:"🏮",kind:"atlas",asset:"detail",band:"front",z:12,auto:{type:"all",rules:[{type:"facilityGte",facilityId:"plaza",value:1},{type:"facilityGte",facilityId:"inn",value:1},{type:"facilityGte",facilityId:"adventure_board",value:1}]},atlas:{sx:590,sy:238,sw:220,sh:90,dx:270,dy:340,dw:220,dh:90}},
]);
F.TOWN_LAYER_GROUPS=Object.freeze(["基礎","道・整備","商業","生活基盤","発展ルート","施設","町並み","装飾・明かり","人・生活","演出"]);
F.CUSTOMERS=Object.freeze([
 {icon:"🧒",name:"かけだし冒険者",budget:[200,700],likes:["素材","珍品"],line:"これ、冒険に使えそう！"},
 {icon:"🧑‍🔧",name:"職人見習い",budget:[300,900],likes:["素材"],line:"材料を探してたんだ。"},
 {icon:"🧑‍🎒",name:"旅の冒険者",budget:[450,1200],likes:["珍品","素材"],line:"この町にも面白い店があるね。"},
 {icon:"👩",name:"町の住民",budget:[180,600],likes:["素材"],line:"ちょうど欲しかったの。"}
]);
F.STORY=Object.freeze([
 {id:"prologue",title:"序章　フロンティアへ",text:"『幻の大秘宝』の噂を追って、ほとんど人のいない開拓地へやってきた。",at:0},
 {id:"gear",title:"開拓者の装備",text:"人間の開拓者が武器・防具・お守りを整え、野生ポケモンのいる森へ単独で向かう。",at:1},
 {id:"supply",title:"店を開くための仕入れ",text:"はじまりの森で素材を集め、店に商品を並べる。",at:2},
 {id:"firstsale",title:"最初のお客さん",text:"自分で持ち帰った品が売れ、開拓地に少しずつ人が集まり始める。",at:3},
 {id:"rumor",title:"新しい噂",text:"店の評判が広がると、森の奥と『秘宝の手掛かり』について語る旅人が現れる。",at:4}
]);
F.pickRecord=id=>(window.FRENDA_MASTER?.records||[]).find(r=>String(r.master_id)===String(id))||null;
F.ownedIds=()=>{const D=window.FRENDA_DATA,U=window.FRENDA_USER,st=U?.storage||localStorage;try{const key=D?.KEYS?.simulator?.owned||"frenda:owned:v1",a=JSON.parse(st.getItem(key)||"[]");return Array.isArray(a)?a.map(String):[]}catch{return[]}};
F.ownedEligiblePartners=()=>F.ownedIds().map(F.pickRecord).filter(r=>r&&Number(r.grade||0)<=3).sort((a,b)=>(Number(a.grade)-Number(b.grade))||(Number(a.poke_ene)-Number(b.poke_ene)));
F.trialPartners=()=>{if(!window.FRENDA_TEST?.active)return[];return (window.FRENDA_MASTER?.records||[]).filter(r=>r&&Number(r.grade||0)>0&&Number(r.grade||0)<=3).sort((a,b)=>(Number(a.grade)-Number(b.grade))||(Number(a.poke_ene)-Number(b.poke_ene))).slice(0,6)};
F.eligiblePartners=()=>{const owned=F.ownedEligiblePartners();return owned.length?owned:F.trialPartners()};
F.usingTrialPartners=()=>F.ownedEligiblePartners().length===0&&F.trialPartners().length>0;
F.item=id=>F.ITEMS[id]||null;
F.rand=(a,b)=>Math.floor(a+Math.random()*(b-a+1));
F.weighted=list=>{const sum=list.reduce((n,x)=>n+x.weight,0);let r=Math.random()*sum;for(const x of list){r-=x.weight;if(r<=0)return x}return list[list.length-1]};
})();
// Updated: 2026-10-23 07:40 JST / Ver1.15
/* Updated: 2026-10-23 07:40 JST / Ver1.15 */

/* Updated: 2026-10-23 13:34 JST / Ver1.15 */

/* Updated: 2026-10-23 20:00 JST / Ver1.16 */

/* Updated: 2026-10-23 21:55 JST / Ver1.23 */

// Updated: 2026-10-24 05:00 JST / Ver1.32

// Updated: 2026-10-24 05:20 JST / Ver1.32

// Updated: 2026-10-24 05:48 JST / Ver1.32

// Updated: 2026-10-24 JST / Ver1.32

// Updated: 2026-10-24 JST / Ver1.33

// Updated: 2026-10-24 JST / Ver1.35

// Updated: 2026-10-24 JST / Ver1.35

// Updated: 2026-10-24 JST / Ver1.36

// Updated: 2026-10-24 JST / Ver1.37

// Updated: 2026-10-24 JST / Ver1.38

// Updated: 2026-10-25 JST / Ver1.45

// Updated: 2026-10-25 JST / Ver1.46

// Updated: 2026-10-25 JST / Ver1.47

// Updated: 2026-10-25 JST / Ver1.55

// Updated: 2026-10-25 13:39 JST / Ver1.56

// Updated: 2026-10-25 13:54 JST / Ver1.57

// Updated: 2026-10-25 14:08 JST / Ver1.58

// Updated: 2026-10-25 JST / Ver1.59

// Updated: 2026-10-25 14:32 JST / Ver1.59

// Updated: 2026-10-25 JST / Ver1.60

// Updated: 2026-10-25 JST / Ver1.61

// Updated: 2026-10-25 JST / Ver1.62

// Updated: 2026-10-25 JST / Ver1.63

// Updated: 2026-10-25 JST / Ver1.71

// Bundle updated: 2026-10-25 18:48 JST / Frontier Ver1.71

// Updated: 2026-10-25 19:47 JST / Ver1.71

// Updated: 2026-10-25 19:54 JST / Ver1.71

// Updated: 2026-10-25 20:21 JST / Ver1.71

// Updated: 2026-10-25 20:51 JST / Ver1.71

// Updated: 2026-10-25 21:08 JST / Ver1.71

// Updated: 2026-10-26 18:44 JST / Ver1.71
// Updated: 2026-10-26 19:28 JST / Ver1.71
// Updated: 2026-10-26 20:26 JST / Ver1.72
// Updated: 2026-10-27 19:24 JST / Ver1.75
