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
    return await readFindingsFromFS();
  }),
});
