import { NextResponse } from 'next/server';

import { and, eq } from 'drizzle-orm';

import { nominateIntentFragment } from '@/domains/intents/actions';
import { requireAuthenticatedApiUser } from '@/lib/auth/middleware';
import { getDb } from '@/lib/db';
import { intentFragmentsTable } from '@/lib/db/schema';

async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; intentId: string }> },
) {
  try {
    const currentUser = await requireAuthenticatedApiUser();
    const { id, intentId } = await params;
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

    const isNominated = await nominateIntentFragment(intentId, currentUser.workspaceId);

    return NextResponse.json(
      {
        data: {
          nominated: isNominated,
        },
        message: isNominated
          ? '의도 조각을 검토 후보로 올렸습니다.'
          : '검토 후보로 올릴 의도 조각을 찾지 못했습니다.',
        status: 200,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown intent nomination error';
    const status =
      message === 'Authentication required.' ? 401 : message.startsWith('Intent ') ? 409 : 500;

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

export { POST };
