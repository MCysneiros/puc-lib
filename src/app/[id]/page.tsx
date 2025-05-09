import { api, HydrateClient } from "~/trpc/server";
import AuthTokenInitializer from "..//_components/AuthTokenInitializer";
import LivroDetalhePageClient from "./LivroDetalhePageClient";
import { notFound } from "next/navigation";
import { useLivrosStore } from "~/trpc/livros-store";

// TypeScript interface for the page props expected by Next.js
type PagePropsWithId = {
  params: { id: string };
  searchParams?: Record<string, string | string[] | undefined>;
};

// Using a more permissive type to avoid type errors during build
export default async function Page(props: PagePropsWithId) {
  const { id } = props.params;
  
  try {
    const tokens = await api.token.getTokens({
      username: "fernando",
      password: "admin***",
    });

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
  } catch (err) {
    console.error("Erro ao carregar detalhes do livro:", err);
    return (
      <HydrateClient>
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 py-8">
            <div className="rounded-lg bg-red-50 p-4 text-red-700">
              Erro ao carregar os detalhes do livro. Por favor, tente novamente.
            </div>
          </div>
        </main>
      </HydrateClient>
    );
  }
}
