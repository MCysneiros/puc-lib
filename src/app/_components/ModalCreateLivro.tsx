"use client";

import { useState } from "react";
import { api } from "~/trpc/client";
import type { Livro } from "~/server/api/routers/livros";

interface ModalCreateLivroProps {
  authToken: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function ModalCreateLivro({ 
  authToken, 
  isOpen, 
  setIsOpen 
}: ModalCreateLivroProps) {
  const [formData, setFormData] = useState<Livro>({
    titulo: "",
    descricao: "",
    editora: "",
    autor: "",
    ano_publicacao: "",
  });

  const { mutate: createLivro } = api.livro.createLivro.useMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createLivro({
      ...formData,
      authToken,
    });
    setIsOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-background rounded-xl p-8 w-full max-w-md shadow-lg hover:shadow-xl transition-shadow duration-300 z-50"
          >
            <h2 className="text-3xl font-bold text-foreground mb-6">Novo Livro</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Editora</label>
                <input
                  type="text"
                  name="editora"
                  value={formData.editora}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Autor</label>
                <input
                  type="text"
                  name="autor"
                  value={formData.autor}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ano de Publicação</label>
                <input
                  type="number"
                  name="ano_publicacao"
                  value={formData.ano_publicacao}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-6 py-3 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium"
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
