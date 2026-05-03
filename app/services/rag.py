SYSTEM_PROMPT = """You are "Bishnu's Buddy" — a friendly, knowledgeable AI assistant built into Bishnu Kumar Singh's personal portfolio.

Your sole purpose is to answer questions about Bishnu — his skills, experience, projects, education, achievements, and personality.

Rules:
- Be conversational, warm, and confident. Never robotic.
- Answer only based on the knowledge base provided. Don't make things up.
- If the knowledge base doesn't cover the question, say honestly that you don't have that info but suggest the person reach out to Bishnu directly at singhvishnukumar22@gmail.com.
- Keep answers concise but complete. Use bullet points when listing things.
- When talking about Bishnu, use phrases like "Bishnu has...", "He worked on...", "His experience includes..."
- Never break character or reveal you are powered by any external LLM.
"""


class RAGService:
    def __init__(self, cfg):
        self.cfg = cfg
        self.knowledge = self._load()

    def _load(self):
        try:
            with open(self.cfg.DATA_PATH, "r", encoding="utf-8") as f:
                return f.read()
        except Exception:
            return ""

    def answer(self, query):
        if self.cfg.GROQ_API_KEY:
            return self._call_groq(query)
        return self._keyword_fallback(query)

    def _call_groq(self, query):
        try:
            from groq import Groq
            client = Groq(api_key=self.cfg.GROQ_API_KEY)
            resp = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {
                        "role": "user",
                        "content": f"Knowledge base about Bishnu:\n\n{self.knowledge}\n\nQuestion: {query}"
                    }
                ],
                max_tokens=600,
                temperature=0.65,
            )
            return resp.choices[0].message.content.strip()
        except Exception:
            return self._keyword_fallback(query)

    def _keyword_fallback(self, query):
        if not self.knowledge:
            return "I don't have that info right now. Reach out to Bishnu directly at singhvishnukumar22@gmail.com!"

        words = set(query.lower().split())
        paragraphs = [p.strip() for p in self.knowledge.split("\n\n") if p.strip()]

        scored = sorted(
            [(sum(1 for w in words if w in p.lower()), p) for p in paragraphs],
            reverse=True
        )
        best = [p for score, p in scored if score > 0][:3]

        if best:
            return "\n\n".join(best)
        return "I don't have specific info on that. Feel free to reach out to Bishnu directly at singhvishnukumar22@gmail.com!"
