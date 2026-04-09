# AXIOM 설계도 vs 구현 간극

이 문서는 README, wiki, ideation/설계 문서와 실제 코드/라우트/컴포넌트를 비교해 정리한 간극 분석입니다.

---

## P0 — 가장 큰 간극

### 1. Knowledge accumulation promise vs 실제 write path 연결 부족
문서상으로는 finalize된 결과가 knowledge로 자동 축적되는 흐름을 약속하지만,
실제 write UX는 deliverable 중심이고 knowledge extraction 파이프라인은 별도 report 흐름에 더 가깝게 묶여 있습니다.

#### 의미
- 사용자는 분명 deliverable을 final/promoted로 만들었는데,
- knowledge browser에는 그 결과가 제대로 반영되지 않을 수 있습니다.

#### 판단
이건 단순 개선이 아니라 **core loop 단절**입니다.

---

### 2. Connector/action layer는 narrative에 비해 실제 구현이 약함
README나 wiki는
- Knox
- mail
- calendar
- internal systems
- connector/action layer
를 중요한 축으로 다루지만,
실제 app은 거의 local AI workspace/document system에 가깝습니다.

#### 판단
현재는 connector platform이라기보다 **structured AI workbench** 입니다.
따라서 public/internal narrative에서 구분이 필요합니다.

---

### 3. Shared workspace / governance는 대부분 개념 단계
문서에서는
- private → shared progression
- governance
- review/approval
- trust tier
를 중요하게 말하지만,
실제 구현은 거의 personal workspace에 가깝습니다.

#### 현재 한계
- membership model 없음
- reviewer/approver 없음
- comment/review request 없음
- approval history 없음

#### 판단
이 영역은 “planned”이지 “implemented”가 아닙니다.

---

## P1 — 중간 규모 간극

### 4. 업무 카드 / 프로세스 자산 framing vs 실제 데이터모델 부재
문서에서 AXIOM은 work card + process asset 위에서 돌아가는 work OS처럼 설명되지만,
실제 데이터모델에는 그 개념이 1급 객체로 거의 나타나지 않습니다.

현재 중심 엔티티는:
- sessions
- sources
- deliverables/reports
- memory/knowledge items
입니다.

즉 현재 제품은 **session-and-deliverable workbench**에 더 가깝습니다.

---

### 5. Provenance/evidence는 철학은 강하지만 UX는 약함
실제 구현에는 confidence/cited, claim-source link, retrieval 구조가 있지만,
사용자가 section별로 근거를 auditing할 수 있는 수준의 traceability UX는 아직 약합니다.

필요한 것:
- section-to-source evidence relation
- evidence drawer
- source excerpt preview
- inherited-from chain

---

### 6. Canonical document layer가 완전히 하나로 정리되지 않음
markdown/document canonical layer 철학은 있지만,
실제론 reports와 deliverables가 중첩되어 있고 doc-pipeline도 부분적으로 분리된 느낌이 있습니다.

#### 의미
- 개념 드래그 증가
- 유지보수 부담 증가
- 제품 메시지 혼선

---

## P2 — 낮지만 쌓이면 거슬리는 간극

### 7. 비-write 모드가 write만큼 성숙하지 않음
발산/검증/종합 모드는 존재하고 동작하지만,
write mode에 비해 preview, readiness, editing, generation loop 등이 훨씬 약합니다.

### 8. Naming / branding layer가 아직 덜 잠김
AXIOM / HR AX / Copilot / 과거 HARP 잔재가 보일 수 있는 상태는 브랜드 신뢰도를 약간 깎습니다.

### 9. product copy가 구현보다 앞서는 부분 존재
설정/위키/README 일부는 이미 platform maturity가 높은 것처럼 읽히지만,
실제는 부분 구현 상태입니다.

---

## 간극의 본질
한 줄로 요약하면,
AXIOM은 현재 **4-mode AI workbench + strong write flow**까지는 실체가 있고,
그 위에 얹힌
- knowledge system
- connector/action platform
- governance/shared workspace
- process asset OS
는 아직 부분 구현 또는 개념 단계입니다.
