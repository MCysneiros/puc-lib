"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useRouter } from "next/navigation";
import type { AlunoWithId } from "~/server/api/routers/alunos";
import { useAlunosStore } from "~/trpc/alunos-store";

export default function AlunosTable({ alunos }: { alunos: AlunoWithId[] }) {
  const router = useRouter();
  const setAlunos = useAlunosStore((s) => s.setAlunos);

  useEffect(() => {
    setAlunos(alunos);
  }, [alunos, setAlunos]);

  const columns = useMemo<ColumnDef<AlunoWithId, AlunoWithId>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "cpf", header: "CPF" },
      { accessorKey: "nome", header: "Nome" },
      { accessorKey: "sobrenome", header: "Sobrenome" },
      { accessorKey: "nascimento", header: "Nascimento" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "tel1", header: "Telefone 1" },
      { accessorKey: "tel2", header: "Telefone 2" },
      { accessorKey: "endereco", header: "Endereço" },
    ],
    [],
  );

  const table = useReactTable({
    data: alunos,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table className="min-w-full">
      <TableHeader className="bg-muted/50">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody className="bg-card divide-y divide-border">
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id} className="cursor-pointer hover:bg-muted/50">
            {row.getVisibleCells().map((cell) => (
              <TableCell
                key={cell.id}
                className="px-6 py-4 whitespace-nowrap text-sm text-foreground"
                onClick={() => {
                  const id = row.original.id;
                  if (id) router.push(`/alunos/${id}`);
                }}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
