// push.js — abonnement aux notifications push pour DropAffy
// Utilisation : appeler enablePush(supabase) depuis un clic (bouton « Activer les notifications »).
// `supabase` = ton client supabase-js déjà connecté (utilisateur authentifié).

const VAPID_PUBLIC_KEY =
  'BJdEG4SOpigAyptJ88jn8F0HrXaHuTcYbrtVAwuWrMy4s7o91pt6FSWZMRzjZGQW-ZAHuK-oI5VTGJsvTKbYEkU';

function urlBase64ToUint8Array(base64) {
  const pad = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export async function enablePush(supabase) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    return { ok: false, reason: 'unsupported' };
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return { ok: false, reason: 'denied' };

  // sw.js doit être à la racine du site ; le chemin relatif fonctionne sur GitHub Pages (/DropAffy/)
  const reg = await navigator.serviceWorker.register('./sw.js');
  await navigator.serviceWorker.ready;

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  const json = sub.toJSON();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: 'not_signed_in' };

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: user.id,
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
      user_agent: navigator.userAgent,
    },
    { onConflict: 'endpoint' }
  );
  if (error) return { ok: false, reason: 'db', error };
  return { ok: true };
}

export async function disablePush(supabase) {
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = reg && (await reg.pushManager.getSubscription());
  if (!sub) return;
  await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
  await sub.unsubscribe();
}
