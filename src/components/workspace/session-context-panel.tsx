'use client';

import Link from 'next/link';

import useSWR from 'swr';

import type { IntentFragment } from '@/domains/intents/types';
import { formatPromotedAssetBucketScope } from '@/domains/promoted-assets/bucket-scope';
import { formatPromotedAssetMaturity } from '@/domains/promoted-assets/maturity';
import type { PromotedAssetSummary } from '@/domains/promoted-assets/types';
import { formatWorkCardStatus } from '@/domains/work-cards/state';
import type { WorkCardSummary } from '@/domains/work-cards/types';
import { safeFetch } from '@/lib/utils';

interface SessionContextPanelProps {
  initialIntents: IntentFragment[];
  initialPromotedAssets: PromotedAssetSummary[];
  sessionId: string;
  workCard: WorkCardSummary | null;
}

interface SessionIntentsResponse {
  data: {
    intents: IntentFragment[];
  };
}

async function fetchSessionIntents(url: string): Promise<IntentFragment[]> {
  const result = await safeFetch<SessionIntentsResponse>(url);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data.data.intents;
}

function formatIntentType(type: IntentFragment['type']): string {
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

function formatIntentReviewStatus(status: IntentFragment['reviewStatus']): string {
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

function SessionContextPanel({
  initialIntents,
  initialPromotedAssets,
  sessionId,
  workCard,
}: SessionContextPanelProps) {
  const { data: intents = initialIntents } = useSWR(
    `/api/sessions/${sessionId}/intents`,
    fetchSessionIntents,
    {
      fallbackData: initialIntents,
      refreshInterval: 5000,
    },
  );

  if (!workCard && intents.length === 0 && initialPromotedAssets.length === 0) {
    return null;
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_minmax(0,1fr)]">
      <div className="workspace-card flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-headline text-lg font-bold text-[var(--color-text)]">업무 카드</h2>
          <span className="badge badge-neutral">
            {workCard ? formatWorkCardStatus(workCard.status) : '미연결'}
          </span>
        </div>
        {workCard ? (
          <>
            <p className="text-sm font-semibold text-[var(--color-text)]">{workCard.title}</p>
            <div className="flex flex-wrap gap-2 text-xs text-[var(--color-text-secondary)]">
              {workCard.audience ? (
                <span className="badge badge-neutral">{workCard.audience}</span>
              ) : null}
              {workCard.processLabel ? (
                <span className="badge badge-neutral">{workCard.processLabel}</span>
              ) : null}
              {workCard.processAsset?.domainLabel ? (
                <span className="badge badge-neutral">{workCard.processAsset.domainLabel}</span>
              ) : null}
              <span className="badge badge-accent">{workCard.priority}</span>
              <span className="badge badge-neutral">{workCard.sensitivity}</span>
            </div>
            {workCard.processAsset ? (
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-sunken)] px-4 py-3">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="badge badge-accent">{workCard.processAsset.name}</span>
                  {workCard.processAsset.domainLabel ? (
                    <span className="badge badge-neutral">{workCard.processAsset.domainLabel}</span>
                  ) : null}
                </div>
                <p className="text-xs leading-5 text-[var(--color-text-secondary)]">
                  {workCard.processAsset.description ??
                    '이 카드는 현재 프로세스 자산과 연결되어 있습니다.'}
                </p>
              </div>
            ) : null}
          </>
        ) : (
          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
            아직 연결된 업무 카드가 없습니다. 새 세션 생성 시 카드 제목과 대상 독자를 함께
            입력하면 작업 맥락을 고정할 수 있습니다.
          </p>
        )}
      </div>

      <div className="workspace-card flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-headline text-lg font-bold text-[var(--color-text)]">
              현재 작업 맥락
            </h2>
            <span className="badge badge-neutral">{intents.length}</span>
          </div>
          <Link
            className="text-xs font-semibold text-[var(--color-accent)] hover:underline"
            href="/workspace/review"
          >
            검토 큐 보기
          </Link>
        </div>
        {intents.length > 0 ? (
          <div className="grid gap-2 md:grid-cols-2">
            {intents.slice(0, 8).map((intent) => (
              <div
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-sunken)] px-4 py-3"
                key={intent.id}
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="badge badge-accent">{formatIntentType(intent.type)}</span>
                  <span className="badge badge-neutral">
                    {formatIntentReviewStatus(intent.reviewStatus)}
                  </span>
                  {intent.scope ? <span className="meta">{intent.scope}</span> : null}
                </div>
                <p className="text-sm leading-6 text-[var(--color-text)]">{intent.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
            대화 중에 판단 기준, 예외, 대상 독자 같은 표현이 나오면 여기에 작업 맥락으로
            표시됩니다.
          </p>
        )}
      </div>

      {workCard?.processAsset ? (
        <div className="workspace-card flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="font-headline text-lg font-bold text-[var(--color-text)]">
                프로세스 재사용 자산
              </h2>
              <span className="badge badge-neutral">{initialPromotedAssets.length}</span>
            </div>
            <span className="badge badge-accent">{workCard.processAsset.name}</span>
          </div>
          {initialPromotedAssets.length > 0 ? (
            <div className="grid gap-2">
              {initialPromotedAssets.slice(0, 4).map((asset) => (
                <div
                  className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-sunken)] px-4 py-3"
                  key={asset.id}
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="badge badge-accent">{formatIntentType(asset.type)}</span>
                    <span className="badge badge-neutral">
                      {formatPromotedAssetMaturity(asset.maturity)}
                    </span>
                    {asset.sourceWorkCardTitle ? (
                      <span className="badge badge-neutral">{asset.sourceWorkCardTitle}</span>
                    ) : null}
                    <span className="badge badge-neutral">
                      {formatPromotedAssetBucketScope(asset.bucketScope)}
                    </span>
                    {asset.scope ? <span className="meta">{asset.scope}</span> : null}
                  </div>
                  <p className="text-sm leading-6 text-[var(--color-text)]">{asset.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
              아직 같은 프로세스 자산에서 재사용 가능한 승격 자산이 없습니다.
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}

export { SessionContextPanel };
export type { SessionContextPanelProps };
