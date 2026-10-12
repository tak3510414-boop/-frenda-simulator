(()=>{"use strict";
const R=window.FRENDA_RANCH=window.FRENDA_RANCH||{};
const timers=new Map(),agents=new Map();
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function rand(a,b){return a+Math.random()*(b-a)}
function farEnough(x,y,self){
  for(const a of agents.values()){
    if(a===self)continue;
    const dx=(a.x??-99)-x,dy=(a.y??-99)-y;
    if((dx*dx)/(14*14)+(dy*dy)/(18*18)<1)return false;
  }
  return true;
}
function destination(a){
  for(let i=0;i<18;i++){
    const x=rand(4,86),y=rand(34,78);
    if(farEnough(x,y,a))return{x,y};
  }
  return{x:clamp((a.x||45)+rand(-16,16),4,86),y:clamp((a.y||55)+rand(-12,12),34,78)};
}
function setState(a,state){a.state=state;a.el.classList.remove("walking","idle","resting");a.el.classList.add(state==="walk"?"walking":state==="rest"?"resting":"idle");a.el.dataset.ranchState=state}
function schedule(a,ms){clearTimeout(timers.get(a.id));timers.set(a.id,setTimeout(()=>step(a),ms))}
function step(a){
  if(!document.body.contains(a.el))return;
  const roll=Math.random();
  if(roll<.58){
    const d=destination(a),dist=Math.hypot(d.x-a.x,d.y-a.y),ms=Math.round(clamp(900+dist*55,1200,3300));
    a.x=d.x;a.y=d.y;setState(a,"walk");a.el.style.setProperty("--move-ms",ms+"ms");a.el.style.left=a.x+"%";a.el.style.top=a.y+"%";schedule(a,ms+rand(500,1500));
  }else if(roll<.83){setState(a,"idle");schedule(a,rand(1400,3600));}
  else{setState(a,"rest");schedule(a,rand(2600,5200));}
}
function stop(){for(const t of timers.values())clearTimeout(t);timers.clear();agents.clear()}
function start(items){
  stop();
  (items||[]).forEach((it,i)=>{
    const col=i%3,row=Math.floor(i/3),a={id:it.id,el:it.el,x:10+col*30+(row%2)*5,y:38+row*30};
    a.x=clamp(a.x,4,86);a.y=clamp(a.y,34,78);agents.set(a.id,a);a.el.style.left=a.x+"%";a.el.style.top=a.y+"%";setState(a,"idle");schedule(a,rand(500,2200));
  });
}
R.ai={enabled:true,start,stop,agents};
window.addEventListener("pagehide",stop);
})();
// Updated: 2026-10-12 20:31 JST
