"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { cn } from "@/lib/utils"; // if you don't have cn, just remove and inline className strings

type Feature = string;
type Plan = {
  id: string;
  name: string;
  price: string;          // "$15.99" or "€12.99" etc.
  cadence?: string;       // "1 Month"
  cta: string;            // "Order Now"
  href: string;           // "/checkout?plan=..."
  popular?: boolean;      // highlight plan
  features: Feature[];
};

type Props = {
  title?: string;
  subtitle?: string;
  plans?: Plan[];
  className?: string;
};

const DEFAULT_PLANS: Plan[] = [
  {
    id: "1m",
    name: "1 Month",
    price: "€10.99",
    cadence: "1 Month",
    cta: "Order Now",
    href: "/checkout?plan=1m",
    features: [
      "Instant Activation",
      "22,000+ Live Channels",
      "Everything in Full HD + UHD",
      "+1 Connections included",
      "Catchup Allowed",
      "24/7 Support",
      "Including EPG",
    ],
  },
  {
    id: "3m",
    name: "3 Months",
    price: "€20.99",
    cadence: "3 Months",
    cta: "Order Now",
    href: "/checkout?plan=3m",
    features: [
      "Instant Activation",
      "22,000+ Live Channels",
      "Everything in Full HD + UHD",
      "+1 Connections included",
      "Catchup Allowed",
      "24/7 Support",
      "Including EPG",
    ],
  },
  {
    id: "12m",
    name: "12 Months",
    price: "€50.99",
    cadence: "12 Months",
    cta: "Order Now",
    href: "/checkout?plan=12m",
    popular: true,
    features: [
      "Instant Activation",
      "22,000+ Live Channels",
      "Everything in Full HD + UHD",
      "+1 Connections included",
      "Catchup Allowed",
      "24/7 Support",
      "Including EPG",
    ],
  },
  {
    id: "6m",
    name: "6 Months",
    price: "€40.99",
    cadence: "6 Months",
    cta: "Order Now",
    href: "/checkout?plan=6m",
    features: [
      "Instant Activation",
      "22,000+ Live Channels",
      "Everything in Full HD + UHD",
      "+1 Connections included",
      "Catchup Allowed",
      "24/7 Support",
      "Including EPG",
    ],
  },
];

// --- helpers ---
function monthsFromId(id: string): 1 | 3 | 6 | 12 {
  if (id === "1m") return 1 as const;
  if (id === "3m") return 3 as const;
  if (id === "6m") return 6 as const;
  return 12 as const;
}
function parsePrice(priceStr: string): { amount: number; currency: "EUR" | "USD" | "GBP" } {
  // Detect common symbols, default to EUR to match Wise account
  const trimmed = priceStr.trim();
  let currency: "EUR" | "USD" | "GBP" = "EUR";
  if (/^\$/.test(trimmed)) currency = "USD";
  if (/^£/.test(trimmed)) currency = "GBP";
  if (/^€/.test(trimmed)) currency = "EUR";

  // Remove everything except digits/decimal
  const amt = Number(trimmed.replace(/[^\d.]/g, "")) || 0;
  return { amount: amt, currency };
}

export default function XtrmPricingSection({
  title = "Affordable Pricing for Xtream IPTV",
  subtitle = "Choose any of the following plans to get started. You can start with the 7 Days Trial first and upgrade anytime from your account.",
  plans = DEFAULT_PLANS,
  className,
}: Props) {
  const router = useRouter();
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null);

  async function selectPlan(plan: Plan, idx: number) {
    try {
      setLoadingIdx(idx);

      const { amount, currency } = parsePrice(plan.price);
      const months = monthsFromId(plan.id);

      // Build body expected by your /api/invoices POST
      const body = {
        currency,            // "EUR" to match Wise
        months,              // optional, used server-side to normalize items/pricing if needed
        items: [
          { desc: `Subscription (${months} month${months > 1 ? "s" : ""})`, qty: 1, unit: amount },
        ],
      };

      const r = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (r.status === 401) {
        // not authenticated → go login and return to pricing
        router.push(`/login?next=${encodeURIComponent("/pricing")}`);
        return;
      }

      const ct = r.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await r.json() : { raw: await r.text() };
      if (!r.ok || !data?.id) {
        throw new Error(data?.message || "Failed to create invoice");
      }

      // success → go to invoice page
      router.push(`/invoice/${data.id}`);
    } catch (e: any) {
      alert(e?.message || String(e));
    } finally {
      setLoadingIdx(null);
    }
  }

  return (
    <section className={cn("py-16 md:py-24", className)}>
      <div className="container mx-auto px-4">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {title}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {subtitle}
          </p>
        </motion.div>

        {/* Cards */}
        <div className={cn("mt-10 grid gap-6", "sm:grid-cols-2", "lg:grid-cols-4")}>
          {plans.map((plan, idx) => (
            <motion.article
              key={plan.id}
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: idx * 0.06, ease: "easeOut" }}
              whileHover={{ y: -6 }}
              className={cn(
                "group relative rounded-2xl border bg-card ring-1 ring-black/5",
                "shadow-sm hover:shadow-xl transition-all duration-300",
                plan.popular ? "bg-primary/5 border-primary/30" : "bg-background"
              )}
            >
              {/* Spotlight hover */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background:
                    "radial-gradient(600px circle at var(--x,50%) var(--y,50%), hsl(var(--primary)/0.10), transparent 40%)",
                }}
              />
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow">
                    Best Value
                  </span>
                </div>
              )}

              <div
                className="relative z-10 p-6 md:p-7"
                onMouseMove={(e) => {
                  const el = e.currentTarget.parentElement as HTMLElement;
                  const rect = el.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  el.style.setProperty("--x", `${x}%`);
                  el.style.setProperty("--y", `${y}%`);
                }}
              >
                {/* Header */}
                <div className="mb-4">
                  <div className="text-sm font-semibold text-primary">
                    {plan.cadence || plan.name}
                  </div>
                  <div className="mt-1 text-3xl font-extrabold tracking-tight">
                    {plan.price}
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={() => selectPlan(plan, idx)}
                  disabled={loadingIdx !== null}
                  className={cn(
                    "inline-flex w-full items-center justify-center rounded-full",
                    "bg-foreground text-background font-semibold py-3",
                    "transition-transform duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-60",
                    plan.popular ? "bg-primary text-primary-foreground" : ""
                  )}
                >
                  {loadingIdx === idx ? "Creating invoice…" : plan.cta.toUpperCase()}
                </button>

                {/* Divider */}
                <div className="my-5 border-t" />

                <p className="text-sm font-semibold">What’s included</p>

                {/* Features */}
                <ul className="mt-4 space-y-3">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* (Optional) keep the original href for SEO/analytics */}
                <div className="sr-only">
                  <Link href={plan.href}>{plan.cta}</Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Micro note */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Prices include access to EPG & Catchup where available. You can change or cancel anytime.
        </p>
      </div>
    </section>
  );
}
