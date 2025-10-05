// src/pages/invoice/[id].tsx
import Head from "next/head";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import jwt from "jsonwebtoken";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { connectDB as dbConnect } from "@/lib/db";
import Invoice from "@/models/Invoice";
import User from "@/models/User";
import { money, dateOnly, dateTime } from "@/lib/format";
import { Types } from "mongoose";
import { BANK, PAYMENT_NOTE } from "@/lib/billing";
type InvoiceStatus = "PENDING" | "PAID" | "CANCELLED";

type ServerInvoice = {
  id: string;
  invoiceNo: string;
  status: InvoiceStatus;
  amount: number;
  currency: string;
  dueDate: string;   // ISO
  createdAt: string; // ISO
  items: { desc: string; qty: number; unit: number; total: number }[];
};

type Props = { invoice: ServerInvoice | null };

function toUi(inv: any): ServerInvoice {
  const statusRaw = String(inv.status ?? "").toLowerCase();
  let status: InvoiceStatus = "PENDING";
  if (statusRaw === "paid") status = "PAID";
  else if (statusRaw === "void" || statusRaw === "cancelled" || statusRaw === "canceled")
    status = "CANCELLED";

  const due = inv.dueDate ?? inv.currentPeriodEnd ?? inv.periodEnd ?? inv.createdAt ?? Date.now();

  return {
    id: String(inv._id),
    invoiceNo: String(inv.number ?? inv.invoiceNo ?? inv._id),
    status,
    amount: Number(inv.total ?? inv.amount ?? 0) || 0,
    currency: String(inv.currency ?? "GBP"),
    dueDate: new Date(due).toISOString(),
    createdAt: new Date(inv.createdAt ?? Date.now()).toISOString(),
    items: Array.isArray(inv.items)
      ? inv.items.map((it: any) => ({
          desc: String(it.desc || ""),
          qty: Number(it.qty || 0),
          unit: Number(it.unit || 0),
          total: Number(it.total || Number(it.qty || 0) * Number(it.unit || 0)),
        }))
      : [],
  };
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, params }) => {
  try {
    await dbConnect();

    const token = req.cookies?.token;
    const next = "/invoice/" + String(params?.id || "");
    if (!token) return { redirect: { destination: "/login?next=" + encodeURIComponent(next), permanent: false } };

    let uid: string | null = null;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret") as any;
      uid = decoded?.id || decoded?.uid || null;
    } catch {
      return { redirect: { destination: "/login?next=" + encodeURIComponent(next), permanent: false } };
    }
    if (!uid) return { redirect: { destination: "/login?next=" + encodeURIComponent(next), permanent: false } };

    const id = String(params?.id || "");
    if (!Types.ObjectId.isValid(id)) return { notFound: true };

    const user = await User.findById(uid).select("_id").lean();
    if (!user) return { redirect: { destination: "/login?next=" + encodeURIComponent(next), permanent: false } };

    const inv = await Invoice.findOne({ _id: id, userId: uid }).lean();
    if (!inv) return { notFound: true };

    return { props: { invoice: toUi(inv) } };
  } catch {
    return { props: { invoice: null } };
  }
};

/* ---------------- Wrapper (handles null) ---------------- */
export default function InvoicePage({ invoice }: Props) {
  if (!invoice) {
    return (
      <>
        <Head><title>Invoice — Not found</title></Head>
        <div className="container mx-auto px-4 py-10">
          <div className="rounded-xl border bg-white p-6">
            <h1 className="text-xl font-bold">Invoice not found</h1>
            <p className="mt-2 text-sm text-gray-600">
              The invoice may not exist or you don’t have access.
            </p>
            <Link href="/invoice/history" className="mt-4 inline-block rounded-md border px-3 py-2 text-sm hover:bg-gray-50">
              Back to invoices
            </Link>
          </div>
        </div>
      </>
    );
  }
  return <InvoiceView invoice={invoice} />;
}

/* ---------------- Strictly typed view (no nulls) ---------------- */
function InvoiceView({ invoice }: { invoice: ServerInvoice }) {
  const router = useRouter();

  const badge =
    invoice.status === "PAID"
      ? "bg-green-100 text-green-800 border-green-200"
      : invoice.status === "PENDING"
      ? "bg-amber-100 text-amber-800 border-amber-200"
      : "bg-red-100 text-red-800 border-red-200";

  // ISO -> datetime-local
  const initialLocal = useMemo(() => {
    const d = invoice.dueDate ? new Date(invoice.dueDate) : new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  }, [invoice.dueDate]);

  const [dueLocal, setDueLocal] = useState(initialLocal);
  const [pending, setPending] = useState(false);

  async function patchInvoice(body: any) {
    setPending(true);
    try {
      const r = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const ct = r.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await r.json() : { raw: await r.text() };
      if (!r.ok) throw new Error(data?.message || "Update failed");
      await router.replace(router.asPath);
    } catch (e: any) {
      alert(e.message || String(e));
    } finally {
      setPending(false);
    }
  }

  async function saveDueDate() {
    const iso = new Date(dueLocal).toISOString();
    await patchInvoice({ dueDate: iso });
  }

  async function deleteInvoice() {
    if (!confirm("Delete this invoice permanently?")) return;
    setPending(true);
    try {
      const r = await fetch(`/api/invoices/${invoice.id}`, { method: "DELETE" });
      const ct = r.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await r.json() : { raw: await r.text() };
      if (!r.ok) throw new Error(data?.message || "Delete failed");
      await router.push("/invoice/history");
    } catch (e: any) {
      alert(e.message || String(e));
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Head><title>Invoice {invoice.invoiceNo}</title></Head>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">Invoice {invoice.invoiceNo}</h1>
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge}`}>
            {invoice.status}
          </span>
        </div>

        {/* Meta */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Row k="Created" v={dateTime(invoice.createdAt)} />
          <Row k="Due" v={dateOnly(invoice.dueDate)} />
          <Row
            k="Total"
            v={invoice.amount === 0 ? "Free" : money(invoice.amount, invoice.currency)}
          />
        </div>

        {/* Items */}
        <div className="mt-6 rounded-xl border bg-white p-5">
          <h2 className="text-lg font-semibold mb-3">Items</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2">Description</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Unit</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((it, i) => (
                <tr key={i} className="border-b last:border-none">
                  <td className="py-2">{it.desc}</td>
                  <td className="py-2 text-right">{it.qty}</td>
                  <td className="py-2 text-right">{money(it.unit, invoice.currency)}</td>
                  <td className="py-2 text-right">{money(it.total, invoice.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Existing actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={`/api/invoices/${invoice.id}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Download PDF
            </a>
            <button
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
              onClick={async () => {
                const r = await fetch(`/api/invoices/${invoice.id}/email`, { method: "POST" });
                alert(r.ok ? "Invoice email sent" : "Failed to send email");
              }}
            >
              Email invoice
            </button>
          </div>
        </div>
{invoice.status === "PENDING" && invoice.amount > 0 && (
  <div className="mt-6 rounded-2xl border bg-white p-5">
    <h2 className="text-lg font-semibold">💳 Bank Payment Details</h2>
    <div className="mt-2 text-sm">
      <p><b>Account Holder:</b> {BANK.accountHolder}</p>
      <p><b>Bank Name:</b> {BANK.bankName}</p>
      <p><b>Bank Address:</b> {BANK.bankAddress}</p>
      <p><b>IBAN:</b> {BANK.iban}</p>
      <p><b>SWIFT/BIC:</b> {BANK.swift}</p>
      <p><b>Currency:</b> {BANK.currency}</p>
      <p><b>Can Receive From:</b> {BANK.canReceive}</p>
    </div>

    <div className="mt-4 rounded-md bg-gray-50 border p-3 text-sm whitespace-pre-line">
      {PAYMENT_NOTE}
    </div>

    <div className="mt-3 text-xs text-gray-600">
      Use your invoice number <b>{invoice.invoiceNo}</b> as the payment reference.
    </div>
  </div>
)}
        {/* Manage: change due date & delete */}
        <div className="mt-6 rounded-2xl border bg-white p-5">
          <h2 className="text-lg font-semibold">Manage</h2>

          <div className="mt-4 grid gap-2 sm:grid-cols-[260px,auto] sm:items-end">
            <label className="block">
              <div className="text-sm font-medium">Due date & time</div>
              <input
                type="datetime-local"
                value={dueLocal}
                onChange={(e) => setDueLocal(e.target.value)}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              />
            </label>
            <button
              onClick={saveDueDate}
              disabled={pending}
              className="h-9 rounded-md border px-3 text-sm hover:bg-gray-50 disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save due date"}
            </button>
          </div>

          <div className="mt-6 border-t pt-4">
            <button
              onClick={deleteInvoice}
              disabled={pending}
              className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100 disabled:opacity-60"
            >
              {pending ? "Deleting…" : "Delete invoice"}
            </button>
          </div>
        </div>

        {/* Footer nav */}
        <div className="mt-6">
          <Link href="/invoice/history" className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">
            Back to invoices
          </Link>
          <Link href="/dashboard" className="ml-2 rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border bg-gray-50 p-3">
      <div className="text-xs uppercase text-gray-500">{k}</div>
      <div className="text-sm font-medium">{v}</div>
    </div>
  );
}
