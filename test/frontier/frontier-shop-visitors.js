/* Frenda Frontier Ver1.66: one real visitor, from arrival to checkout and departure. */
(()=>{'use strict';
const F=window.FRENDA_FRONTIER,V=F.SHOP_VISITS={actor:null,serial:0,receipts:new Set()};
const phaseNames={approach:'来店中',enter:'入店',browse:'品定め',checkout:'会計へ',pay:'会計中',exit:'退店'};
let atlas=null;const im=new Image();im.onload=()=>{atlas=im;};im.src='frontier-sprite-npcs-v124.png';
V.cancel=()=>{V.serial++;V.actor=null;};
V.validQuote=(s,result)=>{const q=result.choice,sh=q&&s.shelves[q.slot];return !!(q&&sh&&sh.qty>0&&sh.itemId===q.itemId&&sh.price===q.price);};
V.commit=(id,result)=>{if(V.receipts.has(id))return null;let settled=result;
 if(result.bought&&!V.validQuote(F.readSave(),result))settled={...result,bought:false,reason:'見ていた商品や価格が変わったため、購入を見送った'};
 F.applyCustomerVisit(settled);V.receipts.add(id);if(V.receipts.size>100)V.receipts.delete(V.receipts.values().next().value);return settled;};
V.run=async(visitor,{active,show,repaint=()=>{},commit=true,decide=F.simulateCustomer}={})=>{
 const serial=++V.serial,key=F.SAVE_KEY,id=key+':'+Date.now()+':'+serial,m=F.interiorModel('shop',F.readSave());
 const actor=V.actor={id,visitor,model:m,position:{...m.spawn},phase:'approach',facing:'up',moving:false,space:'town',key,sprite:visitor.needs?.includes('素材')?1:2};
 const live=()=>serial===V.serial&&F.SAVE_KEY===key&&!document.hidden&&active();
 const wait=async ms=>{for(let left=ms;left>0;left-=50){if(!live())return false;await new Promise(r=>setTimeout(r,Math.min(50,left)));repaint();}return live();};
 const phase=(p,text)=>{actor.phase=p;show(text);repaint();};
 const move=async(path,space)=>{if(!path?.length)return false;actor.space=space;actor.moving=true;
  for(const point of path){let last=Date.now();while(Math.hypot(point.x-actor.position.x,point.y-actor.position.y)>.1){if(!live())return false;await new Promise(r=>setTimeout(r,16));const now=Date.now(),d=Math.hypot(point.x-actor.position.x,point.y-actor.position.y),step=Math.min(d,110*Math.min(.05,(now-last)/1000));last=now;const dx=point.x-actor.position.x,dy=point.y-actor.position.y;actor.facing=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');actor.position.x+=dx/d*step;actor.position.y+=dy/d*step;repaint();}}
  actor.moving=false;return live();};
 const walkTo=async(object)=>{const path=F.interiorPath(m,actor.position,{x:object.x+object.w/2,y:object.y+object.h/2},object);return move(path,'indoor');};
 let settled=null;
 try{
  phase('approach',visitor.name+'がお店の入口へ向かっています。');
  const P=F.TOWN_PROGRESS,stage=P?.stageFor(F.readSave()),scene=stage!==null&&stage!==undefined?P.scene(stage):null,shop=scene?.objects.find(o=>o.id==='shop');
  if(shop){const from={x:500,y:155},path=P.path(scene,from,shop.door);actor.position={...from};if(!await move(path,'town'))return null;}else if(!await wait(500))return null;
  actor.position={...m.spawn};actor.space='indoor';phase('enter',visitor.name+'が入店しました。');if(!await wait(450))return null;
  // The decision is made after browsing. Shelves cannot be sold remotely.
  const shelves=m.shelves.filter(o=>o.slots?.some(i=>F.readSave().shelves[i]?.qty>0));let visited=0;
  for(const shelf of shelves){phase('browse',visitor.name+'が商品棚を見ています。');if(!await walkTo(shelf))continue;visited++;if(!await wait(800))return null;}
  if(!live())return null;
  let result=decide(visitor);
  if(!visited)result={...result,bought:false,reason:'商品棚へたどり着けなかった'};
  if(result.bought){const shelf=m.shelves.find(o=>o.slots?.includes(result.choice.slot));if(!shelf||!await walkTo(shelf))result={...result,bought:false,reason:'商品に手が届かなかった'};}
  if(result.bought){phase('checkout',visitor.name+'が商品を選び、会計へ向かっています。');const counter=m.objects.find(o=>o.kind==='counter');if(!counter||!await walkTo(counter))result={...result,bought:false,reason:'会計へたどり着けなかった'};}
  if(!live())return null;
  if(result.bought){phase('pay',visitor.name+'の会計中です。');if(!await wait(1100))return null;}
  // Once committed, departure cancellation never rolls back a paid purchase.
  settled=commit?V.commit(id,result):result;if(!settled)return null;
  phase('exit',settled.bought?visitor.name+'が'+settled.choice.item.name+'を'+settled.choice.price+'Gで購入しました。':visitor.name+'は「'+settled.reason+'」と購入を見送りました。');
  if(!await walkTo(m.exit))return settled;if(!await wait(400))return settled;
  if(shop&&live()){actor.position={...shop.door};const path=P.path(scene,actor.position,{x:500,y:155});await move(path,'town');}
  return settled;
 }finally{if(V.actor===actor)V.actor=null;repaint();}
};
V.drawActor=(c,a,size=48)=>{const p=a.position,face={down:0,left:1,right:2,up:3}[a.facing]||0,bob=a.moving?Math.sin(Date.now()/100)*1.2:0;c.save();c.imageSmoothingEnabled=false;c.fillStyle='#0004';c.beginPath();c.ellipse(p.x,p.y,9,3,0,0,Math.PI*2);c.fill();if(atlas)c.drawImage(atlas,(a.sprite*4+face)*64,0,64,80,p.x-size*.4,p.y-size+bob,size*.8,size);else{c.fillStyle='#287462';c.fillRect(p.x-8,p.y-22,16,22);c.fillStyle='#edc19b';c.fillRect(p.x-7,p.y-34,14,13);}c.font='bold 10px sans-serif';c.textAlign='center';const text=phaseNames[a.phase]||'お客さん',w=c.measureText(text).width+10;c.fillStyle='#fff7dd';c.fillRect(p.x-w/2,p.y-size-16,w,14);c.fillStyle='#264c35';c.fillText(text,p.x,p.y-size-5);c.restore();};
V.drawIndoor=(c,m,rt,behind)=>{const a=V.actor;if(!a||a.key!==F.SAVE_KEY||a.space!=='indoor'||m.id!=='shop')return;if((a.position.y<rt.player.y)!==behind)return;V.drawActor(c,a,58);};
V.drawTown=(c,cam)=>{const a=V.actor;if(!a||a.key!==F.SAVE_KEY||a.space!=='town')return;c.save();c.translate(-cam.x,-cam.y);V.drawActor(c,a,28);c.restore();};
})();
// Updated: 2026-10-25 JST / Ver1.66

// Updated: 2026-10-25 19:47 JST / Ver1.66

// Updated: 2026-10-25 19:54 JST / Ver1.66
