/* eslint-disable @typescript-eslint/await-thenable */
"use client";

import { useState } from "react";
import { api } from "~/trpc/client";
import type { EmprestimoDTO } from "~/server/api/routers/emprestimo";
import { useAuthStore } from "~/trpc/auth-store";

export default function EmprestimosPendentes() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmprestimo, setSelectedEmprestimo] =
    useState<EmprestimoDTO | null>(null);

  const getAccessToken = useAuthStore((state) => state.getAccessToken);
  const token = getAccessToken();

  const {
    data: emprestimos,
    isLoading,
    error: emprestimosError,
  } = api.emprestimo.todosOsEmprestimos.useQuery({
    authToken: token ?? "", // Usa o token do auth-store ou string vazia como fallback
  });

  if (emprestimosError) {
    return (
      <div className="bg-background rounded-xl border p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl">
        <h2 className="text-foreground mb-4 text-2xl font-bold">
          Empréstimos Pendentes
        </h2>
        <div className="text-destructive mt-2">
          Erro ao carregar empréstimos. Por favor, tente novamente.
        </div>
      </div>
    );
  }

  const { mutate: devolverLivro } = api.emprestimo.devolucao.useMutation({
    onSuccess: () => {
      console.log("Livro devolvido com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao devolver livro:", error);
    },
  });

  const handleDevolucao = (emprestimo: EmprestimoDTO) => {
    if (!emprestimo) return;
    setSelectedEmprestimo(emprestimo);
    setIsOpen(true);
  };

  const confirmDevolucao = async () => {
    if (!selectedEmprestimo) return;

    try {
      await devolverLivro({
        id: selectedEmprestimo.id,
        authToken: token ?? "", // Usa o token do auth-store ou string vazia como fallback
      });
      setIsOpen(false);
      setSelectedEmprestimo(null);
    } catch (error) {
      console.error("Erro ao devolver livro:", error);
      // You might want to show an error message to the user here
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

      {isOpen && selectedEmprestimo && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background w-full max-w-md rounded-lg p-6 shadow-lg">
            <h3 className="mb-4 text-xl font-bold">Confirmar Devolução</h3>
            <p className="mb-4">
              Você está prestes a devolver o livro "
              {selectedEmprestimo.titulo_livro}" do aluno "
              {selectedEmprestimo.nome_aluno}".
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsOpen(false)}
                className="bg-muted text-muted-foreground hover:bg-muted/80 rounded-md px-4 py-2"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDevolucao}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2"
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
