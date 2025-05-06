"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "~/trpc/auth-store";
import { api } from "~/trpc/react";
import type { AlunoWithId } from "~/server/api/routers/alunos";
import type { LivroDadosResponse } from "~/server/api/routers/livros";

interface EmprestimoPageClientProps {
  alunos: AlunoWithId[];
  livros: LivroDadosResponse[];
}

export default function EmprestimoPageClient({
  alunos,
  livros,
}: EmprestimoPageClientProps) {
  // Estado para armazenar a busca e os resultados filtrados
  const [alunoSearchQuery, setAlunoSearchQuery] = useState("");
  const [livroSearchQuery, setLivroSearchQuery] = useState("");
  const [filteredAlunos, setFilteredAlunos] = useState<AlunoWithId[]>(alunos);
  const [filteredLivros, setFilteredLivros] =
    useState<LivroDadosResponse[]>(livros);

  // Estado para armazenar os itens selecionados
  const [selectedAluno, setSelectedAluno] = useState<AlunoWithId | null>(null);
  const [selectedLivro, setSelectedLivro] = useState<LivroDadosResponse | null>(
    null,
  );
  const [selectedTiragem, setSelectedTiragem] = useState<number | null>(null);

  // Estado para controle do formulário de empréstimo
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mutation para registrar empréstimo
  const emprestimo = api.emprestimo.emprestimo.useMutation({
    onSuccess: (data) => {
      setSuccess(`Empréstimo registrado com sucesso! ID: ${data.id}`);
      setIsLoading(false);
      resetForm();
    },
    onError: (error) => {
      setError(`Erro ao registrar empréstimo: ${error.message}`);
      setIsLoading(false);
    },
  });

  // Reset do formulário após um empréstimo bem-sucedido
  const resetForm = () => {
    setSelectedAluno(null);
    setSelectedLivro(null);
    setSelectedTiragem(null);
    setAlunoSearchQuery("");
    setLivroSearchQuery("");
  };

  // Filtra alunos quando o termo de busca muda
  useEffect(() => {
    if (alunoSearchQuery.trim() === "") {
      setFilteredAlunos(alunos);
    } else {
      const query = alunoSearchQuery.toLowerCase();
      setFilteredAlunos(
        alunos.filter(
          (aluno) =>
            (aluno.nome?.toLowerCase() || "").includes(query) ||
            (aluno.sobrenome?.toLowerCase() || "").includes(query) ||
            (aluno.cpf?.toLowerCase() || "").includes(query),
        ),
      );
    }
  }, [alunoSearchQuery, alunos]);

  // Filtra livros quando o termo de busca muda
  useEffect(() => {
    if (livroSearchQuery.trim() === "") {
      setFilteredLivros(livros);
    } else {
      const query = livroSearchQuery.toLowerCase();
      setFilteredLivros(
        livros.filter(
          (livro) =>
            (livro.titulo?.toLowerCase() || "").includes(query) ||
            (livro.autor?.toLowerCase() || "").includes(query),
        ),
      );
    }
  }, [livroSearchQuery, livros]);

  // Função para registrar o empréstimo
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedAluno) {
      setError("Selecione um aluno");
      return;
    }

    if (!selectedTiragem) {
      setError("Selecione um livro");
      return;
    }

    const authToken = useAuthStore.getState().getAccessToken();
    if (!authToken) {
      setError("Erro de autenticação. Faça login novamente.");
      return;
    }

    setIsLoading(true);

    const today = new Date().toISOString().split("T")[0] ?? "";

    emprestimo.mutate({
      aluno: selectedAluno.id,
      tiragem: selectedTiragem,
      dt_emprestimo: today,
      dt_devolucao: null,
      authToken,
    });
  };

  // Selecionar um aluno
  const selectAluno = (aluno: AlunoWithId) => {
    setSelectedAluno(aluno);
    setAlunoSearchQuery(""); // Limpa a busca após selecionar
  };

  // Selecionar um livro e uma de suas tiragens disponíveis
  const selectLivro = (livro: LivroDadosResponse) => {
    setSelectedLivro(livro);
    // Selecionar a primeira tiragem disponível do livro (se existir)
    if (livro.tiragens && livro.tiragens.length > 0) {
      const tiragemDisponivel = livro.tiragens.find((t) => t.disponivel);
      if (tiragemDisponivel) {
        setSelectedTiragem(tiragemDisponivel.id);
      }
    }
    setLivroSearchQuery(""); // Limpa a busca após selecionar
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-lg">
      {/* Mensagens de erro e sucesso */}
      {error && (
        <div className="mb-4 rounded-md bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-md bg-green-100 p-3 text-green-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seção de Seleção de Aluno */}
        <div>
          <h2 className="mb-3 text-xl font-semibold">1. Selecione o Aluno</h2>
          <div className="space-y-4">
            {selectedAluno ? (
              <div className="flex items-center justify-between rounded-md border border-gray-300 bg-gray-50 p-3">
                <div>
                  <p className="font-medium">
                    {selectedAluno.nome} {selectedAluno.sobrenome}
                  </p>
                  <p className="text-sm text-gray-600">
                    CPF: {selectedAluno.cpf}
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-md bg-gray-200 px-2 py-1 text-sm hover:bg-gray-300"
                  onClick={() => setSelectedAluno(null)}
                >
                  Alterar
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por nome ou CPF do aluno..."
                    value={alunoSearchQuery}
                    onChange={(e) => setAlunoSearchQuery(e.target.value)}
                    className="w-full rounded-md border border-gray-300 p-2 pl-3"
                  />
                  {alunoSearchQuery && (
                    <button
                      type="button"
                      className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setAlunoSearchQuery("")}
                    >
                      ✕
                    </button>
                  )}
                </div>
                {alunoSearchQuery && (
                  <div className="max-h-60 overflow-y-auto rounded-md border border-gray-300">
                    {filteredAlunos.length > 0 ? (
                      filteredAlunos.map((aluno) => (
                        <div
                          key={aluno.id}
                          className="cursor-pointer border-b border-gray-200 p-3 hover:bg-gray-100"
                          onClick={() => selectAluno(aluno)}
                        >
                          <p className="font-medium">
                            {aluno.nome} {aluno.sobrenome}
                          </p>
                          <p className="text-sm text-gray-600">
                            CPF: {aluno.cpf}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-gray-500">
                        Nenhum aluno encontrado
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Seção de Seleção de Livro */}
        <div>
          <h2 className="mb-3 text-xl font-semibold">2. Selecione o Livro</h2>
          <div className="space-y-4">
            {selectedLivro ? (
              <div className="flex items-center justify-between rounded-md border border-gray-300 bg-gray-50 p-3">
                <div>
                  <p className="font-medium">{selectedLivro.titulo}</p>
                  <p className="text-sm text-gray-600">
                    Autor: {selectedLivro.autor} | Editora:{" "}
                    {selectedLivro.editora}
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-md bg-gray-200 px-2 py-1 text-sm hover:bg-gray-300"
                  onClick={() => {
                    setSelectedLivro(null);
                    setSelectedTiragem(null);
                  }}
                >
                  Alterar
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por título ou autor..."
                    value={livroSearchQuery}
                    onChange={(e) => setLivroSearchQuery(e.target.value)}
                    className="w-full rounded-md border border-gray-300 p-2 pl-3"
                  />
                  {livroSearchQuery && (
                    <button
                      type="button"
                      className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setLivroSearchQuery("")}
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto rounded-md border border-gray-300">
                  {filteredLivros.length > 0 ? (
                    filteredLivros.map((livro) => {
                      // Verificar se há tiragens disponíveis
                      const temTiragemDisponivel = livro.tiragens?.some(
                        (t) => t.disponivel,
                      );

                      return (
                        <div
                          key={livro.id}
                          className={`border-b border-gray-200 p-3 ${
                            temTiragemDisponivel
                              ? "cursor-pointer hover:bg-gray-100"
                              : "cursor-not-allowed bg-gray-100 opacity-70"
                          }`}
                          onClick={() => {
                            if (temTiragemDisponivel) {
                              selectLivro(livro);
                            }
                          }}
                        >
                          <p className="font-medium">
                            {livro.titulo}
                            {!temTiragemDisponivel && (
                              <span className="ml-2 text-xs text-red-600">
                                (Sem exemplares disponíveis)
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-600">
                            Autor: {livro.autor} | Editora: {livro.editora}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-3 text-center text-gray-500">
                      Nenhum livro encontrado
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Botão de Envio */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={!selectedAluno || !selectedTiragem || isLoading}
            className={`w-full rounded-md ${
              !selectedAluno || !selectedTiragem || isLoading
                ? "cursor-not-allowed bg-gray-300"
                : "bg-blue-600 hover:bg-blue-700"
            } px-4 py-3 font-medium text-white`}
          >
            {isLoading ? "Registrando..." : "Registrar Empréstimo"}
          </button>
        </div>
      </form>
    </div>
  );
}
