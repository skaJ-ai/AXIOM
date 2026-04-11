import { NextResponse } from 'next/server';

import { listIntentReviewQueueByWorkspace } from '@/domains/intents/queries';
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

export { GET };
