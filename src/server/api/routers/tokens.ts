import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import axios from "axios";
import { z } from "zod";

interface Token {
  refresh: string;
  access: string;
}

export const tokenRouter = createTRPCRouter({
  getTokens: publicProcedure
    .input(z.object({ username: z.string(), password: z.string() }))
    .mutation(async ({ input }) => {
      console.log("input", input);
      const { data } = await axios.post<Token>(
        `http://3.82.202.97/api/tokens/`,
        {
          username: input.username,
          password: input.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      return data;
    }),
});
