'use client';

import { useState } from 'react';

import useSWR from 'swr';

import type { Review } from '@/domains/validate/types';
import type { PersonaType } from '@/lib/db/schema';
import { safeFetch } from '@/lib/utils';

interface ValidatePanelProps {
  sessionId: string;
}

interface ReviewsResponse {
  data: {
    reviews: Review[];
  };
}

const REFRESH_INTERVAL_MS = 5000;

const PERSONA_FILTERS: { label: string; value: PersonaType | 'all' }[] = [
  { label: '전체', value: 'all' },
  { label: '임원', value: 'executive' },
  { label: '현업', value: 'field_worker' },
  { label: '비판자', value: 'critic' },
  { label: '노조', value: 'union' },
];

const SEVERITY_BADGE_CLASS: Record<string, string> = {
  high: 'badge-error',
  medium: 'badge-warning',
  low: 'badge-neutral',
};

const CATEGORY_LABELS: Record<string, string> = {
  assumption: '가정',
  evidence_gap: '근거 부족',
  feasibility: '실행 가능성',
  risk: '리스크',
};

async function fetchJson<T>(url: string): Promise<T> {
  const result = await safeFetch<T>(url);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
}

function ValidatePanel({ sessionId }: ValidatePanelProps) {
  const [activePersona, setActivePersona] = useState<PersonaType | 'all'>('all');
  const reviewsResult = useSWR<ReviewsResponse>(`/api/sessions/${sessionId}/reviews`, fetchJson, {
    refreshInterval: REFRESH_INTERVAL_MS,
  });

  const allReviews = reviewsResult.data?.data.reviews ?? [];
  const filteredReviews =
    activePersona === 'all'
      ? allReviews
      : allReviews.filter((review) => review.personaType === activePersona);

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 overflow-y-auto p-6">
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-lg font-bold text-[var(--color-text)]">
            페르소나 리뷰
          </h2>
          <span className="badge badge-mode-validate">{filteredReviews.length}개</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {PERSONA_FILTERS.map((filter) => (
            <button
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                activePersona === filter.value
                  ? 'bg-[var(--color-mode-validate)] text-white'
                  : 'border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-mode-validate)]'
              }`}
              key={filter.value}
              onClick={() => setActivePersona(filter.value)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>

        {filteredReviews.length === 0 ? (
          <div className="workspace-card-muted p-6 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              AI와 대화하면 다양한 관점의 리뷰가 자동으로 누적됩니다.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredReviews.map((review) => {
              const severityClass = SEVERITY_BADGE_CLASS[review.severity] ?? 'badge-neutral';
              const categoryLabel = CATEGORY_LABELS[review.category] ?? review.category;

              return (
                <div className="workspace-card" key={review.id}>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="meta">{review.personaName}</span>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-neutral">{categoryLabel}</span>
                      <span className={`badge ${severityClass}`}>{review.severity}</span>
                    </div>
                  </div>
                  <p className="mb-2 text-sm leading-6 text-[var(--color-text)]">
                    {review.content}
                  </p>
                  {review.suggestion ? (
                    <p className="mt-3 rounded border-l-2 border-[var(--color-mode-validate)] bg-[var(--color-bg-sunken)] px-3 py-2 text-xs leading-5 text-[var(--color-text-secondary)]">
                      <span className="font-bold text-[var(--color-mode-validate)]">제안: </span>
                      {review.suggestion}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export { ValidatePanel };
export type { ValidatePanelProps };
