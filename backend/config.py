import os
import tempfile
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
default_database_url = f"sqlite:///{os.path.join(tempfile.gettempdir(), 'productivity-app.db')}" if os.getenv('VERCEL') else 'sqlite:///instance/app.db'
raw_database_url = os.getenv('DATABASE_URL', default_database_url)

if raw_database_url.startswith('sqlite:///'):
    relative_path = raw_database_url.replace('sqlite:///', '', 1)
    if relative_path and not os.path.isabs(relative_path):
        raw_database_url = 'sqlite:///' + os.path.join(BASE_DIR, relative_path)

SQLALCHEMY_DATABASE_URI = raw_database_url
SQLALCHEMY_TRACK_MODIFICATIONS = False
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', SECRET_KEY)
