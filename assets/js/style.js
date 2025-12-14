// ============================================ //
// VECHNOST - ULTRA OPTIMIZED FOR ALL BROWSERS //
// INSTANT IMAGE LOADING SYSTEM                //
// ============================================ //

// ============================================ //
// BROWSER DETECTION & CONFIGURATION           //
// ============================================ //

// Detect browsers
const userAgent = navigator.userAgent;
const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
const isChrome = /chrome|chromium/i.test(userAgent);
const isFirefox = /firefox/i.test(userAgent);
const isIOS = /iPad|iPhone|iPod/.test(userAgent);
const isAndroid = /Android/i.test(userAgent);

console.log('🌐 Browser Detection:', {
    safari: isSafari,
    chrome: isChrome,
    firefox: isFirefox,
    ios: isIOS,
    android: isAndroid
});

// Configuration based on browser
const config = {
    // Chrome can handle more aggressive caching
    maxParallelLoads: isChrome ? 10 : isSafari ? 3 : 5,
    
    // Safari needs smaller batches
    batchSize: isSafari ? 2 : 5,
    
    // Image loading strategy
    imageLoading: isSafari ? 'eager' : 'eager',
    imageDecoding: isSafari ? 'async' : 'async',
    
    // Cache strategy
    useServiceWorker: true,
    useMemoryCache: true,
    useLocalStorage: isChrome, // Only Chrome supports storing images in localStorage efficiently
};

// ============================================ //
// IMAGE MANAGEMENT SYSTEM                      //
// ============================================ //

class ImageManager {
    constructor() {
        this.cache = new Map();
        this.loaded = new Set();
        this.queue = [];
        this.loading = 0;
        
        // Create hidden container for preloading
        this.preloadContainer = document.createElement('div');
        this.preloadContainer.style.cssText = `
            position: absolute;
            width: 0;
            height: 0;
            overflow: hidden;
            opacity: 0;
            pointer-events: none;
            z-index: -9999;
        `;
        document.body.appendChild(this.preloadContainer);
    }
    
    // Add image to preload queue
    preload(url) {
        if (this.loaded.has(url) || this.cache.has(url)) {
            return Promise.resolve();
        }
        
        return new Promise((resolve) => {
            this.queue.push({ url, resolve });
            this.processQueue();
        });
    }
    
    // Process loading queue with concurrency control
    processQueue() {
        while (this.queue.length > 0 && this.loading < config.maxParallelLoads) {
            const { url, resolve } = this.queue.shift();
            this.loading++;
            
            this.loadImage(url).then(() => {
                this.loading--;
                resolve();
                this.processQueue(); // Continue processing
            }).catch(() => {
                this.loading--;
                resolve(); // Resolve even on error to not block
                this.processQueue();
            });
        }
    }
    
    // Load individual image
    async loadImage(url) {
        if (this.loaded.has(url)) {
            return true;
        }
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            // Configure for browser
            img.loading = config.imageLoading;
            img.decoding = config.imageDecoding;
            img.crossOrigin = 'anonymous';
            
            // Safari workaround
            if (isSafari) {
                img.style.position = 'fixed';
                img.style.opacity = '0';
                img.style.pointerEvents = 'none';
                img.style.zIndex = '-9999';
                img.style.width = '1px';
                img.style.height = '1px';
            }
            
            img.onload = () => {
                this.loaded.add(url);
                this.cache.set(url, img);
                
                // Remove from preload container
                if (img.parentNode === this.preloadContainer) {
                    this.preloadContainer.removeChild(img);
                }
                
                console.log('✅ Image loaded:', url);
                resolve(true);
            };
            
            img.onerror = (err) => {
                console.warn('❌ Failed to load:', url, err);
                reject(err);
            };
            
            img.src = url;
            
            // Add to preload container for Safari
            if (isSafari) {
                this.preloadContainer.appendChild(img);
            }
        });
    }
    
    // Get image from cache or load it
    async getImage(url) {
        if (this.cache.has(url)) {
            return this.cache.get(url);
        }
        
        if (this.loaded.has(url)) {
            const img = new Image();
            img.src = url;
            return img;
        }
        
        await this.preload(url);
        return this.getImage(url);
    }
    
    // Bulk preload images
    async preloadMultiple(urls) {
        const batches = [];
        for (let i = 0; i < urls.length; i += config.batchSize) {
            batches.push(urls.slice(i, i + config.batchSize));
        }
        
        for (const batch of batches) {
            await Promise.allSettled(batch.map(url => this.preload(url)));
            
            // Add small delay between batches for Safari
            if (isSafari) {
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }
        
        console.log(`🎉 Preloaded ${urls.length} images`);
    }
}

// Initialize image manager
const imageManager = new ImageManager();

// ============================================ //
// CRITICAL IMAGES PRELOADING                   //
// ============================================ //

// Define critical images that must load instantly
const CRITICAL_IMAGES = [
    // Banner and UI
    'https://i.imgur.com/iK2SqDk.jpeg',
    'https://i.imgur.com/EaEj7Yt.gif',
    'https://i.imgur.com/3ZzB6Go.png',
    
    // Flash Sale
    'https://i.imgur.com/0VaM2BR.png',
    'https://i.imgur.com/3lZltW5.png',
    'https://i.imgur.com/1mOSmTs.png',
    'https://i.imgur.com/giC6tC5.png',
    
    // Best Seller
    'https://i.imgur.com/rk1jciA.jpeg',
    'https://i.imgur.com/eFgHijK.jpeg',
    'https://i.imgur.com/lMnOpQr.jpeg',
];

// Define all product images
const ALL_PRODUCT_IMAGES = [
    // Fish Data Images
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

// ============================================ //
// DATA DEFINITIONS                             //
// ============================================ //

const fishData = [
    {
        name:"Bloodmoon Whale",
        imageUrl: "https://i.imgur.com/0VaM2BR.png",
        price: "IDR 70.000",
        price2: "MYR 17.25",
        price3: "USD 4.21",
        itemId: "bloodmoon-whale"
    },
    {
        name: "Ancient Whale",
        imageUrl: "https://i.imgur.com/3lZltW5.png",
        price: "IDR 35.000",
        price2: "MYR 8.63",
        price3: "USD 2.10",
        itemId: "ancient-whale"
    },
    {
        name: "Great Whale",
        imageUrl: "https://i.imgur.com/sRWcIZ1.png",
        price: "IDR 25.000",
        price2: "MYR 6.16",
        price3: "USD 1.50",
        itemId: "great-whale"
    },
    {
        name: "Megalodon",
        imageUrl: "https://i.imgur.com/giC6tC5.png",
        price: "IDR 25.000",
        price2: "MYR 6.16",
        price3: "USD 1.50",
        itemId: "megalodon"
    },
    {
        name: "Zombie Megalodon",
        imageUrl: "https://i.imgur.com/YuQncEU.png",
        price: "IDR 35.000",
        price2: "MYR 8.63",
        price3: "USD 2.10",
        itemId: "zombie-megalodon"
    },
    {
        name: "Pink Megalodon",
        imageUrl: "https://i.imgur.com/KzkhWnr.png",
        price: "IDR 50.000",
        price2: "MYR 12.32",
        price3: "USD 3.01",
        itemId: "pink-megalodon"
    },
    {
        name: "Worm Fish",
        imageUrl: "https://i.imgur.com/seAvGn4.png",
        price: "IDR 15.000",
        price2: "MYR 3.70",
        price3: "USD 1.50",
        itemId: "worm-fish"
    },
    {
        name: "Ghost Worm Fish",
        imageUrl: "https://i.imgur.com/7weG4Nt.png",
        price: "IDR 25.000",
        price2: "MYR 6.16",
        price3: "USD 1.50",
        itemId: "ghost-worm-fish"
    },
    {
        name: "Bone Whale",
        imageUrl: "https://i.imgur.com/6GMJLEJ.png",
        price: "IDR 15.000",
        price2: "MYR 3.70",
        price3: "USD 0.90",
        itemId: "bone-whale"
    },
    {
        name: "El Gran Maja",
        imageUrl: "https://i.imgur.com/z2SQLS6.png",
        price: "IDR 25.000",
        price2: "MYR 6.16",
        price3: "USD 1.50",
        itemId: "el-gran-maja"
    },
    {
        name: "El Retro Maja",
        imageUrl: "https://i.imgur.com/mqLmbBU.png",
        price: "IDR 30.000",
        price2: "MYR 7.39",
        price3: "USD 1.80",
        itemId: "el-retro-maja"
    },
    {
        name: "Monster Shark",
        imageUrl: "https://i.imgur.com/1mOSmTs.png",
        price: "IDR 25.000",
        price2: "MYR 6.16",
        price3: "USD 1.50",
        itemId: "monster-shark"
    },
    {
        name: "Lochness",
        imageUrl: "https://i.imgur.com/MY5dhBZ.png",
        price: "IDR 30.000",
        price2: "MYR 7.39",
        price3: "USD 1.80",
        itemId: "lochness"
    },
    {
        name: "Ancient Lochness",
        imageUrl: "https://i.imgur.com/c2KESR1.png",
        price: "IDR 40.000",
        price2: "MYR 9.86",
        price3: "USD 2.40",
        itemId: "ancient-lochness"
    },
    {
        name: "Mosasaurus",
        imageUrl: "https://i.imgur.com/16WAXLr.png",
        price: "IDR 15.000",
        price2: "MYR 3.70",
        price3: "USD 0.90",
        itemId: "mosasaurus"
    },
    {
        name: "Talon Serpent",
        imageUrl: "https://i.imgur.com/jZ6A9Tx.png",
        price: "IDR 30.000",
        price2: "MYR 7.39",
        price3: "USD 1.80",
        itemId: "talon-serpent"           
    },
    {
        name: "Wild Serpent",
        imageUrl: "https://i.imgur.com/su8v6r4.png",
        price: "IDR 25.000",
        price2: "MYR 6.16",
        price3: "USD 1.50",
        itemId: "wild-serpent"
        },
    {
        name: "1x1x1x Shark",
        imageUrl: "https://i.imgur.com/Rebf4tD.png",
        price: "IDR 15.000",
        price2: "MYR 3.70",
        price3: "USD 0.90",
        itemId: "1x1x1x-shark"
        },
    {
        name: "King Crab",
        imageUrl: "https://i.imgur.com/plI814x.png",
        price: "IDR 10.000",
        price2: "MYR 2.46",
        price3: "USD 0.60",
        itemId: "king-crab"
        },
    {
        name: "Queen Crab",
        imageUrl: "https://i.imgur.com/vpZjJ5T.png",
        price: "IDR 20.000",
        price2: "MYR 4.93",
        price3: "USD 1.20",
        itemId: "queen-crab"
        },
    {
        name: "Crystal Crab",
        imageUrl: "https://i.imgur.com/1fmUwAO.png",
        price: "IDR 15.000",
        price2: "MYR 3.70",
        price3: "USD 0.90",
        itemId: "crystal-crab"

        },
    {
        name: "Robot Kraken",
        imageUrl: "https://i.imgur.com/ToMH4Ym.png",
        price: "IDR 20.000",
        price2: "MYR 4.93",
        price3: "USD 1.20",
        itemId: "robot-kraken"
        },
    {
        name: "Giant Squid",
        imageUrl: "https://i.imgur.com/AVUEyuQ.png",
        price: "IDR 7.000",
        price2: "MYR 1.73",
        price3: "USD 0.42",
        itemId: "Giant-Squid"
        },
    {
        name: "Gladycus Shark",
        imageUrl: "https://i.imgur.com/PXAB4j7.png",
        price: "IDR 7.000",
        price2: "MYR 1.73",
        price3: "USD 0.42",
        itemId: "gladycus-shark"
        },
    {
        name: "Orca",
        imageUrl: "https://i.imgur.com/eoFb1be.png",
        price: "IDR 15.000",
        price2: "MYR 3.70",
        price3: "USD 0.90",
        itemId: "orca"
        },
    {
        name: "King Jelly",
        imageUrl: "https://i.imgur.com/J54Ut83.png",
        price: "IDR 10.000",
        price2: "MYR 2.46",
        price3: "USD 0.60",
        itemId: "king-jelly"
        },
    {
        name: "Panther Ell",
        imageUrl: "https://i.imgur.com/QCkXuD4.png",
        price: "IDR 15.000",
        price2: "MYR 3.70",
        price3: "USD 0.90",
        itemId: "panther-eel"
        },
    {
        name: "Eerie Shark",
        imageUrl: "https://i.imgur.com/bQp12jn.png",
        price: "IDR 15.000",
        price2: "MYR 3.70",
        price3: "USD 0.90",
        itemId: "eerie-shark"
        },
    {
        name: "Gladiator Shark",
        imageUrl: "https://i.imgur.com/hBep4ut.png",
        price: "IDR 7.000",
        price2: "MYR 1.73",
        price3: "USD 0.42",
        itemId: "gladiator-shark"
        },
    {
        name: "Frostborn Shark",
        imageUrl: "https://i.imgur.com/fs8gyUb.png",
        price: "IDR 7.000",
        price2: "MYR 1.73",
        price3: "USD 0.42",
        itemId: "frostborn-shark"
        },
    {
        name: "Depth Seeker Ray",
        imageUrl: "https://i.imgur.com/bXhR2bg.png",
        price: "IDR 8.000",
        price2: "MYR 1.97",
        price3: "USD 0.48",
        itemId: "depth-seeker-ray"
        },
    {
        name: "Scare",
        imageUrl: "https://i.imgur.com/4y95JCg.png",
        price: "IDR 7.000",
        price2: "MYR 1.73",
        price3: "USD 0.42",
        itemId: "scare"
        },
    {
        name: "Guadian Squid",
        imageUrl: "https://i.imgur.com/qXftvKE.png",
        price: "IDR 7.000",
        price2: "MYR 1.73",
        price3: "USD 0.42",
        itemId: "guardian-squid"
        },
    {
        name: "Dead Zombie Shark",
        imageUrl: "https://i.imgur.com/wJet0gn.png",
        price: "IDR 7.000",
        price2: "MYR 1.73",
        price3: "USD 0.42",
        itemId: "dead-zombie-shark"
        },
    {
        name: "Zombie Shark",
        imageUrl: "https://i.imgur.com/HBrSZir.png",
        price: "IDR 7.000",
        price2: "MYR 1.73",
        price3: "USD 0.42",
        itemId: "zombie-shark"
        },
    {
        name: "Ghost Shark",
        imageUrl: "https://i.imgur.com/EwNjpGa.png",
        price: "IDR 7.000",
        price2: "MYR 1.73",
        price3: "USD 0.42",
        itemId: "ghost-shark"
        },
    {
        name: "Skeleton Narhwal",
        imageUrl: "https://i.imgur.com/euprdnq.png",
        price: "IDR 10.000",
        price2: "MYR 2.46",
        price3: "USD 0.60",
        itemId: "skeleton-narhwal"
        },
    {
        name: "Thin Armor Shark",
        imageUrl: "https://i.imgur.com/ciAFF92.png",
        price: "IDR 7.000",
        price2: "MYR 1.73",
        price3: "USD 0.42",
        itemId: "thin-armor-shark"
         },
    {
        name: "Blob Shark",
        imageUrl: "https://i.imgur.com/SexNDkJ.png",
        price: "IDR 7.000",
        price2: "MYR 1.73",
        price3: "USD 0.42",
        itemId: "blob-shark"
    }
];

// Data JOKI dengan gambar dan harga
const jokiData = [
    {
        name: "Joki Hazmat Rod",
        imageUrl: "https://i.imgur.com/uxL4MhL.png",
        price: "IDR 10.000",
        price2: "MYR 2.46",
        price3: "USD 0.60",
        itemId: "joki-hazmat-rod"
    },
    {
        name: "Joki Ares Rod",
        imageUrl: "https://i.imgur.com/BNujSq8.png",
        price: "IDR 30.000",
        price2: "MYR 7.39",
        price3: "USD 1.80",
        itemId: "joki-ares-rod"
    },
    {
        name: "Joki Angler Rod",
        imageUrl: "https://i.imgur.com/p2qbmFK.png",
        price: "IDR 50.000",
        price2: "MYR 12.32",
        price3: "USD 3.01",
        itemId: "joki-angler-rod"
    },
    {
        name: "Joki Bamboo Rod",
        imageUrl: "https://i.imgur.com/JyOuLBf.png",
        price: "IDR 80.000",
        price2: "MYR 19.72",
        price3: "USD 4.81",
        itemId: "joki-bamboo-rod"
    },
    {
        name: "Joki Ghostfin Rod",
        imageUrl: "https://i.imgur.com/pvFuzqg.png",
        price: "IDR 60.000",
        price2: "MYR 14.79",
        price3: "USD 3.61",
        itemId: "joki-ghostfin-rod"
    },
    {
        name: "Joki Element Rod",
        imageUrl: "https://i.imgur.com/Go0qTZ1.png",
        price: "IDR 200.000",
        price2: "MYR 49.30",
        price3: "USD 12.02",
        itemId: "joki-element-rod"
        },
    {
        name: "Joki Aether Bait",
        imageUrl: "https://i.imgur.com/AGnZAlw.png",
        price: "IDR 30.000",
        price2: "MYR 7.39",
        price3: "USD 1.80",
        itemId: "joki-aether-bait"
    },
    {
        name: "Joki Floral Bait",
        imageUrl: "https://i.imgur.com/up0Zpl7.png",
        price: "IDR 35.000",
        price2: "MYR 8.63",
        price3: "USD 2.10",
        itemId: "joki-floral-bait"
    },
    {
        name: "Joki Singularity Bait",
        imageUrl: "https://i.imgur.com/MYPQ4yR.png",
        price: "IDR 60.000",
        price2: "MYR 14.79",
        price3: "USD 3.61",
        itemId: "joki-singularity-bait"
    }
];

// Data GAMEPASS dengan gambar dan harga
const gamepassData = [];

// Data ACCOUNT dengan gambar dan harga
const accountData = [
    {
        name: "Ghostfin + Aether",
        imageUrl: "https://i.imgur.com/ZMTTuS7.png",
        price: "IDR 50.000",
        price2: "MYR 12.32",
        price3: "USD 21.40",
        itemId: "ghostfin-+-aether"
    },
    {
        name: "Ghostfin + Foral",
        imageUrl: "https://i.imgur.com/8pENwF8.png",
        price: "IDR 60.000",
        price2: "MYR 14.79",
        price3: "USD 53.45",
        itemId: "ghostfin-+-floral"
    },
    {
        name: "Ghostfin + Singularity",
        imageUrl: "https://i.imgur.com/1ugUYGZ.png",
        price: "IDR 80.000",
        price2: "MYR 19.72",
        price3: "USD 9.02",
        itemId: "ghostfin-+-singularity"
    },
    {
       name: "Element + Aether",
        imageUrl: "https://i.imgur.com/RSXsmHY.png",
        price: "IDR 150.000",
        price2: "MYR 36.97",
        price3: "USD 21.40",
        itemId: "ghostfin-+-aether"
    },
    {
        name: "Element + Foral",
        imageUrl: "https://i.imgur.com/fggoqyP.png",
        price: "IDR 155.000",
        price2: "MYR 38.20",
        price3: "USD 9.32",
        itemId: "ghostfin-+-floral"
    },
    {
        name: "Element + Singularity",
        imageUrl: "https://i.imgur.com/29XKye8.png",
        price: "IDR 160.000",
        price2: "MYR 39.44",
        price3: "USD 9.62",
        itemId: "ghostfin-+-singularity"
    }
];

// ============================================ //
// DOM ELEMENTS & STATE                         //
// ============================================ //

const body = document.body;
const mobileSearchBtn = document.getElementById('mobileSearchBtn');
const mobileSearchContainer = document.getElementById('mobileSearchContainer');
const searchInput = document.getElementById('searchInput');
const mobileSearchInput = document.getElementById('mobileSearchInput');
const mainContent = document.querySelector('main');
const locationButtons = document.getElementById('locationButtons');
const scrollLeftBtn = document.getElementById('scrollLeftBtn');
const scrollRightBtn = document.getElementById('scrollRightBtn');
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const sidebarClose = document.getElementById('sidebarClose');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const sidebarLinks = document.querySelectorAll('.sidebar-link');

// Modal DOM Elements
const orderModal = document.getElementById('orderModal');
const modalClose = document.getElementById('modalClose');
const cancelBtn = document.getElementById('cancelBtn');
const orderBtn = document.getElementById('orderBtn');
const loadingOverlay = document.getElementById('loadingOverlay');

// State variables
let currentFilter = 'fish';
const categories = ['fish', 'joki', 'gamepass', 'account'];
let currentProduct = null;

// ============================================ //
// INSTANT LOAD INITIALIZATION                  //
// ============================================ //

async function initInstantLoad() {
    console.log('🔥 Starting instant load sequence...');
    
    // Phase 1: Preload critical images immediately
    await imageManager.preloadMultiple(CRITICAL_IMAGES);
    
    // Phase 2: Apply browser-specific optimizations
    applyBrowserOptimizations();
    
    // Phase 3: Render initial content
    renderFishImages();
    
    // Phase 4: Initialize other components
    initLocationButtons();
    initEventListeners();
    initSidebar();
    initOrderModal();
    
    // Phase 5: Preload remaining images in background
    setTimeout(() => {
        imageManager.preloadMultiple(ALL_PRODUCT_IMAGES).then(() => {
            console.log('🎉 All images preloaded!');
            document.body.classList.add('all-images-loaded');
        });
    }, 1000);
    
    console.log('✅ Instant load initialization complete');
}

// Apply browser-specific optimizations
function applyBrowserOptimizations() {
    // Force GPU acceleration
    document.body.style.transform = 'translateZ(0)';
    document.body.style.webkitTransform = 'translateZ(0)';
    
    // Safari specific
    if (isSafari || isIOS) {
        document.body.style.webkitTextSizeAdjust = '100%';
        document.body.style.webkitOverflowScrolling = 'touch';
        document.body.style.overscrollBehavior = 'none';
        
        // Add Safari class for CSS targeting
        document.body.classList.add('safari-browser');
    }
    
    // Chrome specific
    if (isChrome) {
        document.body.classList.add('chrome-browser');
    }
    
    // Apply to all images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.loading = config.imageLoading;
        img.decoding = config.imageDecoding;
        
        // Force image rendering
        img.style.imageRendering = 'crisp-edges';
        img.style.webkitFontSmoothing = 'antialiased';
        img.style.mozOsxFontSmoothing = 'grayscale';
        
        // Add loaded class when image loads
        if (img.complete) {
            img.classList.add('instant-loaded');
        } else {
            img.addEventListener('load', function() {
                this.classList.add('instant-loaded');
            });
        }
    });
}

// ============================================ //
// RENDERING FUNCTIONS                          //
// ============================================ //

// Initialize location buttons (hanya 4 tombol)
function initLocationButtons() {
    const buttons = [
        { id: 'fish', text: 'FISH' },
        { id: 'joki', text: 'JOKI' },
        { id: 'gamepass', text: 'GAMEPASS' },
        { id: 'account', text: 'ACCOUNT' }
    ];
    
    let buttonsHTML = '';
    
    buttons.forEach(button => {
        const activeClass = button.id === currentFilter ? 'active' : '';
        buttonsHTML += `
            <button class="location-btn ${activeClass}" data-category="${button.id}">
                ${button.text}
            </button>
        `;
    });
    
    locationButtons.innerHTML = buttonsHTML;
    
    // Add event listeners to location buttons
    const buttonElements = document.querySelectorAll('.location-btn');
    buttonElements.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            buttonElements.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get the category to filter
            const category = this.getAttribute('data-category');
            currentFilter = category;
            
            // Toggle search bar visibility
            toggleSearchBar(category === 'fish');
            
            // Render content based on category
            renderContent();
            
            // Update active state in sidebar (if applicable)
            updateSidebarActiveState(category);
            
            // Close sidebar on mobile
            closeSidebar();
        });
    });
}

// Initialize sidebar
function initSidebar() {
    // Add event listeners to sidebar links
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            
            // Handle sidebar menu items
            handleMenuItemClick(category);
        });
    });
}

// Handle menu item clicks (for both desktop and sidebar)
function handleMenuItemClick(category) {
    switch(category) {
        case 'home':
            // Redirect to home page
            window.location.href = 'https://vechnost.vercel.app/';
            break;
        case 'price':
            // Show price page or section
            alert('Price page will be available soon!');
            break;
        case 'leaderboard':
            // Show leaderboard
            alert('Leaderboard will be available soon!');
            break;
        case 'login':
            // Show login modal or page
            alert('Login feature will be available soon!');
            break;
        case 'register':
            // Show register modal or page
            alert('Register feature will be available soon!');
            break;
        case 'fish':
        case 'joki':
        case 'gamepass':
        case 'account':
            // These are location button categories
            currentFilter = category;
            
            // Update location buttons
            const locationBtn = document.querySelector(`.location-btn[data-category="${category}"]`);
            if (locationBtn) {
                document.querySelectorAll('.location-btn').forEach(btn => btn.classList.remove('active'));
                locationBtn.classList.add('active');
            }
            
            // Toggle search bar visibility
            toggleSearchBar(category === 'fish');
            
            // Render content
            renderContent();
            break;
        default:
            // Do nothing
            break;
    }
    
    // Close sidebar if on mobile
    closeSidebar();
}

// Update sidebar active state (for location buttons)
function updateSidebarActiveState(category) {
    sidebarLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-category') === category) {
            link.classList.add('active');
        }
    });
}

// Toggle search bar visibility
function toggleSearchBar(show) {
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
        searchContainer.style.display = show ? 'block' : 'none';
    }
    
    const mobileSearchContainer = document.getElementById('mobileSearchContainer');
    if (mobileSearchContainer && mobileSearchContainer.classList.contains('active')) {
        mobileSearchContainer.classList.remove('active');
    }
}

// Render content based on current filter
function renderContent() {
    if (currentFilter === 'fish') {
        renderFishImages();
    } else if (currentFilter === 'joki') {
        renderJokiImages();
    } else if (currentFilter === 'gamepass') {
        renderGamepassImages();
    } else if (currentFilter === 'account') {
        renderAccountImages();
    }
}

// Navigate to next category
function navigateToNextCategory() {
    const currentIndex = categories.indexOf(currentFilter);
    const nextIndex = (currentIndex + 1) % categories.length;
    const nextCategory = categories[nextIndex];
    
    // Trigger click on the corresponding button
    const nextButton = document.querySelector(`.location-btn[data-category="${nextCategory}"]`);
    if (nextButton) {
        nextButton.click();
    }
}

// Navigate to previous category
function navigateToPrevCategory() {
    const currentIndex = categories.indexOf(currentFilter);
    const prevIndex = (currentIndex - 1 + categories.length) % categories.length;
    const prevCategory = categories[prevIndex];
    
    // Trigger click on the corresponding button
    const prevButton = document.querySelector(`.location-btn[data-category="${prevCategory}"]`);
    if (prevButton) {
        prevButton.click();
    }
}

// Render fish images dengan instant loading
async function renderFishImages() {
    // Clear main content
    mainContent.innerHTML = '';
    
    // Filter fish based on search query
    let filteredItems = [...fishData];
    
    const searchQuery = searchInput.value.trim().toLowerCase() || mobileSearchInput.value.trim().toLowerCase();
    if (searchQuery) {
        filteredItems = filteredItems.filter(item => 
            item.name.toLowerCase().includes(searchQuery)
        );
    }
    
    // If no results, show message
    if (filteredItems.length === 0) {
        mainContent.innerHTML = `
            <div class="no-results">
                <i class="fas fa-fish"></i>
                <h3>Tidak ada ikan ditemukan</h3>
                <p>Tidak ada ikan yang sesuai dengan pencarian Anda. Coba kata kunci lain.</p>
            </div>
        `;
        return;
    }
    
    // Create grid container
    const grid = document.createElement('div');
    grid.className = 'fish-images-grid';
    
    // Preload images for this view
    const imageUrls = filteredItems.map(item => item.imageUrl);
    await imageManager.preloadMultiple(imageUrls);
    
    // Create fish items
    filteredItems.forEach(item => {
        const fishItem = document.createElement('div');
        fishItem.className = 'fish-item';
        fishItem.setAttribute('title', `Klik untuk beli ${item.name}`);
        
        fishItem.innerHTML = `
            <img class="fish-image" 
                 src="${item.imageUrl}"
                 alt="${item.name}"
                 loading="${config.imageLoading}"
                 decoding="${config.imageDecoding}"
                 width="300"
                 height="300">
            <div class="fish-name-overlay">
                <div class="fish-name">${item.name}</div>
                <div class="fish-prices">
                    <div class="fish-price price-idr">${item.price}</div>
                    <div class="fish-price price-myr">${item.price2}</div>
                    <div class="fish-price price-usd">${item.price3}</div>
                </div>
            </div>
        `;
        
        // Add click event to fish item untuk membuka modal
        fishItem.addEventListener('click', function() {
            openModalWithProduct(item);
        });
        
        // Tambahkan juga keyboard accessibility
        fishItem.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModalWithProduct(item);
            }
        });
        
        fishItem.setAttribute('tabindex', '0');
        fishItem.setAttribute('role', 'button');
        fishItem.setAttribute('aria-label', `Beli ${item.name} - ${item.price} | ${item.price2} | ${item.price3}`);
        
        grid.appendChild(fishItem);
    });
    
    mainContent.appendChild(grid);
}

// Render JOKI images
async function renderJokiImages() {
    mainContent.innerHTML = '';
    
    const grid = document.createElement('div');
    grid.className = 'fish-images-grid';
    
    // Preload images
    const imageUrls = jokiData.map(item => item.imageUrl);
    await imageManager.preloadMultiple(imageUrls);
    
    // Create joki items
    jokiData.forEach(item => {
        const serviceItem = document.createElement('div');
        serviceItem.className = 'service-item';
        serviceItem.setAttribute('title', `Klik untuk layanan ${item.name}`);
        
        serviceItem.innerHTML = `
            <img class="service-image" 
                 src="${item.imageUrl}"
                 alt="${item.name}"
                 loading="${config.imageLoading}"
                 decoding="${config.imageDecoding}"
                 width="300"
                 height="300">
            <div class="service-name-overlay">
                <div class="service-name">${item.name}</div>
                <div class="service-prices">
                    <div class="service-price price-idr">${item.price}</div>
                    <div class="service-price price-myr">${item.price2}</div>
                    <div class="service-price price-usd">${item.price3}</div>
                </div>
            </div>
        `;
        
        // Add click event untuk membuka modal
        serviceItem.addEventListener('click', function() {
            openModalWithProduct(item);
        });
        
        serviceItem.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModalWithProduct(item);
            }
        });
        
        serviceItem.setAttribute('tabindex', '0');
        serviceItem.setAttribute('role', 'button');
        serviceItem.setAttribute('aria-label', `Layanan ${item.name} - ${item.price} | ${item.price2} | ${item.price3}`);
        
        grid.appendChild(serviceItem);
    });
    
    mainContent.appendChild(grid);
}

// Render GAMEPASS images
async function renderGamepassImages() {
    mainContent.innerHTML = '';
    
    if (gamepassData.length === 0) {
        mainContent.innerHTML = `
            <div class="no-results">
                <i class="fas fa-gamepad"></i>
                <h3>Gamepass Tidak Tersedia</h3>
                <p>Gamepass akan segera tersedia. Cek kembali nanti!</p>
            </div>
        `;
        return;
    }
    
    const grid = document.createElement('div');
    grid.className = 'fish-images-grid';
    
    // Preload images
    const imageUrls = gamepassData.map(item => item.imageUrl);
    await imageManager.preloadMultiple(imageUrls);
    
    // Create gamepass items
    gamepassData.forEach(item => {
        const serviceItem = document.createElement('div');
        serviceItem.className = 'service-item';
        serviceItem.setAttribute('title', `Klik untuk beli ${item.name}`);
        
        serviceItem.innerHTML = `
            <img class="service-image" 
                 src="${item.imageUrl}"
                 alt="${item.name}"
                 loading="${config.imageLoading}"
                 decoding="${config.imageDecoding}"
                 width="300"
                 height="300">
            <div class="service-name-overlay">
                <div class="service-name">${item.name}</div>
                <div class="service-prices">
                    <div class="service-price price-idr">${item.price}</div>
                    <div class="service-price price-myr">${item.price2}</div>
                    <div class="service-price price-usd">${item.price3}</div>
                </div>
            </div>
        `;
        
        // Add click event untuk membuka modal
        serviceItem.addEventListener('click', function() {
            openModalWithProduct(item);
        });
        
        serviceItem.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModalWithProduct(item);
            }
        });
        
        serviceItem.setAttribute('tabindex', '0');
        serviceItem.setAttribute('role', 'button');
        serviceItem.setAttribute('aria-label', `Beli ${item.name} - ${item.price} | ${item.price2} | ${item.price3}`);
        
        grid.appendChild(serviceItem);
    });
    
    mainContent.appendChild(grid);
}

// Render ACCOUNT images
async function renderAccountImages() {
    mainContent.innerHTML = '';
    
    const grid = document.createElement('div');
    grid.className = 'fish-images-grid';
    
    // Preload images
    const imageUrls = accountData.map(item => item.imageUrl);
    await imageManager.preloadMultiple(imageUrls);
    
    // Create account items
    accountData.forEach(item => {
        const serviceItem = document.createElement('div');
        serviceItem.className = 'service-item';
        serviceItem.setAttribute('title', `Klik untuk beli ${item.name}`);
        
        serviceItem.innerHTML = `
            <img class="service-image" 
                 src="${item.imageUrl}"
                 alt="${item.name}"
                 loading="${config.imageLoading}"
                 decoding="${config.imageDecoding}"
                 width="300"
                 height="300">
            <div class="service-name-overlay">
                <div class="service-name">${item.name}</div>
                <div class="service-prices">
                    <div class="service-price price-idr">${item.price}</div>
                    <div class="service-price price-myr">${item.price2}</div>
                    <div class="service-price price-usd">${item.price3}</div>
                </div>
            </div>
        `;
        
        // Add click event untuk membuka modal
        serviceItem.addEventListener('click', function() {
            openModalWithProduct(item);
        });
        
        serviceItem.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModalWithProduct(item);
            }
        });
        
        serviceItem.setAttribute('tabindex', '0');
        serviceItem.setAttribute('role', 'button');
        serviceItem.setAttribute('aria-label', `Beli ${item.name} - ${item.price} | ${item.price2} | ${item.price3}`);
        
        grid.appendChild(serviceItem);
    });
    
    mainContent.appendChild(grid);
}

// Sidebar functions
function openSidebar() {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Initialize event listeners
function initEventListeners() {
    // Mobile search toggle
    mobileSearchBtn.addEventListener('click', function() {
        mobileSearchContainer.classList.toggle('active');
    });
    
    // Menu button untuk membuka sidebar
    menuBtn.addEventListener('click', openSidebar);
    
    // Sidebar close button
    sidebarClose.addEventListener('click', closeSidebar);
    
    // Sidebar overlay click to close
    sidebarOverlay.addEventListener('click', closeSidebar);
    
    // Close sidebar on Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeSidebar();
        }
    });
    
    // Search input
    searchInput.addEventListener('input', function() {
        if (currentFilter === 'fish') {
            renderFishImages();
        }
    });
    
    mobileSearchInput.addEventListener('input', function() {
        if (currentFilter === 'fish') {
            renderFishImages();
        }
    });
    
    // Close mobile search when clicking outside on mobile
    document.addEventListener('click', function(event) {
        const isMobileSearchBtn = mobileSearchBtn.contains(event.target);
        const isMobileSearchContainer = mobileSearchContainer.contains(event.target);
        
        if (!isMobileSearchBtn && !isMobileSearchContainer && mobileSearchContainer.classList.contains('active')) {
            mobileSearchContainer.classList.remove('active');
        }
    });
    
    // Desktop Menu Links
    const desktopMenuLinks = document.querySelectorAll('.desktop-menu a');
    desktopMenuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            handleMenuItemClick(category);
        });
    });
    
    // Scroll button functionality
    scrollLeftBtn.addEventListener('click', navigateToPrevCategory);
    scrollRightBtn.addEventListener('click', navigateToNextCategory);
    
    // Handle window resize for responsive adjustments
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Re-apply optimizations on resize
            applyBrowserOptimizations();
        }, 250);
    });
    
    // Handle visibility change for background loading
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // Page is hidden, pause intensive operations
            console.log('Page hidden, pausing background loading');
        } else {
            // Page is visible again
            console.log('Page visible, resuming operations');
        }
    });
}

// ============================================ //
// ORDER MODAL FUNCTIONS                        //
// ============================================ //

// Payment Methods Configuration
const paymentMethods = {
    IDR: [
        { id: 'qris', name: 'QRIS', icon: 'fa-solid fa-qrcode' },
        { id: 'dana', name: 'DANA', icon: 'fa-solid fa-wallet' },
        { id: 'ovo', name: 'OVO', icon: 'fa-solid fa-mobile-alt' },
        { id: 'gopay', name: 'GOPAY', icon: 'fa-solid fa-credit-card' },
        { id: 'seabank', name: 'SEABANK', icon: 'fa-solid fa-building-columns' },
        { id: 'crypto', name: 'CRYPTO - USDT', icon: 'fa-solid fa-coins' }
    ],
    MYR: [
        { id: 'qris', name: 'QRIS', icon: 'fa-solid fa-qrcode' },
        { id: 'dana', name: 'DANA', icon: 'fa-solid fa-ban', disabled: true },
        { id: 'ovo', name: 'OVO', icon: 'fa-solid fa-ban', disabled: true },
        { id: 'gopay', name: 'GOPAY', icon: 'fa-solid fa-ban', disabled: true },
        { id: 'seabank', name: 'SEABANK', icon: 'fa-solid fa-ban', disabled: true },
        { id: 'crypto', name: 'CRYPTO - USDT', icon: 'fa-solid fa-coins' }
    ],
    USD: [
        { id: 'qris', name: 'QRIS', icon: 'fa-solid fa-ban', disabled: true },
        { id: 'dana', name: 'DANA', icon: 'fa-solid fa-ban', disabled: true },
        { id: 'ovo', name: 'OVO', icon: 'fa-solid fa-ban', disabled: true },
        { id: 'gopay', name: 'GOPAY', icon: 'fa-solid fa-ban', disabled: true },
        { id: 'seabank', name: 'SEABANK', icon: 'fa-solid fa-ban', disabled: true },
        { id: 'crypto', name: 'CRYPTO - USDT', icon: 'fa-solid fa-coins' }
    ]
};

// Messages based on currency and language
const messages = {
    IDR: {
        whatsapp: "Halo, saya ingin membeli *{product}* sebanyak *{quantity} unit*.\n\n📋 *Detail Pemesanan:*\n• Produk: {product}\n• Jumlah: {quantity}\n• Harga: {price}\n• Username Roblox: {username}\n• Payment Method: {payment}\n\nMohon informasi langkah selanjutnya. Terima kasih!",
        instagram: "Halo, saya ingin membeli *{product}* sebanyak *{quantity} unit*.\n\n📋 *Detail Pemesanan:*\n• Produk: {product}\n• Jumlah: {quantity}\n• Harga: {price}\n• Username Roblox: {username}\n• Payment Method: {payment}\n\nMohon informasi langkah selanjutnya. Terima kasih!"
    },
    MYR: {
        whatsapp: "Hai, saya ingin membeli *{product}* sebanyak *{quantity} unit*.\n\n📋 *Butiran Pesanan:*\n• Produk: {product}\n• Kuantiti: {quantity}\n• Harga: {price}\n• Username Roblox: {username}\n• Kaedah Bayaran: {payment}\n\nSila beritahu langkah seterusnya. Terima kasih!",
        instagram: "Hai, saya ingin membeli *{product}* sebanyak *{quantity} unit*.\n\n📋 *Butiran Pesanan:*\n• Produk: {product}\n• Kuantiti: {quantity}\n• Harga: {price}\n• Username Roblox: {username}\n• Kaedah Bayaran: {payment}\n\nSila beritahu langkah seterusnya. Terima kasih!"
    },
    USD: {
        whatsapp: "Hello, I would like to purchase *{product}* for *{quantity} unit(s)*.\n\n📋 *Order Details:*\n• Product: {product}\n• Quantity: {quantity}\n• Price: {price}\n• Roblox Username: {username}\n• Payment Method: {payment}\n\nPlease let me know the next steps. Thank you!",
        instagram: "Hello, I would like to purchase *{product}* for *{quantity} unit(s)*.\n\n📋 *Order Details:*\n• Product: {product}\n• Quantity: {quantity}\n• Price: {price}\n• Roblox Username: {username}\n• Payment Method: {payment}\n\nPlease let me know the next steps. Thank you!"
    }
};

// Initialize modal functionality
function initOrderModal() {
    // Close modal events
    modalClose.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    orderModal.addEventListener('click', function(e) {
        if (e.target === orderModal) {
            closeModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && orderModal.classList.contains('active')) {
            closeModal();
        }
    });
    
    // Currency button events
    const currencyBtns = document.querySelectorAll('.currency-btn');
    currencyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            currencyBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updatePaymentMethods(this.getAttribute('data-currency'));
        });
    });
    
    // Contact option events
    const contactOptions = document.querySelectorAll('.contact-option');
    contactOptions.forEach(option => {
        option.addEventListener('click', function() {
            contactOptions.forEach(opt => {
                opt.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // Order button event
    orderBtn.addEventListener('click', processOrder);
}

// Open modal with product data
async function openModalWithProduct(productData) {
    currentProduct = productData;
    
    // Preload product image
    await imageManager.preload(productData.imageUrl);
    
    // Set product data
    const modalImg = document.getElementById('modalProductImage');
    modalImg.src = productData.imageUrl;
    modalImg.alt = productData.name;
    modalImg.loading = 'eager';
    modalImg.decoding = 'async';
    
    document.getElementById('modalProductName').textContent = productData.name;
    document.getElementById('modalPriceIdr').textContent = productData.price;
    document.getElementById('modalPriceMyr').textContent = productData.price2;
    document.getElementById('modalPriceUsd').textContent = productData.price3;
    
    // Reset form
    document.getElementById('username').value = '';
    document.getElementById('quantity').value = '1';
    
    // Reset currency to IDR
    document.querySelectorAll('.currency-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-currency') === 'IDR') {
            btn.classList.add('active');
        }
    });
    
    // Reset contact to WhatsApp
    document.querySelectorAll('.contact-option').forEach(option => {
        option.classList.remove('active');
        if (option.getAttribute('data-contact') === 'whatsapp') {
            option.classList.add('active');
        }
    });
    
    // Update payment methods
    updatePaymentMethods('IDR');
    
    // Show modal
    orderModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    orderModal.classList.remove('active');
    loadingOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Update payment methods based on currency
function updatePaymentMethods(currency) {
    const paymentButtons = document.getElementById('paymentButtons');
    paymentButtons.innerHTML = '';
    
    paymentMethods[currency].forEach(method => {
        const button = document.createElement('button');
        button.className = 'payment-btn';
        if (method.disabled) {
            button.classList.add('disabled');
            button.setAttribute('disabled', 'disabled');
        }
        button.setAttribute('data-payment', method.id);
        button.innerHTML = `
            <i class="${method.icon}"></i>
            ${method.name}
        `;
        
        button.addEventListener('click', function() {
            if (!method.disabled) {
                document.querySelectorAll('.payment-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
        
        paymentButtons.appendChild(button);
    });
    
    // Activate first enabled payment method
    const firstEnabled = paymentButtons.querySelector('.payment-btn:not(.disabled)');
    if (firstEnabled) {
        firstEnabled.classList.add('active');
    }
    
    // Jika tidak ada yang enabled, tampilkan pesan
    if (!firstEnabled) {
        const noPaymentMsg = document.createElement('div');
        noPaymentMsg.className = 'no-payment-message';
        noPaymentMsg.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>No payment methods available for ${currency}</span>
        `;
        paymentButtons.appendChild(noPaymentMsg);
    }
}

// Process order
function processOrder() {
    // Validate form
    const username = document.getElementById('username').value.trim();
    const quantity = parseInt(document.getElementById('quantity').value);
    const activeContact = document.querySelector('.contact-option.active').getAttribute('data-contact');
    const activeCurrency = document.querySelector('.currency-btn.active').getAttribute('data-currency');
    const activePayment = document.querySelector('.payment-btn.active');
    
    if (!username) {
        showToast('Please enter your Roblox username!', 'error');
        return;
    }
    
    if (quantity < 1 || quantity > 100) {
        showToast('Quantity must be between 1-100!', 'error');
        return;
    }
    
    if (!activePayment) {
        showToast('Please select a payment method!', 'error');
        return;
    }
    
    // Check if selected payment method is disabled
    if (activePayment.classList.contains('disabled')) {
        showToast('Selected payment method is not available!', 'error');
        return;
    }
    
    // Get selected payment method
    const paymentMethod = activePayment.textContent.trim();
    
    // Get price based on currency
    let price = '';
    switch(activeCurrency) {
        case 'IDR':
            price = currentProduct.price;
            break;
        case 'MYR':
            price = currentProduct.price2;
            break;
        case 'USD':
            price = currentProduct.price3;
            break;
    }
    
    // Show loading animation
    loadingOverlay.classList.add('active');
    
    // Prepare message
    const messageTemplate = messages[activeCurrency][activeContact];
    const message = messageTemplate
        .replace(/{product}/g, currentProduct.name)
        .replace(/{quantity}/g, quantity)
        .replace(/{price}/g, price)
        .replace(/{username}/g, username)
        .replace(/{payment}/g, paymentMethod);
    
    // Simulate truck animation
    setTimeout(() => {
        loadingOverlay.classList.remove('active');
        
        if (activeContact === 'whatsapp') {
            // WhatsApp redirect dengan metode universal
            const whatsappUrl = `https://wa.me/6288289171435?text=${encodeURIComponent(message)}`;
            
            // Deteksi browser dan gunakan metode yang sesuai
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            const isIOS = /iPhone|iPad|iPod/.test(userAgent);
            const isInApp = /Instagram|Discord|Line|Messenger|FBAN|FBAV/.test(userAgent);
            
            // Untuk iOS, Instagram, Discord - gunakan metode yang lebih kompatibel
            if (isIOS || isInApp) {
                // Method 1: window.location (lebih kompatibel untuk iOS/in-app browsers)
                window.location.href = whatsappUrl;
                
                // Method 2: backup dengan window.open setelah delay
                setTimeout(() => {
                    window.open(whatsappUrl, '_blank');
                }, 500);
            } else {
                // Untuk browser normal (Chrome, Firefox, Safari desktop)
                const newWindow = window.open(whatsappUrl, '_blank');
                
                // Jika window.open diblokir, gunakan fallback
                if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
                    // Method 3: create dynamic link dan klik
                    const link = document.createElement('a');
                    link.href = whatsappUrl;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    
                    // Trigger click event
                    const clickEvent = new MouseEvent('click', {
                        view: window,
                        bubbles: true,
                        cancelable: true
                    });
                    link.dispatchEvent(clickEvent);
                    
                    // Cleanup
                    setTimeout(() => {
                        if (link.parentNode) {
                            document.body.removeChild(link);
                        }
                    }, 100);
                }
            }
            
        } else {
            // Instagram redirect
            const instagramUrl = `https://instagram.com/vechnost.id`;
            
            // Deteksi browser
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            const isInApp = /Instagram|Discord/.test(userAgent);
            
            if (isInApp) {
                // Untuk in-app browser, gunakan window.location
                window.location.href = instagramUrl;
            } else {
                // Untuk browser normal, coba window.open dulu
                const newWindow = window.open(instagramUrl, '_blank');
                
                // Jika diblokir, gunakan metode alternatif
                if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
                    window.location.href = instagramUrl;
                }
            }
        }
        
        // Close modal setelah delay
        setTimeout(() => {
            closeModal();
            showToast('Order processed successfully! Redirecting...', 'success');
        }, 800);
        
    }, 1500);
}

// Toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    // Position based on browser
    if (isSafari) {
        toast.style.top = '60px';
    }
    
    document.body.appendChild(toast);
    
    // Show toast with animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 350);
    }, 3000);
}

// ============================================ //
// BEST SELLER CARDS INITIALIZATION             //
// ============================================ //

function initBestSellerCards() {
    // Wait for DOM to be ready
    setTimeout(() => {
        const bestSellerCards = document.querySelectorAll('.best-seller-card');
        
        bestSellerCards.forEach(card => {
            // Get image URL and preload it
            const img = card.querySelector('.best-seller-image img');
            if (img && img.src) {
                imageManager.preload(img.src);
            }
            
            // Click event
            card.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const itemId = this.getAttribute('data-item');
                
                // Cari item di semua data produk
                let itemData = null;
                
                if (window.fishData) {
                    itemData = window.fishData.find(item => item.itemId === itemId);
                }
                
                if (!itemData && window.jokiData) {
                    itemData = window.jokiData.find(item => item.itemId === itemId);
                }
                
                if (!itemData && window.gamepassData) {
                    itemData = window.gamepassData.find(item => item.itemId === itemId);
                }
                
                if (!itemData && window.accountData) {
                    itemData = window.accountData.find(item => item.itemId === itemId);
                }
                
                if (itemData && window.openModalWithProduct) {
                    window.openModalWithProduct(itemData);
                } else {
                    console.error('Item not found:', itemId);
                }
            });
            
            // Accessibility
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.style.cursor = 'pointer';
        });
        
        console.log('✅ Best Seller cards initialized');
    }, 500);
}

// ============================================ //
// INITIALIZATION & EXPORTS                     //
// ============================================ //

// Main initialization function
async function init() {
    console.log('🚀 Starting VECHNOST initialization...');
    
    try {
        // Start instant load
        await initInstantLoad();
        
        // Initialize Best Seller cards
        initBestSellerCards();
        
        // Footer links
        setupFooterLinks();
        
        console.log('✅ VECHNOST fully initialized');
        
        // Mark as loaded
        document.body.classList.add('vechnost-loaded');
        
    } catch (error) {
        console.error('❌ Initialization error:', error);
        // Fallback: render basic content
        renderFishImages();
    }
}

// Setup footer links
function setupFooterLinks() {
    const jokiLink = document.getElementById('joki-footer-link');
    if (jokiLink) {
        jokiLink.addEventListener('click', function(e) {
            e.preventDefault();
            const jokiBtn = document.querySelector('[data-category="joki"]');
            if (jokiBtn) jokiBtn.click();
        });
    }
    
    const gamepassLink = document.getElementById('gamepass-footer-link');
    if (gamepassLink) {
        gamepassLink.addEventListener('click', function(e) {
            e.preventDefault();
            const gamepassBtn = document.querySelector('[data-category="gamepass"]');
            if (gamepassBtn) gamepassBtn.click();
        });
    }
    
    const accountLink = document.getElementById('account-footer-link');
    if (accountLink) {
        accountLink.addEventListener('click', function(e) {
            e.preventDefault();
            const accountBtn = document.querySelector('[data-category="account"]');
            if (accountBtn) accountBtn.click();
        });
    }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ============================================ //
// GLOBAL EXPORTS                               //
// ============================================ //

// Export untuk akses global
window.VECHNOST = {
    // Data
    fishData,
    jokiData,
    gamepassData,
    accountData,
    
    // Functions
    openModalWithProduct,
    imageManager,
    
    // Configuration
    config,
    
    // Browser detection
    isSafari,
    isChrome,
    isFirefox,
    isIOS,
    isAndroid
};

// Export untuk akses dari file lain
window.fishData = fishData;
window.jokiData = jokiData;
window.gamepassData = gamepassData;
window.accountData = accountData;
window.openModalWithProduct = openModalWithProduct;