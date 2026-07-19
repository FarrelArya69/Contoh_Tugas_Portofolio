// Global API helper for communication with Backend
const API_BASE_URL = '/api';

/**
 * Custom fetch wrapper to handle authorization and responses
 * @param {string} endpoint - API route (e.g. '/login', '/skills')
 * @param {object} options - Fetch options (method, headers, body, etc.)
 */
async function apiFetch(endpoint, options = {}) {
    // Set headers
    options.headers = options.headers || {};
    
    // Add Content-Type if not uploading form-data
    if (!(options.body instanceof FormData) && !options.headers['Content-Type']) {
        options.headers['Content-Type'] = 'application/json';
    }

    // Add Authorization header if token exists in localStorage
    const token = localStorage.getItem('token');
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        // Handle unauthorized access (token expired or invalid)
        if (response.status === 401) {
            const currentPath = window.location.pathname;
            // Only redirect to login if we are trying to access admin dashboard pages
            if (currentPath.includes('/admin/') && !currentPath.includes('login.html')) {
                localStorage.clear();
                window.location.href = '/Frontend/admin/login.html';
                return;
            }
        }

        // Membaca respon sebagai teks terlebih dahulu untuk menghindari JSON parse error
        const text = await response.text();
        let data = {};
        
        try {
            if (text) {
                data = JSON.parse(text);
            }
        } catch (e) {
            console.error('Gagal melakukan parse JSON:', text);
            throw new Error(`Error Server (${response.status}): Format respon server tidak valid.`);
        }

        if (!response.ok) {
            throw new Error(data.error || `Terjadi kesalahan pada server (Status: ${response.status})`);
        }
        return data;
    } catch (error) {
        console.error('API Fetch Error:', error);
        throw error;
    }
}

// Helpers for HTTP Methods
const api = {
    get: (endpoint) => apiFetch(endpoint, { method: 'GET' }),
    post: (endpoint, body) => apiFetch(endpoint, {
        method: 'POST',
        body: body instanceof FormData ? body : JSON.stringify(body)
    }),
    put: (endpoint, body) => apiFetch(endpoint, {
        method: 'PUT',
        body: body instanceof FormData ? body : JSON.stringify(body)
    }),
    delete: (endpoint) => apiFetch(endpoint, { method: 'DELETE' })
};
