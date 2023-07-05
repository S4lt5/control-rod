import { type SlowFindingsStore } from '~/shared/finding';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { FileFindingsStore } from '~/shared/backend_file';
import { AwsFindingStore } from '~/shared/backend_aws';
import { AthenaCSVFileStore } from '~/shared/backend_athena_file_backup';
import { z } from 'zod';
import { type Finding } from '@prisma/client';

//We'll check each time we pull from fastFindingStore to see if the data is stale, and if so we'll update it in place
//from the long data source defined here
let slowFindingsStore: SlowFindingsStore;
if (process.env.LONG_DATA_SOURCE == 'athena') {
  slowFindingsStore = new AwsFindingStore();
} else if (process.env.LONG_DATA_SOURCE == 'csv') {
  //we're using a local findings.csv export from athena
  slowFindingsStore = new AthenaCSVFileStore();
} else {
  // use a nuclei JSON output
  slowFindingsStore = new FileFindingsStore();
}

const FINDING_CACHE_MILLISECONDS = 30 * 60 * 1000; //how many seconds should we hold on to "fast" cache, default 60 minutes

export const findingsRouter = createTRPCRouter({
  getFindings: protectedProcedure
    .input(
      z
        .object({
          search: z.string().nullish(),
          forceRefresh: z.boolean().nullish(),
          hideDisclosed: z.boolean().nullish(),
        })
        .nullish()
    )
    .query(async ({ ctx, input }): Promise<Finding[]> => {
      let findings: Finding[] = [];

      //pick a finding off the prisma DB, to check it's age
      const ArbitraryFastFinding = await ctx.prisma.finding.findFirst();
      const lenFindings = await ctx.prisma.finding.count();
      const thirtyMinutesAgo = new Date(
        new Date().getTime() - FINDING_CACHE_MILLISECONDS
      );
      //check if we got anything back -- if we didn't let's long poll just in case

      // to clarify below:
      //  if I dont have findings
      //  or my length < 2 ( len = 1 is often an error condition)
      //  or my I'm missing cache timestamp
      //  or my cache is stale
      //  then I need to invalidate the cache
      if (
        input?.forceRefresh ||
        lenFindings < 2 ||
        !ArbitraryFastFinding ||
        !ArbitraryFastFinding?.queryTimestamp ||
        ArbitraryFastFinding?.queryTimestamp < thirtyMinutesAgo
      ) {
        //this block is for when cache is expired, or is empty

        //get from the long findings store, clear the findings store, and insert new values
        const slowFindings = await slowFindingsStore.getFindings();
        //clear old findings,
        await ctx.prisma.finding.deleteMany();
        //insert new findings
        await ctx.prisma.finding.createMany({ data: slowFindings });
      }

      const disclosures = await ctx.prisma.disclosure.findMany();

      //perform filter before returning to client, if one was provided
      if (input && input.search) {
        findings = await ctx.prisma.finding.findMany({
          orderBy: {
            severity: 'desc',
          },
          where: {
            AND: [
              {
                NOT: {
                  template: {
                    contains: 'dns/',
                  },
                },
              },
              {
                NOT: {
                  template: {
                    contains: 'ssl/',
                  },
                },
              },
              {
                NOT: {
                  name: {
                    contains: 'Weak Cipher Suites',
                  },
                },
              },
              {
                OR: [
                  {
                    name: {
                      contains: input.search,
                    },
                  },
                  {
                    host: {
                      contains: input.search,
                    },
                  },
                  {
                    description: {
                      contains: input.search,
                    },
                  },
                  {
                    template: {
                      contains: input.search,
                    },
                  },
                ],
              },
            ],
          },
        });
      } else {
        findings = await ctx.prisma.finding.findMany({
          orderBy: {
            severity: 'desc',
          },
          where: {
            AND: [
              {
                NOT: {
                  template: {
                    contains: 'dns/',
                  },
                },
              },
              {
                NOT: {
                  template: {
                    contains: 'ssl/',
                  },
                },
              },
              {
                NOT: {
                  name: {
                    contains: 'Weak Cipher Suites',
                  },
                },
              },
            ],
          },
        });
      }

      for (const f of findings) {
        //find a disclosure with the same name, and a matching host
        //monkey patch disclosure in there...
        f.disclosureStatus =
          disclosures.find((d) => d.name === f.name && d.hosts.includes(f.host))
            ?.status ?? null;
      }
      if (input?.hideDisclosed) {
        findings = findings.filter((f) => !f.disclosureStatus);
      }
      return findings;
    }),
});
