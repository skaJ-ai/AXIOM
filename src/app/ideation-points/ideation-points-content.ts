interface IdeationPointBlock {
  bullets?: string[];
  paragraphs: string[];
  title: string;
}

interface IdeationPointArticle {
  blocks: IdeationPointBlock[];
  navLabel: string;
  slug: string;
  sourcePaths: string[];
  summary: string;
  title: string;
  whyItMatters: string;
}

const IDEATION_POINT_ARTICLES: IdeationPointArticle[] = [
  {
    blocks: [
      {
        paragraphs: [
          '현재 디자인 시스템은 컴포넌트보다 토큰을 먼저 두는 구조다. `globals.css`에는 배경, 텍스트, 보더, 그림자, 라운드, 간격, 모드 색상처럼 화면의 의미를 설명하는 토큰이 먼저 정의되어 있고, 그 위에 `surface`, `workspace-card`, `badge`, `btn-*` 같은 프리미티브가 얹혀 있다.',
          '이 방식은 “이 화면이 어떤 브랜드인가”보다 “이 요소가 어떤 역할인가”를 먼저 표현한다. 그래서 프레임워크가 바뀌어도 토큰 계약만 유지하면 같은 경험 밀도를 다시 만들 수 있다.',
        ],
        title: '토큰이 먼저고 컴포넌트는 그 위에 쌓입니다',
      },
      {
        bullets: [
          '배경은 `bg`, `bg-elevated`, `bg-sunken`처럼 깊이 계층으로 분리한다.',
          '텍스트는 `text`, `text-secondary`, `text-tertiary`로 정보 우선순위를 나눈다.',
          '액션 색상과 모드 색상은 같은 시스템 안에서 공존하지만 역할이 겹치지 않게 분리한다.',
          '카드, 버튼, 배지 같은 프리미티브는 토큰을 소비할 뿐 자체 브랜드 의미를 갖지 않는다.',
        ],
        paragraphs: [
          '핵심은 CSS 클래스가 시각 결과를 직접 표현하지 않고 상태와 역할을 표현한다는 점이다. 덕분에 랜딩, 워크스페이스, 위키가 같은 문법으로 보이되 서로 다른 밀도를 가질 수 있다.',
        ],
        title: '다른 플랫폼으로 옮길 때도 유지해야 할 계약',
      },
      {
        paragraphs: [
          '이 시스템은 “예쁜 화면”보다 “사고를 오래 읽어도 피로하지 않은 화면”에 맞춰져 있다. Core Blue와 Teal을 축으로 잡은 것도 장식보다 신뢰와 집중을 우선했기 때문이다.',
          '다른 팀이 이 개념을 가져간다면 색상 값을 그대로 복제할 필요는 없다. 대신 신뢰색, 진행색, 경고색, 정보 계층, 깊이 계층이라는 의미 계약을 먼저 옮겨야 한다.',
        ],
        title: '왜 이런 디자인 시스템이 필요한가',
      },
    ],
    navLabel: '디자인 시스템',
    slug: 'design-system',
    sourcePaths: ['src/app/globals.css'],
    summary: '토큰 중심 디자인 시스템과 프리미티브 계층을 어떻게 옮겨야 하는지 설명합니다.',
    title: '디자인 시스템',
    whyItMatters:
      '브랜드를 다른 플랫폼으로 옮길 때 복제해야 하는 것은 CSS 값이 아니라 역할 계층과 시각 언어의 계약입니다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          'AI-Native 전략이 말한 shared workspace는 현재 HR AX Copilot의 private-first MVP와 충돌하지 않는다. 둘은 방향이 다른 것이 아니라, 단계가 다를 뿐이다. 민감한 HR 작업은 처음부터 공용 공간에 열기보다 개인 작업공간에서 시작하고, 검토를 통과한 결과물만 승격시키는 편이 안전하다.',
          '그래서 HR AX Copilot의 현재 구조는 private를 기본값으로 두되, `deliverable`과 `promoted_asset`을 통해 나중에 연결 가능한 자산 계층을 미리 만드는 방식이다.',
        ],
        title: 'Private-first는 shared workspace의 반대가 아니라 전 단계입니다',
      },
      {
        bullets: [
          '개인 작업공간은 초안, 메모, 붙여넣은 근거, 실험적 대화를 흡수하는 안전지대다.',
          '확정된 결과물과 승격 자산만 다음 공간으로 이동해야 공유 경계가 선명해진다.',
          '팀 공유 공간은 raw chat보다 `promoted_asset`와 템플릿, 검토된 deliverable을 중심으로 열어야 한다.',
          '공개 범위, 버전, 출처, 민감도 메타데이터가 있어야 private와 shared 사이를 안전하게 넘길 수 있다.',
        ],
        paragraphs: [
          '중요한 것은 shared workspace를 채팅 로그 저장소로 오해하지 않는 것이다. 공유되어야 하는 것은 원문 대화가 아니라, 메타데이터와 출처를 가진 승격 자산이다.',
        ],
        title: '공유는 로그 복제가 아니라 자산 승격에서 시작합니다',
      },
      {
        paragraphs: [
          '이 해석을 따르면 AI-Native Working Way의 \"로컬 파일에서 연결된 자산으로\"라는 축을 HR AX Copilot 안에 그대로 옮길 수 있다. 현재는 private-first로 시작하고, 이후 `team shared`나 `org template space`를 `promoted_asset` 중심으로 여는 순서가 맞다.',
          '즉 지금 제품이 private를 강조하는 것은 보수적 후퇴가 아니라, 장기 shared workspace를 오염시키지 않기 위한 정제 단계라고 봐야 한다.',
        ],
        title: 'AI-Native의 shared workspace 축을 지금 구조에 번역하는 방법',
      },
    ],
    navLabel: '작업공간 전략',
    slug: 'private-first-shared-workspace',
    sourcePaths: [
      'src/lib/db/schema.ts',
      'Reference · AI-Native-Working-Way / README.md',
      'Reference · AI-Native-Working-Way / decision brief',
    ],
    summary:
      'private-first MVP와 장기 shared workspace 비전을 충돌 없이 연결하는 작업공간 전략을 설명합니다.',
    title: 'Private-First에서 Shared Workspace로',
    whyItMatters:
      'AI-Native 전략의 shared workspace 축과 HR AX Copilot의 private-first 판단은 상충하지 않습니다. 단계 차이로 해석해야 설계가 일관됩니다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          'AI-Native Working Way가 강조한 마크다운화는 단순 파일 포맷 취향이 아니라, 사람과 AI와 후처리 파이프라인이 동시에 이해할 수 있는 최소 공통 계층을 두자는 뜻이다.',
          'HR AX Copilot은 이미 산출물을 섹션 기반 데이터로 저장하고, 다시 Markdown으로 재구성하고, 그 텍스트를 retrieval와 export의 출발점으로 사용한다. 즉 현재 구조는 사실상 Markdown을 canonical layer로 두고 있다.',
        ],
        title: '최종 포맷보다 먼저 공통 언어 계층이 필요합니다',
      },
      {
        bullets: [
          '근거자료 입력은 먼저 텍스트와 문단 단위로 정규화해야 한다.',
          '산출물은 섹션과 메타데이터 주석을 가진 Markdown으로 재구성할 수 있어야 한다.',
          '`renderMarkdown`, export, tone conversion은 canonical text를 소비하는 뷰 계층이어야 한다.',
          'PPT, Excel, Word는 최종 전달 형식이지 장기 저장의 진실 원본이 아니다.',
        ],
        paragraphs: [
          '포맷 변환이 많아질수록 저장 원본은 더 단순해야 한다. 그래야 섹션별 재생성, diff, 버전 비교, 인용 메타데이터 이동이 쉬워진다.',
        ],
        title: '포맷 변환은 뷰이고 원본은 구조화 텍스트입니다',
      },
      {
        paragraphs: [
          '나중에 Office import나 multi-format export를 붙일 때도 원칙은 같다. 로컬 helper나 파일 어댑터가 원본을 읽더라도, 플랫폼 내부에서는 Markdown 또는 구조화 JSON으로 먼저 정규화해야 한다.',
          '이 계층이 있어야 모델이 바뀌어도 자산을 다시 읽히기 쉽고, section-by-section 생성이나 citation transfer 같은 후속 기능도 무리 없이 붙는다.',
        ],
        title: 'Office 입력과 다중 산출물도 이 계층 위에서 붙어야 합니다',
      },
    ],
    navLabel: '공통 언어',
    slug: 'markdown-canonical-layer',
    sourcePaths: [
      'src/lib/deliverables/parser.ts',
      'src/lib/deliverables/service.ts',
      'Reference · AI-Native-Working-Way / README.md',
      'Reference · AI-Native-Working-Way / ideation notes',
    ],
    summary:
      'Markdown과 구조화 텍스트를 사람, LLM, export pipeline 사이의 canonical layer로 두는 이유를 설명합니다.',
    title: 'Markdown은 공통 언어 계층입니다',
    whyItMatters:
      '출력 포맷이 늘어도 공통 표현 계층이 없으면 재사용, 버전 관리, 출처 연결이 모두 깨집니다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          '선행 설계 문서가 HR AX Copilot에 더해주는 가장 중요한 관점은 인터뷰를 정보 수집이 아니라 의도 명확화로 본다는 점이다. 사용자가 먼저 답해야 하는 질문은 “무엇을 알고 있나”보다 “이 작업으로 어떤 결정을 만들고 싶은가”다.',
          'HR AX Copilot의 모드 체크리스트와 템플릿 체크리스트도 이미 같은 구조를 갖고 있다. `intent` 필드는 단순 라벨이 아니라, 시스템이 사용자의 사고를 어떤 방향으로 좁힐지 결정하는 기준점이다.',
        ],
        title: '좋은 작업은 정보보다 의도부터 묻는 데서 시작합니다',
      },
      {
        bullets: [
          '발산 모드는 먼저 방향과 수렴 기준을 묻는다.',
          '작성 모드는 문서 목적과 독자를 먼저 고정한다.',
          '프롬프트는 체크리스트의 `intent`와 `helpText`를 그대로 소비해 대화 구조를 만든다.',
          '이전 세션 결과와 근거자료도 결국 현재 의도를 더 선명하게 만들기 위한 재료로만 투입된다.',
        ],
        paragraphs: [
          '즉 HR AX Copilot의 인터뷰는 질문을 많이 던지는 챗봇이 아니라, 의사결정 목적을 먼저 압축한 뒤 그 목적에 필요한 재료만 끌어오는 시스템에 가깝다.',
        ],
        title: '체크리스트는 입력폼이 아니라 사고 방향 장치입니다',
      },
      {
        paragraphs: [
          '이 원칙을 위키에 남겨두면 다른 플랫폼으로 옮길 때도 핵심을 놓치지 않는다. 입력 항목 이름은 바뀔 수 있지만, \"의도 우선\"이라는 계약을 잃으면 다시 일반론을 길게 말하는 챗 인터페이스로 후퇴하게 된다.',
          '그래서 intent-first 관점은 HR AX Copilot 위키에 충분히 추가할 만한 내용이다. 구현 세부보다 작업을 여는 질문의 순서를 설계 철학으로 남길 가치가 있다.',
        ],
        title: '이식 시에도 가장 먼저 보존해야 할 질문 순서',
      },
    ],
    navLabel: '의도 중심 인터뷰',
    slug: 'intent-first-interview',
    sourcePaths: [
      'src/lib/modes/index.ts',
      'src/lib/templates/index.ts',
      'src/lib/ai/session-chat.ts',
      'Reference · intent-first interview methodology note',
    ],
    summary:
      '사용자 인터뷰를 정보 수집이 아니라 의사결정 의도를 먼저 정리하는 과정으로 설계한 이유를 설명합니다.',
    title: '의도 중심 인터뷰',
    whyItMatters:
      '좋은 retrieval과 좋은 초안은 결국 올바른 의도 정의에서 시작합니다. 목적을 먼저 고정하지 않으면 컨텍스트만 길어지고 품질은 흐려집니다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          '저장 구조는 세 가지 층으로 나뉜다. 첫째는 사용자와 워크스페이스 경계, 둘째는 세션과 메시지 중심의 작업 로그, 셋째는 산출물과 지식 구조다.',
          '이 분리는 “무엇이 일어났는가”와 “무엇을 남길 것인가”를 분리하기 위한 것이다. 채팅 로그를 전부 장기 지식으로 보지 않고, 승격 규칙을 통과한 데이터만 다음 층으로 이동시킨다.',
        ],
        title: '작업 로그, 출판물, 지식을 한 테이블에 섞지 않습니다',
      },
      {
        bullets: [
          '`sessions`, `messages`, `sources`는 현재 작업의 흐름을 기록하는 이벤트 계층이다.',
          '`deliverables`, `reports`는 사람이 읽고 승인하는 산출물 계층이다.',
          '`entities`, `facts`, `insights`는 장기 재사용을 위한 의미 계층이다.',
          '`memory_chunks`는 검색과 회수를 위한 서빙 계층이다.',
        ],
        paragraphs: [
          '같은 내용이라도 어느 계층에 속하느냐에 따라 수명과 책임이 달라진다. 예를 들어 메시지는 대화 기록이지만, 인사이트는 여러 작업에서 다시 인용할 수 있는 구조화된 지식이다.',
        ],
        title: '테이블 분리는 수명과 책임을 나누기 위한 설계입니다',
      },
      {
        paragraphs: [
          '다른 플랫폼으로 옮길 때도 먼저 질문해야 할 것은 “어디까지를 이벤트 로그로 남길 것인가”와 “무엇을 출판 경계로 삼을 것인가”다. 이 두 경계가 분명해야 이후의 검색, 분석, 거버넌스가 단순해진다.',
          '지식 테이블은 검색 테이블과 동일하지 않다. 구조화된 의미 계층과 빠른 회수를 위한 서빙 계층을 분리해야 이후 확장성이 좋아진다.',
        ],
        title: '이 구조를 이식할 때 가장 먼저 보존해야 할 것',
      },
    ],
    navLabel: '저장 구조',
    slug: 'storage-structure',
    sourcePaths: ['src/lib/db/schema.ts'],
    summary: '세션 로그, 산출물, 장기 지식, 검색 서빙 계층이 왜 분리되어 있는지 설명합니다.',
    title: '저장 구조',
    whyItMatters:
      '작업 로그와 장기 지식을 같은 저장소에서 같은 의미로 다루면, 결국 무엇이 재사용 가능한 자산인지 판단할 수 없게 됩니다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          '현재 `entities`, `facts`, `insights`는 아직 작은 애플리케이션 스키마이지만, 역할만 보면 이미 Data Lake의 축약형이다. `sources`, `messages`, `deliverables`, `reports`는 원천 레이어이고, 추출 파이프라인은 정제 레이어이며, 지식 테이블과 메모리 청크는 소비 레이어 역할을 한다.',
          '즉 HR AX Copilot의 현재 구조는 “앱 안에 들어 있는 소형 데이터 레이크”라고 볼 수 있다. 나중에 별도 플랫폼으로 확장할 때도 이 역할 구분을 유지하면 된다.',
        ],
        title: '현재 구조는 이미 미래 Data Lake의 축약형입니다',
      },
      {
        bullets: [
          '원천 레이어: 세션 메시지, 근거자료, 초안/최종 산출물',
          '정제 레이어: 엔티티 추출, 팩트 정규화, 인사이트 분류',
          '서빙 레이어: 메모리 청크, 검색 인덱스, 위키/대시보드 소비 모델',
          '거버넌스 레이어: 워크스페이스 경계, 상태값, 승격 규칙',
        ],
        paragraphs: [
          '여기서 중요한 것은 레이크의 크기가 아니라 단계다. 한 번에 완전한 데이터 플랫폼을 만들기보다, 지금의 제품 구조 안에 이미 레이크 사고방식을 심어 두는 편이 장기적으로 안전하다.',
        ],
        title: '레이크로 확장할 때의 매핑 방식',
      },
      {
        paragraphs: [
          '다른 플랫폼으로 이 개념을 옮길 때는 스키마 이름보다 파이프라인 경계를 먼저 정의해야 한다. 원천 데이터는 수정하지 않고 쌓고, 정제 레이어는 버전 가능한 추출 규칙으로 관리하고, 서빙 레이어는 다시 생성 가능한 캐시처럼 다루는 편이 낫다.',
          '이렇게 해야 모델이 바뀌거나 추출 규칙이 바뀌어도, 과거 데이터를 새 방식으로 다시 정제할 수 있다.',
        ],
        title: '왜 Data Lake 관점이 필요한가',
      },
    ],
    navLabel: 'Data Lake 방식',
    slug: 'data-lake-mapping',
    sourcePaths: [
      'src/lib/db/schema.ts',
      'src/lib/knowledge/pipeline.ts',
      'src/lib/memory/service.ts',
    ],
    summary: '현재 지식 축적 구조를 미래 Data Lake 아키텍처에 어떻게 매핑할지 설명합니다.',
    title: 'Data Lake 방식',
    whyItMatters:
      '앱 안의 구조를 레이크 사고방식으로 설계해 두면, 제품이 커져도 개념을 재정의하지 않고 저장소만 확장할 수 있습니다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          'AI-Native 자료에서 반복되는 메시지는 교육을 몇 번 더 하는 것으로는 병목이 풀리지 않는다는 점이다. 실제 변화는 사람들이 어떤 단계로 생각하고, 어떤 기준으로 검토하고, 어떤 형식으로 넘길지를 다시 설계할 때 생긴다.',
          'HR AX Copilot이 단순 챗 UI에 머물면 이 원칙을 놓치게 된다. 제품의 역할은 \"AI를 더 써보세요\"가 아니라, 발산-검증-종합-작성의 흐름을 작업 계약으로 굳히는 것이다.',
        ],
        title: '학습보다 흐름을 바꾸는 쪽이 제품 가치입니다',
      },
      {
        bullets: [
          '모드는 지금 어떤 종류의 사고를 해야 하는지 강제한다.',
          '템플릿은 회사 표준 섹션과 필수 입력 항목을 고정한다.',
          'Front Guard와 Back Guard는 품질 변동폭을 줄이는 운영 장치다.',
          '명시적 정리하기와 승격 흐름은 초안과 자산을 분리한다.',
        ],
        paragraphs: [
          '즉 제품이 잘 설계되면 사용자는 AI 사용법을 외우는 대신, 정해진 업무 리듬 안에서 자연스럽게 더 나은 결과물을 만들게 된다.',
        ],
        title: 'HR AX Copilot은 Work Redesign을 모드와 가드로 번역합니다',
      },
      {
        paragraphs: [
          '이 관점에서 보면 이후 필요한 기능도 선명해진다. 맥락 기반 넛지, 짧은 주기 점검, 우수 사례 승격 같은 변화관리 장치는 제품 바깥의 부가물이 아니라 채택률을 높이는 핵심 인터페이스가 된다.',
          '즉 HR AX Copilot은 AI 툴 보급보다 work redesign platform에 가까워야 하며, AI-Native Working Way의 운영 전략은 이 위키에서 충분히 같은 결로 확장할 수 있다.',
        ],
        title: '도입 전략도 결국 제품 안의 인터페이스가 됩니다',
      },
    ],
    navLabel: '업무 재설계',
    slug: 'work-redesign-over-training',
    sourcePaths: [
      'src/lib/modes/index.ts',
      'src/lib/templates/index.ts',
      'Reference · AI-Native-Working-Way / decision brief',
      'Reference · AI-Native-Working-Way / HR Exchange 2026 seminar note',
    ],
    summary:
      'AI를 더 많이 쓰게 하는 것보다, 어떤 단계와 템플릿으로 일할지를 재설계하는 것이 왜 핵심인지 설명합니다.',
    title: 'AI 도입보다 Work Redesign이 먼저입니다',
    whyItMatters:
      '채팅 사용량만 늘리면 품질과 채택률이 함께 흔들립니다. workflow contract를 제품에 심어야 변화가 지속됩니다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          '선행 설계 문서가 HR AX Copilot에 가장 선명하게 보태는 철학은 지식 축적을 사용자 추가 행동에 의존하지 않는다는 점이다. 좋은 시스템이라면 사용자가 \"이것도 저장해야지\"를 매번 의식하지 않아도, 확정된 결과물이 자연스럽게 다음 작업의 맥락이 되어야 한다.',
          'HR AX Copilot 코드도 이미 이 방향에 닿아 있다. 보고서를 `final`로 확정하면 곧바로 knowledge extraction pipeline이 돌고, source와 deliverable은 memory chunk 계층으로 동기화된다.',
        ],
        title: '축적은 보상 기능이 아니라 기본 동작이어야 합니다',
      },
      {
        bullets: [
          '중간 대화는 그대로 장기 지식이 되지 않는다.',
          '사람이 확정한 결과물에서만 구조화 추출이 시작된다.',
          '구조화 지식과 검색 서빙 계층은 자동으로 갱신되되, 역할은 분리된다.',
          '사용자의 명시적 액션은 publish boundary를 통과시키는 데 쓰이고, 그 이후 축적은 시스템이 맡는다.',
        ],
        paragraphs: [
          '이 분리는 중요하다. 축적을 완전히 수동으로 두면 아무것도 쌓이지 않고, 반대로 대화 중간을 전부 자동 축적하면 지식 기반이 오염된다. 따라서 HR AX Copilot은 확정 경계는 사람에게, 축적 작업은 시스템에 맡기는 구조가 맞다.',
        ],
        title: '사람은 확정하고 시스템은 축적합니다',
      },
      {
        paragraphs: [
          '이 개념을 다른 플랫폼으로 옮길 때도 마찬가지다. 사용자 경험은 \"저장 버튼을 더 누르게 하는 것\"이 아니라, 좋은 결과물을 확정하는 순간 그 가치가 다음 작업으로 이어지게 만드는 데서 나온다.',
          '그래서 zero-action accumulation은 HR AX Copilot 위키에 남길 가치가 있다. 이건 기능 추가 제안이 아니라 장기 product behavior를 정의하는 규칙이다.',
        ],
        title: '장기 moat는 저장 습관이 아니라 축적 자동화에서 나옵니다',
      },
    ],
    navLabel: '자동 축적',
    slug: 'zero-action-accumulation',
    sourcePaths: [
      'src/domains/write/actions.ts',
      'src/lib/knowledge/pipeline.ts',
      'src/lib/memory/service.ts',
      'Reference · zero-action accumulation design note',
    ],
    summary:
      '사용자가 추가 저장 습관을 들이지 않아도 확정된 결과물이 자동으로 조직 기억에 편입되어야 하는 이유를 설명합니다.',
    title: 'Zero-Action Accumulation',
    whyItMatters:
      '좋은 자산화 전략은 사용자의 성실함에 기대지 않습니다. publish boundary 뒤의 축적은 시스템 기본 동작이어야 합니다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          '4모드는 기능 카테고리가 아니라 사고 계약이다. 발산은 가능성을 넓히는 단계, 검증은 반론과 리스크를 드러내는 단계, 종합은 여러 근거를 압축하는 단계, 작성은 사람과 조직이 읽을 결과물로 바꾸는 단계다.',
          '중요한 점은 이 네 단계가 서로 다른 품질 기준을 갖는다는 것이다. 발산에서는 양과 다양성이 중요하지만, 작성에서는 구조와 정확도가 더 중요하다.',
        ],
        title: '모드는 UI 탭이 아니라 사고의 상태 기계입니다',
      },
      {
        bullets: [
          '각 모드는 별도의 체크리스트를 가진다.',
          '각 모드는 별도의 starter message와 프롬프트 빌더를 가진다.',
          '모드별 산출물도 다르다. 아이디어, 리뷰, 주장, 보고서 초안은 같은 데이터가 아니다.',
          '세션 전환은 단순 링크 이동이 아니라 결과물 승계 규칙을 동반한다.',
        ],
        paragraphs: [
          '`src/lib/modes/index.ts`가 중요한 이유는 모드 정의를 한 곳에 모아 두었기 때문이다. UI, 프롬프트, 체크리스트가 같은 사전을 공유하므로 제품의 사고 체계가 코드에 흩어지지 않는다.',
        ],
        title: '왜 중앙 카탈로그가 필요한가',
      },
      {
        paragraphs: [
          '다른 플랫폼으로 옮길 때는 먼저 모드를 상태 기계로 모델링해야 한다. “지금 사용자가 무엇을 하려는가”보다 “지금 어떤 종류의 사고를 해야 하는가”를 시스템이 명시적으로 알아야 한다.',
          '이 원칙을 지키면 모델 교체, UI 교체, 저장소 교체가 있어도 4모드 철학은 유지된다.',
        ],
        title: '이 개념을 이식할 때의 핵심 원칙',
      },
    ],
    navLabel: '4모드 사고 체계',
    slug: 'four-mode-thinking',
    sourcePaths: ['src/lib/modes/index.ts'],
    summary: '발산·검증·종합·작성을 별도 사고 상태로 설계한 이유와 이식 원칙을 다룹니다.',
    title: '4모드 사고 체계',
    whyItMatters:
      '탐색과 비판과 요약과 작성이 한 프롬프트에 섞이면 작업 품질 기준이 무너집니다. 모드 분리는 결국 사고 품질 분리입니다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          '지식 자동 축적 파이프라인은 보고서가 최종 상태에 도달했을 때만 작동한다. 초안 단계의 흔들리는 생각을 그대로 장기 지식으로 만들지 않기 위해서다.',
          '파이프라인은 보고서 전체 텍스트를 구성한 뒤 엔티티를 추출하고, 이어서 팩트와 인사이트를 만든다. 즉 “출판 경계”를 지난 뒤에만 구조화가 시작된다.',
        ],
        title: '축적은 대화 중간이 아니라 출판 경계에서 시작합니다',
      },
      {
        bullets: [
          '엔티티는 중복 이름을 피하면서 워크스페이스 지식 그래프의 노드가 된다.',
          '팩트는 숫자, 기간, 단위를 가진 진술로 저장된다.',
          '인사이트는 리스크, 권고, 교훈, 추세 같은 해석 단위로 저장된다.',
          '기본 엔티티가 하나도 없을 때는 대표 엔티티를 기준으로 팩트를 연결해 파이프라인을 끊지 않는다.',
        ],
        paragraphs: [
          '이 파이프라인은 완벽한 NLP가 아니라 “쓸 만한 구조를 계속 누적하는 것”을 목표로 한다. 그래서 실패보다 축적 단절을 더 큰 문제로 본다.',
        ],
        title: '파이프라인이 지키는 실용적 원칙',
      },
      {
        paragraphs: [
          '이 개념을 다른 플랫폼으로 옮길 때도, 실시간 추출보다 출판 시점 추출을 기본값으로 두는 편이 좋다. 사람의 확인을 통과한 결과물에서 구조화를 시작해야 지식 오염이 줄어든다.',
          '나중에 실시간 보조 추출을 추가하더라도, 장기 저장은 별도의 승격 규칙을 통과하도록 분리해야 한다.',
        ],
        title: '왜 이 파이프라인은 최종본 뒤에서 움직이는가',
      },
    ],
    navLabel: '지식 자동 축적',
    slug: 'knowledge-accumulation-pipeline',
    sourcePaths: ['src/domains/write/actions.ts', 'src/lib/knowledge/pipeline.ts'],
    summary: '보고서 확정 이후 엔티티·팩트·인사이트가 생성되는 이유와 설계 철학을 설명합니다.',
    title: '지식 자동 축적 파이프라인',
    whyItMatters:
      '중간 생각을 그대로 장기 지식으로 만들면 지식 기반이 빠르게 오염됩니다. 축적의 시작점은 반드시 출판 경계여야 합니다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          'HR AX Copilot의 AI 메타데이터 마커 시스템은 사람용 응답과 기계용 구조화를 한 번의 모델 출력 안에서 동시에 처리한다. 모델은 자연어 본문 뒤에 HTML 주석 형태의 메타데이터를 붙이고, UI는 이를 화면에서 숨긴 채 별도로 파싱한다.',
          '즉 사용자는 자연스러운 한국어 답변만 보지만, 시스템은 같은 응답에서 아이디어, 클러스터, 리뷰, 주장, 체크리스트, 캔버스 업데이트를 함께 받아 저장한다.',
        ],
        title: '한 번의 응답에 사람용 채널과 기계용 채널을 겹쳐 놓습니다',
      },
      {
        bullets: [
          '`mode-meta:ideas`, `mode-meta:clusters`, `mode-meta:reviews`, `mode-meta:claims`가 모드별 구조화 입력이 된다.',
          '`checklist`, `canvas` 메타데이터는 세션 진행 상태와 우측 캔버스를 갱신한다.',
          '스트리밍 중에는 transform이 메타데이터 시작 지점을 감지해 화면에 노출하지 않는다.',
          '응답이 끝나면 파서가 주석을 읽어 도메인별 저장 로직으로 분배한다.',
        ],
        paragraphs: [
          '이 방식의 장점은 모델 호출 수를 늘리지 않으면서도 UI 상태와 도메인 데이터를 동기화할 수 있다는 점이다. 별도의 후처리 모델을 붙이지 않아도 된다.',
        ],
        title: '왜 주석 기반 마커를 쓰는가',
      },
      {
        paragraphs: [
          '다른 플랫폼으로 옮길 때도 핵심은 “보이는 답변”과 “저장 가능한 구조”를 분리하되, 생성은 한 번에 끝낸다는 원칙이다. 꼭 HTML 주석일 필요는 없지만, 숨김 채널과 노출 채널을 명확히 분리해야 한다.',
          '이 분리가 없으면 UI 친화적 응답과 데이터 친화적 응답이 서로 충돌하게 된다.',
        ],
        title: '이식 시 반드시 남겨야 할 구조',
      },
    ],
    navLabel: 'AI 메타데이터',
    slug: 'ai-metadata-marker-system',
    sourcePaths: ['src/lib/ai/mode-metadata.ts', 'src/lib/ai/session-chat.ts'],
    summary: '보이는 대화와 숨겨진 구조화 마커를 한 응답에 겹쳐 넣는 설계를 설명합니다.',
    title: 'AI 메타데이터 마커 시스템',
    whyItMatters:
      '사람이 읽기 좋은 응답과 시스템이 저장하기 좋은 데이터를 한 번에 얻지 못하면, 결국 추가 호출과 파서 복잡도가 폭증합니다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          '부모 세션 컨텍스트 체이닝의 핵심은 “이전 대화를 그대로 복사하지 않는다”는 점이다. 대신 발산 세션에서는 아이디어와 클러스터, 검증 세션에서는 리뷰, 종합 세션에서는 주장, 작성 세션에서는 보고서나 캔버스를 추출해 다음 세션에 넘긴다.',
          '즉 체이닝 단위는 대화 로그가 아니라 모드별 핵심 산출물이다. 이것이 프롬프트 길이를 줄이고 사고의 선명도를 유지하는 이유다.',
        ],
        title: '맥락은 전문이 아니라 요약된 결과물로 이어집니다',
      },
      {
        bullets: [
          '부모 세션이 발산이면 아이디어와 클러스터를 넘긴다.',
          '부모 세션이 검증이면 리뷰와 제안만 압축해 넘긴다.',
          '부모 세션이 종합이면 확신도를 가진 주장과 발췌 근거를 넘긴다.',
          '부모 세션이 작성이면 최신 보고서나 캔버스 상태를 후속 세션의 출발점으로 사용한다.',
        ],
        paragraphs: [
          '이렇게 해야 모드가 바뀔 때도 필요한 정보만 남고, 불필요한 잡음은 버려진다. 체이닝은 기록 보관이 아니라 작업 전환을 돕는 압축 과정이다.',
        ],
        title: '모드별로 다른 산출물을 연결하는 이유',
      },
      {
        paragraphs: [
          '이 개념을 다른 플랫폼으로 옮길 때도 가장 중요한 질문은 “다음 단계에 무엇이 정말 필요한가”다. 모든 히스토리를 넘기는 것은 안전해 보여도 실제로는 품질과 비용을 모두 악화시킨다.',
          '따라서 체이닝은 항상 typed artifact 기반으로 설계하는 편이 좋다. 대화 로그는 감사용 기록으로 남기고, 전환용 컨텍스트는 별도로 만들어야 한다.',
        ],
        title: '체이닝은 압축 알고리즘이어야 합니다',
      },
    ],
    navLabel: '부모 세션 체이닝',
    slug: 'parent-session-chaining',
    sourcePaths: ['src/lib/ai/session-chat.ts', 'src/lib/sessions/service.ts'],
    summary: '부모 세션을 원문이 아니라 typed artifact로 연결하는 이유와 방식입니다.',
    title: '부모 세션 컨텍스트 체이닝',
    whyItMatters:
      '좋은 체이닝은 과거를 많이 들고 오는 것이 아니라, 다음 단계에 필요한 핵심만 선명하게 전달하는 것입니다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          '선행 설계 문서의 또 다른 강한 포인트는 모든 사고 결과물이 서로 어떤 근거에서 나왔는지를 남겨야 한다는 점이다. 좋은 종합은 단순히 그럴듯한 요약이 아니라, 어떤 주장(Claim)이 어떤 source excerpt에서 출발했는지 다시 추적할 수 있어야 한다.',
          'HR AX Copilot도 이미 `claim_sources` 테이블과 `ClaimWithSources` 타입을 통해 이 관계를 저장하고 있다. 즉 현재 구조는 raw chat transcript보다 typed artifact와 evidence link를 중심으로 설계되어 있다.',
        ],
        title: '좋은 주장에는 항상 다시 따라갈 수 있는 근거가 있어야 합니다',
      },
      {
        bullets: [
          'Claim은 confidence만 갖는 문장이 아니라 source와 excerpt를 동반한 객체다.',
          'Review는 리스크 유형과 페르소나를 남겨 나중에 어떤 관점의 비판이었는지 복원할 수 있다.',
          'Report와 deliverable의 cited/confidence 메타데이터는 최종 표현 단계까지 근거 감각을 끌고 간다.',
          '이 관계가 있어야 검색, 재검증, 인용, 모순 탐지가 가능해진다.',
        ],
        paragraphs: [
          '중요한 것은 knowledge graph를 화려하게 그리는 일이 아니다. 먼저 필요한 것은 “이 결과가 무엇에서 나왔는가”를 잃지 않는 provenance 구조다.',
        ],
        title: '그래프보다 먼저 필요한 것은 provenance입니다',
      },
      {
        paragraphs: [
          '이 원칙을 위키에 남기면 다른 플랫폼으로 옮길 때도 데이터를 어떤 객체 단위로 저장해야 하는지 분명해진다. 세션 로그만 저장하는 시스템과, artifact-evidence link를 남기는 시스템은 장기적으로 전혀 다른 제품이 된다.',
          '그래서 provenance/evidence link는 HR AX Copilot에 남길 만한 추가 주제다. 현재 위키의 저장 구조와 메모리 루프 사이를 연결해 주는 핵심 개념이기도 하다.',
        ],
        title: '저장 구조와 지식 활용 사이를 연결하는 계약',
      },
    ],
    navLabel: '근거 연결',
    slug: 'provenance-and-evidence-links',
    sourcePaths: [
      'src/lib/db/schema.ts',
      'src/domains/synthesize/types.ts',
      'src/domains/synthesize/actions.ts',
      'src/domains/validate/types.ts',
      'Reference · provenance and evidence design note',
    ],
    summary:
      '주장, 리뷰, 최종 표현이 각각 어떤 근거와 관점에서 나왔는지 추적 가능하게 남기는 provenance 구조를 설명합니다.',
    title: 'Provenance와 Evidence Link',
    whyItMatters:
      '장기적으로 재사용 가능한 지식은 텍스트 양이 아니라 추적 가능성에서 나옵니다. 무엇이 어디서 나왔는지 잃으면 재검증이 불가능합니다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          '메모리 루프는 의미 지식 계층과 별도로 존재하는 검색 서빙 계층이다. 소스 문서와 확정된 산출물은 `memory_chunks`로 잘게 나뉘어 임베딩과 함께 저장되고, 이후 검색과 회수의 재료가 된다.',
          '중요한 점은 이 계층이 “진실의 원본”이 아니라 “다시 찾기 쉬운 서빙 캐시”라는 점이다. 그래서 활성/폐기 상태를 두고 언제든 재생성할 수 있게 설계되어 있다.',
        ],
        title: '메모리 청크는 지식 그래프가 아니라 회수용 서빙 계층입니다',
      },
      {
        bullets: [
          '소스는 문단 기반으로 분할하고 너무 길면 길이 기준으로 다시 쪼갠다.',
          '산출물은 draft 상태일 때는 청크를 만들지 않고, 확정된 뒤에만 청크를 유지한다.',
          '새 버전이 생기면 기존 청크는 `superseded`로 내려 stale retrieval을 막는다.',
          '청크는 세션, 산출물, 템플릿 타입, 워크스페이스와 연결되어 후속 검색 조건으로 활용된다.',
        ],
        paragraphs: [
          '즉 메모리 루프는 “모든 것을 영구 저장”하는 시스템이 아니라, 다시 불러와야 할 텍스트를 재생성 가능한 인덱스로 관리하는 시스템이다.',
        ],
        title: '왜 버저닝과 재생성이 핵심인가',
      },
      {
        paragraphs: [
          '다른 플랫폼으로 옮길 때도 retrieval layer를 semantic layer와 분리해야 한다. 엔티티·팩트·인사이트는 해석 가능한 구조이고, 메모리 청크는 문맥 회수를 위한 텍스트 조각이기 때문이다.',
          '이 둘을 합치면 검색 속도와 해석 가능성 중 어느 것도 잘 확보하기 어렵다.',
        ],
        title: '의미 계층과 검색 계층을 분리해야 하는 이유',
      },
    ],
    navLabel: '메모리 루프',
    slug: 'memory-loop',
    sourcePaths: ['src/lib/db/schema.ts', 'src/lib/memory/service.ts'],
    summary: '메모리 청크를 장기 지식과 분리된 서빙 계층으로 보는 이유를 설명합니다.',
    title: '세션-산출물-메모리 루프',
    whyItMatters:
      '검색 인덱스는 다시 만들 수 있어야 하고, 의미 지식은 해석 가능한 구조여야 합니다. 이 둘의 책임을 나누는 것이 장기 확장성의 핵심입니다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          '이 항목은 기술 구현 명세가 아니라 제품 아키텍처 초안이다. 현재로서는 Knox, 메일, 일정, 사내 시스템이 각각 어떤 API로 붙을지 확정되지 않았기 때문에, 위키는 특정 시스템 이름보다 사용자가 수행할 수 있는 행동 계약을 먼저 정의해야 한다.',
          '따라서 Connector / Action Layer는 시스템 카탈로그가 아니라 capability 계층으로 적는 편이 맞다. 메일과 일정과 포털 기능이 나중에 Knox Portal API 하나로 묶여 들어오더라도, 제품 개념은 그대로 유지되어야 한다.',
        ],
        title: '이 문서는 API 설계가 아니라 행동 계약 초안입니다',
      },
      {
        bullets: [
          'Communication Surface: 메일, 일정, 알림',
          'Enterprise Surface: HR 시스템, 결재/포털, 문서/게시',
          'Action Policy: `read`, `draft`, `write`, `approval-gated write`',
          'Adapter Strategy: 초기 구현은 Knox adapter 하나일 수 있지만, 위키 개념은 capability 기준으로 유지한다.',
        ],
        paragraphs: [
          '즉 위키에는 “무슨 시스템과 붙는가”보다 “어떤 종류의 액션을 안전하게 대신할 수 있는가”를 먼저 남긴다. 구현자는 이후 Knox adapter, 메일 adapter, 사내 API adapter 같은 구조로 풀 수 있지만, 사용자 경험은 capability 레이어에서 이해되어야 한다.',
        ],
        title: '시스템명보다 액션 타입으로 분류합니다',
      },
      {
        paragraphs: [
          '초기 단계에서는 `read`와 `draft`를 먼저 열고, `write`는 승인 경계를 둔 뒤 점진적으로 확장하는 편이 안전하다. 예를 들어 메일 조회와 일정 추천은 바로 가능해도, 발송과 일정 생성과 시스템 입력은 사용자 승인 이후에만 실행되도록 남겨야 한다.',
          '정리하면 Connector / Action Layer 초안은 “Knox API가 모든 것을 해결한다”가 아니라, “어떤 adapter가 오더라도 동일한 read/write/approval boundary를 적용한다”는 계약으로 쓰는 것이 맞다.',
        ],
        title: '구현이 바뀌어도 경계는 유지되어야 합니다',
      },
    ],
    navLabel: 'Connector 초안',
    slug: 'connector-action-layer-draft',
    sourcePaths: [
      'Draft · Knox / mail / calendar / enterprise API adapter',
      'Draft · read / draft / write / approval-gated write policy',
    ],
    summary:
      'Knox, 메일, 일정, 사내 시스템 연동을 특정 API 목록이 아니라 capability와 action boundary 관점으로 설명하는 초안입니다.',
    title: 'Connector / Action Layer 초안',
    whyItMatters:
      '지금 단계에서 시스템 이름에 아키텍처를 묶으면 구현이 바뀔 때 위키가 곧바로 낡습니다. 먼저 액션 계약을 고정해야 이후 adapter 변화에도 제품 개념이 흔들리지 않습니다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          'Governance도 선언적 가치 문구로만 적으면 의미가 약하다. HR AX 플랫폼에서 중요한 것은 “누가 무엇을 볼 수 있는가”만이 아니라, “누가 어떤 조건에서 무엇을 실행할 수 있는가”를 명시적으로 나누는 것이다.',
          '그래서 governance 초안은 권한 문서라기보다 action boundary 문서에 가깝다. 특히 외부 LLM과 내부 시스템이 함께 붙는 구조에서는 데이터 경계와 실행 경계를 따로 적어 두어야 한다.',
        ],
        title: 'Governance는 액션 경계 설계 초안입니다',
      },
      {
        bullets: [
          'Identity: 개인, 팀, Working Group, 관리자 단위 권한',
          'Data Boundary: 원문 전송 금지, 요약 전송 허용, 마스킹 후 외부 LLM 전송 같은 규칙',
          'Action Boundary: `read only`, `draft only`, `approval required`, `auto-executable`',
          'Approval: 메일 발송, 일정 생성, 시스템 입력 같은 write 액션의 승인자 지정',
          'Audit & Provenance: 누가 어떤 맥락과 어떤 경로로 액션을 실행했는지 기록',
          'Fallback: 자동 실행 실패 시 사람이 어디서 이어받는지 정의',
        ],
        paragraphs: [
          '이 축들이 있어야 Copilot, Agent, Connector가 각각 어디까지 허용되는지 같은 표에서 읽을 수 있다. governance는 추상 윤리 문구보다 운영 가능한 정책 매트릭스로 남겨야 한다.',
        ],
        title: '정책 매트릭스로 채워야 할 기본 축',
      },
      {
        paragraphs: [
          '예시로는 메일 조회는 `read`, 메일 초안 작성은 `draft`, 메일 발송은 `approval-gated write`, 일정 추천은 `draft`, 일정 생성은 `approval-gated write`, HR 시스템 조회는 `read`, 시스템 입력은 `approval required` 정도로 시작할 수 있다.',
          '즉 governance 초안의 핵심 질문은 “무엇을 누가 볼 수 있나”보다 “무엇을 누구 승인 없이 쓸 수 없나”다. 이 문장을 위키에 남겨 두면 기술 구조가 바뀌어도 플랫폼 운영 원칙은 유지된다.',
        ],
        title: '정책은 read/write보다 approval boundary에서 갈립니다',
      },
    ],
    navLabel: 'Governance 초안',
    slug: 'governance-draft',
    sourcePaths: [
      'Draft · identity / data boundary / action boundary matrix',
      'Draft · approval / audit / fallback policy',
    ],
    summary:
      '권한, 데이터 전송, 승인, 감사 로그를 추상 철학이 아니라 action boundary 매트릭스로 정리하는 governance 초안입니다.',
    title: 'Governance 초안',
    whyItMatters:
      '외부 LLM과 사내 시스템이 함께 붙는 순간, 실패 지점은 모델 성능보다 경계 설계에서 먼저 생깁니다. governance는 나중 보완 항목이 아니라 플랫폼 기본 구조여야 합니다.',
  },
];

function getIdeationPointBySlug(slug: string): IdeationPointArticle | undefined {
  return IDEATION_POINT_ARTICLES.find((article) => article.slug === slug);
}

export { IDEATION_POINT_ARTICLES, getIdeationPointBySlug };
export type { IdeationPointArticle, IdeationPointBlock };
