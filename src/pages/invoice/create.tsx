// src/pages/invoice/create.tsx
import Head from "next/head";
import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

// Your price table (edit as needed)
const PRICING_GBP: Record<number, number> = {
  1: 9.99,
  3: 27.99,
  6: 49.99,
  12: 89.99,
};

export default function CreateInvoicePage() {
  const router = useRouter();
  const [months, setMonths] = useState<number>(3);
  const [currency, setCurrency] = useState<"GBP" | "USD">("GBP");
  const [pending, setPending] = useState(false);

  const price = useMemo(() => {
    // choose pricing table by currency if you support multiple
    const table = currency === "GBP" ? PRICING_GBP : PRICING_GBP; // swap for USD if you have it
    return table[months] ?? PRICING_GBP[3];
  }, [months, currency]);

  async function create() {
    setPending(true);
    try {
      const r = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currency,
          months, // <-- tell server how many months
          // You can let the server build items based on months
          // or send a ready-made line item:
          // items: [{ desc: `Subscription (${months} month${months>1?"s":""})`, qty: 1, unit: price }]
        }),
      });

      const ct = r.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await r.json() : { raw: await r.text() };

      if (!r.ok) throw new Error(data?.message || "Failed to create invoice");

      router.push(`/invoice/${data.id}`);
    } catch (e: any) {
      alert(e.message || String(e));
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Head><title>Create Invoice</title></Head>
  
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <h1 className="text-2xl font-extrabold">Create Invoice</h1>
        <p className="mt-2 text-sm text-gray-600">
          Choose a subscription duration and we’ll generate an invoice for your account.
        </p>

        <div className="mt-6 grid gap-4">
          <label className="block">
            <div className="text-sm font-medium">Subscription length</div>
            <select
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value={1}>1 month</option>
              <option value={3}>3 months</option>
              <option value={6}>6 months</option>
              <option value={12}>12 months</option>
            </select>
          </label>

          <label className="block">
            <div className="text-sm font-medium">Currency</div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="GBP">GBP</option>
              <option value="USD">USD</option>
            </select>
          </label>

          <div className="rounded-lg border bg-gray-50 p-3 text-sm">
            <div><b>Plan:</b> {months} month{months > 1 ? "s" : ""}</div>
            <div><b>Price:</b> {currency} {price.toFixed(2)}</div>
          </div>
 <div className="mt-6">
            <Link href="/dashboard" className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">
              Back to Dashboard
            </Link>
        </div>
          <button
            onClick={create}
            disabled={pending}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? "Creating…" : "Create invoice"}
          </button>
        </div>
      </div>
    </>
  );
}
