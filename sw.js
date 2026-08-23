const CACHE_NAME = 'holli-shell-v2';
const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Ne gère que la navigation et les fichiers de l'app shell.
// Tout le reste (Firebase, Google Sheets, fonts, Tailwind CDN) passe directement au réseau
// pour ne jamais servir de données ou d'auth périmées.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isShellAsset = url.origin === self.location.origin &&
    SHELL_ASSETS.some((asset) => url.pathname.endsWith(asset.replace('./', '')));

  if (request.mode === 'navigate' || isShellAsset) {
    // no-store : on veut toujours la dernière version depuis le réseau, jamais
    // celle du cache HTTP du navigateur (GitHub Pages renvoie max-age=600, donc
    // sans ça une page rechargée dans les 10 minutes resterait périmée).
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html')))
    );
  }
});
