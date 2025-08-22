import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { z } from 'zod';
import { inngest } from '@/inngest/client';
import { prisma } from '@/lib/db';
import { generateSlug } from 'random-word-slugs';
import { TRPCError } from '@trpc/server';

export const projectsRouter = createTRPCRouter({
  //  CREATE PROJECT
  create: protectedProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: 'Prompt is required' })
          .max(10000, 'Prompt is too long'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const createdProject = await prisma.project.create({
        data: {
          userId: ctx.auth.userId,
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
  // GET SINGLE PROJECT
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const project = await prisma.project.findUnique({
        where: {
          userId: ctx.auth.userId,
          id: input.id,
        },
      });
      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }
      return project;
    }),
  // GET PROJECTS
  getMany: protectedProcedure.query(async ({ ctx }) => {
    return prisma.project.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }),
});
