"use client";

import LivrosTable from "./LivrosTable";
import type { LivroDadosResponse } from "~/types";

interface LivrosTableClientProps {
  livros: LivroDadosResponse[];
}

export default function LivrosTableClient({ livros }: LivrosTableClientProps) {
  return <LivrosTable livros={livros} />;
}
