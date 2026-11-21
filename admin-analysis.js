/* Analyse d'une recherche : membres pouvant répondre, offres similaires, recherches au même besoin */
const LV={strong:['Correspondance forte','#15803d'],medium:['Correspondance moyenne','#b45309'],weak:['Correspondance faible','#6b7280'],insufficient:['Informations insuffisantes','#6b7280']};
const chip=l=>{const[t,c]=LV[l]||LV.insufficient;return `<span class="tag" style="background:${c}1f;color:${c};margin:0">${t}</span>`};
const li=a=>(a||[]).map(x=>`<li>${esc(x)}</li>`).join('');
const sc=(v,l)=>`${l} : ${v==null?'non évalué':v+'/100'}`;
async function analysis(sid){
 sheet(`<h3>Analyse de la recherche</h3>${SK}`);
 const{data,error}=await sb.rpc('admin_get_analysis',{p_search:sid});
 if(error||!data){sheet('<p class="muted">Analyse indisponible.</p><button onclick="closeSheet()">Fermer</button>');return}
 const a=data.analysis,R=data.results||[];
 const act=`<button class="sm ghost" onclick="analysis('${sid}')">${ic('refresh-cw')}Actualiser</button>`;
 if(!a){sheet(`<h3>Analyse de la recherche</h3><p class="muted">Aucune analyse pour cette recherche.</p><button class="sm" onclick="once(this,()=>retryA('${sid}'))">Lancer l'analyse</button>`);return}
 const sm=a.summary||{},c=sm.counts||{};
 const stt={queued:"En file d'attente",running:'En cours',done:'Terminée',failed:'Échec'}[a.status];
 const M=R.filter(r=>r.kind=='member'&&r.admin_status!='removed'),O=R.filter(r=>r.kind=='offer'),S=R.filter(r=>r.kind=='search'),X=R.filter(r=>r.kind=='member'&&r.admin_status=='removed');
 const mem=r=>{const m=r.member||{};return `<div class="card" style="margin:.5rem 0"><div class="who">${av(m)}<div><b>${esc(name(m))}</b><small>${esc([m.profession,m.company,m.city].filter(Boolean).join(' · '))}</small></div>${chip(r.level)}</div><small>${sc(r.relevance,'Pertinence')} · ${sc(r.reliability,'Fiabilité')}${r.admin_status=='kept'?' · Conservé':r.admin_status=='added'?' · Ajouté':''}</small><ul class="muted">${li(r.reasons)}</ul>${(r.missing||[]).length?`<small class="muted">Données manquantes : ${esc(r.missing.join(' ; '))}</small>`:''}<footer><button class="sm ghost" onclick="aprof('${m.id}')">Profil</button><button class="sm bad" onclick="once(this,()=>setM('${sid}','${r.id}','removed'))">Retirer</button>${r.admin_status=='kept'||r.admin_status=='added'?'':`<button class="sm" onclick="once(this,()=>setM('${sid}','${r.id}','kept'))">Conserver</button>`}</footer></div>`};
 const ref=r=>{const m=r.member||{},f=r.ref||{};return `<div class="row"><div><b>${esc(f.title||'')}</b><small>${esc(f.category||'')} · ${esc(name(m))} · ${f.created_at?ago(f.created_at):''} · ${esc(f.status||'')}</small><small class="muted">${esc((r.reasons||[]).join(' ; '))}</small></div>${chip(r.level)}</div>`};
 sheet(`<h3>Analyse de la recherche</h3><p><span class="tag" style="margin:0">${stt}${a.attempts?' · tentative '+a.attempts+'/3':''}</span> ${a.status=='done'?'':act}</p>
 ${a.status=='failed'?`<p class="muted">${esc(a.last_error||'Erreur inconnue')}</p><button class="sm" onclick="once(this,()=>retryA('${sid}'))">Relancer</button>`:''}
 ${a.status=='done'?`<h4>Besoin détecté</h4><p>${esc(sm.need||'')}</p><p class="muted">Catégorie : ${esc(sm.declared_category||'—')} · Lieu : ${esc(sm.location||'non précisé')}</p><p>${(sm.keywords||[]).map(k=>`<span class="tag" style="margin:.1rem">${esc(k)}</span>`).join('')}</p>
 ${(sm.incoherences||[]).length?`<h4>Incohérences</h4><ul>${li(sm.incoherences)}</ul>`:''}
 <p class="muted">${c.members_evaluated||0} profil(s) évalué(s), ${c.members_unassessable||0} non évaluable(s) faute d'informations, ${c.similar_offers||0} offre(s) similaire(s), ${c.same_need_searches||0} recherche(s) au même besoin.</p>
 <h4>Membres pouvant répondre (${M.length})</h4>${M.map(mem).join('')||'<p class="muted">Aucun membre identifié avec les données disponibles.</p>'}
 <div id="addm"></div><button class="sm ghost" onclick="addForm('${sid}','${a.id}')">${ic('user-plus')}Ajouter un membre</button>
 ${X.length?`<h4>Retirés (${X.length})</h4>${X.map(r=>`<div class="row"><div><b>${esc(name(r.member))}</b></div><button class="sm ghost" onclick="once(this,()=>setM('${sid}','${r.id}','suggested'))">Rétablir</button></div>`).join('')}`:''}
 <h4>Offres similaires (${O.length})</h4>${O.map(ref).join('')||'<p class="muted">Aucune.</p>'}
 <h4>Recherches au même besoin (${S.length})</h4><p class="muted">Ces membres cherchent la même chose : ils ne répondent pas au besoin.</p>${S.map(ref).join('')||'<p class="muted">Aucune.</p>'}`:''}
 <p class="muted">Estimations automatiques, sans garantie de sérieux. Les coordonnées privées ne sont jamais affichées.</p><button onclick="closeSheet()">Fermer</button>`);
}
async function setM(sid,id,st){const{error}=await sb.rpc('admin_set_match_status',{p_result:id,p_status:st});if(error)toast('Action impossible.');analysis(sid)}
async function retryA(sid){const{error}=await sb.rpc('admin_retry_analysis',{p_search:sid});toast(error?'Action impossible.':'Analyse relancée.');analysis(sid)}
async function addForm(sid,aid){const{data}=await sb.from('profiles').select('id,first_name,last_name,profession').order('first_name').limit(300);$('#addm').innerHTML=`<select id="addsel">${(data||[]).map(p=>`<option value="${p.id}">${esc(name(p))}${p.profession?' · '+esc(p.profession):''}</option>`).join('')}</select><button class="sm" onclick="once(this,()=>addM('${sid}','${aid}'))">Ajouter</button>`}
async function addM(sid,aid){const{error}=await sb.rpc('admin_add_match',{p_analysis:aid,p_member:$('#addsel').value});toast(error?'Action impossible.':'Membre ajouté.');analysis(sid)}
