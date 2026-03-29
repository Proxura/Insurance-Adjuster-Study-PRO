"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isSupabaseConfigured()) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="mb-2 font-mono text-2xl font-bold text-accent-2">
            CortX
          </h1>
          <p className="mb-4 text-sm text-muted">
            Authentication is not configured yet. You can still study without an account.
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-accent px-6 py-2.5 text-sm font-bold text-white"
          >
            Start Studying
          </Link>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    if (!supabase) {
      setError("Authentication is not configured.");
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    window.location.href = "/";
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center font-mono text-2xl font-bold text-accent-2">
          CortX
        </h1>
        <p className="mb-8 text-center text-sm text-muted">
          Sign in to continue studying
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red/30 bg-red/10 px-3 py-2 text-sm text-red">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none placeholder:text-dim focus:border-accent"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none placeholder:text-dim focus:border-accent"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full rounded-lg border border-border bg-surface py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-2"
        >
          Continue with Google
        </button>

        <p className="mt-6 text-center text-xs text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-accent-2 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
