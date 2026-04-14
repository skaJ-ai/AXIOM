'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';

import type { PromotedAssetConflictItem } from '@/domains/promoted-assets/conflict-types';
import { cn, safeFetch } from '@/lib/utils';

type ConflictFilter = 'all' | 'detected' | 'resolved';
type ConflictResolution = 'accept_both' | 'archive_a' | 'archive_b';

interface PromotedAssetConflictBoardProps {
  initialItems: PromotedAssetConflictItem[];
}

interface PromotedAssetConflictResponse {
  data: {
    conflicts: PromotedAssetConflictItem[];
  };
}

function formatConflictType(type: PromotedAssetConflictItem['conflictType']): string {
  switch (type) {
    case 'contradiction':
      return '모순 후보';
    case 'duplication':
      return '중복';
    case 'supersede':
      return '대체 후보';
    default:
      return type;
  }
}

function formatConflictStatus(status: PromotedAssetConflictItem['status']): string {
  switch (status) {
    case 'detected':
      return '미해결';
    case 'resolved':
      return '해결됨';
    default:
      return status;
  }
}

function formatConflictResolution(
  resolutionType: PromotedAssetConflictItem['resolutionType'],
): string {
  switch (resolutionType) {
    case 'accept_both':
      return '둘 다 유지';
    case 'archive_a':
      return 'A 보관';
    case 'archive_b':
      return 'B 보관';
    default:
      return '미결';
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

function PromotedAssetConflictBoard({ initialItems }: PromotedAssetConflictBoardProps) {
  const [errorMessage, setErrorMessage] = useState('');
  const [filter, setFilter] = useState<ConflictFilter>('detected');
  const [items, setItems] = useState(initialItems);
  const [pendingConflictId, setPendingConflictId] = useState<string | null>(null);

  const visibleItems = useMemo(() => {
    if (filter === 'all') {
      return items;
    }

    return items.filter((item) => item.status === filter);
  }, [filter, items]);
  const counts = useMemo(
    () => ({
      detected: items.filter((item) => item.status === 'detected').length,
      resolved: items.filter((item) => item.status === 'resolved').length,
      total: items.length,
    }),
    [items],
  );

  const handleRefresh = async () => {
    setErrorMessage('');
    const result = await safeFetch<PromotedAssetConflictResponse>('/api/promoted-assets/conflicts');

    if (!result.success) {
      setErrorMessage(result.error);
      return;
    }

    setItems(result.data.data.conflicts);
  };

  const handleResolve = async (conflictId: string, resolutionType: ConflictResolution) => {
    setPendingConflictId(conflictId);
    setErrorMessage('');

    const result = await safeFetch<{ data: { updated: boolean } }>(
      `/api/promoted-assets/conflicts/${conflictId}`,
      {
        body: JSON.stringify({
          resolutionType,
        }),
        headers: {
          'content-type': 'application/json',
        },
        method: 'PATCH',
      },
    );

    if (!result.success) {
      setPendingConflictId(null);
      setErrorMessage(result.error);
      return;
    }

    await handleRefresh();
    setPendingConflictId(null);
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
            <h2 className="font-headline text-xl font-bold text-[var(--color-text)]">충돌 상태</h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              같은 프로세스 자산 안에서 재사용 자산이 겹치거나, 서로 모순되거나, 최신 결론으로
              대체될 수 있는 항목을 비교합니다.
            </p>
          </div>
          <button className="btn-secondary" onClick={() => void handleRefresh()} type="button">
            새로고침
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {(
            [
              ['detected', `detected ${counts.detected}`],
              ['resolved', `resolved ${counts.resolved}`],
              ['all', `total ${counts.total}`],
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
      </section>

      {visibleItems.length === 0 ? (
        <div className="workspace-card-muted p-6 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            현재 필터에 맞는 충돌 항목이 없습니다.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {visibleItems.map((item) => {
            const isBusy = pendingConflictId === item.id;

            return (
              <article className="workspace-card flex flex-col gap-4" key={item.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-2">
                    <div className="flex flex-wrap gap-2">
                      <span className="badge badge-accent">
                        {formatConflictType(item.conflictType)}
                      </span>
                      <span className="badge badge-neutral">
                        {formatConflictStatus(item.status)}
                      </span>
                      <span className="badge badge-neutral">
                        {item.processAssetName ?? '프로세스 자산'}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      감지 시각 {formatDateTimeLabel(item.detectedAt)}
                      {item.status === 'resolved' && item.resolvedAt
                        ? ` · 해결 ${formatDateTimeLabel(item.resolvedAt)} · ${formatConflictResolution(item.resolutionType)}`
                        : ''}
                    </p>
                  </div>

                  {item.status === 'detected' ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="btn-secondary"
                        disabled={isBusy}
                        onClick={() => void handleResolve(item.id, 'archive_a')}
                        type="button"
                      >
                        A 보관
                      </button>
                      <button
                        className="btn-secondary"
                        disabled={isBusy}
                        onClick={() => void handleResolve(item.id, 'archive_b')}
                        type="button"
                      >
                        B 보관
                      </button>
                      <button
                        className="btn-secondary"
                        disabled={isBusy}
                        onClick={() => void handleResolve(item.id, 'accept_both')}
                        type="button"
                      >
                        둘 다 유지
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  {(
                    [
                      ['A', item.assetA],
                      ['B', item.assetB],
                    ] as const
                  ).map(([label, asset]) => (
                    <section
                      className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-sunken)] px-4 py-4"
                      key={asset.id}
                    >
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="badge badge-accent">{label}</span>
                        <span className="badge badge-neutral">{asset.type}</span>
                        <span className="badge badge-neutral">{asset.sourceSensitivity}</span>
                        {asset.scope ? (
                          <span className="badge badge-neutral">{asset.scope}</span>
                        ) : null}
                      </div>
                      <p className="text-sm leading-6 text-[var(--color-text)]">{asset.content}</p>
                      <div className="mt-4 grid gap-2 text-xs text-[var(--color-text-secondary)]">
                        <p>출처 카드: {asset.sourceWorkCardTitle ?? '연결 카드 없음'}</p>
                        <p>상태: {asset.status}</p>
                        <p>생성 시각: {formatDateTimeLabel(asset.createdAt)}</p>
                      </div>
                    </section>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--color-text-secondary)]">
                  <span>process asset id: {item.processAssetId}</span>
                  <Link
                    className="font-semibold text-[var(--color-accent)] hover:underline"
                    href="/workspace/review"
                  >
                    리뷰 큐로 이동
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { PromotedAssetConflictBoard };
export type { PromotedAssetConflictBoardProps };
