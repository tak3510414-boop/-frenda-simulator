// FRENDA_CORE_VERSION: 1.0
// Shared type-effect and battle calculation engine for Frienda apps.
(function(global){
  "use strict";

  const TYPES=["ノーマル","ほのお","みず","でんき","くさ","こおり","かくとう","どく","じめん","ひこう","エスパー","むし","いわ","ゴースト","ドラゴン","あく","はがね","フェアリー"];

  // フレンダ公式相性表の「×」は0ダメージではなく「ほとんどこうかがない」。
  // TYPE内の0は rawEff では保持し、eff() でフレンダ最小効果段階へ変換する。
  const TYPE={
    "ノーマル":{"いわ":.5,"ゴースト":0,"はがね":.5},"ほのお":{"ほのお":.5,"みず":.5,"くさ":2,"こおり":2,"むし":2,"いわ":.5,"ドラゴン":.5,"はがね":2},
    "みず":{"ほのお":2,"みず":.5,"くさ":.5,"じめん":2,"いわ":2,"ドラゴン":.5},"でんき":{"みず":2,"でんき":.5,"くさ":.5,"じめん":0,"ひこう":2,"ドラゴン":.5},
    "くさ":{"ほのお":.5,"みず":2,"くさ":.5,"どく":.5,"じめん":2,"ひこう":.5,"むし":.5,"いわ":2,"ドラゴン":.5,"はがね":.5},
    "こおり":{"ほのお":.5,"みず":.5,"くさ":2,"こおり":.5,"じめん":2,"ひこう":2,"ドラゴン":2,"はがね":.5},
    "かくとう":{"ノーマル":2,"こおり":2,"どく":.5,"ひこう":.5,"エスパー":.5,"むし":.5,"いわ":2,"ゴースト":0,"あく":2,"はがね":2,"フェアリー":.5},
    "どく":{"くさ":2,"どく":.5,"じめん":.5,"いわ":.5,"ゴースト":.5,"はがね":0,"フェアリー":2},
    "じめん":{"ほのお":2,"でんき":2,"くさ":.5,"どく":2,"ひこう":0,"むし":.5,"いわ":2,"はがね":2},
    "ひこう":{"でんき":.5,"くさ":2,"かくとう":2,"むし":2,"いわ":.5,"はがね":.5},
    "エスパー":{"かくとう":2,"どく":2,"エスパー":.5,"あく":0,"はがね":.5},
    "むし":{"ほのお":.5,"くさ":2,"かくとう":.5,"どく":.5,"ひこう":.5,"エスパー":2,"ゴースト":.5,"あく":2,"はがね":.5,"フェアリー":.5},
    "いわ":{"ほのお":2,"こおり":2,"かくとう":.5,"じめん":.5,"ひこう":2,"むし":2,"はがね":.5},
    "ゴースト":{"ノーマル":0,"エスパー":2,"ゴースト":2,"あく":.5},
    "ドラゴン":{"ドラゴン":2,"はがね":.5,"フェアリー":0},"あく":{"かくとう":.5,"エスパー":2,"ゴースト":2,"あく":.5,"フェアリー":.5},
    "はがね":{"ほのお":.5,"みず":.5,"でんき":.5,"こおり":2,"いわ":2,"はがね":.5,"フェアリー":2},
    "フェアリー":{"ほのお":.5,"かくとう":2,"どく":.5,"ドラゴン":2,"あく":2,"はがね":.5}
  };

  const FRIENDA_STEP=1.3;
  const FRIENDA_EFFECT={
    VERY_LOW:1/(FRIENDA_STEP*FRIENDA_STEP),
    LOW:1/FRIENDA_STEP,
    NORMAL:1,
    HIGH:FRIENDA_STEP,
    VERY_HIGH:FRIENDA_STEP*FRIENDA_STEP
  };

  function rawEff(move,def){
    let e=1;
    for(const t of [def?.type1,def?.type2]) if(t) e*=TYPE[move]?.[t]??1;
    return e;
  }
  function eff(move,def){
    const raw=rawEff(move,def);
    if(raw>=4)return FRIENDA_EFFECT.VERY_HIGH;
    if(raw>=2)return FRIENDA_EFFECT.HIGH;
    if(raw>=1)return FRIENDA_EFFECT.NORMAL;
    if(raw>=.5)return FRIENDA_EFFECT.LOW;
    return FRIENDA_EFFECT.VERY_LOW;
  }
  function speedLevel(r){return Number(r?.speed_level??0)}
  function compareSpeed(a,b){
    const av=Number(a?.speed_value),bv=Number(b?.speed_value);
    if(Number.isFinite(av)&&av>0&&Number.isFinite(bv)&&bv>0)return av-bv;
    return speedLevel(a)-speedLevel(b);
  }
  function skillName(r){return (r?.finisher_move&&String(r.finisher_move).trim())?String(r.finisher_move).trim():(r?.move||"技名未登録")}
  function movePowerRef(r){const v=Number(r?.move_power_ref);return Number.isFinite(v)&&v>0?v:null}
  function moveAccuracyRef(r){if(r?.move_accuracy_always)return 1;const v=Number(r?.move_accuracy_ref);return Number.isFinite(v)&&v>0?Math.min(1,v/100):1}
  function dmg(a,d,model="v1"){
    const special=String(a?.move_class||"").includes("特殊"),atk=Number(special?a?.sp_atk:a?.atk)||1,df=Number(special?d?.sp_def:d?.def)||1,e=eff(a?.move_type,d||{});
    const common=(18+atk*.38)*(100/(100+df));
    const p=movePowerRef(a),acc=moveAccuracyRef(a),useV2=model==="v2"&&p!==null;
    if(!useV2){
      const hitN=Math.max(1,Math.round(common*((a?.move_type===a?.type1||a?.move_type===a?.type2)?1.2:1)*e));
      return {n:hitN,hitN,e,accuracy:1,power:p,model:model==="v2"?"v1-fallback":"v1"};
    }
    const stab=(a?.move_type===a?.type1||a?.move_type===a?.type2)?1.5:1,powerFactor=p/80;
    const hitN=Math.max(1,Math.round(common*stab*e*powerFactor));
    const expected=Math.max(1,Math.round(hitN*acc));
    return {n:expected,hitN,e,accuracy:acc,power:p,model:"v2"};
  }
  function displaySpeed(r){const v=Number(r?.speed_value);return Number.isFinite(v)&&v>0?String(v):`Lv${Number(r?.speed_level)||"-"}`}

  global.FRENDA_CORE=Object.freeze({
    version:"1.0",
    TYPES:Object.freeze(TYPES.slice()),
    TYPE,
    FRIENDA_STEP,
    FRIENDA_EFFECT,
    rawEff,
    eff,
    speedLevel,
    compareSpeed,
    skillName,
    movePowerRef,
    moveAccuracyRef,
    dmg,
    displaySpeed
  });
})(window);
