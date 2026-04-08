'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { AuthenticatedUser } from '@/lib/auth/types';

interface WorkspaceTopbarProps {
  user: AuthenticatedUser | null;
}

interface TopbarMeta {
  eyebrow: string;
  title: string;
}

function getTopbarMeta(pathname: string, user: AuthenticatedUser | null): TopbarMeta {
  if (
    pathname.startsWith('/workspace/wiki/implementation') ||
    pathname.startsWith('/wiki/implementation')
  ) {
    return { eyebrow: 'Build Wiki', title: '구현용 위키' };
  }

  if (pathname.startsWith('/workspace/session/')) {
    return { eyebrow: 'Session Canvas', title: '세션 캔버스' };
  }

  if (pathname.startsWith('/workspace/asset/')) {
    return { eyebrow: 'Reports', title: '리포트 뷰어' };
  }

  if (pathname.startsWith('/workspace/knowledge')) {
    return { eyebrow: 'Knowledge Layer', title: '지식 라이브러리' };
  }

  if (pathname.startsWith('/workspace/settings')) {
    return { eyebrow: 'Preferences', title: '설정' };
  }

  if (pathname.startsWith('/workspace/new')) {
    return { eyebrow: 'Session Setup', title: '새 작업' };
  }

  if (pathname.startsWith('/workspace/reports')) {
    return { eyebrow: 'Reports', title: '리포트' };
  }

  if (pathname.startsWith('/workspace/wiki') || pathname.startsWith('/wiki')) {
    return { eyebrow: 'Shared Knowledge', title: '공유용 위키' };
  }

  if (pathname.startsWith('/about')) {
    return { eyebrow: 'Product Brief', title: '제품 개요' };
  }

  return user
    ? { eyebrow: 'Workspace', title: '워크벤치' }
    : { eyebrow: 'Public Surface', title: '공개 위키' };
}

function WorkspaceTopbar({ user }: WorkspaceTopbarProps) {
  const pathname = usePathname();
  const breadcrumb = getTopbarMeta(pathname, user);

  return (
    <header className="topbar">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="meta">{breadcrumb.eyebrow}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="font-headline text-xl font-bold tracking-tight text-[var(--color-text)]">
              {breadcrumb.title}
            </h1>
            <span className="badge badge-neutral">
              {user ? user.workspaceName : '공유용 보기'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link className="btn-secondary px-4 py-2 text-xs" href="/workspace/wiki">
                공유 위키
              </Link>
              <Link className="btn-teal px-4 py-2 text-xs" href="/workspace/new">
                새 작업
              </Link>
            </>
          ) : (
            <>
              <Link className="btn-secondary px-4 py-2 text-xs" href="/">
                홈
              </Link>
              <Link className="btn-teal px-4 py-2 text-xs" href="/login">
                로그인
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export { WorkspaceTopbar };
export type { WorkspaceTopbarProps };
