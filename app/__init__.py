from flask import Flask
from config import get_config


def create_app():
    app = Flask(__name__, template_folder="../templates", static_folder="../static")
    app.config.from_object(get_config())

    from app.routes.main import main_bp
    from app.routes.contact import contact_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(contact_bp, url_prefix="/api")

    return app
