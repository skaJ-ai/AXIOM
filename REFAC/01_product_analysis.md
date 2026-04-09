# AXIOM 제품 분석

## 제품 한 줄 정의
AXIOM은 **지속 가능한 HR 사고/문서 작업을 위한 structured copilot**입니다.
단발성 채팅이 아니라,
- 발산
- 검증
- 종합
- 작성
의 모드를 통해 생각을 전개하고,
그 과정에서 나온 artifact를 재활용 가능한 자산으로 쌓는 구조를 지향합니다.

---

## 1. 제품으로서 실제 강한 점

### A. 4-mode thinking 구조
가장 강한 차별점입니다.
단순한 챗봇이 아니라 작업 단계별 mode를 나눠 놓았다는 점이 명확합니다.

의미:
- 사용자에게 사고 프레임을 제공
- 프롬프트 범위를 줄임
- eval/품질관리도 쉬워짐
- handoff 구조가 제품 안에 녹음

### B. Intermediate artifacts를 1급 객체로 다룸
AXIOM의 좋은 점은 최종 결과만 저장하지 않는다는 점입니다.
- ideas
- claims
- reviews
- canvas
- checklist
- sources
- reports/deliverables
이런 중간 결과물을 실제 제품 레이어로 다룹니다.

이건 일반 AI chat 앱보다 훨씬 강한 운영 구조입니다.

### C. Deliverable 중심 workflow
생성 이후 흐름이 실제로 존재합니다.
- draft 생성
- 수정
- tone conversion
- export
- promoted_asset 승격

즉 “답변 생성”이 아니라 “산출물 운영”까지 가려는 의도가 분명합니다.

### D. Memory / retrieval 기초 체력
memory chunk, hybrid retrieval, recency weighting, semantic/lexical mixing이 실제로 존재합니다.
이건 슬라이드웨어가 아니라 제품 인프라 수준입니다.

---

## 2. 디자인/UX 관점 평가

## 강점
### A. Session canvas UX가 좋음
좌측 인터뷰, 중앙/우측 작업면, readiness, checklist, sources, generation preview 등은 꽤 잘 설계돼 있습니다.
특히 write mode는 상당히 productized 되어 있습니다.

### B. Readiness 모델이 유용함
AI 제품에서 흔한 문제는 “언제 generate 해도 되는지 모르겠다”는 건데,
AXIOM은 readiness percent와 partial threshold로 이걸 잘 완화합니다.

### C. Help/guide copy가 실무형
체크리스트 help가 추상적이지 않고 구체 예시 기반이라 실제 HR 사용자에게 맞습니다.

## 약점
### A. 인지부하가 높음
사용자는 mode, template, checklist, references, sources, deliverable status, knowledge browser까지 한 번에 마주합니다.
내부 논리는 맞지만 초반엔 다소 무겁습니다.

### B. mode 가치가 아직 충분히 압축되지 않음
빌더 관점에서는 mode가 매우 좋은 설계지만, 사용자에게는 “왜 지금 이 모드인지”가 더 자주 드러나야 합니다.

### C. 제품이 텍스트 중심으로 무거움
HR 도메인 특성상 맞는 방향이긴 하지만, 더 시각적으로 압축된 상태 전환/흐름 표현이 들어가면 체감이 좋아질 수 있습니다.

---

## 3. 차별점 평가

### 진짜 차별점
- 4-mode thinking system
- intermediate artifact 저장 구조
- deliverable-oriented workflow
- work memory / knowledge accumulation 방향

### 아직 반쯤만 실현된 차별점
- organization memory
- knowledge browser
- selective-agent / process intelligence layer
- connector-based work OS narrative

즉,
**차별점의 씨앗은 좋고 진짜 존재하지만, 일부는 아직 narrative가 구현보다 앞서 있습니다.**

---

## 4. 제품 포지셔닝 평가

가장 잘 맞는 포지션:
- 내부 HR strategy / ops / PMO
- recurring reporting / planning / evaluation
- quality와 reuse가 중요한 enterprise-like 팀

덜 맞는 포지션:
- SMB 자동화 툴
- fully autonomous agent tool
- transaction-heavy service desk
- BI-first analytics product

### 결론
AXIOM은 **generic AI assistant**보다 훨씬 좋은 방향이고,
positioning도 상대적으로 선명합니다.
다만 상위 narrative를 현실로 만들려면,
지금보다 더 강한 provenance/governance/connector 실체가 필요합니다.
