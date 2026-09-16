import {fresh,SKILLS} from './engine.js';
import {INTERESTS} from './constellation.js';
const clone=x=>JSON.parse(JSON.stringify(x));
const known=new Set(SKILLS.map(s=>s.id));
const avatars=new Set(['🌱','🦊','🐸','🦉','🦋','🐉']);
const number=(x,min,max,fallback)=>Number.isFinite(x)?Math.max(min,Math.min(max,x)):fallback;
export function normalize(raw){
 const data=raw&&typeof raw==='object'?raw:{};const s=fresh();
 s.name=typeof data.name==='string'?data.name.slice(0,24)||'Explorer':'Explorer';
 s.grade=Math.round(number(data.grade,0,5,1));s.avatar=avatars.has(data.avatar)?data.avatar:'🌱';
 s.sound=data.sound===true;s.untimed=data.untimed===true;s.theme=data.theme==='dark'?'dark':'light';
 s.generation=typeof data.generation==='string'?data.generation:'initial';s.world=Math.round(number(data.world,0,3,0));
 s.nova={introduced:data.nova?.introduced===true,interests:[...new Set((Array.isArray(data.nova?.interests)?data.nova.interests:['nature']).filter(id=>INTERESTS.some(i=>i.id===id)))].slice(0,3)};if(!s.nova.interests.length)s.nova.interests=['nature'];
 const cleanAttempt=a=>a&&known.has(a.id)&&typeof a.ok==='boolean'&&Number.isFinite(a.at)&&Number.isFinite(a.ms);
 s.attempts=(Array.isArray(data.attempts)?data.attempts:[]).filter(cleanAttempt).map(a=>({...a,eventId:typeof a.eventId==='string'?a.eventId:`legacy-${a.id}-${a.at}`,hint:a.hint===true,level:Math.round(number(a.level,1,5,1)),recall:a.recall===true,ms:number(a.ms,0,86400000,0)}));
 s.sessions=(Array.isArray(data.sessions)?data.sessions:[]).filter(a=>a&&known.has(a.id)&&Number.isFinite(a.at)).map(a=>({...a,eventId:typeof a.eventId==='string'?a.eventId:`legacy-${a.id}-${a.at}`,correct:Math.round(number(a.correct,0,6,0)),total:6,seeds:Math.round(number(a.seeds,0,24,0)),recall:a.recall===true}));
 s.days=(Array.isArray(data.days)?data.days:[]).filter(x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x));
 s.seeds=s.sessions.reduce((n,a)=>n+a.seeds,0);
 for(const [id,p] of Object.entries(data.skills||{})){if(!known.has(id)||!p||typeof p!=='object')continue;s.skills[id]={level:Math.round(number(p.level,1,5,1)),checks:Math.round(number(p.checks,0,3,0)),due:Number.isFinite(p.due)?p.due:null,started:Number.isFinite(p.started)?p.started:null,updatedAt:Number.isFinite(p.updatedAt)?p.updatedAt:0,history:(Array.isArray(p.history)?p.history:[]).filter(cleanAttempt).slice(-40)};}
 return s;
}
const union=(a,b,key)=>[...new Map([...a,...b].map(x=>[key(x),x])).values()].sort((a,b)=>(a.at||0)-(b.at||0));
export function mergeProgress(remote,local,base){
 remote=normalize(remote);local=normalize(local);base=normalize(base);
 if(remote.generation!==base.generation||local.generation!==base.generation){const e=new Error('Progress was reset on another device. Your unsaved copy is kept here; download it before loading the saved world.');e.code='RESET_CONFLICT';throw e;}
 const result=clone(remote);
 for(const key of ['name','grade','avatar','sound','untimed','theme','world'])if(local[key]!==base[key])result[key]=local[key];
 result.nova.introduced=remote.nova.introduced||local.nova.introduced;
 if(JSON.stringify(local.nova.interests)!==JSON.stringify(base.nova.interests))result.nova.interests=local.nova.interests;
 result.attempts=union(remote.attempts,local.attempts,a=>a.eventId||`${a.id}-${a.at}`);
 result.sessions=union(remote.sessions,local.sessions,a=>a.eventId||`${a.id}-${a.at}`);
 result.days=[...new Set([...remote.days,...local.days])].sort();
 result.seeds=result.sessions.reduce((sum,s)=>sum+s.seeds,0);
 for(const id of known){const r=remote.skills[id],l=local.skills[id];if(!r&&!l)continue;if(!r||!l){result.skills[id]=clone(r||l);continue;}const rt=r.updatedAt||r.history.at(-1)?.at||0,lt=l.updatedAt||l.history.at(-1)?.at||0;result.skills[id]={...(lt>=rt?l:r),history:union(r.history,l.history,a=>a.eventId||`${a.id}-${a.at}`).slice(-40)};}
 return result;
}

export class CloudProgress {
 constructor(client,{onStatus=()=>{},onMerge=()=>{}}={}){this.client=client;this.onStatus=onStatus;this.onMerge=onMerge;this.userId=null;this.pending=null;this.base=null;this.revision=0;this.running=null;this.epoch=0;this.error=null;}
 cacheKey(){return `nerdy-pending-v2:${this.userId}`;}
 cache(){if(!this.userId)return;try{if(this.pending)localStorage.setItem(this.cacheKey(),JSON.stringify({state:this.pending,base:this.base,revision:this.revision}));else localStorage.removeItem(this.cacheKey());}catch{this.onStatus('error','This browser cannot keep an offline copy. Please stay online until saving finishes.');}}
 async read(){const {data,error}=await this.client.from('learner_states').select('state,revision').eq('user_id',this.userId).maybeSingle();if(error)throw error;return data;}
 async open(userId,defaultState=fresh()){
   clearTimeout(this.timer);const epoch=++this.epoch;this.running=null;this.userId=userId;this.pending=null;this.base=null;this.revision=0;this.error=null;
   let cached;try{cached=JSON.parse(localStorage.getItem(this.cacheKey()))}catch{}
   const row=await this.read();if(epoch!==this.epoch)throw Error('Account changed.');
   const remote=normalize(row?.state||defaultState);this.revision=row?.revision||0;this.base=clone(remote);
   let value=remote;
   if(cached?.state){try{value=(row?.revision||0)===cached.revision?normalize(cached.state):mergeProgress(remote,cached.state,cached.base);}catch(e){if(e.code!=='RESET_CONFLICT')throw e;this.pending=normalize(cached.state);this.base=normalize(cached.base);this.revision=cached.revision;this.error=e;this.onStatus('error',e.message);return clone(this.pending);}this.pending=clone(value);}
   if(!row)this.pending=clone(value);
   if(this.pending){this.cache();await this.flush();value=this.pending||this.base;}
   this.onStatus(this.pending?'error':'saved',this.pending?'Waiting to save':'Saved to your account');return clone(value);
 }
 schedule(state){if(!this.userId)throw Error('Sign in before saving.');this.pending=clone(state);this.error=null;this.cache();this.onStatus('saving','Saving your progress…');clearTimeout(this.timer);this.timer=setTimeout(()=>{void this.flush()},250);}
 async loadSaved(){
   clearTimeout(this.timer);if(this.running)await this.running;const epoch=this.epoch;const row=await this.read();if(epoch!==this.epoch)throw Error('Account changed.');this.pending=null;this.base=normalize(row?.state);this.revision=row?.revision||0;this.error=null;this.cache();this.onMerge(clone(this.base));this.onStatus('saved','Saved to your account');return clone(this.base);
 }
 async flush(){
   clearTimeout(this.timer);if(this.running)return this.running;if(!this.pending)return true;
   const epoch=this.epoch;this.running=(async()=>{
     let conflicts=0;
     while(this.pending&&epoch===this.epoch){
       const sent=clone(this.pending),oldBase=clone(this.base);
       this.onStatus('saving','Saving your progress…');
       try{
         const {data,error}=await this.client.rpc('save_learner_state',{p_state:sent,p_revision:this.revision});
         if(epoch!==this.epoch)return false;
         if(error){if(error.code==='40001'&&conflicts++<3){const row=await this.read();if(epoch!==this.epoch)return false;const merged=mergeProgress(row?.state,this.pending,oldBase);this.base=normalize(row?.state);this.revision=row?.revision||0;this.pending=merged;this.onMerge(clone(merged));this.cache();continue;}throw error;}
         const row=data?.[0];if(!row)throw Error('The server did not confirm your save.');
         this.base=sent;this.revision=row.revision;
         if(JSON.stringify(this.pending)===JSON.stringify(sent))this.pending=null;
         this.cache();
       }catch(e){if(epoch!==this.epoch)return false;this.error=e;this.onStatus('error',e.code==='RESET_CONFLICT'?e.message:'Not saved yet. Check your connection and retry.');return false;}
     }
     if(epoch===this.epoch)this.onStatus('saved','Saved to your account');return true;
   })().finally(()=>{if(epoch===this.epoch)this.running=null});return this.running;
 }
 close(){clearTimeout(this.timer);this.cache();this.epoch++;this.running=null;this.userId=null;this.pending=null;this.base=null;this.revision=0;}
}
