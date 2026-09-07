import sys
from pathlib import Path


backend_directory = Path(__file__).resolve().parent.parent / 'backend'
sys.path.insert(0, str(backend_directory))

from app import app
from models import db
from app import ensure_project_columns


with app.app_context():
	db.create_all()
	ensure_project_columns()
