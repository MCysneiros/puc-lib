"use client";
import { useParams } from "next/navigation";
import { useAlunosStore } from "~/trpc/alunos-store";
import { useAuthStore } from "~/trpc/auth-store";
import { useState, useEffect } from "react";
import { FaSave, FaTimes, FaUser, FaCalendar, FaPhone, FaEnvelope, FaIdCard, FaMapMarkerAlt } from "react-icons/fa";
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
  const renderField = (label: string, field: string, value: unknown, icon: React.ReactNode) => {
    const originalValue = currentAluno[field];
    const isChanged = editedAluno && editedAluno[field] !== originalValue;

    return (
      <div className="mb-3 rounded-xl border border-gray-100 p-4 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md">
        <div className="flex items-center">
          <div className="mr-3 text-blue-600">
            {icon}
          </div>
          <div className="flex-grow">
            <span className="font-medium text-gray-700">{label}:</span>{" "}
            {editMode ? (
              <input
                type="text"
                value={editedAluno ? String(editedAluno[field]) : String(value)}
                onChange={(e) => handleInputChange(field, e.target.value)}
                className={`ml-2 rounded-lg border p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isChanged ? "border-blue-500 bg-blue-50" : "border-gray-300"
                }`}
                disabled={mutation.isPending}
              />
            ) : (
              <span className="text-gray-800">{String(value)}</span>
            )}
          </div>
        </div>
        {isChanged && editMode && (
          <div className="mt-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-600">
            <span className="font-medium">Valor original:</span> {String(originalValue)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto mt-10 max-w-3xl transform overflow-hidden rounded-2xl bg-white p-0 shadow-lg transition-all duration-300 hover:shadow-xl">
      {/* Header com gradiente */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">
              Detalhes do Aluno
            </h2>
            <p className="mt-1 text-sm text-blue-100">
              Informações pessoais e histórico de empréstimos
            </p>
          </div>
          {editMode ? (
            <div className="flex space-x-3">
              <button 
                onClick={handleSave}
                className="flex items-center rounded-lg bg-green-500 px-4 py-2 text-white shadow-md transition-all duration-200 hover:bg-green-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
              >
                <FaSave className="mr-2" />
                <span>Salvar</span>
              </button>
              <button 
                onClick={toggleEditMode}
                className="flex items-center rounded-lg bg-red-500 px-4 py-2 text-white shadow-md transition-all duration-200 hover:bg-red-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
              >
                <FaTimes className="mr-2" />
                <span>Cancelar</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={toggleEditMode}
                className="flex items-center rounded-lg bg-white px-4 py-2 text-blue-800 shadow-md transition-all duration-200 hover:bg-blue-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                aria-label="Editar aluno"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <span>Editar</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Conteúdo principal */}
      <div className="p-6">
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-4 text-red-700 shadow-sm">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-xl bg-green-50 p-4 text-green-700 shadow-sm">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md transition-all duration-200 hover:shadow-lg">
          <h3 className="mb-4 text-2xl font-bold text-gray-800">Informações Pessoais</h3>
          <p className="mb-6 text-sm text-gray-500">Dados cadastrais do aluno no sistema de biblioteca</p>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {renderField("ID", "id", currentAluno.id, <FaIdCard className="h-5 w-5" />)}
            {renderField("Nome", "nome", currentAluno.nome, <FaUser className="h-5 w-5" />)}
            {renderField("Sobrenome", "sobrenome", currentAluno.sobrenome, <FaUser className="h-5 w-5" />)}
            {renderField("CPF", "cpf", currentAluno.cpf, <FaIdCard className="h-5 w-5" />)}
            {renderField(
              "Nascimento",
              "nascimento",
              currentAluno.nascimento instanceof Date
                ? currentAluno.nascimento.toDateString()
                : currentAluno.nascimento,
              <FaCalendar className="h-5 w-5" />
            )}
            {renderField("Email", "email", currentAluno.email, <FaEnvelope className="h-5 w-5" />)}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4">
            {renderField("Telefone 1", "tel1", currentAluno.tel1, <FaPhone className="h-5 w-5" />)}
            {renderField("Telefone 2", "tel2", currentAluno.tel2 ?? "-", <FaPhone className="h-5 w-5" />)}
            {renderField("Endereço", "endereco", currentAluno.endereco, <FaMapMarkerAlt className="h-5 w-5" />)}
          </div>
        </div>

        {/* Seção de Empréstimos */}
        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-md transition-all duration-200 hover:shadow-lg">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Empréstimos</h3>
              <p className="mt-1 text-sm text-gray-500">Histórico de empréstimos do aluno</p>
            </div>
            
            <div className="text-right">
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                emprestimos.length > 0 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {emprestimos.length} {emprestimos.length === 1 ? 'empréstimo' : 'empréstimos'}
              </span>
            </div>
          </div>

          {emprestimoQuery.isLoading ? (
            <div className="flex h-24 items-center justify-center rounded-lg bg-gray-50 p-4">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                <p className="text-gray-500">Carregando empréstimos...</p>
              </div>
            </div>
          ) : emprestimos.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="p-3 text-sm font-semibold text-gray-700">
                      Título
                    </th>
                    <th className="p-3 text-sm font-semibold text-gray-700">
                      Data Empréstimo
                    </th>
                    <th className="p-3 text-sm font-semibold text-gray-700">
                      Previsão
                    </th>
                    <th className="p-3 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {emprestimos.map((emprestimo) => (
                    <tr
                      key={emprestimo.id}
                      className="border-t border-gray-200 transition-colors hover:bg-blue-50"
                    >
                      <td className="p-3 text-sm font-medium text-gray-800">{emprestimo.titulo_livro}</td>
                      <td className="p-3 text-sm text-gray-600">
                        {new Date(emprestimo.dt_emprestimo).toLocaleDateString(
                          "pt-BR"
                        )}
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {new Date(
                          emprestimo.previsao_devolucao
                        ).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="p-3 text-sm">
                        {emprestimo.dt_devolucao ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                            Devolvido em{" "}
                            {new Date(emprestimo.dt_devolucao).toLocaleDateString(
                              "pt-BR"
                            )}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
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
            <div className="flex h-32 flex-col items-center justify-center rounded-xl bg-gray-50 p-6 text-center">
              <p className="mb-2 text-lg font-medium text-gray-600">
                Sem empréstimos
              </p>
              <p className="text-sm text-gray-500">
                Este aluno não possui empréstimos registrados.
              </p>
            </div>
          )}

          {emprestimoQuery.error && (
            <div className="mt-4 rounded-lg bg-red-50 p-4 text-red-600">
              <p className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Erro ao carregar os empréstimos: {emprestimoQuery.error.message}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
