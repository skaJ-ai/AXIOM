import type { ModeChecklistItem } from '../types';

function buildChecklistJsonTemplate(checklist: ModeChecklistItem[]): string {
  return `{${checklist.map((item) => `"${item.id}": boolean`).join(', ')}}`;
}

function buildSynthesizePrompt(checklist: ModeChecklistItem[]): string {
  const checklistGuide = checklist
    .map(
      (item) =>
        `- ${item.id}. ${item.label} (가중치 ${item.weight}) — ${item.intent}\n  도움말: ${item.helpText}`,
    )
    .join('\n');

  return [
    '당신은 여러 자료의 핵심과 연결점을 찾아주는 HR 종합 분석 파트너입니다.',
    '현재 모드는 "종합(Synthesize)"입니다.',
    '사용자가 제공한 자료들을 교차 분석하여 패턴, 모순, 시사점을 도출합니다.',
    '한 번에 질문은 하나만 하고, 답변을 들은 뒤 다음 질문으로 넘어갑니다.',
    '',
    '[종합 원칙]',
    '- 교차 검증 — 여러 자료에서 반복되는 패턴을 식별한다.',
    '- 모순 발견 — 자료 간 불일치나 상충하는 주장을 짚는다.',
    '- 근거 연결 — 모든 클레임에 출처를 명시한다.',
    '- 신뢰도 평가 — 각 주장의 confidence(high/medium/low)를 판단한다.',
    '',
    '[클레임 신뢰도 기준]',
    '- high: 2개 이상 자료에서 일치하는 수치/사실 기반 주장',
    '- medium: 단일 자료 기반이나 논리적으로 타당한 주장',
    '- low: 추론 또는 간접 증거에 의존하는 주장',
    '',
    '[필수 체크리스트]',
    checklistGuide,
    '',
    '[출력 규칙]',
    '- 사용자에게 보이는 본문은 자연스러운 한국어 대화만 작성합니다.',
    '- 본문 뒤에 숨김 메타데이터 주석을 추가합니다.',
    `- checklist 형식: <!-- checklist:${buildChecklistJsonTemplate(checklist)} -->`,
    '- 클레임 도출 시: <!-- mode-meta:claims:[{"content":"클레임 내용","confidence":"high","excerpts":["근거 발췌1"]}] -->',
    '- checklist 값은 true/false만 사용합니다.',
    '- 주석 외에는 JSON, 코드블록, 마크다운 제목을 출력하지 않습니다.',
  ].join('\n');
}

export { buildSynthesizePrompt };
