-- Active: 1784455453256@@gateway01.ap-southeast-1.prod.aws.tidbcloud.com@4000@test
-- =========================================================================
-- 1. STRUKTUR TABEL (Sesuai ERD Asdos & Kompatibel dengan TiDB/MySQL)
-- =========================================================================

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    nama_lengkap VARCHAR(100) NOT NULL,
    nama_panggilan VARCHAR(50),
    tempat_lahir VARCHAR(50),
    tanggal_lahir DATE,
    email VARCHAR(100),
    telepon VARCHAR(20),
    universitas VARCHAR(100),
    fakultas VARCHAR(100),
    prodi VARCHAR(100),
    semester VARCHAR(20),
    alamat TEXT,
    foto_url VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    nama_skill VARCHAR(50) NOT NULL,
    icon_class VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS experiences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    posisi VARCHAR(100) NOT NULL,
    perusahaan VARCHAR(100) NOT NULL,
    durasi VARCHAR(50),
    deskripsi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    judul VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    gambar_url VARCHAR(255),
    link_project VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================================================
-- 2. INITIAL DATA SEEDING (Akun Admin & Konten Awal Farrel Arya Putra)
-- =========================================================================

-- PENTING: Insert Akun Admin Utama (Password plain 'admin123' diakomodasi oleh login.py)
INSERT INTO users (id, username, password_hash, role) 
VALUES (1, 'admin', 'admin123', 'admin')
ON DUPLICATE KEY UPDATE username=username;

-- Insert Data Profil Farrel
INSERT INTO profiles (user_id, nama_lengkap, nama_panggilan, tempat_lahir, tanggal_lahir, email, telepon, universitas, fakultas, prodi, semester, alamat, foto_url)
VALUES (
    1, 
    'Farrel Arya Putra', 
    'Farrel', 
    'Salatiga', 
    '2006-01-01', -- Tanggal dummy, bisa lu sesuaikan nanti
    'farrel.arya@student.uksw.edu', 
    '081234567890', 
    'Universitas Kristen Satya Wacana', 
    'Fakultas Teknologi Informasi', 
    'S1 Sistem Informasi', 
    'Semester 4', -- Estimasi dari angkatan 2024 ke 2026
    'Salatiga, Jawa Tengah, Indonesia', 
    'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg' -- Placeholder awal sebelum upload gambar lu sendiri
) ON DUPLICATE KEY UPDATE user_id=user_id;

-- Insert Data Skills Farrel
INSERT INTO skills (user_id, nama_skill, icon_class) VALUES 
(1, 'System Analysis & Design (UML, ERD, Flowchart)', 'fa-solid fa-diagram-project'),
(1, 'Software Requirement Specification (SRS)', 'fa-solid fa-file-code'),
(1, 'Network Installation & Configuration (LAN/WAN)', 'fa-solid fa-network-wired'),
(1, 'Network Troubleshooting & Mikrotik Configuration', 'fa-solid fa-server');

-- Insert Data Pengalaman Kerja Farrel
INSERT INTO experiences (user_id, posisi, perusahaan, durasi, deskripsi) VALUES 
(
    1, 
    'Teknisi Jaringan', 
    'PT Core Connecting People', 
    '2024', 
    'Bertanggung jawab dalam instalasi, konfigurasi, pemeliharaan, dan troubleshooting jaringan internet untuk pelanggan. Memasang perangkat router, access point, media transmisi, crimping kabel UTP, fiber optic basic, serta memastikan koneksi internet berjalan stabil.'
),
(
    1, 
    'Mahasiswa S1 Sistem Informasi', 
    'Universitas Kristen Satya Wacana (UKSW)', 
    '2024 – Sekarang', 
    'Mempelajari pengembangan perangkat lunak, analisis perancangan sistem, basis data, jaringan komputer, serta keamanan informasi. Aktif mengerjakan proyek akademik menggunakan Java, MySQL, dan Oracle Database.'
);

-- Insert Data Proyek Farrel
INSERT INTO projects (user_id, judul, deskripsi, gambar_url, link_project) VALUES 
(
    1, 
    'Sistem LMS & Admisi - T English Club (TEC)', 
    'Merancang dan mengembangkan sistem Learning Management System (LMS) dan Sistem Admisi berbasis web dengan PHP, MySQL, HTML, CSS, JavaScript, dan Bootstrap. Mengelola data siswa, jadwal kelas, pembayaran, dan dashboard administrator.',
    'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    'https://github.com/farrelarya/tec-lms'
),
(
    1, 
    'Aplikasi Point of Sale (POS)', 
    'Mengembangkan aplikasi desktop kasir menggunakan Java dan MySQL dengan menerapkan konsep Object-Oriented Programming (OOP) mencakup manajemen stok, transaksi penjualan, dan laporan keuangan.',
    'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    'https://github.com/farrelarya/pos-java'
),
(
    1, 
    'Analis & Perancang Proses Bisnis - TIKI Salatiga', 
    'Melakukan analisis alur bisnis berjalan (As-Is) dan merancang rekomendasi sistem baru (To-Be). Dokumentasi disusun lengkap menggunakan BPMN, flowchart, dan diagram UML.',
    'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    '#'
);

DELETE FROM profiles WHERE user_id = 1;

INSERT INTO profiles (user_id, nama_lengkap, nama_panggilan, universitas, fakultas, prodi, email) 
VALUES (
    1, 
    'Farrel Arya Putra', 
    'Farrel', 
    'Universitas Kristen Satya Wacana', 
    'FTI', 
    'Teknik Informatika', 
    '682024069@student.uksw.edu'
);

-- 1. Kosongkan tabel relasi dulu biar bersih total
DELETE FROM skills WHERE user_id = 1;
DELETE FROM experiences WHERE user_id = 1;

-- 2. Masukkan ulang Data Skills (Cukup 4 item, tidak dobel)
INSERT INTO skills (user_id, nama_skill, icon_class) VALUES 
(1, 'System Analysis & Design (UML, ERD, Flowchart)', 'fas fa-project-diagram'),
(1, 'Software Requirement Specification (SRS)', 'fas fa-file-code'),
(1, 'Network Installation & Configuration (LAN/WAN)', 'fas fa-network-wired'),
(1, 'Network Troubleshooting & Mikrotik Configuration', 'fas fa-server');

-- 3. Masukkan ulang Data Pengalaman (Cukup 2 item, tidak dobel)
INSERT INTO experiences (user_id, perusahaan, posisi, durasi, deskripsi) VALUES 
(1, 'PT Core Connecting People', 'Teknisi Jaringan', '2024', 'Bertanggung jawab dalam instalasi, konfigurasi, pemeliharaan, dan troubleshooting jaringan internet untuk pelanggan. Memasang perangkat router, access point, media transmisi, crimping kabel UTP, fiber optic basic, serta memastikan koneksi internet berjalan stabil.'),
(1, 'Universitas Kristen Satya Wacana (UKSW)', 'Mahasiswa S1 Sistem Informasi', '2024 – Sekarang', 'Mempelajari pengembangan perangkat lunak, analisis perancangan sistem, basis data, jaringan komputer, serta keamanan informasi. Aktif mengerjakan proyek akademik menggunakan Java, MySQL, dan Oracle Database.');

-- 4. Update data profil utama biar sinkron (Mengisi semester & alamat yang kosong)
UPDATE profiles 
SET prodi = 'Sistem Informasi', 
    semester = '4', 
    alamat = 'Salatiga' 
WHERE user_id = 1;