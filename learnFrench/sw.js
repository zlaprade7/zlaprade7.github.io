/* Français Familier — offline service worker.
   Cache-first so the app (and its embedded audio) runs with no signal.
   Bump CACHE after any redeploy to force clients to pick up the new files. */
const CACHE = 'ff-v11';

/* Files worth pre-caching on install. The big app HTML is cached on first
   fetch by the handler below, so it doesn't need to be listed by name —
   that keeps this working whether the file is index.html or francais-*.html. */
const CORE = [
  './',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(CORE).catch(() => {}))  // don't fail install if one 404s
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === location.origin;
  const isFont = url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com';

  // Only take over app assets + the Google Fonts they use. Everything else
  // (e.g. optional online-TTS fallbacks) goes straight to the network.
  if (!sameOrigin && !isFont) return;

  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        // Cache successful responses, including opaque cross-origin font blobs.
        if (res && (res.ok || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match('./')); // offline + uncached → fall back to app shell
    })
  );
});
