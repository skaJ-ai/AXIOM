'use client';

import { useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import type { ProcessAssetSummary } from '@/domains/process-assets/types';
import {
  canRestoreWorkCard,
  canStartSessionFromWorkCard,
  formatWorkCardStatus,
  getAllowedGenericWorkCardStatuses,
} from '@/domains/work-cards/state';
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
  initialProcessAssets: ProcessAssetSummary[];
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

interface ProcessAssetResponse {
  data: {
    processAsset: ProcessAssetSummary;
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

function formatIntentType(type: IntentType): string {
  switch (type) {
    case 'audience':
      return '대상 독자';
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

function formatIntentReviewStatus(status: IntentReviewStatus): string {
  switch (status) {
    case 'approved':
      return '승인됨';
    case 'captured':
      return '포착됨';
    case 'nominated':
      return '검토 후보';
    case 'rejected':
      return '반려됨';
    default:
      return status;
  }
}

function upsertProcessAssetSummaries(
  items: ProcessAssetSummary[],
  nextItem: ProcessAssetSummary,
): ProcessAssetSummary[] {
  return [...items.filter((item) => item.id !== nextItem.id), nextItem].sort((left, right) =>
    left.name.localeCompare(right.name, 'ko-KR'),
  );
}

function WorkCardBoard({ initialCards, initialProcessAssets }: WorkCardBoardProps) {
  const [cards, setCards] = useState(initialCards);
  const [createAudience, setCreateAudience] = useState('');
  const [createProcessAssetDescription, setCreateProcessAssetDescription] = useState('');
  const [createProcessAssetDomainLabel, setCreateProcessAssetDomainLabel] = useState('');
  const [createProcessAssetId, setCreateProcessAssetId] = useState('');
  const [createProcessAssetName, setCreateProcessAssetName] = useState('');
  const [createProcessLabel, setCreateProcessLabel] = useState('');
  const [createTitle, setCreateTitle] = useState('');
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [filter, setFilter] = useState<WorkCardFilter>('active');
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingProcessAsset, setIsCreatingProcessAsset] = useState(false);
  const [pendingCardId, setPendingCardId] = useState<string | null>(null);
  const [processAssets, setProcessAssets] = useState(initialProcessAssets);

  const selectedCreateProcessAsset = useMemo(
    () => processAssets.find((asset) => asset.id === createProcessAssetId) ?? null,
    [createProcessAssetId, processAssets],
  );

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
        processAssetId: createProcessAssetId || undefined,
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
    setCreateProcessAssetId('');
    setCreateProcessLabel('');
    setCreateTitle('');
    setIsCreating(false);
  };

  const handleCreateProcessAsset = async () => {
    setIsCreatingProcessAsset(true);
    setErrorMessage('');

    const result = await safeFetch<ProcessAssetResponse>('/api/process-assets', {
      body: JSON.stringify({
        description: createProcessAssetDescription.trim() || undefined,
        domainLabel: createProcessAssetDomainLabel.trim() || undefined,
        name: createProcessAssetName.trim(),
      }),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    });

    if (!result.success) {
      setIsCreatingProcessAsset(false);
      setErrorMessage(result.error);
      return;
    }

    const createdAsset = result.data.data.processAsset;
    setProcessAssets((previousItems) => upsertProcessAssetSummaries(previousItems, createdAsset));
    setCreateProcessAssetId(createdAsset.id);
    setCreateProcessAssetDescription('');
    setCreateProcessAssetDomainLabel('');
    setCreateProcessAssetName('');
    setIsCreatingProcessAsset(false);
  };

  const handleSave = async (
    cardId: string,
    nextValues: {
      audience: string;
      priority: WorkCardListItem['priority'];
      processAssetId: string | null;
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

  const handleRestore = async (cardId: string) => {
    setPendingCardId(cardId);
    setErrorMessage('');

    const result = await safeFetch<WorkCardResponse>(`/api/work-cards/${cardId}/restore`, {
      method: 'POST',
    });

    if (!result.success) {
      setPendingCardId(null);
      setErrorMessage(result.error);
      return;
    }

    const restoredCard = result.data.data.workCard;

    if (restoredCard) {
      setCards((previousCards) =>
        previousCards.map((card) =>
          card.id === cardId
            ? {
                ...restoredCard,
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
              카드는 세션과 승인된 맥락을 묶는 기본 단위입니다. 먼저 제목만 만들어도 됩니다.
            </p>
          </div>
          <Link className="btn-secondary" href="/workspace/new">
            카드 없이 세션 시작
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
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
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          <select
            className="input-surface w-full"
            onChange={(event) => setCreateProcessAssetId(event.target.value)}
            value={createProcessAssetId}
          >
            <option value="">프로세스 자산 없이 자유 라벨 입력</option>
            {processAssets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name}
                {asset.domainLabel ? ` (${asset.domainLabel})` : ''}
              </option>
            ))}
          </select>
          <input
            className="input-surface w-full"
            disabled={createProcessAssetId.length > 0}
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

        {selectedCreateProcessAsset ? (
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-sunken)] px-4 py-3">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="badge badge-accent">{selectedCreateProcessAsset.name}</span>
              {selectedCreateProcessAsset.domainLabel ? (
                <span className="badge badge-neutral">
                  {selectedCreateProcessAsset.domainLabel}
                </span>
              ) : null}
            </div>
            <p className="text-xs leading-5 text-[var(--color-text-secondary)]">
              프로세스 자산을 고르면 카드의 프로세스 라벨은 자산 이름으로 고정됩니다.
            </p>
            {selectedCreateProcessAsset.description ? (
              <p className="mt-2 text-xs leading-5 text-[var(--color-text-secondary)]">
                {selectedCreateProcessAsset.description}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="workspace-card-muted flex flex-col gap-4">
        <div>
          <h2 className="font-headline text-xl font-bold text-[var(--color-text)]">
            프로세스 자산 만들기
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            자주 반복되는 표준 흐름을 가벼운 참조 객체로 등록해 업무 카드에 연결합니다.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <input
            className="input-surface w-full"
            onChange={(event) => setCreateProcessAssetName(event.target.value)}
            placeholder="프로세스 자산 이름"
            value={createProcessAssetName}
          />
          <input
            className="input-surface w-full"
            onChange={(event) => setCreateProcessAssetDomainLabel(event.target.value)}
            placeholder="도메인 라벨"
            value={createProcessAssetDomainLabel}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <input
            className="input-surface w-full"
            onChange={(event) => setCreateProcessAssetDescription(event.target.value)}
            placeholder="프로세스 설명"
            value={createProcessAssetDescription}
          />
          <button
            className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isCreatingProcessAsset || createProcessAssetName.trim().length === 0}
            onClick={() => void handleCreateProcessAsset()}
            type="button"
          >
            {isCreatingProcessAsset ? '생성 중...' : '자산 생성'}
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
              카드별로 세션과 승인된 맥락을 함께 관리합니다.
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
                onRestore={handleRestore}
                onSave={handleSave}
                processAssets={processAssets}
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
  onRestore,
  onSave,
  processAssets,
}: {
  card: WorkCardBoardItem;
  isEditing: boolean;
  isPending: boolean;
  onArchive: (cardId: string) => void;
  onEdit: () => void;
  onRestore: (cardId: string) => void;
  onSave: (
    cardId: string,
    nextValues: {
      audience: string;
      priority: WorkCardListItem['priority'];
      processAssetId: string | null;
      processLabel: string;
      sensitivity: WorkCardListItem['sensitivity'];
      status: WorkCardListItem['status'];
      title: string;
    },
  ) => void;
  processAssets: ProcessAssetSummary[];
}) {
  const [audience, setAudience] = useState(card.audience ?? '');
  const [priority, setPriority] = useState<WorkCardListItem['priority']>(card.priority);
  const [processAssetId, setProcessAssetId] = useState(card.processAsset?.id ?? '');
  const [processLabel, setProcessLabel] = useState(card.processLabel ?? '');
  const [sensitivity, setSensitivity] = useState<WorkCardListItem['sensitivity']>(card.sensitivity);
  const [status, setStatus] = useState<WorkCardListItem['status']>(card.status);
  const [title, setTitle] = useState(card.title);

  useEffect(() => {
    setAudience(card.audience ?? '');
    setPriority(card.priority);
    setProcessAssetId(card.processAsset?.id ?? '');
    setProcessLabel(card.processLabel ?? '');
    setSensitivity(card.sensitivity);
    setStatus(card.status);
    setTitle(card.title);
  }, [card]);

  const canStartSession = canStartSessionFromWorkCard(card.status);
  const allowedStatuses = getAllowedGenericWorkCardStatuses(card.status);
  const canRestore = canRestoreWorkCard(card.status);

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
            <span className="badge badge-neutral">{formatWorkCardStatus(card.status)}</span>
            <span className="badge badge-accent">{card.priority}</span>
            <span className="badge badge-neutral">{card.sensitivity}</span>
            <span className="badge badge-neutral">연결 세션 {card.sessionCount}개</span>
            <span className="badge badge-neutral">승인된 맥락 {card.intentCount}개</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {canStartSession ? (
            <Link className="btn-secondary" href={`/workspace/new?workCardId=${card.id}`}>
              이 카드로 세션 시작
            </Link>
          ) : (
            <span className="btn-secondary cursor-not-allowed opacity-50">
              {card.status === 'completed' ? '완료된 카드' : '세션 연결 불가'}
            </span>
          )}
          <button className="btn-secondary" onClick={onEdit} type="button">
            {isEditing ? '닫기' : '편집'}
          </button>
          {canRestore ? (
            <button
              className="btn-secondary"
              disabled={isPending}
              onClick={() => onRestore(card.id)}
              type="button"
            >
              복원
            </button>
          ) : null}
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
                  프로세스 자산
                </label>
                <select
                  className="input-surface w-full"
                  disabled={isPending}
                  onChange={(event) => setProcessAssetId(event.target.value)}
                  value={processAssetId}
                >
                  <option value="">자산 없이 자유 라벨 사용</option>
                  {processAssets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name}
                      {asset.domainLabel ? ` (${asset.domainLabel})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                  프로세스 라벨
                </label>
                <input
                  className="input-surface w-full"
                  disabled={isPending || processAssetId.length > 0}
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
                  {allowedStatuses.map((statusOption) => (
                    <option key={statusOption} value={statusOption}>
                      {formatWorkCardStatus(statusOption)}
                    </option>
                  ))}
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
                      processAssetId: processAssetId || null,
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
                <span className="meta">연결 프로세스</span>
                {card.processAsset ? (
                  <>
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      {card.processAsset.name}
                    </p>
                    {card.processAsset.domainLabel ? (
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {card.processAsset.domainLabel}
                      </p>
                    ) : null}
                    {card.processAsset.description ? (
                      <p className="text-xs leading-5 text-[var(--color-text-secondary)]">
                        {card.processAsset.description}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <p className="text-sm text-[var(--color-text)]">
                    {card.processLabel ?? '아직 연결되지 않았습니다.'}
                  </p>
                )}
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
                최근 승인된 맥락
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
                      <span className="badge badge-neutral">
                        {formatIntentReviewStatus(intent.reviewStatus)}
                      </span>
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
                아직 이 카드에 연결된 승인 맥락이 없습니다.
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
