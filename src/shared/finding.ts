import {
  Disclosure,
  Finding,
  disclosureStatus,
  severity,
} from '@prisma/client';
import { match } from 'assert';
import { v4 as uuidv4 } from 'uuid';

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

function ConvertNestedFindingToFinding(finding: nestedFinding) {
  const f: Finding = {
    id: uuidv4(),
    extractedResults: finding.extractedResults,
    host: finding.host,
    matchedAt: finding['matched-at'],
    template: finding.template,
    timestamp: finding.timestamp,
    name: finding.info.name,
    //we're saying that the string is a key of severity, and should work
    severity: severity[finding.info.severity as keyof typeof severity],
    description: finding.info.description,
    tags: finding.info.tags.join('\n'),
    references: finding.info.reference.join('\n'),
    queryTimestamp: null,
  };
  return f;
}
/**
 * Rehydrated finding from reading multiple sources, contains finding data formatted for our needs, and related disclosures
 */
class findingWithExtras {
  finding: Finding;
  expanded: boolean;
  disclosure: Disclosure | undefined; //disclosure can be missing
  constructor(finding: Finding) {
    this.finding = finding;
    this.expanded = false;
    this.disclosure = undefined;
  }
}
/**
 * Filter function for client-side UI finding search
 * @param query
 * @returns
 */

function createFindingFilterFn<T extends Finding>(query: string) {
  const filterFn = (f: FindingWithExtras) => {
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

//slow findings store, e.g file based or AWS Athena or some other "long poll" source
interface SlowFindingsStore {
  getFindings(): Promise<Finding[]>;
}

export {
  type SlowFindingsStore,
  findingWithExtras,
  ConvertNestedFindingToFinding,
  createFindingFilterFn,
};
