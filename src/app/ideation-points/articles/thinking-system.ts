import type { IdeationPointArticle, IdeationPointSource } from '../ideation-points-content';

function createSource(kind: IdeationPointSource['kind'], path: string): IdeationPointSource {
  return { kind, path };
}

const THINKING_SYSTEM_ARTICLES: IdeationPointArticle[] = [
  {
    blocks: [
      {
        paragraphs: [
          'AXIOM의 인터뷰는 정보를 수집하는 폼이 아니라 작업의 의도를 정렬하는 장치다. `buildInterviewContext`는 체크리스트와 자료와 예시 문서를 넣지만, 실제로 모델이 먼저 묻도록 만드는 것은 template와 mode가 가진 질문 순서다.',
          '이 설계는 사용자가 무엇을 알고 있는지보다 무엇을 만들려는지에 집중한다. 좋은 초안은 자료가 많을 때보다 의도가 선명할 때 더 빨리 나온다.',
        ],
        title: '좋은 작업은 정보보다 의도부터 묻는다',
      },
      {
        paragraphs: [
          '체크리스트는 단순 입력 완료 표시가 아니다. 어떤 정보가 빠졌는지, 다음 질문이 무엇이어야 하는지를 드러내는 사고 방향 장치다. 그래서 인터뷰 UX는 자유 채팅처럼 보여도 내부에서는 질문 순서와 누락 탐지가 작동한다.',
          '이 방식은 다른 도메인에서도 그대로 이식할 수 있다. 먼저 해결하려는 의사결정과 산출물의 형태를 정하고, 그 다음에 질문 설계를 붙인다.',
        ],
        title: '체크리스트는 입력폼이 아니라 사고 방향 장치다',
      },
      {
        bullets: [
          '질문은 데이터보다 의사결정 기준을 먼저 묻는다.',
          '누락은 모델의 실패가 아니라 다음 인터뷰 행동을 만드는 신호로 본다.',
          '템플릿별 질문 순서를 보존해야 인터뷰 품질이 재현된다.',
        ],
        paragraphs: [
          '이식 시 가장 먼저 복제해야 할 것은 챗 UI가 아니라 질문 흐름이다. 화면을 바꿔도 질문 순서가 같으면 제품의 사고 방식은 유지된다.',
        ],
        title: '복제해야 하는 것은 채팅창이 아니라 질문 순서다',
      },
    ],
    category: 'thinking-system',
    navLabel: '의도 중심 질문',
    relatedSlugs: ['four-mode-thinking', 'methodology-library', 'work-redesign-over-training'],
    slug: 'intent-first-interview',
    sources: [
      createSource('code', 'src/lib/ai/session-chat.ts'),
      createSource('code', 'src/lib/templates/index.ts'),
      createSource('code', 'src/lib/sessions/service.ts'),
    ],
    summary: '무엇을 먼저 물어야 사용자의 자료 수집이 아니라 작업 의도를 정렬하는 인터뷰가 되는지 설명한다.',
    title: '의도 중심 인터뷰',
    whyItMatters:
      '이식 시 질문 순서를 잃으면 같은 모델과 같은 자료를 써도 결과는 단순한 채팅 보조 수준으로 떨어진다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          'AXIOM의 가치는 AI를 더 많이 쓰게 하는 데 있지 않다. 실제 업무 흐름을 다시 설계해 사람이 어떤 순간에 발산하고, 검증하고, 종합하고, 확정하는지를 재배치하는 데 있다.',
          '이 관점은 교육보다 워크플로우를 바꾼다. 사용자가 프롬프트를 잘 쓰도록 훈련하는 대신, 제품이 구조화된 흐름과 가드를 제공해 일을 다른 방식으로 하게 만든다.',
        ],
        title: '학습보다 흐름을 바꾸는 쪽이 제품 가치다',
      },
      {
        paragraphs: [
          'Work Redesign은 기능 다발이 아니라 역할 재배치다. 사람은 의도, 판단, 승인에 집중하고, 시스템은 분류, 초안화, 회수, 반복 정리에 집중한다.',
          '그래서 AXIOM은 범용 비서보다 강한 작업공간이 된다. 기능을 많이 넣는 대신 작업이 흘러가는 순서를 고정하면, 사용자는 어떤 버튼을 눌러야 하는지가 아니라 다음에 어떤 사고를 해야 하는지 알게 된다.',
        ],
        title: '시스템은 반복을, 사람은 판단을 맡는다',
      },
      {
        bullets: [
          '도입 전략은 교육 커리큘럼이 아니라 제품 인터페이스에 녹아 있어야 한다.',
          '사람이 매번 잘해야 하는 시스템보다, 사람의 다음 행동을 자연스럽게 제한하는 시스템이 강하다.',
          'AI 활용도를 높이는 목표보다 업무 전환 비용을 낮추는 목표가 더 실용적이다.',
        ],
        paragraphs: [
          '다른 플랫폼에서도 이 사고를 유지하려면 기능 이름보다 역할 분담표를 먼저 그려야 한다. 누가 확정하고 무엇이 자동으로 축적되는지가 핵심이다.',
        ],
        title: '도입 전략도 결국 인터페이스 설계다',
      },
    ],
    category: 'thinking-system',
    navLabel: '업무 재설계',
    relatedSlugs: ['intent-first-interview', 'four-mode-thinking', 'human-in-the-loop'],
    slug: 'work-redesign-over-training',
    sources: [
      createSource('code', 'src/lib/brand.ts'),
      createSource('code', 'src/lib/modes/index.ts'),
      createSource('reference', 'C:/dev/HARP/JARVIS/00_overview.md'),
    ],
    summary: '무엇을 자동화할지보다 사람과 시스템의 역할을 어떻게 재배치할지가 왜 더 중요한지 설명한다.',
    title: 'AI 도입보다 Work Redesign이 먼저다',
    whyItMatters:
      '이식 시 업무 재설계 관점을 놓치면 제품은 기능은 많지만 사용자의 실제 일하는 방식을 바꾸지 못하는 도구가 된다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          '4모드는 단순 탭 전환이 아니라 사고 상태 기계다. 발산은 가능성을 늘리고, 검증은 반론을 세우고, 종합은 근거를 압축하며, 작성은 외부로 제출 가능한 문서를 만든다.',
          '이 분리는 한 모델에 여러 역할을 억지로 얹지 않기 위한 장치다. 같은 세션 안에서 모든 판단을 하게 만들면 출력은 길어지지만 품질은 흐려진다.',
        ],
        title: '모드는 UI 구분이 아니라 사고의 상태 기계다',
      },
      {
        paragraphs: [
          '중앙 카탈로그가 필요한 이유는 각 모드가 갖는 목적, 산출물, 체크리스트를 제품 전체에서 일관되게 관리해야 하기 때문이다. `src/lib/modes/index.ts`는 사실상 사고 운영체제의 표준 라이브러리 역할을 한다.',
          '이 구조 덕분에 AXIOM은 새 모드를 추가할 때도 탭 하나를 늘리는 대신, 어떤 산출물이 남고 다음 모드로 무엇이 전달되는지를 먼저 정의하게 된다.',
        ],
        title: '중앙 카탈로그는 사고 운영체제의 표준 라이브러리다',
      },
      {
        bullets: [
          '모드마다 질문법, 산출물 타입, 후속 전달 규칙이 다르다.',
          '모드 간 전환은 화면 이동이 아니라 artifact handoff다.',
          '새 모드는 기존 모드를 대체하지 않고 상태 기계를 확장해야 한다.',
        ],
        paragraphs: [
          '이식 시에도 네 개의 이름보다 더 중요한 것은 상태 전환의 의미다. 무엇을 끝내야 다음 모드로 넘어갈 수 있는지 정의되어야 한다.',
        ],
        title: '이식의 핵심은 이름보다 전환 규칙이다',
      },
    ],
    category: 'thinking-system',
    navLabel: '4모드 체계',
    relatedSlugs: ['intent-first-interview', 'parent-session-chaining', 'human-in-the-loop'],
    slug: 'four-mode-thinking',
    sources: [
      createSource('code', 'src/lib/modes/index.ts'),
      createSource('code', 'src/lib/modes/types.ts'),
      createSource('code', 'src/lib/brand.ts'),
    ],
    summary: '무엇을 별도 모드로 분리해야 사고 흐름이 섞이지 않고 다음 단계로 전달 가능한 산출물이 남는지 설명한다.',
    title: '4모드 사고 체계',
    whyItMatters:
      '이식 시 모드 전환을 artifact handoff로 설계하지 않으면, 멀티스텝 작업은 다시 긴 채팅 한 덩어리로 붕괴된다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          '방법론 라이브러리는 모델이 똑똑해 보이게 하는 장식이 아니다. 인터뷰 중 사용자가 막히는 순간에 어떤 사고 프레임을 제안할지 제품이 준비해 두는 개입 장치다.',
          'HARP의 `methodology-reference.md`가 중요한 이유도 여기에 있다. 피라미드 원칙, SCQA, 5 Whys, Logic Model 같은 프레임을 미리 정리해 두면 AI는 즉흥적으로 조언하는 대신 검증된 사고 도구를 꺼내 쓸 수 있다.',
        ],
        title: '방법론은 모델 장식이 아니라 사고 개입 라이브러리다',
      },
      {
        paragraphs: [
          'AXIOM에서 이 라이브러리는 템플릿과 모드 사이를 잇는 다리다. 특정 템플릿이 어떤 구조적 질문을 필요로 하는지, 그리고 사용자가 어떤 프레임으로 생각을 확장해야 하는지를 연결한다.',
          '이 때문에 방법론은 문서 부록이 아니라 인터뷰 설계의 일부가 된다. 좋은 라이브러리는 많이 모으는 것보다 언제 어떤 프레임을 추천할지 명확해야 한다.',
        ],
        title: '추천 타이밍이 라이브러리의 품질을 결정한다',
      },
      {
        bullets: [
          '방법론은 상황-목적-산출물에 매핑되어야 한다.',
          '새 프레임을 추가할 때는 설명보다 산파술 질문 예시를 먼저 채운다.',
          '방법론 선택은 자유 추천보다 mode/template 맥락 안에서 제한하는 편이 품질이 높다.',
        ],
        paragraphs: [
          '다른 플랫폼에 옮길 때도 라이브러리를 PDF 지식창고로 두지 말고, 인터뷰 중 어느 순간에 호출할지까지 함께 옮겨야 한다.',
        ],
        title: '프레임 목록보다 호출 규칙을 같이 옮긴다',
      },
    ],
    category: 'thinking-system',
    navLabel: '방법론 라이브러리',
    relatedSlugs: ['intent-first-interview', 'four-mode-thinking', 'hierarchical-summaries'],
    slug: 'methodology-library',
    sources: [
      createSource('reference', 'C:/dev/HARP/docs/methodology-reference.md'),
      createSource('code', 'src/lib/templates/index.ts'),
      createSource('code', 'src/lib/ai/session-chat.ts'),
    ],
    summary: '무엇을 방법론 라이브러리로 준비해야 인터뷰가 즉흥 조언이 아니라 재현 가능한 사고 지원이 되는지 설명한다.',
    title: '방법론 라이브러리',
    whyItMatters:
      '이식 시 프레임 목록만 옮기고 호출 타이밍을 잃으면, 방법론은 검색 가능한 메모 이상이 되지 못한다.',
  },
];

export { THINKING_SYSTEM_ARTICLES };
