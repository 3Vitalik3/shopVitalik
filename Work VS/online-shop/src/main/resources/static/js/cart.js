// Cart rendering; persistence methods are defined in api.js.
// Get cart items with product details
function getCartWithProducts() {
    const cart = getCart();
    const products = getProducts();
    
    return cart.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
            ...item,
            product: product
        };
    }).filter(item => item.product); // Filter out items with deleted products
}

// Calculate cart total
function getCartTotal() {
    const cartItems = getCartWithProducts();
    return cartItems.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
    }, 0);
}

// Get cart items count
function getCartItemsCount() {
    const cart = getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
}

// Update cart count in header
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cart-count, .cart-count');
    const count = getCartItemsCount();
    
    cartCountElements.forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline-flex' : 'none';
    });
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

// Render cart items on cart page
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items-list');
    const cartEmptyMessage = document.getElementById('cart-empty');
    const cartContent = document.getElementById('cart-content');
    
    if (!cartItemsContainer) return;
    
    const cartItems = getCartWithProducts();
    
    if (cartItems.length === 0) {
        if (cartEmptyMessage) cartEmptyMessage.style.display = 'block';
        if (cartContent) cartContent.style.display = 'none';
        return;
    }
    
    if (cartEmptyMessage) cartEmptyMessage.style.display = 'none';
    if (cartContent) cartContent.style.display = 'grid';
    
    const basePath = getBasePath();
    
    cartItemsContainer.innerHTML = cartItems.map(item => `
        <div class="cart-item" data-product-id="${item.productId}">
            <div class="cart-item-image">
                <img src="${item.product.image}" alt="${item.product.name}">
            </div>
            <div class="cart-item-info">
                <h3><a href="${basePath}pages/product.html?id=${item.productId}">${item.product.name}</a></h3>
                <p>${item.product.categoryName}</p>
            </div>
            <div class="cart-item-quantity">
                <div class="quantity-selector">
                    <button class="quantity-btn" onclick="changeCartQuantity(${item.productId}, -1)">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" 
                           onchange="setCartQuantity(${item.productId}, this.value)" min="1">
                    <button class="quantity-btn" onclick="changeCartQuantity(${item.productId}, 1)">+</button>
                </div>
            </div>
            <div class="cart-item-price">${formatPrice(item.product.price * item.quantity)}</div>
            <div class="cart-item-actions">
                <button class="remove-item" onclick="removeCartItem(${item.productId})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    updateCartSummary();
}

// Update cart summary
function updateCartSummary() {
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    const itemsCountEl = document.getElementById('items-count');
    
    const cartItems = getCartWithProducts();
    const subtotal = getCartTotal();
    const shipping = subtotal > 5000 ? 0 : 500; // Free shipping over 5000
    const total = subtotal + shipping;
    
    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (totalEl) totalEl.textContent = formatPrice(total);
    if (itemsCountEl) itemsCountEl.textContent = getCartItemsCount();
    
    const shippingEl = document.getElementById('cart-shipping');
    if (shippingEl) {
        shippingEl.textContent = shipping === 0 ? 'Бесплатно' : formatPrice(shipping);
    }
}

// Change cart item quantity
function changeCartQuantity(productId, delta) {
    const cart = getCart();
    const item = cart.find(item => item.productId === productId);
    
    if (item) {
        const newQuantity = item.quantity + delta;
        if (newQuantity <= 0) {
            removeCartItem(productId);
        } else {
            updateCartItemQuantity(productId, newQuantity);
            renderCartItems();
        }
    }
}

// Set cart item quantity
function setCartQuantity(productId, quantity) {
    const qty = parseInt(quantity);
    if (qty <= 0) {
        removeCartItem(productId);
    } else {
        updateCartItemQuantity(productId, qty);
        renderCartItems();
    }
}

// Remove cart item
function removeCartItem(productId) {
    removeFromCart(productId);
    renderCartItems();
}

// Initialize cart on page load
function initCart() {
    updateCartCount();
}

