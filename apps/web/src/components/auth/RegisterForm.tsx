"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { authApi, ApiError } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";

const registerSchema = z
  .object({
    email: z.string().email("Enter a valid email"),
    username: z
      .string()
      .min(3, "At least 3 characters")
      .max(30, "At most 30 characters")
      .regex(/^[a-zA-Z0-9_-]+$/, "Letters, numbers, _ and - only"),
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const setTokens = useAuthStore((s) => s.setTokens);
  const closeAuthModal = useAuthStore((s) => s.closeAuthModal);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const data = await authApi.register(
        values.email,
        values.username,
        values.password
      );
      setTokens(data.access_token, data.refresh_token, data.user);
      onSuccess?.();
      closeAuthModal();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Registration failed. Try again.";
      setError("root", { message });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="space-y-1">
        <label
          htmlFor="register-email"
          className="block text-sm font-medium text-slate-700"
        >
          Email
        </label>
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1 disabled:opacity-50"
          placeholder="you@example.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label
          htmlFor="register-username"
          className="block text-sm font-medium text-slate-700"
        >
          Username
        </label>
        <input
          id="register-username"
          type="text"
          autoComplete="username"
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1 disabled:opacity-50"
          placeholder="wordmaster"
          {...register("username")}
        />
        {errors.username && (
          <p className="text-xs text-red-600">{errors.username.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label
          htmlFor="register-password"
          className="block text-sm font-medium text-slate-700"
        >
          Password
        </label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1 disabled:opacity-50"
          placeholder="••••••••"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label
          htmlFor="register-confirm"
          className="block text-sm font-medium text-slate-700"
        >
          Confirm password
        </label>
        <input
          id="register-confirm"
          type="password"
          autoComplete="new-password"
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1 disabled:opacity-50"
          placeholder="••••••••"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      {errors.root && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {errors.root.message}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <button
          type="button"
          className="font-medium text-slate-900 underline-offset-2 hover:underline"
          onClick={onSwitchToLogin}
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
