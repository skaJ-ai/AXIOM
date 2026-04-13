'use client';

import { useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import type { ProcessAssetSummary } from '@/domains/process-assets/types';
import { canStartSessionFromWorkCard, formatWorkCardStatus } from '@/domains/work-cards/state';
import type { WorkCardListItem } from '@/domains/work-cards/types';
import type { SessionMode } from '@/lib/db/schema';
import type { ModeDefinition } from '@/lib/modes';
import type { CreateSessionRequestBody, SessionSummary } from '@/lib/sessions/types';
import { safeFetch } from '@/lib/utils';

type WorkCardSelectionMode = 'existing' | 'new' | 'none';

interface ParentSessionOption {
  id: string;
  mode: SessionMode;
  modeName: string;
  title: string;
  updatedAt: string;
}

interface ModeSelectorFormProps {
  initialWorkCardId?: string | null;
  modes: ModeDefinition[];
  parentSessionOptions: ParentSessionOption[];
  processAssetOptions: ProcessAssetSummary[];
  workCardOptions: WorkCardListItem[];
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
  { description: '운영 현황과 결과를 정리합니다.', label: '운영형', value: 'operation' },
  { description: '새로운 시도와 변화 제안을 정리합니다.', label: '기획형', value: 'planning' },
  { description: '관계자에게 배경과 사실을 공유합니다.', label: '브리핑형', value: 'briefing' },
];

const MODE_ACCENT_CLASS: Record<SessionMode, string> = {
  diverge: 'border-[var(--color-mode-diverge)]',
  synthesize: 'border-[var(--color-mode-synthesize)]',
  validate: 'border-[var(--color-mode-validate)]',
  write: 'border-[var(--color-mode-write)]',
};

const WORK_CARD_SELECTION_OPTIONS: {
  description: string;
  label: string;
  value: WorkCardSelectionMode;
}[] = [
  {
    description: '세션만 먼저 열고 나중에 카드 구조를 붙입니다.',
    label: '카드 없이 시작',
    value: 'none',
  },
  {
    description: '이미 만든 업무 카드를 이어서 사용합니다.',
    label: '기존 카드 연결',
    value: 'existing',
  },
  {
    description: '새 업무 카드와 세션을 함께 만듭니다.',
    label: '새 카드 만들기',
    value: 'new',
  },
];

function ModeSelectorForm({
  initialWorkCardId,
  modes,
  parentSessionOptions,
  processAssetOptions,
  workCardOptions,
}: ModeSelectorFormProps) {
  const router = useRouter();
  const selectableWorkCardOptions = useMemo(
    () => workCardOptions.filter((card) => canStartSessionFromWorkCard(card.status)),
    [workCardOptions],
  );
  const hasExistingWorkCards = selectableWorkCardOptions.length > 0;
  const normalizedInitialWorkCardId =
    initialWorkCardId && selectableWorkCardOptions.some((card) => card.id === initialWorkCardId)
      ? initialWorkCardId
      : '';
  const initialSelectionMode: WorkCardSelectionMode =
    normalizedInitialWorkCardId && hasExistingWorkCards ? 'existing' : 'none';
  const [selectedMode, setSelectedMode] = useState<SessionMode | null>(null);
  const [selectedParentSessionId, setSelectedParentSessionId] = useState<string | ''>('');
  const [selectedReportType, setSelectedReportType] = useState<
    'operation' | 'planning' | 'briefing'
  >('operation');
  const [selectedWorkCardId, setSelectedWorkCardId] = useState(normalizedInitialWorkCardId);
  const [workCardAudience, setWorkCardAudience] = useState('');
  const [workCardProcessAssetId, setWorkCardProcessAssetId] = useState('');
  const [workCardProcessLabel, setWorkCardProcessLabel] = useState('');
  const [workCardSelectionMode, setWorkCardSelectionMode] =
    useState<WorkCardSelectionMode>(initialSelectionMode);
  const [workCardTitle, setWorkCardTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const selectedExistingWorkCard = useMemo(
    () => workCardOptions.find((option) => option.id === selectedWorkCardId) ?? null,
    [selectedWorkCardId, workCardOptions],
  );
  const selectedProcessAsset = useMemo(
    () => processAssetOptions.find((option) => option.id === workCardProcessAssetId) ?? null,
    [processAssetOptions, workCardProcessAssetId],
  );
  const canCreateWithSelectedWorkCard =
    workCardSelectionMode !== 'existing' ||
    (selectedExistingWorkCard !== null &&
      canStartSessionFromWorkCard(selectedExistingWorkCard.status));

  const handleModeClick = (mode: SessionMode) => {
    setErrorMessage('');
    setSelectedMode(mode);
  };

  const handleReset = () => {
    setSelectedMode(null);
    setSelectedParentSessionId('');
    setSelectedReportType('operation');
    setSelectedWorkCardId(normalizedInitialWorkCardId);
    setWorkCardAudience('');
    setWorkCardProcessAssetId('');
    setWorkCardProcessLabel('');
    setWorkCardSelectionMode(initialSelectionMode);
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

    if (workCardSelectionMode === 'existing' && selectedWorkCardId) {
      requestBody.workCardId = selectedWorkCardId;
    }

    if (workCardSelectionMode === 'new') {
      if (workCardTitle.trim().length > 0) {
        requestBody.workCardTitle = workCardTitle.trim();
      }

      if (workCardAudience.trim().length > 0) {
        requestBody.workCardAudience = workCardAudience.trim();
      }

      if (workCardProcessAssetId.length > 0) {
        requestBody.workCardProcessAssetId = workCardProcessAssetId;
      }

      if (workCardProcessLabel.trim().length > 0) {
        requestBody.workCardProcessLabel = workCardProcessLabel.trim();
      }
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
                  체크리스트 {mode.checklist.length}개 항목
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
              <h3 className="text-lg font-bold text-[var(--color-text)]">세션 설정</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                필요하면 이전 세션을 이어받고, 업무 카드를 연결해 시작할 수 있습니다.
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
                이전 세션 이어가기
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

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
              업무 카드 연결 방식
            </label>
            <div className="grid gap-3 md:grid-cols-3">
              {WORK_CARD_SELECTION_OPTIONS.map((option) => {
                const isSelected = workCardSelectionMode === option.value;
                const isDisabled = option.value === 'existing' && !hasExistingWorkCards;

                return (
                  <button
                    className={`workspace-card p-4 text-left transition ${
                      isSelected
                        ? 'border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]'
                        : 'hover:border-[var(--color-accent)]'
                    } ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
                    disabled={isCreating || isDisabled}
                    key={option.value}
                    onClick={() => setWorkCardSelectionMode(option.value)}
                    type="button"
                  >
                    <p className="mb-1 text-sm font-bold text-[var(--color-text)]">
                      {option.label}
                    </p>
                    <p className="text-xs leading-5 text-[var(--color-text-secondary)]">
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {workCardSelectionMode === 'existing' ? (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                  연결할 업무 카드
                </label>
                <select
                  className="input-surface w-full"
                  disabled={isCreating || !hasExistingWorkCards}
                  onChange={(event) => setSelectedWorkCardId(event.target.value)}
                  value={selectedWorkCardId}
                >
                  <option value="">업무 카드를 선택해 주세요.</option>
                  {workCardOptions.map((card) => (
                    <option
                      disabled={!canStartSessionFromWorkCard(card.status)}
                      key={card.id}
                      value={card.id}
                    >
                      {card.title}
                      {card.status !== 'active' ? ` (${formatWorkCardStatus(card.status)})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="workspace-card flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-headline text-base font-bold text-[var(--color-text)]">
                    카드 요약
                  </h4>
                  <span className="badge badge-neutral">
                    {selectedExistingWorkCard
                      ? formatWorkCardStatus(selectedExistingWorkCard.status)
                      : '미선택'}
                  </span>
                </div>
                {selectedExistingWorkCard ? (
                  <>
                    {!canStartSessionFromWorkCard(selectedExistingWorkCard.status) ? (
                      <div className="border-[var(--color-warning)]/30 rounded-[var(--radius-sm)] border bg-[var(--color-warning-light)] px-3 py-2 text-xs text-[var(--color-warning)]">
                        {selectedExistingWorkCard.status === 'completed'
                          ? '완료된 카드는 새 세션에 다시 연결할 수 없습니다.'
                          : '보관된 카드는 복원 후에만 새 세션에 다시 연결할 수 있습니다.'}
                      </div>
                    ) : null}
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      {selectedExistingWorkCard.title}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedExistingWorkCard.audience ? (
                        <span className="badge badge-neutral">
                          {selectedExistingWorkCard.audience}
                        </span>
                      ) : null}
                      {selectedExistingWorkCard.processLabel ? (
                        <span className="badge badge-neutral">
                          {selectedExistingWorkCard.processLabel}
                        </span>
                      ) : null}
                      {selectedExistingWorkCard.processAsset?.domainLabel ? (
                        <span className="badge badge-neutral">
                          {selectedExistingWorkCard.processAsset.domainLabel}
                        </span>
                      ) : null}
                      <span className="badge badge-accent">
                        {selectedExistingWorkCard.priority}
                      </span>
                    </div>
                    {selectedExistingWorkCard.processAsset?.description ? (
                      <p className="text-xs leading-5 text-[var(--color-text-secondary)]">
                        {selectedExistingWorkCard.processAsset.description}
                      </p>
                    ) : null}
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      연결 세션 {selectedExistingWorkCard.sessionCount}개
                    </p>
                  </>
                ) : (
                  <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                    기존 업무 카드를 고르면 세션 제목과 맥락이 카드 중심으로 이어집니다.
                  </p>
                )}
              </div>
            </div>
          ) : null}

          {workCardSelectionMode === 'new' ? (
            <>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                    업무 카드 제목
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

              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                    연결 프로세스 자산
                  </label>
                  <select
                    className="input-surface w-full"
                    disabled={isCreating}
                    onChange={(event) => setWorkCardProcessAssetId(event.target.value)}
                    value={workCardProcessAssetId}
                  >
                    <option value="">자산을 선택하지 않고 자유 입력</option>
                    {processAssetOptions.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name}
                        {asset.domainLabel ? ` (${asset.domainLabel})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                    연결 프로세스 라벨
                  </label>
                  <input
                    className="input-surface w-full"
                    disabled={isCreating || workCardProcessAssetId.length > 0}
                    onChange={(event) => setWorkCardProcessLabel(event.target.value)}
                    placeholder="예: 조직개편 커뮤니케이션, 평가 제도 개편"
                    value={workCardProcessLabel}
                  />
                </div>
              </div>
              {selectedProcessAsset ? (
                <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-sunken)] px-4 py-3">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="badge badge-accent">{selectedProcessAsset.name}</span>
                    {selectedProcessAsset.domainLabel ? (
                      <span className="badge badge-neutral">
                        {selectedProcessAsset.domainLabel}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs leading-5 text-[var(--color-text-secondary)]">
                    선택한 프로세스 자산이 있으면 카드의 프로세스 라벨은 자산 이름으로 고정됩니다.
                  </p>
                  {selectedProcessAsset.description ? (
                    <p className="mt-2 text-xs leading-5 text-[var(--color-text-secondary)]">
                      {selectedProcessAsset.description}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : null}

          <div className="flex justify-end">
            <button
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={
                isCreating ||
                (workCardSelectionMode === 'existing' &&
                  (!selectedWorkCardId || !canCreateWithSelectedWorkCard))
              }
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
