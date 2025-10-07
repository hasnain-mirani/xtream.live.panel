// src/pages/auth/reset.tsx (minimal shape)
import { useRouter } from "next/router";
import { useState } from "react";

export default function ResetPage() {
  const router = useRouter();
  const { token = "", uid = "" } = router.query as { token?: string; uid?: string };

  const [email, setEmail] = useState("");       // or prefill if you include it in the reset link
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true); setErr(null);
    try {
      const r = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "Reset failed");
      setOk(true);
    } catch (e: any) {
      setErr(e?.message || "Error");
    } finally {
      setPending(false);
    }
  }

  return (
    <main>
      <form onSubmit={onSubmit}>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" />
        <input value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="New password" type="password" />
        <button disabled={pending}>{pending ? "Resetting…" : "Reset password"}</button>
        {ok && <p>Password updated.</p>}
        {err && <p>{err}</p>}
      </form>
    </main>
  );
}

export const getServerSideProps = async () => ({ props: {} }); // avoid SSG build error
