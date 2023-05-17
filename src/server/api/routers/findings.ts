import path from 'path';
import { promises as fs } from 'fs';

import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';

export const findingsRouter = createTRPCRouter({
  getFindings: protectedProcedure.query(async () => {
    try {
      const dataDirectory = path.join(process.cwd(), 'data');
      const data = await fs.readFile(dataDirectory + '/data.json', 'utf8');
      return [data];
    } catch {
      return [
        { finding: 'There was a problem reading the findings data.' },
        { finding: 'There was a problem reading the findings data.' },
      ];
    }
  }),
});
