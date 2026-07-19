document.addEventListener('DOMContentLoaded', async () => {
    // Load skills list
    await loadSkills();

    // Handle Form Submit
    const skillForm = document.getElementById('skillForm');
    if (skillForm) {
        skillForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nama_skill = document.getElementById('nama_skill').value.trim();
            const icon_class = document.getElementById('icon_class').value;

            const saveBtn = document.getElementById('saveSkillBtn');
            saveBtn.disabled = true;
            const origHtml = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

            try {
                const res = await api.post('/skills', { nama_skill, icon_class });
                if (res.success) {
                    showAlert('Keahlian berhasil disimpan!', 'success');
                    skillForm.reset();
                    await loadSkills();
                }
            } catch (error) {
                console.error(error);
                showAlert(error.message || 'Gagal menyimpan keahlian.', 'danger');
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = origHtml;
            }
        });
    }
});

async function loadSkills() {
    const listContainer = document.getElementById('skillsList');
    if (!listContainer) return;

    try {
        const res = await api.get('/skills');
        
        if (!res.success || !res.data || res.data.length === 0) {
            listContainer.innerHTML = '<tr><td colspan="3" class="empty-state">Belum ada keahlian yang terdaftar.</td></tr>';
            return;
        }

        listContainer.innerHTML = res.data.map(skill => `
            <tr id="skill-row-${skill.id}">
                <td><i class="${escapeHtml(skill.icon_class || 'fas fa-code')}"></i></td>
                <td><strong>${escapeHtml(skill.nama_skill)}</strong></td>
                <td style="text-align: center;">
                    <button class="btn-delete" onclick="deleteSkill(${skill.id})" title="Hapus Keahlian">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error(error);
        listContainer.innerHTML = '<tr><td colspan="3" class="empty-state text-danger">Gagal memuat data keahlian.</td></tr>';
    }
}

async function deleteSkill(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus keahlian ini?')) return;

    showGlobalLoader();
    try {
        const res = await api.delete(`/skills/${id}`);
        if (res.success) {
            showAlert('Keahlian berhasil dihapus.', 'success');
            // Remove row from UI
            const row = document.getElementById(`skill-row-${id}`);
            if (row) row.remove();
            
            // Check if table is empty now
            const listContainer = document.getElementById('skillsList');
            if (listContainer && listContainer.children.length === 0) {
                listContainer.innerHTML = '<tr><td colspan="3" class="empty-state">Belum ada keahlian yang terdaftar.</td></tr>';
            }
        }
    } catch (error) {
        console.error(error);
        showAlert(error.message || 'Gagal menghapus keahlian.', 'danger');
    } finally {
        hideGlobalLoader();
    }
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}
