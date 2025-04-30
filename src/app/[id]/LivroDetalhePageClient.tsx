"use client";
import { useParams } from "next/navigation";
import { useLivrosStore } from "~/trpc/livros-store";

export default function LivroDetalhePageClient() {
  const { id } = useParams<{ id: string }>();

  console.log(useLivrosStore.getState());
  const livro = useLivrosStore
    .getState()
    .livros.find((l) => l.id === Number(id));

  if (!livro) return <div>Livro não encontrado.</div>;

  return (
    <div className="mx-auto mt-10 max-w-md rounded bg-white p-6 shadow">
      <h2 className="mb-4 text-2xl font-bold">Detalhes do Livro</h2>
      <div className="mb-2">
        <b>ID:</b> {livro.id}
      </div>
      <div className="mb-2">
        <b>Título:</b> {livro.titulo}
      </div>
      <div className="mb-2">
        <b>Descrição:</b> {livro.descricao}
      </div>
      <div className="mb-2">
        <b>Editora:</b> {livro.editora}
      </div>
      <div className="mb-2">
        <b>Autor:</b> {livro.autor}
      </div>
      <div className="mb-2">
        <b>Ano de Publicação:</b> {livro.ano_publicacao}
      </div>
      <div className="mb-2">
        <b>Total de Exemplares:</b> {livro.total_exemplares}
      </div>
      <div className="mb-2">
        {livro.tiragens && livro.tiragens.length > 0 && (
          <div className="mt-2">
            <div className="rounded bg-gray-100 p-2">
              <div className="mb-2 font-semibold text-black">Tiragens</div>
              <div className="flex flex-col gap-2">
                {livro.tiragens.map((tiragem, idx) => (
                  <div key={idx} className="rounded border bg-white p-2 shadow">
                    {typeof tiragem === "object"
                      ? Object.entries(tiragem).map(([key, value]) => (
                          <div key={key}>
                            <b>{key}:</b> {String(value)}
                          </div>
                        ))
                      : tiragem}
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
