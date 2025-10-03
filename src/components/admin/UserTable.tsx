import { useEffect, useState } from "react";

type Row = { id: string; name: string; email: string; role: "user"|"admin"; active: boolean; status: string; trialEndsAt?: string|null }

export default function UserTable() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/admin/users");
    const j = await r.json();
    setRows(j.users || []);
    setLoading(false);
  };

  useEffect(() => { load().catch(()=>{}); }, []);

  const toggle = async (id: string) => {
    await fetch("/api/admin/users", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ id, action: "toggleActive" })
    });
    load();
  };

  if (loading) return <p>Loading...</p>;
  return (
    <table style={{width: "100%", borderCollapse: "collapse"}}>
      <thead>
        <tr>
          <th style={{textAlign:"left"}}>Name</th>
          <th style={{textAlign:"left"}}>Email</th>
          <th>Role</th>
          <th>Active</th>
          <th>Status</th>
          <th>Trial Ends</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.id} style={{borderTop: "1px solid #eee"}}>
            <td>{r.name}</td>
            <td>{r.email}</td>
            <td style={{textAlign:"center"}}>{r.role}</td>
            <td style={{textAlign:"center"}}>{r.active ? "Yes" : "No"}</td>
            <td style={{textAlign:"center"}}>{r.status}</td>
            <td style={{textAlign:"center"}}>{r.trialEndsAt ? new Date(r.trialEndsAt).toLocaleString() : "—"}</td>
            <td style={{textAlign:"center"}}><button onClick={()=>toggle(r.id)}>Toggle</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
