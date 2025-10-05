// src/pages/api/invoices/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import Invoice from "@/models/Invoice";

// If you already have this helper elsewhere, you can import it instead.
function getUidFromReq(req: NextApiRequest): string | null {
  try {
    const token = (req as any).cookies?.token;
    if (!token) return null;
    const dec = jwt.verify(token, process.env.JWT_SECRET || "dev-secret") as any;
    return dec?.id || dec?.uid || null;
  } catch {
    return null;
  }
}

function toUiStatus(db: any): "PENDING" | "PAID" | "CANCELLED" {
  const s = String(db || "").toLowerCase();
  if (s === "paid") return "PAID";
  if (s === "void") return "CANCELLED";
  return "PENDING";
}
function toDbStatus(input: any): "draft" | "due" | "paid" | "void" {
  const s = String(input || "").toLowerCase();
  if (s === "paid") return "paid";
  if (s === "void" || s === "cancelled" || s === "canceled") return "void";
  if (s === "draft") return "draft";
  return "due";
}

// Optional price table if you want to rebuild items when months changes
const PRICE_BY_MONTHS: Record<number, number> = {
  1: 12.99,
  3: 29.99,
  6: 54.99,
  12: 99.99,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const uid = getUidFromReq(req);
  if (!uid) return res.status(401).json({ message: "Not authenticated" });

  const id = String(req.query.id || "");
  if (!Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid id" });

  await connectDB();

  // Ensure the invoice belongs to the user
  const inv: any = await Invoice.findOne({ _id: id, userId: uid }).lean();
  if (!inv) return res.status(404).json({ message: "Invoice not found" });

  // ---------- GET (single) ----------
  if (req.method === "GET") {
    return res.json({
      id: String(inv._id),
      number: inv.number || inv.invoiceNo || null,
      currency: inv.currency || "GBP",
      subtotal: inv.subtotal ?? 0,
      tax: inv.tax ?? 0,
      total: inv.total ?? inv.amount ?? 0,
      status: toUiStatus(inv.status),
      dueDate: inv.dueDate || null,
      createdAt: inv.createdAt,
      items: inv.items || [],
    });
  }

  // ---------- PATCH (update: dueDate, status, number, months) ----------
  if (req.method === "PATCH") {
    const body = req.body || {};
    const updates: any = {};
    const set: any = {};
    const $set: any = set;

    // Change due date
    if (body.dueDate) {
      const d = new Date(body.dueDate);
      if (isNaN(d.getTime())) return res.status(400).json({ message: "Invalid dueDate" });
      set.dueDate = d;
    }

    // Change invoice number (optional)
    if (typeof body.number === "string") {
      set.number = body.number.trim() || null;
    }

    // Change status
    if (body.status) {
      set.status = toDbStatus(body.status);
    }

    // Change subscription months (rebuild items + totals)
    if (body.months) {
      const months = Number(body.months);
      if (![1, 3, 6, 12].includes(months)) {
        return res.status(400).json({ message: "months must be one of 1, 3, 6, 12" });
      }
      const unit = PRICE_BY_MONTHS[months];
      const newItems = [{ desc: `Subscription (${months} months)`, qty: 1, unit, total: unit }];
      const subtotal = unit;
      const tax = 0;
      const total = unit;
      set.items = newItems;
      set.subtotal = subtotal;
      set.tax = tax;
      set.total = total;
      // If you want status to go back to "due" on change:
      if (!body.status) set.status = "due";
    }

    if (Object.keys(set).length === 0) {
      return res.status(400).json({ message: "No changes provided" });
    }

    await Invoice.updateOne({ _id: inv._id, userId: uid }, { $set });
    const fresh: any = await Invoice.findById(inv._id).lean();

    return res.json({
      ok: true,
      id: String(fresh._id),
      number: fresh.number || fresh.invoiceNo || null,
      currency: fresh.currency || "GBP",
      subtotal: fresh.subtotal ?? 0,
      tax: fresh.tax ?? 0,
      total: fresh.total ?? fresh.amount ?? 0,
      status: toUiStatus(fresh.status),
      dueDate: fresh.dueDate || null,
      createdAt: fresh.createdAt,
      items: fresh.items || [],
    });
  }

  // ---------- DELETE (remove invoice) ----------
  if (req.method === "DELETE") {
    const r = await Invoice.deleteOne({ _id: inv._id, userId: uid });
    return res.json({ ok: true, deleted: r.deletedCount === 1 });
  }

  // Fallback
  return res.status(405).json({ message: "Method not allowed" });
}
