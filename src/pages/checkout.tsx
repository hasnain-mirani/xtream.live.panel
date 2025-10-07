// pages/checkout.tsx
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

const PLAN_TO_MONTHS: Record<string, number> = { "1m": 1, "3m": 3, "6m": 6, "12m": 12 };

export default function Checkout() {
  const router = useRouter();
  const ran = useRef(false);
  const [msg, setMsg] = useState("Preparing checkout…");

  useEffect(() => {
    if (!router.isReady || ran.current) return;
    ran.current = true;

    (async () => {
      try {
        // 1) Validate plan
        const planParam = String(router.query.plan || "");
        const months = PLAN_TO_MONTHS[planParam];
        if (!months) {
          setMsg("Invalid plan. Returning to pricing…");
          setTimeout(() => (window.location.href = "/pricing"), 1200);
          return;
        }

        // 2) Check auth
        const me = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
          .then((r) => r.json())
          .catch(() => null);

        if (!me?.isLoggedIn) {
          // Preserve intent: after login, return here and auto-continue
          const nextPath = `/checkout?plan=${encodeURIComponent(planParam)}`;
          window.location.href = `/login?next=${encodeURIComponent(nextPath)}`;
          return;
        }

        setMsg("Creating your invoice…");

        // 3) Create invoice
        const currency = "USD"; // or "GBP" / "EUR"
        const r = await fetch("/api/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
          credentials: "include",
          body: JSON.stringify({ months, currency, status: "PENDING" }),
        });

        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j?.error || "Invoice create failed");

        // 4) Go to invoice page
        const id = j.id || j._id;
        if (!id) throw new Error("Missing invoice id");
        window.location.href = `/invoice/${id}`;
      } catch (e: any) {
        console.error("checkout error:", e?.message || e);
        setMsg("Something went wrong. Returning to pricing…");
        setTimeout(() => (window.location.href = "/pricing"), 1400);
      }
    })();
  }, [router.isReady, router.query.plan]);

  return (
    <main className="min-h-screen grid place-items-center bg-[#0b0b0e] px-4">
      <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-5 text-white shadow">
        {msg}
      </div>
    </main>
  );
}
