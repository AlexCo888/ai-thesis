# 🧠 Thesis RAG  
**Next.js 15 + Vercel AI SDK 5 + AI Elements + Pinecone**

A polished RAG (Retrieval-Augmented Generation) app with streaming chat, citations, explore, summarize-range, and flashcards.  
Optimized for performance, clarity, and modern Vercel AI workflows. Powered by **Google Gemini** with **multilingual support** (EN/ES).

---

## ⚙️ 1. Install & Setup

```bash
pnpm i
cp .env.example .env.local
# Add your environment variables:
# GOOGLE_GENERATIVE_AI_API_KEY=your-api-key
# PINECONE_API_KEY=your-pinecone-key
# PINECONE_INDEX=your-index-name
# GENERATION_MODEL=gemini-2.5-flash-preview-09-2025 (or your preferred Gemini model)
# EMBEDDING_MODEL=text-embedding-004 (Google's embedding model)
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

## 🗃️ 2. Prepare Pinecone Vector Database

This project uses **Pinecone** for vector storage and similarity search. 

1. Create a Pinecone index with **1536 dimensions** (for Google's text-embedding-004)
2. Add your API key and index name to `.env.local`
3. Run the ingestion script (see next step)

---

## 🧠 3. Ingest the Thesis

```bash
pnpm ingest
```

This script:
- Parses `public/thesis.pdf` with **pdfjs-dist**  
- Splits content **per-page** into semantic chunks  
- Embeds chunks using **Google's text-embedding-004 via Vercel AI SDK**  
- Stores vectors in **Pinecone** for fast similarity search

---

## 💻 4. Develop Locally

```bash
pnpm dev
```

Then open:
👉 [http://localhost:3000](http://localhost:3000) (English - default)  
👉 [http://localhost:3000/es](http://localhost:3000/es) (Spanish)

### 🌍 Language Switching
The app includes a **LocaleSwitcher** in the top-right corner for seamless language switching between English and Spanish.

---

## ☁️ 5. Deploy to Vercel

1. Add the following as **Vercel Project Environment Variables**:
   - `GOOGLE_GENERATIVE_AI_API_KEY`
   - `PINECONE_API_KEY`
   - `PINECONE_INDEX`
   - `GENERATION_MODEL` (optional)
   - `EMBEDDING_MODEL` (optional)
2. Deploy your app (the `/api/chat` route streams UI responses in real time).

---

## 🧩 Key Features

- 🤖 **Google Gemini AI** - Uses `gemini-2.5-flash-preview` for fast, high-quality responses
- 🌍 **Internationalization** - Built-in support for English and Spanish via **next-intl v4**
- 🎯 **Pinecone Vector Search** - Fast, scalable semantic search
- 🎨 **AI Elements** - Beautiful UI components: `Conversation`, `Message`, `PromptInput`, `InlineCitation`
- 📚 **Multiple Modes** - Chat, Explore, Summarize, and Flashcards
- 🔗 **Citations** - Inline citations with page references
- ⚡ **Streaming** - Real-time AI responses with streaming support
- 🎓 **Flashcard Generator** - AI-powered flashcards with contextual chat
- 📱 **Responsive Design** - Mobile-first approach with Tailwind CSS  

---

## 🏗️ Why This Architecture

| Component | Purpose |
|------------|----------|
| **Vercel AI SDK 5** | Unified text generation & streaming (`streamText`) with typed tool & embedding APIs — perfect for route handlers or server actions. |
| **Google Gemini** | Latest multimodal AI with excellent performance, cost-effectiveness, and long context windows. |
| **AI Elements** | Real AI-native UI built on shadcn/ui — plug-and-play components for beyond-chat interactions. |
| **Pinecone** | Managed vector database with fast similarity search, automatic scaling, and production-ready infrastructure. |
| **next-intl v4** | Type-safe internationalization with automatic locale routing and SEO optimization. |

---

## 🧭 Final Tips

### AI Model Configuration
- Change `GENERATION_MODEL` in `.env.local` to use different Gemini models:
  - `gemini-2.5-flash-preview-09-2025` (fast, recommended)
  - `gemini-2.0-flash-exp` (balanced)
  - `gemini-1.5-pro` (more capable)
- Adjust temperature and other parameters in `/api/chat/route.ts`

### Retrieval Optimization
- Tune **chunk size** / **overlap** in `lib/chunk.ts` for best retrieval accuracy  
- Adjust the number of retrieved chunks in `searchSimilar()` (default: 6)
- Pinecone automatically handles index optimization

### Internationalization
- Add new languages by:
  1. Adding locale to `src/i18n/routing.ts`
  2. Creating `messages/{locale}.json`
  3. Adding locale to `generateStaticParams()` in layouts
- All translations are in `messages/` directory
- See `INTERNATIONALIZATION.md` for detailed guide

### UI Customization
- For **inline hover citations** (Perplexity-style), wire token-level data into `InlineCitation`
- AI Elements includes patterns for advanced interactions  

---

## 🧰 Features Included

✅ **Chat Interface** - Streaming responses with inline citations  
✅ **Explore Tab** - Semantic search across your thesis  
✅ **Summarize Tab** - Page-range summarization  
✅ **Flashcards Tab** - AI-generated study cards with contextual chat  
✅ **PDF Viewer** - Integrated thesis viewer with page jumping  
✅ **Language Switcher** - English/Spanish support with next-intl  
✅ **Responsive Design** - Mobile-optimized layout  

## 🔧 Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm ingest       # Ingest PDF into Pinecone
pnpm migrate      # (Legacy) Pinecone migration if needed
```

---

## 📚 Documentation

- **[INTERNATIONALIZATION.md](./INTERNATIONALIZATION.md)** - Complete i18n setup and usage guide
- **[Vercel AI SDK Docs](https://sdk.vercel.ai/docs)** - AI SDK documentation
- **[next-intl Docs](https://next-intl-docs.vercel.app/)** - Internationalization guide
- **[Pinecone Docs](https://docs.pinecone.io/)** - Vector database documentation

---

**Author:** Alejandro Comi  
**Tech stack:** Next.js 15 • TypeScript • React 19 • Vercel AI SDK 5 • Google Gemini • AI Elements • Pinecone • next-intl v4 • Shadcn UI • Tailwind CSS  
**License:** MIT
