import { v4 as uuidv4 } from 'uuid';

enum severity {
  critical = 4,
  high = 3,
  medium = 2,
  low = 1,
  info = 0,
}
export interface findingInfo {
  description: string;
  name: string;
  severity: string;
  tags: string[];
  reference: string[];
}

export interface nestedFinding {
  extractedResults: string;
  host: string;
  info: findingInfo; // this exists in the source JSON
  'matched-at': string;
  template: string;
  timestamp: string;
}

class finding {
  id: string;
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
  //If true, the finding is open in the UI for detail view
  expanded: boolean;

  /**
   * Convert a nested finding into an equivalent (flat) finding
   * @param finding The source nested finding
   */
  constructor(finding: nestedFinding) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    this.id = uuidv4();
    this.extractedResults = finding.extractedResults;
    this.host = finding.host;

    this.matchedAt = finding['matched-at'];
    this.template = finding.template;
    this.timestamp = finding.timestamp;
    this.name = finding.info.name;
    //Hacky but I think typescript
    if (finding.info.severity == 'critical') {
      this.severity = severity.critical;
    } else if (finding.info.severity == 'high') {
      this.severity = severity.high;
    }
    //we're saying that the string is a key of severity, and should work
    this.severity = severity[finding.info.severity as keyof typeof severity];
    this.description = finding.info.description;
    this.tags = finding.info.tags;
    this.reference = finding.info.reference;
    this.expanded = false;
  }
}

export { severity, finding };
