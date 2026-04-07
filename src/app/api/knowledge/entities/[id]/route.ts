import { NextResponse } from 'next/server';

import { getEntityDetail } from '@/domains/knowledge/queries';
import { requireAuthenticatedApiUser } from '@/lib/auth/middleware';

async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuthenticatedApiUser();
    const { id } = await params;
    const entity = await getEntityDetail(id, currentUser.workspaceId);

    if (!entity) {
      return NextResponse.json(
        {
          message: '엔티티를 찾을 수 없습니다.',
          status: 404,
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      data: {
        entity,
      },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown entity detail error';
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
