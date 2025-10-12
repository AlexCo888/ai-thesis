'use client';

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton
} from '@/components/ai-elements/conversation';
import { Message as Msg, MessageContent } from '@/components/ai-elements/message';
import { PromptInput, PromptInputTextarea, PromptInputSubmit } from '@/components/ai-elements/prompt-input';
import { Response } from '@/components/ai-elements/response';
import { InlineCitation } from '@/components/ai-elements/inline-citation';
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

  return (
    <div className="flex flex-col h-full">
      <Conversation className="relative w-full h-[65vh]">
        <ConversationContent>
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
                            <Response>
                              {part.text}
                            </Response>
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

      <PromptInput onSubmit={handleSubmit} className="mt-3 w-full relative">
        <PromptInputTextarea
          value={input}
          placeholder="Ask about the thesis…"
          onChange={(e) => setInput(e.currentTarget.value)}
          className="pr-12"
        />
        <PromptInputSubmit
          status={status === 'streaming' ? 'streaming' : 'ready'}
          disabled={!input.trim()}
          className="absolute bottom-1 right-1"
        />
      </PromptInput>

      {/* Sources panel (click to jump page in the PDF pane) */}
      {sources?.length ? (
        <div className="mt-3">
          <SourcesPanel
            items={sources}
          />
          <div className="mt-2 flex gap-2 flex-wrap">
            {sources.map((s) => (
              <button
                key={s.id}
                className="text-xs underline"
                onClick={() => onJumpToPage?.(s.page)}
                title={`Jump to page ${s.page}`}
              >
                Go to [#{s.n}] page {s.page}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
