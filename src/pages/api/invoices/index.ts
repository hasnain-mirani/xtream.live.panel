// src/pages/api/invoices/index.ts  (create + list)
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { getUserIdFromReqLike } from "@/lib/auth";
import Invoice from "@/models/Invoice";

/* ---------------- status mapping ---------------- */
function toDbStatus(input: any): "draft" | "due" | "paid" | "void" {
  const s = String(input || "").toLowerCase();
  if (s === "paid") return "paid";
  if (s === "void" || s === "cancelled" || s === "canceled") return "void";
  if (s === "draft") return "draft";
  return "due";
}
function toUiStatus(db: any): "PENDING" | "PAID" | "CANCELLED" {
  const s = String(db || "").toLowerCase();
  if (s === "paid") return "PAID";
  if (s === "void") return "CANCELLED";
  return "PENDING";
}

/* ---------------- pricing (edit to taste) ---------------- */
/** Default to EUR to match your Wise account */
const PRICE_TABLE_EUR: Record<number, number> = { 1: 12.99, 3: 29.99, 6: 54.99, 12: 99.99 };
const PRICE_TABLE_GBP: Record<number, number> = { 1: 9.99,  3: 27.99, 6: 49.99, 12: 89.99 };
const PRICE_TABLE_USD: Record<number, number> = { 1: 11.99, 3: 32.99, 6: 59.99, 12: 99.99 };

type Cur = "EUR" | "GBP" | "USD";

function normalizeCurrency(v: any): Cur {
  const s = String(v || "EUR").toUpperCase();
  if (s === "GBP" || s === "USD") return s as Cur;
  return "EUR";
}
function priceFor(months: number, currency: Cur): number {
  // clamp to supported set; fallback to nearest “tier”
  const m = ((): 1|3|6|12 => {
    if (months <= 1) return 1;
    if (months <= 3) return 3;
    if (months <= 6) return 6;
    return 12;
  })();
  const table = currency === "USD" ? PRICE_TABLE_USD : currency === "GBP" ? PRICE_TABLE_GBP : PRICE_TABLE_EUR;
  return table[m] ?? table[3];
}

/* ---------------- helpers ---------------- */
function generateInvoiceNumber(prefix = "XT") {
  // Simple: XT-YYYYMMDD-XXXX  (random 4 digits)
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${prefix}-${y}${m}${day}-${rand}`;
}

function computeTotals(items: Array<{ qty:number; unit:number }>) {
  const calc = items.map(i => ({ ...i, total: +(i.qty * i.unit).toFixed(2) }));
  const subtotal = +calc.reduce((s, i) => s + i.total, 0).toFixed(2);
  const tax = 0; // add VAT logic if needed
  const total = +(subtotal + tax).toFixed(2);
  return { calc, subtotal, tax, total };
}

/** Your real bank details (used on invoice for email/PDF) */
const DEFAULT_BANK = {
  name: "Wise (Europe SA)",
  accountName: "Muhammad Abdullah Haider Khan",
  accountNo: "",                // optional
  sortCode: "",                // optional
  iban: "BE64 9674 9572 7152",
  swift: "TRWIBEB1XXX",
  currency: "EUR",
};

/** Optional business block (shows on PDF/email headers) */
const DEFAULT_BUSINESS = {
  name: "XTremeTV",
  address: "Rue du Trône 100, 3rd Floor, Brussels, 1050, Belgium",
  email: "support@xtremetv.live",
};

/** Default due date (now + 7 days). Change as you like. */
function defaultDueDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d;
}

/* ========================================================= */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const uid = getUserIdFromReqLike(req);
  if (!uid) return res.status(401).json({ message: "Not authenticated" });
  await connectDB();

  try {
    if (req.method === "GET") {
      const page = Math.max(1, Number(req.query.page || 1));
      const limit = Math.min(100, Math.max(5, Number(req.query.limit || 20)));
      const q: any = { userId: uid };
      if (req.query.status) q.status = toDbStatus(req.query.status);

      const total = await Invoice.countDocuments(q);
      const rows: any[] = await Invoice.find(q)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      return res.json({
        page, limit, total,
        items: rows.map(r => ({
          id: String(r._id), _id: String(r._id),
          number: r.number || r.invoiceNo || null,
          currency: r.currency || "EUR",
          subtotal: r.subtotal ?? 0,
          tax: r.tax ?? 0,
          total: r.total ?? r.amount ?? 0,
          status: toUiStatus(r.status),
          createdAt: r.createdAt,
          planMonths: r?.meta?.planMonths ?? null,
        })),
      });
    }

    if (req.method === "POST") {
      const body = req.body || {};
      const currency = normalizeCurrency(body.currency);
      const status = toDbStatus(body.status);
      const monthsRaw = Number(body.months || 0);

      // Server-authoritative pricing if months provided
      if (monthsRaw) {
        const months = Math.max(1, Math.min(12, Math.round(monthsRaw)));
        const unit = priceFor(months, currency);
        const items = [{ desc: `Subscription (${months} month${months > 1 ? "s" : ""})`, qty: 1, unit }];
        const { calc, subtotal, tax, total } = computeTotals(items);

        // Generate invoiceNo/number and retry once on collision
        let invoiceNo = body.number || generateInvoiceNumber("XT");
        const docPayload: any = {
          userId: uid,
          invoiceNo,
          number: invoiceNo,              // keep alias in sync
          currency,
          items: calc,
          subtotal, tax, total,
          status,
          dueDate: defaultDueDate(),
          business: DEFAULT_BUSINESS,
          bank: DEFAULT_BANK,
          meta: { planMonths: months },
        };

        try {
          const doc: any = await Invoice.create(docPayload);
          return res.status(201).json({
            ok: true,
            id: String(doc._id), _id: String(doc._id),
            number: doc.number,
            total: doc.total,
            currency: doc.currency,
            status: toUiStatus(doc.status),
            createdAt: doc.createdAt,
            planMonths: months,
          });
        } catch (e: any) {
          // If unique index hit, regenerate once
          if (String(e?.message || "").includes("duplicate key") || e?.code === 11000) {
            invoiceNo = generateInvoiceNumber("XT");
            const doc2: any = await Invoice.create({ ...docPayload, invoiceNo, number: invoiceNo });
            return res.status(201).json({
              ok: true,
              id: String(doc2._id), _id: String(doc2._id),
              number: doc2.number,
              total: doc2.total,
              currency: doc2.currency,
              status: toUiStatus(doc2.status),
              createdAt: doc2.createdAt,
              planMonths: months,
            });
          }
          throw e;
        }
      }

      // Fallback: explicit items path (legacy)
      const rawItems = Array.isArray(body.items) ? body.items : [];
      if (rawItems.length === 0) {
        return res.status(400).json({ message: "Provide either `months` or at least one line item in `items`." });
      }

      const cleaned = rawItems.map((it: any) => ({
        desc: String(it.desc || "").trim(),
        qty: Math.max(1, Number(it.qty || 1)),
        unit: Math.max(0, Number(it.unit || 0)),
      }));
      const { calc, subtotal, tax, total } = computeTotals(cleaned);

      let invoiceNo = body.number || generateInvoiceNumber("XT");
      const docPayload: any = {
        userId: uid,
        invoiceNo,
        number: invoiceNo,
        currency,
        items: calc,
        subtotal, tax, total,
        status,
        dueDate: defaultDueDate(),
        business: DEFAULT_BUSINESS,
        bank: DEFAULT_BANK,
      };

      try {
        const doc: any = await Invoice.create(docPayload);
        return res.status(201).json({
          ok: true,
          id: String(doc._id), _id: String(doc._id),
          number: doc.number,
          total: doc.total,
          currency: doc.currency,
          status: toUiStatus(doc.status),
          createdAt: doc.createdAt,
          planMonths: doc?.meta?.planMonths ?? null,
        });
      } catch (e: any) {
        if (String(e?.message || "").includes("duplicate key") || e?.code === 11000) {
          invoiceNo = generateInvoiceNumber("XT");
          const doc2: any = await Invoice.create({ ...docPayload, invoiceNo, number: invoiceNo });
          return res.status(201).json({
            ok: true,
            id: String(doc2._id), _id: String(doc2._id),
            number: doc2.number,
            total: doc2.total,
            currency: doc2.currency,
            status: toUiStatus(doc2.status),
            createdAt: doc2.createdAt,
            planMonths: doc2?.meta?.planMonths ?? null,
          });
        }
        throw e;
      }
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (e: any) {
    // Always return JSON on error — avoids "<!DOCTYPE ...>" parsing issue
    console.error("invoices api error:", e?.message || e);
    return res.status(500).json({ message: "Server error", error: String(e?.message || e) });
  }
}
