import { createTRPCRouter, baseProcedure } from '@/trpc/init';
import { z } from 'zod';
import { inngest } from '@/inngest/client';
import { prisma } from '@/lib/db';

export const messagesRouter = createTRPCRouter({
  //  Create MESSAGE
  create: baseProcedure
    .input(
      z.object({
        value: z.string().min(1, { message: 'Message is required' }),
      })
    )
    .mutation(async ({ input }) => {
      // Create a message
      const createdMessage = await prisma.message.create({
        data: {
          content: input.value,
          role: 'USER',
          type: 'RESULT',
        },
      });
      //   Invoke the background job by Inngest
      await inngest.send({
        name: 'code-agent/run',
        data: {
          value: input.value,
        },
      });
      return createdMessage;
    }),
  // GET MESSAGES
  getMany: baseProcedure.query(async () => {
    return prisma.message.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }),
});
