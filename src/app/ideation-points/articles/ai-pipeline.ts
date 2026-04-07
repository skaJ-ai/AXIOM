import type { IdeationPointArticle, IdeationPointSource } from '../ideation-points-content';

function createSource(kind: IdeationPointSource['kind'], path: string): IdeationPointSource {
  return { kind, path };
}

const AI_PIPELINE_ARTICLES: IdeationPointArticle[] = [
  {
    blocks: [
      {
        paragraphs: [
          'AXIOM은 보이는 답변과 숨겨진 구조화 데이터를 한 응답 안에 겹쳐 싣는다. `mode-meta`, `checklist`, `canvas` 마커는 사용자에게는 자연스러운 대화처럼 보이지만 시스템에는 다음 상태를 갱신할 수 있는 패킷이 된다.',
          '이 설계의 장점은 자연어와 구조화 출력을 별도 호출로 나누지 않는다는 점이다. 한 번의 생성이 사람의 읽기 경험과 시스템의 상태 동기화를 동시에 만족시킨다.',
        ],
        title: '사람용 채널과 기계용 채널을 한 응답에 겹쳐 놓는다',
      },
      {
        paragraphs: [
          '주석 기반 마커를 쓰는 이유는 포맷 자체보다 경계를 명확히 하기 위해서다. UI는 visible text만 흘리고, 시스템은 마커 안의 JSON만 파싱하면 되므로 둘의 책임이 섞이지 않는다.',
          '이 방식은 모델 교체에도 상대적으로 강하다. 프롬프트에 마커 계약만 유지하면, 내부 상태 동기화 로직을 UI와 분리한 채 재사용할 수 있다.',
        ],
        title: '마커는 구조화 출력의 최소 계약이다',
      },
      {
        bullets: [
          '자연어 본문과 메타데이터는 같은 응답이지만 서로 다른 소비 경로를 가진다.',
          '메타데이터는 주석 안의 JSON으로 제한해 파싱 실패 범위를 줄인다.',
          '마커 계약은 새 모드나 새 캔버스를 붙일 때 가장 먼저 확장한다.',
        ],
        paragraphs: [
          '이식 시에는 예쁜 출력 포맷보다 먼저 invisible channel을 어디에 둘지 결정해야 한다. 그 경계를 잃으면 상태 동기화가 다시 API 스파게티가 된다.',
        ],
        title: '보이지 않는 채널이 제품의 상태 일관성을 만든다',
      },
    ],
    category: 'ai-pipeline',
    navLabel: '메타데이터 마커',
    relatedSlugs: ['parent-session-chaining', 'hierarchical-context-system', 'four-mode-thinking'],
    slug: 'ai-metadata-marker-system',
    sources: [
      createSource('code', 'src/lib/ai/mode-metadata.ts'),
      createSource('code', 'src/lib/ai/session-chat.ts'),
      createSource('code', 'src/lib/sessions/service.ts'),
    ],
    summary:
      '무엇을 자연어 응답 안에 숨겨 두어야 사용자 경험을 깨지 않고도 시스템 상태를 함께 갱신할 수 있는지 설명한다.',
    title: 'AI 메타데이터 마커 시스템',
    whyItMatters:
      '이식 시 visible text와 machine payload를 분리해 생각하지 않으면 멀티모드 상태 동기화가 곧바로 취약해진다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          '부모 세션 체이닝의 핵심은 이전 대화를 통째로 끌어오는 것이 아니라, 다음 모드가 실제로 필요로 하는 artifact만 압축해 전달하는 것이다. `getParentSessionArtifacts`는 모드별 산출물을 다른 타입으로 불러오고, 프롬프트에는 요약된 형태로 주입한다.',
          '이 접근은 컨텍스트 길이를 아끼기 위한 절약이기도 하지만, 더 본질적으로는 각 모드가 무엇을 결과물로 남겨야 하는지 강제한다. 발산 모드는 아이디어와 클러스터, 검증은 리뷰, 종합은 claim, 작성은 보고서나 캔버스를 남긴다.',
        ],
        title: '맥락은 원문이 아니라 typed artifact로 이어진다',
      },
      {
        paragraphs: [
          '체이닝이 압축 알고리즘이어야 하는 이유는 원문 대화가 다음 단계의 최적 입력이 아니기 때문이다. 다음 모드가 필요한 것은 이야기 전체가 아니라, 이전 모드가 끝내며 남긴 결정과 구조다.',
          '그래서 좋은 세션 체인은 기억을 많이 들고 가는 구조가 아니라, 필요한 것만 정제해 들고 가는 구조다. 이 차이가 길이가 긴 챗 기록과 작업 가능한 상태 전이를 가른다.',
        ],
        title: '다음 단계는 이전 대화보다 이전 결과물을 더 원한다',
      },
      {
        bullets: [
          '부모 체인은 모드별 artifact 스키마를 전제로 한다.',
          '텍스트를 다시 읽게 하기보다 결과를 읽게 해야 전환 비용이 낮다.',
          '모드가 늘어날수록 체인은 더 중요해지고, 프롬프트는 오히려 짧아질 수 있다.',
        ],
        paragraphs: [
          '이식 시에는 parent-child 세션 관계를 단순 링크로 두지 말고, 어떤 산출물을 어떻게 압축해 전달할지 먼저 정해야 한다.',
        ],
        title: '세션 링크보다 산출물 handoff 규칙이 중요하다',
      },
    ],
    category: 'ai-pipeline',
    navLabel: '부모 세션 체인',
    relatedSlugs: ['four-mode-thinking', 'ai-metadata-marker-system', 'hierarchical-summaries'],
    slug: 'parent-session-chaining',
    sources: [
      createSource('code', 'src/lib/sessions/service.ts'),
      createSource('code', 'src/lib/ai/session-chat.ts'),
      createSource('code', 'src/lib/sessions/types.ts'),
    ],
    summary:
      '무엇을 부모 세션의 결과물로 압축해 전달해야 긴 대화를 다시 읽지 않고도 다음 모드가 이어질 수 있는지 설명한다.',
    title: '부모 세션 컨텍스트 체이닝',
    whyItMatters:
      '이식 시 원문 대화만 넘기면 컨텍스트 비용은 늘고 단계 간 책임 분리는 오히려 약해진다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          '계층형 요약의 목적은 원문을 버리는 것이 아니라, 원문 위에 operational memory를 한 층 더 얹는 데 있다. HARP 설계의 `session_digests`와 `template_weekly_rollups`는 이 생각을 명확하게 드러낸다.',
          '세션 요약은 단순한 대화 축약본이 아니다. 최근 대화, checklist 상태, source enrichment, 최신 deliverable을 함께 읽고 이번 세션이 무엇을 결정했고 무엇이 비어 있는지를 압축한다.',
        ],
        title: '요약은 원문 대체가 아니라 압축 레이어다',
      },
      {
        paragraphs: [
          '중요한 것은 요약의 단위를 세션과 템플릿으로 나눴다는 점이다. 먼저 session digest가 현장의 operational memory가 되고, 그 다음 template weekly rollup이 반복 패턴을 읽는 집계 메모리가 된다.',
          '이 구조는 retrieval이 raw text에 과도하게 의존하는 문제를 줄여 준다. 오래된 기록을 다 읽지 않고도, 지금 무엇을 다시 봐야 하는지 훨씬 빠르게 판단할 수 있다.',
        ],
        title: '세션 요약과 주간 롤업은 서로 다른 기억 계층이다',
      },
      {
        bullets: [
          '`session_digests`는 현재 세션의 상태를 압축한다.',
          '`template_weekly_rollups`는 반복 이슈와 근거 부족 패턴을 축적한다.',
          '요약은 원문 삭제가 아니라 stale/pending/ready 상태를 갖는 별도 artifact여야 한다.',
        ],
        paragraphs: [
          '다른 플랫폼으로 옮길 때도 요약 기능을 채팅 요약 버튼으로 시작하지 말고, 어떤 운영 기억을 남길 것인지부터 정의하는 편이 맞다.',
        ],
        title: '요약 버튼보다 운영 기억 설계가 먼저다',
      },
    ],
    category: 'ai-pipeline',
    navLabel: '계층형 요약',
    relatedSlugs: ['parent-session-chaining', 'context-tiering', 'knowledge-accumulation-pipeline'],
    slug: 'hierarchical-summaries',
    sources: [
      createSource('reference', 'C:/dev/HARP/docs/feature-hierarchical-summaries.md'),
      createSource('code', 'src/lib/sessions/service.ts'),
      createSource('code', 'src/lib/deliverables/service.ts'),
    ],
    summary:
      '무엇을 session digest와 weekly rollup으로 나눠 저장해야 원문 위에 operational memory를 얹을 수 있는지 설명한다.',
    title: '계층형 요약',
    whyItMatters:
      '이식 시 요약을 단순 축약본으로 다루면 기억 계층이 생기지 않고, 장기 사용 시 retrieval 비용만 계속 커진다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          '컨텍스트 티어링은 더 많은 참고문서를 넣는 기법이 아니라, 어떤 맥락을 어느 해상도로 넣을지 계층화하는 설계다. HARP 문서가 제안한 3-tier 구조는 이 원칙을 잘 보여 준다.',
          'Tier 1은 현재 세션의 대화와 근거자료를 전량 주입하고, Tier 2는 최근 동일 유형 산출물을 상세에서 구조 순으로 축약해 넣는다. 최신 것은 전체, 그 이전 것은 요약, 더 오래된 것은 섹션 구조만 보여 주는 식이다.',
        ],
        title: '맥락은 많을수록 좋은 것이 아니라 해상도가 맞아야 한다',
      },
      {
        paragraphs: [
          '이 방식이 중요한 이유는 long context pressure를 줄이면서도 패턴 재사용을 가능하게 하기 때문이다. 최근 문서는 그대로 읽고, 오래된 문서는 구조만 참고하면 모델은 같은 정보를 더 적은 토큰으로 소비할 수 있다.',
          '또한 티어링은 retrieval과 경쟁하지 않는다. 오히려 recent reference와 semantic reference를 분리해 보여 줌으로써 모델이 서로 다른 성격의 맥락을 혼동하지 않게 한다.',
        ],
        title: '상세와 구조를 나눠 넣어야 패턴은 남고 비용은 줄어든다',
      },
      {
        bullets: [
          'Tier 1은 현재 세션, Tier 2는 최근 동일 유형 산출물, Tier 3는 향후 전역 검색으로 확장된다.',
          '가장 최근 산출물은 전체를, 이전 산출물은 섹션 요약과 구조만 넣는다.',
          'semantic retrieval 블록은 recent reference 블록과 별도로 유지해야 해석 충돌이 줄어든다.',
        ],
        paragraphs: [
          '이식 시에는 컨텍스트 길이 상한부터 맞추지 말고, 각 층이 모델에게 어떤 역할을 하는지 먼저 정의해야 한다.',
        ],
        title: '토큰 최적화보다 맥락 역할 분리가 우선이다',
      },
    ],
    category: 'ai-pipeline',
    navLabel: '컨텍스트 티어',
    relatedSlugs: ['hierarchical-summaries', 'hybrid-retrieval', 'parent-session-chaining'],
    slug: 'context-tiering',
    sources: [
      createSource('reference', 'C:/dev/HARP/docs/feature-context-tiering.md'),
      createSource('code', 'src/lib/deliverables/service.ts'),
      createSource('code', 'src/lib/ai/session-chat.ts'),
    ],
    summary:
      '무엇을 현재 세션, 최근 산출물, 검색 결과로 나눠 다른 해상도로 주입해야 안정적인 생성 맥락이 되는지 설명한다.',
    title: '컨텍스트 티어링',
    whyItMatters:
      '이식 시 모든 참고자료를 같은 해상도로 밀어 넣으면 비용은 커지고, 모델은 무엇을 우선해야 할지 구분하지 못한다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          'source enrichment는 raw source를 더 많이 저장하는 일이 아니라, 나중에 evidence trace와 retrieval이 사용할 구조를 먼저 빚어 두는 작업이다. HARP 실행 계획이 `source_blocks`, `deliverable_section_evidence`를 제안하는 이유도 여기에 있다.',
          'AXIOM의 현재 구현은 parser와 deliverable section metadata를 통해 이 방향의 초석을 이미 갖고 있다. section의 confidence와 cited 여부는 단순 표시가 아니라 나중에 더 정교한 evidence 구조로 갈 수 있는 발판이다.',
        ],
        title: '원문 수집에서 끝내지 않고 재사용 가능한 구조를 만든다',
      },
      {
        paragraphs: [
          'source enrichment가 중요한 이유는 검색 품질보다 검수성 때문이다. 어떤 section이 어떤 source block을 썼는지 남길 수 있어야 reviewer가 추정과 근거를 구분할 수 있다.',
          '또한 enrichment는 ingestion의 품질을 product surface로 올리는 역할도 한다. 파일 파싱 상태, block 추출, table 추출 같은 메타데이터가 있어야 사용자는 시스템이 무엇을 읽었는지 판단할 수 있다.',
        ],
        title: '풍부화는 retrieval보다 traceability를 위해 필요하다',
      },
      {
        bullets: [
          'raw source, parsed block, evidence link는 서로 다른 레이어로 둔다.',
          '파서가 남긴 메타데이터는 나중의 검수 UI를 위한 최소 단위다.',
          '풍부화는 자동화 목표가 아니라 사람 검토를 더 빠르게 만드는 목표로 설계한다.',
        ],
        paragraphs: [
          '다른 플랫폼에서도 source enrichment를 OCR나 파싱 기능으로만 보지 말고, 이후 검증과 export를 위한 구조적 준비 단계로 봐야 한다.',
        ],
        title: '파싱 성공보다 이후 행동을 열 수 있는지가 더 중요하다',
      },
    ],
    category: 'ai-pipeline',
    navLabel: '소스 풍부화',
    relatedSlugs: [
      'provenance-and-evidence-links',
      'human-in-the-loop',
      'markdown-canonical-layer',
    ],
    slug: 'source-enrichment',
    sources: [
      createSource('code', 'src/lib/deliverables/parser.ts'),
      createSource('code', 'src/lib/deliverables/service.ts'),
      createSource('reference', 'C:/dev/HARP/JARVIS/07_execution_plan.md'),
    ],
    summary:
      '무엇을 source enrichment로 미리 구조화해야 retrieval, evidence trace, export가 나중에 붙을 수 있는지 설명한다.',
    title: '소스 풍부화',
    whyItMatters:
      '이식 시 source를 content blob으로만 저장하면 나중의 evidence panel과 reviewer 경험을 거의 처음부터 다시 설계해야 한다.',
  },
];

export { AI_PIPELINE_ARTICLES };
