"use client";
import { useParams } from "next/navigation";
import { useAlunosStore } from "~/trpc/alunos-store";
import { useAuthStore } from "~/trpc/auth-store";
import { useState, useEffect } from "react";
import { FaEdit, FaTimes, FaSave } from "react-icons/fa";
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

  const handleSave = () => {
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
    <div className="mx-auto mt-10 max-w-md rounded bg-white p-6 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Detalhes do Aluno</h2>
        {editMode ? (
          <div className="flex space-x-2">
            <FaSave
              className={`cursor-pointer text-xl ${mutation.isPending ? "text-gray-400" : "text-green-600"}`}
              onClick={!mutation.isPending ? handleSave : undefined}
              title="Salvar todas as alterações"
            />
            <FaTimes
              className="cursor-pointer text-xl text-red-600"
              onClick={toggleEditMode}
              title="Cancelar edição"
            />
          </div>
        ) : (
          <FaEdit
            className="cursor-pointer text-xl text-blue-600"
            onClick={toggleEditMode}
            title="Editar informações"
          />
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

      <div className="mb-2">
        <b>ID:</b> {currentAluno.id}
      </div>
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
      {renderField("Telefone 1", "tel1", currentAluno.tel1)}
      {renderField("Telefone 2", "tel2", currentAluno.tel2 ?? "-")}
      {renderField("Endereço", "endereco", currentAluno.endereco)}

      {/* Seção de Empréstimos */}
      <div className="mt-8">
        <h3 className="mb-3 text-xl font-semibold">Empréstimos</h3>

        {emprestimoQuery.isLoading ? (
          <p>Carregando empréstimos...</p>
        ) : emprestimos.length > 0 ? (
          <div className="overflow-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-100 text-left">
                  <th className="p-2 text-sm">Título</th>
                  <th className="p-2 text-sm">Data Empréstimo</th>
                  <th className="p-2 text-sm">Previsão</th>
                  <th className="p-2 text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {emprestimos.map((emprestimo) => (
                  <tr key={emprestimo.id} className="border-b hover:bg-gray-50">
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
                        <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">
                          Devolvido em{" "}
                          {new Date(emprestimo.dt_devolucao).toLocaleDateString(
                            "pt-BR",
                          )}
                        </span>
                      ) : (
                        <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
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
          <p className="text-gray-500">
            Este aluno não possui empréstimos registrados.
          </p>
        )}

        {emprestimoQuery.error && (
          <p className="text-red-500">
            Erro ao carregar os empréstimos: {emprestimoQuery.error.message}
          </p>
        )}
      </div>
    </div>
  );
}
