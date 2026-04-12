'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';

import type { IntentReviewItem } from '@/domains/intents/types';
import { cn, safeFetch } from '@/lib/utils';

type ReviewFilter = 'all' | 'approved' | 'captured' | 'nominated' | 'pending' | 'rejected';
type ReviewDecision = 'approve' | 'reject' | 'reset';
type BatchReviewAction = ReviewDecision | 'nominate';

interface IntentReviewBoardProps {
  initialItems: IntentReviewItem[];
}

interface IntentReviewQueueResponse {
  data: {
    intents: IntentReviewItem[];
  };
}

interface IntentReviewBatchResponse {
  data: {
    updatedIds: string[];
  };
}

function formatIntentType(type: IntentReviewItem['type']): string {
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

function formatReviewStatus(status: IntentReviewItem['reviewStatus']): string {
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

function applyReviewDecision(item: IntentReviewItem, decision: ReviewDecision): IntentReviewItem {
  if (decision === 'approve') {
    return {
      ...item,
      reviewStatus: 'approved',
    };
  }

  if (decision === 'reject') {
    return {
      ...item,
      reviewStatus: 'rejected',
    };
  }

  return {
    ...item,
    reviewStatus: 'captured',
  };
}

function applyIntentAction(item: IntentReviewItem, action: BatchReviewAction): IntentReviewItem {
  if (action === 'nominate') {
    return {
      ...item,
      reviewStatus: 'nominated',
    };
  }

  return applyReviewDecision(item, action);
}

function IntentReviewBoard({ initialItems }: IntentReviewBoardProps) {
  const [errorMessage, setErrorMessage] = useState('');
  const [filter, setFilter] = useState<ReviewFilter>('pending');
  const [items, setItems] = useState(initialItems);
  const [pendingBatchAction, setPendingBatchAction] = useState<BatchReviewAction | null>(null);
  const [pendingIntentId, setPendingIntentId] = useState<string | null>(null);
  const [selectedIntentIds, setSelectedIntentIds] = useState<string[]>([]);

  const visibleItems = useMemo(() => {
    if (filter === 'all') {
      return items;
    }

    if (filter === 'pending') {
      return items.filter(
        (item) => item.reviewStatus === 'captured' || item.reviewStatus === 'nominated',
      );
    }

    return items.filter((item) => item.reviewStatus === filter);
  }, [filter, items]);

  const selectedIntentIdSet = useMemo(() => new Set(selectedIntentIds), [selectedIntentIds]);
  const selectedItems = useMemo(
    () => items.filter((item) => selectedIntentIdSet.has(item.id)),
    [items, selectedIntentIdSet],
  );
  const selectedVisibleCount = useMemo(
    () => visibleItems.filter((item) => selectedIntentIdSet.has(item.id)).length,
    [selectedIntentIdSet, visibleItems],
  );
  const selectedCapturedIds = useMemo(
    () => selectedItems.filter((item) => item.reviewStatus === 'captured').map((item) => item.id),
    [selectedItems],
  );
  const selectedNominatedIds = useMemo(
    () => selectedItems.filter((item) => item.reviewStatus === 'nominated').map((item) => item.id),
    [selectedItems],
  );
  const selectedResetIds = useMemo(
    () => selectedItems.filter((item) => item.reviewStatus !== 'captured').map((item) => item.id),
    [selectedItems],
  );

  const counts = useMemo(
    () => ({
      approved: items.filter((item) => item.reviewStatus === 'approved').length,
      captured: items.filter((item) => item.reviewStatus === 'captured').length,
      nominated: items.filter((item) => item.reviewStatus === 'nominated').length,
      pending: items.filter(
        (item) => item.reviewStatus === 'captured' || item.reviewStatus === 'nominated',
      ).length,
      rejected: items.filter((item) => item.reviewStatus === 'rejected').length,
      total: items.length,
    }),
    [items],
  );

  const handleRefresh = async () => {
    setErrorMessage('');
    const result = await safeFetch<IntentReviewQueueResponse>('/api/intents/review');

    if (!result.success) {
      setErrorMessage(result.error);
      return;
    }

    const nextItems = result.data.data.intents;
    const nextItemIdSet = new Set(nextItems.map((item) => item.id));

    setItems(nextItems);
    setSelectedIntentIds((currentIds) => currentIds.filter((id) => nextItemIdSet.has(id)));
  };

  const handleNominate = async (item: IntentReviewItem) => {
    setPendingIntentId(item.id);
    setErrorMessage('');

    const result = await safeFetch<{ data: { nominated: boolean } }>(
      `/api/sessions/${item.sessionId}/intents/${item.id}/nominate`,
      { method: 'POST' },
    );

    if (!result.success) {
      setPendingIntentId(null);
      setErrorMessage(result.error);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((currentItem) =>
        currentItem.id === item.id ? applyIntentAction(currentItem, 'nominate') : currentItem,
      ),
    );
    setPendingIntentId(null);
  };

  const handleReview = async (item: IntentReviewItem, decision: ReviewDecision) => {
    setPendingIntentId(item.id);
    setErrorMessage('');

    const result = await safeFetch<{ data: { updated: boolean } }>(
      `/api/sessions/${item.sessionId}/intents/${item.id}/review`,
      {
        body: JSON.stringify({ decision }),
        headers: {
          'content-type': 'application/json',
        },
        method: 'PATCH',
      },
    );

    if (!result.success) {
      setPendingIntentId(null);
      setErrorMessage(result.error);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((currentItem) =>
        currentItem.id === item.id ? applyIntentAction(currentItem, decision) : currentItem,
      ),
    );
    setPendingIntentId(null);
  };

  const handleBatchAction = async (action: BatchReviewAction, intentIds: string[]) => {
    const uniqueIntentIds = Array.from(new Set(intentIds));

    if (uniqueIntentIds.length === 0) {
      return;
    }

    setPendingBatchAction(action);
    setErrorMessage('');

    const result = await safeFetch<IntentReviewBatchResponse>('/api/intents/review', {
      body: JSON.stringify({
        action,
        intentIds: uniqueIntentIds,
      }),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    });

    if (!result.success) {
      setPendingBatchAction(null);
      setErrorMessage(result.error);
      return;
    }

    const updatedIdSet = new Set(result.data.data.updatedIds);

    if (updatedIdSet.size === 0) {
      setPendingBatchAction(null);
      setErrorMessage('업데이트된 검토 항목이 없습니다.');
      return;
    }

    setItems((currentItems) =>
      currentItems.map((currentItem) =>
        updatedIdSet.has(currentItem.id) ? applyIntentAction(currentItem, action) : currentItem,
      ),
    );
    setSelectedIntentIds((currentIds) => currentIds.filter((id) => !updatedIdSet.has(id)));
    setPendingBatchAction(null);
  };

  const toggleIntentSelection = (intentId: string) => {
    setSelectedIntentIds((currentIds) =>
      currentIds.includes(intentId)
        ? currentIds.filter((id) => id !== intentId)
        : [...currentIds, intentId],
    );
  };

  const toggleVisibleSelection = () => {
    const visibleIds = visibleItems.map((item) => item.id);

    if (visibleIds.length === 0) {
      return;
    }

    const isAllVisibleSelected = visibleIds.every((id) => selectedIntentIdSet.has(id));

    setSelectedIntentIds((currentIds) => {
      if (isAllVisibleSelected) {
        return currentIds.filter((id) => !visibleIds.includes(id));
      }

      return Array.from(new Set([...currentIds, ...visibleIds]));
    });
  };

  const clearSelection = () => {
    setSelectedIntentIds([]);
  };

  const isBusy = pendingBatchAction !== null || pendingIntentId !== null;

  return (
    <div className="flex flex-col gap-6">
      {errorMessage.length > 0 ? (
        <div className="border-[var(--color-error)]/20 rounded-[var(--radius-md)] border bg-[var(--color-error-light)] px-4 py-3 text-sm text-[var(--color-error)]">
          {errorMessage}
        </div>
      ) : null}

      <section className="workspace-card-muted flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-headline text-xl font-bold text-[var(--color-text)]">검토 상태</h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              포착된 작업 맥락을 바로 쓰지 않고, 검토 후보와 승인 단계로 나눠 관리합니다.
            </p>
          </div>
          <button className="btn-secondary" onClick={() => void handleRefresh()} type="button">
            새로고침
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-5">
          {(
            [
              ['pending', `pending ${counts.pending}`],
              ['captured', `captured ${counts.captured}`],
              ['nominated', `nominated ${counts.nominated}`],
              ['approved', `approved ${counts.approved}`],
              ['rejected', `rejected ${counts.rejected}`],
            ] as const
          ).map(([value, label]) => (
            <button
              className={cn(
                'workspace-card px-4 py-4 text-left transition',
                filter === value
                  ? 'border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]'
                  : '',
              )}
              key={value}
              onClick={() => setFilter(value)}
              type="button"
            >
              <p className="text-sm font-bold text-[var(--color-text)]">{label}</p>
            </button>
          ))}
        </div>

        <div className="workspace-card flex flex-col gap-3 px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-[var(--color-text-secondary)]">
              선택 {selectedIntentIds.length}건
              {visibleItems.length > 0 ? ` / 현재 목록 ${selectedVisibleCount}건` : ''}
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn-secondary" onClick={toggleVisibleSelection} type="button">
                {selectedVisibleCount === visibleItems.length && visibleItems.length > 0
                  ? '현재 목록 선택 해제'
                  : '현재 목록 선택'}
              </button>
              <button className="btn-secondary" onClick={clearSelection} type="button">
                선택 해제
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              className="btn-secondary"
              disabled={isBusy || selectedCapturedIds.length === 0}
              onClick={() => void handleBatchAction('nominate', selectedCapturedIds)}
              type="button"
            >
              선택 후보 올리기{' '}
              {selectedCapturedIds.length > 0 ? `(${selectedCapturedIds.length})` : ''}
            </button>
            <button
              className="btn-secondary"
              disabled={isBusy || selectedNominatedIds.length === 0}
              onClick={() => void handleBatchAction('approve', selectedNominatedIds)}
              type="button"
            >
              선택 승인 {selectedNominatedIds.length > 0 ? `(${selectedNominatedIds.length})` : ''}
            </button>
            <button
              className="btn-secondary"
              disabled={isBusy || selectedNominatedIds.length === 0}
              onClick={() => void handleBatchAction('reject', selectedNominatedIds)}
              type="button"
            >
              선택 반려 {selectedNominatedIds.length > 0 ? `(${selectedNominatedIds.length})` : ''}
            </button>
            <button
              className="btn-secondary"
              disabled={isBusy || selectedResetIds.length === 0}
              onClick={() => void handleBatchAction('reset', selectedResetIds)}
              type="button"
            >
              선택 초기화 {selectedResetIds.length > 0 ? `(${selectedResetIds.length})` : ''}
            </button>
          </div>
        </div>
      </section>

      {visibleItems.length === 0 ? (
        <div className="workspace-card-muted p-6 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            현재 필터에 맞는 검토 후보가 없습니다.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {visibleItems.map((item) => {
            const isSelected = selectedIntentIdSet.has(item.id);
            const isPending = isBusy || pendingIntentId === item.id;

            return (
              <article
                className={cn(
                  'workspace-card flex flex-col gap-4',
                  isSelected
                    ? 'border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]'
                    : '',
                )}
                key={item.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 gap-3">
                    <label className="mt-1 flex items-center">
                      <input
                        checked={isSelected}
                        className="h-4 w-4 rounded border-[var(--color-border-strong)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                        onChange={() => toggleIntentSelection(item.id)}
                        type="checkbox"
                      />
                    </label>

                    <div className="flex min-w-0 flex-col gap-2">
                      <div className="flex flex-wrap gap-2">
                        <span className="badge badge-accent">{formatIntentType(item.type)}</span>
                        <span className="badge badge-neutral">
                          {formatReviewStatus(item.reviewStatus)}
                        </span>
                        <span className="badge badge-neutral">{item.confidence}</span>
                        {item.scope ? (
                          <span className="badge badge-neutral">{item.scope}</span>
                        ) : null}
                      </div>
                      <p className="text-base leading-7 text-[var(--color-text)]">{item.content}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {item.reviewStatus === 'captured' ? (
                      <button
                        className="btn-secondary"
                        disabled={isPending}
                        onClick={() => void handleNominate(item)}
                        type="button"
                      >
                        검토 후보로 올리기
                      </button>
                    ) : null}
                    {item.reviewStatus === 'nominated' ? (
                      <button
                        className="btn-secondary"
                        disabled={isPending}
                        onClick={() => void handleReview(item, 'approve')}
                        type="button"
                      >
                        승인
                      </button>
                    ) : null}
                    {item.reviewStatus === 'nominated' ? (
                      <button
                        className="btn-secondary"
                        disabled={isPending}
                        onClick={() => void handleReview(item, 'reject')}
                        type="button"
                      >
                        반려
                      </button>
                    ) : null}
                    {item.reviewStatus !== 'captured' ? (
                      <button
                        className="btn-secondary"
                        disabled={isPending}
                        onClick={() => void handleReview(item, 'reset')}
                        type="button"
                      >
                        초기화
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="workspace-card-muted flex flex-col gap-2">
                      <span className="meta">연결 세션</span>
                      <Link
                        className="text-sm font-semibold text-[var(--color-accent)] hover:underline"
                        href={`/workspace/session/${item.sessionId}`}
                      >
                        {item.sessionTitle}
                      </Link>
                    </div>
                    <div className="workspace-card-muted flex flex-col gap-2">
                      <span className="meta">업무 카드</span>
                      {item.workCardId ? (
                        <Link
                          className="text-sm font-semibold text-[var(--color-accent)] hover:underline"
                          href={`/workspace/new?workCardId=${item.workCardId}`}
                        >
                          {item.workCardTitle ?? '연결된 카드'}
                        </Link>
                      ) : (
                        <p className="text-sm text-[var(--color-text-secondary)]">미연결</p>
                      )}
                    </div>
                  </div>

                  <div className="workspace-card-muted flex flex-col gap-2">
                    <span className="meta">포착 시각</span>
                    <p className="text-sm text-[var(--color-text)]">
                      {formatDateTimeLabel(item.createdAt)}
                    </p>
                    <span className="meta">화자</span>
                    <p className="text-sm text-[var(--color-text)]">{item.speaker ?? 'user'}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { IntentReviewBoard };
export type { IntentReviewBoardProps };
