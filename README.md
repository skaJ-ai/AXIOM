# HR AX 플랫폼

> HR 담당자의 업무 카드, 프로세스 자산, 근거 자료를 함께 운영하는 work OS

이 레포는 `HR AX 플랫폼`의 앱 구현입니다. 사용자에게 보이는 공통 추론 레이어는 `HR AX Copilot`로 정의하고, 일부 도메인만 선택적으로 Agent를 붙이되 대부분의 실제 업무는 사람과 LLM이 같은 맥락 위에서 이어서 처리할 수 있게 설계합니다.

## Product Framing

- **플랫폼 이름**: `HR AX 플랫폼`
- **공통 Copilot 이름**: `HR AX Copilot`
- **핵심 관점**: agent-first보다 `copilot-first, selective-agent`
- **업무 모델**: 업무 카드는 프로세스 자산 위에서 실행되는 실제 작업 인스턴스

## Core Layers

- **Workspace Layer**: 개인별 작업공간, 업무 카드, 근거 자료, 산출물 관리
- **Copilot Layer**: 발산·검증·종합·작성 4모드로 의도를 좁히고 초안을 함께 만든다
- **Process Intelligence**: `HR-Process-Coaching-AI` 기반 프로세스 자산과 Working Group 지식
- **Connector Layer**: Knox, 메일, 일정, 사내 시스템 연동
- **Agent Layer**: ROI가 높은 일부 단계만 선택적으로 자동화

## Ideation Wiki

- **라우트**: `/ideation-points`
- **역할**: 제품 기능 설명보다 먼저 설계 철학과 경계 조건을 남기는 위키
- **주요 주제**: 의도 중심 인터뷰, private-first/shared workspace, Markdown canonical layer, 저장 구조, zero-action accumulation, 업무 재설계, connector/action layer 초안, governance 초안, provenance/evidence link

## Quick Start

```bash
npm install
npm run quality:check
npm run build
docker compose up --build -d
```

- 앱: `http://127.0.0.1:26000`
- 헬스체크: `http://127.0.0.1:26000/api/health`

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict)
- **UI**: Tailwind CSS + custom design system
- **DB**: PostgreSQL + Drizzle ORM
- **Auth**: bcryptjs + JWT(httpOnly cookie)
- **AI**: Vercel AI SDK + OpenAI-compatible endpoint
- **Deployment**: Docker Compose (`26000 -> 3000`)

## Current Scope

- 회원가입/로그인 + 개인 워크스페이스 자동 생성
- 4모드 세션 생성 + Copilot 인터뷰 + 체크리스트/캔버스
- source 첨부, draft 생성, final/promoted_asset 전이
- 세션 검색, 이전 산출물 참조, 지식 브라우저, 아이데이션 포인트 위키

## License

MIT
