"use client";

import { useState } from "react";
import { api } from "~/trpc/client";
import { useAuthStore } from "~/trpc/auth-store";

// Define a safe form type that uses string for all form fields
type AlunoFormData = {
  cpf: string;
  nome: string;
  sobrenome: string;
  nascimento: string;
  email: string;
  tel1: string;
  tel2: string;
  endereco: string;
};

export default function ModalCreateAluno() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<AlunoFormData>({
    cpf: "",
    nome: "",
    sobrenome: "",
    nascimento: "", // Keep as string for form handling
    email: "",
    tel1: "",
    tel2: "",
    endereco: "",
  });
  
  // Get authentication token from auth store
  const authToken = useAuthStore.getState().getAccessToken() ?? "";

  const { mutate: createAluno } = api.aluno.createAluno.useMutation({
    onSuccess: () => {
      setIsOpen(false);
      // Reload the page to show the new student
      window.location.reload();
    },
    onError: () => {
      // Simple error handling
      alert(`Erro ao criar aluno. Tente novamente.`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
        
    // Make sure we have all required fields
    if (!formData.nome || !formData.cpf) {
      alert("Por favor, preencha os campos obrigatórios");
      return;
    }
    
    // Type-safe cast for API call
    const payload = {
      ...formData,
      authToken,
    };
    
    createAluno(payload);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: AlunoFormData) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
      >
        Novo Aluno
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Novo Aluno</h2>
            <p className="text-gray-600 mb-6">Cadastre um novo aluno no sistema</p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                  <input
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sobrenome</label>
                  <input
                    type="text"
                    name="sobrenome"
                    value={formData.sobrenome}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nascimento</label>
                  <input
                    type="date"
                    name="nascimento"
                    value={formData.nascimento}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone 1</label>
                  <input
                    type="tel"
                    name="tel1"
                    value={formData.tel1}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone 2</label>
                  <input
                    type="tel"
                    name="tel2"
                    value={formData.tel2}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                <textarea
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-8">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
