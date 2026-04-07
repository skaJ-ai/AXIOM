import Link from 'next/link';
import { notFound } from 'next/navigation';

import { SessionCanvasShell } from '@/components/workspace/canvas/session-canvas-shell';
import { WorkspacePageHeader } from '@/components/workspace/page-header';
import { requireAuthenticatedPageUser } from '@/lib/auth/middleware';
import { getSessionDetailForWorkspace } from '@/lib/sessions/service';

export default async function WorkspaceSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const currentUser = await requireAuthenticatedPageUser();
  const { id } = await params;
  const session = await getSessionDetailForWorkspace(id, currentUser.workspaceId);

  if (!session) {
    notFound();
  }

  return (
    <main className="px-6 py-6">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
        <WorkspacePageHeader
          actions={
            <>
              <Link className="btn-secondary focus-ring" href="/workspace">
                대시보드
              </Link>
              <Link className="btn-teal focus-ring" href="/workspace/new">
                새 작업
              </Link>
            </>
          }
          description={`${session.modeSummary.name}로 진행 중인 세션입니다. 중앙 작업영역에서 초안을 정리하고, 오른쪽 패널에서 질문과 근거를 이어갑니다.`}
          eyebrow="Session Canvas"
          meta={
            <>
              <span className={`badge badge-mode-${session.mode}`}>
                {session.modeSummary.badge.label}
              </span>
              <span className="badge badge-neutral">{session.status}</span>
              <span className="badge badge-teal">메시지 {session.messageCount}개</span>
              <span className="badge badge-neutral">자료 {session.sourceCount}개</span>
            </>
          }
          title={session.title}
          variant="compact"
        />

        <SessionCanvasShell initialSession={session} />
      </div>
    </main>
  );
}
