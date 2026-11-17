/* Socle commun (application membre + espace équipe) : connexion Supabase et petits outils */
const sb=supabase.createClient('https://fodmqtpaxygjoimuvvaw.supabase.co','sb_publishable_17TCsv957eSSrQIg_8BwDg_q6jSFNkB');
const $=s=>document.querySelector(s),app=$('#app'),loc=()=>location.origin+location.pathname;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const name=p=>(p&&`${p.first_name||''} ${p.last_name||''}`.trim())||'Membre';
const hue=s=>[...s].reduce((a,c)=>a+c.charCodeAt(0),0)%360;
const av=(p,z='')=>{const n=name(p);return `<span class="av ${z}" style="background:hsl(${hue(n)} 60% 92%);color:hsl(${hue(n)} 55% 28%)">${p&&p.avatar_url?`<img src="${esc(p.avatar_url)}" alt="" loading="lazy">`:esc(n.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase())}</span>`};
const ago=d=>{const m=(Date.now()-new Date(d))/6e4;return m<1?"à l'instant":m<60?`il y a ${m|0} min`:m<1440?`il y a ${m/60|0} h`:`il y a ${m/1440|0} j`};
const hm=d=>new Date(d).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
const tl=d=>{if(!d)return '';const m=(new Date(d)-Date.now())/6e4;return m<=0?'Expirée':m<60?`Expire dans ${Math.max(1,Math.round(m))} min`:m<2880?`Expire dans ${Math.floor(m/60)} h`:`Expire dans ${Math.floor(m/1440)} j`};
const gone=(d,n)=>tl(new Date(+new Date(d)+n*864e5)).replace('Expire','Disparaît');
const ic=(n,c='')=>`<i data-lucide="${n}" class="${c}"></i>`;
const SK='<div class="sk"></div><div class="sk"></div><div class="sk"></div>';
const imgs=a=>a&&a.length?`<div class="imgs">${a.map(u=>`<img src="${esc(u)}" alt="" loading="lazy">`).join('')}</div>`:'';
const errFr=e=>{const m=(e?.message||'').toLowerCase();return m.includes('invalid login')?'E-mail ou mot de passe incorrect.':m.includes('not confirmed')?"Confirmez d'abord votre adresse e-mail.":m.includes('already registered')?'Un compte existe déjà avec cet e-mail.':m.includes('at least')?'Mot de passe trop court (6 caractères minimum).':m.includes('rate')||m.includes('seconds')?'Trop de tentatives. Réessayez dans quelques minutes.':m.includes('valid email')||m.includes('invalid format')?'Adresse e-mail invalide.':m.includes('fetch')||m.includes('network')?'Connexion Internet instable. Réessayez.':'Une erreur est survenue. Réessayez.'};
let lt;new MutationObserver(()=>{clearTimeout(lt);lt=setTimeout(()=>window.lucide&&lucide.createIcons(),0)}).observe(document.body,{childList:true,subtree:true});
async function once(b,f){if(b.disabled)return;b.disabled=true;try{await f()}finally{b.disabled=false}}
function toast(t){const e=$('#toast');e.textContent=t;e.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.display='none',3800)}
function sheet(h){const s=$('#sheet');s.innerHTML=`<div class="panel">${h}</div>`;s.classList.add('on')}
function closeSheet(){$('#sheet').classList.remove('on');if(typeof onSheetClose=='function')onSheetClose()}
