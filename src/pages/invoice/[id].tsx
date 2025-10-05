import { useEffect, useState } from "react";
import { useRouter } from "next/router";

type Inv = {
  _id: string;
  invoiceNo: string;
  status: "PENDING"|"PAID"|"CANCELLED";
  currency: string; amount: number;
  items: { name: string; qty: number; unitPrice: number; total: number }[];
  business: { name: string; address: string; email: string; };
  bank: { name: string; accountName: string; accountNo: string; sortCode?: string; iban?: string; swift?: string; };
  dueDate: string;
  createdAt: string;
};

export default function InvoicePage() {
  const { query } = useRouter();
  const [inv, setInv] = useState<Inv | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!query.id) return;
    (async () => {
      const r = await fetch(`/api/invoices/${query.id}`);
      const j = await r.json();
      if (!r.ok) setErr(j?.error || "Failed to load"); else setInv(j);
    })();
  }, [query.id]);

  if (err) return <main className="container mx-auto px-4 py-10">Error: {err}</main>;
  if (!inv) return <main className="container mx-auto px-4 py-10">Loading invoice…</main>;

  const fmt = (n: number) => new Intl.NumberFormat(undefined, { style: "currency", currency: inv.currency }).format(n);

  return (
    <main className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{inv.business?.name || "Invoice"}</h1>
          <p className="text-sm text-gray-500 whitespace-pre-wrap">{inv.business?.address}</p>
          <p className="text-sm text-gray-500">{inv.business?.email}</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-semibold">Invoice {inv.invoiceNo}</div>
          <div className="text-sm">Status: <span className="font-medium">{inv.status}</span></div>
          <div className="text-sm">Created: {new Date(inv.createdAt).toLocaleDateString()}</div>
          <div className="text-sm">Due: {new Date(inv.dueDate).toLocaleDateString()}</div>
        </div>
      </div>

      <div className="mt-8 border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Item</th>
              <th className="text-right p-3">Qty</th>
              <th className="text-right p-3">Unit</th>
              <th className="text-right p-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {inv.items?.map((it, i) => (
              <tr key={i} className="border-t">
                <td className="p-3">{it.name}</td>
                <td className="p-3 text-right">{it.qty}</td>
                <td className="p-3 text-right">{fmt(it.unitPrice)}</td>
                <td className="p-3 text-right">{fmt(it.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t">
              <td className="p-3 font-semibold" colSpan={3}>Amount due</td>
              <td className="p-3 text-right font-semibold">{fmt(inv.amount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold">Bank transfer details</h3>
          <div className="mt-2 text-sm">
            <div><span className="text-gray-500">Bank:</span> {inv.bank?.name}</div>
            <div><span className="text-gray-500">Account Name:</span> {inv.bank?.accountName}</div>
            <div><span className="text-gray-500">Account No:</span> {inv.bank?.accountNo}</div>
            {inv.bank?.sortCode && <div><span className="text-gray-500">Sort Code:</span> {inv.bank.sortCode}</div>}
            {inv.bank?.iban && <div><span className="text-gray-500">IBAN:</span> {inv.bank.iban}</div>}
            {inv.bank?.swift && <div><span className="text-gray-500">SWIFT:</span> {inv.bank.swift}</div>}
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Payment instructions</h3>
          <p className="mt-2 text-sm text-gray-700">
            Please pay by bank transfer and include <strong>{inv.invoiceNo}</strong> in your payment reference.
            Your subscription will be activated once we confirm receipt.
          </p>
          <button onClick={() => window.print()} className="mt-4 px-4 py-2 rounded bg-black text-white">
            Print / Save PDF
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
  <button onClick={() => window.print()} className="px-4 py-2 rounded bg-black text-white">
    Print / Save PDF
  </button>

  <button
    onClick={async () => {
      await fetch(`/api/invoices/${inv._id}/email`, { method: "POST" });
      alert("Invoice email sent.");
    }}
    className="px-4 py-2 rounded border"
  >
    Email me this invoice
  </button>

  <a
    className="px-4 py-2 rounded border"
    href={`/api/invoices/${inv._id}/pdf`}
    target="_blank"
    rel="noreferrer"
  >
    Download PDF
  </a>

  {/* NEW */}
  <a href="/dashboard" className="px-4 py-2 rounded border">Go to Dashboard</a>
</div>
      </div>
    </main>
  );
}
