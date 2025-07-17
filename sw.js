// SolarScheduler Service Worker
// Provides offline functionality and app-like experience

const CACHE_NAME = 'solarscheduler-v1.0.0';
const STATIC_CACHE_URLS = [
  '/',
  '/app.html',
  '/styles.css',
  '/script.js',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Install event - cache static resources
self.addEventListener('install', event => {
  console.log('SolarScheduler SW: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SolarScheduler SW: Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS.map(url => new Request(url, { cache: 'reload' })));
      })
      .then(() => {
        console.log('SolarScheduler SW: Installation complete');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('SolarScheduler SW: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('SolarScheduler SW: Activating...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log('SolarScheduler SW: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('SolarScheduler SW: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip Chrome extension requests
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Skip API calls - let them go to network for real-time data
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('/create-checkout-session') ||
      event.request.url.includes('/subscription-status') ||
      event.request.url.includes('stripe.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if available
        if (response) {
          console.log('SolarScheduler SW: Serving from cache', event.request.url);
          return response;
        }

        // Fetch from network
        console.log('SolarScheduler SW: Fetching from network', event.request.url);
        return fetch(event.request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();

            // Cache the new resource
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            console.error('SolarScheduler SW: Network fetch failed', error);
            
            // Return offline page for navigation requests
            if (event.request.destination === 'document') {
              return caches.match('/app.html');
            }
            
            throw error;
          });
      })
  );
});

// Background sync for when user comes back online
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('SolarScheduler SW: Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

// Push notifications for job updates
self.addEventListener('push', event => {
  console.log('SolarScheduler SW: Push message received', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('SolarScheduler', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('SolarScheduler SW: Notification click received', event);
  
  event.notification.close();

  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/app.html')
    );
  }
});

// Background sync function
async function doBackgroundSync() {
  try {
    // Sync any pending data when user comes back online
    const cache = await caches.open(CACHE_NAME);
    // Add any background sync logic here
    console.log('SolarScheduler SW: Background sync completed');
  } catch (error) {
    console.error('SolarScheduler SW: Background sync failed', error);
  }
}

// Handle service worker updates
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});