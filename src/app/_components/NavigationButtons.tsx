"use client";

import { useRouter } from "next/navigation";

export default function NavigationButtons() {
  const router = useRouter();

  return (
    <>
      <button
        onClick={() => router.push("/emprestimos")}
        className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary rounded-md px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:outline-none"
      >
        Ver Empréstimos
      </button>

      <button
        onClick={() => router.push("/alunos")}
        className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary rounded-md px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:outline-none"
      >
        Ver Alunos
      </button>
    </>
  );
}
