'use client';

import { useState } from 'react';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import type { AuthenticatedUser } from '@/lib/auth/types';
import { safeFetch } from '@/lib/utils';

interface WorkspaceSidebarProps {
  user: AuthenticatedUser;
}

const NAV_ITEMS = [
  { href: '/workspace', icon: '◫', label: '대시보드' },
  { href: '/workspace/new', icon: '✦', label: '새 작업' },
  { href: '/workspace/knowledge', icon: '◈', label: '지식 브라우저' },
  { href: '/workspace/settings', icon: '⚙', label: '설정' },
];

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === '/workspace') {
    return pathname === '/workspace';
  }

  return pathname.startsWith(href);
}

function WorkspaceSidebar({ user }: WorkspaceSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await safeFetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const handleMobileToggle = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const handleMobileClose = () => {
    setIsMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)] text-white">
          <span className="font-bold">A</span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-[var(--color-accent)]">AXIOM</span>
          <span className="text-[9px] font-semibold tracking-wider text-[var(--color-text-secondary)]">
            AI INSIGHT PLATFORM
          </span>
        </div>
      </div>

      <nav className="mt-2 flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = isNavItemActive(pathname, item.href);

          return (
            <Link
              className="sidebar-nav-item"
              data-active={isActive}
              href={item.href}
              key={item.href}
              onClick={handleMobileClose}
            >
              <span className="w-5 text-center text-sm">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--color-border-subtle)] px-4 py-4">
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
          {isLoggingOut ? '로딩...' : '로그아웃'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-sm md:hidden"
        onClick={handleMobileToggle}
        type="button"
      >
        <span className="text-lg">{isMobileOpen ? '✕' : '☰'}</span>
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
