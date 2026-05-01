import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Blueprint, request, jsonify, current_app

contact_bp = Blueprint("contact", __name__)


@contact_bp.route("/contact", methods=["POST"])
def contact():
    data = request.get_json() or {}

    name    = data.get("name", "").strip()
    email   = data.get("email", "").strip()
    subject = data.get("subject", "Portfolio Inquiry").strip()
    message = data.get("message", "").strip()

    if not name or not email or not message:
        return jsonify({"error": "Name, email and message are required."}), 400

    try:
        _send_mail(name, email, subject, message)
        return jsonify({"ok": True, "msg": "Message sent!"})
    except ValueError as e:
        current_app.logger.warning(f"Mail not configured: {e}")
        return jsonify({"ok": True, "msg": "Message received! (mail not configured yet)"})
    except Exception as e:
        current_app.logger.error(f"Mail error: {e}")
        return jsonify({"error": "Could not deliver the message. Please email directly."}), 500


def _send_mail(sender_name, sender_email, subject, body):
    cfg = current_app.config

    smtp_server = cfg.get("SMTP_SERVER", "smtp.gmail.com")
    smtp_port   = int(cfg.get("SMTP_PORT", 587))
    smtp_user   = cfg.get("SMTP_USERNAME", "")
    smtp_pass   = cfg.get("SMTP_PASSWORD", "")
    recipient   = cfg.get("MAIL_TO", "singhvishnukumar22@gmail.com")

    if not smtp_user or not smtp_pass:
        raise ValueError("SMTP_USERNAME / SMTP_PASSWORD not set in .env")

    msg = MIMEMultipart("alternative")
    msg["Subject"]  = f"[Portfolio] {subject}"
    msg["From"]     = f"Portfolio Contact <{smtp_user}>"
    msg["To"]       = recipient
    msg["Reply-To"] = f"{sender_name} <{sender_email}>"

    plain = (
        f"From: {sender_name} ({sender_email})\n"
        f"Subject: {subject}\n\n"
        f"{body}"
    )

    html = f"""<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:20px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;">
    <div style="background:linear-gradient(130deg,#3b72ff,#2dd4bf);padding:20px 24px;">
      <h2 style="color:#fff;margin:0;font-size:18px;">New message via your portfolio</h2>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 6px;font-size:13px;color:#888;">FROM</p>
      <p style="margin:0 0 18px;font-size:15px;color:#111;font-weight:600;">
        {sender_name} &mdash; <a href="mailto:{sender_email}" style="color:#3b72ff;">{sender_email}</a>
      </p>
      <p style="margin:0 0 6px;font-size:13px;color:#888;">SUBJECT</p>
      <p style="margin:0 0 18px;font-size:15px;color:#111;">{subject}</p>
      <p style="margin:0 0 6px;font-size:13px;color:#888;">MESSAGE</p>
      <p style="margin:0;font-size:15px;color:#333;line-height:1.7;white-space:pre-wrap;">{body}</p>
    </div>
    <div style="padding:14px 24px;background:#f9f9f9;border-top:1px solid #eee;">
      <p style="margin:0;font-size:12px;color:#aaa;">Sent via bishnukumarsingh portfolio contact form</p>
    </div>
  </div>
</body>
</html>"""

    msg.attach(MIMEText(plain, "plain"))
    msg.attach(MIMEText(html, "html"))

    # port 587 → STARTTLS  |  port 465 → SSL
    if smtp_port == 465:
        with smtplib.SMTP_SSL(smtp_server, smtp_port) as server:
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, recipient, msg.as_string())
    else:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.ehlo()
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, recipient, msg.as_string())
