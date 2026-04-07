import { NextResponse } from 'next/server';

import { listEntities } from '@/domains/knowledge/queries';
import { requireAuthenticatedApiUser } from '@/lib/auth/middleware';

async function GET() {
  try {
    const currentUser = await requireAuthenticatedApiUser();
    const entities = await listEntities(currentUser.workspaceId);

    return NextResponse.json({
      data: {
        entities,
      },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown entities error';
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
