import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import axios from "axios";
import { z } from "zod";
import { env } from "~/env";
import type { Token } from "~/types";

const baseUrl = env.NEXT_PUBLIC_API_URL.replace("/api/v1", "");

export const tokenRouter = createTRPCRouter({
  getTokens: publicProcedure
    .input(z.object({ username: z.string(), password: z.string() }))
    .mutation(async ({ input }) => {
      const { data } = await axios.post<Token>(
        `https://www.firminostech.com.br/api/token/`,
        {
          username: input.username,
          password: input.password,
        },
      );
      return data;
    }),
});
