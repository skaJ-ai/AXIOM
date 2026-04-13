import { NextResponse } from 'next/server';

import { createProcessAsset } from '@/domains/process-assets/actions';
import { listProcessAssetsByWorkspace } from '@/domains/process-assets/queries';
import { createProcessAssetRequestSchema } from '@/domains/process-assets/validators';
import { requireAuthenticatedApiUser } from '@/lib/auth/middleware';

async function GET() {
  try {
    const currentUser = await requireAuthenticatedApiUser();
    const processAssets = await listProcessAssetsByWorkspace(currentUser.workspaceId);

    return NextResponse.json({
      data: {
        processAssets,
      },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown process asset query error';
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
    const parsedRequest = createProcessAssetRequestSchema.safeParse(requestBody);

    if (!parsedRequest.success) {
      return NextResponse.json(
        {
          message:
            parsedRequest.error.issues[0]?.message ??
            '프로세스 자산 생성 요청이 올바르지 않습니다.',
          status: 400,
        },
        {
          status: 400,
        },
      );
    }

    const processAsset = await createProcessAsset({
      description: parsedRequest.data.description,
      domainLabel: parsedRequest.data.domainLabel,
      name: parsedRequest.data.name,
      workspaceId: currentUser.workspaceId,
    });

    return NextResponse.json(
      {
        data: {
          processAsset,
        },
        message: '프로세스 자산을 생성했습니다.',
        status: 201,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown process asset creation error';
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
