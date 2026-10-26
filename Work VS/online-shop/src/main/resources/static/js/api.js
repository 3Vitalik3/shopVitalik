// Browser UI adapter. Spring Boot owns users, products, orders and each user's cart.
let activeUser;
let csrfToken;
function requestApi(method, path, body) {
    if (method !== 'GET' && !csrfToken) csrfToken = requestApi('GET', '/api/csrf').token;
    const xhr = new XMLHttpRequest();
    xhr.open(method, path, false);
    if (body !== undefined) xhr.setRequestHeader('Content-Type', 'application/json');
    if (method !== 'GET') xhr.setRequestHeader('X-XSRF-TOKEN', csrfToken);
    try { xhr.send(body === undefined ? null : JSON.stringify(body)); }
    catch (_) { throw new Error('Не удалось связаться с сервером'); }
    let response = null;
    try { response = xhr.responseText ? JSON.parse(xhr.responseText) : null; } catch (_) {}
    if (xhr.status < 200 || xhr.status >= 300) {
        throw new Error(response?.detail || response?.message || `Ошибка сервера (${xhr.status})`);
    }
    return response;
}
function attempt(action) {
    try { return {success: true, value: action()}; }
    catch (error) { return {success: false, message: error.message}; }
}
globalThis.initializeData = () => {};
globalThis.getProducts = () => requestApi('GET', '/api/products');
globalThis.getProductById = id => {
    const result = attempt(() => requestApi('GET', `/api/products/${Number(id)}`));
    return result.success ? result.value : null;
};
globalThis.addProduct = product => requestApi('POST', '/api/products', product);
globalThis.updateProduct = (id, product) => requestApi('PUT', `/api/products/${Number(id)}`, product);
globalThis.deleteProduct = id => requestApi('DELETE', `/api/products/${Number(id)}`);
globalThis.getCategories = () => categories;
globalThis.getOrders = () => isLoggedIn() ? requestApi('GET', '/api/orders') : [];
globalThis.addOrder = () => requestApi('POST', '/api/orders', {});
globalThis.saveOrders = orders => {
    for (const order of orders) requestApi('PUT', `/api/admin/orders/${order.id}/status`, {status: order.status});
};
globalThis.getUsers = () => isAdmin() ? requestApi('GET', '/api/admin/users') : [];
globalThis.saveUsers = () => { throw new Error('Изменение пользователей через браузер запрещено'); };
globalThis.getCurrentUser = () => {
    if (activeUser !== undefined) return activeUser;
    const result = attempt(() => requestApi('GET', '/api/auth/me'));
    activeUser = result.success ? result.value : null;
    return activeUser;
};
globalThis.isLoggedIn = () => getCurrentUser() !== null;
globalThis.isAdmin = () => getCurrentUser()?.role === 'admin';
globalThis.setCurrentUser = user => { activeUser = user; };
globalThis.clearCurrentUser = () => { activeUser = null; };
globalThis.login = (email, password) => {
    const result = attempt(() => requestApi('POST', '/api/auth/login', {email, password}));
    if (result.success) { activeUser = result.value; csrfToken = null; return {success: true, user: activeUser}; }
    return result;
};
globalThis.register = (name, email, password) => {
    const result = attempt(() => requestApi('POST', '/api/auth/register', {name, email, password}));
    if (result.success) { activeUser = result.value; csrfToken = null; return {success: true, user: activeUser}; }
    return result;
};
globalThis.logout = () => {
    requestApi('POST', '/api/auth/logout', {});
    activeUser = null;
    location.href = getBasePath() + 'index.html';
};
globalThis.updateProfile = (_id, updates) => {
    const result = attempt(() => requestApi('PUT', '/api/profile', updates));
    if (result.success) { activeUser = result.value; return {success: true}; }
    return result;
};
globalThis.getCart = () => isLoggedIn() ? requestApi('GET', '/api/cart') : [];
globalThis.saveCart = cart => {
    const old = getCart();
    for (const item of old) if (!cart.some(next => next.productId === item.productId)) requestApi('PUT', `/api/cart/${item.productId}`, {quantity: 0});
    for (const item of cart) requestApi('PUT', `/api/cart/${item.productId}`, {quantity: item.quantity});
    updateCartCount();
};
globalThis.addToCart = (productId, quantity = 1) => {
    if (!isLoggedIn()) {
        showToast('Войдите в аккаунт для добавления товара', 'error');
        document.getElementById('login-modal')?.classList.add('show');
        return false;
    }
    const product = getProductById(productId);
    if (!product || !product.inStock) { showToast('Товар недоступен', 'error'); return false; }
    const item = getCart().find(entry => entry.productId === Number(productId));
    const result = attempt(() => requestApi('PUT', `/api/cart/${productId}`, {quantity: (item?.quantity || 0) + Number(quantity)}));
    if (!result.success) { showToast(result.message, 'error'); return false; }
    updateCartCount(); showToast(`${product.name} добавлен в корзину`); return true;
};
globalThis.removeFromCart = productId => {
    requestApi('PUT', `/api/cart/${productId}`, {quantity: 0});
    updateCartCount(); showToast('Товар удален из корзины'); return true;
};
globalThis.updateCartItemQuantity = (productId, quantity) => {
    requestApi('PUT', `/api/cart/${productId}`, {quantity: Number(quantity)});
    updateCartCount(); return true;
};
globalThis.clearCart = () => {
    if (isLoggedIn()) requestApi('DELETE', '/api/cart');
    updateCartCount(); showToast('Корзина очищена');
};
globalThis.checkout = () => {
    if (!isLoggedIn()) { showToast('Войдите в аккаунт', 'error'); document.getElementById('login-modal')?.classList.add('show'); return; }
    const result = attempt(() => requestApi('POST', '/api/orders', {}));
    if (!result.success) { showToast(result.message, 'error'); return; }
    updateCartCount(); showToast('Заказ успешно оформлен!');
    location.href = getBasePath() + 'pages/orders.html';
};

