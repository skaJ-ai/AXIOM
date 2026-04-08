import type { IdeationPointArticle, IdeationPointSource } from '../ideation-points-content';

function createSource(kind: IdeationPointSource['kind'], path: string): IdeationPointSource {
  return { kind, path };
}

const FOUNDATION_ARTICLES: IdeationPointArticle[] = [
  {
    blocks: [
      {
        paragraphs: [
          'HR AX 플랫폼의 디자인 시스템은 예쁜 컴포넌트 목록이 아니라 작업면의 기후를 먼저 고정하는 계약이다. Trust within Flow라는 방향은 색, 간격, 반경, 표면 위계, 배지 의미를 토큰으로 먼저 정하고 컴포넌트는 그 위에 쌓는 방식에 가깝다.',
          '이 순서를 지키면 프레임워크가 바뀌어도 제품의 인상은 유지된다. 랜딩, 위키, 워크스페이스가 모두 같은 플랫폼처럼 느껴지는 이유는 버튼 모양보다도 같은 토널 위계와 강조 규칙을 공유하기 때문이다.',
        ],
        title: '토큰이 먼저고 컴포넌트는 그 위에 쌓인다',
      },
      {
        paragraphs: [
          '핵심 원칙은 No-Line Rule과 Tonal Elevation이다. 경계는 1px 선보다 배경 명도 차이, 간격, 얕은 그림자, blur로 만들고, 레이아웃은 카드 안의 카드가 아니라 표면의 층위로 읽히게 해야 한다.',
          '이 접근이 중요한 이유는 작업면이 커질수록 선이 많아질수록 피로가 커지기 때문이다. 넓은 위키나 업무 화면에서도 구조가 보이되 답답하지 않게 하려면, 구획선보다 표면 위계를 먼저 설계해야 한다.',
        ],
        title: '선 대신 표면 위계로 구조를 읽히게 한다',
      },
      {
        paragraphs: [
          '타이포그래피도 장식이 아니라 판단 체계다. headline용 Manrope와 body용 실용 폰트의 이원화는, 내비게이션과 메타데이터는 조용히 두고 섹션 제목과 핵심 문장을 또렷하게 세우기 위한 편집적 장치다.',
          '또한 intentional asymmetry는 단순히 비대칭으로 보이게 만드는 것이 아니라, 넓은 작업면에서 어디를 먼저 읽어야 하는지 시선을 유도하는 설계 원칙이다. 위키처럼 정보량이 많은 화면에서는 이 비대칭이 읽기 리듬을 만든다.',
        ],
        title: '편집적 타이포와 비대칭 리듬이 읽기 경험을 만든다',
      },
      {
        bullets: [
          '색, 간격, 반경, 배지 의미는 플랫폼 중립 토큰으로 관리한다.',
          '경계는 선보다 surface hierarchy와 negative space로 만든다.',
          'headline과 body의 역할을 분리해 정보 밀도와 읽기 리듬을 함께 잡는다.',
        ],
        paragraphs: [
          '다른 플랫폼으로 옮길 때 가장 먼저 보존해야 하는 것은 JSX 구조가 아니라 토큰 계약과 표면 위계 규칙이다. 그래야 새 UI 프레임워크에서도 같은 작업면 감각을 복원할 수 있다.',
        ],
        title: '옮길 때 남겨야 할 것은 마크업보다 시각 판단 규칙이다',
      },
    ],
    category: 'foundation',
    navLabel: '디자인 시스템',
    relatedSlugs: [
      'markdown-canonical-layer',
      'private-first-shared-workspace',
      'storage-structure',
    ],
    slug: 'design-system',
    sources: [
      createSource('reference', '디자인 원칙 메모'),
      createSource('reference', '시각 시스템 가이드'),
      createSource('code', 'src/app/globals.css'),
      createSource('code', 'tailwind.config.ts'),
    ],
    summary:
      '무엇을 보존해야 HR AX 플랫폼의 화면이 다른 작업면에서도 같은 제품처럼 느껴지는지 설명한다.',
    title: '디자인 시스템',
    whyItMatters:
      '이식 시 토큰과 표면 위계를 함께 옮기지 않으면 기능은 살아남아도 제품의 기후와 판단 방식은 사라진다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          'HR AX 플랫폼은 문서의 최종 포맷보다 먼저 공통 언어층을 만든다. `buildDeliverableMarkdown`과 `parseDeliverableMarkdown`은 문서를 Markdown과 섹션 메타데이터로 정규화해, 생성과 편집과 export가 한 원본을 공유하게 만든다.',
          '여기서 중요한 것은 Markdown 그 자체가 아니라 canonical layer라는 발상이다. Word, PDF, 웹 화면은 모두 뷰이고, 제품 내부에서는 구조화된 텍스트가 진짜 원본이 된다.',
        ],
        title: '최종 포맷보다 공통 문서층을 먼저 둔다',
      },
      {
        paragraphs: [
          '이 계층이 있으면 생성 모델은 섹션 구조를 잃지 않고 초안을 만들 수 있고, 사람은 render용 문서를 편집한 뒤 다시 구조화 문서로 복원할 수 있다. 포맷별 export는 마지막 단계의 변환 문제로 뒤로 밀린다.',
          '반대로 canonical layer가 없으면 기능이 늘어날수록 포맷마다 다른 진실이 생긴다. docx export, evidence panel, section compare를 붙일수록 동기화 비용이 폭증한다.',
        ],
        title: '포맷 변환을 기능으로, 원본을 계약으로 분리한다',
      },
      {
        bullets: [
          '원본 문서는 섹션 단위와 메타데이터를 함께 보존해야 한다.',
          '렌더링용 문자열과 저장용 구조를 구분한다.',
          '새 포맷을 붙일 때는 parser와 renderer를 추가하고 core schema는 흔들지 않는다.',
        ],
        paragraphs: [
          '다른 플랫폼에서 이 개념을 가져갈 때도 포맷 지원 목록부터 늘리지 말고, 먼저 공통 문서층을 어디에 둘지부터 정해야 한다.',
        ],
        title: '문서 제품의 확장성은 공통 언어층에서 결정된다',
      },
    ],
    category: 'foundation',
    navLabel: '공통 언어층',
    relatedSlugs: ['design-system', 'source-enrichment', 'trust-tier-promotion'],
    slug: 'markdown-canonical-layer',
    sources: [
      createSource('code', 'src/lib/deliverables/parser.ts'),
      createSource('code', 'src/lib/deliverables/service.ts'),
      createSource('reference', '공통 문서층 설계 메모'),
    ],
    summary:
      '무엇을 공통 원본으로 삼아야 생성, 편집, export가 같은 문서를 바라보게 되는지 설명한다.',
    title: '마크다운은 공통 언어층이다',
    whyItMatters:
      '이식 시 canonical layer를 먼저 세우지 않으면 기능이 늘어날수록 문서의 진실이 포맷마다 분열된다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          'HR AX 플랫폼의 저장 구조는 작업 로그, 출판물, 장기 지식, 검색 서빙 계층을 한 테이블에 섞지 않는 데서 출발한다. `sessions`와 `messages`는 진행 중 사고를 담고, `deliverables`와 `reports`는 사람에게 제출 가능한 문서를 담고, knowledge와 memory는 다시 쓰기 위한 압축 자산을 맡는다.',
          '이 분리는 단순 정규화가 아니라 수명 관리 전략이다. 대화는 자주 바뀌고, 출판물은 버전과 승인 경계를 가지며, 지식은 장기 축적되고, 검색 청크는 재생성 가능한 파생물이다.',
        ],
        title: '수명과 책임이 다른 것은 저장소도 분리한다',
      },
      {
        paragraphs: [
          'Data Lake 관점에서 보면 현재 구조는 축약형 레이어링이다. `sources`와 `messages`는 raw zone에 가깝고, `deliverables`와 `reports`는 사람이 읽는 curated zone이며, `entities`, `facts`, `insights`, `memory_chunks`는 serving zone 또는 feature zone의 역할을 한다.',
          '중요한 점은 레이크가 먼저 있어야 하는 것이 아니라, 지금의 앱 스키마가 이미 미래 레이크의 축을 암시하고 있다는 사실이다. 그래서 확장할 때도 기존 경계를 깨지 않고 ingestion, enrichment, serving을 외부로 분리할 수 있다.',
        ],
        title: '현재 스키마는 미래 Data Lake의 축약형이다',
      },
      {
        bullets: [
          '원문 레이어: `sessions`, `messages`, `sources`',
          '출판 레이어: `deliverables`, `reports`',
          '지식 레이어: `entities`, `facts`, `insights`',
          '서빙 레이어: `memory_chunks`',
        ],
        paragraphs: [
          '다른 플랫폼에 옮길 때 가장 먼저 보존해야 하는 것은 테이블 이름이 아니라 레이어 간 이동 규칙이다. raw를 곧바로 serving으로 밀어 넣지 않는 절제가 나중의 품질을 만든다.',
        ],
        title: '저장 구조를 이식할 때는 레이어 이동 규칙을 먼저 옮긴다',
      },
    ],
    category: 'foundation',
    navLabel: '저장 구조',
    relatedSlugs: ['knowledge-accumulation-pipeline', 'memory-loop', 'vector-memory-schema'],
    slug: 'storage-structure',
    sources: [
      createSource('code', 'src/lib/db/schema.ts'),
      createSource('code', 'src/lib/knowledge/pipeline.ts'),
      createSource('code', 'src/lib/memory/service.ts'),
    ],
    summary:
      '무엇을 raw, publication, knowledge, serving으로 분리해야 나중에 Data Lake로도 확장 가능한지 설명한다.',
    title: '저장 구조',
    whyItMatters:
      '이식 시 저장 경계를 흐리면 품질 문제를 고치기 어렵고, 레이크 확장도 파이프라인 재작성부터 다시 시작하게 된다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          '벡터 메모리는 지식 그래프의 대체물이 아니라 검색 서빙을 위한 실행 스키마다. HR AX 플랫폼은 `memory_chunks`에 source와 deliverable section을 같은 retrieval 표면으로 올리되, 원문 테이블과는 별도로 관리한다.',
          '이 구분 덕분에 chunk는 언제든 다시 만들 수 있다. embedding 모델이 바뀌거나 분할 기준이 바뀌어도 원문 진실을 건드리지 않고 서빙 레이어만 재생성하면 된다.',
        ],
        title: '벡터 메모리는 서빙 계층이지 진실 저장소가 아니다',
      },
      {
        paragraphs: [
          '현재 스키마는 `deliverable_section`과 `source`를 같은 표면에서 검색하게 설계되어 있다. 이는 검색 사용성이 아니라 기억의 단위가 문서 전체가 아니라 재사용 가능한 조각이어야 한다는 판단을 반영한다.',
          '또한 hybrid retrieval은 `memory_chunks`를 전제로 한다. lexical과 semantic을 결합하려면 원문 종류가 달라도 비교 가능한 검색 단위를 먼저 만들어 두어야 한다.',
        ],
        title: '기억의 단위를 통일해 hybrid retrieval의 바닥을 만든다',
      },
      {
        bullets: [
          '`memory_chunks`는 재생성 가능한 파생 데이터다.',
          'chunk 단위는 문서 종류보다 retrieval 목적에 맞춰 잡는다.',
          'embedding 모델 변경에 대비해 원문과 서빙 스키마를 반드시 분리한다.',
        ],
        paragraphs: [
          '다른 플랫폼으로 옮길 때 가장 흔한 실수는 벡터 인덱스를 지식 자체로 취급하는 것이다. HR AX 플랫폼은 그 반대로, 벡터 메모리를 언제든 갈아끼울 수 있는 operational cache로 다룬다.',
        ],
        title: '벡터 메모리를 영구 자산으로 오해하지 않는다',
      },
    ],
    category: 'foundation',
    navLabel: '벡터 메모리',
    relatedSlugs: ['hybrid-retrieval', 'memory-loop', 'storage-structure'],
    slug: 'vector-memory-schema',
    sources: [
      createSource('code', 'src/lib/memory/service.ts'),
      createSource('code', 'src/lib/memory/types.ts'),
      createSource('code', 'src/lib/memory/retrieval.ts'),
      createSource('reference', '검색 서빙 설계 메모'),
    ],
    summary: '무엇을 벡터화된 기억으로 저장하고 무엇을 원문 레이어에 남겨야 하는지 설명한다.',
    title: '벡터 메모리 스키마',
    whyItMatters:
      '이식 시 벡터 인덱스를 원문 진실과 분리하지 않으면 모델 교체나 재색인 시 시스템 전체가 함께 흔들린다.',
  },
];

export { FOUNDATION_ARTICLES };
