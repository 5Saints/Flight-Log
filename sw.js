const CACHE = 'flightlog-v12';
const ASSETS = ['.','index.html','manifest.json','icon-192.png','icon-512.png','https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow+Condensed:wght@300;400;600;700&display=swap'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => { e.respondWith(caches.match(e.request).then(cached => { if(cached) return cached; return fetch(e.request).then(response => { if(e.request.url.startsWith('https://fonts')) caches.open(CACHE).then(cache => cache.put(e.request, response.clone())); return response; }).catch(() => cached); })); });
