// Optimize Flash Sale Images
function optimizeFlashSaleImages() {
    const flashSaleCards = document.querySelectorAll('.flash-sale-card');
    
    flashSaleCards.forEach(card => {
        const img = card.querySelector('img');
        if (img && img.src.includes('imgur.com')) {
            // Gunakan ukuran yang lebih kecil untuk Flash Sale
            const originalSrc = img.src;
            const optimizedSrc = window.getOptimizedImageUrl ? 
                window.getOptimizedImageUrl(originalSrc, 200) : originalSrc;
            
            img.src = optimizedSrc;
            img.loading = 'eager';
            img.classList.add('priority-image');
        }
    });
}

// Dalam fungsi initFlashSale, tambahkan:
function initFlashSale() {
    console.log('Initializing Flash Sale...');
    
    // Optimasi gambar flash sale
    optimizeFlashSaleImages();
    
    // Initialize timer
    const timerInterval = initFlashSaleTimer();
    
    // Initialize card click events
    initFlashSaleCards();
    
    // Duplicate cards untuk infinite scroll
    duplicateCardsForInfiniteScroll();
    
    // Optimize animation speed
    setTimeout(() => {
        optimizeAnimationSpeed();
    }, 500);
    
    // Handle visibility change
    handleVisibilityChange();
    
    // Re-optimize on window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            optimizeAnimationSpeed();
        }, 250);
    });
    
    console.log('Flash Sale Initialized Successfully');
    
    return function cleanup() {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
    };
}
// Flash Sale Timer Countdown
function initFlashSaleTimer() {
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    
    if (!hoursElement || !minutesElement || !secondsElement) return;
    
    // Set waktu countdown (12 jam, 45 menit, 30 detik)
    let hours = 300;
    let minutes = 45;
    let seconds = 30;
    
    function updateTimer() {
        seconds--;
        
        if (seconds < 0) {
            seconds = 59;
            minutes--;
            
            if (minutes < 0) {
                minutes = 59;
                hours--;
                
                if (hours < 0) {
                    // Reset timer ketika habis
                    hours = 12;
                    minutes = 45;
                    seconds = 30;
                    
                    // Tampilkan pesan flash sale berakhir
                    const timerContainer = document.getElementById('flashSaleTimer');
                    if (timerContainer) {
                        timerContainer.innerHTML = '<div class="flash-sale-ended">Flash Sale Ended!</div>';
                    }
                    return;
                }
            }
        }
        
        // Format angka dengan leading zero
        hoursElement.textContent = hours.toString().padStart(2, '0');
        minutesElement.textContent = minutes.toString().padStart(2, '0');
        secondsElement.textContent = seconds.toString().padStart(2, '0');
        
        // Animasi saat detik berubah
        secondsElement.style.transform = 'scale(1.1)';
        setTimeout(() => {
            secondsElement.style.transform = 'scale(1)';
        }, 200);
    }
    
    // Update timer setiap detik
    const timerInterval = setInterval(updateTimer, 1000);
    updateTimer(); // Initial call
    
    return timerInterval;
}

// Event listeners untuk Flash Sale Cards
function initFlashSaleCards() {
    // Tunggu sedikit untuk pastikan semua cards sudah ada
    setTimeout(() => {
        const flashSaleCards = document.querySelectorAll('.flash-sale-card');
        console.log('Found Flash Sale Cards:', flashSaleCards.length);
        
        // Clone cards untuk menghindari duplicate event listeners
        flashSaleCards.forEach(card => {
            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);
        });
        
        // Re-select setelah cloning
        const newFlashSaleCards = document.querySelectorAll('.flash-sale-card');
        
        newFlashSaleCards.forEach(card => {
            // Click event
            card.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const itemId = this.getAttribute('data-item');
                console.log('Flash Sale Card Clicked:', itemId);
                
                // Debug: Tampilkan semua data produk yang tersedia
                console.log('Available Fish Data:', window.fishData);
                console.log('Available Joki Data:', window.jokiData);
                console.log('Available Gamepass Data:', window.gamepassData);
                console.log('Available Account Data:', window.accountData);
                
                // Gabungkan semua data produk
                const allProducts = [
                    ...(window.fishData || []),
                    ...(window.jokiData || []),
                    ...(window.gamepassData || []),
                    ...(window.accountData || [])
                ];
                
                console.log('All Products:', allProducts);
                
                // Cari item berdasarkan itemId
                let itemData = null;
                
                // Coba cari di semua data
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
                
                console.log('Found Item Data:', itemData);
                
                if (itemData) {
                    if (window.openModalWithProduct) {
                        console.log('Calling openModalWithProduct');
                        window.openModalWithProduct(itemData);
                    } else {
                        console.error('openModalWithProduct function not found!');
                        // Fallback: buka modal secara manual
                        const orderModal = document.getElementById('orderModal');
                        if (orderModal) {
                            orderModal.classList.add('active');
                            document.body.style.overflow = 'hidden';
                        }
                    }
                } else {
                    console.error('Item not found in data! Item ID:', itemId);
                    alert('Product data not found. Please try again.');
                }
            });
            
            // Keyboard accessibility
            card.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const itemId = this.getAttribute('data-item');
                    
                    // Cari item
                    let itemData = null;
                    if (window.fishData) itemData = window.fishData.find(item => item.itemId === itemId);
                    if (!itemData && window.jokiData) itemData = window.jokiData.find(item => item.itemId === itemId);
                    if (!itemData && window.gamepassData) itemData = window.gamepassData.find(item => item.itemId === itemId);
                    if (!itemData && window.accountData) itemData = window.accountData.find(item => item.itemId === itemId);
                    
                    if (itemData && window.openModalWithProduct) {
                        window.openModalWithProduct(itemData);
                    }
                }
            });
            
            // Set attributes untuk accessibility
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `Buy ${card.querySelector('.flash-sale-name')?.textContent || 'Flash Sale Item'}`);
            
            // Tambahkan style pointer
            card.style.cursor = 'pointer';
        });
        
        console.log('Flash Sale cards event listeners initialized');
    }, 500);
}

// Duplicate cards untuk infinite scroll effect
function duplicateCardsForInfiniteScroll() {
    const track = document.querySelector('.flash-sale-track');
    if (!track) return;
    
    // Simpan konten asli
    const originalHTML = track.innerHTML;
    
    // Duplicate konten untuk efek infinite
    track.innerHTML = originalHTML + originalHTML;
    
    // Update event listeners untuk semua card
    setTimeout(() => {
        initFlashSaleCards();
    }, 100);
}

// Optimize animation speed berdasarkan jumlah cards
function optimizeAnimationSpeed() {
    const track = document.querySelector('.flash-sale-track');
    const cards = document.querySelectorAll('.flash-sale-card');
    
    if (!track || cards.length === 0) return;
    
    // Hitung total width cards
    const cardCount = cards.length / 2; // Karena sudah diduplikasi
    const cardWidth = cards[0].offsetWidth || 300;
    const gap = 15;
    const totalWidth = (cardWidth + gap) * cardCount;
    
    // Hitung durasi animasi
    const baseSpeed = 30; // detik untuk satu siklus
    const speedMultiplier = totalWidth / 1000;
    const duration = baseSpeed * speedMultiplier;
    
    // Apply animation duration
    track.style.animationDuration = `${duration}s`;
    
    // Apply ke progress bar juga
    const progressBar = document.querySelector('.scroll-progress-bar');
    if (progressBar) {
        progressBar.style.animationDuration = `${duration}s`;
    }
}

// Handle visibility change untuk pause/play animasi
function handleVisibilityChange() {
    const track = document.querySelector('.flash-sale-track');
    const progressBar = document.querySelector('.scroll-progress-bar');
    
    if (!track || !progressBar) return;
    
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            track.style.animationPlayState = 'paused';
            progressBar.style.animationPlayState = 'paused';
        } else {
            track.style.animationPlayState = 'running';
            progressBar.style.animationPlayState = 'running';
        }
    });
}

// Initialize Flash Sale
function initFlashSale() {
    console.log('Initializing Flash Sale...');
    
    // Initialize timer
    const timerInterval = initFlashSaleTimer();
    
    // Initialize card click events
    initFlashSaleCards();
    
    // Duplicate cards untuk infinite scroll
    duplicateCardsForInfiniteScroll();
    
    // Optimize animation speed
    setTimeout(() => {
        optimizeAnimationSpeed();
    }, 500);
    
    // Handle visibility change
    handleVisibilityChange();
    
    // Re-optimize on window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            optimizeAnimationSpeed();
        }, 250);
    });
    
    console.log('Flash Sale Initialized Successfully');
    
    return function cleanup() {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
    };
}

// Export untuk penggunaan global
window.initFlashSale = initFlashSale;

// Auto initialize ketika DOM siap
document.addEventListener('DOMContentLoaded', function() {
    // Tunggu 1 detik untuk memastikan semua script loaded
    setTimeout(initFlashSale, 1000);
});