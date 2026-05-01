import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "bks-portfolio-dev-key-2025")
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/bishnu_portfolio")
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    VECTOR_STORE_PATH = os.path.join(BASE_DIR, "vector_store")
    DATA_PATH = os.path.join(BASE_DIR, "data", "bishnu_info.txt")
    EMBED_MODEL = "all-MiniLM-L6-v2"
    TOP_K_RESULTS = 4


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


config_map = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}


def get_config():
    env = os.getenv("FLASK_ENV", "development")
    return config_map.get(env, DevelopmentConfig)
