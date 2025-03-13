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

// Ajouter des en-têtes CORS pour le service worker
self.addEventListener('fetch', event => {
  if (event.request.mode === 'cors') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cloner la réponse
          const newResponse = new Response(response.body, response);
          
          // Ajouter les en-têtes CORS
          newResponse.headers.set('Access-Control-Allow-Origin', '*');
          newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
          newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type');
          
          return newResponse;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Pour les autres requêtes, utiliser la stratégie de cache normale
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

// Installation du service worker
self.addEventListener('install', event => {
  console.log('Service Worker: Installation');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
  // Activer immédiatement sans attendre la fermeture des onglets
  self.skipWaiting();
});

// Activation du service worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Activation');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activé et contrôlant la page');
      return self.clients.claim();
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

// Gestion des messages depuis l'application
self.addEventListener('message', event => {
  console.log('Service Worker: Message reçu', event.data);
  if (event.data && event.data.type === 'REQUEST_CAMERA_PERMISSION') {
    if (self.registration && self.registration.permissions) {
      self.registration.permissions.query({ name: 'camera' })
        .then(permissionStatus => {
          if (permissionStatus.state !== 'granted') {
            // Tenter de demander la permission
            navigator.mediaDevices.getUserMedia({ video: true })
              .then(() => {
                // Permission accordée
                console.log('Permission caméra accordée');
                event.ports[0].postMessage({ type: 'CAMERA_PERMISSION_GRANTED' });
              })
              .catch(error => {
                // Permission refusée
                console.log('Permission caméra refusée:', error);
                event.ports[0].postMessage({ 
                  type: 'CAMERA_PERMISSION_DENIED',
                  error: error.message
                });
              });
          } else {
            // Permission déjà accordée
            console.log('Permission caméra déjà accordée');
            event.ports[0].postMessage({ type: 'CAMERA_PERMISSION_GRANTED' });
          }
        })
        .catch(error => {
          console.error('Erreur lors de la vérification des permissions:', error);
          event.ports[0].postMessage({ 
            type: 'CAMERA_PERMISSION_ERROR',
            error: error.message
          });
        });
    } else {
      console.log('API Permissions non supportée');
      event.ports[0].postMessage({ 
        type: 'CAMERA_PERMISSION_NOT_SUPPORTED'
      });
    }
  }
}); 