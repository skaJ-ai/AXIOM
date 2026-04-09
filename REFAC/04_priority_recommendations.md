# AXIOM 우선순위 개선 제언

## 최우선 (P0)

### 1. Reports vs Deliverables domain 정리
가장 먼저 canonical write domain을 하나로 정리해야 합니다.
권고:
- deliverables를 canonical asset으로 삼기
- finalize/promote 시 knowledge extraction을 거기서 직접 트리거

### 2. Structured output contract 도입
hidden HTML comment + JSON 파싱을 걷어내고,
- Structured Outputs
- typed state tools
로 전환해야 합니다.

### 3. Knowledge loop 실체화
사용자가 final/promoted로 만든 결과가 실제 knowledge browser에 반영되도록 연결해야 합니다.

---

## 중요 (P1)

### 4. Provenance / Evidence UX 추가
- section evidence drawer
- source excerpt preview
- inherited artifact chain
- weak evidence flag

### 5. Shared workspace / governance 최소 단위 도입
- workspace membership
- reviewer assignment
- approval history
- promotion eligibility rules

### 6. Mode-to-mode handoff UX 강화
현재는 모드가 존재하지만,
사용자에게 “다음 모드로 이어지는 가치”가 더 잘 드러나야 합니다.

권고:
- next recommended mode CTA
- handoff preview
- mode progression breadcrumb

---

## 중기 (P2)

### 7. Work card / process asset 1급 객체화
문서 narrative에 맞추려면,
- work_cards
- process_assets
가 schema/UI에 실제로 등장해야 합니다.

### 8. Connector layer thin slice 출시
한 번에 크게 말고,
- read-only calendar
- email draft
같은 얇은 vertical slice 하나로 시작하는 편이 좋습니다.

### 9. Knowledge browser killer surface화
현재는 index 성격이 강하므로,
- actionability
- relevance
- section reuse
- trust tier
를 더 강하게 보여줘야 합니다.

---

## 실행 순서 제안

### 1단계
- write domain consolidation
- structured outputs
- knowledge extraction rewiring

### 2단계
- evidence/provenance UX
- governance/review primitives
- mode handoff UX 강화

### 3단계
- work card/process asset
- connector vertical slice
- knowledge browser productization

---

## 최종 결론
AXIOM의 핵심 문제는 “아이디어가 약함”이 아닙니다.
오히려 아이디어와 철학은 강합니다.

진짜 문제는:
> **좋은 제품 철학을 실제 운영 가능한 안정적 구조와 사용자 신뢰 경험으로 완전히 변환하는 마지막 구간이 남아 있다**

따라서 지금의 최우선 과제는 기능 확장보다,
**정합성, provenance, output contract, knowledge loop 연결**입니다.
