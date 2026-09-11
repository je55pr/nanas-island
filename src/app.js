import {Match3} from './match3.js';
import {Pong} from './pong.js';

const app=document.querySelector('#app');
const nav=document.querySelector('#nav');
const SAVE_KEY='nanas-island-prototype-v1';
const fresh=()=>({sunshine:0,levelWins:0,inventory:{milkweed:0},planted:{milkweed:false},butterflies:{cabbage:true,monarch:false,peacock:false}});
let save=load(),screen='island',match=null,pong=null;

function load(){try{return {...fresh(),...JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')}}catch{return fresh()}}
function persist(){localStorage.setItem(SAVE_KEY,JSON.stringify(save))}
function go(next){
  match=null;if(pong){pong.destroy();pong=null}screen=next;
  nav.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.screen===screen));render();
}
nav.addEventListener('click',e=>{const b=e.target.closest('button[data-screen]');if(b)go(b.dataset.screen)});
app.addEventListener('click',e=>{
  const b=e.target.closest('[data-go]');if(b)go(b.dataset.go);
  if(e.target.closest('#plantMilkweed'))plantMilkweed();
  if(e.target.closest('#restartMatch'))match?.restart();
  if(e.target.closest('#resetSave')){if(confirm('Reset this prototype save?')){save=fresh();persist();go('island')}}
});

function shell(title,extra=''){
  return `<div class="topbar"><div class="brand">Nana's Island</div><div class="sunshine">☀️ ${save.sunshine}</div></div>${title?`<div class="screen-head"><h1>${title}</h1>${extra}</div>`:''}`;
}
function render(){
  if(screen==='island')renderIsland();if(screen==='match')renderMatch();if(screen==='sanctuary')renderSanctuary();if(screen==='arcade')renderArcade();
}
function renderIsland(){
  app.innerHTML=`<section class="screen">${shell()}
    <div class="card hero">
      <div class="hill"></div><div class="hill two"></div>
      <button class="island-place sanctuary" data-go="sanctuary">🦋 Sanctuary</button>
      <button class="island-place arcade" data-go="arcade">🕹️ Pavilion</button>
      <button class="island-place play" data-go="match">🌼 Level ${save.levelWins+1}</button>
      <div class="characters">
        <div class="character"><span class="face">🐘</span><span>Ellie<br><small>the planner</small></span></div>
        <div class="character gibbon"><span class="face">🐒</span><span>Gigi<br><small>the ideas dept.</small></span></div>
      </div>
    </div>
    <div class="section-title"><h2>Today on the island</h2><small>${save.levelWins} level${save.levelWins===1?'':'s'} cleared</small></div>
    <div class="card quest"><div class="quest-icon">${save.planted.milkweed?'🦋':'🌱'}</div><div><strong>${save.planted.milkweed?'A new visitor!':'Restore the sunny border'}</strong><p>${save.planted.milkweed?'The milkweed patch has attracted a Monarch to the sanctuary.':'Play a match-3 level to earn a milkweed cutting for the butterfly garden.'}</p></div></div>
    <div class="dialogue"><div class="portrait">🐘</div><div class="speech"><b>Ellie:</b> ${save.levelWins?'That flower bed is looking much better.':'One flower bed at a time. We are absolutely not doing the whole island before lunch.'}</div></div>
    <div class="dialogue"><div class="portrait">🐒</div><div class="speech"><b>Gigi:</b> ${save.levelWins?'Counterpoint: more flowers. Everywhere.':'I have already drawn plans for a waterslide.'}</div></div>
    <p class="tiny-note" style="text-align:center;margin-top:16px"><button id="resetSave" style="border:0;background:transparent;text-decoration:underline;color:#776f61">Reset prototype progress</button></p>
  </section>`;
}
function renderMatch(){
  app.innerHTML=`<section class="screen">${shell('Sunny Border','<span class="pill">Level '+(save.levelWins+1)+'</span>')}
    <div class="card match-wrap">
      <div class="match-stats"><div class="stat">MOVES<b id="moves">18</b></div><div class="stat">SUNFLOWERS<b id="yellow">0 / 12</b></div><div class="stat">SCORE<b id="score">0</b></div></div>
      <canvas id="matchCanvas" aria-label="Match three board"></canvas>
      <p class="match-help">Swipe a tile, or tap one tile and then a neighbour. Match 3 or more.</p>
      <p class="tiny-note" style="text-align:center"><button id="restartMatch" style="border:0;background:transparent;text-decoration:underline;color:#66756b">Restart board</button></p>
      <div id="matchResult"></div>
    </div>
    <div class="card reward-banner"><div class="flower">🌿</div><div><strong>Level reward</strong><div class="tiny-note">Milkweed cutting • attracts a special butterfly</div></div></div>
  </section>`;
  const canvas=document.querySelector('#matchCanvas');
  match=new Match3(canvas,state=>{
    document.querySelector('#moves').textContent=state.moves;
    document.querySelector('#yellow').textContent=`${Math.min(state.yellow,state.target)} / ${state.target}`;
    document.querySelector('#score').textContent=state.score;
  },()=>finishMatch());
}

function finishMatch(){
  if(match?.rewarded)return;match.rewarded=true;match.busy=true;
  save.levelWins++;save.sunshine+=50;save.inventory.milkweed++;persist();
  document.querySelector('#matchResult').innerHTML=`<div class="card" style="margin-top:12px;text-align:center;background:#fff3ad"><b>🌟 Border restored!</b><p style="font-size:13px;margin:6px">You found a milkweed cutting.</p><button class="primary" data-go="sanctuary">Take it to the sanctuary</button><br><button id="restartMatch" style="margin-top:8px;border:0;background:transparent;text-decoration:underline">Play again</button></div>`;
  toast('🌿 Milkweed added to your garden bag');
}
function renderSanctuary(){
  const monarch=save.butterflies.monarch;
  app.innerHTML=`<section class="screen">${shell('Butterfly Sanctuary',`<span class="pill">${1+(monarch?1:0)} / 3 found</span>`)}
    <div class="sanctuary-scene">
      <div class="glasshouse"></div>
      <div class="flowerbed">🌼 🌸 ${save.planted.milkweed?'🌿 🌺 🌿':'🌱'} 🌼</div>
      <span class="butterfly" style="left:22%;top:30%;filter:grayscale(1) brightness(1.45)">🦋</span>
      ${monarch?'<span class="butterfly" style="left:58%;top:23%;animation-delay:-1.6s">🦋</span><span class="butterfly" style="left:67%;top:49%;animation-delay:-3s">🦋</span>':''}
    </div>
    <div class="section-title"><h2>Garden bag</h2><small>Plants invite visitors</small></div>
    <div class="flower-strip"><div class="flower-chip">🌼 Sunny flowers ✓</div><div class="flower-chip">🌿 Milkweed × ${save.inventory.milkweed}</div></div>
    ${milkweedAction()}
    <div class="section-title"><h2>Butterfly book</h2><small>Real species</small></div>
    <div class="collection">
      ${species('🦋','Cabbage White','First island visitor',true,'filter:grayscale(1) brightness(1.45)')}
      ${species('🦋','Monarch',monarch?'Attracted by the milkweed patch':'Needs a milkweed patch',monarch,'')}
      ${species('🦋','Peacock','Find its favourite habitat later',false,'filter:hue-rotate(290deg)')}
    </div>
  </section>`;
}
function milkweedAction(){
  if(save.planted.milkweed)return `<div class="card quest" style="margin-top:10px"><div class="quest-icon">🌿</div><div><strong>Milkweed patch planted</strong><p>The sanctuary has another little habitat to explore.</p></div></div>`;
  if(save.inventory.milkweed>0)return `<div class="card quest" style="margin-top:10px"><div class="quest-icon">🌿</div><div style="flex:1"><strong>Milkweed cutting</strong><p>Plant it in the sunny bed and see who notices.</p></div><button id="plantMilkweed" class="primary">Plant</button></div>`;
  return `<div class="card quest" style="margin-top:10px"><div class="quest-icon">🌱</div><div><strong>Empty planting spot</strong><p>Restore the Sunny Border to find something suitable.</p></div></div>`;
}
function species(icon,name,note,found,style){return `<div class="species ${found?'':'locked'}"><span class="icon" style="${style}">${found?icon:'?'}</span><strong>${found?name:'Undiscovered'}</strong><small>${note}</small></div>`}
function plantMilkweed(){
  if(save.inventory.milkweed<1||save.planted.milkweed)return;
  save.inventory.milkweed--;save.planted.milkweed=true;save.butterflies.monarch=true;save.sunshine+=25;persist();renderSanctuary();
  toast('🦋 New visitor: Monarch!');
}

function renderArcade(){
  app.innerHTML=`<section class="screen">${shell('Old Pavilion','<span class="pill">1 game</span>')}
    <div class="card arcade-card">
      <div class="cabinet"><div class="cabinet-title">GIGI'S PONG</div><div id="pongStage" class="pong-stage" aria-label="Pong game"></div></div>
      <strong>Drag anywhere on the screen to move your paddle.</strong>
      <p class="tiny-note">A deliberately tiny side game. No tickets, stamina, adverts or prizes needed. It is here because games are fun.</p>
    </div>
    <div class="dialogue"><div class="portrait">🐒</div><div class="speech"><b>Gigi:</b> I repaired the old machine! Technically, hitting it twice counts as repairing.</div></div>
  </section>`;
  pong=new Pong(document.querySelector('#pongStage'));
}

function toast(message){
  document.querySelector('.toast')?.remove();const el=document.createElement('div');el.className='toast';el.textContent=message;document.body.appendChild(el);setTimeout(()=>el.remove(),2300);
}

if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
go('island');
