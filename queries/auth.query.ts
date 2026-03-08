import { useAuthStore } from "@/store/auth.store";

interface LoginRequestProps {
  email: string;
  password: string;
}

export const LoginRequest = async ({ email, password }: LoginRequestProps) => {
  const setToken = useAuthStore.getState().setAccessToken;

  try {
    const fetching = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!fetching) throw new Error("Failed to login. Please try again.");

    const data = await fetching.json();

    setToken(data.accessToken);

    return data;
  } catch (error) {
    console.error(error);
    useAuthStore.getState().clearAuth();
  }
};
