import { NextResponse } from 'next/server';

import { searchKnowledge } from '@/domains/knowledge/queries';
import { requireAuthenticatedApiUser } from '@/lib/auth/middleware';

async function GET(request: Request) {
  try {
    const currentUser = await requireAuthenticatedApiUser();
    const requestUrl = new URL(request.url);
    const queryParam = requestUrl.searchParams.get('q')?.trim() ?? '';

    if (queryParam.length === 0) {
      return NextResponse.json({
        data: {
          results: {
            entities: [],
            facts: [],
            insights: [],
          },
        },
        status: 200,
      });
    }

    const results = await searchKnowledge(currentUser.workspaceId, queryParam);

    return NextResponse.json({
      data: {
        results,
      },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown knowledge search error';
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
