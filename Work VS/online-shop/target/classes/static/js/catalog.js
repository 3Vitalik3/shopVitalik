// ===== Catalog JavaScript =====

let currentPage = 1;
const itemsPerPage = 9;
let filteredProducts = [];

// Initialize catalog
function initCatalog() {
    loadCategories();
    applyFilters();
    
    // Add event listeners for real-time search
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyFilters, 300));
    }
    
    // Add event listeners for price inputs
    const priceMin = document.getElementById('price-min');
    const priceMax = document.getElementById('price-max');
    if (priceMin) priceMin.addEventListener('input', debounce(applyFilters, 300));
    if (priceMax) priceMax.addEventListener('input', debounce(applyFilters, 300));
    
    // Add event listeners for checkboxes
    const checkboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Load categories into filter
function loadCategories() {
    const container = document.getElementById('category-filters');
    if (!container) return;
    
    const categories = getCategories();
    
    container.innerHTML = `
        <label class="filter-option">
            <input type="checkbox" name="category" value="all" checked>
            <span>Все категории</span>
        </label>
        ${categories.map(cat => `
            <label class="filter-option">
                <input type="checkbox" name="category" value="${cat.id}">
                <span>${cat.name}</span>
            </label>
        `).join('')}
    `;
    
    // Add event listeners for category checkboxes
    const categoryCheckboxes = container.querySelectorAll('input[name="category"]');
    categoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            if (e.target.value === 'all' && e.target.checked) {
                // Uncheck all other categories
                categoryCheckboxes.forEach(cb => {
                    if (cb.value !== 'all') cb.checked = false;
                });
            } else if (e.target.value !== 'all') {
                // Uncheck "all" when specific category is selected
                const allCheckbox = container.querySelector('input[value="all"]');
                if (allCheckbox) allCheckbox.checked = false;
            }
            applyFilters();
        });
    });
}

// Apply filters and render products
function applyFilters() {
    const products = getProducts();
    
    // Get filter values
    const searchQuery = document.getElementById('search-input')?.value.toLowerCase() || '';
    const priceMin = parseFloat(document.getElementById('price-min')?.value) || 0;
    const priceMax = parseFloat(document.getElementById('price-max')?.value) || Infinity;
    const filterSale = document.getElementById('filter-sale')?.checked || false;
    const filterNew = document.getElementById('filter-new')?.checked || false;
    const filterInStock = document.getElementById('filter-instock')?.checked || false;
    const sortBy = document.getElementById('sort-select')?.value || 'default';
    
    // Get selected categories
    const categoryCheckboxes = document.querySelectorAll('input[name="category"]:checked');
    const selectedCategories = Array.from(categoryCheckboxes).map(cb => cb.value);
    const allCategories = selectedCategories.includes('all') || selectedCategories.length === 0;
    
    // Filter products
    filteredProducts = products.filter(product => {
        // Search filter
        if (searchQuery && !product.name.toLowerCase().includes(searchQuery) && 
            !product.description.toLowerCase().includes(searchQuery)) {
            return false;
        }
        
        // Category filter
        if (!allCategories && !selectedCategories.includes(product.category)) {
            return false;
        }
        
        // Price filter
        if (product.price < priceMin || product.price > priceMax) {
            return false;
        }
        
        // Sale filter
        if (filterSale && !product.isSale) {
            return false;
        }
        
        // New filter
        if (filterNew && !product.isNew) {
            return false;
        }
        
        // In stock filter
        if (filterInStock && !product.inStock) {
            return false;
        }
        
        return true;
    });
    
    // Sort products
    filteredProducts = sortProducts(filteredProducts, sortBy);
    
    // Reset to first page
    currentPage = 1;
    
    // Render products
    renderCatalogProducts();
    renderPagination();
}

// Sort products
function sortProducts(products, sortBy) {
    const sorted = [...products];
    
    switch (sortBy) {
        case 'price-asc':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            sorted.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            sorted.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
            break;
        case 'name-desc':
            sorted.sort((a, b) => b.name.localeCompare(a.name, 'ru'));
            break;
        case 'rating':
            sorted.sort((a, b) => b.rating - a.rating);
            break;
        default:
            // Keep original order
            break;
    }
    
    return sorted;
}

// Render catalog products
function renderCatalogProducts() {
    const container = document.getElementById('catalog-grid');
    const countElement = document.getElementById('products-count');
    
    if (!container) return;
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageProducts = filteredProducts.slice(startIndex, endIndex);
    
    // Update count
    if (countElement) {
        countElement.textContent = filteredProducts.length;
    }
    
    // Render products
    if (pageProducts.length === 0) {
        container.innerHTML = `
            <div class="cart-empty" style="grid-column: 1 / -1;">
                <i class="fas fa-search"></i>
                <h3>Товары не найдены</h3>
                <p>Попробуйте изменить параметры фильтрации</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = pageProducts.map(product => renderProductCard(product, '../')).join('');
}

// Render pagination
function renderPagination() {
    const container = document.getElementById('pagination');
    if (!container) return;
    
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button class="pagination-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            paginationHTML += `
                <button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += '<span class="pagination-dots">...</span>';
        }
    }
    
    // Next button
    paginationHTML += `
        <button class="pagination-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    container.innerHTML = paginationHTML;
}

// Go to specific page
function goToPage(page) {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderCatalogProducts();
    renderPagination();
    
    // Scroll to top of catalog
    document.querySelector('.catalog-section')?.scrollIntoView({ behavior: 'smooth' });
}

// Reset filters
function resetFilters() {
    // Reset search
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    
    // Reset price
    const priceMin = document.getElementById('price-min');
    const priceMax = document.getElementById('price-max');
    if (priceMin) priceMin.value = '';
    if (priceMax) priceMax.value = '';
    
    // Reset checkboxes
    document.getElementById('filter-sale').checked = false;
    document.getElementById('filter-new').checked = false;
    document.getElementById('filter-instock').checked = false;
    
    // Reset categories
    const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
    categoryCheckboxes.forEach(cb => {
        cb.checked = cb.value === 'all';
    });
    
    // Reset sort
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = 'default';
    
    // Apply filters
    applyFilters();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initCatalog);
