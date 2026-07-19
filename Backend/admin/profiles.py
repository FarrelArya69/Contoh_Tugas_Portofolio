from flask import Blueprint, jsonify, request
from model import Database
from Backend.admin.login import token_required

# Blueprint untuk manajemen profil admin
profiles_bp = Blueprint('profiles', __name__)

@profiles_bp.route('/profil', methods=['GET'])
def get_profile():
    """Mengambil data profil (publik)"""
    try:
        db = Database()
        query = "SELECT * FROM profiles WHERE user_id = 1"
        result = db.execute_query(query, fetch=True)
        if not result:
            return jsonify({"success": False, "message": "Data profil belum tersedia."}), 404
        return jsonify({"success": True, "data": result[0]}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@profiles_bp.route('/profil', methods=['PUT'])
@token_required
def update_profile(current_user):
    """Memperbarui atau membuat data profil admin (butuh auth)"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Body request harus berupa JSON'}), 400
            
        db = Database()
        
        # Cek apakah profil sudah terdaftar untuk user_id ini
        check_query = "SELECT id FROM profiles WHERE user_id = %s"
        existing = db.execute_query(check_query, (current_user,), fetch=True)
        
        allowed_fields = [
            'nama_lengkap', 'nama_panggilan', 'tempat_lahir', 'tanggal_lahir', 
            'email', 'telepon', 'universitas', 'fakultas', 'prodi', 'semester', 
            'alamat', 'foto_url'
        ]
        
        if existing:
            # Update data profil yang sudah ada
            updates = []
            values = []
            for field in allowed_fields:
                if field in data:
                    updates.append(f"{field} = %s")
                    values.append(data[field])
            
            if not updates:
                return jsonify({'error': 'Tidak ada data yang diperbarui'}), 400
                
            values.append(current_user)
            query = f"UPDATE profiles SET {', '.join(updates)} WHERE user_id = %s"
            db.execute_query(query, tuple(values))
            message = "Profil berhasil diperbarui"
        else:
            # Tambah data profil baru jika belum ada
            fields = ['user_id']
            placeholders = ['%s']
            values = [current_user]
            for field in allowed_fields:
                if field in data:
                    fields.append(field)
                    placeholders.append('%s')
                    values.append(data[field])
            
            query = f"INSERT INTO profiles ({', '.join(fields)}) VALUES ({', '.join(placeholders)})"
            db.execute_query(query, tuple(values))
            message = "Profil berhasil dibuat"
            
        return jsonify({
            'success': True,
            'message': message
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500