/* Frenda Frontier Ver1.44: approved room plans with live shop stock overlays. */
(()=>{'use strict';
const F=window.FRENDA_FRONTIER,R=window.FRENDA_FRONTIER_RENDERER;
const MAX={shop:6,forge:6,inn:6,house:6,owner_home:1,warehouse:2,bank:1};
const SHOP_RACKS=[0,3,4,5,6,6,9],INN_SEATS=[0,4,8,8,12,16,20],INN_BEDS=[0,1,1,2,3,4,6];
// Shelf hitboxes and display faces are measured from the approved Lv1–Lv6 shop boards (512×448).
const SHOP_PLAN_RACKS={
 1:[[[64,228,75,126],[77,250,49,84]],[[166,228,75,126],[179,250,49,84]],[[269,228,75,126],[282,250,49,84]]],
 2:[[[10,238,76,124],[23,255,50,82]],[[134,238,76,124],[147,255,50,82]],[[255,238,76,124],[268,255,50,82]],[[378,238,76,124],[391,255,50,82]]],
 3:[[[5,239,76,123],[18,254,50,83]],[[103,239,76,123],[116,254,50,83]],[[202,239,76,123],[215,254,50,83]],[[303,239,76,123],[316,254,50,83]],[[406,239,76,123],[419,254,50,83]]],
 4:[[[77,228,68,101],[91,235,40,73]],[[137,228,68,101],[151,235,40,73]],[[198,228,68,101],[212,235,40,73]],[[258,228,68,101],[272,235,40,73]],[[319,228,68,101],[333,235,40,73]],[[380,228,68,101],[394,235,40,73]]],
 5:[[[44,228,68,101],[58,235,40,73]],[[105,228,68,101],[119,235,40,73]],[[166,228,68,101],[180,235,40,73]],[[227,228,68,101],[241,235,40,73]],[[288,228,68,101],[302,235,40,73]],[[349,228,68,101],[363,235,40,73]]],
 6:[[[116,110,68,101],[128,128,44,68]],[[196,110,68,101],[208,128,44,68]],[[276,110,68,101],[288,128,44,68]],[[356,110,68,101],[368,128,44,68]],[[22,226,68,103],[34,244,44,68]],[[103,226,68,103],[115,244,44,68]],[[184,226,68,103],[196,244,44,68]],[[265,226,68,103],[277,244,44,68]],[[346,226,68,103],[358,244,44,68]]]
};
const DIMS={
 shop:[[512,448],[576,448],[640,448],[704,480],[704,480],[800,512]],
 forge:[[448,384],[512,384],[576,448],[640,448],[640,448],[640,448]],
 house:[[448,384],[512,448],[576,448],[640,448],[640,512],[704,512]],
 owner_home:[[576,512]],
 inn:[[512,448],[576,448],[640,448],[704,480],[768,512],[768,512]],
 warehouse:[[448,384],[640,512]],bank:[[448,384]]
};
F.interiorModel=(id,save)=>{
 const s=F.townPreviewState(save),lv=Math.max(1,Math.min(MAX[id]||1,F.facilityLevel(s,id))),objects=[],walls=[],decor=[];
 const [w,h]=(DIMS[id]||DIMS.house)[lv-1]||[512,448];
 const add=(kind,x,y,ow,oh,label,action,extra={})=>{const o={kind,x,y,w:ow,h:oh,label,action,...extra};objects.push(o);return o};
 const wall=(x,y,ww,hh)=>walls.push({x,y,w:ww,h:hh});
 const bed=(x,y,label='休む',extra={})=>add('bed',x,y,58,84,label,'rest',extra);
 const shelf=(x,y,ww,hh,slot=null,kind='shelf',label='陳列棚')=>{const o=add(kind,x,y,ww,hh,label,kind==='shelf'?'stock':'warehouse',slot===null?{}:{slots:[slot]});if(slot!==null)room.shelves.push(o);return o};
 const counter=(x,y,ww=116,label='会計')=>add('counter',x,y,ww,48,label,'shop');
 const room={id,lv,max:MAX[id]||1,w,h,objects,walls,decor,spawn:{x:w/2,y:h-64},exit:{kind:'exit',x:w/2-34,y:h-32,w:68,h:32,label:'町へ出る',action:'exit'},shelves:[],name:F.FACILITY_DEFS.find(f=>f.id===id)?.name||id};

 if(id==='shop'){
  const cap=SHOP_RACKS[lv],sx=w/512,sy=h/448,homeX=Math.round(w*.50),homeBottom=Math.round(h*.47);
  // The model hitboxes follow the approved image. Lv1–5 share one floor with
  // the proprietor's room; Lv6 converts that room to retail and builds a home
  // as a separate town facility.
  add('counter',Math.round(w*.035),Math.round(h*.275),Math.round(w*.29),Math.round(h*.12),'会計','shop');
  if(lv<6){
   wall(homeX,Math.round(h*.03),8,Math.round(h*.42));
   wall(homeX,homeBottom,Math.round(w*.36),8);
   add('door',Math.round(w*.86),Math.round(h*.41),Math.round(w*.10),Math.round(h*.10),'立入禁止・住居','rest');
   bed(Math.round(w*.77),Math.round(h*.08),'店主の寝室');
   add('table',Math.round(w*.64),Math.round(h*.24),70,50,'店主の居間','rest');
   if(lv>=3)add('stove',Math.round(w*.81),Math.round(h*.07),56,64,'店主の台所','rest');
   if(lv>=4)add('cabinet',Math.round(w*.82),Math.round(h*.26),56,46,'住居収納','warehouse');
  }
  for(const [hit,face] of SHOP_PLAN_RACKS[lv]){
   const slot=room.shelves.length;
   const [x,y,rw,rh]=hit,[fx,fy,fw,fh]=face;
   const rx=Math.round(x*sx),ry=Math.round(y*sy),rwScaled=Math.round(rw*sx),rhScaled=Math.round(rh*sy);
   const rack=add('shelf',Math.max(16,rx),Math.max(16,ry),rwScaled,rhScaled,`商品棚 ${slot+1}`,'stock',{slots:[slot],walkBlock:{x:rx+6,y:ry+8,w:Math.max(8,rwScaled-16),h:Math.max(8,rhScaled-16)},planRect:{x:rx,y:ry,w:rwScaled,h:rhScaled,face:{x:Math.round(fx*sx),y:Math.round(fy*sy),w:Math.round(fw*sx),h:Math.round(fh*sy)}}});
   room.shelves.push(rack);
  }
 }else if(id==='forge'){
  // Levels add working capacity as shown in the approved forge plan.
  const furnaces=lv>=4?2:1,anvils=lv>=6?3:lv>=3?2:1,benches=lv>=5?2:1;
  const furnaceXs=furnaces===1?[.50]:[.38,.62];
  for(const cx of furnaceXs)add('furnace',Math.round(w*cx-44),Math.round(h*.16),88,106,'炉','forge');
  const anvilXs=anvils===1?[.34]:anvils===2?[.34,.68]:[.30,.51,.72];
  for(const cx of anvilXs)add('anvil',Math.round(w*cx-36),Math.round(h*.57),72,52,'金床','forge');
  const benchXs=benches===1?[.72]:[.22,.77];
  for(const cx of benchXs)add('workbench',Math.round(w*cx-62),Math.round(h*.63),124,58,'作業台','equipment');
  if(lv>=2)shelf(Math.round(w*.06),Math.round(h*.19),72,112,null,'cabinet','素材棚');
  if(lv>=3)add('basin',Math.round(w*.08),Math.round(h*.55),72,58,'水槽','forge');
  if(lv>=5){add('counter',Math.round(w*.06),Math.round(h*.77),110,48,'受付カウンター','forge');add('cabinet',Math.round(w*.77),Math.round(h*.70),82,82,'装備展示棚','equipment')}
  if(lv>=6)add('cabinet',Math.round(w*.83),Math.round(h*.08),76,76,'倉庫','warehouse');
  decor.push({kind:'sconce',x:40,y:38},{kind:'sconce',x:w-48,y:38});
 }else if(id==='inn'){
  const seats=INN_SEATS[lv],beds=INN_BEDS[lv],tables=seats/4,bedCols=lv>=6?3:lv>=4?2:1;
  // Kitchen and service counter occupy the rear-left. Private bedrooms line
  // the right wall and dining tables stay in the open central floor.
  add('stove',Math.round(w*.08),Math.round(h*.08),76,78,'厨房','inn');add('cabinet',Math.round(w*.29),Math.round(h*.07),92,58,'食材棚','warehouse');
  add('counter',Math.round(w*.05),Math.round(h*.31),Math.round(w*.43),52,'酒場カウンター','inn');
  const roomStart=w*.67,bedZoneW=w-roomStart-30,bedCellH=112,partitionY=28;
  const bedCells=lv===1?[[.77,.13]]:lv===2?[[.77,.13]]:lv===3?[[.75,.13],[.88,.13]]:lv===4?[[.78,.12],[.78,.39],[.78,.66]]:lv===5?[[.75,.12],[.88,.12],[.75,.42],[.88,.42]]:[[.74,.12],[.88,.12],[.74,.37],[.88,.37],[.74,.62],[.88,.62]];
  for(const [px,py] of bedCells.slice(0,beds))bed(Math.round(w*px),Math.round(h*py),'宿泊する');
  const partitionX=Math.round(roomStart),doorY=Math.round(h*.62),zoneBottom=Math.round(h*.94);
  wall(partitionX,partitionY,8,Math.max(0,doorY-partitionY));wall(partitionX,doorY+50,8,Math.max(0,zoneBottom-doorY-50));
  add('door',partitionX-20,doorY+2,48,44,'宿泊者専用','inn');
  const tableCells=lv===1?[[.39,.54]]:lv===2?[[.31,.55],[.49,.55]]:lv===3?[[.31,.55],[.49,.55]]:lv===4?[[.13,.58],[.34,.58],[.52,.58]]:lv===5?[[.16,.52],[.41,.52],[.16,.74],[.41,.74]]:[[.12,.51],[.33,.51],[.54,.51],[.12,.73],[.33,.73]];
  for(const[px,py]of tableCells.slice(0,tables))add('table',Math.round(w*px),Math.round(h*py),82,60,'食事・冒険の噂','story',{seats:4});
  add('counter',Math.round(w*.66),Math.round(h*.78),116,46,'宿泊受付','inn');
  decor.push({kind:'plant',x:w-44,y:h-52},{kind:'sconce',x:34,y:92},{kind:'sconce',x:w-42,y:90});
 }else if(id==='house'||id==='owner_home'){
  if(id==='owner_home'){
   const bx=Math.round(w*.59),by=Math.round(h*.70);wall(bx,Math.round(h*.35),8,Math.round(h*.28));wall(bx,by,w-bx-20,8);
   add('door',bx-18,Math.round(h*.54),48,44,'寝室','rest');bed(Math.round(w*.69),Math.round(h*.54),'店主の寝室');
   add('furnace',Math.round(w*.17),Math.round(h*.23),68,88,'暖炉','rest');add('stove',Math.round(w*.67),Math.round(h*.08),72,70,'台所','rest');
   add('table',Math.round(w*.25),Math.round(h*.45),108,66,'居間','rest');add('cabinet',Math.round(w*.81),Math.round(h*.56),80,54,'収納','warehouse');
   decor.push({kind:'plant',x:46,y:h-48},{kind:'sconce',x:38,y:42},{kind:'sconce',x:w-48,y:42});
  }else{
   const homeBeds=[1,1,2,2,3,4][lv-1],bedZoneX=Math.round(w*.68),bedZoneY=32,bedZoneBottom=Math.round(h*.60);
   wall(bedZoneX,bedZoneY,8,bedZoneBottom-bedZoneY-54);wall(bedZoneX,bedZoneBottom,w-bedZoneX-20,8);
   add('door',bedZoneX-20,bedZoneBottom-50,48,44,'寝室','rest');
   for(let i=0;i<homeBeds;i++){const cols=homeBeds>2?2:1,x=bedZoneX+10+(i%cols)*64,y=bedZoneY+12+Math.floor(i/cols)*96;bed(x,y,'休む')}
   add('furnace',36,Math.round(h*.16),64,82,'暖炉','rest');add('stove',w-104,38,62,68,'台所','rest');
   add('table',Math.round(w*.30),Math.round(h*.49),100,60,'居間','rest');add('desk',Math.round(w*.11),Math.round(h*.72),112,50,'装備を整える','equipment');
   add('cabinet',w-112,Math.round(h*.69),72,52,'収納','warehouse');
   if(lv>=3)add('chair',Math.round(w*.48),Math.round(h*.50),38,38,'居間','rest');
   decor.push({kind:'plant',x:42,y:h-52},{kind:'sconce',x:38,y:42},{kind:'sconce',x:w-48,y:42});
  }
 }else if(id==='warehouse'){
  // Warehouse stays menu-driven; it has no walkable interior.
 }else if(id==='bank'){
  add('safe',50,52,68,88,'預ける・引き出す','bank');add('counter',110,Math.round(h*.58),192,48,'預ける・引き出す','bank');
  add('cabinet',w-138,44,92,70,'帳簿棚','bank');decor.push({kind:'sconce',x:38,y:38},{kind:'sconce',x:w-48,y:38});
 }
 objects.push(room.exit);
 room.stockCapacity=room.shelves.reduce((n,o)=>n+o.slots.length,0);
 room.capacity={shopSlots:SHOP_RACKS[lv]||0,seats:id==='inn'?INN_SEATS[lv]:0,beds:id==='inn'?INN_BEDS[lv]:0};
  room.features=id==='forge'?{furnaces:lv>=4?2:1,anvils:lv>=6?3:lv>=3?2:1,workbenches:lv>=5?2:1,materialRacks:lv>=2?1:0,basins:lv>=3?1:0,displayRacks:lv>=5?1:0,warehouse:lv>=6?1:0}:{};
 return room
};
F.interiorWalkable=(m,x,y)=>{const r=8;if(x<24+r||x>m.w-24-r||y<32+r||y>m.h-32)return false;return ![...m.walls,...m.objects.filter(o=>!['exit','door'].includes(o.kind))].some(o=>{const b=o.walkBlock||o;return x>b.x-r&&x<b.x+b.w+r&&y>b.y-r&&y<b.y+b.h+r})};
F.interiorPath=(m,start,target,object=null)=>{const cell=16,cols=Math.ceil(m.w/cell),rows=Math.ceil(m.h/cell),key=(x,y)=>y*cols+x,coord=k=>({x:(k%cols)*cell+8,y:Math.floor(k/cols)*cell+8}),sx=Math.floor(start.x/cell),sy=Math.floor(start.y/cell),queue=[key(sx,sy)],seen=new Map([[queue[0],null]]);let end=null,best=Infinity;for(let i=0;i<queue.length;i++){const k=queue[i],p=coord(k),d=object?Math.hypot(Math.max(object.x-p.x,0,p.x-object.x-object.w),Math.max(object.y-p.y,0,p.y-object.y-object.h)):Math.hypot(p.x-target.x,p.y-target.y);if(d<best){best=d;end=k}if(d<=(object?(object.kind==='bed'?40:27):10))break;const x=k%cols,y=Math.floor(k/cols);for(const[dx,dy]of[[0,1],[1,0],[0,-1],[-1,0]]){const nx=x+dx,ny=y+dy,n=key(nx,ny),q=coord(n);if(nx<0||ny<0||nx>=cols||ny>=rows||seen.has(n)||!F.interiorWalkable(m,q.x,q.y))continue;seen.set(n,k);queue.push(n)}}if(best>(object?(object.kind==='bed'?42:28):32)||end===null)return[];const out=[];for(let k=end;k!==null;k=seen.get(k))out.push(coord(k));return out.reverse()};

R.renderInterior=(canvas,m,s,rt,art={})=>{
 canvas.width=512;canvas.height=448;const c=canvas.getContext('2d');if(!c)return;
 const plannedRoom=!!art.roomPlan,plannedShop=m.id==='shop'&&plannedRoom,fit=Math.min(1,480/m.w,416/m.h),scaleX=plannedRoom?480/m.w:fit,scaleY=plannedRoom?416/m.h:fit,camera={x:0,y:0,scale:fit,scaleX,scaleY};rt.camera=camera;c.imageSmoothingEnabled=false;
 c.fillStyle='#10291f';c.fillRect(0,0,512,448);c.save();c.translate(256,224);c.scale(scaleX,scaleY);c.translate(-m.w/2,-m.h/2);
 const box=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 const label=(text,x,y,size=12)=>{c.font=`bold ${size}px sans-serif`;c.textAlign='center';c.lineWidth=3;c.strokeStyle=m.id==='shop'?'#f4dfb5':'#38271c';c.strokeText(text,x,y);c.fillStyle=m.id==='shop'?'#49321e':'#fff0c6';c.fillText(text,x,y)};
 const cuts={shelf:[14,174,405,191],bed:[460,40,203,325],furnace:[768,14,267,357],stove:[768,14,267,357],counter:[1082,144,349,220],workbench:[14,446,393,226],anvil:[436,462,278,216],safe:[794,394,199,283],cabinet:[1075,401,358,269],table:[14,744,368,246],desk:[14,744,368,246],wood:[396,700,322,322],stone:[734,700,330,322]};
 const sprite=(kind,o)=>{const src=cuts[kind];if(!art.interior||!src)return false;c.drawImage(art.interior,...src,o.x,o.y,o.w,o.h);return true};
 const stone=m.id==='forge';
 // Warm pale plank flooring in the shop, darker timber in homes and taverns,
 // and the forge's stone floor match the approved room plans.
 if(plannedRoom)c.drawImage(art.roomPlan,0,0,m.w,m.h);
 else if(stone&&art.interior){for(let y=16;y<m.h-16;y+=128)for(let x=16;x<m.w-16;x+=128)sprite('stone',{x,y,w:128,h:128})}
 else{for(let y=16;y<m.h-16;y+=16){const row=(y-16)/16;for(let x=16;x<m.w-16;x+=32){const shift=(row%2)*16;const shade=(row%2?'#91643d':'#845a36');box(x-shift,y,31,15,shade);box(x-shift+2,y+2,27,1,'#b88653');box(x-shift+8,y+8,13,1,'#694326')}}}
 const frame=(o,fill='#603c25')=>{box(o.x,o.y+4,o.w,o.h,'#0005');box(o.x,o.y,o.w,o.h,fill);box(o.x+3,o.y+3,o.w-6,4,'#d5a467');box(o.x+3,o.y+o.h-7,o.w-6,4,'#38241a');for(let x=o.x+9;x<o.x+o.w-5;x+=24)box(x,o.y+8,2,o.h-16,'#71482b');for(const x of[o.x+4,o.x+o.w-8])for(const y of[o.y+4,o.y+o.h-8])box(x,y,4,4,'#e4b96e')};
 const wall=(o)=>{frame(o,stone?'#554b3c':'#5d3924');box(o.x+4,o.y+6,o.w-8,Math.max(2,o.h-12),stone?'#6b6254':'#744a2a');if(o.w>o.h){for(let x=o.x+9;x<o.x+o.w-5;x+=30)box(x,o.y+7,2,o.h-14,'#9a7046')}else{for(let y=o.y+10;y<o.y+o.h-6;y+=18)box(o.x+6,y,o.w-12,2,stone?'#938573':'#9a7046')}};
 if(!plannedShop){wall({x:16,y:16,w:m.w-32,h:22});wall({x:16,y:16,w:16,h:m.h-32});wall({x:m.w-32,y:16,w:16,h:m.h-32});wall({x:16,y:m.h-32,w:m.w/2-48,h:16});wall({x:m.w/2+32,y:m.h-32,w:m.w/2-48,h:16});for(const w of m.walls)wall(w)}
 // North-facing windows and warm wall lamps.
 if(!plannedShop)for(const x of[m.w*.38,m.w*.67]){box(x,19,36,20,'#473628');box(x+3,22,30,14,'#79aeb8');box(x+17,22,2,14,'#e6d4a0');box(x+3,28,30,2,'#e6d4a0')}
 const plant=(x,y)=>{box(x-10,y+5,20,12,'#543722');box(x-8,y+2,16,8,'#9b6738');for(const[dx,dy,col]of[[-8,-8,'#418743'],[0,-12,'#66a947'],[8,-7,'#3f8140'],[-4,0,'#70a83e'],[5,1,'#4c8e36']])box(x+dx-3,y+dy-3,7,7,col);box(x-2,y-2,4,4,'#8cbb51')};
 const sconce=(x,y)=>{box(x-3,y,6,18,'#4a2e20');box(x-5,y+3,10,9,'#efb85d');box(x-2,y+4,4,6,'#fff0ae')};
 if(!plannedShop)for(const d of m.decor){if(d.kind==='plant')plant(d.x,d.y);else if(d.kind==='sconce')sconce(d.x,d.y)}
 const woodObj=(o)=>{if(sprite(o.kind,o))return;frame(o,o.kind==='bed'?'#59402b':'#774b2c')};
 const displayRack=(o)=>{
  // Compact two-tier wooden gondola, with stock rendered from the save on both shelves.
  const{x,y,w,h}=o;box(x+4,y+7,w,h,'#0005');box(x+2,y+2,w-4,h-3,'#55351f');box(x+7,y+7,w-14,h-15,'#c19055');box(x+10,y+10,w-20,h-22,'#704728');
  const tierH=(h-28)/2;for(let row=0;row<2;row++){const yy=y+12+row*tierH;box(x+11,yy,w-22,3,'#e2b56d');box(x+11,yy+tierH-4,w-22,4,'#3b281b');box(x+14,yy+4,w-28,Math.max(2,tierH-10),row?'#b48650':'#c5965d')}
  for(const xx of[x+7,x+w-11])box(xx,y+6,4,h-13,'#d2a367');
  const sh=o.slots?.length?s.shelves?.[o.slots[0]]:null,im=sh&&sh.qty>0?art.items?.[sh.itemId]:null;
  if(im){const k=Math.min((w*.42)/im.naturalWidth,(tierH*.72)/im.naturalHeight);for(let row=0;row<2;row++)c.drawImage(im,x+w*.50-im.naturalWidth*k/2,y+15+row*tierH,im.naturalWidth*k,im.naturalHeight*k)}
  else if(sh&&sh.qty>0){label(F.item(sh.itemId)?.icon||'',x+w/2,y+h*.42,18);label(F.item(sh.itemId)?.icon||'',x+w/2,y+h*.82,18)}
  label(sh&&sh.qty>0?`${sh.price}G`:'空',x+w/2,y+h+14,Math.max(10,12));
 };
 const drawPlanRack=(o)=>{
  const{x,y,w,h,face}=o,sh=o.slots?.length?s.shelves?.[o.slots[0]]:null,item=sh&&sh.qty>0?F.item(sh.itemId):null,im=sh&&sh.qty>0?art.items?.[sh.itemId]:null;
  if(face){
   // Keep the reference rack, number plaque and wood frame intact. Replace
   // only the illustrated goods area with the current saved shelf contents.
   const ix=face.x+2,iy=face.y+2,iw=face.w-4,ih=face.h-4,rowGap=3,rowH=(ih-rowGap)/2;
   for(let row=0;row<2;row++){
    const ry=iy+row*(rowH+rowGap);box(ix,ry,iw,rowH,row?'#89572f':'#98663b');
    box(ix+1,ry+1,iw-2,1,'#bd8750');
   }
   box(ix,iy+rowH,iw,rowGap,'#4a2e1e');
   if(item){
    const count=6;
    for(let i=0;i<count;i++){
     const row=Math.floor(i/3),inRow=Math.min(3,count-row*3),col=i%3,cy=iy+row*(rowH+rowGap)+rowH*.54,cx=ix+iw*((3-inRow)/(6)+col/3+1/6);
     if(im){const k=Math.min((iw/3*.92)/im.naturalWidth,(rowH*.88)/im.naturalHeight);c.drawImage(im,cx-im.naturalWidth*k/2,cy-im.naturalHeight*k/2,im.naturalWidth*k,im.naturalHeight*k)}
     else label(item.icon||'📦',cx,cy+4,Math.min(14,Math.max(9,iw*.27)));
    }
   }else label('空',ix+iw/2,iy+ih/2+4,Math.max(8,Math.min(11,iw*.22)));
  }
  const text=sh&&sh.qty>0?`${sh.price}G`:'空';c.font=`bold ${m.lv===6?8:9}px sans-serif`;c.textAlign='center';c.lineWidth=2;c.strokeStyle='#29190f';c.strokeText(text,x+w/2,y+h-3);c.fillStyle='#fff0ce';c.fillText(text,x+w/2,y+h-3);
 };
 const drawCounter=(o)=>{if(sprite('counter',o))return;box(o.x+4,o.y+o.h,o.w-8,6,'#3c281a');box(o.x,o.y+8,o.w,o.h-8,'#704326');box(o.x+3,o.y+3,o.w-6,9,'#d4a36a');box(o.x+8,o.y+14,o.w-16,4,'#8e5c34');for(let x=o.x+14;x<o.x+o.w-8;x+=24)box(x,o.y+22,3,o.h-24,'#9d6a3c');box(o.x+12,o.y+8,20,12,'#334241');box(o.x+15,o.y+10,14,7,'#8db2a7');box(o.x+o.w-28,o.y+7,16,16,'#e9d294');box(o.x+o.w-24,o.y+10,8,8,'#fff1c2')};
 const drawDiningTable=(o)=>{const chair=(cx,cy)=>{box(cx-8,cy+4,16,12,'#53351f');box(cx-8,cy,16,5,'#c38a4a');box(cx-6,cy+5,12,8,'#8e5b32')};chair(o.x+o.w/2,o.y-13);chair(o.x+o.w/2,o.y+o.h+1);chair(o.x-12,o.y+o.h/2-6);chair(o.x+o.w-4,o.y+o.h/2-6);box(o.x+o.w*.34,o.y+o.h*.62,4,14,'#55351f');box(o.x+o.w*.62,o.y+o.h*.62,4,14,'#55351f');box(o.x+7,o.y+9,o.w-14,o.h-16,'#744525');box(o.x+10,o.y+11,o.w-20,o.h-21,'#c78d4e');box(o.x+14,o.y+14,o.w-28,2,'#e4b36e');box(o.x+o.w/2-4,o.y+o.h/2-4,8,8,'#4c8d3a');box(o.x+o.w/2-2,o.y+o.h/2-2,4,4,'#e5d49a')};
 const drawDoor=(o)=>{box(o.x+4,o.y+4,o.w-8,o.h-4,'#3d2a1d');box(o.x+8,o.y+7,o.w-16,o.h-10,'#9a6738');box(o.x+12,o.y+11,o.w-24,o.h-18,'#80512e');box(o.x+o.w-14,o.y+o.h/2,3,3,'#ecc366');const text=o.label?.includes('立入禁止')?'立入禁止':o.label==='宿泊者専用'?'宿泊者専用':o.label==='寝室'?'寝室':'住居';label(text,o.x+o.w/2,o.y-4,9)};
 for(const o of m.objects){
  if(plannedRoom){
   if(plannedShop&&o.kind==='shelf'){drawPlanRack(o.planRect?{...o,...o.planRect}:o);continue}
   if(plannedShop&&o.kind==='door'){box(o.x-10,o.y-17,o.w+20,20,'#8e2f26');c.strokeStyle='#f5d9b1';c.lineWidth=1;c.strokeRect(o.x-10,o.y-17,o.w+20,20);c.font='bold 14px sans-serif';c.textAlign='center';c.lineWidth=2;c.strokeStyle='#572019';c.strokeText('立入禁止',o.x+o.w/2,o.y-2);c.fillStyle='#fff4dd';c.fillText('立入禁止',o.x+o.w/2,o.y-2);continue}
   continue;
  }
  if(o.kind==='exit'){box(o.x,o.y,o.w,o.h,'#59462e');box(o.x+4,o.y+4,o.w-8,o.h-8,'#bf9d69');label('町へ',o.x+o.w/2,o.y+21,12);continue}
  if(o.kind==='shelf'){displayRack(o);continue}
  if(o.kind==='door'){drawDoor(o);continue}
  if(o.kind==='counter'){drawCounter(o);continue}
  if(o.kind==='bed'){if(!sprite('bed',o)){frame(o,'#694728');box(o.x+7,o.y+8,o.w-14,o.h-15,'#4f7c63');box(o.x+9,o.y+10,o.w-18,15,'#f0e5c9')}continue}
  if(o.kind==='furnace'||o.kind==='stove'){if(!sprite('furnace',o)){frame(o,'#565149');box(o.x+o.w*.2,o.y+o.h*.52,o.w*.6,o.h*.36,'#ff8a30')}continue}
  if(o.kind==='anvil'){if(!sprite('anvil',o)){frame(o,'#626b6c')}continue}
  if(o.kind==='workbench'){if(!sprite('workbench',o))frame(o);continue}
  if(o.kind==='safe'){if(!sprite('safe',o))frame(o,'#475354');continue}
  if(o.kind==='cabinet'){if(!sprite('cabinet',o))frame(o);continue}
  if(o.kind==='table'||o.kind==='desk'||o.kind==='chair'){if(o.seats)drawDiningTable(o);else if(!sprite(o.kind==='chair'?'table':o.kind,o))frame(o,'#8d5a31');continue}
  if(o.kind==='basin'){frame(o,'#6f5f47');box(o.x+8,o.y+8,o.w-16,o.h-16,'#62a8b4');box(o.x+12,o.y+12,o.w-24,o.h-24,'#9bd1d5');continue}
 }
 // Main entrance mat; drawn above the floor but below the player.
 if(!plannedRoom){const ex=m.exit.x,ey=m.exit.y;box(ex+4,ey-8,m.exit.w-8,12,'#5c432b');box(ex+8,ey-6,m.exit.w-16,8,'#d9be81')}
 const player=rt.player||m.spawn,img=art[rt.facing==='up'?'playerBack':rt.facing==='left'?'playerLeft':rt.facing==='right'?'playerRight':'playerFront'];
 box(player.x-9,player.y-1,18,4,'#0004');if(img){const sw=img.naturalWidth,sh=img.naturalHeight,dw=56,dh=68,feet=sh*.20,step=rt.moving?Math.sin(Date.now()/90)*1.4:0;c.drawImage(img,0,0,sw,sh-feet,player.x-dw/2,player.y-dh+14,dw,dh*.8);c.drawImage(img,0,sh-feet,sw/2,feet,player.x-dw/2,player.y-8-step,dw/2,15);c.drawImage(img,sw/2,sh-feet,sw/2,feet,player.x,player.y-8+step,dw/2,15)}else{box(player.x-10,player.y-32,20,16,'#b44832');box(player.x-8,player.y-16,16,16,'#33546a')}
 c.restore();return camera
};
})();

// Bundle updated: 2026-10-25 18:48 JST / Frontier Ver1.65
