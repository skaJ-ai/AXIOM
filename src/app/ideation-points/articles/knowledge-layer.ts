import type { IdeationPointArticle, IdeationPointSource } from '../ideation-points-content';

function createSource(kind: IdeationPointSource['kind'], path: string): IdeationPointSource {
  return { kind, path };
}

const KNOWLEDGE_LAYER_ARTICLES: IdeationPointArticle[] = [
  {
    blocks: [
      {
        paragraphs: [
          'Zero-Action Accumulation은 사용자가 따로 저장 버튼을 누르지 않아도, 확정된 작업이 다음 작업의 자산으로 남아야 한다는 제품 철학이다. 축적을 보상 기능으로 두면 사용자는 바쁠수록 기록하지 않고, 결국 시스템은 비어 있는 저장소가 된다.',
          '따라서 HR AX 플랫폼은 축적을 사용자 습관이 아니라 기본 동작으로 보려 한다. 사람이 확정하고 시스템이 뒤에서 축적하는 구조가 핵심이다.',
        ],
        title: '축적은 추가 행동이 아니라 기본 동작이어야 한다',
      },
      {
        paragraphs: [
          '이 철학은 구현 세부와 구분해서 봐야 한다. pipeline이 어떻게 돌아가는지는 다음 단계의 문제이고, zero-action은 왜 제품이 저장 책임을 사용자에게 넘기지 말아야 하는지를 설명한다.',
          '제품 차원에서 보면 이것은 moat 전략이기도 하다. 좋은 작업이 반복될수록 더 많은 자산이 남는 구조여야 팀 전체의 품질이 시간이 지날수록 오른다.',
        ],
        title: '사람은 확정하고 시스템은 축적하는 역할 분담',
      },
      {
        bullets: [
          '축적은 opt-in 기능보다 default behavior여야 한다.',
          '사용자에게 저장 습관을 요구하는 제품은 장기적으로 자산이 쌓이지 않는다.',
          '축적 시점은 사람이 책임지는 확정 경계와 연결되어야 한다.',
        ],
        paragraphs: [
          '다른 플랫폼에서도 이 원칙을 먼저 고정하면, 나중의 knowledge feature는 부가 기능이 아니라 제품의 자연스러운 후속 동작이 된다.',
        ],
        title: '습관을 요구하지 않는 제품만 축적된다',
      },
    ],
    category: 'knowledge-layer',
    navLabel: '무행동 축적',
    relatedSlugs: ['knowledge-accumulation-pipeline', 'trust-tier-promotion', 'human-in-the-loop'],
    slug: 'zero-action-accumulation',
    sources: [
      createSource('code', 'src/lib/knowledge/pipeline.ts'),
      createSource('code', 'src/domains/write/actions.ts'),
      createSource('reference', '초기 플랫폼 북극성 메모'),
    ],
    summary:
      '무엇을 제품의 기본 동작으로 만들어야 사용자의 별도 저장 행동 없이도 장기 자산이 쌓이는지 설명한다.',
    title: '무행동 자동 축적',
    whyItMatters:
      '이식 시 축적을 사용자의 추가 행동에 맡기면 좋은 기능을 만들어도 장기 지식 레이어는 비어 있게 된다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          '지식 축적 파이프라인은 zero-action 철학의 구현 버전이다. 현재 HR AX 플랫폼에서는 `finalizeReport`가 끝난 뒤 `runKnowledgeExtractionPipeline`이 돌아가며 entity, fact, insight를 만든다.',
          '핵심은 축적 시점을 대화 중간이 아니라 출판 경계에 두는 것이다. 확정되지 않은 초안과 대화는 아직 조직 자산이 아니므로 장기 지식으로 승격시키지 않는다.',
        ],
        title: '축적은 대화 중간이 아니라 출판 경계에서 시작한다',
      },
      {
        paragraphs: [
          '이 파이프라인이 지키는 실용적 원칙은 세 가지다. 첫째, 원문을 먼저 읽고 그 다음에 entity와 fact를 만든다. 둘째, 기존 entity와 중복되면 재사용한다. 셋째, insight는 사람이 볼 가치가 있는 해석 단위로 저장한다.',
          '즉 파이프라인은 단순한 NLP 후처리가 아니라, 어떤 종류의 정보를 장기 자산으로 인정할지 판단하는 분류기다.',
        ],
        title: '확정본 뒤에서 움직이는 이유는 자산 품질을 지키기 위해서다',
      },
      {
        bullets: [
          '출판 전 텍스트는 작업재, 출판 후 텍스트는 축적 후보로 본다.',
          'entity, fact, insight는 각각 다른 재사용 목적을 가진다.',
          '중복 제거와 기존 자산 재사용이 축적 파이프라인의 필수 기능이다.',
        ],
        paragraphs: [
          '다른 플랫폼에서도 축적 파이프라인을 모델 호출 뒤에 바로 붙이지 말고, 어떤 승인 경계를 통과한 뒤에만 장기 지식을 만들지 먼저 정해야 한다.',
        ],
        title: '장기 지식은 확정 경계 뒤에서만 만들어진다',
      },
    ],
    category: 'knowledge-layer',
    navLabel: '축적 파이프라인',
    relatedSlugs: ['zero-action-accumulation', 'storage-structure', 'trust-tier-promotion'],
    slug: 'knowledge-accumulation-pipeline',
    sources: [
      createSource('code', 'src/lib/knowledge/pipeline.ts'),
      createSource('code', 'src/domains/write/actions.ts'),
      createSource('code', 'src/domains/knowledge/actions.ts'),
    ],
    summary:
      '무엇을 출판 경계 뒤에서 추출해야 장기 지식 레이어가 초안 노이즈 대신 확정 자산을 축적하는지 설명한다.',
    title: '지식 자동 축적 파이프라인',
    whyItMatters:
      '이식 시 축적 시점을 잘못 잡으면 knowledge layer가 빠르게 오염되고, 이후 retrieval과 분석 품질까지 함께 떨어진다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          'Provenance와 evidence link는 멋진 그래프를 만들기 위한 것이 아니라, 좋은 주장에 다시 따라갈 수 있는 경로를 남기기 위한 계약이다. 사용자가 보고서를 믿는 순간은 AI가 자신 있다고 말할 때가 아니라 근거를 다시 열어볼 수 있을 때다.',
          '그래서 provenance는 knowledge graph보다 먼저 필요하다. 복잡한 관계 모델을 만들기 전에 먼저 섹션이 어떤 source와 prior asset에서 왔는지를 일관되게 남길 수 있어야 한다.',
        ],
        title: '그래프보다 먼저 필요한 것은 다시 따라갈 수 있는 경로다',
      },
      {
        paragraphs: [
          '현재 구조에서 이 개념은 section metadata, source, deliverable, report, insight 사이의 연결 가능성으로 드러난다. 아직 evidence panel이 완성되지 않았더라도, 이 경계를 지금부터 보존해야 나중에 reviewer 흐름을 붙일 수 있다.',
          '즉 provenance는 지식 저장과 UI 검수를 잇는 계약이다. 저장 구조가 아무리 좋아도 다시 추적할 수 없다면 조직 안에서 신뢰 자산이 되기 어렵다.',
        ],
        title: '저장 구조와 검수 UI를 잇는 가장 얇은 다리',
      },
      {
        bullets: [
          'claim, section, source, prior asset 사이의 연결은 나중의 리뷰 속도를 좌우한다.',
          'evidence link는 confidence 수치보다 더 직접적인 신뢰 재료다.',
          'provenance 설계가 없으면 export와 approval workflow가 각자 근거 표현 방식을 만들게 된다.',
        ],
        paragraphs: [
          '이식 시에도 먼저 모든 것을 정교하게 모델링하려 하지 말고, 최소한의 재추적 경로를 끊기지 않게 만드는 것이 우선이다.',
        ],
        title: '복잡한 관계도보다 끊기지 않는 추적선이 중요하다',
      },
    ],
    category: 'knowledge-layer',
    navLabel: '근거 연결',
    relatedSlugs: ['source-enrichment', 'human-in-the-loop', 'memory-loop'],
    slug: 'provenance-and-evidence-links',
    sources: [
      createSource('code', 'src/lib/deliverables/parser.ts'),
      createSource('code', 'src/lib/knowledge/pipeline.ts'),
      createSource('reference', '출처 계보 설계 메모'),
    ],
    summary:
      '무엇을 provenance와 evidence link로 남겨야 섹션과 주장에 다시 따라갈 수 있는 근거 경로가 생기는지 설명한다.',
    title: '출처 계보와 근거 연결',
    whyItMatters:
      '이식 시 추적 경로를 함께 설계하지 않으면 지식 자산과 검수 워크플로우는 나중에 느슨하게 붙은 두 시스템으로 남는다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          '메모리 루프는 세션이 끝난 뒤 지식이 사라지지 않도록, 출판물과 memory chunk를 다시 검색 가능한 서빙 자산으로 되돌리는 흐름이다. 이때 memory chunk는 knowledge graph와 다른 역할을 맡는다.',
          'graph가 의미를 보존한다면, memory loop는 회수와 재사용을 보장한다. 세션에서 시작한 작업이 다음 세션의 retrieval로 돌아올 때 비로소 루프가 닫힌다.',
        ],
        title: '세션과 산출물이 다시 회수 가능한 기억으로 돌아와야 루프가 닫힌다',
      },
      {
        paragraphs: [
          '이 구조에서 버저닝과 재생성이 중요한 이유는 기억 계층이 파생물이라는 사실 때문이다. deliverable이 바뀌면 memory chunk도 다시 만들어야 하고, draft 상태면 오히려 superseded 처리해야 한다.',
          '즉 memory loop는 저장보다 갱신 규칙이 핵심이다. 무엇이 active memory이고 무엇이 이미 뒤집힌 기억인지 명확해야 retrieval이 과거 노이즈를 덜 가져온다.',
        ],
        title: '좋은 기억은 많이 남기는 것이 아니라 계속 갱신되는 것이다',
      },
      {
        bullets: [
          'memory loop는 지식 그래프와 별개의 서빙 레이어다.',
          'draft는 active memory가 아니며, final 이상만 서빙 후보가 된다.',
          '재생성 가능성은 메모리 레이어의 필수 속성이다.',
        ],
        paragraphs: [
          '이식 시 memory를 불변 아카이브처럼 다루면 품질이 빠르게 썩는다. loop라는 이름을 붙이는 이유는 생성보다 갱신이 더 중요하기 때문이다.',
        ],
        title: '기억은 저장소가 아니라 순환 구조로 봐야 한다',
      },
    ],
    category: 'knowledge-layer',
    navLabel: '메모리 루프',
    relatedSlugs: ['vector-memory-schema', 'hybrid-retrieval', 'provenance-and-evidence-links'],
    slug: 'memory-loop',
    sources: [
      createSource('code', 'src/lib/memory/service.ts'),
      createSource('code', 'src/lib/memory/retrieval.ts'),
      createSource('code', 'src/lib/db/schema.ts'),
    ],
    summary:
      '무엇을 active memory로 보고 어떻게 재생성해야 세션과 산출물이 다음 작업의 회수 가능한 기억으로 돌아오는지 설명한다.',
    title: '세션-산출물-메모리 루프',
    whyItMatters:
      '이식 시 memory를 불변 아카이브처럼 다루면 retrieval은 시간이 갈수록 낡은 정보를 계속 되살리는 방향으로 망가진다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          'Hybrid retrieval의 핵심은 벡터 검색을 붙이는 것이 아니라, lexical search와 semantic search를 둘 다 계산한 뒤 use case에 따라 다른 점수 결합을 쓰는 데 있다. 선행 검색 설계 메모도 검색 대상 테이블을 `memory_chunks` 하나로 통합하고, 그 위에서 workspace search와 generation retrieval을 분리한다.',
          '이 설계는 검색 정확도와 생성 맥락 품질이 같은 문제가 아니라는 점을 인정한다. 사용자가 찾는 화면 검색은 lexical precision이 더 중요하고, 모델이 참고할 문맥 검색은 semantic relevance가 더 중요하다.',
        ],
        title: '검색 하나로 모든 목적을 해결하려 하지 않는다',
      },
      {
        bullets: [
          'Workspace Search 공식: `final_score = 0.55 * lexical_score + 0.35 * semantic_score + 0.05 * recency_score + 0.05 * template_match_bonus`',
          'Generation Retrieval 공식: `final_score = 0.25 * lexical_score + 0.55 * semantic_score + 0.15 * template_match_bonus + 0.05 * recency_score`',
          '정규화 규칙: lexical은 max-min normalization, semantic은 cosine similarity를 0~1로 재매핑한다.',
        ],
        paragraphs: [
          '현재 `searchMemoryChunksHybrid`는 이 공식을 실제 코드로 번역하고 있다. generation mode에서는 template match와 deliverable section 보너스를 더 강하게 주고, workspace mode에서는 lexical precision을 앞세운다.',
        ],
        title: '점수 결합은 수학이 아니라 사용 목적의 선언이다',
      },
      {
        bullets: [
          '`memory_chunks`는 source와 deliverable_section을 함께 검색하는 통합 표면이다.',
          '`SEMANTIC_REFERENCE_LIMIT = 4`, `SEMANTIC_REFERENCE_MAX_LENGTH = 320`은 생성 프롬프트에 의미 기반 자산을 얇게 붙이는 안전장치다.',
          'recent deliverable tier와 semantic block을 따로 유지해야 모델이 두 종류의 맥락을 분리해 해석한다.',
        ],
        paragraphs: [
          '다른 플랫폼에 옮길 때도 먼저 어떤 검색 목적이 있는지 분리한 뒤 weight를 잡아야 한다. hybrid는 기술 선택이 아니라 relevance를 어떻게 정의할지에 대한 제품 결정이다.',
        ],
        title: 'weight를 바꾸는 일은 제품의 검색 철학을 바꾸는 일이다',
      },
    ],
    category: 'knowledge-layer',
    navLabel: '하이브리드 검색',
    relatedSlugs: ['vector-memory-schema', 'context-tiering', 'memory-loop'],
    slug: 'hybrid-retrieval',
    sources: [
      createSource('reference', '하이브리드 검색 설계 메모'),
      createSource('code', 'src/lib/memory/retrieval.ts'),
      createSource('code', 'src/lib/search/service.ts'),
      createSource('code', 'src/lib/deliverables/service.ts'),
    ],
    summary:
      '무엇을 lexical과 semantic의 결합으로 검색하고 왜 검색 목적별로 다른 ranking weight를 써야 하는지 설명한다.',
    title: '하이브리드 검색',
    whyItMatters:
      '이식 시 hybrid retrieval을 단순 벡터 추가로 이해하면 relevance 설계가 비어 버리고, 검색과 생성 둘 다 어정쩡한 품질에 머물게 된다.',
  },
];

export { KNOWLEDGE_LAYER_ARTICLES };
