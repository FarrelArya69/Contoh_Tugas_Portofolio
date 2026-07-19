document.addEventListener('DOMContentLoaded', async () => {
    // 1. Tampilkan Nama Admin
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        const welcomeEl = document.getElementById('welcomeAdmin');
        if (welcomeEl) {
            welcomeEl.textContent = user.username;
        }
    }

    // 2. Load Data Dashboard
    await loadDashboardData();
});

async function loadDashboardData() {
    showGlobalLoader();
    try {
        // Fetch stats
        const statsRes = await api.get('/dashboard/stats');
        if (statsRes.success) {
            document.getElementById('skillsCount').textContent = statsRes.data.skills_count;
            document.getElementById('projectsCount').textContent = statsRes.data.projects_count;
            document.getElementById('experiencesCount').textContent = statsRes.data.experiences_count;
        }

        // Fetch recent activity
        const recentRes = await api.get('/dashboard/recent');
        if (recentRes.success) {
            renderRecentActivity(recentRes.data);
        }

    } catch (error) {
        console.error('Failed to load dashboard data:', error);
        showAlert('Gagal memuat data statistik dashboard.', 'danger');
    } finally {
        hideGlobalLoader();
    }
}

function renderRecentActivity(activities) {
    const container = document.getElementById('recentActivities');
    if (!container) return;

    if (!activities || activities.length === 0) {
        container.innerHTML = '<p class="empty-state">Belum ada aktivitas terbaru.</p>';
        return;
    }

    container.innerHTML = activities.map(act => {
        const formattedDate = formatDate(act.created_at);
        const iconType = act.type === 'experience' ? 'type-experience' : 'type-project';
        const actionText = act.type === 'experience' 
            ? `Menambahkan pengalaman sebagai <strong>${escapeHtml(act.posisi)}</strong> di <strong>${escapeHtml(act.perusahaan)}</strong>`
            : `Membuat proyek baru dengan judul <strong>${escapeHtml(act.judul)}</strong>`;

        return `
            <div class="timeline-event ${iconType}">
                <div class="event-time">${formattedDate}</div>
                <div class="event-title">${act.type === 'experience' ? 'Pengalaman Baru' : 'Proyek Baru'}</div>
                <div class="event-desc">${actionText}</div>
            </div>
        `;
    }).join('');
}

// Helpers
function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        // Parse date string (handling python format 'Sun, 19 Jul 2026 15:33:00 GMT' or ISO string)
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateStr;
    }
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}
