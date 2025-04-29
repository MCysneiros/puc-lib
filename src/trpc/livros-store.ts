import { create } from "zustand";
import type { LivroDadosResponse } from "~/server/api/routers/livros";

// Store para livros

type LivroStore = {
  livros: LivroDadosResponse[];
  setLivros: (livros: LivroDadosResponse[]) => void;
  getLivroById: (id: number) => LivroDadosResponse | undefined;
};

export const useLivrosStore = create<LivroStore>((set, get) => ({
  livros: [],
  setLivros: (livros) => set({ livros }),
  getAllLivros: () => get().livros,
  getLivroById: (id) => get().livros.find((l) => l.id === id),
}));
