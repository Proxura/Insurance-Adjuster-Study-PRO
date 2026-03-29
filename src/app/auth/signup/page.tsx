"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="mb-2 font-mono text-2xl font-bold text-green">
            Check Your Email
          </h1>
          <p className="text-sm text-muted">
            We sent a confirmation link to <strong className="text-text">{email}</strong>.
            Click it to activate your account.
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-block text-sm text-accent-2 hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center font-mono text-2xl font-bold text-accent-2">
          CORTEX
        </h1>
        <p className="mb-8 text-center text-sm text-muted">
          Create your account
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red/30 bg-red/10 px-3 py-2 text-sm text-red">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-3">
          <input
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none placeholder:text-dim focus:border-accent"
          />
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
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none placeholder:text-dim focus:border-accent"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-accent-2 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
