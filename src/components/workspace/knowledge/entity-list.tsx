'use client';

import { useState } from 'react';

import type { Entity } from '@/domains/knowledge/types';
import type { EntityType } from '@/lib/db/schema';

interface EntityListProps {
  entities: Entity[];
}

const ENTITY_TYPE_FILTERS: { label: string; value: EntityType | 'all' }[] = [
  { label: '전체', value: 'all' },
  { label: '사람', value: 'person' },
  { label: '부서', value: 'department' },
  { label: '프로젝트', value: 'project' },
  { label: '프로그램', value: 'program' },
  { label: '정책', value: 'policy' },
];

const ENTITY_TYPE_LABEL: Record<EntityType, string> = {
  department: '부서',
  person: '사람',
  policy: '정책',
  program: '프로그램',
  project: '프로젝트',
};

function EntityList({ entities }: EntityListProps) {
  const [activeFilter, setActiveFilter] = useState<EntityType | 'all'>('all');

  const filteredEntities =
    activeFilter === 'all' ? entities : entities.filter((entity) => entity.type === activeFilter);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {ENTITY_TYPE_FILTERS.map((filter) => (
          <button
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              activeFilter === filter.value
                ? 'bg-[var(--color-accent)] text-white'
                : 'border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]'
            }`}
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            type="button"
          >
            {filter.label}
          </button>
        ))}
      </div>

      {filteredEntities.length === 0 ? (
        <div className="workspace-card-muted p-6 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            축적된 엔티티가 없습니다. 보고서를 확정하면 자동으로 추출됩니다.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filteredEntities.map((entity) => (
            <div className="workspace-card" key={entity.id}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-base font-bold text-[var(--color-text)]">{entity.name}</h3>
                <span className="badge badge-neutral">{ENTITY_TYPE_LABEL[entity.type]}</span>
              </div>
              {entity.aliases.length > 0 ? (
                <p className="text-xs text-[var(--color-text-secondary)]">
                  별칭: {entity.aliases.join(', ')}
                </p>
              ) : null}
              <p className="mt-2 text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">
                마지막 발견: {entity.lastSeenAt.slice(0, 10)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { EntityList };
export type { EntityListProps };
