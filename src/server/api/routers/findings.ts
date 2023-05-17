import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const exampleRouter = createTRPCRouter({
  getFindings: protectedProcedure
    .input(z.object({ search: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.search}`,
      };
    }),
});
