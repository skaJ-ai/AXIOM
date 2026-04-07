'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

function getCurrentBreadcrumb(pathname: string): string {
  if (pathname.startsWith('/workspace/session/')) {
    return '세션 캔버스';
  }

  if (pathname.startsWith('/workspace/asset/')) {
    return '산출물 뷰어';
  }

  if (pathname.startsWith('/workspace/knowledge')) {
    return '지식 브라우저';
  }

  if (pathname.startsWith('/workspace/settings')) {
    return '설정';
  }

  if (pathname.startsWith('/workspace/new')) {
    return '새 작업';
  }

  if (pathname.startsWith('/workspace/deliverables')) {
    return '산출물 목록';
  }

  return '대시보드';
}

function WorkspaceTopbar() {
  const pathname = usePathname();
  const breadcrumb = getCurrentBreadcrumb(pathname);

  return (
    <header className="topbar">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="badge badge-neutral text-[10px]">{breadcrumb}</span>
        </div>

        <div className="flex items-center gap-3">
          <Link className="btn-teal px-4 py-2 text-xs" href="/workspace/new">
            새 작업
          </Link>
        </div>
      </div>
    </header>
  );
}

export { WorkspaceTopbar };
