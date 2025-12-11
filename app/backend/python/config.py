import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class Config:
    DEBUG = True
    PORT = 8000
    HOST = '0.0.0.0'
    # Default to model/xgboost_flood_model.pkl next to this module, overridable via env var
    MODEL_PATH = os.getenv('MODEL_PATH', os.path.join(BASE_DIR, 'model', 'xgboost_flood_model.pkl'))
