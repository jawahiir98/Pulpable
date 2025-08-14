'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { MessageCard } from '@/modules/projects/ui/components/message-card';
import { MessageForm } from '@/modules/projects/ui/components/message-form';
import { useRef, useEffect } from 'react';

interface Props {
  projectId: string;
}

export const MessagesContainer = ({ projectId }: Props) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const trpc = useTRPC();
  const { data: messages } = useSuspenseQuery(
    trpc.messages.getMany.queryOptions({
      projectId: projectId,
    })
  );

  useEffect(() => {
    const lastAssistantMessage = messages.findLast(
      (message) => message.role === 'ASSISTANT'
    );
    if (lastAssistantMessage) {
      //   TODO: Set Active Fragment
    }
  }, [messages]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className={'flex flex-col min-h-0 flex-1'}>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="pt-2 pr-1">
          {messages.map((message) => (
            <MessageCard
              key={message.id}
              content={message.content}
              role={message.role}
              type={message.type}
              fragment={message.fragment}
              createdAt={message.createdAt}
              isActiveFragment={false}
              onFragmentClick={() => {}}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
      <div className="relative p-3 pt-1">
        <div
          className={
            'absolute -top-6 left-0 right-0 h-5 bg-gradient-to-b from-transparent to-background/60 pointer-events-none'
          }
        />
        <MessageForm projectId={projectId} />
      </div>
    </div>
  );
};
