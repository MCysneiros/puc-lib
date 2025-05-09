/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
"use client";
import { useParams } from "next/navigation";
import { useLivrosStore } from "~/trpc/livros-store";

export default function LivroDetalhePageClient() {
  const params = useParams() as { id: string };
  const id = params.id;

  // Use the type-safe store
  const livro = useLivrosStore
    .getState()
    .getLivroById(Number(id));

  console.log("Livro from store:", livro);

  if (!livro) {
    console.log("Cache key:", `livro_${id}`);
    return <div className="text-red-500">Livro não encontrado.</div>;
  }

  return (
    <div className="mx-auto mt-10 max-w-md rounded bg-white p-6 shadow">
      <h2 className="mb-4 text-2xl font-bold">Detalhes do Livro</h2>
      <div className="space-y-4">
        <div>
          <b className="mb-1 block">ID:</b>
          <span>{livro.id}</span>
        </div>
        <div>
          <b className="mb-1 block">Título:</b>
          <span>{livro.titulo}</span>
        </div>
        <div>
          <b className="mb-1 block">Descrição:</b>
          <span>{livro.descricao}</span>
        </div>
        <div>
          <b className="mb-1 block">Editora:</b>
          <span>{livro.editora}</span>
        </div>
        <div>
          <b className="mb-1 block">Autor:</b>
          <span>{livro.autor}</span>
        </div>
        <div>
          <b className="mb-1 block">Ano de Publicação:</b>
          <span>{livro.ano_publicacao}</span>
        </div>
        <div>
          <b className="mb-1 block">Total de Exemplares:</b>
          <span>{livro.total_exemplares}</span>
        </div>
        {livro.tiragens && livro.tiragens.length > 0 && (
          <div className="mt-6">
            <div className="rounded bg-gray-100 p-4">
              <h3 className="mb-4 text-lg font-semibold">Tiragens</h3>
              <div className="space-y-3">
                {livro.tiragens.map((tiragem, idx) => (
                  <div
                    key={idx}
                    className="rounded border bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">ISBN:</span>
                      <span>{tiragem.isbn}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Disponível:</span>
                      <span>{tiragem.disponivel ? "Sim" : "Não"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
