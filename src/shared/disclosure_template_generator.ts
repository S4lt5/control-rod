import { promises as fs } from 'fs';
import path from 'path';
import { disclosure, severity } from './finding';

import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
const templateDirectory: string = path.join(process.cwd(), 'artifacts');

export class TemplateGenerator {
  static async createTemplateFromDisclosure(d: disclosure) {
    const content = await fs.readFile(
      templateDirectory + '/disclosure_template.docx',
      'binary'
    );
    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip);
    doc.render({
      disclosure_title: d.name,
      severity: severity[d.severity],
      date: new Date().toLocaleDateString('en-US'),
      description: d.description,
      host: d.hosts.join('\n'),
      references: d.references.join('\n'),
    });

    const buf = doc.getZip().generate({
      type: 'base64',
    });

    //Return base64 string of zip
    return buf;
  }
}
