import { prisma } from '@/lib/db';

const Page = async () => {
  const users = await prisma.post.findMany();
  return (
    <>
      <div className="">{JSON.stringify(users, null, 2)}</div>
    </>
  );
};
export default Page;
