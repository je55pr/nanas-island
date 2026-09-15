export const TILE_ICONS=['🌻','🌺','🍃','💧','🫐','🐚'];
export const TILE_COLORS=['#f6c83d','#ef6a82','#65b96f','#54b8d1','#7067b8','#efb879'];
const COLS=9,ROWS=9;
const wait=ms=>new Promise(r=>setTimeout(r,ms));

export class Match3Model{
  constructor(onChange,onWin){
    this.onChange=onChange;this.onWin=onWin;this.board=[];
    this.moves=18;this.yellow=0;this.target=12;this.score=0;
    this.busy=false;this.selected=null;this.flash=[];this.combo=0;this.rewarded=false;
    this.resetBoard();this.report();
  }
  randomType(){return Math.floor(Math.random()*TILE_ICONS.length)}
  resetBoard(){
    this.board=Array.from({length:ROWS},()=>Array(COLS).fill(0));
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
      let t=this.randomType();
      while((c>1&&this.board[r][c-1]===t&&this.board[r][c-2]===t)||(r>1&&this.board[r-1][c]===t&&this.board[r-2][c]===t))t=this.randomType();
      this.board[r][c]=t;
    }
  }
  isAdjacent(a,b){return !!a&&!!b&&Math.abs(a.r-b.r)+Math.abs(a.c-b.c)===1}
  swap(a,b){const t=this.board[a.r][a.c];this.board[a.r][a.c]=this.board[b.r][b.c];this.board[b.r][b.c]=t}
  select(cell){
    if(this.busy||this.moves<=0)return;
    if(this.selected&&this.isAdjacent(this.selected,cell)){
      const from=this.selected;this.selected=null;this.trySwap(from,cell);return;
    }
    this.selected=this.selected&&this.selected.r===cell.r&&this.selected.c===cell.c?null:cell;
    this.report();
  }
  async swipe(from,to){
    if(this.busy||this.moves<=0||!this.isAdjacent(from,to))return;
    this.selected=null;await this.trySwap(from,to);
  }
  async trySwap(a,b){
    this.busy=true;this.swap(a,b);this.report();await wait(95);
    if(!this.findMatches().length){this.swap(a,b);this.busy=false;this.report();return}
    this.moves--;await this.resolve();this.busy=false;this.report();
    if(this.yellow>=this.target)this.onWin?.();
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
      for(const p of cells.values())if(this.board[p.r][p.c]===0)this.yellow++;
      this.score+=cells.size*25*chain;this.flash=[...cells.values()];this.combo=chain;
      for(const p of cells.values())this.board[p.r][p.c]=null;
      this.report();await wait(120);this.flash=[];this.collapse();this.report();await wait(135);chain++;
    }
  }
  collapse(){
    for(let c=0;c<COLS;c++){
      let w=ROWS-1;
      for(let r=ROWS-1;r>=0;r--)if(this.board[r][c]!=null)this.board[w--][c]=this.board[r][c];
      while(w>=0)this.board[w--][c]=this.randomType();
    }
  }
  report(){this.onChange?.({moves:this.moves,yellow:this.yellow,target:this.target,score:this.score})}
  restart(){
    this.moves=18;this.yellow=0;this.score=0;this.busy=false;this.selected=null;
    this.flash=[];this.combo=0;this.rewarded=false;this.resetBoard();this.report();
  }
}

export const MATCH_COLS=COLS;
export const MATCH_ROWS=ROWS;
