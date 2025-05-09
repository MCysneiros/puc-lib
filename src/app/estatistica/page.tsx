import { api, HydrateClient } from "~/trpc/server";
import EstatisticaTable from "../_components/EstatisticaTable";
import EstatisticaDashboard from "../_components/EstatisticaDashboard";
import AuthTokenInitializer from "../_components/AuthTokenInitializer";

export default async function EstatisticaPage() {
  const data = await api.token.getTokens({
    username: "fernando",
    password: "admin***",
  });

  const estatistica = await api.estatistica.getEstatistica({
    authToken: data.access,
  });
  
  // Buscando empréstimos para uso nos gráficos
  const emprestimos = await api.emprestimo.todosOsEmprestimos({
    authToken: data.access,
  }).catch(() => []);

  return (
    <HydrateClient>
      <AuthTokenInitializer
        accessToken={data.access}
        refreshToken={data.refresh}
      />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg transition-all duration-300 hover:shadow-xl mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Estatísticas da Biblioteca</h1>
            <p className="text-gray-600 mb-6">Visualize dados e métricas do sistema da biblioteca</p>
            
            {/* Dashboard com gráficos usando Recharts */}
            <EstatisticaDashboard estatistica={estatistica} emprestimos={emprestimos} />
          </div>
          
          {/* Tabela simples para referência (opcional) */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Resumo de Dados</h2>
            <EstatisticaTable estatistica={estatistica} />
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
