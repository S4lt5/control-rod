import path from 'path';
import { promises as fs } from 'fs';

import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';

interface finding_info {
  description: string;
  name: string;
  severity: string;
  tags: string[];
  reference: string[];
}

interface finding {
  extractedResults: string;
  host: string;
  info: finding_info;

  matchedAt: string;
  template: string;
  timestamp: string;
}

export const findingsRouter = createTRPCRouter({
  getFindings: protectedProcedure.query(async (): Promise<finding[]> => {
    try {
      const dataDirectory = path.join(process.cwd(), 'data');
      const data = await fs.readFile(dataDirectory + '/findings.json', 'utf8');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const findings = JSON.parse(data);
      console.log(findings);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return findings;
    } catch {
      return [
        {
          info: {
            name: 'There was a problem reading the findings data.',
            description: '',
            reference: [],
            severity: '',
            tags: [],
          },
          extractedResults: '',
          host: '',

          matchedAt: '',
          template: '',
          timestamp: '',
        },
      ];
    }
  }),
});
