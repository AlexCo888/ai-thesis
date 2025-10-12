'use client';

import { Tabs } from '@/components/ui/tabs';
import RagChat from '@/components/RagChat';
import PdfPane from '@/components/PdfPane';
import { useState } from 'react';

interface SearchResult {
  id: string;
  page: number;
  score: number;
  snippet: string;
  href?: string;
}

interface Flashcard {
  q: string;
  a: string;
  page: number;
  source: string;
}

function ExploreTab() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const search = async () => {
    if (!q.trim()) return;
    const res = await fetch('/api/rag/search', {
      method: 'POST',
      body: JSON.stringify({ query: q, k: 10 }),
      headers: { 'content-type': 'application/json' }
    });
    const data = await res.json();
    setResults(data.results || []);
  };
  return (
    <div className="p-3 space-y-3">
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Semantic search…"
          className="flex-1 border rounded px-3 py-2"
        />
        <button onClick={search} className="px-3 py-2 rounded bg-black text-white">Search</button>
      </div>
      <ul className="space-y-3">
        {results.map((r) => (
          <li key={r.id} className="border rounded p-3">
            <div className="text-sm">
              <a className="underline" href={r.href} target="_blank">Page {r.page}</a>
              <span className="ml-2 text-xs opacity-70">relevance {(r.score * 100).toFixed(0)}%</span>
            </div>
            <div className="text-sm mt-1">{r.snippet}</div>
            <div className="text-xs text-muted-foreground break-all mt-1">id={r.id}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SummarizeTab() {
  const [fromPage, setFromPage] = useState<number>(1);
  const [toPage, setToPage] = useState<number>(1);
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setText('');
    const res = await fetch('/api/rag/summarize', {
      method: 'POST',
      body: JSON.stringify({ fromPage, toPage }),
      headers: { 'content-type': 'application/json' }
    });
    // stream the text
    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;
      setText((t) => t + decoder.decode(value));
    }
    setLoading(false);
  };

  return (
    <div className="p-3 space-y-3">
      <div className="flex gap-2 items-center">
        <input
          type="number"
          min={1}
          value={fromPage}
          onChange={(e) => setFromPage(parseInt(e.target.value || '1', 10))}
          className="w-24 border rounded px-2 py-2"
        />
        <span>to</span>
        <input
          type="number"
          min={fromPage}
          value={toPage}
          onChange={(e) => setToPage(parseInt(e.target.value || '1', 10))}
          className="w-24 border rounded px-2 py-2"
        />
        <button onClick={run} className="px-3 py-2 rounded bg-black text-white" disabled={loading}>
          {loading ? 'Summarizing…' : 'Summarize'}
        </button>
      </div>
      <pre className="whitespace-pre-wrap text-sm">{text}</pre>
    </div>
  );
}

function FlashcardsTab() {
  const [topic, setTopic] = useState('');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const res = await fetch('/api/rag/flashcards', {
      method: 'POST',
      body: JSON.stringify({ topic, n: 12 }),
      headers: { 'content-type': 'application/json' }
    });
    const data = await res.json();
    setCards(data.cards || []);
    setLoading(false);
  };

  return (
    <div className="p-3 space-y-3">
      <div className="flex gap-2">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Topic, e.g. “Methodology”"
          className="flex-1 border rounded px-3 py-2"
        />
        <button onClick={run} className="px-3 py-2 rounded bg-black text-white" disabled={loading}>
          {loading ? 'Generating…' : 'Generate'}
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {cards.map((c, idx) => (
          <details key={idx} className="border rounded p-3">
            <summary className="cursor-pointer text-sm font-medium">
              Q{idx + 1}. {c.q || '—'}
            </summary>
            <div className="mt-2 text-sm">
              <div className="font-semibold">Answer</div>
              <div className="mt-1">{c.a || '—'}</div>
              {c.page ? (
                <a
                  className="underline text-xs mt-2 inline-block"
                  href={`/thesis.pdf#page=${c.page}`}
                  target="_blank"
                >
                  Page {c.page}
                </a>
              ) : null}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  // Default the PDF pane to first page
  const [pdfPage, setPdfPage] = useState<number | undefined>(1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_420px] gap-4 p-4">
      {/* Left: App */}
      <div className="min-h-[85vh] border rounded-md p-3">
        <Tabs
          tabs={[
            { label: 'Ask', content: <RagChat onJumpToPage={(p) => setPdfPage(p)} /> },
            { label: 'Explore', content: <ExploreTab /> },
            { label: 'Summarize', content: <SummarizeTab /> },
            { label: 'Flashcards', content: <FlashcardsTab /> }
          ]}
        />
      </div>

      {/* Right: PDF pane */}
      <div className="min-h-[85vh] border rounded-md p-2">
        <div className="text-sm font-medium px-1 pb-2">Thesis Viewer</div>
        <div className="h-[calc(85vh-2.5rem)]">
          <PdfPane page={pdfPage} />
        </div>
      </div>
    </div>
  );
}
