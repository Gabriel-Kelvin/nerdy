export const SKILLS=[
 {id:'count',name:'Counting',symbol:'123',world:'Meadow',min:0,desc:'Every little thing counts.'},
 {id:'add',name:'Addition',symbol:'+',world:'Meadow',min:0,desc:'Bring good things together.'},
 {id:'subtract',name:'Subtraction',symbol:'−',world:'Meadow',min:0,desc:'Discover what stays behind.'},
 {id:'place',name:'Place value',symbol:'10',world:'Canopy',min:1,desc:'Little digits. Big possibilities.'},
 {id:'multiply',name:'Multiplication',symbol:'×',world:'Canopy',min:2,desc:'Find the magic in groups.'},
 {id:'divide',name:'Division',symbol:'÷',world:'Canopy',min:2,desc:'A fair share for everyone.'},
 {id:'fraction',name:'Fractions',symbol:'½',world:'Lagoon',min:3,desc:'Little pieces of a bigger picture.'},
 {id:'geometry',name:'Geometry',symbol:'△',world:'Lagoon',min:0,desc:'See the shapes around you.'},
 {id:'measure',name:'Measurement',symbol:'↔',world:'Lagoon',min:1,desc:'Size up a new discovery.'},
 {id:'decimal',name:'Decimals',symbol:'.1',world:'Summit',min:4,desc:'Explore between whole numbers.'}
];
export const DAY=86400000;
export const dateKey=(t=Date.now())=>{const d=new Date(t);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
export function fresh(){return {version:1,name:'Explorer',grade:1,avatar:'🌱',seeds:0,days:[],sessions:[],skills:{},attempts:[],sound:false,untimed:false,nova:{introduced:false,interests:['nature']}};}
export function skillState(state,id){return state.skills[id]??{level:Math.min(4,Math.max(1,state.grade)),history:[],checks:0,due:null,started:null};}
export function status(s){if(s.checks>=3)return 'Remembered';if(s.due)return 'Ready for recall';if(s.history.length)return 'Growing';return 'Not explored';}
export function progress(s){return s.checks>=3?100:s.due?55+s.checks*15:Math.min(50,s.history.filter(a=>a.ok&&!a.hint).length*6);}
const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const shuffle=a=>a.sort(()=>Math.random()-.5);
export function problem(id,level,grade=1){
 let a,b,answer,display,prompt,hint,visual=null,choices=null;const cap=[5,10,20,50,100][level-1];
 switch(id){
 case 'count':a=rand(1,Math.min(20,cap));answer=a;display='';prompt='How many seeds?';hint='Touch each seed once as you count. The last number tells you how many.';visual={type:'count',a};break;
 case 'add':a=rand(1,cap);b=rand(1,cap);if(grade===0){a=rand(1,5);b=rand(1,5)}if(grade>=3&&level>=3){a=rand(100,999);b=rand(100,999)}answer=a+b;display=`${a} + ${b} = ?`;prompt='Help Pip gather the seeds.';hint=a>99?'Line up the ones, tens, and hundreds. Add each column from right to left. Trade 10 for 1 in the next column when needed.':`Start at ${a}. Count ${b} more, one at a time.`;if(answer<=20)visual={type:'add',a,b};break;
 case 'subtract':a=rand(2,cap);b=rand(1,a);answer=a-b;display=`${a} − ${b} = ?`;prompt='How many seeds are left?';hint=`Start with ${a}. Take away ${b}. You can count backwards ${b} steps.`;if(a<=20)visual={type:'subtract',a,b};break;
 case 'place':a=rand(1,9);b=rand(0,9);answer=a*10+b;display=`${a} tens + ${b} ones`;prompt='Build Pip’s number.';hint=`Each ten is a group of 10. ${a} tens is ${a*10}; add the ${b} ones.`;if(level>=4){a=rand(1,9);b=rand(1,9)*10;answer=a*100+b;display=`${a} hundreds + ${b/10} tens`;hint=`${a} hundreds is ${a*100}. ${b/10} tens is ${b}. Put them together.`}break;
 case 'multiply':a=rand(2,Math.min(12,level*2+2));b=rand(2,Math.min(12,level*2+2));if(grade>=4&&level>=4){a=rand(12,49);b=rand(2,grade>=5?19:9)}answer=a*b;display=`${a} × ${b} = ?`;prompt='Grow equal groups of seeds.';hint=a>=12?`Split ${a} into ${Math.floor(a/10)*10} and ${a%10}. Multiply each part by ${b}, then add the results.`:`Make ${a} groups with ${b} in each. Add ${Array(a).fill(b).join(' + ')}.`;if(a*b<=30)visual={type:'groups',a,b};break;
 case 'divide':b=rand(2,Math.min(12,level*2+2));answer=rand(1,Math.min(12,level*2+2));a=b*answer;display=`${a} ÷ ${b} = ?`;prompt='Share equally with Pip’s friends.';hint=`Share ${a} seeds into ${b} equal groups. Or ask: ${b} times what makes ${a}?`;break;
 case 'fraction':b=[2,3,4,6,8][rand(0,Math.min(4,level-1))];a=rand(1,b-1);answer=`${a}/${b}`;display='';prompt='What fraction is green?';hint=`There are ${b} equal pieces. Count the green pieces for the top number. The total pieces go on the bottom.`;visual={type:'fraction',a,b};choices=shuffle([...new Set([answer,`${b-a===a?0:b-a}/${b}`,`${a}/${b+1}`,`${b}/${b}`])]);if(grade>=4&&level>=4){b=[4,6,8,10][rand(0,3)];a=rand(1,b/2-1);const other=rand(1,b/2);answer=`${a+other}/${b}`;display=`${a}/${b} + ${other}/${b} = ?`;prompt='Join the pieces of Pip’s garden.';hint='The pieces have the same size, so keep the bottom number and add the top numbers.';visual=null;choices=shuffle([answer,`${a+other}/${b*2}`,`${a+other+1}/${b}`,`${Math.max(0,a-other)}/${b}`]);}break;
 case 'geometry':{const shape=['triangle','square','rectangle'][rand(0,2)];answer=shape==='triangle'?3:4;display='';prompt='How many sides does this shape have?';hint='Trace the outside. Count each straight edge once.';visual={type:'shape',shape};choices=shuffle([3,4,5,6]);if(grade>=3&&level>=3){a=rand(2,12);b=rand(2,10);answer=a*b;display=`${a} cm × ${b} cm`;prompt='What is the area of this rectangle?';hint=`Area counts the square units inside. Multiply length ${a} by width ${b}.`;visual={type:'shape',shape:'rectangle'};choices=null;}break;}
 case 'measure':a=rand(1,level*3);b=rand(1,level*3);answer=a+b;display=`${a} cm + ${b} cm = ?`;prompt='How long is Pip’s new path in cm?';hint=`Join a ${a} cm path to a ${b} cm path. Add the two lengths.`;if(grade>=3&&level>=3){a=rand(1,9);answer=a*100;display=`${a} m = ? cm`;prompt='Measure the bridge in centimetres.';hint='One metre contains 100 centimetres. Make one group of 100 for each metre.'}break;
 case 'decimal':a=rand(1,30);b=rand(1,20);answer=Number(((a+b)/10).toFixed(1));display=`${(a/10).toFixed(1)} + ${(b/10).toFixed(1)} = ?`;prompt='Add the lengths of Pip’s ribbons.';hint=`Think in tenths: ${a} tenths + ${b} tenths. Ten tenths make one whole.`;break;
 }
 if(!choices){const set=new Set([answer]);let safety=0;while(set.size<4&&safety++<100){let v=id==='decimal'?Number((answer+rand(-5,5)/10).toFixed(1)):answer+rand(-Math.max(3,Math.ceil(answer*.25)),Math.max(3,Math.ceil(answer*.25)));if(v>=0)set.add(v);}choices=shuffle([...set]);}
 return {id,answer,display,prompt,hint,visual,choices};
}
export function record(state,{id,ok,hint,ms,recall,now=Date.now()}){
 const s=skillState(state,id);state.skills[id]=s;const attempt={eventId:crypto.randomUUID(),id,ok,hint,ms:Math.round(ms),at:now,level:s.level,recall};s.started??=now;s.history.push(attempt);s.history=s.history.slice(-40);state.attempts.push(attempt);s.updatedAt=now;
 const recent=s.history.slice(-8),clean=recent.filter(a=>a.ok&&!a.hint),fluent=state.untimed||clean.filter(a=>a.ms<=(state.grade<=1?45000:30000)).length>=6;
 if(!ok||hint){if(recall){s.due=now+DAY;}if(s.history.slice(-3).filter(a=>!a.ok).length>=2)s.level=Math.max(1,s.level-1);}
 else if(s.history.length%4===0&&s.history.slice(-4).every(a=>a.ok&&!a.hint)){s.level=Math.min(5,s.level+1);}
 if(!s.due&&recent.length>=8&&clean.length>=7&&fluent)s.due=now+DAY;
 return attempt;
}
export function finishRecall(state,id,results,now=Date.now()){
 const s=state.skills[id];if(!s||results.length<3)return;s.updatedAt=now;
 if(results.every(a=>a.ok&&!a.hint)){s.checks=Math.min(3,s.checks+1);s.due=now+[DAY,3*DAY,7*DAY,14*DAY][s.checks];}else{s.checks=Math.max(0,s.checks-1);s.due=now+DAY;}
}
export function pickSkill(state){const eligible=SKILLS.filter(s=>s.min<=state.grade);const due=eligible.filter(s=>{const p=skillState(state,s.id);return p.due&&p.due<=Date.now()}).sort((a,b)=>skillState(state,a.id).due-skillState(state,b.id).due);if(due.length)return due[0].id;return eligible.sort((a,b)=>{const sa=skillState(state,a.id),sb=skillState(state,b.id);return (sa.due?100:sa.history.length)-(sb.due?100:sb.history.length)})[0].id;}
