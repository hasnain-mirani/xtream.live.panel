import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Verify() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState<string>("");
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => setToken(String(router.query.token || "")), [router.query.token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const r = await fetch("/api/auth/verify", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ email, token, otp }) });
    const j = await r.json().catch(()=>({}));
    if (r.ok) router.push("/dashboard"); else setMsg(j.message || "Invalid/expired");
  };

  return (
    <main className="max-w-md mx-auto my-10 space-y-4">
      <h1 className="text-2xl font-bold">Verify Email</h1>
      <form onSubmit={submit} className="space-y-3">
        <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required /></div>
        <div><Label htmlFor="token">Token (if link)</Label><Input id="token" value={token} onChange={(e)=>setToken(e.target.value)} /></div>
        <div><Label htmlFor="otp">OTP (optional)</Label><Input id="otp" value={otp} onChange={(e)=>setOtp(e.target.value)} /></div>
        <Button className="rounded-2xl" type="submit">Verify</Button>
        {msg && <p className="text-red-600 text-sm">{msg}</p>}
      </form>
    </main>
  );
}
