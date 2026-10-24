/* Frenda Frontier Ver1.34: shared room geometry, furniture, navigation and rendering. */
(()=>{'use strict';const F=window.FRENDA_FRONTIER,R=window.FRENDA_FRONTIER_RENDERER;
F.interiorModel=(id,save)=>{const s=F.townPreviewState(save),lv=Math.max(1,F.facilityLevel(s,id)),max={shop:4,warehouse:2,house:3,forge:3,inn:2,bank:1}[id]||1;
 const dims={shop:[[512,448],[640,512],[768,576]][Math.max(0,lv-2)],warehouse:lv>1?[640,512]:[448,384],house:[[384,384],[512,448],[640,448]][Math.min(2,lv-1)],forge:[[448,384],[576,448],[640,512]][Math.min(2,lv-1)],inn:lv>1?[768,576]:[512,448],bank:[448,384]},[w,h]=dims[id]||dims.house,objects=[],walls=[];
 const add=(kind,x,y,ow,oh,label,action,extra={})=>{const o={kind,x,y,w:ow,h:oh,label,action,...extra};objects.push(o);return o};
 const partition=(x,y,pw,ph,door,vertical=false)=>{if(vertical){walls.push({x,y,w:pw,h:door-y},{x,y:door+64,w:pw,h:y+ph-door-64})}else walls.push({x,y,w:door-x,h:ph},{x:door+64,y,w:x+pw-door-64,h:ph})};
 const room={id,lv,max,w,h,objects,walls,spawn:{x:w/2,y:h-64},exit:{kind:'exit',x:w/2-32,y:h-32,w:64,h:32,label:'町へ出る',action:'exit'},shelves:[],name:F.FACILITY_DEFS.find(f=>f.id===id)?.name||id};
 const bed=(x,y,label='休む')=>add('bed',x,y,48,72,label,'rest');const rack=(x,y,slots=null)=>{const o=add('shelf',x,y,120,48,slots?'陳列棚':'保管棚',slots?'stock':'warehouse',{slots});if(slots)room.shelves.push(o);return o};
 if(id==='shop'){
  const count=(F.SHOP_CAPACITY[lv]||6)/3,bedroomW=128;partition(w-bedroomW,32,8,144,80,true);partition(w-bedroomW,176,bedroomW-32,8,w-112);bed(w-104,48);add('desk',w-104,136,48,32,'装備','equipment');
  add('counter',w/2-80,56,160,52,'営業・商品一覧','shop');add('cabinet',w-104,48,64,32,'保管品','warehouse');
  // A compact shop floor: customers enter through a clear central aisle;
  // merchandise racks face inward and the counter anchors the back wall.
  const rows=count/2;for(let i=0;i<count;i++){const col=i%2,row=Math.floor(i/2);rack(col?Math.min(w-168,344):48,160+row*80,[i*3,i*3+1,i*3+2])}
  if(lv>=3){add('cabinet',w-104,224,64,40,'保管品','warehouse');if(lv>=4)add('cabinet',w-104,304,64,40,'保管品','warehouse')}
 }else if(id==='warehouse'){
  const rows=lv>1?4:2;for(let i=0;i<rows;i++){rack(40,64+i*88);rack(w-136,64+i*88)}if(lv>1){rack(208,64);rack(336,64)}add('desk',w/2-40,h-128,80,40,'保管品を整理','warehouse');
 }else if(id==='house'){
  const beds=lv>=2?2:1;for(let i=0;i<beds;i++)bed(48+i*112,48);partition(32,144,lv===3?320:w-64,8,lv===3?224:w/2-32);add('table',96,224,80,48,'町の話','story');add('cabinet',40,h-96,40,48,'保管品','warehouse');add('stove',w-96,192,48,56,'休む','rest');if(lv===3){partition(368,32,8,h-64,272,true);add('desk',416,96,112,48,'装備を整える','equipment');rack(416,208)}
 }else if(id==='forge'){
  add('furnace',40,48,lv===3?112:80,112,'鍛冶・武器強化','forge');add('anvil',224,192,48,32,'武器を強化','forge');add('workbench',176,h-128,112,48,'装備を確認','equipment');rack(w-144,48);if(lv>=2){add('anvil',w-176,256,48,32,'武器を強化','forge');add('workbench',w-176,h-112,112,40,'装備を確認','equipment')}if(lv===3){rack(208,48);add('cabinet',40,h-112,64,48,'素材を確認','warehouse')}
 }else if(id==='inn'){
  const rooms=lv>1?3:1,first=lv>1?288:352;for(let i=0;i<rooms;i++){const x=first+i*144;bed(x,48,'宿泊する');if(lv>1){bed(x+64,48,'宿泊する');partition(x-16,160,144,8,x+16);if(i>0)walls.push({x:x-16,y:32,w:8,h:128})}}
  if(lv===1)partition(320,32,8,144,96,true);add('counter',40,224,112,40,'宿泊・冒険の噂','inn');add('stove',48,48,64,64,'宿泊・冒険の噂','inn');const rows=lv>1?2:1;for(let i=0;i<rows;i++)for(let j=0;j<2;j++)add('table',224+j*144,288+i*112,80,48,'冒険の噂','story');
 }else if(id==='bank'){
  partition(32,160,w-64,8,w-112);add('safe',48,48,56,72,'預ける・引き出す','bank');add('safe',128,48,56,72,'預ける・引き出す','bank');add('cabinet',256,48,96,40,'預ける・引き出す','bank');add('counter',96,224,176,40,'預ける・引き出す','bank');
 }
 objects.push(room.exit);room.stockCapacity=room.shelves.reduce((n,o)=>n+o.slots.length,0);return room};
F.interiorWalkable=(m,x,y)=>{const r=8;if(x<24+r||x>m.w-24-r||y<32+r||y>m.h-32)return false;return ![...m.walls,...m.objects.filter(o=>o.kind!=='exit')].some(o=>x>o.x-r&&x<o.x+o.w+r&&y>o.y-r&&y<o.y+o.h+r)};
F.interiorPath=(m,start,target,object=null)=>{const cell=16,cols=Math.ceil(m.w/cell),rows=Math.ceil(m.h/cell),key=(x,y)=>y*cols+x,coord=k=>({x:(k%cols)*cell+8,y:Math.floor(k/cols)*cell+8}),sx=Math.floor(start.x/cell),sy=Math.floor(start.y/cell),queue=[key(sx,sy)],seen=new Map([[queue[0],null]]);let end=null,best=Infinity;
 for(let i=0;i<queue.length;i++){const k=queue[i],p=coord(k),d=object?Math.hypot(Math.max(object.x-p.x,0,p.x-object.x-object.w),Math.max(object.y-p.y,0,p.y-object.y-object.h)):Math.hypot(p.x-target.x,p.y-target.y);if(d<best){best=d;end=k}if(d<=(object?27:10))break;const x=k%cols,y=Math.floor(k/cols);for(const [dx,dy]of [[0,1],[1,0],[0,-1],[-1,0]]){const nx=x+dx,ny=y+dy,n=key(nx,ny),q=coord(n);if(nx<0||ny<0||nx>=cols||ny>=rows||seen.has(n)||!F.interiorWalkable(m,q.x,q.y))continue;seen.set(n,k);queue.push(n)}}
 if(best>(object?28:32)||end===null)return[];const out=[];for(let k=end;k!==null;k=seen.get(k))out.push(coord(k));return out.reverse()};
R.renderInterior=(canvas,m,s,rt,art={})=>{canvas.width=512;canvas.height=448;const c=canvas.getContext('2d');if(!c)return;const px=rt.player?.x||m.spawn.x,py=rt.player?.y||m.spawn.y,fit=m.id==='shop'&&m.lv===2?1:Math.min(1,480/(m.w-32),416/(m.h-32)),camera={x:m.w<512?(m.w-512)/2:Math.max(0,Math.min(m.w-512,px-256)),y:m.h<448?(m.h-448)/2:Math.max(0,Math.min(m.h-448,py-240))};rt.camera=camera;c.imageSmoothingEnabled=false;c.fillStyle='#10291f';c.fillRect(0,0,512,448);c.save();if(fit<1){c.translate(256,224);c.scale(fit,fit);c.translate(-256,-224)}c.translate(-Math.round(camera.x),-Math.round(camera.y));
 const box=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))},outline=(o)=>{c.strokeStyle='#3e291b';c.lineWidth=3;c.strokeRect(o.x+1,o.y+1,o.w-2,o.h-2)},label=(text,x,y)=>{c.font='bold 11px sans-serif';c.textAlign='center';c.strokeStyle='#2c281d';c.lineWidth=3;c.strokeText(text,x,y);c.fillStyle='#f8e5b8';c.fillText(text,x,y)};
 const wood=(o,tone=0)=>{box(o.x,o.y+5,o.w,o.h,'#0005');box(o.x,o.y,o.w,o.h,['#926039','#ad7544','#805631'][tone]);for(let yy=o.y+4;yy<o.y+o.h;yy+=8){box(o.x+2,yy,o.w-4,1,'#dba166');box(o.x+3,yy+4,o.w-7,1,'#674428');for(let xx=o.x+9;xx<o.x+o.w-5;xx+=24)box(xx+(yy%3),yy+2,9,1,'#b7824a')}outline(o)};
 const cuts={shelf:[14,174,405,191],bed:[460,40,203,325],furnace:[768,14,267,357],stove:[768,14,267,357],counter:[1082,144,349,220],workbench:[14,446,393,226],anvil:[436,462,278,216],safe:[794,394,199,283],cabinet:[1075,401,358,269],table:[14,744,368,246],desk:[14,744,368,246],wood:[396,700,322,322],stone:[734,700,330,322],wall:[1084,700,338,322]};
 const sprite=(kind,o)=>{const src=cuts[kind];if(!art.interior||!src)return false;c.drawImage(art.interior,...src,o.x,o.y,o.w,o.h);return true};
 if(art.interior){c.save();c.beginPath();c.rect(16,16,m.w-32,m.h-32);c.clip();for(let y=16;y<m.h;y+=128)for(let x=16;x<m.w;x+=128)sprite(m.id==='forge'?'stone':'wood',{x,y,w:128,h:128});c.restore()}else{
 for(let y=16;y<m.h;y+=16)for(let x=16;x<m.w-16;x+=32){const n=((x*13+y*7)%29)/29;box(x,y,31,15,m.id==='forge'?(n>.5?'#777568':'#858071'):(n>.5?'#aa794b':'#b58552'));box(x+2,y+2,27,1,m.id==='forge'?'#9c9a87':'#d1a16a');box(x+8+(y%7),y+8,14,1,m.id==='forge'?'#656657':'#936337')}
}
 const wall=(o)=>{wood(o,2);if(o.w>o.h&&art.interior)sprite('wall',o);box(o.x+3,o.y+2,o.w-6,3,'#dfb072');box(o.x+3,o.y+o.h-4,o.w-6,4,'#492f20')};wall({x:16,y:16,w:m.w-32,h:24});wall({x:16,y:16,w:16,h:m.h-32});wall({x:m.w-32,y:16,w:16,h:m.h-32});wall({x:16,y:m.h-32,w:m.w/2-48,h:16});wall({x:m.w/2+32,y:m.h-32,w:m.w/2-48,h:16});for(const w of m.walls)wall(w);
 // Windows and wall lights are fixed fixtures, never display merchandise.
 for(const x of [m.w/2-32,m.w-112]){box(x,19,32,20,'#493d2b');box(x+3,22,26,14,'#9cbbc0');box(x+15,22,2,14,'#e6d6a4');box(x+3,28,26,2,'#e6d6a4')}
 for(const x of [40,m.w-52]){box(x,46,10,18,'#35281d');box(x+2,48,6,12,'#f5c46d');box(x+3,49,3,9,'#fff1b0')}
 if(['shop','house','inn','bank'].includes(m.id)){const rx=m.w/2-28,ry=m.h-152;box(rx,ry,56,112,'#665a36');box(rx+3,ry+3,50,106,'#a08e52');box(rx+6,ry+6,44,100,'#5d6742');for(let yy=ry+12;yy<ry+102;yy+=16){box(rx+10,yy,4,4,'#c6ad68');box(rx+42,yy,4,4,'#c6ad68')}}
 for(const o of m.objects){if(o.kind==='exit'){box(o.x,o.y,o.w,o.h,'#6b583a');box(o.x+4,o.y+4,o.w-8,o.h-8,'#c4a87d');label('町へ',o.x+o.w/2,o.y+20);continue}const rich=sprite(o.kind,o);if(!rich)wood(o,o.kind==='bed'?2:0);
  if(o.kind==='shelf'){if(!rich){box(o.x+5,o.y+7,o.w-10,o.h-13,'#3f2b1b');for(let i=0;i<3;i++){box(o.x+5+i*29,o.y+7,3,o.h-13,'#d09a5c');box(o.x+8+i*29,o.y+o.h-9,26,3,'#c89150')}}if(o.slots)o.slots.forEach((slot,i)=>{const sh=s.shelves?.[slot],im=sh&&sh.qty>0?art.items?.[sh.itemId]:null,cx=o.x+24+i*37;if(im){const k=Math.min(24/im.naturalWidth,24/im.naturalHeight);c.drawImage(im,cx-im.naturalWidth*k/2,o.y+8,im.naturalWidth*k,im.naturalHeight*k)}else if(sh&&sh.qty>0)label(F.item(sh.itemId)?.icon||'',cx,o.y+25);label(sh&&sh.qty>0?sh.price+'G':'空',cx,o.y+o.h+13)});
  }else if(!rich&&o.kind==='bed'){box(o.x+5,o.y+8,o.w-10,o.h-14,'#e1d3a4');box(o.x+7,o.y+24,o.w-14,o.h-33,'#4d819b');for(let yy=o.y+28;yy<o.y+o.h-9;yy+=8)box(o.x+9,yy,o.w-18,1,'#86adc0');box(o.x+8,o.y+9,o.w-16,16,'#f0ebd2');
  }else if(!rich&&(o.kind==='furnace'||o.kind==='stove')){box(o.x+3,o.y+3,o.w-6,o.h-6,'#605c50');for(let yy=o.y+5;yy<o.y+o.h-5;yy+=12)for(let xx=o.x+5;xx<o.x+o.w-5;xx+=16)box(xx,yy,13,9,'#807967');box(o.x+12,o.y+o.h*.45,o.w-24,o.h*.4,'#342a21');box(o.x+16,o.y+o.h*.52,o.w-32,o.h*.28,'#d66a2d');box(o.x+20,o.y+o.h*.62,o.w-40,o.h*.17,'#ffcf61');
  }else if(!rich&&o.kind==='safe'){box(o.x+3,o.y+3,o.w-6,o.h-6,'#6d7b7c');box(o.x+7,o.y+7,o.w-14,o.h-14,'#424b4c');box(o.x+o.w/2,o.y+o.h/2,12,6,'#c9ad64');
  }else if(!rich&&o.kind==='anvil'){box(o.x-4,o.y+4,o.w+8,10,'#40494c');box(o.x+4,o.y+6,o.w-8,4,'#a8b1ae');box(o.x+o.w/2-6,o.y+12,12,18,'#626b6a');
  }else if(!rich&&o.kind==='counter'){box(o.x+8,o.y+8,18,12,'#303a39');box(o.x+10,o.y+9,14,7,'#8ca397');box(o.x+o.w-26,o.y+8,16,18,'#e1cf96');
  }else if(!rich&&o.kind==='workbench'){box(o.x+15,o.y+8,32,4,'#565d59');box(o.x+39,o.y+6,6,14,'#8c9891')}
 }
 const player=rt.player||m.spawn,img=art[rt.facing==='up'?'playerBack':rt.facing==='left'?'playerLeft':rt.facing==='right'?'playerRight':'playerFront'];box(player.x-9,player.y-1,18,4,'#0004');if(img){const sw=img.naturalWidth,sh=img.naturalHeight,dw=60,dh=75,feet=sh*.20,step=rt.moving?Math.sin(Date.now()/90)*1.4:0;c.drawImage(img,0,0,sw,sh-feet,player.x-dw/2,player.y-dh+15,dw,dh*.8);c.drawImage(img,0,sh-feet,sw/2,feet,player.x-dw/2,player.y-8-step,dw/2,15);c.drawImage(img,sw/2,sh-feet,sw/2,feet,player.x,player.y-8+step,dw/2,15)}else{box(player.x-10,player.y-32,20,16,'#b44832');box(player.x-8,player.y-16,16,16,'#33546a')}
 c.restore();return camera};
})();
// Updated: 2026-10-24 JST / Ver1.34

// Updated: 2026-10-24 JST / Ver1.35

// Updated: 2026-10-24 JST / Ver1.36
