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
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-800">Empréstimos</h2>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab("novo")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                activeTab === "novo"
                  ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400"
              }`}
            >
              Novo Empréstimo
            </button>
            <button
              onClick={() => setActiveTab("lista")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                activeTab === "lista"
                  ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400"
              }`}
            >
              Listar Empréstimos
            </button>
          </div>
        </div>
        <p className="text-gray-600 mb-6">
          Gerencie os empréstimos de livros para alunos
        </p>

        <div className="overflow-x-auto bg-white rounded-lg">
          {activeTab === "novo" && (
            <div className="p-4">
              <EmprestimoPageClient alunos={alunos} livros={livros} />
            </div>
          )}
          {activeTab === "lista" && (
            <div className="p-4">
              <ListaEmprestimosClient />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
