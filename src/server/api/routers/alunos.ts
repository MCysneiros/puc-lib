import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import axios from "axios";
import { z } from "zod";
import { env } from "~/env";

const baseUrl = env.NEXT_PUBLIC_API_URL;

export interface Aluno {
  cpf: string;
  nome: string;
  sobrenome: string;
  nascimento: Date;
  email: string;
  tel1: string;
  tel2: string;
  endereco: string;
}
interface Id {
  id: number;
}

export type AlunoWithId = Aluno & Id;

interface AlunoResponse {
  status: string;
  dados: Aluno & Id;
}

export const alunoRouter = createTRPCRouter({
  createAluno: publicProcedure
    .input(
      z.object({
        cpf: z.string(),
        nome: z.string(),
        sobrenome: z.string(),
        nascimento: z.string().optional(),
        email: z.string(),
        tel1: z.string(),
        tel2: z.string().optional(),
        endereco: z.string(),
        authToken: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { data } = await axios.post<AlunoResponse>(
        `${baseUrl}/alunos/`,
        {
          cpf: input.cpf,
          nome: input.nome,
          sobrenome: input.sobrenome,
          nascimento: input.nascimento,
          email: input.email,
          tel1: input.tel1,
          tel2: input.tel2,
          endereco: input.endereco,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${input.authToken}`,
          },
        },
      );
      return data;
    }),

  editAluno: publicProcedure
    .input(
      z.object({
        id: z.string(),
        authToken: z.string(),
        updates: z
          .object({
            cpf: z.string().optional(),
            nome: z.string().optional(),
            sobrenome: z.string().optional(),
            nascimento: z.string().optional(),
            email: z.string().optional(),
            tel1: z.string().optional(),
            tel2: z.string().optional(),
            endereco: z.string().optional(),
          })
          .refine((obj) => Object.keys(obj).length > 0, {
            message: "Informe ao menos um campo para atualizar",
          }),
      }),
    )
    .mutation(async ({ input }) => {
      const url = `${baseUrl}/alunos/${input.id}/`;
      const { data } = await axios.put<AlunoResponse>(url, input.updates, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${input.authToken}`,
        },
      });
      return data;
    }),
  editAFieldOfAluno: publicProcedure
    .input(
      z.object({
        id: z.string(),
        authToken: z.string(),
        updates: z
          .object({
            cpf: z.string().optional(),
            nome: z.string().optional(),
            sobrenome: z.string().optional(),
            nascimento: z.string().optional(),
            email: z.string().optional(),
            tel1: z.string().optional(),
            tel2: z.string().optional(),
            endereco: z.string().optional(),
          })
          .refine((obj) => Object.keys(obj).length > 0, {
            message: "Informe ao menos um campo para atualizar",
          }),
      }),
    )
    .mutation(async ({ input }) => {
      const url = `${baseUrl}/alunos/${input.id}/`;
      const { data } = await axios.patch<AlunoResponse>(url, input.updates, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${input.authToken}`,
        },
      });
      return data;
    }),

  getAllAlunos: publicProcedure
    .input(z.object({ authToken: z.string() }))
    .query(async ({ input }) => {
      const { data } = await axios.get<AlunoWithId[]>(`${baseUrl}/alunos/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${input.authToken}`,
        },
      });
      return data;
    }),
});
