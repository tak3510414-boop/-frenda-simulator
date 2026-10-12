(()=>{"use strict";
const R=window.FRENDA_RANCH=window.FRENDA_RANCH||{};
const timers=new Map(),agents=new Map(),frames=new Map();
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rand=(a,b)=>a+Math.random()*(b-a);
function farEnough(x,y,self){
  for(const a of agents.values()){
    if(a===self)continue;
    const dx=(a.x??-99)-x,dy=(a.y??-99)-y;
    if((dx*dx)/(14*14)+(dy*dy)/(18*18)<1)return false;
  }
  return true;
}
function destination(a){
  for(let i=0;i<24;i++){
    const x=rand(4,86),y=rand(34,78);
    if(farEnough(x,y,a) && Math.hypot(x-a.x,y-a.y)>12)return{x,y};
  }
  return{x:clamp(a.x+rand(-28,28),4,86),y:clamp(a.y+rand(-18,18),34,78)};
}
function setState(a,state){
  a.state=state;
  a.el.classList.remove("walking","idle","resting");
  a.el.classList.add(state==="walk"?"walking":state==="rest"?"resting":"idle");
  a.el.dataset.ranchState=state;
}
function place(a){a.el.style.left=a.x+"%";a.el.style.top=a.y+"%"}
function clearAgent(a){
  const t=timers.get(a.id);if(t)clearTimeout(t);timers.delete(a.id);
  const f=frames.get(a.id);if(f)cancelAnimationFrame(f);frames.delete(a.id);
}
function schedule(a,ms){
  const old=timers.get(a.id);if(old)clearTimeout(old);
  timers.set(a.id,setTimeout(()=>step(a),ms));
}
function move(a,d,ms){
  const sx=a.x,sy=a.y,dx=d.x-sx,dy=d.y-sy,start=performance.now();
  setState(a,"walk");
  function tick(now){
    if(!document.body.contains(a.el))return;
    const p=clamp((now-start)/ms,0,1),e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
    a.x=sx+dx*e;a.y=sy+dy*e;place(a);
    if(p<1)frames.set(a.id,requestAnimationFrame(tick));
    else{frames.delete(a.id);a.x=d.x;a.y=d.y;place(a);setState(a,"idle");schedule(a,rand(650,1500));}
  }
  frames.set(a.id,requestAnimationFrame(tick));
}
function step(a){
  if(!document.body.contains(a.el))return;
  const roll=Math.random();
  if(roll<.68){
    const d=destination(a),dist=Math.hypot(d.x-a.x,d.y-a.y),ms=Math.round(clamp(1100+dist*45,1500,3600));
    move(a,d,ms);
  }else if(roll<.86){setState(a,"idle");schedule(a,rand(900,2300));}
  else{setState(a,"rest");schedule(a,rand(1800,3600));}
}
function stop(){for(const a of agents.values())clearAgent(a);timers.clear();frames.clear();agents.clear()}
function start(items){
  stop();
  (items||[]).forEach((it,i)=>{
    const col=i%3,row=Math.floor(i/3),a={id:it.id,el:it.el,x:10+col*30+(row%2)*5,y:38+row*30};
    a.x=clamp(a.x,4,86);a.y=clamp(a.y,34,78);agents.set(a.id,a);place(a);setState(a,"idle");schedule(a,rand(250,1000));
  });
}
R.ai={enabled:true,start,stop,agents,engine:"raf-v2"};
window.addEventListener("pagehide",stop);
})();
// Updated: 2026-10-12 20:36 JST
