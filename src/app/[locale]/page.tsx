'use client';

import { Tabs } from '@/components/ui/tabs';
import RagChat from '@/components/RagChat';
import PdfPane from '@/components/PdfPane';
import FlashcardWithChat from '@/components/FlashcardWithChat';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('explore');
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
          placeholder={t('searchPlaceholder')}
          className="flex-1 border rounded px-3 py-2"
        />
        <button onClick={search} className="px-3 py-2 rounded bg-black text-white">{t('searchButton')}</button>
      </div>
      <ul className="space-y-3">
        {results.map((r) => (
          <li key={r.id} className="border rounded p-3">
            <div className="text-sm">
              <a className="underline" href={r.href} target="_blank">{t('page')} {r.page}</a>
              <span className="ml-2 text-xs opacity-70">{t('relevance')} {(r.score * 100).toFixed(0)}%</span>
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
  const t = useTranslations('summarize');
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
        <span>{t('from')}</span>
        <input
          type="number"
          min={fromPage}
          value={toPage}
          onChange={(e) => setToPage(parseInt(e.target.value || '1', 10))}
          className="w-24 border rounded px-2 py-2"
        />
        <button onClick={run} className="px-3 py-2 rounded bg-black text-white" disabled={loading}>
          {loading ? t('summarizing') : t('summarizeButton')}
        </button>
      </div>
      <pre className="whitespace-pre-wrap text-sm">{text}</pre>
    </div>
  );
}

function FlashcardsTab({ onPageJump }: { onPageJump?: (page: number) => void }) {
  const t = useTranslations('flashcards');
  const [topic, setTopic] = useState('');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const run = async () => {
    setLoading(true);
    setError('');
    const res = await fetch('/api/rag/flashcards', {
      method: 'POST',
      body: JSON.stringify({ topic, n: 12 }),
      headers: { 'content-type': 'application/json' }
    });
    const data = await res.json();
    setCards(data.cards || []);
    if (data.error) {
      setError(`Error: ${data.error}. Raw response: ${data.rawResponse || 'N/A'}`);
      console.error('Flashcard generation error:', data);
    }
    setLoading(false);
  };

  return (
    <div className="p-3 space-y-3">
      <div className="flex gap-2">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={t('topicPlaceholder')}
          className="flex-1 border rounded px-3 py-2"
        />
        <button onClick={run} className="px-3 py-2 rounded bg-black text-white" disabled={loading}>
          {loading ? t('generating') : t('generateButton')}
        </button>
      </div>
      {error && (
        <div className="border border-red-500 bg-red-50 rounded p-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {!loading && cards.length === 0 && !error && (
        <div className="text-sm text-muted-foreground text-center py-8">
          {t('emptyState')}
        </div>
      )}
      <div className="space-y-3">
        {cards.map((c, idx) => (
          <FlashcardWithChat
            key={`${c.source}-${idx}`}
            flashcard={c}
            index={idx}
            onPageJump={onPageJump}
          />
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  const t = useTranslations('tabs');
  const tPage = useTranslations('page');
  
  // Default the PDF pane to first page
  const [pdfPage, setPdfPage] = useState<number | undefined>(1);

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 container mx-auto max-w-[1800px] px-2 lg:px-4 py-2 lg:py-4 overflow-hidden">
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_500px] xl:grid-cols-[1fr_600px] 2xl:grid-cols-[1fr_700px] gap-2 lg:gap-4 h-full">
          {/* Left: App - Takes priority on mobile (75% of screen) */}
          <div className="flex flex-col border rounded-lg shadow-sm p-2 lg:p-4 bg-white dark:bg-gray-950 overflow-hidden min-h-0 h-[75vh] lg:h-auto">
            <Tabs
              tabs={[
                { label: t('ask'), content: <RagChat onJumpToPage={(p) => setPdfPage(p)} /> },
                { label: t('explore'), content: <ExploreTab /> },
                { label: t('summarize'), content: <SummarizeTab /> },
                { label: t('flashcards'), content: <FlashcardsTab onPageJump={(p) => setPdfPage(p)} /> }
              ]}
            />
          </div>

          {/* Right: PDF pane - Secondary on mobile (remaining space) */}
          <div className="flex flex-col border rounded-lg shadow-sm bg-white dark:bg-gray-950 overflow-hidden min-h-0 flex-1 lg:flex-none lg:h-auto">
            <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b flex items-center justify-between">
              <span className="text-sm font-semibold">{tPage('thesisViewer')}</span>
              {pdfPage && (
                <span className="text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                  {tPage('page')} {pdfPage}
                </span>
              )}
            </div>
            <div className="flex-1 p-2 lg:p-4 overflow-hidden min-h-0">
              <PdfPane page={pdfPage} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
