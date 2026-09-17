import {DAY,SKILLS,dateKey} from './engine.js';
export const WORLDS=[
 {name:'Little Meadow',tag:'ONE SMALL STEP',desc:'Count the seeds. Find a path. Let new ideas bloom.',color:'#aee798',ink:'#285849',asset:'meadow.png',landmarks:['Firefly bridge','Daisy windmill','The wishing tree'],story:['Your first clear ideas light a bridge over the stream.','Steady practice turns the windmill. New paths lead onward.','Ideas remembered on different days bring the wishing tree into bloom.']},
 {name:'Canopy Grove',tag:'BUILD ON WHAT YOU KNOW',desc:'Bundle, group, and climb toward the treetops.',color:'#83dbc5',ink:'#17594e',asset:'canopy.png',landmarks:['Lantern trail','Sky elevator','Treetop library'],story:['Your number patterns light the way into the canopy.','Connected ideas lift a new platform into the branches.','Remembered ideas open the treetop library.']},
 {name:'Wonder Lagoon',tag:'A WHOLE SEA OF PIECES',desc:'Share fairly. Look deeper. Discover the whole.',color:'#8cdef5',ink:'#165673',asset:'lagoon.png',landmarks:['Pearl stepping stones','Coral arch','Glass reef'],story:['Your sharing discoveries reveal a trail of pearls.','Parts and wholes come together beneath a coral arch.','Remembered ideas illuminate the glass reef.']},
 {name:'Starlight Summit',tag:'WHERE NOVA BEGAN',desc:'Follow tiny details toward enormous discoveries.',color:'#c9b8ff',ink:'#534785',asset:'summit.png',landmarks:['Comet trail','Crystal telescope','Aurora observatory'],story:['This is where Nova first sparked. Your ideas light a comet trail.','Place value and precision focus the crystal telescope.','Remembered ideas fill the observatory with an aurora.']}
];
// The ordered journey gates access; prerequisite links still guide learning and review.
const n=(id,name,skill,world,grade,prereqs,icon)=>({id,name,skill,world,grade,prereqs,icon});
export const NODES=[
 n('count5','Count to 5','count',0,0,[],'●'),n('count20','Count to 20','count',0,0,['count5'],'••'),n('compare','Compare numbers','count',0,0,['count20'],'≷'),n('add10','Add within 10','add',0,0,['count5'],'+'),n('subtract10','Subtract within 10','subtract',0,0,['count5'],'−'),n('shapes','Shape detectives','geometry',0,0,[],'△'),
 n('tens','Tens & ones','place',1,1,['count20'],'10'),n('hundreds','Hundreds & tens','place',1,2,['tens'],'100'),n('add100','Add two-digit numbers','add',1,2,['tens','add10'],'++'),n('groups','Equal groups','multiply',1,1,['count20','add10'],'▦'),n('multiply','Multiplication facts','multiply',1,2,['groups','tens'],'×'),n('area','Rectangle area','geometry',1,3,['multiply','shapes'],'□'),
 n('share','Share equally','divide',2,1,['count20'],'÷'),n('divide','Division facts','divide',2,3,['share','multiply'],'÷'),n('halves','Halves & quarters','fraction',2,1,['shapes','share'],'½'),n('fractions','Name fractions','fraction',2,3,['halves'],'⅓'),n('equivalent','Equivalent fractions','fraction',2,4,['fractions','multiply'],'='),n('addFractions','Add like fractions','fraction',2,4,['fractions','add10'],'⅖'),
 n('length','Add lengths','measure',3,1,['add10'],'↔'),n('convert','Metres to centimetres','measure',3,3,['length','hundreds'],'cm'),n('tenths','Tenths of a whole','decimal',3,3,['fractions','tens'],'⅒'),n('decimals','Decimal place value','decimal',3,4,['tenths','hundreds'],'.1'),n('decimalAdd','Add decimal tenths','decimal',3,4,['decimals','add100'],'.+'),n('multiMultiply','Multiply larger numbers','multiply',3,4,['multiply','hundreds','add100'],'×10')
];
export const byNode=Object.fromEntries(NODES.map(n=>[n.id,n]));
export const INTERESTS=[{id:'nature',name:'Nature',icon:'🌿',thing:'seeds'},{id:'dinosaurs',name:'Dinosaurs',icon:'🦕',thing:'dinosaur eggs'},{id:'space',name:'Space',icon:'🚀',thing:'moon rocks'},{id:'ocean',name:'Ocean',icon:'🐚',thing:'shells'},{id:'building',name:'Building',icon:'🧱',thing:'blocks'}];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// Keep fluency evidence tied to the setting used for that attempt, not today's grade.
const fluentAttempt=a=>a.untimed||a.ms<=(a.fluencyLimitMs||45000);
export function evidence(state,id,now=Date.now()){
 const history=state.attempts.filter(a=>a.node===id&&a.at<=now).sort((a,b)=>a.at-b.at||String(a.eventId).localeCompare(String(b.eventId)));
 let stability=1,checks=0,lastReview=0,lastAt=0,level=1,peak=0;const batches=new Map(),seen=[];const forms=new Set();
 for(const a of history){seen.push(a);lastAt=a.at;const clean=a.ok&&!a.hint;if(clean)forms.add(a.form);if(a.review&&a.sessionId){const group=batches.get(a.sessionId)||[];group.push(a);batches.set(a.sessionId,group);if(group.length===3&&a.at-lastReview>=18*3600000){const pass=group.every(x=>x.ok&&!x.hint);const speed=group.filter(fluentAttempt).length/3;if(pass){checks++;stability=clamp(stability*(1.65+.7*speed)+.5,1,40);}else{checks=Math.max(0,checks-1);stability=Math.max(.7,stability*.48);}lastReview=a.at;}}
 const prior=seen.slice(-4);if(prior.length===4&&prior.every(x=>x.ok&&!x.hint))level=clamp(level+1,1,3);if(prior.slice(-3).filter(x=>!x.ok||x.hint).length>=2)level=clamp(level-1,1,3);
 const r=seen.slice(-8),good=r.filter(x=>x.ok&&!x.hint);const fluent=good.filter(fluentAttempt).length>=6;
 if(r.length>=8&&good.length>=7&&forms.size>=2&&fluent&&seen.some(x=>x.ok&&!x.hint&&x.level>=2))peak=Math.max(peak,checks>=3?3:checks>=1?2:1);
 }
 const recent=history.slice(-8),correct=recent.filter(a=>a.ok&&!a.hint),accuracy=recent.length?correct.length/recent.length:0;
 const fluent=correct.filter(fluentAttempt).length>=6;
 const variety=new Set(history.filter(a=>a.ok&&!a.hint).map(a=>a.form)).size;
 const solid=recent.length>=8&&correct.length>=7&&fluent&&variety>=2&&history.some(a=>a.ok&&!a.hint&&a.level>=2);
 const age=lastAt?Math.max(0,(now-lastAt)/DAY):0;const recall=Math.exp(-age/(stability*4));
 const fragile=history.length>=3&&history.slice(-3).filter(a=>!a.ok||a.hint).length>=2;
 const due=solid&&now-(lastReview||lastAt)>=18*3600000&&recall<.86;
 const earned=peak===3;const mastered=solid&&checks>=3&&!fragile&&recall>=.72;
 const confidence=history.length?clamp((correct.length/8)*(.65+.35*Math.min(variety/2,1))*recall,0,1):0;
 return {history,accuracy,solid,mastered,earned,peak,checks,stability,recall,fragile,due,confidence,lastAt,lastReview,level,reviewAt:lastAt?Math.max(lastAt-stability*4*DAY*Math.log(.86),(lastReview||lastAt)+18*3600000):null};
}
export function model(state,now=Date.now()){
 const nodes=Object.fromEntries(NODES.map(n=>[n.id,{...n,...evidence(state,n.id,now)}]));
 let firstIncomplete=null;
 NODES.forEach((node,index)=>{const n=nodes[node.id];n.order=index+1;n.previous=NODES[index-1]?.id||null;n.blockedBy=firstIncomplete;n.unlocked=firstIncomplete===null;n.complete=n.peak>0;if(!n.complete&&!firstIncomplete)firstIncomplete=n.id;});
 for(const n of Object.values(nodes)){
  n.support=NODES.filter(x=>x.prereqs.includes(n.id)).reduce((v,x)=>Math.max(v,nodes[x.id].confidence*.35),0);
  n.helps=NODES.filter(x=>x.prereqs.includes(n.id)&&nodes[x.id].fragile).map(x=>x.name);
  n.ready=n.unlocked&&n.prereqs.every(id=>nodes[id].solid&&nodes[id].recall>=.72);
  n.stage=!n.unlocked?'Locked':n.mastered?'Remembered':n.due||n.fragile?'Rekindle':n.solid?'Taking root':n.history.length?'Growing':n.ready?'Ready to explore':'A new horizon';
 }
 const ranked=Object.values(nodes).filter(n=>n.unlocked).map(n=>{
  const eligible=n.grade<=state.grade;let score=-100;
  if(n.helps.length&&!n.solid&&n.history.length)score=101;
  else if(n.due)score=110+(1-n.recall)*20;
  else if(n.fragile)score=95;
  else if(!n.solid&&n.history.length)score=65+(1-n.accuracy)*10;
  else if(n.ready&&!n.solid)score=55+(eligible?10:0)+n.grade;
  else if(n.support>.2&&!n.history.length)score=76;
  if(n.solid&&!n.due&&!n.fragile)score=-10;
  return {n,score};
 }).sort((a,b)=>b.score-a.score);
 const chosen=ranked[0]?.n||nodes.count5;
 const reason=chosen.helps.length&&!chosen.solid?`A little ${chosen.name.toLowerCase()} can help with ${chosen.helps[0].toLowerCase()}.`:chosen.due?'A short revisit will help this idea last.':chosen.fragile?'Let’s try a smaller step with a helpful picture.':chosen.support>.2&&!chosen.history.length?'Your connected ideas suggest this is worth a quick look.':chosen.prereqs.length&&chosen.ready?`Your ${nodes[chosen.prereqs[0]].name.toLowerCase()} ideas open this path.`:'A little discovery at your pace.';
 const worlds=WORLDS.map((w,i)=>{const ns=Object.values(nodes).filter(n=>n.world===i),milestones=ns.reduce((s,n)=>s+n.peak,0);return {...w,nodes:ns,milestones,unlocked:[1,6,12].filter(t=>milestones>=t).length,remembered:ns.filter(n=>n.mastered).length};});
 const earned=Object.values(nodes).filter(n=>n.earned).length,rooted=Object.values(nodes).filter(n=>n.peak>0).length;
 return {nodes,worlds,recommendation:chosen,reason,earned,rooted,glow:clamp((rooted+earned*2)/(NODES.length*3),0,1),fringe:Object.values(nodes).filter(n=>n.ready&&!n.solid),ranked};
}
export function nodeForSkill(state,skill,now=Date.now()){return model(state,now).ranked.find(x=>x.n.skill===skill)?.n.id||'count5';}
export function recordNode(state,{node,ok,hint,ms,form,review,sessionId,now=Date.now()}){
 const n=byNode[node];if(!n)throw Error('Unknown discovery');const s=evidence(state,node,now);
 const attempt={eventId:crypto.randomUUID(),id:n.skill,node,ok:!!ok,hint:!!hint,ms:Math.max(0,Math.round(ms)),at:now,level:s.level,form,review:!!review,recall:!!review,sessionId,untimed:!!state.untimed,fluencyLimitMs:state.grade<=1?45000:30000};state.attempts.push(attempt);return attempt;
}
export function interestFor(state,index=0){const allowed=state.nova?.interests||['nature'];return INTERESTS.find(x=>x.id===allowed[index%allowed.length])||INTERESTS[0];}
export function novaLine(kind,{index=0,interest='nature'}={}){const lines={welcome:['I’m Nova, your AI learning spark. Let’s find an interesting idea.','My glow grows with ideas you can use and remember.','I began at Starlight Summit. Every world has something to discover.'],correct:['You worked that one out. A new connection!','That answer fits. Can you picture why?','Your independent thinking made a little light.'],retry:['You stayed with it and tried again. That matters.','You changed your answer after a clue. That’s useful thinking.','A different try helped you find it.'],hint:['You used a clue to move forward. That’s a learning tool.','Let’s use the picture and build this together.'],wrong:['Interesting—let’s check it with a picture or a smaller step.','Let’s test another idea. A mistake gives us something to explore.'],review:['A tiny return trip! Let’s see what stayed with you.','One familiar idea, a new little quest.','Time to give an old discovery a fresh sparkle.']};return (lines[kind]||lines.welcome)[index%(lines[kind]||lines.welcome).length];}
export const EMOTIONAL_REDIRECT='I’m an AI learning spark, so I can help with math, but I’m not a person who can care for you. Please tell a parent, teacher, or another grown-up you trust how you’re feeling. You can take a break here whenever you want.';
