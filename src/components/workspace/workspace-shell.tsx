import type { ReactNode } from 'react';

import type { AuthenticatedUser } from '@/lib/auth/types';

import { WorkspaceSidebar } from './sidebar';
import { WorkspaceTopbar } from './topbar';

interface WorkspaceShellProps {
  children: ReactNode;
  user: AuthenticatedUser | null;
}

function WorkspaceShell({ children, user }: WorkspaceShellProps) {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <WorkspaceSidebar user={user} />
      <div className="flex flex-1 flex-col md:ml-64">
        <WorkspaceTopbar user={user} />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

export { WorkspaceShell };
export type { WorkspaceShellProps };
