import Link from 'next/link';

import { requireAuthenticatedPageUser } from '@/lib/auth/middleware';
import { listDeliverablesByWorkspace } from '@/lib/deliverables/service';
import { getTemplateByType } from '@/lib/templates';

async function ReportListPage() {
  const currentUser = await requireAuthenticatedPageUser();
  const deliverables = await listDeliverablesByWorkspace(currentUser.workspaceId);

  return (
    <main className="px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2">
            <p className="meta">리포트 라이브러리</p>
            <h1 className="text-3xl font-bold text-[var(--color-text)]">전체 리포트</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              워크스페이스에 축적된 리포트와 산출물을 한곳에서 확인합니다.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="badge badge-teal">{deliverables.length}개</span>
            <Link className="btn-secondary focus-ring" href="/workspace">
              워크벤치로 돌아가기
            </Link>
          </div>
        </div>

        {deliverables.length === 0 ? (
          <div className="workspace-card-muted p-6 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              아직 생성된 리포트가 없습니다. 작성 모드에서 초안을 만든 뒤 여기서 다시 열 수 있습니다.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {deliverables.map((deliverable) => (
              <Link
                className="workspace-card group flex flex-col gap-3 transition hover:-translate-y-1 hover:border-[var(--color-teal)] hover:shadow-lg"
                href={`/workspace/asset/${deliverable.id}`}
                key={deliverable.id}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="meta">{getTemplateByType(deliverable.templateType).name}</span>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-neutral">{deliverable.status}</span>
                    <span className="badge badge-teal font-bold">v{deliverable.version}</span>
                  </div>
                </div>
                <h3 className="font-headline text-lg font-bold text-[var(--color-text)] group-hover:text-[var(--color-teal)]">
                  {deliverable.title}
                </h3>
                <p className="line-clamp-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                  {deliverable.preview}
                </p>
                <div className="mt-auto text-right">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">
                    {deliverable.updatedAt.slice(0, 16).replace('T', ' ')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export { ReportListPage };
