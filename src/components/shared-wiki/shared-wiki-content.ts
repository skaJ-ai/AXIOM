type SharedWikiCategory = 'platform-basics' | 'working-model' | 'automation-model' | 'trust-model';

interface SharedWikiBlock {
  bullets?: string[];
  paragraphs: string[];
  title: string;
}

interface SharedWikiArticle {
  blocks: SharedWikiBlock[];
  category: SharedWikiCategory;
  navLabel: string;
  relatedSlugs: string[];
  slug: string;
  summary: string;
  title: string;
}

interface SharedWikiCategoryMeta {
  description: string;
  label: string;
}

interface SharedWikiGlossaryItem {
  description: string;
  term: string;
}

const SHARED_WIKI_CATEGORY_ORDER: SharedWikiCategory[] = [
  'platform-basics',
  'working-model',
  'automation-model',
  'trust-model',
];

const SHARED_WIKI_CATEGORY_META: Record<SharedWikiCategory, SharedWikiCategoryMeta> = {
  'automation-model': {
    description: '어떤 일은 사람이 하고, 어떤 일은 Copilot이나 Agent가 맡는지 정리한 구역입니다.',
    label: '자동화 원칙',
  },
  'platform-basics': {
    description: 'HR AX 플랫폼과 HR AX Copilot이 무엇인지 처음 보는 사람 기준으로 설명합니다.',
    label: '플랫폼 기초',
  },
  'trust-model': {
    description: '승인, 기록, 근거처럼 사람이 안심하고 쓰기 위해 필요한 장치를 설명합니다.',
    label: '신뢰와 운영',
  },
  'working-model': {
    description: '업무 카드, 프로세스, Working Group이 어떻게 연결되는지 설명합니다.',
    label: '일하는 방식',
  },
};

const SHARED_WIKI_GLOSSARY: SharedWikiGlossaryItem[] = [
  {
    description:
      'HR 담당자가 실제로 추적해야 하는 일감입니다. 요청 건, 보고서 준비, 일정 조율 같은 일이 여기에 들어갑니다.',
    term: '업무 카드',
  },
  {
    description:
      'Working Group이 정리한 표준 업무 흐름입니다. 담당자가 일을 시작할 때 참고하는 기본 뼈대입니다.',
    term: '프로세스 자산',
  },
  {
    description:
      '부서나 개인 단위로 자료를 모으고 접근 범위를 나누는 지식 구역입니다. 민감 정보는 버킷별로 분리하고, 반복 사용될수록 각 팀의 자산이 쌓입니다.',
    term: '버킷',
  },
  {
    description:
      '대화를 잘 끌어가고 중간 정리를 도와주는 공통 AI 파트너입니다. 모든 일을 자동으로 대신하는 Agent는 아닙니다.',
    term: 'HR AX Copilot',
  },
  {
    description:
      '문서나 매뉴얼에는 잘 안 적혀 있지만, 실무자가 실제로 일할 때 쓰는 판단 기준과 예외 처리 요령입니다.',
    term: '암묵지',
  },
  {
    description:
      '그 지식이 누구에게서 나왔고, 어떤 상황과 부서, 어떤 보고 대상에 적용되는지 알려 주는 꼬리표입니다.',
    term: '맥락 태그',
  },
  {
    description: '메일, 일정, 포털, 사내 시스템처럼 바깥 시스템과 연결되는 통로입니다.',
    term: 'Connector',
  },
  {
    description: '시스템이 직접 실행하기 전에 사람이 확인하거나 승인해야 하는 경계입니다.',
    term: '승인 경계',
  },
];

const SHARED_WIKI_ARTICLES: SharedWikiArticle[] = [
  {
    blocks: [
      {
        paragraphs: [
          'HR AX 플랫폼은 HR 담당자가 하루 업무를 한곳에서 이어서 처리하는 작업 공간입니다.',
        ],
        title: '한 줄 요약',
      },
      {
        paragraphs: [
          '지금 HR 업무는 메일, 메신저, 일정, 포털, 보고서 문서, 메모가 여러 곳에 흩어져 있기 쉽습니다.',
          'HR AX 플랫폼은 그 흩어진 일을 한 화면으로 완전히 합친다기보다, 적어도 “지금 내가 무슨 일을 하고 있고 다음에 무엇을 해야 하는지”를 놓치지 않게 해 주는 중심 작업면을 만드는 데 목적이 있습니다.',
        ],
        title: '쉽게 말해',
      },
      {
        paragraphs: [
          '예를 들어 채용 요청이 들어오면 담당자는 관련 메일을 보고, 면접 일정을 조율하고, 제안 자료를 정리하고, 결과를 공유합니다.',
          'HR AX 플랫폼은 이 전체 흐름을 하나의 작업 카드와 관련 자료 묶음으로 연결해 “이번 일”을 끝까지 따라가게 합니다.',
        ],
        title: '업무 예시',
      },
      {
        paragraphs: [
          '사람들은 대개 일을 잘 못해서가 아니라, 맥락이 여러 시스템에 끊겨 있어서 같은 설명을 반복하게 됩니다.',
          '플랫폼의 1차 목표는 “자동화 많이 하기”보다 “업무 맥락을 끊기지 않게 이어 주기”입니다.',
        ],
        title: '왜 필요한가',
      },
    ],
    category: 'platform-basics',
    navLabel: '플랫폼 소개',
    relatedSlugs: ['what-is-hr-ax-copilot', 'work-card-and-process'],
    slug: 'what-is-hr-ax-platform',
    summary: 'HR 담당자가 출근부터 퇴근까지 이어서 일하는 중심 작업 공간입니다.',
    title: 'HR AX 플랫폼은 무엇인가',
  },
  {
    blocks: [
      {
        paragraphs: [
          'HR AX Copilot은 사람 대신 모든 일을 처리하는 로봇이 아니라, 일을 덜 막히게 해 주는 공통 AI 파트너입니다.',
        ],
        title: '한 줄 요약',
      },
      {
        paragraphs: [
          '담당자가 막히는 지점은 “무슨 질문부터 해야 하지?”, “이 내용을 어떻게 정리하지?”, “이전 자료 중 뭐가 중요하지?” 같은 부분입니다.',
          'HR AX Copilot은 이런 순간에 대화를 이어 주고, 중간 정리를 만들고, 다음 작업의 출발점을 잡아 주는 역할을 합니다.',
        ],
        title: '쉽게 말해',
      },
      {
        paragraphs: [
          '예를 들어 인사 제도 보고서를 써야 할 때, Copilot은 바로 완성본만 주는 대신 논점 정리, 반대 의견 검토, 핵심 요약, 초안 작성 같은 단계를 나눠서 도와줄 수 있습니다.',
          '도입 초기에는 회의록 요약, 번역, 초안 정리처럼 가벼운 비서형 업무부터 시작하는 편이 자연스럽고, 이렇게 쌓인 결과물이 나중에는 검색과 자동화의 재료가 됩니다.',
        ],
        title: '업무 예시',
      },
      {
        bullets: [
          '모든 업무를 자동으로 끝내는 Agent가 아니다.',
          '사람이 생각을 이어 가기 쉽게 만드는 공통 파트너다.',
          '같은 조직 안에서 여러 업무 카드에 공통으로 붙을 수 있다.',
          '처음에는 단순 활용으로 시작해도 시간이 지날수록 지식 자산이 쌓인다.',
        ],
        paragraphs: [],
        title: '이 점이 중요하다',
      },
    ],
    category: 'platform-basics',
    navLabel: 'Copilot 소개',
    relatedSlugs: ['what-is-hr-ax-platform', 'why-not-agent-first'],
    slug: 'what-is-hr-ax-copilot',
    summary: '질문을 받아 주고, 중간 정리를 만들고, 다음 작업으로 이어 주는 공통 AI 파트너입니다.',
    title: 'HR AX Copilot은 무엇을 하는가',
  },
  {
    blocks: [
      {
        paragraphs: [
          '업무 카드는 “이번에 내가 실제로 처리해야 하는 일”이고, 프로세스 자산은 “그 일을 보통 어떻게 처리하는지 정리한 표준 흐름”입니다.',
        ],
        title: '한 줄 요약',
      },
      {
        paragraphs: [
          '업무 카드는 오늘 들어온 실제 요청 건이나 과제를 담습니다.',
          '프로세스 자산은 Working Group이 정리한 표준 절차, 체크포인트, 필요한 산출물을 담습니다.',
          '즉 카드는 살아 있는 일감이고, 프로세스는 그 카드가 참고하는 길잡이입니다.',
        ],
        title: '쉽게 말해',
      },
      {
        paragraphs: [
          '예를 들어 “인사평가 결과 공유 준비”라는 업무 카드가 생성되면, 담당자는 관련 프로세스 자산을 연결해 필요한 자료, 승인 포인트, 결과 문서 유형을 바로 볼 수 있습니다.',
        ],
        title: '업무 예시',
      },
      {
        paragraphs: [
          '이 구조가 없으면 담당자마다 일 처리 방식이 달라지고, 같은 일을 할 때도 무엇을 참고해야 하는지 매번 다시 정해야 합니다.',
          '카드와 프로세스를 분리하면 실제 상황 변화는 카드에 담고, 공통 뼈대는 프로세스로 계속 다듬을 수 있습니다.',
        ],
        title: '왜 필요한가',
      },
    ],
    category: 'working-model',
    navLabel: '업무 카드와 프로세스',
    relatedSlugs: ['what-is-hr-ax-platform', 'working-group-role'],
    slug: 'work-card-and-process',
    summary: '실제 일감은 업무 카드로, 표준 흐름은 프로세스 자산으로 분리해 연결합니다.',
    title: '업무 카드와 프로세스는 어떻게 연결되는가',
  },
  {
    blocks: [
      {
        paragraphs: [
          'Working Group은 현업이 실제로 하는 일을 정리해 “다음 사람도 같은 기준으로 일할 수 있게” 만드는 팀입니다.',
        ],
        title: '한 줄 요약',
      },
      {
        paragraphs: [
          '도메인별 HR 담당자와 개발자가 함께 프로세스를 정리하면, 현업 언어와 시스템 제약을 동시에 반영할 수 있습니다.',
          '이렇게 만들어진 프로세스 자산은 플랫폼 안에서 여러 담당자가 재사용할 수 있는 공통 기준이 됩니다.',
          '이 자산은 부서별 버킷에 쌓일수록 더 강해집니다. 팀마다 자주 참고하는 정책, 예외 처리, 문서 관행이 다르기 때문에 같은 질문도 어느 버킷의 지식을 보는지가 중요합니다.',
        ],
        title: '쉽게 말해',
      },
      {
        bullets: [
          '현업은 실제 업무 흐름과 예외 상황을 설명합니다.',
          '개발자는 무엇이 자동화 가능하고 무엇이 어려운지 구분합니다.',
          '둘이 함께 “실제로 쓸 수 있는 표준”을 만듭니다.',
        ],
        paragraphs: [],
        title: 'Working Group이 하는 일',
      },
      {
        paragraphs: [
          '이 구조가 없으면 플랫폼은 예쁜 화면만 있고, 실제 일과 연결되지 않는 위험이 큽니다.',
          '반대로 Working Group 기반으로 자산을 쌓으면, Agent를 많이 못 만들어도 담당자들이 같은 기준 위에서 일할 수 있습니다.',
        ],
        title: '왜 중요한가',
      },
    ],
    category: 'working-model',
    navLabel: 'Working Group 역할',
    relatedSlugs: ['work-card-and-process', 'why-not-agent-first'],
    slug: 'working-group-role',
    summary:
      'Working Group은 현업 기준을 플랫폼 안에서 재사용 가능한 프로세스 자산으로 바꾸는 팀입니다.',
    title: 'Working Group은 왜 중요한가',
  },
  {
    blocks: [
      {
        paragraphs: [
          '암묵지는 문서에 적힌 절차보다, 실무자가 실제로 판단할 때 쓰는 숨은 기준에 가깝습니다.',
        ],
        title: '한 줄 요약',
      },
      {
        paragraphs: [
          '매뉴얼에는 “보고서를 작성한다”라고만 적혀 있어도, 실제 현장에서는 “이 임원에게는 표보다 화면 캡처가 더 잘 먹힌다”, “이 상황에서는 다른 예산 계정을 먼저 확인해야 한다” 같은 판단이 함께 움직입니다.',
          '이런 노하우가 남지 않으면 새 담당자도, Copilot도, Agent도 늘 겉으로 보이는 절차만 따라가게 됩니다.',
        ],
        title: '쉽게 말해',
      },
      {
        paragraphs: [
          '예를 들어 같은 제도 공지라도 대상이 임원인지, 현업 리더인지, 전체 구성원인지에 따라 설명 방식과 강조점이 달라질 수 있습니다.',
          '플랫폼은 이런 차이를 “누가 말했는지, 어느 상황인지, 누구를 대상으로 한 일인지”와 함께 남길 수 있어야 실제 조직형 AI로 발전할 수 있습니다.',
        ],
        title: '업무 예시',
      },
      {
        paragraphs: [
          '회사의 차별점은 문서 개수보다 이런 암묵지가 얼마나 잘 쌓여 있는지에서 생깁니다.',
          '그래서 좋은 플랫폼은 단순히 답변을 잘하는 것보다, 사람의 노하우가 맥락과 함께 남게 만드는 쪽으로 가야 합니다.',
        ],
        title: '왜 필요한가',
      },
    ],
    category: 'working-model',
    navLabel: '암묵지의 중요성',
    relatedSlugs: ['work-card-and-process', 'working-group-role', 'why-records-matter'],
    slug: 'why-tacit-knowledge-matters',
    summary:
      '문서 밖 노하우와 예외 기준이 맥락과 함께 남아야 조직형 AI가 실제 현장에 맞게 작동합니다.',
    title: '왜 암묵지가 중요한가',
  },
  {
    blocks: [
      {
        paragraphs: [
          'HR AX 플랫폼은 “Agent를 최대한 많이 만든다”보다 “사람이 대부분의 일을 덜 힘들게 처리하게 만든다”를 먼저 택합니다.',
        ],
        title: '한 줄 요약',
      },
      {
        paragraphs: [
          '실제로는 모든 업무를 자동화할 개발 리소스도 없고, 모든 상황을 Agent가 처리하게 만드는 것도 위험합니다.',
          '그래서 기본값은 사람이 일을 진행하되, Copilot이 질문과 정리를 돕고, ROI가 높은 일부 업무만 Agent로 자동화하는 방식이 현실적입니다.',
          '현실적인 도입 순서는 보통 3단계입니다. 먼저 요약·번역·초안 작성 같은 단순 활용으로 기록을 남기고, 그 다음 축적된 자료를 검색에 쓰며, 마지막에 반복 규칙이 분명한 일부 단계만 자동화합니다.',
        ],
        title: '쉽게 말해',
      },
      {
        paragraphs: [
          '예를 들어 보고서 초안 작성, 메일 초안 생성, 일정 후보 추천은 Copilot으로도 충분히 큰 도움을 줄 수 있습니다.',
          '반면 반복 규칙이 명확하고 자주 발생하는 일부 단계만 별도 Agent로 올리는 편이 더 효율적입니다.',
        ],
        title: '업무 예시',
      },
      {
        bullets: [
          '기본값은 사람 + Copilot',
          '자주 반복되고 규칙이 분명한 단계만 Agent',
          '개발 리소스는 선택과 집중',
          '단순 활용 → 지식 검색 → 실행 자동화 순으로 올라가는 편이 안전하다.',
        ],
        paragraphs: [],
        title: '기본 원칙',
      },
    ],
    category: 'automation-model',
    navLabel: '왜 Agent-first가 아닌가',
    relatedSlugs: ['what-is-hr-ax-copilot', 'connectors-and-actions'],
    slug: 'why-not-agent-first',
    summary:
      '모든 일을 Agent로 만들기보다, 사람이 중심이고 Copilot과 일부 Agent가 돕는 구조가 현실적입니다.',
    title: '왜 모든 일을 Agent로 만들지 않는가',
  },
  {
    blocks: [
      {
        paragraphs: [
          'Connector는 플랫폼 밖 시스템과 연결되는 통로이고, Action Layer는 그 통로를 통해 실제로 무엇을 읽고 쓰는지 정하는 층입니다.',
        ],
        title: '한 줄 요약',
      },
      {
        paragraphs: [
          '메일, 일정, Knox 포털, 사내 시스템은 모두 플랫폼 바깥에 있습니다.',
          'Connector는 그 시스템들을 연결해 주고, Action Layer는 “조회만 할지, 초안만 만들지, 실제 반영까지 할지”를 구분합니다.',
        ],
        title: '쉽게 말해',
      },
      {
        bullets: [
          'read: 보기만 함',
          'draft: 초안만 만듦',
          'write: 실제 반영함',
          'approval-gated write: 승인 후에만 실제 반영함',
        ],
        paragraphs: [],
        title: '행동 수준 구분',
      },
      {
        paragraphs: [
          '예를 들어 메일 요약은 read, 메일 초안 작성은 draft, 메일 실제 발송은 write 또는 approval-gated write로 볼 수 있습니다.',
          '중요한 건 특정 API 이름이 아니라, 플랫폼이 어떤 수준까지 행동할 수 있는지 먼저 정하는 것입니다.',
        ],
        title: '업무 예시',
      },
    ],
    category: 'automation-model',
    navLabel: 'Connector와 Action',
    relatedSlugs: ['why-not-agent-first', 'human-approval-boundary'],
    slug: 'connectors-and-actions',
    summary:
      '플랫폼이 바깥 시스템과 어떻게 연결되고, 어디까지 실제 행동할 수 있는지 정하는 구조입니다.',
    title: '메일·일정·포털 연결은 어떻게 이해하면 되는가',
  },
  {
    blocks: [
      {
        paragraphs: [
          '플랫폼이 사람 대신 실행할 수 있는 범위를 분명히 나눠야, 실제 조직에서 안심하고 쓸 수 있습니다.',
        ],
        title: '한 줄 요약',
      },
      {
        paragraphs: [
          '초안 생성과 정보 정리는 AI가 잘할 수 있지만, 실제 발송이나 등록, 공지처럼 영향이 큰 행동은 여전히 사람의 승인 절차가 필요합니다.',
          '이 경계를 분명히 하지 않으면 편의성은 잠깐 좋아 보여도 신뢰를 잃기 쉽습니다.',
          '또한 평가, 보상, 조직개편처럼 민감한 정보는 한 저장소에 섞지 않고 부서별·개인별 버킷으로 나눠야 합니다. 같은 AI라도 어떤 버킷을 볼 수 있는지와 어디까지 실행할 수 있는지는 별도로 통제되어야 합니다.',
        ],
        title: '쉽게 말해',
      },
      {
        paragraphs: [
          '예를 들어 평가 결과 안내 메일은 AI가 초안을 잘 써 줄 수 있습니다.',
          '하지만 실제 발송은 담당자나 관리자 확인 후에 이뤄져야 안전합니다.',
        ],
        title: '업무 예시',
      },
      {
        bullets: [
          '읽기와 요약은 폭넓게 허용할 수 있다.',
          '초안 작성은 비교적 넓게 허용할 수 있다.',
          '실제 반영은 승인 경계를 둔다.',
          '민감 정보는 부서/개인 버킷으로 분리한다.',
          '누가 어떤 행동을 했는지 기록이 남아야 한다.',
        ],
        paragraphs: [],
        title: '운영 원칙',
      },
    ],
    category: 'trust-model',
    navLabel: '승인 경계',
    relatedSlugs: ['connectors-and-actions', 'why-records-matter'],
    slug: 'human-approval-boundary',
    summary: '사람의 확인 없이 어디까지 자동으로 행동할 수 있는지 경계를 분명히 해야 합니다.',
    title: '왜 사람 승인 경계가 중요한가',
  },
  {
    blocks: [
      {
        paragraphs: [
          '서로 다른 노하우가 나왔다고 해서 항상 한쪽이 틀린 것은 아니며, 먼저 어떤 종류의 충돌인지 구분해야 합니다.',
        ],
        title: '한 줄 요약',
      },
      {
        paragraphs: [
          '실무에서는 A팀의 기준과 B팀의 기준이 다르거나, 같은 상황처럼 보여도 보고 대상과 책임 범위가 달라 판단이 달라지는 일이 많습니다.',
          '그래서 플랫폼은 충돌을 바로 하나로 합치기보다 “틀린 정보인지, 상황이 다른 것인지, 정말 같은 조건에서 의견이 갈리는지”를 먼저 나눠서 봐야 합니다.',
        ],
        title: '쉽게 말해',
      },
      {
        bullets: [
          '1단계: 사실 오류인지 먼저 확인하고, 틀린 정보면 걷어냅니다.',
          '2단계: 적용 부서, 보고 대상, 예외 상황이 다른 것은 아닌지 맥락을 나눕니다.',
          '3단계: 그래도 같은 조건에서 충돌하면 사람 승인과 조직 규칙으로 결정합니다.',
        ],
        paragraphs: [],
        title: '기본 처리 순서',
      },
      {
        paragraphs: [
          '예를 들어 어떤 임원 보고 방식이 서로 다르게 남아 있어도, 대상 임원이 다르다면 둘 다 맞을 수 있습니다.',
          '반대로 완전히 같은 조건인데 두 기준이 다르면, 그때는 사람이 조직 기준을 정하고 어떤 쪽을 표준으로 올릴지 결정해야 합니다.',
        ],
        title: '업무 예시',
      },
      {
        paragraphs: [
          '이 흐름이 없으면 플랫폼은 지식을 많이 쌓을수록 오히려 서로 다른 노하우가 뒤섞인 혼란스러운 저장소가 됩니다.',
          '결국 AI의 품질은 답변 속도보다, 충돌을 어떻게 분리하고 검수하는지에서 더 크게 갈립니다.',
        ],
        title: '왜 필요한가',
      },
    ],
    category: 'trust-model',
    navLabel: '노하우 충돌 다루기',
    relatedSlugs: ['why-tacit-knowledge-matters', 'human-approval-boundary', 'why-records-matter'],
    slug: 'how-knowledge-conflicts-are-handled',
    summary:
      '노하우 충돌은 삭제보다 구분과 검수의 문제이며, 마지막에는 사람 승인과 조직 규칙이 필요합니다.',
    title: '서로 다른 노하우가 충돌하면 어떻게 다루는가',
  },
  {
    blocks: [
      {
        paragraphs: ['좋은 답변 하나보다 “왜 이런 결론이 나왔는지”가 남는 것이 더 중요합니다.'],
        title: '한 줄 요약',
      },
      {
        paragraphs: [
          '업무는 한 번 끝나지 않고, 다음 사람이나 다음 단계로 이어집니다.',
          '그래서 대화 전문만 남기는 것보다 근거, 핵심 판단, 결과 문서를 같이 남겨 “다음 사람이 바로 이어받을 수 있게” 만드는 것이 중요합니다.',
        ],
        title: '쉽게 말해',
      },
      {
        paragraphs: [
          '예를 들어 제도 개선 검토를 했다면, 단순히 답변 한 번이 남는 것이 아니라 어떤 자료를 봤고, 어떤 논점을 비교했고, 어떤 초안을 만들었는지가 함께 남아야 다음 회의나 다음 담당자가 바로 이어받을 수 있습니다.',
        ],
        title: '업무 예시',
      },
      {
        paragraphs: [
          '이 기록이 없으면 매번 다시 설명해야 하고, AI가 도와준 결과도 일회성으로 끝납니다.',
          '반대로 기록이 쌓이면 플랫폼은 단순 채팅창이 아니라 조직이 배우는 작업 공간이 됩니다.',
          '특히 사용 중 생긴 초안, 검토 흔적, 최종 문서가 각 부서와 개인의 버킷 안에 계속 쌓이면, 플랫폼은 많이 쓸수록 그 조직에 맞는 자산을 더 많이 갖게 됩니다.',
        ],
        title: '왜 필요한가',
      },
    ],
    category: 'trust-model',
    navLabel: '기록이 중요한 이유',
    relatedSlugs: ['human-approval-boundary', 'work-card-and-process'],
    slug: 'why-records-matter',
    summary: '대화만 남기지 말고 근거와 결정 이유를 함께 남겨야 다음 사람이 이어받을 수 있습니다.',
    title: '왜 기록과 근거를 함께 남겨야 하는가',
  },
];

const SHARED_WIKI_ARTICLE_MAP = new Map(
  SHARED_WIKI_ARTICLES.map((article) => [article.slug, article]),
);

function getSharedWikiArticleBySlug(slug: string): SharedWikiArticle | undefined {
  return SHARED_WIKI_ARTICLE_MAP.get(slug);
}

function getSharedWikiArticlesByCategory(category: SharedWikiCategory): SharedWikiArticle[] {
  return SHARED_WIKI_ARTICLES.filter((article) => article.category === category);
}

export {
  SHARED_WIKI_ARTICLES,
  SHARED_WIKI_ARTICLE_MAP,
  SHARED_WIKI_CATEGORY_META,
  SHARED_WIKI_CATEGORY_ORDER,
  SHARED_WIKI_GLOSSARY,
  getSharedWikiArticleBySlug,
  getSharedWikiArticlesByCategory,
};
export type {
  SharedWikiArticle,
  SharedWikiBlock,
  SharedWikiCategory,
  SharedWikiCategoryMeta,
  SharedWikiGlossaryItem,
};
