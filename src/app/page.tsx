'use client';
import { prisma } from '@/lib/db';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';

const Page = () => {
  const trpc = useTRPC();
  const { data } = useQuery(
    trpc.hello.queryOptions({ text: 'Hello, Jawahiir!' })
  );

  return (
    <>
      <div className="">{JSON.stringify(data, null, 2)}</div>
    </>
  );
};
export default Page;
