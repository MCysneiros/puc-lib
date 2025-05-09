"use client";

interface EstatisticaData {
  total_alunos: number;
  total_livros: number;
  total_tiragens: number;
  livros_disponiveis: number;
  livros_emprestados: number;
}

export default function EstatisticaTable({
  estatistica,
}: {
  estatistica: EstatisticaData;
}) {
  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full rounded-lg border-collapse overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="border-b border-gray-200 p-3 text-left text-sm font-semibold text-gray-700">Estatística</th>
              <th className="border-b border-gray-200 p-3 text-left text-sm font-semibold text-gray-700">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            <tr className="hover:bg-gray-50 transition-colors duration-150">
              <td className="p-3 text-sm text-gray-700">Total de Alunos</td>
              <td className="p-3 text-sm font-medium text-gray-800">{estatistica.total_alunos}</td>
            </tr>
            <tr className="hover:bg-gray-50 transition-colors duration-150">
              <td className="p-3 text-sm text-gray-700">Total de Livros</td>
              <td className="p-3 text-sm font-medium text-gray-800">{estatistica.total_livros}</td>
            </tr>
            <tr className="hover:bg-gray-50 transition-colors duration-150">
              <td className="p-3 text-sm text-gray-700">Total de Exemplares</td>
              <td className="p-3 text-sm font-medium text-gray-800">{estatistica.total_tiragens}</td>
            </tr>
            <tr className="hover:bg-gray-50 transition-colors duration-150">
              <td className="p-3 text-sm text-gray-700">Exemplares Disponíveis</td>
              <td className="p-3 text-sm font-medium text-gray-800">{estatistica.livros_disponiveis}</td>
            </tr>
            <tr className="hover:bg-gray-50 transition-colors duration-150">
              <td className="p-3 text-sm text-gray-700">Exemplares Emprestados</td>
              <td className="p-3 text-sm font-medium text-gray-800">{estatistica.livros_emprestados}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
