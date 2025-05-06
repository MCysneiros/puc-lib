"use client";

import { useEffect } from "react";
import { useAuthStore } from "~/trpc/auth-store";

interface AuthTokenInitializerProps {
  accessToken: string;
  refreshToken: string;
}

export default function AuthTokenInitializer({
  accessToken,
  refreshToken,
}: AuthTokenInitializerProps) {
  useEffect(() => {
    // Inicializa os tokens no store do Zustand quando o componente é montado no cliente
    if (accessToken && refreshToken) {
      useAuthStore.getState().setTokens(accessToken, refreshToken);
    }
  }, [accessToken, refreshToken]);

  // Este componente não renderiza nada visualmente
  return null;
}
