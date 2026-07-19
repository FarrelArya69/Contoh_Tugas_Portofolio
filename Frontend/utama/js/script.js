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

    // Setup Project Modal Close Events
    setupProjectModalEvents();
});

// Variable global untuk menyimpan list proyek agar bisa diakses modal detail
let loadedProjectsList = [];

async function loadPublicData() {
    try {
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

        // Simpan data proyek secara global
        loadedProjectsList = projects || [];

        renderHero(profile);
        renderAbout(profile);
        renderSkills(skills || []);
        renderExperiences(experiences || []);
        renderProjects(loadedProjectsList);
        renderContact(profile);

    } catch (error) {
        console.error('Fetch Error:', error);
        showError('Gagal terhubung ke server database.');
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

    // Render proyek dengan link deteksi index klik untuk membuka modal detail
    container.innerHTML = projs.map((p, idx) => `
        <div class="project-card" onclick="openProjectDetail(${idx})">
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
                    <button class="btn-detail-trigger" style="background:none; border:none; color:var(--primary); font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:4px; padding:0;">
                        <i class="fas fa-info-circle"></i> Detail Selengkapnya
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Buka modal detail proyek
function openProjectDetail(idx) {
    const proj = loadedProjectsList[idx];
    if (!proj) return;

    const modal = document.getElementById('projectDetailModal');
    const modalImg = document.getElementById('modalProjectImg');
    const modalTitle = document.getElementById('modalProjectTitle');
    const modalDesc = document.getElementById('modalProjectDesc');
    const modalLink = document.getElementById('modalProjectLink');

    if (modal) {
        modalTitle.textContent = proj.judul;
        modalDesc.textContent = proj.deskripsi;
        
        if (proj.gambar_url) {
            modalImg.src = proj.gambar_url;
            modalImg.parentElement.style.display = 'block';
        } else {
            modalImg.parentElement.style.display = 'none';
        }

        if (proj.link_project && proj.link_project !== '#') {
            modalLink.href = proj.link_project;
            modalLink.style.display = 'inline-block';
        } else {
            modalLink.style.display = 'none';
        }

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Lock scroll
    }
}

function setupProjectModalEvents() {
    const modal = document.getElementById('projectDetailModal');
    const closeBtn = document.getElementById('closeProjectModal');

    if (modal && closeBtn) {
        const closeModal = () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Unlock scroll
        };

        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

function renderContact(p) {
    const emailDisplay = document.getElementById('contact-email-display');
    if (emailDisplay && p.email) {
        emailDisplay.innerHTML = `Tertarik berkolaborasi? Kirim pesan ke <strong>${escapeHtml(p.email)}</strong>`;
    }
}

function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    const sendBtn = document.getElementById('sendBtn');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // 1. Ambil data inputan user dari form
            const nama = document.getElementById('contactName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const pesan = document.getElementById('contactMessage').value.trim();

            if (!nama || !email || !pesan) return;

            // Loading state
            sendBtn.disabled = true;
            const origText = sendBtn.textContent;
            sendBtn.textContent = 'Mengirim Pesan...';

            // 2. Hubungkan ke Resend API Backend
            try {
                const response = await fetch('/api/utama/kontak', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nama, email, pesan })
                });

                if (response.ok) {
                    alert('Pesan berhasil dikirim via Resend Email ke Farrel!');
                    contactForm.reset();
                } else {
                    const errData = await response.json();
                    throw new Error(errData.error || 'Gagal mengirim email');
                }
            } catch (err) {
                console.error(err);
                alert(`Gagal mengirim via Resend Email: ${err.message}. Mencoba mengalihkan ke WhatsApp...`);
            } finally {
                sendBtn.disabled = false;
                sendBtn.textContent = origText;
            }

            // 3. Cadangan: Buka link chat WhatsApp agar fleksibel
            const nomorWA = "6289515398259"; 
            const teksFormat = `Halo Farrel, saya *${nama}* (${email}).\n\n*Pesan:*\n${pesan}`;
            const urlWhatsApp = `https://wa.me/${nomorWA}?text=${encodeURIComponent(teksFormat)}`;
            window.open(urlWhatsApp, '_blank');
        });
    }
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}