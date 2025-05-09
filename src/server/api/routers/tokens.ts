import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import axios from "axios";
import { z } from "zod";
import type { Token } from "~/types";

export const tokenRouter = createTRPCRouter({
  getTokens: publicProcedure
    .input(z.object({ username: z.string(), password: z.string() }))
    .mutation(async ({ input }) => {
      const { data } = await axios.post<Token>(
        `http://3.82.202.97/api/token/`,
        {
          username: input.username,
          password: input.password,
        },
      );
      return data;
    }),
});
