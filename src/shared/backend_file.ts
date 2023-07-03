/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import path from 'path';
import { promises as fs } from 'fs';
import {
  type nestedFinding,
  SlowFindingsStore,
  ConvertNestedFindingToFinding,
} from './finding';
import { TRPCError } from '@trpc/server';
import { TemplateGenerator } from './disclosure_template_generator';
import { Finding, severity } from '@prisma/client';

const dataDirectory: string = path.join(process.cwd(), 'data');

export class FileFindingsStore implements SlowFindingsStore {
  async getFindings(): Promise<Finding[]> {
    try {
      const dataDirectory = path.join(process.cwd(), 'data');

      const data = await fs.readFile(dataDirectory + '/findings.json', 'utf8');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const nested_findings: nestedFinding[] = JSON.parse(data);
      const flat_findings: Finding[] = nested_findings.map((f) =>
        ConvertNestedFindingToFinding(f)
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return flat_findings;
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
