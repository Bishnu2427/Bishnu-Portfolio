from datetime import datetime

try:
    from app.services.db import mongo
    DB_AVAILABLE = True
except Exception:
    DB_AVAILABLE = False


def save_message(session_id, user_msg, bot_reply):
    if not DB_AVAILABLE:
        return
    try:
        mongo.db.conversations.insert_one({
            "session_id": session_id,
            "user": user_msg,
            "bot": bot_reply,
            "ts": datetime.utcnow()
        })
    except Exception:
        pass


def get_session_history(session_id):
    if not DB_AVAILABLE:
        return []
    try:
        docs = mongo.db.conversations.find(
            {"session_id": session_id},
            {"_id": 0, "user": 1, "bot": 1, "ts": 1}
        ).sort("ts", 1).limit(50)
        return list(docs)
    except Exception:
        return []
