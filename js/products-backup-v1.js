/* ==========================================
   Products Page JavaScript - New Structure
   Two-level product organization
   ========================================== */

// Filter functionality
document.addEventListener('DOMContentLoaded', function() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCategories = document.querySelectorAll('.product-category');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter categories
            if (filter === 'all') {
                productCategories.forEach(cat => {
                    cat.style.display = 'block';
                });
            } else {
                productCategories.forEach(cat => {
                    if (cat.getAttribute('data-category') === filter) {
                        cat.style.display = 'block';
                    } else {
                        cat.style.display = 'none';
                    }
                });
            }
            
            // Scroll to first visible category
            if (filter !== 'all') {
                const firstVisible = document.querySelector(`.product-category[data-category="${filter}"]`);
                if (firstVisible) {
                    setTimeout(() => {
                        firstVisible.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                }
            }
        });
    });
});

// Toggle series expansion
function toggleSeries(seriesId) {
    const seriesProducts = document.getElementById(seriesId);
    const seriesHeader = seriesProducts.previousElementSibling;
    const icon = seriesHeader.querySelector('.series-icon');
    
    if (seriesProducts.classList.contains('expanded')) {
        seriesProducts.classList.remove('expanded');
        icon.style.transform = 'rotate(0deg)';
    } else {
        seriesProducts.classList.add('expanded');
        icon.style.transform = 'rotate(90deg)';
    }
}

// Auto-expand series based on URL hash
window.addEventListener('load', function() {
    const hash = window.location.hash.substring(1);
    if (hash) {
        const seriesElement = document.getElementById(hash);
        if (seriesElement && seriesElement.classList.contains('series-products')) {
            toggleSeries(hash);
            setTimeout(() => {
                seriesElement.parentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        }
    }
});

console.log('✓ Products page script loaded');