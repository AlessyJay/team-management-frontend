import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  userId: string | null;
  email: string | null;
  isAuthReady: boolean;
  setAccessToken: (token: string | null) => void;
  setAuthReady: (ready: boolean) => void;
  setUser: (userId: string, email: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  userId: null,
  email: null,
  isAuthReady: false,
  setAccessToken: (token) => set({ accessToken: token }),
  setAuthReady: (ready) => set({ isAuthReady: ready }),
  setUser: (userId, email) => set({ userId, email }),
  clearAuth: () =>
    set({ accessToken: null, userId: null, email: null, isAuthReady: true }),
}));
