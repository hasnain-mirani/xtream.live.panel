// src/pages/invoice/history.tsx
import Head from "next/head";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import jwt from "jsonwebtoken";
import { connectDB as dbConnect } from "@/lib/db";
import Invoice from "@/models/Invoice";
import { money, dateOnly, dateTime } from "@/lib/format";

/* ------------ Types ------------ */
type InvoiceRow = {
  id: string;
  invoiceNo: string;
  status: "PENDING" | "PAID" | "CANCELLED";
  total: number;
  currency: string;
  createdAt: string; // ISO
  dueDate: string;   // ISO
};
type Props = {
  page: number;
  limit: number;
  total: number;
  items: InvoiceRow[];
};

/* ------------ Helpers ------------ */
function mapStatus(raw: any): "PENDING" | "PAID" | "CANCELLED" {
  const s = String(raw ?? "").toLowerCase();
  if (s === "paid") return "PAID";
  if (s === "void" || s === "cancelled" || s === "canceled") return "CANCELLED";
  return "PENDING"; // due/draft/pending -> PENDING
}
function toRow(inv: any): InvoiceRow {
  const due =
    inv.dueDate ?? inv.currentPeriodEnd ?? inv.periodEnd ?? inv.createdAt ?? Date.now();
  return {
    id: String(inv._id),
    invoiceNo: String(inv.number ?? inv.invoiceNo ?? inv._id),
    status: mapStatus(inv.status),
    total: Number(inv.total ?? inv.amount ?? 0) || 0,
    currency: String(inv.currency ?? "GBP"),
    createdAt: new Date(inv.createdAt ?? Date.now()).toISOString(),
    dueDate: new Date(due).toISOString(),
  };
}

/* ------------ SSR ------------ */
export const getServerSideProps: GetServerSideProps<Props> = async ({ req, query }) => {
  try {
    await dbConnect();

    const token = req.cookies?.token;
    if (!token) return { redirect: { destination: "/login?next=/invoice/history", permanent: false } };

    let uid: string | null = null;
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret") as any;
      uid = payload?.id || payload?.uid || null;
    } catch {
      return { redirect: { destination: "/login?next=/invoice/history", permanent: false } };
    }
    if (!uid) return { redirect: { destination: "/login?next=/invoice/history", permanent: false } };

    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.min(100, Math.max(5, Number(query.limit || 20)));

    const total = await Invoice.countDocuments({ userId: uid });
    const rows = await Invoice.find({ userId: uid })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return {
      props: {
        page, limit, total,
        items: rows.map(toRow),
      },
    };
  } catch {
    return { props: { page: 1, limit: 20, total: 0, items: [] } };
  }
};

/* ------------ Page ------------ */
export default function InvoiceHistory({ page, limit, total, items }: Props) {
  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <>
      <Head>
        <title>Invoice History</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">Invoices</h1>
          <Link href="/dashboard" className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">
            Back to dashboard
          </Link>
        </div>

        {items.length === 0 ? (
          <p className="mt-6 text-sm text-gray-600">No invoices yet.</p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left p-3">Invoice #</th>
                  <th className="text-left p-3">Created</th>
                  <th className="text-left p-3">Due</th>
                  <th className="text-right p-3">Total</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-t">
                    <td className="p-3">
                      <Link href={`/invoice/${it.id}`} className="font-medium hover:underline">
                        {it.invoiceNo}
                      </Link>
                    </td>
                    <td className="p-3">{dateTime(it.createdAt)}</td>
                    <td className="p-3">{dateOnly(it.dueDate)}</td>
                    <td className="p-3 text-right">
                      {it.total === 0 ? "Free" : money(it.total, it.currency)}
                    </td>
                    <td className="p-3">
                      <StatusPill status={it.status} />
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex gap-2">
                        <a
                          href={`/api/invoices/${it.id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-md border px-2 py-1 hover:bg-gray-50"
                        >
                          PDF
                        </a>
                        <button
                          className="rounded-md border px-2 py-1 hover:bg-gray-50"
                          onClick={async () => {
                            await fetch(`/api/invoices/${it.id}/email`, { method: "POST" });
                            alert("Invoice email sent");
                          }}
                        >
                          Email
                        </button>
                        <Link
                          href={`/invoice/${it.id}`}
                          className="rounded-md border px-2 py-1 hover:bg-gray-50"
                        >
                          View
                        </Link>
                           <Link
                          href={`/invoice/${it.id}`}
                          className="rounded-md border px-2 py-1 hover:bg-gray-50"
                        >
                          Delete
                        </Link>   
                         <Link
                          href={`/invoice/${it.id}`}
                          className="rounded-md border px-2 py-1 hover:bg-gray-50"
                        >
                          Change Plan
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <PageBtn href={`/invoice/history?page=${Math.max(1, page - 1)}&limit=${limit}`} disabled={page <= 1}>
              Prev
            </PageBtn>
            <span className="text-sm text-gray-600">
              Page {page} / {pages}
            </span>
            <PageBtn href={`/invoice/history?page=${Math.min(pages, page + 1)}&limit=${limit}`} disabled={page >= pages}>
              Next
            </PageBtn>
          </div>
        )}
      </div>
    </>
  );
}

/* ------------ tiny UI ------------ */
function StatusPill({ status }: { status: "PENDING" | "PAID" | "CANCELLED" }) {
  const cls =
    status === "PAID"
      ? "bg-green-100 text-green-800 border-green-200"
      : status === "PENDING"
      ? "bg-amber-100 text-amber-800 border-amber-200"
      : "bg-red-100 text-red-800 border-red-200";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}
function PageBtn({ href, disabled, children }: { href: string; disabled?: boolean; children: React.ReactNode }) {
  if (disabled) {
    return <span className="rounded-md border px-3 py-1.5 text-sm text-gray-400">{children}</span>;
  }
  return (
    <Link href={href} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">
      {children}
    </Link>
  );
}
