import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import axios from "axios";
import { env } from "~/env";

const baseUrl = env.NEXT_PUBLIC_API_URL;

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
        try {
          // Usando exatamente o formato do comando curl fornecido
          const url = `${baseUrl}/devolucao/${input.id}/registrar/`;
          console.log(`Tentando devolução com PATCH para ${url}`);

          const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${input.authToken}`,
          };

          // Mantendo o payload mínimo conforme o PATCH original
          const response = await axios.patch<DevolucaoResponse>(
            url,
            { id: input.id },
            { headers },
          );

          console.log("Devolução registrada com sucesso:", response.data);
          return response.data;
        } catch (error) {
          console.error("Erro na devolução:", error);

          if (axios.isAxiosError(error)) {
            console.error("Status:", error.response?.status);
            console.error("Data:", error.response?.data);
            console.error("URL:", error.config?.url);

            if (error.response?.status === 404) {
              throw new Error(
                `O empréstimo com ID ${input.id} não foi encontrado ou não pode ser devolvido.`,
              );
            }
            if (error.response?.status === 500) {
              throw new Error(
                `Erro interno no servidor ao processar a devolução do empréstimo ${input.id}.`,
              );
            }
          }

          throw new Error(
            `Falha ao registrar devolução: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
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
        try {
          console.log(`Buscando empréstimos para o aluno ID: ${input.aluno}`);

          // Usando exatamente o formato do comando curl fornecido
          // Note que o baseUrl já inclui /api/v1, então não precisamos adicionar novamente
          const url = `${env.NEXT_PUBLIC_API_URL.replace("/api/v1", "")}/aluno/${input.aluno}/emprestimos/`;
          console.log(`URL da requisição: ${url}`);

          const { data } = await axios.get<EmprestimoDTO[]>(url, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${input.authToken}`,
            },
          });

          console.log(`Emprestimos encontrados: ${data?.length || 0}`);
          return data || [];
        } catch (error) {
          console.error(
            `Erro ao buscar empréstimos do aluno ${input.aluno}:`,
            error,
          );

          // Detalhamento do erro para debug
          if (axios.isAxiosError(error)) {
            console.error("Status:", error.response?.status);
            console.error("Data:", error.response?.data);
            console.error("URL:", error.config?.url);

            // Se for 404, provavelmente o aluno não tem empréstimos
            if (error.response?.status === 404) {
              console.log("Aluno não tem empréstimos ou endpoint retornou 404");
              return [];
            }
          }

          // Para outros erros, lançamos uma exceção
          throw new Error(
            `Erro ao buscar empréstimos do aluno ${input.aluno}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      },
    ),
});
