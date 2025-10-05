// src/pages/api/_maintenance/fix-invoice-index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, message: "POST only" });
  await connectDB();

  const db = mongoose.connection.db;
  if (!db) {
    return res.status(500).json({ ok: false, message: "Database connection not established." });
  }
  const col = db.collection("invoices");

  const indexes = await col.indexes();
  // 1) Drop the old unique index if present
  const hasBad = indexes.find(i => i.name === "invoiceNo_1");   
  if (hasBad) {
    await col.dropIndex("invoiceNo_1");
  }

  // 2) Recreate as PARTIAL unique (only real strings are indexed)
  await col.createIndex(
    { invoiceNo: 1 },
    { unique: true, partialFilterExpression: { invoiceNo: { $type: "string" } } }
  );

  // (Optional) Also ensure a helpful listing index
  await col.createIndex({ userId: 1, createdAt: -1 });

  return res.json({ ok: true, droppedOld: Boolean(hasBad) });
}
