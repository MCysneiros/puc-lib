"use client";
import { useParams } from "next/navigation";
import { useAlunosStore } from "~/trpc/alunos-store";

export default function AlunoDetalhePageClient() {
  const { id } = useParams<{ id: string }>();

  console.log({ alunoId: useAlunosStore.getState().alunos });

  const aluno = useAlunosStore
    .getState()
    .alunos.find((a) => a.id === Number(id));

  if (!aluno) return <div>Aluno não encontrado.</div>;

  return (
    <div className="mx-auto mt-10 max-w-md rounded bg-white p-6 shadow">
      <h2 className="mb-4 text-2xl font-bold">Detalhes do Aluno</h2>
      <div className="mb-2">
        <b>ID:</b> {aluno.id}
      </div>
      <div className="mb-2">
        <b>Nome:</b> {aluno.nome} {aluno.sobreNome}
      </div>
      <div className="mb-2">
        <b>CPF:</b> {aluno.cpf}
      </div>
      <div className="mb-2">
        <b>Nascimento:</b>{" "}
        {aluno.nascimento instanceof Date
          ? aluno.nascimento.toDateString()
          : aluno.nascimento}
      </div>
      <div className="mb-2">
        <b>Email:</b> {aluno.email}
      </div>
      <div className="mb-2">
        <b>Telefone 1:</b> {aluno.tel1}
      </div>
      <div className="mb-2">
        <b>Telefone 2:</b> {aluno.tel2}
      </div>
      <div className="mb-2">
        <b>Endereço:</b> {aluno.endereco}
      </div>
    </div>
  );
}
