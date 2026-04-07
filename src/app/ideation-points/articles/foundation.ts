import type { IdeationPointArticle, IdeationPointSource } from '../ideation-points-content';

function createSource(kind: IdeationPointSource['kind'], path: string): IdeationPointSource {
  return { kind, path };
}

const FOUNDATION_ARTICLES: IdeationPointArticle[] = [
  {
    blocks: [
      {
        paragraphs: [
          'AXIOM의 디자인 시스템은 예쁜 컴포넌트 목록이 아니라 토큰을 먼저 고정하는 계약이다. 색, 그림자, 반경, 간격, 모드 배지는 모두 `src/app/globals.css`의 토큰에서 시작하고, UI 프리미티브는 그 토큰을 조합해 표면을 만든다.',
          '이 순서를 지키면 플랫폼이 바뀌어도 남는 것은 버튼 구현이 아니라 화면의 기후다. React가 아니어도 동일한 간격 체계와 강조 규칙만 보존하면 위키, 워크스페이스, 검색 패널이 같은 제품으로 인식된다.',
        ],
        title: '토큰이 먼저고 컴포넌트는 그 위에 쌓인다',
      },
      {
        paragraphs: [
          '버튼, 배지, 카드 같은 프리미티브는 재사용성보다 문맥 일관성을 위해 존재한다. 예를 들어 warning, accent, neutral 배지는 색만 다른 것이 아니라 제품이 어떤 위험과 결정을 읽게 할지까지 정한다.',
          '다른 플랫폼으로 옮길 때는 컴포넌트 이름을 복제하기보다 토큰 맵과 상태 의미를 먼저 옮겨야 한다. 그래야 새 UI 프레임워크에서도 같은 강조 체계를 복원할 수 있다.',
        ],
        title: '재사용성보다 상태 의미를 고정한다',
      },
      {
        bullets: [
          '토큰은 플랫폼 중립 자산으로 분리한다. 색, 간격, 반경, 모드 색상은 CSS가 아니라 설계 언어다.',
          '프리미티브는 토큰 소비 계층으로 유지한다. 카드와 배지의 역할 정의가 바뀌면 화면 전체의 메시지도 바뀐다.',
          '시각 언어를 바꾸더라도 accent, warning, neutral의 판단 체계는 유지한다.',
        ],
        paragraphs: [
          '이식이 실패하는 경우는 보통 컴포넌트 마크업만 옮기고 토큰 계약을 놓칠 때다. 그러면 화면은 비슷해 보여도 제품이 어떤 상태를 중요하게 보는지 드러나지 않는다.',
        ],
        title: '옮길 때 남겨야 할 것은 코드가 아니라 판단 규칙이다',
      },
    ],
    category: 'foundation',
    navLabel: '디자인 토큰',
    relatedSlugs: [
      'markdown-canonical-layer',
      'private-first-shared-workspace',
      'storage-structure',
    ],
    slug: 'design-system',
    sources: [
      createSource('code', 'src/app/globals.css'),
      createSource('code', 'src/components/ui/button.tsx'),
      createSource('code', 'src/app/workspace/layout.tsx'),
    ],
    summary:
      '무엇을 보존해야 AXIOM의 화면을 다른 플랫폼에서도 같은 제품처럼 느끼게 되는지 설명한다.',
    title: '디자인 시스템',
    whyItMatters:
      '이식 시 토큰과 상태 의미를 함께 옮기지 않으면 기능은 살아남아도 제품의 판단 방식이 사라진다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          'AXIOM은 문서의 최종 포맷보다 먼저 공통 언어층을 만든다. `buildDeliverableMarkdown`과 `parseDeliverableMarkdown`은 문서를 Markdown과 섹션 메타데이터로 정규화해, 생성과 편집과 export가 한 원본을 공유하게 만든다.',
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
      createSource('reference', 'C:/dev/HARP/JARVIS/07_execution_plan.md'),
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
          'AXIOM의 저장 구조는 작업 로그, 출판물, 장기 지식, 검색 서빙 계층을 한 테이블에 섞지 않는 데서 출발한다. `sessions`와 `messages`는 진행 중 사고를 담고, `deliverables`와 `reports`는 사람에게 제출 가능한 문서를 담고, knowledge와 memory는 다시 쓰기 위한 압축 자산을 맡는다.',
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
          '벡터 메모리는 지식 그래프의 대체물이 아니라 검색 서빙을 위한 실행 스키마다. AXIOM은 `memory_chunks`에 source와 deliverable section을 같은 retrieval 표면으로 올리되, 원문 테이블과는 별도로 관리한다.',
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
          '다른 플랫폼으로 옮길 때 가장 흔한 실수는 벡터 인덱스를 지식 자체로 취급하는 것이다. AXIOM은 그 반대로, 벡터 메모리를 언제든 갈아끼울 수 있는 operational cache로 다룬다.',
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
      createSource('reference', 'C:/dev/HARP/docs/feature-hybrid-retrieval.md'),
    ],
    summary: '무엇을 벡터화된 기억으로 저장하고 무엇을 원문 레이어에 남겨야 하는지 설명한다.',
    title: '벡터 메모리 스키마',
    whyItMatters:
      '이식 시 벡터 인덱스를 원문 진실과 분리하지 않으면 모델 교체나 재색인 시 시스템 전체가 함께 흔들린다.',
  },
];

export { FOUNDATION_ARTICLES };
