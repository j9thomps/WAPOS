const select=document.querySelector('[data-language-select]');
const defaultLang='es';
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

async function loadLang(lang){
  try{const res=await fetch(`languages/${lang}.json`); const dict=await res.json();
    document.querySelectorAll('[data-i18n]').forEach(el=>{const key=el.dataset.i18n; if(dict[key]) el.textContent=dict[key];});
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{const key=el.dataset.i18nPlaceholder; if(dict[key]) el.setAttribute('placeholder',dict[key]);});
    document.documentElement.lang=lang; localStorage.setItem('waposLang',lang);
  }catch(e){console.warn('Language load failed',e)}
}
if(select){const saved=localStorage.getItem('waposLang')||defaultLang; select.value=saved; loadLang(saved); select.addEventListener('change',e=>loadLang(e.target.value));}

/* Splash (first visit, replayed once per week) */
(function(){
  const splash=document.querySelector('[data-splash]');
  if(!splash) return;
  const mark=splash.querySelector('.splash-mark');
  const SPLASH_KEY='waposSplashSeen';
  const WEEK_MS=7*24*60*60*1000;
  const lastSeen=Number(localStorage.getItem(SPLASH_KEY)||0);
  const shouldShow=(Date.now()-lastSeen)>WEEK_MS;

  function reveal(){
    splash.classList.add('hide');
    localStorage.setItem(SPLASH_KEY,String(Date.now()));
  }

  if(!shouldShow){ splash.classList.add('hide'); return; }

  if(reducedMotion){ reveal(); return; }

  if(mark){ mark.addEventListener('animationend',reveal,{once:true}); }
  else{ setTimeout(reveal,3600); }

  splash.addEventListener('click',()=>{
    if(splash.classList.contains('hide')) return;
    splash.classList.add('skip');
    setTimeout(reveal,300);
  });
})();

/* Header solidifies on scroll */
const header=document.querySelector('.site-header');
function onScroll(){ if(window.scrollY>40) header.classList.add('solid'); else header.classList.remove('solid'); }
if(header){ onScroll(); window.addEventListener('scroll',onScroll,{passive:true}); }

/* Scroll reveals (staggered children handled via CSS nth-child delays) */
const reveals=document.querySelectorAll('.reveal');
if('IntersectionObserver' in window && reveals.length){
  const io=new IntersectionObserver(entries=>{
    entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
  },{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  reveals.forEach(el=>io.observe(el));
}else{ reveals.forEach(el=>el.classList.add('in')); }

/* Contact form → opens visitor's email app addressed to WAPOS, with a brief loading state */
const contactForm=document.querySelector('[data-contact-form]');
if(contactForm){
  contactForm.addEventListener('submit',e=>{
    e.preventDefault();
    const submitBtn=contactForm.querySelector('button[type="submit"]');
    const name=contactForm.querySelector('[name=name]').value.trim();
    const email=contactForm.querySelector('[name=email]').value.trim();
    const message=contactForm.querySelector('[name=message]').value.trim();
    const subject=encodeURIComponent(`WAPOS inquiry from ${name||'website visitor'}`);
    const body=encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
    if(submitBtn) submitBtn.classList.add('is-loading');
    setTimeout(()=>{
      window.location.href=`mailto:hello@wapos.net?subject=${subject}&body=${body}`;
      if(submitBtn) submitBtn.classList.remove('is-loading');
    },450);
  });
}

/* Mobile hamburger drawer (injected so no per-page markup is required) */
(function(){
  const navTop=document.querySelector('.nav-top');
  const navLinks=document.querySelector('.nav-links');
  if(!navTop||!navLinks) return;
  const toggle=document.createElement('button');
  toggle.className='menu-toggle';
  toggle.setAttribute('aria-label','Menu');
  toggle.setAttribute('aria-expanded','false');
  toggle.innerHTML='<span></span><span></span><span></span>';
  navTop.insertBefore(toggle,navTop.firstChild);
  const overlay=document.createElement('div');
  overlay.className='nav-overlay';
  document.body.appendChild(overlay);
  function openDrawer(){
    navLinks.classList.add('nav-open'); overlay.classList.add('show');
    toggle.classList.add('is-open'); toggle.setAttribute('aria-expanded','true');
    document.body.style.overflow='hidden';
  }
  function closeDrawer(){
    navLinks.classList.remove('nav-open'); overlay.classList.remove('show');
    toggle.classList.remove('is-open'); toggle.setAttribute('aria-expanded','false');
    document.body.style.overflow='';
  }
  toggle.addEventListener('click',()=> navLinks.classList.contains('nav-open') ? closeDrawer() : openDrawer());
  overlay.addEventListener('click',closeDrawer);
  navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeDrawer));
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeDrawer(); });
})();

/* Ripple feedback on buttons */
document.querySelectorAll('.btn').forEach(el=>{
  el.addEventListener('pointerdown',e=>{
    const rect=el.getBoundingClientRect();
    const size=Math.max(rect.width,rect.height)*2;
    const ripple=document.createElement('span');
    ripple.className='ripple';
    ripple.style.width=ripple.style.height=size+'px';
    ripple.style.left=(e.clientX-rect.left-size/2)+'px';
    ripple.style.top=(e.clientY-rect.top-size/2)+'px';
    el.appendChild(ripple);
    ripple.addEventListener('animationend',()=>ripple.remove());
  });
});

/* Scroll progress bar (mobile) */
(function(){
  const bar=document.createElement('div');
  bar.className='scroll-progress';
  document.body.appendChild(bar);
  function updateProgress(){
    const h=document.documentElement;
    const scrolled=h.scrollTop||document.body.scrollTop;
    const max=(h.scrollHeight||document.body.scrollHeight)-h.clientHeight;
    bar.style.width=max>0 ? (scrolled/max*100)+'%' : '0%';
  }
  updateProgress();
  window.addEventListener('scroll',updateProgress,{passive:true});
  window.addEventListener('resize',updateProgress);
})();

/* Parallax hero background (skipped for reduced-motion) */
if(!reducedMotion){
  const heroBgs=document.querySelectorAll('.hero-bg');
  if(heroBgs.length){
    let ticking=false;
    function updateParallax(){
      const y=window.scrollY;
      heroBgs.forEach(img=>{ img.style.setProperty('--parallax-y',(y*0.12)+'px'); });
      ticking=false;
    }
    window.addEventListener('scroll',()=>{ if(!ticking){ requestAnimationFrame(updateParallax); ticking=true; } },{passive:true});
  }
}

/* Spring-eased smooth scroll for in-page anchors */
function springScrollTo(target){
  const startY=window.scrollY;
  const endY=target.getBoundingClientRect().top+startY-100;
  if(reducedMotion){ window.scrollTo(0,endY); return; }
  const duration=700;
  const startTime=performance.now();
  const c4=(2*Math.PI)/3;
  function spring(t){ return t===0?0:t===1?1:Math.pow(2,-10*t)*Math.sin((t*10-0.75)*c4)+1; }
  function step(now){
    const t=Math.min((now-startTime)/duration,1);
    window.scrollTo(0,startY+(endY-startY)*spring(t));
    if(t<1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* Global link handling: close mobile drawer, spring-scroll in-page anchors, fade-transition same-site navigation */
document.addEventListener('click',function(e){
  const a=e.target.closest('a');
  if(!a) return;
  const navLinksEl=document.querySelector('.nav-links');
  if(navLinksEl && navLinksEl.classList.contains('nav-open')){
    navLinksEl.classList.remove('nav-open');
    document.querySelector('.nav-overlay')?.classList.remove('show');
    document.querySelector('.menu-toggle')?.classList.remove('is-open');
    document.body.style.overflow='';
  }
  const href=a.getAttribute('href')||'';
  if(href.startsWith('#') && href.length>1){
    const target=document.querySelector(href);
    if(target){ e.preventDefault(); springScrollTo(target); }
    return;
  }
  if(a.target==='_blank'||href.startsWith('mailto:')||href.startsWith('tel:')||href.startsWith('http')||a.hasAttribute('download')||e.metaKey||e.ctrlKey||e.button===1||!href||href==='#') return;
  e.preventDefault();
  document.body.classList.add('page-exit');
  setTimeout(()=>{ window.location.href=href; },280);
});
