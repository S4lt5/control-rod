/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import path from 'path';
import { promises as fs } from 'fs';
import { TRPCError } from '@trpc/server';
import { TemplateGenerator } from './disclosure_template_generator';
import { AWSHelpers } from './aws_helpers';
import { SlowFindingsStore } from './finding';
import { Finding, severity } from '@prisma/client';

const dataDirectory: string = path.join(process.cwd(), 'data');
/*
Similar to AWS Store, but reads an athena CSV File backup for easy pull to offline database
*/
export class AthenaCSVFileStore implements SlowFindingsStore {
  async getFindings(): Promise<Finding[]> {
    try {
      const dataDirectory = path.join(process.cwd(), 'data');

      const data = await fs.readFile(dataDirectory + '/findings.csv', 'utf8');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      //convert csv into findings
      const records = AWSHelpers.ReadCSVFindings(data);
      return records;
    } catch {
      return [
        {
          id: 'an-id',
          name: 'There was a problem reading the findings data.',
          description: '',
          references: '',
          severity: severity.info,
          tags: '',
          extractedResults: '',
          host: '',
          matchedAt: '',
          template: '',
          timestamp: '',
          queryTimestamp: null,
        },
      ];
    }
  }
}
