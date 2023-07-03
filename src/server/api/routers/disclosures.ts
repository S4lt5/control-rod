import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { z } from 'zod';
import { Disclosure, disclosureStatus, severity } from '@prisma/client';
import { prisma } from '~/server/db';
import { TRPCError } from '@trpc/server';
import { TemplateGenerator } from '~/shared/disclosure_template_generator';

export const disclosuresRouter = createTRPCRouter({
  updateDisclosureStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().nonempty(),
        status: z.nativeEnum(disclosureStatus),
      })
    )
    .mutation(async (opts): Promise<boolean> => {
      const { input } = opts;
      await prisma.disclosure.update({
        where: {
          id: input.id,
        },
        data: {
          status: input.status,
        },
      });
      return true;
    }),
  newDisclosure: protectedProcedure
    .input(
      z.object({
        name: z.string().nonempty(),
        template: z.string().nonempty(),
        hosts: z.string().nonempty(),
        severity: z.nativeEnum(severity),
        references: z.string(),
        description: z.string().nonempty(),
      })
    )
    .mutation(async (opts) => {
      const { input } = opts;
      await prisma.disclosure.create({
        data: {
          name: input.name,
          hosts: input.hosts,
          template: input.template,
          status: disclosureStatus.started,
          ticketURL: '',
          description: input.description,
          severity: input.severity,
          references: input.references,
        },
      });
    }),
  getDisclosures: protectedProcedure.query(async (): Promise<Disclosure[]> => {
    return await prisma.disclosure.findMany();
  }),
  generateDisclosureTemplate: protectedProcedure
    .input(z.string())
    .mutation(async (opts): Promise<string> => {
      const { input } = opts;
      const foundDisclosure = await prisma.disclosure.findFirst({
        where: { id: input },
      });

      if (!foundDisclosure) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No such disclosure exists.',
        });
      }
      const b64Report = await TemplateGenerator.createTemplateFromDisclosure(
        foundDisclosure
      );
      return b64Report;
    }),
});
