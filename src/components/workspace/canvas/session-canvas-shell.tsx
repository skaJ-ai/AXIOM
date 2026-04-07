'use client';

import { SessionCanvas } from '@/components/workspace/session-canvas';
import type { SessionDetail } from '@/lib/sessions/types';

import { ChatPanel } from './chat-panel';
import { DivergePanel } from './diverge-panel';
import { SynthesizePanel } from './synthesize-panel';
import { ValidatePanel } from './validate-panel';

interface SessionCanvasShellProps {
  initialSession: SessionDetail;
}

function SessionCanvasShell({ initialSession }: SessionCanvasShellProps) {
  if (initialSession.mode === 'write') {
    return <SessionCanvas initialSession={initialSession} />;
  }

  return (
    <div className="grid min-h-[calc(100vh-12rem)] grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="workspace-card flex min-h-0 flex-col p-0">
        <ChatPanel initialSession={initialSession} />
      </div>
      <div className="workspace-card flex min-h-0 flex-col p-0">
        {initialSession.mode === 'diverge' ? <DivergePanel sessionId={initialSession.id} /> : null}
        {initialSession.mode === 'validate' ? (
          <ValidatePanel sessionId={initialSession.id} />
        ) : null}
        {initialSession.mode === 'synthesize' ? (
          <SynthesizePanel sessionId={initialSession.id} />
        ) : null}
      </div>
    </div>
  );
}

export { SessionCanvasShell };
export type { SessionCanvasShellProps };
