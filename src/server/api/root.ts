import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { tokenRouter } from "./routers/tokens";
import { alunoRouter } from "./routers/alunos";
import { estatisticaRouter } from "./routers/estatistica";
import { emprestimoRouter } from "./routers/emprestimo";
import { livroRouter } from "./routers/livros";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  token: tokenRouter,
  aluno: alunoRouter,
  estatistica: estatisticaRouter,
  emprestimo: emprestimoRouter,
  livro: livroRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
