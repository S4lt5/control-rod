import path from 'path';
import { promises as fs } from 'fs';
import { finding, severity, type nestedFinding } from '~/shared/finding';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { disclosuresRouter } from './disclosures';
import {
  readFindingsFromFS,
  readDisclosuresFromFS,
} from '~/shared/backend_file';
export const severityEnum = severity;

export const findingsRouter = createTRPCRouter({
  getFindings: protectedProcedure.query(async (): Promise<finding[]> => {
    const findings = await readFindingsFromFS();
    const disclosures = await readDisclosuresFromFS();

    console.log('What is going on?');
    console.log(disclosures.length);
    for (const f of findings) {
      //find a disclosure with the same name, and a matching host
      f.disclosure = disclosures.find(
        (d) => d.name === f.name && d.hosts.some((h) => h == f.host)
      );

      if (f.disclosure) {
        console.log('result', f.disclosure);
      }
    }
    return findings;
  }),
});
