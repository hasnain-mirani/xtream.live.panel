import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { getUserIdFromReqLike  } from "@/lib/auth";
import Invoice from "@/models/Invoice";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const uid = getUserIdFromReqLike (req);
  if (!uid) return res.status(401).json({ message: "Not authenticated" });

  await connectDB();

  if (req.method === "GET") {
    // LIST for current user
    try {
      const page = Math.max(1, Number(req.query.page || 1));
      const limit = Math.min(100, Math.max(5, Number(req.query.limit || 20)));
      const q: any = { userId: uid };
      if (req.query.status) q.status = req.query.status;

      const total = await Invoice.countDocuments(q);
      const rows = await Invoice.find(q)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      return res.json({
        page, limit, total,
        items: rows.map((r: any) => ({
          id: String(r._id),
          _id: String(r._id),            // <— compat for UIs expecting _id
          number: r.number || null,
          currency: r.currency,
          subtotal: r.subtotal,
          tax: r.tax,
          total: r.total,
          status: r.status,
          createdAt: r.createdAt,
        })),
      });
    } catch (e: any) {
      console.error("invoices list error:", e?.message || e);
      return res.status(500).json({ message: "Server error" });
    }
  }

  if (req.method === "POST") {
    // CREATE for current user
    try {
      const { items = [], currency = "USD", status = "due", number } = req.body || {};
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "At least one line item required" });
      }

      const clean = items.map((it: any) => ({
        desc: String(it.desc || "").trim(),
        qty: Math.max(1, Number(it.qty || 1)),
        unit: Math.max(0, Number(it.unit || 0)),
      }));

      const calc = clean.map(i => ({ ...i, total: +(i.qty * i.unit).toFixed(2) }));
      const subtotal = +calc.reduce((s, i) => s + i.total, 0).toFixed(2);
      const tax = 0; // add VAT if you need
      const total = +(subtotal + tax).toFixed(2);

      const doc = await Invoice.create({
        userId: uid,
        number: number || null,
        currency,
        items: calc,
        subtotal, tax, total,
        status,
      });

      return res.status(201).json({
        ok: true,
        id: String(doc._id),
        _id: String(doc._id), // <— compat
        number: doc.number,
        total: doc.total,
        currency: doc.currency,
        status: doc.status,
        createdAt: doc.createdAt,
      });
    } catch (e: any) {
      console.error("invoice create error:", e?.message || e);
      return res.status(500).json({ message: "Server error" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
