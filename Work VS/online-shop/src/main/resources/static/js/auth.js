// Authentication UI; API methods are defined in api.js.
// Get base path for navigation
function getBasePath() {
    const path = window.location.pathname;
    if (path.includes('/pages/')) {
        return '../';
    }
    return '';
}

// Update UI based on auth state
function updateAuthUI() {
    const user = getCurrentUser();
    const userMenu = document.getElementById('user-menu');
    const userLogged = document.getElementById('user-logged');
    const userName = document.getElementById('user-name');
    const adminLink = document.getElementById('admin-link');
    
    if (user) {
        if (userMenu) userMenu.style.display = 'none';
        if (userLogged) userLogged.style.display = 'block';
        if (userName) userName.textContent = user.name;
        if (adminLink) {
            adminLink.style.display = user.role === 'admin' ? 'flex' : 'none';
        }
    } else {
        if (userMenu) userMenu.style.display = 'block';
        if (userLogged) userLogged.style.display = 'none';
    }
}

// Initialize auth event listeners
function initAuthListeners() {
    // Login button
    const loginBtn = document.getElementById('login-btn');
    const loginModal = document.getElementById('login-modal');
    const modalClose = document.getElementById('modal-close');
    const modalOverlay = document.querySelector('.modal-overlay');
    const authForm = document.getElementById('auth-form');
    const switchToRegister = document.getElementById('switch-to-register');
    const modalTitle = document.getElementById('modal-title');
    const authSubmit = document.getElementById('auth-submit');
    const nameGroup = document.getElementById('name-group');
    const authSwitch = document.getElementById('auth-switch');
    
    let isLoginMode = true;
    
    // Open modal
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            if (loginModal) loginModal.classList.add('show');
        });
    }
    
    // Close modal
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            if (loginModal) loginModal.classList.remove('show');
        });
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', () => {
            if (loginModal) loginModal.classList.remove('show');
        });
    }
    
    // Switch between login and register
    if (switchToRegister) {
        authSwitch.addEventListener('click', (e) => {
            if (e.target.id !== 'switch-to-register') return;
            e.preventDefault();
            isLoginMode = !isLoginMode;
            
            if (isLoginMode) {
                modalTitle.textContent = 'Вход';
                authSubmit.textContent = 'Войти';
                nameGroup.style.display = 'none';
                authSwitch.innerHTML = 'Нет аккаунта? <a href="#" id="switch-to-register">Зарегистрироваться</a>';
            } else {
                modalTitle.textContent = 'Регистрация';
                authSubmit.textContent = 'Зарегистрироваться';
                nameGroup.style.display = 'block';
                authSwitch.innerHTML = 'Уже есть аккаунт? <a href="#" id="switch-to-register">Войти</a>';
            }
            
        });
    }
    
    // Form submit
    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            let result;
            
            if (isLoginMode) {
                result = login(email, password);
            } else {
                const name = document.getElementById('name').value;
                result = register(name, email, password);
            }
            
            if (result.success) {
                showToast('Добро пожаловать, ' + result.user.name + '!', 'success');
                loginModal.classList.remove('show');
                updateAuthUI();
                updateCartCount();
                authForm.reset();
            } else {
                showToast(result.message, 'error');
            }
        });
    }
    
    // User dropdown toggle
    const userBtn = document.getElementById('user-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');
    
    if (userBtn && dropdownMenu) {
        userBtn.addEventListener('click', () => {
            dropdownMenu.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-dropdown')) {
                dropdownMenu.classList.remove('show');
            }
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
        });
    }
}

// Protect admin pages
function protectAdminPage() {
    if (!isAdmin()) {
        window.location.href = getBasePath() + 'index.html';
        return false;
    }
    return true;
}

// Protect user pages
function protectUserPage() {
    if (!isLoggedIn()) {
        window.location.href = getBasePath() + 'index.html';
        return false;
    }
    return true;
}

