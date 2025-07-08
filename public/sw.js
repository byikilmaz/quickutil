// Service Worker for Cache Management
const CACHE_NAME = `quickutil-cache-${Date.now()}`;
const CACHE_VERSION = '1.0.0';

// Production mode - reduce console logs
const IS_PRODUCTION = location.hostname === 'quickutil.app' || location.hostname === 'quickutil-d2998.web.app';
const log = IS_PRODUCTION ? () => {} : console.log;

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/pdf-compress',
  '/pdf-convert',
  '/image-convert',
  '/js/pdf.worker.min.js',
  '/file.svg',
  '/globe.svg',
  '/next.svg',
  '/window.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        log('Opened cache');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('Cache install failed:', error);
      })
  );
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName.includes('quickutil-cache')) {
            log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all clients
  self.clients.claim();
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise, fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Don't cache POST, PUT, DELETE requests - only GET
            if (event.request.method !== 'GET') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            // Add to cache (only GET requests)
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch((error) => {
                log('Cache put failed:', error);
              });
            
            return response;
          })
          .catch(() => {
            // Return offline page or fallback
            return new Response('Offline - Please check your connection', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Message event - handle cache update requests
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_UPDATE') {
    // Clear all caches and force refresh
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.includes('quickutil-cache')) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Notify all clients to refresh
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'CACHE_CLEARED' });
        });
      });
    });
  }
});

// Push event - handle notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const options = {
    body: event.data.text(),
    icon: '/next.svg',
    badge: '/next.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('QuickUtil.app', options)
  );
}); 