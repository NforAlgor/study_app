// Service Worker — handles incoming push notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  const options = {
    body:    data.body,
    icon:    data.icon  || "/icon-192.png",
    badge:   data.badge || "/icon-72.png",
    data:    { url: data.url || "/" },
    vibrate: [200, 100, 200],
    actions: [
      { action: "open",    title: "View Plan" },
      { action: "dismiss", title: "Dismiss"   },
    ],
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});