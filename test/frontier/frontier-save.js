/* Frenda Frontier Ver0.04 / isolated save / Updated: 2026-10-17 */
(()=>{"use strict";
const F=window.FRENDA_FRONTIER=window.FRENDA_FRONTIER||{};
const storage=()=>window.FRENDA_USER?.storage||window.localStorage;
const now=()=>new Date().toISOString();
F.freshSave=()=>({
 schemaVersion:1,appVersion:F.VERSION,createdAt:now(),updatedAt:now(),day:1,coins:300,
 partnerId:null,warehouse:{},shelves:[null,null,null],sales:{count:0,revenue:0,customers:0},
 reputation:{adventure:0,rare:0,fair:0,pokemon:0},development:{points:0,stage:0},
 story:{step:0,firstAdventure:false,firstReturn:false,firstStock:false,firstSale:false,rumor:false},
 history:[],settings:{hintLevel:1}
});
F.normalizeSave=s=>{const base=F.freshSave();if(!s||typeof s!=="object")return base;s=Object.assign(base,s);s.warehouse=s.warehouse&&typeof s.warehouse==="object"?s.warehouse:{};s.shelves=Array.isArray(s.shelves)?s.shelves.slice(0,3):[null,null,null];while(s.shelves.length<3)s.shelves.push(null);s.sales=Object.assign(base.sales,s.sales||{});s.reputation=Object.assign(base.reputation,s.reputation||{});s.development=Object.assign(base.development,s.development||{});s.story=Object.assign(base.story,s.story||{});s.history=Array.isArray(s.history)?s.history.slice(-80):[];s.settings=Object.assign(base.settings,s.settings||{});return s};
F.readSave=()=>{try{return F.normalizeSave(JSON.parse(storage().getItem(F.SAVE_KEY)||"null"))}catch{return F.freshSave()}};
F.writeSave=s=>{s=F.normalizeSave(s);s.appVersion=F.VERSION;s.updatedAt=now();storage().setItem(F.SAVE_KEY,JSON.stringify(s));return s};
F.mutateSave=fn=>{const s=F.readSave();if(typeof fn==="function")fn(s);return F.writeSave(s)};
F.addHistory=(s,type,text)=>{s.history=Array.isArray(s.history)?s.history:[];s.history.push({at:now(),day:s.day,type,text});if(s.history.length>80)s.history=s.history.slice(-80)};
})();
