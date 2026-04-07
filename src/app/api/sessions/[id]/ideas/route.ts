import { NextResponse } from 'next/server';

import { listIdeasBySession } from '@/domains/diverge/queries';
import { requireAuthenticatedApiUser } from '@/lib/auth/middleware';
import { verifySessionOwnership } from '@/lib/sessions/service';

async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuthenticatedApiUser();
    const { id } = await params;
    const isOwner = await verifySessionOwnership(id, currentUser.workspaceId);

    if (!isOwner) {
      return NextResponse.json(
        {
          message: '세션을 찾을 수 없습니다.',
          status: 404,
        },
        {
          status: 404,
        },
      );
    }

    const ideas = await listIdeasBySession(id);

    return NextResponse.json({
      data: {
        ideas,
      },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown ideas error';
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
