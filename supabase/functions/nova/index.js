import {learningEvidence} from './learning.js';
import {CHAT_PROMPT,REPORT_PROMPT,safetyReply,safeOutput,reportShape} from './policy.js';

const origins=new Set(['http://127.0.0.1:5173','http://localhost:5173','https://nerdy-pip-math-world.gabrielkelvinf237.chatgpt.site']);
export async function handle(req){
 const origin=req.headers.get('origin');
 const headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS'};
 if(origin&&origins.has(origin))headers['Access-Control-Allow-Origin']=origin;
 const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers});
 if(origin&&!origins.has(origin))return reply({error:'This origin is not allowed.'},403);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='POST')return reply({error:'Use POST.'},405);
 const authorization=req.headers.get('authorization')||'';
 if(!/^Bearer [\w.-]+$/.test(authorization))return reply({error:'Please log in to talk with Nova.'},401);
 const url=Deno.env.get('SUPABASE_URL');
 const publicKey=Deno.env.get('SUPABASE_ANON_KEY')||JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')||'{}').default;
 const adminKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}').default;
 const adminHeaders={apikey:adminKey,Authorization:'Bearer '+adminKey,'Content-Type':'application/json'};
 const userHeaders={apikey:publicKey,Authorization:authorization,'Content-Type':'application/json'};
 try{
  const auth=await fetch(url+'/auth/v1/user',{headers:userHeaders,signal:AbortSignal.timeout(8000)});
  if(!auth.ok)return reply({error:'Please log in again.'},401);
  const user=await auth.json();if(!user.id)return reply({error:'Please log in again.'},401);
  // Bound the actual body, not just its caller-controlled Content-Length header.
  const reader=req.body?.getReader();let body='',bytes=0;const decoder=new TextDecoder();
  if(!reader)return reply({error:'A message is needed.'},400);
  while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>12000){await reader.cancel();return reply({error:'Please send a shorter message.'},413);}body+=decoder.decode(value,{stream:true});}body+=decoder.decode();
  let input;try{input=JSON.parse(body);}catch{return reply({error:'Invalid request.'},400);}
  if(!input||!['chat','report'].includes(input.kind)||Object.keys(input).some(k=>!['kind','messages'].includes(k)))return reply({error:'Invalid request.'},400);
  let messages=[],evidence;
  if(input.kind==='chat'){
   if(!Array.isArray(input.messages)||input.messages.length<1||input.messages.length>8)return reply({error:'Please start a new short chat.'},400);
   if(input.messages.some(m=>!m||!['user','assistant'].includes(m.role)||typeof m.content!=='string'||!m.content.trim()||m.content.length>(m.role==='user'?600:1600))||input.messages.at(-1).role!=='user'||input.messages.reduce((n,m)=>n+m.content.length,0)>6000)return reply({error:'Please keep messages short.'},400);
   messages=input.messages.map(m=>({role:m.role,content:m.content.trim()}));
  }
  const quota=await fetch(url+'/rest/v1/rpc/claim_nova_request',{method:'POST',headers:adminHeaders,body:JSON.stringify({p_user_id:user.id,p_kind:input.kind}),signal:AbortSignal.timeout(8000)});
  if(!quota.ok)return reply({error:'Nova could not connect. Please try again.'},503);
  if(!await quota.json())return reply({error:'Nova has reached the request limit. Please try again later.'},429);
  if(input.kind==='chat'){
   const safe=safetyReply(messages.at(-1).content);if(safe)return reply({reply:safe});
   // Do not send personal/high-risk earlier messages to the provider either.
   messages=messages.filter(m=>m.role==='assistant'||!safetyReply(m.content));
  }else{
   const data=await fetch(url+'/rest/v1/learner_states?select=state&user_id=eq.'+encodeURIComponent(user.id),{headers:userHeaders,signal:AbortSignal.timeout(8000)});
   if(!data.ok)return reply({error:'Could not read saved learning progress.'},503);
   const rows=await data.json();evidence=learningEvidence(rows[0]?.state);
   if(!evidence.totalFirstAttempts)return reply({report:{overview:'There is not enough practice evidence for a learning insight yet.',strengths:[],practice:[],nextSteps:['Try the first counting level together.','Return after a few independent answers to see what the practice shows.'],forChild:'Every explorer starts with one little discovery.'},evidence,generated:false});
   messages=[{role:'user',content:JSON.stringify(evidence)}];
  }
  let providerKey=Deno.env.get('GROQ_API_KEY');
  if(!providerKey){
   const keyResponse=await fetch(url+'/rest/v1/rpc/nova_provider_key',{method:'POST',headers:adminHeaders,body:'{}',signal:AbortSignal.timeout(8000)});
   if(keyResponse.ok)providerKey=await keyResponse.json();
  }
  if(!providerKey)return reply({error:'Nova’s AI connection is not configured yet.'},503);
  const response=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+providerKey,'Content-Type':'application/json'},body:JSON.stringify({model:'openai/gpt-oss-20b',reasoning_effort:'low',include_reasoning:false,messages:[{role:'system',content:input.kind==='chat'?CHAT_PROMPT:REPORT_PROMPT},...messages],temperature:input.kind==='chat'?.5:.2,max_completion_tokens:input.kind==='chat'?500:1400,...(input.kind==='report'?{response_format:{type:'json_object'}}:{})}),signal:AbortSignal.timeout(18000)});
  if(!response.ok)return reply({error:response.status===429?'Nova is busy right now. Please try again shortly.':'Nova’s AI connection is unavailable. Please try again later.'},response.status===429?429:503);
  const result=await response.json(),text=result.choices?.[0]?.message?.content;
  if(input.kind==='chat')return reply({reply:safeOutput(text)?text:'Let’s try a simple, kid-friendly question. I can help with numbers, nature, or a little joke.'});
  let report;try{report=reportShape(JSON.parse(text),evidence);}catch{
   return reply({report:{overview:'Here is what the saved practice shows. The AI insight could not be verified this time.',strengths:evidence.skills.filter(s=>s.completionEarned).slice(0,3).map(s=>s.name+': level completed; delayed recall is tracked separately.'),practice:evidence.skills.filter(s=>s.firstAttemptMistakes||s.hintAssisted).slice(0,3).map(s=>s.name+': '+s.firstAttemptMistakes+' first-attempt mistakes and '+s.hintAssisted+' hint-assisted attempts.'),nextSteps:['Try a short practice of '+evidence.suggestedNext+'.','Use a picture or objects together, then let your explorer try independently.'],forChild:'Every little practice helps us find what to try next.'},evidence,generated:false});
  }return reply({report,evidence,generated:true});
 }catch{return reply({error:'Nova could not finish that request. Please try again.'},503);}
}
Deno.serve(handle);
