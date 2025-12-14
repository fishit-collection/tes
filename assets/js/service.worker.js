// ============================== //
// ULTRA AGGRESSIVE CACHE SERVICE WORKER
// CACHE SEMUA GAMBAR DI BACKGROUND
// ============================== //

const CACHE_VERSION = 'vechnost-ultra-v1.0';
const IMAGE_CACHE = 'vechnost-images-ultra-v1.0';

// LIST SEMUA GAMBAR YANG PERLU DI-CACHE
const ALL_IMAGES = [
    // Banner
    'https://i.imgur.com/iK2SqDk.jpeg',
    
    // Logo
    'https://i.imgur.com/EaEj7Yt.gif',
    
    // WhatsApp Button
    'https://i.imgur.com/3ZzB6Go.png',
    
    // Flash Sale Images (4 gambar)
    'https://i.imgur.com/0VaM2BR.png',
    'https://i.imgur.com/3lZltW5.png',
    'https://i.imgur.com/1mOSmTs.png',
    'https://i.imgur.com/giC6tC5.png',
    
    // Best Seller Images (4 gambar)
    'https://i.imgur.com/rk1jciA.jpeg',
    'https://i.imgur.com/giC6tC5.png',
    'https://i.imgur.com/eFgHijK.jpeg',
    'https://i.imgur.com/lMnOpQr.jpeg',
    
    // Fish Data Images (semua gambar ikan)
    'https://i.imgur.com/0VaM2BR.png',
    'https://i.imgur.com/3lZltW5.png',
    'https://i.imgur.com/sRWcIZ1.png',
    'https://i.imgur.com/giC6tC5.png',
    'https://i.imgur.com/YuQncEU.png',
    'https://i.imgur.com/KzkhWnr.png',
    'https://i.imgur.com/seAvGn4.png',
    'https://i.imgur.com/7weG4Nt.png',
    'https://i.imgur.com/6GMJLEJ.png',
    'https://i.imgur.com/z2SQLS6.png',
    'https://i.imgur.com/mqLmbBU.png',
    'https://i.imgur.com/1mOSmTs.png',
    'https://i.imgur.com/MY5dhBZ.png',
    'https://i.imgur.com/c2KESR1.png',
    'https://i.imgur.com/16WAXLr.png',
    'https://i.imgur.com/jZ6A9Tx.png',
    'https://i.imgur.com/su8v6r4.png',
    'https://i.imgur.com/Rebf4tD.png',
    'https://i.imgur.com/plI814x.png',
    'https://i.imgur.com/vpZjJ5T.png',
    'https://i.imgur.com/1fmUwAO.png',
    'https://i.imgur.com/ToMH4Ym.png',
    'https://i.imgur.com/AVUEyuQ.png',
    'https://i.imgur.com/PXAB4j7.png',
    'https://i.imgur.com/eoFb1be.png',
    'https://i.imgur.com/J54Ut83.png',
    'https://i.imgur.com/QCkXuD4.png',
    'https://i.imgur.com/bQp12jn.png',
    'https://i.imgur.com/hBep4ut.png',
    'https://i.imgur.com/fs8gyUb.png',
    'https://i.imgur.com/bXhR2bg.png',
    'https://i.imgur.com/4y95JCg.png',
    'https://i.imgur.com/qXftvKE.png',
    'https://i.imgur.com/wJet0gn.png',
    'https://i.imgur.com/HBrSZir.png',
    'https://i.imgur.com/EwNjpGa.png',
    'https://i.imgur.com/euprdnq.png',
    'https://i.imgur.com/ciAFF92.png',
    'https://i.imgur.com/SexNDkJ.png',
    
    // Joki Data Images
    'https://i.imgur.com/uxL4MhL.png',
    'https://i.imgur.com/BNujSq8.png',
    'https://i.imgur.com/p2qbmFK.png',
    'https://i.imgur.com/JyOuLBf.png',
    'https://i.imgur.com/pvFuzqg.png',
    'https://i.imgur.com/Go0qTZ1.png',
    'https://i.imgur.com/AGnZAlw.png',
    'https://i.imgur.com/up0Zpl7.png',
    'https://i.imgur.com/MYPQ4yR.png',
    
    // Account Data Images
    'https://i.imgur.com/ZMTTuS7.png',
    'https://i.imgur.com/8pENwF8.png',
    'https://i.imgur.com/1ugUYGZ.png',
    'https://i.imgur.com/RSXsmHY.png',
    'https://i.imgur.com/fggoqyP.png',
    'https://i.imgur.com/29XKye8.png'
];

// INSTALL: Cache semua gambar sekaligus
self.addEventListener('install', event => {
    console.log('🚀 ULTRA INSTALL: Caching semua gambar...');
    
    event.waitUntil(
        caches.open(IMAGE_CACHE)
            .then(cache => {
                // Cache semua gambar penting
                const criticalImages = ALL_IMAGES.slice(0, 15);
                return cache.addAll(criticalImages);
            })
            .then(() => {
                console.log('✅ Critical images cached');
                return self.skipWaiting();
            })
    );
});

// ACTIVATE: Hapus cache lama
self.addEventListener('activate', event => {
    console.log('⚡ ULTRA ACTIVATE: Cleaning old caches...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== IMAGE_CACHE && cacheName !== CACHE_VERSION) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            console.log('✅ Cache cleanup complete');
            return self.clients.claim();
        })
    );
});

// FETCH: Cache First untuk semua gambar
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // Hanya untuk gambar
    if (event.request.destination === 'image' || 
        /\.(jpg|jpeg|png|gif|webp)$/i.test(url.pathname)) {
        
        event.respondWith(
            caches.open(IMAGE_CACHE)
                .then(cache => {
                    return cache.match(event.request)
                        .then(cachedResponse => {
                            // 1. Jika ada di cache, return langsung
                            if (cachedResponse) {
                                console.log('⚡ Image from cache:', url.pathname);
                                return cachedResponse;
                            }
                            
                            // 2. Jika tidak ada, fetch dan cache untuk next time
                            return fetch(event.request)
                                .then(networkResponse => {
                                    // Simpan ke cache
                                    cache.put(event.request, networkResponse.clone());
                                    console.log('📥 Cached new image:', url.pathname);
                                    return networkResponse;
                                })
                                .catch(error => {
                                    console.log('❌ Failed to fetch:', error);
                                    // Return placeholder
                                    return new Response(
                                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><rect width="100%" height="100%" fill="#0a1f44"/></svg>',
                                        { headers: { 'Content-Type': 'image/svg+xml' } }
                                    );
                                });
                        });
                })
        );
        
        return;
    }
    
    // Untuk file lain, network first
    event.respondWith(
        fetch(event.request)
            .catch(() => {
                return caches.match(event.request);
            })
    );
});

// BACKGROUND SYNC: Cache semua gambar setelah install
self.addEventListener('sync', event => {
    if (event.tag === 'cache-all-images') {
        event.waitUntil(cacheAllImagesInBackground());
    }
});

async function cacheAllImagesInBackground() {
    console.log('🔄 Background caching all images...');
    
    const cache = await caches.open(IMAGE_CACHE);
    
    // Batch processing untuk hindari memory overload
    const batchSize = 5;
    for (let i = 0; i < ALL_IMAGES.length; i += batchSize) {
        const batch = ALL_IMAGES.slice(i, i + batchSize);
        
        await Promise.all(
            batch.map(async (url) => {
                try {
                    const response = await fetch(url, { mode: 'no-cors' });
                    if (response.ok || response.type === 'opaque') {
                        await cache.put(url, response);
                        console.log('✅ Cached:', url);
                    }
                } catch (error) {
                    console.log('❌ Failed to cache:', url);
                }
            })
        );
        
        // Delay antar batch
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('🎉 All images cached in background!');
}

// MESSAGE: Terima perintah dari halaman
self.addEventListener('message', event => {
    if (event.data.action === 'CACHE_IMAGES_NOW') {
        event.waitUntil(cacheAllImagesInBackground());
    }
});