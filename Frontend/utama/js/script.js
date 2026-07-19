document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Load Data Utama
    await loadPublicData();

    // Handle Form Kontak
    setupContactForm();

    // Hamburger Menu
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    if(hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
});

async function loadPublicData() {
    try {
        // Menggunakan endpoint /api/main-profile
        const response = await fetch('/api/main-profile');
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        
        const res = await response.json();
        
        if (!res.success || !res.data) {
            showError('Data profil belum tersedia.');
            return;
        }

        const { skills, experiences, projects } = res.data;
        const profile = res.data;

        if (!profile.nama_lengkap) {
            showError('Nama profil kosong.');
            return;
        }

        renderHero(profile);
        renderAbout(profile);
        renderSkills(skills || []);
        renderExperiences(experiences || []);
        renderProjects(projects || []);
        renderContact(profile);

    } catch (error) {
        console.error('Fetch Error:', error);
        showError('Gagal terhubung ke server.');
    }
}

function showError(msg) {
    const heroContent = document.getElementById('hero-content');
    if (heroContent) {
        heroContent.innerHTML = `<div class="error-state"><i class="fas fa-exclamation-circle"></i> ${msg}</div>`;
    }
}

function renderHero(p) {
    const hero = document.getElementById('hero-content');
    if (!hero) return;

    hero.innerHTML = `
        <h4>Selamat Datang di Portofolio Saya</h4>
        <h1>Halo, Saya <span>${escapeHtml(p.nama_lengkap)}</span></h1>
        <p>${escapeHtml(p.prodi || 'Mahasiswa')} - ${escapeHtml(p.universitas || 'Universitas')}</p>
        <a href="#projects" class="btn">Lihat Proyek Saya</a>
    `;
}

function renderAbout(p) {
    const img = document.getElementById('profile-photo');
    const placeholder = document.getElementById('photo-placeholder');
    
    if (img && placeholder) {
        if (p.foto_url) {
            img.src = p.foto_url;
            img.style.display = 'block';
            placeholder.style.display = 'none';
        } else {
            img.style.display = 'none';
            placeholder.style.display = 'flex';
        }
    }

    const aboutText = document.getElementById('about-text');
    if (aboutText) {
        aboutText.innerHTML = `
            <h3>${escapeHtml(p.nama_lengkap)} - ${escapeHtml(p.prodi)}</h3>
            <p>Mahasiswa di ${escapeHtml(p.universitas)}, Fakultas ${escapeHtml(p.fakultas)}. 
               Saat ini berada di semester ${escapeHtml(p.semester)}.</p>
            <p>Berdomisili di ${escapeHtml(p.alamat)}. Memiliki ketertarikan besar dalam pengembangan backend, 
               manajemen database, dan arsitektur aplikasi web.</p>
            <a href="#contact" class="btn">Hubungi Saya</a>
        `;
    }
}

function renderSkills(skills) {
    const container = document.getElementById('skills-container');
    if (!container) return;

    if (!skills.length) {
        container.innerHTML = '<p class="empty-state">Belum ada data skill.</p>';
        return;
    }
    
    container.innerHTML = skills.map(s => `
        <div class="skill-card">
            <i class="${escapeHtml(s.icon_class || 'fas fa-code')}"></i>
            <h4>${escapeHtml(s.nama_skill)}</h4>
        </div>
    `).join('');
}

function renderExperiences(exps) {
    const container = document.getElementById('experience-container');
    if (!container) return;

    if (!exps.length) {
        container.innerHTML = '<p class="empty-state">Belum ada pengalaman.</p>';
        return;
    }

    container.innerHTML = exps.map(e => `
        <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <span class="timeline-date">${escapeHtml(e.durasi)}</span>
                <h3>${escapeHtml(e.posisi)}</h3>
                <h4>${escapeHtml(e.perusahaan)}</h4>
                <p>${escapeHtml(e.deskripsi)}</p>
            </div>
        </div>
    `).join('');
}

function renderProjects(projs) {
    const container = document.getElementById('projects-container');
    if (!container) return;

    if (!projs.length) {
        container.innerHTML = '<p class="empty-state">Belum ada proyek.</p>';
        return;
    }

    // PERBAIKAN STRUKTUR HTML AGAR COCOK DENGAN CSS OVERLAY
    container.innerHTML = projs.map(p => `
        <div class="project-card">
            <div class="project-img-wrapper">
                ${p.gambar_url 
                    ? `<img src="${escapeHtml(p.gambar_url)}" alt="${escapeHtml(p.judul)}" class="project-img" loading="lazy">` 
                    : '<div class="project-img" style="display:flex;align-items:center;justify-content:center;background:#eee;"><i class="fas fa-box-open"></i></div>'}
                
                <div class="project-overlay">
                    <h3 class="project-title-overlay">${escapeHtml(p.judul)}</h3>
                </div>
            </div>
            
            <div class="project-info">
                <p>${escapeHtml(p.deskripsi?.substring(0, 120))}${p.deskripsi?.length > 120 ? '...' : ''}</p>
                <div class="project-links">
                    ${p.link_project ? `<a href="${escapeHtml(p.link_project)}" target="_blank"><i class="fas fa-external-link-alt"></i> Demo</a>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function renderContact(p) {
    const emailDisplay = document.getElementById('contact-email-display');
    if (emailDisplay && p.email) {
        emailDisplay.innerHTML = `Tertarik berkolaborasi? Kirim pesan ke <strong>${escapeHtml(p.email)}</strong>`;
    }
}

function setupContactForm() {
    // Fungsi Kirim Pesan Form ke WhatsApp
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Mencegah halaman reload saat disubmit

        // 1. Ambil data inputan user dari form
        const nama = document.getElementById('contactName').value;
        const email = document.getElementById('contactEmail').value;
        const pesan = document.getElementById('contactMessage').value;

        // 2. Masukkan nomor WhatsApp lu di sini (Ganti XXXXXX dengan nomor WA asli lu, awali dengan 62)
        // Contoh: const nomorWA = "6281234567890";
        const nomorWA = "6289515398259"; 

        // 3. Rangkai template chat otomatisnya
        const teksFormat = `Halo Farrel, saya *${nama}* (${email}).\n\n*Pesan:*\n${pesan}`;

        // 4. Encode text agar aman dibaca url browser
        const urlWhatsApp = `https://wa.me/${nomorWA}?text=${encodeURIComponent(teksFormat)}`;

        // 5. Buka tab baru mengarah langsung ke chat WhatsApp
        window.open(urlWhatsApp, '_blank');
    });
}
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}