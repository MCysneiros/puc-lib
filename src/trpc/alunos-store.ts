import { create } from "zustand";
import type { AlunoWithId } from "~/server/api/routers/alunos";

type AlunoStore = {
  alunos: AlunoWithId[];
  setAlunos: (alunos: AlunoWithId[]) => void;
  getAlunoById: (id: number) => AlunoWithId | undefined;
  editAluno: (aluno: AlunoWithId) => void;
};

export const useAlunosStore = create<AlunoStore>((set, get) => ({
  alunos: [],
  setAlunos: (alunos) => set({ alunos }),
  getAllAlunos: () => get().alunos,
  getAlunoById: (id) => get().alunos.find((a) => a.id === id),
  editAluno: (editedAluno) =>
    set((state) => ({
      alunos: state.alunos.map((aluno) =>
        aluno.id === editedAluno.id ? editedAluno : aluno,
      ),
    })),
}));
