export class PongModel{
  constructor(){this.reset()}
  reset(){
    this.player=.5;this.cpu=.5;this.ball={x:.5,y:.5,vx:.34,vy:.22};this.score=[0,0];
  }
  setPlayer(y){this.player=Math.max(.12,Math.min(.88,y))}
  update(dt){
    const b=this.ball;b.x+=b.vx*dt;b.y+=b.vy*dt;
    if(b.y<.04){b.y=.04;b.vy=Math.abs(b.vy)}
    if(b.y>.96){b.y=.96;b.vy=-Math.abs(b.vy)}
    this.cpu+=Math.sign(b.y-this.cpu)*Math.min(Math.abs(b.y-this.cpu),dt*.48);
    if(b.x<.08&&b.vx<0&&Math.abs(b.y-this.player)<.14){b.x=.08;b.vx=Math.abs(b.vx)*1.025;b.vy+=(b.y-this.player)*.55}
    if(b.x>.92&&b.vx>0&&Math.abs(b.y-this.cpu)<.14){b.x=.92;b.vx=-Math.abs(b.vx)*1.025;b.vy+=(b.y-this.cpu)*.55}
    if(b.x<-.04){this.score[1]++;this.serve(1)}
    if(b.x>1.04){this.score[0]++;this.serve(-1)}
  }
  serve(dir){
    this.ball={x:.5,y:.35+Math.random()*.3,vx:.32*dir,vy:(Math.random()-.5)*.4};
  }
}
