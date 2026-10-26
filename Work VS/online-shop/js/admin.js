// ===== Admin Panel JavaScript =====

let editingProductId = null;

// Initialize admin page
function initAdminPage() {
    // Check if user is admin
    if (!isAdmin()) {
        window.location.href = '../index.html';
        return;
    }
    
    initAdminTabs();
    loadDashboard();
    loadProductsTable();
    loadOrdersTable();
    loadUsersTable();
    initProductForm();
}

// Initialize admin tabs
function initAdminTabs() {
    const menuItems = document.querySelectorAll('.admin-menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.dataset.tab;
            
            // Update active menu item
            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');
            
            // Show corresponding tab
            document.querySelectorAll('.admin-tab').forEach(tab => {
                tab.style.display = 'none';
            });
            document.getElementById(`${tabId}-tab`).style.display = 'block';
        });
    });
}

// Load dashboard stats
function loadDashboard() {
    const products = getProducts();
    const orders = getOrders();
    const users = getUsers();
    
    document.getElementById('stat-products').textContent = products.length;
    document.getElementById('stat-orders').textContent = orders.length;
    document.getElementById('stat-users').textContent = users.length;
    
    // Load recent orders
    loadRecentOrders();
}

// Load recent orders
function loadRecentOrders() {
    const container = document.getElementById('recent-orders');
    if (!container) return;
    
    const orders = getOrders();
    const users = getUsers();
    const recentOrders = orders.slice(-5).reverse();
    
    if (recentOrders.length === 0) {
        container.innerHTML = '<p style="color: var(--gray-color);">Нет заказов</p>';
        return;
    }
    
    container.innerHTML = `
        <table class="products-table">
            <thead>
                <tr>
                    <th>№</th>
                    <th>Клиент</th>
                    <th>Сумма</th>
                    <th>Статус</th>
                </tr>
            </thead>
            <tbody>
                ${recentOrders.map(order => {
                    const user = users.find(u => u.id === order.userId);
                    return `
                        <tr>
                            <td>#${order.id}</td>
                            <td>${user ? user.name : 'Неизвестно'}</td>
                            <td>${formatPrice(order.total)}</td>
                            <td><span class="order-status ${order.status}">${getStatusText(order.status)}</span></td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

// Get status text
function getStatusText(status) {
    const statuses = {
        'pending': 'Ожидает',
        'processing': 'В обработке',
        'shipped': 'Отправлен',
        'delivered': 'Доставлен'
    };
    return statuses[status] || status;
}

// Load products table
function loadProductsTable() {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;
    
    const products = getProducts();
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td><img src="${product.image}" alt="${product.name}"></td>
            <td>${product.name}</td>
            <td>${product.categoryName}</td>
            <td>${formatPrice(product.price)}</td>
            <td>
                <span style="color: ${product.inStock ? 'var(--secondary-color)' : 'var(--danger-color)'}">
                    ${product.inStock ? 'В наличии' : 'Нет в наличии'}
                </span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-sm btn-outline" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="confirmDeleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load orders table
function loadOrdersTable() {
    const tbody = document.getElementById('orders-table-body');
    if (!tbody) return;
    
    const orders = getOrders();
    const users = getUsers();
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Нет заказов</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => {
        const user = users.find(u => u.id === order.userId);
        const orderDate = new Date(order.date).toLocaleDateString('ru-RU');
        
        return `
            <tr>
                <td>#${order.id}</td>
                <td>${orderDate}</td>
                <td>${user ? user.name : 'Неизвестно'}</td>
                <td>${formatPrice(order.total)}</td>
                <td>
                    <select class="order-status-select" onchange="updateOrderStatus(${order.id}, this.value)">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Ожидает</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>В обработке</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Отправлен</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Доставлен</option>
                    </select>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="viewOrderDetails(${order.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Update order status
function updateOrderStatus(orderId, status) {
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
        order.status = status;
        saveOrders(orders);
        showToast('Статус заказа обновлен', 'success');
        loadRecentOrders();
    }
}

// View order details
function viewOrderDetails(orderId) {
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    const users = getUsers();
    const user = users.find(u => u.id === order.userId);
    
    alert(`Заказ #${order.id}\n\nКлиент: ${user ? user.name : 'Неизвестно'}\nАдрес: ${order.address}\n\nТовары:\n${order.items.map(item => `- ${item.name} x${item.quantity} = ${formatPrice(item.price * item.quantity)}`).join('\n')}\n\nИтого: ${formatPrice(order.total)}`);
}

// Load users table
function loadUsersTable() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    
    const users = getUsers();
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>
                <span style="color: ${user.role === 'admin' ? 'var(--primary-color)' : 'var(--gray-color)'}">
                    ${user.role === 'admin' ? 'Администратор' : 'Покупатель'}
                </span>
            </td>
            <td>${user.phone || '-'}</td>
        </tr>
    `).join('');
}

// Open product modal
function openProductModal(productId = null) {
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('product-modal-title');
    const form = document.getElementById('product-form');
    
    editingProductId = productId;
    
    if (productId) {
        // Edit mode
        title.textContent = 'Редактировать товар';
        const product = getProductById(productId);
        
        if (product) {
            document.getElementById('product-id').value = product.id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-old-price').value = product.oldPrice || '';
            document.getElementById('product-rating').value = product.rating || '';
            document.getElementById('product-image').value = product.image;
            document.getElementById('product-description').value = product.description;
            document.getElementById('product-features').value = product.features ? product.features.join(', ') : '';
            document.getElementById('product-instock').checked = product.inStock;
            document.getElementById('product-isnew').checked = product.isNew;
            document.getElementById('product-issale').checked = product.isSale;
        }
    } else {
        // Add mode
        title.textContent = 'Добавить товар';
        form.reset();
        document.getElementById('product-id').value = '';
        document.getElementById('product-instock').checked = true;
    }
    
    modal.classList.add('show');
}

// Close product modal
function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.remove('show');
    editingProductId = null;
}

// Edit product
function editProduct(productId) {
    openProductModal(productId);
}

// Confirm delete product
function confirmDeleteProduct(productId) {
    const product = getProductById(productId);
    
    if (confirm(`Вы уверены, что хотите удалить товар "${product.name}"?`)) {
        deleteProduct(productId);
        showToast('Товар удален', 'success');
        loadProductsTable();
        loadDashboard();
    }
}

// Initialize product form
function initProductForm() {
    const form = document.getElementById('product-form');
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const categoryNames = {
                'electronics': 'Электроника',
                'clothing': 'Одежда',
                'accessories': 'Аксессуары',
                'home': 'Для дома'
            };
            
            const productData = {
                name: document.getElementById('product-name').value,
                category: document.getElementById('product-category').value,
                categoryName: categoryNames[document.getElementById('product-category').value],
                price: parseFloat(document.getElementById('product-price').value),
                oldPrice: document.getElementById('product-old-price').value ? parseFloat(document.getElementById('product-old-price').value) : null,
                rating: parseFloat(document.getElementById('product-rating').value) || 4.5,
                reviews: Math.floor(Math.random() * 500) + 50,
                image: document.getElementById('product-image').value,
                images: [document.getElementById('product-image').value],
                description: document.getElementById('product-description').value,
                features: document.getElementById('product-features').value.split(',').map(f => f.trim()).filter(f => f),
                inStock: document.getElementById('product-instock').checked,
                isNew: document.getElementById('product-isnew').checked,
                isSale: document.getElementById('product-issale').checked
            };
            
            if (editingProductId) {
                // Update existing product
                updateProduct(editingProductId, productData);
                showToast('Товар обновлен', 'success');
            } else {
                // Add new product
                addProduct(productData);
                showToast('Товар добавлен', 'success');
            }
            
            closeProductModal();
            loadProductsTable();
            loadDashboard();
        });
    }
    
    // Close modal on overlay click
    const modalOverlay = document.querySelector('#product-modal .modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeProductModal);
    }
}

// Add styles for order status select
const style = document.createElement('style');
style.textContent = `
    .order-status-select {
        padding: 5px 10px;
        border: 1px solid var(--light-color);
        border-radius: var(--border-radius);
        font-size: 0.875rem;
        cursor: pointer;
    }
    
    .order-status {
        padding: 5px 10px;
        border-radius: 15px;
        font-size: 0.75rem;
        font-weight: 500;
    }
    
    .order-status.pending {
        background-color: #fff3cd;
        color: #856404;
    }
    
    .order-status.processing {
        background-color: #cce5ff;
        color: #004085;
    }
    
    .order-status.shipped {
        background-color: #d4edda;
        color: #155724;
    }
    
    .order-status.delivered {
        background-color: #d1ecf1;
        color: #0c5460;
    }
`;
document.head.appendChild(style);

// Initialize on page load
document.addEventListener('DOMContentLoaded', initAdminPage);
