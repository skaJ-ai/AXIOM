'use client';

import useSWR from 'swr';

import type { ClaimWithSources } from '@/domains/synthesize/types';
import type { ClaimConfidence } from '@/lib/db/schema';
import { safeFetch } from '@/lib/utils';

interface SynthesizePanelProps {
  sessionId: string;
}

interface ClaimsResponse {
  data: {
    claims: ClaimWithSources[];
  };
}

const REFRESH_INTERVAL_MS = 5000;

const CONFIDENCE_BADGE_CLASS: Record<ClaimConfidence, string> = {
  high: 'badge-success',
  low: 'badge-neutral',
  medium: 'badge-warning',
};

const CONFIDENCE_LABEL: Record<ClaimConfidence, string> = {
  high: '높음',
  low: '낮음',
  medium: '중간',
};

async function fetchJson<T>(url: string): Promise<T> {
  const result = await safeFetch<T>(url);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
}

function SynthesizePanel({ sessionId }: SynthesizePanelProps) {
  const claimsResult = useSWR<ClaimsResponse>(`/api/sessions/${sessionId}/claims`, fetchJson, {
    refreshInterval: REFRESH_INTERVAL_MS,
  });

  const claims = claimsResult.data?.data.claims ?? [];
  const highConfidenceClaims = claims.filter((claim) => claim.confidence === 'high');
  const mediumConfidenceClaims = claims.filter((claim) => claim.confidence === 'medium');
  const lowConfidenceClaims = claims.filter((claim) => claim.confidence === 'low');

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 overflow-y-auto p-6">
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-lg font-bold text-[var(--color-text)]">
            추출된 클레임
          </h2>
          <span className="badge badge-mode-synthesize">{claims.length}개</span>
        </div>

        <div className="grid gap-2 md:grid-cols-3">
          <div className="workspace-card-muted px-3 py-2 text-center">
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">
              높음
            </p>
            <p className="text-lg font-bold text-[var(--color-success)]">
              {highConfidenceClaims.length}
            </p>
          </div>
          <div className="workspace-card-muted px-3 py-2 text-center">
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">
              중간
            </p>
            <p className="text-lg font-bold text-[var(--color-warning)]">
              {mediumConfidenceClaims.length}
            </p>
          </div>
          <div className="workspace-card-muted px-3 py-2 text-center">
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">
              낮음
            </p>
            <p className="text-lg font-bold text-[var(--color-text-secondary)]">
              {lowConfidenceClaims.length}
            </p>
          </div>
        </div>

        {claims.length === 0 ? (
          <div className="workspace-card-muted p-6 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              여러 자료를 투입한 뒤 AI와 대화하면 핵심 클레임이 자동으로 추출됩니다.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {claims.map((claim) => (
              <div className="workspace-card" key={claim.id}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="meta">신뢰도</span>
                  <span className={`badge ${CONFIDENCE_BADGE_CLASS[claim.confidence]}`}>
                    {CONFIDENCE_LABEL[claim.confidence]}
                  </span>
                </div>
                <p className="text-sm leading-6 text-[var(--color-text)]">{claim.content}</p>
                {claim.sources.length > 0 ? (
                  <p className="mt-3 text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">
                    근거 {claim.sources.length}개
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export { SynthesizePanel };
export type { SynthesizePanelProps };
