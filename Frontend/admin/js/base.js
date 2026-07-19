document.addEventListener('DOMContentLoaded', () => {
    // 1. Cek Autentikasi
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
        localStorage.clear();
        window.location.href = 'login.html';
        return;
    }

    const user = JSON.parse(userStr);

    // 2. Inject Sidebar & Header
    injectLayout(user);

    // 3. Highlight Menu Aktif
    highlightActiveMenu();

    // 4. Setup Event Listeners
    setupLayoutEvents();
});

function injectLayout(user) {
    // Inject Sidebar
    const sidebarHtml = `
        <aside class="sidebar" id="adminSidebar">
            <div class="logo-section">
                Farrel.<span class="badge">Admin</span>
            </div>
            <nav class="menu">
                <a href="dashboard.html" data-page="dashboard"><i class="fas fa-chart-line"></i> Dashboard</a>
                <a href="skills.html" data-page="skills"><i class="fas fa-laptop-code"></i> Keahlian</a>
                <a href="projects.html" data-page="projects"><i class="fas fa-folder-open"></i> Proyek</a>
                <a href="experience.html" data-page="experience"><i class="fas fa-briefcase"></i> Pengalaman</a>
                <a href="akun.html" data-page="akun"><i class="fas fa-user-cog"></i> Profil & Akun</a>
            </nav>
            <div class="logout-section">
                <button class="logout-btn" id="logoutBtn">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        </aside>
    `;
    
    // Inject Header di awal element <main>
    const userInitial = user.username ? user.username.charAt(0).toUpperCase() : 'A';
    const headerHtml = `
        <header class="admin-header">
            <div class="header-left">
                <button class="toggle-sidebar" id="toggleSidebar" style="display: none; background: none; border: none; font-size: 1.25rem; cursor: pointer; margin-right: 15px;">
                    <i class="fas fa-bars"></i>
                </button>
                <h1 id="pageTitle">Admin Dashboard</h1>
            </div>
            <div class="user-profile-header">
                <div class="avatar">${userInitial}</div>
                <div class="info">
                    <div class="name">${user.username}</div>
                    <div class="role">${user.role === 'admin' ? 'Administrator' : 'User'}</div>
                </div>
            </div>
        </header>
    `;

    document.body.insertAdjacentHTML('afterbegin', sidebarHtml);
    
    const mainContent = document.querySelector('main.admin-content');
    if (mainContent) {
        mainContent.insertAdjacentHTML('afterbegin', headerHtml);
    }
}

function highlightActiveMenu() {
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('aside.sidebar nav.menu a');
    
    let currentPage = 'dashboard';
    if (currentPath.includes('skills.html')) currentPage = 'skills';
    else if (currentPath.includes('projects.html')) currentPage = 'projects';
    else if (currentPath.includes('experience.html')) currentPage = 'experience';
    else if (currentPath.includes('akun.html')) currentPage = 'akun';

    links.forEach(link => {
        if (link.dataset.page === currentPage) {
            link.classList.add('active');
            
            // Update page title in header
            const pageTitleEl = document.getElementById('pageTitle');
            if (pageTitleEl) {
                pageTitleEl.textContent = link.textContent.trim();
            }
        } else {
            link.classList.remove('active');
        }
    });
}

function setupLayoutEvents() {
    // Hamburger Sidebar Toggle untuk Mobile
    const toggleSidebar = document.getElementById('toggleSidebar');
    const adminSidebar = document.getElementById('adminSidebar');
    
    if (toggleSidebar && adminSidebar) {
        // Show toggle button in mobile CSS breakpoint
        if (window.innerWidth <= 992) {
            toggleSidebar.style.display = 'block';
        }
        
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 992) {
                toggleSidebar.style.display = 'block';
            } else {
                toggleSidebar.style.display = 'none';
                adminSidebar.classList.remove('active');
            }
        });

        toggleSidebar.addEventListener('click', (e) => {
            e.stopPropagation();
            adminSidebar.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (adminSidebar.classList.contains('active') && !adminSidebar.contains(e.target) && e.target !== toggleSidebar) {
                adminSidebar.classList.remove('active');
            }
        });
    }

    // Logout Handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (confirm('Apakah Anda yakin ingin logout?')) {
                showGlobalLoader();
                try {
                    await api.post('/logout');
                } catch (error) {
                    console.error('Logout error on server:', error);
                } finally {
                    localStorage.clear();
                    window.location.href = 'login.html';
                }
            }
        });
    }
}

// Helpers for Alerts
function showAlert(message, type = 'success', containerId = 'alertContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const alertHtml = `
        <div class="alert alert-${type}">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    container.innerHTML = alertHtml;
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}

// Global Loader Helpers
function showGlobalLoader() {
    if (document.getElementById('globalLoader')) return;
    const loaderHtml = `
        <div class="loader-overlay" id="globalLoader">
            <i class="fas fa-circle-notch fa-spin"></i>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', loaderHtml);
}

function hideGlobalLoader() {
    const loader = document.getElementById('globalLoader');
    if (loader) loader.remove();
}
