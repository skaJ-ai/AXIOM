# AXIOM — 생각을 자산으로 축적하는 4모드 AI 워크벤치

> 발산·검증·종합·작성의 흐름을 남기고 다음 작업의 출발점으로 돌려주는 랩 내부 베타 작업공간

AXIOM은 AX & CI Lab 안에서 나오는 아이디어, 반론, 종합된 주장, 작성 초안을 하나의 워크스페이스에 연결해 남기는 제품입니다.
이 레포는 단순한 HR 보고서 생성기가 아니라, 실험적 사고를 다음 작업의 맥락으로 되돌려주는 구조를 구현합니다.

## Product Positioning

- **1줄 태그라인**: 생각을 자산으로 축적하는 4모드 AI 워크벤치
- **3줄 엘리베이터 피치**
  - AXIOM은 발산·검증·종합·작성 4개 모드로 아이디어와 자료를 단계별로 다룹니다.
  - 대화, 근거, 중간 주장, 최종 산출물을 한 워크스페이스에서 연결해 조직 기억으로 축적합니다.
  - 그래서 다음 보고서와 다음 실험은 빈 화면이 아니라 이전 사고의 맥락에서 시작합니다.
- **랩 멤버용 가치 제안**: 매번 처음부터 설명하지 않아도 됩니다. 이전 세션의 아이디어, 검증 흔적, 종합된 주장, 작성 초안이 다음 작업의 출발점으로 이어집니다.

## 4모드 스토리

- **발산**: 주제, 제약, 방향을 열어 두고 가능한 재료를 넓게 모읍니다.
- **검증**: 페르소나와 리스크 관점으로 허점, 가정, 실행 난점을 드러냅니다.
- **종합**: 자료 간 반복 패턴과 모순을 묶어 핵심 주장과 시사점을 만듭니다.
- **작성**: 정리된 재료를 보고서와 운영 문서로 옮겨 실제 실행 가능한 출력으로 마감합니다.

## Product Summary

- **핵심 사용자**: AX & CI Lab 내부 베타 참여자
- **핵심 가치**: 사고 과정의 구조화, 중간 산출물의 축적, 다음 작업으로의 맥락 승계
- **핵심 산출물**: 세션, 근거자료, 아이디어/리뷰/주장, 보고서 초안, 확정 산출물, 지식 구조
- **LLM 전략**: Vercel AI SDK 기반, 모델 교체 내성은 4모드 사고 체계와 메타데이터 구조로 확보

## Ideation Points

- **라우트**: `/ideation-points`
- **목적**: 미래의 엔지니어가 다른 플랫폼에 AXIOM의 개념을 옮길 수 있도록 설계 철학과 경계 조건을 위키 형태로 설명
- **초기 항목**: 디자인 시스템, 저장 구조, Data Lake 방식, 4모드 사고 체계, 지식 자동 축적 파이프라인, AI 메타데이터 마커 시스템, 부모 세션 컨텍스트 체이닝, 세션-산출물-메모리 루프

## Harness Engineering

이 프로젝트는 제품 브랜딩과 별개로 **하네스 엔지니어링** 방식을 적용합니다.

```
앞단(Front Guard)          뒷단(Back Guard)
CLAUDE.md                  /harness-eval
ESLint + Prettier    →     4-Criteria Scoring   = 품질 하한선
Git Pre-commit Hook        (커밋 직전 수행)
```

- **Front Guard**: `npm run harness:check` — ESLint(typed) + Prettier + TypeScript 검사
- **Back Guard**: `/harness-eval` — AI 산출물을 Relevance/Faithfulness/Correctness/Quality 기준으로 평가

## Quick Start

```bash
npm install
npm run harness:check
npm run build
docker compose up --build -d
```

- 앱: `http://127.0.0.1:26000`
- 헬스체크: `http://127.0.0.1:26000/api/health`

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict)
- **UI**: Tailwind CSS + AXIOM design system
- **DB**: PostgreSQL + Drizzle ORM
- **Auth**: bcryptjs + JWT(httpOnly cookie)
- **AI**: Vercel AI SDK + OpenAI-compatible endpoint
- **Deployment**: Docker Compose (`26000 -> 3000`)

## Key Files

| File | Role |
|------|------|
| `CLAUDE.md` | Primary harness 규칙 |
| `src/app/page.tsx` | 내부 베타용 랜딩 페이지 |
| `src/app/ideation-points/` | 설계 철학을 설명하는 위키 라우트 |
| `src/lib/brand.ts` | 공용 브랜딩/메시징 상수 |
| `src/lib/modes/index.ts` | 4모드 사고 체계 정의 |
| `src/lib/knowledge/pipeline.ts` | 확정 산출물 기반 지식 축적 파이프라인 |

## Current Scope

- 회원가입/로그인 + 개인 워크스페이스 자동 생성
- 4모드 세션 생성 + AI 인터뷰 + 체크리스트/캔버스
- source 첨부, draft 생성, final/promoted_asset 전이
- 세션 검색, 이전 산출물 참조, 지식 브라우저, 아이데이션 포인트 위키

## Notes

- `.harness/`와 `harness:check`는 제품명이 아니라 개발 하네스 이름이라 유지합니다.
- 사내 LLM endpoint 접근성은 실행 환경의 네트워크 상태에 따라 달라집니다.

## License

MIT
