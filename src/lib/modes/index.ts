import type { SessionChecklist, SessionMode } from '@/lib/db/schema';

import { buildDivergePrompt } from './prompts/diverge-prompt';
import { buildSynthesizePrompt } from './prompts/synthesize-prompt';
import { buildValidatePrompt } from './prompts/validate-prompt';
import { buildWritePrompt } from './prompts/write-prompt';

import type { ModeChecklistItem, ModeDefinition } from './types';

const DIVERGE_CHECKLIST: ModeChecklistItem[] = [
  {
    helpText:
      '"직원 복지 개선 방안을 모으려 합니다"처럼, 무엇에 대해 생각을 발산하려는지 말씀해 주세요.',
    id: 'diverge_1',
    intent: '발산의 목적과 방향을 설정한다.',
    label: '의도',
    weight: 2,
  },
  {
    helpText: '"현재 복지 예산은 연 3억이고 만족도 3.2점입니다"처럼, 지금 상황을 알려주세요.',
    id: 'diverge_2',
    intent: '현재 상태를 파악하여 아이디어 맥락을 확보한다.',
    label: '현황',
    weight: 2,
  },
  {
    helpText: '"비용 절감보다는 만족도 향상 쪽으로"처럼, 아이디어의 방향을 알려주세요.',
    id: 'diverge_3',
    intent: '아이디어의 방향성을 정한다.',
    label: '아이디어 방향',
    weight: 3,
  },
  {
    helpText: '"예산 한도는 5천만원, 올해 내 실행 가능해야"처럼, 제약 조건을 알려주세요.',
    id: 'diverge_4',
    intent: '제약 조건을 미리 확인한다.',
    label: '제약조건',
    weight: 1,
  },
  {
    helpText:
      '"최소 10개 아이디어가 나오면 수렴하겠습니다"처럼, 언제 발산을 마칠지 기준을 정해 주세요.',
    id: 'diverge_5',
    intent: '발산 종료 기준을 설정한다.',
    label: '수렴 기준',
    weight: 2,
  },
];

const VALIDATE_CHECKLIST: ModeChecklistItem[] = [
  {
    helpText: '"온보딩 프로그램 개편안을 검증하려 합니다"처럼, 무엇을 검증할지 알려주세요.',
    id: 'validate_1',
    intent: '검증 대상을 명확히 한다.',
    label: '검증 대상',
    weight: 3,
  },
  {
    helpText: '"임원과 현업 관점 모두 필요합니다"처럼, 어떤 시각에서 봐야 하는지 알려주세요.',
    id: 'validate_2',
    intent: '검토할 페르소나를 선택한다.',
    label: '페르소나 선택',
    weight: 2,
  },
  {
    helpText:
      '"예산 초과 리스크와 일정 지연 리스크를 중점적으로"처럼, 주요 리스크 기준을 알려주세요.',
    id: 'validate_3',
    intent: '리스크 판단 기준을 정한다.',
    label: '리스크 기준',
    weight: 2,
  },
  {
    helpText:
      '"검증 결과로 보완이 필요한 영역을 정리하겠습니다"처럼, 검증 후 어디까지 보완할지 알려주세요.',
    id: 'validate_4',
    intent: '보완 범위를 정한다.',
    label: '보완 범위',
    weight: 1,
  },
];

const SYNTHESIZE_CHECKLIST: ModeChecklistItem[] = [
  {
    helpText: '분석할 자료를 근거자료 패널에 붙여넣거나 이전 세션 결과를 활용하세요.',
    id: 'synthesize_1',
    intent: '분석 대상 자료를 확보한다.',
    label: '자료 투입',
    weight: 3,
  },
  {
    helpText: '"시계열 변화와 부서별 차이를 중심으로"처럼, 어떤 관점에서 분석할지 알려주세요.',
    id: 'synthesize_2',
    intent: '분석 관점을 설정한다.',
    label: '분석 관점',
    weight: 2,
  },
  {
    helpText: '자료 간 공통 패턴이나 반복되는 주제가 발견되면 정리합니다.',
    id: 'synthesize_3',
    intent: '자료 간 패턴을 식별한다.',
    label: '패턴 식별',
    weight: 2,
  },
  {
    helpText: '발견된 패턴에서 "그래서 어떻다(So What)"를 도출합니다.',
    id: 'synthesize_4',
    intent: '시사점을 도출한다.',
    label: '시사점 도출',
    weight: 3,
  },
];

const WRITE_CHECKLIST: ModeChecklistItem[] = [
  {
    helpText:
      '"신임 리더십 교육 성과를 정리해서 내년 예산 확보에 쓰려고 합니다"처럼, 이 보고서가 어디에 쓰이는지 말씀해 주세요.',
    id: 'write_1',
    intent: '이 문서를 왜 작성하는지 명확히 한다.',
    label: '목적',
    weight: 2,
  },
  {
    helpText:
      '"팀장 이상 리더에게 보고합니다" 또는 "경영진 보고용"처럼, 누가 이 문서를 읽을지 알려주세요.',
    id: 'write_2',
    intent: '��구를 위한 보고서인지와 독자를 분명히 한다.',
    label: '대상',
    weight: 1,
  },
  {
    helpText:
      '"현재 퇴사율이 8%이고 작년 대비 2%p 올랐습니다"처럼, 숫자나 사실을 중심으로 현재 상황을 설명해 주세요.',
    id: 'write_3',
    intent: '현재 상황과 주요 사실을 구조화한다.',
    label: '현황',
    weight: 3,
  },
  {
    helpText:
      '"온보딩 기간을 2주에서 1주로 줄이는 것을 제안합니다"처럼, 바꾸고 싶은 것이나 시도해볼 방향을 말씀해 주세요.',
    id: 'write_4',
    intent: '제안, 시사점, 개선안의 방향을 정리한다.',
    label: '제안',
    weight: 2,
  },
  {
    helpText:
      '"비용 15% 절감이 기대됩니다" 또는 "만족도 4.5 이상 유지가 목표입니다"처럼, 숫자나 결과 중심으로 말씀해 주세요.',
    id: 'write_5',
    intent: '기대효과와 의미를 숫자나 결과 중심으로 정리한다.',
    label: '기대효과',
    weight: 2,
  },
  {
    helpText: '설문 결과, 인사 데이터, 벤치마크 자료 등이 있으면 근거자료 패널에 붙여넣어 주세요.',
    id: 'write_6',
    intent: '근거 자료와 데이터 유무를 확인한다.',
    label: '근거/데이터',
    weight: 3,
  },
  {
    helpText: '"운영안", "기획안", "관련 보고" 중 어떤 유형의 보고서인지 선택해 주세요.',
    id: 'write_7',
    intent: '보고서 유형을 결정한다.',
    label: '보고서 유형',
    weight: 1,
  },
];

const MODE_DEFINITIONS: Record<SessionMode, Omit<ModeDefinition, 'systemPrompt'>> = {
  diverge: {
    badge: { color: 'teal', label: '발산' },
    checklist: DIVERGE_CHECKLIST,
    description: '흩어진 생각을 구조화합니다',
    icon: '✦',
    mode: 'diverge',
    name: '발산 모드',
    starterMessage:
      '발산 모드를 시작합니다. 어떤 주제에 대해 아이디어를 모아볼까요? 자유롭게 방향을 알려주세요.',
  },
  synthesize: {
    badge: { color: 'blue', label: '종합' },
    checklist: SYNTHESIZE_CHECKLIST,
    description: '여러 자료의 핵심과 연결점을 찾습니다',
    icon: '◈',
    mode: 'synthesize',
    name: '종합 모드',
    starterMessage:
      '종합 모드를 시작합니다. 어떤 자료들을 종합 분석할까요? 자료를 근거자료 패널에 붙여넣거나, 이전 세션 결과를 활용할 수 있습니다.',
  },
  validate: {
    badge: { color: 'warning', label: '검증' },
    checklist: VALIDATE_CHECKLIST,
    description: '다양한 관점에서 허점을 짚어줍니다',
    icon: '⬡',
    mode: 'validate',
    name: '검증 모드',
    starterMessage:
      '검증 모드를 시작합니다. 어떤 아이디어나 기획을 검증하고 싶으신가요? 검증 대상부터 알려주세요.',
  },
  write: {
    badge: { color: 'green', label: '작성' },
    checklist: WRITE_CHECKLIST,
    description: '정리된 재료로 보고서를 생성합니다',
    icon: '▣',
    mode: 'write',
    name: '작성 모드',
    starterMessage: '작성 모드를 시작합니다. 어떤 보고서를 작성하시나요? 목적부터 알려주세요.',
  },
};

function buildModeDefinition(raw: Omit<ModeDefinition, 'systemPrompt'>): ModeDefinition {
  const promptBuilder = MODE_PROMPT_BUILDERS[raw.mode];

  return {
    ...raw,
    systemPrompt: {
      interview: promptBuilder(raw.checklist),
    },
  };
}

const MODE_PROMPT_BUILDERS: Record<SessionMode, (checklist: ModeChecklistItem[]) => string> = {
  diverge: buildDivergePrompt,
  synthesize: buildSynthesizePrompt,
  validate: buildValidatePrompt,
  write: buildWritePrompt,
};

const FULL_MODE_DEFINITIONS: Record<SessionMode, ModeDefinition> = {
  diverge: buildModeDefinition(MODE_DEFINITIONS.diverge),
  synthesize: buildModeDefinition(MODE_DEFINITIONS.synthesize),
  validate: buildModeDefinition(MODE_DEFINITIONS.validate),
  write: buildModeDefinition(MODE_DEFINITIONS.write),
};

function getModeByType(mode: SessionMode): ModeDefinition {
  return FULL_MODE_DEFINITIONS[mode];
}

function getModeCatalog(): ModeDefinition[] {
  return Object.values(FULL_MODE_DEFINITIONS);
}

function createInitialModeChecklist(mode: SessionMode): SessionChecklist {
  const modeDefinition = FULL_MODE_DEFINITIONS[mode];

  return Object.fromEntries(modeDefinition.checklist.map((item) => [item.id, false]));
}

export { createInitialModeChecklist, getModeByType, getModeCatalog };
export type {
  DivergePanelData,
  ModeBadge,
  ModeBadgeColor,
  ModeChecklistItem,
  ModeDefinition,
  ModePanelData,
  ModePromptSet,
  SynthesizePanelData,
  ValidatePanelData,
  WritePanelData,
} from './types';
