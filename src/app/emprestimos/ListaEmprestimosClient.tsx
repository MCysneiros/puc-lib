"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "~/trpc/auth-store";
import { api } from "~/trpc/react";
import type { EmprestimoDTO } from "~/server/api/routers/emprestimo";

export default function ListaEmprestimosClient() {
  const [emprestimos, setEmprestimos] = useState<EmprestimoDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroPendentes, setFiltroPendentes] = useState(false);
  const [filteredEmprestimos, setFilteredEmprestimos] = useState<
    EmprestimoDTO[]
  >([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [confirmingReturn, setConfirmingReturn] = useState<number | null>(null);
  const authToken = useAuthStore.getState().getAccessToken();

  // Buscar todos os empréstimos usando a query todosOsEmprestimos
  const emprestimosQuery = api.emprestimo.todosOsEmprestimos.useQuery(
    { authToken: authToken ?? "" },
    { enabled: !!authToken, refetchOnWindowFocus: false },
  );

  // Mutation para registrar devolução de livro
  const devolucaoMutation = api.emprestimo.devolucao.useMutation({
    onSuccess: (data) => {
      setSuccessMessage(
        `Devolução registrada com sucesso em ${new Date(data.data_devolucao).toLocaleDateString("pt-BR")}`,
      );
      setConfirmingReturn(null);
      void emprestimosQuery.refetch();
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (error) => {
      setError(`Erro ao registrar devolução: ${error.message}`);
      setConfirmingReturn(null);
      setTimeout(() => setError(null), 5000);
    },
  });

  useEffect(() => {
    if (emprestimosQuery.data) {
      setEmprestimos(emprestimosQuery.data);
      setIsLoading(false);
    }

    if (emprestimosQuery.error) {
      setError(
        `Erro ao carregar empréstimos: ${emprestimosQuery.error.message}`,
      );
      setIsLoading(false);
    }
  }, [emprestimosQuery.data, emprestimosQuery.error]);

  // Filter emprestimos when filtroPendentes changes
  useEffect(() => {
    if (emprestimos.length > 0) {
      setFilteredEmprestimos(
        filtroPendentes
          ? emprestimos.filter((emprestimo) => !emprestimo.dt_devolucao)
          : emprestimos,
      );
    }
  }, [emprestimos, filtroPendentes]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="text-center">
          <p className="text-gray-600">Carregando empréstimos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center p-8">
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (emprestimos.length === 0) {
    return (
      <div className="flex justify-center p-8">
        <div className="text-center">
          <p className="text-gray-600">Nenhum empréstimo encontrado.</p>
        </div>
      </div>
    );
  }

  // Função para lidar com a devolução de livro usando tiragem
  const handleReturnBook = (tiragemparam: number) => {
    if (!authToken) {
      setError("Erro de autenticação. Faça login novamente.");
      return;
    }
    
    // Usamos o id como alias para tiragem para compatibilidade com a API
    devolucaoMutation.mutate({ 
      id: tiragemparam, // passamos a tiragem como id para compatibilidade
      authToken 
    });
  };

  return (
    <div className="overflow-x-auto rounded-lg bg-white p-6 shadow-lg">
      {/* Mensagem de sucesso */}
      {successMessage && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
          <div className="flex items-center">
            <svg
              className="mr-2 h-5 w-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {successMessage}
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">
          Lista de Empréstimos
        </h2>
        <button
          onClick={() => setFiltroPendentes(!filtroPendentes)}
          className={`rounded-lg px-4 py-2 font-medium transition-colors ${
            filtroPendentes
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {filtroPendentes ? "Mostrar Todos" : "Mostrar Pendentes"}
        </button>
      </div>

      {/* Diálogo de confirmação */}
      {confirmingReturn && (
        <div className="mb-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 shadow-md">
          <p className="mb-3 text-yellow-800">
            Confirmar devolução da tiragem #{confirmingReturn}?
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => handleReturnBook(confirmingReturn)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Confirmar
            </button>
            <button
              onClick={() => setConfirmingReturn(null)}
              className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      <table className="min-w-full divide-y divide-gray-200 overflow-hidden rounded-lg border">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              ID
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              Aluno
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              Livro
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              Data Empréstimo
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              Previsão Devolução
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {filteredEmprestimos.map((emprestimo) => (
            <tr key={emprestimo.id}>
              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                {emprestimo.id}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {emprestimo.nome_aluno}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {emprestimo.titulo_livro}
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                {new Date(emprestimo.dt_emprestimo).toLocaleDateString("pt-BR")}
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                {new Date(emprestimo.previsao_devolucao).toLocaleDateString(
                  "pt-BR",
                )}
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap">
                {emprestimo.dt_devolucao ? (
                  <span className="inline-flex rounded-full bg-green-100 px-2 text-xs leading-5 font-semibold text-green-800">
                    Devolvido em{" "}
                    {new Date(emprestimo.dt_devolucao).toLocaleDateString(
                      "pt-BR",
                    )}
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-yellow-100 px-2 text-xs leading-5 font-semibold text-yellow-800">
                    Pendente
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap">
                {!emprestimo.dt_devolucao && (
                  <button
                    onClick={() => setConfirmingReturn(emprestimo.tiragem)}
                    className="rounded-md px-3 py-1 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800"
                    title="Registrar devolução"
                  >
                    Devolver
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
