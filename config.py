import os
from dotenv import load_dotenv

load_dotenv(override=True)

class Config:
    # TiDB Cloud Database Configuration
    DB_HOST = os.getenv('DB_HOST', 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com')
    DB_PORT = int(os.getenv('DB_PORT', 4000))
    DB_USER = os.getenv('DB_USER', '2gi9aLVn8E3YWe3.root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'MMaGmIMjVg3D1es5')
    DB_NAME = os.getenv('DB_NAME', 'Portofolio')
    DB_CA_PATH = os.getenv('DB_CA_PATH', '')
    
    MYSQL_CONFIG = {
        'host': DB_HOST,
        'port': DB_PORT,
        'user': DB_USER,
        'password': DB_PASSWORD,
        'database': DB_NAME,
        'ssl_verify_cert': True if DB_CA_PATH else False,
        'ssl_ca': DB_CA_PATH if DB_CA_PATH else None
    }
    
    # Flask Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    # Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME', 'carasoi4')
    CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY', '126645766294982')
    CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET', 'TD78yqwgnjdsobGgKGV-pT9Fsdg')
    
    # Resend API Configuration
    RESEND_API_KEY = os.getenv('RESEND_API_KEY', 're_8U2pKjT5_BeY3DK9JWtFZiSHw3QwsjqjL')
    RESEND_TO_EMAIL = os.getenv('RESEND_TO_EMAIL', '682024069@student.uksw.edu')