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
import {
  AthenaClient,
  StartQueryExecutionCommand,
  GetQueryExecutionCommand,
  GetQueryExecutionCommandOutput,
} from '@aws-sdk/client-athena';

import { S3Client } from '@aws-sdk/client-s3';

const dataDirectory: string = path.join(process.cwd(), 'data');

//how long we will keep checking the query before giving up.
const MAX_ATHENA_RETRIES = 30;
const ATHENA_DELAY_MS = 200;

const athenaClient = new AthenaClient({ region: 'us-east-1' });
const s3Client = new S3Client({ region: 'us-east-1' });
/**
 * This finding store occasionally pulls fresh findings from Athena, and then caches them in a more accessible location
 */
export class AwsFindingStore implements FindingsStore {
  private async runAthenaQuery(
    client: AthenaClient,
    queryCommand: StartQueryExecutionCommand
  ) {
    //run query
    const { QueryExecutionId } = await client.send(queryCommand);

    //keep trying for 10 seconds, and then give up
    const checkCommand = new GetQueryExecutionCommand({
      QueryExecutionId: QueryExecutionId,
    });
    var queryStatus: GetQueryExecutionCommandOutput | null = null;
    let ranCount = 0;
    //retry up to MAX_ATHENA_RETRIES, for a total time of MAX_ATHENA_RETRIES * ATHENA_DELAY_MS + misc await time for the operations to complete
    for (let i = 0; i < MAX_ATHENA_RETRIES; i++) {
      ranCount++;
      queryStatus = await client.send(checkCommand);
      if (
        queryStatus.QueryExecution?.Status?.State == 'SUCCEEDED' ||
        queryStatus.QueryExecution?.Status?.State == 'FAILURE'
      ) {
        break; //query is done, we can stop waiting
      }
      //sleep ATHENA_DELAY_MS
      await new Promise((resolve) => setTimeout(resolve, ATHENA_DELAY_MS));
    }

    //Return a failure if it is anything but successful
    if (queryStatus?.QueryExecution?.Status?.State != 'SUCCEEDED') {
      throw new Error(
        `The Athena query had a status of ${queryStatus?.QueryExecution?.Status?.State} `
      );
    }
    //get the s3 location
    const s3Location =
      queryStatus?.QueryExecution?.ResultConfiguration?.OutputLocation || '';

    //sanity check
    if (!s3Location.endsWith('csv') || !s3Location.startsWith('s3://')) {
      throw new Error(
        `The athena result location was NOT a csv file, or was not a S3 URL [${s3Location}]`
      );
    }

    const s3Params = {
      Bucket: s3Location.split('/')[2],
      Key: s3Location.split('/').slice(3).join('/'),
    };

    throw new Error(s3Location);
  }
  async getFindings(): Promise<finding[]> {
    try {
      const command = new StartQueryExecutionCommand({
        QueryString: 'select * from nuclei_db.findings_db;',

        ResultConfiguration: {
          OutputLocation: 's3://cisa-pond-test-5-artifacts/query-output/',
        },
      });

      //wait for result
      const results = await this.runAthenaQuery(athenaClient, command);
      return [];
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
