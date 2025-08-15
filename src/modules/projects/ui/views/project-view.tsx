'use client';

import { Suspense, useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { MessagesContainer } from '@/modules/projects/ui/components/messages-container';
import { Fragment } from '@/generated/prisma';
import { ProjectHeader } from '@/modules/projects/ui/components/project-header';

interface Props {
  projectId: string;
}

export const ProjectView = ({ projectId }: Props) => {
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);

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
          <Suspense fallback={<p>Loading project...</p>}>
            <ProjectHeader projectId={projectId} />
          </Suspense>
          <Suspense fallback={<p> Loading ... </p>}>
            <MessagesContainer
              projectId={projectId}
              activeFragment={activeFragment}
              setActiveFragment={setActiveFragment}
            />
          </Suspense>
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
