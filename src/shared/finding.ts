import { match } from 'assert';
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

enum disclosureStatus {
  disclosed,
  remediated,
  invalid, // the finding was proven to not be exploitable or otherwise a false positive
  uncertain, // the finding MIGHT be exploitable, but it has not been demonstrated
  regression,
}
/**
 * A disclosure history is a list of previous status and the time they were recorded.
 */
class disclosureHistory {
  timestamp: string;
  status: disclosureStatus;

  constructor(timestamp: string, status: disclosureStatus) {
    this.timestamp = timestamp;
    this.status = status;
  }
}

/**
 * A disclosure is a notification or ticket created to deal with a particular finding
 */

class disclosure {
  id: string;
  hosts: string[];
  template: string;
  timestamp: string;
  status: disclosureStatus;
  ticketURL: string;
  history: disclosureHistory[];
  matchedAt: string; //the specific URL where the finding was observed
  constructor(
    host: string,
    template: string,
    status: disclosureStatus,
    ticketURL: string,
    matchedAt: string
  ) {
    this.id = uuidv4();
    this.hosts = new Array<string>(host);
    this.timestamp = new Date().toISOString();
    this.template = template;
    this.status = status;
    this.ticketURL = ticketURL;
    this.matchedAt = matchedAt;
    this.history = new Array<disclosureHistory>();
  }
}

/**
 * Rehydrated finding from reading multiple sources, contains finding data formatted for our needs, and related disclosures
 */
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
  disclosure: disclosure | undefined; //disclosure can be missing

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
    this.disclosure = undefined;
  }
}

export { severity, finding, disclosure, disclosureStatus };
