import Link from 'next/link';

import { ModeSelectorForm } from '@/components/workspace/mode-selector-form';
import type { ParentSessionOption } from '@/components/workspace/mode-selector-form';
import { WorkspacePageHeader } from '@/components/workspace/page-header';
import { listProcessAssetsByWorkspace } from '@/domains/process-assets/queries';
import { listWorkCardsByWorkspace } from '@/domains/work-cards/queries';
import { requireAuthenticatedPageUser } from '@/lib/auth/middleware';
import { getModeCatalog } from '@/lib/modes';
import { listSessionsByWorkspace } from '@/lib/sessions/service';

const PARENT_SESSION_LIMIT = 12;

export default async function WorkspaceNewPage({
  searchParams,
}: {
  searchParams: Promise<{ workCardId?: string }>;
}) {
  const currentUser = await requireAuthenticatedPageUser();
  const resolvedSearchParams = await searchParams;
  const modes = getModeCatalog();
  const [processAssets, recentSessions, workCards] = await Promise.all([
    listProcessAssetsByWorkspace(currentUser.workspaceId),
    listSessionsByWorkspace(currentUser.workspaceId),
    listWorkCardsByWorkspace(currentUser.workspaceId),
  ]);

  const parentSessionOptions: ParentSessionOption[] = recentSessions
    .slice(0, PARENT_SESSION_LIMIT)
    .map((session) => ({
      id: session.id,
      mode: session.mode,
      modeName: session.modeSummary.name,
      title: session.title,
      updatedAt: session.updatedAt,
    }));

  const initialWorkCardId =
    typeof resolvedSearchParams.workCardId === 'string' &&
    workCards.some((card) => card.id === resolvedSearchParams.workCardId)
      ? resolvedSearchParams.workCardId
      : null;

  return (
    <main className="px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <WorkspacePageHeader
          actions={
            <div className="flex flex-wrap gap-3">
              <Link className="btn-secondary focus-ring" href="/workspace">
                대시보드로
              </Link>
              <Link className="btn-secondary focus-ring" href="/workspace/cards">
                업무 카드 보기
              </Link>
            </div>
          }
          description="4가지 사고 모드 중 하나에서 시작하고, 필요하면 기존 업무 카드와 이전 세션의 맥락을 이어받아 다음 단계로 넘어갑니다."
          eyebrow="새 세션"
          meta={
            <>
              <span className="badge badge-accent">4가지 사고 모드</span>
              <span className="badge badge-neutral">업무 카드 연결 가능</span>
              <span className="badge badge-neutral">기존 카드 {workCards.length}개</span>
            </>
          }
          title="새 작업 시작"
        />

        <ModeSelectorForm
          initialWorkCardId={initialWorkCardId}
          modes={modes}
          parentSessionOptions={parentSessionOptions}
          processAssetOptions={processAssets}
          workCardOptions={workCards}
        />
      </div>
    </main>
  );
}
