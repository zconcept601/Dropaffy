/* Application membre : état partagé, en-tête, navigation, transitions et barre de progression */
let ip=null,nch=null,pim=[],me=null,view='home',kind='offers',q='',items=[],page=0,more=false,mine=new Set(),ch=null,authMode='in',dtab='over',rec=0,tm,pkind='offers';
const V={};
function shell0(inner){app.innerHTML=`<header><b class="logo">Drop<i>Affy</i></b><span class="hb"><button class="bell" onclick="convList()" aria-label="Messages">${ic('message-circle')}</button><button class="bell" onclick="go('notifs')" aria-label="Notifications">${ic('bell')}<em id="nb" hidden></em></button></span></header><main>${inner}</main><nav>${[['home','Accueil','house'],['new','Publier','plus'],['contacts','Contacts','users'],['dash','Activité','layout-dashboard'],['me','Profil','user']].map(([k,l,i])=>`<button class="${view==k?'on':''} ${k=='new'?'pub':''}" data-k="${k}" onclick="go('${k}')"><span>${ic(i)}</span>${l}</button>`).join('')}</nav>`;badge()}
async function badge(){const{count}=await sb.from('notifications').select('id',{count:'exact',head:true}).eq('user_id',me.id).eq('is_read',false);const b=$('#nb');if(b&&count){b.hidden=false;b.textContent=count>99?'99+':count}}
function go(v){view=v;scrollTo(0,0);bar(1);V[v]()}
document.body.insertAdjacentHTML('beforeend','<div id="nbar"></div>');
const NC={};let lastV=null,bt,ct;
const ckey=()=>(me?me.id:'')+'|'+view+'|'+dtab+'|'+kind;
function bar(on){const b=$('#nbar');if(!b)return;clearTimeout(bt);if(on){b.style.transition='none';b.style.width='0';void b.offsetWidth;b.style.transition='';b.classList.add('on');b.style.width='70%';bt=setTimeout(()=>bar(0),6000)}else{b.style.width='100%';bt=setTimeout(()=>{b.classList.remove('on');b.style.width='0'},300)}}
function shell(inner){
 const m=app.querySelector('main'),first=!m||!app.querySelector('header'),k=ckey(),st=inner.includes('class="sk"')&&NC[k];
 if(first){shell0(inner);if(st)app.querySelector('main').innerHTML=st}
 else{m.innerHTML=st||inner;app.querySelectorAll('nav>button').forEach(b=>b.classList.toggle('on',b.dataset.k==view))}
 const mm=app.querySelector('main');
 if(first||view!=lastV){mm.classList.remove('enter','anim');void mm.offsetWidth;mm.classList.add('enter');if(!st)mm.classList.add('anim')}
 lastV=view}
function countUp(b){b.dataset.c=1;const t=b.textContent.trim();if(!/^\d+$/.test(t)||+t<2)return;const n=+t,s0=performance.now();(function f(now){const p=Math.min((now-s0)/600,1);b.textContent=Math.round(n*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)})(s0)}
new MutationObserver(()=>{const m=app.querySelector('main');if(!m)return;m.querySelectorAll('.tile b:not([data-c])').forEach(countUp);if(!m.querySelector('.sk')){bar(0);clearTimeout(ct);ct=setTimeout(()=>{if(!m.querySelector('.sk'))NC[ckey()]=m.innerHTML},400)}}).observe(app,{childList:true,subtree:true});
