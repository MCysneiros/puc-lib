"use client";
import { useParams } from "next/navigation";
import { useAlunosStore } from "~/trpc/alunos-store";
import { useAuthStore } from "~/trpc/auth-store";
import { useState, useEffect } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import { api } from "~/trpc/react";
import type { AlunoWithId } from "~/server/api/routers/alunos";
import type { EmprestimoDTO } from "~/server/api/routers/emprestimo";

// Interface para o aluno com acesso dinâmico às propriedades
type AlunoEditable = AlunoWithId & Record<string, unknown>;

export default function AlunoDetalhePageClient() {
  const { id } = useParams<{ id: string }>();
  const [editedAluno, setEditedAluno] = useState<AlunoEditable | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Buscar o aluno usando um estado local para garantir a reatividade
  const [currentAluno, setCurrentAluno] = useState<AlunoEditable | null>(null);

  // Estado para armazenar os empréstimos do aluno
  const [emprestimos, setEmprestimos] = useState<EmprestimoDTO[]>([]);

  // Buscar aluno do store
  const alunoFromStore = useAlunosStore
    .getState()
    .alunos.find((a) => a.id === Number(id));

  // Hook do tRPC para buscar empréstimos
  const alunoId = Number(id);
  const authToken = useAuthStore.getState().getAccessToken() ?? "";
  
  const emprestimoQuery = api.emprestimo.emprestimosPorAluno.useQuery(
    {
      aluno: alunoId,
      authToken,
    },
    {
      enabled: alunoId > 0 && !!authToken,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      retry: 3,
      retryDelay: 1000, // 1 segundo entre tentativas
    },
  );

  // Atualizar empréstimos quando a query tiver sucesso ou erro
  useEffect(() => {
    // Tratamento quando dados estão disponíveis
    if (emprestimoQuery.isSuccess) {
      if (emprestimoQuery.data) {
        setEmprestimos(emprestimoQuery.data);
      } else {
        // Se a query teve sucesso mas não há dados, definimos uma lista vazia
        setEmprestimos([]);
      }
    }
    
    // Lidar com erros
    if (emprestimoQuery.isError) {
      console.error("Erro ao buscar empréstimos:", emprestimoQuery.error);
      // Não exibimos o erro na UI para não confundir o usuário
      // quando o aluno não tem empréstimos
      setEmprestimos([]);
    }
  }, [emprestimoQuery.isSuccess, emprestimoQuery.data, emprestimoQuery.isError, emprestimoQuery.error]);

  useEffect(() => {
    if (alunoFromStore) {
      // Convertemos para o tipo AlunoEditable para permitir acesso dinâmico às propriedades
      setCurrentAluno(alunoFromStore as AlunoEditable);
    }
  }, [alunoFromStore]);

  // Usar a API tRPC com o mutation hook
  const mutation = api.aluno.editAFieldOfAluno.useMutation({
    onSuccess: (_data) => {
      if (editedAluno) {
        // Convertemos o editedAluno para o tipo esperado antes de chamar editAluno
        const alunoWithIdCompatible = {
          ...editedAluno,
          nascimento:
            typeof editedAluno.nascimento === "string"
              ? new Date(editedAluno.nascimento)
              : editedAluno.nascimento,
        };

        useAlunosStore
          .getState()
          .editAluno(alunoWithIdCompatible as AlunoWithId);
        setCurrentAluno(editedAluno);
        setSuccess("Alterações salvas com sucesso!");
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      }

      setEditMode(false);
      setEditedAluno(null);
    },
    onError: (err) => {
      console.error("Erro ao editar campo:", err);
      setError("Erro ao salvar alterações. Tente novamente.");
    },
  });

  if (!currentAluno) return <div>Aluno não encontrado.</div>;

  const toggleEditMode = () => {
    if (!editMode) {
      setEditMode(true);
      setEditedAluno({ ...currentAluno });
      setError(null);
      setSuccess(null);
    } else {
      setEditMode(false);
      setEditedAluno(null);
      setError(null);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (!editedAluno) return;
    setEditedAluno((prev) => ({ ...prev!, [field]: value }));
  };

  const handleSave = async () => {
    if (!editedAluno) return;

    setError(null);
    setSuccess(null);
    const authToken = useAuthStore.getState().getAccessToken();

    if (!authToken) {
      setError("Erro de autenticação. Faça login novamente.");
      return;
    }

    // Criar objeto com os campos modificados
    const updates: Record<string, unknown> = {};

    // Comparar os campos do objeto editado com o original
    Object.keys(editedAluno).forEach((key) => {
      if (editedAluno[key] !== currentAluno[key]) {
        updates[key] = editedAluno[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      setError("Nenhuma alteração foi feita.");
      return;
    }

    console.log("Salvando alterações:", updates);

    try {
      // Usar o mutation hook definido anteriormente - passar o objeto updates correto
      mutation.mutate({
        id: String(currentAluno.id),
        authToken: authToken,
        updates: updates as {
          cpf?: string;
          nome?: string;
          sobrenome?: string;
          nascimento?: string;
          email?: string;
          tel1?: string;
          tel2?: string;
          endereco?: string;
        },
      });
      // Não precisamos esperar pela resposta, já que o onSuccess cuida disso
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Erro ao atualizar o aluno. Tente novamente.");
      }
    }
  };

  // Renderiza o campo com a opção de edição
  const renderField = (label: string, field: string, value: unknown) => {
    const originalValue = currentAluno[field];
    const isChanged = editedAluno && editedAluno[field] !== originalValue;

    return (
      <div className="mb-2">
        <div className="flex items-center">
          <div className="flex-grow">
            <b>{label}:</b>{" "}
            {editMode ? (
              <input
                type="text"
                value={editedAluno ? String(editedAluno[field]) : String(value)}
                onChange={(e) => handleInputChange(field, e.target.value)}
                className={`ml-2 border p-1 ${isChanged ? "border-blue-500" : ""}`}
                disabled={mutation.isPending}
              />
            ) : (
              <span>{String(value)}</span>
            )}
          </div>
        </div>
        {isChanged && editMode && (
          <div className="mt-1 pl-4 text-sm text-blue-600">
            Valor original: {String(originalValue)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-card mx-auto mt-10 max-w-md rounded-xl p-8 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-foreground text-2xl font-bold">
          Detalhes do Aluno
        </h2>
        {editMode ? (
          <div className="flex space-x-2">
            <FaSave
              onClick={handleSave}
              className="cursor-pointer text-green-500 hover:text-green-600"
            />
            <FaTimes
              onClick={toggleEditMode}
              className="cursor-pointer text-red-500 hover:text-red-600"
            />
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <button
              onClick={toggleEditMode}
              className="rounded-full bg-blue-600 p-2 text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Editar aluno"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-100 p-2 text-red-700">{error}</div>
      )}

      {success && (
        <div className="mb-4 rounded bg-green-100 p-2 text-green-700">
          {success}
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {renderField("ID", "id", currentAluno.id)}
          {renderField("Nome", "nome", currentAluno.nome)}
          {renderField("Sobrenome", "sobrenome", currentAluno.sobrenome)}
          {renderField("CPF", "cpf", currentAluno.cpf)}
          {renderField(
            "Nascimento",
            "nascimento",
            currentAluno.nascimento instanceof Date
              ? currentAluno.nascimento.toDateString()
              : currentAluno.nascimento,
          )}
          {renderField("Email", "email", currentAluno.email)}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {renderField("Telefone 1", "tel1", currentAluno.tel1)}
          {renderField("Telefone 2", "tel2", currentAluno.tel2 ?? "-")}
          {renderField("Endereço", "endereco", currentAluno.endereco)}
        </div>
      </div>

      {/* Seção de Empréstimos */}
      <div className="mt-8">
        <h3 className="mb-3 text-xl font-semibold">Empréstimos</h3>

        {emprestimoQuery.isLoading ? (
          <p>Carregando empréstimos...</p>
        ) : emprestimos.length > 0 ? (
          <div className="overflow-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b text-left">
                  <th className="text-muted-foreground p-2 text-sm font-medium">
                    Título
                  </th>
                  <th className="text-muted-foreground p-2 text-sm font-medium">
                    Data Empréstimo
                  </th>
                  <th className="text-muted-foreground p-2 text-sm font-medium">
                    Previsão
                  </th>
                  <th className="text-muted-foreground p-2 text-sm font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {emprestimos.map((emprestimo) => (
                  <tr
                    key={emprestimo.id}
                    className="hover:bg-muted/50 border-b"
                  >
                    <td className="p-2 text-sm">{emprestimo.titulo_livro}</td>
                    <td className="p-2 text-sm">
                      {new Date(emprestimo.dt_emprestimo).toLocaleDateString(
                        "pt-BR",
                      )}
                    </td>
                    <td className="p-2 text-sm">
                      {new Date(
                        emprestimo.previsao_devolucao,
                      ).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="p-2 text-sm">
                      {emprestimo.dt_devolucao ? (
                        <span className="inline-flex items-center rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                          Devolvido em{" "}
                          {new Date(emprestimo.dt_devolucao).toLocaleDateString(
                            "pt-BR",
                          )}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700">
                          Em andamento
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground">
            Este aluno não possui empréstimos registrados.
          </p>
        )}

        {emprestimoQuery.error && (
          <p className="text-red-500">
            Erro ao carregar os empréstimos: {emprestimoQuery.error.message}
          </p>
        )}
      </div>

      {/* <ModalCreateAluno
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        aluno={aluno}
      /> */}
    </div>
  );
}
