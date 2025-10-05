// src/pages/api/dashboard/invoices/create.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { getUserIdFromReqLike  } from "@/lib/auth";
import Invoice from "@/models/Invoice";

type Item = { desc: string; qty: number; unit: number };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    await connectDB();
    const uid = getUserIdFromReqLike (req);
    if (!uid) return res.status(401).json({ message: "Not authenticated" });

    const { items = [], currency = "USD", status = "due", number } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "At least one line item required" });
    }

    const clean: Item[] = items.map((it: any) => ({
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
      number: doc.number,
      total: doc.total,
      currency: doc.currency,
      createdAt: doc.createdAt,
    });
  } catch (e: any) {
    console.error("invoice create error:", e?.message || e);
    return res.status(500).json({ message: "Server error" });
  }
}
