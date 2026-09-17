import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {carouselMarkup,mountCarousel} from '../dist/auth-carousel.js';
const win=new Window(),doc=win.document;
doc.body.innerHTML=carouselMarkup();
const root=doc.querySelector('.auth-world'),track=root.querySelector('.auth-world-track');
const timers=new Map();let id=0;const originalSet=globalThis.setTimeout,originalClear=globalThis.clearTimeout;
globalThis.setTimeout=(fn,ms)=>{timers.set(++id,{fn,ms});return id;};globalThis.clearTimeout=key=>timers.delete(key);
let stop;
try{
 stop=mountCarousel(root);
 const click=s=>root.querySelector(s).click();
 const settle=()=>track.dispatchEvent(new win.Event('transitionend'));
 const tick=()=>{const pending=[...timers].find(([,t])=>t.ms===6000);assert(pending,'Autoplay scheduled');timers.delete(pending[0]);pending[1].fn();settle();};
 assert.equal(root.querySelectorAll('[data-carousel-world]').length,4);
 for(const index of [1,2,3,0]){tick();assert.equal(root.dataset.world,String(index));}
 assert.equal(track.style.transform,'translateX(-100%)');
 click('[data-carousel-prev]');settle();assert.equal(root.dataset.world,'3');assert.equal(track.style.transform,'translateX(-400%)');
 click('[data-carousel-world="1"]');settle();assert.equal(root.querySelector('#auth-world-name').textContent,'Canopy Grove');assert.equal(root.querySelector('[data-carousel-world="1"]').getAttribute('aria-pressed'),'true');
 click('[data-carousel-pause]');assert(![...timers.values()].some(t=>t.ms===6000));assert.equal(root.querySelector('[data-carousel-pause]').getAttribute('aria-label'),'Play world carousel');
 click('[data-carousel-next]');settle();assert.equal(root.dataset.world,'2');assert(![...timers.values()].some(t=>t.ms===6000));
 root.dispatchEvent(new win.KeyboardEvent('keydown',{key:'ArrowRight'}));settle();assert.equal(root.dataset.world,'3');
 const viewport=root.querySelector('.auth-world-viewport');viewport.dispatchEvent(new win.PointerEvent('pointerdown',{clientX:200,clientY:100}));viewport.dispatchEvent(new win.PointerEvent('pointerup',{clientX:100,clientY:105}));settle();assert.equal(root.dataset.world,'0');
 click('[data-carousel-pause]');root.dispatchEvent(new win.MouseEvent('mouseenter'));assert(![...timers.values()].some(t=>t.ms===6000));root.dispatchEvent(new win.MouseEvent('mouseleave'));assert([...timers.values()].some(t=>t.ms===6000));
 stop();assert.equal(timers.size,0);
 win.matchMedia=()=>({matches:true,addEventListener(){},removeEventListener(){}});stop=mountCarousel(root);assert(![...timers.values()].some(t=>t.ms===6000));click('[data-carousel-next]');assert.equal(root.dataset.world,'1');assert.equal(track.style.transition,'none');stop();
 console.log('Passed: four-world carousel auto-rotation, seamless wrap, manual controls, pause, keyboard, swipe, hover pause, reduced motion, and timer cleanup.');
}finally{stop?.();globalThis.setTimeout=originalSet;globalThis.clearTimeout=originalClear;await win.happyDOM.abort();}
