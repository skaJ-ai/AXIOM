import { NextResponse } from 'next/server';

import { z } from 'zod';

import { updateReport } from '@/domains/write/actions';
import { getReportDetail } from '@/domains/write/queries';
import { requireAuthenticatedApiUser } from '@/lib/auth/middleware';

const reportSectionSchema = z.object({
  cited: z.boolean(),
  confidence: z.enum(['high', 'medium', 'low']),
  content: z.string(),
  name: z.string(),
});

const updateReportSchema = z.object({
  sections: z.array(reportSectionSchema).optional(),
  status: z.enum(['draft', 'final', 'promoted_asset']).optional(),
  title: z.string().min(1).optional(),
});

async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuthenticatedApiUser();
    const { id } = await params;
    const report = await getReportDetail(id, currentUser.workspaceId);

    if (!report) {
      return NextResponse.json(
        {
          message: '보고서를 찾을 수 없습니다.',
          status: 404,
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      data: {
        report,
      },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown report error';
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
    const existing = await getReportDetail(id, currentUser.workspaceId);

    if (!existing) {
      return NextResponse.json(
        {
          message: '보고서를 찾을 수 없습니다.',
          status: 404,
        },
        {
          status: 404,
        },
      );
    }

    const requestBody = await request.json();
    const parsedRequest = updateReportSchema.safeParse(requestBody);

    if (!parsedRequest.success) {
      const validationMessage =
        parsedRequest.error.issues[0]?.message ?? '보고서 수정 요청이 올바르지 않습니다.';

      return NextResponse.json(
        {
          message: validationMessage,
          status: 400,
        },
        {
          status: 400,
        },
      );
    }

    await updateReport(id, parsedRequest.data);
    const updated = await getReportDetail(id, currentUser.workspaceId);

    return NextResponse.json({
      data: {
        report: updated,
      },
      message: '보고서가 수정되었습니다.',
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown report update error';
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

export { GET, PATCH };
