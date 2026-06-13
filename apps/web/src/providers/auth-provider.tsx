"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshAccessToken = useAuthStore((s) => s.refreshAccessToken);
  const initialized = useRef(false);

  // On mount: if we have a persisted refresh token but no access token,
  // attempt a silent refresh to restore the session.
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (refreshToken && !accessToken) {
      refreshAccessToken();
    }
  }, [refreshToken, accessToken, refreshAccessToken]);

  return <>{children}</>;
}
