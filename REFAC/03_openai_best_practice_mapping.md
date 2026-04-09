# OpenAI 베스트 프랙티스 → AXIOM 매핑

OpenAI 공식 문서 계열의 실전 권고를 AXIOM에 대응시킨 분석입니다.
핵심은 “프롬프트를 잘 쓰는 것”보다,
**구조화된 출력 / eval / provenance / context contract / human review**를 강화하는 것입니다.

---

## 1. AXIOM이 이미 잘하고 있는 것

### A. Copilot-first stance
AXIOM은 full autonomy보다
- 사람 중심
- selective automation
- shared context work
를 지향합니다.
이건 production AI product로 좋은 자세입니다.

### B. Mode decomposition
발산/검증/종합/작성으로 업무를 분해한 것은 OpenAI가 권장하는 workflow decomposition과 잘 맞습니다.
장점:
- narrower prompt
- clearer outputs
- easier evals
- easier handoff

### C. Parent artifact chaining
raw chat만 넘기는 게 아니라 prior artifact를 넘기는 구조는 매우 좋습니다.
이건 state management 측면에서 맞는 방향입니다.

---

## 2. 가장 큰 리스크

### Comment-based hidden metadata contract
현재 AXIOM은 자연어 응답 뒤에 HTML comment + JSON을 숨겨 넣고 파싱하는 구조를 꽤 사용합니다.
이건 clever하지만 brittle합니다.

위험:
- malformed JSON
- partial streaming corruption
- model drift에 취약
- 디버깅 어려움
- 사용자 노출 accident 가능

### 권고
다음으로 전환하는 게 맞습니다.
1. **Structured Outputs**
2. **Typed tool calling / state mutation contract**

즉, machine-consumed state는 prose에 숨기지 말고,
**정식 schema/tool contract**로 분리해야 합니다.

---

## 3. 꼭 필요한 eval 체계
AXIOM은 eval을 걸기 좋은 구조입니다.
왜냐하면 mode, artifact, checklist, deliverable이 분리돼 있기 때문입니다.

### 필요한 eval 세트
#### A. Interaction eval
- 올바른 다음 질문을 하는가
- 한 번에 질문 하나 규칙을 지키는가
- missing fields를 잘 찾는가

#### B. Artifact quality eval
- diverge: 아이디어 다양성/비중복
- synthesize: claim grounding
- validate: issue relevance/severity
- write: report completeness/actionability

#### C. Faithfulness / provenance eval
- 섹션의 factual claim이 실제 source/parent artifact와 연결되는가
- unsupported assertion을 줄였는가

#### D. Workflow eval
- parent artifact handoff가 실제로 품질을 높이는가
- retrieval이 baseline 대비 얼마나 기여하는가

---

## 4. Provenance를 제품 표면으로 올려야 함
현재 AXIOM은 evidence를 많이 prompt 내부에서 소비합니다.
이제는 이걸 사용자 표면으로 끌어올려야 합니다.

추천 UX:
- section별 evidence panel
- hover-to-see evidence
- low confidence / weak evidence flag
- claim → evidence mapping review mode

즉,
provenance는 백엔드만의 개념이 아니라 **제품 핵심 trust surface**가 되어야 합니다.

---

## 5. Context engineering 계약화 필요
현재도 context engineering은 강한 편이지만,
string assembly가 많아 더 formal contract가 필요합니다.

권장 tier 구조:
- Tier 0: run contract (mode, schema, authority)
- Tier 1: current task state
- Tier 2: workflow memory (parent artifacts, recent outputs)
- Tier 3: retrieved references

각 tier마다:
- inclusion rule
- token budget
- freshness rule
- provenance label
을 정의하는 편이 좋습니다.

---

## 6. 결론
AXIOM은 AI product로서 방향은 좋습니다.
하지만 production-grade 안정성을 얻으려면,
가장 먼저 다음이 필요합니다.

1. comment-based metadata 제거
2. structured outputs / tool calling 전환
3. eval 체계 구축
4. provenance UI 강화
5. context tier contract 정리
