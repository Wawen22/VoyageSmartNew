// Service Worker for VoyageSmart Push Notifications

// Install: activate immediately without waiting
self.addEventListener('install', function (event) {
  console.log('[VoyageSmart SW] Installing...');
  self.skipWaiting();
});

// Activate: claim all clients immediately
self.addEventListener('activate', function (event) {
  console.log('[VoyageSmart SW] Activating...');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (event) {
  console.log('[VoyageSmart SW] Push event received');

  let data = {};

  if (event.data) {
    try {
      data = event.data.json();
      console.log('[VoyageSmart SW] Push payload:', data);
    } catch (e) {
      // Fallback: prova come testo
      const text = event.data.text();
      console.log('[VoyageSmart SW] Push text payload:', text);
      data = { title: 'VoyageSmart', message: text || 'Hai una nuova notifica' };
    }
  } else {
    console.log('[VoyageSmart SW] Push without payload (tickle)');
    data = { title: 'VoyageSmart', message: 'Hai una nuova notifica' };
  }

  const title = data.title || 'VoyageSmart';
  const options = {
    body: data.message || 'Hai una nuova notifica',
    icon: '/logo-voyage_smart.png',
    badge: '/favicon.ico',
    data: {
      link: data.link || '/'
    },
    vibrate: [100, 50, 100],
    actions: [
      {
        action: 'open',
        title: 'Visualizza'
      },
      {
        action: 'close',
        title: 'Chiudi'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  if (event.action === 'close') return;

  const link = event.notification.data.link;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      // Check if there's already a tab open with the app
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url === link && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no tab is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(link);
      }
    })
  );
});
