import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import type { GetServerSideProps } from "next";
import jwt from "jsonwebtoken";
import { money } from "@/lib/format";
import { connectDB as dbConnect } from "@/lib/db";
import User from "@/models/User";
import Invoice from "@/models/Invoice";

import SiteLayout from "@/components/layout/SiteLayout";
import Sidebar from "@/components/dashboard/Sidebar";
import { StatCard } from "@/components/dashboard/Stats";
import LatestInvoiceCard, { type LatestInvoice } from "@/components/dashboard/LatestInvoiceCard";
import QuickStartCard from "@/components/dashboard/QuickStartCard";

/* ---------- Types ---------- */
type InvoiceStatus = "PENDING" | "PAID" | "CANCELLED";
type ServerUser = {
  id: string;
  name: string | null;
  email: string;
  isActive: boolean;
  serviceUsername: string | null;
};
type ServerInvoice = LatestInvoice;

/* ---------- helpers ---------- */
function mapInvoice(inv: any): ServerInvoice {
  const invoiceNo = String(inv.number ?? inv.invoiceNo ?? inv._id ?? "").trim();
  const amount = Number(inv.total ?? inv.amount ?? 0) || 0;
  const currency = String(inv.currency ?? "GBP");
  const raw = String(inv.status ?? "").toLowerCase();
  let status: InvoiceStatus = "PENDING";
  if (raw === "paid") status = "PAID";
  else if (raw === "void" || raw === "cancelled" || raw === "canceled") status = "CANCELLED";

  const due = inv.dueDate ?? inv.currentPeriodEnd ?? inv.periodEnd ?? inv.createdAt ?? Date.now();
  const created = inv.createdAt ?? Date.now();

  return {
    id: String(inv._id),
    invoiceNo,
    status,
    amount,
    currency,
    dueDate: new Date(due).toISOString(),
    createdAt: new Date(created).toISOString(),
  };
}

/* ---------- SSR ---------- */
export const getServerSideProps: GetServerSideProps<{ user: ServerUser; latestInvoice: ServerInvoice | null }> = async ({ req }) => {
  try {
    await dbConnect();

    const token = req.cookies?.token;
    if (!token) {
      return { redirect: { destination: "/login?next=/dashboard", permanent: false } };
    }

    let uid: string | null = null;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret") as any;
      uid = decoded?.id || decoded?.uid || null;
    } catch {
      return { redirect: { destination: "/login?next=/dashboard", permanent: false } };
    }

    if (!uid) return { redirect: { destination: "/login?next=/dashboard", permanent: false } };

    const u: any = await User.findById(uid).lean();
    if (!u) return { redirect: { destination: "/login?next=/dashboard", permanent: false } };

    const latest = await Invoice.findOne({ userId: uid }).sort({ createdAt: -1 }).lean();

    const user: ServerUser = {
      id: String(u._id),
      name: u.name ?? null,
      email: String(u.email || ""),
      isActive: Boolean(u.isActive),
      serviceUsername: u.serviceUsername ?? null,
    };

    const latestInvoice: ServerInvoice | null = latest ? mapInvoice(latest) : null;

    return { props: { user, latestInvoice } };
  } catch {
    return { redirect: { destination: "/login?next=/dashboard", permanent: false } };
  }
};

/* ---------- Page ---------- */
export default function Dashboard({ user, latestInvoice }: { user: ServerUser; latestInvoice: ServerInvoice | null }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SiteLayout>
      <Head>
        <title>Dashboard — XtreamIPTV</title>
        <meta name="description" content="Your XtreamIPTV account dashboard." />
      </Head>

      {/* Mobile bar (open/close sidebar) */}
      <div className="lg:hidden mb-4">
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
          onClick={() => setMobileOpen((s) => !s)}
          aria-label="Toggle sidebar"
        >
          {mobileOpen ? "Hide menu" : "Show menu"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px,1fr] gap-6">
        {/* SIDEBAR */}
        <Sidebar open={mobileOpen} />

        {/* MAIN */}
        <main className="pb-12">
          {/* Greeting + actions */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                Welcome{user.name ? `, ${user.name}` : ""} 👋
              </h1>
              <p className="text-sm text-white/70">
                Manage your subscription, invoices, and device credentials.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/channels" className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10">
                Explore Channels
              </Link>
              <Link href="/pricing" className="rounded-md bg-gradient-to-r from-rose-500 to-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:brightness-110">
                Upgrade plan
              </Link>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Account" value={user.isActive ? "Active" : "Pending"} tone={user.isActive ? "ok" : "warn"} />
            <StatCard label="Username" value={user.serviceUsername || "—"} />
            <StatCard label="Latest Invoice" value={latestInvoice ? latestInvoice.invoiceNo : "—"} />
            <StatCard
              label="Amount Due"
              value={
                !latestInvoice
                  ? "—"
                  : latestInvoice.amount === 0
                  ? "Free"
                  : money(latestInvoice.amount, latestInvoice.currency)
              }
            />
          </div>

          {/* Panels */}
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* Latest Invoice */}
            <div className="lg:col-span-2">
              <LatestInvoiceCard inv={latestInvoice} />
            </div>

            {/* Quick Start / Help */}
            <QuickStartCard />
          </div>

          {/* Explore */}
          <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">Explore the catalog</h2>
              <Link
                href="/channels"
                className="rounded-md bg-gradient-to-r from-rose-500 to-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:brightness-110"
              >
                Browse Channels
              </Link>
            </div>
            <p className="mt-2 text-sm text-white/70">
              Sports, Movies, News, Kids, and more—updated frequently. Filter by country/genre.
            </p>
          </section>
        </main>
      </div>
    </SiteLayout>
  );
}
