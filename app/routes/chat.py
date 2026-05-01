import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from app import rag_service
from app.models.conversation import save_message, get_session_history

chat_bp = Blueprint("chat", __name__)


@chat_bp.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    if not data or not data.get("message", "").strip():
        return jsonify({"error": "Message is required"}), 400

    user_msg = data["message"].strip()
    session_id = data.get("session_id") or str(uuid.uuid4())

    try:
        answer = rag_service.answer(user_msg)
    except Exception as e:
        current_app.logger.error(f"RAG error: {e}")
        answer = "Something went sideways on my end. Try asking again!"

    try:
        save_message(session_id, user_msg, answer)
    except Exception:
        pass

    return jsonify({
        "response": answer,
        "session_id": session_id,
        "timestamp": datetime.utcnow().isoformat()
    })


@chat_bp.route("/chat/history/<session_id>", methods=["GET"])
def history(session_id):
    msgs = get_session_history(session_id)
    return jsonify({"messages": msgs, "session_id": session_id})
