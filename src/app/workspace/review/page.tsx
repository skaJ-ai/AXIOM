import Link from 'next/link';

import { IntentReviewBoard } from '@/components/workspace/intent-review-board';
import { WorkspacePageHeader } from '@/components/workspace/page-header';
import { listIntentReviewQueueByWorkspace } from '@/domains/intents/queries';
import { requireAuthenticatedPageUser } from '@/lib/auth/middleware';

export default async function WorkspaceReviewPage() {
  const currentUser = await requireAuthenticatedPageUser();
  const items = await listIntentReviewQueueByWorkspace(currentUser.workspaceId);
  const nominatedCount = items.filter((item) => item.reviewStatus === 'nominated').length;
  const pendingCount = items.filter(
    (item) => item.reviewStatus === 'captured' || item.reviewStatus === 'nominated',
  ).length;

  return (
    <main className="px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <WorkspacePageHeader
          actions={
            <div className="flex flex-wrap gap-3">
              <Link className="btn-secondary focus-ring" href="/workspace">
                대시보드로
              </Link>
              <Link className="btn-secondary focus-ring" href="/workspace/conflicts">
                충돌 검토
              </Link>
              <Link className="btn-secondary focus-ring" href="/workspace/knowledge">
                지식 브라우저
              </Link>
            </div>
          }
          description="세션에서 포착된 작업 맥락을 바로 자산으로 올리지 않고, 검토 후보와 승인 단계를 거쳐 관리합니다."
          eyebrow="Review Queue"
          meta={
            <>
              <span className="badge badge-accent">pending {pendingCount}</span>
              <span className="badge badge-neutral">nominated {nominatedCount}</span>
              <span className="badge badge-neutral">total {items.length}</span>
            </>
          }
          title="의도 검토 큐"
        />

        <IntentReviewBoard initialItems={items} />
      </div>
    </main>
  );
}
