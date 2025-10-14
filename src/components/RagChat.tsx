'use client';

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton
} from '@/components/ai-elements/conversation';
import { Message as Msg, MessageContent } from '@/components/ai-elements/message';
import { PromptInput, PromptInputTextarea, PromptInputSubmit } from '@/components/ai-elements/prompt-input';
import { InlineCitation } from '@/components/ai-elements/inline-citation';
import { Loader } from '@/components/ai-elements/loader';
import CitationText from '@/components/CitationText';
import { MessageSquare } from 'lucide-react';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';
import SourcesPanel from './SourcesPanel';

type RagSourceHeader = {
  n: number;
  id: string;
  page: number;
  href: string;
  score: number;
};

export default function RagChat({
  onJumpToPage
}: {
  onJumpToPage?: (p: number) => void;
}) {
  const [input, setInput] = useState('');
  const [sources, setSources] = useState<RagSourceHeader[]>([]);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      fetch: async (url, options) => {
        const res = await fetch(url, options);
        // Parse sources header we sent from the server for this answer
        const h = res.headers.get('x-rag-sources');
        if (h) {
          try {
            const parsed = JSON.parse(decodeURIComponent(h)) as RagSourceHeader[];
            // Directly update sources here instead of using an effect
            setSources(parsed);
          } catch {
            // Ignore parse errors
          }
        }
        return res;
      }
    })
  });

  const handleSubmit = async (message: { text?: string }, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = message.text || input;
    if (!text.trim()) return;
    await sendMessage({ text });
    setInput('');
  };

  const isLoading = status === 'streaming' || status === 'submitted';

  return (
    <div className="flex flex-col h-full">
      <Conversation className="relative w-full flex-1 min-h-0">
        <ConversationContent>
          {/* Loading indicator for first message */}
          {isLoading && messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader size={32} />
                <p className="text-sm">AI is analyzing the thesis...</p>
              </div>
            </div>
          )}
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<MessageSquare className="size-12" />}
              title="Ask the Thesis"
              description="Try: “Summarize the research method”, “What are the main results?”, or “Define key terms.”"
            />
          ) : (
            messages.map((message) => (
              <Msg from={message.role} key={message.id}>
                <MessageContent>
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case 'text':
                        return (
                          <InlineCitation key={`${message.id}-${i}`}>
                            <CitationText
                              text={part.text}
                              sources={sources}
                              onPageJump={onJumpToPage}
                            />
                          </InlineCitation>
                        );
                      default:
                        return null;
                    }
                  })}
                </MessageContent>
              </Msg>
            ))
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <PromptInput onSubmit={handleSubmit} className="mt-2 lg:mt-3 w-full relative flex-shrink-0">
        <PromptInputTextarea
          value={input}
          placeholder={isLoading ? 'Waiting for AI response...' : 'Ask about the thesis…'}
          onChange={(e) => setInput(e.currentTarget.value)}
          className="pr-12 text-sm lg:text-base"
          disabled={isLoading}
          rows={2}
        />
        <PromptInputSubmit
          status={status === 'streaming' ? 'streaming' : status === 'submitted' ? 'submitted' : 'ready'}
          disabled={!input.trim() || isLoading}
          className="absolute bottom-1 right-1"
        />
      </PromptInput>

      {/* Sources panel (click to jump page in the PDF pane) */}
      {sources?.length ? (
        <div className="mt-2 border-t border-border pt-2">
          <SourcesPanel
            items={sources}
          />
          <div className="mt-1.5 flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
            {sources.map((s) => (
              <button
                key={s.id}
                className="text-[11px] underline hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0 py-0.5"
                onClick={() => onJumpToPage?.(s.page)}
                title={`Jump to page ${s.page}`}
                disabled={isLoading}
              >
                [#{s.n}] pg.{s.page}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
