import { type finding, severity, type disclosure } from '~/shared/finding';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { FileFindingsStore, FileDisclosureStore } from '~/shared/backend_file';
import { AwsFindingStore } from '~/shared/backend_aws';
export const severityEnum = severity;

//const fileStore = new AwsFindingStore();

//If fastFindingsStore exists, we will long-poll from fileStore, and then save things back into fastFindingStore.
//We'll check each time we pull from fastFindingStore to see if the data is stale, and if so we'll update it in place
const fastFindingsStore = null;

//TODO: Come up with a good way to pick store configs, and not in this hard coded manner
const fileStore = new FileFindingsStore();
const disclosureStore = new FileDisclosureStore();
const FINDING_CACHE_MILLISECONDS = 30 * 60 * 1000; //how many seconds should we hold on to "fast" cache, default 60 minutes

export const findingsRouter = createTRPCRouter({
  getFindings: protectedProcedure.query(async (): Promise<finding[]> => {
    let findings: finding[] = [];

    //If we have fast storage available (file or RDBMS or something like redis I guess)
    if (fastFindingsStore) {
      const fastFindings = await fileStore.getFindings();

      const thirtyMinutesAgo = Date.now() - FINDING_CACHE_MILLISECONDS;
      //check if we got anything back -- if we didn't let's long poll just in case

      // to clarify below:
      // if I have a fast findings collection]
      // AND it has length >0
      // AND
      // ( i don't have a timestamp OR my timestamp is old [on the first record])
      // maybe this should use fastFindings.any() , but that might be unnecessary cycles
      if (
        fastFindings &&
        fastFindings.length > 0 &&
        (!fastFindings[0]?.queryTimestamp ||
          fastFindings[0]?.queryTimestamp < thirtyMinutesAgo)
      ) {
        //fetch long cache, update the query time to show that it was just fetched.
        const rightNow = Date.now();
        findings = await fileStore.getFindings();
        findings.forEach((f) => (f.queryTimestamp = rightNow));
      } else {
        //I have fastfindings, its not stale, use it and move on!
        findings = fastFindings;
      }
    }
    //otherwise, we have no fast store, just pull from the long store
    else {
      findings = await fileStore.getFindings();
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
