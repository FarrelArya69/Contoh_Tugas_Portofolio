document.addEventListener('DOMContentLoaded', async () => {
    // Load projects list
    await loadProjects();

    // Modal Control Elements
    const projectModal = document.getElementById('projectModal');
    const openAddModalBtn = document.getElementById('openAddModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    
    // Form Elements
    const projectForm = document.getElementById('projectForm');
    const projectIdInput = document.getElementById('project_id');
    const modalTitle = document.getElementById('modalTitle');
    const uploadTrigger = document.getElementById('uploadTrigger');
    const fileInput = document.getElementById('projectImage');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const gambarUrlInput = document.getElementById('gambar_url');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const removeImgBtn = document.getElementById('removeImgBtn');

    // Open Modal for Adding Project
    if (openAddModalBtn) {
        openAddModalBtn.addEventListener('click', () => {
            projectForm.reset();
            projectIdInput.value = '';
            modalTitle.textContent = 'Tambah Proyek Baru';
            fileNameDisplay.textContent = 'Tidak ada berkas dipilih';
            gambarUrlInput.value = '';
            imagePreviewContainer.style.display = 'none';
            imagePreview.src = '';
            
            projectModal.style.display = 'flex';
        });
    }

    // Close Modal Event Helpers
    const hideModal = () => {
        projectModal.style.display = 'none';
    };

    if (closeModalBtn) closeModalBtn.addEventListener('click', hideModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', hideModal);

    // Trigger File Input Click
    if (uploadTrigger && fileInput) {
        uploadTrigger.addEventListener('click', () => {
            fileInput.click();
        });
    }

    // Handle File Selection & Immediate Cloudinary Upload
    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            fileNameDisplay.textContent = file.name;

            // Prepare form data
            const formData = new FormData();
            formData.append('file', file);

            // Show loading indicators
            showGlobalLoader();
            uploadTrigger.disabled = true;
            uploadTrigger.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengunggah...';

            try {
                // Endpoint handles cloudinary uploading on Flask backend
                const res = await api.post('/upload/image', formData);
                if (res.success) {
                    gambarUrlInput.value = res.url;
                    imagePreview.src = res.url;
                    imagePreviewContainer.style.display = 'block';
                    showAlert('Gambar berhasil diunggah ke Cloudinary.', 'success');
                }
            } catch (error) {
                console.error(error);
                showAlert(error.message || 'Gagal mengunggah gambar.', 'danger');
                fileNameDisplay.textContent = 'Upload gagal, coba lagi';
            } finally {
                hideGlobalLoader();
                uploadTrigger.disabled = false;
                uploadTrigger.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Pilih Gambar';
            }
        });
    }

    // Handle Image Removal
    if (removeImgBtn) {
        removeImgBtn.addEventListener('click', () => {
            fileInput.value = '';
            fileNameDisplay.textContent = 'Tidak ada berkas dipilih';
            gambarUrlInput.value = '';
            imagePreviewContainer.style.display = 'none';
            imagePreview.src = '';
        });
    }

    // Handle Form Submit (Add or Edit)
    if (projectForm) {
        projectForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const id = projectIdInput.value;
            const judul = document.getElementById('judul').value.trim();
            const deskripsi = document.getElementById('deskripsi').value.trim();
            const link_project = document.getElementById('link_project').value.trim();
            const gambar_url = gambarUrlInput.value;

            const saveBtn = document.getElementById('saveProjectBtn');
            saveBtn.disabled = true;
            const origHtml = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

            const payload = { judul, deskripsi, link_project, gambar_url };

            try {
                let res;
                if (id) {
                    res = await api.put(`/projects/${id}`, payload);
                } else {
                    res = await api.post('/projects', payload);
                }

                if (res.success) {
                    showAlert(id ? 'Proyek berhasil diperbarui!' : 'Proyek baru berhasil disimpan!', 'success');
                    hideModal();
                    await loadProjects();
                }
            } catch (error) {
                console.error(error);
                showAlert(error.message || 'Gagal menyimpan proyek.', 'danger');
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = origHtml;
            }
        });
    }
});

// Load and Render Projects List
async function loadProjects() {
    const listContainer = document.getElementById('projectsList');
    if (!listContainer) return;

    try {
        const res = await api.get('/projects');
        
        if (!res.success || !res.data || res.data.length === 0) {
            listContainer.innerHTML = '<p class="empty-state">Belum ada proyek yang terdaftar.</p>';
            return;
        }

        listContainer.innerHTML = res.data.map(proj => {
            const hasImg = proj.gambar_url ? true : false;
            
            return `
                <div class="project-card" id="project-card-${proj.id}">
                    <div class="project-thumbnail">
                        ${hasImg 
                            ? `<img src="${escapeHtml(proj.gambar_url)}" alt="${escapeHtml(proj.judul)}" loading="lazy">` 
                            : '<div class="no-img"><i class="fas fa-folder-open"></i></div>'}
                    </div>
                    <div class="project-details">
                        <h4>${escapeHtml(proj.judul)}</h4>
                        <p>${escapeHtml(proj.deskripsi)}</p>
                        ${proj.link_project 
                            ? `<a href="${escapeHtml(proj.link_project)}" target="_blank" class="project-link-badge"><i class="fas fa-external-link-alt"></i> Demo/Link</a>`
                            : ''}
                        
                        <div class="project-actions-footer">
                            <button class="btn-icon edit" onclick="editProject(${proj.id})">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn-icon delete" onclick="deleteProject(${proj.id})">
                                <i class="fas fa-trash-alt"></i> Hapus
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error(error);
        listContainer.innerHTML = '<p class="empty-state text-danger">Gagal memuat data proyek.</p>';
    }
}

// Edit project function (called from global scope button)
async function editProject(id) {
    showGlobalLoader();
    try {
        const res = await api.get(`/projects/${id}`);
        if (res.success && res.data) {
            const proj = res.data;
            
            document.getElementById('project_id').value = proj.id;
            document.getElementById('judul').value = proj.judul;
            document.getElementById('deskripsi').value = proj.deskripsi || '';
            document.getElementById('link_project').value = proj.link_project || '';
            document.getElementById('gambar_url').value = proj.gambar_url || '';
            
            document.getElementById('modalTitle').textContent = 'Edit Proyek';
            
            if (proj.gambar_url) {
                document.getElementById('imagePreview').src = proj.gambar_url;
                document.getElementById('imagePreviewContainer').style.display = 'block';
                document.getElementById('fileNameDisplay').textContent = 'Gambar saat ini terunggah';
            } else {
                document.getElementById('imagePreviewContainer').style.display = 'none';
                document.getElementById('fileNameDisplay').textContent = 'Tidak ada berkas dipilih';
            }
            
            document.getElementById('projectModal').style.display = 'flex';
        }
    } catch (error) {
        console.error(error);
        showAlert(error.message || 'Gagal memuat detail proyek.', 'danger');
    } finally {
        hideGlobalLoader();
    }
}

// Delete project function (called from global scope button)
async function deleteProject(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus proyek ini?')) return;

    showGlobalLoader();
    try {
        const res = await api.delete(`/projects/${id}`);
        if (res.success) {
            showAlert('Proyek berhasil dihapus.', 'success');
            
            // Remove card from UI
            const card = document.getElementById(`project-card-${id}`);
            if (card) card.remove();

            // Check if grid is empty
            const listContainer = document.getElementById('projectsList');
            if (listContainer && listContainer.querySelectorAll('.project-card').length === 0) {
                listContainer.innerHTML = '<p class="empty-state">Belum ada proyek yang terdaftar.</p>';
            }
        }
    } catch (error) {
        console.error(error);
        showAlert(error.message || 'Gagal menghapus proyek.', 'danger');
    } finally {
        hideGlobalLoader();
    }
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}
