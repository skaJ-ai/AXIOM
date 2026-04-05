# AXIOM — Software Design Document
# AX Insight for Organizational Memory

> 버전: 0.2.0
> 작성일: 2026-04-05
> 이전 프로젝트: AXIOM v0.1.0 (2026-03-26, HR AI Report Platform)
> 상태: 설계 LLM ↔ 구현 LLM 간 계약 문서

---

## 1. 이 제품은 무엇인가

### 비개발자를 위한 설명

**지금 HR 담당자가 겪는 문제:**

- 기획안을 쓸 때 아이디어를 구체화하는 과정이 가장 힘들다
- ChatGPT에 물어봐도 일반론만 나온다 — 우리 회사 맥락을 모르니까
- 좋은 기획을 해도 다음에 비슷한 일을 할 때 처음부터 시작이다
- 선배가 퇴사하면 그 사람의 노하우가 통째로 사라진다

**AXIOM가 하는 일:**

1. 기획이든, 운영안이든, 사안 정리든 — 작업 모드를 고른다
2. AI가 생각을 펼쳐주고(발산), 핵심을 잡아주고(수렴), 허점을 짚어준다(검증)
3. 여러 자료를 넣으면 인사이트를 뽑아준다(종합)
4. 준비가 되면 보고서 초안을 생성한다(작성)
5. **이 모든 과정에서 조직 지식이 자동으로 축적된다 — 추가 행동 없이**

**한 줄 정의:**

> AI가 사고를 정리·발전·검증해주고, 그 과정에서 조직 지식이 자동 축적되는 작업공간

### 일반 LLM과 뭐가 다른가

| | 일반 대화형 LLM | AXIOM |
|---|---|---|
| **시작** | 빈 화면. 프롬프트를 잘 써야 한다 | 작업 모드를 고르면 AI가 먼저 이끈다 |
| **아이디어** | 일반론적 제안 | 조직 맥락 기반 구체적 제안 |
| **검증** | 사용자가 직접 반론을 생각해야 | 가상 페르소나(임원, 현업, 비판자)가 허점을 짚어줌 |
| **자료 정리** | 한 번에 하나씩 질문해야 | 여러 자료를 넣으면 핵심과 연결점을 잡아줌 |
| **과거 작업** | 매번 새 대화. 맥락 초기화 | 쓸수록 조직 지식이 쌓여 더 정확해짐 |
| **결과물** | 자유 텍스트. 형식이 매번 다르다 | 회사 표준 형식의 본문 1장 + 별첨 |

**핵심 차별점:**

- **AI가 사고를 이끈다** — 발산, 수렴, 검증을 구조적으로 지원
- **우리 회사 맥락으로 답한다** — 축적된 조직 지식 기반
- **쓸수록 조직이 똑똑해진다** — 추가 행동 없이 지식 자동 축적
- **선배의 노하우가 사라지지 않는다** — 전문지식 영구 보존

---

## 2. 핵심 철학

- 이 제품은 `보고서 생성기`가 아니라 **사고 정리·발전·검증 도구**다. 보고서는 결과물 중 하나일 뿐
- 이 제품은 `LLM을 믿는 제품`이 아니라 **컨텍스트를 설계하는 제품**이다
- 대화는 자산이 아니라 원재료다. **자산은 정제된 지식과 구조화된 결과물**이다
- 모델이 기억하는 것이 아니라, **플랫폼이 조직 지식을 축적**하고 필요할 때 공급한다
- 어떤 LLM을 써도 하네스(규칙+구조)가 품질 하한선을 보장한다
- **사용자의 추가 행동 없이** 지식이 축적되어야 한다 (Zero-action accumulation)

### 전략적 맥락

- 3개월 내(~2026-07) 사내에 외부 LLM(ChatGPT/Claude) 오픈 예정
- 보고서 생성만으로는 commodity화 — 축적된 조직 지식만이 moat
- **ChatGPT는 매번 빈 화면, AXIOM는 조직 맥락으로 시작한다** — 이것이 switching cost

---

## 3. 대상 사용자

- HR 도메인 (People팀 AX & CI Lab)
- 주요 사용자: 수백 명 규모의 HR 담당자
- 비개발자. AI 경험은 ChatGPT 수준의 자유 대화만 해본 정도
- 가장 시간 소모가 큰 작업: **기획안 아이디에이션**

---

## 4. 4가지 작업 모드

### 4.1 발산 — 아이디어 구체화

사용자의 모호한 아이디어를 펼치고, 구체화하고, 발전시킨다.

- AI가 산파술로 아이디어를 여러 방향으로 발산
- 핵심을 잡아 수렴
- 발산 ↔ 수렴 반복
- **결과물**: 정리된 아이디어 노트 (Idea + Cluster)

**핵심 질문**: "이 보고서로 의사결정자가 무슨 결정을 내리게 하고 싶으세요?" (정보 수집이 아닌 의도 명확화)

### 4.2 검증 — 페르소나 리뷰

기획안이나 아이디어를 다양한 관점에서 검증한다.

- 가상 페르소나 부여: 임원, 현업 담당자, 비판자, 노조 등
- 각 관점에서 비판점, 리스크, 허점 도출
- 단순 반대가 아닌 구조화된 비판: 리스크 / 근거 부족 / 실행 가능성 / 전제 공격
- **결과물**: 비판점 + 보완 제안 (Review)

### 4.3 종합 — 자료 분석

여러 자료를 투입하면 핵심을 잡아주고 인사이트를 도출한다.

- 다수 자료의 핵심 정리
- 자료 간 연결점과 모순점 식별
- 인사이트 및 시사점 도출
- **결과물**: 요약 + 시사점 (Claim + Evidence)

### 4.4 작성 — 보고서 초안

위 모드들의 결과물을 재료로 최종 보고서를 생성한다.

- 발산에서 나온 아이디어, 검증에서 나온 리스크, 종합에서 나온 인사이트를 모두 활용
- 본문 1장(A4) + 별첨 N장 형식
- Front Guard(형식 강제) + Back Guard(품질 검증)
- **결과물**: 구조화된 보고서 (Report)

### 모드 간 연결

모든 모드의 결과물은 다른 모드의 입력이 될 수 있다:

```
[종합] 교육 관련 자료 5개 분석
       ↓ 인사이트 축적
[발산] "이 인사이트 기반으로 새 교육 체계 기획해볼까"
       ↓ 아이디어 구체화
[검증] "임원 관점에서 이 기획 검증해줘"
       ↓ 비판점 반영
[작성] "최종 기획안 초안"
       ↓ 전부 지식으로 자동 축적
```

---

## 5. 보고서 유형

> 주의: 아래는 현재까지 파악된 유형이며, 실제 보고서 인풋 기반으로 재설계 예정 ('보고서 강화' 참조)

### 공통 구조

모든 보고서는 **본문 1장(A4) + 별첨 N장** 형태:
- 본문: 의사결정자가 읽는 핵심. 배경/추진배경/도입의도 → 현황 → 제안
- 별첨: 본문에서 담지 못한 세부사항, 근거 데이터

### 3가지 유형

| 유형 | 성격 | 난이도 |
|------|------|--------|
| **운영(안)** | 프로그램/워크숍 등 실행 계획서 | 중 |
| **기획(안)** | 새 제도/아이템 설계. 아이디에이션 필요 | **높음** — AXIOM의 주력 |
| **~~관련** | 모호한 사안 정리/브리핑. 인물평, 동향 등 포함 | 낮~중 |

> 템플릿 세부 섹션은 '보고서 강화' 토의 시 실제 보고서 기반으로 확정.

---

## 6. 기준 시나리오

> **HR 담당자가 새 교육 체계 기획안을 작성하는 과정. 자료 분석 → 아이디어 발전 → 검증 → 최종 보고서까지.**

### 상세 흐름

```
1. 로그인 → 워크스페이스 대시보드
2. "새 작업" → 작업 모드 선택

── [종합] 자료 분석 ──
3. "종합" 모드 선택
4. 교육 관련 자료 5건 첨부 (설문 결과, 벤치마킹 자료, 이전 교육 보고서 등)
5. AI: "5건의 자료에서 공통적으로 나타나는 패턴은..."
6. AI: "주목할 점은 현업 적용률이 일관되게 낮다는 것입니다"
7. 결과 저장 → Claim + Evidence 객체로 자동 축적

── [발산] 아이디어 구체화 ──
8. "발산" 모드 선택 (종합 결과가 자동으로 컨텍스트에 포함)
9. AI: "이 기획으로 의사결정자가 무슨 결정을 내리게 하고 싶으세요?"
10. 사용자: "교육 체계 전면 개편 승인"
11. AI: 여러 방향으로 아이디어 발산 → 핵심 3가지로 수렴
    + 축적된 조직 지식 활용: "작년 유사 기획에서 파일럿 후 전사 적용이 효과적이었습니다"
12. 결과 저장 → Idea + Cluster 객체로 자동 축적

── [검증] 페르소나 리뷰 ──
13. "검증" 모드 선택 (발산 결과가 자동으로 컨텍스트에 포함)
14. AI 페르소나 [임원]: "예산 대비 ROI 근거가 부족합니다"
15. AI 페르소나 [현업]: "현업 적용 지원 체계가 빠져있습니다"
16. 결과 저장 → Review 객체로 자동 축적

── [작성] 보고서 초안 ──
17. "작성" 모드 선택 (모든 이전 결과가 재료로 포함)
18. AI: 본문 1장 + 별첨 형식으로 기획안 초안 생성
19. 각 섹션에 confidence + 근거 라벨 표시
20. 사용자 검토 → 최종 저장
21. 보고서 확정 시 → 지식 자동 축적 (Entity, Fact, Insight)
    → 다음에 누군가 교육 관련 작업을 할 때 이 맥락이 자동 제공
```

---

## 7. 산파술 인터뷰 설계

### 7.1 공통 7개 항목 (체크리스트)

| # | 항목 | 질문 의도 | 추천 방법론 |
|---|------|----------|-----------|
| 1 | 의도 | 이 보고서로 무슨 결정을 이끌어내고 싶은가? | 의도 역분해 (Intent Decomposition) |
| 2 | 목적 | 이 일을 왜 하는가? | 5 Whys, SCQA(Situation→Complication) |
| 3 | 대상 | 누구를 위한 것인가? | 이해관계자 맵, Employee Journey Map |
| 4 | 현황 | 지금 상황은 어떤가? | SWOT, As-Is/To-Be, PEST |
| 5 | 제안 | 무엇을 하고 싶은가? | MECE + Issue Tree, Design Thinking |
| 6 | 기대효과 | 성공하면 어떻게 달라지는가? | OKR, Logic Model(Input→Impact) |
| 7 | 근거/데이터 | 뒷받침할 자료가 있는가? | So What/Why So 검증 |

> v0.1에서 변경: "의도(Intent)" 항목 최상단 추가. 정보 수집이 아닌 의사결정 목적 명확화가 먼저.

### 7.2 모드별 산파술 차이

| 모드 | 산파술 초점 | 핵심 질문 |
|------|-----------|----------|
| **발산** | 아이디어 확장 + 수렴 | "이 방향을 더 밀어볼까요, 다른 가능성을 탐색할까요?" |
| **검증** | 약점 식별 + 보완 | "임원이라면 이 기획의 어디를 먼저 물을까요?" |
| **종합** | 패턴 발견 + 연결 | "이 자료들에서 공통적으로 나타나는 것은 무엇인가요?" |
| **작성** | 정보 완결성 | "아직 빠진 근거가 있나요? 이 섹션의 confidence가 낮은 이유는?" |

### 7.3 방법론 제안 UX

- AI가 대화 중 적절한 시점에 방법론을 **클릭 가능한 카드**로 제안
- 예: "현황을 정리하는 방법으로 다음 중 하나를 선택해볼까요?"
  - [SWOT 분석] [As-Is / To-Be] [자유 정리]
- 사용자가 선택하면 해당 프레임워크에 맞춘 후속 질문으로 전환
- 선택하지 않아도 진행 가능 (강제 아님)

> 상세 방법론 레퍼런스: `docs/methodology-reference.md`

---

## 8. 지식 축적 설계

### 8.1 핵심 원칙

- **Zero-action**: 사용자의 추가 행동 없이 지식이 축적된다
- **Quality over quantity**: 양이 아닌 양질의 구조화된 지식
- **Provenance**: 모든 지식은 출처(어떤 세션, 어떤 보고서)를 추적할 수 있다
- **Freshness**: 지식의 신선도를 관리한다 (언제 생성, 언제 마지막 확인)

### 8.2 3계층 지식 모델

```
┌─────────────────────────────────────────┐
│  Entity Registry (누구/무엇)             │
│  인물, 부서, 프로젝트, 교육과정, 제도      │
│  → 보고서 확정 시 코드로 자동 추출         │
│                                         │
│  Fact Store (수치/사실)                  │
│  KPI, 참여율, 만족도, 진행률, 일정 등       │
│  → 구조화된 sections에서 파싱             │
│  → 시계열로 축적 (Q1→Q2 변화 추적)        │
│                                         │
│  Insight Store (판단/해석)               │
│  "현업 적용률이 낮은 이유는..."            │
│  "이직률 하락은 복지 개선 효과로 추정"      │
│  → LLM 추출 (야간 배치, GPU 최소)         │
└─────────────────────────────────────────┘
```

### 8.3 축적 파이프라인

```
세션 결과물 확정 (final / promoted_asset)
    ↓
[즉시 — 코드 처리, GPU 0]
    ├─ 엔티티 추출 (엔티티 사전 + 정규식)
    ├─ 수치/사실 파싱 (구조화된 sections에서)
    ├─ 기존 엔티티/팩트와 연결 (DB 조회)
    └─ 인덱스 갱신
    ↓
[지연 — LLM 야간 배치, GPU 최소]
    ├─ 인사이트 추출 및 요약
    ├─ 시계열 비교 (이전 동일 주제와 변화점)
    └─ 모순 감지 (기존 지식과 충돌하는 사실)
```

### 8.4 지식 활용 시점

| 시점 | 활용 방식 |
|------|----------|
| 세션 시작 | 관련 엔티티/팩트를 AI 컨텍스트에 자동 주입 |
| 대화 중 | "이전에 유사 기획에서 A 접근법이 효과적이었습니다" 맥락 제공 |
| 검증 시 | 축적된 리스크/비판점을 페르소나에 반영 |
| 작성 시 | 관련 수치, 이전 결정, 참고 보고서 자동 공급 |

---

## 9. UI 구조

### 9.1 라우팅

```
/                       → 제품 소개 페이지 (비로그인)
/login                  → 로그인
/signup                 → 회원가입
/workspace              → 워크스페이스 대시보드
/workspace/new          → 작업 모드 선택
/workspace/session/:id  → 캔버스 (모드별 레이아웃)
/workspace/asset/:id    → 결과물 뷰어
/workspace/knowledge    → 축적된 지식 브라우저 (후순위)
```

### 9.2 작업 모드 선택 (`/workspace/new`)

4개 모드 카드:
- [발산] 아이디어 구체화 — "흩어진 생각을 구조화합니다"
- [검증] 페르소나 리뷰 — "다양한 관점에서 허점을 짚어줍니다"
- [종합] 자료 분석 — "여러 자료의 핵심과 연결점을 찾습니다"
- [작성] 보고서 초안 — "정리된 재료로 보고서를 생성합니다"

각 카드에 간단한 설명 + 이전 세션 연결 옵션 ("이전 발산 결과를 이어서 검증할까요?")

### 9.3 캔버스 (`/workspace/session/:id`)

모드별로 우측 패널이 달라짐:

**발산 모드:**
```
┌──────────────────────┬────────────────────────┐
│  채팅 패널 (좌)        │  아이디어 보드 (우)       │
│                      │                        │
│  [AI: 의도 질문]      │  ┌─ 아이디어 카드 ─────┐ │
│  [사용자 응답]         │  │ 💡 아이디어 A       │ │
│  [AI: 발산]           │  │ 💡 아이디어 B       │ │
│  [AI: 수렴 제안]      │  │ 💡 아이디어 C       │ │
│                      │  └────────────────────┘ │
│                      │  ┌─ 수렴 결과 ─────────┐ │
│                      │  │ 핵심 방향 요약       │ │
│                      │  └────────────────────┘ │
└──────────────────────┴────────────────────────┘
```

**검증 모드:**
```
┌──────────────────────┬────────────────────────┐
│  채팅 패널 (좌)        │  검증 결과 패널 (우)      │
│                      │                        │
│  [페르소나: 임원]      │  ┌─ 리스크 ──────────┐ │
│  [페르소나: 현업]      │  │ ⚠ 예산 ROI 근거    │ │
│  [페르소나: 비판자]    │  │ ⚠ 실행 체계 미비    │ │
│                      │  └────────────────────┘ │
│                      │  ┌─ 보완 제안 ─────────┐ │
│                      │  │ → 파일럿 후 전사 적용 │ │
│                      │  └────────────────────┘ │
└──────────────────────┴────────────────────────┘
```

**종합 모드:**
```
┌──────────────────────┬────────────────────────┐
│  채팅 패널 (좌)        │  분석 결과 패널 (우)      │
│                      │                        │
│  [AI: 패턴 발견]      │  ┌─ 핵심 요약 ─────────┐ │
│  [AI: 인사이트]       │  │ 자료별 요약          │ │
│                      │  │ 공통 패턴           │ │
│                      │  │ 모순점              │ │
│                      │  │ 시사점              │ │
│                      │  └────────────────────┘ │
└──────────────────────┴────────────────────────┘
```

**작성 모드:** (기존 캔버스와 유사)
```
┌──────────────────────┬────────────────────────┐
│  채팅 패널 (좌)        │  문서 캔버스 (우)         │
│                      │                        │
│  [AI 인터뷰]          │  ┌─ 본문 (1장) ────────┐ │
│  [사용자 응답]         │  │ 배경                │ │
│  [방법론 제안]         │  │ 현황                │ │
│                      │  │ 제안                │ │
│                      │  └────────────────────┘ │
│                      │  ┌─ 별첨 ──────────────┐ │
│                      │  │ 세부사항 + 근거       │ │
│                      │  └────────────────────┘ │
│                      │  섹션별 confidence 표시   │
└──────────────────────┴────────────────────────┘
```

---

## 10. 데이터 모델

### 10.1 1급 객체 (First-class Objects)

v0.1의 `Session → Message, Source, Deliverable → MemoryChunk`에서 확장:

```
[입력]
  Source         — 사용자가 첨부한 자료 (텍스트, 표, 데이터)

[사고 과정]
  Idea           — 발산에서 나온 개별 아이디어
  Cluster        — 수렴에서 묶인 아이디어 그룹 + 요약
  Claim          — 주장 (근거 Source 연결 필수)
  Review         — 페르소나 검증 결과 (리스크, 반론, 보완)

[산출물]
  Report         — 보고서 초안 (본문 + 별첨)

[축적 — 자동 추출]
  Entity         — 인물, 부서, 프로젝트, 교육과정, 제도
  Fact           — 수치, 사실, 일정 (시계열 축적)
  Insight        — 판단, 해석, 교훈 (LLM 추출)
```

모든 객체 간 **provenance link**: "이 Claim은 이 Source에서", "이 Review는 이 Idea에 대해"

### 10.2 엔티티 관계

```
User (1) ──── (1) Workspace
                    │
                    ├── (N) Session
                    │         ├── mode: diverge | validate | synthesize | write
                    │         ├── (N) Message
                    │         ├── (N) Source
                    │         ├── (N) Idea
                    │         ├── (N) Cluster ── (N) Idea
                    │         ├── (N) Claim ── (N) Source (evidence)
                    │         └── (N) Review
                    │
                    ├── (N) Report
                    │         ├── session_id (어떤 세션에서 생성)
                    │         ├── sections: JSON (본문 + 별첨)
                    │         └── status: draft | final | promoted_asset
                    │
                    └── [Knowledge Layer — 자동 축적]
                          ├── (N) Entity
                          ├── (N) Fact ── (1) Entity
                          └── (N) Insight ── (N) Entity, Source, Report
```

### 10.3 핵심 테이블

```sql
-- 사용자
CREATE TABLE users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  login_id       TEXT UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  name           TEXT NOT NULL,
  employee_number TEXT UNIQUE NOT NULL,
  knox_id        TEXT UNIQUE NOT NULL,
  role           TEXT DEFAULT 'user',  -- user | admin
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- 워크스페이스
CREATE TABLE workspaces (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id   UUID NOT NULL REFERENCES users(id),
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 세션 (작업 단위)
CREATE TABLE sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id),
  mode          TEXT NOT NULL,  -- diverge | validate | synthesize | write
  report_type   TEXT,           -- operation | planning | briefing (작성 모드에서만)
  title         TEXT,
  status        TEXT DEFAULT 'in_progress',  -- in_progress | completed
  checklist     JSONB,
  parent_session_id UUID REFERENCES sessions(id),  -- 이전 모드 결과 연결
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 메시지
CREATE TABLE messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id),
  role       TEXT NOT NULL,  -- user | assistant | system | persona:{name}
  content    TEXT NOT NULL,
  metadata   JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 소스 (근거자료)
CREATE TABLE sources (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id),
  content    TEXT NOT NULL,
  label      TEXT,
  type       TEXT,  -- text | table | data
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 아이디어 (발산 모드)
CREATE TABLE ideas (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id),
  content    TEXT NOT NULL,
  status     TEXT DEFAULT 'active',  -- active | merged | discarded
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 클러스터 (수렴 결과)
CREATE TABLE clusters (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id),
  label      TEXT NOT NULL,
  summary    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE cluster_ideas (
  cluster_id UUID NOT NULL REFERENCES clusters(id),
  idea_id    UUID NOT NULL REFERENCES ideas(id),
  PRIMARY KEY (cluster_id, idea_id)
);

-- 주장 (종합 모드)
CREATE TABLE claims (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id),
  content    TEXT NOT NULL,
  confidence TEXT DEFAULT 'medium',  -- high | medium | low
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE claim_sources (
  claim_id  UUID NOT NULL REFERENCES claims(id),
  source_id UUID NOT NULL REFERENCES sources(id),
  excerpt   TEXT,  -- 근거 발췌
  PRIMARY KEY (claim_id, source_id)
);

-- 검증 결과 (검증 모드)
CREATE TABLE reviews (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   UUID NOT NULL REFERENCES sessions(id),
  persona_name TEXT NOT NULL,    -- 임원 | 현업 | 비판자 | 노조 등
  category     TEXT NOT NULL,    -- risk | evidence_gap | feasibility | assumption
  content      TEXT NOT NULL,
  severity     TEXT DEFAULT 'medium',  -- high | medium | low
  suggestion   TEXT,             -- 보완 제안
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- 보고서 (작성 모드 결과)
CREATE TABLE reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id),
  session_id    UUID REFERENCES sessions(id),
  report_type   TEXT NOT NULL,  -- operation | planning | briefing
  title         TEXT NOT NULL,
  body          JSONB NOT NULL,    -- 본문 1장 (섹션별)
  appendix      JSONB,             -- 별첨
  status        TEXT DEFAULT 'draft',  -- draft | final | promoted_asset
  version       INTEGER DEFAULT 1,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ===== Knowledge Layer (자동 축적) =====

-- 엔티티 레지스트리
CREATE TABLE entities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id),
  type          TEXT NOT NULL,  -- person | department | project | program | policy
  name          TEXT NOT NULL,
  aliases       TEXT[],         -- 동일 엔티티의 다른 표기 (개발1팀, Dev1, SW개발1팀)
  metadata      JSONB,          -- 부서코드, 직급 등 부가 정보
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workspace_id, type, name)
);

-- 팩트 스토어 (시계열)
CREATE TABLE facts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id   UUID NOT NULL REFERENCES entities(id),
  category    TEXT NOT NULL,     -- kpi | participation | satisfaction | progress | headcount
  value       TEXT NOT NULL,     -- "89%", "4.2/5", "12명" 등
  period      TEXT,              -- "2026-Q1", "2026-03", "2026-W14" 등
  context     TEXT,              -- "전사 대상", "개발1팀 한정" 등 범위
  source_session_id UUID REFERENCES sessions(id),
  source_report_id  UUID REFERENCES reports(id),
  confidence  TEXT DEFAULT 'medium',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 인사이트 스토어
CREATE TABLE insights (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  content     TEXT NOT NULL,
  category    TEXT,              -- trend | risk | lesson | decision | recommendation
  source_session_id UUID REFERENCES sessions(id),
  source_report_id  UUID REFERENCES reports(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 엔티티-인사이트 연결
CREATE TABLE entity_insights (
  entity_id  UUID NOT NULL REFERENCES entities(id),
  insight_id UUID NOT NULL REFERENCES insights(id),
  PRIMARY KEY (entity_id, insight_id)
);

-- 기존 memory_chunks 테이블 유지 (Vector RAG 폴백용)
-- 기존 전문 검색 인덱스 유지
```

---

## 11. 시스템 아키텍처

### 11.1 기술 스택

| 항목 | 선택 | 이유 |
|------|------|------|
| Frontend | Next.js 15 (App Router) | 기존 코드베이스. SSR + API Routes |
| UI | Tailwind CSS + "Trust within Flow" 디자인 시스템 | 이미 구축됨 |
| DB | PostgreSQL + Drizzle ORM | 동시 접속 수백 명 대비. 타입 안전 |
| AI (Chat) | Qwen3-Next (사내) | chat/generation. OpenAI 호환 `/v1` API |
| AI (Embedding) | qwen3-embedding:4b (사내 Ollama) | vector memory / hybrid retrieval |
| AI SDK | Vercel AI SDK | 스트리밍, useChat, 구조화 출력 |
| 배포 | Docker Compose (사내 서버, port 26000) | HR-Coaching과 병렬 운영 |
| 인증 | 자체 구현 (bcrypt + JWT) | 사내 환경, 외부 의존성 최소화 |

### 11.2 컨테이너 구성

```yaml
services:
  app:
    build: .
    ports: ["26000:3000"]
    environment:
      DATABASE_URL: postgresql://harp:***@db:5432/harp
      LLM_API_URL: http://10.240.248.157:8533/v1
      LLM_MODEL: Qwen3-Next
      EMBEDDING_API_URL: http://10.240.248.157:11434
      EMBEDDING_MODEL: qwen3-embedding:4b
    depends_on: [db]

  db:
    image: postgres:16-alpine
    volumes: ["pgdata:/var/lib/postgresql/data"]
    environment:
      POSTGRES_DB: harp
      POSTGRES_USER: harp
      POSTGRES_PASSWORD: ***

volumes:
  pgdata:
```

### 11.3 API 구조

```
POST   /api/auth/signup             → 회원가입
POST   /api/auth/login              → 로그인
GET    /api/auth/me                 → 현재 사용자

POST   /api/sessions                → 세션 생성 (mode + report_type 지정)
GET    /api/sessions                → 세션 목록
GET    /api/sessions/:id            → 세션 상세

POST   /api/sessions/:id/chat       → 채팅 (스트리밍)
POST   /api/sessions/:id/source     → 근거자료 첨부

GET    /api/sessions/:id/ideas      → 아이디어 목록 (발산)
GET    /api/sessions/:id/clusters   → 클러스터 목록 (수렴)
GET    /api/sessions/:id/claims     → 주장 목록 (종합)
GET    /api/sessions/:id/reviews    → 검증 결과 목록

POST   /api/sessions/:id/generate   → 보고서 생성 (작성 모드)
GET    /api/reports                  → 보고서 목록
GET    /api/reports/:id              → 보고서 상세
PATCH  /api/reports/:id              → 보고서 수정/상태변경

GET    /api/knowledge/entities       → 엔티티 목록
GET    /api/knowledge/entities/:id   → 엔티티 상세 (관련 팩트, 인사이트 포함)
GET    /api/knowledge/search?q=...   → 지식 검색

GET    /api/search?q=...             → workspace 내 통합 검색
GET    /api/health                   → 헬스체크
```

---

## 12. Front Guard 설계 (시스템 프롬프트)

### 12.1 모드별 프롬프트 구조

**발산 모드:**
```
[시스템 역할]
당신은 HR 기획 전문 사고 파트너입니다.
사용자의 아이디어를 발산시키고 수렴시키는 것을 돕습니다.

[축적된 지식 컨텍스트]
{관련 Entity, Fact, Insight 자동 주입}

[규칙]
- 먼저 "이 작업으로 무슨 결정을 이끌어내고 싶은가?"를 확인
- 아이디어를 여러 방향으로 펼쳐주되, 조직 맥락을 반영
- 적절한 시점에 수렴 제안
- 각 아이디어를 Idea 객체로 구조화하여 반환
```

**검증 모드:**
```
[시스템 역할]
당신은 다양한 관점의 검증 패널입니다.
사용자의 기획/아이디어를 비판적으로 검토합니다.

[페르소나 카드]
- 임원: 예산, ROI, 전략 정합성 관점
- 현업: 실행 가능성, 현장 적용성 관점
- 비판자: 논리적 허점, 전제 공격

[축적된 지식 컨텍스트]
{이전 유사 기획의 리스크, 실패 사례 등 자동 주입}

[규칙]
- 각 페르소나별로 구조화된 비판: risk | evidence_gap | feasibility | assumption
- 비판 후 반드시 보완 제안 포함
- Review 객체로 구조화하여 반환
```

**종합 모드:**
```
[시스템 역할]
당신은 자료 분석 전문가입니다.
여러 자료에서 핵심을 추출하고 인사이트를 도출합니다.

[축적된 지식 컨텍스트]
{관련 주제의 기존 Fact, Insight 자동 주입}

[규칙]
- 자료별 핵심 요약
- 자료 간 공통 패턴, 모순점 식별
- 인사이트 도출 시 근거 명시
- Claim + Evidence 구조로 반환
```

**작성 모드:**
```
[시스템 역할]
수집된 정보를 기반으로 보고서를 작성합니다.

[이전 모드 결과]
{발산 Cluster, 검증 Review, 종합 Claim 자동 주입}

[템플릿 구조]
본문 1장: 배경 → 현황 → 제안
별첨: 세부사항 + 근거 데이터

[Front Guard 규칙]
- 근거 없이 단정적 서술 금지. 근거 부족 시 "추정" 표시
- 각 섹션에 confidence + cited 메타데이터
- 비즈니스 한국어 톤. 번역체 금지
```

---

## 13. 데이터 라이프사이클

### 13.1 작업 결과물

```
session (사고 과정)
    ↓ 모드별 결과물 생성
    ├─ [발산] Idea → Cluster
    ├─ [검증] Review
    ├─ [종합] Claim + Evidence
    └─ [작성] Report (draft)
                ↓ 사용자 검토
            Report (final)
                ↓ 사용자 선택
            Report (promoted_asset)
```

### 13.2 지식 축적

```
Report (final/promoted) 확정
    ↓ 자동 (사용자 행동 0)
    ├─ [즉시] Entity 추출/갱신
    ├─ [즉시] Fact 추출/축적
    ├─ [즉시] MemoryChunk 임베딩 (기존 RAG)
    └─ [야간 배치] Insight 추출/요약
```

- 전환은 모두 **사용자의 명시적 액션**으로만 발생 (지식 축적 제외 — 이건 자동)
- 모든 단계의 데이터는 영구 보관
- 삭제는 사용자 명시 요청 시만

---

## 14. 인증/인가

### MVP 인증

- self-signup: loginId / password / name / employeeNumber / knoxId
- loginId, employeeNumber, knoxId 각각 유니크 제약
- 비밀번호: bcrypt 해시 저장
- 세션: JWT (httpOnly cookie)

### 인가

- 기본값: private. 본인 workspace만 접근 가능
- 지식 레이어: 동일 workspace 내에서만 축적/조회
- 관리자(admin): 사용자 목록, 계정 상태, 내역 확인 가능
- 추후: 조직 전체 지식 풀 + 권한 기반 필터링 (공개/부서/개인 영역)

---

## 15. 의사결정 기록 (ADR)

| # | 결정 | 근거 |
|---|------|------|
| D-001 | 제품 재정의: 보고서 생성기 → 사고 지원 + 지식 축적 플랫폼 | 보고서 생성은 ChatGPT로 commodity화. 사고 과정 지원 + 조직 지식이 moat |
| D-002 | 4가지 작업 모드 (발산/검증/종합/작성) | HR 담당자가 가장 힘든 건 아이디에이션과 검증. 보고서 작성은 결과물일 뿐 |
| D-003 | Zero-action 지식 축적 | 사용자 추가 행동 없이 쌓여야 실제로 쓴다 |
| D-004 | 3계층 지식 모델 (Entity + Fact + Insight) | Full LLM-Wiki는 over-engineering. 구조화 추출은 코드, 요약만 LLM |
| D-005 | 야간 배치로 GPU 부담 최소화 | 실시간 GPU 0. 인사이트 추출만 야간 배치 |
| D-006 | 산파술: 의도(Intent) 질문 최우선 | 정보 수집이 아닌 의사결정 목적 명확화가 먼저 (Miessler Intent-Based Engineering) |
| D-007 | 페르소나 검증: 구조화된 비판 | 단순 반대가 아닌 risk/evidence_gap/feasibility/assumption 분류 |
| D-008 | 보고서 형식: 본문 1장 + 별첨 | 실제 HR 보고서 관행 반영 |
| D-009 | LLM: Qwen3-Next (사내) | 외부 API 불가. 자체 호스팅으로 Ingest 비용 0 |
| D-010 | DB: PostgreSQL + Drizzle + pgvector | 정형 데이터 + 벡터 검색 통합 |
| D-011 | 배포: Docker Compose, port 26000 | 사내 서버 운영 |
| D-012 | 기존 MemoryChunk 유지 | Vector RAG를 폴백으로 유지. 지식 레이어와 병행 |

---

## 16. 구현 페이즈 (3개월 로드맵)

### Phase 1: 코어 재구축 (1개월차)

목표: 4가지 작업 모드 + Entity/Fact Store

- 세션 모델 확장 (mode 필드, parent_session_id)
- 발산 모드 구현 (Idea, Cluster 테이블 + 산파술 프롬프트)
- 검증 모드 구현 (Review 테이블 + 페르소나 프롬프트)
- 종합 모드 구현 (Claim, claim_sources 테이블 + 분석 프롬프트)
- 작성 모드: 기존 캔버스 적응 (Report 테이블로 전환)
- Entity/Fact 자동 추출 파이프라인 (코드 기반, GPU 0)
- 사용자 체감: "이전 보고서 수치가 자동으로 뜬다"

### Phase 2: 인사이트 + 시계열 (2개월차)

목표: Insight Store + 지식 활용 고도화

- Insight 야간 배치 추출 파이프라인
- 시계열 Fact 비교 (Q1→Q2 변화 추적)
- 세션 시작 시 관련 지식 자동 컨텍스트 주입
- 모드 간 연결 UX (발산 결과 → 검증으로 이어가기)
- 사용자 체감: "지난번이랑 뭐가 달라졌는지 알려준다"

### Phase 3: 교차 분석 + 제품 완성 (3개월차)

목표: 교차 분석 + 지식 브라우저

- 엔티티 간 교차 분석 (인물×프로젝트×부서)
- 모순 감지 (기존 지식과 새 보고서 충돌)
- 지식 브라우저 UI (/workspace/knowledge)
- 제품 소개 페이지 재작성
- 사용자 체감: "관련된 다른 보고서 맥락까지 연결된다"

---

## 17. 벤치마크 참조

| 영역 | 참조 프로젝트/제품 | 차용할 것 | AXIOM 차별화 |
|------|-------------------|----------|------------|
| 자료 종합 | STORM (stanford-oval/storm) | 질문 분해 → 다관점 탐색 → 출처 추적 | 결과가 조직 지식으로 자동 축적 |
| 페르소나 검증 | CrewAI, CAMEL | role card + rubric + speaking order | 검증 결과가 구조화 객체로 저장·재활용 |
| 발산-수렴 UX | AFFiNE, Heptabase | 아이디어 카드 + 클러스터링 | 모든 결과가 다음 세션 컨텍스트로 자동 공급 |
| 지식 축적 | Smart Connections, LLM-Wiki | background indexing + resurfacing | 조직 차원 + 권한 체계 + 시계열 추적 |
| 리서치 DAG | GPT Researcher | planner → agents → publisher | 일회성이 아닌 누적형 파이프라인 |

---

## 18. 아직 열린 질문

1. 보고서 유형별 실제 템플릿 세부 섹션 확정 → '보고서 강화' 토의 시 결정
2. 엔티티 사전 초기 구축 방법 (부서명, 프로젝트명 등 seed data)
3. 엔티티 별칭(alias) 매핑 자동화 수준 (코드 vs LLM)
4. 조직 전체 지식 풀 개방 시점과 권한 모델
5. 발산 모드의 시각적 UX (카드 보드 vs 리스트 vs 마인드맵)
6. 페르소나 카드 커스터마이징 (사용자가 페르소나 추가/수정 가능?)
7. 기존 구현 코드(v0.1)와 새 데이터 모델 간 마이그레이션 전략
