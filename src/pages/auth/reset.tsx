import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Reset() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string|null>(null);

  useEffect(()=> setToken(String(router.query.token || "")), [router.query.token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const r = await fetch("/api/auth/reset", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ token, password }) });
    if (r.ok) router.push("/auth/login"); else setMsg("Invalid/expired");
  };

  return (
    <main className="max-w-md mx-auto my-10 space-y-4">
      <h1 className="text-2xl font-bold">Reset Password</h1>
      <form onSubmit={submit} className="space-y-3">
        <div><Label htmlFor="token">Token</Label><Input id="token" value={token} onChange={(e)=>setToken(e.target.value)} required /></div>
        <div><Label htmlFor="password">New Password</Label><Input id="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required /></div>
        <Button className="rounded-2xl" type="submit">Reset</Button>
        {msg && <p className="text-red-600 text-sm">{msg}</p>}
      </form>
    </main>
  );
}
