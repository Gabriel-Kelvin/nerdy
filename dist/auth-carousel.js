import {WORLDS} from './constellation.js';

export function carouselMarkup(){
 const slides=[WORLDS[3],...WORLDS,WORLDS[0]];
 return `<section class="auth-world" aria-roledescription="carousel" aria-label="Explore the four math worlds"><div class="auth-world-viewport"><div class="auth-world-track">${slides.map((w,i)=>`<div class="auth-world-slide" role="group" aria-roledescription="slide" aria-label="${i} of 4: ${w.name}" aria-hidden="${i!==1}"><img src="worlds/${w.asset}" alt="${w.desc}" ${i===1?'fetchpriority="high"':''} draggable="false"></div>`).join('')}</div></div><div class="auth-brand"><span class="brandmark">n</span> nerdy</div><div class="auth-world-copy"><span class="eyebrow" id="auth-world-tag">${WORLDS[0].tag}</span><h1 id="auth-world-name">${WORLDS[0].name}</h1><p id="auth-world-description">${WORLDS[0].desc}</p></div><div class="auth-carousel-controls"><button type="button" data-carousel-prev aria-label="Previous world">←</button><div class="auth-carousel-dots" aria-label="Choose a world">${WORLDS.map((w,i)=>`<button type="button" data-carousel-world="${i}" aria-label="Show ${w.name}" aria-pressed="${i===0}"><span></span></button>`).join('')}</div><button type="button" data-carousel-next aria-label="Next world">→</button><button type="button" data-carousel-pause aria-label="Pause world carousel">Ⅱ</button><span class="auth-carousel-count" aria-hidden="true">1 / 4</span></div></section>`;
}

export function mountCarousel(root){
 const doc=root.ownerDocument,win=doc.defaultView,track=root.querySelector('.auth-world-track');
 const reduced=win.matchMedia('(prefers-reduced-motion: reduce)');
 let index=0,position=1,busy=false,paused=reduced.matches,hover=false,focused=false,timer,fallback,start;
 const pauseButton=root.querySelector('[data-carousel-pause]');
 const settle=()=>{clearTimeout(fallback);if(position===0||position===5){position=position===0?4:1;track.style.transition='none';track.style.transform=`translateX(-${position*100}%)`;track.getBoundingClientRect();}busy=false;};
 function schedule(){clearTimeout(timer);if(!paused&&!hover&&!focused&&!doc.hidden&&root.isConnected)timer=setTimeout(()=>{show(index+1);},6000);}
 function show(next){
  if(busy)return;position=next<0?0:next>3?5:next+1;index=(next+4)%4;busy=!reduced.matches;
  track.style.transition=reduced.matches?'none':'transform 700ms cubic-bezier(.22,.68,.22,1)';track.style.transform=`translateX(-${position*100}%)`;
  root.dataset.world=String(index);root.querySelector('#auth-world-tag').textContent=WORLDS[index].tag;root.querySelector('#auth-world-name').textContent=WORLDS[index].name;root.querySelector('#auth-world-description').textContent=WORLDS[index].desc;root.querySelector('.auth-carousel-count').textContent=`${index+1} / 4`;
  root.querySelectorAll('[data-carousel-world]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.carouselWorld)===index)));
  root.querySelectorAll('.auth-world-slide').forEach((el,i)=>el.setAttribute('aria-hidden',String(i!==index+1)));
  if(busy)fallback=setTimeout(settle,800);else settle();schedule();
 }
 function updatePause(){pauseButton.textContent=paused?'▶':'Ⅱ';pauseButton.setAttribute('aria-label',paused?'Play world carousel':'Pause world carousel');schedule();}
 root.querySelector('[data-carousel-prev]').onclick=()=>show(index-1);
 root.querySelector('[data-carousel-next]').onclick=()=>show(index+1);
 root.querySelectorAll('[data-carousel-world]').forEach(b=>b.onclick=()=>show(Number(b.dataset.carouselWorld)));
 pauseButton.onclick=()=>{paused=!paused;updatePause();};
 root.onmouseenter=()=>{hover=true;schedule();};root.onmouseleave=()=>{hover=false;schedule();};
 root.onfocusin=()=>{focused=true;schedule();};root.onfocusout=e=>{if(!root.contains(e.relatedTarget)){focused=false;schedule();}};
 root.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();show(index+(e.key==='ArrowLeft'?-1:1));}};
 const viewport=root.querySelector('.auth-world-viewport');viewport.onpointerdown=e=>{start={x:e.clientX,y:e.clientY};};viewport.onpointerup=e=>{if(start){const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))show(index+(dx<0?1:-1));}start=null;};viewport.onpointercancel=()=>{start=null;};
 track.addEventListener('transitionend',settle);doc.addEventListener('visibilitychange',schedule);
 const motion=()=>{if(reduced.matches){paused=true;settle();updatePause();}};reduced.addEventListener('change',motion);
 root.dataset.world='0';updatePause();
 return ()=>{clearTimeout(timer);clearTimeout(fallback);doc.removeEventListener('visibilitychange',schedule);reduced.removeEventListener('change',motion);track.removeEventListener('transitionend',settle);};
}
