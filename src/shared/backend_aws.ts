/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { AWSHelpers } from './aws_helpers';
import { StartQueryExecutionCommand } from '@aws-sdk/client-athena';
import { Finding, severity } from '@prisma/client';
import { SlowFindingsStore } from './finding';

const awsBucketName = process.env.AWS_BUCKET_NAME ?? '';

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
export class AwsFindingStore implements SlowFindingsStore {
  async getFindings(): Promise<Finding[]> {
    try {
      const command = new StartQueryExecutionCommand({
        //Group by host and name, and then left join for the other details
        //ignore the mountain of "Weak Cipher Suites..." findings
        QueryString:
          "select ARBITRARY(\"extracted-results\"), host, ARBITRARY(\"matched-at\") as matchedAt, template, MAX(timestamp) \
           , ARBITRARY(info.tags) as tags  \
           , ARBITRARY(info.reference) as reference \
           , ARBITRARY(info.description) as description \
          , ARBITRARY(info.name) as name \
          , ARBITRARY(info.severity) as severity \
           from nuclei_db.findings_db \
           WHERE info.name != 'Weak Cipher Suites Detection' \
           AND template not like 'dns/%' \
           AND template not like 'ssl/%' \
           AND template != 'http/technologies/waf-detect.yaml' \
           AND template != 'http/fuzzing/waf-fuzz.yaml' \
        GROUP BY (host,template)",

        ResultConfiguration: {
          OutputLocation: `s3://${awsBucketName}/query-output/`,
        },
      });

      //wait for result, get raw csv
      const resultsBody = await AWSHelpers.runAthenaQuery(command);
      //convert csv into findings
      const records = AWSHelpers.ReadCSVFindings(resultsBody);
      //read body as CSV
      return records;
    } catch (err) {
      return [
        {
          id: 'an-id',
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          name: `There was a problem reading the Athena findings data. ${err}`,
          description: '',
          references: '',
          severity: severity.info,
          tags: '',
          extractedResults: '',
          host: '',
          matchedAt: '',
          template: '',
          timestamp: '',
          queryTimestamp: new Date(),
          disclosureStatus: '',
        },
      ];
    }
  }
}
