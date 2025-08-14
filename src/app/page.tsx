'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTRPC } from '@/trpc/client';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

const Page = () => {
  const router = useRouter();
  const [value, setValue] = useState('');
  const trpc = useTRPC();

  const createProject = useMutation(
    trpc.projects.create.mutationOptions({
      onSuccess: (data) => {
        router.push(`/projects/${data.id}`);
      },
    })
  );

  const invokeFunction = () => {
    createProject.mutate({ value: value });
  };

  return (
    <div className={'h-screen w-screen flex items-center justify-center'}>
      <div className="max-w-screen mx-auto flex items-center flex-col gap-y-4 justify-center">
        <Input value={value} onChange={(e) => setValue(e.target.value)} />
        <Button disabled={createProject.isPending} onClick={invokeFunction}>
          Submit
        </Button>
      </div>
    </div>
  );
};
export default Page;
