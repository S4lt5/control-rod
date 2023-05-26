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

const dataDirectory = path.join(process.cwd(), 'data');
export const disclosuresRouter = createTRPCRouter({
  newDisclosure: protectedProcedure
    .input(
      z.object({
        name: z.string().nonempty(),
        template: z.string().nonempty(),
        matchedAt: z.string().nonempty(),
        hosts: z.string().nonempty().array().nonempty(),
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

      const data = await fs.readFile(
        dataDirectory + '/disclosures.json',
        'utf8'
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const disclosures: disclosure[] = JSON.parse(data);
      disclosures.push(newDisclosure);
      await fs.writeFile(
        dataDirectory + '/disclosures.json',
        JSON.stringify(disclosures)
      );
    }),
  getDisclosures: protectedProcedure.query(async (): Promise<disclosure[]> => {
    try {
      const data = await fs.readFile(
        dataDirectory + '/disclosures.json',
        'utf8'
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const disclosures: disclosure[] = JSON.parse(data);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return disclosures;
    } catch {
      return [
        new disclosure(
          'some finding',
          new Array<string>('some host'),
          'not-a-real-template',
          disclosureStatus.disclosed,
          'https://www.google.com',
          '',
          severity.info,
          new Array<string>()
        ),
      ];
    }
  }),
});
