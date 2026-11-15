/* Connexion, inscription, mot de passe oublié, démarrage de la session (et redirection de l'équipe) */
function authView(){rec=0;sessionStorage.removeItem('app_ok');const up=authMode=='up',fg=authMode=='fg';app.innerHTML=`<section class="hero"><b class="logo">Drop<i>Affy</i></b><h1 style="margin-top:2rem">Vos publications créent vos opportunités.</h1><p>La communauté professionnelle des entrepreneurs, fournisseurs et prestataires d'Afrique de l'Ouest.</p><div class="mini"><b>Cherche fournisseur de riz</b><br>Ouagadougou</div><div class="mini b"><b>Offre : onduleurs solaires</b><br>Bobo-Dioulasso</div></section>
<section class="auth">${fg?'<h2 style="margin-top:.5rem">Mot de passe oublié</h2><p class="muted">Nous vous envoyons un lien pour choisir un nouveau mot de passe.</p>':`<div class="seg" style="margin-top:.5rem"><button class="${up?'':'on'}" onclick="authMode='in';authView()">Connexion</button><button class="${up?'on':''}" onclick="authMode='up';authView()">Créer un compte</button></div>`}
${up?`<label>Prénom<input id="fn" autocomplete="given-name"></label><label>Nom<input id="ln" autocomplete="family-name"></label>`:''}
<label>Adresse e-mail<input id="em" type="email" autocomplete="email" inputmode="email"></label>${fg?'':`<label>Mot de passe<input id="pw" type="password" autocomplete="${up?'new-password':'current-password'}"></label>`}
<p class="err" id="er"></p><button style="width:100%;margin-top:1rem" onclick="once(this,doAuth)">${fg?'Envoyer le lien':up?'Créer mon compte':'Me connecter'}</button>
<p style="text-align:center;margin-top:1.1rem">${authMode=='in'?`<a href="#" onclick="authMode='fg';authView();return false">Mot de passe oublié ?</a>`:fg?`<a href="#" onclick="authMode='in';authView();return false">Retour à la connexion</a>`:''}</p><p class="muted" style="margin-top:.6rem;text-align:center"><small>Inscription et consultation gratuites.</small></p></section>`}
const ok=(e,t)=>{e.style.color='var(--ok)';e.textContent=t};
async function doAuth(){const em=$('#em').value.trim(),pw=$('#pw')?.value||'',er=$('#er');er.style.color='';er.textContent='';let r;
if(!em){er.textContent='Saisissez votre adresse e-mail.';return}
if(authMode=='fg'){r=await sb.auth.resetPasswordForEmail(em,{redirectTo:loc()});r.error?er.textContent=errFr(r.error):ok(er,'Lien envoyé. Consultez votre boîte e-mail.');return}
if(pw.length<6){er.textContent='Mot de passe : 6 caractères minimum.';return}
if(authMode=='up'){const fn=$('#fn').value.trim();if(!fn){er.textContent='Saisissez votre prénom.';return}
r=await sb.auth.signUp({email:em,password:pw,options:{emailRedirectTo:loc(),data:{first_name:fn,last_name:$('#ln').value.trim()}}});if(!r.error&&!r.data.session){ok(er,'Compte créé. Confirmez votre e-mail puis connectez-vous.');return}}
else r=await sb.auth.signInWithPassword({email:em,password:pw});
if(r.error)er.textContent=errFr(r.error)}
function recView(){app.innerHTML=`<section class="auth" style="padding-top:3rem"><b class="logo" style="color:var(--ink)">Drop<i>Affy</i></b><h2 style="margin-top:1.5rem">Nouveau mot de passe</h2><label>Nouveau mot de passe<input id="pw" type="password" autocomplete="new-password"></label><p class="err" id="er"></p><button style="width:100%;margin-top:1rem" onclick="once(this,setPw)">Enregistrer</button></section>`}
async function setPw(){const p=$('#pw').value;if(p.length<6){$('#er').textContent='6 caractères minimum.';return}const{error}=await sb.auth.updateUser({password:p});if(error){$('#er').textContent=errFr(error);return}rec=0;toast('Mot de passe modifié.');start()}
async function start(){
 await sb.rpc('ensure_profile');
 if(new URLSearchParams(location.search).has('app'))sessionStorage.setItem('app_ok','1');
 const{data:role}=await sb.rpc('admin_my_role');
 if(role&&!sessionStorage.getItem('app_ok')){location.replace('admin.html');return} /* l'équipe est dirigée vers son espace */
 if(nch)sb.removeChannel(nch);
 nch=sb.channel('nt').on('postgres_changes',{event:'INSERT',schema:'public',table:'notifications',filter:'user_id=eq.'+me.id},()=>{badge();toast('Nouvelle notification.')}).subscribe();
 go('home')}
