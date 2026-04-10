import type { IdeationPointArticle, IdeationPointSource } from '../ideation-points-content';

function createSource(kind: IdeationPointSource['kind'], path: string): IdeationPointSource {
  return { kind, path };
}

const GOVERNANCE_SURFACE_ARTICLES: IdeationPointArticle[] = [
  {
    blocks: [
      {
        paragraphs: [
          'Private-first는 shared workspace의 반대말이 아니다. 개인이 생각을 정리할 수 있는 안전한 작업 공간 위에, 검토와 승격이 필요한 순간에만 조직 표면으로 올리는 전략이다.',
          '이 순서를 지키면 초기 제품은 개인 워크벤치로 시작할 수 있고, 이후 shared workspace와 review workflow를 붙여도 설계가 크게 뒤틀리지 않는다. 선행 엔터프라이즈 갭 분석이 지적한 문제도 바로 이 승격 표면이 아직 얇다는 데 있다.',
        ],
        title: '개인 작업공간은 공유 협업의 전 단계다',
      },
      {
        paragraphs: [
          '공유는 로그 복제가 아니라 자산 승격에서 시작한다. 개인 세션의 대화 전체를 조직에 노출하는 것이 아니라, 검토 가능한 보고서와 검증된 asset만 팀 공간으로 올리는 방식이 더 안전하다.',
          '이 때문에 shared workspace 설계는 UI 권한보다 승격 기준을 먼저 정해야 한다. 무엇이 개인 메모이고 무엇이 공유 자산인지 경계가 서야 권한 모델도 선명해진다.',
          '조직형 제품으로 확장할수록 이 shared surface는 flat한 공유 폴더보다 부서별·개인별 버킷 집합에 가까워진다. 그래야 과공유 없이도 축적 자산을 계속 늘릴 수 있다.',
        ],
        title: '공유는 원문 노출보다 승격 경계를 먼저 정해야 한다',
      },
      {
        bullets: [
          'private-first는 폐쇄성이 아니라 안전한 초기 작업 표면이다.',
          'shared workspace는 세션 로그 복제보다 asset promotion 흐름으로 여는 편이 낫다.',
          '권한 모델은 공유 타이밍보다 승격 기준과 함께 설계해야 한다.',
          '승격은 공개 범위 확대와 동일하지 않다. 같은 자산도 버킷 범위는 다를 수 있다.',
        ],
        paragraphs: [
          '이식 시에도 팀 기능을 먼저 만들기보다 개인 공간과 조직 자산 사이의 승격 표면을 먼저 설계하는 것이 보수적이고 실전적이다.',
        ],
        title: '조직 사용성은 공유 버튼보다 승격 표면에서 시작한다',
      },
    ],
    category: 'governance-surface',
    navLabel: '작업공간 전략',
    relatedSlugs: ['trust-tier-promotion', 'governance-draft', 'human-in-the-loop'],
    slug: 'private-first-shared-workspace',
    sources: [
      createSource('code', 'src/app/workspace/layout.tsx'),
      createSource('code', 'src/lib/db/schema.ts'),
      createSource('reference', '엔터프라이즈 갭 분석 메모'),
    ],
    summary:
      '무엇을 개인 작업 공간에 남기고 무엇을 팀 자산으로 승격해야 조직 사용으로 자연스럽게 확장되는지 설명한다.',
    title: '개인 우선에서 공유 작업공간으로',
    whyItMatters:
      '이식 시 개인 공간과 조직 자산의 경계를 함께 설계하지 않으면 협업 기능은 곧바로 과공유와 권한 혼란으로 이어진다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          'Connector / Action Layer 초안은 API 설계 문서라기보다 행동 계약 초안이다. 핵심은 시스템 이름이 아니라 사용자가 제품 안에서 무엇을 실행할 수 있는지를 타입으로 분리하는 데 있다.',
          '이 접근은 도구 수를 늘리는 것보다 위험 경계를 먼저 세우는 방식이다. 검색, 가져오기, export, 승인 같은 행위를 action으로 나누면 각 행위에 필요한 권한과 기록 방식을 뒤늦지 않게 설계할 수 있다.',
        ],
        title: '연동 목록보다 행동 타입을 먼저 분리한다',
      },
      {
        paragraphs: [
          '왜 시스템명보다 액션 타입으로 분류하느냐 하면, 연동 대상은 계속 바뀌지만 위험의 종류는 상대적으로 안정적이기 때문이다. 메일이든 일정이든 포털이든 결국 import, read, write, export, notify 같은 경계 위에 올라온다.',
          '따라서 connector layer는 구현 디테일보다는 제품의 안전한 실행면을 먼저 정의하는 곳이 된다. 실제 구현이 바뀌어도 action boundary가 유지되면 거버넌스 모델은 재사용된다.',
          '특히 Python/CLI를 이용한 실행 자동화로 갈수록 read-only helper, draft generation, approval-gated execution을 더 엄격히 나눠야 한다. "비개발자도 자동화"라는 비전은 가능하지만, 그 전제는 실행 표면을 세밀하게 통제하는 것이다.',
        ],
        title: '도구는 바뀌어도 위험 경계는 유지되어야 한다',
      },
      {
        bullets: [
          'connector를 외부 시스템 카탈로그로만 보지 않고 action boundary 설계로 본다.',
          '새 연동 추가 시 필요한 것은 SDK 래퍼보다 권한, 감사, 실패 처리 규칙이다.',
          '사용자 UX는 단순하게 두고 복잡한 tool runtime은 내부로 가둔다.',
        ],
        paragraphs: [
          '이식 시에는 API 명세를 먼저 세우기보다, 어떤 액션이 조직적으로 허용되고 기록되어야 하는지를 먼저 정하는 편이 더 안전하다.',
        ],
        title: '연동 설계의 본질은 실행 표면을 다루는 일이다',
      },
    ],
    category: 'governance-surface',
    navLabel: '액션 경계',
    relatedSlugs: ['governance-draft', 'trust-tier-promotion', 'private-first-shared-workspace'],
    slug: 'connector-action-layer-draft',
    sources: [
      createSource('draft', '실행 계획 초안'),
      createSource('reference', '엔터프라이즈 갭 분석 메모'),
      createSource('code', 'src/app/api/deliverables/[id]/export/route.ts'),
    ],
    summary:
      '무엇을 connector가 아니라 action boundary로 나눠야 연동이 늘어나도 권한과 감사 규칙을 유지할 수 있는지 설명한다.',
    title: '커넥터·액션 레이어 초안',
    whyItMatters:
      '이식 시 외부 시스템 중심으로만 설계하면 구현은 빨라도 위험 경계와 승인 흐름을 나중에 다시 뜯어고쳐야 한다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          'Governance 초안의 핵심은 read/write 구분보다 approval boundary를 어디에 둘 것인가다. 엔터프라이즈 환경에서는 누가 보고 수정했는지보다 누가 승인하고 배포했는지가 더 중요해지는 순간이 많다.',
          '선행 엔터프라이즈 갭 분석 메모가 reviewer, approver, publisher 같은 세분 권한을 강조하는 이유도 여기에 있다. AI 문서 제품이 조직 안에서 쓰이려면 생성 능력보다 통제면이 먼저 강해져야 한다.',
        ],
        title: '정책은 읽기/쓰기보다 승인 경계에서 갈린다',
      },
      {
        paragraphs: [
          '거버넌스 매트릭스는 최소한 역할, 자산 등급, 공간 범위, 행위 종류를 교차시켜야 한다. 같은 editor라도 개인 초안에 대한 편집과 팀 표준 자산에 대한 편집은 전혀 다른 위험을 가진다.',
          '따라서 governance는 권한 표 하나가 아니라 제품의 모든 surface에 스며드는 분류 체계가 된다. export, promote, share, approve는 각기 다른 규칙을 가져야 한다.',
          '실무적으로는 role만으로 부족하고, asset이 어떤 bucket에 속하는지와 사용자가 그 bucket에 대해 어떤 action을 할 수 있는지를 함께 계산해야 한다.',
        ],
        title: '역할보다 자산 등급과 공간 범위를 함께 봐야 한다',
      },
      {
        bullets: [
          '역할 축: viewer, editor, reviewer, approver, publisher',
          '자산 축: raw source, draft, final deliverable, promoted asset, verified standard asset',
          '공간 축: personal, team, department, org, confidential bucket',
        ],
        paragraphs: [
          '이식 시에도 사용자 테이블에 role 하나 넣고 끝내지 말고, 어떤 자산이 어느 surface를 통과할 때 다른 정책을 적용받는지부터 설계해야 한다.',
        ],
        title: '거버넌스는 권한표보다 자산 이동 규칙에 가깝다',
      },
    ],
    category: 'governance-surface',
    navLabel: '거버넌스 초안',
    relatedSlugs: [
      'connector-action-layer-draft',
      'trust-tier-promotion',
      'private-first-shared-workspace',
    ],
    slug: 'governance-draft',
    sources: [
      createSource('reference', '엔터프라이즈 갭 분석 메모'),
      createSource('reference', '우선순위 로드맵 메모'),
      createSource('code', 'src/lib/db/schema.ts'),
    ],
    summary:
      '무엇을 approval boundary와 자산 이동 규칙으로 설계해야 조직 안에서 AI 문서를 통제 가능한 시스템으로 운영할 수 있는지 설명한다.',
    title: '거버넌스 초안',
    whyItMatters:
      '이식 시 거버넌스를 단순 역할 표로 축소하면 자산 승격, 승인, export 같은 고위험 surface에서 정책이 쉽게 무너진다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          'Human-in-the-loop는 사람이 매번 다시 쓰게 하는 퇴행이 아니라, 어떤 순간에 최종 확정권을 되돌려 받을지를 분명히 하는 설계다. 현재 보고서 finalize 이후에만 knowledge pipeline이 도는 구조는 이 원칙을 코드로 표현한 예다.',
          '즉 사람의 역할은 모델을 보조하는 것이 아니라, 조직 자산이 되는 순간을 선언하는 것이다. 이 한 단계가 있어야 자동 축적과 자산 승격이 정당성을 가진다.',
        ],
        title: '사람은 모델의 조수보다 최종 확정권자에 가깝다',
      },
      {
        paragraphs: [
          '선행 운영 메모들이 review request, comments, approval history를 강조하는 것도 같은 이유다. AI가 초안을 빨리 만들수록 사람의 개입은 앞단 생성이 아니라 뒷단 확정과 검수에 집중되어야 한다.',
          '이 설계는 속도를 늦추기보다 책임을 선명하게 만든다. 최종본과 장기 지식이 누구의 승인 아래 생성되었는지 남기면, 이후의 신뢰 등급과 감사 로그도 자연스럽게 이어진다.',
        ],
        title: '사람 개입은 생성 중간보다 확정 경계에서 더 중요하다',
      },
      {
        bullets: [
          'draft 생성은 자동화할 수 있어도 final 승격은 사람의 명시적 행동과 연결하는 편이 안전하다.',
          'reviewer/approver 흐름은 품질 확보뿐 아니라 지식 축적의 정당성 근거가 된다.',
          'human-in-the-loop는 모델 성능 부족의 보완책이 아니라 운영 책임의 구조다.',
        ],
        paragraphs: [
          '이식 시에도 사람 검토를 불편한 예외 처리로 보지 말고, 시스템이 조직 자산을 만들기 위해 반드시 거쳐야 할 승인면으로 보는 편이 맞다.',
        ],
        title: '검토 단계는 마찰이 아니라 정당성 계층이다',
      },
    ],
    category: 'governance-surface',
    navLabel: '사람 확정권',
    relatedSlugs: [
      'zero-action-accumulation',
      'trust-tier-promotion',
      'provenance-and-evidence-links',
    ],
    slug: 'human-in-the-loop',
    sources: [
      createSource('reference', '초기 운영 메모'),
      createSource('reference', '엔터프라이즈 갭 분석 메모'),
      createSource('code', 'src/domains/write/actions.ts'),
      createSource('code', 'src/lib/deliverables/service.ts'),
    ],
    summary:
      '무엇을 사람의 최종 확정권에 연결해야 자동화와 조직 책임이 동시에 성립하는지 설명한다.',
    title: '사람 확정권',
    whyItMatters:
      '이식 시 사람 검토의 위치를 흐리면 자동 축적과 자산 승격은 편리해 보여도 조직 안에서 신뢰와 책임을 잃는다.',
  },
  {
    blocks: [
      {
        paragraphs: [
          'Trust-tier promotion은 모든 문서를 같은 수준의 자산으로 취급하지 않겠다는 선언이다. 선행 로드맵이 제안한 `raw source → draft → final deliverable → promoted asset → verified standard asset` 구간은 생성물의 신뢰와 재사용 권한을 함께 다룬다.',
          '이 계층이 필요한 이유는 생성 시스템이 잘 작동할수록 오히려 재사용 리스크가 커지기 때문이다. 빠르게 많이 만들어지는 초안과 장기 표준 자산을 같은 방식으로 검색하고 공유하면 품질은 곧바로 흐려진다.',
        ],
        title: '모든 결과물을 같은 자산으로 취급하지 않는다',
      },
      {
        paragraphs: [
          '현재 상태값인 draft, final, promoted_asset은 이 사다리의 초기 버전이다. 여기에 verified standard asset 같은 상위 계층을 추가하면 조직 공통 자산과 개인 작업 결과를 더 명확히 분리할 수 있다.',
          '중요한 것은 등급이 많아지는 것이 아니라 승격 조건이 명확해지는 것이다. 어떤 review를 거쳤는지, 어떤 provenance를 가졌는지, 누가 승인했는지가 신뢰 등급의 재료가 된다.',
          '또한 승격이 곧 전사 공개를 뜻해서는 안 된다. 같은 promoted asset이어도 팀 버킷에 머물 수 있고, verified standard asset만 조직 표준 버킷으로 올라가는 식의 분리가 필요하다.',
        ],
        title: '상태값은 재사용 권한과 검증 강도를 함께 말해야 한다',
      },
      {
        bullets: [
          '초안은 개인 생산성 자산, promoted asset은 팀 재사용 자산, verified standard asset은 조직 표준 자산으로 보고 각 등급은 서로 다른 버킷 범위를 가진다.',
          '등급 승격은 상태 변경이 아니라 검토와 근거를 통과한 결과여야 한다.',
          '검색과 추천도 자산 등급을 반영해야 조직 기억이 오염되지 않는다.',
        ],
        paragraphs: [
          '다른 플랫폼으로 옮길 때도 상태 필드를 단순 문서 라이프사이클로만 두지 말고, 재사용 가능성과 신뢰 수준을 함께 담는 방향으로 설계하는 편이 강하다.',
        ],
        title: '승격 사다리는 곧 재사용 규칙이다',
      },
    ],
    category: 'governance-surface',
    navLabel: '신뢰 등급 승격',
    relatedSlugs: [
      'governance-draft',
      'private-first-shared-workspace',
      'knowledge-accumulation-pipeline',
    ],
    slug: 'trust-tier-promotion',
    sources: [
      createSource('reference', '우선순위 로드맵 메모'),
      createSource('reference', '실행 계획 초안'),
      createSource('code', 'src/lib/db/schema.ts'),
      createSource('code', 'src/lib/deliverables/service.ts'),
    ],
    summary:
      '무엇을 trust tier로 나눠야 초안, 팀 자산, 조직 표준을 서로 다른 검증 강도로 다룰 수 있는지 설명한다.',
    title: '신뢰 등급 자산 승격',
    whyItMatters:
      '이식 시 자산 등급을 설계하지 않으면 검색과 공유가 빨라질수록 오히려 조직의 재사용 품질은 빠르게 붕괴한다.',
  },
];

export { GOVERNANCE_SURFACE_ARTICLES };
