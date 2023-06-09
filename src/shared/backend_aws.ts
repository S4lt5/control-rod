/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import path from 'path';
import { promises as fs } from 'fs';
import {
  disclosure,
  disclosureStatus,
  finding,
  type nestedFinding,
  type DisclosureStore,
  type FindingsStore,
  severity,
} from './finding';
import { TRPCError } from '@trpc/server';
import { TemplateGenerator } from './disclosure_template_generator';
import { AWSHelpers } from './aws_helpers';

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { StartQueryExecutionCommand } from '@aws-sdk/client-athena';

const dataDirectory: string = path.join(process.cwd(), 'data');

/**
 * This finding store occasionally pulls fresh findings from Athena, and then caches them in a more accessible location
 */

/*export interface findingInfo {
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
*/
export class AwsFindingStore implements FindingsStore {
  async getFindings(): Promise<finding[]> {
    try {
      const command = new StartQueryExecutionCommand({
        QueryString:
          'select "extracted-results", host, "matched-at", template, timestamp, info.description as description, info.name as name, info.severity as severity, info.tags as tags, info.reference as reference from nuclei_db.findings_db;',

        ResultConfiguration: {
          OutputLocation: 's3://cisa-pond-test-5-artifacts/query-output/',
        },
      });

      //wait for result, get raw csv
      const resultsBody = await AWSHelpers.runAthenaQuery(command);
      //convert csv into findings
      const records = AWSHelpers.ReadCSVFindings(resultsBody);
      //read body as CSV
      return records;
      const dataDirectory = path.join(process.cwd(), 'data');

      const data = await fs.readFile(dataDirectory + '/findings.json', 'utf8');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const nested_findings: nestedFinding[] = JSON.parse(data);
      const flat_findings: finding[] = nested_findings.map(
        (f) => new finding(f)
      );
      console.log(flat_findings);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return flat_findings;
    } catch (err) {
      return [
        {
          id: 'an-id',
          name: 'There was a problem reading the findings data.' + err,
          description: '',
          reference: [],
          severity: severity.info,
          tags: [],
          extractedResults: '',
          host: '',
          matchedAt: '',
          template: '',
          timestamp: '',
          expanded: false,
          disclosure: undefined,
        },
      ];
    }
  }
}

export class FileDisclosureStore implements DisclosureStore {
  async updateDisclosureStatus(
    id: string,
    status: disclosureStatus
  ): Promise<boolean> {
    try {
      let allDisclosures = await this.getDisclosures();
      const foundDisclosure = allDisclosures.find((d) => d.id === id);

      if (!foundDisclosure) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No such disclosure exists.',
        });
      }

      //delete the disclosure if I'm marking it deleted
      if (status == disclosureStatus.deleted) {
        allDisclosures = allDisclosures.filter(
          (d) => d.id != foundDisclosure.id
        );
      } else {
        foundDisclosure.status = status;
      }

      await fs.writeFile(
        dataDirectory + '/disclosures.json',
        JSON.stringify(allDisclosures)
      );
      return true;
    } catch {
      return false;
    }
  }

  async getDisclosureTemplate(id: string): Promise<string> {
    const foundDisclosure = (await this.getDisclosures()).find(
      (d) => d.id === id
    );

    if (!foundDisclosure) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'No such disclosure exists.',
      });
    }
    const b64Report = await TemplateGenerator.createTemplateFromDisclosure(
      foundDisclosure
    );
    return b64Report;
  }
  async getDisclosures(): Promise<disclosure[]> {
    try {
      const data = await fs.readFile(
        dataDirectory + '/disclosures.json',
        'utf8'
      );

      const disclosures: disclosure[] = JSON.parse(data);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return disclosures;
    } catch {
      return [
        new disclosure(
          'some finding',
          new Array<string>('some host'),
          'not-a-real-template',
          disclosureStatus.disclosed,
          'https://www.google.com',
          '',
          severity.info,
          new Array<string>()
        ),
      ];
    }
  }
  async addDisclosure(newDisclosure: disclosure): Promise<boolean> {
    try {
      const disclosures = await this.getDisclosures();

      disclosures.push(newDisclosure);
      await fs.writeFile(
        dataDirectory + '/disclosures.json',
        JSON.stringify(disclosures)
      );
      return true;
    } catch {
      return false;
    }
  }
}
