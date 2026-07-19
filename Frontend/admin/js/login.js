document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');
    const loginBtn = document.getElementById('loginBtn');

    // Cek jika sudah login, langsung alihkan ke dashboard
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = 'dashboard.html';
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        // Reset state
        errorMessage.style.display = 'none';
        errorMessage.innerHTML = '';
        loginBtn.disabled = true;
        const origBtnHtml = loginBtn.innerHTML;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memvalidasi...';

        try {
            const data = await api.post('/login', { username, password });
            
            // Login sukses
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirect
            window.location.href = 'dashboard.html';
        } catch (error) {
            errorMessage.style.display = 'flex';
            errorMessage.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${error.message}`;
            loginBtn.disabled = false;
            loginBtn.innerHTML = origBtnHtml;
        }
    });
});
