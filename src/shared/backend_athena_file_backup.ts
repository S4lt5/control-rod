/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import path, { format } from 'path';
import { promises as fs } from 'fs';
import { AWSHelpers } from './aws_helpers';
import { type SlowFindingsStore } from './finding';
import { type Finding, severity } from '@prisma/client';

/*
Similar to AWS Store, but reads an athena CSV File backup for easy pull to offline database
*/
export class AthenaCSVFileStore implements SlowFindingsStore {
  async getFindings(): Promise<Finding[]> {
    try {
      console.debug('before slow fetch');
      const dataDirectory = path.join(process.cwd(), 'data');

      const data = await fs.readFile(dataDirectory + '/findings.csv', 'utf8');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      //convert csv into findings
      const records = AWSHelpers.ReadCSVFindings(data);

      // Format timestamp before returning records
      const formattedRecords = records.map((record) => {
        return {
          ...record,
          timestamp: record.timestamp,
        };
      });
      console.debug(records[0]?.timestamp);
      console.debug('after slow fetch');
      return formattedRecords;
    } catch (err) {
      return [
        {
          id: 'an-id',
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          name: `There was a problem reading the CSV findings data. ${err}`,
          description: '',
          references: '',
          severity: severity.info,
          tags: '',
          extractedResults: '',
          host: '',
          matchedAt: '',
          template: '',
          timestamp: new Date(),
          queryTimestamp: null,
          disclosureStatus: '',
        },
      ];
    }
  }
}
