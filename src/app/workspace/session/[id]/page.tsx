import Link from 'next/link';
import { notFound } from 'next/navigation';

import { SessionCanvasShell } from '@/components/workspace/canvas/session-canvas-shell';
import { WorkspacePageHeader } from '@/components/workspace/page-header';
import { SessionContextPanel } from '@/components/workspace/session-context-panel';
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
          description={`${session.modeSummary.name} 모드로 진행 중인 세션입니다. 중앙 작업 영역에서 초안을 정리하고, 위에 고정된 카드와 맥락 조각으로 현재 업무의 기준을 계속 확인할 수 있습니다.`}
          eyebrow="Session Canvas"
          meta={
            <>
              <span className={`badge badge-mode-${session.mode}`}>
                {session.modeSummary.badge.label}
              </span>
              <span className="badge badge-neutral">{session.status}</span>
              {session.workCard ? (
                <span className="badge badge-accent">{session.workCard.title}</span>
              ) : null}
              <span className="badge badge-teal">메시지 {session.messageCount}개</span>
              <span className="badge badge-neutral">자료 {session.sourceCount}개</span>
            </>
          }
          title={session.title}
          variant="compact"
        />

        <SessionContextPanel
          initialIntents={session.intents}
          initialPromotedAssets={session.promotedAssets}
          sessionId={session.id}
          workCard={session.workCard}
        />
        <SessionCanvasShell initialSession={session} />
      </div>
    </main>
  );
}
