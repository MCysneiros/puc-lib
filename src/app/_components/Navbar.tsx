"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="flex w-full items-center justify-center bg-[#e6e6e6] px-8 py-4 shadow-md">
      <ul className="flex h-full gap-8 text-lg font-semibold text-black">
        <li
          className={
            pathname === "/alunos" ? "h-full rounded bg-[#99e599]" : "h-full"
          }
        >
          <Link
            href="/alunos"
            className={`flex h-full items-center px-2 hover:underline px-2${pathname === "/alunos" ? "text-white" : ""}`}
          >
            Alunos
          </Link>
        </li>
        <li
          className={
            pathname === "/emprestimo"
              ? "h-full rounded bg-[#99e599]"
              : "h-full"
          }
        >
          <Link
            href="/emprestimo"
            className={`flex h-full items-center px-2 hover:underline px-2${pathname === "/emprestimo" ? "text-white" : ""}`}
          >
            Empréstimo
          </Link>
        </li>
        <li
          className={
            pathname === "/estatistica"
              ? "h-full rounded bg-[#99e599]"
              : "h-full"
          }
        >
          <Link
            href="/estatistica"
            className={`flex h-full items-center px-2 hover:underline px-2${pathname === "/estatistica" ? "text-white" : ""}`}
          >
            Estatística
          </Link>
        </li>
        <li
          className={
            pathname === "/" ? "h-full rounded bg-[#99e599]" : "h-full"
          }
        >
          <Link
            href="/"
            className={`flex h-full items-center px-2 hover:underline px-2${pathname === "/" ? "text-white" : ""}`}
          >
            Livros
          </Link>
        </li>
      </ul>
    </nav>
  );
}
