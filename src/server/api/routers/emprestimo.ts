import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import axios from "axios";
import { env } from "~/env";

const baseUrl = env.NEXT_PUBLIC_API_URL as string;

interface Emprestimo {
  aluno: number;
  tiragem: number;
  dt_emprestimo: string;
  dt_devolucao: string | null;
}

interface EmprestimoResponse {
  id: number;
  mensagem: string;
}

interface DevolucaoResponse {
  status: string;
  data_devolucao: string;
}
export interface EmprestimoDTO {
  id: number;
  aluno: number;
  nome_aluno: string;
  tiragem: number;
  titulo_livro: string;
  isbn_livro: string;
  dt_emprestimo: string;
  previsao_devolucao: string;
  dt_devolucao: string | null;
}

export const emprestimoRouter = createTRPCRouter({
  emprestimo: publicProcedure
    .input(
      z.object({
        aluno: z.number(),
        tiragem: z.number(),
        dt_emprestimo: z.string(),
        dt_devolucao: z.string().nullable(),
        authToken: z.string(),
      }),
    )
    .mutation(
      async ({ input }: { input: Emprestimo & { authToken: string } }) => {
        const { data } = await axios.post<EmprestimoResponse>(
          `${baseUrl}/emprestimos/`,
          {
            aluno: input.aluno,
            tiragem: input.tiragem,
            dt_emprestimo: input.dt_emprestimo,
            dt_devolucao: input.dt_devolucao,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${input.authToken}`,
            },
          },
        );
        return data;
      },
    ),

  devolucao: publicProcedure
    .input(
      z.object({
        id: z.number(),
        authToken: z.string(),
      }),
    )
    .mutation(
      async ({ input }: { input: { authToken: string; id: number } }) => {
        const url = `${baseUrl}/devolucao/${input.id}/registrar/`;
        const { data } = await axios.patch<DevolucaoResponse>(
          url,
          { id: input.id },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${input.authToken}`,
            },
          },
        );
        return data;
      },
    ),

  todosOsEmprestimos: publicProcedure
    .input(
      z.object({
        authToken: z.string(),
      }),
    )
    .query(async ({ input }: { input: { authToken: string } }) => {
      const { data } = await axios.get<EmprestimoDTO[]>(
        `${baseUrl}/emprestimos/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${input.authToken}`,
          },
        },
      );
      return data;
    }),
  emprestimosPorAluno: publicProcedure
    .input(
      z.object({
        aluno: z.number(),
        authToken: z.string(),
      }),
    )
    .query(
      async ({ input }: { input: { aluno: number; authToken: string } }) => {
        const { data } = await axios.get<EmprestimoDTO[]>(
          `${baseUrl}/aluno/${input.aluno}/emprestimos/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${input.authToken}`,
            },
          },
        );
        return data;
      },
    ),
});
