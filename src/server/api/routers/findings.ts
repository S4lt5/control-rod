import {
  type finding,
  severity,
  type FindingsStore,
  type FindingsCache,
  type DisclosureStore,
  createFindingFilterFn,
} from '~/shared/finding';
import { createCompareFn } from '~/shared/helpers';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { FileFindingsStore, FileDisclosureStore } from '~/shared/backend_file';
import { AwsFindingStore } from '~/shared/backend_aws';
import { MemoryFindingCache } from '~/shared/cache_memory';
import { AthenaCSVFileStore } from '~/shared/backend_athena_file_backup';
import { z } from 'zod';
export const severityEnum = severity;

//const fileStore = new AwsFindingStore();

//If fastFindingsStore exists, we will long-poll from fileStore, and then save things back into fastFindingStore.
//We'll check each time we pull from fastFindingStore to see if the data is stale, and if so we'll update it in place

let fastFindingsCache: FindingsCache;
let slowFindingsStore: FindingsStore;
let disclosureStore: DisclosureStore;
if (process.env.USE_AWS_DATA_SOURCES == 'true') {
  //TODO: the 'fast' store will be aurora or sqlite in cloud config
  fastFindingsCache = new MemoryFindingCache();

  slowFindingsStore = new AwsFindingStore();
  disclosureStore = new FileDisclosureStore();
} else if (process.env.USE_LOCAL_ATEHNA_CSV_SOURCE == 'true') {
  //we're using a local findings.csv export from athena
  slowFindingsStore = new AthenaCSVFileStore();
  disclosureStore = new FileDisclosureStore();
} else {
  //We're running in dev mode, or standalone
  slowFindingsStore = new FileFindingsStore();
  disclosureStore = new FileDisclosureStore();
}
const FINDING_CACHE_MILLISECONDS = 30 * 60 * 1000; //how many seconds should we hold on to "fast" cache, default 60 minutes

export const findingsRouter = createTRPCRouter({
  getFindings: protectedProcedure
    .input(z.object({ search: z.string().nullish() }).nullish())
    .query(async (opts): Promise<finding[]> => {
      let findings: finding[] = [];

      //If we have fast storage available (file or RDBMS or something like redis I guess)
      if (fastFindingsCache) {
        const fastFindings: finding[] = await fastFindingsCache.getFindings();

        const thirtyMinutesAgo = Date.now() - FINDING_CACHE_MILLISECONDS;
        //check if we got anything back -- if we didn't let's long poll just in case

        // to clarify below:
        //  if I dont have findings
        //  or my length is 0
        //  or my I'm missing cache timestamp
        //  or my cache is stale
        //  then I need to invalidate the cache
        if (
          !fastFindings ||
          !fastFindings[0]?.queryTimestamp ||
          fastFindings[0]?.queryTimestamp < thirtyMinutesAgo
        ) {
          //fetch long cache, update the query time to show that it was just fetched.
          //sort by severity, proactively
          const rightNow = Date.now();
          findings = (await slowFindingsStore.getFindings()).sort(
            createCompareFn('severity', 'desc')
          );
          findings.forEach((f) => (f.queryTimestamp = rightNow));

          //store into fast storage
          await fastFindingsCache.putFindings(findings);
        } else {
          //I have fastfindings, its not stale, use it and move on!
          findings = fastFindings;
        }
      }
      //otherwise, we have no fast store, just pull from the long store
      else {
        findings = (await slowFindingsStore.getFindings()).sort(
          createCompareFn('severity', 'desc')
        );
      }

      //perform filter before returning to client, if one was provided
      if (opts && opts.input && opts.input.search) {
        findings = findings.filter(createFindingFilterFn(opts.input.search));
      }

      const disclosures = await disclosureStore.getDisclosures();

      for (const f of findings) {
        //find a disclosure with the same name, and a matching host
        f.disclosure = disclosures.find(
          (d) => d.name === f.name && d.hosts.some((h) => h == f.host)
        );
      }
      return findings;
    }),
});
