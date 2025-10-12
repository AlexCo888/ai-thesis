# 🧠 Thesis RAG  
**Next.js 15 + Vercel AI SDK 5 + AI Elements + pgvector**

A polished RAG (Retrieval-Augmented Generation) app with streaming chat, citations, explore, summarize-range, and flashcards.  
Optimized for performance, clarity, and modern Vercel AI workflows.

---

## ⚙️ 1. Install & Setup

```bash
pnpm i
cp .env.example .env.local
# Add your environment variables:
# OPENAI_API_KEY=sk-...
# POSTGRES_URL=postgres://user:password@host:port/dbname
```

### 🧩 Install AI Elements Components
```bash
npx ai-elements@latest init
npx ai-elements@latest add conversation message prompt-input sources inline-citation response
```

### 📄 Add Your Thesis PDF
Place your thesis file at:
```
public/thesis.pdf
```

---

## 🗃️ 2. Prepare Postgres (pgvector)

Run migration:
```bash
pnpm migrate
```

This creates the `embeddings` table and initializes the vector index (`pgvector`).

---

## 🧠 3. Ingest the Thesis

```bash
pnpm ingest
```

This script:
- Parses `public/thesis.pdf` with **pdfjs-dist**  
- Splits content **per-page** into semantic chunks  
- Embeds chunks using **OpenAI via Vercel AI SDK**  
- Stores vectors in **Postgres (pgvector)** for retrieval

---

## 💻 4. Develop Locally

```bash
pnpm dev
```

Then open:
👉 [http://localhost:3000](http://localhost:3000)

---

## ☁️ 5. Deploy to Vercel

1. Add `OPENAI_API_KEY` and `POSTGRES_URL` as **Vercel Project Environment Variables**  
2. Deploy your app (the `/api/chat` route streams UI responses in real time).

---

## 🧩 Notes

- Uses **AI SDK v5** (`streamText`, `embedMany`) + OpenAI provider (`@ai-sdk/openai`)  
- **AI Elements** power the UI: `Conversation`, `Message`, `PromptInput`, `Sources`, `InlineCitation`, `Response`  
- Minimal setup, fully typed, built for **Next.js App Router**  

---

## 🏗️ Why This Architecture

| Component | Purpose |
|------------|----------|
| **Vercel AI SDK 5** | Unified text generation & streaming (`streamText`) with typed tool & embedding APIs — perfect for route handlers or server actions. |
| **AI Elements** | Real AI-native UI built on shadcn/ui — plug-and-play components for beyond-chat interactions. |
| **pgvector** | Fast, simple vector search in Postgres using cosine distance (`<=>`). |

---

## 🧭 Final Tips

- Change `GENERATION_MODEL` in `.env.local` to a larger model if needed (e.g., `gpt-4.1`, `gpt-4o-mini`, etc.)  
- Tune **chunk size** / **overlap** in `lib/chunk.ts` for best retrieval accuracy  
- Optimize vector search with **IVFFlat** or **HNSW** index (already included in migration)  
- Adjust probes/lists for latency vs recall trade-off  
- For **inline hover citations** (Perplexity-style), wire token-level data into `InlineCitation` — AI Elements includes patterns for this  

---

## 🧰 Optional Extensions

If you want to include:
- 🧩 **Reasoning**, **Toolbar**, or **Workflow** components  
- ⚙️ Replace route handlers with **Server Actions**  
- 🔍 Add **summarize-range** or **highlight** capabilities  

👉 Just ask — these can be pre-installed and integrated seamlessly.

---

**Author:** Alejandro Comi  
**Tech stack:** Next.js 15 • TypeScript • Vercel AI SDK 5 • AI Elements • pgvector • Shadcn UI  
**License:** MIT
