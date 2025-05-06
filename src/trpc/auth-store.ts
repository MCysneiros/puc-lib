import { create } from "zustand";

type AuthStore = {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
  getAccessToken: () => string | null;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
  clearTokens: () => set({ accessToken: null, refreshToken: null }),
  getAccessToken: () => get().accessToken,
}));
