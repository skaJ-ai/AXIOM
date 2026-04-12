'use client';

import { useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import type { WorkCardListItem } from '@/domains/work-cards/types';
import { safeFetch } from '@/lib/utils';

type WorkCardFilter = 'active' | 'all' | 'archived';
type IntentReviewStatus = 'approved' | 'captured' | 'nominated' | 'rejected';
type IntentType =
  | 'audience'
  | 'context'
  | 'exception'
  | 'judgment_basis'
  | 'preference'
  | 'prohibition';

interface LinkedSessionPreview {
  id: string;
  modeName: string;
  title: string;
  updatedAt: string;
}

interface LinkedIntentPreview {
  content: string;
  createdAt: string;
  id: string;
  reviewStatus: IntentReviewStatus;
  sessionId: string;
  sessionTitle: string;
  type: IntentType;
}

interface WorkCardBoardItem extends WorkCardListItem {
  intentCount: number;
  recentIntents: LinkedIntentPreview[];
  recentSessions: LinkedSessionPreview[];
}

interface WorkCardBoardProps {
  initialCards: WorkCardBoardItem[];
}

interface WorkCardsResponse {
  data: {
    workCards: WorkCardListItem[];
  };
}

interface WorkCardResponse {
  data: {
    workCard: WorkCardListItem | null;
  };
}

function formatDateTimeLabel(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function canStartSessionFromWorkCard(status: WorkCardListItem['status']): boolean {
  return status === 'active' || status === 'paused';
}

function formatIntentType(type: IntentType): string {
  switch (type) {
    case 'audience':
      return '대상';
    case 'context':
      return '상황';
    case 'exception':
      return '예외';
    case 'judgment_basis':
      return '판단 기준';
    case 'preference':
      return '선호';
    case 'prohibition':
      return '금지';
    default:
      return type;
  }
}

function WorkCardBoard({ initialCards }: WorkCardBoardProps) {
  const [cards, setCards] = useState(initialCards);
  const [createAudience, setCreateAudience] = useState('');
  const [createProcessLabel, setCreateProcessLabel] = useState('');
  const [createTitle, setCreateTitle] = useState('');
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [filter, setFilter] = useState<WorkCardFilter>('active');
  const [isCreating, setIsCreating] = useState(false);
  const [pendingCardId, setPendingCardId] = useState<string | null>(null);

  const visibleCards = useMemo(() => {
    if (filter === 'all') {
      return cards;
    }

    if (filter === 'archived') {
      return cards.filter((card) => card.status === 'archived');
    }

    return cards.filter((card) => card.status !== 'archived');
  }, [cards, filter]);

  const handleRefresh = async () => {
    const result = await safeFetch<WorkCardsResponse>('/api/work-cards');

    if (!result.success) {
      setErrorMessage(result.error);
      return;
    }

    setCards((previousCards) =>
      result.data.data.workCards.map((card) => {
        const existing = previousCards.find((item) => item.id === card.id);

        return {
          ...card,
          intentCount: existing?.intentCount ?? 0,
          recentIntents: existing?.recentIntents ?? [],
          recentSessions: existing?.recentSessions ?? [],
        };
      }),
    );
  };

  const handleCreate = async () => {
    setIsCreating(true);
    setErrorMessage('');

    const result = await safeFetch<WorkCardResponse>('/api/work-cards', {
      body: JSON.stringify({
        audience: createAudience.trim() || undefined,
        processLabel: createProcessLabel.trim() || undefined,
        title: createTitle.trim(),
      }),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    });

    if (!result.success) {
      setIsCreating(false);
      setErrorMessage(result.error);
      return;
    }

    const createdCard = result.data.data.workCard;

    if (createdCard) {
      setCards((previousCards) => [
        {
          ...createdCard,
          intentCount: 0,
          recentIntents: [],
          recentSessions: [],
        },
        ...previousCards,
      ]);
    } else {
      await handleRefresh();
    }

    setCreateAudience('');
    setCreateProcessLabel('');
    setCreateTitle('');
    setIsCreating(false);
  };

  const handleSave = async (
    cardId: string,
    nextValues: {
      audience: string;
      priority: WorkCardListItem['priority'];
      processLabel: string;
      sensitivity: WorkCardListItem['sensitivity'];
      status: WorkCardListItem['status'];
      title: string;
    },
  ) => {
    setPendingCardId(cardId);
    setErrorMessage('');

    const result = await safeFetch<WorkCardResponse>(`/api/work-cards/${cardId}`, {
      body: JSON.stringify(nextValues),
      headers: {
        'content-type': 'application/json',
      },
      method: 'PATCH',
    });

    if (!result.success) {
      setPendingCardId(null);
      setErrorMessage(result.error);
      return;
    }

    const updatedCard = result.data.data.workCard;

    if (updatedCard) {
      setCards((previousCards) =>
        previousCards.map((card) =>
          card.id === cardId
            ? {
                ...updatedCard,
                intentCount: card.intentCount,
                recentIntents: card.recentIntents,
                recentSessions: card.recentSessions,
              }
            : card,
        ),
      );
    }

    setEditingCardId(null);
    setPendingCardId(null);
  };

  const handleArchive = async (cardId: string) => {
    setPendingCardId(cardId);
    setErrorMessage('');

    const result = await safeFetch<WorkCardResponse>(`/api/work-cards/${cardId}`, {
      body: JSON.stringify({
        status: 'archived',
      }),
      headers: {
        'content-type': 'application/json',
      },
      method: 'PATCH',
    });

    if (!result.success) {
      setPendingCardId(null);
      setErrorMessage(result.error);
      return;
    }

    const updatedCard = result.data.data.workCard;

    if (updatedCard) {
      setCards((previousCards) =>
        previousCards.map((card) =>
          card.id === cardId
            ? {
                ...updatedCard,
                intentCount: card.intentCount,
                recentIntents: card.recentIntents,
                recentSessions: card.recentSessions,
              }
            : card,
        ),
      );
    }

    setPendingCardId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {errorMessage.length > 0 ? (
        <div className="border-[var(--color-error)]/20 rounded-[var(--radius-md)] border bg-[var(--color-error-light)] px-4 py-3 text-sm text-[var(--color-error)]">
          {errorMessage}
        </div>
      ) : null}

      <section className="workspace-card-muted flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-headline text-xl font-bold text-[var(--color-text)]">
              업무 카드 만들기
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              카드는 세션과 맥락을 묶는 기본 단위입니다. 먼저 제목만 만들어도 됩니다.
            </p>
          </div>
          <Link className="btn-secondary" href="/workspace/new">
            카드 없이 세션 시작
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
          <input
            className="input-surface w-full"
            onChange={(event) => setCreateTitle(event.target.value)}
            placeholder="업무 카드 제목"
            value={createTitle}
          />
          <input
            className="input-surface w-full"
            onChange={(event) => setCreateAudience(event.target.value)}
            placeholder="대상 독자"
            value={createAudience}
          />
          <input
            className="input-surface w-full"
            onChange={(event) => setCreateProcessLabel(event.target.value)}
            placeholder="프로세스 라벨"
            value={createProcessLabel}
          />
          <button
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isCreating || createTitle.trim().length === 0}
            onClick={() => void handleCreate()}
            type="button"
          >
            {isCreating ? '생성 중...' : '카드 생성'}
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-headline text-xl font-bold text-[var(--color-text)]">
              업무 카드 목록
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              카드별로 세션과 포착된 작업 맥락을 함께 관리합니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                ['active', '활성 카드'],
                ['all', '전체'],
                ['archived', '보관'],
              ] as const
            ).map(([value, label]) => (
              <button
                className={`btn-secondary ${filter === value ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : ''}`}
                key={value}
                onClick={() => setFilter(value)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {visibleCards.length === 0 ? (
          <div className="workspace-card-muted p-6 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              현재 필터에 맞는 업무 카드가 없습니다.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {visibleCards.map((card) => (
              <WorkCardRow
                card={card}
                isEditing={editingCardId === card.id}
                isPending={pendingCardId === card.id}
                key={card.id}
                onArchive={handleArchive}
                onEdit={() => setEditingCardId((current) => (current === card.id ? null : card.id))}
                onSave={handleSave}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function WorkCardRow({
  card,
  isEditing,
  isPending,
  onArchive,
  onEdit,
  onSave,
}: {
  card: WorkCardBoardItem;
  isEditing: boolean;
  isPending: boolean;
  onArchive: (cardId: string) => void;
  onEdit: () => void;
  onSave: (
    cardId: string,
    nextValues: {
      audience: string;
      priority: WorkCardListItem['priority'];
      processLabel: string;
      sensitivity: WorkCardListItem['sensitivity'];
      status: WorkCardListItem['status'];
      title: string;
    },
  ) => void;
}) {
  const [audience, setAudience] = useState(card.audience ?? '');
  const [priority, setPriority] = useState<WorkCardListItem['priority']>(card.priority);
  const [processLabel, setProcessLabel] = useState(card.processLabel ?? '');
  const [sensitivity, setSensitivity] = useState<WorkCardListItem['sensitivity']>(card.sensitivity);
  const [status, setStatus] = useState<WorkCardListItem['status']>(card.status);
  const [title, setTitle] = useState(card.title);

  useEffect(() => {
    setAudience(card.audience ?? '');
    setPriority(card.priority);
    setProcessLabel(card.processLabel ?? '');
    setSensitivity(card.sensitivity);
    setStatus(card.status);
    setTitle(card.title);
  }, [card]);

  const canStartSession = canStartSessionFromWorkCard(card.status);

  return (
    <article className="workspace-card flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          {isEditing ? (
            <input
              className="input-surface w-full min-w-[280px]"
              disabled={isPending}
              onChange={(event) => setTitle(event.target.value)}
              value={title}
            />
          ) : (
            <h3 className="font-headline text-xl font-bold text-[var(--color-text)]">
              {card.title}
            </h3>
          )}

          <div className="flex flex-wrap gap-2">
            <span className="badge badge-neutral">{card.status}</span>
            <span className="badge badge-accent">{card.priority}</span>
            <span className="badge badge-neutral">{card.sensitivity}</span>
            <span className="badge badge-neutral">연결 세션 {card.sessionCount}개</span>
            <span className="badge badge-neutral">작업 맥락 {card.intentCount}개</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {canStartSession ? (
            <Link className="btn-secondary" href={`/workspace/new?workCardId=${card.id}`}>
              이 카드로 세션 시작
            </Link>
          ) : (
            <span className="btn-secondary cursor-not-allowed opacity-50">
              {card.status === 'completed' ? '완료된 카드' : '보관된 카드'}
            </span>
          )}
          <button className="btn-secondary" onClick={onEdit} type="button">
            {isEditing ? '닫기' : '편집'}
          </button>
          {card.status !== 'archived' ? (
            <button
              className="btn-secondary"
              disabled={isPending}
              onClick={() => onArchive(card.id)}
              type="button"
            >
              보관
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-4">
          {isEditing ? (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                  대상 독자
                </label>
                <input
                  className="input-surface w-full"
                  disabled={isPending}
                  onChange={(event) => setAudience(event.target.value)}
                  value={audience}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                  프로세스 라벨
                </label>
                <input
                  className="input-surface w-full"
                  disabled={isPending}
                  onChange={(event) => setProcessLabel(event.target.value)}
                  value={processLabel}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                  우선순위
                </label>
                <select
                  className="input-surface w-full"
                  disabled={isPending}
                  onChange={(event) =>
                    setPriority(event.target.value as WorkCardListItem['priority'])
                  }
                  value={priority}
                >
                  <option value="high">high</option>
                  <option value="medium">medium</option>
                  <option value="low">low</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                  민감도
                </label>
                <select
                  className="input-surface w-full"
                  disabled={isPending}
                  onChange={(event) =>
                    setSensitivity(event.target.value as WorkCardListItem['sensitivity'])
                  }
                  value={sensitivity}
                >
                  <option value="general">general</option>
                  <option value="restricted">restricted</option>
                  <option value="confidential">confidential</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                  상태
                </label>
                <select
                  className="input-surface w-full"
                  disabled={isPending}
                  onChange={(event) => setStatus(event.target.value as WorkCardListItem['status'])}
                  value={status}
                >
                  <option value="active">active</option>
                  <option value="paused">paused</option>
                  <option value="completed">completed</option>
                  <option value="archived">archived</option>
                </select>
              </div>
              <div className="flex items-end justify-end">
                <button
                  className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isPending || title.trim().length === 0}
                  onClick={() =>
                    onSave(card.id, {
                      audience,
                      priority,
                      processLabel,
                      sensitivity,
                      status,
                      title,
                    })
                  }
                  type="button"
                >
                  {isPending ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="workspace-card-muted flex flex-col gap-2">
                <span className="meta">대상 독자</span>
                <p className="text-sm text-[var(--color-text)]">
                  {card.audience ?? '아직 지정되지 않았습니다.'}
                </p>
              </div>
              <div className="workspace-card-muted flex flex-col gap-2">
                <span className="meta">프로세스 라벨</span>
                <p className="text-sm text-[var(--color-text)]">
                  {card.processLabel ?? '아직 연결되지 않았습니다.'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="workspace-card-muted flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-headline text-base font-bold text-[var(--color-text)]">
                최근 연결 세션
              </h4>
              <span className="meta">업데이트 {formatDateTimeLabel(card.updatedAt)}</span>
            </div>
            {card.recentSessions.length > 0 ? (
              <div className="flex flex-col gap-2">
                {card.recentSessions.map((session) => (
                  <Link
                    className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-3 transition hover:border-[var(--color-accent)]"
                    href={`/workspace/session/${session.id}`}
                    key={session.id}
                  >
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      {session.title}
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                      {session.modeName} · {formatDateTimeLabel(session.updatedAt)}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                아직 연결된 세션이 없습니다. 이 카드로 새 세션을 시작해 보세요.
              </p>
            )}
          </div>

          <div className="workspace-card-muted flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-headline text-base font-bold text-[var(--color-text)]">
                최근 포착 맥락
              </h4>
              <span className="meta">{card.intentCount}개</span>
            </div>
            {card.recentIntents.length > 0 ? (
              <div className="flex flex-col gap-2">
                {card.recentIntents.map((intent) => (
                  <Link
                    className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-3 transition hover:border-[var(--color-accent)]"
                    href={`/workspace/session/${intent.sessionId}`}
                    key={intent.id}
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="badge badge-accent">{formatIntentType(intent.type)}</span>
                      <span className="badge badge-neutral">{intent.reviewStatus}</span>
                    </div>
                    <p className="text-sm leading-6 text-[var(--color-text)]">{intent.content}</p>
                    <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                      {intent.sessionTitle} · {formatDateTimeLabel(intent.createdAt)}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                아직 이 카드에 연결된 작업 맥락이 없습니다.
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export { WorkCardBoard };
export type { LinkedIntentPreview, LinkedSessionPreview, WorkCardBoardItem, WorkCardBoardProps };
