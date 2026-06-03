import { LOGIN_PATH } from "@/const";
import { trpc } from "@/providers/trpc-client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

const DEMO_SESSION_KEY = "embeddedgpt-demo-session";
const DEMO_AUTH_EVENT = "embeddedgpt-demo-auth-change";

const demoUser = {
  id: 0,
  unionId: "local-demo",
  name: "Local Demo Tester",
  email: "demo@embeddedgpt.local",
  avatar: null,
  role: "admin" as const,
  createdAt: new Date(0),
  updatedAt: new Date(0),
  lastSignInAt: new Date(0),
};

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function isDemoModeEnabled() {
  return (
    import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_LOGIN === "true"
  );
}

export function startDemoSession() {
  if (!isDemoModeEnabled()) {
    return false;
  }

  localStorage.setItem(DEMO_SESSION_KEY, "true");
  window.dispatchEvent(new Event(DEMO_AUTH_EVENT));
  return true;
}

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = LOGIN_PATH } =
    options ?? {};
  const demoModeEnabled = isDemoModeEnabled();
  const [isDemoSession, setIsDemoSession] = useState(
    () => demoModeEnabled && localStorage.getItem(DEMO_SESSION_KEY) === "true"
  );

  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = trpc.auth.me.useQuery(undefined, {
    enabled: !isDemoSession,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      navigate(redirectPath);
    },
  });

  const logout = useCallback(() => {
    if (isDemoSession) {
      localStorage.removeItem(DEMO_SESSION_KEY);
      setIsDemoSession(false);
      window.dispatchEvent(new Event(DEMO_AUTH_EVENT));
      navigate(redirectPath);
      return;
    }

    logoutMutation.mutate();
  }, [isDemoSession, logoutMutation, navigate, redirectPath]);

  useEffect(() => {
    const updateDemoSession = () => {
      setIsDemoSession(
        demoModeEnabled && localStorage.getItem(DEMO_SESSION_KEY) === "true"
      );
    };

    window.addEventListener("storage", updateDemoSession);
    window.addEventListener(DEMO_AUTH_EVENT, updateDemoSession);
    return () => {
      window.removeEventListener("storage", updateDemoSession);
      window.removeEventListener(DEMO_AUTH_EVENT, updateDemoSession);
    };
  }, [demoModeEnabled]);

  const resolvedUser = isDemoSession ? demoUser : (user ?? null);
  const resolvedLoading = isDemoSession
    ? false
    : isLoading || logoutMutation.isPending;

  useEffect(() => {
    if (redirectOnUnauthenticated && !resolvedLoading && !resolvedUser) {
      const currentPath = window.location.pathname;
      if (currentPath !== redirectPath) {
        navigate(redirectPath);
      }
    }
  }, [
    redirectOnUnauthenticated,
    resolvedLoading,
    resolvedUser,
    navigate,
    redirectPath,
  ]);

  return useMemo(
    () => ({
      user: resolvedUser,
      isAuthenticated: !!resolvedUser,
      isLoading: resolvedLoading,
      error: isDemoSession ? null : error,
      logout,
      refresh: refetch,
    }),
    [resolvedUser, resolvedLoading, isDemoSession, error, logout, refetch]
  );
}
