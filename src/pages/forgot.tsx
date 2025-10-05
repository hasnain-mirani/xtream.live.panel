// pages/forgot.tsx
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setErr("Enter a valid email.");
      return;
    }
    setErr(null); setLoading(true);
    try {
      const r = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
      setSent(true);
    } catch (e: any) {
      setErr(e?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Forgot password — XtrmIPTV</title>
        <meta name="description" content="Reset your XtrmIPTV password." />
      </Head>

      <main className="min-h-screen grid place-items-center px-4 py-10 bg-gradient-to-b from-gray-50 to-white">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border bg-white/70 backdrop-blur p-6 shadow-sm ring-1 ring-black/5">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white font-bold">XI</div>
              <h1 className="text-2xl font-bold tracking-tight">Forgot your password?</h1>
              <p className="mt-1 text-sm text-gray-600">
                Enter your email and we’ll send you a secure reset link.
              </p>
            </div>

            {sent ? (
              <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                If an account exists for <b>{email}</b>, a reset link has been emailed. Please check your inbox and spam.
              </div>
            ) : (
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium">Email</label>
                  <input
                    id="email"
                    type="email"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {err && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {err}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full rounded-lg px-4 py-2.5 font-medium text-white transition ${loading ? "bg-black/40" : "bg-black hover:opacity-90"}`}
                >
                  {loading ? "Sending…" : "Send reset link"}
                </button>

                <div className="text-center text-sm">
                  Back to{" "}
                  <Link href="/login" className="underline underline-offset-2">Sign in</Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
