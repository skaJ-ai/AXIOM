import { NextResponse } from 'next/server';

import { syncPromotedAssetConflictsForWorkspace } from '@/domains/promoted-assets/conflict-actions';
import { listPromotedAssetConflictsByWorkspace } from '@/domains/promoted-assets/conflict-queries';
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
              (item): item is 'detected' | 'resolved' => item === 'detected' || item === 'resolved',
            )
        : undefined;

    await syncPromotedAssetConflictsForWorkspace(currentUser.workspaceId);
    const conflicts = await listPromotedAssetConflictsByWorkspace(currentUser.workspaceId, {
      currentUserId: currentUser.userId,
      statuses,
    });

    return NextResponse.json({
      data: {
        conflicts,
      },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown conflict query error';
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
