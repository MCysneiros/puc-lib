"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "~/trpc/auth-store";
import { api } from "~/trpc/react";
import type { EmprestimoDTO } from "~/server/api/routers/emprestimo";

export default function ListaEmprestimosClient() {
  const [emprestimos, setEmprestimos] = useState<EmprestimoDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authToken = useAuthStore.getState().getAccessToken();

  // Buscar todos os empréstimos usando a query todosOsEmprestimos
  const emprestimosQuery = api.emprestimo.todosOsEmprestimos.useQuery(
    { authToken: authToken ?? "" },
    { enabled: !!authToken },
  );

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

  return (
    <div className="overflow-x-auto rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
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
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {emprestimos.map((emprestimo) => (
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
