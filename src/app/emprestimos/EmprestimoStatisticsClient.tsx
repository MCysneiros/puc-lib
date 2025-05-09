"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "~/trpc/auth-store";
import { api } from "~/trpc/react";
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

export default function EmprestimoStatisticsClient() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalAlunos: 0,
    totalLivros: 0,
    totalTiragens: 0,
    livrosDisponiveis: 0,
    livrosEmprestados: 0,
    emprestimosPorMes: [] as { name: string; emprestimos: number }[],
    topLivros: [] as { name: string; emprestimos: number }[],
  });

  const authToken = useAuthStore.getState().getAccessToken();
  
  // Buscar estatísticas de alunos
  const alunosQuery = api.aluno.getAllAlunos.useQuery(
    { authToken: authToken ?? "" },
    { enabled: !!authToken, refetchOnWindowFocus: false }
  );
  
  // Buscar estatísticas de livros
  const livrosQuery = api.livro.getTodosLivros.useQuery(
    { authToken: authToken ?? "" },
    { enabled: !!authToken, refetchOnWindowFocus: false }
  );
  
  // Buscar estatísticas de empréstimos
  const emprestimosQuery = api.emprestimo.todosOsEmprestimos.useQuery(
    { authToken: authToken ?? "" },
    { enabled: !!authToken, refetchOnWindowFocus: false }
  );

  useEffect(() => {
    if (
      alunosQuery.data &&
      livrosQuery.data &&
      emprestimosQuery.data
    ) {
      const livros = Array.isArray(livrosQuery.data) ? livrosQuery.data : [];
      const emprestimos = emprestimosQuery.data;
      
      // Calcular estatísticas
      const livrosDisponiveis = livros.reduce(
        (count, livro) => 
          count + (livro.tiragens?.filter(t => t.disponivel)?.length || 0), 
        0
      );
      
      const totalTiragens = livros.reduce(
        (count, livro) => count + (livro.tiragens?.length || 0), 
        0
      );
      
      // Calcular empréstimos por mês (últimos 6 meses)
      const hoje = new Date();
      const emprestimosPorMes: { name: string; emprestimos: number }[] = [];
      
      for (let i = 5; i >= 0; i--) {
        const data = new Date(hoje);
        data.setMonth(hoje.getMonth() - i);
        const mes = data.toLocaleString('pt-BR', { month: 'short' });
        const ano = data.getFullYear();
        const label = `${mes}/${ano.toString().substring(2, 4)}`;
        
        // Filtrar empréstimos para este mês
        const count = emprestimos.filter(emp => {
          const empDate = new Date(emp.dt_emprestimo);
          return empDate.getMonth() === data.getMonth() && 
                 empDate.getFullYear() === data.getFullYear();
        }).length;
        
        emprestimosPorMes.push({ name: label, emprestimos: count });
      }
      
      // Calcular os 5 livros mais emprestados
      const livrosMap = new Map<string, number>();
      emprestimos.forEach(emp => {
        if (!emp.titulo_livro) return;
        
        const count = livrosMap.get(emp.titulo_livro) ?? 0;
        livrosMap.set(emp.titulo_livro, count + 1);
      });
      
      const topLivros = Array.from(livrosMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, numEmprestimos]) => ({ name, emprestimos: numEmprestimos }));
      
      setStats({
        totalAlunos: alunosQuery.data.length,
        totalLivros: livros.length,
        totalTiragens,
        livrosDisponiveis,
        livrosEmprestados: totalTiragens - livrosDisponiveis,
        emprestimosPorMes,
        topLivros,
      });
      
      setIsLoading(false);
    }
    
    if (alunosQuery.error || livrosQuery.error || emprestimosQuery.error) {
      setError(
        "Erro ao carregar estatísticas. Por favor, tente novamente mais tarde."
      );
      setIsLoading(false);
    }
  }, [alunosQuery.data, alunosQuery.error, livrosQuery.data, livrosQuery.error, emprestimosQuery.data, emprestimosQuery.error]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  const pieData = [
    { name: 'Disponíveis', value: stats.livrosDisponiveis },
    { name: 'Emprestados', value: stats.livrosEmprestados },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center p-8 h-64 items-center">
        <div className="text-center">
          <p className="text-gray-600">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center p-8">
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg transition-all duration-300 hover:shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-700">Total de Alunos</h3>
            <p className="text-gray-500 text-sm mt-1">Alunos cadastrados no sistema</p>
          </div>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalAlunos}</p>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg transition-all duration-300 hover:shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-700">Total de Livros</h3>
            <p className="text-gray-500 text-sm mt-1">Livros no acervo</p>
          </div>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalLivros}</p>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg transition-all duration-300 hover:shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-700">Total de Exemplares</h3>
            <p className="text-gray-500 text-sm mt-1">Exemplares cadastrados</p>
          </div>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalTiragens}</p>
        </div>
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de disponibilidade de livros */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Disponibilidade de Exemplares</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
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
