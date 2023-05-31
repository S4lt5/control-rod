import path from 'path';
import { promises as fs } from 'fs';
import {
  disclosure,
  disclosureStatus,
  severity,
  disclosureHistory,
} from '~/shared/finding';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import {
  readDisclosuresFromFS,
  writeDisclosureToFS,
} from '~/shared/backend_file';

export const disclosuresRouter = createTRPCRouter({
  newDisclosure: protectedProcedure
    .input(
      z.object({
        name: z.string().nonempty(),
        template: z.string().nonempty(),
        hosts: z.string().nonempty().array(),
        severity: z.nativeEnum(severity),
        references: z.string().nonempty().array(),
        description: z.string().nonempty(),
      })
    )
    .mutation(async (opts) => {
      const { input } = opts;
      const newDisclosure = new disclosure(
        input.name,
        input.hosts,
        input.template,
        disclosureStatus.started,
        '',
        input.description,
        input.severity,
        input.references
      );
      return await writeDisclosureToFS(newDisclosure);
    }),
  getDisclosures: protectedProcedure.query(async (): Promise<disclosure[]> => {
    return await readDisclosuresFromFS();
  }),
});
