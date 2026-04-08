import type { IdeationPointArticle, IdeationPointSource } from '../ideation-points-content';

function createSource(kind: IdeationPointSource['kind'], path: string): IdeationPointSource {
  return { kind, path };
}

const ENGINEERING_HARNESS_ARTICLES: IdeationPointArticle[] = [
  {
    blocks: [
      {
        paragraphs: [
          '실행 규율에서 멱등성은 같은 입력과 같은 규칙이 들어왔을 때 어떤 모델이든 구조적으로 비슷한 출력을 내게 만드는 통제 기술이다. 공통 운영 가이드와 프로젝트 컨텍스트 문서가 중요한 이유도 바로 이 통제면을 문서로 고정하기 때문이다.',
          '이 문서가 중요한 이유는 품질 규칙을 사람의 기억에 맡기지 않기 때문이다. named export, import order, no any, props destructure, magic string 금지 같은 규칙은 모델의 스타일 편차를 줄여 코드 산출물을 안정화한다.',
        ],
        title: '실행 규칙은 모델 위에 얹는 멱등성 장치다',
      },
      {
        paragraphs: [
          '프로젝트 컨텍스트 가이드가 front guard와 back guard를 구분하는 것도 같은 생각이다. front guard는 ts/tsx 품질과 파일 규칙을 강제하고, back guard는 AI 산출물의 relevance와 faithfulness를 평가한다.',
          '즉 실행 규율은 lint보다 넓고 프롬프트보다 좁다. 구현 규칙과 평가 프로토콜을 함께 둬서, 코드와 문서 양쪽의 흔들림을 한 번에 줄인다.',
        ],
        title: '규칙과 평가를 함께 둬야 멱등성이 생긴다',
      },
      {
        bullets: [
          '멱등성은 모델을 통일하는 것이 아니라 출력 계약을 통일하는 일이다.',
          'front guard는 코드 품질, back guard는 산출물 품질을 담당한다.',
          '실행 규칙은 사람이 기억하는 가이드가 아니라 실행 전에 확인 가능한 계약이어야 한다.',
        ],
        paragraphs: [
          '다른 플랫폼으로 옮길 때도 코딩 스타일 문서와 작업 평가 기준을 분리하지 말고 하나의 실행 규율로 설계해야 결과 변동폭을 줄일 수 있다.',
        ],
        title: '좋은 실행 규율은 구현 규칙과 평가 규칙을 함께 묶는다',
      },
    ],
    category: 'engineering-harness',
    navLabel: '실행 규칙',
    relatedSlugs: [
      'hierarchical-context-system',
      'ai-metadata-marker-system',
      'trust-tier-promotion',
    ],
    slug: 'harness-engineering-idempotency',
    sources: [
      createSource('reference', '프로젝트 컨텍스트 가이드'),
      createSource('reference', '전역 운영 가이드'),
      createSource('code', '레포 운영 규칙 메모'),
    ],
    summary:
      '무엇을 실행 규율로 고정해야 모델이 달라도 구조적으로 비슷한 코드와 산출물을 재현할 수 있는지 설명한다.',
    title: '실행 규칙과 멱등성',
    whyItMatters:
      '이식 시 실행 규율을 두지 않으면 같은 요구를 반복해도 코드 스타일과 산출물 품질이 실행마다 크게 흔들린다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          '계층형 컨텍스트 시스템은 모든 규칙을 하나의 긴 문서에 몰아넣지 않고, Global > Domain > Local 우선순위로 쪼개 관리하는 방식이다. 전역 운영 가이드와 도메인 운영 가이드가 나뉘어 있는 구조는 바로 이 계층을 실험하고 있다.',
          '이 구조의 장점은 규칙 충돌을 명시적으로 다룬다는 데 있다. 전체 레포 규칙은 글로벌 레이어에 두고, App Router처럼 특수한 예외는 로컬 문서에 두면 구현자는 어느 규칙이 왜 예외인지 추적할 수 있다.',
        ],
        title: '컨텍스트는 길게 쌓지 않고 우선순위로 층을 만든다',
      },
      {
        paragraphs: [
          '계층형 컨텍스트는 프롬프트 최적화 기법이 아니라 조직 운영 기법이다. 레포가 커질수록 한 문서에 모든 규칙을 넣는 방식은 유지되지 않으므로, 어느 디렉토리에서 어떤 예외가 허용되는지 구조적으로 관리해야 한다.',
          '선행 프로젝트 문서가 Local > Domain > Global 우선순위를 강조한 것도 같은 이유다. 컨텍스트 길이보다 규칙 적용 순서가 더 중요해지는 순간이 온다.',
        ],
        title: '긴 프롬프트보다 충돌 해결 순서가 더 중요하다',
      },
      {
        bullets: [
          'Global은 공통 규칙, Domain은 도메인별 규칙, Local은 디렉토리 예외를 담는다.',
          '예외는 숨기지 말고 더 낮은 레이어에서 명시적으로 선언한다.',
          '계층형 컨텍스트는 에이전트뿐 아니라 팀 협업 문서화에도 같은 이점을 준다.',
        ],
        paragraphs: [
          '이식 시에도 규칙을 한 문서에 길게 누적하기보다, 예외가 필요한 경계마다 하위 레이어를 두는 편이 확장성과 설명 가능성이 높다.',
        ],
        title: '규칙이 늘어날수록 문서보다 계층 설계가 중요해진다',
      },
    ],
    category: 'engineering-harness',
    navLabel: '운영 가이드 계층',
    relatedSlugs: ['harness-engineering-idempotency', 'parent-session-chaining', 'context-tiering'],
    slug: 'hierarchical-context-system',
    sources: [
      createSource('reference', '전역 운영 가이드'),
      createSource('reference', '도메인 운영 가이드'),
      createSource('reference', '프로젝트 컨텍스트 가이드'),
    ],
    summary:
      '무엇을 Global, Domain, Local 규칙으로 나눠야 에이전트와 팀이 같은 우선순위 체계로 구현 결정을 내릴 수 있는지 설명한다.',
    title: '계층형 운영 가이드 시스템',
    whyItMatters:
      '이식 시 규칙 계층을 설계하지 않으면 레포가 커질수록 예외는 숨고, 운영 가이드는 길지만 믿기 어려운 문서가 된다.',
  },
];

export { ENGINEERING_HARNESS_ARTICLES };
