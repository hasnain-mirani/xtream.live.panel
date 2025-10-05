import { useEffect, useState } from "react";

type Inv = {
  _id: string; invoiceNo: string; status: "PENDING"|"PAID"|"CANCELLED";
  amount: number; currency: string; createdAt: string;
};

export default function AdminInvoices() {
  const [items, setItems] = useState<Inv[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");
  const [token, setToken] = useState("");

  async function load() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    const r = await fetch(`/api/admin/invoices?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const j = await r.json();
    setItems(j.items || []);
  }

  async function setPaid(id: string, s: "PENDING"|"PAID"|"CANCELLED") {
    await fetch(`/api/invoices/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // if you also protect this route
      },
      body: JSON.stringify({ status: s }),
    });
    load();
  }

  useEffect(() => { /* no auto-load until token typed */ }, []);

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Admin — Invoices</h1>

      <div className="mb-4 flex gap-2">
        <input className="border rounded px-2 py-1" placeholder="Admin token"
               value={token} onChange={(e)=>setToken(e.target.value)} />
        <input className="border rounded px-2 py-1" placeholder="Search (invoiceNo / business)"
               value={q} onChange={(e)=>setQ(e.target.value)} />
        <select className="border rounded px-2 py-1" value={status} onChange={(e)=>setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="PENDING">PENDING</option>
          <option value="PAID">PAID</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <button onClick={load} className="px-3 py-1 rounded bg-black text-white">Search</button>
      </div>

      <table className="w-full text-sm border">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-2">Invoice</th>
            <th className="text-left p-2">Status</th>
            <th className="text-right p-2">Amount</th>
            <th className="text-left p-2">Created</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it._id} className="border-t">
              <td className="p-2">{it.invoiceNo}</td>
              <td className="p-2">{it.status}</td>
              <td className="p-2 text-right">{it.currency} {it.amount.toFixed(2)}</td>
              <td className="p-2">{new Date(it.createdAt).toLocaleString()}</td>
              <td className="p-2 flex gap-2">
                <button onClick={()=>setPaid(it._id, "PAID")} className="px-2 py-1 rounded bg-green-600 text-white">Mark PAID</button>
                <button onClick={()=>setPaid(it._id, "PENDING")} className="px-2 py-1 rounded bg-yellow-600 text-white">Pending</button>
                <button onClick={()=>setPaid(it._id, "CANCELLED")} className="px-2 py-1 rounded bg-red-600 text-white">Cancel</button>
                <a className="px-2 py-1 rounded border" href={`/api/invoices/${it._id}/pdf`} target="_blank" rel="noreferrer">PDF</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
