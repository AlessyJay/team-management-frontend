import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  isAuthReady: boolean;
  setAccessToken: (token: string | null) => void;
  setAuthReady: (ready: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthReady: false,
  setAccessToken: (token) => set({ accessToken: token }),
  setAuthReady: (ready) => set({ isAuthReady: ready }),
  clearAuth: () => set({ accessToken: null, isAuthReady: true }),
}));
