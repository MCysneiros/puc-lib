import { api, HydrateClient } from "~/trpc/server";
import AuthTokenInitializer from "./_components/AuthTokenInitializer";
import { LivrosTable } from "./_components/LivrosTable";
import ModalState from "./_components/ModalState";
import { notFound } from "next/navigation";
import LivroDetalhePageClient from "./[id]/LivroDetalhePageClient";
import { useLivrosStore } from "~/trpc/livros-store";

// Instead of receiving parameters through props, let's use the context
export default async function Home() {
  // We'll use this page only for the root path and handle dynamic paths in their own file
  const id = undefined;
  try {
    const tokens = await api.token.getTokens({
      username: "fernando",
      password: "admin***",
    });

    if (id) {
      const livroData = await api.livro.getLivro({
        authToken: tokens.access,
        id,
      });

      if (!livroData) {
        return notFound();
      }

      useLivrosStore.getState().setBook(id, livroData);

      return (
        <HydrateClient>
          <AuthTokenInitializer
            accessToken={tokens.access}
            refreshToken={tokens.refresh}
          />
          <LivroDetalhePageClient />
        </HydrateClient>
      );
    }

    const livrosData = await api.livro.getTodosLivros({
      authToken: tokens.access,
    });

    const livros = Array.isArray(livrosData)
      ? livrosData.map((l) => ({
          ...l,
          ano_publicacao: Number(l.ano_publicacao),
        }))
      : [];

    livros.forEach((livro) => {
      useLivrosStore.getState().setBook(String(livro.id), livro);
    });

    return (
      <HydrateClient>
        <AuthTokenInitializer
          accessToken={tokens.access}
          refreshToken={tokens.refresh}
        />
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 py-8">
            <div className="space-y-8">
              <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-gray-800">Livros</h2>
                  <div className="flex items-center gap-4">
                    <ModalState authToken={tokens.access} />
                  </div>
                </div>
                <p className="mb-6 text-gray-600">
                  Gerencie seu catálogo de livros
                </p>
                <div className="overflow-x-auto">
                  <div className="rounded-lg border border-gray-200 bg-white">
                    {livros.length > 0 && <LivrosTable livros={livros} />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </HydrateClient>
    );
  } catch (err) {
    console.error("Erro ao carregar dados:", err);
    return (
      <HydrateClient>
        <main className="bg-background min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <div className="rounded-lg bg-red-50 p-4 text-red-700">
              Erro ao carregar os dados. Por favor, tente novamente.
            </div>
          </div>
        </main>
      </HydrateClient>
    );
  }
}
