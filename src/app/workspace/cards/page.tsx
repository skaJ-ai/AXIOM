import Link from 'next/link';

import { WorkspacePageHeader } from '@/components/workspace/page-header';
import {
  type LinkedIntentPreview,
  type LinkedSessionPreview,
  WorkCardBoard,
  type WorkCardBoardItem,
} from '@/components/workspace/work-card-board';
import { listApprovedIntentFragmentsByWorkspaceGroupedByWorkCard } from '@/domains/intents/queries';
import { listWorkCardsByWorkspace } from '@/domains/work-cards/queries';
import { requireAuthenticatedPageUser } from '@/lib/auth/middleware';
import { listSessionsByWorkspace } from '@/lib/sessions/service';

export default async function WorkspaceCardsPage() {
  const currentUser = await requireAuthenticatedPageUser();
  const [workCards, sessions, approvedIntents] = await Promise.all([
    listWorkCardsByWorkspace(currentUser.workspaceId, { includeArchived: true }),
    listSessionsByWorkspace(currentUser.workspaceId),
    listApprovedIntentFragmentsByWorkspaceGroupedByWorkCard(currentUser.workspaceId),
  ]);

  const sessionsByWorkCard = new Map<string, LinkedSessionPreview[]>();
  const intentsByWorkCard = new Map<
    string,
    {
      recentIntents: LinkedIntentPreview[];
      totalCount: number;
    }
  >();

  for (const session of sessions) {
    const workCardId = session.workCard?.id;

    if (!workCardId) {
      continue;
    }

    const currentSessions = sessionsByWorkCard.get(workCardId) ?? [];
    currentSessions.push({
      id: session.id,
      modeName: session.modeSummary.name,
      title: session.title,
      updatedAt: session.updatedAt,
    });
    sessionsByWorkCard.set(workCardId, currentSessions);
  }

  for (const intent of approvedIntents) {
    const currentIntents = intentsByWorkCard.get(intent.workCardId) ?? {
      recentIntents: [],
      totalCount: 0,
    };

    currentIntents.totalCount += 1;

    if (currentIntents.recentIntents.length < 3) {
      currentIntents.recentIntents.push({
        content: intent.content,
        createdAt: intent.createdAt,
        id: intent.id,
        reviewStatus: intent.reviewStatus,
        sessionId: intent.sessionId,
        sessionTitle: intent.sessionTitle,
        type: intent.type,
      });
    }

    intentsByWorkCard.set(intent.workCardId, currentIntents);
  }

  const initialCards: WorkCardBoardItem[] = workCards.map((card) => ({
    ...card,
    intentCount: intentsByWorkCard.get(card.id)?.totalCount ?? 0,
    recentIntents: intentsByWorkCard.get(card.id)?.recentIntents ?? [],
    recentSessions: (sessionsByWorkCard.get(card.id) ?? []).slice(0, 3),
  }));

  return (
    <main className="px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <WorkspacePageHeader
          actions={
            <div className="flex flex-wrap gap-3">
              <Link className="btn-secondary focus-ring" href="/workspace">
                대시보드로
              </Link>
              <Link className="btn-teal focus-ring" href="/workspace/new">
                새 세션 시작
              </Link>
            </div>
          }
          description="업무 카드는 세션, 승인된 맥락, 반복되는 판단 기준을 함께 묶는 운영 단위입니다. 여기서 카드를 만들고 어떤 세션과 연결되는지 관리합니다."
          eyebrow="업무 카드"
          meta={
            <>
              <span className="badge badge-accent">전체 {initialCards.length}개</span>
              <span className="badge badge-neutral">
                보관 {initialCards.filter((card) => card.status === 'archived').length}개
              </span>
            </>
          }
          title="업무 카드 관리"
        />

        <WorkCardBoard initialCards={initialCards} />
      </div>
    </main>
  );
}
