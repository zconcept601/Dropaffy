/* Démarrage de l'application membre : session, installation, service worker */
sb.auth.onAuthStateChange((ev,s)=>{const u=s?.user||null;if(ev=='PASSWORD_RECOVERY'){me=u;rec=1;recView();return}if(rec)return;if((u&&u.id)!==(me&&me.id)){me=u;me?start():authView()}});
addEventListener('beforeinstallprompt',e=>{e.preventDefault();ip=e;if(view=='me')V.me()});addEventListener('appinstalled',()=>{ip=null;toast('DropAffy est installé.')});
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
navigator.serviceWorker?.addEventListener('message',ev=>{const d=ev.data;if(d&&d.type=='notif'&&me&&d.t)openN(d.t,d.id||'')});
sb.auth.getSession().then(({data})=>{if(!data.session)authView()});
