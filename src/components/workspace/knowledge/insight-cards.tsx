import type { Insight } from '@/domains/knowledge/types';
import type { ClaimConfidence, InsightCategory } from '@/lib/db/schema';

interface InsightCardsProps {
  insights: Insight[];
}

const INSIGHT_CATEGORY_LABEL: Record<InsightCategory, string> = {
  decision: '결정',
  lesson: '교훈',
  recommendation: '권고',
  risk: '리스크',
  trend: '트렌드',
};

const CONFIDENCE_BADGE_CLASS: Record<ClaimConfidence, string> = {
  high: 'badge-success',
  low: 'badge-neutral',
  medium: 'badge-warning',
};

function InsightCards({ insights }: InsightCardsProps) {
  if (insights.length === 0) {
    return (
      <div className="workspace-card-muted p-6 text-center">
        <p className="text-sm text-[var(--color-text-secondary)]">
          아직 추출된 인사이트가 없습니다. 보고서가 확정되면 시사점이 자동으로 정리됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {insights.map((insight) => (
        <div className="workspace-card" key={insight.id}>
          <div className="mb-2 flex items-center justify-between">
            <span className="badge badge-accent">{INSIGHT_CATEGORY_LABEL[insight.category]}</span>
            <span className={`badge ${CONFIDENCE_BADGE_CLASS[insight.confidence]}`}>
              {insight.confidence}
            </span>
          </div>
          <p className="text-sm leading-6 text-[var(--color-text)]">{insight.content}</p>
          <p className="mt-3 text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">
            {insight.createdAt.slice(0, 10)}
          </p>
        </div>
      ))}
    </div>
  );
}

export { InsightCards };
export type { InsightCardsProps };
