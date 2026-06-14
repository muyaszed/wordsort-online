"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const user = useAuthStore((s) => s.user);
  const openLogin = useAuthStore((s) => s.openLogin);
  const logout = useAuthStore((s) => s.logout);
  const pathname = usePathname();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-sm",
        className
      )}
    >
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <div className="flex items-center gap-5">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-slate-900 hover:text-indigo-600 transition-colors"
          >
            Wordsort
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/leaderboard"
              className={cn(
                "rounded-md px-2.5 py-1 text-sm font-medium transition-colors",
                pathname === "/leaderboard"
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              )}
            >
              Leaderboard
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 tabular-nums">
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <User size={14} className="text-slate-400" />
                {user.username}
              </span>
              <button
                type="button"
                onClick={() => logout()}
                className="text-slate-400 transition-colors hover:text-slate-700"
                aria-label="Sign out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={openLogin}
            >
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
