/* Frenda Frontier Ver0.13 / pixel-map renderer / Updated: 2026-10-18 */
(()=>{"use strict";
const R=window.FRENDA_FRONTIER_RENDERER=window.FRENDA_FRONTIER_RENDERER||{};
const W=180,H=240;
const PAL={
 grass:'#77a956',grass2:'#85b864',grass3:'#67954b',dirt:'#c8b68d',dirt2:'#bda87d',stone:'#c8c0ad',stone2:'#aaa18f',
 wood:'#b97c46',wood2:'#9b6038',wood3:'#d39a5e',wall:'#e8ddbd',wall2:'#d2c39f',dark:'#5f4029',roofR:'#bd5846',roofR2:'#984638',roofB:'#4c7bbd',roofB2:'#365d97',
 blue:'#6bb8dc',water:'#68bce4',water2:'#d2f3ff',ink:'#20322a'
};
function setup(canvas){
 if(!canvas)return null; canvas.width=W;canvas.height=H;if(canvas.style)canvas.style.imageRendering='pixelated';
 const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);return c;
}
function rect(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function line(c,x1,y1,x2,y2,col,w=1){c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(Math.round(x1)+.5,Math.round(y1)+.5);c.lineTo(Math.round(x2)+.5,Math.round(y2)+.5);c.stroke()}
function px(c,x,y,col){rect(c,x,y,1,1,col)}
function seeded(x,y,k=0){let n=(x*73856093)^(y*19349663)^(k*83492791);n=(n^(n>>>13))*1274126177;return ((n^(n>>>16))>>>0)/4294967295}
function grass(c){
 rect(c,0,0,W,H,PAL.grass);
 for(let y=0;y<H;y+=4)for(let x=0;x<W;x+=4){const r=seeded(x,y);if(r>.73)px(c,x+((r*7)|0)%3,y+((r*11)|0)%3,r>.87?PAL.grass2:PAL.grass3)}
}
function cobble(c,x,y,w,h){
 rect(c,x,y,w,h,PAL.stone);
 for(let yy=y;yy<y+h;yy+=6){for(let xx=x;xx<x+w;xx+=9){const off=((yy-y)/6)%2?4:0;rect(c,xx+off,yy,7,4,(seeded(xx,yy)>.5)?'#d6d0c2':'#bbb2a1');line(c,xx+off,yy+4,xx+off+7,yy+4,'#9e9585',1)}}
}
function dirt(c,x,y,w,h){rect(c,x,y,w,h,PAL.dirt);for(let yy=y+2;yy<y+h;yy+=7)for(let xx=x+2;xx<x+w;xx+=9)if(seeded(xx,yy)>.58)px(c,xx,yy,PAL.dirt2)}
function tree(c,x,y,s=1){
 const X=Math.round(x),Y=Math.round(y),q=s;
 rect(c,X-2*q,Y+7*q,4*q,8*q,'#704d31');
 const dark='#426f39',mid='#5e924a',light='#82b565';
 rect(c,X-8*q,Y-3*q,16*q,10*q,dark);rect(c,X-6*q,Y-6*q,12*q,14*q,mid);rect(c,X-3*q,Y-8*q,7*q,7*q,light);
 rect(c,X-9*q,Y+1*q,5*q,5*q,mid);rect(c,X+4*q,Y,5*q,5*q,mid);
}
function flower(c,x,y,cols=['#f1a4c2','#f3d56e','#bc9feb']){for(let i=0;i<3;i++){rect(c,x+i*3,y+(i%2),2,2,cols[i]);px(c,x+i*3+1,y+2,'#5e914d')}}

function bush(c,x,y,w=12,h=7){rect(c,x,y,w,h,'#4f873f');rect(c,x+2,y-2,w-4,h,'#659d50');for(let i=1;i<w-1;i+=4)px(c,x+i,y+1,'#84b56a')}
function shopShelf(c,x,y,w=28,h=36,full=true){
 rect(c,x,y,w,h,'#5a3823');rect(c,x+2,y+2,w-4,h-4,'#805236');
 const rows=3;for(let r=0;r<rows;r++){const yy=y+7+r*10;rect(c,x+3,yy,w-6,2,'#593822');if(full){for(let xx=x+6;xx<x+w-5;xx+=7){const col=['#6fa3d8','#df6e6a','#79b76d','#d5b35e'][(xx+r)%4];rect(c,xx,yy-5,4,4,col);px(c,xx+1,yy-6,'#e8e5dc')}}}
}
function fence(c,x,y,w){for(let xx=x;xx<x+w;xx+=6){rect(c,xx,y,2,8,'#785a3c');rect(c,xx,y-1,2,2,'#92704c')}rect(c,x,y+4,w,2,'#866342')}
function roof(c,x,y,w,h,col,col2){rect(c,x,y,w,h,col);for(let yy=y+3;yy<y+h;yy+=4){line(c,x,yy,x+w-1,yy,col2,1);for(let xx=x+((yy-y)%8?4:0)+2;xx<x+w;xx+=8)px(c,xx,yy-1,col2)}rect(c,x-1,y+h-2,w+2,3,col2)}
function building(c,x,y,w,h,opt={}){
 const wall=opt.wall||PAL.wall, roofCol=opt.roof||PAL.roofR, roof2=opt.roof2||PAL.roofR2;
 rect(c,x+3,y+8,w-6,h-8,wall);rect(c,x+5,y+10,w-10,h-12,opt.wall2||PAL.wall2);
 roof(c,x,y,w,14,roofCol,roof2);
 rect(c,x+3,y+14,w-6,2,'#745239');
 // windows / door
 rect(c,x+8,y+19,8,9,'#69472f');rect(c,x+9,y+20,6,7,'#dfe9ec');
 rect(c,x+w-16,y+19,8,9,'#69472f');rect(c,x+w-15,y+20,6,7,'#dfe9ec');
 rect(c,x+(w>>1)-4,y+h-13,8,13,'#6d4930');rect(c,x+(w>>1)-3,y+h-12,6,11,'#8d5f3d');
 if(opt.sign){const sw=Math.max(18,opt.sign.length*5+6);rect(c,x+(w-sw)/2,y+h-17,sw,8,'#795631');rect(c,x+(w-sw)/2+1,y+h-16,sw-2,6,'#f2e7c9');c.fillStyle='#28362c';c.font='bold 5px sans-serif';c.textAlign='center';c.fillText(opt.sign,x+w/2,y+h-11)}
 if(opt.awning){rect(c,x+4,y+27,20,4,'#f3efe4');for(let i=0;i<20;i+=5)rect(c,x+4+i,y+27,3,4,i%10?'#d86954':'#f3efe4')}
}
function fountain(c,x,y){
 // top down basin
 rect(c,x-12,y-8,24,16,'#918b7d');rect(c,x-10,y-7,20,14,'#d6d1c4');rect(c,x-8,y-5,16,10,'#4f8da7');rect(c,x-7,y-4,14,8,PAL.water);
 rect(c,x-2,y-3,4,6,'#d8d5cb');rect(c,x-1,y-5,2,4,PAL.water2);px(c,x-4,y-4,PAL.water2);px(c,x+4,y-3,PAL.water2);
}
function human(c,x,y,pal='blue',dir='front'){
 const P={blue:['#467bca','#274f8a','#568add'],orange:['#ce7b3f','#8e4e27','#dc8d4c'],purple:['#8d66bd','#5f4286','#9c78c8'],green:['#6da75d','#426f3a','#7db46d'],gray:['#777','#4f4f4f','#999']}[pal]||['#467bca','#274f8a','#568add'];
 // shadow
 rect(c,x-4,y+8,8,2,'#00000033');
 if(dir==='back'){
  rect(c,x-4,y-6,8,4,P[0]);rect(c,x-5,y-2,10,2,P[1]);rect(c,x-3,y,6,5,'#e9c5a3');rect(c,x-4,y+4,8,7,P[2]);rect(c,x-4,y+11,3,4,'#4f5fb2');rect(c,x+1,y+11,3,4,'#4f5fb2');return;
 }
 rect(c,x-4,y-7,8,4,P[0]);rect(c,x-5,y-3,10,2,P[1]);rect(c,x-3,y-1,6,5,'#efc9a7');px(c,x-1,y+1,'#3e2f25');px(c,x+2,y+1,'#3e2f25');
 rect(c,x-4,y+4,8,7,P[2]);rect(c,x-3,y+5,6,3,'#e6eefb');rect(c,x-6,y+5,2,5,'#efc9a7');rect(c,x+4,y+5,2,5,'#efc9a7');rect(c,x-4,y+11,3,4,'#4f5fb2');rect(c,x+1,y+11,3,4,'#4f5fb2');
}
function label(c,text,x,y,w){rect(c,x,y,w,9,'#16283bcc');rect(c,x+1,y+1,w-2,7,'#223d54');c.fillStyle='#fff';c.font='bold 5px sans-serif';c.textAlign='center';c.fillText(text,x+w/2,y+6)}

R.renderTown=(canvas,s)=>{const c=setup(canvas);if(!c)return;grass(c);
 // paths: cross + diagonals
 cobble(c,76,0,28,240);cobble(c,0,88,180,32);cobble(c,50,56,82,24);cobble(c,36,52,20,52);cobble(c,128,52,18,52);
 // plaza patch
 cobble(c,55,70,76,76);
 // trees / flowers / fence
 for(const [x,y,sc] of [[8,16,1],[24,8,1],[164,18,1],[151,9,1],[7,126,1],[169,128,1],[18,206,1],[160,208,1]])tree(c,x,y,sc);
 flower(c,57,47);flower(c,119,45,['#f5c06f','#f0a2c4','#9ec8ff']);flower(c,32,126);flower(c,144,126);
 bush(c,4,75,16,8);bush(c,160,74,15,8);bush(c,66,168,14,7);bush(c,100,168,14,7);
 flower(c,12,83,['#f2adce','#f0d36c','#9fc8ff']);flower(c,160,84,['#ffd173','#eda2c5','#b9a4ee']);
 fence(c,0,226,44);fence(c,136,226,44);
 // buildings
 building(c,8,18,58,52,{roof:'#bd5846',roof2:'#914137',sign:'SHOP',awning:true});
 building(c,112,14,56,52,{roof:'#4c7bbd',roof2:'#365d97',sign:'家'});
 building(c,8,150,52,42,{roof:'#9b6a3e',roof2:'#704b2e',sign:'鍛冶屋'});
 building(c,122,150,50,42,{roof:'#b88a48',roof2:'#876536',sign:'倉庫'});
 fountain(c,90,108);
 // notice board and crates
 rect(c,133,83,9,7,'#6c4c31');rect(c,134,84,7,5,'#a67849');rect(c,136,90,2,6,'#6c4c31');
 rect(c,28,112,12,8,'#835c36');rect(c,29,113,10,6,'#a67849');
 // residents
 human(c,70,92,'blue','back');human(c,107,83,'purple');human(c,47,123,'orange');human(c,137,126,'green');human(c,89,143,'blue');human(c,25,202,'gray');
};

function woodFloor(c){rect(c,0,0,W,H,'#b97643');for(let x=0;x<W;x+=12){rect(c,x,0,1,H,'#8f5735');for(let y=0;y<H;y+=10)rect(c,x,y,12,1,(y/10)%2?'#c88a52':'#b16d40')}for(let x=0;x<W;x+=12)if((x/12)%2)for(let y=5;y<H;y+=20)rect(c,x,y,12,1,'#cf955b')}
function roomShell(c){woodFloor(c);rect(c,0,0,W,16,'#725038');rect(c,3,3,W-6,10,'#9a714d');rect(c,0,H-4,W,4,'#6d4b33');rect(c,0,0,4,H,'#6d4b33');rect(c,W-4,0,4,H,'#6d4b33')}
function bed(c,x,y){rect(c,x,y,38,58,'#60452f');rect(c,x+2,y+2,34,54,'#f1f1f2');rect(c,x+2,y+2,34,16,'#6c8fce');rect(c,x+4,y+20,30,32,'#fbfbfb')}
function shelf(c,x,y,w=28,h=36,full=true){rect(c,x,y,w,h,'#5f3f28');rect(c,x+2,y+2,w-4,h-4,'#805434');for(let yy=y+7;yy<y+h-4;yy+=10){rect(c,x+3,yy,w-6,2,'#5f3f28');if(full){for(let xx=x+5;xx<x+w-5;xx+=5)rect(c,xx,yy-5,3,5,['#6d91c8','#c56d5a','#82aa64','#d2af59'][(xx+yy)%4])}}}
function table(c,x,y,w,h){rect(c,x,y,w,h,'#69482f');rect(c,x+1,y+1,w-2,h-2,'#986b47');rect(c,x+2,y+2,w-4,h-4,'#a87a54')}
function rug(c,x,y,w,h){rect(c,x,y,w,h,'#d8c37d');rect(c,x+2,y+2,w-4,h-4,'#87a267');for(let yy=y+4;yy<y+h-4;yy+=6)for(let xx=x+4;xx<x+w-4;xx+=8)if(seeded(xx,yy)>.55)px(c,xx,yy,'#99b177')}
function windowPx(c,x,y){rect(c,x,y,22,18,'#6a4a32');rect(c,x+2,y+2,18,14,'#dfeaf7');rect(c,x+10,y+2,2,14,'#8d8274');rect(c,x+2,y+8,18,2,'#8d8274')}
function plant(c,x,y){rect(c,x-2,y+4,4,5,'#8b5b35');rect(c,x-5,y-2,4,7,'#5b9954');rect(c,x,y-4,4,9,'#6dac61');rect(c,x+4,y-1,3,6,'#4d8a4a')}
R.renderHouse=(canvas,s)=>{const c=setup(canvas);if(!c)return;roomShell(c);
 // warm wall band / skirting
 rect(c,4,16,172,7,'#d8b27e');for(let x=6;x<176;x+=18)rect(c,x,17,1,5,'#b28454');
 bed(c,11,27);windowPx(c,128,27);shelf(c,151,24,22,39,true);
 rug(c,57,49,72,72);table(c,77,78,20,14);
 // kitchen / sink / stove
 rect(c,126,133,45,33,'#7d6b59');rect(c,128,135,20,29,'#bdc7c9');rect(c,150,136,18,12,'#6a5e51');rect(c,151,151,17,12,'#9e8971');
 rect(c,133,139,10,8,'#dfe7e8');line(c,138,136,138,140,'#6e7b7e',1);
 // shelves, chest, side table and stool
 shelf(c,11,153,35,31,true);table(c,53,166,31,20);rect(c,56,169,25,14,'#a6754d');
 rect(c,108,170,24,16,'#6b4a31');rect(c,110,172,20,12,'#a7794e');rect(c,113,176,14,1,'#6b4a31');
 rect(c,101,101,12,8,'#6a4a31');rect(c,103,103,8,6,'#9b724e');
 plant(c,17,196);plant(c,160,196);
 // tiny wall lamp
 rect(c,160,66,4,5,'#6c4c31');rect(c,158,62,8,5,'#e4c66d');px(c,160,63,'#fff1a8');
 human(c,87,132,'blue');
};
R.renderStore=(canvas,s)=>{const c=setup(canvas);if(!c)return;roomShell(c);
 rect(c,4,16,172,7,'#d8b27e');for(let x=6;x<176;x+=18)rect(c,x,17,1,5,'#b28454');
 shopShelf(c,9,28,33,58,!!s?.shelves?.[0]);shopShelf(c,72,22,36,49,!!s?.shelves?.[1]);shopShelf(c,137,28,33,58,!!s?.shelves?.[2]);
 // produce stand and storage
 rect(c,10,91,31,28,'#6b472b');rect(c,12,93,27,24,'#8f6038');for(let i=0;i<3;i++){rect(c,14+i*8,95,5,5,['#e17b56','#e2c255','#76ae62'][i]);rect(c,15+i*8,103,5,5,['#7ca3d0','#d56e68','#86b670'][i])}
 // counter + register + jar
 table(c,54,82,70,32);rect(c,83,75,18,10,'#cbd6e8');rect(c,85,77,14,6,'#5b637a');
 rect(c,113,86,7,9,'#c7a266');rect(c,114,84,5,3,'#e1d9bf');
 // barrels / plant / rug
 rect(c,135,127,13,13,'#6e4e35');rect(c,151,126,14,14,'#6e4e35');line(c,136,131,147,131,'#9b744d',1);line(c,152,130,164,130,'#9b744d',1);plant(c,163,104);
 rug(c,73,145,44,25);rect(c,75,147,40,21,'#b95d46');rect(c,78,150,34,15,'#c96f55');
 // crates left
 table(c,13,128,27,42);table(c,45,128,27,42);
 human(c,89,106,'orange');human(c,128,143,'purple');human(c,50,153,'green');human(c,110,151,'blue');
};

R.renderAdventurePreview=(canvas,s)=>{const c=setup(canvas);if(!c)return;grass(c);dirt(c,52,0,78,H);for(let i=0;i<6;i++){tree(c,12+i*30,20+(i%2)*8);tree(c,18+i*28,150+(i%2)*10)}cobble(c,53,136,76,18);human(c,76,111,'blue','back');human(c,113,80,'gray');rect(c,134,178,16,10,'#805e38');rect(c,136,180,12,6,'#d9bc6d');label(c,'はじまりの森',58,8,64)};
R.renderDungeon=(canvas,run)=>{const c=setup(canvas);if(!c||!run?.map)return null;rect(c,0,0,W,H,'#1e3726');const ox=8,oy=26,t=13;
 for(let y=0;y<run.map.length;y++)for(let x=0;x<run.map[y].length;x++){const tt=run.map[y][x],xx=ox+x*t,yy=oy+y*t;if(tt==='wall'){rect(c,xx,yy,t,t,'#31543b');rect(c,xx+2,yy+2,t-4,t-4,'#3f6748');if(seeded(x,y)>.45)rect(c,xx+3,yy+3,3,3,'#56805a')}else{rect(c,xx,yy,t,t,tt==='stairs'?'#bf9b61':tt==='gather'?'#99be72':'#a6c982');rect(c,xx,yy,t,1,'#7fa464');rect(c,xx,yy,1,t,'#7fa464');if(tt==='gather'){rect(c,xx+4,yy+5,5,3,'#4e9149');rect(c,xx+7,yy+3,3,5,'#5ca353')}if(tt==='stairs'){for(let i=0;i<4;i++)rect(c,xx+3,yy+3+i*2,7,1,'#77532e')}}}
 // player
 const px0=ox+run.player.x*t+(t>>1),py0=oy+run.player.y*t+8;human(c,px0,py0,'blue');
 return {ox,oy,t};
};
R.logicalSize={width:W,height:H};


// --- Ver0.13: high-resolution town scene (360x480) ---
function setupTownHi(canvas){
 if(!canvas)return null;
 canvas.width=360; canvas.height=480;
 if(canvas.style)canvas.style.imageRendering='pixelated';
 const c=canvas.getContext('2d'); c.imageSmoothingEnabled=false; c.clearRect(0,0,360,480); return c;
}
function hrect(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function hline(c,x1,y1,x2,y2,col,w=1){c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(Math.round(x1)+.5,Math.round(y1)+.5);c.lineTo(Math.round(x2)+.5,Math.round(y2)+.5);c.stroke()}
function hpx(c,x,y,col){hrect(c,x,y,1,1,col)}
function hnoise(x,y,k=0){let n=(x*1103515245+y*12345+k*2654435761)>>>0;n^=n<<13;n^=n>>>17;n^=n<<5;return (n>>>0)/4294967295}
function hgrass(c){
 hrect(c,0,0,360,480,'#73a954');
 for(let y=0;y<480;y+=5)for(let x=0;x<360;x+=5){const r=hnoise(x,y);if(r>.78){const col=r>.92?'#98c978':r>.86?'#5d9146':'#80b461';hpx(c,x+(r*4|0),y+((r*11)|0)%4,col);if(r>.9)hpx(c,x+2,y+1,col)}}
 // soft grass patches
 for(const [x,y,w,h] of [[6,12,58,42],[294,8,60,54],[4,344,62,72],[300,338,56,76],[142,12,72,38]]){
   for(let yy=y;yy<y+h;yy+=4)for(let xx=x;xx<x+w;xx+=4)if(hnoise(xx,yy,4)>.58)hrect(c,xx,yy,2,2,'#82b862');
 }
}
function hcobble(c,x,y,w,h){
 hrect(c,x,y,w,h,'#c9c0ae');
 let row=0;
 for(let yy=y;yy<y+h;yy+=8,row++){
   const off=row%2?6:0;
   for(let xx=x-6+off;xx<x+w;xx+=14){
     const sh=hnoise(xx,yy,9); const col=sh>.66?'#dad3c5':sh>.33?'#c3baa8':'#b8af9e';
     hrect(c,xx,yy+1,12,6,col);hline(c,xx,yy+7,xx+12,yy+7,'#9f9789',1);hline(c,xx+12,yy+1,xx+12,yy+7,'#aaa190',1);
     if(sh>.82)hpx(c,xx+3,yy+3,'#eee9df');
   }
 }
}
function htree(c,x,y,s=1){
 const q=s, trunk='#6e4c30';
 hrect(c,x-4*q,y+10*q,8*q,15*q,trunk);hrect(c,x-2*q,y+11*q,2*q,12*q,'#8c6340');
 const d='#3e7138',m='#568f47',l='#76ad5d',hi='#95c678';
 hrect(c,x-13*q,y-2*q,26*q,15*q,d);hrect(c,x-10*q,y-8*q,20*q,22*q,m);hrect(c,x-5*q,y-13*q,12*q,17*q,l);
 hrect(c,x-14*q,y+4*q,8*q,8*q,m);hrect(c,x+7*q,y+2*q,8*q,9*q,m);hrect(c,x-6*q,y-7*q,5*q,5*q,hi);hrect(c,x+2*q,y-9*q,4*q,4*q,hi);
}
function hbush(c,x,y,w=28,h=14){hrect(c,x,y+4,w,h-4,'#477e3d');for(let i=0;i<w;i+=7){hrect(c,x+i,y+(i%3),8,h-4,'#5f9a4d');hrect(c,x+i+2,y+1,3,3,'#83b86a')}}
function hflower(c,x,y,cols=['#ef9fc2','#f3d66f','#b99ce9','#92c9ff']){for(let i=0;i<4;i++){const xx=x+i*5,yy=y+(i%2)*2;hrect(c,xx,yy,3,3,cols[i]);hpx(c,xx+1,yy+3,'#4f8745')}}
function hfence(c,x,y,w){for(let xx=x;xx<x+w;xx+=10){hrect(c,xx,y,4,16,'#73543a');hrect(c,xx,y-2,4,4,'#8d6947')}hrect(c,x,y+7,w,4,'#7c5b3d')}
function hroof(c,x,y,w,h,col,shade){hrect(c,x,y,w,h,col);for(let yy=y+4;yy<y+h;yy+=6){hline(c,x,yy,x+w,yy,shade,1);for(let xx=x+((yy-y)%12?6:0);xx<x+w;xx+=12)hline(c,xx,yy-5,xx,yy,shade,1)}hrect(c,x-2,y+h-4,w+4,5,shade)}
function hbuilding(c,x,y,w,h,opt={}){
 // shadow
 hrect(c,x+5,y+12,w,h,'#00000022');
 const wall=opt.wall||'#e7dab7',wall2=opt.wall2||'#d7c5a0',roofC=opt.roof||'#b85745',roofS=opt.roof2||'#8f4235';
 hrect(c,x+5,y+20,w-10,h-20,wall);hrect(c,x+8,y+23,w-16,h-25,wall2);
 // timber outline
 hrect(c,x+5,y+20,w-10,4,'#76533a');hrect(c,x+6,y+22,4,h-23,'#76533a');hrect(c,x+w-10,y+22,4,h-23,'#76533a');
 hroof(c,x,y,w,26,roofC,roofS);
 // chimney
 if(opt.chimney){hrect(c,x+w-22,y-12,10,16,'#8f6547');hrect(c,x+w-23,y-13,12,3,'#6f4b35')}
 // windows
 for(const wx of [x+18,x+w-36]){hrect(c,wx,y+42,18,22,'#684830');hrect(c,wx+3,y+45,12,16,'#dcebf2');hline(c,wx+9,y+45,wx+9,y+61,'#8d8275',1);hline(c,wx+3,y+53,wx+15,y+53,'#8d8275',1)}
 // door
 const dx=x+(w>>1)-10;hrect(c,dx,y+h-30,20,30,'#64442d');hrect(c,dx+3,y+h-27,14,27,'#8f603c');hpx(c,dx+15,y+h-14,'#e2c472');
 // sign
 if(opt.sign){const sw=Math.max(40,opt.sign.length*12+10),sx=x+(w-sw)/2,sy=y+h-42;hrect(c,sx,sy,sw,19,'#765331');hrect(c,sx+3,sy+3,sw-6,13,'#f2e5c5');c.fillStyle='#2a372d';c.font='bold 11px sans-serif';c.textAlign='center';c.fillText(opt.sign,x+w/2,sy+13)}
 if(opt.awning){hrect(c,x+7,y+64,48,10,'#f5efe1');for(let i=0;i<48;i+=8)hrect(c,x+7+i,y+64,4,10,(i/8)%2?'#f5efe1':'#d96b56');hrect(c,x+7,y+74,48,2,'#8d6746')}
 // flower boxes
 if(opt.flowers){hrect(c,x+14,y+64,26,5,'#7c5434');hflower(c,x+16,y+60,['#f3a1c3','#f3d66e','#9fc8ff','#a5df8f']);hrect(c,x+w-40,y+64,26,5,'#7c5434');hflower(c,x+w-38,y+60,['#f3d66e','#ef9fc2','#a5df8f','#baa0ec'])}
}
function hfountain(c,x,y){
 hrect(c,x-32,y-22,64,44,'#787d78');hrect(c,x-29,y-19,58,38,'#d6d1c4');hrect(c,x-24,y-15,48,30,'#4b89a3');hrect(c,x-21,y-12,42,24,'#6dc1e7');
 hrect(c,x-5,y-7,10,15,'#d5d1c5');hrect(c,x-3,y-18,6,13,'#d5d1c5');hrect(c,x-1,y-25,2,10,'#c8f3ff');hline(c,x-13,y-10,x-4,y-18,'#c8f3ff',2);hline(c,x+13,y-9,x+4,y-18,'#c8f3ff',2);
 hpx(c,x-16,y-3,'#e8fbff');hpx(c,x+14,y+2,'#e8fbff');hpx(c,x+7,y-9,'#e8fbff');
}
function hhuman(c,x,y,pal='blue',dir='front'){
 const P={blue:['#3f78c7','#274e86','#4d88d9'],orange:['#cf7b3f','#8e4e27','#df9251'],purple:['#8961b7','#5a3f7e','#9c76c7'],green:['#66a257','#406c39','#78b16a'],gray:['#787878','#505050','#999']}[pal]||['#3f78c7','#274e86','#4d88d9'];
 // shadow
 hrect(c,x-7,y+15,14,4,'#00000033');
 // legs/shoes
 hrect(c,x-6,y+7,5,10,'#4e5fb0');hrect(c,x+1,y+7,5,10,'#4e5fb0');hrect(c,x-7,y+16,6,3,'#5f493a');hrect(c,x+1,y+16,6,3,'#5f493a');
 // body and arms
 hrect(c,x-8,y-3,16,12,P[2]);hrect(c,x-6,y-1,12,5,'#e8eef8');hrect(c,x-11,y-2,4,9,'#efc9a7');hrect(c,x+7,y-2,4,9,'#efc9a7');
 // head
 hrect(c,x-6,y-15,12,11,'#efc9a7');hrect(c,x-5,y-16,10,3,'#714c36');
 if(dir!=='back'){hpx(c,x-3,y-10,'#3f3027');hpx(c,x+3,y-10,'#3f3027');hline(c,x-2,y-6,x+2,y-6,'#9a6847',1)}
 // cap
 hrect(c,x-7,y-21,14,5,P[0]);hrect(c,x-9,y-17,18,3,P[1]);hrect(c,x-4,y-23,8,3,P[0]);
}
function hbarrel(c,x,y){hrect(c,x,y,12,15,'#795334');hrect(c,x+2,y+1,8,13,'#a77749');hline(c,x,y+4,x+12,y+4,'#5e4029',2);hline(c,x,y+11,x+12,y+11,'#5e4029',2)}
function hcrate(c,x,y){hrect(c,x,y,16,14,'#6c4b30');hrect(c,x+2,y+2,12,10,'#a37649');hline(c,x+2,y+2,x+14,y+12,'#7f5938',1);hline(c,x+14,y+2,x+2,y+12,'#7f5938',1)}

function hperson(c,x,y,kind='capBlue'){
 // detailed 3/4-ish pixel villagers, baseline at y+18
 hrect(c,x-7,y+17,14,4,'#00000030');
 const skin='#efc6a1',skin2='#c98d69',shoe='#55463a',blue='#486fc0';
 let hair='#68452f',body='#6e9bcf',body2='#dfe9f5',hat=null,hat2=null;
 if(kind==='woman'){hair='#70432e';body='#a26d9e';body2='#e8c5df'}
 if(kind==='elder'){hair='#bab3aa';body='#657e9d';body2='#d8dce3'}
 if(kind==='straw'){hair='#6c4832';body='#9b7a4d';body2='#eadbaf';hat='#d2ad58';hat2='#9b7438'}
 if(kind==='capPurple'){hat='#875db1';hat2='#5d3f7e';body='#9471bd';body2='#e9def5'}
 if(kind==='capGreen'){hat='#5d9a55';hat2='#3e6d3a';body='#75ad68';body2='#e2efdc'}
 if(kind==='capBlue'){hat='#477bc7';hat2='#2c548d';body='#568bd5';body2='#e1eaf8'}
 // legs
 hrect(c,x-5,y+8,4,9,blue);hrect(c,x+1,y+8,4,9,blue);hrect(c,x-6,y+16,5,3,shoe);hrect(c,x+1,y+16,5,3,shoe);
 // arms/body
 hrect(c,x-8,y,16,10,body);hrect(c,x-6,y+1,12,4,body2);hrect(c,x-11,y+1,3,8,skin);hrect(c,x+8,y+1,3,8,skin);
 // head & hair
 hrect(c,x-6,y-13,12,12,skin);hrect(c,x-6,y-14,12,4,hair);hrect(c,x-7,y-11,2,7,hair);hrect(c,x+5,y-11,2,7,hair);
 hpx(c,x-3,y-8,'#3d3028');hpx(c,x+3,y-8,'#3d3028');hpx(c,x,y-4,skin2);
 if(kind==='woman'){hrect(c,x-7,y-13,2,13,hair);hrect(c,x+5,y-13,2,13,hair);hrect(c,x-5,y-15,10,3,hair)}
 if(kind==='elder'){hrect(c,x-6,y-15,12,3,hair);hrect(c,x-5,y-2,10,2,'#d8d2ca')}
 if(hat){hrect(c,x-7,y-18,14,5,hat);hrect(c,x-9,y-14,18,3,hat2);hrect(c,x-3,y-20,6,3,hat)}
}
function hroofTrim(c,x,y,w){hrect(c,x-3,y,w+6,4,'#6f4b34');hrect(c,x-1,y,w+2,2,'#9a6e4a')}
function hiconSign(c,x,y,kind){hrect(c,x,y,22,22,'#715037');hrect(c,x+2,y+2,18,18,'#eee3c9');if(kind==='shop'){hrect(c,x+6,y+8,10,7,'#b9483d');hrect(c,x+8,y+5,6,4,'#f5f4ee');hrect(c,x+9,y+10,4,4,'#fff')}else if(kind==='forge'){hrect(c,x+5,y+12,12,3,'#575757');hrect(c,x+10,y+5,3,8,'#6d6d6d');hrect(c,x+7,y+6,8,3,'#555')}else if(kind==='crate'){hrect(c,x+5,y+5,12,12,'#9a6d42');hline(c,x+5,y+5,x+17,y+17,'#68482d',2);hline(c,x+17,y+5,x+5,y+17,'#68482d',2)}}
R.renderTown=(canvas,s)=>{const c=setupTownHi(canvas);if(!c)return;hgrass(c);
 // denser outer greenery
 for(const [x,y] of [[10,18],[34,8],[61,17],[298,13],[326,6],[350,20],[5,150],[350,151],[14,365],[346,366],[54,438],[304,438]])htree(c,x,y,1);
 hbush(c,0,70,42,18);hbush(c,318,72,42,18);hbush(c,0,304,46,17);hbush(c,314,304,46,17);hbush(c,72,17,48,14);hbush(c,242,16,48,14);
 // main stone street and town square
 hcobble(c,148,0,64,480);hcobble(c,0,214,360,78);hcobble(c,88,126,184,126);hcobble(c,44,118,62,122);hcobble(c,254,112,60,130);
 // varied edge pixels soften geometry
 for(let y=3;y<478;y+=11){if(hnoise(y,4)>.3)hrect(c,145,y,4,7,'#86b460');if(hnoise(y,8)>.45)hrect(c,211,y+3,4,6,'#86b460')}
 for(let x=4;x<356;x+=13){if(hnoise(x,12)>.38)hrect(c,x,211,7,4,'#86b460');if(hnoise(x,19)>.47)hrect(c,x+2,292,7,4,'#86b460')}
 // flowerbeds & hedges around buildings
 hbush(c,9,157,54,14);hbush(c,80,157,52,14);hbush(c,227,153,42,14);hbush(c,298,153,48,14);
 hflower(c,18,151);hflower(c,50,151,['#f4d46f','#f2a5c6','#9cc9f6','#9fd98c']);hflower(c,102,151,['#f1a4c4','#bad0ff','#f4cf64','#9bd58a']);
 hflower(c,237,147);hflower(c,309,147,['#f0a5c4','#f3d36a','#a8daf5','#9fda8b']);
 // structures
 hbuilding(c,16,38,122,116,{roof:'#bc5745',roof2:'#8e4136',sign:'SHOP',awning:true,chimney:true,flowers:true});hroofTrim(c,16,62,122);hiconSign(c,67,53,'shop');
 hbuilding(c,220,28,122,120,{roof:'#4a7abd',roof2:'#345b94',sign:'家',chimney:true,flowers:true,wall:'#e4decd',wall2:'#d5cdb6'});hroofTrim(c,220,54,122);
 hbuilding(c,14,326,116,100,{roof:'#97673c',roof2:'#6e492d',sign:'鍛冶屋',chimney:true,wall:'#dbc6a6',wall2:'#cab18e'});hroofTrim(c,14,352,116);hiconSign(c,60,340,'forge');
 hbuilding(c,236,326,108,100,{roof:'#b48848',roof2:'#806133',sign:'倉庫',wall:'#dac5a4',wall2:'#cbb18c'});hroofTrim(c,236,352,108);hiconSign(c,277,340,'crate');
 // decorative windowsills and doorstep stones
 for(const [x,y] of [[34,106],[103,106],[242,100],[311,100],[32,390],[100,390],[253,390],[316,390]]){hrect(c,x,y,22,4,'#7d5637');hrect(c,x+3,y-2,16,3,'#8daf65')}
 // square
 hfountain(c,180,254);
 // benches around fountain
 hrect(c,115,248,31,7,'#65472f');hrect(c,118,245,25,4,'#996a43');hrect(c,214,248,31,7,'#65472f');hrect(c,217,245,25,4,'#996a43');
 // props and signpost
 hcrate(c,53,278);hbarrel(c,72,275);hcrate(c,286,278);hbarrel(c,306,275);
 hrect(c,273,176,5,31,'#604631');hrect(c,264,172,24,15,'#6f4d32');hrect(c,266,174,20,11,'#a47648');hline(c,268,178,284,178,'#d2b67a',1);
 // lamps along plaza
 for(const [lx,ly] of [[139,166],[217,166],[139,322],[217,322]]){hrect(c,lx,ly,4,23,'#554537');hrect(c,lx-4,ly-7,12,10,'#695642');hrect(c,lx-2,ly-5,8,6,'#e4ca72');hpx(c,lx,ly-4,'#fff3a8')}
 // extra flowers/grass detail
 hflower(c,19,196);hflower(c,319,195,['#ffd173','#eda2c5','#b9a4ee','#9edd8e']);hflower(c,105,363);hflower(c,247,365,['#f0a4c2','#f3d66f','#9cc9f6','#a4df90']);
 for(const [x,y] of [[70,180],[83,188],[285,179],[300,188],[77,306],[292,306],[149,405],[212,407]]){hrect(c,x,y,3,7,'#4e8743');hpx(c,x+3,y+2,'#7eb567')}
 hfence(c,0,452,82);hfence(c,278,452,82);
 // varied villagers + player
 hperson(c,127,205,'capBlue');hperson(c,231,195,'capPurple');hperson(c,94,287,'woman');hperson(c,263,295,'capGreen');hperson(c,180,329,'capBlue');hperson(c,47,420,'elder');hperson(c,318,225,'straw');
};
})();
