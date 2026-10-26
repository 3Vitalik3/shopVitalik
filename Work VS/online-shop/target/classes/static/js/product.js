// ===== Product Detail JavaScript =====

let currentProduct = null;
let selectedQuantity = 1;

// Initialize product page
function initProductPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        showProductNotFound();
        return;
    }
    
    currentProduct = getProductById(productId);
    
    if (!currentProduct) {
        showProductNotFound();
        return;
    }
    
    renderProductDetail();
    loadRelatedProducts();
    updatePageTitle();
}

// Show product not found message
function showProductNotFound() {
    const container = document.getElementById('product-container');
    if (container) {
        container.innerHTML = `
            <div class="cart-empty" style="grid-column: 1 / -1;">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Товар не найден</h3>
                <p>К сожалению, запрашиваемый товар не существует</p>
                <a href="catalog.html" class="btn btn-primary">
                    <i class="fas fa-arrow-left"></i>
                    Вернуться в каталог
                </a>
            </div>
        `;
    }
}

// Update page title
function updatePageTitle() {
    if (currentProduct) {
        document.title = `${currentProduct.name} - Online Shop`;
        document.getElementById('product-title').textContent = currentProduct.name;
        document.getElementById('breadcrumb-product').textContent = currentProduct.name;
    }
}

// Render product detail
function renderProductDetail() {
    const container = document.getElementById('product-container');
    if (!container || !currentProduct) return;
    
    const starsHTML = renderStars(currentProduct.rating);
    const featuresHTML = currentProduct.features ? currentProduct.features.map(f => `
        <div class="feature-item">
            <i class="fas fa-check"></i>
            <span>${f}</span>
        </div>
    `).join('') : '';
    
    container.innerHTML = `
        <div class="product-gallery">
            <div class="main-image">
                <img src="${currentProduct.image}" alt="${currentProduct.name}" id="main-product-image">
            </div>
            ${currentProduct.images && currentProduct.images.length > 1 ? `
                <div class="thumbnail-images">
                    ${currentProduct.images.map((img, index) => `
                        <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="changeMainImage('${img}', this)">
                            <img src="${img}" alt="${currentProduct.name}">
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
        <div class="product-detail-info">
            <h1>${currentProduct.name}</h1>
            <p class="product-detail-category">${currentProduct.categoryName}</p>
            
            <div class="product-rating">
                <div class="stars">${starsHTML}</div>
                <span class="rating-count">${currentProduct.rating} (${currentProduct.reviews} отзывов)</span>
            </div>
            
            <div class="product-detail-price">
                <span class="current-price">${formatPrice(currentProduct.price)}</span>
                ${currentProduct.oldPrice ? `<span class="old-price">${formatPrice(currentProduct.oldPrice)}</span>` : ''}
            </div>
            
            <p class="product-description">${currentProduct.description}</p>
            
            <div class="product-quantity">
                <span>Количество:</span>
                <div class="quantity-selector">
                    <button class="quantity-btn" onclick="changeQuantity(-1)">-</button>
                    <input type="number" class="quantity-input" id="product-quantity" value="1" min="1" onchange="updateQuantity(this.value)">
                    <button class="quantity-btn" onclick="changeQuantity(1)">+</button>
                </div>
            </div>
            
            <div class="product-detail-actions">
                <button class="btn btn-primary btn-lg" onclick="addProductToCart()">
                    <i class="fas fa-cart-plus"></i>
                    Добавить в корзину
                </button>
                <button class="btn btn-outline btn-lg" onclick="buyNow()">
                    <i class="fas fa-bolt"></i>
                    Купить сейчас
                </button>
            </div>
            
            ${featuresHTML ? `
                <div class="product-features">
                    <h3>Характеристики</h3>
                    <div class="features-list">
                        ${featuresHTML}
                    </div>
                </div>
            ` : ''}
            
            <div class="product-features">
                <h3>Доставка и оплата</h3>
                <div class="features-list">
                    <div class="feature-item">
                        <i class="fas fa-truck"></i>
                        <span>Бесплатная доставка от 5 000 ₽</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-credit-card"></i>
                        <span>Оплата картой или наличными</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-undo"></i>
                        <span>Возврат в течение 14 дней</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render star rating
function renderStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// Change main image
function changeMainImage(src, thumbnail) {
    const mainImage = document.getElementById('main-product-image');
    if (mainImage) {
        mainImage.src = src;
    }
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
    if (thumbnail) {
        thumbnail.classList.add('active');
    }
}

// Change quantity
function changeQuantity(delta) {
    const input = document.getElementById('product-quantity');
    if (input) {
        const newValue = Math.max(1, parseInt(input.value) + delta);
        input.value = newValue;
        selectedQuantity = newValue;
    }
}

// Update quantity from input
function updateQuantity(value) {
    selectedQuantity = Math.max(1, parseInt(value) || 1);
    const input = document.getElementById('product-quantity');
    if (input) {
        input.value = selectedQuantity;
    }
}

// Add product to cart
function addProductToCart() {
    if (currentProduct) {
        addToCart(currentProduct.id, selectedQuantity);
    }
}

// Buy now - add to cart and go to checkout
function buyNow() {
    if (currentProduct) {
        addToCart(currentProduct.id, selectedQuantity);
        window.location.href = 'cart.html';
    }
}

// Load related products
function loadRelatedProducts() {
    const container = document.getElementById('related-products');
    if (!container || !currentProduct) return;
    
    const products = getProducts();
    const relatedProducts = products
        .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
        .slice(0, 4);
    
    if (relatedProducts.length === 0) {
        // Show random products if no related products
        const randomProducts = products
            .filter(p => p.id !== currentProduct.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 4);
        
        container.innerHTML = randomProducts.map(p => renderProductCard(p, '../')).join('');
    } else {
        container.innerHTML = relatedProducts.map(p => renderProductCard(p, '../')).join('');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initProductPage);
