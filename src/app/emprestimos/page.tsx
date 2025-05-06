import { api, HydrateClient } from "~/trpc/server";
import AuthTokenInitializer from "../_components/AuthTokenInitializer";
import EmprestimosTabsClient from "./EmprestimosTabsClient";

export default async function EmprestimosPage() {
  const data = await api.token.getTokens({
    username: "fernando",
    password: "admin***",
  });

  const alunos = await api.aluno.getAllAlunos({
    authToken: data.access,
  });

  let livros = await api.livro.getTodosLivros({
    authToken: data.access,
  });

  // Verificar e garantir que livros é um array
  if (!Array.isArray(livros)) {
    console.log("Aviso: getLivrosDisponiveis não retornou um array", livros);
    livros = [];
  }

  // Verificar se os dados provenientes da API têm a estrutura esperada
  livros = livros.filter(
    (livro) => typeof livro === "object" && livro !== null && "id" in livro,
  );

  console.log(`Quantidade de livros disponíveis: ${livros.length}`);

  return (
    <HydrateClient>
      {/* Inicializa os tokens de autenticação no Zustand store do lado do cliente */}
      <AuthTokenInitializer
        accessToken={data.access}
        refreshToken={data.refresh}
      />

      <main className="flex min-h-screen flex-col items-center justify-center bg-[#e6e6e6] text-black">
        <div className="container flex flex-col items-center justify-center gap-8 px-4 py-12">
          <div className="flex w-full flex-col items-center">
            <h1 className="mb-6 text-3xl font-bold">
              Gerenciamento de Empréstimos
            </h1>
            <div className="w-full max-w-4xl">
              <EmprestimosTabsClient alunos={alunos} livros={livros} />
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
