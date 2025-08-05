'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTRPC } from '@/trpc/client';
import { useMutation } from '@tanstack/react-query';

const Page = () => {
  const [value, setValue] = useState('');
  const trpc = useTRPC();
  const invoke = useMutation(trpc.invoke.mutationOptions({}));

  const invokeFunction = () => {
    invoke.mutate({ value: value });
  };

  return (
    <div className={'p-4 max-w-full mx-auto space-y-5'}>
      <Input value={value} onChange={(e) => setValue(e.target.value)} />
      <Button onClick={invokeFunction} className="p-4 max-w-7xl mx-auto">
        Invoke background job
      </Button>
    </div>
  );
};
export default Page;
