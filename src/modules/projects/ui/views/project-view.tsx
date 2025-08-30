'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { MessagesContainer } from '@/modules/projects/ui/components/messages-container';
import { Fragment } from '@/generated/prisma';
import { ProjectHeader } from '@/modules/projects/ui/components/project-header';
import { FragmentWeb } from '@/modules/projects/ui/components/fragment-web';
import { EyeIcon, CodeIcon, CrownIcon } from 'lucide-react';
import { FileExplorer } from '@/components/file-explorer';
import { UserControl } from '@/components/user-control';
import { useAuth } from '@clerk/nextjs';
import { ErrorBoundary } from 'react-error-boundary';

interface Props {
  projectId: string;
}

export const ProjectView = ({ projectId }: Props) => {
  const { has } = useAuth();
  const hasSubscription = has?.({ plan: 'pro' });

  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
  const [tabState, setTabState] = useState<'preview' | 'code'>('preview');
  return (
    <div className={'h-screen'}>
      <ResizablePanelGroup direction={'horizontal'}>
        <ResizablePanel
          defaultSize={35}
          minSize={20}
          className={'flex flex-col min-h-0'}
        >
          <ErrorBoundary fallback={<p>Project Header Error...</p>}>
            <Suspense fallback={<p>Loading project...</p>}>
              <ProjectHeader projectId={projectId} />
            </Suspense>
          </ErrorBoundary>
          <ErrorBoundary fallback={<p> Messages Error </p>}>
            <Suspense fallback={<p> Loading ... </p>}>
              <MessagesContainer
                projectId={projectId}
                activeFragment={activeFragment}
                setActiveFragment={setActiveFragment}
              />
            </Suspense>
          </ErrorBoundary>
        </ResizablePanel>
        <ResizableHandle className={'hover:bg-primary transition-colors'} />
        <ResizablePanel
          defaultSize={65}
          minSize={50}
          className={'flex flex-col min-h-0'}
        >
          <Tabs
            className="h-full gap-y-0"
            defaultValue={'preview'}
            value={tabState}
            onValueChange={(value) => setTabState(value as 'preview' | 'code')}
          >
            <div className="w-full flex items-center p-2 border-b gap-x-2">
              <TabsList className="h-8 p-0 border rounded-md">
                <TabsTrigger value={'preview'} className={'rounded-md'}>
                  <EyeIcon /> <span>Demo</span>
                </TabsTrigger>
                <TabsTrigger value={'code'} className={'rounded-md'}>
                  <CodeIcon /> <span>Code</span>
                </TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-x-2">
                {!hasSubscription && (
                  <Button size={'sm'} variant={'tertiary'} asChild>
                    <Link href={'/pricing'}>
                      <CrownIcon /> Upgrade
                    </Link>
                  </Button>
                )}
                <UserControl />
              </div>
            </div>
            <TabsContent value={'preview'}>
              {activeFragment && <FragmentWeb data={activeFragment} />}
            </TabsContent>
            <TabsContent value={'code'} className={'min-h-0'}>
              {!!activeFragment?.files && (
                <FileExplorer
                  files={activeFragment?.files as { [path: string]: string }}
                />
              )}
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
