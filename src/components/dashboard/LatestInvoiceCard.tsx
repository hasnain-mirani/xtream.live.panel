import Link from "next/link";
import { money, dateOnly, dateTime } from "@/lib/format";

type InvoiceStatus = "PENDING" | "PAID" | "CANCELLED";
export type LatestInvoice = {
  id: string;
  invoiceNo: string;
  status: InvoiceStatus;
  amount: number;
  currency: string;
  dueDate: string;
  createdAt: string;
};

export default function LatestInvoiceCard({ inv }: { inv: LatestInvoice | null }) {
  const badge =
    !inv ? "" :
    inv.status === "PAID"
      ? "bg-emerald-400/15 text-emerald-200 border-emerald-400/20"
      : inv.status === "PENDING"
      ? "bg-amber-400/15 text-amber-200 border-amber-400/20"
      : "bg-rose-400/15 text-rose-200 border-rose-400/20";

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Latest invoice</h2>
        {inv && (
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge}`}>
            {inv.status}
          </span>
        )}
      </div>

      {!inv ? (
        <p className="mt-4 text-sm text-white/70">No invoice found.</p>
      ) : (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <InfoRow k="Invoice No" v={inv.invoiceNo} />
            <InfoRow k="Created" v={dateTime(inv.createdAt)} />
            <InfoRow k="Due" v={dateOnly(inv.dueDate)} />
            <InfoRow
              k="Total"
              v={inv.amount === 0 ? "Free" : money(inv.amount, inv.currency)}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href={`/invoice/${inv.id}`}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10"
            >
              View invoice
            </Link>
            <a
              href={`/api/invoices/${inv.id}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10"
            >
              Download PDF
            </a>
            <button
              className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10"
              onClick={async () => {
                await fetch(`/api/invoices/${inv.id}/email`, { method: "POST" });
                alert("Invoice email sent");
              }}
            >
              Email invoice
            </button>

            {inv.amount > 0 && inv.status === "PENDING" && (
              <div className="ml-auto text-sm text-amber-300/90">
                Bank details were emailed. Please include the invoice no. in your transfer.
              </div>
            )}
            {inv.amount === 0 && (
              <div className="ml-auto text-sm text-emerald-300/90">
                Free trial active — no payment required.
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

function InfoRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs uppercase text-white/60">{k}</div>
      <div className="text-sm font-medium text-white">{v}</div>
    </div>
  );
}
