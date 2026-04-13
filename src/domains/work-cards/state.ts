import type { WorkCardStatus } from '@/lib/db/schema';

const GENERIC_WORK_CARD_STATUS_TRANSITIONS: Record<WorkCardStatus, WorkCardStatus[]> = {
  active: ['paused', 'completed', 'archived'],
  archived: [],
  completed: ['archived'],
  paused: ['active', 'completed', 'archived'],
};

function formatWorkCardStatus(status: WorkCardStatus): string {
  switch (status) {
    case 'active':
      return '진행 중';
    case 'archived':
      return '보관';
    case 'completed':
      return '완료';
    case 'paused':
      return '일시 중지';
    default:
      return status;
  }
}

function canStartSessionFromWorkCard(status: WorkCardStatus): boolean {
  return status === 'active' || status === 'paused';
}

function isWorkCardBlockedForNewSession(status: WorkCardStatus): boolean {
  return !canStartSessionFromWorkCard(status);
}

function getBlockedWorkCardMessage(status: WorkCardStatus): string {
  if (status === 'completed') {
    return '완료된 업무 카드는 새 세션에 연결할 수 없습니다.';
  }

  if (status === 'archived') {
    return '보관된 업무 카드는 복원 후에만 새 세션에 연결할 수 있습니다.';
  }

  return '이 업무 카드는 현재 새 세션에 연결할 수 없습니다.';
}

function canRestoreWorkCard(status: WorkCardStatus): boolean {
  return status === 'archived';
}

function canTransitionWorkCardStatus(
  currentStatus: WorkCardStatus,
  nextStatus: WorkCardStatus,
): boolean {
  return (
    currentStatus === nextStatus ||
    GENERIC_WORK_CARD_STATUS_TRANSITIONS[currentStatus].includes(nextStatus)
  );
}

function getAllowedGenericWorkCardStatuses(currentStatus: WorkCardStatus): WorkCardStatus[] {
  return [currentStatus, ...GENERIC_WORK_CARD_STATUS_TRANSITIONS[currentStatus]];
}

function getInvalidWorkCardTransitionMessage(
  currentStatus: WorkCardStatus,
  nextStatus: WorkCardStatus,
): string {
  if (currentStatus === 'archived' && nextStatus === 'active') {
    return '보관된 업무 카드는 복원 액션으로만 다시 활성화할 수 있습니다.';
  }

  if (currentStatus === 'completed' && nextStatus === 'active') {
    return '완료된 업무 카드를 다시 진행 중으로 되돌릴 수 없습니다.';
  }

  if (currentStatus === 'completed' && nextStatus === 'paused') {
    return '완료된 업무 카드를 일시 중지 상태로 바꿀 수 없습니다.';
  }

  return `허용되지 않은 업무 카드 상태 전이입니다. (${currentStatus} -> ${nextStatus})`;
}

export {
  canRestoreWorkCard,
  canStartSessionFromWorkCard,
  canTransitionWorkCardStatus,
  formatWorkCardStatus,
  GENERIC_WORK_CARD_STATUS_TRANSITIONS,
  getAllowedGenericWorkCardStatuses,
  getBlockedWorkCardMessage,
  getInvalidWorkCardTransitionMessage,
  isWorkCardBlockedForNewSession,
};
