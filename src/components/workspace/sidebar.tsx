'use client';

import { useState } from 'react';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import type { AuthenticatedUser } from '@/lib/auth/types';
import { BRAND_NAME, BRAND_SIDEBAR_SUBTITLE } from '@/lib/brand';
import { safeFetch } from '@/lib/utils';

interface WorkspaceSidebarProps {
  user: AuthenticatedUser | null;
}

interface WorkspaceNavItem {
  href: string;
  label: string;
  shortLabel: string;
}

const AUTH_NAV_ITEMS: WorkspaceNavItem[] = [
  { href: '/workspace', label: '워크벤치', shortLabel: 'WB' },
  { href: '/workspace/new', label: '새 작업', shortLabel: 'NW' },
  { href: '/workspace/cards', label: '업무 카드', shortLabel: 'WC' },
  { href: '/workspace/reports', label: '리포트', shortLabel: 'RP' },
  { href: '/workspace/knowledge', label: '지식 라이브러리', shortLabel: 'KB' },
  { href: '/workspace/wiki', label: '공유 위키', shortLabel: 'WK' },
  { href: '/workspace/settings', label: '설정', shortLabel: 'ST' },
];

const GUEST_NAV_ITEMS: WorkspaceNavItem[] = [
  { href: '/', label: '홈', shortLabel: 'HM' },
  { href: '/about', label: '제품 개요', shortLabel: 'AB' },
  { href: '/wiki', label: '공유 위키', shortLabel: 'WK' },
  { href: '/login', label: '로그인', shortLabel: 'IN' },
];

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === '/') {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function WorkspaceSidebar({ user }: WorkspaceSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navItems = user ? AUTH_NAV_ITEMS : GUEST_NAV_ITEMS;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await safeFetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const handleMobileToggle = () => {
    setIsMobileOpen((previousState) => !previousState);
  };

  const handleMobileClose = () => {
    setIsMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)] text-white">
          <span className="text-xs font-bold">HX</span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-[var(--color-accent)]">
            {BRAND_NAME}
          </span>
          <span className="text-[9px] font-semibold tracking-wider text-[var(--color-text-secondary)]">
            {BRAND_SIDEBAR_SUBTITLE}
          </span>
        </div>
      </div>

      <nav className="mt-2 flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => (
          <Link
            className="sidebar-nav-item"
            data-active={isNavItemActive(pathname, item.href)}
            href={item.href}
            key={item.href}
            onClick={handleMobileClose}
          >
            <span className="w-8 rounded-full bg-[var(--color-bg-sunken)] px-2 py-1 text-center font-mono text-[10px] font-bold text-[var(--color-text-tertiary)]">
              {item.shortLabel}
            </span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="border-t border-[var(--color-border-subtle)] px-4 py-4">
        {user ? (
          <>
            <div className="mb-3">
              <p className="text-sm font-bold text-[var(--color-text)]">{user.name}</p>
              <p className="text-[10px] text-[var(--color-text-secondary)]">{user.workspaceName}</p>
            </div>
            <button
              className="btn-secondary w-full px-3 py-2 text-xs"
              disabled={isLoggingOut}
              onClick={() => void handleLogout()}
              type="button"
            >
              {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
            </button>
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-sm font-bold text-[var(--color-text)]">공유용 위키</p>
              <p className="text-[10px] leading-5 text-[var(--color-text-secondary)]">
                위키는 로그인 없이 볼 수 있고, 실제 작업은 로그인 후 이어집니다.
              </p>
            </div>
            <div className="grid gap-2">
              <Link className="btn-secondary w-full px-3 py-2 text-xs" href="/signup">
                베타 시작
              </Link>
              <Link className="btn-teal w-full px-3 py-2 text-xs" href="/login">
                로그인
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        className="fixed left-4 top-4 z-50 flex h-10 min-w-10 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 shadow-sm md:hidden"
        onClick={handleMobileToggle}
        type="button"
      >
        <span className="text-xs font-semibold">{isMobileOpen ? '닫기' : '메뉴'}</span>
      </button>

      <aside className="sidebar hidden md:flex">{sidebarContent}</aside>

      {isMobileOpen ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
            onClick={handleMobileClose}
            role="presentation"
          />
          <aside className="sidebar fixed inset-y-0 left-0 z-50 flex md:hidden">
            {sidebarContent}
          </aside>
        </>
      ) : null}
    </>
  );
}

export { WorkspaceSidebar };
export type { WorkspaceSidebarProps };
