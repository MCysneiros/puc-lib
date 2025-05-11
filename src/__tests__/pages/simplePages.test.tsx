import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

// Import pages
import MainPage from "~/app/page";
import EstatisticaPage from "~/app/estatistica/page";
import AlunosPage from "~/app/alunos/page";
import EmprestimosPage from "~/app/emprestimos/page";

// Simple smoke tests for main project pages

describe("Project Pages", () => {
  it("renders MainPage without crashing", () => {
    render(<MainPage />);
    expect(true).toBe(true);
  });

  it("renders EstatisticaPage without crashing", () => {
    render(<EstatisticaPage />);
    expect(true).toBe(true);
  });

  it("renders AlunosPage without crashing", () => {
    render(<AlunosPage />);
    expect(true).toBe(true);
  });

  it("renders EmprestimosPage without crashing", () => {
    render(<EmprestimosPage />);
    expect(true).toBe(true);
  });
});
