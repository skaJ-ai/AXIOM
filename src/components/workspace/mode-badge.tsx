import type { SessionMode } from '@/lib/db/schema';

interface ModeBadgeProps {
  label?: string;
  mode: SessionMode;
}

const MODE_LABEL: Record<SessionMode, string> = {
  diverge: '발산',
  synthesize: '종합',
  validate: '검증',
  write: '작성',
};

const MODE_ICON: Record<SessionMode, string> = {
  diverge: '✦',
  synthesize: '◈',
  validate: '⬡',
  write: '▣',
};

function ModeBadge({ label, mode }: ModeBadgeProps) {
  const displayLabel = label ?? MODE_LABEL[mode];

  return (
    <span className={`badge badge-mode-${mode} inline-flex items-center gap-1`}>
      <span className="text-[10px]">{MODE_ICON[mode]}</span>
      {displayLabel}
    </span>
  );
}

export { ModeBadge };
export type { ModeBadgeProps };
