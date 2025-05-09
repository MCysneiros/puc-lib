"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useRouter } from "next/navigation";
import type { LivroData } from "~/types/livro";
import { useLivrosStore } from "~/trpc/livros-store";
import { useEffect } from "react";

export function LivrosTable({ livros }: { livros: LivroData[] }) {
  const router = useRouter();

  useEffect(() => {
    useLivrosStore.setState({ livros });
  }, [livros]);

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="px-4 py-2">
          <h1 className="text-3xl font-bold text-gray-800">
            Catálogo de Livros
          </h1>
          <p className="text-gray-600 mt-1">Visualize e gerencie o acervo da biblioteca</p>
        </div>
      </div>

      <div className="border border-gray-200 bg-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-gray-200">
              <TableHead className="py-4 px-6 text-sm font-semibold text-gray-700">Título</TableHead>
              <TableHead className="py-4 px-6 text-sm font-semibold text-gray-700">Descrição</TableHead>
              <TableHead className="py-4 px-6 text-sm font-semibold text-gray-700">Editora</TableHead>
              <TableHead className="py-4 px-6 text-sm font-semibold text-gray-700">Autor</TableHead>
              <TableHead className="py-4 px-6 text-sm font-semibold text-gray-700">Ano</TableHead>
              <TableHead className="py-4 px-6 text-sm font-semibold text-gray-700">Total de Exemplares</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {livros.map((livro) => (
              <TableRow
                key={livro.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => {
                  router.push(`/${livro.id}`);
                }}
              >
                <TableCell className="py-4 px-6 font-medium border-b border-gray-100">
                  {livro.titulo}
                </TableCell>
                <TableCell
                  className="py-4 px-6 relative cursor-pointer font-medium border-b border-gray-100"
                  draggable="true"
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", livro.descricao);
                  }}
                  onDragEnd={(e) => {
                    e.preventDefault();
                  }}
                >
                  <div className="max-h-[5rem] overflow-y-auto">
                    <div className="scrollbar-thin scrollbar-thumb-gray-400/50 scrollbar-track-transparent scrollbar-thumb-rounded-lg">
                      {livro.descricao}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6 font-medium border-b border-gray-100">
                  {livro.editora}
                </TableCell>
                <TableCell className="py-4 px-6 font-medium border-b border-gray-100">
                  {livro.autor}
                </TableCell>
                <TableCell className="py-4 px-6 font-medium border-b border-gray-100">
                  {livro.ano_publicacao}
                </TableCell>
                <TableCell className="py-4 px-6 font-medium border-b border-gray-100">
                  {livro.total_exemplares}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
