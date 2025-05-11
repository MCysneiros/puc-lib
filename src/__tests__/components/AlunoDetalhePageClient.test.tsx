import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AlunoDetalhePageClient from "~/app/alunos/[id]/AlunoDetalhePageClient";

import { vi } from 'vitest';
import "../../__tests__/mocks/nextJsMocks";

vi.mock("next/navigation", () => {
  const mockNextNavigation = vi.importActual(
    "../../__tests__/mocks/nextJsMocks",
  );
  return {
    ...mockNextNavigation,
    useParams: (): { id: string } => ({ id: "1" }),
  };
});

// Mock the stores
const mockAlunoData = {
  id: 1,
  cpf: "12345678900",
  nome: "Test",
  sobrenome: "Student",
  nascimento: new Date("2000-01-01"),
  email: "test.student@example.com",
  tel1: "123456789",
  tel2: "987654321",
  endereco: "Test Address 123",
};

vi.mock("~/trpc/alunos-store", () => {
  return {
    useAlunosStore: {
      getState: (): {
        alunos: (typeof mockAlunoData)[];
        editAluno: vi.Mock;
      } => ({
        alunos: [mockAlunoData],
        editAluno: vi.fn(),
      }),
    },
  };
});

vi.mock("~/trpc/auth-store", () => {
  return {
    useAuthStore: {
      getState: (): { getAccessToken: () => string } => ({
        getAccessToken: (): string => "fake-token",
      }),
    },
  };
});

// Define types for mutation parameters and data
interface MutationParams {
  onSuccess: (data: typeof mockAlunoData) => void;
  onError: (error: Error) => void;
}

interface EditAlunoData {
  authToken: string;
  [key: string]: unknown;
}

// Mock the tRPC API
const mockEmprestimos = [
  {
    id: 1,
    aluno: 1,
    titulo_livro: "Test Book",
    dt_emprestimo: new Date("2023-01-01").toISOString(),
    previsao_devolucao: new Date("2023-01-15").toISOString(),
    dt_devolucao: null,
  },
  {
    id: 2,
    aluno: 1,
    titulo_livro: "Another Book",
    dt_emprestimo: new Date("2023-02-01").toISOString(),
    previsao_devolucao: new Date("2023-02-15").toISOString(),
    dt_devolucao: new Date("2023-02-10").toISOString(),
  },
];

vi.mock("~/trpc/react", () => ({
  api: {
    emprestimo: {
      emprestimosPorAluno: {
        useQuery: () => ({
          data: mockEmprestimos,
          isLoading: false,
          isSuccess: true,
          isError: false,
          error: null,
        }),
      },
    },
    aluno: {
      editAFieldOfAluno: {
        useMutation: ({ onSuccess, onError }: MutationParams) => ({
          mutate: (data: EditAlunoData) => {
            // Simulate successful mutation
            // Use optional chaining for safer access
            if (data?.authToken) {
              onSuccess(mockAlunoData);
            } else {
              onError(new Error("Mutation failed"));
            }
          },
          isLoading: false,
        }),
      },
    },
  },
}));

describe("AlunoDetalhePageClient Component", () => {
  it("renders emprestimos section correctly", () => {
    render(<AlunoDetalhePageClient />);

    // Check if the subheading and table headers are rendered instead of the old section title
    expect(screen.getByText("Informações pessoais e histórico de empréstimos")).toBeInTheDocument();
    expect(screen.getByText("Título")).toBeInTheDocument();
    expect(screen.getByText("Data Empréstimo")).toBeInTheDocument();
    expect(screen.getByText("Previsão")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();

    // Check if emprestimos table is rendered with correct data
    expect(screen.getByText("Test Book")).toBeInTheDocument();
    expect(screen.getByText("Another Book")).toBeInTheDocument();

    // Check if status is rendered correctly
    expect(screen.getByText("Em andamento")).toBeInTheDocument();
    expect(screen.getByText(/^Devolvido em \d{2}\/\d{2}\/\d{4}$/)).toBeInTheDocument();
  });

  it("toggles edit mode when edit button is clicked", () => {
    render(<AlunoDetalhePageClient />);

    // Find and click the edit button
    const editButton = screen.getByRole("button", { name: /Editar/i });
    fireEvent.click(editButton);

    // Should now be in edit mode with editable inputs
    // There should be at least one textbox (editable input)
    const inputs = screen.getAllByRole("textbox");
    expect(inputs.length).toBeGreaterThan(0);

    // Cancel button should be visible
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  it("updates input values in edit mode", async () => {
    render(<AlunoDetalhePageClient />);

    // Enter edit mode
    const editButton = screen.getByRole("button", { name: /Editar/i });
    fireEvent.click(editButton);

    // Find email input and change its value
    const emailInput = screen.getByDisplayValue("test.student@example.com");
    fireEvent.change(emailInput, {
      target: { value: "new.email@example.com" },
    });
    // Value should be updated
    expect(emailInput).toHaveValue("new.email@example.com");
  });

  it("saves changes when save button is clicked", async () => {
    render(<AlunoDetalhePageClient />);

    // Enter edit mode
    const editButton = screen.getByRole("button", { name: /Editar/i });
    fireEvent.click(editButton);

    // Find email input and change its value
    const emailInput = screen.getByDisplayValue("test.student@example.com");
    fireEvent.change(emailInput, {
      target: { value: "new.email@example.com" },
    });

    // Click save button
    const saveButton = screen.getByRole("button", { name: /Salvar/i });
    fireEvent.click(saveButton);

    // Should show success message (wait for async mutation)
    await waitFor(() => {
      expect(screen.getByText("Alterações salvas com sucesso!")).toBeInTheDocument();
    });
  });

  it("cancels edit mode when cancel button is clicked", () => {
    render(<AlunoDetalhePageClient />);

    // Enter edit mode
    const editButton = screen.getByRole("button", { name: /Editar/i });
    fireEvent.click(editButton);

    // Find email input and change its value
    const emailInput = screen.getByDisplayValue("test.student@example.com");
    fireEvent.change(emailInput, {
      target: { value: "new.email@example.com" },
    });

    // Click cancel button
    const cancelButton = screen.getByRole("button", { name: /Cancelar/i });
    fireEvent.click(cancelButton);

    // Should exit edit mode and revert changes
    // Should exit edit mode and revert changes
    expect(screen.queryByDisplayValue("new.email@example.com")).not.toBeInTheDocument();
    expect(screen.getByText("test.student@example.com")).toBeInTheDocument();
  });
});
