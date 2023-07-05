import { promises as fs } from 'fs';
import path from 'path';

import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { type Disclosure } from '@prisma/client';
const templateDirectory: string = path.join(process.cwd(), 'artifacts');

export class TemplateGenerator {
  static async createTemplateFromDisclosure(d: Disclosure) {
    const content = await fs.readFile(
      templateDirectory + '/disclosure_template.docx',
      'binary'
    );
    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip);
    doc.render({
      disclosure_title: d.name,
      severity: d.severity,
      date: new Date().toLocaleDateString('en-US'),
      description: d.description,
      host: d.hosts,
      references: d.references,
    });

    const buf = doc.getZip().generate({
      type: 'base64',
    });

    //Return base64 string of zip
    return buf;
  }
}
