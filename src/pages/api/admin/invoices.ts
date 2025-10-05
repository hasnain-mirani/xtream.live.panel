import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import Invoice from "@/models/Invoice";
import { requireAdmin } from "@/lib/admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;
        await connectDB();

  const q = String(req.query.q ?? "").trim();
  const status = String(req.query.status ?? "") || undefined;
  const page = Number(req.query.page ?? 1);
  const limit = Math.min(50, Number(req.query.limit ?? 20));
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (status) filter.status = status;
  if (q) {
    filter.$or = [
      { invoiceNo: { $regex: q, $options: "i" } },
      { "business.name": { $regex: q, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Invoice.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Invoice.countDocuments(filter),
  ]);
  res.status(200).json({ items, total, page, limit });
}
