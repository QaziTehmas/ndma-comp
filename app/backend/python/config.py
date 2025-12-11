import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class Config:
    DEBUG = True
    PORT = 8000
    HOST = '0.0.0.0'
    # Default to model/xgboost_flood_model.pkl next to this module, overridable via env var
    MODEL_PATH = os.getenv('MODEL_PATH', os.path.join(BASE_DIR, 'model', 'xgboost_flood_model.pkl'))
    
    # Node.js Backend URL for database storage
    NODEJS_BACKEND_URL = os.getenv('NODEJS_BACKEND_URL', 'http://localhost:3001')
    
    # Enable/disable database storage (default: true)
    ENABLE_DATABASE_STORAGE = os.getenv('ENABLE_DATABASE_STORAGE', 'true').lower() == 'true'