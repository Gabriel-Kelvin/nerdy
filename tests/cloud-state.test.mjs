import assert from 'node:assert/strict';
import {CloudProgress,mergeProgress,normalize} from '../dist/cloud-state.js';
import {fresh} from '../dist/engine.js';
const clone=x=>JSON.parse(JSON.stringify(x));
globalThis.localStorage={data:new Map(),getItem(k){return this.data.get(k)||null},setItem(k,v){this.data.set(k,v)},removeItem(k){this.data.delete(k)}};
const base=normalize(fresh()),remote=clone(base),local=clone(base);
const attempt=(eventId,id='add')=>({eventId,id,ok:true,hint:false,at:Date.now(),ms:1000,level:1});
remote.attempts.push(attempt('remote'));remote.grade=3;
local.attempts.push(attempt('local'));local.theme='dark';
local.sessions.push({eventId:'session1',id:'add',at:Date.now(),correct:6,total:6,seeds:18});
const merged=mergeProgress(remote,local,base);assert.equal(merged.attempts.length,2);assert.equal(merged.grade,3);assert.equal(merged.theme,'dark');assert.equal(merged.seeds,18);
assert.equal(mergeProgress(merged,local,base).sessions.length,1);
assert.throws(()=>mergeProgress({...remote,generation:'reset'},local,base),/reset/);
assert.equal(normalize({...base,avatar:'<script>',grade:999}).avatar,'🌱');
assert.equal(normalize({...base,grade:999}).grade,5);

const rows=new Map();let fail=false;
const mockClient={currentUser:'a',from(){return {select(){return this},eq(key,id){this.id=id;return this},async maybeSingle(){return {data:clone(rows.get(this.id)||null),error:null}}}},async rpc(name,{p_state,p_revision}){if(fail)return {error:{message:'Network down'}};const old=rows.get(this.currentUser);if((old?.revision||0)!==p_revision)return {error:{code:'40001'}};const next={state:clone(p_state),revision:p_revision+1};rows.set(this.currentUser,next);return {data:[{revision:next.revision}],error:null}}};
const states=[];const store=new CloudProgress(mockClient,{onStatus:(kind)=>states.push(kind)});
await store.open('a');assert.equal(rows.get('a').revision,1);
const newer=clone(base);newer.name='Pip Tester';store.schedule(newer);assert(await store.flush());assert.equal(rows.get('a').state.name,'Pip Tester');assert(!localStorage.getItem('nerdy-pending-v2:a'));
fail=true;newer.grade=4;store.schedule(newer);assert.equal(await store.flush(),false);assert(localStorage.getItem('nerdy-pending-v2:a'));assert(states.includes('error'));
store.close();mockClient.currentUser='b';fail=false;const b=await store.open('b');assert.equal(b.name,'Explorer');assert.equal(b.grade,1);assert(localStorage.getItem('nerdy-pending-v2:a'));
store.close();mockClient.currentUser='a';const restored=await store.open('a');assert.equal(restored.grade,4);assert(!store.pending);
const other=clone(rows.get('a').state);other.theme='dark';rows.set('a',{state:other,revision:rows.get('a').revision+1});
const here=clone(restored);here.name='Cloud friend';store.schedule(here);assert(await store.flush());assert.equal(rows.get('a').state.theme,'dark');assert.equal(rows.get('a').state.name,'Cloud friend');
// Failed reset can resume safely if the server revision has not changed.
fail=true;const reset=normalize(fresh());reset.generation='new-generation';store.schedule(reset);await store.flush();store.close();fail=false;const resumed=await store.open('a');assert.equal(resumed.generation,'new-generation');assert.equal(resumed.name,'Explorer');store.close();
console.log('Passed: account isolation, offline retry, reload recovery, concurrent merge, duplicate rewards, reset protection, and data normalization.');
// A delayed response from an old account must not block or alter the new account.
mockClient.currentUser='a';await store.open('a');
const originalRpc=mockClient.rpc.bind(mockClient);let release;
mockClient.rpc=()=>new Promise(resolve=>{release=resolve});store.schedule({...store.base,name:'Pending old account'});const oldRequest=store.flush();store.close();mockClient.currentUser='b';mockClient.rpc=originalRpc;
await store.open('b');store.schedule({...store.base,name:'New account'});assert(await store.flush());release({error:{message:'Old request failed'}});await oldRequest;assert.equal(store.userId,'b');assert.equal(store.error,null);assert.equal(rows.get('b').state.name,'New account');store.close();
console.log('Passed: delayed old-account response isolation.');
// A reset on another device preserves a downloadable pending copy on reopen.
mockClient.currentUser='a';await store.open('a');fail=true;store.schedule({...store.base,name:'Unsaved before reset'});await store.flush();store.close();const previous=rows.get('a');rows.set('a',{state:{...normalize(fresh()),generation:'remote-reset'},revision:previous.revision+1});fail=false;
const conflictCopy=await store.open('a');assert.equal(conflictCopy.name,'Unsaved before reset');assert.equal(store.error.code,'RESET_CONFLICT');assert(localStorage.getItem('nerdy-pending-v2:a'));const savedCopy=await store.loadSaved();assert.equal(savedCopy.generation,'remote-reset');assert.equal(store.pending,null);assert.equal(store.error,null);store.close();console.log('Passed: reset conflict recovery without silent data loss.');
// Automatic retries must recover without a click and retain the pending copy until confirmed.
const retryStore=new CloudProgress(mockClient);mockClient.currentUser='retry-account';await retryStore.open('retry-account');fail=true;retryStore.schedule({...retryStore.base,name:'Auto retry'});assert.equal(await retryStore.flush(),false);assert(retryStore.pending);fail=false;await new Promise(r=>setTimeout(r,1700));assert.equal(retryStore.pending,null);assert.equal(rows.get('retry-account').state.name,'Auto retry');retryStore.close();console.log('Passed: automatic save retry recovers and clears the offline copy only after confirmation.');
