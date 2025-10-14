'use client';

import { Response } from '@/components/ai-elements/response';

interface CitationTextProps {
  text: string;
  sources: Array<{ n: number; page: number }>;
  onPageJump?: (page: number) => void;
}

export default function CitationText({ text, sources, onPageJump }: CitationTextProps) {
  // Split text by citation patterns [#n]
  const parts = text.split(/(\[#\d+\])/g);

  return (
    <div className="inline">
      {parts.map((part, index) => {
        // Check if this part is a citation
        const match = part.match(/\[#(\d+)\]/);
        if (match) {
          const citationNum = parseInt(match[1], 10);
          const source = sources.find((s) => s.n === citationNum);
          
          if (source && onPageJump) {
            return (
              <button
                key={index}
                onClick={() => onPageJump(source.page)}
                className="inline-flex items-center text-primary hover:text-primary/80 hover:underline font-medium cursor-pointer transition-colors mx-0.5"
                title={`Jump to page ${source.page}`}
                type="button"
              >
                [{citationNum}]
              </button>
            );
          }
          return <span key={index} className="text-muted-foreground mx-0.5">[{citationNum}]</span>;
        }
        
        // Regular text - render with Response component for markdown
        return part ? <Response key={index}>{part}</Response> : null;
      })}
    </div>
  );
}
