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
  constructor(finding: nestedFinding) {
    this.extractedResults = finding.extractedResults;
    this.host = finding.host;
    this.matchedAt = finding.matchedAt;
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
  }
}

export { severity, finding };
