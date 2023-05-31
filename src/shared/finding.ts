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
  started,
  disclosed,
  regression,
  uncertain, // the finding MIGHT be exploitable, but it has not been demonstrated
  remediated,
  invalid, // the finding was proven to not be exploitable or otherwise a false positive
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
  name: string; //the name of the finding
  hosts: string[];
  template: string;
  timestamp: string;
  status: disclosureStatus;
  ticketURL: string;
  history: disclosureHistory[];
  expanded: boolean; // in UI, if it is the currently expanded element
  description: string;
  severity: severity;
  references: string[];

  constructor(
    name: string,
    hosts: string[],
    template: string,
    status: disclosureStatus,
    ticketURL: string,
    description: string,
    severity: severity,
    references: string[]
  ) {
    this.id = uuidv4();
    this.name = name;

    this.hosts = hosts;
    this.timestamp = new Date().toISOString();
    this.template = template;
    this.status = status;
    this.ticketURL = ticketURL;
    this.history = new Array<disclosureHistory>();
    this.description = description;
    this.severity = severity;
    this.references = references;
    this.expanded = false;
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
/**
 * Filter function for client-side UI finding search
 * @param query
 * @returns
 */
function createFindingFilterFn<T extends finding>(query: string) {
  const filterFn = (f: finding) => {
    const lowerQuery = query.toLowerCase();
    return (
      //inexplicably, one of the findings had no description, so check for all params before doing string compares
      (f.name && f.name.toLowerCase().includes(lowerQuery)) ||
      (f.host && f.host.includes(lowerQuery)) ||
      (f.severity && severity[f.severity].toLowerCase().includes(lowerQuery)) ||
      (f.description && f.description.toLowerCase().includes(lowerQuery)) ||
      (f.template && f.template.includes(lowerQuery)) ||
      (f.disclosure?.status.toString().toLowerCase() ?? 'not started').includes(
        lowerQuery
      )
    );
  };
  return filterFn;
}

interface DisclosureStore {
  getDisclosures(): Promise<disclosure[]>;
  addDisclosure(newDisclosure: disclosure): Promise<boolean>;
}

interface FindingsStore {
  getFindings(): Promise<finding[]>;
}

export {
  severity,
  finding,
  disclosure,
  disclosureStatus,
  disclosureHistory,
  createFindingFilterFn,
  type FindingsStore,
  type DisclosureStore,
};
