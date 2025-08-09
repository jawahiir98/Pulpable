'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { MessageCard } from '@/modules/projects/ui/components/message-card';

interface Props {
  projectId: string;
}

export const MessagesContainer = ({ projectId }: Props) => {
  const trpc = useTRPC();
  const { data: messages } = useSuspenseQuery(
    trpc.messages.getMany.queryOptions({
      projectId: projectId,
    })
  );
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
        </div>
      </div>
    </div>
  );
};
