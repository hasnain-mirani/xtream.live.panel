import { useState } from "react";
import { useRouter } from "next/router";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ email, password }),
    });
    if (r.ok) router.replace("/admin");
    else {
      const j = await r.json().catch(()=>({message:"Login failed"}));
      setMsg(j.message || "Login failed");
    }
  };

  return (
    <main style={{maxWidth:420, margin:"56px auto", padding:16}}>
      <h1 style={{fontWeight:800, fontSize:24, marginBottom:12}}>Admin Login</h1>
      <form onSubmit={submit} style={{display:"grid", gap:10}}>
        <label>Email</label>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
               required style={{padding:10, border:"1px solid #ddd", borderRadius:10}} />
        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
               required style={{padding:10, border:"1px solid #ddd", borderRadius:10}} />
        <button type="submit" style={{padding:10, borderRadius:14, background:"black", color:"#fff", marginTop:6}}>
          Sign in
        </button>
        {msg && <p style={{color:"crimson", fontSize:12}}>{msg}</p>}
      </form>
    </main>
  );
}
