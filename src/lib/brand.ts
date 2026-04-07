import type { SessionMode } from '@/lib/db/schema';

interface BrandModeStoryItem {
  description: string;
  mode: SessionMode;
  title: string;
}

interface BrandValueCard {
  description: string;
  title: string;
}

const BRAND_NAME = 'HR AX Copilot';
const BRAND_SHORT_LABEL = 'HR AX 플랫폼';
const BRAND_TAGLINE = 'HR 담당자의 업무 카드와 프로세스 자산을 함께 운영하는 공통 Copilot';
const BRAND_DESCRIPTION =
  '업무 카드, 프로세스 자산, 근거 자료를 연결해 다음 작업의 출발점으로 돌려주는 HR AX 플랫폼의 공통 Copilot';
const BRAND_SIDEBAR_SUBTITLE = '공통 Copilot 레이어';
const BRAND_ELEVATOR_PITCH = [
  'HR AX Copilot은 발산·검증·종합·작성 4개 모드로 업무 카드의 의도와 근거를 단계별로 다룹니다.',
  '모든 업무를 Agent로 만들지 못해도, 사람과 LLM이 같은 워크스페이스 맥락 위에서 계속 일할 수 있게 돕습니다.',
  '도메인 Agent와 외부 LLM, 시스템 연동은 선택적으로 붙고 공통 Copilot은 전체 흐름을 받쳐 줍니다.',
] as const;
const BRAND_MEMBER_VALUE_PROPOSITION =
  'HR 담당자는 매번 처음부터 배경과 프로세스를 다시 설명하지 않아도 됩니다. HR AX Copilot은 이전 세션의 의도, 검증 흔적, 종합된 주장, 작성 초안을 다음 작업의 출발점으로 이어줍니다.';
const BRAND_VALUE_CARDS: BrandValueCard[] = [
  {
    description:
      '업무 카드는 프로세스 자산과 근거 자료를 상속받아, 새 요청이 와도 빈 화면이 아니라 이전 맥락 위에서 시작합니다.',
    title: '업무 카드가 프로세스 맥락을 이어받습니다',
  },
  {
    description:
      '전용 Agent가 없는 구간도 Copilot이 인터뷰, 구조화, 초안 생성을 도와 사람의 작업 흐름이 끊기지 않습니다.',
    title: 'Agent가 없는 단계도 LLM 협업이 계속됩니다',
  },
  {
    description:
      '근거자료, 주장, 최종 산출물이 연결되어 다음 업무와 다음 프로세스 재설계의 출발점으로 다시 쓰입니다.',
    title: '작업 결과가 다음 업무의 공용 자산으로 남습니다',
  },
];
const BRAND_FOUR_MODE_STORY: BrandModeStoryItem[] = [
  {
    description: '주제, 제약, 방향을 열어 두고 가능한 재료를 넓게 모읍니다.',
    mode: 'diverge',
    title: '발산은 가능성을 넓혀 재료를 확보합니다',
  },
  {
    description: '페르소나와 리스크 관점으로 허점, 가정, 실행 난점을 드러냅니다.',
    mode: 'validate',
    title: '검증은 놓치기 쉬운 반론과 리스크를 꺼냅니다',
  },
  {
    description: '자료 간 반복 패턴과 모순을 묶어 핵심 주장과 시사점을 만듭니다.',
    mode: 'synthesize',
    title: '종합은 흩어진 근거를 의사결정 가능한 주장으로 압축합니다',
  },
  {
    description: '정리된 재료를 보고서와 운영 문서로 옮겨 실제 실행 가능한 출력으로 마감합니다.',
    mode: 'write',
    title: '작성은 사고를 사람과 시스템이 함께 쓸 결과물로 바꿉니다',
  },
];

export {
  BRAND_DESCRIPTION,
  BRAND_ELEVATOR_PITCH,
  BRAND_FOUR_MODE_STORY,
  BRAND_MEMBER_VALUE_PROPOSITION,
  BRAND_NAME,
  BRAND_SHORT_LABEL,
  BRAND_SIDEBAR_SUBTITLE,
  BRAND_TAGLINE,
  BRAND_VALUE_CARDS,
};
export type { BrandModeStoryItem, BrandValueCard };
