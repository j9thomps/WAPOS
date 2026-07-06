const select=document.querySelector('[data-language-select]');
const defaultLang='es';
async function loadLang(lang){
  try{const res=await fetch(`languages/${lang}.json`); const dict=await res.json();
    document.querySelectorAll('[data-i18n]').forEach(el=>{const key=el.dataset.i18n; if(dict[key]) el.textContent=dict[key];});
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{const key=el.dataset.i18nPlaceholder; if(dict[key]) el.setAttribute('placeholder',dict[key]);});
    document.documentElement.lang=lang; localStorage.setItem('waposLang',lang);
  }catch(e){console.warn('Language load failed',e)}
}
if(select){const saved=localStorage.getItem('waposLang')||defaultLang; select.value=saved; loadLang(saved); select.addEventListener('change',e=>loadLang(e.target.value));}

/* Intro (first visit only) */
const intro=document.querySelector('.intro');
if(intro){ if(localStorage.getItem('waposIntroSeen')) intro.classList.add('hide'); else setTimeout(()=>{intro.classList.add('hide');localStorage.setItem('waposIntroSeen','1')},3000); }

/* Header solidifies on scroll */
const header=document.querySelector('.site-header');
function onScroll(){ if(window.scrollY>40) header.classList.add('solid'); else header.classList.remove('solid'); }
if(header){ onScroll(); window.addEventListener('scroll',onScroll,{passive:true}); }

/* Scroll reveals */
const reveals=document.querySelectorAll('.reveal');
if('IntersectionObserver' in window && reveals.length){
  const io=new IntersectionObserver(entries=>{
    entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
  },{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  reveals.forEach(el=>io.observe(el));
}else{ reveals.forEach(el=>el.classList.add('in')); }

/* Contact form → opens visitor's email app addressed to WAPOS */
const contactForm=document.querySelector('[data-contact-form]');
if(contactForm){
  contactForm.addEventListener('submit',e=>{
    e.preventDefault();
    const name=contactForm.querySelector('[name=name]').value.trim();
    const email=contactForm.querySelector('[name=email]').value.trim();
    const message=contactForm.querySelector('[name=message]').value.trim();
    const subject=encodeURIComponent(`WAPOS inquiry from ${name||'website visitor'}`);
    const body=encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
    window.location.href=`mailto:hello@wapos.net?subject=${subject}&body=${body}`;
  });
}
