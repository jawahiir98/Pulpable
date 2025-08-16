import { CopyCheckIcon, CopyIcon } from 'lucide-react';
import { useState, useMemo, useCallback, Fragment } from 'react';
import { Hint } from '@/components/hint';
import { Button } from '@/components/ui/button';
import { CodeView } from '@/components/code-view';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import {
  Breadcrumb,
  BreadcrumbSeparator,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbItem,
  BreadcrumbEllipsis,
} from '@/components/ui/breadcrumb';
import { convertFilesToTreeItems } from '@/lib/utils';
import { TreeView } from '@/components/tree-view/tree-view';
import { toast } from 'sonner';

type FileCollection = { [path: string]: string };

function getLanguageFromExtension(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension || 'text';
}

interface FileExplorerProps {
  files: FileCollection;
}

export const FileExplorer = ({ files }: FileExplorerProps) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(() => {
    const fileKeys = Object.keys(files);
    return fileKeys.length > 0 ? fileKeys[0] : null;
  });

  const treeData = useMemo(() => {
    return convertFilesToTreeItems(files);
  }, [files]);

  const onFileSelect = useCallback(
    (filePath: string) => {
      if (files[filePath]) {
        setSelectedFile(filePath);
      }
    },
    [files]
  );

  const onCopy = useCallback(() => {
    if (selectedFile) {
      navigator.clipboard.writeText(files[selectedFile]);
      setCopied(true);
      toast.success('Code Copied');
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  }, [files, selectedFile]);

  return (
    <ResizablePanelGroup direction={'horizontal'}>
      <ResizablePanel defaultSize={30} minSize={30} className="bg-sidebar">
        <TreeView
          data={treeData}
          value={selectedFile}
          onSelect={onFileSelect}
        />
      </ResizablePanel>
      <ResizableHandle className={'hover:bg-primary transition-colors'} />
      <ResizablePanel defaultSize={70} minSize={50}>
        {selectedFile && files[selectedFile] ? (
          <div className={'h-full w-full flex flex-col '}>
            <div className="border-b bg-sidebar px-4 py-2 flex justify-between items-center gap-x-2">
              <FileBreadcrumb filePath={selectedFile} />
              <Hint text={'Copy to clipboard'} side={'bottom'}>
                <Button
                  variant={'outline'}
                  size={'icon'}
                  className={'ml-auto'}
                  onClick={onCopy}
                  disabled={copied}
                >
                  {copied ? <CopyCheckIcon /> : <CopyIcon />}
                </Button>
              </Hint>
            </div>
            <div className="flex-1 overflow-auto">
              <CodeView
                lang={getLanguageFromExtension(selectedFile)}
                code={files[selectedFile]}
              />
            </div>
          </div>
        ) : (
          <div
            className={
              'flex h-full items-center justify-center text-muted-foreground'
            }
          >
            Select a file to view it&apost;s content
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

interface FileBreadcrumbProps {
  filePath: string;
}
const FileBreadcrumb = ({ filePath }: FileBreadcrumbProps) => {
  const pathSegments = filePath.split('/');
  const maxSegments = 4;

  const renderBreadcrumbItems = () => {
    if (pathSegments.length <= maxSegments) {
      return pathSegments.map((segment, index) => {
        const isLast = index === pathSegments.length - 1;
        return (
          <Fragment key={index}>
            <BreadcrumbItem>
              {isLast ? (
                <BreadcrumbPage className={'font-medium'}>
                  {segment}
                </BreadcrumbPage>
              ) : (
                <span className={'text-muted-foreground'}>{segment}</span>
              )}
            </BreadcrumbItem>
            {!isLast && <BreadcrumbSeparator />}
          </Fragment>
        );
      });
    } else {
      const firstSegment = pathSegments[0];
      const lastSegment = pathSegments[pathSegments.length - 1];

      return (
        <>
          <BreadcrumbItem>
            <span className={'text-muted-foreground'}>{firstSegment}</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage className={'font-medium'}>
              {lastSegment}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </>
      );
    }
  };
  return (
    <Breadcrumb>
      <BreadcrumbList>{renderBreadcrumbItems()}</BreadcrumbList>
    </Breadcrumb>
  );
};
