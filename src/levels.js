const cells=(...pairs)=>pairs.map(([r,c])=>({r,c}));

export const LEVELS=[
  {id:1,name:'Sunny Border',moves:20,stat:'SUNFLOWERS',hint:'Collect sunflowers to wake up the sunny border.',
    objective:{kind:'collect',type:0,target:12},reward:{item:'milkweed',name:'Milkweed cutting',icon:'🌿',sunshine:50}},
  {id:2,name:'Watering Day',moves:22,stat:'WATER',hint:'Collect water drops for the thirsty flower beds.',
    objective:{kind:'collect',type:2,target:16},reward:{item:'wateringCan',name:'Watering can',icon:'💧',sunshine:50}},
  {id:3,name:'Berry Picnic',moves:22,stat:'BERRIES',hint:'Gather strawberries for Ellie and Gigi’s picnic.',
    objective:{kind:'collect',type:4,target:18},reward:{item:'strawberryBed',name:'Strawberry bed',icon:'🍓',sunshine:50}},
  {id:4,name:'First Flight',moves:28,stat:'BUTTERFLY',hint:'Make four caterpillars, then tap the Butterfly power.',
    objective:{kind:'useSpecial',type:1,target:1},reward:{item:'nettles',name:'Nettle cutting',icon:'🌿',sunshine:60}},
  {id:5,name:'Weed the Path',moves:24,stat:'WEEDS',hint:'Make matches over every weedy patch to clear the path.',
    objective:{kind:'weeds',target:12,cells:cells([1,1],[1,4],[1,7],[3,2],[3,6],[4,4],[5,1],[5,7],[7,2],[7,4],[7,6],[8,8])},
    reward:{item:'yellowBench',name:'Yellow garden bench',icon:'🪑',sunshine:60}},  {id:6,name:'Pocket Sunshine',moves:32,stat:'SUNS',hint:'Create and use two Sun powers to brighten the corner.',
    objective:{kind:'useSpecial',type:0,target:2},reward:{item:'hyacinths',name:'Purple hyacinths',icon:'🪻',sunshine:60}},
  {id:7,name:'Seed Delivery',moves:30,stat:'SEEDS',hint:'Clear below the seed packets until both reach the bottom.',
    objective:{kind:'drop',target:2,drops:cells([0,2],[0,6])},reward:{item:'wildflowerSeeds',name:'Wildflower seeds',icon:'🌱',sunshine:70}},
  {id:8,name:'Caterpillar Rescue',moves:24,stat:'RESCUED',hint:'Clear beside the webbed caterpillars to free them.',
    objective:{kind:'rescue',target:4,cells:cells([2,2],[2,6],[6,2],[6,6])},reward:{item:'bugHotel',name:'Little bug hotel',icon:'🏡',sunshine:70}},
  {id:9,name:'Rainy Afternoon',moves:32,stat:'RAIN',hint:'Make four water drops and use Rain twice.',
    objective:{kind:'useSpecial',type:2,target:2},reward:{item:'pondStones',name:'Pond stepping stones',icon:'🪨',sunshine:70}},
  {id:10,name:'Bloom the Entrance',moves:28,stat:'FLOWERS',hint:'Make matches over the soil beds until the entrance blooms.',
    objective:{kind:'bloom',target:14,cells:cells([0,1],[0,3],[0,5],[0,7],[2,0],[2,2],[2,6],[2,8],[5,0],[5,4],[5,8],[8,2],[8,4],[8,6])},
    reward:{item:'gardenArch',name:'Sanctuary garden arch',icon:'🌸',sunshine:100}}
];

export const FREE_PLAY={id:'free',name:'Garden Free Play',moves:30,stat:'SCORE',hint:'Relax, make powers and see how high you can score.',objective:{kind:'score',target:5000},reward:{name:'25 Sunshine',icon:'☀️',sunshine:25}};
export const getLevel=index=>index<LEVELS.length?LEVELS[index]:FREE_PLAY;
