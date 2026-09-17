export function coachingFacts(q,{mode='hint',selected,step=0}={}){
 const hint=step>0?q.worked:q.hint;
 let observation='';
 if(mode==='wrong'){
  if(typeof q.answer==='number'&&Number.isFinite(Number(selected))){const difference=Number(selected)-q.answer;observation=q.node.startsWith('count')&&q.visual?`You counted ${selected}. That is ${Math.abs(difference)} ${difference>0?'too many':'too few'}.`:q.node==='compare'?`You chose ${selected}; the question asks for the larger group.`:`${selected} does not fit this question yet.`;}
  else observation=`You chose ${selected}. Let’s check how the pieces fit.`;
 }
 return {mode,prompt:q.prompt,display:q.display,selected:mode==='wrong'?String(selected):undefined,correctAnswer:String(q.answer),instruction:hint,observation,reply:[observation,hint].filter(Boolean).join(' '),step};
}
export function validCoaching(reply,facts){if(typeof reply!=='string'||!reply.trim()||reply.length>700)return false;if(/https?:|www\.|\b(stupid|dumb|idiot|loser|hate|sexy|fuck)\b/i.test(reply))return false;const permitted=new Set(JSON.stringify(facts).match(/\d+(?:\.\d+)?/g)||[]);return (reply.match(/\d+(?:\.\d+)?/g)||[]).every(n=>permitted.has(n));}
