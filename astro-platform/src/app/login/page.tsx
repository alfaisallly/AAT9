"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Lock, User, Telescope } from "lucide-react";
import CopyrightFooter from "@/components/CopyrightFooter";
import { fetchJson } from "@/lib/utils";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await fetchJson("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      router.push(from);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#08090c] px-4">
      {/* Background stars */}
      <div className="pointer-events-none absolute inset-0">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute h-px w-px rounded-full bg-white"
            style={{
              top: `${(i * 13) % 100}%`,
              left: `${(i * 17) % 100}%`,
              opacity: 0.1 + (i % 4) * 0.08,
            }}
          />
        ))}
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-[var(--zwo-orange)] opacity-[0.04] blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[var(--zwo-orange)] to-orange-700 shadow-asiair">
            <Telescope size={36} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">AstroLab</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            منصة التصوير الفلكي — ASIAIR Style
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-2xl">
          <h2 className="mb-1 text-lg font-semibold text-white">تسجيل الدخول</h2>
          <p className="mb-6 text-xs text-[var(--muted)]">
            أدخل بيانات حسابك للوصول إلى المنصة
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">اسم المستخدم</label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                />
                <input
                  className="input-field pr-10"
                  type="text"
                  autoComplete="username"
                  placeholder="ahmed.alfaisal"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">كلمة المرور</label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                />
                <input
                  className="input-field pr-10"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full py-3 text-base"
              disabled={loading}
            >
              {loading ? "جاري الدخول..." : "دخول"}
            </button>
          </form>
        </div>

        {/* Owner & copyright */}
        <div className="mt-8 rounded-2xl border border-[var(--card-border)]/50 bg-[var(--card)]/50 p-5 backdrop-blur-sm">
          <div className="mb-3 text-center">
            <p className="text-sm font-semibold text-[var(--zwo-orange)]">
              المطور والمالك
            </p>
            <p className="mt-1 text-lg font-bold text-white">
              Eng. Ahmed alfaisal
            </p>
            <p className="text-sm text-[var(--muted)]">المهندس Ahmed alfaisal</p>
          </div>
          <CopyrightFooter />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#08090c]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--zwo-orange)] border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
