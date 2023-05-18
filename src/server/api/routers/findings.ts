import path from 'path';
import { promises as fs } from 'fs';
import { finding, severity, type nestedFinding } from '~/shared/finding';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';

export const severityEnum = severity;

export const findingsRouter = createTRPCRouter({
  getFindings: protectedProcedure.query(async (): Promise<finding[]> => {
    try {
      const dataDirectory = path.join(process.cwd(), 'data');
      const data = await fs.readFile(dataDirectory + '/findings.json', 'utf8');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const nested_findings: nestedFinding[] = JSON.parse(data);
      const flat_findings: finding[] = nested_findings.map(
        (f) => new finding(f)
      );
      console.log(flat_findings);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return flat_findings;
    } catch {
      return [
        {
          name: 'There was a problem reading the findings data.',
          description: '',
          reference: [],
          severity: severity.info,
          tags: [],
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
