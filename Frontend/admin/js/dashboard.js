document.addEventListener("DOMContentLoaded", function () {
    // 1. CEK OTENTIKASI & PROTEKSI TOKEN
    const token = localStorage.getItem("admin_token");
    
    // Jika token kosong atau tidak valid, kembalikan ke login.html
    if (!token) {
        window.location.href = "/Frontend/admin/login.html";
        return;
    }

    // Set nama profil admin dari session browser jika tersedia
    const currentAdmin = localStorage.getItem("admin_name");
    if (currentAdmin) {
        document.getElementById("adminName").textContent = currentAdmin;
    }

    // Header Authorization Bearer Token untuk akses secure Blueprint endpoint
    const secureHeaders = {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
    };

    // 2. AMBIL STATISTIK SECARA DINAMIS DARI BACKEND
    // Hitung total data Skill
    fetch('/api/skills', { headers: secureHeaders })
        .then(res => res.ok ? res.json() : [])
        .then(data => {
            const list = Array.isArray(data) ? data : (data.skills || []);
            document.getElementById("countSkills").textContent = list.length;
        })
        .catch(() => document.getElementById("countSkills").textContent = "0");

    // Hitung total data Pengalaman
    fetch('/api/experience', { headers: secureHeaders })
        .then(res => res.ok ? res.json() : [])
        .then(data => {
            const list = Array.isArray(data) ? data : (data.experiences || []);
            document.getElementById("countExperience").textContent = list.length;
        })
        .catch(() => document.getElementById("countExperience").textContent = "0");

    // Hitung total data Proyek
    fetch('/api/projects', { headers: secureHeaders })
        .then(res => res.ok ? res.json() : [])
        .then(data => {
            const list = Array.isArray(data) ? data : (data.projects || []);
            document.getElementById("countProjects").textContent = list.length;
        })
        .catch(() => document.getElementById("countProjects").textContent = "0");

    // 3. EVENT HANDLER LOGOUT KELUAR SISTEM
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            // Hapus semua data otentikasi dari penyimpanan lokal browser
            localStorage.removeItem("admin_token");
            localStorage.removeItem("admin_name");
            
            // Redirect langsung ke halaman login bawaan asdos
            window.location.href = "/Frontend/admin/login.html";
        });
    }
});