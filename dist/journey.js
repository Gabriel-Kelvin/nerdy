export function starsFor(correct,total=6){if(!Number.isFinite(correct)||total<=0)return 0;return correct>=total?3:correct/total>=.8?2:correct/total>=.5?1:0;}
export function bestStars(state,node,legacyPeak=0){return Math.max(legacyPeak>0?1:0,...(state.sessions||[]).filter(s=>s.node===node&&s.total===6).map(s=>starsFor(s.correct,s.total)));}
export const questionLevel=index=>[1,1,2,2,3,3][Math.max(0,Math.min(5,index))];
export function questionSeconds(node){return ['count5','shapes','compare'].includes(node)?30:['count20','add10','subtract10','tens','halves','fractions','tenths','decimals'].includes(node)?40:['hundreds','groups','multiply','area','share','divide','length','convert'].includes(node)?45:60;}
export const TREASURES=[
 {icon:'🌱',name:'Little sprout',world:0,level:0,tier:'Your first companion',desc:'A little green beginning.'},
 {icon:'🦊',name:'Ember the fox',world:0,level:1,tier:'Meadow companion',desc:'A curious tail for your very first trail.'},
 {icon:'🐸',name:'Ripple the frog',world:0,level:3,tier:'Meadow companion',desc:'A pond-hopping partner with enormous dreams.'},
 {icon:'🦋',name:'Dawnwing',world:0,level:6,tier:'World guardian',desc:'Six meadow discoveries bring these wings to life.'},
 {icon:'🐿️',name:'Pocket the squirrel',world:1,level:7,tier:'Canopy companion',desc:'A collector of acorns and clever little ideas.'},
 {icon:'🦉',name:'Luma the owl',world:1,level:9,tier:'Canopy companion',desc:'Your lantern-eyed lookout among the branches.'},
 {icon:'🦜',name:'Prism parrot',world:1,level:12,tier:'World guardian',desc:'A whole canopy of color, earned one level at a time.'},
 {icon:'🐢',name:'Tide the turtle',world:2,level:13,tier:'Lagoon companion',desc:'A gentle explorer of the great blue beyond.'},
 {icon:'🐙',name:'Inky',world:2,level:15,tier:'Lagoon companion',desc:'Eight arms, endless curiosity.'},
 {icon:'🐬',name:'Moonwake',world:2,level:18,tier:'World guardian',desc:'A silver leap across the lagoon you have explored.'},
 {icon:'🦄',name:'Comet',world:3,level:19,tier:'Summit companion',desc:'A trail of stardust follows every new discovery.'},
 {icon:'🦚',name:'Aurora plume',world:3,level:21,tier:'Summit companion',desc:'A sky full of colors, tucked into one feathered friend.'},
 {icon:'🐉',name:'Nova’s star dragon',world:3,level:24,tier:'Journey guardian',desc:'The guardian waiting at the end of all four worlds.'},
 ...['🌼','🍃','🐚','💎'].map((icon,world)=>({icon,name:['Sunflower crown','Emerald crown','Pearl crown','Starlight crown'][world],world,level:(world+1)*6,crown:true,tier:'Three-star collection',desc:'Earn all 18 stars in this world to wear its crown.'}))
];
export function treasureState(t,m){const ns=m.worlds[t.world].nodes;const earned=t.crown?ns.every(n=>n.stars===3):t.level===0||Object.values(m.nodes).some(n=>n.order===t.level&&n.complete&&n.unlocked);const current=t.crown?ns.reduce((n,s)=>n+s.stars,0):Object.values(m.nodes).filter(n=>n.complete&&n.order<=t.level&&n.unlocked).length;return {earned,current,target:t.crown?18:t.level};}
export function starMarkup(stars,extra=''){return `<span class="level-stars ${extra}" aria-label="${stars} of 3 stars">${[1,2,3].map(i=>`<span class="${i<=stars?'earned':''}" aria-hidden="true">★</span>`).join('')}</span>`;}
export class QuestionClock{
 constructor(seconds,onTick,onExpire,{now=()=>performance.now(),schedule=f=>setInterval(f,200),cancel=id=>clearInterval(id),isPaused=()=>false}={}){Object.assign(this,{seconds,onTick,onExpire,now,cancel,isPaused});this.elapsed=0;this.last=now();this.stopped=false;this.id=schedule(()=>this.tick());onTick(seconds);}
 tick(){if(this.stopped)return;const time=this.now();if(!this.isPaused())this.elapsed+=Math.max(0,time-this.last);this.last=time;const remaining=Math.max(0,this.seconds-Math.floor(this.elapsed/1000));this.onTick(remaining);if(this.elapsed>=this.seconds*1000){this.stop();this.onExpire();}}
 stop(){this.stopped=true;this.cancel(this.id);return Math.min(this.seconds*1000,this.elapsed);}
}
