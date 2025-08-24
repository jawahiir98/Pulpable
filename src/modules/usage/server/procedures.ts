import { getUsageStatus } from '@/lib/usage';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';

export const usageRouter = createTRPCRouter({
  status: protectedProcedure.query(async () => {
    try {
      return await getUsageStatus();
    } catch {
      return null;
    }
  }),
});
