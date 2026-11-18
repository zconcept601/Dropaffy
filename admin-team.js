/* Équipe (propriétaire) : membres de l'équipe, liste de tous les membres, choix du rôle, journal */
const AL={pub_validated:'Publication validée',pub_rejected:'Publication refusée',payment_confirmed:'Paiement confirmé',payment_rejected:'Paiement rejeté',team_added:"Membre ajouté à l'équipe",team_role:'Rôle modifié',team_removed:"Membre retiré de l'équipe",match_added:'Membre ajouté à une analyse',match_retry:'Analyse relancée',admin_message:'Discussion ouverte avec un membre'};
const rsel=(v,x='')=>`<select ${x}>${Object.entries(ROLES).map(([k,l])=>`<option value="${k}" ${k==v?'selected':''}>${l}</option>`).join('')}</select>`;
let mq='',mpage=0,mlist=[],mtm;
async function aTeam(){const{data:T,error}=await sb.rpc('admin_list_team');
 if(error){$('#dc').innerHTML='<div class="empty"><b>Chargement impossible</b><br><button style="margin-top:1rem" onclick="aTeam()">Réessayer</button></div>';return}
 $('#dc').innerHTML=`<h2>Équipe (${(T||[]).length})</h2>${(T||[]).map(t=>`<div class="row w"><div><b>${esc(t.name||t.email||'')}</b><small>${esc(t.email||'')}</small></div><span class="acts">${rsel(t.role,`onchange="once(this,()=>setRole('${t.user_id}',this.value))"`)}${t.user_id==me.id?'':`<button class="sm bad" onclick="once(this,()=>rmMember('${t.user_id}'))" aria-label="Retirer de l'équipe">${ic('x')}</button>`}</span></div>`).join('')}
 <p class="muted" style="margin-top:.6rem"><b>Propriétaire</b> : tous les droits. <b>Modérateur</b> : valide ou refuse les publications. <b>Finance</b> : confirme ou rejette les paiements. <b>Support</b> : consultation seule.</p>
 <h4>Membres de la plateforme</h4><div class="sbx">${ic('search')}<input id="mq" type="search" placeholder="Nom, ville ou e-mail" value="${esc(mq)}" oninput="msq(this.value)"></div><p class="muted" style="margin:.6rem 0">Choisissez un rôle puis touchez Ajouter pour faire entrer un membre dans l'équipe.</p><div id="ml">${SK}</div><div id="mm"></div>`;
 mpage=0;mload()}
function msq(v){mq=v;clearTimeout(mtm);mtm=setTimeout(()=>{mpage=0;mload()},350)}
async function mload(){const{data,error}=await sb.rpc('admin_list_members',{p_search:mq||null,p_limit:30,p_offset:mpage*30});
 if(error){$('#ml').innerHTML='<div class="empty"><b>Chargement impossible</b></div>';return}
 const d=data||[];mlist=mpage?mlist.concat(d):d;
 $('#ml').innerHTML=mlist.map(m=>`<div class="row w">${av(m)}<div><b>${esc(name(m))}</b><small>${esc([m.profession,m.city].filter(Boolean).join(' · '))}${m.profession||m.city?' · ':''}inscrit le ${fd(m.created_at)} · ${m.pubs} publication${m.pubs>1?'s':''}</small><small>${esc(m.email||'')}</small></div><span class="acts">${m.team_role?`<span class="tag" style="margin:0">${ROLES[m.team_role]||esc(m.team_role)}</span>`:`${rsel('moderator',`id="mr-${m.id}"`)}<button class="sm" onclick="once(this,()=>addFromList('${m.id}'))">${ic('user-plus')}Ajouter</button>`}</span></div>`).join('')||'<div class="empty"><b>Aucun membre trouvé</b></div>';
 $('#mm').innerHTML=d.length==30?`<button class="ghost" style="width:100%;margin-top:.8rem" onclick="mpage++;mload()">Charger plus</button>`:''}
async function addFromList(id){const m=mlist.find(x=>x.id==id);if(!m||!m.email)return;const r=$('#mr-'+id).value;if(!confirm(`Ajouter ${name(m)} à l'équipe avec le rôle ${ROLES[r]} ?`))return;
 const{error}=await sb.rpc('admin_add_member',{p_email:m.email,p_role:r});toast(error?(error.message||'Action impossible.'):'Membre ajouté à l\'équipe.');aTeam()}
async function setRole(u,r){const{error}=await sb.rpc('admin_set_role',{p_user:u,p_role:r});toast(error?(error.message||'Action impossible.'):'Rôle mis à jour.');aTeam()}
async function rmMember(u){if(!confirm("Retirer ce membre de l'équipe ?"))return;const{error}=await sb.rpc('admin_remove_member',{p_user:u});toast(error?(error.message||'Action impossible.'):'Membre retiré.');aTeam()}
async function aLog(){const{data:L,error}=await sb.rpc('admin_audit_list',{p_limit:60});
 if(error){$('#dc').innerHTML='<div class="empty"><b>Chargement impossible</b></div>';return}
 $('#dc').innerHTML=`<h2>Journal d'activité</h2>${(L||[]).map(l=>`<div class="row"><div><b>${AL[l.action]||esc(l.action)}</b><small>${esc(l.actor_name||'')} · ${ago(l.created_at)}${l.details&&(l.details.title||l.details.role)?' · '+esc(l.details.title||ROLES[l.details.role]||''):''}</small></div></div>`).join('')||'<div class="empty"><b>Aucune action enregistrée</b></div>'}`}
