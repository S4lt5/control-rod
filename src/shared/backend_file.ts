/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import path from 'path';
import { promises as fs } from 'fs';
import {
  type nestedFinding,
  type SlowFindingsStore,
  ConvertNestedFindingToFinding,
} from './finding';
import { type Finding, severity } from '@prisma/client';

export class FileFindingsStore implements SlowFindingsStore {
  async getFindings(): Promise<Finding[]> {
    try {
      const dataDirectory = path.join(process.cwd(), 'data');

      const data = await fs.readFile(dataDirectory + '/findings.json', 'utf8');

      // console.log('JSON Data:', data);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const nested_findings: nestedFinding[] = JSON.parse(data);
      const flat_findings: Finding[] = nested_findings.map((f) =>
        ConvertNestedFindingToFinding(f)
      );

      // Format timestamp before returning findings
      const formattedFindings = flat_findings.map((flat_finding) => {
        return {
          ...flat_finding,
          timestamp: new Date(flat_finding.timestamp).toISOString(),
        };
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return

      return formattedFindings;
    } catch (err) {
      return [
        {
          id: 'an-id',
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          name: `There was a problem reading the JSON findings data. ${err} `,
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
          disclosureStatus: '',
        },
      ];
    }
  }
}
