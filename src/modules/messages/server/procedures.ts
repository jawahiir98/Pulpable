import { createTRPCRouter, baseProcedure } from '@/trpc/init';
import { MessageRole, MessageType } from '@/generated/prisma';
import { z } from 'zod';
import { inngest } from '@/inngest/client';
import { prisma } from '@/lib/db';

export const messagesRouter = createTRPCRouter({
  //  Create MESSAGE
  create: baseProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: 'Prompt is required' })
          .max(10000, 'Prompt is too long'),
        projectId: z.string().min(1, { message: 'Project Id is required' }),
      })
    )
    .mutation(async ({ input }) => {
      // Create a message
      const createdMessage = await prisma.message.create({
        data: {
          projectId: input.projectId,
          content: input.value,
          role: MessageRole.USER,
          type: MessageType.RESULT,
        },
      });
      //   Invoke the background job by Inngest
      await inngest.send({
        name: 'code-agent/run',
        data: {
          value: input.value,
          projectId: input.projectId,
        },
      });
      return createdMessage;
    }),
  // GET MESSAGES
  getMany: baseProcedure
    .input(
      z.object({
        projectId: z.string().min(1, { message: 'Project Id is required' }),
      })
    )
    .query(async ({ input }) => {
      return prisma.message.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          fragment: true,
        },
        orderBy: {
          updatedAt: 'asc',
        },
      });
    }),
});
