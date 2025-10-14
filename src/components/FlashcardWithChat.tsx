'use client';

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message as Msg, MessageContent } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
} from '@/components/ai-elements/prompt-input';
import { InlineCitation } from '@/components/ai-elements/inline-citation';
import { Suggestions, Suggestion } from '@/components/ai-elements/suggestion';
import { Loader } from '@/components/ai-elements/loader';
import CitationText from '@/components/CitationText';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';

interface Flashcard {
  q: string;
  a: string;
  page: number;
  source: string;
}

interface RagSourceHeader {
  n: number;
  id: string;
  page: number;
  href: string;
  score: number;
}

interface FlashcardWithChatProps {
  flashcard: Flashcard;
  index: number;
  onPageJump?: (page: number) => void;
}

export default function FlashcardWithChat({
  flashcard,
  index,
  onPageJump,
}: FlashcardWithChatProps) {
  const t = useTranslations('flashcard');
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [sources, setSources] = useState<RagSourceHeader[]>([]);
  const [isFirstMessage, setIsFirstMessage] = useState(true);

  const { messages, sendMessage, status } = useChat({
    id: `flashcard-${flashcard.source}-${index}`, // Unique ID per flashcard
    transport: new DefaultChatTransport({
      api: `/api/chat?locale=${locale}`,
      fetch: async (url, options) => {
        // Add flashcard context as header for all messages
        const modifiedOptions = {
          ...options,
          headers: {
            ...options?.headers,
            'x-flashcard-context': encodeURIComponent(JSON.stringify({
              question: flashcard.q,
              answer: flashcard.a,
              page: flashcard.page,
            })),
          },
        };
        
        const res = await fetch(url, modifiedOptions);
        // Parse sources header we sent from the server for this answer
        const h = res.headers.get('x-rag-sources');
        if (h) {
          try {
            const parsed = JSON.parse(decodeURIComponent(h)) as RagSourceHeader[];
            setSources(parsed);
          } catch {
            // Ignore parse errors
          }
        }
        return res;
      },
    }),
  });

  const handleSubmit = async (
    message: { text?: string },
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    const text = message.text || input;
    if (!text.trim()) return;

    // Just send the user's message - context is in headers
    await sendMessage({ text });
    
    if (isFirstMessage) {
      setIsFirstMessage(false);
    }
    
    setInput('');
    
    // Auto-expand chat when user sends first message
    if (!isChatExpanded) {
      setIsChatExpanded(true);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (status === 'streaming' || status === 'submitted') return;
    setInput(suggestion);
  };

  const isLoading = status === 'streaming' || status === 'submitted';

  const suggestions = [
    t('suggestions.explain'),
    t('suggestions.example'),
    t('suggestions.relate'),
    t('suggestions.memorize'),
  ];

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Flashcard Header - Always visible */}
      <details
        open={isOpen}
        onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
        className="group"
      >
        <summary className="cursor-pointer text-sm font-medium p-3 hover:bg-accent transition-colors list-none">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Q{index + 1}.</span>
                <span>{flashcard.q || '—'}</span>
              </div>
            </div>
            <ChevronDown className="size-4 transition-transform group-open:rotate-180 shrink-0 mt-0.5" />
          </div>
        </summary>

        {/* Flashcard Answer */}
        <div className="px-3 pb-3 space-y-3">
          <div>
            <div className="font-semibold text-sm mb-1">{t('answer')}</div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              {flashcard.a || '—'}
            </div>
            {flashcard.page && (
              <button
                className="underline text-xs mt-2 inline-block text-primary hover:text-primary/80"
                onClick={() => onPageJump?.(flashcard.page)}
                type="button"
              >
                📄 {t('pageLabel', { page: flashcard.page })}
              </button>
            )}
          </div>

          {/* AI Chat Section */}
          <div className="border-t pt-3">
            <button
              onClick={() => setIsChatExpanded(!isChatExpanded)}
              className="flex items-center gap-2 text-sm font-medium mb-2 hover:text-primary transition-colors"
              type="button"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader size={16} className="text-primary" />
              ) : (
                <MessageSquare className="size-4" />
              )}
              <span>
                {isLoading ? t('aiThinking') : t('askAI')}
              </span>
              {isChatExpanded ? (
                <ChevronUp className="size-3" />
              ) : (
                <ChevronDown className="size-3" />
              )}
              {messages.length > 0 && (
                <span className="ml-auto text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                  {messages.length}
                </span>
              )}
            </button>

            {isChatExpanded && (
              <div className="space-y-3">
                {/* Suggestions - Only show when no messages */}
                {messages.length === 0 && !isLoading && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {t('quickQuestions')}
                    </div>
                    <Suggestions>
                      {suggestions.map((s) => (
                        <Suggestion
                          key={s}
                          suggestion={s}
                          onClick={handleSuggestionClick}
                          disabled={isLoading}
                        />
                      ))}
                    </Suggestions>
                  </div>
                )}

                {/* Conversation */}
                <Conversation className="relative w-full border rounded-md">
                  <ConversationContent className="max-h-[300px] min-h-[150px]">
                    {/* Loading Overlay */}
                    {isLoading && messages.length === 0 && (
                      <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                          <Loader size={24} />
                          <p className="text-sm">{t('generating')}</p>
                        </div>
                      </div>
                    )}
                    {messages.length === 0 ? (
                      <ConversationEmptyState
                        icon={<MessageSquare className="size-8" />}
                        title={t('noMessages')}
                        description={t('askAnything')}
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
                                        onPageJump={onPageJump}
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

                {/* Prompt Input */}
                <PromptInput onSubmit={handleSubmit} className="w-full relative">
                  <PromptInputTextarea
                    value={input}
                    placeholder={isLoading ? t('inputPlaceholderWaiting') : t('inputPlaceholder')}
                    onChange={(e) => setInput(e.currentTarget.value)}
                    className="pr-12 min-h-[60px]"
                    disabled={isLoading}
                  />
                  <PromptInputSubmit
                    status={status === 'streaming' ? 'streaming' : status === 'submitted' ? 'submitted' : 'ready'}
                    disabled={!input.trim() || isLoading}
                    className="absolute bottom-1 right-1"
                  />
                </PromptInput>

                {/* Sources - Show citation links when available */}
                {sources.length > 0 && messages.length > 0 && (
                  <div className="border-t pt-2 mt-2">
                    <div className="text-xs font-medium text-muted-foreground mb-2">
                      {t('sources')}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sources.map((s) => (
                        <button
                          key={s.id}
                          className="text-xs px-2 py-1 rounded-md bg-secondary hover:bg-secondary/80 transition-colors border border-border disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => onPageJump?.(s.page)}
                          title={t('jumpToPage', { page: s.page })}
                          disabled={isLoading}
                        >
                          {t('sourceCitation', { n: s.n, page: s.page })}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </details>
    </div>
  );
}
