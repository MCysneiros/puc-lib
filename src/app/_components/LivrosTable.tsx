"use client";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../../components/ui/table";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import type { LivroDadosResponse } from "~/server/api/routers/livros";

export default function LivrosTable({
  livros,
}: {
  livros: LivroDadosResponse[];
}) {
  const columns = useMemo<ColumnDef<LivroDadosResponse, LivroDadosResponse>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "titulo", header: "Título" },
      { accessorKey: "autor", header: "Autor" },
      { accessorKey: "editora", header: "Editora" },
      { accessorKey: "ano_publicacao", header: "Ano" },
      { accessorKey: "total_exemplares", header: "Total de Exemplares" },
    ],
    [],
  );

  const table = useReactTable({
    data: livros,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            className="cursor-pointer hover:bg-gray-100"
            onClick={() => {
              const id = row.original.id;
              if (id) window.location.href = `/livros/${id}`;
            }}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
