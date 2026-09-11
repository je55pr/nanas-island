import {Match3Model,TILE_ICONS,TILE_COLORS,MATCH_COLS,MATCH_ROWS} from './match3.js';
import {PongModel} from './pong.js';

const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d');
const VW=390,VH=844,NAV_Y=752,SAVE_KEY='nanas-island-prototype-v1';
const fresh=()=>({sunshine:0,levelWins:0,inventory:{milkweed:0},planted:{milkweed:false},butterflies:{cabbage:true,monarch:false,peacock:false}});
let save=load(),screen='island',match=null,pong=new PongModel(),matchWin=false;
let cssW=VW,cssH=VH,scale=1,offX=0,offY=0,dpr=1,hits=[],lastTime=performance.now();
let pointer=null,listScroll=0,listDrag=false,toastState=null;

function load(){try{return {...fresh(),...JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')}}catch{return fresh()}}
function persist(){localStorage.setItem(SAVE_KEY,JSON.stringify(save))}
function resize(){
  const r=canvas.getBoundingClientRect();cssW=r.width;cssH=r.height;dpr=Math.min(devicePixelRatio||1,3);
  canvas.width=Math.round(cssW*dpr);canvas.height=Math.round(cssH*dpr);
  scale=Math.min(cssW/VW,cssH/VH);offX=(cssW-VW*scale)/2;offY=(cssH-VH*scale)/2;
}
window.addEventListener('resize',resize);resize();

function rr(x,y,w,h,r=16){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
function fillRectRound(x,y,w,h,r,color){rr(x,y,w,h,r);ctx.fillStyle=color;ctx.fill()}
function strokeRectRound(x,y,w,h,r,color,width=2){rr(x,y,w,h,r);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()}
function font(size=18,weight=600,family='system-ui'){ctx.font=`${weight} ${size}px ${family}`;ctx.textBaseline='alphabetic'}
function text(str,x,y,size=18,color='#3f382d',align='left',weight=600,family='system-ui'){
  font(size,weight,family);ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(str,x,y);
}
function emoji(str,x,y,size=30,align='center'){
  ctx.font=`${size}px "Segoe UI Emoji","Apple Color Emoji",sans-serif`;ctx.textBaseline='middle';ctx.textAlign=align;ctx.fillText(str,x,y);
}
function wrap(str,x,y,maxW,lineH=24,size=18,color='#5f594f',weight=500,maxLines=4){
  font(size,weight);ctx.fillStyle=color;ctx.textAlign='left';const words=String(str).split(/\s+/);let line='',yy=y,lines=0;
  for(const word of words){const test=line?`${line} ${word}`:word;if(ctx.measureText(test).width>maxW&&line){ctx.fillText(line,x,yy);line=word;yy+=lineH;if(++lines>=maxLines-1)break}else line=test}
  if(line&&lines<maxLines)ctx.fillText(line,x,yy);return yy;
}
function button(label,x,y,w,h,action,{fill='#fff8df',stroke='#e7c957',size=17,icon=null,active=false}={}){
  fillRectRound(x,y,w,h,16,active?'#ffe98d':fill);strokeRectRound(x,y,w,h,16,stroke,2);
  if(icon){emoji(icon,x+25,y+h/2,24);text(label,x+46,y+h/2+6,size,'#3d463c','left',800)}
  else text(label,x+w/2,y+h/2+6,size,'#3d463c','center',800);
  hits.push({x,y,w,h,action});
}
function panel(x,y,w,h,fill='rgba(255,255,255,.9)',r=22){
  fillRectRound(x,y,w,h,r,fill);strokeRectRound(x,y,w,h,r,'rgba(79,103,75,.12)',2);
}
function hitAt(x,y){for(let i=hits.length-1;i>=0;i--){const h=hits[i];if(x>=h.x&&x<=h.x+h.w&&y>=h.y&&y<=h.y+h.h)return h}return null}
function point(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left-offX)/scale,y:(e.clientY-r.top-offY)/scale}}
function go(next){
  screen=next;matchWin=false;listScroll=0;
  if(screen==='match')match=new Match3Model(()=>{},finishMatch);
  if(screen==='arcade')pong=new PongModel();
}
function finishMatch(){
  if(!match||match.rewarded)return;match.rewarded=true;matchWin=true;
  save.levelWins++;save.sunshine+=50;save.inventory.milkweed++;persist();
  toast('🌿 Milkweed added to your garden bag');
}
function plantMilkweed(){
  if(save.inventory.milkweed<1||save.planted.milkweed)return;
  save.inventory.milkweed--;save.planted.milkweed=true;save.butterflies.monarch=true;save.sunshine+=25;persist();
  toast('🦋 New visitor: Monarch!');
}
function toast(message){toastState={message,until:performance.now()+2300}}
function action(name){
  if(name?.startsWith('go:')){go(name.slice(3));return}
  if(name==='restart'&&match){match.restart();matchWin=false;return}
  if(name==='plant'){plantMilkweed();return}
  if(name==='sanctuaryAfterWin'){go('sanctuary');return}
}
function drawBackground(){
  const g=ctx.createLinearGradient(0,0,0,VH);g.addColorStop(0,'#98dcf3');g.addColorStop(.5,'#d9f4dc');g.addColorStop(1,'#fff6cc');ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
}
function drawTop(title=null,pill=null){
  text("Nana's Island",18,48,31,'#315f53','left',800,'Georgia');
  fillRectRound(306,16,66,46,22,'#fff7cf');strokeRectRound(306,16,66,46,22,'#e9bd38',2);
  emoji('☀️',326,39,22);text(String(save.sunshine),351,46,18,'#3e3a2f','center',800);
  if(title){const titleSize=title.length>18?26:28;text(title,18,104,titleSize,'#315f53','left',800,'Georgia');if(pill){fillRectRound(292,80,80,42,20,'#fff8df');text(pill,332,106,16,'#3e3a2f','center',800)}}
}
function drawNav(){
  ctx.fillStyle='rgba(255,252,235,.98)';ctx.fillRect(0,NAV_Y,VW,VH-NAV_Y);ctx.strokeStyle='#d8cfaa';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,NAV_Y);ctx.lineTo(VW,NAV_Y);ctx.stroke();
  const items=[['island','🏝️','Island'],['match','🌼','Play'],['sanctuary','🦋','Butterflies'],['arcade','🕹️','Arcade']];
  items.forEach((it,i)=>{const x=i*97.5,w=97.5,active=screen===it[0];if(active)fillRectRound(x+8,NAV_Y+9,w-16,74,16,'#ffe98d');emoji(it[1],x+w/2,NAV_Y+32,30);text(it[2],x+w/2,NAV_Y+72,16,'#39352d','center',800);hits.push({x,y:NAV_Y,w,h:VH-NAV_Y,action:`go:${it[0]}`})});
}
function drawIsland(t){
  drawTop();
  fillRectRound(16,73,358,250,22,'#91daf2');ctx.save();rr(16,73,358,250,22);ctx.clip();
  ctx.fillStyle='#ffe779';ctx.beginPath();ctx.arc(333,91,68,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#64b574';ctx.beginPath();ctx.ellipse(120,260,190,86,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(320,255,155,72,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#edca6c';ctx.fillRect(16,259,358,64);ctx.restore();strokeRectRound(16,73,358,250,22,'#e4bf54',2);
  button('Sanctuary',38,118,132,50,'go:sanctuary',{icon:'🦋'});button('Pavilion',235,118,122,50,'go:arcade',{icon:'🕹️'});button(`Level ${save.levelWins+1}`,145,257,110,52,'go:match',{icon:'🌼',fill:'#ffdf59'});
  fillRectRound(34,177,145,69,18,'rgba(255,255,255,.78)');emoji('🐘',64,211,40);text('Ellie',102,201,17,'#2f382f','left',800);text('the planner',102,224,16,'#2f382f','left',500);
  fillRectRound(204,177,152,69,18,'rgba(255,255,255,.78)');emoji('🐒',324,211,40);text('Gigi',219,201,17,'#2f382f','left',800);text('the ideas dept.',219,224,16,'#2f382f','left',500);
  text('Today on the island',20,365,27,'#315f53','left',800,'Georgia');text(`${save.levelWins} levels`,370,360,16,'#607568','right',700);text('cleared',370,382,16,'#607568','right',700);
  panel(17,402,356,136);emoji(save.planted.milkweed?'🦋':'🌱',63,470,42);text(save.planted.milkweed?'A new visitor!':'Restore the sunny border',102,444,19,'#3d392e','left',800);
  wrap(save.planted.milkweed?'The milkweed patch has attracted a Monarch to the sanctuary.':'Play a match-3 level to earn a milkweed cutting for the butterfly garden.',102,475,245,24,17,'#655d50',500,3);
  panel(17,553,356,112,'rgba(255,255,255,.86)');emoji('🐘',53,608,38);text('Ellie:',88,586,18,'#3d392e','left',800);
  wrap(save.levelWins?'That flower bed is looking much better.':'One flower bed at a time. The island can wait.',88,613,242,23,17,'#4d463d',500,3);emoji('🐒',345,612,34);
  drawNav();
}

const BOARD={x:34,y:202,cell:46,w:322,h:368};
function drawMatch(){
  drawTop('Sunny Border',`Level ${save.levelWins+1}`);
  panel(17,134,356,604);drawMatchStats();drawBoard();
  text('Swipe a tile, or tap one then a neighbour.',195,605,17,'#54685e','center',700);text('Match 3 or more.',195,629,17,'#54685e','center',700);
  button('Restart board',120,648,150,48,'restart',{fill:'#fffdf0',stroke:'#d9d2b4',size:16});
  fillRectRound(30,706,330,38,16,'#fff3bd');emoji('🌿',54,725,24);text('Reward: Milkweed cutting',75,731,16,'#4f4b3e','left',800);
  if(matchWin)drawWinOverlay();drawNav();
}
function drawMatchStats(){
  const vals=[[`MOVES`,match?.moves??18],[`SUNFLOWERS`,`${Math.min(match?.yellow??0,match?.target??12)} / ${match?.target??12}`],[`SCORE`,match?.score??0]];
  vals.forEach((v,i)=>{const x=29+i*111;fillRectRound(x,148,103,44,14,'#fff8df');text(v[0],x+51.5,165,13,'#594f3e','center',800);text(String(v[1]),x+51.5,187,21,'#315f53','center',800)});
}
function drawBoard(){
  fillRectRound(BOARD.x-4,BOARD.y-4,BOARD.w+8,BOARD.h+8,18,'#355b4f');
  for(let r=0;r<MATCH_ROWS;r++)for(let c=0;c<MATCH_COLS;c++){
    const t=match?.board[r]?.[c],x=BOARD.x+c*BOARD.cell,y=BOARD.y+r*BOARD.cell;
    fillRectRound(x+3,y+3,BOARD.cell-6,BOARD.cell-6,10,'rgba(255,255,255,.08)');if(t==null)continue;
    fillRectRound(x+5,y+5,BOARD.cell-10,BOARD.cell-10,10,TILE_COLORS[t]);
    ctx.fillStyle='rgba(255,255,255,.2)';rr(x+8,y+8,BOARD.cell-16,11,6);ctx.fill();emoji(TILE_ICONS[t],x+BOARD.cell/2,y+BOARD.cell/2+2,25);
    if(match?.selected?.r===r&&match.selected.c===c)strokeRectRound(x+3,y+3,BOARD.cell-6,BOARD.cell-6,11,'#fff7ad',4);
    if(match?.flash?.some(p=>p.r===r&&p.c===c)){ctx.fillStyle='rgba(255,250,183,.45)';rr(x+2,y+2,BOARD.cell-4,BOARD.cell-4,11);ctx.fill()}
  }
}
function drawWinOverlay(){
  ctx.fillStyle='rgba(40,69,59,.78)';rr(29,190,332,480,22);ctx.fill();panel(54,315,282,220,'#fff3ad');emoji('🌟',195,355,42);text('Border restored!',195,399,25,'#3b4d42','center',800,'Georgia');
  wrap('You found a milkweed cutting for the butterfly sanctuary.',82,434,226,25,18,'#554c3f',600,3);button('Take it to the sanctuary',76,528,238,58,'sanctuaryAfterWin',{fill:'#f5c84b',stroke:'#ca9d28',size:18});
}
function drawSanctuary(t){
  drawTop('Butterfly Sanctuary',`${1+(save.butterflies.monarch?1:0)} / 3`);
  fillRectRound(16,134,358,198,22,'#b8e8f8');ctx.save();rr(16,134,358,198,22);ctx.clip();ctx.fillStyle='#bde18c';ctx.fillRect(16,230,358,55);ctx.fillStyle='#6fa85d';ctx.fillRect(16,285,358,47);
  ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(62,300);ctx.lineTo(62,231);ctx.quadraticCurveTo(62,170,195,170);ctx.quadraticCurveTo(328,170,328,231);ctx.lineTo(328,300);ctx.stroke();
  emoji('🌼',95,301,32);emoji('🌸',159,301,34);emoji(save.planted.milkweed?'🌿':'🌱',225,301,35);emoji('🌼',289,301,32);
  const flap=Math.sin(t*.004)*8;emoji('🦋',113,215+flap,27);if(save.butterflies.monarch){emoji('🦋',251,205-flap,29);emoji('🦋',278,257+flap*.7,25)}ctx.restore();
  text('Garden bag',20,365,25,'#315f53','left',800,'Georgia');text('Plants invite visitors',370,365,16,'#607568','right',700);
  button('Sunny flowers ✓',16,384,174,48,'noop',{icon:'🌼',fill:'#fff8df',size:15});button(`Milkweed × ${save.inventory.milkweed}`,199,384,175,48,'noop',{icon:'🌿',fill:'#fff8df',size:15});
  drawPlantQuest();text('Butterfly book',20,575,25,'#315f53','left',800,'Georgia');text('Real species',370,575,16,'#607568','right',700);
  drawButterflyList();drawNav();
}
function drawPlantQuest(){
  panel(16,447,358,105);emoji(save.planted.milkweed?'🌿':'🌱',55,499,39);
  if(save.planted.milkweed){text('Milkweed patch planted',92,480,19,'#3e3a2f','left',800);wrap('The sanctuary has another little habitat to explore.',92,508,252,22,16,'#655d50',500,2)}
  else if(save.inventory.milkweed>0){text('Milkweed cutting',92,476,19,'#3e3a2f','left',800);wrap('Plant it in the sunny bed and see who notices.',92,504,160,22,16,'#655d50',500,2);button('Plant',269,470,86,58,'plant',{fill:'#f5c84b',stroke:'#ca9d28',size:18})}
  else{text('Empty planting spot',92,480,19,'#3e3a2f','left',800);wrap('Restore the Sunny Border to find something suitable.',92,508,252,22,16,'#655d50',500,2)}
}
function drawButterflyList(){
  const list={x:16,y:590,w:358,h:150},items=[
    ['🦋','Cabbage White','First island visitor',true,'#f1f0ec'],
    ['🦋','Monarch',save.butterflies.monarch?'Attracted by the milkweed patch':'Needs a milkweed patch',save.butterflies.monarch,'#f7b45a'],
    ['🦋','Peacock','Find its favourite habitat later',false,'#8d7ac5']
  ];
  const contentH=items.length*94,maxScroll=Math.max(0,contentH-list.h);listScroll=Math.max(0,Math.min(maxScroll,listScroll));
  ctx.save();rr(list.x,list.y,list.w,list.h,18);ctx.clip();ctx.fillStyle='rgba(255,255,255,.45)';ctx.fillRect(list.x,list.y,list.w,list.h);
  items.forEach((it,i)=>{const y=list.y+i*94-listScroll;panel(list.x+2,y+2,list.w-13,86,it[3]?'rgba(255,255,255,.92)':'rgba(248,248,226,.8)',16);emoji(it[3]?it[0]:'?',49,y+44,it[3]?31:30);if(it[3]&&it[1]==='Cabbage White'){ctx.save();ctx.globalAlpha=.65;ctx.fillStyle='#fff';ctx.fillRect(38,y+28,22,28);ctx.restore()}text(it[3]?it[1]:'Undiscovered',79,y+38,18,'#3f392f','left',800);wrap(it[2],79,y+64,245,20,15,'#6d675c',500,1)});
  if(maxScroll>0){const thumbH=Math.max(34,list.h*(list.h/contentH)),thumbY=list.y+(list.h-thumbH)*(listScroll/maxScroll);fillRectRound(list.x+350,list.y+5,5,list.h-10,3,'rgba(75,91,78,.15)');fillRectRound(list.x+350,thumbY,5,thumbH,3,'rgba(75,91,78,.55)')}
  ctx.restore();
}

const PONG_STAGE={x:55,y:214,w:280,h:174};
function drawArcade(){
  drawTop('Old Pavilion','1 game');panel(18,134,354,480);fillRectRound(35,162,320,282,22,'#5a4b3c');fillRectRound(46,177,298,244,14,'#786957');text("GIGI'S PONG",195,207,24,'#ffe66f','center',900,'Georgia');
  fillRectRound(PONG_STAGE.x,PONG_STAGE.y,PONG_STAGE.w,PONG_STAGE.h,8,'#122820');strokeRectRound(PONG_STAGE.x,PONG_STAGE.y,PONG_STAGE.w,PONG_STAGE.h,8,'#cfc394',4);ctx.strokeStyle='rgba(255,255,255,.45)';ctx.setLineDash([7,6]);ctx.beginPath();ctx.moveTo(195,PONG_STAGE.y);ctx.lineTo(195,PONG_STAGE.y+PONG_STAGE.h);ctx.stroke();ctx.setLineDash([]);
  drawPongObjects();text(`${pong.score[0]}     ${pong.score[1]}`,195,247,28,'#fff4c4','center',900);text('Drag on the screen',195,470,18,'#3f392f','center',800);text('to move your paddle.',195,495,18,'#3f392f','center',800);wrap('No tickets, stamina, adverts or prizes. It is here because games are fun.',49,535,292,24,17,'#655d50',500,3);
  panel(18,629,354,93);emoji('🐒',52,676,37);text('Gigi:',88,657,18,'#3e3a2f','left',800);wrap('Repaired! Hitting it twice definitely counts.',88,683,255,21,16,'#554c43',500,2);drawNav();
}
function drawPongObjects(){
  const s=PONG_STAGE,pH=48,pW=8;
  fillRectRound(s.x+10,s.y+pong.player*s.h-pH/2,pW,pH,4,'#fff4c4');
  fillRectRound(s.x+s.w-18,s.y+pong.cpu*s.h-pH/2,pW,pH,4,'#fff4c4');
  ctx.beginPath();ctx.arc(s.x+pong.ball.x*s.w,s.y+pong.ball.y*s.h,6,0,Math.PI*2);ctx.fillStyle='#fff4c4';ctx.fill();
}
function boardCell(p){
  if(p.x<BOARD.x||p.x>BOARD.x+BOARD.w||p.y<BOARD.y||p.y>BOARD.y+BOARD.h)return null;
  return{c:Math.min(MATCH_COLS-1,Math.floor((p.x-BOARD.x)/BOARD.cell)),r:Math.min(MATCH_ROWS-1,Math.floor((p.y-BOARD.y)/BOARD.cell))};
}
function inRect(p,r){return p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h}
canvas.addEventListener('pointerdown',e=>{
  e.preventDefault();const p=point(e);pointer={start:p,last:p,id:e.pointerId};canvas.setPointerCapture?.(e.pointerId);
  if(screen==='sanctuary'&&inRect(p,{x:16,y:590,w:358,h:150}))listDrag=true;
  if(screen==='arcade'&&inRect(p,PONG_STAGE))pong.setPlayer((p.y-PONG_STAGE.y)/PONG_STAGE.h);
});
canvas.addEventListener('pointermove',e=>{
  if(!pointer||e.pointerId!==pointer.id)return;const p=point(e);e.preventDefault();
  if(listDrag){listScroll-=p.y-pointer.last.y}
  if(screen==='arcade'&&inRect(p,PONG_STAGE))pong.setPlayer((p.y-PONG_STAGE.y)/PONG_STAGE.h);
  pointer.last=p;
});
canvas.addEventListener('pointerup',e=>{
  if(!pointer||e.pointerId!==pointer.id)return;const p=point(e),start=pointer.start,dx=p.x-start.x,dy=p.y-start.y,moved=Math.hypot(dx,dy);e.preventDefault();
  const wasList=listDrag;listDrag=false;pointer=null;if(wasList&&moved>5)return;
  if(screen==='match'&&!matchWin){const from=boardCell(start);if(from){
    if(moved>12){const to={r:from.r,c:from.c};if(Math.abs(dx)>Math.abs(dy))to.c+=dx>0?1:-1;else to.r+=dy>0?1:-1;if(to.r>=0&&to.r<MATCH_ROWS&&to.c>=0&&to.c<MATCH_COLS)match.swipe(from,to)}else match.select(from);return;
  }}
  const h=hitAt(p.x,p.y);if(h&&h.action!=='noop')action(h.action);
});
canvas.addEventListener('pointercancel',()=>{pointer=null;listDrag=false});
canvas.addEventListener('wheel',e=>{
  const p=point(e);if(screen==='sanctuary'&&inRect(p,{x:16,y:590,w:358,h:150})){e.preventDefault();listScroll+=Math.sign(e.deltaY)*44}
},{passive:false});

function drawToast(){
  if(!toastState||performance.now()>toastState.until){toastState=null;return}
  fillRectRound(36,686,318,54,17,'rgba(53,91,79,.96)');text(toastState.message,195,720,17,'white','center',800);
}
function render(now){
  const dt=Math.min(.04,(now-lastTime)/1000);lastTime=now;if(screen==='arcade')pong.update(dt);
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,cssW,cssH);ctx.fillStyle='#7ec9e5';ctx.fillRect(0,0,cssW,cssH);
  ctx.setTransform(dpr*scale,0,0,dpr*scale,dpr*offX,dpr*offY);hits=[];drawBackground();
  if(screen==='island')drawIsland(now);else if(screen==='match')drawMatch();else if(screen==='sanctuary')drawSanctuary(now);else drawArcade();
  drawToast();requestAnimationFrame(render);
}
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
go('island');requestAnimationFrame(render);
