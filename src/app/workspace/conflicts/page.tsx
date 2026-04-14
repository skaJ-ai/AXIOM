import Link from 'next/link';

import { WorkspacePageHeader } from '@/components/workspace/page-header';
import { PromotedAssetConflictBoard } from '@/components/workspace/promoted-asset-conflict-board';
import { syncPromotedAssetConflictsForWorkspace } from '@/domains/promoted-assets/conflict-actions';
import { listPromotedAssetConflictsByWorkspace } from '@/domains/promoted-assets/conflict-queries';
import { requireAuthenticatedPageUser } from '@/lib/auth/middleware';

export default async function WorkspaceConflictsPage() {
  const currentUser = await requireAuthenticatedPageUser();

  await syncPromotedAssetConflictsForWorkspace(currentUser.workspaceId);
  const items = await listPromotedAssetConflictsByWorkspace(currentUser.workspaceId, {
    currentUserId: currentUser.userId,
  });
  const detectedCount = items.filter((item) => item.status === 'detected').length;
  const resolvedCount = items.filter((item) => item.status === 'resolved').length;

  return (
    <main className="px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <WorkspacePageHeader
          actions={
            <div className="flex flex-wrap gap-3">
              <Link className="btn-secondary focus-ring" href="/workspace/review">
                리뷰 큐
              </Link>
              <Link className="btn-secondary focus-ring" href="/workspace/cards">
                업무 카드
              </Link>
            </div>
          }
          description="같은 프로세스 자산에 연결된 재사용 자산이 서로 중복되거나 최신 결론으로 대체될 수 있는지 비교하고, 사람이 최종 정리를 내립니다."
          eyebrow="Conflict Review"
          meta={
            <>
              <span className="badge badge-accent">detected {detectedCount}</span>
              <span className="badge badge-neutral">resolved {resolvedCount}</span>
              <span className="badge badge-neutral">total {items.length}</span>
            </>
          }
          title="재사용 자산 충돌 검토"
        />

        <PromotedAssetConflictBoard initialItems={items} />
      </div>
    </main>
  );
}
