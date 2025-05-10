"use client";

import { useState } from "react";
import { api } from "~/trpc/client";
import type { EmprestimoDTO } from "~/server/api/routers/emprestimo";
import { useAuthStore } from "~/trpc/auth-store";

export default function EmprestimosPendentes() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmprestimo, setSelectedEmprestimo] =
    useState<EmprestimoDTO | null>(null);
  const [returnSuccess, setReturnSuccess] = useState(false);
  const [returnError, setReturnError] = useState("");

  const getAccessToken = useAuthStore((state) => state.getAccessToken);
  const token = getAccessToken();
  const apiUtils = api.useUtils();

  const {
    data: emprestimos,
    isLoading,
    error: emprestimosError,
  } = api.emprestimo.todosOsEmprestimos.useQuery({
    authToken: token ?? "", // Usa o token do auth-store ou string vazia como fallback
  });

  const { mutate: devolverLivro } = api.emprestimo.devolucao.useMutation({
    onSuccess: () => {
      console.log("Livro devolvido com sucesso!");
      setReturnSuccess(true);
      setReturnError("");
      // Invalidate the query to refetch the emprestimos
      void apiUtils.emprestimo.todosOsEmprestimos.invalidate();
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setReturnSuccess(false);
      }, 3000);
    },
    onError: (error) => {
      console.error("Erro ao devolver livro:", error);
      setReturnError("Ocorreu um erro ao tentar devolver o livro. Por favor, tente novamente.");
      setReturnSuccess(false);
    },
  });

  if (emprestimosError) {
    return (
      <div className="rounded-2xl bg-white border p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl">
        <h2 className="text-gray-800 mb-4 text-2xl font-bold">
          Empréstimos Pendentes
        </h2>
        <div className="text-red-600 mt-2">
          Erro ao carregar empréstimos. Por favor, tente novamente.
        </div>
      </div>
    );
  }

  const handleDevolucao = (emprestimo: EmprestimoDTO) => {
    if (!emprestimo) return;
    setSelectedEmprestimo(emprestimo);
    setIsOpen(true);
  };

  const confirmDevolucao = async () => {
    if (!selectedEmprestimo) return;

    // Clear previous messages
    setReturnError("");
    setReturnSuccess(false);
    
    // Log for debugging
    console.log("Tentando devolver empréstimo:", {
      id: selectedEmprestimo.id,
      titulo: selectedEmprestimo.titulo_livro,
      aluno: selectedEmprestimo.nome_aluno
    });

    try {
      // Call the mutation with the correct ID
      devolverLivro({
        id: selectedEmprestimo.id,
        authToken: token ?? "", // Usa o token do auth-store ou string vazia como fallback
      });
      
      // Close the modal after initiating the return
      setIsOpen(false);
      setSelectedEmprestimo(null);
      
    } catch (error) {
      console.error("Erro ao devolver livro:", error);
      
      // Set detailed error message
      if (error instanceof Error) {
        setReturnError(`Erro ao devolver livro: ${error.message}`);
      } else {
        setReturnError("Ocorreu um erro inesperado ao tentar devolver o livro.");
      }
    }
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="bg-background rounded-lg border p-6 shadow-sm">
      <h2 className="text-foreground mb-4 text-2xl font-bold">
        Empréstimos Pendentes
      </h2>
      <div className="border-border bg-card overflow-x-auto rounded-lg border shadow-sm">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">Aluno</th>
              <th className="py-2 text-left">Livro</th>
              <th className="py-2 text-left">Data Empréstimo</th>
              <th className="py-2 text-left">Previsão Devolução</th>
              <th className="py-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {emprestimos?.map((emprestimo: EmprestimoDTO) => (
              <tr key={emprestimo.id} className="hover:bg-muted/50 border-b">
                <td className="py-2">{emprestimo.nome_aluno}</td>
                <td className="py-2">{emprestimo.titulo_livro}</td>
                <td className="py-2">{emprestimo.dt_emprestimo}</td>
                <td className="py-2">{emprestimo.previsao_devolucao}</td>
                <td className="py-2">
                  <button
                    onClick={() => handleDevolucao(emprestimo)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 font-medium transition-colors duration-200"
                  >
                    Devolver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show success message if return was successful */}
      {returnSuccess && (
        <div className="mt-4 rounded-xl bg-green-50 p-4 text-green-700 shadow-md">
          Livro devolvido com sucesso!
        </div>
      )}
      
      {/* Show error message if return failed */}
      {returnError && (
        <div className="mt-4 rounded-xl bg-red-50 p-4 text-red-700 shadow-md">
          {returnError}
        </div>
      )}
      
      {isOpen && selectedEmprestimo && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-lg">
            <h3 className="mb-4 text-xl font-bold text-gray-800">Confirmar Devolução</h3>
            <p className="mb-4">
              Você está prestes a devolver o livro &ldquo;
              {selectedEmprestimo.titulo_livro}&rdquo; do aluno &ldquo;
              {selectedEmprestimo.nome_aluno}&rdquo;.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDevolucao}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
