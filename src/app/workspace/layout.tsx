import type { ReactNode } from 'react';

import { redirect } from 'next/navigation';

import { WorkspaceShell } from '@/components/workspace/workspace-shell';
import { getCurrentUser } from '@/lib/auth/session';

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <WorkspaceShell user={user}>{children}</WorkspaceShell>;
}
