import path from 'path';
import { promises as fs } from 'fs';
import { disclosure, disclosureStatus, severity } from '~/shared/finding';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';

export const disclosuresRouter = createTRPCRouter({
  getDisclosures: protectedProcedure.query(async (): Promise<disclosure[]> => {
    try {
      const dataDirectory = path.join(process.cwd(), 'data');
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
          'some host',
          'not-a-real-template',
          disclosureStatus.disclosed,
          'https://www.google.com',
          'https://www.google.com/vulnhere',
          {
            template: '',
            description: '',
            severity: severity.info,
            references: [],
          }
        ),
      ];
    }
  }),
});
