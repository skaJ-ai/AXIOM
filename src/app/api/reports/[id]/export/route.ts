import { NextResponse } from 'next/server';

import { getReportDetail } from '@/domains/write/queries';
import { requireAuthenticatedApiUser } from '@/lib/auth/middleware';

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

    const lines: string[] = [];
    lines.push(`# ${report.title}`);
    lines.push('');

    for (const section of report.sections) {
      lines.push(`## ${section.name}`);
      lines.push('');
      lines.push(section.content);
      lines.push('');
    }

    const markdown = lines.join('\n');
    const fileName = encodeURIComponent(`${report.title}.md`);

    return new NextResponse(markdown, {
      headers: {
        'content-disposition': `attachment; filename="${fileName}"`,
        'content-type': 'text/markdown; charset=utf-8',
      },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown report export error';
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
