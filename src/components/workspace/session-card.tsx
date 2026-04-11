import Link from 'next/link';

import { ModeBadge } from '@/components/workspace/mode-badge';
import type { SessionSummary } from '@/lib/sessions/types';

interface SessionCardProps {
  session: SessionSummary;
}

function SessionCard({ session }: SessionCardProps) {
  return (
    <Link
      className="workspace-card group flex flex-col gap-3 transition hover:-translate-y-0.5 hover:border-[var(--color-accent)]"
      href={`/workspace/session/${session.id}`}
    >
      <div className="flex items-center justify-between">
        <ModeBadge label={session.modeSummary.name} mode={session.mode} />
        <span className="badge badge-neutral">{session.status}</span>
      </div>
      <h3 className="font-headline text-base font-bold text-[var(--color-text)] group-hover:text-[var(--color-accent)]">
        {session.title}
      </h3>
      {session.workCard ? (
        <p className="text-xs font-medium text-[var(--color-text-secondary)]">
          업무 카드: {session.workCard.title}
        </p>
      ) : null}
      <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
        <span>
          메시지 {session.messageCount}개 · 자료 {session.sourceCount}개
        </span>
        <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">
          {session.updatedAt.slice(0, 16).replace('T', ' ')}
        </span>
      </div>
      {session.parentSessionId ? (
        <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">
          이전 세션에서 이어짐
        </p>
      ) : null}
    </Link>
  );
}

export { SessionCard };
export type { SessionCardProps };
