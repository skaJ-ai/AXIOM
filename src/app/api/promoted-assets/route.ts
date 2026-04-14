import { NextResponse } from 'next/server';

import { promoteApprovedIntentsToAssets } from '@/domains/promoted-assets/actions';
import { listPromotedAssetsByWorkspace } from '@/domains/promoted-assets/queries';
import { promoteIntentAssetsRequestSchema } from '@/domains/promoted-assets/validators';
import { requireAuthenticatedApiUser } from '@/lib/auth/middleware';

async function GET() {
  try {
    const currentUser = await requireAuthenticatedApiUser();
    const promotedAssets = await listPromotedAssetsByWorkspace(
      currentUser.workspaceId,
      currentUser.userId,
    );

    return NextResponse.json({
      data: {
        promotedAssets,
      },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown promoted asset query error';
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
    const parsedRequest = promoteIntentAssetsRequestSchema.safeParse(requestBody);

    if (!parsedRequest.success) {
      return NextResponse.json(
        {
          message:
            parsedRequest.error.issues[0]?.message ?? '재사용 자산 승격 요청이 올바르지 않습니다.',
          status: 400,
        },
        {
          status: 400,
        },
      );
    }

    const promotedIntentIds = await promoteApprovedIntentsToAssets({
      bucketScope: parsedRequest.data.bucketScope,
      intentIds: parsedRequest.data.intentIds,
      userId: currentUser.userId,
      workspaceId: currentUser.workspaceId,
    });

    return NextResponse.json({
      data: {
        promotedIntentIds,
      },
      message:
        promotedIntentIds.length > 0
          ? '승인된 검토 항목을 재사용 자산으로 승격했습니다.'
          : '승격된 재사용 자산이 없습니다.',
      status: 200,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown promoted asset mutation error';
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
