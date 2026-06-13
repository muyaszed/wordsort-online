"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { GoogleOAuthButton } from "./GoogleOAuthButton";

export function AuthModal() {
  const authModal = useAuthStore((s) => s.authModal);
  const openLogin = useAuthStore((s) => s.openLogin);
  const openRegister = useAuthStore((s) => s.openRegister);
  const closeAuthModal = useAuthStore((s) => s.closeAuthModal);

  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (authModal === "closed") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuthModal();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [authModal, closeAuthModal]);

  // Prevent body scroll when open
  useEffect(() => {
    if (authModal !== "closed") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [authModal]);

  return (
    <AnimatePresence>
      {authModal !== "closed" && (
        <motion.div
          ref={overlayRef}
          key="auth-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(e) => {
            if (e.target === overlayRef.current) closeAuthModal();
          }}
        >
          <motion.div
            key="auth-panel"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
          >
            <button
              type="button"
              onClick={closeAuthModal}
              className="absolute right-4 top-4 text-slate-400 transition-colors hover:text-slate-700"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <h2 className="mb-1 text-lg font-semibold text-slate-900">
              {authModal === "login" ? "Sign in" : "Create account"}
            </h2>
            <p className="mb-5 text-sm text-slate-500">
              {authModal === "login"
                ? "Sign in to save your scores and streaks."
                : "Join to track your scores and compete."}
            </p>

            <GoogleOAuthButton
              label={
                authModal === "login"
                  ? "Sign in with Google"
                  : "Sign up with Google"
              }
            />

            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-xs text-slate-400">or</span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            {authModal === "login" ? (
              <LoginForm onSwitchToRegister={openRegister} />
            ) : (
              <RegisterForm onSwitchToLogin={openLogin} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
