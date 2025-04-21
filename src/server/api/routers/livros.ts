import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import axios from "axios";
import { z } from "zod";
import { env } from "~/env";

// Base URL para a API externa
const baseUrl = env.NEXT_PUBLIC_API_URL as string;

export interface Livro {
  titulo: string;
  descricao: string;
  editora: string;
  autor: string;
  ano_publicacao: string;
}

export interface LivroDadosResponse {
  id: number;
  url: string;
  titulo: string;
  descricao: string;
  editora: string;
  autor: string;
  ano_publicacao: number;
  total_exemplares: number;
  tiragens: Tiragem[];
}

export interface LivroResponse {
  status: string;
  dados: LivroDadosResponse;
}

// Interfaces para o recurso de tiragem
export interface Tiragem {
  id: number;
  isbn: string;
  livro: number;
  disponivel: boolean;
}

export interface TiragemResponse {
  status: string;
  dados: Tiragem;
}

export interface PutResponse {
  status: string;
  livro: string;
}

export const livroRouter = createTRPCRouter({
  createLivro: publicProcedure
    .input(
      z.object({
        authToken: z.string(),
        titulo: z.string(),
        descricao: z.string(),
        editora: z.string(),
        autor: z.string(),
        ano_publicacao: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { data } = await axios.post<LivroResponse>(
        `${baseUrl}/api/v1/exemplares/`,
        {
          titulo: input.titulo,
          descricao: input.descricao,
          editora: input.editora,
          autor: input.autor,
          ano_publicacao: input.ano_publicacao,
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

  // Cadastrar uma nova tiragem de exemplar
  createTiragem: publicProcedure
    .input(
      z.object({
        authToken: z.string(),
        isbn: z.string(),
        livro: z.number(),
        disponivel: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      const url = `${baseUrl}/api/v1/tiragem/`;
      const { data } = await axios.post<TiragemResponse>(
        url,
        { isbn: input.isbn, livro: input.livro, disponivel: input.disponivel },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${input.authToken}`,
          },
        },
      );
      return data;
    }),

  updateLivro: publicProcedure
    .input(
      z.object({
        authToken: z.string(),
        id: z.string(),
        titulo: z.string(),
        descricao: z.string(),
        editora: z.string(),
        autor: z.string(),
        ano_publicacao: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const url = `${baseUrl}/api/v1/exemplares/${input.id}/`;
      const { data } = await axios.put<PutResponse>(
        url,
        {
          titulo: input.titulo,
          descricao: input.descricao,
          editora: input.editora,
          autor: input.autor,
          ano_publicacao: input.ano_publicacao,
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

  // Editar parte dos dados de um livro (PATCH)
  patchLivro: publicProcedure
    .input(
      z.object({
        authToken: z.string(),
        id: z.string(),
        updates: z
          .object({
            titulo: z.string().optional(),
            descricao: z.string().optional(),
            editora: z.string().optional(),
            autor: z.string().optional(),
            ano_publicacao: z.number().optional(),
          })
          .refine((obj) => Object.keys(obj).length > 0, {
            message: "Informe ao menos um campo para atualizar",
          }),
      }),
    )
    .mutation(async ({ input }) => {
      const url = `${baseUrl}/api/v1/exemplares/${input.id}/`;
      const { data } = await axios.patch<LivroResponse>(url, input.updates, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${input.authToken}`,
        },
      });
      return data;
    }),

  getLivro: publicProcedure
    .input(z.object({ authToken: z.string(), id: z.string() }))
    .query(async ({ input }) => {
      const url = `${baseUrl}/api/v1/exemplares/${input.id}/`;
      const { data } = await axios.get<LivroDadosResponse>(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${input.authToken}`,
        },
      });
      return data;
    }),

  getTodosLivros: publicProcedure
    .input(z.object({ authToken: z.string() }))
    .query(async ({ input }) => {
      const url = `${baseUrl}/api/v1/exemplares/`;
      const { data } = await axios.get<LivroDadosResponse[]>(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${input.authToken}`,
        },
      });
      return data;
    }),

  getLivrosDisponiveis: publicProcedure
    .input(z.object({ authToken: z.string() }))
    .query(async ({ input }) => {
      const url = `${baseUrl}/api/v1/livros/disponiveis/`;
      const { data } = await axios.get<Tiragem[]>(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${input.authToken}`,
        },
      });
      return data;
    }),

  // Recupera lista de livros atualmente emprestados
  getLivrosIndisponiveis: publicProcedure
    .input(z.object({ authToken: z.string() }))
    .query(async ({ input }) => {
      const url = `${baseUrl}/api/v1/livros/indisponiveis/`;
      const { data } = await axios.get<LivroDadosResponse[]>(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${input.authToken}`,
        },
      });
      return data;
    }),
});
