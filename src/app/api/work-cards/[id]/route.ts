import { NextResponse } from 'next/server';

import {
  archiveWorkCardForWorkspace,
  updateWorkCardForWorkspace,
} from '@/domains/work-cards/actions';
import { getWorkCardByIdForWorkspace } from '@/domains/work-cards/queries';
import { updateWorkCardRequestSchema } from '@/domains/work-cards/validators';
import { requireAuthenticatedApiUser } from '@/lib/auth/middleware';

async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuthenticatedApiUser();
    const { id } = await params;
    const workCard = await getWorkCardByIdForWorkspace(id, currentUser.workspaceId);

    if (!workCard) {
      return NextResponse.json(
        {
          message: '업무 카드를 찾을 수 없습니다.',
          status: 404,
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      data: {
        workCard,
      },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown work card detail error';
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

async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuthenticatedApiUser();
    const { id } = await params;
    const requestBody = await request.json();
    const parsedRequest = updateWorkCardRequestSchema.safeParse(requestBody);

    if (!parsedRequest.success) {
      return NextResponse.json(
        {
          message:
            parsedRequest.error.issues[0]?.message ?? '업무 카드 수정 요청이 올바르지 않습니다.',
          status: 400,
        },
        {
          status: 400,
        },
      );
    }

    const workCard =
      parsedRequest.data.status === 'archived' &&
      !parsedRequest.data.title &&
      !parsedRequest.data.audience &&
      !parsedRequest.data.priority &&
      !parsedRequest.data.processLabel &&
      !parsedRequest.data.sensitivity
        ? await archiveWorkCardForWorkspace(id, currentUser.workspaceId)
        : await updateWorkCardForWorkspace({
            audience: parsedRequest.data.audience,
            priority: parsedRequest.data.priority,
            processLabel: parsedRequest.data.processLabel,
            sensitivity: parsedRequest.data.sensitivity,
            status: parsedRequest.data.status,
            title: parsedRequest.data.title,
            workCardId: id,
            workspaceId: currentUser.workspaceId,
          });

    return NextResponse.json({
      data: {
        workCard,
      },
      message: '업무 카드를 업데이트했습니다.',
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown work card patch error';
    const normalizedStatus =
      message === 'Authentication required.'
        ? 401
        : message === 'Work card not found.'
          ? 404
          : message.includes('업무 카드')
            ? 409
            : 500;

    return NextResponse.json(
      {
        message,
        status: normalizedStatus,
      },
      {
        status: normalizedStatus,
      },
    );
  }
}

export { GET, PATCH };
