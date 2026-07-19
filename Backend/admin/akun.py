from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from model import Database
from Backend.admin.login import token_required

akun_bp = Blueprint('akun', __name__)

@akun_bp.route('/akun', methods=['GET'])
@token_required
def get_akun(current_user):
    """Mengambil informasi akun admin saat ini"""
    try:
        db = Database()
        query = "SELECT id, username, role, created_at FROM users WHERE id = %s"
        result = db.execute_query(query, (current_user,), fetch=True)
        
        if not result:
            return jsonify({'error': 'Akun tidak ditemukan'}), 404
            
        return jsonify({
            'success': True,
            'data': result[0]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@akun_bp.route('/akun/change-password', methods=['POST'])
@token_required
def change_password(current_user):
    """Mengubah kata sandi akun admin"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body harus berupa JSON'}), 400
            
        old_password = data.get('old_password')
        new_password = data.get('new_password')
        
        if not old_password or not new_password:
            return jsonify({'error': 'Kata sandi lama dan baru wajib diisi'}), 400
            
        if len(new_password) < 6:
            return jsonify({'error': 'Kata sandi baru minimal 6 karakter'}), 400
            
        db = Database()
        
        # Ambil password_hash saat ini
        query = "SELECT password_hash FROM users WHERE id = %s"
        user = db.execute_query(query, (current_user,), fetch=True)
        
        if not user:
            return jsonify({'error': 'User tidak ditemukan'}), 404
            
        user = user[0]
        
        # Verifikasi password lama (dengan fallback perbandingan plain-text aman)
        is_valid = False
        try:
            is_valid = check_password_hash(user['password_hash'], old_password)
        except Exception:
            is_valid = (user['password_hash'] == old_password)
            
        if not is_valid:
            return jsonify({'error': 'Kata sandi lama salah'}), 401
            
        # Hash password baru dan simpan
        new_hash = generate_password_hash(new_password)
        update_query = "UPDATE users SET password_hash = %s WHERE id = %s"
        db.execute_query(update_query, (new_hash, current_user))
        
        return jsonify({
            'success': True,
            'message': 'Kata sandi berhasil diperbarui'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
