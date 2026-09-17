import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,unlink} from 'node:fs/promises';
import {Window} from 'happy-dom';
import {fresh} from '../dist/engine.js';
import {model} from '../dist/constellation.js';

// Exercise real render/event code with a fake account; live Supabase is tested separately.
const win=new Window({url:'http://127.0.0.1:5173/'});
globalThis.window=win;globalThis.document=win.document;globalThis.localStorage=win.localStorage;
document.head.innerHTML='<meta name="theme-color" content="#fff">';
document.body.innerHTML='<div id="app"></div><dialog id="modal"></dialog><div id="toast"></div>';
const saved=[];let user={id:'test-account',email:'qa@example.com'};
globalThis.__nerdyAuth={askNova:async()=>({reply:'Hello! Want a number puzzle?'}),boot:async handlers=>handlers.onReady(fresh()),currentUser:()=>user,progressStore:{schedule:s=>saved.push(structuredClone(s)),flush:async()=>true},logOut:async()=>{user=null;},exportJournal:async s=>JSON.stringify(s),listJournals:async()=>[],downloadJournal:async()=>new Blob()};
const appUrl=new URL('../dist/app.js',import.meta.url),tmp=new URL('../work/interaction-app.mjs',import.meta.url);
await mkdir(new URL('../work/',import.meta.url),{recursive:true});
let code=await readFile(appUrl,'utf8');
code=code.replace(/import \{([^}]+)\} from '\.\/auth.js';/,(_,names)=>`const {${names}}=globalThis.__nerdyAuth;`);
code=code.replace(/from '(\.\/[^']+)'/g,(_,path)=>`from '${new URL(path,appUrl).href}'`);
await writeFile(tmp,code+'\nexport {state,lesson,startNode};\n');
try{
 const app=await import(tmp.href+'?'+Date.now());
 const $=s=>document.querySelector(s);
 const click=s=>{const el=$(s);assert(el,`Missing control: ${s}`);assert(!el.disabled,`Disabled control: ${s}`);el.click();};
 assert.match($('#modal').textContent,/Hello. I’m Nova/);
 click('#meet-nova');assert(!$('#modal').open);assert(!$('#save-interests'));assert(!$('.nova-on-map'));assert(!$('[data-action="interests"]'));
 assert(!('interests' in app.state.nova));assert(app.state.nova.introduced);
 for(const [i,file] of ['meadow','canopy','lagoon','summit'].entries()){click(`[data-world="${i}"]`);assert.equal($('.nova-landscape').getAttribute('src'),`worlds/${file}.png`);assert.equal(document.querySelectorAll('.map-discovery').length,6);}
 click('[data-action="theme"]');assert.equal(document.documentElement.dataset.theme,'dark');
 click('[data-nav="skills"]');assert.equal(document.querySelectorAll('.constellation-node').length,24);
 // Neither map clicks nor direct lesson starts can bypass the ordered journey.
 click('[data-node="decimalAdd"]');assert(!$('#try-node'));assert.match($('#modal').textContent,/Complete level 1/);click('[data-close]');app.startNode('decimalAdd');assert.equal(app.lesson,null);assert(!$('#try-node'));click('#continue-level');assert.equal(app.lesson.node,'count5');
 click('#exit-lesson');click('#leave');
 click('[data-action="nova"]');assert($('#nova-message'));click('#nova-close');assert.equal($('#modal').textContent,'');
 click('[data-world="0"]');click('[data-node="count5"]');click('#try-node');
 const chooseCorrect=()=>click(`[data-answer="${app.lesson.q.choices.indexOf(app.lesson.q.answer)}"]`);
 for(let i=0;i<6;i++){
  assert($('.nova-speech'));assert(!('interest' in app.lesson.q));
  if(i===0){click(`[data-answer="${app.lesson.q.choices.findIndex(x=>x!==app.lesson.q.answer)}"]`);assert.equal(app.state.attempts.length,1);}
  if(i===1)click('#hint-button');
  chooseCorrect();assert.equal(app.state.attempts.length,i+1);click('#next-question');
 }
 assert(app.lesson.done);assert.equal(app.state.sessions.length,1);assert.equal(app.state.sessions[0].correct,4);assert.equal(app.state.seeds,12);
 assert.equal(model(app.state).nodes.count5.solid,false);assert.equal(app.state.attempts[0].ok,false);assert.equal(app.state.attempts[1].hint,true);
 click('#back-home');click('[data-node="count20"]');assert(!$('#try-node'));click('[data-close]');click('[data-node="count5"]');click('#try-node');
 for(let i=0;i<6;i++){chooseCorrect();click('#next-question');}
 assert(model(app.state).nodes.count5.solid);assert.equal(model(app.state).nodes.count5.mastered,false);assert.equal(model(app.state).worlds[0].unlocked,1);
 assert.match($('.finish-discoveries').textContent,/Firefly bridge/);click('#back-home');click('[data-node="count20"]');click('#try-node');assert.equal(app.lesson.node,'count20');click('#exit-lesson');click('#leave');
 click('[data-landmark="0"]');assert.match($('#modal').textContent,/yours to keep/);click('[data-close]');
 click('[data-nav="collection"]');assert.equal(document.querySelectorAll('[data-equip]:not(:disabled)').length,2);click('[data-equip="🦊"]');assert.equal(app.state.avatar,'🦊');
 click('[data-nav="parent"]');assert.equal(document.querySelectorAll('.evidence tbody tr').length,24);
 click('[data-action="settings"]');$('#name').value='Nova Explorer';$('#grade').value='5';$('#pace').value='untimed';click('#save-settings');
 assert.equal(app.state.grade,5);assert.equal(model(app.state).worlds[0].unlocked,1);
 click('[data-action="account"]');await new Promise(resolve=>setTimeout(resolve,0));assert.match($('#journals').textContent,/No saved journals/);click('#account-close');
 assert.equal(saved.at(-1).name,'Nova Explorer');assert(!('interests' in saved.at(-1).nova));assert.equal(saved.at(-1).attempts.length,12);
 console.log('Passed: Nova introduction without interests prompt, removed interests, four worlds, sequential level guards, dark mode, temporary chat opening, first-attempt scoring, hints/retries, earned landmarks, keepsakes, settings, journal and save interactions.');
}finally{await win.happyDOM.abort();await unlink(tmp);delete globalThis.__nerdyAuth;}
