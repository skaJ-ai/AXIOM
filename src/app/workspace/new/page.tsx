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
          description="4가지 사고 모드 중 하나에서 시작하고, 필요하면 이전 세션의 맥락을 이어받아 다음 단계로 넘어갑니다."
          eyebrow="새 세션"
          meta={
            <>
              <span className="badge badge-accent">4가지 사고 모드</span>
              <span className="badge badge-neutral">랩 내부 전용</span>
            </>
          }
          title="새 작업 시작"
        />

        <ModeSelectorForm modes={modes} parentSessionOptions={parentSessionOptions} />
      </div>
    </main>
  );
}
