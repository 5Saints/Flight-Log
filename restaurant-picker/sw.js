const CACHE = 'restaurant-picker-v1';
const ASSETS = ['.','index.html','manifest.json','icon-192.png','icon-512.png','https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow+Condensed:wght@300;400;600;700&display=swap'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// Network-first: always fetch fresh content when online, refreshing the cache as a side effect.
// Falls back to cache only when the network is unavailable. This means a deploy takes effect
// immediately without needing to bump CACHE — the bump is only needed if ASSETS itself changes.
self.addEventListener('fetch', e => { e.respondWith(fetch(e.request).then(response => { caches.open(CACHE).then(cache => cache.put(e.request, response.clone())); return response; }).catch(() => caches.match(e.request))); });
