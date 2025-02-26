const CACHE_NAME = 'rango-militar-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/img/favicon.ico',
    '/img/icon-192.png',
    '/img/icon-512.png',
    // Add other assets to cache as needed
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});
