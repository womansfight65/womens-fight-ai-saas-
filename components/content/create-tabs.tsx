'use client';

import { useState } from 'react';

import { IdeaChat } from '@/components/ai/idea-chat';
import { Tabs } from '@/components/ui/tabs';
import type { AIMessage } from '@/types';
import { CreateStudio } from './create-studio';

type Mode = 'quick' | 'chat';

export function CreateTabs({
  isMock,
  conversationId,
  initialMessages,
}: {
  isMock: boolean;
  conversationId: string;
  initialMessages: AIMessage[];
}) {
  const [mode, setMode] = useState<Mode>('quick');

  return (
    <div className="space-y-6">
      <Tabs
        items={[
          { id: 'quick', label: 'Quick post' },
          { id: 'chat', label: 'Chat & plan' },
        ]}
        value={mode}
        onChange={setMode}
        className="w-fit"
      />

      {mode === 'quick' ? (
        <CreateStudio isMock={isMock} />
      ) : (
        <IdeaChat conversationId={conversationId} initialMessages={initialMessages} />
      )}
    </div>
  );
}
