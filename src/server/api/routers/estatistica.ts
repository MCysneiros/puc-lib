import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import axios from "axios";
import { z } from "zod";
import { env } from "~/env";

interface Data {
  total_alunos: number;
  total_livros: number;
  total_tiragens: number;
  livros_disponiveis: number;
  livros_emprestados: number;
}
const baseUrl = env.NEXT_PUBLIC_API_URL as string;
export const estatisticaRouter = createTRPCRouter({
  getEstatistica: publicProcedure
    .input(
      z.object({
        authToken: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { data } = await axios.get<Data>(`${baseUrl}/estatisticas/totais/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${input.authToken}`,
        },
      });
      return data;
    }),
});
