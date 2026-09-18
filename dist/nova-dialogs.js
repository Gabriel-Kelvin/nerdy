// Conversations live only in this closure and are discarded on every close/replacement.
export function mountNovaChat(modal,{avatar,request}){
 let history=[],active=true,pending=false,controller=null,wakeTimer=null;
 modal.className='nova-chat-dialog';
 modal.innerHTML=`<div class="nova-chat-heading">${avatar}<div><h2>Hi, I’m Nova.</h2><p>Your friendly AI learning spark.</p></div><button class="close" id="nova-close" aria-label="Close chat">×</button></div><div class="nova-chat-log" role="log" aria-live="polite" aria-label="Chat with Nova"><p class="nova-bubble assistant">What are you curious about? Ask me a question, or we can try a little joke.</p></div><div class="nova-chat-starters"><button type="button">Tell me a joke</button><button type="button">Will you be my friend?</button></div><form id="nova-chat-form"><label class="nova-input-label" for="nova-message">Your message</label><div class="nova-compose"><input id="nova-message" maxlength="600" autocomplete="off" placeholder="Say hello or ask a question…" required><button class="primary" type="submit" aria-label="Send message">Send</button></div></form><p class="nova-chat-status" role="status"></p><p class="nova-chat-note">Chat clears when you close. Keep private details out.<br>Replies use Groq AI and can make mistakes. Nerdy doesn’t save messages.</p>`;
 const find=s=>modal.querySelector(s),log=find('.nova-chat-log'),input=find('#nova-message'),submit=find('[type="submit"]'),status=find('.nova-chat-status');
 const add=(text,role)=>{const p=modal.ownerDocument.createElement('p');p.className='nova-bubble '+role;p.textContent=text;log.append(p);log.scrollTop=log.scrollHeight;return p;};
 async function send(text){
  text=text.trim();if(!active||pending||!text)return;
  pending=true;input.value='';input.disabled=true;submit.disabled=true;status.textContent='Nova is thinking…';wakeTimer=setTimeout(()=>{if(active&&pending)status.textContent='Nova is waking up. The first reply after a break can take a little longer…';},7000);
  find('.nova-chat-starters')?.remove();add(text,'user');controller=new AbortController();
  // Keep only a small in-memory context. Never call account save with these messages.
  const messages=[...history.slice(-6),{role:'user',content:text}];
  try{const result=await request('chat',messages,controller.signal);if(!active)return;add(result.reply,'assistant');history=[...messages,{role:'assistant',content:result.reply}].slice(-6);status.textContent='';}
  catch(e){if(!active||controller.signal.aborted)return;status.textContent=e.name==='TimeoutError'?'Nova took too long. Please try again.':e.message;input.value=text;}
  finally{clearTimeout(wakeTimer);wakeTimer=null;if(active){pending=false;input.disabled=false;submit.disabled=false;input.focus();}}
 }
 find('#nova-chat-form').onsubmit=e=>{e.preventDefault();void send(input.value);};
 modal.querySelectorAll('.nova-chat-starters button').forEach(b=>b.onclick=()=>void send(b.textContent));
 const onClose=()=>{if(!modal.open)dispose();};
 const dispose=()=>{if(!active)return;active=false;history=[];clearTimeout(wakeTimer);controller?.abort();modal.removeEventListener('close',onClose);modal.removeEventListener('cancel',dispose);modal.innerHTML='';};
 find('#nova-close').onclick=()=>{dispose();modal.close();};modal.addEventListener('close',onClose);modal.addEventListener('cancel',dispose);
 modal.showModal();input.focus();return dispose;
}

export function mountLearningInsight(modal,{name,request}){
 let active=true,controller=null;
 modal.className='nova-insight-dialog';
 modal.innerHTML='<div class="insight-title"><div><span class="nova-kicker">NOVA’S LEARNING INSIGHT</span><h2></h2></div><button class="close" id="insight-close" aria-label="Close insight">×</button></div><p class="insight-note">Based on saved math practice. AI can make mistakes; this is a learning snapshot, not an assessment of personality or ability.</p><div id="insight-content" aria-live="polite"></div><button class="secondary" id="insight-retry" hidden>Try again</button><p class="nova-chat-note">A summary of practice evidence is sent to Groq to write this insight. Chat messages and your child’s name are not included.</p>';
 modal.querySelector('h2').textContent='What do I know about '+name+'?';const content=modal.querySelector('#insight-content'),retry=modal.querySelector('#insight-retry');
 const section=(title,items)=>{if(!items?.length)return;const box=modal.ownerDocument.createElement('section'),h=modal.ownerDocument.createElement('h3'),list=modal.ownerDocument.createElement('ul');h.textContent=title;items.forEach(text=>{const li=modal.ownerDocument.createElement('li');li.textContent=text;list.append(li);});box.append(h,list);content.append(box);};
 async function generate(){retry.hidden=true;content.textContent='Reading the learning evidence…';controller=new AbortController();try{const data=await request('report',undefined,controller.signal);if(!active)return;content.replaceChildren();if(!data.generated){const tag=modal.ownerDocument.createElement('p');tag.className='insight-note';tag.textContent='Practice summary';content.append(tag);}const p=modal.ownerDocument.createElement('p');p.textContent=data.report.overview;content.append(p);section('What is going well',data.report.strengths);section('Where a little help may be useful',data.report.practice);section('Try together',data.report.nextSteps);section('A note for your explorer',[data.report.forChild]);const facts=modal.ownerDocument.createElement('p');facts.className='insight-facts';facts.textContent=`${data.evidence.completedLevels.length} levels completed · ${data.evidence.totalFirstAttempts} first attempts · ${data.evidence.practiceDays} practice days`;content.append(facts);section('From the practice record',data.evidence.skills?.map(s=>`${s.name}: ${s.independentCorrect} of ${s.attempts} first attempts correct without hints; ${s.firstAttemptMistakes} first-attempt mistakes; ${s.hintAssisted} attempts with a hint; ${s.successfulDelayedChecks} successful delayed checks.`));}catch(e){if(!active||controller.signal.aborted)return;content.textContent=e.name==='TimeoutError'?'The insight took too long. Please try again.':e.message;retry.hidden=false;}}
 const onClose=()=>{if(!modal.open)dispose();};
 const dispose=()=>{if(!active)return;active=false;controller?.abort();modal.removeEventListener('close',onClose);modal.removeEventListener('cancel',dispose);modal.innerHTML='';};
 retry.onclick=()=>void generate();modal.querySelector('#insight-close').onclick=()=>{dispose();modal.close();};modal.addEventListener('close',onClose);modal.addEventListener('cancel',dispose);modal.showModal();void generate();return dispose;
}
