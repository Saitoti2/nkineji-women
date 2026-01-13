const CACHE_NAME = 'mara-bloom-v2'; // Incrementing version to force update
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/logo.png',
    '/site.webmanifest',
    '/favicon.ico',
];

// Install event - caching basic assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting(); // Force new service worker to activate immediately
});

// Activate event - cleaning up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Take control of all pages immediately
});

// Fetch event - Stale-While-Revalidate strategy
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    // If network request succeeds, update the cache
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(() => {
                    // If network fails, we fall back to cache (already handled by returning cachedResponse)
                });

                // Return cached response immediately if available, otherwise wait for network
                return cachedResponse || fetchPromise;
            });
        })
    );
});
