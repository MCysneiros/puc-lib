import { api, HydrateClient } from "~/trpc/server";
import AlunosTable from "../_components/AlunosTable";
import AuthTokenInitializer from "../_components/AuthTokenInitializer";
import ModalCreateAluno from "../_components/ModalCreateAluno";

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

      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-800">Alunos</h2>
                <div className="flex items-center gap-4">
                  <ModalCreateAluno />
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Gerencie seus alunos
              </p>
              <div className="overflow-x-auto">
                <div className="bg-white rounded-lg border border-gray-200">
                  <AlunosTable alunos={Array.isArray(alunos) ? alunos : []} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
