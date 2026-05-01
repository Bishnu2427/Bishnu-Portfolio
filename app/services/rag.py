import os
import re
import json
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer


SYSTEM_PROMPT = """You are "Bishnu's Buddy" — a friendly, knowledgeable AI assistant built into Bishnu Kumar Singh's personal portfolio.

Your sole purpose is to answer questions about Bishnu — his skills, experience, projects, education, achievements, and personality.

Rules:
- Be conversational, warm, and confident. Never robotic.
- Answer only based on the context provided. Don't make things up.
- If the context doesn't cover the question, say honestly that you don't have that info but suggest the person reach out to Bishnu directly.
- Keep answers concise but complete. Use bullet points when listing things.
- When talking about Bishnu, you can say things like "Bishnu has...", "He worked on...", "His experience includes..."
- Never break character or reveal you are powered by any external LLM.
"""


class RAGService:
    def __init__(self, cfg):
        self.cfg = cfg
        self.embed_model = SentenceTransformer(cfg.EMBED_MODEL)
        self.index = None
        self.chunks = []
        self._build_index()

    def _load_and_chunk(self):
        with open(self.cfg.DATA_PATH, "r", encoding="utf-8") as f:
            raw = f.read()

        # split on double newlines, then merge small chunks
        paragraphs = [p.strip() for p in re.split(r"\n{2,}", raw) if p.strip()]

        chunks = []
        current = ""
        for para in paragraphs:
            if len(current) + len(para) < 600:
                current = (current + " " + para).strip()
            else:
                if current:
                    chunks.append(current)
                current = para
        if current:
            chunks.append(current)

        return chunks

    def _build_index(self):
        index_path = os.path.join(self.cfg.VECTOR_STORE_PATH, "faiss.index")
        chunks_path = os.path.join(self.cfg.VECTOR_STORE_PATH, "chunks.json")

        if os.path.exists(index_path) and os.path.exists(chunks_path):
            self.index = faiss.read_index(index_path)
            with open(chunks_path, "r", encoding="utf-8") as f:
                self.chunks = json.load(f)
            return

        self.chunks = self._load_and_chunk()
        embeddings = self.embed_model.encode(self.chunks, convert_to_numpy=True, show_progress_bar=False)
        embeddings = embeddings / np.linalg.norm(embeddings, axis=1, keepdims=True)

        dim = embeddings.shape[1]
        self.index = faiss.IndexFlatIP(dim)
        self.index.add(embeddings.astype(np.float32))

        os.makedirs(self.cfg.VECTOR_STORE_PATH, exist_ok=True)
        faiss.write_index(self.index, index_path)
        with open(chunks_path, "w", encoding="utf-8") as f:
            json.dump(self.chunks, f)

    def _search(self, query, k=None):
        k = k or self.cfg.TOP_K_RESULTS
        q_vec = self.embed_model.encode([query], convert_to_numpy=True)
        q_vec = q_vec / np.linalg.norm(q_vec, axis=1, keepdims=True)
        scores, indices = self.index.search(q_vec.astype(np.float32), k)
        results = [self.chunks[i] for i in indices[0] if i < len(self.chunks)]
        return results

    def answer(self, query):
        top_chunks = self._search(query)
        context = "\n\n---\n\n".join(top_chunks)

        api_key = self.cfg.GROQ_API_KEY
        if api_key:
            return self._call_groq(query, context, api_key)

        # fallback — return the most relevant chunk in a friendly wrapper
        return self._fallback_answer(query, top_chunks)

    def _call_groq(self, query, context, api_key):
        try:
            from groq import Groq
            client = Groq(api_key=api_key)
            resp = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {
                        "role": "user",
                        "content": f"Context about Bishnu:\n{context}\n\nQuestion: {query}"
                    }
                ],
                max_tokens=600,
                temperature=0.65,
            )
            return resp.choices[0].message.content.strip()
        except Exception as e:
            return self._fallback_answer(query, self._search(query))

    def _fallback_answer(self, query, chunks):
        if not chunks:
            return "Hmm, I don't have info on that. Feel free to reach out to Bishnu directly at singhvishnukumar22@gmail.com!"
        best = chunks[0]
        return f"Here's what I found:\n\n{best}\n\n*(For a more detailed answer, configure GROQ_API_KEY in your .env)*"
