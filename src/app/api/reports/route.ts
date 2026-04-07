import { NextResponse } from 'next/server';

import { listReportsByWorkspace } from '@/domains/write/queries';
import { requireAuthenticatedApiUser } from '@/lib/auth/middleware';

async function GET() {
  try {
    const currentUser = await requireAuthenticatedApiUser();
    const reports = await listReportsByWorkspace(currentUser.workspaceId);

    return NextResponse.json({
      data: {
        reports,
      },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown reports error';
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
