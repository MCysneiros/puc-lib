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
  const [showModal, setShowModal] = useState(false);

  // Buscar o aluno usando um estado local para garantir a reatividade
  const [currentAluno, setCurrentAluno] = useState<AlunoEditable | null>(null);

  // Estado para armazenar os empréstimos do aluno
  const [emprestimos, setEmprestimos] = useState<EmprestimoDTO[]>([]);

  // Buscar aluno do store
  const alunoFromStore = useAlunosStore
    .getState()
    .alunos.find((a) => a.id === Number(id));

  // Hook do tRPC para buscar empréstimos
  const emprestimoQuery = api.emprestimo.emprestimosPorAluno.useQuery(
    {
      aluno: currentAluno?.id ?? 0,
      authToken: useAuthStore.getState().getAccessToken() ?? "",
    },
    {
      enabled: !!currentAluno && !!useAuthStore.getState().getAccessToken(),
    },
  );

  // Atualizar empréstimos quando a query tiver sucesso
  useEffect(() => {
    if (emprestimoQuery.data) {
      setEmprestimos(emprestimoQuery.data);
    }
  }, [emprestimoQuery.data]);

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

    try {
      try {
        await api.aluno.editAluno.mutate({
          id: String(editedAluno.id),
          authToken,
          updates: {
            cpf: editedAluno.cpf,
            nome: editedAluno.nome,
            sobrenome: editedAluno.sobrenome,
            nascimento: editedAluno.nascimento,
            email: editedAluno.email,
            tel1: editedAluno.tel1,
            tel2: editedAluno.tel2,
            endereco: editedAluno.endereco,
          },
        });
        setSuccess("Aluno atualizado com sucesso!");
        setEditMode(false);
        setCurrentAluno(editedAluno);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Erro ao atualizar o aluno. Tente novamente.");
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Erro ao atualizar o aluno. Tente novamente.");
      }
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

    // Chamar a API tRPC com o token armazenado no auth-store
    mutation.mutate({
      id: String(currentAluno.id),
      authToken,
      updates,
    });
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
          <div className="flex items-center gap-4"></div>
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
