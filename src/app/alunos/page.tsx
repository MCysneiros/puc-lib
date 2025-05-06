import { api, HydrateClient } from "~/trpc/server";
import AlunosTable from "../_components/AlunosTable";
import AuthTokenInitializer from "../_components/AuthTokenInitializer";

export default async function AlunosPage() {
  const data = await api.token.getTokens({
    username: "fernando",
    password: "admin***",
  });

  const alunos = await api.aluno.getAllAlunos({
    authToken: data.access,
  });

  return (
    <HydrateClient>
      {/* Inicializa os tokens de autenticação no Zustand store do lado do cliente */}
      <AuthTokenInitializer
        accessToken={data.access}
        refreshToken={data.refresh}
      />

      <main className="flex min-h-screen flex-col items-center justify-center bg-[#e6e6e6] text-black">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <div className="w-full overflow-x-auto">
            <AlunosTable alunos={Array.isArray(alunos) ? alunos : []} />
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
