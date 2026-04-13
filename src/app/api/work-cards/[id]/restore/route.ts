import { NextResponse } from 'next/server';

import { restoreWorkCardForWorkspace } from '@/domains/work-cards/actions';
import { requireAuthenticatedApiUser } from '@/lib/auth/middleware';

async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuthenticatedApiUser();
    const { id } = await params;
    const workCard = await restoreWorkCardForWorkspace(id, currentUser.workspaceId);

    return NextResponse.json({
      data: {
        workCard,
      },
      message: '업무 카드를 다시 활성화했습니다.',
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown work card restore error';
    const status =
      message === 'Authentication required.'
        ? 401
        : message === 'Work card not found.'
          ? 404
          : message.includes('업무 카드')
            ? 409
            : 500;

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
