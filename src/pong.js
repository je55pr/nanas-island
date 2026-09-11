export class Pong {
  constructor(stage){
    this.stage=stage;this.w=300;this.h=188;this.playerY=70;this.cpuY=70;this.ball={x:145,y:90,vx:2.7,vy:1.8};this.score=[0,0];this.running=true;
    stage.innerHTML='<div class="pong-score"><b>0</b><b>0</b></div><div class="pong-net"></div><div class="pong-paddle player"></div><div class="pong-paddle cpu"></div><div class="pong-ball"></div>';
    this.p1=stage.querySelector('.player');this.p2=stage.querySelector('.cpu');this.ballEl=stage.querySelector('.pong-ball');this.scores=stage.querySelectorAll('.pong-score b');
    this.move=e=>{const r=stage.getBoundingClientRect();this.playerY=Math.max(0,Math.min(this.h-48,(e.clientY-r.top)/r.height*this.h-24))};
    stage.addEventListener('pointermove',this.move);stage.addEventListener('pointerdown',this.move);this.frame();
  }
  reset(dir=1){this.ball={x:145,y:88,vx:2.7*dir,vy:(Math.random()-.5)*3.5}}
  frame(){
    if(!this.running)return;const b=this.ball;b.x+=b.vx;b.y+=b.vy;
    if(b.y<0||b.y>this.h-11)b.vy*=-1;
    this.cpuY+=(b.y-24-this.cpuY)*.055;this.cpuY=Math.max(0,Math.min(this.h-48,this.cpuY));
    if(b.vx<0&&b.x<17&&b.x>8&&b.y+11>this.playerY&&b.y<this.playerY+48){b.vx=Math.abs(b.vx)*1.03;b.vy+=(b.y-(this.playerY+24))*.05}
    if(b.vx>0&&b.x>this.w-25&&b.x<this.w-10&&b.y+11>this.cpuY&&b.y<this.cpuY+48){b.vx=-Math.abs(b.vx)*1.03;b.vy+=(b.y-(this.cpuY+24))*.05}
    if(b.x<-14){this.score[1]++;this.reset(1)}if(b.x>this.w+14){this.score[0]++;this.reset(-1)}
    this.render();this.raf=requestAnimationFrame(()=>this.frame());
  }
  render(){
    const sx=this.stage.clientWidth/this.w,sy=this.stage.clientHeight/this.h;
    this.p1.style.cssText=`left:${8*sx}px;top:${this.playerY*sy}px;height:${48*sy}px`;this.p2.style.cssText=`right:${8*sx}px;top:${this.cpuY*sy}px;height:${48*sy}px`;
    this.ballEl.style.cssText=`left:${this.ball.x*sx}px;top:${this.ball.y*sy}px;width:${11*sx}px;height:${11*sy}px`;this.scores[0].textContent=this.score[0];this.scores[1].textContent=this.score[1];
  }
  destroy(){this.running=false;cancelAnimationFrame(this.raf);this.stage.removeEventListener('pointermove',this.move);this.stage.removeEventListener('pointerdown',this.move)}
}
