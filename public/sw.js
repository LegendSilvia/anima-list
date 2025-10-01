// sw.js

// 1. Define Cache Names
// Increment the CACHE_VERSION when you want to force all old caches to be deleted
const CACHE_VERSION = 'v1.0.1'; 
const STATIC_CACHE_NAME = `static-cache-${CACHE_VERSION}`;
const API_CACHE_NAME = `api-cache-${CACHE_VERSION}`;

// Array of files that are critical for the app shell to load.
// This is a minimal list. Next.js handles most assets automatically,
// but we explicitly cache important static files and the root page.
const urlsToCache = [
    '/', // The root page
    '/favicon.ico',
    '/globals.css',
    // You can add other important assets from your 'public' folder
    // like your custom icons, manifest, etc.
    '/icon512_maskable.png',
    '/icon512_rounded.png',
    '/manifest.json',
    '/next.svg',
    '/vercel.svg',
    // Note: Next.js build assets (like `/_next/static/...`) are often
    // better handled by Next.js's built-in service worker or workbox.
    // If you're using a custom sw.js, you might need to find their paths.
];

// 2. Install Event Handler (Caching App Shell)
// This is called when the service worker is first installed.
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Install');
    // waitUntil ensures the service worker won't install until the cache is populated
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(urlsToCache);
            })
            // Force the waiting service worker to become the active service worker
            .then(() => self.skipWaiting()) 
    );
});

// 3. Activate Event Handler (Cleaning up old caches)
// This is called when the service worker becomes active.
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activate');
    event.waitUntil(
        // Get all cache keys
        caches.keys().then((cacheNames) => {
            return Promise.all(
                // Filter out the current static and API cache names
                cacheNames.filter((cacheName) => {
                    return cacheName !== STATIC_CACHE_NAME && cacheName !== API_CACHE_NAME;
                }).map((cacheName) => {
                    // Delete the old caches
                    console.log(`[Service Worker] Deleting old cache: ${cacheName}`);
                    return caches.delete(cacheName);
                })
            );
        }).then(() => {
             // Take control of uncontrolled clients immediately
            return self.clients.claim(); 
        })
    );
});

// 4. Fetch Event Handler (Caching Strategies)
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const requestUrl = new URL(request.url);

    // Skip all non-GET requests (POST, PUT, DELETE, etc.)
    if (request.method !== 'GET') {
        return;
    }

    // A. Jikan API - Stale-While-Revalidate Strategy
    // This is good for data that changes frequently.
    // It returns the cached version immediately, and then updates the cache in the background.
    if (requestUrl.host === 'api.jikan.moe') {
        event.respondWith(
            caches.open(API_CACHE_NAME).then(async (cache) => {
                // Try to get the response from the cache first
                const cachedResponse = await cache.match(request);
                
                // Fetch the new data from the network in the background
                const networkFetch = fetch(request).then(async (response) => {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    // IMPORTANT: Clone the response. A response is a stream and can only be consumed once.
                    const responseToCache = response.clone();
                    
                    // Update the cache
                    console.log(`[Service Worker] API Cache updated: ${requestUrl.pathname}`);
                    await cache.put(request, responseToCache);
                    return response;
                }).catch((error) => {
                    console.error('[Service Worker] API Network fetch failed:', error);
                    // If network fails and we have a cache hit, the cache hit will be used.
                    // If network fails and there is no cache, it will fall through to the cachedResponse.
                });

                // Return the cached response immediately if it exists
                if (cachedResponse) {
                    console.log(`[Service Worker] API Cache hit: ${requestUrl.pathname}`);
                    // Return the cached response, while the networkFetch promise updates the cache
                    return cachedResponse; 
                }

                // If no cache hit, return the network response (this will handle the initial load)
                return networkFetch;
            })
        );
        return; // Stop processing this request after handling the API
    }

    // B. Static Assets - Cache-First Strategy
    // This is good for assets that never change, like your app's main code and icons.
    // It checks the cache first. If found, it returns the cached version. If not, it fetches from the network and caches it.
    // This includes most other local assets and Next.js build files.
    event.respondWith(
        caches.match(request).then((response) => {
            // Cache hit - return response
            if (response) {
                console.log(`[Service Worker] Static Cache hit: ${requestUrl.pathname}`);
                return response;
            }

            // No cache hit - fetch from network and cache the response
            return fetch(request).then((networkResponse) => {
                // Check if we received a valid response
                if (!networkResponse || networkResponse.status !== 200) {
                    return networkResponse;
                }
                
                // Open the static cache
                return caches.open(STATIC_CACHE_NAME).then((cache) => {
                    // IMPORTANT: Clone the response before caching
                    cache.put(request, networkResponse.clone()); 
                    console.log(`[Service Worker] Static Asset cached: ${requestUrl.pathname}`);
                    return networkResponse;
                });
            }).catch(() => {
                // This catch block handles network failures.
                // You can return a fallback page for navigations here if needed.
                if (request.mode === 'navigate') {
                    // Example: return a simple offline page
                    // return caches.match('/offline.html');
                }
                // Fallback for failed requests for assets like images/fonts
                return new Response('Network request failed and no cache available', { status: 408, statusText: 'Request Timeout' });
            });
        })
    );
});