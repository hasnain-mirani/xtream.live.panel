import { useState } from "react";

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [ok, setOk] = useState<boolean | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErr(null);
    setOk(null);
    try {
      const r = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "Failed");
      setOk(true);
    } catch (e: any) {
      setErr(e?.message || "Error");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center px-4 py-10">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border px-3 py-2"
          placeholder="you@example.com"
        />
        <button disabled={pending} className="rounded px-4 py-2 bg-black text-white">
          {pending ? "Sending…" : "Send reset link"}
        </button>
        {ok && <p className="text-sm text-green-600">If that email exists, we sent a link.</p>}
        {err && <p className="text-sm text-rose-600">{err}</p>}
      </form>
    </main>
  );
}
