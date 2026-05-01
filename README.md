# Bishnu Kumar Singh — Portfolio

Personal portfolio site for **Bishnu Kumar Singh**, AI-ML Engineer.  
Built with Flask, MongoDB, and a RAG-powered chatbot called **Bishnu's Buddy**.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | HTML, CSS (Space Grotesk font), Vanilla JS |
| Backend | Python, Flask |
| Database | MongoDB (chat history) |
| Chatbot | RAG · FAISS (local vector store) · sentence-transformers · Groq API |

---

## Project Structure

```
portfolio/
├── app/
│   ├── __init__.py          # Flask app factory
│   ├── routes/
│   │   ├── main.py          # serves index.html
│   │   └── chat.py          # /api/chat endpoint
│   ├── services/
│   │   ├── rag.py           # RAG pipeline (FAISS + embeddings + Groq)
│   │   └── db.py            # MongoDB init
│   └── models/
│       └── conversation.py  # chat history model
├── static/
│   ├── css/
│   │   ├── style.css
│   │   └── chatbot.css
│   ├── js/
│   │   ├── main.js          # neural canvas, typed text, scroll fx
│   │   └── chatbot.js       # chatbot UI logic
│   └── images/
│       └── bishnu.jpeg
├── templates/
│   └── index.html
├── data/
│   └── bishnu_info.txt      # RAG knowledge base
├── vector_store/            # auto-generated on first run (FAISS index)
├── config.py
├── run.py
├── requirements.txt
└── .env.example
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
```bash
cp .env.example .env
# edit .env — add GROQ_API_KEY for full chatbot responses (free at console.groq.com)
```

**5. Make sure MongoDB is running**
```bash
# default: mongodb://localhost:27017
# or update MONGO_URI in .env
```

**6. Run**
```bash
python run.py
```

Open `http://localhost:5000` in your browser.

---

## Chatbot — Bishnu's Buddy

On first run the RAG service builds a FAISS vector index from `data/bishnu_info.txt` and caches it under `vector_store/`. Subsequent starts load the cached index (fast).

- **Without GROQ_API_KEY** — returns the most relevant text chunk from the knowledge base.
- **With GROQ_API_KEY** — uses `llama-3.1-8b-instant` via Groq to generate natural, conversational answers grounded in the retrieved context.

Get a free Groq API key at [console.groq.com](https://console.groq.com).

---

## Features

- Neural network canvas animation in hero section
- Typing effect for role titles
- Scroll-triggered reveal animations
- Animated stat counters
- Glassmorphism skill cards with hot-tag highlights
- Vertical experience timeline
- Project cards with hover effects
- Certifications & awards section
- Contact form
- Responsive design (mobile-first)
- Floating chatbot (Bishnu's Buddy) with RAG + FAISS + Groq
- MongoDB-backed chat session history
