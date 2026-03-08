import { useAuthStore } from "@/store/auth.store";

interface LoginPayload {
  email: string;
  password: string;
}

export const LoginRequest = async ({ email, password }: LoginPayload) => {
  const { setAccessToken, setUser } = useAuthStore.getState();

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message ?? "Failed to login. Please try again.");
  }

  const data = (await res.json()) as {
    accessToken: string;
    userId: string;
    email: string;
  };

  setAccessToken(data.accessToken);
  setUser(data.userId, data.email);

  return data;
};

export const LogoutRequest = async () => {
  const { clearAuth } = useAuthStore.getState();

  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  }).catch(() => null);

  clearAuth();
};
