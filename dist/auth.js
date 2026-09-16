import {createClient} from './vendor/supabase.js';
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from './supabase-config.js';
import {fresh} from './engine.js';
import {CloudProgress,normalize} from './cloud-state.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=s=>document.querySelector(s);
export const supabase=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:'nerdy-auth-v1'}});
let callbacks={},user=null,loading=null,loadingUser=null,epoch=0;
export const progressStore=new CloudProgress(supabase,{onStatus:(kind,message)=>callbacks.onStatus?.(kind,message),onMerge:state=>callbacks.onMerge?.(state)});
export const currentUser=()=>user;
function shell(content){$('#modal')?.close();$('#app').innerHTML=`<main class="auth-layout"><section class="auth-world"><img src="world.png" alt="Pip waiting on the floating meadow island"><div class="auth-brand"><span class="brandmark">n</span> nerdy</div><div class="auth-world-copy"><span class="eyebrow">A WORLD WORTH COMING BACK TO</span><h1>Little discoveries.<br>Always yours.</h1><p>Your explorer, their growing powers, and every little treasure — together in one account.</p></div></section><section class="auth-side"><div class="auth-form-wrap">${content}</div><p class="auth-foot">A grown-up’s account. A child’s world of wonder.</p></section></main>`;}
function message(text,error=false){const el=$('#auth-message');if(el){el.textContent=text;el.className=`auth-message ${error?'error':''}`;el.hidden=false;}}
function friendly(error){if(/fetch|network/i.test(error?.message||''))return 'We couldn’t reach your account. Check your connection and try again.';return error?.message||'Something went wrong. Please try again.';}
export function showAuth(mode='login',notice=''){
 const signup=mode==='signup';
 shell(`<span class="auth-kicker">${signup?'YOUR ADVENTURE STARTS HERE':'WELCOME BACK'}</span><h1>${signup?'Create your account':'Your world is waiting.'}</h1><p class="auth-intro">${signup?'For parents, guardians, and educators. Save your learner’s progress wherever you play.':'Log in to pick up exactly where you left off.'}</p><form id="auth-form"><label for="email">Your email</label><input id="email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required maxlength="254">${signup?'<label for="explorer">Explorer nickname</label><input id="explorer" name="explorer" autocomplete="off" maxlength="24" placeholder="A nickname, not a full name" required>':''}<label for="password">Password</label><div class="password-field"><input id="password" name="password" type="password" autocomplete="${signup?'new-password':'current-password'}" ${signup?'minlength="8"':''} maxlength="72" required placeholder="${signup?'At least 8 characters':'Your password'}"><button type="button" class="password-toggle" aria-label="Show password">Show</button></div>${signup?'<label for="confirm-password">Confirm password</label><input id="confirm-password" type="password" autocomplete="new-password" minlength="8" maxlength="72" required><label class="adult-check"><input id="grownup" type="checkbox" required><span>I’m a parent, guardian, or educator.</span></label>':''}<p id="auth-message" class="auth-message" role="status" ${notice?'':'hidden'}>${esc(notice)}</p><button class="primary auth-submit" type="submit">${signup?'Create account':'Log in'} <span aria-hidden="true">→</span></button></form><div class="auth-divider"></div><p class="auth-switch">${signup?'Already have an account?':'New to Nerdy?'} <button class="text-button" id="switch-auth">${signup?'Log in':'Create an account'}</button></p><p class="auth-privacy">Only your account can access your saved learning data. We never ask for a child’s email address.</p>`);
 $('#switch-auth').onclick=()=>showAuth(signup?'login':'signup');
 $('.password-toggle').onclick=()=>{const p=$('#password'),show=p.type==='password';p.type=show?'text':'password';$('.password-toggle').textContent=show?'Hide':'Show';$('.password-toggle').setAttribute('aria-label',show?'Hide password':'Show password')};
 $('#auth-form').onsubmit=async e=>{
   e.preventDefault();const email=$('#email').value.trim(),password=$('#password').value;
   if(signup&&password!==$('#confirm-password').value){message('The passwords don’t match yet.',true);return;}
   const button=$('.auth-submit');button.disabled=true;button.textContent='One moment…';message('');
   try{
     const result=signup?await supabase.auth.signUp({email,password,options:{data:{explorer_name:$('#explorer').value.trim()||'Explorer'}}}):await supabase.auth.signInWithPassword({email,password});
     if(result.error)throw result.error;
     if(!result.data.session)throw Error('Signup is not ready yet. Please contact the app owner and try again later.');
     await openAccount(result.data.session);
   }catch(err){message(friendly(err),true);}
   finally{if(button.isConnected){button.disabled=false;button.textContent=signup?'Create account':'Log in';}}
 };
}
function loadingScreen(){shell('<span class="auth-kicker">WELCOME HOME</span><h1>Finding your world…</h1><p class="auth-intro" role="status">Loading your saved adventures.</p>');}
async function openAccount(session){
 if(!session?.user)return;if(user?.id===session.user.id&&progressStore.base){return;}if(loading&&loadingUser===session.user.id)return loading;loadingUser=session.user.id;
 const turn=++epoch;loading=(async()=>{
   loadingScreen();const {data,error}=await supabase.auth.getUser();if(error||!data.user)throw error||Error('Please log in again.');if(turn!==epoch)return;
   const account=data.user;const initial=fresh();initial.name=account.user_metadata?.explorer_name?.slice(0,24)||'Explorer';
   const saved=await progressStore.open(account.id,initial);if(turn!==epoch)return;user=account;callbacks.onReady?.(normalize(saved));
 })().catch(err=>{if(turn!==epoch)return;shell(`<h1>Your world is safe.</h1><p class="auth-intro">We couldn’t load your saved progress. ${esc(friendly(err))}</p><button class="primary" id="retry-account">Try again</button><button class="text-button auth-forgot" id="return-login">Back to log in</button>`);$('#retry-account').onclick=()=>void openAccount(session);$('#return-login').onclick=async()=>{await supabase.auth.signOut({scope:'local'});showAuth()};}).finally(()=>{if(turn===epoch){loading=null;loadingUser=null;}});return loading;
}
export async function boot(options){
 callbacks=options;
 supabase.auth.onAuthStateChange((event,session)=>{
   if(event==='SIGNED_OUT'){epoch++;loading=null;loadingUser=null;user=null;progressStore.close();callbacks.onSignedOut?.();setTimeout(()=>showAuth(),0);return;}
   if(event==='SIGNED_IN')setTimeout(()=>void openAccount(session),0);
 });
 loadingScreen();const {data,error}=await supabase.auth.getSession();
 const urlError=new URLSearchParams(location.hash.slice(1)).get('error_description')||new URLSearchParams(location.search).get('error_description');
 if(urlError){history.replaceState(null,'',location.pathname);showAuth('login',urlError);return;}
 if(error){showAuth('login',friendly(error));return;}if(data.session)await openAccount(data.session);else showAuth();
 window.addEventListener('online',()=>{if(user)void progressStore.flush()});
 window.addEventListener('beforeunload',e=>{if(progressStore.pending){e.preventDefault();e.returnValue=''}});
}
export async function logOut(){if(!await progressStore.flush())throw Error('Your latest changes are not saved yet. Retry saving before logging out.');const {error}=await supabase.auth.signOut({scope:'local'});if(error)throw error;user=null;progressStore.close();callbacks.onSignedOut?.();showAuth();}
export async function exportJournal(state){if(!user)throw Error('Please log in.');if(!await progressStore.flush())throw Error('Save your latest progress before exporting.');const body=JSON.stringify({exportedAt:new Date().toISOString(),...state},null,2);const path=`${user.id}/${Date.now()}-${crypto.randomUUID()}.json`;const {error}=await supabase.storage.from('learning-journals').upload(path,new Blob([body],{type:'application/json'}),{contentType:'application/json',upsert:false});if(error)throw error;return body;}
export async function listJournals(){if(!user)return[];const {data,error}=await supabase.storage.from('learning-journals').list(user.id,{limit:10,sortBy:{column:'name',order:'desc'}});if(error)throw error;return data||[];}
export async function downloadJournal(name){if(!user||!/^\d+-[a-f0-9-]+\.json$/.test(name))throw Error('Invalid journal.');const {data,error}=await supabase.storage.from('learning-journals').download(`${user.id}/${name}`);if(error)throw error;return data;}
