import Protected from "@/components/Protected";
import { useEffect, useState } from "react";

export default function Profile() {
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<string|null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(async (r) => {
      if (!r.ok) return;
      const { user } = await r.json();
      setName(user?.name || "");
    });
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const r = await fetch("/api/auth/update", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ name })
    });
    const j = await r.json().catch(()=>({message:"error"}));
    setMsg(r.ok ? "Saved" : (j.message || "Error"));
  };

  return (
    <Protected>
      <main style={{maxWidth: 600, margin:"40px auto", padding: 16}}>
        <h1>Profile</h1>
        <form onSubmit={save} style={{display:"grid", gap: 12}}>
          <input value={name} onChange={(e)=>setName(e.target.value)} />
          <button type="submit">Save</button>
          {msg && <p>{msg}</p>}
        </form>
      </main>
    </Protected>
  );
}
