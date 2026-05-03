# Bishnu Kumar Singh — Portfolio

Personal portfolio site for **Bishnu Kumar Singh**, AI-ML Engineer.  
Built with Flask and a context-aware chatbot called **Bishnu's Buddy**.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | HTML, CSS (Space Grotesk font), Vanilla JS |
| Backend | Python, Flask |
| Chatbot | Full-context RAG · Groq API (`llama-3.1-8b-instant`) |

---

## Project Structure

```
portfolio/
├── app/
│   ├── __init__.py          # Flask app factory
│   ├── routes/
│   │   ├── main.py          # serves index.html
│   │   ├── chat.py          # /api/chat endpoint
│   │   └── contact.py       # /api/contact endpoint
│   └── services/
│       └── rag.py           # loads knowledge base, calls Groq
├── static/
│   ├── css/
│   │   ├── style.css
│   │   └── chatbot.css
│   ├── js/
│   │   ├── main.js          # neural canvas, typed text, scroll fx
│   │   └── chatbot.js       # chatbot UI logic
│   ├── files/
│   │   └── Bishnu_Kumar_Singh_CV.pdf
│   └── images/
│       └── bishnu.jpeg
├── templates/
│   └── index.html
├── data/
│   └── bishnu_info.txt      # chatbot knowledge base
├── config.py
├── run.py
├── requirements.txt
└── .env
```

---

## Setup

**1. Clone / navigate to folder**
```bash
cd portfolio
```

**2. Create and activate virtual environment**
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

**3. Install dependencies**
```bash
pip install -r requirements.txt
```

**4. Configure environment**

Copy `.env` and fill in your values:

```env
FLASK_ENV=development
SECRET_KEY=your-secret-key

GROQ_API_KEY=           # free at console.groq.com

SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your@gmail.com
SMTP_PASSWORD=your-app-password
MAIL_TO=your@gmail.com
```

**5. Run**
```bash
python run.py
```

Open `http://localhost:5000` in your browser.

---

## Chatbot — Bishnu's Buddy

The chatbot loads `data/bishnu_info.txt` (the full knowledge base) once at startup and passes it as context on every request to Groq.

- **Without GROQ_API_KEY** — keyword-based fallback from the knowledge base.
- **With GROQ_API_KEY** — natural conversational answers via `llama-3.1-8b-instant`.

Get a free Groq API key at [console.groq.com](https://console.groq.com).

---

## Features

- Neural network canvas animation in hero section
- Typing effect for role titles
- Scroll-triggered reveal animations
- Animated stat counters
- Glassmorphism skill cards
- Vertical experience timeline
- Project cards with hover effects
- Resume section with CV download
- Certifications & awards section
- Contact form (SMTP email delivery)
- Responsive design (mobile-first)
- Floating chatbot (Bishnu's Buddy)
