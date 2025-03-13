const CACHE_NAME = 'qr4you-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/AppDarkMode.css',
  '/AppLightMode.css',
  '/images/logo-qr4you.svg',
  '/images/logo-qr4you-black.svg',
  '/manifest.json'
];

// Installation du service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activation du service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Stratégie de cache: Network first, puis cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la requête est réussie, on met en cache
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si la requête échoue, on utilise le cache
        return caches.match(event.request);
      })
  );
}); 