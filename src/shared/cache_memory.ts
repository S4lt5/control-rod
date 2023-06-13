/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import path from 'path';
import { promises as fs } from 'fs';
import {
  disclosure,
  disclosureStatus,
  type finding,
  type DisclosureStore,
  type FindingsCache,
  severity,
} from './finding';
import { TRPCError } from '@trpc/server';
import { TemplateGenerator } from './disclosure_template_generator';

const dataDirectory: string = path.join(process.cwd(), 'data');

//A "fast" store mostly used to test fast/slow caching when not connected to athena
export class MemoryFindingCache implements FindingsCache {
  static findings: finding[] = new Array<finding>();
  async getFindings(): Promise<finding[]> {
    try {
      //create a copy of findings and return it
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      //Hack: i need to await something, so I'll await nothing here
      await Promise.resolve();
      return MemoryFindingCache.findings.map((e) => ({ ...e }));
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
          queryTimestamp: undefined,
        },
      ];
    }
  }
  async putFindings(findings: finding[]): Promise<boolean> {
    console.debug('Entering putfindings');
    //copy the inbound array and store it
    MemoryFindingCache.findings = findings.map((e) => ({
      ...e,
    }));
    console.debug('I copied the array');
    //Hack: i need to await something, so I'll await nothing here
    await Promise.resolve();
    console.debug('I returned');
    return true;
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
