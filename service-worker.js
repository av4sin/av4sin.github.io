const CACHE_NAME = 'rango-militar-cache-v2';
const urlsToCache = [
    '.',
    './index.html',
    './manifest.json',
    './img/favicon.ico',
    './Points.js',
    './military_ranks.html',
    './military_groups.html',
    './styles.css',
    './regist_serviceWorker.js',
    './military_identification.html'
    // Add other assets to cache as needed
];

// Durante la fase de instalación, generalmente se almacena en caché los activos estáticos
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache)
                    .then(() => self.skipWaiting());
            })
            .catch(err => console.log('Falló registro de cache', err))
    );
});

// Una vez que se instala el SW, se activa y busca los recursos para hacer que funcione sin conexión
self.addEventListener('activate', e => {
    const cacheWhitelist = [CACHE_NAME];
    e.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        // Eliminamos lo que ya no se necesita en cache
                        if (cacheWhitelist.indexOf(cacheName) === -1) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            // Le indica al SW activar el cache actual
            .then(() => self.clients.claim())
    );
});

// Cuando el navegador recupera una url
self.addEventListener('fetch', e => {
    // Responder ya sea con el objeto en caché o continuar y buscar la url real
    e.respondWith(
        caches.match(e.request)
            .then(res => {
                if (res) {
                    // Recuperar del cache
                    return res;
                }
                // Recuperar de la petición a la url
                return fetch(e.request);
            })
    );
});
