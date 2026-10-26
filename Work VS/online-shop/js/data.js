// ===== Products Data =====
const defaultProducts = [
    {
        id: 1,
        name: "Смартфон iPhone 15 Pro",
        category: "electronics",
        categoryName: "Электроника",
        price: 129990,
        oldPrice: 149990,
        image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
        images: [
            "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"
        ],
        description: "Новейший смартфон Apple с процессором A17 Pro, титановым корпусом и продвинутой камерой. Идеальный выбор для тех, кто ценит качество и инновации.",
        rating: 4.8,
        reviews: 256,
        inStock: true,
        isNew: true,
        isSale: true,
        features: ["Процессор A17 Pro", "Титановый корпус", "48 МП камера", "USB-C"]
    },
    {
        id: 2,
        name: "Ноутбук MacBook Air M3",
        category: "electronics",
        categoryName: "Электроника",
        price: 149990,
        oldPrice: null,
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
        images: [
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400"
        ],
        description: "Ультратонкий ноутбук с чипом M3, 15-дюймовым дисплеем Liquid Retina и невероятной автономностью до 18 часов.",
        rating: 4.9,
        reviews: 189,
        inStock: true,
        isNew: true,
        isSale: false,
        features: ["Чип Apple M3", "15\" Liquid Retina", "18 часов работы", "8 ГБ RAM"]
    },
    {
        id: 3,
        name: "Беспроводные наушники Sony WH-1000XM5",
        category: "electronics",
        categoryName: "Электроника",
        price: 34990,
        oldPrice: 39990,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        images: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
        ],
        description: "Премиальные беспроводные наушники с лучшим в классе шумоподавлением и кристально чистым звуком.",
        rating: 4.7,
        reviews: 423,
        inStock: true,
        isNew: false,
        isSale: true,
        features: ["Активное шумоподавление", "30 часов работы", "Быстрая зарядка", "Multipoint"]
    },
    {
        id: 4,
        name: "Кроссовки Nike Air Max 90",
        category: "clothing",
        categoryName: "Одежда",
        price: 12990,
        oldPrice: 15990,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        images: [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"
        ],
        description: "Легендарные кроссовки Nike Air Max 90 с видимой воздушной подушкой и классическим дизайном.",
        rating: 4.6,
        reviews: 567,
        inStock: true,
        isNew: false,
        isSale: true,
        features: ["Air Max подошва", "Кожа и текстиль", "Классический дизайн", "Комфортная посадка"]
    },
    {
        id: 5,
        name: "Умные часы Apple Watch Series 9",
        category: "electronics",
        categoryName: "Электроника",
        price: 44990,
        oldPrice: null,
        image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400",
        images: [
            "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400"
        ],
        description: "Самые продвинутые умные часы Apple с новым чипом S9, ярким дисплеем и функцией Double Tap.",
        rating: 4.8,
        reviews: 312,
        inStock: true,
        isNew: true,
        isSale: false,
        features: ["Чип S9", "Always-On дисплей", "Датчик кислорода", "Double Tap"]
    },
    {
        id: 6,
        name: "Рюкзак Fjällräven Kånken",
        category: "accessories",
        categoryName: "Аксессуары",
        price: 8990,
        oldPrice: 10990,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
        images: [
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400"
        ],
        description: "Культовый шведский рюкзак из прочного винилона с классическим дизайном и удобными ручками.",
        rating: 4.5,
        reviews: 234,
        inStock: true,
        isNew: false,
        isSale: true,
        features: ["Vinylon F ткань", "16 литров", "Съемная подушка", "Водоотталкивающий"]
    },
    {
        id: 7,
        name: "Кофемашина De'Longhi Magnifica",
        category: "home",
        categoryName: "Для дома",
        price: 54990,
        oldPrice: 64990,
        image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400",
        images: [
            "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400"
        ],
        description: "Автоматическая кофемашина с встроенной кофемолкой и системой приготовления капучино одним нажатием.",
        rating: 4.7,
        reviews: 178,
        inStock: true,
        isNew: false,
        isSale: true,
        features: ["Встроенная кофемолка", "Капучинатор", "13 напитков", "Сенсорный дисплей"]
    },
    {
        id: 8,
        name: "Куртка The North Face Nuptse",
        category: "clothing",
        categoryName: "Одежда",
        price: 29990,
        oldPrice: null,
        image: "https://images.unsplash.com/photo-1544923246-77307dd628b9?w=400",
        images: [
            "https://images.unsplash.com/photo-1544923246-77307dd628b9?w=400"
        ],
        description: "Легендарная пуховая куртка с 700-fill гусиным пухом и водоотталкивающей обработкой DWR.",
        rating: 4.9,
        reviews: 445,
        inStock: true,
        isNew: false,
        isSale: false,
        features: ["700-fill пух", "DWR обработка", "Складывается в карман", "Ветрозащита"]
    },
    {
        id: 9,
        name: "Игровая консоль PlayStation 5",
        category: "electronics",
        categoryName: "Электроника",
        price: 54990,
        oldPrice: 59990,
        image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400",
        images: [
            "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400"
        ],
        description: "Игровая консоль нового поколения с молниеносной загрузкой, потрясающей графикой и контроллером DualSense.",
        rating: 4.9,
        reviews: 892,
        inStock: true,
        isNew: false,
        isSale: true,
        features: ["SSD 825 ГБ", "4K 120fps", "DualSense", "Ray Tracing"]
    },
    {
        id: 10,
        name: "Солнцезащитные очки Ray-Ban Aviator",
        category: "accessories",
        categoryName: "Аксессуары",
        price: 15990,
        oldPrice: null,
        image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
        images: [
            "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400"
        ],
        description: "Классические солнцезащитные очки-авиаторы с металлической оправой и стеклянными линзами.",
        rating: 4.6,
        reviews: 321,
        inStock: true,
        isNew: false,
        isSale: false,
        features: ["Стеклянные линзы", "100% UV защита", "Металлическая оправа", "Классический дизайн"]
    },
    {
        id: 11,
        name: "Робот-пылесос Roborock S8 Pro",
        category: "home",
        categoryName: "Для дома",
        price: 69990,
        oldPrice: 79990,
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
        images: [
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
        ],
        description: "Умный робот-пылесос с функцией влажной уборки, станцией самоочистки и лидаром для навигации.",
        rating: 4.8,
        reviews: 156,
        inStock: true,
        isNew: true,
        isSale: true,
        features: ["LiDAR навигация", "Самоочистка", "Влажная уборка", "6000 Па мощность"]
    },
    {
        id: 12,
        name: "Футболка Polo Ralph Lauren",
        category: "clothing",
        categoryName: "Одежда",
        price: 7990,
        oldPrice: 9990,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
        images: [
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"
        ],
        description: "Классическая хлопковая футболка поло с вышитым логотипом и приталенным кроем.",
        rating: 4.4,
        reviews: 287,
        inStock: true,
        isNew: false,
        isSale: true,
        features: ["100% хлопок", "Вышитый логотип", "Приталенный крой", "Дышащий материал"]
    }
];

// ===== Categories =====
const categories = [
    { id: "electronics", name: "Электроника", icon: "fas fa-laptop" },
    { id: "clothing", name: "Одежда", icon: "fas fa-tshirt" },
    { id: "accessories", name: "Аксессуары", icon: "fas fa-glasses" },
    { id: "home", name: "Для дома", icon: "fas fa-home" }
];

// ===== Default Users =====
const defaultUsers = [
    {
        id: 1,
        name: "Администратор",
        email: "admin@shop.ru",
        password: "admin123",
        role: "admin",
        phone: "+7 (999) 222-22-22",
        address: "Москва, ул. Примерная, 1"
    },
    {
        id: 2,
        name: "Виталий Елисеев",
        email: "user@shop.ru",
        password: "user123",
        role: "user",
        phone: "+7 (999) 111-11-1",
        address: "Санкт-Петербург, ул. Петербург, 11"
    }
];

// ===== Initialize Data in LocalStorage =====
function initializeData() {
    // Initialize products
    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', JSON.stringify(defaultProducts));
    }
    
    // Initialize users
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
    
    // Initialize cart if not exists
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
    
    // Initialize orders if not exists
    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', JSON.stringify([]));
    }
}

// ===== Data Access Functions =====
function getProducts() {
    const products = localStorage.getItem('products');
    return products ? JSON.parse(products) : defaultProducts;
}

function getProductById(id) {
    const products = getProducts();
    return products.find(p => p.id === parseInt(id));
}

function saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
}

function addProduct(product) {
    const products = getProducts();
    const newId = Math.max(...products.map(p => p.id), 0) + 1;
    product.id = newId;
    products.push(product);
    saveProducts(products);
    return product;
}

function updateProduct(id, updatedProduct) {
    const products = getProducts();
    const index = products.findIndex(p => p.id === parseInt(id));
    if (index !== -1) {
        products[index] = { ...products[index], ...updatedProduct };
        saveProducts(products);
        return products[index];
    }
    return null;
}

function deleteProduct(id) {
    const products = getProducts();
    const filteredProducts = products.filter(p => p.id !== parseInt(id));
    saveProducts(filteredProducts);
    return true;
}

function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : defaultUsers;
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function getCategories() {
    return categories;
}

function getOrders() {
    const orders = localStorage.getItem('orders');
    return orders ? JSON.parse(orders) : [];
}

function saveOrders(orders) {
    localStorage.setItem('orders', JSON.stringify(orders));
}

function addOrder(order) {
    const orders = getOrders();
    const newId = Math.max(...orders.map(o => o.id), 0) + 1;
    order.id = newId;
    order.date = new Date().toISOString();
    orders.push(order);
    saveOrders(orders);
    return order;
}

// Initialize data on load
initializeData();
