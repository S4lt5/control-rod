import {
  AthenaClient,
  type StartQueryExecutionCommand,
  GetQueryExecutionCommand,
  type GetQueryExecutionCommandOutput,
} from '@aws-sdk/client-athena';
import { parse } from 'csv-parse/sync';

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Finding } from '@prisma/client';

//how long we will keep checking the query before giving up.
const MAX_ATHENA_RETRIES = 100;
const ATHENA_DELAY_MS = 200;

const athenaClient = new AthenaClient({ region: 'us-east-1' });
const s3Client = new S3Client({ region: 'us-east-1' });

export class AWSHelpers {
  public static ReadCSVFindings(csvBody: string): Finding[] {
    const records = parse(csvBody, {
      delimiter: ',',
      columns: true,
    });

    const findings_array: Finding[] = records.map((r: { [x: string]: any }) => {
      return {
        extractedResults: r['extracted-results'] ?? '',
        host: r['host'],
        description: r['description'],
        name: r['name'],
        severity: r['severity'],
        //forgive me my hacky sins -MG. convert 'almost json' to array of strings. Get rid of [] and split non-quoted elements into an array
        tags:
          r['tags'].replace('[', '').replace(']', '').replace(',', '\n') ?? '',
        references:
          r['reference'].replace('[', '').replace(']', '').replace(',', '\n') ??
          '',
        matchedAt: r['matchedAt'],
        template: r['template'],
        timestamp: r['timestamp'] ?? '',
      };
    });
    return findings_array;
  }
  public static async runAthenaQuery(queryCommand: StartQueryExecutionCommand) {
    //run query
    const { QueryExecutionId } = await athenaClient.send(queryCommand);

    //keep trying for 10 seconds, and then give up
    const checkCommand = new GetQueryExecutionCommand({
      QueryExecutionId: QueryExecutionId,
    });
    let queryStatus: GetQueryExecutionCommandOutput | null = null;
    //retry up to MAX_ATHENA_RETRIES, for a total time of MAX_ATHENA_RETRIES * ATHENA_DELAY_MS + misc await time for the operations to complete
    for (let i = 0; i < MAX_ATHENA_RETRIES; i++) {
      queryStatus = await athenaClient.send(checkCommand);
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
        `The Athena query had a status of ${
          queryStatus?.QueryExecution?.Status?.State ?? 'Undefined'
        } - ${
          queryStatus?.QueryExecution?.Status?.AthenaError?.ErrorMessage ??
          'Undefined'
        } `
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

    const getObjectCommand = new GetObjectCommand({
      Bucket: s3Location.split('/')[2],
      Key: s3Location.split('/').slice(3).join('/'),
    });
    //response object from s3 getObject
    const s3Response = await s3Client.send(getObjectCommand);
    //body text
    const body = await s3Response.Body?.transformToString();

    if (!body) {
      throw new Error('Got no query response body back.');
    }
    return body;
  }
}
