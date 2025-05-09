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

      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <EmprestimosTabsClient alunos={alunos} livros={livros} />
        </div>
      </main>
    </HydrateClient>
  );
}
