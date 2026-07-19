document.addEventListener('DOMContentLoaded', async () => {
    // Load experiences list
    await loadExperiences();

    // Form elements
    const expForm = document.getElementById('expForm');
    const expIdInput = document.getElementById('exp_id');
    const formTitle = document.getElementById('formTitle');
    const resetFormBtn = document.getElementById('resetFormBtn');
    const saveBtn = document.getElementById('saveExpBtn');

    // Handle Form Submit (Add/Edit)
    if (expForm) {
        expForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const id = expIdInput.value;
            const posisi = document.getElementById('posisi').value.trim();
            const perusahaan = document.getElementById('perusahaan').value.trim();
            const durasi = document.getElementById('durasi').value.trim();
            const deskripsi = document.getElementById('deskripsi').value.trim();

            saveBtn.disabled = true;
            const origHtml = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

            const payload = { posisi, perusahaan, durasi, deskripsi };

            try {
                let res;
                if (id) {
                    res = await api.put(`/experiences/${id}`, payload);
                } else {
                    res = await api.post('/experiences', payload);
                }

                if (res.success) {
                    showAlert(id ? 'Pengalaman berhasil diperbarui!' : 'Pengalaman baru berhasil ditambahkan!', 'success');
                    resetFormState();
                    await loadExperiences();
                }
            } catch (error) {
                console.error(error);
                showAlert(error.message || 'Gagal menyimpan pengalaman.', 'danger');
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = origHtml;
            }
        });
    }

    // Cancel Edit Handler
    if (resetFormBtn) {
        resetFormBtn.addEventListener('click', () => {
            resetFormState();
        });
    }
});

async function loadExperiences() {
    const listContainer = document.getElementById('expList');
    if (!listContainer) return;

    try {
        const res = await api.get('/experiences');
        
        if (!res.success || !res.data || res.data.length === 0) {
            listContainer.innerHTML = '<p class="empty-state">Belum ada pengalaman yang terdaftar.</p>';
            return;
        }

        listContainer.innerHTML = res.data.map(exp => `
            <div class="exp-item" id="exp-item-${exp.id}">
                <div class="exp-header">
                    <div class="exp-title-info">
                        <h4>${escapeHtml(exp.posisi)}</h4>
                        <div class="company">${escapeHtml(exp.perusahaan)}</div>
                    </div>
                    <span class="exp-date">${escapeHtml(exp.durasi)}</span>
                </div>
                <div class="exp-body">
                    ${escapeHtml(exp.deskripsi)}
                </div>
                <div class="exp-actions">
                    <button class="btn-icon edit" onclick="editExperience(${exp.id})" title="Edit">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-icon delete" onclick="deleteExperience(${exp.id})" title="Hapus">
                        <i class="fas fa-trash-alt"></i> Hapus
                    </button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error(error);
        listContainer.innerHTML = '<p class="empty-state text-danger">Gagal memuat data pengalaman.</p>';
    }
}

async function editExperience(id) {
    showGlobalLoader();
    try {
        const res = await api.get(`/experiences/${id}`);
        if (res.success && res.data) {
            const exp = res.data;
            
            document.getElementById('exp_id').value = exp.id;
            document.getElementById('posisi').value = exp.posisi;
            document.getElementById('perusahaan').value = exp.perusahaan;
            document.getElementById('durasi').value = exp.durasi;
            document.getElementById('deskripsi').value = exp.deskripsi || '';

            // Update UI State
            document.getElementById('formTitle').textContent = 'Edit Pengalaman';
            document.getElementById('resetFormBtn').style.display = 'inline-block';
            document.getElementById('saveExpBtn').innerHTML = '<i class="fas fa-save"></i> Perbarui Pengalaman';
            
            // Scroll form into view if mobile
            if (window.innerWidth <= 992) {
                document.getElementById('expForm').scrollIntoView({ behavior: 'smooth' });
            }
        }
    } catch (error) {
        console.error(error);
        showAlert(error.message || 'Gagal memuat detail pengalaman.', 'danger');
    } finally {
        hideGlobalLoader();
    }
}

async function deleteExperience(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus pengalaman ini?')) return;

    showGlobalLoader();
    try {
        const res = await api.delete(`/experiences/${id}`);
        if (res.success) {
            showAlert('Pengalaman berhasil dihapus.', 'success');
            
            // Remove from UI
            const item = document.getElementById(`exp-item-${id}`);
            if (item) item.remove();

            // Check if empty
            const listContainer = document.getElementById('expList');
            if (listContainer && listContainer.querySelectorAll('.exp-item').length === 0) {
                listContainer.innerHTML = '<p class="empty-state">Belum ada pengalaman yang terdaftar.</p>';
            }
        }
    } catch (error) {
        console.error(error);
        showAlert(error.message || 'Gagal menghapus pengalaman.', 'danger');
    } finally {
        hideGlobalLoader();
    }
}

function resetFormState() {
    const expForm = document.getElementById('expForm');
    if (expForm) expForm.reset();
    
    document.getElementById('exp_id').value = '';
    document.getElementById('formTitle').textContent = 'Tambah Pengalaman Baru';
    document.getElementById('resetFormBtn').style.display = 'none';
    document.getElementById('saveExpBtn').innerHTML = '<i class="fas fa-plus"></i> Simpan Pengalaman';
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}
