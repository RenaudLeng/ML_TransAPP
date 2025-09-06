const CACHE_NAME = 'ml-transport-v1';
const OFFLINE_URL = '/offline.html';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/login.html',
  '/parametres.html',
  '/manifest.json',
  '/sw.js',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://unpkg.com/phosphor-icons'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Mise en cache des ressources');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si la ressource est dans le cache, on la retourne
        if (response) {
          return response;
        }

        // Sinon on fait la requête au réseau
        return fetch(event.request)
          .then((response) => {
            // On ne met en cache que les requêtes réussies
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // On clone la réponse car elle ne peut être utilisée qu'une fois
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // En cas d'erreur réseau, on retourne la page hors-ligne
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});

// Gestion de la synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Fonction de synchronisation des données
async function syncData() {
  const pendingChanges = await getPendingChanges();
  
  if (pendingChanges.length > 0) {
    try {
      // Tentative de synchronisation avec le serveur
      await syncWithServer(pendingChanges);
      // Nettoyage des changements en attente
      await clearPendingChanges();
      // Notification de synchronisation réussie
      self.registration.showNotification('ML Transport', {
        body: 'Vos données ont été synchronisées avec succès',
        icon: '/icons/icon-192x192.png'
      });
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
    }
  }
}

// Fonction pour récupérer les changements en attente
async function getPendingChanges() {
  const db = await openDB();
  return db.getAll('pendingChanges');
}

// Fonction pour nettoyer les changements synchronisés
async function clearPendingChanges() {
  const db = await openDB();
  return db.clear('pendingChanges');
}

// Fonction pour ouvrir la base de données IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MLTransportDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingChanges')) {
        db.createObjectStore('pendingChanges', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
} 