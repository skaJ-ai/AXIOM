import type { ReactNode } from 'react';

import { WorkspaceShell } from '@/components/workspace/workspace-shell';

export default function WikiLayout({ children }: { children: ReactNode }) {
  return <WorkspaceShell user={null}>{children}</WorkspaceShell>;
}
