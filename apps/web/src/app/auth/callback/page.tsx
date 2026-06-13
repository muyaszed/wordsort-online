"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setTokens = useAuthStore((s) => s.setTokens);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const storedState = sessionStorage.getItem("oauth_state");
    const codeVerifier = sessionStorage.getItem("oauth_code_verifier");

    sessionStorage.removeItem("oauth_state");
    sessionStorage.removeItem("oauth_code_verifier");

    if (!code || !codeVerifier || state !== storedState) {
      router.replace("/?auth=error");
      return;
    }

    authApi
      .googleCallback(code, codeVerifier)
      .then((data) => {
        setTokens(data.access_token, data.refresh_token, data.user);
        router.replace("/");
      })
      .catch(() => {
        router.replace("/?auth=error");
      });
  }, [searchParams, setTokens, router]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-sm text-slate-500">Completing sign-in…</p>
    </div>
  );
}
