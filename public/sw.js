// Service worker for the admin panel: shows order notifications on phones and laptops.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { title: "New notification", body: e.data ? e.data.text() : "" }; }
  const url = typeof d.url === "string" && d.url.startsWith("/") ? d.url : "/admin";
  e.waitUntil(self.registration.showNotification(d.title || "New notification", {
    body: d.body || "",
    icon: "/assets/icon-192.png",
    badge: "/assets/badge-72.png",
    tag: d.tag || undefined,
    renotify: !!d.tag,
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 300],
    data: { url },
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "/admin", self.location.origin).href;
  e.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of list) {
      if (c.url.startsWith(self.location.origin + "/admin")) { await c.focus(); return c.navigate(url); }
    }
    return self.clients.openWindow(url);
  })());
});
