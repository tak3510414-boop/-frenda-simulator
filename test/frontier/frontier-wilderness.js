/* Frenda Frontier Ver1.45 — construction-free terrain inspection. */
(()=>{'use strict';
const F=window.FRENDA_FRONTIER, W=F.WILDERNESS={active:true,width:1536,height:1024,structures:[],position:{x:775,y:315},facing:'down',overview:false,token:0};
const cell=12,cols=128,rows=86;
// Authored terrain zones: grass clearings and trails; water and woodland are closed.
const clearings=[[[.04,.08],[.25,.06],[.28,.20],[.20,.26],[.06,.23]],[[.39,.08],[.57,.08],[.60,.20],[.51,.26],[.40,.22]],[[.68,.08],[.90,.09],[.94,.22],[.74,.26]],[[.04,.36],[.24,.36],[.28,.48],[.17,.55],[.06,.49]],[[.40,.35],[.60,.36],[.61,.55],[.42,.56]],[[.73,.36],[.95,.36],[.96,.53],[.78,.56]],[[.05,.65],[.17,.65],[.19,.75],[.06,.77]],[[.28,.65],[.40,.66],[.42,.76],[.28,.77]],[[.60,.65],[.74,.65],[.77,.77],[.61,.77]]];
const trails=[{p:[[.33,0],[.32,.12],[.31,.22],[.34,.30]],w:40},{p:[[.02,.30],[.18,.28],[.33,.30],[.50,.27],[.65,.30],[.82,.28],[.98,.31]],w:40},{p:[[.65,.08],[.63,.20],[.65,.31],[.65,.48],[.62,.58]],w:36},{p:[[.34,.30],[.33,.44],[.30,.58]],w:40},{p:[[.03,.59],[.20,.59],[.35,.60],[.51,.61],[.68,.59],[.83,.60],[.97,.61]],w:42},{p:[[.50,.27],[.50,.50],[.50,.84]],w:44},{p:[[0,.80],[.21,.79],[.42,.80],[.51,.81],[.72,.80],[1,.80]],w:36}];
trails.push({p:[[.17,.52],[.17,.59]],w:38},{p:[[.82,.52],[.82,.60]],w:38},{p:[[.18,.23],[.18,.29]],w:38},{p:[[.50,.22],[.50,.28]],w:38},{p:[[.80,.22],[.82,.29]],w:38},{p:[[.12,.60],[.12,.80]],w:32},{p:[[.34,.60],[.34,.80]],w:32},{p:[[.68,.60],[.68,.80]],w:32});
const rocks=[[.565,.46,18],[.44,.44,16],[.25,.31,17],[.915,.49,18]];
const inside=(x,y,p)=>{let yes=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const[a,b]=p[i],[c,d]=p[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)yes=!yes}return yes};
const dist=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy)};
W.walkable=(x,y)=>{if(W.structures.some(b=>x>b.x-10&&x<b.x+b.w+10&&y>b.y-8&&y<b.y+b.h))return false;if(x<18||x>1518||y<8||y>860)return false;if(rocks.some(([a,b,r])=>Math.hypot(x-a*1536,y-b*1024)<r+10))return false;if(clearings.some(p=>inside(x/1536,y/1024,p)))return true;return trails.some(t=>t.p.slice(1).some((b,i)=>dist({x,y},{x:t.p[i][0]*1536,y:t.p[i][1]*1024},{x:b[0]*1536,y:b[1]*1024})<t.w/2))};
let grid=Array.from({length:rows},(_,y)=>Array.from({length:cols},(_,x)=>W.walkable(x*cell+6,y*cell+6)));
W.path=(from,to)=>{const sx=Math.floor(from.x/cell),sy=Math.floor(from.y/cell),tx=Math.floor(to.x/cell),ty=Math.floor(to.y/cell);if(!grid[ty]?.[tx]||!grid[sy]?.[sx])return[];const start=sy*cols+sx,goal=ty*cols+tx,q=[start],prev=new Map([[start,-1]]);for(let i=0;i<q.length;i++){const k=q[i];if(k===goal)break;const x=k%cols,y=Math.floor(k/cols);for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,n=ny*cols+nx;if(nx<0||nx>=cols||!grid[ny]?.[nx]||prev.has(n))continue;prev.set(n,k);q.push(n)}}if(!prev.has(goal))return[];const p=[];for(let k=goal;k!==-1;k=prev.get(k))p.push({x:k%cols*cell+6,y:Math.floor(k/cols)*cell+6});return p.reverse()};
const images={},load=src=>images[src]||(images[src]=new Promise((resolve,reject)=>{const i=new Image;i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('マップ画像を読み込めません。差分ZIPの画像も配置してください。'));i.src=src}));
W.stop=()=>{W.token++;W.route=[]};
W.mount=(host,rerender,actions={})=>{W.stop();W.structures=F.OPENING?.solids()||[];if(F.OPENING?.active())F.OPENING.visibleState=F.readSave();grid=Array.from({length:rows},(_,y)=>Array.from({length:cols},(_,x)=>W.walkable(x*cell+6,y*cell+6)));const phase=F.OPENING?.active()?F.OPENING.phase():'arrival';const count=W.structures.length;const token=W.token;host.classList.remove('townSceneLayout');host.innerHTML=(F.OPENING?.active()?F.OPENING.guide()+F.OPENING.testControls():'')+`<div style="background:#163d2b;color:#fff;padding:10px 14px;display:flex;justify-content:space-between;gap:8px"><b>未開拓地</b><span>構築物 ${count}</span></div><canvas id="wildernessCanvas" style="display:block;width:100%;height:auto;touch-action:manipulation;background:#375b32" aria-label="建物のない未開拓地。草地や土の道をタップすると歩きます。"></canvas><p id="wildernessMessage" style="margin:8px 12px">草地・土の道をタップして移動できます。川と森は通れません。</p><div style="display:flex;gap:8px;padding:8px 12px;flex-wrap:wrap"><button id="wildZoom" class="cmdBtn">${W.overview?'近くを見る':'全体を見る'}</button><button id="wildReset" class="cmdBtn">出発地点へ</button><button id="wildNormal" class="cmdBtn">従来のセーブへ戻る</button></div>`+(F.OPENING?.active()?F.OPENING.panel():'');
 F.OPENING?.bind(rerender,actions);
 const cv=document.getElementById('wildernessCanvas'),msg=document.getElementById('wildernessMessage');cv.width=W.overview?1536:720;cv.height=W.overview?1024:820;
 document.getElementById('viewTitle').textContent=phase==='complete'?'はじまりの店':'未開拓地';document.getElementById('viewSubtitle').textContent='テント設営後の開拓生活';document.getElementById('viewMeta').textContent='構築物 '+count;
 const stats=document.getElementById('headStats');if(stats)stats.innerHTML=`<span class="pill">🌱 開拓ミッション</span><span class="pill">構築物 ${count}</span>`;
 document.getElementById('wildZoom').onclick=()=>{W.overview=!W.overview;rerender()};document.getElementById('wildReset').onclick=()=>{W.position={x:775,y:315};rerender()};document.getElementById('wildNormal').onclick=()=>{try{F.OPENING?.leave();W.active=false;W.stop();rerender()}catch(e){msg.textContent=e.message}};
 let art,camera={x:0,y:0},last=0,route=[];
 const draw=()=>{const c=cv.getContext('2d');c.imageSmoothingEnabled=false;camera=W.overview?{x:0,y:0}:{x:Math.max(0,Math.min(1536-cv.width,W.position.x-cv.width/2)),y:Math.max(0,Math.min(1024-cv.height,W.position.y-cv.height/2))};c.clearRect(0,0,cv.width,cv.height);if(!art)return;c.drawImage(art[0],0,0,1536,1024,-camera.x,-camera.y,1536,1024);F.OPENING?.draw(c,art,camera);const im=art[1+['down','up','left','right'].indexOf(W.facing)],p=W.position;c.drawImage(im,p.x-camera.x-19,p.y-camera.y-48,38,54)};
 cv.onclick=e=>{if(!art)return;const b=cv.getBoundingClientRect(),p={x:(e.clientX-b.left)/b.width*cv.width+camera.x,y:(e.clientY-b.top)/b.height*cv.height+camera.y};route=W.path(W.position,p);msg.textContent=route.length?'移動しています。':'そこへは歩いて行けません。草地・土の道を選んでください。'};
 const tick=now=>{if(token!==W.token||!cv.isConnected)return;const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;let budget=120*dt;while(route.length&&budget>0){const t=route[0],dx=t.x-W.position.x,dy=t.y-W.position.y,d=Math.hypot(dx,dy);if(d<.1){route.shift();continue}W.facing=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');const step=Math.min(d,budget);W.position.x+=dx/d*step;W.position.y+=dy/d*step;budget-=step;if(step===d)route.shift();if(!route.length)msg.textContent='到着しました。次の場所をタップできます。'}draw();requestAnimationFrame(tick)};
 Promise.all(['frontier-wilderness-v145.png','frontier-sprite-player-front-v069.png','frontier-sprite-player-back-v069.png','frontier-sprite-player-left-v069.png','frontier-sprite-player-right-v069.png','frontier-tent-v130.png','frontier-starter-shop-v146.png','frontier-stall-v133.png'].map(load)).then(a=>{if(token!==W.token)return;art=a;draw();requestAnimationFrame(tick)}).catch(e=>{if(token===W.token)msg.textContent=e.message});
};
})();
// Updated: 2026-10-25 JST / Ver1.45

// Updated: 2026-10-25 JST / Ver1.46

// Updated: 2026-10-25 JST / Ver1.47

// Updated: 2026-10-25 JST / Ver1.48

// Updated: 2026-10-25 JST / Ver1.51
