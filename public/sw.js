// Bumped so the previous cache — which held stale HTML — is dropped on activate.
const CACHE_NAME = 'mara-bloom-v5';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

/**
 * Recovers clients stranded by the old cache-everything worker.
 *
 * A browser that already holds stale HTML keeps booting the previous bundle,
 * so no fix shipped inside the app can reach it. The service worker script is
 * the one thing a browser always revalidates on navigation, so the repair has
 * to happen here: drop every cache this origin holds, take control, and
 * reload any page still showing the stale build.
 */
self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const cacheNames = await caches.keys();
        const stale = cacheNames.filter((name) => name !== CACHE_NAME);
        await Promise.all(stale.map((name) => caches.delete(name)));

        await self.clients.claim();

        // Only reload when something was actually purged, so a healthy client
        // never reloads and no loop is possible.
        if (stale.length > 0) {
            const clients = await self.clients.matchAll({ type: 'window' });
            for (const client of clients) {
                if ('navigate' in client) {
                    client.navigate(client.url).catch(() => { });
                }
            }
        }
    })());
});

/**
 * Build output is content-hashed (/assets/index-AbC123.js), so those files are
 * immutable and safe to serve from cache. index.html is not: it names the
 * current hashes. Serving a cached copy after a deploy points the browser at
 * asset files that no longer exist, which 403/404 and leave a blank page with
 * nothing but "Failed to load resource" in the console.
 *
 * So: HTML is always network-first, hashed assets are cache-first.
 */
const isHashedAsset = (url) => /\/assets\/.+-[A-Za-z0-9_-]{8,}\.(js|css|woff2?|png|jpe?g|svg|webp)$/.test(url.pathname);

const isDocumentRequest = (request, url) =>
    request.mode === 'navigate'
    || request.destination === 'document'
    || url.pathname === '/'
    || url.pathname.endsWith('.html');

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    // Never cache the API; responses are user-specific and change constantly.
    if (url.pathname.startsWith('/api/')) return;

    if (isDocumentRequest(request, url)) {
        // Network-first: fall back to cache only when genuinely offline.
        event.respondWith(
            fetch(request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.ok) {
                        const copy = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                    }
                    return networkResponse;
                })
                .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
        );
        return;
    }

    if (isHashedAsset(url)) {
        // Cache-first: the hash in the filename makes the content immutable.
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;
                return fetch(request).then((networkResponse) => {
                    if (networkResponse && networkResponse.ok) {
                        const copy = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                    }
                    return networkResponse;
                });
            })
        );
        return;
    }

    // Everything else (icons, manifest, images): stale-while-revalidate.
    event.respondWith(
        caches.open(CACHE_NAME).then((cache) =>
            cache.match(request).then((cachedResponse) => {
                const fetchPromise = fetch(request)
                    .then((networkResponse) => {
                        if (networkResponse && networkResponse.ok) {
                            cache.put(request, networkResponse.clone());
                        }
                        return networkResponse;
                    })
                    .catch((error) => {
                        if (cachedResponse) return cachedResponse;
                        throw error;
                    });

                return cachedResponse || fetchPromise;
            })
        )
    );
});
