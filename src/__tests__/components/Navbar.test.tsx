import React from 'react';
import { render, screen } from '@testing-library/react';

import Navbar from '~/app/_components/Navbar';

// Import and setup mocks
import '../../__tests__/mocks/nextJsMocks';

describe('Navbar Component', () => {
  it('renders correctly with all navigation items', () => {
    render(<Navbar />);
    
    // Check if the title is rendered
    expect(screen.getByText('Biblioteca')).toBeInTheDocument();
    
    // Check if all navigation items are rendered
    expect(screen.getByText(/Livros/)).toBeInTheDocument();
    expect(screen.getByText(/Alunos/)).toBeInTheDocument();
    expect(screen.getByText(/Empréstimos/)).toBeInTheDocument();
    expect(screen.getByText(/Estatística/)).toBeInTheDocument();
    
    // Check if the links have the correct hrefs
    const livrosLink = screen.getByText(/Livros/).closest('a');
    const alunosLink = screen.getByText(/Alunos/).closest('a');
    const emprestimosLink = screen.getByText(/Empréstimos/).closest('a');
    const estatisticaLink = screen.getByText(/Estatística/).closest('a');
    
    expect(livrosLink).toHaveAttribute('href', '/');
    expect(alunosLink).toHaveAttribute('href', '/alunos');
    expect(emprestimosLink).toHaveAttribute('href', '/emprestimos');
    expect(estatisticaLink).toHaveAttribute('href', '/estatistica');
  });
});
