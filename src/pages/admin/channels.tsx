import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input"; import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import AdminOnly from "@/components/AdminOnly";
import AdminLayout from "@/components/admin/AdminLayout";
type Item = { key: string; name: string; url: string; category?: string; order?: number; active: boolean };

export default function ChannelsAdmin() {
  const [items, setItems] = useState<Item[]>([]);
  const [f, setF] = useState<Item>({ key:"", name:"", url:"", category:"", order:0, active:true });

  const load = async () => setItems((await (await fetch("/api/admin/channels")).json()).items || []);
  useEffect(()=>{ load().catch(()=>{}); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/channels", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(f) });
    setF({ key:"", name:"", url:"", category:"", order:0, active:true } as any); load();
  };
  const del = async (k: string) => { await fetch(`/api/admin/channels?key=${encodeURIComponent(k)}`, { method:"DELETE" }); load(); };

  return (
    <AdminOnly>
         <AdminLayout>
      <main className="mx-auto max-w-6xl my-10 space-y-6">
        <h1 className="text-2xl font-bold">Channels</h1>

        <Card className="rounded-2xl"><CardHeader><CardTitle>Add / Update</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={save} className="grid gap-3 md:grid-cols-2">
              <div><Label htmlFor="key">Key</Label><Input id="key" value={f.key} onChange={e=>setF({...f, key:e.target.value})} required/></div>
              <div><Label htmlFor="name">Name</Label><Input id="name" value={f.name} onChange={e=>setF({...f, name:e.target.value})} required/></div>
              <div className="md:col-span-2"><Label htmlFor="url">HLS URL</Label><Input id="url" value={f.url} onChange={e=>setF({...f, url:e.target.value})} required/></div>
              <div><Label htmlFor="cat">Category</Label><Input id="cat" value={f.category||""} onChange={e=>setF({...f, category:e.target.value})}/></div>
              <div><Label htmlFor="order">Order</Label><Input id="order" type="number" value={f.order||0} onChange={e=>setF({...f, order:Number(e.target.value)})}/></div>
              <div className="md:col-span-2 flex gap-2">
                <Button type="submit" className="rounded-2xl">Save</Button>
                <Button type="button" variant="outline" className="rounded-2xl" onClick={()=>setF({ key:"", name:"", url:"", category:"", order:0, active:true } as any)}>Clear</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Table>
          <TableHeader><TableRow><TableHead>Key</TableHead><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Order</TableHead><TableHead className="w-20">Action</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.map(it=>(
              <TableRow key={it.key}>
                <TableCell>{it.key}</TableCell><TableCell>{it.name}</TableCell><TableCell>{it.category||"—"}</TableCell><TableCell>{it.order??0}</TableCell>
                <TableCell><Button size="sm" variant="outline" className="rounded-2xl" onClick={()=>del(it.key)}>Delete</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </main>
         </AdminLayout>
    </AdminOnly>
  );
}
