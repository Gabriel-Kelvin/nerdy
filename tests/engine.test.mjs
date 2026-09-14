import assert from 'node:assert/strict';
import {SKILLS,problem,fresh,record,finishRecall,skillState,status,DAY} from '../dist/engine.js';
let samples=0;
for(const s of SKILLS)for(let grade=0;grade<=5;grade++)for(let level=1;level<=5;level++)for(let n=0;n<100;n++){
 const p=problem(s.id,level,grade);assert.equal(p.choices.length,4,`${s.id}: four answers`);assert.equal(new Set(p.choices).size,4);assert(p.choices.includes(p.answer));assert(p.prompt&&p.hint);if(typeof p.answer==='number')assert(Number.isFinite(p.answer)&&p.answer>=0);samples++;
}
const state=fresh(),now=Date.now();
for(let i=0;i<8;i++)record(state,{id:'add',ok:true,hint:false,ms:10000,recall:false,now:now+i});
assert.equal(state.skills.add.checks,0);assert(state.skills.add.due>=now+DAY);assert.notEqual(status(state.skills.add),'Remembered');
for(let i=0;i<3;i++){const due=state.skills.add.due;finishRecall(state,'add',[{ok:true,hint:false},{ok:true,hint:false},{ok:true,hint:false}],due)}
assert.equal(status(state.skills.add),'Remembered');
finishRecall(state,'add',[{ok:false,hint:false},{ok:true,hint:false},{ok:true,hint:false}],state.skills.add.due);assert.equal(state.skills.add.checks,2);
const helped=fresh();for(let i=0;i<20;i++)record(helped,{id:'add',ok:true,hint:true,ms:100,now:now+i});assert.equal(skillState(helped,'add').due,null);
const slow=fresh();for(let i=0;i<8;i++)record(slow,{id:'add',ok:true,hint:false,ms:99999,now:now+i});assert.equal(slow.skills.add.due,null);slow.untimed=true;record(slow,{id:'add',ok:true,hint:false,ms:99999,now:now+20});assert(slow.skills.add.due);
console.log(`Passed: ${samples} generated questions; answer uniqueness; mastery gating; spaced recall; hint exclusion; comfortable pace.`);
