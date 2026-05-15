// Stale service-worker cleanup. This project does not register a SW,
// but localhost:3000 may have one cached from a previous unrelated
// project (origins are shared). This stub installs immediately, takes
// control, then unregisters itself and reloads open clients so the
// dead registration is gone after one visit.

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) client.navigate(client.url);
    })(),
  );
});
