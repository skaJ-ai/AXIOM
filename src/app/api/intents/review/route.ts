import { NextResponse } from 'next/server';

import { reviewIntentFragmentsBatch, type IntentBatchAction } from '@/domains/intents/actions';
import { listIntentReviewQueueByWorkspace } from '@/domains/intents/queries';
import { batchReviewIntentRequestSchema } from '@/domains/intents/validators';
import { requireAuthenticatedApiUser } from '@/lib/auth/middleware';

async function GET(request: Request) {
  try {
    const currentUser = await requireAuthenticatedApiUser();
    const url = new URL(request.url);
    const statusParam = url.searchParams.get('status');
    const statuses =
      typeof statusParam === 'string' && statusParam.trim().length > 0
        ? statusParam
            .split(',')
            .map((item) => item.trim())
            .filter(
              (item): item is 'approved' | 'captured' | 'nominated' | 'rejected' =>
                item === 'approved' ||
                item === 'captured' ||
                item === 'nominated' ||
                item === 'rejected',
            )
        : undefined;
    const intents = await listIntentReviewQueueByWorkspace(currentUser.workspaceId, {
      statuses,
    });

    return NextResponse.json({
      data: {
        intents,
      },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown review queue query error';
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

async function POST(request: Request) {
  try {
    const currentUser = await requireAuthenticatedApiUser();
    const requestBody = await request.json();
    const parsedRequest = batchReviewIntentRequestSchema.safeParse(requestBody);

    if (!parsedRequest.success) {
      return NextResponse.json(
        {
          message: parsedRequest.error.issues[0]?.message ?? '배치 검토 요청이 올바르지 않습니다.',
          status: 400,
        },
        {
          status: 400,
        },
      );
    }

    const updatedIds = await reviewIntentFragmentsBatch({
      action: parsedRequest.data.action as IntentBatchAction,
      intentIds: parsedRequest.data.intentIds,
      reviewerId: currentUser.userId,
      workspaceId: currentUser.workspaceId,
    });

    return NextResponse.json({
      data: {
        updatedIds,
      },
      message:
        updatedIds.length > 0
          ? '검토 큐 상태를 일괄 업데이트했습니다.'
          : '업데이트된 검토 항목이 없습니다.',
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown review queue mutation error';
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

export { GET, POST };
