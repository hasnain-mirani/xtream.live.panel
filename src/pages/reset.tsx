// pages/reset.tsx
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ResetPage() {
  const router = useRouter();
  const { token, email } = router.query as { token?: string; email?: string };

  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setErr(null); }, [pw1, pw2]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !email) return setErr("Invalid or missing reset link.");
    if (pw1.length < 8) return setErr("Password must be at least 8 characters.");
    if (pw1 !== pw2) return setErr("Passwords do not match.");
    setErr(null); setLoading(true);
    try {
      const r = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password: pw1 }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
      setOk(true);
      setTimeout(() => router.push("/login"), 1200);
    } catch (e: any) {
      setErr(e?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Reset password — XtrmIPTV</title>
        <meta name="description" content="Choose a new password." />
      </Head>

      <main className="min-h-screen grid place-items-center px-4 py-10 bg-gradient-to-b from-gray-50 to-white">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border bg-white/70 backdrop-blur p-6 shadow-sm ring-1 ring-black/5">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white font-bold">XI</div>
              <h1 className="text-2xl font-bold tracking-tight">Set a new password</h1>
              <p className="mt-1 text-sm text-gray-600">
                For: <b>{email || "—"}</b>
              </p>
            </div>

            {ok ? (
              <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                Password updated. Redirecting to sign in…
              </div>
            ) : (
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="pw1" className="block text-sm font-medium">New password</label>
                  <div className="mt-1 flex rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-black/10">
                    <input
                      id="pw1"
                      type={show ? "text" : "password"}
                      className="w-full rounded-l-lg px-3 py-2 outline-none"
                      placeholder="At least 8 characters"
                      value={pw1}
                      onChange={(e) => setPw1(e.target.value)}
                    />
                    <button type="button" onClick={() => setShow((s) => !s)} className="rounded-r-lg px-3 text-sm text-gray-600 hover:text-black">
                      {show ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="pw2" className="block text-sm font-medium">Confirm password</label>
                  <input
                    id="pw2"
                    type={show ? "text" : "password"}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
                    value={pw2}
                    onChange={(e) => setPw2(e.target.value)}
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
                  {loading ? "Saving…" : "Save new password"}
                </button>

                <div className="text-center text-sm">
                  Back to{" "}
                  <Link href="/login" className="underline underline-offset-2">
                    Sign in
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
