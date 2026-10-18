/* Frenda Frontier Ver0.14 / pixel-map renderer / Updated: 2026-10-18 */
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


// --- Ver0.14: town scene rebuild (360x480) ---
function setupTownHi(canvas){
 if(!canvas)return null;
 canvas.width=360;canvas.height=480;
 if(canvas.style)canvas.style.imageRendering='pixelated';
 const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,360,480);return c;
}
function hrect(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function hline(c,x1,y1,x2,y2,col,w=1){c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(Math.round(x1)+.5,Math.round(y1)+.5);c.lineTo(Math.round(x2)+.5,Math.round(y2)+.5);c.stroke()}
function hpx(c,x,y,col){hrect(c,x,y,1,1,col)}
function hpoly(c,pts,col){c.fillStyle=col;c.beginPath();c.moveTo(Math.round(pts[0][0]),Math.round(pts[0][1]));for(let i=1;i<pts.length;i++)c.lineTo(Math.round(pts[i][0]),Math.round(pts[i][1]));c.closePath();c.fill()}
function hnoise(x,y,k=0){let n=(x*1103515245+y*12345+k*2654435761)>>>0;n^=n<<13;n^=n>>>17;n^=n<<5;return (n>>>0)/4294967295}
function hgrass(c){
 hrect(c,0,0,360,480,'#6fa64f');
 // patches of slightly different turf
 for(const [x,y,w,h,col] of [[0,0,72,70,'#78ae58'],[286,0,74,78,'#79af58'],[0,315,78,165,'#679b49'],[292,316,68,164,'#689c49'],[132,0,96,62,'#73a953']])hrect(c,x,y,w,h,col);
 for(let y=0;y<480;y+=4)for(let x=0;x<360;x+=4){const r=hnoise(x,y,2);if(r>.72){const col=r>.91?'#9bc97d':r>.84?'#5b8e43':'#7eb35f';hpx(c,x+((r*9)|0)%3,y+((r*13)|0)%3,col);if(r>.89)hpx(c,x+2,y+1,col)}}
 // tufts
 for(let y=12;y<470;y+=23)for(let x=10;x<352;x+=29){if(hnoise(x,y,17)>.56){const col=hnoise(x,y,19)>.5?'#4f8740':'#83b767';hrect(c,x,y,2,5,col);hrect(c,x+3,y+1,2,4,col);hpx(c,x+1,y-1,col)}}
}
function hcobble(c,x,y,w,h){
 hrect(c,x,y,w,h,'#c6bdab');
 let row=0;
 for(let yy=y;yy<y+h;yy+=8,row++){
  const off=row%2?6:0;
  for(let xx=x-7+off;xx<x+w;xx+=14){
   const n=hnoise(xx,yy,7), col=n>.72?'#dbd4c8':n>.37?'#c8c0b0':'#b8af9f';
   hrect(c,xx,yy+1,12,6,col);hline(c,xx,yy+7,xx+12,yy+7,'#9f9788',1);hline(c,xx+12,yy+2,xx+12,yy+7,'#aaa08f',1);
   if(n>.84){hpx(c,xx+3,yy+3,'#eeeae1');hpx(c,xx+8,yy+5,'#b0a797')}
  }
 }
}
function hpathEdge(c,x,y,w,h){
 // little grass intrusions so streets do not look cut with a ruler
 for(let yy=y+3;yy<y+h-3;yy+=11){if(hnoise(x,yy,33)>.44)hrect(c,x,yy,3,6,'#79ad59');if(hnoise(x+w,yy,35)>.5)hrect(c,x+w-3,yy+2,3,5,'#79ad59')}
 for(let xx=x+4;xx<x+w-4;xx+=13){if(hnoise(xx,y,38)>.48)hrect(c,xx,y,6,3,'#79ad59');if(hnoise(xx,y+h,39)>.5)hrect(c,xx+2,y+h-3,5,3,'#79ad59')}
}
function htree(c,x,y,s=1){
 const q=s; // larger, layered canopy and cast shadow
 c.fillStyle='#00000022';c.beginPath();c.ellipse(x+4*q,y+12*q,15*q,7*q,0,0,Math.PI*2);c.fill();
 hrect(c,x-4*q,y+7*q,8*q,20*q,'#68472f');hrect(c,x-1*q,y+8*q,3*q,18*q,'#8b603d');
 const d='#386936',m='#4d8441',m2='#5e984d',l='#78ae5c',hi='#98c778';
 // chunky pixel lobes
 hrect(c,x-14*q,y-3*q,28*q,16*q,d);hrect(c,x-11*q,y-10*q,22*q,25*q,m);hrect(c,x-6*q,y-15*q,14*q,18*q,m2);
 hrect(c,x-16*q,y+3*q,8*q,9*q,m);hrect(c,x+9*q,y+1*q,8*q,10*q,m);hrect(c,x-8*q,y-11*q,7*q,7*q,l);hrect(c,x+1*q,y-12*q,7*q,8*q,l);
 hrect(c,x-6*q,y-9*q,3*q,3*q,hi);hrect(c,x+3*q,y-7*q,3*q,3*q,hi);hpx(c,x-11*q,y+1*q,'#87bb6d');hpx(c,x+11*q,y+4*q,'#87bb6d');
}
function hbush(c,x,y,w=28,h=14){
 hrect(c,x,y+6,w,h-6,'#3f7339');
 for(let i=0;i<w;i+=7){const yy=y+(i%3);hrect(c,x+i,yy,8,h-4,'#579045');hrect(c,x+i+2,yy+1,4,4,'#78ad5e');if((i/7)%2===0)hpx(c,x+i+4,yy+2,'#94c575')}
}
function hflower(c,x,y,cols=['#ef9fc2','#f3d66f','#b99ce9','#92c9ff']){for(let i=0;i<4;i++){const xx=x+i*5,yy=y+(i%2)*2;hrect(c,xx,yy,3,3,cols[i]);hpx(c,xx+1,yy+3,'#4f8745')}}
function hflowerBed(c,x,y,w){hrect(c,x,y+5,w,7,'#6d4a2f');hrect(c,x+2,y+3,w-4,7,'#8c633d');for(let xx=x+4,i=0;xx<x+w-4;xx+=7,i++)hflower(c,xx,y,['#f1a0c2','#f3d26b','#9ecbff','#a7de8d'].slice(i%2).concat(['#f3d26b','#9ecbff']))}
function hfence(c,x,y,w){for(let xx=x;xx<x+w;xx+=10){hrect(c,xx,y,4,17,'#6d4e35');hrect(c,xx,y-2,4,4,'#8c6745')}hrect(c,x,y+7,w,4,'#7b593b');hrect(c,x,y+9,w,1,'#a47d55')}
function hroofTiles(c,x,y,w,h,col,shade,hi){
 hrect(c,x,y,w,h,col);
 for(let yy=y+4,row=0;yy<y+h;yy+=6,row++){
  hline(c,x,yy,x+w-1,yy,shade,1);
  const off=row%2?6:0;
  for(let xx=x+off;xx<x+w;xx+=12)hline(c,xx,yy-5,xx,yy,shade,1);
 }
 hrect(c,x,y,w,2,hi||col);hrect(c,x-2,y+h-4,w+4,5,shade);hrect(c,x,y+h-4,w,1,'#e7c7a044');
}
function hwindow(c,x,y,flowers=false){
 hrect(c,x,y,20,24,'#65452e');hrect(c,x+3,y+3,14,18,'#d9e8ef');
 hrect(c,x+9,y+3,2,18,'#8d8273');hrect(c,x+3,y+11,14,2,'#8d8273');hpx(c,x+5,y+5,'#f8fdff');
 if(flowers){hrect(c,x-3,y+21,26,5,'#744c30');hflower(c,x,y+18,['#f2a2c5','#f1d46a','#9fcdf7','#9fda89'])}
}
function hdoor(c,x,y){hrect(c,x,y,22,34,'#5d3f2a');hrect(c,x+3,y+3,16,31,'#865a38');hrect(c,x+5,y+5,12,9,'#956b46');hpx(c,x+16,y+18,'#e5c66b');hrect(c,x-3,y+34,28,4,'#a58d6c')}
function hbuilding(c,x,y,w,h,opt={}){
 const wall=opt.wall||'#e7dab7',wall2=opt.wall2||'#d2be99',roof=opt.roof||'#b85644',roof2=opt.roof2||'#8c4033',roofHi=opt.roofHi||'#cb6a55';
 // ground shadow and side depth
 hrect(c,x+7,y+15,w,h,'#00000024');
 hrect(c,x+6,y+28,w-12,h-28,wall);hrect(c,x+10,y+32,w-20,h-34,wall2);
 hrect(c,x+6,y+28,4,h-28,'#b39a78');hrect(c,x+w-10,y+28,4,h-28,'#9a8163');
 // roof with overhang and stepped gable cap
 hroofTiles(c,x,y+10,w,25,roof,roof2,roofHi);
 hpoly(c,[[x+6,y+10],[x+w/2,y-3],[x+w-6,y+10]],roof);
 hline(c,x+6,y+10,x+w/2,y-3,roof2,2);hline(c,x+w/2,y-3,x+w-6,y+10,roof2,2);
 for(let xx=x+14;xx<x+w-12;xx+=14){hline(c,xx,y+7,xx+8,y+10,roof2,1)}
 // chimney
 if(opt.chimney){hrect(c,x+w-24,y-7,11,21,'#875e42');hrect(c,x+w-25,y-9,13,4,'#62442f');hrect(c,x+w-22,y-5,3,14,'#a97956')}
 // façade timber band
 hrect(c,x+9,y+34,w-18,4,'#735039');
 // windows
 hwindow(c,x+19,y+48,!!opt.flowers);hwindow(c,x+w-39,y+48,!!opt.flowers);
 // door and sign
 const dx=Math.round(x+w/2-11);hdoor(c,dx,y+h-38);
 if(opt.sign){const sw=Math.max(46,opt.sign.length*12+16),sx=Math.round(x+(w-sw)/2),sy=y+h-56;hrect(c,sx-2,sy-2,sw+4,23,'#694930');hrect(c,sx,sy,sw,19,'#f1e4c4');c.fillStyle='#27352d';c.font='bold 12px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(opt.sign,x+w/2,sy+10)}
 if(opt.awning){hrect(c,x+8,y+76,52,11,'#f4eee1');for(let i=0;i<52;i+=8)hrect(c,x+8+i,y+76,4,11,(i/8)%2?'#f4eee1':'#d56a56');hrect(c,x+8,y+87,52,2,'#76533a')}
 if(opt.emblem){hrect(c,x+w/2-13,y+17,26,24,'#684a32');hrect(c,x+w/2-10,y+20,20,18,'#eee4cd');if(opt.emblem==='shop'){hrect(c,x+w/2-5,y+27,10,7,'#c84e42');hrect(c,x+w/2-3,y+24,6,4,'#fff');hrect(c,x+w/2-1,y+29,2,2,'#fff')}else if(opt.emblem==='forge'){hrect(c,x+w/2-6,y+31,12,3,'#555');hrect(c,x+w/2-1,y+24,3,8,'#6a6a6a');hrect(c,x+w/2-4,y+25,9,3,'#555')}else if(opt.emblem==='crate'){hrect(c,x+w/2-6,y+24,12,12,'#9b6e43');hline(c,x+w/2-6,y+24,x+w/2+6,y+36,'#66462c',2);hline(c,x+w/2+6,y+24,x+w/2-6,y+36,'#66462c',2)}}
}
function hfountain(c,x,y){
 // octagonal top-down basin with water and spray
 hpoly(c,[[x-28,y-18],[x-19,y-28],[x+19,y-28],[x+28,y-18],[x+28,y+18],[x+19,y+28],[x-19,y+28],[x-28,y+18]],'#807e76');
 hpoly(c,[[x-24,y-15],[x-15,y-24],[x+15,y-24],[x+24,y-15],[x+24,y+15],[x+15,y+24],[x-15,y+24],[x-24,y+15]],'#d7d2c8');
 hpoly(c,[[x-19,y-12],[x-12,y-19],[x+12,y-19],[x+19,y-12],[x+19,y+12],[x+12,y+19],[x-12,y+19],[x-19,y+12]],'#5faed2');
 hrect(c,x-4,y-7,8,15,'#d8d4c8');hrect(c,x-3,y-16,6,10,'#d8d4c8');
 hrect(c,x-1,y-25,2,10,'#d3f5ff');hline(c,x-13,y-9,x-4,y-17,'#d3f5ff',2);hline(c,x+13,y-9,x+4,y-17,'#d3f5ff',2);
 for(const [sx,sy] of [[-15,-2],[14,3],[7,-10],[-7,10]])hpx(c,x+sx,y+sy,'#effcff')
}
function hbench(c,x,y){hrect(c,x,y+5,32,6,'#65462e');hrect(c,x+3,y+2,26,5,'#996a43');hrect(c,x+5,y+11,3,7,'#65462e');hrect(c,x+24,y+11,3,7,'#65462e')}
function hlamp(c,x,y){hrect(c,x,y,4,24,'#4f4439');hrect(c,x-4,y-8,12,10,'#665746');hrect(c,x-2,y-6,8,6,'#e5ca72');hpx(c,x,y-5,'#fff2ac');hrect(c,x-3,y+24,10,2,'#40372f')}
function hbarrel(c,x,y){hrect(c,x,y,12,16,'#755033');hrect(c,x+2,y+1,8,14,'#a57648');hline(c,x,y+4,x+12,y+4,'#5b3e29',2);hline(c,x,y+12,x+12,y+12,'#5b3e29',2);hpx(c,x+4,y+2,'#c09160')}
function hcrate(c,x,y){hrect(c,x,y,17,15,'#69482e');hrect(c,x+2,y+2,13,11,'#a47748');hline(c,x+2,y+2,x+15,y+13,'#7c5636',1);hline(c,x+15,y+2,x+2,y+13,'#7c5636',1);hrect(c,x+2,y+6,13,2,'#8a603b')}
function hcart(c,x,y){hrect(c,x,y,36,17,'#745033');hrect(c,x+2,y+2,32,13,'#a87645');hrect(c,x+4,y-6,8,8,'#d58a50');hrect(c,x+14,y-7,9,9,'#e3c15e');hrect(c,x+25,y-5,7,7,'#70aa5f');hrect(c,x+36,y+7,12,3,'#68472f');c.fillStyle='#4f4439';c.beginPath();c.arc(x+8,y+18,4,0,Math.PI*2);c.arc(x+28,y+18,4,0,Math.PI*2);c.fill()}
function hsign(c,x,y){hrect(c,x,y+10,5,28,'#5e432f');hrect(c,x-12,y,29,17,'#6e4b30');hrect(c,x-10,y+2,25,13,'#a87749');hline(c,x-7,y+7,x+12,y+7,'#d6b776',1);hpx(c,x+13,y+12,'#e4c66f')}
function hperson(c,x,y,kind='capBlue',dir='front'){
 // chibi proportion: larger head, shorter body, 3/4-ish shading
 const skin='#efc6a1',skin2='#c48a66',shoe='#544337',pants='#4b5aa6';
 let hair='#6a4630',body='#568bd5',body2='#e1eaf8',hat='#477bc7',hat2='#2c548d';
 if(kind==='woman'){hair='#6f432f';body='#a26d9e';body2='#ead0e5';hat=null;hat2=null}
 if(kind==='elder'){hair='#b9b2aa';body='#667f9d';body2='#d8dce3';hat=null;hat2=null}
 if(kind==='straw'){hair='#6d4931';body='#9a7a4d';body2='#eadcaf';hat='#d1ac58';hat2='#967038'}
 if(kind==='capPurple'){hat='#875db1';hat2='#5d3f7e';body='#9471bd';body2='#e9def5'}
 if(kind==='capGreen'){hat='#5d9a55';hat2='#3e6d3a';body='#75ad68';body2='#e2efdc'}
 if(kind==='capBlue'){hat='#477bc7';hat2='#2c548d';body='#568bd5';body2='#e1eaf8'}
 c.fillStyle='#0000002c';c.beginPath();c.ellipse(x,y+17,9,3,0,0,Math.PI*2);c.fill();
 // legs
 hrect(c,x-6,y+7,5,8,pants);hrect(c,x+1,y+7,5,8,pants);hrect(c,x-7,y+14,6,3,shoe);hrect(c,x+1,y+14,6,3,shoe);
 // torso and arms
 hrect(c,x-8,y-1,16,10,body);hrect(c,x-6,y,12,4,body2);hrect(c,x-11,y,3,8,skin);hrect(c,x+8,y,3,8,skin);hpx(c,x-10,y+7,skin2);hpx(c,x+10,y+7,skin2);
 // head / hair
 hrect(c,x-7,y-14,14,13,skin);hrect(c,x-6,y-15,12,4,hair);hrect(c,x-7,y-12,2,8,hair);hrect(c,x+5,y-12,2,8,hair);
 if(dir!=='back'){hpx(c,x-3,y-8,'#3e3028');hpx(c,x+3,y-8,'#3e3028');hpx(c,x,y-4,skin2)}
 if(kind==='woman'){hrect(c,x-8,y-14,2,14,hair);hrect(c,x+6,y-14,2,14,hair);hrect(c,x-5,y-17,10,3,hair)}
 if(kind==='elder'){hrect(c,x-6,y-17,12,4,hair);hrect(c,x-4,y-1,8,2,'#dcd6ce')}
 if(hat){hrect(c,x-8,y-19,16,5,hat);hrect(c,x-10,y-15,20,3,hat2);hrect(c,x-4,y-21,8,3,hat);hpx(c,x-5,y-18,'#ffffff22')}
}
R.renderTown=(canvas,s)=>{const c=setupTownHi(canvas);if(!c)return;hgrass(c);
 // --- rear layer: trees and greenery, partly hidden by buildings ---
 for(const [x,y,sc] of [[6,10,1.15],[36,6,1.1],[67,13,1],[292,10,1.1],[326,4,1.2],[354,16,1.1],[2,154,1],[355,154,1],[12,350,1.1],[352,350,1.1],[50,444,1.1],[305,442,1.1]])htree(c,x,y,sc);
 hbush(c,0,65,48,18);hbush(c,312,66,48,18);hbush(c,0,300,50,18);hbush(c,310,300,50,18);hbush(c,72,17,49,14);hbush(c,238,17,50,14);
 // streets and central plaza
 hcobble(c,145,0,70,480);hpathEdge(c,145,0,70,480);
 hcobble(c,0,208,360,88);hpathEdge(c,0,208,360,88);
 hcobble(c,82,118,196,142);hpathEdge(c,82,118,196,142);
 hcobble(c,40,112,72,132);hpathEdge(c,40,112,72,132);
 hcobble(c,248,108,72,136);hpathEdge(c,248,108,72,136);
 // garden borders before structures
 hbush(c,8,158,58,14);hbush(c,80,158,57,14);hbush(c,222,154,50,14);hbush(c,293,154,56,14);
 hflower(c,16,151);hflower(c,50,151,['#f4d46f','#f2a5c6','#9cc9f6','#9fd98c']);hflower(c,104,151,['#f1a4c4','#bad0ff','#f4cf64','#9bd58a']);
 hflower(c,228,147);hflower(c,308,147,['#f0a5c4','#f3d36a','#a8daf5','#9fda8b']);
 // buildings: more depth, roof silhouette, façade detail
 hbuilding(c,15,37,124,119,{roof:'#b94f3f',roof2:'#873a30',roofHi:'#d76b59',sign:'SHOP',awning:true,chimney:true,flowers:true,emblem:'shop'});
 hbuilding(c,218,27,124,123,{roof:'#4777b8',roof2:'#315688',roofHi:'#6694d2',sign:'家',chimney:true,flowers:true,wall:'#e3ddcd',wall2:'#cfc5ae'});
 hbuilding(c,12,326,119,104,{roof:'#95623a',roof2:'#68432b',roofHi:'#ae794b',sign:'鍛冶屋',chimney:true,flowers:true,wall:'#dbc5a5',wall2:'#c7ae8b',emblem:'forge'});
 hbuilding(c,233,326,112,104,{roof:'#b18546',roof2:'#7d5d31',roofHi:'#c59b59',sign:'倉庫',flowers:true,wall:'#dac3a1',wall2:'#c8ad88',emblem:'crate'});
 // foreground vegetation and town props
 for(const [x,y,w] of [[6,178,42],[312,178,42],[18,309,40],[300,309,42]])hbush(c,x,y,w,13);
 hflowerBed(c,14,173,48);hflowerBed(c,296,173,50);
 // fountain and furniture
 hfountain(c,180,254);hbench(c,111,251);hbench(c,218,251);
 hcrate(c,45,278);hbarrel(c,65,277);hcart(c,88,302);hcrate(c,291,277);hbarrel(c,310,277);hsign(c,276,171);
 for(const [lx,ly] of [[137,165],[219,165],[137,318],[219,318]])hlamp(c,lx,ly);
 // decorative grass/flowers near square and lower buildings
 hflower(c,16,198);hflower(c,320,198,['#ffd173','#eda2c5','#b9a4ee','#9edd8e']);hflower(c,103,363);hflower(c,248,364,['#f0a4c2','#f3d66f','#9cc9f6','#a4df90']);
 for(const [x,y] of [[68,181],[82,188],[286,181],[301,188],[76,305],[293,304],[147,406],[213,406],[30,337],[331,337]]){hrect(c,x,y,3,7,'#4b8240');hpx(c,x+3,y+2,'#7ab361')}
 hfence(c,0,451,88);hfence(c,272,451,88);
 // villagers: more varied placement, chibi heads and clothing
 hperson(c,125,205,'capBlue','back');hperson(c,232,193,'capPurple');hperson(c,93,286,'woman');hperson(c,263,294,'capGreen');hperson(c,180,329,'capBlue');hperson(c,45,421,'elder');hperson(c,319,224,'straw');
 // small foreground occlusion gives depth
 htree(c,-2,470,1.15);htree(c,360,468,1.15);
};
})();
