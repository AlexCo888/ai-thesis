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
    <div className="mt-1">
      <Sources>
        <div className="text-xs text-muted-foreground mb-1.5">
          Used {items.length} sources
        </div>
        <ul className="space-y-1 max-h-20 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
          {items.map((s) => (
            <li key={s.id} className="text-[11px] leading-tight">
              <a href={s.href} target="_blank" className="underline hover:text-primary transition-colors">
                [#{s.n}] Page {s.page}
              </a>
              <span className="ml-1.5 opacity-60">{(s.score * 100).toFixed(0)}%</span>
            </li>
          ))}
        </ul>
      </Sources>
    </div>
  );
}
