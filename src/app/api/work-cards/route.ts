import { NextResponse } from 'next/server';

import { createWorkCard } from '@/domains/work-cards/actions';
import { listWorkCardsByWorkspace } from '@/domains/work-cards/queries';
import { createWorkCardRequestSchema } from '@/domains/work-cards/validators';
import { requireAuthenticatedApiUser } from '@/lib/auth/middleware';

async function GET() {
  try {
    const currentUser = await requireAuthenticatedApiUser();
    const workCards = await listWorkCardsByWorkspace(currentUser.workspaceId, {
      includeArchived: true,
    });

    return NextResponse.json({
      data: {
        workCards,
      },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown work card query error';
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
    const parsedRequest = createWorkCardRequestSchema.safeParse(requestBody);

    if (!parsedRequest.success) {
      return NextResponse.json(
        {
          message:
            parsedRequest.error.issues[0]?.message ?? '업무 카드 생성 요청이 올바르지 않습니다.',
          status: 400,
        },
        {
          status: 400,
        },
      );
    }

    const createdCard = await createWorkCard({
      audience: parsedRequest.data.audience,
      ownerId: currentUser.userId,
      processAssetId: parsedRequest.data.processAssetId,
      processLabel: parsedRequest.data.processLabel,
      title: parsedRequest.data.title,
      workspaceId: currentUser.workspaceId,
    });

    const workCards = await listWorkCardsByWorkspace(currentUser.workspaceId, {
      includeArchived: true,
    });
    const workCard = workCards.find((item) => item.id === createdCard.id);

    return NextResponse.json(
      {
        data: {
          workCard: workCard ?? null,
        },
        message: '업무 카드를 생성했습니다.',
        status: 201,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown work card creation error';
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
