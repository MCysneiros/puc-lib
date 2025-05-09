"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Interface to match the data structure from the API
interface EstatisticaData {
  total_alunos: number;
  total_livros: number;
  total_tiragens: number;
  livros_disponiveis: number;
  livros_emprestados: number;
}

// Extended interface for the component with additional derived data
interface EstatisticaExtendedData extends EstatisticaData {
  emprestimosPorMes: { name: string; emprestimos: number }[];
  topLivros: { name: string; emprestimos: number }[];
}

// Interface for emprestimos data
interface EmprestimoData {
  id: number;
  aluno?: number;
  tiragem?: number;
  dt_emprestimo: string;
  dt_devolucao?: string | null;
  previsao_devolucao?: string;
  nome_aluno?: string;
  titulo_livro?: string;
}

export default function EstatisticaDashboard({
  estatistica,
  emprestimos = [],
}: {
  estatistica: EstatisticaData;
  emprestimos?: EmprestimoData[];
}) {
  const [stats, setStats] = useState<EstatisticaExtendedData>({
    ...estatistica,
    emprestimosPorMes: [],
    topLivros: [],
  });

  useEffect(() => {
    // Calcular empréstimos por mês (últimos 6 meses)
    const hoje = new Date();
    const emprestimosPorMes: { name: string; emprestimos: number }[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const data = new Date(hoje);
      data.setMonth(hoje.getMonth() - i);
      const mes = data.toLocaleString('pt-BR', { month: 'short' });
      const ano = data.getFullYear();
      const label = `${mes}/${ano.toString().substring(2, 4)}`;
      
      // Mocked data for now - In a real app, we would use the emprestimos array
      // to calculate actual values based on actual data
      const count = Math.floor(Math.random() * 10);
      
      emprestimosPorMes.push({ name: label, emprestimos: count });
    }
    
    // Sample data for top books
    // In a real app, this would be calculated from the actual emprestimos data
    const topLivros = [
      { name: "Dom Quixote", emprestimos: 8 },
      { name: "Pequeno Príncipe", emprestimos: 6 },
      { name: "Harry Potter", emprestimos: 5 },
      { name: "Clean Code", emprestimos: 4 },
      { name: "1984", emprestimos: 3 },
    ];
    
    setStats({
      ...estatistica,
      emprestimosPorMes,
      topLivros,
    });
  }, [estatistica, emprestimos]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  const pieData = [
    { name: 'Disponíveis', value: estatistica.livros_disponiveis },
    { name: 'Emprestados', value: estatistica.livros_emprestados },
  ];

  return (
    <div className="space-y-8">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg transition-all duration-300 hover:shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-700">Total de Alunos</h3>
            <p className="text-gray-500 text-sm mt-1">Alunos cadastrados no sistema</p>
          </div>
          <p className="text-3xl font-bold text-blue-600 mt-2">{estatistica.total_alunos}</p>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg transition-all duration-300 hover:shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-700">Total de Livros</h3>
            <p className="text-gray-500 text-sm mt-1">Livros no acervo</p>
          </div>
          <p className="text-3xl font-bold text-blue-600 mt-2">{estatistica.total_livros}</p>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg transition-all duration-300 hover:shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-700">Total de Exemplares</h3>
            <p className="text-gray-500 text-sm mt-1">Exemplares cadastrados</p>
          </div>
          <p className="text-3xl font-bold text-blue-600 mt-2">{estatistica.total_tiragens}</p>
        </div>
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de disponibilidade de livros */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Disponibilidade de Exemplares</h3>
          <div className="flex">
            {/* First approach: Render pie chart with simpler config */}
            <div className="w-1/2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    paddingAngle={5}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value} exemplares`, 'Quantidade']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Second approach: Display the data with styled text */}
            <div className="w-1/2 flex flex-col justify-center">
              {pieData.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center mb-4">
                  <div 
                    className="w-4 h-4 rounded-full mr-3" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-lg">{entry.name}</span>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold mr-2" style={{ color: COLORS[index % COLORS.length] }}>
                        {entry.value}
                      </span>
                      <span className="text-sm text-gray-500">exemplares</span>
                    </div>
                    <span className="text-sm text-gray-700">
                      {((entry.value / (estatistica.total_tiragens || 1)) * 100).toFixed(0)}% do total
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Gráfico de empréstimos por mês */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Empréstimos por Mês</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats.emprestimosPorMes}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="emprestimos" 
                  stroke="#3b82f6" 
                  activeDot={{ r: 8 }} 
                  name="Empréstimos"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Gráfico de livros mais emprestados */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg transition-all duration-300 hover:shadow-xl col-span-1 lg:col-span-2">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Livros Mais Emprestados</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.topLivros}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="emprestimos" 
                  fill="#3b82f6" 
                  name="Quantidade"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
