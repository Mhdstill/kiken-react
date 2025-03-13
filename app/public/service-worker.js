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
  
  // Demander les permissions nécessaires lors de l'activation
  if (self.registration && self.registration.permissions) {
    self.registration.permissions.query({ name: 'camera' })
      .then(permissionStatus => {
        console.log('Statut de permission caméra:', permissionStatus.state);
        if (permissionStatus.state !== 'granted') {
          console.log('Demande de permission caméra');
        }
      })
      .catch(error => {
        console.error('Erreur lors de la vérification des permissions:', error);
      });
  }
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

// Gestion des messages depuis l'application
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'REQUEST_CAMERA_PERMISSION') {
    if (self.registration && self.registration.permissions) {
      self.registration.permissions.query({ name: 'camera' })
        .then(permissionStatus => {
          if (permissionStatus.state !== 'granted') {
            // Tenter de demander la permission
            navigator.mediaDevices.getUserMedia({ video: true })
              .then(() => {
                // Permission accordée
                event.ports[0].postMessage({ type: 'CAMERA_PERMISSION_GRANTED' });
              })
              .catch(error => {
                // Permission refusée
                event.ports[0].postMessage({ 
                  type: 'CAMERA_PERMISSION_DENIED',
                  error: error.message
                });
              });
          } else {
            // Permission déjà accordée
            event.ports[0].postMessage({ type: 'CAMERA_PERMISSION_GRANTED' });
          }
        })
        .catch(error => {
          event.ports[0].postMessage({ 
            type: 'CAMERA_PERMISSION_ERROR',
            error: error.message
          });
        });
    } else {
      event.ports[0].postMessage({ 
        type: 'CAMERA_PERMISSION_NOT_SUPPORTED'
      });
    }
  }
}); 