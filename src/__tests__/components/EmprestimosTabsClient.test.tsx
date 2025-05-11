import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock global.fetch to prevent hanging network requests
global.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve({}) })) as any;

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

import EmprestimosTabsClient from '~/app/emprestimos/EmprestimosTabsClient';
import type { AlunoWithId } from '~/server/api/routers/alunos';
import type { LivroDadosResponse } from '~/server/api/routers/livros';

// Import mocks
import '../../__tests__/mocks/nextJsMocks';

// Mock the child components
vi.mock('~/app/emprestimos/EmprestimoPageClient', () => ({
  default: function MockEmprestimoPageClient() {
    return <div data-testid="emprestimo-page">Emprestimo Page Content</div>;
  }
}));

vi.mock('~/app/emprestimos/ListaEmprestimosClient', () => ({
  default: function MockListaEmprestimosClient() {
    return <div data-testid="lista-emprestimos">Lista Emprestimos Content</div>;
  }
}));

describe('EmprestimosTabsClient Component', () => {
  // Mock props
  const mockAlunos: AlunoWithId[] = [
    {
      id: 1,
      cpf: '12345678900',
      nome: 'Test',
      sobrenome: 'Student',
      nascimento: new Date('2000-01-01'),
      email: 'test.student@example.com',
      tel1: '123456789',
      tel2: '987654321',
      endereco: 'Test Address 123',
    },
  ];

  const mockLivros: LivroDadosResponse[] = [
    {
      id: 1,
      titulo: 'Test Book',
      descricao: 'Test Description',
      editora: 'Test Publisher',
      autor: 'Test Author',
      ano_publicacao: 2022,
      total_exemplares: 5,
      url: 'http://example.com/book1',
      tiragens: [
        { id: 3, isbn: 'ISBN456-1', livro: 2, disponivel: true },
        { id: 2, isbn: 'ISBN123-2', livro: 1, disponivel: false },
      ],
    },
  ];

  it('renders the component with default tab active', () => {
    render(<EmprestimosTabsClient alunos={mockAlunos} livros={mockLivros} />);
    
    // Check if heading is rendered
    expect(screen.getByText('Empréstimos')).toBeInTheDocument();
    expect(screen.getByText('Gerencie os empréstimos de livros para alunos')).toBeInTheDocument();
    
    // Check if both tab buttons are rendered
    expect(screen.getByText('Novo Empréstimo')).toBeInTheDocument();
    expect(screen.getByText('Listar Empréstimos')).toBeInTheDocument();
    
    // Check if the default tab content is rendered
    expect(screen.getByTestId('emprestimo-page')).toBeInTheDocument();
    expect(screen.queryByTestId('lista-emprestimos')).not.toBeInTheDocument();
    
    // Check if the Novo Empréstimo button has active styling
    const novoButton = screen.getByText('Novo Empréstimo');
    expect(novoButton).toHaveClass('bg-blue-600');
    expect(novoButton).toHaveClass('text-white');
    
    // Check if the Listar Empréstimos button has inactive styling
    const listarButton = screen.getByText('Listar Empréstimos');
    expect(listarButton).toHaveClass('bg-gray-100');
    expect(listarButton).toHaveClass('text-gray-700');
  });

  it('switches to lista tab when Listar Empréstimos button is clicked', () => {
    render(<EmprestimosTabsClient alunos={mockAlunos} livros={mockLivros} />);
    
    // Click the Listar Empréstimos button
    fireEvent.click(screen.getByText('Listar Empréstimos'));
    
    // Check if the tab content has changed
    expect(screen.queryByTestId('emprestimo-page')).not.toBeInTheDocument();
    expect(screen.getByTestId('lista-emprestimos')).toBeInTheDocument();
    
    // Check if the Listar Empréstimos button now has active styling
    const listarButton = screen.getByText('Listar Empréstimos');
    expect(listarButton).toHaveClass('bg-blue-600');
    expect(listarButton).toHaveClass('text-white');
    
    // Check if the Novo Empréstimo button now has inactive styling
    const novoButton = screen.getByText('Novo Empréstimo');
    expect(novoButton).toHaveClass('bg-gray-100');
    expect(novoButton).toHaveClass('text-gray-700');
  });

  it('switches back to novo tab when Novo Empréstimo button is clicked', () => {
    render(<EmprestimosTabsClient alunos={mockAlunos} livros={mockLivros} />);
    
    // First switch to lista tab
    fireEvent.click(screen.getByText('Listar Empréstimos'));
    
    // Then switch back to novo tab
    fireEvent.click(screen.getByText('Novo Empréstimo'));
    
    // Check if the tab content has changed back
    expect(screen.getByTestId('emprestimo-page')).toBeInTheDocument();
    expect(screen.queryByTestId('lista-emprestimos')).not.toBeInTheDocument();
    
    // Check if the Novo Empréstimo button has active styling again
    const novoButton = screen.getByText('Novo Empréstimo');
    expect(novoButton).toHaveClass('bg-blue-600');
    expect(novoButton).toHaveClass('text-white');
  });

  it('renders with empty arrays as props without crashing', () => {
    render(<EmprestimosTabsClient alunos={[]} livros={[]} />);
    
    // Component should still render without errors
    expect(screen.getByText('Empréstimos')).toBeInTheDocument();
    expect(screen.getByTestId('emprestimo-page')).toBeInTheDocument();
  });
});
