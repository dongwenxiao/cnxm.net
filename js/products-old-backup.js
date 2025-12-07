// ==========================================
// Products Page - Filter Functionality
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    initProductFilter();
});

function initProductFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCategories = document.querySelectorAll('.product-category');
    
    if (filterButtons.length === 0 || productCategories.length === 0) {
        return;
    }
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter products
            if (filter === 'all') {
                productCategories.forEach(category => {
                    category.style.display = 'block';
                });
            } else {
                productCategories.forEach(category => {
                    const categoryType = category.getAttribute('data-category');
                    if (categoryType === filter) {
                        category.style.display = 'block';
                    } else {
                        category.style.display = 'none';
                    }
                });
            }
            
            // Scroll to first visible category
            const firstVisible = Array.from(productCategories).find(cat => cat.style.display !== 'none');
            if (firstVisible && filter !== 'all') {
                const offset = firstVisible.offsetTop - 100;
                window.scrollTo({
                    top: offset,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Check URL hash for direct category access
    const hash = window.location.hash.substring(1);
    if (hash) {
        const targetCategory = document.getElementById(hash);
        if (targetCategory) {
            // Find and click the corresponding filter button
            const matchingButton = Array.from(filterButtons).find(btn => btn.getAttribute('data-filter') === hash);
            if (matchingButton) {
                matchingButton.click();
            }
            
            // Scroll to category
            setTimeout(() => {
                const offset = targetCategory.offsetTop - 100;
                window.scrollTo({
                    top: offset,
                    behavior: 'smooth'
                });
            }, 100);
        }
    }
}

// ==========================================
// Product Comparison (Future Enhancement)
// ==========================================

let comparisonList = [];

function addToComparison(productId) {
    if (comparisonList.includes(productId)) {
        alert('Product already in comparison list');
        return;
    }
    
    if (comparisonList.length >= 4) {
        alert('Maximum 4 products can be compared at once');
        return;
    }
    
    comparisonList.push(productId);
    updateComparisonUI();
}

function removeFromComparison(productId) {
    comparisonList = comparisonList.filter(id => id !== productId);
    updateComparisonUI();
}

function updateComparisonUI() {
    // Update comparison widget (if implemented)
    console.log('Comparison list updated:', comparisonList);
}

// ==========================================
// Product Quick View (Modal - Future Enhancement)
// ==========================================

function showProductQuickView(productId) {
    // Implementation for product quick view modal
    console.log('Show quick view for product:', productId);
}