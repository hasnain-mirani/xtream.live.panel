// pages/dashboard.tsx
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import type { GetServerSideProps } from "next";
import jwt from "jsonwebtoken";
import { money, dateTime, dateOnly } from "@/lib/format";

// If your DB helper is exported differently, adjust this import:
import { connectDB as dbConnect } from "@/lib/db";

import User from "@/models/User";
import Invoice from "@/models/Invoice";

/* ---------- JSON-serializable types ---------- */
type InvoiceStatus = "PENDING" | "PAID" | "CANCELLED";

type ServerUser = {
  id: string;
  name: string | null;
  email: string;
  isActive: boolean;
  serviceUsername: string | null;
};

type ServerInvoice = {
  id: string;
  invoiceNo: string;
  status: InvoiceStatus;
  amount: number;
  currency: string;
  dueDate: string; // ISO
  createdAt: string; // ISO
};

type Props = {
  user: ServerUser;
  latestInvoice: ServerInvoice | null;
};

/* ---------- SSR ---------- */
export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
}) => {
  try {
    await dbConnect();

    const token = req.cookies?.token;
    if (!token) {
      return {
        redirect: { destination: "/login?next=/dashboard", permanent: false },
      };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      uid?: string;
    };
    if (!decoded?.uid) {
      return {
        redirect: { destination: "/login?next=/dashboard", permanent: false },
      };
    }

    const uid = decoded.uid;
    const u: any = await User.findById(uid).lean();
    if (!u) {
      return {
        redirect: { destination: "/login?next=/dashboard", permanent: false },
      };
    }

    const inv: any = await Invoice.findOne({ userId: uid })
      .sort({ createdAt: -1 })
      .lean();

    const user: ServerUser = {
      id: String(u._id),
      name: u.name ?? null,
      email: (u.email as string) || "",
      isActive: Boolean(u.isActive),
      serviceUsername: u.serviceUsername ?? null,
    };

    const latestInvoice: ServerInvoice | null = inv
      ? {
          id: String(inv._id),
          invoiceNo: (inv.invoiceNo as string) || "",
          status: (inv.status as InvoiceStatus) || "PENDING",
          amount: Number(inv.amount ?? 0),
          currency: (inv.currency as string) || "GBP",
          dueDate: inv.dueDate
            ? new Date(inv.dueDate).toISOString()
            : new Date().toISOString(),
          createdAt: inv.createdAt
            ? new Date(inv.createdAt).toISOString()
            : new Date().toISOString(),
        }
      : null;

    return { props: { user, latestInvoice } };
  } catch {
    return {
      redirect: { destination: "/login?next=/dashboard", permanent: false },
    };
  }
};

/* ---------- Page ---------- */
export default function Dashboard({ user, latestInvoice }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const statusBadge = (s: InvoiceStatus) =>
    s === "PAID"
      ? "bg-green-100 text-green-800 border-green-200"
      : s === "PENDING"
      ? "bg-amber-100 text-amber-800 border-amber-200"
      : "bg-red-100 text-red-800 border-red-200";

  return (
    <>
      <Head>
        <title>Dashboard — XtrmIPTV</title>
        <meta name="description" content="Your XtrmIPTV account dashboard." />
      </Head>

      {/* NAVBAR */}
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
        <nav className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="inline-flex lg:hidden rounded-md border px-2 py-1.5 text-sm"
              onClick={() => setMobileOpen((s) => !s)}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 font-extrabold tracking-tight"
            >
              <span className="inline-block h-6 w-6 rounded bg-black" />
              XtrmIPTV
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/channels" className="hover:opacity-80">
              Channels
            </Link>
            <Link href="/pricing" className="hover:opacity-80">
              Pricing
            </Link>
            <Link href="/contact" className="hover:opacity-80">
              Support
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-600">
              {user.email}
            </span>
            <Link
              href="/login"
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Sign out
            </Link>
          </div>
        </nav>
      </header>

      {/* SHELL */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[240px,1fr] gap-6 py-6">
          {/* SIDEBAR */}
          <aside
            className={`lg:sticky lg:top-16 lg:h-[calc(100vh-5rem)] lg:overflow-y-auto rounded-2xl border bg-white p-4 
              ${mobileOpen ? "block" : "hidden"} lg:block`}
          >
            <div className="text-xs font-semibold uppercase text-gray-500 px-2">
              Overview
            </div>
            <nav className="mt-2 space-y-1">
              <SidebarLink href="/dashboard" label="Dashboard" active />
              <SidebarLink href="/channels" label="Browse Channels" />
              <SidebarLink href="/invoice/history" label="Invoices" />
              <SidebarLink href="/account" label="Account Settings" />
              <SidebarLink href="/support" label="Support" />
            </nav>

            <div className="mt-6 text-xs font-semibold uppercase text-gray-500 px-2">
              Shortcuts
            </div>
            <div className="mt-2 space-y-2">
              <Link
                className="block rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
                href="/invoice/new"
              >
                Create new invoice
              </Link>
              <Link
                className="block rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
                href="/installation"
              >
                Device setup guides
              </Link>
            </div>

            <div className="mt-6 rounded-xl border bg-gradient-to-br from-gray-50 to-white p-4">
              <div className="text-sm font-semibold">Need help?</div>
              <p className="mt-1 text-xs text-gray-600">
                Our team is here 24/7. Open a ticket and we’ll get back ASAP.
              </p>
              <Link
                href="/contact"
                className="mt-3 inline-block rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white"
              >
                Contact support
              </Link>
            </div>
          </aside>

          {/* MAIN */}
          <main className="pb-12">
            {/* Greeting */}
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  Welcome{user.name ? `, ${user.name}` : ""} 👋
                </h1>
                <p className="text-sm text-gray-600">
                  Manage your subscription, invoices, and device credentials.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/channels"
                  className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
                >
                  Explore Channels
                </Link>
                <Link
                  href="/pricing"
                  className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
                >
                  Upgrade plan
                </Link>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Account"
                value={user.isActive ? "Active" : "Pending"}
                tone={user.isActive ? "ok" : "warn"}
              />
              <StatCard label="Username" value={user.serviceUsername || "—"} />
              <StatCard
                label="Latest Invoice"
                value={latestInvoice ? latestInvoice.invoiceNo : "—"}
              />
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
              <section className="lg:col-span-2 rounded-2xl border bg-white p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Latest invoice</h2>
                  {latestInvoice && (
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadge(
                        latestInvoice.status
                      )}`}
                    >
                      {latestInvoice.status}
                    </span>
                  )}
                </div>

                {!latestInvoice ? (
                  <p className="mt-4 text-sm text-gray-600">
                    No invoice found.
                  </p>
                ) : (
                  <>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <InfoRow k="Invoice No" v={latestInvoice.invoiceNo} />
                      <InfoRow
                        k="Created"
                        v={dateTime(latestInvoice.createdAt)}
                      />
                      <InfoRow k="Due" v={dateOnly(latestInvoice.dueDate)} />

                      <InfoRow
                        k="Total"
                        v={
                          latestInvoice.amount === 0
                            ? "Free"
                            : money(
                                latestInvoice.amount,
                                latestInvoice.currency
                              )
                        }
                      />
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <Link
                        href={`/invoice/${latestInvoice.id}`}
                        className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
                      >
                        View invoice
                      </Link>
                      <a
                        href={`/api/invoices/${latestInvoice.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
                      >
                        Download PDF
                      </a>
                      <button
                        className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
                        onClick={async () => {
                          await fetch(
                            `/api/invoices/${latestInvoice.id}/email`,
                            { method: "POST" }
                          );
                          alert("Invoice email sent");
                        }}
                      >
                        Email invoice
                      </button>
                      {latestInvoice.amount > 0 &&
                        latestInvoice.status === "PENDING" && (
                          <div className="ml-auto text-sm text-amber-700">
                            Bank details were emailed. Please include the
                            invoice no. in your transfer.
                          </div>
                        )}
                      {latestInvoice.amount === 0 && (
                        <div className="ml-auto text-sm text-green-700">
                          Free trial active — no payment required.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </section>

              {/* Quick Start / Help */}
              <section className="rounded-2xl border bg-white p-5">
                <h2 className="text-lg font-semibold">Quick start</h2>
                <ol className="mt-3 space-y-2 text-sm list-decimal list-inside text-gray-700">
                  <li>
                    Install your IPTV app (Fire TV / Android / iOS / Smart TV).
                  </li>
                  <li>Enter the credentials from your activation email.</li>
                  <li>
                    Browse channels and enjoy. Need help? Contact support.
                  </li>
                </ol>

                <div className="mt-4 grid gap-2">
                  <Link
                    href="/how-to-setup"
                    className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    Setup guides
                  </Link>
                  <Link
                    href="/support"
                    className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    Open support ticket
                  </Link>
                  <Link
                    href="/account"
                    className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    Account settings
                  </Link>
                </div>
              </section>
            </div>

            {/* Explore */}
            <section className="mt-6 rounded-2xl border bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Explore the catalog</h2>
                <Link
                  href="/channels"
                  className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
                >
                  Browse Channels
                </Link>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Sports, Movies, News, Kids, and more—updated frequently. Filter
                by country/genre.
              </p>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}

/* ---------- tiny UI helpers ---------- */
function SidebarLink({
  href,
  label,
  active = false,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-xl px-3 py-2 text-sm ${
        active ? "bg-black text-white" : "hover:bg-gray-50 border"
      }`}
    >
      {label}
    </Link>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: "ok" | "warn" | "err";
}) {
  const ring =
    tone === "ok"
      ? "ring-green-100"
      : tone === "warn"
      ? "ring-amber-100"
      : tone === "err"
      ? "ring-red-100"
      : "ring-gray-100";
  return (
    <div className={`rounded-2xl border bg-white p-4 ring-1 ${ring}`}>
      <div className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

function InfoRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border bg-gray-50 p-3">
      <div className="text-xs uppercase text-gray-500">{k}</div>
      <div className="text-sm font-medium">{v}</div>
    </div>
  );
}
