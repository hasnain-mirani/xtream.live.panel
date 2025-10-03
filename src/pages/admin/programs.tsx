import { useEffect, useState } from "react";
import AdminOnly from "@/components/AdminOnly";
import { Input } from "@/components/ui/input"; import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import AdminLayout from "@/components/admin/AdminLayout";

type Row = { _id: string; channelKey: string; title: string; start: string; end: string };

export default function ProgramsAdmin() {
  const [items, setItems] = useState<Row[]>([]);
  const [filterKey, setFilterKey] = useState("");
  const [form, setForm] = useState<{channelKey:string; title:string; start:string; end:string}>({
    channelKey:"", title:"", start:"", end:""
  });

  const load = async () => setItems((await (await fetch(`/api/admin/programs${filterKey?`?channelKey=${encodeURIComponent(filterKey)}`:""}`)).json()).items || []);
  useEffect(()=>{ load().catch(()=>{}); }, [filterKey]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/programs",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(form) });
    setForm({ channelKey:"", title:"", start:"", end:"" }); load();
  };
  const del = async (id: string) => { await fetch(`/api/admin/programs?id=${id}`, { method:"DELETE" }); load(); };

  return (
    <AdminOnly>
         <AdminLayout>  
      <main className="mx-auto max-w-6xl my-10 space-y-6">
        <h1 className="text-2xl font-bold">EPG / Programs</h1>

        <div className="flex gap-3 items-end">
          <div className="w-56"><Label htmlFor="f">Filter by Channel Key</Label><Input id="f" value={filterKey} onChange={e=>setFilterKey(e.target.value)} placeholder="e.g. news"/></div>
          <Button variant="outline" className="rounded-2xl" onClick={()=>setFilterKey("")}>Clear</Button>
        </div>

        <form onSubmit={add} className="grid gap-3 md:grid-cols-2">
          <div><Label htmlFor="ck">Channel Key</Label><Input id="ck" value={form.channelKey} onChange={e=>setForm({...form, channelKey:e.target.value})} required/></div>
          <div><Label htmlFor="tt">Title</Label><Input id="tt" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required/></div>
          <div><Label htmlFor="st">Start (ISO)</Label><Input id="st" value={form.start} onChange={e=>setForm({...form, start:e.target.value})} placeholder="2025-10-03T06:00:00Z" required/></div>
          <div><Label htmlFor="en">End (ISO)</Label><Input id="en" value={form.end} onChange={e=>setForm({...form, end:e.target.value})} placeholder="2025-10-03T07:00:00Z" required/></div>
          <div className="md:col-span-2"><Button className="rounded-2xl" type="submit">Add Program</Button></div>
        </form>

        <Table>
          <TableHeader><TableRow><TableHead>Channel</TableHead><TableHead>Title</TableHead><TableHead>Start</TableHead><TableHead>End</TableHead><TableHead className="w-20">Action</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.map(r=>(
              <TableRow key={r._id}>
                <TableCell>{r.channelKey}</TableCell><TableCell>{r.title}</TableCell>
                <TableCell>{new Date(r.start).toLocaleString()}</TableCell>
                <TableCell>{new Date(r.end).toLocaleString()}</TableCell>
                <TableCell><Button size="sm" variant="outline" className="rounded-2xl" onClick={()=>del(r._id)}>Delete</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </main>
      </AdminLayout>
    </AdminOnly>
  );
}
