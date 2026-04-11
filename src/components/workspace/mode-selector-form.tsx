'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import type { SessionMode } from '@/lib/db/schema';
import type { ModeDefinition } from '@/lib/modes';
import type { CreateSessionRequestBody, SessionSummary } from '@/lib/sessions/types';
import { safeFetch } from '@/lib/utils';

interface ParentSessionOption {
  id: string;
  mode: SessionMode;
  modeName: string;
  title: string;
  updatedAt: string;
}

interface ModeSelectorFormProps {
  modes: ModeDefinition[];
  parentSessionOptions: ParentSessionOption[];
}

interface CreateSessionResponse {
  data: {
    session: SessionSummary;
  };
}

const REPORT_TYPE_OPTIONS: {
  description: string;
  label: string;
  value: 'operation' | 'planning' | 'briefing';
}[] = [
  { description: '운영 현황과 결과를 정리합니다', label: '운영안', value: 'operation' },
  { description: '새로운 시도나 변화 제안을 정리합니다', label: '기획안', value: 'planning' },
  { description: '관련 사실과 배경을 공유합니다', label: '관련 보고', value: 'briefing' },
];

const MODE_ACCENT_CLASS: Record<SessionMode, string> = {
  diverge: 'border-[var(--color-mode-diverge)]',
  synthesize: 'border-[var(--color-mode-synthesize)]',
  validate: 'border-[var(--color-mode-validate)]',
  write: 'border-[var(--color-mode-write)]',
};

function ModeSelectorForm({ modes, parentSessionOptions }: ModeSelectorFormProps) {
  const router = useRouter();
  const [workCardAudience, setWorkCardAudience] = useState('');
  const [workCardProcessLabel, setWorkCardProcessLabel] = useState('');
  const [workCardTitle, setWorkCardTitle] = useState('');
  const [selectedMode, setSelectedMode] = useState<SessionMode | null>(null);
  const [selectedParentSessionId, setSelectedParentSessionId] = useState<string | ''>('');
  const [selectedReportType, setSelectedReportType] = useState<
    'operation' | 'planning' | 'briefing'
  >('operation');
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleModeClick = (mode: SessionMode) => {
    setErrorMessage('');
    setSelectedMode(mode);
  };

  const handleReset = () => {
    setSelectedMode(null);
    setSelectedParentSessionId('');
    setWorkCardAudience('');
    setWorkCardProcessLabel('');
    setWorkCardTitle('');
    setErrorMessage('');
  };

  const handleCreate = async () => {
    if (!selectedMode) {
      return;
    }

    setIsCreating(true);
    setErrorMessage('');

    const requestBody: CreateSessionRequestBody = {
      mode: selectedMode,
    };

    if (selectedParentSessionId) {
      requestBody.parentSessionId = selectedParentSessionId;
    }

    if (selectedMode === 'write') {
      requestBody.reportType = selectedReportType;
    }

    if (workCardTitle.trim().length > 0) {
      requestBody.workCardTitle = workCardTitle.trim();
    }

    if (workCardAudience.trim().length > 0) {
      requestBody.workCardAudience = workCardAudience.trim();
    }

    if (workCardProcessLabel.trim().length > 0) {
      requestBody.workCardProcessLabel = workCardProcessLabel.trim();
    }

    const result = await safeFetch<CreateSessionResponse>('/api/sessions', {
      body: JSON.stringify(requestBody),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    });

    if (!result.success) {
      setIsCreating(false);
      setErrorMessage(result.error);
      return;
    }

    router.push(`/workspace/session/${result.data.data.session.id}`);
  };

  return (
    <div className="flex flex-col gap-8">
      {errorMessage.length > 0 ? (
        <div className="border-[var(--color-error)]/20 rounded-[var(--radius-md)] border bg-[var(--color-error-light)] px-4 py-3 text-sm text-[var(--color-error)]">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        {modes.map((mode) => {
          const isSelected = selectedMode === mode.mode;
          const isDimmed = selectedMode !== null && !isSelected;
          const accentClass = MODE_ACCENT_CLASS[mode.mode];

          return (
            <button
              className={`workspace-card group flex h-full flex-col p-6 text-left transition-all ${
                isSelected ? `${accentClass} ring-1` : 'hover:-translate-y-1 hover:shadow-lg'
              } ${isDimmed ? 'opacity-40' : ''}`}
              disabled={isCreating || isDimmed}
              key={mode.mode}
              onClick={() => handleModeClick(mode.mode)}
              type="button"
            >
              <div className="mb-4 flex w-full items-start justify-between gap-3">
                <span className={`badge badge-mode-${mode.mode}`}>{mode.badge.label}</span>
                <span className="text-3xl">{mode.icon}</span>
              </div>

              <h3 className="mb-2 font-headline text-xl font-bold text-[var(--color-text)]">
                {mode.name}
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {mode.description}
              </p>

              <div className="mt-auto w-full border-t border-[var(--color-border-subtle)] pt-3">
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">
                  체크리스트 {mode.checklist.length}항목
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {selectedMode ? (
        <div className="workspace-card-muted flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-[var(--color-text)]">세부 설정</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                필요하면 이전 세션에서 이어가거나 보고서 유형을 선택하세요.
              </p>
            </div>
            <button
              className="text-sm font-semibold text-[var(--color-text-secondary)] underline underline-offset-4 transition hover:text-[var(--color-accent)]"
              disabled={isCreating}
              onClick={handleReset}
              type="button"
            >
              다른 모드 선택
            </button>
          </div>

          {parentSessionOptions.length > 0 ? (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                이전 세션에서 이어하기 (선택)
              </label>
              <select
                className="input-surface w-full"
                disabled={isCreating}
                onChange={(event) => setSelectedParentSessionId(event.target.value)}
                value={selectedParentSessionId}
              >
                <option value="">새로 시작</option>
                {parentSessionOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    [{option.modeName}] {option.title}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {selectedMode === 'write' ? (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                보고서 유형
              </label>
              <div className="grid gap-3 md:grid-cols-3">
                {REPORT_TYPE_OPTIONS.map((option) => {
                  const isSelected = selectedReportType === option.value;

                  return (
                    <button
                      className={`workspace-card p-4 text-left transition ${
                        isSelected
                          ? 'border-[var(--color-mode-write)] ring-1 ring-[var(--color-mode-write)]'
                          : 'hover:border-[var(--color-mode-write)]'
                      }`}
                      disabled={isCreating}
                      key={option.value}
                      onClick={() => setSelectedReportType(option.value)}
                      type="button"
                    >
                      <p className="mb-1 text-sm font-bold text-[var(--color-text)]">
                        {option.label}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="grid gap-3 md:grid-cols-3">
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                업무 카드 제목 (선택)
              </label>
              <input
                className="input-surface w-full"
                disabled={isCreating}
                onChange={(event) => setWorkCardTitle(event.target.value)}
                placeholder="예: 2026 상반기 조직개편 보고 준비"
                value={workCardTitle}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                대상 독자
              </label>
              <input
                className="input-surface w-full"
                disabled={isCreating}
                onChange={(event) => setWorkCardAudience(event.target.value)}
                placeholder="예: HR 리더, 임원"
                value={workCardAudience}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
              연결 프로세스 라벨
            </label>
            <input
              className="input-surface w-full"
              disabled={isCreating}
              onChange={(event) => setWorkCardProcessLabel(event.target.value)}
              placeholder="예: 조직개편 커뮤니케이션, 평가 제도 개편"
              value={workCardProcessLabel}
            />
          </div>

          <div className="flex justify-end">
            <button
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isCreating}
              onClick={handleCreate}
              type="button"
            >
              {isCreating ? '생성 중...' : '세션 시작'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { ModeSelectorForm };
export type { ModeSelectorFormProps, ParentSessionOption };
