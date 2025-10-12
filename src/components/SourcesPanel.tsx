'use client';

import { Sources } from '@/components/ai-elements/sources';

type SourceItem = {
  n: number;
  id: string;
  page: number;
  href: string;
  score: number;
};

export default function SourcesPanel({ items }: { items: SourceItem[] }) {
  if (!items?.length) return null;
  return (
    <div className="mt-2">
      <Sources>
        <div className="text-sm text-muted-foreground mb-2">
          Used {items.length} sources
        </div>
        <ul className="space-y-2">
          {items.map((s) => (
            <li key={s.id} className="text-sm">
              <a href={s.href} target="_blank" className="underline">
                [#{s.n}] Page {s.page}
              </a>
              <span className="ml-2 text-xs opacity-70">relevance {(s.score * 100).toFixed(0)}%</span>
              <div className="text-xs text-muted-foreground break-all">id={s.id}</div>
            </li>
          ))}
        </ul>
      </Sources>
    </div>
  );
}
