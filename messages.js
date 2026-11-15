/* Messagerie : discussion en temps réel (messages supprimés après 48 h) et liste des discussions */
function onSheetClose(){if(ch){sb.removeChannel(ch);ch=null}}
async function chat(other){const[{data:o},{data:c}]=await Promise.all([sb.from('profiles').select('id,first_name,last_name,profession,avatar_url').eq('id',other).single(),sb.from('conversations').select('id').or(`and(user_a.eq.${me.id},user_b.eq.${other}),and(user_a.eq.${other},user_b.eq.${me.id})`).order('created_at').limit(1)]);
let id=c&&c[0]?.id;if(!id){const r=await sb.rpc('start_conversation',{p_other:other});if(r.error){toast('Discussion impossible.');return}id=r.data}
sheet(`<div class="row" style="padding:0;background:none">${av(o)}<div><b>${esc(name(o))}</b><small>${esc(o?.profession||'')}</small></div></div><small class="muted">Les messages sont supprimés après 48 h.</small><div id="oldb"></div><div class="msgs" id="ms"><small>Chargement…</small></div><div class="send"><input id="mi" placeholder="Votre message" maxlength="4000" onkeydown="if(event.key=='Enter')sendMsg('${id}')"><button onclick="once(this,()=>sendMsg('${id}'))" aria-label="Envoyer">${ic('send')}</button></div>`);
await older(id);ch=sb.channel('c'+id).on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:'conversation_id=eq.'+id},p=>bub(p.new)).subscribe()}
async function older(id,before){let r=sb.from('messages').select('*').eq('conversation_id',id).gt('created_at',new Date(Date.now()-48*36e5).toISOString()).order('created_at',{ascending:false}).limit(40);if(before)r=r.lt('created_at',before);const{data,error}=await r,ms=$('#ms');if(!ms)return;
if(error){ms.innerHTML='<small>Messages indisponibles. Fermez puis rouvrez la discussion.</small>';return}
if(!before)ms.innerHTML=data.length?'':'<small id="nom">Aucun message. Écrivez le premier.</small>';
if(before)data.forEach(m=>bub(m,1));else[...data].reverse().forEach(m=>bub(m));
$('#oldb').innerHTML=data.length==40?`<button class="ghost sm" style="width:100%" onclick="older('${id}','${data[data.length-1].created_at}')">Messages précédents</button>`:''}
function bub(m,top){const ms=$('#ms');if(!ms||document.getElementById('m'+m.id))return;$('#nom')?.remove();ms.insertAdjacentHTML(top?'afterbegin':'beforeend',`<div id="m${m.id}" class="m ${m.sender_id==me.id?'me':''}">${esc(m.body)}<small>${hm(m.created_at)}</small></div>`);if(!top)ms.scrollTop=1e9}
async function sendMsg(id){const i=$('#mi'),b=i.value.trim();if(!b)return;i.value='';const{data,error}=await sb.from('messages').insert({conversation_id:id,sender_id:me.id,body:b}).select().single();if(error){i.value=b;toast('Message non envoyé. Réessayez.')}else bub(data)}
async function chatConv(id){const{data:c}=await sb.from('conversations').select('user_a,user_b').eq('id',id).single();if(!c){toast('Conversation introuvable.');return}chat(c.user_a==me.id?c.user_b:c.user_a)}
async function convList(){
 sheet(`<h3>Messages</h3>${SK}`);
 const{data:cs}=await sb.from('conversations').select('id,user_a,user_b,created_at').or(`user_a.eq.${me.id},user_b.eq.${me.id}`).order('created_at',{ascending:false});
 const ids=(cs||[]).map(c=>c.user_a==me.id?c.user_b:c.user_a);
 const{data:ps}=ids.length?await sb.from('profiles').select('id,first_name,last_name,profession,avatar_url').in('id',ids):{data:[]};
 const pm=Object.fromEntries((ps||[]).map(x=>[x.id,x]));
 sheet(`<h3>Messages</h3><p class="muted">Les messages sont supprimés automatiquement après 48 h.</p>${ids.filter(i=>pm[i]).map(i=>`<div class="row" onclick="chat('${i}')" style="cursor:pointer">${av(pm[i])}<div><b>${esc(name(pm[i]))}</b><small>${esc(pm[i].profession||'')}</small></div>${ic('chevron-right')}</div>`).join('')||'<p class="muted">Aucune discussion pour le moment. Vos contacts acceptés se trouvent dans l\'onglet Contacts.</p>'}<button class="ghost" style="margin-top:1rem;width:100%" onclick="closeSheet()">Fermer</button>`)}
