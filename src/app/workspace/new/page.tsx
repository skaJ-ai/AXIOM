import Link from 'next/link';

import { ModeSelectorForm } from '@/components/workspace/mode-selector-form';
import type { ParentSessionOption } from '@/components/workspace/mode-selector-form';
import { WorkspacePageHeader } from '@/components/workspace/page-header';
import { requireAuthenticatedPageUser } from '@/lib/auth/middleware';
import { getModeCatalog } from '@/lib/modes';
import { listSessionsByWorkspace } from '@/lib/sessions/service';

const PARENT_SESSION_LIMIT = 12;

export default async function WorkspaceNewPage() {
  const currentUser = await requireAuthenticatedPageUser();
  const modes = getModeCatalog();
  const recentSessions = await listSessionsByWorkspace(currentUser.workspaceId);
  const parentSessionOptions: ParentSessionOption[] = recentSessions
    .slice(0, PARENT_SESSION_LIMIT)
    .map((session) => ({
      id: session.id,
      mode: session.mode,
      modeName: session.modeSummary.name,
      title: session.title,
      updatedAt: session.updatedAt,
    }));

  return (
    <main className="px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <WorkspacePageHeader
          actions={
            <Link className="btn-secondary focus-ring" href="/workspace">
              대시보드로
            </Link>
          }
          description="발산·검증·종합·작성 4가지 사고 모드 중 하나를 선택해 시작합니다. 이전 세션에서 이어갈 수도 있습니다."
          eyebrow="New Session"
          meta={
            <>
              <span className="badge badge-accent">4가지 사고 모드</span>
              <span className="badge badge-neutral">private workspace only</span>
            </>
          }
          title="새 작업 시작"
        />

        <ModeSelectorForm modes={modes} parentSessionOptions={parentSessionOptions} />
      </div>
    </main>
  );
}
