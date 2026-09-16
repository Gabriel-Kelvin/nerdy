import assert from 'node:assert/strict';
import {fresh,DAY} from '../dist/engine.js';
import {NODES,model,evidence,recordNode,byNode} from '../dist/constellation.js';
import {novaProblem} from '../dist/nova-problems.js';
import {normalize,mergeProgress} from '../dist/cloud-state.js';
const now=Date.now();
function answer(s,node,count=8,time=now,opts={}){for(let i=0;i<count;i++)recordNode(s,{node,ok:true,hint:false,ms:2000,form:['story','visual','symbolic'][i%3],sessionId:opts.sessionId||crypto.randomUUID(),now:time+i*1000,...opts});}
// Every dependency exists and the prerequisite graph has no cycles.
const visit=(id,path=[])=>{assert(!path.includes(id),`cycle: ${id}`);for(const p of byNode[id].prereqs){assert(byNode[p]);visit(p,[...path,id]);}};NODES.forEach(n=>visit(n.id));
let samples=0;
for(const n of NODES)for(let level=0;level<3;level++)for(let i=0;i<60;i++){
 const state=fresh();if(level)answer(state,n.id,level===1?4:6,now-10000);
 state.nova.interests=['dinosaurs','space'];const p=novaProblem(state,n.id,i,now+10000);
 assert.equal(p.choices.length,4,n.id);assert.equal(new Set(p.choices.map(String)).size,4,n.id);assert(p.choices.includes(p.answer));assert(p.hint&&p.prompt);assert.equal(p.node,n.id);assert(['story','visual','symbolic'].includes(p.form));assert(p.interest==='dinosaurs'||p.interest==='space');
 if(p.display.includes(' + ')&&p.display.includes(' = ?')&&!['addFractions','tenths','decimals'].includes(n.id)){const match=p.display.match(/^([\d.]+)(?: cm)? \+ ([\d.]+)(?: cm)? =/);if(match)assert(Math.abs(Number(p.answer)-(Number(match[1])+Number(match[2])))<.0001);}
 if(p.display.includes(' × ')&&p.display.endsWith(' = ?')){const [a,b]=p.display.split(' × ');assert.equal(Number(p.answer),Number(a)*parseInt(b));}
 if(n.id==='equivalent'){const f=p.display.match(/(\d+)\/(\d+) = \?\/(\d+)/);assert.equal(Number(p.answer)*Number(f[2]),Number(f[1])*Number(f[3]));}
 samples++;
}
const s=fresh();assert(model(s).nodes.count5.ready);assert(!model(s).nodes.multiply.ready);
answer(s,'count5');assert(evidence(s,'count5',now+10000).solid);assert.equal(evidence(s,'count5',now+10000).mastered,false);assert(model(s,now+10000).nodes.add10.ready);
for(const id of ['count20','add10','groups'])answer(s,id,8,now+10000);assert(!model(s,now+20000).nodes.multiply.ready);answer(s,'tens',8,now+20000);assert(model(s,now+30000).nodes.multiply.ready);assert(!model(s,now+30000).nodes.multiply.mastered);
const reviewed=fresh();answer(reviewed,'count5');let at=now+DAY;
for(let d=0;d<3;d++){assert(evidence(reviewed,'count5',at).due);answer(reviewed,'count5',3,at,{review:true,sessionId:'review-'+d});at=evidence(reviewed,'count5',at+5000).reviewAt+DAY;}
const last=reviewed.attempts.at(-1).at;assert(evidence(reviewed,'count5',last+1000).mastered);assert.equal(evidence(reviewed,'count5',last+100*DAY).mastered,false);assert(evidence(reviewed,'count5',last+100*DAY).earned);assert(model(reviewed,last+100*DAY).worlds[0].unlocked>=1);
const checks=evidence(reviewed,'count5',last+1000).checks;answer(reviewed,'count5',3,last+10000,{review:true,sessionId:'same-day'});assert.equal(evidence(reviewed,'count5',last+20000).checks,checks);
const hints=fresh();answer(hints,'add10',20,now,{hint:true});assert(!evidence(hints,'add10',now+30000).solid);assert.equal(model(hints,now+30000).rooted,0);
const pace=fresh();answer(pace,'count5',8,now,{ms:40000});assert.equal(evidence(pace,'count5',now+30000).peak,1);pace.grade=5;assert.equal(evidence(pace,'count5',now+30000).peak,1);
const comfortable=fresh();comfortable.untimed=true;answer(comfortable,'count5',8,now,{ms:120000});comfortable.untimed=false;assert.equal(evidence(comfortable,'count5',now+30000).peak,1);
const normalized=normalize({...s,nova:{introduced:true,interests:['dinosaurs','<script>']}});assert.deepEqual(normalized.nova.interests,['dinosaurs']);assert.equal(normalized.attempts.length,s.attempts.length);assert(normalized.attempts.every(a=>a.node));
const remote=structuredClone(normalized),local=structuredClone(normalized);answer(remote,'share',3,now);answer(local,'halves',3,now);const merged=mergeProgress(remote,local,normalized);assert.equal(merged.attempts.length,normalized.attempts.length+6);assert.equal(model(merged,now+30000).nodes.share.history.length,3);
console.log(`Passed: ${samples} Nova questions; dependency graph, cross-world readiness, independent evidence, adaptive review, same-day replay protection, permanent earned discoveries, interests, cloud merge.`);
