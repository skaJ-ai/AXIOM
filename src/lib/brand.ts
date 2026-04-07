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

const BRAND_NAME = 'AXIOM';
const BRAND_SHORT_LABEL = '랩 내부 베타';
const BRAND_TAGLINE = '생각을 자산으로 축적하는 4모드 AI 워크벤치';
const BRAND_DESCRIPTION =
  '발산·검증·종합·작성의 흐름을 남기고 다음 작업의 출발점으로 돌려주는 랩 내부 베타 작업공간';
const BRAND_SIDEBAR_SUBTITLE = '조직 사고 워크벤치';
const BRAND_ELEVATOR_PITCH = [
  'AXIOM은 발산·검증·종합·작성 4개 모드로 아이디어와 자료를 단계별로 다룹니다.',
  '대화, 근거, 중간 주장, 최종 산출물을 한 워크스페이스에서 연결해 조직 기억으로 축적합니다.',
  '그래서 다음 보고서와 다음 실험은 빈 화면이 아니라 이전 사고의 맥락에서 시작합니다.',
] as const;
const BRAND_MEMBER_VALUE_PROPOSITION =
  '랩 멤버는 매번 처음부터 설명하지 않아도 됩니다. AXIOM은 이전 세션의 아이디어, 검증 흔적, 종합된 주장, 작성 초안을 다음 작업의 출발점으로 이어줍니다.';
const BRAND_VALUE_CARDS: BrandValueCard[] = [
  {
    description:
      '발산에서 나온 아이디어와 검증에서 드러난 반론을 함께 남겨 다음 실험의 출발점으로 재사용합니다.',
    title: '빈 화면 대신 이전 사고의 맥락에서 시작합니다',
  },
  {
    description:
      '근거자료, 주장, 인사이트, 최종 산출물이 한 흐름으로 이어져 “왜 이 결론에 도달했는가”를 다시 추적할 수 있습니다.',
    title: '결론뿐 아니라 판단 과정까지 회수할 수 있습니다',
  },
  {
    description:
      '개인 세션에서 출발하지만 지식 구조는 축적되므로, 작은 실험도 다음 프로젝트를 위한 공용 설계 자산이 됩니다.',
    title: '작은 실험이 조직 기억으로 누적됩니다',
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
    title: '작성은 사고를 사람과 조직이 쓸 수 있는 결과물로 바꿉니다',
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
