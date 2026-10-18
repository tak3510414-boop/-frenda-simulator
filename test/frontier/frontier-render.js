/* Frenda Frontier Ver0.12 / pixel-map renderer / Updated: 2026-10-18 */
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
})();
