'use client';

import { type FormEvent, useEffect, useRef, useState } from 'react';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';

import type { SessionChatMessage, SessionDetail } from '@/lib/sessions/types';

interface ChatPanelProps {
  initialSession: SessionDetail;
  onMessagesChange?: (messages: UIMessage[]) => void;
}

function buildInitialUiMessages(messages: SessionChatMessage[]): UIMessage[] {
  return messages
    .filter((message) => message.role !== 'system')
    .map((message) => ({
      id: message.id,
      parts: [
        {
          text: message.content,
          type: 'text' as const,
        },
      ],
      role: message.role === 'assistant' ? 'assistant' : 'user',
    }));
}

function extractDisplayText(message: UIMessage): string {
  return message.parts
    .filter(
      (part): part is Extract<(typeof message.parts)[number], { type: 'text' }> =>
        part.type === 'text',
    )
    .map((part) => part.text)
    .join('')
    .trim();
}

function ChatPanel({ initialSession, onMessagesChange }: ChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const initialUiMessages = buildInitialUiMessages(initialSession.messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    messages: initialUiMessages,
    transport: new DefaultChatTransport({
      api: `/api/sessions/${initialSession.id}/chat`,
    }),
  });

  useEffect(() => {
    if (onMessagesChange) {
      onMessagesChange(messages);
    }
  }, [messages, onMessagesChange]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isBusy = status === 'submitted' || status === 'streaming';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = inputValue.trim();

    if (trimmed.length === 0 || isBusy) {
      return;
    }

    void sendMessage({
      parts: [
        {
          text: trimmed,
          type: 'text',
        },
      ],
      role: 'user',
    });
    setInputValue('');
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="workspace-card-muted p-6 text-center">
              <p className="text-sm text-[var(--color-text-secondary)]">
                {initialSession.modeSummary.name} 모드로 대화를 시작해 보세요.
              </p>
            </div>
          ) : null}

          {messages.map((message) => {
            const text = extractDisplayText(message);

            if (text.length === 0) {
              return null;
            }

            return (
              <div
                className={`workspace-card ${message.role === 'user' ? 'border-[var(--color-accent)]' : ''}`}
                key={message.id}
              >
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                  {message.role === 'user' ? '나' : 'AXIOM'}
                </p>
                <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--color-text)]">
                  {text}
                </p>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form className="border-t border-[var(--color-border)] px-6 py-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3">
          <textarea
            className="input-surface min-h-[80px] w-full resize-none"
            disabled={isBusy}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="메시지를 입력하세요..."
            value={inputValue}
          />
          <div className="flex justify-end">
            <button
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isBusy || inputValue.trim().length === 0}
              type="submit"
            >
              {isBusy ? '응답 중...' : '보내기'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export { ChatPanel };
export type { ChatPanelProps };
