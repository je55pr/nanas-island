const ICONS=['🌻','🌺','🍃','💧','🫐','🐚'];
const COLORS=['#f6c83d','#ef6a82','#65b96f','#54b8d1','#7067b8','#efb879'];
const COLS=7,ROWS=8,CELL=56;
const wait=ms=>new Promise(r=>setTimeout(r,ms));

export class Match3 {
  constructor(canvas,onState,onWin){
    this.canvas=canvas;this.ctx=canvas.getContext('2d');this.onState=onState;this.onWin=onWin;
    this.board=[];this.moves=18;this.yellow=0;this.target=12;this.score=0;this.busy=false;this.down=null;
    canvas.width=COLS*CELL;canvas.height=ROWS*CELL;
    this.resetBoard();this.bind();this.draw();this.report();
  }
  randomType(){return Math.floor(Math.random()*ICONS.length)}
  resetBoard(){
    this.board=Array.from({length:ROWS},()=>Array(COLS).fill(0));
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
      let t=this.randomType();
      while((c>1&&this.board[r][c-1]===t&&this.board[r][c-2]===t)||(r>1&&this.board[r-1][c]===t&&this.board[r-2][c]===t))t=this.randomType();
      this.board[r][c]=t;
    }
  }
  bind(){
    this.canvas.addEventListener('pointerdown',e=>{if(this.busy)return;this.down=this.cellAt(e);this.canvas.setPointerCapture?.(e.pointerId)});
    this.canvas.addEventListener('pointerup',e=>{
      if(this.busy||!this.down)return;const up=this.cellAt(e),down=this.down;this.down=null;
      let target=up;
      if(up&&up.r===down.r&&up.c===down.c){
        if(this.selected&&Math.abs(this.selected.r-down.r)+Math.abs(this.selected.c-down.c)===1){const a=this.selected;this.selected=null;this.trySwap(a,down);return}
        this.selected=this.selected&&this.selected.r===down.r&&this.selected.c===down.c?null:down;this.draw();return;
      }
      if(target&&Math.abs(target.r-down.r)+Math.abs(target.c-down.c)===1)this.trySwap(down,target);
    });
  }
  cellAt(e){
    const b=this.canvas.getBoundingClientRect();
    const c=Math.floor((e.clientX-b.left)/b.width*COLS),r=Math.floor((e.clientY-b.top)/b.height*ROWS);
    return r>=0&&r<ROWS&&c>=0&&c<COLS?{r,c}:null;
  }
  swap(a,b){const t=this.board[a.r][a.c];this.board[a.r][a.c]=this.board[b.r][b.c];this.board[b.r][b.c]=t}
  async trySwap(a,b){
    if(this.moves<=0)return;
    this.busy=true;this.swap(a,b);this.draw();await wait(110);
    if(!this.findMatches().length){this.swap(a,b);this.draw();this.busy=false;return}
    this.moves--;this.selected=null;await this.resolve();this.busy=false;this.report();
    if(this.yellow>=this.target)this.onWin?.({score:this.score,yellow:this.yellow});
  }
  findMatches(){
    const groups=[];
    for(let r=0;r<ROWS;r++){let s=0;for(let c=1;c<=COLS;c++){
      if(c<COLS&&this.board[r][c]===this.board[r][s])continue;
      if(c-s>=3)groups.push(Array.from({length:c-s},(_,i)=>({r,c:s+i})));s=c;
    }}
    for(let c=0;c<COLS;c++){let s=0;for(let r=1;r<=ROWS;r++){
      if(r<ROWS&&this.board[r][c]===this.board[s][c])continue;
      if(r-s>=3)groups.push(Array.from({length:r-s},(_,i)=>({r:s+i,c})));s=r;
    }}
    return groups;
  }
  async resolve(){
    let chain=1;
    while(true){
      const groups=this.findMatches();if(!groups.length)break;
      const cells=new Map();for(const g of groups)for(const p of g)cells.set(`${p.r},${p.c}`,p);
      let yellow=0;for(const p of cells.values())if(this.board[p.r][p.c]===0)yellow++;
      this.yellow+=yellow;this.score+=cells.size*25*chain;
      for(const p of cells.values())this.board[p.r][p.c]=null;
      this.flash=[...cells.values()];this.combo=chain;this.draw();await wait(140);
      this.flash=null;this.collapse();this.draw();await wait(150);chain++;
    }
  }
  collapse(){
    for(let c=0;c<COLS;c++){
      let w=ROWS-1;
      for(let r=ROWS-1;r>=0;r--)if(this.board[r][c]!=null)this.board[w--][c]=this.board[r][c];
      while(w>=0)this.board[w--][c]=this.randomType();
    }
  }
  report(){this.onState?.({moves:this.moves,yellow:this.yellow,target:this.target,score:this.score})}
  draw(){
    const x=this.ctx;x.clearRect(0,0,this.canvas.width,this.canvas.height);
    const grad=x.createLinearGradient(0,0,0,this.canvas.height);grad.addColorStop(0,'#446e5e');grad.addColorStop(1,'#2f554a');x.fillStyle=grad;x.fillRect(0,0,this.canvas.width,this.canvas.height);
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)this.drawTile(r,c);
    if(this.flash){x.fillStyle='rgba(255,246,167,.34)';for(const p of this.flash)x.fillRect(p.c*CELL,p.r*CELL,CELL,CELL)}
  }
  drawTile(r,c){
    const t=this.board[r][c],x=this.ctx,px=c*CELL,py=r*CELL;
    x.fillStyle='rgba(255,255,255,.08)';roundRect(x,px+3,py+3,CELL-6,CELL-6,12);x.fill();
    if(t==null)return;
    x.fillStyle=COLORS[t];roundRect(x,px+6,py+6,CELL-12,CELL-12,13);x.fill();
    x.fillStyle='rgba(255,255,255,.22)';roundRect(x,px+9,py+9,CELL-18,14,7);x.fill();
    x.font='30px "Segoe UI Emoji"';x.textAlign='center';x.textBaseline='middle';x.fillText(ICONS[t],px+CELL/2,py+CELL/2+2);
    if(this.selected&&this.selected.r===r&&this.selected.c===c){x.strokeStyle='#fff7ad';x.lineWidth=4;roundRect(x,px+4,py+4,CELL-8,CELL-8,14);x.stroke()}
  }
  restart(){this.moves=18;this.yellow=0;this.score=0;this.busy=false;this.selected=null;this.resetBoard();this.draw();this.report()}
}

function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
}
