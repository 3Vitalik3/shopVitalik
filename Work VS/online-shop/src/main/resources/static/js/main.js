// ===== Main JavaScript =====

// Toast notification system
function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Render product card
function renderProductCard(product, basePath = '') {
    const badge = product.isNew ? '<span class="product-badge new">Новинка</span>' : 
                  product.isSale ? '<span class="product-badge">Скидка</span>' : '';
    
    return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">
                ${badge}
                <a href="${basePath}pages/product.html?id=${product.id}">
                    <img src="${product.image}" alt="${product.name}">
                </a>
            </div>
            <div class="product-info">
                <p class="product-category">${product.categoryName}</p>
                <h3 class="product-name">
                    <a href="${basePath}pages/product.html?id=${product.id}">${product.name}</a>
                </h3>
                <div class="product-price">
                    <span class="current-price">${formatPrice(product.price)}</span>
                    ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>` : ''}
                </div>
                <div class="product-actions">
                    <button class="btn btn-primary btn-sm" onclick="addToCart(${product.id})">
                        <i class="fas fa-cart-plus"></i>
                        В корзину
                    </button>
                    <a href="${basePath}pages/product.html?id=${product.id}" class="btn btn-outline btn-sm">
                        <i class="fas fa-eye"></i>
                    </a>
                </div>
            </div>
        </div>
    `;
}

// Load popular products on home page
function loadPopularProducts() {
    const container = document.getElementById('popular-products');
    if (!container) return;
    
    const products = getProducts();
    const popularProducts = products.slice(0, 4); // Show first 4 products
    
    container.innerHTML = popularProducts.map(product => renderProductCard(product)).join('');
}

// Initialize page
function initPage() {
    // Initialize data
    initializeData();
    
    // Initialize cart
    initCart();
    
    // Update auth UI
    updateAuthUI();
    
    // Initialize auth listeners
    initAuthListeners();
    
    // Load popular products on home page
    loadPopularProducts();
}

// Run on DOM ready
document.addEventListener('DOMContentLoaded', initPage);
