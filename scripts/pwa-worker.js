/* Retire the former cache-first worker without touching preferences or bookmarks. */
const VERSION = __CACHE_VERSION__;
self.addEventListener("install", event => event.waitUntil(self.skipWaiting()));
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const scope = new URL(self.registration.scope);
    const prefix = `alphazero-archive:${scope.pathname}:`;
    for (const key of await caches.keys()) if (key.startsWith(prefix)) await caches.delete(key);
    await self.registration.unregister();
    const pages = await self.clients.matchAll({type: "window", includeUncontrolled: true});
    await Promise.all(pages.map(async page => {
      const url = new URL(page.url);
      if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
      url.searchParams.set("release", VERSION);
      await page.navigate(url.href).catch(() => {});
    }));
  })());
});
// No fetch handler: HTML and versioned assets now come directly from the server.
