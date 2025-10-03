import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [ok, setOk] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/auth/reset-request", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ email }) });
    setOk(true);
  };

  return (
    <main className="max-w-md mx-auto my-10 space-y-4">
      <h1 className="text-2xl font-bold">Forgot Password</h1>
      <form onSubmit={submit} className="space-y-3">
        <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required /></div>
        <Button className="rounded-2xl" type="submit">Send reset link</Button>
      </form>
      {ok && <p className="text-green-600 text-sm">If an account exists, a reset link was sent.</p>}
    </main>
  );
}
