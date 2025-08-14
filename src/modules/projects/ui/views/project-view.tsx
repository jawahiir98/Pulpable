'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { MessagesContainer } from '@/modules/projects/ui/components/messages-container';

interface Props {
  projectId: string;
}

export const ProjectView = ({ projectId }: Props) => {
  const trpc = useTRPC();
  const { data: project } = useSuspenseQuery(
    trpc.projects.getOne.queryOptions({
      id: projectId,
    })
  );
  const { data: messages } = useSuspenseQuery(
    trpc.messages.getMany.queryOptions({
      projectId: projectId,
    })
  );
  return (
    <div className={'h-screen'}>
      <ResizablePanelGroup direction={'horizontal'}>
        <ResizablePanel
          defaultSize={35}
          minSize={20}
          className={'flex flex-col min-h-0'}
        >
          <MessagesContainer projectId={projectId} />
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel
          defaultSize={65}
          minSize={50}
          className={'flex flex-col min-h-0'}
        >
          todo
          {/*{JSON.stringify(messages)}*/}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
