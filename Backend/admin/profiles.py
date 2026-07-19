from flask import Blueprint, jsonify, request
from config import Config
import mysql.connector

# Kita beri nama blueprint 'profiles' agar sinkron dengan nama filenya
profiles_bp = Blueprint('profiles', __name__)

@profiles_bp.route('/main-profile', methods=['GET'])
def get_utama_data():
    try:
        conn = mysql.connector.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME,
            ssl_verify_cert=False,
            ssl_ca=None
        )
        cursor = conn.cursor(dictionary=True)
        
        # 1. Ambil Data Profil Utama
        cursor.execute("SELECT * FROM profiles WHERE user_id = 1")
        profile = cursor.fetchone()
        
        if not profile:
            cursor.close()
            conn.close()
            return jsonify({"success": False, "message": "Data profil belum tersedia."}), 404
            
        # PENGAMAN & UPDATE TENTANG SAYA LANGSUNG DI FILE Python
        profile['deskripsi'] = (
            "Saya adalah mahasiswa S1 Sistem Informasi di Universitas Kristen Satya Wacana "
            "yang memiliki ketertarikan pada bidang pengembangan perangkat lunak, analisis sistem, "
            "basis data, serta desain antarmuka pengguna. Saya memiliki latar belakang pendidikan "
            "Teknik Jaringan Komputer dan Telekomunikasi (TJKT), yang memberikan saya pemahaman "
            "mengenai infrastruktur jaringan, troubleshooting, serta implementasi teknologi informasi."
        )
        profile['semester'] = '4'
        profile['alamat'] = 'Salatiga'
        profile['prodi'] = 'Sistem Informasi'

        # 2. Ambil Data Skills & Filter Duplikat
        cursor.execute("SELECT nama_skill, icon_class FROM skills WHERE user_id = 1")
        raw_skills = cursor.fetchall()
        skills = []
        seen_skills = set()
        for s in raw_skills:
            if s['nama_skill'] not in seen_skills:
                seen_skills.add(s['nama_skill'])
                skills.append(s)
        
        # 3. Ambil Data Experiences & Filter Duplikat
        cursor.execute("SELECT perusahaan, posisi, durasi, deskripsi FROM experiences WHERE user_id = 1")
        raw_experiences = cursor.fetchall()
        experiences = []
        seen_exps = set()
        for e in raw_experiences:
            if e['posisi'] not in seen_exps:
                seen_exps.add(e['posisi'])
                experiences.append(e)
        
        # 4. Ambil Data Projects & Filter Duplikat + SUNTIK LINK DEMO/GITHUB LU
        cursor.execute("SELECT judul, deskripsi, gambar_url, link_project FROM projects WHERE user_id = 1")
        raw_projects = cursor.fetchall()
        projects = []
        seen_projs = set()
        
        for p in raw_projects:
            if p['judul'] not in seen_projs:
                seen_projs.add(p['judul'])
                
                # MASUKKAN LINK PROYEK ASLI LU DI SINI BRO:
                if "Sistem Manajemen Inventaris" in p['judul']:
                    p['link_project'] = "https://github.com/farrelarya/sistem-inventaris"
                elif "REST API Mobile App" in p['judul']:
                    p['link_project'] = "https://github.com/farrelarya/rest-api-mobile"
                elif "Web Scraper Data Harga" in p['judul']:
                    p['link_project'] = "https://github.com/farrelarya/web-scraper"
                
                projects.append(p)
        
        cursor.close()
        conn.close()
        
        # 5. Satukan semuanya sesuai format request script.js
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
        print(f"[ERROR PROFILES] {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500