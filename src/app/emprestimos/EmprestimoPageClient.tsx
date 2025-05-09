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

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const resetForm = () => {
    setSelectedAluno(null);
    setSelectedLivro(null);
    setSelectedTiragem(null);
    setAlunoSearchQuery("");
    setLivroSearchQuery("");
  };

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
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Mensagens de erro e sucesso */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-700 border border-green-200">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {success}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Seção de Seleção de Aluno */}
          <div>
            <h2 className="text-2xl font-bold mb-4">1. Selecione o Aluno</h2>
            <div className="space-y-6">
              {selectedAluno ? (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold">
                        {selectedAluno.nome} {selectedAluno.sobrenome}
                      </p>
                      <p className="text-gray-600">CPF: {selectedAluno.cpf}</p>
                    </div>
                    <button
                      type="button"
                      className="text-sm text-gray-600 hover:text-gray-800"
                      onClick={() => setSelectedAluno(null)}
                    >
                      Alterar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar por nome ou CPF do aluno..."
                      value={alunoSearchQuery}
                      onChange={(e) => setAlunoSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {alunoSearchQuery && (
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setAlunoSearchQuery("")}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  {alunoSearchQuery && (
                    <div className="max-h-60 overflow-y-auto rounded-lg border border-gray-200">
                      {filteredAlunos.length > 0 ? (
                        filteredAlunos.map((aluno) => (
                          <div
                            key={aluno.id}
                            className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                            onClick={() => selectAluno(aluno)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">
                                  {aluno.nome} {aluno.sobrenome}
                                </p>
                                <p className="text-sm text-gray-600">
                                  CPF: {aluno.cpf}
                                </p>
                              </div>
                              <button
                                type="button"
                                className="text-blue-600 hover:text-blue-800"
                                onClick={() => selectAluno(aluno)}
                              >
                                Selecionar
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          Nenhum aluno encontrado
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Seção de Seleção de Livro */}
          <div>
            <h2 className="text-2xl font-bold mb-4">2. Selecione o Livro</h2>
            <div className="space-y-6">
              {selectedLivro ? (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold">{selectedLivro.titulo}</p>
                      <p className="text-gray-600">
                        Autor: {selectedLivro.autor} | Editora: {selectedLivro.editora}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-sm text-gray-600 hover:text-gray-800"
                      onClick={() => {
                        setSelectedLivro(null);
                        setSelectedTiragem(null);
                      }}
                    >
                      Alterar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar por título ou autor..."
                      value={livroSearchQuery}
                      onChange={(e) => setLivroSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {livroSearchQuery && (
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setLivroSearchQuery("")}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto rounded-lg border border-gray-200">
                    {filteredLivros.length > 0 ? (
                      filteredLivros.map((livro) => {
                        const temTiragemDisponivel = livro.tiragens?.some(
                          (t) => t.disponivel,
                        );

                        return (
                          <div
                            key={livro.id}
                            className={`border-b border-gray-200 p-3 ${
                              temTiragemDisponivel
                                ? "cursor-pointer hover:bg-gray-50"
                                : "cursor-not-allowed bg-gray-100 opacity-70"
                            }`}
                            onClick={() => {
                              if (temTiragemDisponivel) {
                                selectLivro(livro);
                              }
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
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
                              {temTiragemDisponivel && (
                                <button
                                  type="button"
                                  className="text-blue-600 hover:text-blue-800"
                                  onClick={() => selectLivro(livro)}
                                >
                                  Selecionar
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        Nenhum livro encontrado
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botão de Empréstimo */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={!selectedAluno || !selectedTiragem}
              className={`w-full py-3 rounded-lg font-semibold ${
                selectedAluno && selectedTiragem
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-400 text-gray-700 cursor-not-allowed"
              }`}
            >
              {isLoading ? "Registrando empréstimo..." : "Registrar Empréstimo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
