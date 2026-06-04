const CACHE = 'lifeos-cache-v1';
const ASSETS = ['/', '/index.html'];

self.addEventListener('install', (e: ExtendableEvent) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e: ExtendableEvent) => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e: FetchEvent) => {
  if (e.request.url.startsWith('http')) {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match('/index.html')))
    );
  }
});