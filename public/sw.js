self.addEventListener('push', function (event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'ImgResizer';
  const options = {
    body: data.body || 'New content is available!',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://imgresizer.xyz')
  );
});
