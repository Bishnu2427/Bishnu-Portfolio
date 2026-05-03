import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "bks-portfolio-dev-key-2025")
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    DATA_PATH = os.path.join(BASE_DIR, "data", "bishnu_info.txt")

    SMTP_SERVER   = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT     = int(os.getenv("SMTP_PORT", 587))
    SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
    MAIL_TO       = os.getenv("MAIL_TO", "singhvishnukumar22@gmail.com")


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
