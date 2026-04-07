import type { ReactNode } from 'react';

import { redirect } from 'next/navigation';

import { WorkspaceSidebar } from '@/components/workspace/sidebar';
import { WorkspaceTopbar } from '@/components/workspace/topbar';
import { getCurrentUser } from '@/lib/auth/session';

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <WorkspaceSidebar user={user} />
      <div className="flex flex-1 flex-col md:ml-64">
        <WorkspaceTopbar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
