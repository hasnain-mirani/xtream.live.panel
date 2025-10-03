import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Navbar from "@/components/site/Navbar";

export default function UserRegister() {
  const r = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [trial, setTrial] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setTrial(r.query.trial === "1"); }, [r.query.trial]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, trial }),
    });
    const j = await res.json().catch(()=> ({}));
    setLoading(false);
    if (!res.ok) { setErr(j.message || "Registration failed"); return; }
    r.push("/dashboard");
  };

  return (
    <>
      <Navbar />
      <main className="bg-black text-white min-h-screen">
        <div className="mx-auto max-w-md px-4 py-16">
          <h1 className="text-3xl font-bold mb-6">Create your account</h1>
          {err && <p className="text-red-400 mb-4">{err}</p>}
          <form onSubmit={submit} className="space-y-4">
            <input className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3"
              placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
            <input className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3"
              placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
            <input className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3"
              placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={trial} onChange={e=>setTrial(e.target.checked)} /> Start free 48h trial
            </label>
            <button disabled={loading}
              className="w-full rounded-xl bg-rose-500 hover:bg-rose-600 px-4 py-3 font-semibold">
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>
          <p className="mt-4 text-sm text-white/70">
            Already have an account? <a href="/auth/login" className="text-white underline">Login</a>
          </p>
        </div>
      </main>
    </>
  );
}
