import path from 'path';
import { promises as fs } from 'fs';

import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';

enum severity {
  critical,
  high,
  medium,
  low,
  info,
}
interface finding_info {
  description: string;
  name: string;
  severity: severity;
  tags: string[];
  reference: string[];
}

interface nested_finding {
  extractedResults: string;
  host: string;
  info: finding_info; // this exists in the source JSON
  matchedAt: string;
  template: string;
  timestamp: string;
}

class finding {
  extractedResults: string;
  host: string;
  matchedAt: string;
  template: string;
  timestamp: string;
  description: string;
  name: string;
  severity: severity;
  tags: string[];
  reference: string[];

  /**
   * Convert a nested finding into an equivalent (flat) finding
   * @param finding The source nested finding
   */
  constructor(finding: nested_finding) {
    this.extractedResults = finding.extractedResults;
    this.host = finding.host;
    this.matchedAt = finding.matchedAt;
    this.template = finding.template;
    this.timestamp = finding.timestamp;
    this.name = finding.info.name;
    this.severity = finding.info.severity;
    this.description = finding.info.description;
    this.tags = finding.info.tags;
    this.reference = finding.info.reference;
  }
}

export const findingsRouter = createTRPCRouter({
  getFindings: protectedProcedure.query(async (): Promise<finding[]> => {
    try {
      const dataDirectory = path.join(process.cwd(), 'data');
      const data = await fs.readFile(dataDirectory + '/findings.json', 'utf8');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const nested_findings: nested_finding[] = JSON.parse(data);
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
