"use client";

import { useState } from "react";
import EmprestimoPageClient from "./EmprestimoPageClient";
import ListaEmprestimosClient from "./ListaEmprestimosClient";
import type { AlunoWithId } from "~/server/api/routers/alunos";
import type { LivroDadosResponse } from "~/server/api/routers/livros";

type Tab = "novo" | "lista";

interface EmprestimosTabsClientProps {
  alunos: AlunoWithId[];
  livros: LivroDadosResponse[];
}

export default function EmprestimosTabsClient({
  alunos,
  livros,
}: EmprestimosTabsClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("novo");

  return (
    <div className="w-full">
      <div className="mb-4 border-b border-gray-200">
        <ul className="-mb-px flex flex-wrap text-center text-sm font-medium">
          <li className="mr-2">
            <button
              className={`inline-block p-4 ${
                activeTab === "novo"
                  ? "active rounded-t-lg border-b-2 border-blue-600 text-blue-600"
                  : "border-transparent hover:border-gray-300 hover:text-gray-600"
              }`}
              onClick={() => setActiveTab("novo")}
            >
              Novo Empréstimo
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 ${
                activeTab === "lista"
                  ? "active rounded-t-lg border-b-2 border-blue-600 text-blue-600"
                  : "border-transparent hover:border-gray-300 hover:text-gray-600"
              }`}
              onClick={() => setActiveTab("lista")}
            >
              Listar Empréstimos
            </button>
          </li>
        </ul>
      </div>

      <div className="pt-2">
        {activeTab === "novo" ? (
          <EmprestimoPageClient alunos={alunos} livros={livros} />
        ) : (
          <ListaEmprestimosClient />
        )}
      </div>
    </div>
  );
}
