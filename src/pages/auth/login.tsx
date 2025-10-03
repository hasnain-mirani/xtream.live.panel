import { useState } from "react";
import Navbar from "@/components/site/Navbar";
import { useRouter } from "next/router";

export default function UserLogin() {
  const r = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const j = await res.json().catch(()=> ({}));
    setLoading(false);
    if (!res.ok) { setErr(j.message || "Login failed"); return; }
    r.push("/dashboard");
  };

  return (
    <>
      <Navbar />
      <main className="bg-black text-white min-h-screen">
        <div className="mx-auto max-w-md px-4 py-16">
          <h1 className="text-3xl font-bold mb-6">Login</h1>
          {err && <p className="text-red-400 mb-4">{err}</p>}
          <form onSubmit={submit} className="space-y-4">
            <input className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3"
              placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
            <input className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3"
              placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
            <button disabled={loading}
              className="w-full rounded-xl bg-rose-500 hover:bg-rose-600 px-4 py-3 font-semibold">
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <p className="mt-4 text-sm text-white/70">
            Don’t have an account?{" "}
            <a href="/auth/register?trial=1" className="text-white underline">Start a free trial</a>
          </p>
        </div>
      </main>
    </>
  );
}
