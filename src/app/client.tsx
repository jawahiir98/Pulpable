'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';

export const Client = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.hello.queryOptions({ text: 'Hey there how you doing?' })
  );

  return (
    <>
      <div className="">{JSON.stringify(data)}</div>
    </>
  );
};
