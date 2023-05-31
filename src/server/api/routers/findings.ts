import { type finding, severity } from '~/shared/finding';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { FileFindingsStore, FileDisclosureStore } from '~/shared/backend_file';
export const severityEnum = severity;

const fileStore = new FileFindingsStore();
const disclosureStore = new FileDisclosureStore();

export const findingsRouter = createTRPCRouter({
  getFindings: protectedProcedure.query(async (): Promise<finding[]> => {
    const findings = await fileStore.getFindings();
    const disclosures = await disclosureStore.getDisclosures();

    console.log('What is going on?');
    console.log(disclosures.length);
    for (const f of findings) {
      //find a disclosure with the same name, and a matching host
      f.disclosure = disclosures.find(
        (d) => d.name === f.name && d.hosts.some((h) => h == f.host)
      );
    }
    return findings;
  }),
});
