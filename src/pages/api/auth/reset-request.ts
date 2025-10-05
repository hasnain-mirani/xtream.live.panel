import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Invoice from "@/models/Invoice";
import { hashPassword, signJwt } from "@/lib/auth";

function genInvoiceNo() {
  // INV-YYYYMMDD-XXXX
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `INV-${y}${m}${day}-${rand}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    await connectDB();
    const { name, email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "email and password required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await hashPassword(password);
    const user = await User.create({ name, email, passwordHash });

    // Build invoice from env
    const planName   = process.env.DEFAULT_PLAN_NAME || "Subscription";
    const amount     = Number(process.env.DEFAULT_PLAN_AMOUNT || "19.99");
    const currency   = process.env.DEFAULT_PLAN_CURRENCY || "USD";
    const dueDays    = Number(process.env.DEFAULT_INVOICE_DUE_DAYS || "5");
    const dueDate    = new Date(Date.now() + dueDays * 24 * 3600 * 1000);

    const invoice = await Invoice.create({
      invoiceNo: genInvoiceNo(),
      userId: user._id,
      status: "PENDING",
      currency,
      amount,
      items: [{ name: planName, qty: 1, unitPrice: amount, total: amount }],
      business: {
        name: process.env.BUSINESS_NAME || "",
        address: process.env.BUSINESS_ADDRESS || "",
        email: process.env.BUSINESS_EMAIL || "",
      },
      bank: {
        name: process.env.BANK_NAME || "",
        accountName: process.env.BANK_ACCOUNT_NAME || "",
        accountNo: process.env.BANK_ACCOUNT_NO || "",
        sortCode: process.env.BANK_SORT_CODE || "",
        iban: process.env.BANK_IBAN || "",
        swift: process.env.BANK_SWIFT || "",
      },
      dueDate,
      notes: "Please pay by bank transfer. Include the Invoice No in the payment reference.",
    });

    // Return token + invoice id for redirect
    const token = signJwt({ uid: user._id, email: user.email });
    return res.status(201).json({ user: { id: user._id, email: user.email, name: user.name }, token, invoiceId: String(invoice._id) });
  } catch (e: any) {
    console.error("register error:", e);
    return res.status(500).json({ error: e?.message || "Server error" });
  }
}
