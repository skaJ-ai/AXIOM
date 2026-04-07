import type { ReactNode } from 'react';

interface DashboardKpiCardProps {
  detail?: ReactNode;
  label: string;
  trend?: ReactNode;
  value: ReactNode;
}

function DashboardKpiCard({ detail, label, trend, value }: DashboardKpiCardProps) {
  return (
    <div className="workspace-card flex flex-col gap-3">
      <span className="meta w-fit rounded border-[var(--color-border-strong)] bg-[var(--color-bg-sunken)] px-2 py-1">
        {label}
      </span>
      <div>
        <p className="text-2xl font-bold text-[var(--color-text)]">{value}</p>
        {detail ? (
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{detail}</p>
        ) : null}
      </div>
      {trend ? <div className="text-xs text-[var(--color-text-tertiary)]">{trend}</div> : null}
    </div>
  );
}

export { DashboardKpiCard };
export type { DashboardKpiCardProps };
