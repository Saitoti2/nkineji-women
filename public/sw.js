const CACHE_NAME = 'mara-bloom-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/logo.png',
    '/site.webmanifest',
    '/favicon.ico',
    '/icon-192x192.png',
    '/icon-512x512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
