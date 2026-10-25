/* Frenda Frontier Ver1.68: Mina's arrival, commute, work and home life. */
(()=>{'use strict';
const F=window.FRENDA_FRONTIER,P=F.TOWN_PROGRESS,N=F.RESIDENTS={actor:null,scene:null,last:0,paused:false,demo:null};
const identity={id:'forge_mina',name:'ミナ',job:'鍛冶職人',sprite:0};let atlas=null;
P.image('frontier-sprite-npcs-v124.png').then(im=>{atlas=im;}).catch(()=>{});
N.eligible=s=>P.stageFor(s)>=5&&F.facilityLevel(s,'forge')>0&&F.facilityLevel(s,'house')>0;
N.homeId=s=>P.stageFor(s)>=7?'house2':'house';
N.ensure=s=>{if(!N.eligible(s)||s.story.settlers?.forge_mina)return s;return F.mutateSave(t=>{t.story.settlers=t.story.settlers||{};t.story.settlers.forge_mina={arrivedDay:t.day,introduced:false};t.development.town.residentCount=Math.max(1,Number(t.development.town.residentCount)||0);F.addHistory(t,'resident','鍛冶職人ミナが職人の住居へ移住しました。');});};
N.cached=F.readSave();const write=F.writeSave;F.writeSave=s=>{const value=write(s);N.cached=value;return value;};
N.reset=()=>{N.actor=null;N.scene=null;N.last=0;N.paused=false;N.demo=null;};
N.destination=s=>['morning','day'].includes(F.timeInfo(s).id)?'forge':'house';
N.plan=(a,s)=>{const goal=N.destination(s),o=N.scene.objects.find(o=>o.id===(goal==='forge'?'forge':N.homeId(s)));if(!o)return;
 if(a.goal===goal&&(a.route.length||a.inside===goal))return;
 a.goal=goal;if(a.inside){const old=N.scene.objects.find(o=>o.id===(a.inside==='forge'?'forge':N.homeId(s)));if(old)a.position={...old.door};a.inside=null;}
 a.route=P.path(N.scene,a.position,o.door);a.mode=goal==='forge'?'出勤中':'帰宅中';a.moving=!!a.route.length;
 if(!a.route.length){a.mode='道を確認中';return;}
};
N.step=(now=Date.now(),player=null)=>{const s=N.cached,stage=P.stageFor(s);if(!N.eligible(s)){N.actor=null;N.scene=null;N.last=now;return null;}
 if(!N.actor||N.actor.key!==F.SAVE_KEY||N.actor.stage!==stage){N.ensure(s);N.scene=P.scene(stage);const home=N.scene.objects.find(o=>o.id===N.homeId(s));if(!home)return null;N.actor={...identity,key:F.SAVE_KEY,stage,position:{...home.door},inside:'house',goal:null,route:[],moving:false,facing:'down',mode:'自宅',roomPositions:{}};N.last=now;}
 const a=N.actor,dt=Math.max(0,Math.min(.05,(now-N.last)/1000));N.last=now;
 if(document.hidden||N.paused||now<(N.pauseUntil||0))return a;
 N.plan(a,N.cached);let budget=dt*62;
 if(player&&Math.hypot(a.position.x-player.x,a.position.y-player.y)<24)budget=0;
 while(a.route.length&&budget>0){const p=a.route[0],dx=p.x-a.position.x,dy=p.y-a.position.y,d=Math.hypot(dx,dy);if(d<.01){a.route.shift();continue;}a.facing=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');const step=Math.min(d,budget);a.position.x+=dx/d*step;a.position.y+=dy/d*step;budget-=step;if(step===d)a.route.shift();}
 if(a.moving&&!a.route.length){a.moving=false;a.inside=a.goal;a.mode=a.inside==='forge'?'仕事中':'自宅';}
 const demo=N.demo;if(demo?.key===F.SAVE_KEY){if(demo.step==='commute'&&a.inside==='forge'){demo.step='work';demo.at=now;F.mutateSave(t=>F.advanceTimeState(t,1,'residentTest'));N.onChange?.();}else if(demo.step==='work'&&now-demo.at>10000){demo.step='return';F.mutateSave(t=>F.advanceTimeState(t,1,'residentTest'));N.onChange?.();}else if(demo.step==='return'&&a.inside==='house'){demo.step='home';demo.at=now;}else if(demo.step==='home'&&now-demo.at>2500){N.demo=null;F.mutateSave(t=>F.advanceTimeState(t,1,'residentTest'));N.onChange?.();}}
 return a;
};
N.status=()=>{const a=N.actor;return a?`${a.name}（${a.job}）：${a.mode}`:'鍛冶職人はまだ移住していません。';};
N.draw=(c,p,facing,moving,size,label,work=false)=>{c.save();c.imageSmoothingEnabled=false;c.fillStyle='#0004';c.beginPath();c.ellipse(p.x,p.y,Math.max(6,size*.17),3,0,0,Math.PI*2);c.fill();const face={down:0,left:1,right:2,up:3}[facing]||0,bob=moving?Math.sin(Date.now()/105):0;if(atlas)c.drawImage(atlas,face*64,0,64,80,p.x-size*.4,p.y-size+bob,size*.8,size);else{c.fillStyle='#ad5739';c.fillRect(p.x-8,p.y-23,16,23);c.fillStyle='#e9bd90';c.fillRect(p.x-7,p.y-35,14,13);}if(work&&Math.floor(Date.now()/450)%2===0){c.fillStyle='#f9d77e';c.fillRect(p.x+8,p.y-22,3,3);c.fillRect(p.x+13,p.y-27,2,3);}c.font='bold '+(size<40?10:12)+'px sans-serif';c.textAlign='center';const w=c.measureText(label).width+10;c.fillStyle='#fff4d9';c.fillRect(p.x-w/2,p.y-size-17,w,15);c.fillStyle='#3e3928';c.fillText(label,p.x,p.y-size-5);c.restore();};
N.drawTown=(c,cam,player,behind)=>{const a=N.actor;if(!a||a.inside||((a.position.y<player.y)!==behind))return;c.save();c.translate(-cam.x,-cam.y);N.draw(c,a.position,a.facing,a.moving,34,a.name+' '+a.mode);c.restore();};
N.roomPoint=(m,a)=>{const key=m.id+':'+m.lv;if(!a.roomPositions[key]){const o=m.objects.find(o=>o.kind===(m.id==='forge'?'anvil':'bed'));const path=o?F.interiorPath(m,m.spawn,{x:o.x,y:o.y},o):[];a.roomPositions[key]=path[path.length-1]||m.spawn;}return a.roomPositions[key];};
N.indoorActor=(m,rt)=>{const a=N.actor;if(!a||a.inside!==m.id||!['forge','house'].includes(m.id))return null;if(m.id==='house'&&rt.residentHomeId&&rt.residentHomeId!==N.homeId(N.cached))return null;return{a,p:N.roomPoint(m,a)};};
N.drawIndoor=(c,m,rt,behind)=>{const h=N.indoorActor(m,rt);if(!h||((h.p.y<rt.player.y)!==behind))return;N.draw(c,h.p,m.id==='forge'?'up':'down',false,64,h.a.name+' '+h.a.mode,m.id==='forge');};
N.hitTown=p=>{const a=N.actor;return !!(a&&!a.inside&&Math.abs(p.x-a.position.x)<22&&p.y>a.position.y-53&&p.y<a.position.y+10);};
N.hitIndoor=(p,m,rt)=>{const h=N.indoorActor(m,rt);return !!(h&&Math.abs(p.x-h.p.x)<28&&p.y>h.p.y-76&&p.y<h.p.y+12);};
N.talk=()=>{if(!N.eligible(F.readSave()))return null;N.ensure(F.readSave());const first=!F.readSave().story.settlers.forge_mina.introduced;if(first)F.mutateSave(s=>{s.story.settlers.forge_mina.introduced=true;F.addHistory(s,'resident','鍛冶職人ミナと自己紹介をした。');});N.paused=true;return{first,title:'ミナ／鍛冶職人',text:first?'「はじめまして、鍛冶職人のミナです。この町に家と工房ができたと聞いて、引っ越してきました。朝から昼は工房で仕事をして、夕方には家へ帰ります。」':'「武器を強くしたいなら、工房へどうぞ。強化費と鉄のかけらが必要です。木材と鉄は、建築に使う分も残しておくと安心ですよ。」',status:N.status()};};
N.endTalk=()=>{N.paused=false;N.pauseUntil=Date.now()+500;};
N.startDemo=()=>{if(!F.SAVE_KEY.includes(':mission148test:'))throw Error('TEST時点を選んでください。');N.reset();F.mutateSave(s=>{s.clock.phaseIndex=0;});N.ensure(F.readSave());N.demo={key:F.SAVE_KEY,step:'commute'};};
N.stopIndoor=()=>{N.indoorToken=(N.indoorToken||0)+1;};
N.startIndoor=(paint,alive)=>{N.stopIndoor();const token=N.indoorToken;let last=0;const frame=now=>{if(token!==N.indoorToken||!alive())return;if(now-last>50){N.step();paint();last=now;}requestAnimationFrame(frame);};requestAnimationFrame(frame);};
const finish=F.TOWN_DEVELOPMENT.finish;F.TOWN_DEVELOPMENT.finish=(...args)=>{const result=finish(...args);N.ensure(F.readSave());return result;};
N.workAvailable=()=>{N.step();return !N.eligible(N.cached)||(N.actor?.inside==='forge'&&N.destination(N.cached)==='forge');};
const upgrade=F.townForgeUpgrade;F.townForgeUpgrade=(...args)=>{if(!N.workAvailable())throw Error('ミナは'+(N.actor?.mode||'移動中')+'です。朝から昼、工房にいるときに強化できます。');return upgrade(...args);};
const switchPoint=F.OPENING.switchPoint;F.OPENING.switchPoint=(...args)=>{N.reset();const value=switchPoint(...args);N.cached=F.readSave();N.ensure(N.cached);return value;};
N.ensure(N.cached);
})();
// Updated: 2026-10-25 JST / Ver1.68

// Updated: 2026-10-25 20:51 JST / Ver1.68
