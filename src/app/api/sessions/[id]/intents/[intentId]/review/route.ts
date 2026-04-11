import { NextResponse } from 'next/server';

import { and, eq } from 'drizzle-orm';

import { reviewIntentFragment } from '@/domains/intents/actions';
import { reviewIntentRequestSchema } from '@/domains/intents/validators';
import { requireAuthenticatedApiUser } from '@/lib/auth/middleware';
import { getDb } from '@/lib/db';
import { intentFragmentsTable } from '@/lib/db/schema';

async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; intentId: string }> },
) {
  try {
    const currentUser = await requireAuthenticatedApiUser();
    const { id, intentId } = await params;
    const requestBody = await request.json();
    const parsedRequest = reviewIntentRequestSchema.safeParse(requestBody);

    if (!parsedRequest.success) {
      return NextResponse.json(
        {
          message: parsedRequest.error.issues[0]?.message ?? '검토 요청이 올바르지 않습니다.',
          status: 400,
        },
        {
          status: 400,
        },
      );
    }

    const database = getDb();
    const intentRows = await database
      .select({ id: intentFragmentsTable.id })
      .from(intentFragmentsTable)
      .where(
        and(
          eq(intentFragmentsTable.id, intentId),
          eq(intentFragmentsTable.sessionId, id),
          eq(intentFragmentsTable.workspaceId, currentUser.workspaceId),
        ),
      )
      .limit(1);

    if (!intentRows[0]) {
      return NextResponse.json(
        {
          message: '의도 조각을 찾을 수 없습니다.',
          status: 404,
        },
        {
          status: 404,
        },
      );
    }

    const isReviewed = await reviewIntentFragment({
      decision: parsedRequest.data.decision,
      intentId,
      reviewerId: currentUser.userId,
      workspaceId: currentUser.workspaceId,
    });

    return NextResponse.json({
      data: {
        updated: isReviewed,
      },
      message: isReviewed ? '검토 상태를 업데이트했습니다.' : '검토 상태를 바꾸지 못했습니다.',
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown intent review error';
    const status = message === 'Authentication required.' ? 401 : 500;

    return NextResponse.json(
      {
        message,
        status,
      },
      {
        status,
      },
    );
  }
}

export { PATCH };
