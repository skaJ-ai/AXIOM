'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';

import type { IntentReviewItem } from '@/domains/intents/types';
import { safeFetch } from '@/lib/utils';

type ReviewFilter = 'all' | 'approved' | 'captured' | 'nominated' | 'pending' | 'rejected';
type ReviewDecision = 'approve' | 'reject' | 'reset';

interface IntentReviewBoardProps {
  initialItems: IntentReviewItem[];
}

interface IntentReviewQueueResponse {
  data: {
    intents: IntentReviewItem[];
  };
}

function formatIntentType(type: IntentReviewItem['type']): string {
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

function formatReviewStatus(status: IntentReviewItem['reviewStatus']): string {
  switch (status) {
    case 'approved':
      return 'approved';
    case 'captured':
      return 'captured';
    case 'nominated':
      return 'nominated';
    case 'rejected':
      return 'rejected';
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
      promoted: true,
      reviewStatus: 'approved',
    };
  }

  if (decision === 'reject') {
    return {
      ...item,
      promoted: false,
      reviewStatus: 'rejected',
    };
  }

  return {
    ...item,
    promoted: false,
    reviewStatus: 'captured',
  };
}

function IntentReviewBoard({ initialItems }: IntentReviewBoardProps) {
  const [errorMessage, setErrorMessage] = useState('');
  const [filter, setFilter] = useState<ReviewFilter>('pending');
  const [items, setItems] = useState(initialItems);
  const [pendingIntentId, setPendingIntentId] = useState<string | null>(null);

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

    setItems(result.data.data.intents);
  };

  const handleNominate = async (item: IntentReviewItem) => {
    setPendingIntentId(item.id);
    setErrorMessage('');

    const result = await safeFetch<{ data: { nominated: boolean } }>(
      `/api/sessions/${item.sessionId}/intents/${item.id}/promote`,
      { method: 'POST' },
    );

    if (!result.success) {
      setPendingIntentId(null);
      setErrorMessage(result.error);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((currentItem) =>
        currentItem.id === item.id
          ? {
              ...currentItem,
              promoted: true,
              reviewStatus: 'nominated',
            }
          : currentItem,
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
        currentItem.id === item.id ? applyReviewDecision(currentItem, decision) : currentItem,
      ),
    );
    setPendingIntentId(null);
  };

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
              captured는 방금 포착된 후보, nominated는 검토 대상으로 올린 항목입니다.
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
              className={`workspace-card px-4 py-4 text-left transition ${
                filter === value
                  ? 'border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]'
                  : ''
              }`}
              key={value}
              onClick={() => setFilter(value)}
              type="button"
            >
              <p className="text-sm font-bold text-[var(--color-text)]">{label}</p>
            </button>
          ))}
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
          {visibleItems.map((item) => (
            <article className="workspace-card flex flex-col gap-4" key={item.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="badge badge-accent">{formatIntentType(item.type)}</span>
                    <span className="badge badge-neutral">
                      {formatReviewStatus(item.reviewStatus)}
                    </span>
                    <span className="badge badge-neutral">{item.confidence}</span>
                    {item.scope ? <span className="badge badge-neutral">{item.scope}</span> : null}
                  </div>
                  <p className="text-base leading-7 text-[var(--color-text)]">{item.content}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {item.reviewStatus === 'captured' ? (
                    <button
                      className="btn-secondary"
                      disabled={pendingIntentId === item.id}
                      onClick={() => void handleNominate(item)}
                      type="button"
                    >
                      검토 후보로 올리기
                    </button>
                  ) : null}
                  {item.reviewStatus !== 'approved' ? (
                    <button
                      className="btn-secondary"
                      disabled={pendingIntentId === item.id}
                      onClick={() => void handleReview(item, 'approve')}
                      type="button"
                    >
                      승인
                    </button>
                  ) : null}
                  {item.reviewStatus !== 'rejected' ? (
                    <button
                      className="btn-secondary"
                      disabled={pendingIntentId === item.id}
                      onClick={() => void handleReview(item, 'reject')}
                      type="button"
                    >
                      반려
                    </button>
                  ) : null}
                  {item.reviewStatus !== 'captured' ? (
                    <button
                      className="btn-secondary"
                      disabled={pendingIntentId === item.id}
                      onClick={() => void handleReview(item, 'reset')}
                      type="button"
                    >
                      captured로 되돌리기
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
          ))}
        </div>
      )}
    </div>
  );
}

export { IntentReviewBoard };
export type { IntentReviewBoardProps };
