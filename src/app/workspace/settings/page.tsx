import Link from 'next/link';

import { WorkspacePageHeader } from '@/components/workspace/page-header';
import { requireAuthenticatedPageUser } from '@/lib/auth/middleware';

const ROLE_LABEL: Record<string, string> = {
  admin: '관리자',
  member: '구성원',
  owner: '오너',
};

function getRoleLabel(role: string): string {
  return ROLE_LABEL[role] ?? role;
}

export default async function WorkspaceSettingsPage() {
  const currentUser = await requireAuthenticatedPageUser();

  return (
    <main className="px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <WorkspacePageHeader
          actions={
            <Link className="btn-secondary focus-ring" href="/workspace">
              대시보드로
            </Link>
          }
          description="계정과 워크스페이스 정보를 확인합니다. 사번과 Knox ID는 IT 시스템 동기화 항목으로 직접 수정할 수 없습니다."
          eyebrow="Settings"
          meta={
            <>
              <span className="badge badge-neutral">read-only</span>
              <span className="badge badge-accent">workspace · {currentUser.workspaceName}</span>
            </>
          }
          title="설정"
        />

        <section className="surface px-6 py-6 lg:px-8">
          <div className="flex flex-col gap-2">
            <span className="section-label">사용자 프로필</span>
            <h2 className="text-xl font-semibold text-[var(--color-text)]">계정 정보</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              사내 인증 시스템과 동기화된 정보입니다. 변경이 필요하면 IT 헬프데스크에 문의하세요.
            </p>
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="workspace-card-muted px-4 py-4">
              <dt className="section-label">이름</dt>
              <dd className="mt-2 text-base font-medium text-[var(--color-text)]">
                {currentUser.name}
              </dd>
            </div>
            <div className="workspace-card-muted px-4 py-4">
              <dt className="section-label">사번</dt>
              <dd className="mt-2 text-base font-medium text-[var(--color-text)]">
                {currentUser.employeeNumber}
              </dd>
            </div>
            <div className="workspace-card-muted px-4 py-4">
              <dt className="section-label">Knox ID</dt>
              <dd className="mt-2 text-base font-medium text-[var(--color-text)]">
                {currentUser.knoxId}
              </dd>
            </div>
            <div className="workspace-card-muted px-4 py-4">
              <dt className="section-label">로그인 ID</dt>
              <dd className="mt-2 text-base font-medium text-[var(--color-text)]">
                {currentUser.loginId}
              </dd>
            </div>
            <div className="workspace-card-muted px-4 py-4">
              <dt className="section-label">권한</dt>
              <dd className="mt-2 text-base font-medium text-[var(--color-text)]">
                {getRoleLabel(currentUser.role)}
              </dd>
            </div>
            <div className="workspace-card-muted px-4 py-4">
              <dt className="section-label">워크스페이스</dt>
              <dd className="mt-2 text-base font-medium text-[var(--color-text)]">
                {currentUser.workspaceName}
              </dd>
            </div>
          </dl>
        </section>

        <section className="surface px-6 py-6 lg:px-8">
          <div className="flex flex-col gap-2">
            <span className="section-label">기본 설정</span>
            <h2 className="text-xl font-semibold text-[var(--color-text)]">사고 모드 환경</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              AXIOM은 발산·검증·종합·작성 4가지 사고 모드를 통해 생각의 흐름을 축적합니다.
              워크스페이스는 사내망에서만 접근 가능하며, 모든 데이터는 조직 내부에 보관됩니다.
            </p>
          </div>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            <li className="workspace-card-muted px-4 py-4">
              <span className="section-label">데이터 보관</span>
              <p className="mt-2 text-sm text-[var(--color-text)]">
                사내 PostgreSQL · 워크스페이스 격리
              </p>
            </li>
            <li className="workspace-card-muted px-4 py-4">
              <span className="section-label">지식 자동 축적</span>
              <p className="mt-2 text-sm text-[var(--color-text)]">
                보고서 확정 시 엔티티·팩트·인사이트 자동 추출
              </p>
            </li>
            <li className="workspace-card-muted px-4 py-4">
              <span className="section-label">세션 연결</span>
              <p className="mt-2 text-sm text-[var(--color-text)]">
                발산 → 검증 → 종합 → 작성으로 컨텍스트 승계
              </p>
            </li>
            <li className="workspace-card-muted px-4 py-4">
              <span className="section-label">접근 범위</span>
              <p className="mt-2 text-sm text-[var(--color-text)]">사내망 전용 · 외부 노출 차단</p>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
