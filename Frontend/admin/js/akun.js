document.addEventListener('DOMContentLoaded', async () => {
    // Load existing profile data
    await loadProfileData();

    const profileForm = document.getElementById('profileForm');
    const passwordForm = document.getElementById('passwordForm');

    // Photo Upload Elements
    const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
    const profilePhotoInput = document.getElementById('profilePhotoInput');
    const profilePhotoPreview = document.getElementById('profilePhotoPreview');
    const avatarPlaceholder = document.getElementById('avatarPlaceholder');
    const fotoUrlInput = document.getElementById('foto_url');

    // Trigger file input
    if (uploadPhotoBtn && profilePhotoInput) {
        uploadPhotoBtn.addEventListener('click', () => {
            profilePhotoInput.click();
        });
    }

    // Handle profile photo selection & upload
    if (profilePhotoInput) {
        profilePhotoInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Prepare form data
            const formData = new FormData();
            formData.append('file', file);

            showGlobalLoader();
            uploadPhotoBtn.disabled = true;
            uploadPhotoBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> uploading...';

            try {
                const res = await api.post('/upload/image', formData);
                if (res.success) {
                    fotoUrlInput.value = res.url;
                    profilePhotoPreview.src = res.url;
                    profilePhotoPreview.style.display = 'block';
                    if (avatarPlaceholder) avatarPlaceholder.style.display = 'none';
                    showAlert('Foto profil berhasil diperbarui ke Cloudinary.', 'success');
                }
            } catch (error) {
                console.error(error);
                showAlert(error.message || 'Gagal mengunggah foto profil.', 'danger');
            } finally {
                hideGlobalLoader();
                uploadPhotoBtn.disabled = false;
                uploadPhotoBtn.innerHTML = '<i class="fas fa-camera"></i> Unggah Foto';
            }
        });
    }

    // Profile Form Submit
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const saveBtn = document.getElementById('saveProfileBtn');
            saveBtn.disabled = true;
            const origHtml = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

            const payload = {
                nama_lengkap: document.getElementById('nama_lengkap').value.trim(),
                nama_panggilan: document.getElementById('nama_panggilan').value.trim(),
                tempat_lahir: document.getElementById('tempat_lahir').value.trim(),
                tanggal_lahir: document.getElementById('tanggal_lahir').value,
                email: document.getElementById('email').value.trim(),
                telepon: document.getElementById('telepon').value.trim(),
                universitas: document.getElementById('universitas').value.trim(),
                fakultas: document.getElementById('fakultas').value.trim(),
                prodi: document.getElementById('prodi').value.trim(),
                semester: document.getElementById('semester').value.trim(),
                alamat: document.getElementById('alamat').value.trim(),
                foto_url: fotoUrlInput.value
            };

            try {
                const res = await api.put('/profil', payload);
                if (res.success) {
                    showAlert('Profil berhasil disimpan dan diperbarui!', 'success');
                    await loadProfileData();
                }
            } catch (error) {
                console.error(error);
                showAlert(error.message || 'Gagal menyimpan profil.', 'danger');
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = origHtml;
            }
        });
    }

    // Password Form Submit
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const old_password = document.getElementById('old_password').value;
            const new_password = document.getElementById('new_password').value;
            const confirm_password = document.getElementById('confirm_password').value;

            if (new_password !== confirm_password) {
                showAlert('Konfirmasi kata sandi baru tidak cocok.', 'danger');
                return;
            }

            if (new_password.length < 6) {
                showAlert('Kata sandi baru minimal 6 karakter.', 'danger');
                return;
            }

            const changeBtn = document.getElementById('changePasswordBtn');
            changeBtn.disabled = true;
            const origHtml = changeBtn.innerHTML;
            changeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';

            try {
                const res = await api.post('/akun/change-password', { old_password, new_password });
                if (res.success) {
                    showAlert('Kata sandi Anda berhasil diperbarui!', 'success');
                    passwordForm.reset();
                }
            } catch (error) {
                console.error(error);
                showAlert(error.message || 'Gagal mengganti kata sandi. Pastikan sandi lama benar.', 'danger');
            } finally {
                changeBtn.disabled = false;
                changeBtn.innerHTML = origHtml;
            }
        });
    }
});

async function loadProfileData() {
    showGlobalLoader();
    try {
        const res = await api.get('/profil');
        
        if (res.success && res.data) {
            const p = res.data;
            
            document.getElementById('nama_lengkap').value = p.nama_lengkap || '';
            document.getElementById('nama_panggilan').value = p.nama_panggilan || '';
            document.getElementById('tempat_lahir').value = p.tempat_lahir || '';
            
            // Format date YYYY-MM-DD
            if (p.tanggal_lahir) {
                const dateVal = new Date(p.tanggal_lahir);
                if (!isNaN(dateVal.getTime())) {
                    const formattedDate = dateVal.toISOString().split('T')[0];
                    document.getElementById('tanggal_lahir').value = formattedDate;
                }
            }
            
            document.getElementById('email').value = p.email || '';
            document.getElementById('telepon').value = p.telepon || '';
            document.getElementById('universitas').value = p.universitas || '';
            document.getElementById('fakultas').value = p.fakultas || '';
            document.getElementById('prodi').value = p.prodi || '';
            document.getElementById('semester').value = p.semester || '';
            document.getElementById('alamat').value = p.alamat || '';
            
            // Photo URL
            const fotoUrlInput = document.getElementById('foto_url');
            const profilePhotoPreview = document.getElementById('profilePhotoPreview');
            const avatarPlaceholder = document.getElementById('avatarPlaceholder');
            
            if (p.foto_url) {
                fotoUrlInput.value = p.foto_url;
                profilePhotoPreview.src = p.foto_url;
                profilePhotoPreview.style.display = 'block';
                if (avatarPlaceholder) avatarPlaceholder.style.display = 'none';
            } else {
                fotoUrlInput.value = '';
                profilePhotoPreview.style.display = 'none';
                if (avatarPlaceholder) avatarPlaceholder.style.display = 'flex';
            }
        }
    } catch (error) {
        console.error('No profile exists or failed to fetch:', error);
        // It's normal to get 404 if profile database is empty, so we don't display danger alert
    } finally {
        hideGlobalLoader();
    }
}
