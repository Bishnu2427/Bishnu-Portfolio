from flask import Flask
from config import get_config
from app.services.rag import RAGService

rag_service = None


def create_app():
    global rag_service

    app = Flask(__name__, template_folder="../templates", static_folder="../static")
    cfg = get_config()
    app.config.from_object(cfg)

    rag_service = RAGService(cfg)

    from app.routes.main import main_bp
    from app.routes.chat import chat_bp
    from app.routes.contact import contact_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(chat_bp, url_prefix="/api")
    app.register_blueprint(contact_bp, url_prefix="/api")

    return app
