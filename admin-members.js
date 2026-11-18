/* Membres (équipe) : liste, fiche de profil, message. Aucune donnée privée : pas de WhatsApp (réservé à la mise en contact entre membres), pas d'e-mail. */
let gq='',gpage=0,glist=[],gtm;
const canMsg=()=>can('moderator')||arole=='support';
async function aMem(){
 $('#dc').innerHTML=`<h2>Membres</h2><div class="sbx">${ic('search')}<input id="gq" type="search" placeholder="Nom, métier ou ville" value="${esc(gq)}" oninput="gsq(this.value)"></div><div id="gl" style="margin-top:.8rem">${SK}</div><div id="gm"></div>`;gpage=0;gload()}
function gsq(v){gq=v;clearTimeout(gtm);gtm=setTimeout(()=>{gpage=0;gload()},350)}
async function gload(){
 let r=sb.from('profiles').select('id,first_name,last_name,profession,city,avatar_url,created_at').order('created_at',{ascending:false}).range(gpage*30,gpage*30+29);
 const t=gq.trim().replace(/[%,()*]/g,'');if(t)r=r.or(`first_name.ilike.%${t}%,last_name.ilike.%${t}%,profession.ilike.%${t}%,city.ilike.%${t}%`);
 const{data,error}=await r;
 if(error){$('#gl').innerHTML='<div class="empty"><b>Chargement impossible</b></div>';return}
 const d=data||[];glist=gpage?glist.concat(d):d;
 $('#gl').innerHTML=glist.map(m=>`<div class="row w" style="cursor:pointer" onclick="mfiche('${m.id}')">${av(m)}<div><b>${esc(name(m))}</b><small>${esc([m.profession,m.city].filter(Boolean).join(' · ')||'Profil incomplet')} · inscrit ${ago(m.created_at)}</small></div></div>`).join('')||'<div class="empty"><b>Aucun membre trouvé</b></div>';
 $('#gm').innerHTML=d.length==30?`<button class="ghost" style="width:100%;margin-top:.8rem" onclick="gpage++;gload()">Charger plus</button>`:''}
async function mfiche(id){
 const[{data:p},{data:of},{data:se}]=await Promise.all([sb.from('profiles').select('*').eq('id',id).single(),sb.from('offers').select('title,status').eq('author_id',id).neq('status','deleted').order('created_at',{ascending:false}).limit(5),sb.from('searches').select('title,status').eq('author_id',id).neq('status','deleted').order('created_at',{ascending:false}).limit(5)]);
 if(!p){toast('Profil introuvable.');return}
 const L=(a,k)=>(a||[]).map(x=>`<div class="row">${k} : ${esc(x.title)}<small>${esc(x.status)}</small></div>`).join('');
 sheet(`<div style="display:flex;gap:1rem;align-items:center">${av(p,'lg')}<div><h2 style="margin:0;font-size:21px">${esc(name(p))}</h2><small>${esc(p.profession||'')}${p.company?' chez '+esc(p.company):''}${p.city?'<br>'+esc(p.city):''}<br>Inscrit ${ago(p.created_at)}</small></div></div>
 ${p.bio?`<p style="margin-top:1rem">${esc(p.bio)}</p>`:''}${(p.activities||[]).length?`<p style="margin-top:.8rem">${p.activities.map(a=>`<span class="tag" style="margin:0 .3rem .3rem 0">${esc(a)}</span>`).join('')}</p>`:''}
 <h4>Publications récentes</h4>${L(of,'Offre')+L(se,'Recherche')||'<p class="muted">Aucune publication.</p>'}
 <p class="muted" style="margin-top:.8rem">Le WhatsApp d'un membre n'est accessible que par mise en contact entre membres.</p>
 ${canMsg()&&id!=me.id?`<button style="width:100%;margin-top:1rem" onclick="once(this,()=>openMsg('${id}'))">${ic('message-circle')}Envoyer un message</button>`:''}
 <button class="ghost" style="width:100%;margin-top:.5rem" onclick="closeSheet()">Fermer</button>`)}
/* Messagerie équipe : une discussion simple (les messages disparaissent après 48 h) */
async function openMsg(id){const{data:cv,error}=await sb.rpc('admin_start_conversation',{p_other:id});if(error){toast('Message impossible.');return}amsg(cv,id)}
async function amsg(cv,id){
 const[{data:p},{data:ms}]=await Promise.all([sb.from('profiles').select('id,first_name,last_name,avatar_url').eq('id',id).single(),sb.from('messages').select('*').eq('conversation_id',cv).gt('created_at',new Date(Date.now()-48*36e5).toISOString()).order('created_at',{ascending:true}).limit(50)]);
 sheet(`<div class="who">${av(p)}<div><b>${esc(name(p))}</b><small>Les messages sont supprimés après 48 h.</small></div></div><div class="msgs" style="margin:1rem 0">${(ms||[]).map(m=>`<div class="m ${m.sender_id==me.id?'me':''}">${esc(m.body)}</div>`).join('')||'<p class="muted">Aucun message.</p>'}</div><div style="display:flex;gap:.5rem"><input id="amb" placeholder="Votre message" maxlength="1000" style="flex:1"><button onclick="once(this,()=>asend('${cv}','${id}'))" aria-label="Envoyer">${ic('send')}</button></div><button class="ghost" style="width:100%;margin-top:.6rem" onclick="closeSheet()">Fermer</button>`)}
async function asend(cv,id){const b=$('#amb').value.trim();if(!b)return;const{error}=await sb.from('messages').insert({conversation_id:cv,sender_id:me.id,body:b});if(error){toast('Envoi impossible.');return}amsg(cv,id)}
