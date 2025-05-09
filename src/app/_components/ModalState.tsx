"use client";

import { useState } from "react";
import ModalCreateLivro from "./ModalCreateLivro";

interface ModalStateProps {
  authToken: string;
}

export default function ModalState({ authToken }: ModalStateProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
      >
        Novo Livro
      </button>
      <ModalCreateLivro
        authToken={authToken}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </>
  );
}
