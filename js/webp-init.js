/**
 * Early WebP Detection for Background Images
 * This script runs before main.js to ensure WebP classes are applied early
 */

(function() {
    'use strict';
    
    function checkWebPSupport() {
        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                resolve(webP.height === 2);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }
    
    // Run WebP detection immediately
    checkWebPSupport().then(supportsWebP => {
        if (supportsWebP) {
            document.documentElement.classList.add('webp');
            console.log('WebP supported, using WebP images');
        } else {
            document.documentElement.classList.add('no-webp');
            console.log('WebP not supported, using PNG fallbacks');
        }
        
        // Force style recalculation
        document.documentElement.style.display = 'none';
        document.documentElement.offsetHeight; // Trigger reflow
        document.documentElement.style.display = '';
    }).catch(error => {
        console.error('WebP detection failed:', error);
        // Fallback to no-webp
        document.documentElement.classList.add('no-webp');
    });
})();

