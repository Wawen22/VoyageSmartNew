// Service Worker for VoyageSmart Push Notifications

self.addEventListener('push', function (event) {
  if (!event.data) return;

  const data = event.data.json();
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
