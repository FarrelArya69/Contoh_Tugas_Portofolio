from flask import Blueprint, jsonify, request
from model import Database
from config import Config
import resend
import logging

# Inisialisasi Blueprint utama
utama_bp = Blueprint('utama', __name__)
logger = logging.getLogger(__name__)

# Konfigurasi Resend API Key secara aman dari config.py
resend.api_key = Config.RESEND_API_KEY

@utama_bp.route('/main-profile', methods=['GET'])
def get_utama_data():
    try:
        import mysql.connector
        
        conn = mysql.connector.connect(**Config.MYSQL_CONFIG)
        cursor = conn.cursor(dictionary=True)
        
        # 1. Ambil Data Profil Utama
        cursor.execute("SELECT * FROM profiles WHERE user_id = 1")
        profile = cursor.fetchone()
        
        if not profile:
            cursor.close()
            conn.close()
            return jsonify({"success": False, "message": "Data profil belum tersedia."}), 404
            
        # PENGAMAN TENTANG SAYA: Jika di DB kosong, kita paksa isi di sini 
        if not profile.get('semester'):
            profile['semester'] = '4'
        if not profile.get('alamat'):
            profile['alamat'] = 'Salatiga'
        if not profile.get('prodi') or profile['prodi'] == 'Teknik Informatika':
            profile['prodi'] = 'Sistem Information'

        # 2. Ambil Data Skills & Hapus Duplikat lewat Python
        cursor.execute("SELECT nama_skill, icon_class FROM skills WHERE user_id = 1")
        raw_skills = cursor.fetchall()
        skills = []
        seen_skills = set()
        for s in raw_skills:
            if s['nama_skill'] not in seen_skills:
                seen_skills.add(s['nama_skill'])
                skills.append(s)
        
        # 3. Ambil Data Experiences & Hapus Duplikat lewat Python
        cursor.execute("SELECT perusahaan, posisi, durasi, deskripsi FROM experiences WHERE user_id = 1")
        raw_experiences = cursor.fetchall()
        experiences = []
        seen_exps = set()
        for e in raw_experiences:
            if e['posisi'] not in seen_exps:
                seen_exps.add(e['posisi'])
                experiences.append(e)
        
        # 4. Ambil Data Projects & Hapus Duplikat lewat Python
        # 4. Ambil Data Projects & Hapus Duplikat lewat Python + Pasang Link
        cursor.execute("SELECT judul, deskripsi, gambar_url, link_project FROM projects WHERE user_id = 1")
        raw_projects = cursor.fetchall()
        projects = []
        seen_projs = set()
        
        for p in raw_projects:
            if p['judul'] not in seen_projs:
                seen_projs.add(p['judul'])
                
                if "Proses Bisnis TIKI Salatiga" in p['judul']:
                    p['link_project'] = "https://github.com/farrelarya/sistem-inventaris" # <-- Ganti link lu di sini
                elif "REST API Mobile App" in p['judul']:
                    p['link_project'] = "https://github.com/farrelarya/rest-api-mobile"   # <-- Ganti link lu di sini (bisa link Docs)
                elif "Web Scraper Data Harga" in p['judul']:
                    p['link_project'] = "https://github.com/farrelarya/web-scraper"       # <-- Ganti link lu di sini
                
                projects.append(p)
        
        cursor.close()
        conn.close()
        
        # 5. Satukan semuanya ke format Frontend
        response_data = {}
        response_data.update(profile)
        response_data.update({
            "skills": skills,
            "experiences": experiences,
            "projects": projects
        })
        
        return jsonify({
            "success": True,
            "data": response_data
        }), 200

    except Exception as e:
        print(f"[ERROR UTAMA] {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


@utama_bp.route('/utama/kontak', methods=['POST'])
def send_contact_email():
    """Endpoint form kontak halaman utama untuk mengirim email via Resend API"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Body request harus berupa JSON'}), 400
            
        nama_pengirim = data.get('nama', '').strip()
        email_pengirim = data.get('email', '').strip()
        pesan = data.get('pesan', '').strip()
        
        # Validasi input sederhana
        if not nama_pengirim or not email_pengirim or not pesan:
            return jsonify({'error': 'Semua field (Nama, Email, Pesan) wajib diisi!'}), 400
            
        # Susun format HTML isi email yang akan dikirim ke email lu
        html_content = f"""
        <h3>Pesan Baru dari Website Portofolio</h3>
        <p><strong>Nama Pengirim:</strong> {nama_pengirim}</p>
        <p><strong>Email Pengirim:</strong> {email_pengirim}</p>
        <p><strong>Isi Pesan:</strong></p>
        <p style="background-color: #f4f4f4; padding: 10px; border-radius: 5px;">{pesan}</p>
        """
        
        # Eksekusi pengiriman email menggunakan Resend SDK sesuai konfigurasi .env
        r = resend.Emails.send({
            "from": "onboarding@resend.dev",             # Default pengirim gratisan dari Resend
            "to": Config.RESEND_TO_EMAIL,                # Email penerima dari konfigurasi
            "subject": f"Portofolio Contact: {nama_pengirim}",
            "html": html_content
        })
        
        logger.info(f"[RESEND SUCCESS] Email berhasil dikirim ke student UKSW. ID: {r.get('id')}")
        return jsonify({'message': 'Pesan Anda berhasil dikirim!'}), 200
        
    except Exception as e:
        logger.error(f"[RESEND ERROR] Gagal mengirim email: {str(e)}")
        return jsonify({'error': 'Terjadi kesalahan, gagal mengirim pesan'}), 500