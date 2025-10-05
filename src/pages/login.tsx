// pages/login.tsx
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

type FormState = {
  email: string;
  password: string;
  remember: boolean;
};

const initial: FormState = { email: "", password: "", remember: true };

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initial);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(form.email.trim()), [form.email]);
  const pwValid = form.password.length >= 8;
  const canSubmit = emailValid && pwValid && !loading;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
          remember: form.remember, // if your API supports longer cookie maxAge when true
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);

      // Redirect: ?next=/dashboard (fallback to /dashboard)
      const next = (router.query.next as string) || "/dashboard";
      router.push(next);
    } catch (e: any) {
      setErr(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  // Clear error as user edits
  useEffect(() => {
    if (err) setErr(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.email, form.password]);

  return (
    <>
      <Head>
        <title>Sign in — XtrmIPTV</title>
        <meta name="description" content="Sign in to your XtrmIPTV account." />
      </Head>

      <main className="min-h-screen grid place-items-center px-4 py-10 bg-gradient-to-b from-gray-50 to-white">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="rounded-2xl border bg-white/70 backdrop-blur p-6 shadow-sm ring-1 ring-black/5">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white font-bold">XI</div>
              <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
              <p className="mt-1 text-sm text-gray-600">
                Sign in to manage your subscription and invoices.
              </p>
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none transition
                    ${!emailValid && form.email ? "border-red-400 focus:ring-2 focus:ring-red-200" : "border-gray-300 focus:ring-2 focus:ring-black/10"}`}
                  value={form.email}
                  onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                />
                {!emailValid && form.email && (
                  <p className="mt-1 text-xs text-red-600">Enter a valid email.</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <div className="mt-1 flex rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-black/10">
                  <input
                    id="password"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="At least 8 characters"
                    className="w-full rounded-l-lg px-3 py-2 outline-none"
                    value={form.password}
                    onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="rounded-r-lg px-3 text-sm text-gray-600 hover:text-black"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>
                {!pwValid && form.password && (
                  <p className="mt-1 text-xs text-red-600">Minimum 8 characters.</p>
                )}
              </div>

              {/* Row: remember + forgot */}
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={form.remember}
                    onChange={(e) => setForm((s) => ({ ...s, remember: e.target.checked }))}
                  />
                  Remember me
                </label>
                <Link href="/forgot" className="text-sm underline underline-offset-2 hover:opacity-80">
                  Forgot password?
                </Link>
              </div>

              {/* Error */}
              {err && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {err}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!canSubmit}
                className={`w-full rounded-lg px-4 py-2.5 font-medium text-white transition
                  ${canSubmit ? "bg-black hover:opacity-90" : "bg-black/40 cursor-not-allowed"}`}
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <div className="h-px flex-1 bg-gray-200" />
                or
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              {/* Secondary actions */}
              <div className="text-center text-sm">
                New to XtrmIPTV?{" "}
                <Link href="/register" className="font-medium underline underline-offset-2">
                  Create an account
                </Link>
              </div>
            </form>
          </div>

          {/* Footer note */}
          <p className="mt-4 text-center text-xs text-gray-500">
            By signing in you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-2">Terms</Link> and{" "}
            <Link href="/privacy" className="underline underline-offset-2">Privacy Policy</Link>.
          </p>
        </div>
      </main>
    </>
  );
}
