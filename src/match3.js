export const TILE_ICONS=['🌻','🐛','💧','🪻','🍓','🍃'];
export const TILE_COLORS=['#f6c83d','#f2c28d','#54b8d1','#9a78d0','#e96162','#65b96f'];
export const TILE_NAMES=['Sunflower','Caterpillar','Water','Hyacinth','Strawberry','Leaf'];
export const SPECIAL_ICONS=['☀️','🦋','🌧️','🍇','🥣','🌳'];
export const SPECIAL_NAMES=['Sun','Butterfly','Rain','Grapes','Fruit salad','Tree'];
const COLS=9,ROWS=9;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const key=p=>`${p.r},${p.c}`;
const tile=type=>({type,special:false});
const special=type=>({type,special:true});

export class Match3Model{
  constructor(onChange,onWin){
    this.onChange=onChange;this.onWin=onWin;this.board=[];
    this.moves=18;this.yellow=0;this.target=12;this.score=0;
    this.busy=false;this.selected=null;this.flash=[];this.combo=0;
    this.rewarded=false;this.effect=null;this.resetBoard();this.report();
  }
  randomType(){return Math.floor(Math.random()*TILE_ICONS.length)}
  randomTile(){return tile(this.randomType())}
  baseType(cell){return cell&&!cell.special?cell.type:null}
  resetBoard(){
    this.board=Array.from({length:ROWS},()=>Array(COLS).fill(null));
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
      let t=this.randomType();
      while((c>1&&this.baseType(this.board[r][c-1])===t&&this.baseType(this.board[r][c-2])===t)||(r>1&&this.baseType(this.board[r-1][c])===t&&this.baseType(this.board[r-2][c])===t))t=this.randomType();
      this.board[r][c]=tile(t);
    }
  }
  isAdjacent(a,b){return !!a&&!!b&&Math.abs(a.r-b.r)+Math.abs(a.c-b.c)===1}
  cellAt(p){return this.board[p.r]?.[p.c]??null}
  swap(a,b){const t=this.board[a.r][a.c];this.board[a.r][a.c]=this.board[b.r][b.c];this.board[b.r][b.c]=t}
  select(cell){
    if(this.busy)return;
    const current=this.cellAt(cell);if(current?.special){this.selected=null;this.activateSpecial(cell);return}
    if(this.moves<=0)return;
    if(this.selected&&this.isAdjacent(this.selected,cell)){
      const from=this.selected;this.selected=null;this.trySwap(from,cell);return;
    }
    this.selected=this.selected&&this.selected.r===cell.r&&this.selected.c===cell.c?null:cell;this.report();
  }
  async swipe(from,to){
    if(this.busy||!this.isAdjacent(from,to))return;
    if(this.cellAt(from)?.special){this.selected=null;await this.activateSpecial(from);return}
    if(this.moves<=0)return;
    this.selected=null;await this.trySwap(from,to);
  }
  async trySwap(a,b){
    this.busy=true;this.swap(a,b);this.report();await wait(90);
    if(!this.findMatches().length){this.swap(a,b);this.busy=false;this.report();return}
    this.moves--;await this.resolve([a,b]);this.busy=false;this.report();
    if(this.yellow>=this.target)this.onWin?.();
  }
  findMatches(){
    const groups=[];
    for(let r=0;r<ROWS;r++){
      let s=0;for(let c=1;c<=COLS;c++){
        const a=c<COLS?this.baseType(this.board[r][c]):null,b=this.baseType(this.board[r][s]);
        if(c<COLS&&a!==null&&a===b)continue;
        if(b!==null&&c-s>=3)groups.push(Array.from({length:c-s},(_,i)=>({r,c:s+i})));
        s=c;
      }
    }
    for(let c=0;c<COLS;c++){
      let s=0;for(let r=1;r<=ROWS;r++){
        const a=r<ROWS?this.baseType(this.board[r][c]):null,b=this.baseType(this.board[s]?.[c]);
        if(r<ROWS&&a!==null&&a===b)continue;
        if(b!==null&&r-s>=3)groups.push(Array.from({length:r-s},(_,i)=>({r:s+i,c})));
        s=r;
      }
    }
    return groups;
  }
  async resolve(preferred=null){
    let chain=1,prefer=preferred;
    while(true){
      const groups=this.findMatches();if(!groups.length)break;
      const matched=new Map(),kept=new Map();
      for(const group of groups){
        for(const p of group)matched.set(key(p),p);
        if(group.length>=4){
          const prefs=Array.isArray(prefer)?prefer:(prefer?[prefer]:[]);
          const chosen=prefs.find(q=>group.some(p=>key(p)===key(q)))||group[Math.floor((group.length-1)/2)];
          const t=this.cellAt(chosen)?.type;if(t!=null)kept.set(key(chosen),{p:chosen,type:t});
        }
      }
      const cleared=[...matched.values()].filter(p=>!kept.has(key(p)));
      this.countAndScore(cleared,chain);this.flash=cleared;this.combo=chain;
      for(const p of cleared)this.board[p.r][p.c]=null;
      for(const {p,type} of kept.values())this.board[p.r][p.c]=special(type);
      this.report();await wait(145);this.flash=[];this.collapse();this.report();await wait(135);
      chain++;prefer=null;
    }
  }
  countAndScore(cells,mult=1){
    for(const p of cells){const t=this.cellAt(p);if(t?.type===0)this.yellow++}
    this.score+=cells.length*25*mult;
  }
  vinePath(origin){
    const out=[],seen=new Set();let r=origin.r,c=origin.c,dir=c<COLS/2?1:-1,vert=r<ROWS/2?1:-1;
    for(let i=0;i<15;i++){
      const p={r,c};if(!seen.has(key(p))){seen.add(key(p));out.push(p)}
      if(i%4===3&&r+vert>=0&&r+vert<ROWS){r+=vert;dir*=-1;continue}
      const nc=c+dir;if(nc>=0&&nc<COLS)c=nc;
      else if(r+vert>=0&&r+vert<ROWS){r+=vert;dir*=-1}else{vert*=-1;r=Math.max(0,Math.min(ROWS-1,r+vert))}
    }
    return out;
  }
  specialTargets(origin,type){
    const cells=[];
    if(type===0){
      for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){
        const r=origin.r+dr,c=origin.c+dc;if(r>=0&&r<ROWS&&c>=0&&c<COLS)cells.push({r,c});
      }
    }else if(type===1){
      for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(this.board[r][c]?.type===5)cells.push({r,c});
      cells.push(origin);
    }else if(type===2){
      for(let r=0;r<ROWS;r++)cells.push({r,c:origin.c});
    }else if(type===3){
      return this.vinePath(origin);
    }else if(type===4){
      for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(this.board[r][c]?.type===1)cells.push({r,c});
      cells.push(origin);
    }else if(type===5){
      for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(this.board[r][c]?.type===2)cells.push({r,c});
      cells.push(origin);
    }
    const unique=new Map();for(const p of cells)unique.set(key(p),p);return [...unique.values()];
  }
  async activateSpecial(origin){
    const source=this.cellAt(origin);if(this.busy||!source?.special)return;
    this.busy=true;this.selected=null;const targets=this.specialTargets(origin,source.type);
    this.effect={type:source.type,origin,path:targets};this.flash=targets;this.report();await wait(source.type===3?340:240);
    this.countAndScore(targets,2);for(const p of targets)this.board[p.r][p.c]=null;
    this.report();await wait(105);this.flash=[];this.effect=null;this.collapse();this.report();await wait(135);
    await this.resolve();this.busy=false;this.report();if(this.yellow>=this.target)this.onWin?.();
  }
  collapse(){
    for(let c=0;c<COLS;c++){
      let w=ROWS-1;for(let r=ROWS-1;r>=0;r--)if(this.board[r][c]!=null)this.board[w--][c]=this.board[r][c];
      while(w>=0)this.board[w--][c]=this.randomTile();
    }
  }
  report(){this.onChange?.({moves:this.moves,yellow:this.yellow,target:this.target,score:this.score})}
  restart(){
    this.moves=18;this.yellow=0;this.score=0;this.busy=false;this.selected=null;this.flash=[];this.combo=0;this.rewarded=false;this.effect=null;this.resetBoard();this.report();
  }
}

export const MATCH_COLS=COLS;
export const MATCH_ROWS=ROWS;
