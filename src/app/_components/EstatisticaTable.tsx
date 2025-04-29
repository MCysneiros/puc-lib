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
    <div className="mx-auto mt-8 w-full max-w-xl">
      <table className="w-full rounded bg-[#e6e6e6] text-black shadow">
        <thead>
          <tr>
            <th className="p-2 text-left">Estatística</th>
            <th className="p-2 text-left">Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2">Total de Alunos</td>
            <td className="p-2">{estatistica.total_alunos}</td>
          </tr>
          <tr>
            <td className="p-2">Total de Livros</td>
            <td className="p-2">{estatistica.total_livros}</td>
          </tr>
          <tr>
            <td className="p-2">Total de Tiragens</td>
            <td className="p-2">{estatistica.total_tiragens}</td>
          </tr>
          <tr>
            <td className="p-2">Livros Disponíveis</td>
            <td className="p-2">{estatistica.livros_disponiveis}</td>
          </tr>
          <tr>
            <td className="p-2">Livros Emprestados</td>
            <td className="p-2">{estatistica.livros_emprestados}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
