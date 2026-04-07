import type { Fact } from '@/domains/knowledge/types';
import type { FactCategory } from '@/lib/db/schema';

interface FactTimelineProps {
  facts: Fact[];
}

const FACT_CATEGORY_LABEL: Record<FactCategory, string> = {
  headcount: '인원',
  kpi: 'KPI',
  participation: '참여',
  progress: '진행',
  satisfaction: '만족도',
};

function FactTimeline({ facts }: FactTimelineProps) {
  if (facts.length === 0) {
    return (
      <div className="workspace-card-muted p-6 text-center">
        <p className="text-sm text-[var(--color-text-secondary)]">
          축적된 사실이 없습니다. 보고서가 확정되면 수치와 사실이 자동으로 정리됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {facts.map((fact) => (
        <div className="workspace-card" key={fact.id}>
          <div className="mb-2 flex items-center justify-between">
            <span className="badge badge-neutral">{FACT_CATEGORY_LABEL[fact.category]}</span>
            {fact.periodLabel ? (
              <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">
                {fact.periodLabel}
              </span>
            ) : null}
          </div>
          <p className="text-sm leading-6 text-[var(--color-text)]">{fact.content}</p>
          {fact.numericValue ? (
            <p className="mt-2 text-lg font-bold text-[var(--color-accent)]">
              {fact.numericValue}
              {fact.unit ? <span className="ml-1 text-sm">{fact.unit}</span> : null}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export { FactTimeline };
export type { FactTimelineProps };
