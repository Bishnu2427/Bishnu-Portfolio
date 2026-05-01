from flask_pymongo import PyMongo

mongo = PyMongo()


def init_db(app):
    try:
        mongo.init_app(app)
    except Exception as e:
        app.logger.warning(f"MongoDB init failed: {e}. Chat history won't persist.")
