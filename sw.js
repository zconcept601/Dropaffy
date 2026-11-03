// sw.js — service worker DropAffy (notifications push)
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

// Gestionnaire réseau minimal : requis par certains navigateurs pour proposer l'installation
self.addEventListener('fetch', () => {});

self.addEventListener('push', (event) => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch (_) {}
  event.waitUntil(
    self.registration.showNotification(d.title || 'DropAffy', {
      body: d.body || '',
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      tag: d.id || ('n' + Date.now()),
      renotify: true,
      vibrate: [120, 60, 120],
      data: { url: d.url || './', type: d.type || null, link_id: d.link_id || null },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const d = event.notification.data || {};
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        c.postMessage({ type: 'notif', t: d.type, id: d.link_id });
        if ('focus' in c) return c.focus();
      }
      return self.clients.openWindow(d.url || './');
    })
  );
});
