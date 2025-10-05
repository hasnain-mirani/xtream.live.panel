import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { getUserIdFromReqLike } from "@/lib/auth";
import Invoice from "@/models/Invoice";
import { Types } from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  const uid = getUserIdFromReqLike (req);
  if (!uid) return res.status(401).json({ message: "Not authenticated" });

  await connectDB();

  const id = String(req.query.id || "");
  if (!Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid invoice id" });

  try {
    const inv: any = await Invoice.findOne({ _id: id, userId: uid }).lean();
    if (!inv) return res.status(404).json({ message: "Invoice not found" });

    return res.json({
      id: String(inv._id),
      _id: String(inv._id),        // <— compat
      number: inv.number || null,
      currency: inv.currency,
      items: inv.items,
      subtotal: inv.subtotal,
      tax: inv.tax,
      total: inv.total,
      status: inv.status,
      createdAt: inv.createdAt,
    });
  } catch (e: any) {
    console.error("invoice get error:", e?.message || e);
    return res.status(500).json({ message: "Server error" });
  }
}
