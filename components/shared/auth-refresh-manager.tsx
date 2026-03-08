"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

const AUTH_PAGES = ["/login", "/signup"];

type Claims = {
  exp?: number;
};

function decodeJwt(token: string): Claims | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );

    return JSON.parse(atob(padded)) as Claims;
  } catch {
    return null;
  }
}

// Returns how many ms until we should refresh (30s before expiry).
// Returns 0 if we're already past that threshold.
// Returns null if the token can't be decoded.
function getMsUntilRefresh(token: string): number | null {
  const payload = decodeJwt(token);
  if (!payload?.exp) return null;

  const refreshAtMs = payload.exp * 1000 - 30_000;
  return Math.max(refreshAtMs - Date.now(), 0);
}

export function AuthRefreshManager() {
  const pathname = usePathname();
  const router = useRouter();

  const accessToken = useAuthStore((s) => s.accessToken);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setAuthReady = useAuthStore((s) => s.setAuthReady);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  const handleLogout = useCallback(() => {
    clearAuth();
    router.push("/login");
  }, [clearAuth, router]);

  const doRefresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        handleLogout();
        return;
      }

      const data = (await res.json()) as { accessToken: string };
      setAccessToken(data.accessToken);
      setAuthReady(true);
    } catch {
      handleLogout();
    }
  }, [setAccessToken, setAuthReady, handleLogout]);

  // --- Boot hydration ---
  // On every page load the Zustand store resets to null because it's in-memory.
  // The HttpOnly access_token cookie persists, but JS can't read it.
  // So on mount, if the store is empty and we're on a protected page,
  // immediately call refresh to rehydrate the store from the cookie.
  // If the cookie is gone or expired, the refresh endpoint returns 401
  // and we redirect to login.
  useEffect(() => {
    if (isAuthPage) {
      // On auth pages, the user isn't logged in — nothing to hydrate.
      setAuthReady(true);
      return;
    }

    if (!accessToken) {
      // Protected page, store is empty — boot hydration needed.
      doRefresh();
    } else {
      setAuthReady(true);
    }
    // Intentionally runs once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Proactive refresh timer ---
  // Whenever the store gets a new access token (from login or from a refresh),
  // schedule the next refresh to fire 30 seconds before it expires.
  // This chains: each successful refresh triggers this effect again with the
  // new token, scheduling the next one indefinitely until logout.
  useEffect(() => {
    if (!accessToken) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const delay = getMsUntilRefresh(accessToken);
    if (delay === null) return;

    timerRef.current = setTimeout(doRefresh, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [accessToken, doRefresh]);

  return null;
}
