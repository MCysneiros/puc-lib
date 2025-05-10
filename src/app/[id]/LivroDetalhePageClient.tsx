/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useLivrosStore } from "~/trpc/livros-store";
import { api } from "~/trpc/client";
import { useAuthStore } from "~/trpc/auth-store";

export default function LivroDetalhePageClient() {
  const params = useParams() as { id: string };
  const id = params.id;
  
  // State for new copy form
  const [isbn, setIsbn] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Get auth token
  const getAccessToken = useAuthStore((state) => state.getAccessToken);
  const token = getAccessToken();

  // Use the type-safe store
  const livro = useLivrosStore
    .getState()
    .getLivroById(Number(id));

  console.log("Livro from store:", livro);

  // API utility for data refetching
  const apiUtils = api.useUtils();

  // Create tiragem mutation
  const { mutate: createTiragem } = api.livro.createTiragem.useMutation({
    onSuccess: (data) => {
      console.log("Tiragem created successfully:", data);
      setSuccessMessage("Tiragem adicionada com sucesso!");
      setErrorMessage("");
      setIsbn("");
      setFormOpen(false);
      setIsSubmitting(false);
      
      // Invalidate queries to refresh data
      void apiUtils.livro.getLivro.invalidate({ id: id, authToken: token ?? "" });
      void apiUtils.livro.getTodosLivros.invalidate({ authToken: token ?? "" });

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    },
    onError: (error) => {
      console.error("Error creating tiragem:", error);
      setErrorMessage(error.message || "Erro ao adicionar tiragem. Tente novamente.");
      setSuccessMessage("");
      setIsSubmitting(false);
    },
  });

  // Form submit handler
  const handleSubmitTiragem = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!isbn) {
      setErrorMessage("Por favor, informe o ISBN da tiragem.");
      return;
    }
    
    if (!token) {
      setErrorMessage("Você precisa estar autenticado para adicionar uma tiragem.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    
    // Call the mutation
    createTiragem({
      authToken: token,
      isbn: isbn,
      livro: Number(id),
      disponivel: true,
    });
  };

  if (!livro) {
    console.log("Cache key:", `livro_${id}`);
    return <div className="text-red-500">Livro não encontrado.</div>;
  }

  return (
    <div className="mx-auto mt-10 max-w-2xl rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Detalhes do Livro</h2>
        <button
          onClick={() => setFormOpen(!formOpen)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {formOpen ? "Cancelar" : "Adicionar Tiragem"}
        </button>
      </div>
      
      {/* Success and Error Messages */}
      {successMessage && (
        <div className="mb-4 rounded-xl bg-green-50 p-4 text-green-700 shadow-md">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="mb-4 rounded-xl bg-red-50 p-4 text-red-700 shadow-md">
          {errorMessage}
        </div>
      )}
      
      {/* Add Tiragem Form */}
      {formOpen && (
        <div className="mb-6 rounded-xl border border-gray-200 p-6 shadow-md">
          <h3 className="mb-4 text-xl font-bold text-gray-800">Adicionar Nova Tiragem</h3>
          <form onSubmit={handleSubmitTiragem}>
            <div className="mb-4">
              <label htmlFor="isbn" className="mb-2 block text-sm font-medium text-gray-700">
                ISBN
              </label>
              <input
                type="text"
                id="isbn"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Digite o ISBN do livro"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`rounded-lg px-4 py-2 text-white ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
              >
                {isSubmitting ? "Adicionando..." : "Adicionar"}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="rounded-xl border border-gray-200 p-6">
        <h3 className="mb-4 text-xl font-bold text-gray-800">Informações Básicas</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">ID</p>
              <p className="font-medium">{livro.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Título</p>
              <p className="font-medium">{livro.titulo}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Descrição</p>
            <p className="font-medium">{livro.descricao}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Editora</p>
              <p className="font-medium">{livro.editora}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Autor</p>
              <p className="font-medium">{livro.autor}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Ano de Publicação</p>
              <p className="font-medium">{livro.ano_publicacao}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total de Exemplares</p>
              <p className="font-medium">{livro.total_exemplares}</p>
            </div>
          </div>
        </div>
      </div>
      
      {livro.tiragens && livro.tiragens.length > 0 && (
        <div className="mt-6 rounded-xl border border-gray-200 p-6">
          <h3 className="mb-4 text-xl font-bold text-gray-800">Tiragens Disponíveis</h3>
          <div className="space-y-3">
            {livro.tiragens.map((tiragem, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">ISBN:</span>
                  <span>{tiragem.isbn}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Disponível:</span>
                  <span className={tiragem.disponivel ? "text-green-600" : "text-red-600"}>
                    {tiragem.disponivel ? "Sim" : "Não"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
