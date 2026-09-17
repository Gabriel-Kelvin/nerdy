import assert from 'node:assert/strict';
import {fresh} from '../dist/engine.js';
import {NODES,model} from '../dist/constellation.js';
import {novaProblem} from '../dist/nova-problems.js';
import {starsFor,QuestionClock,TREASURES,treasureState} from '../dist/journey.js';
import {coachingFacts,validCoaching} from '../dist/coaching.js';
import {OBJECTS,objectGroup} from '../dist/math-objects.js';
assert.deepEqual([0,1,2,3,4,5,6].map(n=>starsFor(n)),[0,0,0,1,1,2,3]);
let samples=0;const objects=new Set();for(const n of NODES)for(let index=0;index<6;index++)for(let seed=0;seed<25;seed++){
 const q=novaProblem({...fresh(),grade:0,untimed:true},n.id,index,Date.now(),seed),again=novaProblem({...fresh(),grade:5},n.id,index,1,seed);
 assert.deepEqual(q,again);assert([30,40,45,60].includes(q.timeLimit));assert.equal(q.level,[1,1,2,2,3,3][index]);assert(q.choices.includes(q.answer));assert(!/NaN|undefined/.test(q.worked));assert.notEqual(q.hint,q.worked);const bad=q.choices.find(x=>x!==q.answer);const a=coachingFacts(q,{mode:'wrong',selected:bad,step:0}),b=coachingFacts(q,{mode:'hint',step:1});assert(a.reply.includes(String(bad)));assert(b.reply.includes(q.worked));assert(validCoaching(a.reply,a));assert(!validCoaching('There are 99999 eggs.',a));objects.add(q.object);samples++;
 if(q.node.startsWith('count')&&q.visual){assert(q.prompt.includes(OBJECTS[q.object].many));assert.equal((objectGroup(q.visual.a,q.object).match(/data-object=/g)||[]).length,q.visual.a);assert(!q.hint.includes('dot'));}
}
assert.equal(objects.size,10);
const state=fresh();state.sessions.push({node:'count5',total:6,correct:2});assert.equal(model(state).nodes.count20.unlocked,false);state.sessions.push({node:'count5',total:6,correct:3});assert.equal(model(state).nodes.count20.unlocked,true);assert.equal(model(state).nodes.count5.stars,1);state.sessions.push({node:'count5',total:6,correct:6},{node:'count5',total:6,correct:0});assert.equal(model(state).nodes.count5.stars,3);assert.equal(model(state).nodes.count5.mastered,false);assert(treasureState(TREASURES.find(t=>t.level===1),model(state)).earned);assert(!treasureState(TREASURES.find(t=>t.level===3),model(state)).earned);
for(const n of NODES)state.sessions.push({node:n.id,total:6,correct:6});assert.equal(model(state).totalStars,72);assert(TREASURES.every(t=>treasureState(t,model(state)).earned));
let time=0,paused=false,expired=0,cancelled=0,tick,remaining;const clock=new QuestionClock(30,n=>remaining=n,()=>expired++,{now:()=>time,schedule:fn=>{tick=fn;return 1;},cancel:()=>cancelled++,isPaused:()=>paused});time=10000;tick();assert.equal(remaining,20);paused=true;time=60000;tick();assert.equal(remaining,20);paused=false;time=79000;tick();assert.equal(remaining,1);time=80000;tick();assert.equal(expired,1);assert.equal(cancelled,1);tick();assert.equal(expired,1);
console.log(`Passed: ${samples} reproducible questions, all ten matching objects, fixed difficulty/timing across grades, question-specific coaching, star boundaries, immediate sequential unlock, best-score preservation, all treasure goals, timer pause and one-time expiry.`);
