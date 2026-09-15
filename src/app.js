import {Match3Model,TILE_ICONS,TILE_COLORS,SPECIAL_ICONS,MATCH_COLS,MATCH_ROWS} from './match3.js';
import {PongModel} from './pong.js';
import {LEVELS,getLevel} from './levels.js';

const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d');
const VW=390,VH=844,NAV_Y=752,SAVE_KEY='nanas-island-prototype-v1';
const fresh=()=>({sunshine:0,levelWins:0,inventory:{milkweed:0,nettles:0},planted:{milkweed:false,nettles:false},butterflies:{cabbage:true,monarch:false,peacock:false}});
let save=load(),screen='island',match=null,pong=new PongModel(),matchWin=false;
let cssW=VW,cssH=VH,scale=1,offX=0,offY=0,dpr=1,hits=[],lastTime=performance.now();
let pointer=null,listScroll=0,listDrag=false,toastState=null;

function load(){const base=fresh();try{const raw=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}');return {...base,...raw,inventory:{...base.inventory,...(raw.inventory||{})},planted:{...base.planted,...(raw.planted||{})},butterflies:{...base.butterflies,...(raw.butterflies||{})}}}catch{return base}}
function persist(){localStorage.setItem(SAVE_KEY,JSON.stringify(save))}
function currentLevel(){return getLevel(save.levelWins)}
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
function drawBaseTileIcon(type,x,y){
  ctx.save();ctx.translate(x,y);ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=2;
  if(type===0){ctx.fillStyle='#fff1a0';for(let i=0;i<8;i++){ctx.rotate(Math.PI/4);ctx.beginPath();ctx.ellipse(0,-8,3.5,7,0,0,Math.PI*2);ctx.fill()}ctx.fillStyle='#6f4a2d';ctx.beginPath();ctx.arc(0,0,6,0,Math.PI*2);ctx.fill()}
  else if(type===1){ctx.fillStyle='#f0a45e';ctx.strokeStyle='#8b5a34';[-9,-3,3,9].forEach((cx,i)=>{ctx.beginPath();ctx.arc(cx,i%2?1:-1,5.5,0,Math.PI*2);ctx.fill();ctx.stroke()});ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(10,-2,1.3,0,Math.PI*2);ctx.fill()}
  else if(type===2){ctx.fillStyle='#e7fbff';ctx.strokeStyle='#277f9e';ctx.beginPath();ctx.moveTo(0,-12);ctx.bezierCurveTo(8,-3,10,3,7,8);ctx.bezierCurveTo(3,14,-6,13,-9,7);ctx.bezierCurveTo(-12,1,-6,-5,0,-12);ctx.closePath();ctx.fill();ctx.stroke()}
  else if(type===3){ctx.strokeStyle='#39734a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,11);ctx.lineTo(0,-7);ctx.stroke();ctx.fillStyle='#7046b3';[[-5,-7],[0,-10],[5,-7],[-5,-2],[0,-4],[5,-2],[0,2]].forEach(([a,b])=>{ctx.beginPath();ctx.arc(a,b,4,0,Math.PI*2);ctx.fill()})}
  else if(type===4){ctx.fillStyle='#c93843';ctx.strokeStyle='#fff0de';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-10,-5);ctx.quadraticCurveTo(0,-12,10,-5);ctx.quadraticCurveTo(7,8,0,13);ctx.quadraticCurveTo(-7,8,-10,-5);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#f8d65d';[[-4,0],[3,-1],[-1,5],[4,6]].forEach(([a,b])=>{ctx.beginPath();ctx.arc(a,b,1,0,Math.PI*2);ctx.fill()});ctx.fillStyle='#3d7c42';ctx.fillRect(-5,-10,10,4)}
  else{ctx.fillStyle='#287c45';ctx.strokeStyle='#e4f8df';ctx.beginPath();ctx.ellipse(0,0,8,13,-.7,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(-7,8);ctx.lineTo(7,-8);ctx.stroke()}
  ctx.restore();
}
function drawSpecialTileIcon(type,x,y){
  ctx.save();ctx.translate(x,y);ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=2;
  if(type===0){ctx.strokeStyle='#a96f16';ctx.fillStyle='#ffd84d';for(let i=0;i<8;i++){ctx.rotate(Math.PI/4);ctx.beginPath();ctx.moveTo(0,-11);ctx.lineTo(0,-15);ctx.stroke()}ctx.beginPath();ctx.arc(0,0,9,0,Math.PI*2);ctx.fill();ctx.stroke()}
  else if(type===1){ctx.fillStyle='#f0a13b';ctx.strokeStyle='#6c4a32';ctx.beginPath();ctx.ellipse(-6,-3,7,10,-.5,0,Math.PI*2);ctx.ellipse(6,-3,7,10,.5,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#4b392d';ctx.fillRect(-1,-8,2,16)}
  else if(type===2){ctx.fillStyle='#f5f8fa';ctx.beginPath();ctx.arc(-5,-2,7,Math.PI,0);ctx.arc(3,-4,8,Math.PI,0);ctx.arc(9,-1,6,Math.PI,0);ctx.lineTo(-12,3);ctx.closePath();ctx.fill();ctx.strokeStyle='#2e89a9';[[-6,8],[1,11],[8,7]].forEach(([a,b])=>{ctx.beginPath();ctx.moveTo(a,b-4);ctx.lineTo(a-2,b+3);ctx.stroke()})}
  else if(type===3){ctx.fillStyle='#7046b3';[[-5,-6],[1,-7],[6,-2],[-6,0],[0,0],[5,5],[-2,6]].forEach(([a,b])=>{ctx.beginPath();ctx.arc(a,b,4,0,Math.PI*2);ctx.fill()});ctx.strokeStyle='#39734a';ctx.beginPath();ctx.moveTo(0,-11);ctx.lineTo(3,-7);ctx.stroke()}
  else if(type===4){ctx.fillStyle='#fff1d0';ctx.beginPath();ctx.arc(0,2,12,0,Math.PI);ctx.closePath();ctx.fill();ctx.strokeStyle='#b66f4c';ctx.stroke();ctx.fillStyle='#d34a55';ctx.beginPath();ctx.arc(-5,-2,4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f2c84d';ctx.beginPath();ctx.arc(1,-4,4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#7dbb55';ctx.beginPath();ctx.arc(6,-1,4,0,Math.PI*2);ctx.fill()}
  else{ctx.fillStyle='#765038';ctx.fillRect(-3,3,6,11);ctx.fillStyle='#3d8b49';[[-7,0],[0,-5],[7,0],[-2,2],[5,3]].forEach(([a,b])=>{ctx.beginPath();ctx.arc(a,b,7,0,Math.PI*2);ctx.fill()})}
  ctx.restore();
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
  if(screen==='match')match=new Match3Model(()=>{},finishMatch,currentLevel());
  if(screen==='arcade')pong=new PongModel();
}
function finishMatch(){
  if(!match||match.rewarded)return;match.rewarded=true;matchWin=true;const level=match.level,reward=level.reward||{};
  if(level.id!=='free')save.levelWins=Math.min(LEVELS.length,save.levelWins+1);save.sunshine+=reward.sunshine||0;
  if(reward.item)save.inventory[reward.item]=(save.inventory[reward.item]||0)+1;persist();
  toast(`${reward.icon||'🌟'} ${reward.name||'Level complete!'}`);
}
function plantMilkweed(){
  if(save.inventory.milkweed<1||save.planted.milkweed)return;
  save.inventory.milkweed--;save.planted.milkweed=true;save.butterflies.monarch=true;save.sunshine+=25;persist();
  toast('🦋 New visitor: Monarch!');
}
function plantNettles(){
  if((save.inventory.nettles||0)<1||save.planted.nettles)return;save.inventory.nettles--;save.planted.nettles=true;save.butterflies.peacock=true;save.sunshine+=25;persist();toast('🦋 New visitor: Peacock!');
}
function toast(message){toastState={message,until:performance.now()+2300}}
function action(name){
  if(name?.startsWith('go:')){go(name.slice(3));return}
  if(name==='restart'&&match){match.restart();matchWin=false;return}
  if(name==='plant'){plantMilkweed();return}
  if(name==='plantNettles'){plantNettles();return}
  if(name==='afterWin'){go(match?.level?.reward?.item==='milkweed'||match?.level?.reward?.item==='nettles'?'sanctuary':'island');return}
}
function drawBackground(){
  const g=ctx.createLinearGradient(0,0,0,VH);g.addColorStop(0,'#98dcf3');g.addColorStop(.5,'#d9f4dc');g.addColorStop(1,'#fff6cc');ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
}
function drawTop(title=null,pill=null){
  if(!title){
    text("Nana's Island",18,48,31,'#315f53','left',800,'Georgia');
    fillRectRound(306,16,66,46,22,'#fff7cf');strokeRectRound(306,16,66,46,22,'#e9bd38',2);
    emoji('☀️',326,39,22);text(String(save.sunshine),351,46,18,'#3e3a2f','center',800);return;
  }
  const titleSize=title.length>18?24:28;text(title,18,51,titleSize,'#315f53','left',800,'Georgia');
  if(pill){fillRectRound(300,18,72,42,20,'#fff8df');text(pill,336,45,15,'#3e3a2f','center',800)}
}
function drawNav(){
  ctx.fillStyle='rgba(255,252,235,.98)';ctx.fillRect(0,NAV_Y,VW,VH-NAV_Y);ctx.strokeStyle='#d8cfaa';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,NAV_Y);ctx.lineTo(VW,NAV_Y);ctx.stroke();
  const items=[['island','🏝️','Island'],['match','🌼','Play'],['sanctuary','🦋','Butterflies'],['arcade','🕹️','Arcade']];
  items.forEach((it,i)=>{const x=i*97.5,w=97.5,active=screen===it[0];if(active)fillRectRound(x+8,NAV_Y+9,w-16,74,16,'#ffe98d');emoji(it[1],x+w/2,NAV_Y+32,30);text(it[2],x+w/2,NAV_Y+72,16,'#39352d','center',800);hits.push({x,y:NAV_Y,w,h:VH-NAV_Y,action:`go:${it[0]}`})});
}
function drawIsland(t){
  const level=currentLevel(),free=level.id==='free';drawTop();
  fillRectRound(16,73,358,250,22,'#91daf2');ctx.save();rr(16,73,358,250,22);ctx.clip();
  ctx.fillStyle='#ffe779';ctx.beginPath();ctx.arc(333,91,68,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#64b574';ctx.beginPath();ctx.ellipse(120,260,190,86,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(320,255,155,72,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#edca6c';ctx.fillRect(16,259,358,64);ctx.restore();strokeRectRound(16,73,358,250,22,'#e4bf54',2);
  button('Sanctuary',38,118,132,50,'go:sanctuary',{icon:'🦋'});button('Pavilion',235,118,122,50,'go:arcade',{icon:'🕹️'});button(free?'Free Play':`Level ${level.id}`,140,257,120,52,'go:match',{icon:'🌼',fill:'#ffdf59'});
  fillRectRound(34,177,145,69,18,'rgba(255,255,255,.78)');emoji('🐘',64,211,40);text('Ellie',102,201,17,'#2f382f','left',800);text('the planner',102,224,16,'#2f382f','left',500);
  fillRectRound(204,177,152,69,18,'rgba(255,255,255,.78)');emoji('🐒',324,211,40);text('Gigi',219,201,17,'#2f382f','left',800);text('the ideas dept.',219,224,16,'#2f382f','left',500);
  text('Today on the island',20,365,27,'#315f53','left',800,'Georgia');text(`${save.levelWins} levels`,370,360,16,'#607568','right',700);text('cleared',370,382,16,'#607568','right',700);
  panel(17,402,356,136);emoji(level.reward?.icon||'🌱',63,470,42);text(level.name,102,444,19,'#3d392e','left',800);wrap(level.hint,102,475,245,24,17,'#655d50',500,3);
  panel(17,553,356,112,'rgba(255,255,255,.86)');emoji('🐘',53,608,38);text('Ellie:',88,586,18,'#3d392e','left',800);wrap(free?'The sanctuary is looking lovely. Play whenever you fancy.':save.levelWins?'That went nicely. There is always another little job waiting.':'One flower bed at a time. The island can wait.',88,613,242,23,17,'#4d463d',500,3);emoji('🐒',345,612,34);
  drawNav();
}

const BOARD={x:15,y:142,cell:40,w:360,h:360};
function drawMatch(){
  const level=match?.level||currentLevel(),progress=match?.objectiveProgress?.()||0,target=level.objective.target,reward=level.reward||{};
  drawTop(level.name,level.id==='free'?'Free':`Level ${level.id}`);panel(10,72,370,666);drawMatchStats();drawBoard();
  wrap(level.hint,30,532,330,22,16,'#54685e',700,2);
  button('Restart board',120,579,150,48,'restart',{fill:'#fffdf0',stroke:'#d9d2b4',size:16});
  fillRectRound(30,642,330,42,16,'#fff3bd');emoji(reward.icon||'🌟',54,663,24);text(`Reward: ${reward.name||'Sunshine'}`,75,669,16,'#4f4b3e','left',800);
  if(matchWin)drawWinOverlay();drawNav();
}
function drawMatchStats(){
  const level=match?.level||currentLevel(),progress=match?.objectiveProgress?.()||0,target=level.objective.target;
  const vals=[['MOVES',match?.moves??level.moves],[level.stat,`${Math.min(progress,target)} / ${target}`],['SCORE',match?.score??0]];
  vals.forEach((v,i)=>{const x=29+i*111;fillRectRound(x,86,103,44,14,'#fff8df');text(v[0],x+51.5,103,12,'#594f3e','center',800);text(String(v[1]),x+51.5,125,20,'#315f53','center',800)});
}

function drawBoard(){
  fillRectRound(BOARD.x-4,BOARD.y-4,BOARD.w+8,BOARD.h+8,18,'#355b4f');
  const pulse=.55+.45*Math.sin(performance.now()*.006);
  for(let r=0;r<MATCH_ROWS;r++)for(let c=0;c<MATCH_COLS;c++){
    const tile=match?.board[r]?.[c],x=BOARD.x+c*BOARD.cell,y=BOARD.y+r*BOARD.cell,k=`${r},${c}`;
    const weed=match?.weeds?.has(k),bloomCell=match?.bloomCells?.has(k),bloomed=match?.bloomed?.has(k),web=match?.webs?.has(k);
    const base=weed?'#8a6946':bloomCell?(bloomed?'#73b65a':'#9c704a'):'rgba(255,255,255,.08)';
    fillRectRound(x+2,y+2,BOARD.cell-4,BOARD.cell-4,8,base);if(tile==null)continue;
    const type=tile.type;fillRectRound(x+4,y+4,BOARD.cell-8,BOARD.cell-8,8,TILE_COLORS[type]);
    ctx.fillStyle='rgba(255,255,255,.2)';rr(x+7,y+7,BOARD.cell-14,9,5);ctx.fill();
    if(tile.special){ctx.save();ctx.globalAlpha=.45+.3*pulse;strokeRectRound(x+2,y+2,BOARD.cell-4,BOARD.cell-4,10,'#fff5a8',4);ctx.restore();drawSpecialTileIcon(type,x+20,y+20)}else drawBaseTileIcon(type,x+20,y+20);
    if(weed){ctx.strokeStyle='#6b4a31';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+7,y+33);ctx.lineTo(x+13,y+27);ctx.lineTo(x+17,y+34);ctx.stroke()}
    if(bloomCell){strokeRectRound(x+4,y+4,BOARD.cell-8,BOARD.cell-8,8,bloomed?'#ffe36b':'#6f4d2f',3);emoji(bloomed?'🌼':'•',x+31,y+31,bloomed?14:18)}
    if(web){ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x+5,y+5);ctx.lineTo(x+35,y+35);ctx.moveTo(x+35,y+5);ctx.lineTo(x+5,y+35);ctx.moveTo(x+20,y+3);ctx.lineTo(x+20,y+37);ctx.stroke();}
    if(match?.selected?.r===r&&match.selected.c===c)strokeRectRound(x+3,y+3,BOARD.cell-6,BOARD.cell-6,11,'#fff7ad',4);
    if(match?.flash?.some(p=>p.r===r&&p.c===c)){ctx.fillStyle='rgba(255,250,183,.45)';rr(x+2,y+2,BOARD.cell-4,BOARD.cell-4,11);ctx.fill()}
  }
  for(const d of match?.drops||[])if(!d.delivered){const x=BOARD.x+d.c*40+20,y=BOARD.y+Math.min(8,d.r)*40+20;fillRectRound(x-14,y-14,28,28,7,'#fff3c8');strokeRectRound(x-14,y-14,28,28,7,'#bd8c41',2);emoji('🌱',x,y,18)}
  drawSpecialEffect();
}

function drawSpecialEffect(){
  const effect=match?.effect;if(!effect?.path?.length)return;ctx.save();
  if(effect.type===3){
    ctx.strokeStyle='#4f9c4a';ctx.lineWidth=8;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
    effect.path.forEach((p,i)=>{const x=BOARD.x+p.c*BOARD.cell+BOARD.cell/2,y=BOARD.y+p.r*BOARD.cell+BOARD.cell/2;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();
    ctx.strokeStyle='#b7e27d';ctx.lineWidth=3;ctx.stroke();
  }else if(effect.type===2){
    const x=BOARD.x+effect.origin.c*BOARD.cell+BOARD.cell/2;ctx.strokeStyle='rgba(150,225,255,.85)';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(x,BOARD.y);ctx.lineTo(x,BOARD.y+BOARD.h);ctx.stroke();
  }else{
    ctx.fillStyle='rgba(255,245,150,.22)';for(const p of effect.path){ctx.beginPath();ctx.arc(BOARD.x+p.c*BOARD.cell+20,BOARD.y+p.r*BOARD.cell+20,17,0,Math.PI*2);ctx.fill()}
  }
  ctx.restore();
}
function drawWinOverlay(){
  const level=match?.level||currentLevel(),reward=level.reward||{};
  ctx.fillStyle='rgba(40,69,59,.78)';rr(29,190,332,480,22);ctx.fill();panel(54,315,282,220,'#fff3ad');emoji(reward.icon||'🌟',195,355,42);
  text(level.id==='free'?'Lovely run!':'Job complete!',195,399,25,'#3b4d42','center',800,'Georgia');
  wrap(level.id==='free'?`You earned ${reward.name||'some sunshine'}.`:`You earned: ${reward.name}.`,82,434,226,25,18,'#554c3f',600,3);
  button(reward.item==='milkweed'||reward.item==='nettles'?'Visit the sanctuary':'Back to the island',76,528,238,58,'afterWin',{fill:'#f5c84b',stroke:'#ca9d28',size:18});
}

function drawSanctuary(t){
  const count=1+(save.butterflies.monarch?1:0)+(save.butterflies.peacock?1:0),hasNettles=(save.inventory.nettles||0)>0||save.planted.nettles||save.levelWins>=4;
  drawTop('Butterfly Sanctuary',`${count} / 3`);
  fillRectRound(16,72,358,212,22,'#b8e8f8');ctx.save();rr(16,72,358,212,22);ctx.clip();ctx.fillStyle='#bde18c';ctx.fillRect(16,170,358,57);ctx.fillStyle='#6fa85d';ctx.fillRect(16,227,358,57);
  ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(62,252);ctx.lineTo(62,181);ctx.quadraticCurveTo(62,116,195,116);ctx.quadraticCurveTo(328,116,328,181);ctx.lineTo(328,252);ctx.stroke();
  emoji('🌼',83,253,31);emoji(save.planted.nettles?'🌿':'🌸',145,253,33);emoji(save.planted.milkweed?'🌿':'🌱',225,253,35);emoji('🌼',301,253,31);
  const flap=Math.sin(t*.004)*8;emoji('🦋',108,158+flap,27);if(save.butterflies.monarch)emoji('🦋',251,148-flap,29);if(save.butterflies.peacock)emoji('🦋',292,202+flap*.7,27);ctx.restore();
  text('Garden bag',20,317,25,'#315f53','left',800,'Georgia');text('Plants invite visitors',370,317,16,'#607568','right',700);
  button(save.planted.milkweed?'Milkweed ✓':`Milkweed × ${save.inventory.milkweed||0}`,16,334,174,48,'noop',{icon:'🌿',fill:'#fff8df',size:15});
  button(hasNettles?(save.planted.nettles?'Nettles ✓':`Nettles × ${save.inventory.nettles||0}`):'Sunny flowers ✓',199,334,175,48,'noop',{icon:hasNettles?'🌿':'🌼',fill:'#fff8df',size:15});
  drawPlantQuest();text('Butterfly book',20,526,25,'#315f53','left',800,'Georgia');text('Real species',370,526,16,'#607568','right',700);drawButterflyList();drawNav();
}
function drawPlantQuest(){
  panel(16,397,358,105);
  if(!save.planted.milkweed&&(save.inventory.milkweed||0)>0){emoji('🌿',55,449,39);text('Milkweed cutting',92,426,19,'#3e3a2f','left',800);wrap('Plant it in the sunny bed and see who notices.',92,454,160,22,16,'#655d50',500,2);button('Plant',269,420,86,58,'plant',{fill:'#f5c84b',stroke:'#ca9d28',size:18})}
  else if(!save.planted.nettles&&(save.inventory.nettles||0)>0){emoji('🌿',55,449,39);text('Nettle cutting',92,426,19,'#3e3a2f','left',800);wrap('A shady nettle patch may tempt another visitor.',92,454,160,22,16,'#655d50',500,2);button('Plant',269,420,86,58,'plantNettles',{fill:'#f5c84b',stroke:'#ca9d28',size:18})}
  else if(save.planted.milkweed&&save.planted.nettles){emoji('🦋',55,449,39);text('Habitats growing nicely',92,430,19,'#3e3a2f','left',800);wrap('Both special patches are ready for visitors.',92,458,252,22,16,'#655d50',500,2)}
  else{emoji('🌱',55,449,39);text('Empty planting spot',92,430,19,'#3e3a2f','left',800);wrap('Keep helping around the island to find new plants.',92,458,252,22,16,'#655d50',500,2)}
}
function drawButterflyList(){
  const list={x:16,y:542,w:358,h:198},items=[['🦋','Cabbage White','First island visitor',true],['🦋','Monarch',save.butterflies.monarch?'Attracted by the milkweed patch':'Needs a milkweed patch',save.butterflies.monarch],['🦋','Peacock',save.butterflies.peacock?'Attracted by the nettle patch':'Loves a good nettle patch',save.butterflies.peacock]];
  const contentH=items.length*94,maxScroll=Math.max(0,contentH-list.h);listScroll=Math.max(0,Math.min(maxScroll,listScroll));ctx.save();rr(list.x,list.y,list.w,list.h,18);ctx.clip();ctx.fillStyle='rgba(255,255,255,.45)';ctx.fillRect(list.x,list.y,list.w,list.h);
  items.forEach((it,i)=>{const y=list.y+i*94-listScroll;panel(list.x+2,y+2,list.w-13,86,it[3]?'rgba(255,255,255,.92)':'rgba(248,248,226,.8)',16);emoji(it[3]?it[0]:'?',49,y+44,it[3]?31:30);text(it[3]?it[1]:'Undiscovered',79,y+38,18,'#3f392f','left',800);wrap(it[2],79,y+64,245,20,15,'#6d675c',500,1)});
  if(maxScroll>0){const thumbH=Math.max(34,list.h*(list.h/contentH)),thumbY=list.y+(list.h-thumbH)*(listScroll/maxScroll);fillRectRound(list.x+350,list.y+5,5,list.h-10,3,'rgba(75,91,78,.15)');fillRectRound(list.x+350,thumbY,5,thumbH,3,'rgba(75,91,78,.55)')}ctx.restore();
}

const PONG_STAGE={x:45,y:148,w:300,h:190};
function drawArcade(){
  drawTop('Old Pavilion','1 game');panel(18,72,354,550);fillRectRound(29,94,332,300,22,'#5a4b3c');fillRectRound(39,108,312,270,14,'#786957');text("GIGI'S PONG",195,139,24,'#ffe66f','center',900,'Georgia');
  fillRectRound(PONG_STAGE.x,PONG_STAGE.y,PONG_STAGE.w,PONG_STAGE.h,8,'#122820');strokeRectRound(PONG_STAGE.x,PONG_STAGE.y,PONG_STAGE.w,PONG_STAGE.h,8,'#cfc394',4);ctx.strokeStyle='rgba(255,255,255,.45)';ctx.setLineDash([7,6]);ctx.beginPath();ctx.moveTo(195,PONG_STAGE.y);ctx.lineTo(195,PONG_STAGE.y+PONG_STAGE.h);ctx.stroke();ctx.setLineDash([]);
  drawPongObjects();text(`${pong.score[0]}     ${pong.score[1]}`,195,181,28,'#fff4c4','center',900);text('Drag on the screen',195,430,18,'#3f392f','center',800);text('to move your paddle.',195,455,18,'#3f392f','center',800);wrap('No tickets, stamina, adverts or prizes. It is here because games are fun.',49,500,292,24,17,'#655d50',500,3);
  panel(18,634,354,96);emoji('🐒',52,681,37);text('Gigi:',88,662,18,'#3e3a2f','left',800);wrap('Repaired! Hitting it twice definitely counts.',88,688,255,21,16,'#554c43',500,2);drawNav();
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
  if(screen==='sanctuary'&&inRect(p,{x:16,y:542,w:358,h:198}))listDrag=true;
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
  const p=point(e);if(screen==='sanctuary'&&inRect(p,{x:16,y:542,w:358,h:198})){e.preventDefault();listScroll+=Math.sign(e.deltaY)*44}
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
