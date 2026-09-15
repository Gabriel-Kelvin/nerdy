import {createClient} from './vendor/supabase.js';
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from './supabase-config.js';
import {fresh} from './engine.js';
import {CloudProgress,normalize} from './cloud-state.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=s=>document.querySelector(s);
export const supabase=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'nerdy-auth-v1'}});
let callbacks={},user=null,loading=null,loadingUser=null,screen='login',recovery=false,epoch=0;
export const progressStore=new CloudProgress(supabase,{onStatus:(kind,message)=>callbacks.onStatus?.(kind,message),onMerge:state=>callbacks.onMerge?.(state)});
export const currentUser=()=>user;
export const isRecovery=()=>recovery;
function shell(content){$('#modal')?.close();$('#app').innerHTML=`<main class="auth-layout"><section class="auth-world"><img src="world.png" alt="Pip waiting on the floating meadow island"><div class="auth-brand"><span class="brandmark">n</span> nerdy</div><div class="auth-world-copy"><span class="eyebrow">A WORLD WORTH COMING BACK TO</span><h1>Little discoveries.<br>Always yours.</h1><p>Your explorer, their growing powers, and every little treasure — together in one account.</p></div></section><section class="auth-side"><div class="auth-form-wrap">${content}</div><p class="auth-foot">A grown-up’s account. A child’s world of wonder.</p></section></main>`;}
function message(text,error=false){const el=$('#auth-message');if(el){el.textContent=text;el.className=`auth-message ${error?'error':''}`;el.hidden=false;}}
const callbackUrl=()=>`${location.origin}/`;
function friendly(error){if(error?.message?.includes('Email address not authorized'))return 'Supabase’s default email service can currently send only to project-team addresses. An email sender must be connected before other addresses can sign up.';if(error?.code==='over_email_send_rate_limit'||/email rate limit/i.test(error?.message||''))return 'The email service has reached its sending limit. Please wait before trying again.';if(/fetch|network/i.test(error?.message||''))return 'We couldn’t reach your account. Check your connection and try again.';return error?.message||'Something went wrong. Please try again.';}
export function showAuth(mode='login',notice=''){
 screen=mode;const signup=mode==='signup',reset=mode==='reset',update=mode==='update';
 shell(`<span class="auth-kicker">${update?'A FRESH START':reset?'LET’S HELP YOU BACK IN':signup?'YOUR ADVENTURE STARTS HERE':'WELCOME BACK'}</span><h1>${update?'Choose a new password':reset?'Forgot your password?':signup?'Create your account':'Your world is waiting.'}</h1><p class="auth-intro">${update?'Set a strong password to keep your world safe.':reset?'We’ll send a link to the email on your account.':signup?'For parents, guardians, and educators. Save your learner’s progress wherever you play.':'Log in to pick up exactly where you left off.'}</p><form id="auth-form">${update?'':`<label for="email">Your email</label><input id="email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required maxlength="254">`}${signup?'<label for="explorer">Explorer nickname</label><input id="explorer" name="explorer" autocomplete="off" maxlength="24" placeholder="A nickname, not a full name" required>':''}${reset?'':`<label for="password">${update?'New password':'Password'}</label><div class="password-field"><input id="password" name="password" type="password" autocomplete="${signup||update?'new-password':'current-password'}" ${signup||update?'minlength="8"':''} maxlength="72" required placeholder="${signup||update?'At least 8 characters':'Your password'}"><button type="button" class="password-toggle" aria-label="Show password">Show</button></div>`}${signup||update?'<label for="confirm-password">Confirm password</label><input id="confirm-password" type="password" autocomplete="new-password" minlength="8" maxlength="72" required>':''}${signup?'<label class="adult-check"><input id="grownup" type="checkbox" required><span>I’m a parent, guardian, or educator.</span></label>':''}<p id="auth-message" class="auth-message" role="status" ${notice?'':'hidden'}>${esc(notice)}</p><button class="primary auth-submit" type="submit">${update?'Save new password':reset?'Send reset link':signup?'Create account':'Log in'} <span aria-hidden="true">→</span></button></form>${!signup&&!reset&&!update?'<button class="text-button auth-forgot" id="forgot">Forgot password?</button>':''}<div class="auth-divider"></div><p class="auth-switch">${signup?'Already have an account?':reset||update?'Remember your password?':'New to Nerdy?'} <button class="text-button" id="switch-auth">${signup||reset||update?'Log in':'Create an account'}</button></p><p class="auth-privacy">Only your account can access your saved learning data. We never ask for a child’s email address.</p>`);
 $('#switch-auth').onclick=()=>showAuth(signup||reset||update?'login':'signup');if($('#forgot'))$('#forgot').onclick=()=>showAuth('reset');
 $('.password-toggle')?.addEventListener('click',()=>{const p=$('#password'),show=p.type==='password';p.type=show?'text':'password';$('.password-toggle').textContent=show?'Hide':'Show';$('.password-toggle').setAttribute('aria-label',show?'Hide password':'Show password')});
 $('#auth-form').onsubmit=async e=>{
   e.preventDefault();const email=$('#email')?.value.trim(),password=$('#password')?.value;
   if((signup||update)&&password!==$('#confirm-password').value){message('The passwords don’t match yet.',true);return;}
   const button=$('.auth-submit');button.disabled=true;button.textContent='One moment…';message('');
   try{
     if(signup){const {data,error}=await supabase.auth.signUp({email,password,options:{data:{explorer_name:$('#explorer').value.trim()||'Explorer'},emailRedirectTo:callbackUrl()}});if(error)throw error;if(data.session){await openAccount(data.session);return;}showConfirmation(email);return;}
     if(reset){const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:callbackUrl()});if(error)throw error;message('If an account exists for this address, a reset link will arrive shortly. Check spam too.');}
     else if(update){const {error}=await supabase.auth.updateUser({password});if(error)throw error;recovery=false;await supabase.auth.signOut({scope:'global'});showAuth('login','Password updated. Log in with your new password.');return;}
     else {const {data,error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;await openAccount(data.session);return;}
   }catch(err){message(friendly(err),true);if(err?.code==='email_not_confirmed'){const resend=document.createElement('button');resend.type='button';resend.className='text-button';resend.textContent='Resend confirmation email';resend.onclick=()=>showConfirmation(email);$('#auth-message').append(document.createElement('br'),resend);}}
   finally{if(button.isConnected){button.disabled=false;button.textContent=update?'Save new password':reset?'Send reset link':signup?'Create account':'Log in';}}
 };
}
function showConfirmation(email){shell(`<div class="auth-mail-icon">✉</div><h1>Check your inbox.</h1><p class="auth-intro">We sent a confirmation link to <strong>${esc(email)}</strong>. Open it to activate your account, then come back to log in.</p><p id="auth-message" class="auth-message" role="status" hidden></p><button class="primary auth-submit" id="back-login">Back to log in</button><button class="text-button auth-forgot" id="resend-confirmation">Resend confirmation</button><p class="auth-privacy">Using another device? Open the link there, then log in here. Email delivery may take a moment.</p>`);$('#back-login').onclick=()=>{showAuth();$('#email').value=email};$('#resend-confirmation').onclick=async()=>{const b=$('#resend-confirmation');b.disabled=true;const {error}=await supabase.auth.resend({type:'signup',email,options:{emailRedirectTo:callbackUrl()}});message(error?friendly(error):'Confirmation requested. Check your inbox and spam folder.',!!error);b.disabled=false;};}
function loadingScreen(){shell('<span class="auth-kicker">WELCOME HOME</span><h1>Finding your world…</h1><p class="auth-intro" role="status">Loading your saved adventures.</p>');}
async function openAccount(session){
 if(!session?.user||recovery)return;if(user?.id===session.user.id&&progressStore.base){return;}if(loading&&loadingUser===session.user.id)return loading;loadingUser=session.user.id;
 const turn=++epoch;loading=(async()=>{
   loadingScreen();const {data,error}=await supabase.auth.getUser();if(error||!data.user)throw error||Error('Please log in again.');if(turn!==epoch)return;
   const account=data.user;const initial=fresh();initial.name=account.user_metadata?.explorer_name?.slice(0,24)||'Explorer';
   const saved=await progressStore.open(account.id,initial);if(turn!==epoch)return;user=account;callbacks.onReady?.(normalize(saved));
 })().catch(err=>{if(turn!==epoch)return;shell(`<h1>Your world is safe.</h1><p class="auth-intro">We couldn’t load your saved progress. ${esc(friendly(err))}</p><button class="primary" id="retry-account">Try again</button><button class="text-button auth-forgot" id="return-login">Back to log in</button>`);$('#retry-account').onclick=()=>void openAccount(session);$('#return-login').onclick=async()=>{await supabase.auth.signOut({scope:'local'});showAuth()};}).finally(()=>{if(turn===epoch){loading=null;loadingUser=null;}});return loading;
}
export async function boot(options){
 callbacks=options;
 supabase.auth.onAuthStateChange((event,session)=>{
   if(event==='PASSWORD_RECOVERY'){recovery=true;epoch++;setTimeout(()=>showAuth('update'),0);return;}
   if(event==='SIGNED_OUT'){epoch++;loading=null;loadingUser=null;user=null;progressStore.close();callbacks.onSignedOut?.();setTimeout(()=>showAuth(),0);return;}
   if(event==='SIGNED_IN'&&!recovery)setTimeout(()=>void openAccount(session),0);
 });
 loadingScreen();const {data,error}=await supabase.auth.getSession();
 const urlError=new URLSearchParams(location.hash.slice(1)).get('error_description')||new URLSearchParams(location.search).get('error_description');
 if(urlError){history.replaceState(null,'',location.pathname);showAuth('login',urlError);return;}
 if(recovery)return;if(error){showAuth('login',friendly(error));return;}if(data.session)await openAccount(data.session);else showAuth();
 window.addEventListener('online',()=>{if(user)void progressStore.flush()});
 window.addEventListener('beforeunload',e=>{if(progressStore.pending){e.preventDefault();e.returnValue=''}});
}
export async function logOut(){if(!await progressStore.flush())throw Error('Your latest changes are not saved yet. Retry saving before logging out.');const {error}=await supabase.auth.signOut({scope:'local'});if(error)throw error;user=null;progressStore.close();callbacks.onSignedOut?.();showAuth();}
export async function exportJournal(state){if(!user)throw Error('Please log in.');if(!await progressStore.flush())throw Error('Save your latest progress before exporting.');const body=JSON.stringify({exportedAt:new Date().toISOString(),...state},null,2);const path=`${user.id}/${Date.now()}-${crypto.randomUUID()}.json`;const {error}=await supabase.storage.from('learning-journals').upload(path,new Blob([body],{type:'application/json'}),{contentType:'application/json',upsert:false});if(error)throw error;return body;}
export async function listJournals(){if(!user)return[];const {data,error}=await supabase.storage.from('learning-journals').list(user.id,{limit:10,sortBy:{column:'name',order:'desc'}});if(error)throw error;return data||[];}
export async function downloadJournal(name){if(!user||!/^\d+-[a-f0-9-]+\.json$/.test(name))throw Error('Invalid journal.');const {data,error}=await supabase.storage.from('learning-journals').download(`${user.id}/${name}`);if(error)throw error;return data;}
