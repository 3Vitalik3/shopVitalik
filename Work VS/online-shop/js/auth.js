// ===== Authentication Module =====

// Get current user from session
function getCurrentUser() {
    const user = sessionStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// Set current user in session
function setCurrentUser(user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
}

// Clear current user from session
function clearCurrentUser() {
    sessionStorage.removeItem('currentUser');
}

// Check if user is logged in
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// Check if current user is admin
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

// Login function
function login(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Don't store password in session
        const sessionUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone || '',
            address: user.address || ''
        };
        setCurrentUser(sessionUser);
        return { success: true, user: sessionUser };
    }
    
    return { success: false, message: 'Неверный email или пароль' };
}

// Register function
function register(name, email, password) {
    const users = getUsers();
    
    // Check if email already exists
    if (users.find(u => u.email === email)) {
        return { success: false, message: 'Пользователь с таким email уже существует' };
    }
    
    // Create new user
    const newUser = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        name: name,
        email: email,
        password: password,
        role: 'user',
        phone: '',
        address: ''
    };
    
    users.push(newUser);
    saveUsers(users);
    
    // Auto login after registration
    const sessionUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        address: newUser.address
    };
    setCurrentUser(sessionUser);
    
    return { success: true, user: sessionUser };
}

// Logout function
function logout() {
    clearCurrentUser();
    window.location.href = getBasePath() + 'index.html';
}

// Update user profile
function updateProfile(userId, updates) {
    const users = getUsers();
    const index = users.findIndex(u => u.id === userId);
    
    if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        saveUsers(users);
        
        // Update session user
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            const updatedSessionUser = {
                ...currentUser,
                name: updates.name || currentUser.name,
                email: updates.email || currentUser.email,
                phone: updates.phone || currentUser.phone,
                address: updates.address || currentUser.address
            };
            setCurrentUser(updatedSessionUser);
        }
        
        return { success: true };
    }
    
    return { success: false, message: 'Пользователь не найден' };
}

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
        switchToRegister.addEventListener('click', (e) => {
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
            
            // Re-attach event listener
            document.getElementById('switch-to-register').addEventListener('click', arguments.callee);
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
