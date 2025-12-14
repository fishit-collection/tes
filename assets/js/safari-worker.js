// ============================== //
// SAFARI-SPECIFIC SERVICE WORKER
// ============================== //

const SAFARI_CACHE = 'vechnost-safari-v1';
const SAFARI_IMAGE_CACHE = 'vechnost-images-safari-v1';

// ONLY cache critical images for Safari (limited storage)
const SAFARI_CRITICAL_IMAGES = [
    'https://i.imgur.com/iK2SqDk.jpeg',  // Banner
    'https://i.imgur.com/EaEj7Yt.gif',   // Logo
    'https://i.imgur.com/3ZzB6Go.png',   // WhatsApp
    'https://i.imgur.com/0VaM2BR.png',   // Flash Sale 1
    'https://i.imgur.com/3lZltW5.png',   // Flash Sale 2
    'https://i.imgur.com/1mOSmTs.png',   // Flash Sale 3
    'https://i.imgur.com/giC6tC5.png',   // Flash Sale 4
    'https://i.imgur.com/rk1jciA.jpeg',  // Best Seller 1
    'https://i.imgur.com/eFgHijK.jpeg',  // Best Seller 2
    'https://i.imgur.com/lMnOpQr.jpeg',  // Best Seller 3
];

// Safari has limited cache support, keep it simple
self.addEventListener('install', event => {
    console.log('🦁 Safari Worker Installing...');
    event.waitUntil(
        caches.open(SAFARI_CACHE)
            .then(cache => {
                return cache.addAll(SAFARI_CRITICAL_IMAGES);
            })
            .then(() => {
                console.log('✅ Safari Worker Installed');
                return self.skipWaiting();
            })
    );
});

self.addEventListener('activate', event => {
    console.log('⚡ Safari Worker Activated');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== SAFARI_CACHE && cacheName !== SAFARI_IMAGE_CACHE) {
                        console.log('🗑️ Deleting old Safari cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// SIMPLE cache strategy for Safari
self.addEventListener('fetch', event => {
    const url = event.request.url;
    
    // Only handle images
    if (event.request.destination === 'image' || 
        url.match(/\.(jpg|jpeg|png|gif)$/i)) {
        
        event.respondWith(
            caches.match(event.request)
                .then(cachedResponse => {
                    // Return cached image if available
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    
                    // Otherwise fetch from network
                    return fetch(event.request)
                        .then(networkResponse => {
                            // Cache the response for next time
                            const responseToCache = networkResponse.clone();
                            caches.open(SAFARI_IMAGE_CACHE)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                });
                            
                            return networkResponse;
                        })
                        .catch(error => {
                            console.log('❌ Safari fetch failed:', error);
                            // Return a simple SVG placeholder
                            return new Response(
                                '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="100%" height="100%" fill="#0a1f44"/></svg>',
                                { headers: { 'Content-Type': 'image/svg+xml' } }
                            );
                        });
                })
        );
    }
});