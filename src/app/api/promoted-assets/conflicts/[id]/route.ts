import { NextResponse } from 'next/server';

import { resolvePromotedAssetConflict } from '@/domains/promoted-assets/conflict-actions';
import { resolvePromotedAssetConflictRequestSchema } from '@/domains/promoted-assets/conflict-validators';
import { requireAuthenticatedApiUser } from '@/lib/auth/middleware';

async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const currentUser = await requireAuthenticatedApiUser();
    const requestBody = await request.json();
    const parsedRequest = resolvePromotedAssetConflictRequestSchema.safeParse(requestBody);

    if (!parsedRequest.success) {
      return NextResponse.json(
        {
          message: parsedRequest.error.issues[0]?.message ?? '충돌 해결 요청이 올바르지 않습니다.',
          status: 400,
        },
        {
          status: 400,
        },
      );
    }

    const { id } = await context.params;
    const isUpdated = await resolvePromotedAssetConflict({
      conflictId: id,
      resolutionType: parsedRequest.data.resolutionType,
      reviewerId: currentUser.userId,
      workspaceId: currentUser.workspaceId,
    });

    if (!isUpdated) {
      return NextResponse.json(
        {
          message: '충돌 항목을 찾을 수 없습니다.',
          status: 404,
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      data: {
        updated: isUpdated,
      },
      message: '충돌 해결 상태를 반영했습니다.',
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown conflict mutation error';
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
