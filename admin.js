/* Espace équipe : connexion, accès selon le rôle, navigation par onglets */
const ROLES={owner:'Propriétaire',moderator:'Modérateur',finance:'Finance',support:'Support'};
let me=null,arole=null,atab='pubs';
const can=r=>arole=='owner'||arole==r;
const fd=d=>new Date(d).toLocaleDateString('fr-FR');
/* [id, libellé, icône, visible pour ce rôle ?, fonction d'affichage] */
const TABS=[['pubs','Publications','file-check',()=>true,()=>aPubs()],['pay','Paiements','wallet',()=>can('finance'),()=>aPay()],['team','Équipe','users',()=>can('owner'),()=>aTeam()],['log','Journal','scroll-text',()=>can('owner'),()=>aLog()]];
function loginView(){app.innerHTML=`<section class="auth" style="padding-top:3rem"><b class="logo" style="color:var(--ink)">Drop<i>Affy</i></b><span class="apill" style="background:var(--sky);color:var(--blue)">Équipe</span><h2 style="margin-top:1.5rem">Espace équipe</h2><p class="muted">Accès réservé à l’équipe DropAffy.</p><label>Adresse e-mail<input id="em" type="email" autocomplete="email" inputmode="email"></label><label>Mot de passe<input id="pw" type="password" autocomplete="current-password"></label><p class="err" id="er"></p><button style="width:100%;margin-top:1rem" onclick="once(this,doLogin)">Se connecter</button><p style="text-align:center;margin-top:1.2rem"><a href="index.html?app=1">Application membre</a></p></section>`}
async function doLogin(){const{error}=await sb.auth.signInWithPassword({email:$('#em').value.trim(),password:$('#pw').value});if(error){$('#er').textContent=errFr(error);return}boot()}
function denied(){app.innerHTML=`<section class="auth" style="padding-top:3rem"><b class="logo" style="color:var(--ink)">Drop<i>Affy</i></b><h2 style="margin-top:1.5rem">Accès réservé</h2><p class="muted">Ce compte ne fait pas partie de l’équipe DropAffy.</p><a href="index.html?app=1"><button style="width:100%;margin-top:1rem">Retour à l’application</button></a><button class="ghost" style="width:100%;margin-top:.7rem" onclick="sb.auth.signOut()">Se déconnecter</button></section>`}
function shell(){const T=TABS.filter(t=>t[3]());if(!T.find(t=>t[0]==atab))atab='pubs';
 app.innerHTML=`<header><b class="logo">Drop<i>Affy</i><span class="apill">${ROLES[arole]}</span></b><span class="hb"><a class="alink" href="index.html?app=1">Application</a><button class="bell" onclick="sb.auth.signOut()" aria-label="Se déconnecter">${ic('log-out')}</button></span></header><div class="atabs">${T.map(([k,l,i])=>`<button class="${atab==k?'on':''}" onclick="atab='${k}';shell()">${ic(i)}${l}</button>`).join('')}</div><main><div id="dc">${SK}</div></main>`;
 T.find(t=>t[0]==atab)[4]()}
async function boot(){const{data:{session}}=await sb.auth.getSession();if(!session){me=null;arole=null;loginView();return}
 me=session.user;const{data:r}=await sb.rpc('admin_my_role');arole=r||null;if(!arole){denied();return}shell()}
sb.auth.onAuthStateChange(ev=>{if(ev=='SIGNED_OUT')boot()});
boot();
