import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import Invoice from "@/models/Invoice";
import { isValidObjectId } from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const { id } = req.query;
  if (!isValidObjectId(String(id))) return res.status(400).json({ error: "invalid id" });

  try {
    if (req.method === "GET") {
      const inv = await Invoice.findById(id).lean();
      if (!inv) return res.status(404).json({ error: "not found" });
      return res.status(200).json(inv);
    }

    if (req.method === "PATCH") {
      // naive admin toggle (secure behind your own admin auth later)
      const { status } = req.body || {};
      if (!["PENDING", "PAID", "CANCELLED"].includes(status)) return res.status(400).json({ error: "bad status" });
      const inv = await Invoice.findByIdAndUpdate(id, { status }, { new: true }).lean();
      if (!inv) return res.status(404).json({ error: "not found" });
      return res.status(200).json(inv);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e: any) {
    console.error("invoice error:", e);
    return res.status(500).json({ error: e?.message || "Server error" });
  }
}
