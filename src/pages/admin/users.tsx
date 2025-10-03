import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type Sub = { status?: string; trialEndsAt?: string; currentPeriodEnd?: string; planMonths?: number };
type Row = {
  id: string; name: string; email: string; role: string;
  active: boolean; verified?: boolean; createdAt?: string; sub?: Sub | null;
};

export default function UsersAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);

  async function load(p = page) {
    try {
      setLoading(true); setErr(null);
      const r = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}&page=${p}&limit=${limit}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.message || `HTTP ${r.status}`);
      setRows(j.users || []); setTotal(j.total || 0); setLimit(j.limit || 20); setPage(j.page || p);
    } catch (e:any) { setErr(e.message || "Failed to load"); }
    finally { setLoading(false); }
  }
  useEffect(()=>{ load(1); /* eslint-disable-next-line */ },[]);

  const act = async (id: string, action: string, payload?: any) => {
    const r = await fetch("/api/admin/users", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, payload })
    });
    const j = await r.json().catch(()=>({}));
    if (!r.ok) { alert(j.message || `Action failed (${r.status})`); return; }

    if (action === "toggleActive") {
      setRows(prev => prev.map(x => x.id === id ? { ...x, active: j.active } : x));
    } else if (action === "startTrial") {
      setRows(prev => prev.map(x => x.id === id ? { ...x, sub: { status:"trial", trialEndsAt: j.trialEndsAt || j.trialEnds } } : x));
    } else if (action === "setSubscription") {
      setRows(prev => prev.map(x => x.id === id ? { ...x, sub: { status:"active", currentPeriodEnd: j.currentPeriodEnd, planMonths: j.planMonths } } : x));
    } else if (action === "updateUser") {
      setRows(prev => prev.map(x => x.id === id ? { ...x, ...j.user } : x));
    } else if (action === "deleteUser") {
      setRows(prev => prev.filter(x => x.id !== id));
    } else if (action === "setTempPassword") {
      if (j.tempPassword) {
        await navigator.clipboard.writeText(j.tempPassword);
        alert(`Temporary password set & copied:\n${j.tempPassword}`);
      } else alert("Temporary password set.");
    } else if (action === "impersonate") {
      window.open("/dashboard", "_blank"); // cookie set by API
    } else if (action === "forceLogout") {
      alert("All sessions cleared for this user.");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total/limit));

  return (
    <AdminLayout>
      <div className="p-5 space-y-4">
        <h1 className="text-xl font-bold">Users</h1>

        <div className="flex flex-wrap items-center gap-2">
          <Input className="w-64" placeholder="Search email or name" value={q} onChange={e=>setQ(e.target.value)} />
          <Button variant="outline" className="rounded-2xl" onClick={()=>load(1)}>Search</Button>
          <a className="border rounded-2xl px-3 py-2 text-sm" href={`/api/admin/users.csv?q=${encodeURIComponent(q)}`}>Export CSV</a>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" className="rounded-2xl" disabled={page<=1} onClick={()=>load(page-1)}>Prev</Button>
            <span className="text-sm opacity-70">Page {page} / {totalPages}</span>
            <Button variant="outline" className="rounded-2xl" disabled={page>=totalPages} onClick={()=>load(page+1)}>Next</Button>
          </div>
        </div>

        {loading && <p>Loading…</p>}
        {err && <p className="text-red-600">{err}</p>}

        {!loading && !err && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Name</th>
                  <th className="text-left">Email</th>
                  <th className="text-left">Active</th>
                  <th className="text-left">Verified</th>
                  <th className="text-left">Subscription</th>
                  <th className="text-left">Ends</th>
                  <th className="text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(u=>(
                  <tr key={u.id} className="border-b">
                    <td className="py-2">{u.name || "—"}</td>
                    <td>{u.email}</td>
                    <td>{u.active ? <Badge>Yes</Badge> : <Badge variant="outline">No</Badge>}</td>
                    <td>{u.verified ? <Badge>Yes</Badge> : <Badge variant="outline">No</Badge>}</td>
                    <td>{u.sub?.status || "—"}{u.sub?.planMonths ? ` (${u.sub.planMonths}m)` : ""}</td>
                    <td>{u.sub?.currentPeriodEnd
                          ? new Date(u.sub.currentPeriodEnd).toLocaleString()
                          : (u.sub?.trialEndsAt ? new Date(u.sub.trialEndsAt).toLocaleString() : "—")}
                    </td>
                    <td className="space-x-2">
                      <Button variant="outline" size="sm" className="rounded-2xl" onClick={()=>act(u.id,"toggleActive")}>Toggle</Button>
                      <SubSelect onChange={(m)=>act(u.id,"setSubscription",{ months: m })} />
                      <Button variant="outline" size="sm" className="rounded-2xl" onClick={()=>act(u.id,"startTrial")}>Start Trial</Button>
                      <Button variant="outline" size="sm" className="rounded-2xl" onClick={()=>act(u.id,"setTempPassword")}>Temp Pass</Button>
                      <ViewUser row={u}/>
                      <EditUser row={u} onSave={(payload)=>act(u.id,"updateUser",payload)} />
                      <Button variant="outline" size="sm" className="rounded-2xl" onClick={()=>act(u.id,"impersonate")}>Impersonate</Button>
                      <Button variant="outline" size="sm" className="rounded-2xl" onClick={()=>act(u.id,"forceLogout")}>Force Logout</Button>
                      <Button variant="destructive" size="sm" className="rounded-2xl"
                        onClick={()=>{ if(confirm(`Delete user ${u.email}?`)) act(u.id,"deleteUser"); }}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan={7} className="py-4 opacity-70">No users.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function SubSelect({ onChange }:{ onChange:(m:1|3|6|12)=>void }) {
  return (
    <Select onValueChange={(v)=>onChange(Number(v) as 1|3|6|12)}>
      <SelectTrigger className="inline-flex h-8 w-[130px] rounded-2xl px-2 text-xs align-middle">
        <SelectValue placeholder="Set Subscription" />
      </SelectTrigger>
      <SelectContent align="start">
        <SelectItem value="1">Monthly (1m)</SelectItem>
        <SelectItem value="3">Quarterly (3m)</SelectItem>
        <SelectItem value="6">Half-year (6m)</SelectItem>
        <SelectItem value="12">Yearly (12m)</SelectItem>
      </SelectContent>
    </Select>
  );
}

function ViewUser({ row }:{ row: Row }) {
  return (
    <Dialog>
      <DialogTrigger asChild><Button variant="outline" size="sm" className="rounded-2xl">View</Button></DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>User Details</DialogTitle></DialogHeader>
        <div className="grid gap-2 text-sm">
          <div><b>Name:</b> {row.name || "—"}</div>
          <div><b>Email:</b> {row.email}</div>
          <div><b>Active:</b> {row.active ? "Yes" : "No"}</div>
          <div><b>Verified:</b> {row.verified ? "Yes" : "No"}</div>
          <div><b>Role:</b> {row.role}</div>
          <div><b>Created:</b> {row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"}</div>
          <div><b>Sub:</b> {row.sub?.status || "—"} {row.sub?.planMonths ? `(${row.sub.planMonths}m)` : ""}</div>
        </div>
        <DialogFooter><Button className="rounded-2xl">Close</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditUser({ row, onSave }:{ row: Row; onSave:(p:any)=>void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(row.name || "");
  const [email, setEmail] = useState(row.email || "");
  const [active, setActive] = useState(row.active);
  const [verified, setVerified] = useState(!!row.verified);

  useEffect(()=>{ setName(row.name||""); setEmail(row.email||""); setActive(row.active); setVerified(!!row.verified); }, [row.id]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline" size="sm" className="rounded-2xl">Edit</Button></DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div><Label>Name</Label><Input value={name} onChange={e=>setName(e.target.value)} /></div>
          <div><Label>Email</Label><Input value={email} onChange={e=>setEmail(e.target.value)} /></div>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={active} onChange={e=>setActive(e.target.checked)} /> Active
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={verified} onChange={e=>setVerified(e.target.checked)} /> Verified
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button className="rounded-2xl"
            onClick={()=>{ onSave({ name, email, active, verified }); setOpen(false); }}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
