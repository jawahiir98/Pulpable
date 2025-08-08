import { createTRPCRouter, baseProcedure } from '@/trpc/init';
import { z } from 'zod';
import { inngest } from '@/inngest/client';
import { prisma } from '@/lib/db';
import { generateSlug } from 'random-word-slugs';

export const projectsRouter = createTRPCRouter({
  //  CREATE PROJECT
  create: baseProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: 'Prompt is required' })
          .max(10000, 'Prompt is too long'),
      })
    )
    .mutation(async ({ input }) => {
      const createdProject = await prisma.project.create({
        data: {
          name: generateSlug(2, {
            format: 'kebab',
          }),
          messages: {
            create: {
              content: input.value,
              role: 'USER',
              type: 'RESULT',
            },
          },
        },
      });
      //   Invoke the background job by Inngest
      await inngest.send({
        name: 'code-agent/run',
        data: {
          value: input.value,
          projectId: createdProject.id,
        },
      });

      return createdProject;
    }),
  // GET PROJECTS
  getMany: baseProcedure.query(async () => {
    return prisma.project.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }),
});
