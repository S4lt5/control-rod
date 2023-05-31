/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import path from 'path';
import { promises as fs } from 'fs';
import {
  disclosure,
  disclosureStatus,
  finding,
  nestedFinding,
  severity,
} from './finding';

const dataDirectory: string = path.join(process.cwd(), 'data');

export const readDisclosuresFromFS = async (): Promise<disclosure[]> => {
  try {
    const data = await fs.readFile(dataDirectory + '/disclosures.json', 'utf8');

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
};

export const writeDisclosureToFS = async (
  newDisclosure: disclosure
): Promise<boolean> => {
  try {
    const disclosures = await readDisclosuresFromFS();

    disclosures.push(newDisclosure);
    await fs.writeFile(
      dataDirectory + '/disclosures.json',
      JSON.stringify(disclosures)
    );
    return true;
  } catch {
    return false;
  }
};

export const readFindingsFromFS = async (): Promise<finding[]> => {
  try {
    const dataDirectory = path.join(process.cwd(), 'data');

    const data = await fs.readFile(dataDirectory + '/findings.json', 'utf8');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const nested_findings: nestedFinding[] = JSON.parse(data);
    const flat_findings: finding[] = nested_findings.map((f) => new finding(f));
    console.log(flat_findings);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return flat_findings;
  } catch {
    return [
      {
        id: 'an-id',
        name: 'There was a problem reading the findings data.',
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
};
